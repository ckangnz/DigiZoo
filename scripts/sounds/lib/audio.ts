import { readFileSync } from 'node:fs';
import { OfflineAudioContext } from 'node-web-audio-api';

export const SR = 44100;

interface Box {
  type: string;
  start: number;
  size: number;
  header: number;
}

function boxes(view: DataView, from: number, to: number): Box[] {
  const out: Box[] = [];
  let offset = from;
  while (offset + 8 <= to) {
    let size = view.getUint32(offset);
    const type = String.fromCharCode(
      view.getUint8(offset + 4),
      view.getUint8(offset + 5),
      view.getUint8(offset + 6),
      view.getUint8(offset + 7),
    );
    let header = 8;
    if (size === 1) {
      size = Number(view.getBigUint64(offset + 8));
      header = 16;
    } else if (size === 0) {
      size = to - offset;
    }
    if (size < header || offset + size > to) break;
    out.push({ type, start: offset, size, header });
    offset += size;
  }
  return out;
}

const CONTAINERS = new Set(['moov', 'trak', 'mdia', 'minf', 'stbl']);

function shiftChunkOffsets(view: DataView, box: Box, shift: number): void {
  for (const child of boxes(view, box.start + box.header, box.start + box.size)) {
    if (CONTAINERS.has(child.type)) shiftChunkOffsets(view, child, shift);
    const body = child.start + child.header;
    if (child.type === 'stco') {
      const count = view.getUint32(body + 4);
      for (let i = 0; i < count; i++) {
        const at = body + 8 + i * 4;
        view.setUint32(at, view.getUint32(at) + shift);
      }
    } else if (child.type === 'co64') {
      const count = view.getUint32(body + 4);
      for (let i = 0; i < count; i++) {
        const at = body + 8 + i * 8;
        view.setBigUint64(at, view.getBigUint64(at) + BigInt(shift));
      }
    }
  }
}

export function faststart(bytes: Uint8Array): Uint8Array | null {
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  const top = boxes(view, 0, bytes.byteLength);
  const moov = top.find((b) => b.type === 'moov');
  const mdat = top.find((b) => b.type === 'mdat');
  if (!moov || !mdat || moov.start < mdat.start || top[0]?.type !== 'ftyp') return null;
  const movedMoov = bytes.slice(moov.start, moov.start + moov.size);
  const moovView = new DataView(movedMoov.buffer);
  shiftChunkOffsets(moovView, { ...moov, start: 0 }, moov.size);
  const parts = [bytes.subarray(top[0].start, top[0].start + top[0].size), movedMoov];
  for (const box of top.slice(1)) {
    if (box !== moov) parts.push(bytes.subarray(box.start, box.start + box.size));
  }
  const out = new Uint8Array(parts.reduce((sum, part) => sum + part.length, 0));
  let offset = 0;
  for (const part of parts) {
    out.set(part, offset);
    offset += part.length;
  }
  return out;
}

function child(view: DataView, box: Box, type: string): Box | undefined {
  return boxes(view, box.start + box.header, box.start + box.size).find((b) => b.type === type);
}

function descriptor(bytes: Uint8Array, offset: number): { tag: number; body: number; end: number } {
  const tag = bytes[offset];
  let length = 0;
  let cursor = offset + 1;
  for (let i = 0; i < 4; i++) {
    const byte = bytes[cursor++];
    length = (length << 7) | (byte & 0x7f);
    if (!(byte & 0x80)) break;
  }
  return { tag, body: cursor, end: cursor + length };
}

function audioSpecificConfig(bytes: Uint8Array, esdsBody: number): Uint8Array | null {
  const es = descriptor(bytes, esdsBody + 4);
  if (es.tag !== 3) return null;
  const flags = bytes[es.body + 2];
  let cursor = es.body + 3;
  if (flags & 0x80) cursor += 2;
  if (flags & 0x40) cursor += 1 + bytes[cursor];
  if (flags & 0x20) cursor += 2;
  const config = descriptor(bytes, cursor);
  if (config.tag !== 4) return null;
  const specific = descriptor(bytes, config.body + 13);
  if (specific.tag !== 5) return null;
  return bytes.subarray(specific.body, specific.end);
}

