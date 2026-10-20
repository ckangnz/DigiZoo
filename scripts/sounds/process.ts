import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { basename, resolve } from 'node:path';
import { format, resolveConfig } from 'prettier';
import {
  type ChannelMode,
  SR,
  biquad,
  db,
  decodeBytes,
  decodeFile,
  denoise,
  detectEvents,
  fade,
  freeverb,
  gatedRmsDb,
  highpass,
  limit,
  lowpass,
  peak,
  resample,
  reverse,
  scale,
  slice,
  stretch,
  toMono,
  trimBounds,
} from './lib/audio';
import { SAMPLES, SPECS, cacheDir, downloadUrl, ensureFile, safeName } from './lib/cache';
import { licenseProblem } from './lib/commons-api';
import { MP3_KBPS, encodeMp3, inspectMp3 } from './lib/mp3';
import { type Marker, panel, rasterize } from './lib/render';

const USAGE = `Usage:
  process.ts fetch "<File:…>|<url>" […]                 download into .sound-cache/files
  process.ts analyze "<File:…>|<url>|<path>" [--from s] [--to s] [--channel mix|left|right|best]
                     [--range dB] [--gap s]             list call events + spectrogram PNG
  process.ts build <id> […] | --all                    specs/<id>.json → src/audio/samples/<id>.mp3 + .json
Spec (scripts/sounds/specs/<id>.json):
  { "id", "layers": [{ "file" | "url"+"credit", "start", "end", "channel", "at", "gainDb",
    "rate", "stretch", "reverse", "highpass", "lowpass", "denoise", "noise": [s, e], "eq",
    "fadeIn", "fadeOut", "level" (normalise layer to this gated RMS dBFS before mixing), "note" }], "highpass" (default 70, 0 = off), "lowpass", "eq",
    "reverb": { "room", "damp", "wet", "tail" }, "trimDb", "maxDuration", "title", "species",
    "note" }`;

const TARGET_RMS_DB = -18;
const PEAK_CEILING = 0.88;
const MAX_LIMITING_DB = 2;
const FADE_IN = 0.01;
const FADE_OUT = 0.12;
const DEFAULT_HIGHPASS = 70;
const DEFAULT_MAX_DURATION = 2.92;
const MIN_DURATION = 0.8;

interface Credit {
  title: string;
  author: string;
  license: string;
  licenseUrl: string;
  source: string;
}

interface EqBand {
  type: 'peaking' | 'lowshelf' | 'highshelf';
  freq: number;
  gainDb: number;
  q?: number;
}

interface LayerSpec {
  file?: string;
  url?: string;
  credit?: Credit;
  start?: number;
  end?: number;
  channel?: ChannelMode;
  at?: number;
  gainDb?: number;
  rate?: number;
  stretch?: number;
  reverse?: boolean;
  highpass?: number;
  lowpass?: number;
  denoise?: number;
  noise?: [number, number];
  eq?: EqBand[];
  fadeIn?: number;
  fadeOut?: number;
  level?: number;
  note?: string;
}

interface Spec {
  id: string;
  layers: LayerSpec[];
  highpass?: number;
  lowpass?: number;
  eq?: EqBand[];
  reverb?: { room: number; damp: number; wet: number; tail: number };
  trimDb?: number;
  maxDuration?: number;
  title?: string;
  species?: string;
  note?: string;
}

interface Sidecar {
  id: string;
  file: string;
  duration: number;
  title: string;
  author: string;
  license: string;
  licenseUrl: string;
  source: string;
  changes: string;
  sources?: Credit[];
}

interface Source {
  path: string;
  credit: Credit;
  label: string;
}

const FALLBACK_LICENSE_URLS: [RegExp, string][] = [
  [/^CC0/i, 'https://creativecommons.org/publicdomain/zero/1.0/'],
  [/^(public domain|PD)/i, 'https://creativecommons.org/publicdomain/mark/1.0/'],
];

