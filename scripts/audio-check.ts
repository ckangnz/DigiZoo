import { mkdirSync, readdirSync, writeFileSync } from 'node:fs';
import { basename, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { Resvg } from '@resvg/resvg-js';
import { OfflineAudioContext } from 'node-web-audio-api';
import { SFX } from '../src/audio/sfx';
import { limiterCurve, mulberry32 } from '../src/audio/synth';
import type { Recipe } from '../src/audio/types';

type Kind = 'animal' | 'sfx';

interface Sound {
  id: string;
  kind: Kind;
  recipe: Recipe;
}

interface SourceRecord {
  started: boolean;
  stopAt: number | null;
}

interface Rendered {
  variant: string;
  channels: Float32Array[];
  duration: number;
  sources: SourceRecord[];
  nodes: number;
  ms: number;
  error?: string;
}

interface Levels {
  peak: number;
  rms: number;
  tailPeak: number;
  prePeak: number;
  invalid: number;
  dc: number;
}

interface Report {
  sound: Sound;
  duration: number;
  peak: number;
  rms: number;
  nodes: number;
  ms: number;
  problems: string[];
  warnings: string[];
}

const SAMPLE_RATE = 44100;
const START = 0.1;
const TAIL_WINDOW = 0.4;
const RENDER_SECONDS = START + 2.2 + TAIL_WINDOW + 0.1;
const TAIL_LIMIT = 0.003;
const PRE_LIMIT = 0.001;

const LONG_SFX = new Set(['sfx-win']);

const LIMITS: Record<Kind, { min: number; max: number; soft: number; loud: number }> = {
  animal: { min: 0.6, max: 2.2, soft: 0.4, loud: 0.8 },
  sfx: { min: 0.05, max: 0.6, soft: 0.08, loud: 0.5 },
};

const PIXELS_PER_SECOND: Record<Kind, number> = { animal: 400, sfx: 1000 };

const VARIANTS: readonly (readonly [string, () => () => number])[] = [
  ['mid', () => () => 0.5],
  ['low', () => () => 0],
  ['high', () => () => 0.9999],
  ['seed-1', () => mulberry32(1)],
  ['seed-2', () => mulberry32(2)],
  ['seed-3', () => mulberry32(3)],
];

const SOURCE_FACTORIES = new Set([
  'createOscillator',
  'createBufferSource',
  'createConstantSource',
]);
const NODE_FACTORIES = [
  ...SOURCE_FACTORIES,
  'createGain',
  'createBiquadFilter',
  'createWaveShaper',
  'createConvolver',
  'createDelay',
  'createStereoPanner',
  'createDynamicsCompressor',
  'createIIRFilter',
  'createChannelMerger',
  'createChannelSplitter',
];

const root = resolve(import.meta.dirname, '..');
const outDir = resolve(root, '.audio-preview');
const args = process.argv.slice(2);
const quick = args.includes('--quick');
const detail = args.includes('--detail');
const raw = args.includes('--raw');
const wantSheet = args.includes('--sheet');
const filters = args.filter((arg) => !arg.startsWith('--'));

async function loadSounds(): Promise<Sound[]> {
  const dir = resolve(root, 'src/audio/recipes');
  const files = readdirSync(dir)
    .filter((file) => file.endsWith('.ts'))
    .sort();
  const sounds: Sound[] = [];
  for (const file of files) {
    const mod = (await import(pathToFileURL(resolve(dir, file)).href)) as { default: Recipe };
    sounds.push({ id: basename(file, '.ts'), kind: 'animal', recipe: mod.default });
  }
  for (const [name, recipe] of Object.entries(SFX)) {
    sounds.push({ id: `sfx-${name}`, kind: 'sfx', recipe });
  }
  if (filters.length === 0) return sounds;
  return sounds.filter(
    (s) => filters.includes(s.id) || filters.includes(s.id.replace(/^sfx-/, '')),
  );
}

function bypassLimiter(node: WaveShaperNode): void {
  const accessor = Object.getOwnPropertyDescriptor(Object.getPrototypeOf(node), 'curve');
  const identity = new Float32Array([-2, 2]);
  Object.defineProperty(node, 'curve', {
    get: () => accessor?.get?.call(node),
    set: (curve: Float32Array | null) =>
      accessor?.set?.call(node, curve === limiterCurve() ? identity : curve),
  });
}

function instrument(ctx: OfflineAudioContext) {
  const sources: SourceRecord[] = [];
  let nodes = 0;
  const factories = ctx as unknown as Record<string, (...input: unknown[]) => unknown>;
  for (const name of NODE_FACTORIES) {
    const original = factories[name].bind(ctx);
    factories[name] = (...input: unknown[]) => {
      nodes++;
      const node = original(...input);
      if (raw && name === 'createWaveShaper') bypassLimiter(node as WaveShaperNode);
      if (SOURCE_FACTORIES.has(name)) {
        const record: SourceRecord = { started: false, stopAt: null };
        sources.push(record);
        const source = node as { start: (...t: number[]) => void; stop: (...t: number[]) => void };
        const start = source.start.bind(node);
        const stop = source.stop.bind(node);
        source.start = (...t: number[]) => {
          record.started = true;
          start(...t);
        };
        source.stop = (...t: number[]) => {
          record.stopAt = t[0] ?? 0;
          stop(...t);
        };
      }
      return node;
    };
  }
  return { sources, nodes: () => nodes };
}

async function render(sound: Sound, variant: string, rand: () => number): Promise<Rendered> {
  const ctx = new OfflineAudioContext({
    numberOfChannels: 2,
    length: Math.ceil(RENDER_SECONDS * SAMPLE_RATE),
    sampleRate: SAMPLE_RATE,
  });
  const probe = instrument(ctx);
  const began = performance.now();
  try {
    const duration = sound.recipe({
      ctx: ctx as unknown as BaseAudioContext,
      out: ctx.destination as unknown as AudioNode,
      t0: START,
      rand,
    });
    const buffer = await ctx.startRendering();
    const channels = Array.from({ length: buffer.numberOfChannels }, (_, i) =>
      buffer.getChannelData(i).slice(),
    );
    return {
      variant,
      channels,
      duration,
      sources: probe.sources,
      nodes: probe.nodes(),
      ms: performance.now() - began,
    };
  } catch (error) {
    return {
      variant,
      channels: [],
      duration: 0,
      sources: probe.sources,
      nodes: probe.nodes(),
      ms: performance.now() - began,
      error: error instanceof Error ? `${error.name}: ${error.message}` : String(error),
    };
  }
}

function measure(rendered: Rendered): Levels {
  const startIndex = Math.round(START * SAMPLE_RATE);
  const endIndex = Math.round((START + rendered.duration) * SAMPLE_RATE);
  const levels: Levels = { peak: 0, rms: 0, tailPeak: 0, prePeak: 0, invalid: 0, dc: 0 };
  let sumSquares = 0;
  let sum = 0;
  let count = 0;
  for (const data of rendered.channels) {
    for (let i = 0; i < data.length; i++) {
      const value = data[i];
      if (!Number.isFinite(value)) {
        levels.invalid++;
        continue;
      }
      const magnitude = Math.abs(value);
      levels.peak = Math.max(levels.peak, magnitude);
      if (i < startIndex) levels.prePeak = Math.max(levels.prePeak, magnitude);
      else if (i >= endIndex) levels.tailPeak = Math.max(levels.tailPeak, magnitude);
      else {
        sumSquares += value * value;
        sum += value;
        count++;
      }
    }
  }
  levels.rms = Math.sqrt(sumSquares / Math.max(1, count));
  levels.dc = sum / Math.max(1, count);
  return levels;
}

function inspect(sound: Sound, renders: Rendered[]): Report {
  const limits = LONG_SFX.has(sound.id) ? { ...LIMITS.sfx, max: 1.4 } : LIMITS[sound.kind];
  const problems = new Set<string>();
  const warnings = new Set<string>();
  let peak = 0;
  for (const rendered of renders) {
    const tag = rendered.variant;
    if (rendered.error) {
      problems.add(`${tag}: ${rendered.error}`);
      continue;
    }
    const levels = measure(rendered);
    peak = Math.max(peak, levels.peak);
    if (!Number.isFinite(rendered.duration)) problems.add(`${tag}: duration not finite`);
    if (rendered.duration < limits.min || rendered.duration > limits.max) {
      problems.add(
        `duration ${rendered.duration.toFixed(3)}s outside ${limits.min}-${limits.max}s`,
      );
    }
    if (levels.invalid > 0) problems.add(`${tag}: ${levels.invalid} NaN/Inf samples`);
    if (levels.peak < 0.02 || levels.rms < 0.002) problems.add(`${tag}: silent`);
    if (levels.peak >= 0.95) problems.add(`${tag}: peak ${levels.peak.toFixed(3)} >= 0.95`);
    if (levels.tailPeak > TAIL_LIMIT) {
      problems.add(`${tag}: still sounding after duration (${levels.tailPeak.toFixed(4)})`);
    }
    if (levels.prePeak > PRE_LIMIT) problems.add(`${tag}: sound before t0`);
    if (Math.abs(levels.dc) > 0.02) problems.add(`${tag}: DC offset ${levels.dc.toFixed(3)}`);
    const unstopped = rendered.sources.filter((s) => s.started && s.stopAt === null).length;
    if (unstopped > 0) problems.add(`${tag}: ${unstopped} sources never stopped`);
    const late = rendered.sources.filter(
      (s) => s.stopAt !== null && s.stopAt > START + rendered.duration + 1e-6,
    ).length;
    if (late > 0) problems.add(`${tag}: ${late} sources stop after duration`);
    if (levels.peak > limits.loud) warnings.add(`${tag}: loud ${levels.peak.toFixed(2)}`);
    if (levels.peak < limits.soft) warnings.add(`${tag}: soft ${levels.peak.toFixed(2)}`);
    if (rendered.nodes > 220) warnings.add(`${tag}: ${rendered.nodes} nodes`);
  }
  const nominal = renders[0];
  const nominalLevels = nominal.error ? undefined : measure(nominal);
  return {
    sound,
    duration: nominal.duration,
    peak,
    rms: nominalLevels?.rms ?? 0,
    nodes: nominal.nodes,
    ms: renders.reduce((total, r) => total + r.ms, 0) / renders.length,
    problems: [...problems],
    warnings: [...warnings],
  };
}

function encodeWav(channels: Float32Array[], from: number, to: number): Buffer {
  const frames = Math.max(0, to - from);
  const count = channels.length;
  const bytes = frames * count * 2;
  const out = Buffer.alloc(44 + bytes);
  out.write('RIFF', 0);
  out.writeUInt32LE(36 + bytes, 4);
  out.write('WAVE', 8);
  out.write('fmt ', 12);
  out.writeUInt32LE(16, 16);
  out.writeUInt16LE(1, 20);
  out.writeUInt16LE(count, 22);
  out.writeUInt32LE(SAMPLE_RATE, 24);
  out.writeUInt32LE(SAMPLE_RATE * count * 2, 28);
  out.writeUInt16LE(count * 2, 32);
  out.writeUInt16LE(16, 34);
  out.write('data', 36);
  out.writeUInt32LE(bytes, 40);
  let offset = 44;
  for (let i = from; i < to; i++) {
    for (const data of channels) {
      const value = Math.max(-1, Math.min(1, data[i] || 0));
      out.writeInt16LE(Math.round(value * 32767), offset);
      offset += 2;
    }
  }
  return out;
}

const GLYPHS: Record<string, string> = {
  A: '0e11111f111111',
  B: '1e11111e11111e',
  C: '0e11101010110e',
  D: '1c12111111121c',
  E: '1f10101e10101f',
  F: '1f10101e101010',
  G: '0e11101711110f',
  H: '1111111f111111',
  I: '0e04040404040e',
  J: '0702020202120c',
  K: '11121418141211',
  L: '1010101010101f',
  M: '111b1515111111',
  N: '11111915131111',
  O: '0e11111111110e',
  P: '1e11111e101010',
  Q: '0e11111115120d',
  R: '1e11111e141211',
  S: '0f10100e01011e',
  T: '1f040404040404',
  U: '1111111111110e',
  V: '11111111110a04',
  W: '1111111515150a',
  X: '11110a040a1111',
  Y: '11110a04040404',
  Z: '1f01020408101f',
  '0': '0e11131519110e',
  '1': '040c040404040e',
  '2': '0e11010204081f',
  '3': '1f02040201110e',
  '4': '02060a121f0202',
  '5': '1f101e0101110e',
  '6': '0608101e11110e',
  '7': '1f010204080808',
  '8': '0e11110e11110e',
  '9': '0e11110f01020c',
  '.': '00000000000c0c',
  '-': '0000000e000000',
  ':': '000c0c000c0c00',
  '%': '18190204081303',
  '/': '00010204081000',
  '=': '00001f001f0000',
  '+': '0004041f040400',
  '(': '02040808080402',
  ')': '08040202020408',
  ' ': '00000000000000',
};

function text(value: string, x: number, y: number, scale: number, color: string): string {
  const rects: string[] = [];
  [...value.toUpperCase()].forEach((char, index) => {
    const glyph = GLYPHS[char] ?? GLYPHS[' '];
    for (let row = 0; row < 7; row++) {
      const bits = parseInt(glyph.slice(row * 2, row * 2 + 2), 16);
      let col = 0;
      while (col < 5) {
        if (bits & (16 >> col)) {
          let run = 1;
          while (col + run < 5 && bits & (16 >> (col + run))) run++;
          const px = x + (index * 6 + col) * scale;
          rects.push(
            `<rect x="${px}" y="${y + row * scale}" width="${run * scale}" height="${scale}" fill="${color}"/>`,
          );
          col += run;
        } else {
          col++;
        }
      }
    }
  });
  return rects.join('');
}

function fft(re: Float64Array, im: Float64Array): void {
  const n = re.length;
  for (let i = 1, j = 0; i < n; i++) {
    let bit = n >> 1;
    for (; j & bit; bit >>= 1) j ^= bit;
    j ^= bit;
    if (i < j) {
      [re[i], re[j]] = [re[j], re[i]];
      [im[i], im[j]] = [im[j], im[i]];
    }
  }
  for (let len = 2; len <= n; len <<= 1) {
    const half = len >> 1;
    const angle = (-2 * Math.PI) / len;
    const wr = Math.cos(angle);
    const wi = Math.sin(angle);
    for (let i = 0; i < n; i += len) {
      let cr = 1;
      let ci = 0;
      for (let k = 0; k < half; k++) {
        const a = i + k;
        const b = a + half;
        const br = re[b] * cr - im[b] * ci;
        const bi = re[b] * ci + im[b] * cr;
        re[b] = re[a] - br;
        im[b] = im[a] - bi;
        re[a] += br;
        im[a] += bi;
        const next = cr * wr - ci * wi;
        ci = cr * wi + ci * wr;
        cr = next;
      }
    }
  }
}

const windows = new Map<number, Float64Array>();

function hann(size: number): Float64Array {
  const cached = windows.get(size);
  if (cached) return cached;
  const w = new Float64Array(size);
  for (let i = 0; i < size; i++) w[i] = 0.5 - 0.5 * Math.cos((2 * Math.PI * i) / (size - 1));
  windows.set(size, w);
  return w;
}

function spectrum(samples: Float32Array, center: number, size: number): Float64Array {
  const re = new Float64Array(size);
  const im = new Float64Array(size);
  const w = hann(size);
  const begin = center - size / 2;
  for (let i = 0; i < size; i++) {
    const index = begin + i;
    re[i] = index >= 0 && index < samples.length ? samples[index] * w[i] : 0;
  }
  fft(re, im);
  const mags = new Float64Array(size / 2 + 1);
  for (let i = 0; i <= size / 2; i++) mags[i] = Math.hypot(re[i], im[i]) / (size / 4);
  return mags;
}

const MAGMA: readonly (readonly [number, number, number])[] = [
  [0, 0, 4],
  [28, 16, 68],
  [79, 18, 123],
  [129, 37, 129],
  [181, 54, 122],
  [229, 80, 100],
  [251, 135, 97],
  [254, 194, 135],
  [252, 253, 191],
];

function color(level: number): string {
  const scaled = Math.max(0, Math.min(1, level)) * (MAGMA.length - 1);
  const index = Math.min(MAGMA.length - 2, Math.floor(scaled));
  const mix = scaled - index;
  const [r, g, b] = MAGMA[index].map((c, k) => Math.round(c + (MAGMA[index + 1][k] - c) * mix));
  return `rgb(${r},${g},${b})`;
}

const F_MIN = 60;
const F_MAX = 10000;
const ROWS = 128;
const ROW_PX = 2;
const COL_PX = 2;
const DB_FLOOR = -92;
const DB_CEIL = -8;
const LEVELS = 40;
const MARGIN_LEFT = 46;
const MARGIN_RIGHT = 12;
const TITLE_H = 24;
const SPEC_H = ROWS * ROW_PX;
const WAVE_H = 72;
const AXIS_H = 20;
const IMAGE_H = TITLE_H + SPEC_H + WAVE_H + AXIS_H;

function rowFrequency(row: number): [number, number] {
  const ratio = F_MAX / F_MIN;
  const top = F_MIN * ratio ** ((ROWS - row) / ROWS);
  const bottom = F_MIN * ratio ** ((ROWS - row - 1) / ROWS);
  return [bottom, top];
}

function frequencyY(freq: number): number {
  return TITLE_H + SPEC_H * (1 - Math.log(freq / F_MIN) / Math.log(F_MAX / F_MIN));
}

function spectrogramSvg(sound: Sound, rendered: Rendered, report: Report): string {
  const mono = mixDown(rendered);
  const pxPerSecond = PIXELS_PER_SECOND[sound.kind];
  const viewStart = START - 0.05;
  const viewEnd = START + rendered.duration + 0.1;
  const status = report.problems.length ? 'FAIL' : 'PASS';
  const title = `${sound.id}  ${rendered.duration.toFixed(2)}S  PEAK ${report.peak.toFixed(2)}  RMS ${report.rms.toFixed(3)}  ${status}`;
  const plotW = Math.ceil(((viewEnd - viewStart) * pxPerSecond) / COL_PX) * COL_PX;
  const width = Math.max(MARGIN_LEFT + plotW + MARGIN_RIGHT, title.length * 12 + 20);
  const columns = plotW / COL_PX;
  const parts: string[] = [
    `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${IMAGE_H}" viewBox="0 0 ${width} ${IMAGE_H}" shape-rendering="crispEdges">`,
    `<rect width="${width}" height="${IMAGE_H}" fill="#14161c"/>`,
    `<rect x="${MARGIN_LEFT}" y="${TITLE_H}" width="${plotW}" height="${SPEC_H}" fill="${color(0)}"/>`,
  ];
  const sizes = [4096, 2048, 1024];
  const rowSize = Array.from({ length: ROWS }, (_, row) => {
    const [bottom, top] = rowFrequency(row);
    const center = Math.sqrt(bottom * top);
    return center < 300 ? 4096 : center < 1500 ? 2048 : 1024;
  });
  for (let c = 0; c < columns; c++) {
    const time = viewStart + ((c + 0.5) * COL_PX) / pxPerSecond;
    const center = Math.round(time * SAMPLE_RATE);
    const spectra = new Map(sizes.map((size) => [size, spectrum(mono, center, size)]));
    let runStart = 0;
    let runLevel = -1;
    const flush = (end: number) => {
      if (runLevel > 0) {
        parts.push(
          `<rect x="${MARGIN_LEFT + c * COL_PX}" y="${TITLE_H + runStart * ROW_PX}" width="${COL_PX}" height="${(end - runStart) * ROW_PX}" fill="${color(runLevel / LEVELS)}"/>`,
        );
      }
    };
    for (let row = 0; row < ROWS; row++) {
      const size = rowSize[row];
      const mags = spectra.get(size)!;
      const binHz = SAMPLE_RATE / size;
      const [bottom, top] = rowFrequency(row);
      const lo = Math.max(0, Math.floor(bottom / binHz));
      const hi = Math.min(mags.length - 1, Math.max(lo, Math.ceil(top / binHz)));
      let mag = 0;
      for (let b = lo; b <= hi; b++) mag = Math.max(mag, mags[b]);
      const db = 20 * Math.log10(Math.max(mag, 1e-9));
      const level = Math.round(
        Math.max(0, Math.min(1, (db - DB_FLOOR) / (DB_CEIL - DB_FLOOR))) * LEVELS,
      );
      if (level !== runLevel) {
        flush(row);
        runStart = row;
        runLevel = level;
      }
    }
    flush(ROWS);
  }
  for (const freq of [100, 200, 500, 1000, 2000, 5000, 10000]) {
    const y = Math.round(frequencyY(freq));
    parts.push(
      `<rect x="${MARGIN_LEFT}" y="${y}" width="${plotW}" height="1" fill="#ffffff" fill-opacity="0.18"/>`,
    );
    const label = freq >= 1000 ? `${freq / 1000}K` : `${freq}`;
    parts.push(text(label, 4, Math.min(y - 3, TITLE_H + SPEC_H - 9), 1, '#b8c0d0'));
  }
  const waveTop = TITLE_H + SPEC_H;
  const mid = waveTop + WAVE_H / 2;
  parts.push(
    `<rect x="${MARGIN_LEFT}" y="${waveTop}" width="${plotW}" height="${WAVE_H}" fill="#1d2230"/>`,
  );
  parts.push(`<rect x="${MARGIN_LEFT}" y="${mid}" width="${plotW}" height="1" fill="#3a4258"/>`);
  for (let x = 0; x < plotW; x++) {
    const from = Math.max(0, Math.floor((viewStart + x / pxPerSecond) * SAMPLE_RATE));
    const to = Math.min(mono.length, Math.floor((viewStart + (x + 1) / pxPerSecond) * SAMPLE_RATE));
    let low = 0;
    let high = 0;
    for (let i = from; i < to; i++) {
      low = Math.min(low, mono[i]);
      high = Math.max(high, mono[i]);
    }
    const y1 = mid - high * (WAVE_H / 2 - 2);
    const y2 = mid - low * (WAVE_H / 2 - 2);
    if (y2 - y1 > 0.5) {
      parts.push(
        `<rect x="${MARGIN_LEFT + x}" y="${y1.toFixed(1)}" width="1" height="${(y2 - y1).toFixed(1)}" fill="#7fd4ff"/>`,
      );
    }
  }
  const markX = (t: number) => MARGIN_LEFT + Math.round((t - viewStart) * pxPerSecond);
  parts.push(
    `<rect x="${markX(START)}" y="${TITLE_H}" width="1" height="${SPEC_H + WAVE_H}" fill="#7dff9a" fill-opacity="0.7"/>`,
  );
  parts.push(
    `<rect x="${markX(START + rendered.duration)}" y="${TITLE_H}" width="1" height="${SPEC_H + WAVE_H}" fill="#ff6b6b" fill-opacity="0.8"/>`,
  );
  const tickStep = sound.kind === 'animal' ? 0.1 : 0.05;
  const labelEvery = sound.kind === 'animal' ? 5 : 2;
  for (let k = 0; START + k * tickStep <= viewEnd + 1e-9; k++) {
    const x = markX(START + k * tickStep);
    const major = k % labelEvery === 0;
    parts.push(
      `<rect x="${x}" y="${waveTop + WAVE_H}" width="1" height="${major ? 6 : 3}" fill="#b8c0d0"/>`,
    );
    if (major)
      parts.push(
        text(
          (k * tickStep).toFixed(sound.kind === 'animal' ? 1 : 2),
          x + 2,
          waveTop + WAVE_H + 8,
          1,
          '#b8c0d0',
        ),
      );
  }
  parts.push(text(title, 8, 6, 2, report.problems.length ? '#ff8a8a' : '#e8ecf4'));
  parts.push('</svg>');
  return parts.join('');
}

function mixDown(rendered: Rendered): Float32Array {
  const mono = new Float32Array(rendered.channels[0].length);
  rendered.channels.forEach((data) => {
    for (let i = 0; i < data.length; i++) mono[i] += data[i] / rendered.channels.length;
  });
  return mono;
}

function pitchAt(samples: Float32Array, center: number): number {
  const size = 2048;
  const minLag = Math.floor(SAMPLE_RATE / 2200);
  const maxLag = Math.floor(SAMPLE_RATE / 45);
  const begin = center - size / 2;
  if (begin < 0 || begin + size + maxLag >= samples.length) return 0;
  const diff = new Float64Array(maxLag + 1);
  for (let lag = 1; lag <= maxLag; lag++) {
    let sum = 0;
    for (let i = 0; i < size; i++) {
      const d = samples[begin + i] - samples[begin + i + lag];
      sum += d * d;
    }
    diff[lag] = sum;
  }
  let running = 0;
  for (let lag = 1; lag <= maxLag; lag++) {
    running += diff[lag];
    const normalized = running > 0 ? (diff[lag] * lag) / running : 1;
    if (lag >= minLag && normalized < 0.2) {
      let best = lag;
      while (best + 1 <= maxLag && diff[best + 1] < diff[best]) best++;
      const a = diff[best - 1];
      const b = diff[best];
      const c = diff[Math.min(maxLag, best + 1)];
      const shift = (a - c) / (2 * (a - 2 * b + c) || 1);
      return SAMPLE_RATE / (best + shift);
    }
  }
  return 0;
}

function describe(sound: Sound, rendered: Rendered): string {
  const mono = mixDown(rendered);
  const rows: string[] = [`  ${sound.id}: t(s)  level(dB)  f0(Hz)  centroid(Hz)`];
  const step = sound.kind === 'animal' ? 0.05 : 0.02;
  for (let t = 0; t <= rendered.duration + 1e-9; t += step) {
    const center = Math.round((START + t) * SAMPLE_RATE);
    let energy = 0;
    for (let i = center - 512; i < center + 512; i++) energy += (mono[i] ?? 0) ** 2;
    const db = 10 * Math.log10(energy / 1024 + 1e-12);
    if (db < -60) {
      rows.push(`    ${t.toFixed(2)}  ${db.toFixed(0).padStart(4)}`);
      continue;
    }
    const mags = spectrum(mono, center, 2048);
    let weighted = 0;
    let total = 0;
    for (let b = 3; b < mags.length; b++) {
      const freq = (b * SAMPLE_RATE) / 2048;
      if (freq > F_MAX) break;
      weighted += freq * mags[b];
      total += mags[b];
    }
    const f0 = pitchAt(mono, center);
    rows.push(
      `    ${t.toFixed(2)}  ${db.toFixed(0).padStart(4)}  ${(f0 ? f0.toFixed(0) : '-').padStart(6)}  ${(total ? weighted / total : 0).toFixed(0).padStart(6)}`,
    );
  }
  return rows.join('\n');
}

function rasterize(svg: string): Buffer {
  return new Resvg(svg, { font: { loadSystemFonts: false } }).render().asPng();
}

interface Tile {
  png: Buffer;
  width: number;
}

function contactSheet(tiles: Tile[]): string {
  const scale = 0.5;
  const columns = 3;
  const slotW = Math.ceil(Math.max(...tiles.map((t) => t.width)) * scale) + 16;
  const slotH = Math.ceil(IMAGE_H * scale) + 12;
  const rows = Math.ceil(tiles.length / columns);
  const width = slotW * columns + 16;
  const height = slotH * rows + 16;
  const parts = [
    `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">`,
    `<rect width="${width}" height="${height}" fill="#0b0c10"/>`,
  ];
  tiles.forEach((tile, index) => {
    const x = 16 + (index % columns) * slotW;
    const y = 16 + Math.floor(index / columns) * slotH;
    const href = `data:image/png;base64,${tile.png.toString('base64')}`;
    parts.push(
      `<image x="${x}" y="${y}" width="${tile.width * scale}" height="${IMAGE_H * scale}" href="${href}" preserveAspectRatio="none"/>`,
    );
  });
  parts.push('</svg>');
  return parts.join('');
}

function cell(value: string, size: number): string {
  return value.length >= size ? value : value + ' '.repeat(size - value.length);
}

async function main(): Promise<void> {
  mkdirSync(outDir, { recursive: true });
  const sounds = await loadSounds();
  if (sounds.length === 0) {
    console.error('no sounds matched');
    process.exitCode = 1;
    return;
  }
  const variants = quick ? VARIANTS.slice(0, 1) : VARIANTS;
  const reports: Report[] = [];
  const tiles: Tile[] = [];
  const nominals: Rendered[] = [];
  for (const sound of sounds) {
    const renders: Rendered[] = [];
    for (const [name, factory] of variants) renders.push(await render(sound, name, factory()));
    const report = inspect(sound, renders);
    reports.push(report);
    const nominal = renders[0];
    nominals.push(nominal);
    if (!nominal.error) {
      const from = Math.round(START * SAMPLE_RATE);
      const to = Math.min(
        nominal.channels[0].length,
        Math.round((START + nominal.duration + 0.05) * SAMPLE_RATE),
      );
      writeFileSync(resolve(outDir, `${sound.id}.wav`), encodeWav(nominal.channels, from, to));
      const svg = spectrogramSvg(sound, nominal, report);
      const png = rasterize(svg);
      writeFileSync(resolve(outDir, `${sound.id}.png`), png);
      const width = Number(/width="(\d+)"/.exec(svg)?.[1] ?? 0);
      tiles.push({ png, width });
    }
  }
  if ((filters.length === 0 || wantSheet) && tiles.length > 0) {
    writeFileSync(resolve(outDir, '_sheet.png'), rasterize(contactSheet(tiles)));
  }
  const header = `${cell('id', 18)}${cell('dur(s)', 8)}${cell('peak', 7)}${cell('rms', 7)}${cell('nodes', 7)}${cell('ms', 6)}result`;
  console.log(header);
  console.log('-'.repeat(header.length + 20));
  for (const r of reports) {
    const result = r.problems.length ? `FAIL ${r.problems.join('; ')}` : 'PASS';
    const notes = r.warnings.length ? `  (${r.warnings.join('; ')})` : '';
    console.log(
      `${cell(r.sound.id, 18)}${cell(r.duration.toFixed(3), 8)}${cell(r.peak.toFixed(3), 7)}${cell(r.rms.toFixed(3), 7)}${cell(String(r.nodes), 7)}${cell(r.ms.toFixed(0), 6)}${result}${notes}`,
    );
  }
  if (detail) {
    for (const [index, r] of reports.entries()) {
      const rendered = nominals[index];
      if (rendered && !rendered.error) console.log(describe(r.sound, rendered));
    }
  }
  const failed = reports.filter((r) => r.problems.length > 0).length;
  console.log(
    `\n${reports.length - failed}/${reports.length} passed (${variants.length} variant${variants.length > 1 ? 's' : ''} each${raw ? ', limiter bypassed' : ''}) -> ${outDir}`,
  );
  if (failed > 0) process.exitCode = 1;
}

await main();
