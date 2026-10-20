import http from 'node:http';
import https from 'node:https';
import type { Duplex } from 'node:stream';
import { setTimeout as sleep } from 'node:timers/promises';
import tls from 'node:tls';

export const USER_AGENT = 'DigiZoo/1.0 (https://github.com/ckangnz/DigiZoo)';

const API = 'https://commons.wikimedia.org/w/api.php';
const API_GAP_MS = 400;
const DESCRIPTION_LIMIT = 400;

export interface Candidate {
  title: string;
  pageUrl: string;
  fileUrl: string;
  audioUrl: string;
  mime: string;
  mediatype: string;
  codec: string;
  sampleRate: number;
  channels: number;
  duration: number;
  size: number;
  license: string;
  licenseCode: string;
  licenseUrl: string;
  author: string;
  credit: string;
  description: string;
  categories: string[];
  allowed: boolean;
  reasons: string[];
  flags: string[];
}

type Json = Record<string, unknown>;

let lastCall = 0;

export async function polite(gapMs: number): Promise<void> {
  const wait = lastCall + gapMs - Date.now();
  if (wait > 0) await sleep(wait);
  lastCall = Date.now();
}

interface HttpResult {
  status: number;
  headers: http.IncomingHttpHeaders;
  body: Buffer;
}

function proxyFor(target: URL): URL | null {
  const raw =
    target.protocol === 'https:'
      ? (process.env.HTTPS_PROXY ?? process.env.https_proxy ?? process.env.ALL_PROXY)
      : (process.env.HTTP_PROXY ?? process.env.http_proxy ?? process.env.ALL_PROXY);
  if (!raw) return null;
  const skip = (process.env.NO_PROXY ?? process.env.no_proxy ?? '')
    .split(',')
    .map((entry) => entry.trim())
    .filter(Boolean);
  if (skip.some((entry) => target.hostname === entry || target.hostname.endsWith(`.${entry}`))) {
    return null;
  }
  return new URL(raw);
}

class TunnelAgent extends https.Agent {
  constructor(private readonly proxy: URL) {
    super({ keepAlive: false });
  }

  createConnection(
    options: { host?: string | null; port?: number | string | null; servername?: string },
    callback: (error: Error | null, socket?: Duplex) => void,
  ): undefined {
    const host = options.host ?? '';
    const port = Number(options.port ?? 443);
    const headers: Record<string, string> = { Host: `${host}:${port}` };
    if (this.proxy.username) {
      const credentials = `${decodeURIComponent(this.proxy.username)}:${decodeURIComponent(this.proxy.password)}`;
      headers['Proxy-Authorization'] = `Basic ${Buffer.from(credentials).toString('base64')}`;
    }
    const request = http.request({
      host: this.proxy.hostname,
      port: Number(this.proxy.port || 80),
      method: 'CONNECT',
      path: `${host}:${port}`,
      headers,
    });
    request.once('connect', (response, socket) => {
      if (response.statusCode !== 200) {
        socket.destroy();
        callback(new Error(`Proxy CONNECT ${host}: HTTP ${response.statusCode}`));
        return;
      }
      callback(null, tls.connect({ socket, servername: options.servername || host }));
    });
    request.once('error', (error) => callback(error));
    request.end();
    return undefined;
  }
}

function request(url: string, redirects = 5): Promise<HttpResult> {
  const target = new URL(url);
  const proxy = proxyFor(target);
  const agent = proxy ? new TunnelAgent(proxy) : undefined;
  return new Promise((resolvePromise, reject) => {
    const req = https.get(
      target,
      { agent, headers: { 'User-Agent': USER_AGENT, 'Api-User-Agent': USER_AGENT } },
      (response) => {
        const status = response.statusCode ?? 0;
        const location = response.headers.location;
        if (status >= 300 && status < 400 && location && redirects > 0) {
          response.resume();
          request(new URL(location, target).href, redirects - 1).then(resolvePromise, reject);
          return;
        }
        const chunks: Buffer[] = [];
        response.on('data', (data: Buffer) => chunks.push(data));
        response.on('end', () =>
          resolvePromise({ status, headers: response.headers, body: Buffer.concat(chunks) }),
        );
        response.on('error', reject);
      },
    );
    req.setTimeout(120000, () => req.destroy(new Error(`Timeout for ${url}`)));
    req.on('error', reject);
  });
}