function licenseUrlFor(license: string, given: string): string {
  if (given) return given.replace(/^\/\//, 'https://');
  const match = /^CC (BY(?:-SA)?) (\d\.\d)/.exec(license);
  if (match) return `https://creativecommons.org/licenses/${match[1].toLowerCase()}/${match[2]}/`;
  return FALLBACK_LICENSE_URLS.find(([pattern]) => pattern.test(license))?.[1] ?? '';
}

function agencyAuthor(categories: string[]): string {
  const text = categories.join(' ');
  if (/Fish and Wildlife Service|PD US FWS/i.test(text)) return 'U.S. Fish and Wildlife Service';
  if (/National Park Service|PD US NPS/i.test(text)) return 'National Park Service';
  return '';
}

function fileTitle(title: string): string {
  return title.replace(/^File:/, '').replace(/\.[A-Za-z0-9]{2,5}$/, '');
}

async function resolveSource(layer: LayerSpec): Promise<Source> {
  if (layer.file) {
    const { path, info } = await ensureFile(layer.file);
    return {
      path,
      label: info.title,
      credit: {
        title: fileTitle(info.title),
        author: info.author || agencyAuthor(info.categories) || info.credit || 'Unknown',
        license: info.license,
        licenseUrl: licenseUrlFor(info.license, info.licenseUrl),
        source: info.pageUrl,
      },
    };
  }
  if (layer.url && layer.credit) {
    const problem = licenseProblem(layer.credit.license, '');
    if (problem) throw new Error(`${layer.url}: ${problem}`);
    return {
      path: await downloadUrl(layer.url, urlFileName(layer.url)),
      label: layer.url,
      credit: layer.credit,
    };
  }
  throw new Error('Layer needs "file" (Commons title) or "url" + "credit"');
}

function urlFileName(url: string): string {
  return safeName(decodeURIComponent(new URL(url).pathname.split('/').pop() ?? 'download'));
}

const decoded = new Map<string, Float32Array[]>();

async function loadChannels(path: string): Promise<Float32Array[]> {
  let channels = decoded.get(path);
  if (!channels) {
    channels = await decodeFile(path);
    decoded.set(path, channels);
  }
  return channels;
}

function autoWindow(x: Float32Array, maxDuration: number): [number, number] {
  const { events } = detectEvents(x);
  const total = x.length / SR;
  if (events.length === 0) return [0, Math.min(total, maxDuration)];
  const bestIndex = events.reduce((best, e, i) => (e.score > events[best].score ? i : best), 0);
  let lo = bestIndex;
  let hi = bestIndex;
  let start = events[bestIndex].start;
  let end = Math.min(events[bestIndex].end, start + maxDuration);
  for (;;) {
    const prev = events[lo - 1];
    const next = events[hi + 1];
    const canPrev = prev && start - prev.end < 0.35 && end - prev.start <= maxDuration;
    const canNext = next && next.start - end < 0.35 && next.end - start <= maxDuration;
    if (!canPrev && !canNext) break;
    if (canPrev && (!canNext || prev.score >= next.score)) {
      lo--;
      start = prev.start;
    } else {
      hi++;
      end = next.end;
    }
  }
  return [Math.max(0, start - 0.03), Math.min(total, end + 0.08)];
}

function applyEq(x: Float32Array, bands: EqBand[] | undefined): Float32Array {
  return (bands ?? []).reduce(
    (signal, band) => biquad(signal, band.type, band.freq, band.q ?? 0.9, band.gainDb),
    x,
  );
}

function seconds(value: number): string {
  return `${value.toFixed(2)} s`;
}

function describeLayer(layer: LayerSpec, start: number, end: number): string[] {
  const steps: string[] = [`${seconds(start).replace(' s', '')}–${seconds(end)}`];
  if (layer.denoise) steps.push('light noise reduction');
  if (layer.highpass) steps.push(`high-passed at ${layer.highpass} Hz`);
  if (layer.lowpass) steps.push(`low-passed at ${layer.lowpass} Hz`);
  if (layer.eq?.length) steps.push('EQ');
  if (layer.stretch && layer.stretch !== 1) {
    steps.push(`time-stretched ×${layer.stretch} (pitch kept)`);
  }
  if (layer.rate && layer.rate !== 1) {
    const percent = Math.round(Math.abs(1 - layer.rate) * 100);
    steps.push(
      layer.rate < 1
        ? `slowed to ${layer.rate}× speed (pitched down ${percent}%)`
        : `sped up to ${layer.rate}× (pitched up ${percent}%)`,
    );
  }
  if (layer.reverse) steps.push('reversed');
  if (layer.gainDb) steps.push(`${layer.gainDb > 0 ? '+' : ''}${layer.gainDb} dB`);
  if (layer.at) steps.push(`placed at ${seconds(layer.at)}`);
  return steps;
}

interface Rendered {
  audio: Float32Array;
  credits: Credit[];
  layerNotes: string[];
  windows: [number, number][];
}

async function renderLayers(spec: Spec): Promise<Rendered> {
  const credits: Credit[] = [];
  const layerNotes: string[] = [];
  const windows: [number, number][] = [];
  const parts: { at: number; audio: Float32Array }[] = [];
  const maxDuration = spec.maxDuration ?? DEFAULT_MAX_DURATION;
  for (const layer of spec.layers) {
    const source = await resolveSource(layer);
    if (!credits.some((c) => c.source === source.credit.source)) credits.push(source.credit);
    const mono = toMono(await loadChannels(source.path), layer.channel ?? 'mix');
    let [start, end] =
      layer.start === undefined || layer.end === undefined
        ? autoWindow(mono, maxDuration / Math.max(0.25, (layer.stretch ?? 1) / (layer.rate ?? 1)))
        : [layer.start, layer.end];
    end = Math.min(end, mono.length / SR);
    start = Math.max(0, Math.min(start, end));
    windows.push([start, end]);
    let audio = slice(mono, start, end);
    if (layer.denoise) {
      const [noiseStart, noiseEnd] = layer.noise ?? quietestRegion(mono, 0.6);
      audio = denoise(audio, slice(mono, noiseStart, noiseEnd), layer.denoise);
    }
    if (layer.highpass) audio = highpass(audio, layer.highpass);
    if (layer.lowpass) audio = lowpass(audio, layer.lowpass);
    audio = applyEq(audio, layer.eq);
    if (layer.stretch && layer.stretch !== 1) audio = stretch(audio, layer.stretch);
    if (layer.rate && layer.rate !== 1) audio = resample(audio, layer.rate);
    if (layer.reverse) audio = reverse(audio);
    audio = fade(audio, layer.fadeIn ?? 0.004, layer.fadeOut ?? 0.02);
    if (layer.level !== undefined)
      audio = scale(audio, 10 ** ((layer.level - gatedRmsDb(audio)) / 20));
    if (layer.gainDb) audio = scale(audio, 10 ** (layer.gainDb / 20));
    parts.push({ at: layer.at ?? 0, audio });
    const label = spec.layers.length > 1 ? `"${source.credit.title}" ` : '';
    layerNotes.push(`${label}${describeLayer(layer, start, end).join(', ')}`);
  }
  const length = Math.max(...parts.map((p) => Math.round(p.at * SR) + p.audio.length));
  const mix = new Float32Array(length);
  for (const part of parts) {
    const offset = Math.round(part.at * SR);
    for (let i = 0; i < part.audio.length; i++) mix[offset + i] += part.audio[i];
  }
  return { audio: mix, credits, layerNotes, windows };
}

function quietestRegion(x: Float32Array, length: number): [number, number] {
  const step = 0.05;
  const total = x.length / SR;
  let best: [number, number] = [0, Math.min(total, length)];
  let bestEnergy = Infinity;
  for (let t = 0; t + length <= total; t += step) {
    const part = slice(x, t, t + length);
    let energy = 0;
    for (let i = 0; i < part.length; i++) energy += part[i] * part[i];
    if (energy < bestEnergy) {
      bestEnergy = energy;
      best = [t, t + length];
    }
  }
  return best;
}

interface Finished {
  audio: Float32Array;
  steps: string[];
  limitingDb: number;
}

function finish(spec: Spec, input: Float32Array): Finished {
  const steps: string[] = [];
  let audio = input;
  const hp = spec.highpass ?? DEFAULT_HIGHPASS;
  if (hp > 0) {
    audio = biquad(audio, 'highpass', hp);
    steps.push(`gentle 12 dB/oct high-pass at ${hp} Hz`);
  }
  if (spec.lowpass) {
    audio = lowpass(audio, spec.lowpass);
    steps.push(`low-passed at ${spec.lowpass} Hz`);
  }
  if (spec.eq?.length) {
    audio = applyEq(audio, spec.eq);
    steps.push('EQ');
  }
  if (spec.reverb) {
    const { room, damp, wet, tail } = spec.reverb;
    audio = freeverb(audio, room, damp, wet, tail);
    steps.push('added reverb');
  }
  const [trimStart, trimEnd] = trimBounds(audio, spec.trimDb ?? 40);
  audio = slice(audio, trimStart, trimEnd);
  const maxDuration = spec.maxDuration ?? DEFAULT_MAX_DURATION;
  if (audio.length > maxDuration * SR) audio = audio.slice(0, Math.round(maxDuration * SR));
  audio = fade(audio, FADE_IN, FADE_OUT);
  let gain = 10 ** ((TARGET_RMS_DB - gatedRmsDb(audio)) / 20);
  const maxGain = (PEAK_CEILING * 10 ** (MAX_LIMITING_DB / 20)) / Math.max(peak(audio), 1e-9);
  gain = Math.min(gain, maxGain);
  audio = scale(audio, gain);
  const before = peak(audio);
  let limitingDb = 0;
  if (before > PEAK_CEILING) {
    audio = limit(audio, PEAK_CEILING);
    limitingDb = db(before / PEAK_CEILING);
  }
  const after = peak(audio);
  if (after > PEAK_CEILING) audio = scale(audio, PEAK_CEILING / after);
  steps.push('silence trimmed', 'loudness-normalised (≈ −18 dBFS RMS, peak ≤ −1 dBFS)');
  if (limitingDb >= 0.1) steps.push(`peaks limited by ${limitingDb.toFixed(1)} dB`);
  steps.push(`${FADE_IN * 1000} ms fade-in / ${FADE_OUT * 1000} ms fade-out`);
  return { audio, steps, limitingDb };
}

function combinedLicense(credits: Credit[]): { license: string; licenseUrl: string } {
  if (credits.length === 1) return credits[0];
  if (credits.some((c) => /BY-SA/i.test(c.license))) {
    return {
      license: 'CC BY-SA 4.0',
      licenseUrl: 'https://creativecommons.org/licenses/by-sa/4.0/',
    };
  }
  if (credits.some((c) => /^CC BY/i.test(c.license))) {
    return { license: 'CC BY 4.0', licenseUrl: 'https://creativecommons.org/licenses/by/4.0/' };
  }
  return { license: 'CC0 1.0', licenseUrl: 'https://creativecommons.org/publicdomain/zero/1.0/' };
}

async function writeJson(path: string, value: unknown): Promise<void> {
  const config = (await resolveConfig(path)) ?? {};
  writeFileSync(path, await format(JSON.stringify(value), { ...config, parser: 'json' }));
}

function trimmedNote(note: string): string {
  const [range, ...rest] = note.split(', ');
  return [`${range} of the original`, ...rest].join(', ');
}

function readSpec(id: string): Spec {
  const path = resolve(SPECS, `${id}.json`);
  if (!existsSync(path)) throw new Error(`No spec: ${path}`);
  const spec = JSON.parse(readFileSync(path, 'utf8')) as Spec;
  if (spec.id !== id) throw new Error(`${path}: id mismatch (${spec.id})`);
  if (!spec.layers?.length) throw new Error(`${path}: no layers`);
  return spec;
}

async function build(id: string): Promise<void> {
  const spec = readSpec(id);
  const rendered = await renderLayers(spec);
  const finished = finish(spec, rendered.audio);
  const mp3 = encodeMp3(finished.audio);
  const info = inspectMp3(mp3);
  if (!info.mono || !info.mpeg1Layer3 || info.bitrates.length !== 1 || info.sampleRates[0] !== SR) {
    throw new Error(`${id}: unexpected MP3 format ${JSON.stringify(info)}`);
  }
  const check = toMono(await decodeBytes(mp3));
  const duration = Math.round((check.length / SR) * 100) / 100;
  const derived =
    spec.layers.length > 1 ||
    spec.title !== undefined ||
    spec.layers.some((l) => (l.rate ?? 1) !== 1 || (l.stretch ?? 1) !== 1 || l.reverse);
  const encodeStep = `encoded as ${MP3_KBPS} kbps mono MP3`;
  const changes = derived
    ? [
        `Sound design from ${rendered.credits.length === 1 ? 'a real recording' : `${rendered.credits.length} real recordings`}: ${rendered.layerNotes.join('; ')}`,
        `then mixed to mono, ${finished.steps.join(', ')}, ${encodeStep}.`,
      ].join('; ')
    : `Trimmed to ${trimmedNote(rendered.layerNotes[0])}, mixed to mono, ${finished.steps.join(', ')}, ${encodeStep}.`;
  const prefix = spec.species ? `${spec.species}. ` : '';
  const suffix = spec.note ? ` ${spec.note}` : '';
  const primary = rendered.credits[0];
  const license = combinedLicense(rendered.credits);
  const sidecar: Sidecar = {
    id,
    file: `${id}.mp3`,
    duration,
    title: spec.title ?? primary.title,
    author: derived
      ? rendered.credits.length === 1
        ? primary.author
        : `DigiZoo sound design from recordings by ${[...new Set(rendered.credits.map((c) => c.author))].join('; ')}`
      : primary.author,
    license: license.license,
    licenseUrl: license.licenseUrl,
    source: primary.source,
    changes: `${prefix}${changes}${suffix}`,
  };
  if (derived) sidecar.sources = rendered.credits;
  mkdirSync(SAMPLES, { recursive: true });
  writeFileSync(resolve(SAMPLES, `${id}.mp3`), mp3);
  await writeJson(resolve(SAMPLES, `${id}.json`), sidecar);
  const measuredPeak = db(peak(check));
  const measuredRms = gatedRmsDb(check);
  console.log(
    `${id.padEnd(16)} ${duration.toFixed(2)}s  peak ${measuredPeak.toFixed(1)} dB  rms ${measuredRms.toFixed(1)} dB  limit ${finished.limitingDb.toFixed(1)} dB  ${(mp3.length / 1024).toFixed(1)} KB  ${license.license}  ${rendered.windows.map(([s, e]) => `${s.toFixed(2)}-${e.toFixed(2)}`).join(' + ')}`,
  );
  if (duration < MIN_DURATION) console.log(`  ! ${id}: shorter than ${MIN_DURATION} s`);
}

interface AnalyzeOptions {
  from?: number;
  to?: number;
  channel: ChannelMode;
  range: number;
  gap: number;
}

async function analyze(target: string, options: AnalyzeOptions): Promise<void> {
  let path = target;
  let header = target;
  if (/^(File|Image):/i.test(target)) {
    const { path: cached, info } = await ensureFile(target);
    path = cached;
    header = `${info.title} | ${info.license} | ${info.author.slice(0, 60)}`;
  } else if (/^https?:\/\//i.test(target)) {
    path = await downloadUrl(target, urlFileName(target));
  }
  const channels = await loadChannels(path);
  const mono = toMono(channels, options.channel);
  const total = mono.length / SR;
  const from = Math.max(0, options.from ?? 0);
  const to = Math.min(total, options.to ?? Math.min(total, from + 120));
  const region = slice(mono, from, to);
  const { floorDb, events } = detectEvents(region, {
    mergeGap: options.gap,
    rangeDb: options.range,
  });
  const ranked = [...events].sort((a, b) => b.score - a.score).slice(0, 5);
  console.log(header);
  console.log(
    `duration ${total.toFixed(2)} s, ${channels.length} ch, window ${from.toFixed(2)}–${to.toFixed(2)} s, noise floor ${floorDb.toFixed(1)} dB, peak ${db(peak(region)).toFixed(1)} dB`,
  );
  console.log('  #   start    end    dur   peak    rms   snr     f0  centroid');
  events.forEach((e, index) => {
    const star = ranked.includes(e) ? '*' : ' ';
    console.log(
      `${star}${String(index + 1).padStart(3)} ${(e.start + from).toFixed(2).padStart(6)} ${(e.end + from).toFixed(2).padStart(6)} ${(e.end - e.start).toFixed(2).padStart(6)} ${e.peakDb.toFixed(1).padStart(6)} ${e.rmsDb.toFixed(1).padStart(6)} ${e.snrDb.toFixed(1).padStart(5)} ${(e.f0 ? e.f0.toFixed(0) : '-').padStart(6)} ${e.centroid.toFixed(0).padStart(9)}`,
    );
  });
  const colors: [number, number, number][] = [
    [125, 255, 154],
    [255, 196, 87],
  ];
  const markers: Marker[] = events.map((e, index) => ({
    start: e.start + from,
    end: e.end + from,
    label: String(index + 1),
    color: colors[index % 2],
  }));
  const span = to - from;
  const pxPerSecond = Math.max(12, Math.min(500, 1700 / Math.max(span, 0.1)));
  const image = panel(mono, {
    start: from,
    end: to,
    pxPerSecond,
    rows: 120,
    rowPx: 2,
    waveH: 70,
    rangeDb: 75,
    markers,
    title: basename(path).slice(0, 70),
    subtitle: header.slice(0, 160),
  });
  const suffix =
    options.from !== undefined || options.to !== undefined
      ? `@${from.toFixed(1)}-${to.toFixed(1)}`
      : '';
  const out = resolve(cacheDir('analysis'), `${basename(path)}${suffix}.png`);
  writeFileSync(out, rasterize(image.svg));
  console.log(`→ ${out}`);
}

function parseAnalyze(argv: string[]): { targets: string[]; options: AnalyzeOptions } {
  const options: AnalyzeOptions = { channel: 'mix', range: 38, gap: 0.12 };
  const targets: string[] = [];
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === '--from') options.from = Number(argv[++i]);
    else if (arg === '--to') options.to = Number(argv[++i]);
    else if (arg === '--channel') options.channel = argv[++i] as ChannelMode;
    else if (arg === '--range') options.range = Number(argv[++i]);
    else if (arg === '--gap') options.gap = Number(argv[++i]);
    else targets.push(arg);
  }
  return { targets, options };
}