function chunkOffsets(view: DataView, stbl: Box): number[] {
  const stco = child(view, stbl, 'stco') ?? child(view, stbl, 'co64');
  if (!stco) return [];
  const body = stco.start + stco.header;
  const count = view.getUint32(body + 4);
  return Array.from({ length: count }, (_, i) =>
    stco.type === 'co64'
      ? Number(view.getBigUint64(body + 8 + i * 8))
      : view.getUint32(body + 8 + i * 4),
  );
}

interface Track {
  handler: string;
  stbl: Box;
}

function tracks(view: DataView, moov: Box): Track[] {
  const out: Track[] = [];
  for (const trak of boxes(view, moov.start + moov.header, moov.start + moov.size)) {
    if (trak.type !== 'trak') continue;
    const mdia = child(view, trak, 'mdia');
    const hdlr = mdia && child(view, mdia, 'hdlr');
    const minf = mdia && child(view, mdia, 'minf');
    const stbl = minf && child(view, minf, 'stbl');
    if (!hdlr || !stbl) continue;
    const handler = String.fromCharCode(
      view.getUint8(hdlr.start + 16),
      view.getUint8(hdlr.start + 17),
      view.getUint8(hdlr.start + 18),
      view.getUint8(hdlr.start + 19),
    );
    out.push({ handler, stbl });
  }
  return out;
}

function concat(parts: Uint8Array[]): Uint8Array {
  const out = new Uint8Array(parts.reduce((sum, part) => sum + part.length, 0));
  let cursor = 0;
  for (const part of parts) {
    out.set(part, cursor);
    cursor += part.length;
  }
  return out;
}

export function mp4AudioStream(bytes: Uint8Array): Uint8Array | null {
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  const top = boxes(view, 0, bytes.byteLength);
  const moov = top.find((b) => b.type === 'moov');
  const mdat = top.find((b) => b.type === 'mdat');
  if (!moov || !mdat) return null;
  const all = tracks(view, moov);
  const sound = all.find((t) => t.handler === 'soun');
  if (!sound) return null;
  const stsd = child(view, sound.stbl, 'stsd');
  if (!stsd) return null;
  const entry = String.fromCharCode(...bytes.subarray(stsd.start + 20, stsd.start + 24));
  const offsets = chunkOffsets(view, sound.stbl);
  if (entry !== 'mp4a') {
    const boundaries = [
      ...new Set([...all.flatMap((t) => chunkOffsets(view, t.stbl)), mdat.start + mdat.size]),
    ].sort((a, b) => a - b);
    const parts = offsets.map((offset) => {
      const next = boundaries.find((b) => b > offset) ?? mdat.start + mdat.size;
      return bytes.subarray(offset, next);
    });
    return concat(parts);
  }
  let esds = -1;
  for (let i = stsd.start; i + 4 <= stsd.start + stsd.size; i++) {
    if (
      bytes[i] === 0x65 &&
      bytes[i + 1] === 0x73 &&
      bytes[i + 2] === 0x64 &&
      bytes[i + 3] === 0x73
    ) {
      esds = i + 4;
      break;
    }
  }
  const asc = esds >= 0 ? audioSpecificConfig(bytes, esds) : null;
  const stsz = child(view, sound.stbl, 'stsz');
  const stsc = child(view, sound.stbl, 'stsc');
  if (!asc || asc.length < 2 || !stsz || !stsc) return null;
  const objectType = asc[0] >> 3;
  const frequencyIndex = ((asc[0] & 7) << 1) | (asc[1] >> 7);
  const channels = (asc[1] >> 3) & 15;
  if (objectType < 1 || objectType > 4 || frequencyIndex > 12) return null;
  const sizesBody = stsz.start + stsz.header;
  const uniform = view.getUint32(sizesBody + 4);
  const sampleCount = view.getUint32(sizesBody + 8);
  const sizeOf = (i: number) => uniform || view.getUint32(sizesBody + 12 + i * 4);
  const runsBody = stsc.start + stsc.header;
  const runCount = view.getUint32(runsBody + 4);
  const runs = Array.from({ length: runCount }, (_, i) => ({
    first: view.getUint32(runsBody + 8 + i * 12),
    perChunk: view.getUint32(runsBody + 12 + i * 12),
  }));
  const frames: Uint8Array[] = [];
  let sample = 0;
  for (let chunk = 0; chunk < offsets.length && sample < sampleCount; chunk++) {
    let perChunk = runs[0]?.perChunk ?? 1;
    for (const run of runs) if (run.first - 1 <= chunk) perChunk = run.perChunk;
    let offset = offsets[chunk];
    for (let k = 0; k < perChunk && sample < sampleCount; k++, sample++) {
      const size = sizeOf(sample);
      if (offset + size > bytes.byteLength) return null;
      const length = 7 + size;
      const frame = new Uint8Array(length);
      frame[0] = 0xff;
      frame[1] = 0xf1;
      frame[2] = ((objectType - 1) << 6) | (frequencyIndex << 2) | (channels >> 2);
      frame[3] = ((channels & 3) << 6) | (length >> 11);
      frame[4] = (length >> 3) & 0xff;
      frame[5] = ((length & 7) << 5) | 0x1f;
      frame[6] = 0xfc;
      frame.set(bytes.subarray(offset, offset + size), 7);
      frames.push(frame);
      offset += size;
    }
  }
  return concat(frames);
}