export async function fetchWithRetry(url: string, attempts = 5): Promise<Buffer> {
  let delay = 2000;
  for (let attempt = 1; ; attempt++) {
    let result: HttpResult | undefined;
    let failure: unknown;
    try {
      result = await request(url);
    } catch (error) {
      failure = error;
    }
    if (result && result.status >= 200 && result.status < 300) return result.body;
    const retryable = !result || result.status === 429 || result.status >= 500;
    if (!retryable || attempt >= attempts) {
      if (result) throw new Error(`HTTP ${result.status} for ${url}`);
      throw failure instanceof Error ? failure : new Error(String(failure));
    }
    const retryAfter = Number(result?.headers['retry-after'] ?? 0);
    await sleep(Math.max(delay, retryAfter * 1000));
    delay *= 2;
  }
}

export async function api(params: Record<string, string>): Promise<Json> {
  const query = new URLSearchParams({
    action: 'query',
    format: 'json',
    formatversion: '2',
    maxlag: '5',
    ...params,
  });
  for (let attempt = 1; ; attempt++) {
    await polite(API_GAP_MS);
    const body = JSON.parse((await fetchWithRetry(`${API}?${query}`)).toString('utf8')) as Json;
    const error = body.error as { code?: string; info?: string } | undefined;
    if (!error) return body;
    if (error.code === 'maxlag' && attempt < 6) {
      await sleep(5000 * attempt);
      continue;
    }
    throw new Error(`Commons API error ${error.code}: ${error.info}`);
  }
}

async function queryAll(params: Record<string, string>, limit = Infinity): Promise<Json[]> {
  const pages: Json[] = [];
  let next: Record<string, string> = {};
  for (;;) {
    const body = await api({ ...params, ...next });
    pages.push(body);
    const cont = body.continue as Record<string, string> | undefined;
    const count = pages.reduce((sum, page) => sum + countItems(page), 0);
    if (!cont || count >= limit) return pages;
    next = cont;
  }
}

function countItems(body: Json): number {
  const query = body.query as Json | undefined;
  if (!query) return 0;
  const list = (query.search ?? query.categorymembers ?? query.pages) as unknown[] | undefined;
  return list?.length ?? 0;
}

