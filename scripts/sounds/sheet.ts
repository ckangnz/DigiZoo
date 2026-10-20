import { existsSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { SR, db, decodeFile, gatedRmsDb, peak, toMono } from './lib/audio';
import { SAMPLES, cacheDir } from './lib/cache';
import { type Panel, grid, panel, rasterize } from './lib/render';

const USAGE = `Usage:
  sheet.ts [<id> …] [--columns 3] [--per-sheet 12] [--out <name>]
Renders waveform + spectrogram tiles of src/audio/samples/<id>.mp3 (all samples when no ids)
into .sound-cache/sheets/<name>-<n>.png`;

interface Options {
  ids: string[];
  columns: number;
  perSheet: number;
  out?: string;
}

function parse(argv: string[]): Options {
  const options: Options = { ids: [], columns: 3, perSheet: 12 };
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === '--columns') options.columns = Number(argv[++i]);
    else if (arg === '--per-sheet') options.perSheet = Number(argv[++i]);
    else if (arg === '--out') options.out = argv[++i];
    else if (arg === '--help') {
      console.log(USAGE);
      process.exit(0);
    } else options.ids.push(arg);
  }
  return options;
}

interface SidecarInfo {
  title?: string;
  license?: string;
  author?: string;
  sources?: unknown[];
}

async function tile(id: string): Promise<Panel | null> {
  const mp3 = resolve(SAMPLES, `${id}.mp3`);
  if (!existsSync(mp3)) {
    console.log(`skip ${id}: no ${mp3}`);
    return null;
  }
  const sidecarPath = resolve(SAMPLES, `${id}.json`);
  const sidecar: SidecarInfo = existsSync(sidecarPath)
    ? (JSON.parse(readFileSync(sidecarPath, 'utf8')) as SidecarInfo)
    : {};
  const audio = toMono(await decodeFile(mp3));
  const duration = audio.length / SR;
  const level = `PEAK ${db(peak(audio)).toFixed(1)} RMS ${gatedRmsDb(audio).toFixed(1)}`;
  const sources = sidecar.sources?.length ? ` ${sidecar.sources.length} SOURCES` : '';
  return panel(audio, {
    start: 0,
    end: Math.max(duration, 3.05),
    pxPerSecond: 190,
    rows: 90,
    rowPx: 2,
    waveH: 56,
    rangeDb: 70,
    tickEvery: 0.25,
    title: `${id} ${duration.toFixed(2)}S`,
    subtitle: `${level} ${sidecar.license ?? 'NO SIDECAR'}${sources} ${sidecar.title ?? ''}`.slice(
      0,
      96,
    ),
  });
}

async function main(): Promise<void> {
  const options = parse(process.argv.slice(2));
  const ids = options.ids.length
    ? options.ids
    : readdirSync(SAMPLES)
        .filter((file) => file.endsWith('.mp3'))
        .map((file) => file.replace(/\.mp3$/, ''))
        .sort();
  const panels: Panel[] = [];
  for (const id of ids) {
    const item = await tile(id);
    if (item) panels.push(item);
  }
  if (panels.length === 0) {
    console.log('nothing to render');
    return;
  }
  const name = options.out ?? (options.ids.length ? `${ids[0]}-${ids[ids.length - 1]}` : 'all');
  const dir = cacheDir('sheets');
  for (let start = 0, n = 1; start < panels.length; start += options.perSheet, n++) {
    const svg = grid(panels.slice(start, start + options.perSheet), options.columns);
    const out = resolve(dir, `${name}-${n}.png`);
    writeFileSync(out, rasterize(svg));
    console.log(`→ ${out}`);
  }
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? (error.stack ?? error.message) : error);
  process.exitCode = 1;
});