async function decodeRaw(bytes: Uint8Array) {
  const ctx = new OfflineAudioContext({ numberOfChannels: 1, length: 1, sampleRate: SR });
  const copy = bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength);
  return ctx.decodeAudioData(copy as ArrayBuffer);
}

export async function decodeBytes(bytes: Uint8Array): Promise<Float32Array[]> {
  let buffer;
  try {
    buffer = await decodeRaw(bytes);
  } catch (error) {
    if (!/isomp4/i.test(String(error))) throw error;
    const remuxed = faststart(bytes);
    const stream = mp4AudioStream(remuxed ?? bytes);
    if (!stream) throw error;
    buffer = await decodeRaw(stream);
  }
  const channels: Float32Array[] = [];
  for (let c = 0; c < buffer.numberOfChannels; c++) {
    channels.push(Float32Array.from(buffer.getChannelData(c)));
  }
  return channels;
}

export async function decodeFile(path: string): Promise<Float32Array[]> {
  return decodeBytes(readFileSync(path));
}

export type ChannelMode = 'mix' | 'left' | 'right' | 'best';

export function toMono(channels: Float32Array[], mode: ChannelMode = 'mix'): Float32Array {
  if (channels.length === 1) return Float32Array.from(channels[0]);
  if (mode === 'left') return Float32Array.from(channels[0]);
  if (mode === 'right') return Float32Array.from(channels[1]);
  if (mode === 'best') {
    let best = channels[0];
    let bestScore = -Infinity;
    for (const channel of channels) {
      const score = dynamicRange(channel);
      if (score > bestScore) {
        bestScore = score;
        best = channel;
      }
    }
    return Float32Array.from(best);
  }
  const out = new Float32Array(channels[0].length);
  for (const channel of channels) {
    for (let i = 0; i < out.length; i++) out[i] += channel[i] / channels.length;
  }
  return out;
}

function dynamicRange(x: Float32Array): number {
  const env = envelopeDb(x, 0.02, 0.01);
  const sorted = [...env].sort((a, b) => a - b);
  return sorted[Math.floor(sorted.length * 0.98)] - sorted[Math.floor(sorted.length * 0.15)];
}

export function slice(x: Float32Array, start: number, end: number): Float32Array {
  const from = Math.max(0, Math.round(start * SR));
  const to = Math.min(x.length, Math.round(end * SR));
  return x.slice(from, Math.max(from, to));
}

type BiquadType = 'lowpass' | 'highpass' | 'peaking' | 'lowshelf' | 'highshelf' | 'bandpass';