async function main(): Promise<void> {
  const [command, ...argv] = process.argv.slice(2);
  if (command === 'fetch' && argv.length) {
    for (const target of argv) {
      if (/^https?:\/\//i.test(target)) {
        console.log(`${target} → ${await downloadUrl(target, urlFileName(target))}`);
        continue;
      }
      const { path, info } = await ensureFile(target);
      console.log(`${info.title} | ${info.license} | ${info.duration.toFixed(1)} s → ${path}`);
    }
    return;
  }
  if (command === 'analyze' && argv.length) {
    const { targets, options } = parseAnalyze(argv);
    for (const target of targets) {
      try {
        await analyze(target, options);
      } catch (error) {
        process.exitCode = 1;
        console.error(`${target}: ${error instanceof Error ? error.message : error}`);
      }
    }
    return;
  }
  if (command === 'build' && argv.length) {
    const ids = argv.includes('--all')
      ? readdirSync(SPECS)
          .filter((f) => f.endsWith('.json'))
          .map((f) => f.replace(/\.json$/, ''))
          .sort()
      : argv;
    let failed = 0;
    for (const id of ids) {
      try {
        await build(id);
      } catch (error) {
        failed++;
        console.error(`${id}: ${error instanceof Error ? error.message : error}`);
      }
    }
    if (failed) process.exitCode = 1;
    return;
  }
  console.log(USAGE);
  process.exitCode = command ? 1 : 0;
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? (error.stack ?? error.message) : error);
  process.exitCode = 1;
});