export function htmlToText(html: string): string {
  return html
    .replace(/<br\s*\/?>/gi, ' ')
    .replace(/<[^>]*>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&quot;/g, '"')
    .replace(/&#0?39;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&#(\d+);/g, (_, code: string) => String.fromCodePoint(Number(code)))
    .replace(/&#x([0-9a-f]+);/gi, (_, code: string) => String.fromCodePoint(parseInt(code, 16)))
    .replace(/&amp;/g, '&')
    .replace(/\s+/g, ' ')
    .trim();
}

function metaObject(value: unknown): unknown {
  if (!Array.isArray(value)) return value;
  if (value.every((item) => item && typeof item === 'object' && 'name' in item)) {
    const out: Record<string, unknown> = {};
    for (const item of value as { name: string | number; value: unknown }[]) {
      out[String(item.name)] = metaObject(item.value);
    }
    return out;
  }
  return value.map(metaObject);
}

function audioFormat(metadata: unknown): { codec: string; sampleRate: number; channels: number } {
  const meta = (metaObject(metadata) ?? {}) as Record<string, unknown>;
  const streams = meta.streams as Record<string, Record<string, unknown>> | undefined;
  if (streams) {
    const list = Object.values(streams);
    const stream =
      list.find((s) => /vorbis|opus|flac|speex/i.test(String(s.type ?? ''))) ?? list[0];
    if (stream) {
      const header = (stream.header ?? {}) as Record<string, unknown>;
      return {
        codec: String(stream.type ?? 'ogg'),
        sampleRate: Number(header.audio_sample_rate ?? header.rate ?? 0),
        channels: Number(header.audio_channels ?? header.channels ?? 0),
      };
    }
  }
  const audio = meta.audio as Record<string, unknown> | undefined;
  if (audio) {
    const audioStreams = audio.streams as Record<string, Record<string, unknown>> | undefined;
    const first = audioStreams ? Object.values(audioStreams)[0] : undefined;
    return {
      codec: String(audio.dataformat ?? first?.dataformat ?? meta.fileformat ?? '?'),
      sampleRate: Number(audio.sample_rate ?? first?.sample_rate ?? 0),
      channels: Number(audio.channels ?? first?.channels ?? 0),
    };
  }
  return { codec: String(meta.fileformat ?? '?'), sampleRate: 0, channels: 0 };
}

const SHARE_ALIKE_OR_BY = /^CC BY(-SA)? (2\.0|2\.5|3\.0|4\.0)\b/;

export function licenseProblem(short: string, code: string): string | null {
  const name = short.trim();
  if (!name) return 'missing licence';
  if (/\bNC\b|\bND\b|noncommercial|no ?deriv/i.test(name) || /-nc|-nd/i.test(code)) {
    return `licence not allowed (${name})`;
  }
  if (/^CC0\b/i.test(name)) return null;
  if (/^public domain\b/i.test(name) || /^PD\b|^PD-/i.test(name)) return null;
  if (SHARE_ALIKE_OR_BY.test(name)) return null;
  if (/^pd$/i.test(code) || /^cc0$/i.test(code)) return null;
  return `licence not allowed (${name})`;
}

const LANGUAGE_PREFIX = /^File:[A-Z][a-z]{1,2}(-[a-z]{2,4})?-/;
const PRONUNCIATION =
  /pronunciation|lingua libre|spoken wikipedia|spoken word|audio files of words|words in |spoken (english|german|french)/i;
const MUSIC =
  /\bmusic|\bsymphon|orchestra|\bpiano|\bguitar|\bcomposer|\bopera\b|\bsonata|\bconcerto|\bmidi\b|carnival of the animals|\balbum\b|\bsingle by\b|\bjazz|\bragtime|\bremix/i;
const SPEECH =
  /\bspeech\b|interview|lecture|narrat|podcast|radio (show|programme|program|broadcast)|audiobook|\bpoem\b|\bpoetry|reading of|read by|recitation|\bsermon|\bstory\b|librivox|\bsong\b(?! of)|\bsinging\b/i;

function classify(candidate: Candidate): void {
  const text = `${candidate.title} ${candidate.description} ${candidate.categories.join(' ')}`;
  if (candidate.mediatype === 'VIDEO') candidate.flags.push('video');
  else if (candidate.mediatype !== 'AUDIO') {
    candidate.reasons.push(`not audio (${candidate.mediatype})`);
  }
  if (/midi/i.test(candidate.mime)) candidate.reasons.push('MIDI file');
  if (!candidate.audioUrl) candidate.reasons.push(`no decodable audio (${candidate.codec})`);
  else if (candidate.audioUrl !== candidate.fileUrl) candidate.flags.push('transcode');
  if (/^File:(LL-|Q\d+-[a-z]{2,3}\.)/.test(candidate.title) || PRONUNCIATION.test(text)) {
    candidate.reasons.push('pronunciation/spoken file');
  } else if (LANGUAGE_PREFIX.test(candidate.title)) {
    if (candidate.duration > 0 && candidate.duration < 4) {
      candidate.reasons.push('language-prefixed short file (likely pronunciation)');
    } else {
      candidate.flags.push('language-prefixed title');
    }
  }
  const problem = licenseProblem(candidate.license, candidate.licenseCode);
  if (problem) candidate.reasons.push(problem);
  if (candidate.license && !problem && /attribution/i.test(candidate.license)) {
    candidate.flags.push('attribution');
  }
  if (!candidate.author && !/^CC0|public domain|^PD/i.test(candidate.license)) {
    candidate.reasons.push('missing author for attribution licence');
  }
  if (MUSIC.test(text)) candidate.flags.push('music?');
  if (SPEECH.test(text)) candidate.flags.push('speech?');
  if (candidate.duration > 180) candidate.flags.push('long');
  candidate.allowed = candidate.reasons.length === 0;
}

interface Derivative {
  src: string;
  type?: string;
  transcodekey?: string | null;
}

const UNDECODABLE = /opus|speex|a_opus/i;
const MAX_VIDEO_BYTES = 60e6;

function decodableUrl(
  fileUrl: string,
  mediatype: string,
  codec: string,
  size: number,
  derivatives: Derivative[],
): string {
  const transcode = (pattern: RegExp) =>
    derivatives.find((d) => pattern.test(d.transcodekey ?? ''))?.src?.replace(/\?.*$/, '') ?? '';
  if (mediatype === 'VIDEO') {
    if (/vorbis|flac|mp3|aac/i.test(codec) && size <= MAX_VIDEO_BYTES) return fileUrl;
    return transcode(/mpeg4\.mov$/);
  }
  if (UNDECODABLE.test(codec)) return transcode(/^ogg$/) || transcode(/^mp3$/) || '';
  return fileUrl;
}

const EXTMETADATA = [
  'LicenseShortName',
  'License',
  'LicenseUrl',
  'Artist',
  'Credit',
  'ImageDescription',
  'ObjectName',
  'UsageTerms',
].join('|');

export async function fileInfo(titles: string[]): Promise<Candidate[]> {
  const unique = [...new Set(titles.map(normaliseTitle))];
  const byTitle = new Map<string, Candidate>();
  for (const batch of batches(unique)) {
    const bodies = await queryAll({
      titles: batch.join('|'),
      prop: 'videoinfo|categories',
      viprop: 'url|size|mime|mediatype|extmetadata|metadata|derivatives',
      viextmetadatafilter: EXTMETADATA,
      viextmetadatalanguage: 'en',
      cllimit: 'max',
    });
    for (const body of bodies) {
      const query = body.query as Json | undefined;
      const normalized = (query?.normalized ?? []) as { from: string; to: string }[];
      for (const page of (query?.pages ?? []) as Json[]) {
        const title = String(page.title);
        const existing = byTitle.get(title);
        const categories = ((page.categories ?? []) as { title: string }[]).map((c) =>
          c.title.replace(/^Category:/, ''),
        );
        if (existing) {
          existing.categories.push(...categories.filter((c) => !existing.categories.includes(c)));
          continue;
        }
        if (page.missing) continue;
        const info = ((page.videoinfo ?? page.imageinfo ?? []) as Json[])[0];
        if (!info) continue;
        const ext = (info.extmetadata ?? {}) as Record<string, { value: unknown }>;
        const value = (key: string) => {
          const raw = ext[key]?.value;
          return typeof raw === 'string' ? raw : raw === undefined ? '' : String(raw);
        };
        const format = audioFormat(info.metadata);
        const fileUrl = String(info.url ?? '').replace(/\?.*$/, '');
        const candidate: Candidate = {
          title,
          pageUrl: String(info.descriptionurl ?? ''),
          fileUrl,
          audioUrl: decodableUrl(
            fileUrl,
            String(info.mediatype ?? ''),
            format.codec,
            Number(info.size ?? 0),
            (info.derivatives ?? []) as Derivative[],
          ),
          mime: String(info.mime ?? ''),
          mediatype: String(info.mediatype ?? ''),
          codec: format.codec,
          sampleRate: format.sampleRate,
          channels: format.channels,
          duration: Number(info.duration ?? 0),
          size: Number(info.size ?? 0),
          license: htmlToText(value('LicenseShortName')),
          licenseCode: value('License'),
          licenseUrl: value('LicenseUrl'),
          author: htmlToText(value('Artist')).slice(0, 300),
          credit: htmlToText(value('Credit')).slice(0, 300),
          description: htmlToText(value('ImageDescription')).slice(0, DESCRIPTION_LIMIT),
          categories,
          allowed: false,
          reasons: [],
          flags: [],
        };
        byTitle.set(title, candidate);
      }
      for (const { from, to } of normalized) {
        const found = byTitle.get(to);
        if (found && from !== to) byTitle.set(from, found);
      }
    }
  }
  const out: Candidate[] = [];
  const seen = new Set<Candidate>();
  for (const title of unique) {
    const candidate = byTitle.get(title);
    if (!candidate || seen.has(candidate)) continue;
    seen.add(candidate);
    classify(candidate);
    out.push(candidate);
  }
  return out;
}

const MAX_TITLES_LENGTH = 5000;

function batches(titles: string[]): string[][] {
  const out: string[][] = [];
  let current: string[] = [];
  let length = 0;
  for (const title of titles) {
    const size = encodeURIComponent(title).length + 3;
    if (current.length && (current.length >= 50 || length + size > MAX_TITLES_LENGTH)) {
      out.push(current);
      current = [];
      length = 0;
    }
    current.push(title);
    length += size;
  }
  if (current.length) out.push(current);
  return out;
}

export function normaliseTitle(title: string): string {
  const name = title
    .trim()
    .replace(/_/g, ' ')
    .replace(/^(File|Image):/i, '');
  return `File:${name.charAt(0).toUpperCase()}${name.slice(1)}`;
}

export async function searchFiles(query: string, limit: number, video = false): Promise<string[]> {
  const queries = /filetype:/i.test(query)
    ? [query]
    : [`${query} filetype:audio`, ...(video ? [`${query} filetype:video`] : [])];
  const titles: string[] = [];
  for (const search of queries) {
    const bodies = await queryAll(
      {
        list: 'search',
        srnamespace: '6',
        srsearch: search,
        srlimit: String(Math.min(limit, 500)),
        srprop: '',
      },
      limit,
    );
    for (const body of bodies) {
      const result = body.query as Json | undefined;
      for (const hit of (result?.search ?? []) as { title: string }[]) {
        if (!titles.includes(hit.title)) titles.push(hit.title);
      }
    }
  }
  return titles.slice(0, limit * queries.length);
}

const MAX_MEMBERS_PER_CATEGORY = 5000;
const AUDIO_EXTENSION =
  /\.(ogg|oga|ogv|wav|flac|mp3|opus|m4a|aac|mid|midi|webm|mpg|mpeg|mp4|mov)$/i;

export async function categoryFiles(
  category: string,
  depth: number,
  limit: number,
): Promise<{ files: string[]; categories: string[] }> {
  const start = /^Category:/i.test(category) ? category : `Category:${category}`;
  const files = new Set<string>();
  const visited = new Set<string>();
  let frontier = [start.replace(/_/g, ' ')];
  for (let level = 0; level <= depth && frontier.length > 0 && files.size < limit; level++) {
    const next: string[] = [];
    for (const cat of frontier) {
      if (visited.has(cat)) continue;
      visited.add(cat);
      const bodies = await queryAll(
        {
          list: 'categorymembers',
          cmtitle: cat,
          cmtype: level < depth ? 'file|subcat' : 'file',
          cmlimit: '500',
        },
        MAX_MEMBERS_PER_CATEGORY,
      );
      for (const body of bodies) {
        const query = body.query as Json | undefined;
        for (const member of (query?.categorymembers ?? []) as { ns: number; title: string }[]) {
          if (member.ns === 6 && AUDIO_EXTENSION.test(member.title)) files.add(member.title);
          if (member.ns === 14 && !visited.has(member.title)) next.push(member.title);
        }
      }
      if (files.size >= limit) break;
    }
    frontier = next;
  }
  return { files: [...files].slice(0, limit), categories: [...visited] };
}

export async function subcategories(category: string): Promise<string[]> {
  const start = /^Category:/i.test(category) ? category : `Category:${category}`;
  const bodies = await queryAll({
    list: 'categorymembers',
    cmtitle: start,
    cmtype: 'subcat',
    cmlimit: '500',
  });
  const out: string[] = [];
  for (const body of bodies) {
    const query = body.query as Json | undefined;
    for (const member of (query?.categorymembers ?? []) as { title: string }[])
      out.push(member.title);
  }
  return out;
}