export function biquad(
  x: Float32Array,
  type: BiquadType,
  freq: number,
  q = Math.SQRT1_2,
  gainDb = 0,
): Float32Array {
  const w0 = (2 * Math.PI * Math.min(freq, SR * 0.49)) / SR;
  const cos = Math.cos(w0);
  const sin = Math.sin(w0);
  const alpha = sin / (2 * q);
  const amp = 10 ** (gainDb / 40);
  let b0: number, b1: number, b2: number, a0: number, a1: number, a2: number;
  switch (type) {
    case 'lowpass':
      b0 = (1 - cos) / 2;
      b1 = 1 - cos;
      b2 = (1 - cos) / 2;
      a0 = 1 + alpha;
      a1 = -2 * cos;
      a2 = 1 - alpha;
      break;
    case 'highpass':
      b0 = (1 + cos) / 2;
      b1 = -(1 + cos);
      b2 = (1 + cos) / 2;
      a0 = 1 + alpha;
      a1 = -2 * cos;
      a2 = 1 - alpha;
      break;
    case 'bandpass':
      b0 = alpha;
      b1 = 0;
      b2 = -alpha;
      a0 = 1 + alpha;
      a1 = -2 * cos;
      a2 = 1 - alpha;
      break;
    case 'peaking':
      b0 = 1 + alpha * amp;
      b1 = -2 * cos;
      b2 = 1 - alpha * amp;
      a0 = 1 + alpha / amp;
      a1 = -2 * cos;
      a2 = 1 - alpha / amp;
      break;
    case 'lowshelf': {
      const s = 2 * Math.sqrt(amp) * alpha;
      b0 = amp * (amp + 1 - (amp - 1) * cos + s);
      b1 = 2 * amp * (amp - 1 - (amp + 1) * cos);
      b2 = amp * (amp + 1 - (amp - 1) * cos - s);
      a0 = amp + 1 + (amp - 1) * cos + s;
      a1 = -2 * (amp - 1 + (amp + 1) * cos);
      a2 = amp + 1 + (amp - 1) * cos - s;
      break;
    }
    case 'highshelf': {
      const s = 2 * Math.sqrt(amp) * alpha;
      b0 = amp * (amp + 1 + (amp - 1) * cos + s);
      b1 = -2 * amp * (amp - 1 + (amp + 1) * cos);
      b2 = amp * (amp + 1 + (amp - 1) * cos - s);
      a0 = amp + 1 - (amp - 1) * cos + s;
      a1 = 2 * (amp - 1 - (amp + 1) * cos);
      a2 = amp + 1 - (amp - 1) * cos - s;
      break;
    }
  }
  const out = new Float32Array(x.length);
  const nb0 = b0 / a0;
  const nb1 = b1 / a0;
  const nb2 = b2 / a0;
  const na1 = a1 / a0;
  const na2 = a2 / a0;
  let z1 = 0;
  let z2 = 0;
  for (let i = 0; i < x.length; i++) {
    const input = x[i];
    const y = nb0 * input + z1;
    z1 = nb1 * input - na1 * y + z2;
    z2 = nb2 * input - na2 * y;
    out[i] = y;
  }
  return out;
}

const BUTTERWORTH_4 = [0.5411961, 1.306563];

export function highpass(x: Float32Array, freq: number): Float32Array {
  return BUTTERWORTH_4.reduce((signal, q) => biquad(signal, 'highpass', freq, q), x);
}

export function lowpass(x: Float32Array, freq: number): Float32Array {
  return BUTTERWORTH_4.reduce((signal, q) => biquad(signal, 'lowpass', freq, q), x);
}

function besselI0(value: number): number {
  let sum = 1;
  let term = 1;
  for (let k = 1; k < 40; k++) {
    term *= (value / (2 * k)) ** 2;
    sum += term;
    if (term < 1e-12 * sum) break;
  }
  return sum;
}

export function resample(x: Float32Array, rate: number): Float32Array {
  if (Math.abs(rate - 1) < 1e-9) return Float32Array.from(x);
  const outLength = Math.floor(x.length / rate);
  const out = new Float32Array(outLength);
  const cutoff = Math.min(1, 1 / rate) * 0.97;
  const half = Math.ceil(16 / cutoff);
  const beta = 8;
  const norm = besselI0(beta);
  for (let j = 0; j < outLength; j++) {
    const pos = j * rate;
    const center = Math.floor(pos);
    let acc = 0;
    for (let k = center - half + 1; k <= center + half; k++) {
      if (k < 0 || k >= x.length) continue;
      const d = pos - k;
      const ratio = d / half;
      if (Math.abs(ratio) >= 1) continue;
      const window = besselI0(beta * Math.sqrt(1 - ratio * ratio)) / norm;
      const arg = Math.PI * d * cutoff;
      const sinc = Math.abs(arg) < 1e-9 ? 1 : Math.sin(arg) / arg;
      acc += x[k] * cutoff * sinc * window;
    }
    out[j] = acc;
  }
  return out;
}

