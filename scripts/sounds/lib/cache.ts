import { createHash } from 'node:crypto';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { type Candidate, fetchWithRetry, fileInfo, normaliseTitle, polite } from './commons-api';

export const ROOT = resolve(import.meta.dirname, '../../..');
export const CACHE = resolve(ROOT, '.sound-cache');
export const SAMPLES = resolve(ROOT, 'src/audio/samples');
export const SPECS = resolve(ROOT, 'scripts/sounds/specs');

const DOWNLOAD_GAP_MS = 1000;

export function cacheDir(name: string): string {
  const dir = resolve(CACHE, name);
  mkdirSync(dir, { recursive: true });
  return dir;
}

export function safeName(title: string): string {
  const base = title.replace(/^File:/, '');
  const ext = (/\.[A-Za-z0-9]{2,5}$/.exec(base)?.[0] ?? '').toLowerCase();
  const stem = base
    .slice(0, base.length - ext.length)
    .normalize('NFKD')
    .replace(/[^A-Za-z0-9.-]+/g, '_')
    .replace(/_+/g, '_')
    .replace(/^_|_$/g, '')
    .slice(0, 80);
  const hash = createHash('sha1').update(base).digest('hex').slice(0, 8);
  return `${stem || 'file'}-${hash}${ext}`;
}

function metaPath(title: string): string {
  return resolve(cacheDir('meta'), `${safeName(normaliseTitle(title))}.json`);
}

export function remember(candidates: Candidate[]): void {
  for (const candidate of candidates) {
    writeFileSync(metaPath(candidate.title), `${JSON.stringify(candidate, null, 2)}\n`);
  }
}

export async function describe(title: string, refresh = false): Promise<Candidate> {
  const path = metaPath(title);
  if (!refresh && existsSync(path)) return JSON.parse(readFileSync(path, 'utf8')) as Candidate;
  const [info] = await fileInfo([title]);
  if (!info) throw new Error(`No such file on Commons: ${normaliseTitle(title)}`);
  remember([info]);
  return info;
}

export async function downloadUrl(url: string, name: string): Promise<string> {
  const path = resolve(cacheDir('files'), name);
  if (existsSync(path)) return path;
  await polite(DOWNLOAD_GAP_MS);
  writeFileSync(path, await fetchWithRetry(url));
  return path;
}

export async function ensureFile(title: string): Promise<{ path: string; info: Candidate }> {
  const info = await describe(title);
  if (!info.allowed) throw new Error(`${info.title} is not usable: ${info.reasons.join('; ')}`);
  const source = info.audioUrl || info.fileUrl;
  const suffix = source === info.fileUrl ? '' : (/\.[a-z0-9]+$/i.exec(source)?.[0] ?? '');
  const path = await downloadUrl(source, `${safeName(info.title)}${suffix}`);
  return { path, info };
}