export function stretch(x: Float32Array, factor: number): Float32Array {
  if (Math.abs(factor - 1) < 1e-9) return Float32Array.from(x);
  const frame = Math.round(0.046 * SR);
  const hopOut = Math.round(frame / 4);
  const hopIn = hopOut / factor;
  const tolerance = Math.round(0.012 * SR);
  const window = new Float32Array(frame);
  for (let i = 0; i < frame; i++) window[i] = 0.5 - 0.5 * Math.cos((2 * Math.PI * i) / frame);
  const outLength = Math.floor(x.length * factor);
  const out = new Float32Array(outLength + frame);
  const weight = new Float32Array(outLength + frame);
  let previous = 0;
  for (let k = 0; k * hopOut < outLength; k++) {
    const nominal = Math.round(k * hopIn);
    let best = nominal;
    if (k > 0) {
      const target = previous + hopOut;
      let bestScore = -Infinity;
      for (let delta = -tolerance; delta <= tolerance; delta += 2) {
        const candidate = nominal + delta;
        if (candidate < 0 || candidate + frame >= x.length) continue;
        let score = 0;
        for (let i = 0; i < frame; i += 4) {
          const a = target + i < x.length ? x[target + i] : 0;
          score += a * x[candidate + i];
        }
        if (score > bestScore) {
          bestScore = score;
          best = candidate;
        }
      }
    }
    if (best + frame >= x.length) best = Math.max(0, x.length - frame - 1);
    const at = k * hopOut;
    for (let i = 0; i < frame; i++) {
      out[at + i] += (x[best + i] ?? 0) * window[i];
      weight[at + i] += window[i];
    }
    previous = best;
  }
  const result = new Float32Array(outLength);
  for (let i = 0; i < outLength; i++) result[i] = weight[i] > 1e-3 ? out[i] / weight[i] : 0;
  return result;
}

export function reverse(x: Float32Array): Float32Array {
  return Float32Array.from(x).reverse();
}

export function peak(x: Float32Array): number {
  let max = 0;
  for (let i = 0; i < x.length; i++) {
    const v = Math.abs(x[i]);
    if (v > max) max = v;
  }
  return max;
}

export function db(value: number): number {
  return 20 * Math.log10(Math.max(value, 1e-9));
}

export function envelopeDb(x: Float32Array, frameSec: number, hopSec: number): Float64Array {
  const frame = Math.max(1, Math.round(frameSec * SR));
  const hop = Math.max(1, Math.round(hopSec * SR));
  const count = Math.max(1, Math.floor((x.length - frame) / hop) + 1);
  const out = new Float64Array(count);
  for (let f = 0; f < count; f++) {
    let sum = 0;
    const begin = f * hop;
    for (let i = begin; i < begin + frame && i < x.length; i++) sum += x[i] * x[i];
    out[f] = 10 * Math.log10(sum / frame + 1e-18);
  }
  return out;
}

export function gatedRmsDb(x: Float32Array, gateDb = 20): number {
  const frame = Math.round(0.05 * SR);
  const hop = Math.round(0.025 * SR);
  const powers: number[] = [];
  for (let begin = 0; begin + frame <= Math.max(frame, x.length); begin += hop) {
    let sum = 0;
    for (let i = begin; i < begin + frame; i++) sum += (x[i] ?? 0) ** 2;
    powers.push(sum / frame);
  }
  const loudest = Math.max(...powers, 1e-18);
  const gate = loudest * 10 ** (-gateDb / 10);
  const kept = powers.filter((p) => p >= gate);
  const mean = kept.reduce((a, b) => a + b, 0) / Math.max(1, kept.length);
  return 10 * Math.log10(mean + 1e-18);
}

export function scale(x: Float32Array, gain: number): Float32Array {
  const out = new Float32Array(x.length);
  for (let i = 0; i < x.length; i++) out[i] = x[i] * gain;
  return out;
}

export function limit(x: Float32Array, ceiling: number): Float32Array {
  const look = Math.max(1, Math.round(0.004 * SR));
  const n = x.length;
  const required = new Float32Array(n);
  for (let i = 0; i < n; i++) {
    const v = Math.abs(x[i]);
    required[i] = v > ceiling ? ceiling / v : 1;
  }
  const minimum = slidingMin(required, look);
  const width = 2 * look + 1;
  const prefix = new Float64Array(n + 2 * look + 1);
  for (let k = 0; k < n + 2 * look; k++) {
    const j = k - look;
    prefix[k + 1] = prefix[k] + (j < 0 || j >= n ? 1 : minimum[j]);
  }
  const release = Math.exp(-1 / (0.08 * SR));
  const out = new Float32Array(n);
  let gain = 1;
  for (let i = 0; i < n; i++) {
    const target = (prefix[i + width] - prefix[i]) / width;
    gain = target < gain ? target : target + (gain - target) * release;
    out[i] = x[i] * gain;
  }
  return out;
}

function slidingMin(values: Float32Array, radius: number): Float32Array {
  const n = values.length;
  const out = new Float32Array(n);
  const deque: number[] = [];
  let head = 0;
  for (let i = 0; i < n + radius; i++) {
    if (i < n) {
      while (deque.length > head && values[deque[deque.length - 1]] >= values[i]) deque.pop();
      deque.push(i);
    }
    const center = i - radius;
    if (center >= 0) {
      while (deque[head] < center - radius) head++;
      out[center] = values[deque[head]];
    }
  }
  return out;
}

export function fade(x: Float32Array, inSec: number, outSec: number): Float32Array {
  const out = Float32Array.from(x);
  const fadeIn = Math.min(out.length, Math.round(inSec * SR));
  const fadeOut = Math.min(out.length, Math.round(outSec * SR));
  for (let i = 0; i < fadeIn; i++) out[i] *= Math.sin((Math.PI / 2) * (i / fadeIn));
  for (let i = 0; i < fadeOut; i++) {
    const index = out.length - 1 - i;
    out[index] *= Math.sin((Math.PI / 2) * (i / fadeOut));
  }
  return out;
}

export function trimBounds(
  x: Float32Array,
  thresholdDb: number,
  padStart = 0.015,
  padEnd = 0.06,
): [number, number] {
  const env = envelopeDb(x, 0.01, 0.005);
  const loudest = Math.max(...env);
  const gate = loudest - thresholdDb;
  let first = 0;
  while (first < env.length - 1 && env[first] < gate) first++;
  let last = env.length - 1;
  while (last > first && env[last] < gate) last--;
  const hop = 0.005;
  const start = Math.max(0, first * hop - padStart);
  const end = Math.min(x.length / SR, last * hop + 0.01 + padEnd);
  return [start, end];
}

export function freeverb(
  x: Float32Array,
  room: number,
  damp: number,
  wet: number,
  tailSec: number,
): Float32Array {
  const combs = [1116, 1188, 1277, 1356, 1422, 1491, 1557, 1617];
  const allpasses = [556, 441, 341, 225];
  const feedback = room * 0.28 + 0.7;
  const damping = damp * 0.4;
  const length = x.length + Math.round(tailSec * SR);
  const input = new Float32Array(length);
  input.set(x);
  const wetOut = new Float32Array(length);
  for (const size of combs) {
    const buffer = new Float32Array(size);
    let index = 0;
    let store = 0;
    for (let i = 0; i < length; i++) {
      const output = buffer[index];
      store = output * (1 - damping) + store * damping;
      buffer[index] = input[i] * 0.015 + store * feedback;
      index = (index + 1) % size;
      wetOut[i] += output;
    }
  }
  for (const size of allpasses) {
    const buffer = new Float32Array(size);
    let index = 0;
    for (let i = 0; i < length; i++) {
      const buffered = buffer[index];
      const output = -wetOut[i] + buffered;
      buffer[index] = wetOut[i] + buffered * 0.5;
      index = (index + 1) % size;
      wetOut[i] = output;
    }
  }
  const out = new Float32Array(length);
  for (let i = 0; i < length; i++) out[i] = input[i] + wetOut[i] * wet * 3;
  return out;
}

const FFT_CACHE = new Map<number, { cos: Float64Array; sin: Float64Array }>();

export function fft(re: Float64Array, im: Float64Array): void {
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
  let table = FFT_CACHE.get(n);
  if (!table) {
    const cos = new Float64Array(n / 2);
    const sin = new Float64Array(n / 2);
    for (let k = 0; k < n / 2; k++) {
      cos[k] = Math.cos((-2 * Math.PI * k) / n);
      sin[k] = Math.sin((-2 * Math.PI * k) / n);
    }
    table = { cos, sin };
    FFT_CACHE.set(n, table);
  }
  for (let len = 2; len <= n; len <<= 1) {
    const half = len >> 1;
    const step = n / len;
    for (let i = 0; i < n; i += len) {
      for (let k = 0; k < half; k++) {
        const cr = table.cos[k * step];
        const ci = table.sin[k * step];
        const a = i + k;
        const b = a + half;
        const br = re[b] * cr - im[b] * ci;
        const bi = re[b] * ci + im[b] * cr;
        re[b] = re[a] - br;
        im[b] = im[a] - bi;
        re[a] += br;
        im[a] += bi;
      }
    }
  }
}

const HANN = new Map<number, Float64Array>();

export function hann(size: number): Float64Array {
  let w = HANN.get(size);
  if (!w) {
    w = new Float64Array(size);
    for (let i = 0; i < size; i++) w[i] = 0.5 - 0.5 * Math.cos((2 * Math.PI * i) / size);
    HANN.set(size, w);
  }
  return w;
}

export function magnitudes(x: Float32Array, center: number, size: number): Float64Array {
  const re = new Float64Array(size);
  const im = new Float64Array(size);
  const w = hann(size);
  const begin = center - size / 2;
  for (let i = 0; i < size; i++) {
    const index = begin + i;
    re[i] = index >= 0 && index < x.length ? x[index] * w[i] : 0;
  }
  fft(re, im);
  const mags = new Float64Array(size / 2 + 1);
  for (let i = 0; i <= size / 2; i++) mags[i] = Math.hypot(re[i], im[i]) / (size / 4);
  return mags;
}

export function denoise(
  x: Float32Array,
  noise: Float32Array,
  amount: number,
  floorDb = -24,
): Float32Array {
  const size = 2048;
  const hop = size / 4;
  const w = hann(size);
  const bins = size / 2 + 1;
  const profile = new Float64Array(bins);
  let frames = 0;
  for (let begin = 0; begin + size <= noise.length; begin += hop) {
    const re = new Float64Array(size);
    const im = new Float64Array(size);
    for (let i = 0; i < size; i++) re[i] = noise[begin + i] * w[i];
    fft(re, im);
    for (let b = 0; b < bins; b++) profile[b] += re[b] * re[b] + im[b] * im[b];
    frames++;
  }
  if (frames === 0) return Float32Array.from(x);
  for (let b = 0; b < bins; b++) profile[b] /= frames;
  const floor = 10 ** (floorDb / 20);
  const padded = new Float32Array(x.length + size * 2);
  padded.set(x, size);
  const out = new Float32Array(padded.length);
  const norm = new Float32Array(padded.length);
  const previousGain = new Float64Array(bins).fill(1);
  for (let begin = 0; begin + size <= padded.length; begin += hop) {
    const re = new Float64Array(size);
    const im = new Float64Array(size);
    for (let i = 0; i < size; i++) re[i] = padded[begin + i] * w[i];
    fft(re, im);
    for (let b = 0; b < bins; b++) {
      const power = re[b] * re[b] + im[b] * im[b];
      const noisePower = profile[b] * amount * 2.5;
      const raw = power > 0 ? Math.max(0, 1 - noisePower / power) : 0;
      const gain = Math.max(floor, Math.sqrt(raw));
      const smoothed = 0.6 * gain + 0.4 * previousGain[b];
      previousGain[b] = smoothed;
      re[b] *= smoothed;
      im[b] *= smoothed;
      if (b > 0 && b < size / 2) {
        re[size - b] = re[b];
        im[size - b] = -im[b];
      }
    }
    for (let i = 0; i < size; i++) im[i] = -im[i];
    fft(re, im);
    for (let i = 0; i < size; i++) {
      out[begin + i] += (re[i] / size) * w[i];
      norm[begin + i] += w[i] * w[i];
    }
  }
  const result = new Float32Array(x.length);
  for (let i = 0; i < x.length; i++) {
    const n = norm[i + size];
    result[i] = n > 1e-6 ? out[i + size] / n : 0;
  }
  return result;
}

export function pitchAt(x: Float32Array, center: number): number {
  const size = 2048;
  const minLag = Math.floor(SR / 3000);
  const maxLag = Math.floor(SR / 40);
  const begin = center - size / 2;
  if (begin < 0 || begin + size + maxLag >= x.length) return 0;
  const diff = new Float64Array(maxLag + 1);
  for (let lag = 1; lag <= maxLag; lag++) {
    let sum = 0;
    for (let i = 0; i < size; i += 2) {
      const d = x[begin + i] - x[begin + i + lag];
      sum += d * d;
    }
    diff[lag] = sum;
  }
  let running = 0;
  for (let lag = 1; lag <= maxLag; lag++) {
    running += diff[lag];
    const normalized = running > 0 ? (diff[lag] * lag) / running : 1;
    if (lag >= minLag && normalized < 0.15) {
      let best = lag;
      while (best + 1 <= maxLag && diff[best + 1] < diff[best]) best++;
      return SR / best;
    }
  }
  return 0;
}

export function centroid(x: Float32Array, center: number): number {
  const size = 2048;
  const mags = magnitudes(x, center, size);
  let weighted = 0;
  let total = 0;
  for (let b = 2; b < mags.length; b++) {
    const freq = (b * SR) / size;
    weighted += freq * mags[b];
    total += mags[b];
  }
  return total > 0 ? weighted / total : 0;
}

export interface AudioEvent {
  start: number;
  end: number;
  peakDb: number;
  rmsDb: number;
  snrDb: number;
  f0: number;
  centroid: number;
  score: number;
}

export function detectEvents(
  x: Float32Array,
  options: { mergeGap?: number; minDuration?: number; rangeDb?: number } = {},
): { floorDb: number; events: AudioEvent[] } {
  const hop = 0.01;
  const env = envelopeDb(x, 0.02, hop);
  const sorted = [...env].sort((a, b) => a - b);
  const floorDb = sorted[Math.floor(sorted.length * 0.15)] ?? -120;
  const loudest = sorted[sorted.length - 1] ?? -120;
  const threshold = Math.max(floorDb + 9, loudest - (options.rangeDb ?? 38));
  const mergeGap = options.mergeGap ?? 0.12;
  const minDuration = options.minDuration ?? 0.04;
  const regions: [number, number][] = [];
  let open = -1;
  for (let f = 0; f <= env.length; f++) {
    const above = f < env.length && env[f] >= threshold;
    if (above && open < 0) open = f;
    if (!above && open >= 0) {
      regions.push([open * hop, f * hop + 0.02]);
      open = -1;
    }
  }
  const merged: [number, number][] = [];
  for (const region of regions) {
    const last = merged[merged.length - 1];
    if (last && region[0] - last[1] < mergeGap) last[1] = region[1];
    else merged.push([...region]);
  }
  const events: AudioEvent[] = [];
  for (const [start, end] of merged) {
    if (end - start < minDuration) continue;
    const part = slice(x, start, end);
    const rms = Math.sqrt(part.reduce((sum, v) => sum + v * v, 0) / Math.max(1, part.length));
    const rmsDb = db(rms);
    const pitches: number[] = [];
    const centroids: number[] = [];
    for (let t = start + 0.03; t < end - 0.03; t += 0.04) {
      const center = Math.round(t * SR);
      const f0 = pitchAt(x, center);
      if (f0 > 0) pitches.push(f0);
      centroids.push(centroid(x, center));
    }
    const median = (values: number[]) =>
      values.length ? [...values].sort((a, b) => a - b)[Math.floor(values.length / 2)] : 0;
    const snrDb = rmsDb - floorDb;
    events.push({
      start,
      end,
      peakDb: db(peak(part)),
      rmsDb,
      snrDb,
      f0: pitches.length >= Math.max(2, centroids.length * 0.3) ? median(pitches) : 0,
      centroid: median(centroids),
      score: snrDb * Math.sqrt(Math.min(end - start, 2.5)),
    });
  }
  return { floorDb, events };
}
