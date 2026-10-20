import { deflateSync } from 'node:zlib';
import { Resvg } from '@resvg/resvg-js';
import { SR, magnitudes } from './audio';

const CRC_TABLE = (() => {
  const table = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    table[n] = c >>> 0;
  }
  return table;
})();

function crc32(bytes: Buffer): number {
  let crc = 0xffffffff;
  for (let i = 0; i < bytes.length; i++) crc = CRC_TABLE[(crc ^ bytes[i]) & 0xff] ^ (crc >>> 8);
  return (crc ^ 0xffffffff) >>> 0;
}

function chunk(type: string, data: Buffer): Buffer {
  const length = Buffer.alloc(4);
  length.writeUInt32BE(data.length);
  const body = Buffer.concat([Buffer.from(type, 'ascii'), data]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(body));
  return Buffer.concat([length, body, crc]);
}

export function encodePng(width: number, height: number, rgba: Uint8Array): Buffer {
  const stride = width * 4;
  const raw = Buffer.alloc((stride + 1) * height);
  for (let y = 0; y < height; y++) {
    raw[y * (stride + 1)] = 0;
    raw.set(rgba.subarray(y * stride, (y + 1) * stride), y * (stride + 1) + 1);
  }
  const header = Buffer.alloc(13);
  header.writeUInt32BE(width, 0);
  header.writeUInt32BE(height, 4);
  header[8] = 8;
  header[9] = 6;
  header[10] = 0;
  header[11] = 0;
  header[12] = 0;
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk('IHDR', header),
    chunk('IDAT', deflateSync(raw, { level: 9 })),
    chunk('IEND', Buffer.alloc(0)),
  ]);
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

function magma(level: number): [number, number, number] {
  const scaled = Math.max(0, Math.min(1, level)) * (MAGMA.length - 1);
  const index = Math.min(MAGMA.length - 2, Math.floor(scaled));
  const mix = scaled - index;
  return [0, 1, 2].map((k) =>
    Math.round(MAGMA[index][k] + (MAGMA[index + 1][k] - MAGMA[index][k]) * mix),
  ) as [number, number, number];
}

export const F_MIN = 40;
export const F_MAX = 16000;

export interface Marker {
  start: number;
  end: number;
  label: string;
  color: [number, number, number];
}

export interface PlotOptions {
  start: number;
  end: number;
  pxPerSecond: number;
  rows: number;
  rowPx: number;
  waveH: number;
  rangeDb: number;
  markers?: Marker[];
}

export interface Plot {
  png: Buffer;
  width: number;
  height: number;
  specH: number;
}

export function plot(x: Float32Array, options: PlotOptions): Plot {
  const width = Math.max(1, Math.round((options.end - options.start) * options.pxPerSecond));
  const specH = options.rows * options.rowPx;
  const markerH = options.markers?.length ? 12 : 0;
  const height = specH + markerH + options.waveH;
  const rgba = new Uint8Array(width * height * 4);
  const rowBands = Array.from({ length: options.rows }, (_, row) => {
    const ratio = F_MAX / F_MIN;
    const top = F_MIN * ratio ** ((options.rows - row) / options.rows);
    const bottom = F_MIN * ratio ** ((options.rows - row - 1) / options.rows);
    const center = Math.sqrt(top * bottom);
    const size = center < 250 ? 8192 : center < 1200 ? 4096 : center < 4000 ? 2048 : 1024;
    return { bottom, top, size };
  });
  const sizes = [...new Set(rowBands.map((band) => band.size))];
  const levels = new Float64Array(width * options.rows);
  let maxDb = -200;
  for (let col = 0; col < width; col++) {
    const time = options.start + (col + 0.5) / options.pxPerSecond;
    const center = Math.round(time * SR);
    const spectra = new Map(sizes.map((size) => [size, magnitudes(x, center, size)]));
    for (let row = 0; row < options.rows; row++) {
      const band = rowBands[row];
      const mags = spectra.get(band.size)!;
      const binHz = SR / band.size;
      const lo = Math.max(0, Math.floor(band.bottom / binHz));
      const hi = Math.min(mags.length - 1, Math.max(lo, Math.ceil(band.top / binHz)));
      let mag = 0;
      for (let b = lo; b <= hi; b++) mag = Math.max(mag, mags[b]);
      const value = 20 * Math.log10(Math.max(mag, 1e-10));
      levels[col * options.rows + row] = value;
      if (value > maxDb) maxDb = value;
    }
  }
  const floorDb = maxDb - options.rangeDb;
  for (let col = 0; col < width; col++) {
    for (let row = 0; row < options.rows; row++) {
      const level = (levels[col * options.rows + row] - floorDb) / options.rangeDb;
      const [r, g, b] = magma(level);
      for (let dy = 0; dy < options.rowPx; dy++) {
        const offset = ((row * options.rowPx + dy) * width + col) * 4;
        rgba[offset] = r;
        rgba[offset + 1] = g;
        rgba[offset + 2] = b;
        rgba[offset + 3] = 255;
      }
    }
  }
  const markerTop = specH;
  for (let y = markerTop; y < markerTop + markerH; y++) {
    for (let col = 0; col < width; col++) setPixel(rgba, width, col, y, [24, 26, 34]);
  }
  for (const marker of options.markers ?? []) {
    const from = Math.max(0, Math.floor((marker.start - options.start) * options.pxPerSecond));
    const to = Math.min(width, Math.ceil((marker.end - options.start) * options.pxPerSecond));
    for (let col = from; col < to; col++) {
      for (let y = markerTop + 1; y < markerTop + markerH - 1; y++) {
        setPixel(rgba, width, col, y, marker.color);
      }
    }
  }
  const waveTop = specH + markerH;
  const mid = waveTop + options.waveH / 2;
  for (let y = waveTop; y < waveTop + options.waveH; y++) {
    for (let col = 0; col < width; col++) setPixel(rgba, width, col, y, [29, 34, 48]);
  }
  for (let col = 0; col < width; col++) setPixel(rgba, width, col, Math.round(mid), [58, 66, 88]);
  for (let col = 0; col < width; col++) {
    const from = Math.max(0, Math.floor((options.start + col / options.pxPerSecond) * SR));
    const to = Math.min(
      x.length,
      Math.floor((options.start + (col + 1) / options.pxPerSecond) * SR),
    );
    let low = 0;
    let high = 0;
    for (let i = from; i < to; i++) {
      if (x[i] < low) low = x[i];
      if (x[i] > high) high = x[i];
    }
    const half = options.waveH / 2 - 2;
    const y1 = Math.round(mid - Math.min(1, high) * half);
    const y2 = Math.round(mid - Math.max(-1, low) * half);
    for (let y = y1; y <= y2; y++) setPixel(rgba, width, col, y, [127, 212, 255]);
  }
  return { png: encodePng(width, height, rgba), width, height, specH };
}

function setPixel(
  rgba: Uint8Array,
  width: number,
  x: number,
  y: number,
  [r, g, b]: readonly [number, number, number],
): void {
  const offset = (y * width + x) * 4;
  rgba[offset] = r;
  rgba[offset + 1] = g;
  rgba[offset + 2] = b;
  rgba[offset + 3] = 255;
}

export function frequencyY(freq: number, specH: number): number {
  return specH * (1 - Math.log(freq / F_MIN) / Math.log(F_MAX / F_MIN));
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
  _: '0000000000001f',
  ',': '000000000c0408',
  "'": '0c040800000000',
  '[': '0e08080808080e',
  ']': '0e02020202020e',
  '#': '0a0a1f0a1f0a0a',
  '!': '04040404040004',
  '?': '0e110102040004',
  '&': '0c12140815120d',
  '*': '00150e1f0e1500',
  '<': '02040810080402',
  '>': '08040201020408',
  '"': '0a0a0000000000',
  ' ': '00000000000000',
};

export function text(value: string, x: number, y: number, size: number, color: string): string {
  const rects: string[] = [];
  const chars = [
    ...value
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toUpperCase(),
  ];
  chars.forEach((char, index) => {
    const glyph = GLYPHS[char] ?? GLYPHS['?'];
    for (let row = 0; row < 7; row++) {
      const bits = parseInt(glyph.slice(row * 2, row * 2 + 2), 16);
      let col = 0;
      while (col < 5) {
        if (bits & (16 >> col)) {
          let run = 1;
          while (col + run < 5 && bits & (16 >> (col + run))) run++;
          rects.push(
            `<rect x="${x + (index * 6 + col) * size}" y="${y + row * size}" width="${run * size}" height="${size}" fill="${color}"/>`,
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

export function textWidth(value: string, size: number): number {
  return [...value].length * 6 * size;
}

export interface Panel {
  svg: string;
  width: number;
  height: number;
}

export function panel(
  x: Float32Array,
  options: PlotOptions & { title: string; subtitle?: string; tickEvery?: number },
): Panel {
  const left = 40;
  const right = 10;
  const titleH = options.subtitle ? 34 : 22;
  const axisH = 18;
  const image = plot(x, options);
  const width = Math.max(
    left + image.width + right,
    textWidth(options.title, 2) + 16,
    textWidth(options.subtitle ?? '', 1) + 16,
  );
  const height = titleH + image.height + axisH;
  const parts: string[] = [
    `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" shape-rendering="crispEdges">`,
    `<rect width="${width}" height="${height}" fill="#14161c"/>`,
    `<image x="${left}" y="${titleH}" width="${image.width}" height="${image.height}" href="data:image/png;base64,${image.png.toString('base64')}"/>`,
    text(options.title, 6, 5, 2, '#e8ecf4'),
  ];
  if (options.subtitle) parts.push(text(options.subtitle, 6, 23, 1, '#9aa4b8'));
  for (const freq of [100, 300, 1000, 3000, 10000]) {
    const y = Math.round(titleH + frequencyY(freq, image.specH));
    parts.push(
      `<rect x="${left}" y="${y}" width="${image.width}" height="1" fill="#ffffff" fill-opacity="0.16"/>`,
    );
    parts.push(text(freq >= 1000 ? `${freq / 1000}K` : `${freq}`, 4, y - 3, 1, '#b8c0d0'));
  }
  for (const marker of options.markers ?? []) {
    const mx = left + Math.round((marker.start - options.start) * options.pxPerSecond);
    parts.push(text(marker.label, mx + 2, titleH + image.specH + 3, 1, '#000000'));
  }
  const span = options.end - options.start;
  const tick =
    options.tickEvery ?? (span > 40 ? 5 : span > 12 ? 1 : span > 4 ? 0.5 : span > 1.5 ? 0.25 : 0.1);
  const labelEvery = tick < 0.5 ? (tick === 0.25 ? 2 : 5) : tick === 0.5 ? 2 : 1;
  const axisTop = titleH + image.height;
  const firstTick = Math.ceil(options.start / tick - 1e-9);
  for (let k = firstTick; k * tick <= options.end + 1e-9; k++) {
    const t = k * tick;
    const tx = left + Math.round((t - options.start) * options.pxPerSecond);
    const major = k % labelEvery === 0;
    parts.push(
      `<rect x="${tx}" y="${axisTop}" width="1" height="${major ? 6 : 3}" fill="#b8c0d0"/>`,
    );
    if (major) {
      const label = tick >= 1 ? t.toFixed(0) : t.toFixed(tick >= 0.25 ? 2 : 1);
      parts.push(text(label, tx + 2, axisTop + 8, 1, '#b8c0d0'));
    }
  }
  parts.push('</svg>');
  return { svg: parts.join(''), width, height };
}

export function rasterize(svg: string): Buffer {
  return new Resvg(svg, { font: { loadSystemFonts: false } }).render().asPng();
}

export function grid(panels: Panel[], columns: number, background = '#0b0c10'): string {
  const gap = 12;
  const columnWidths = Array.from({ length: columns }, (_, c) =>
    Math.max(0, ...panels.filter((_, i) => i % columns === c).map((p) => p.width)),
  );
  const rows = Math.ceil(panels.length / columns);
  const rowHeights = Array.from({ length: rows }, (_, r) =>
    Math.max(0, ...panels.slice(r * columns, (r + 1) * columns).map((p) => p.height)),
  );
  const width = columnWidths.reduce((a, b) => a + b + gap, gap);
  const height = rowHeights.reduce((a, b) => a + b + gap, gap);
  const parts = [
    `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">`,
    `<rect width="${width}" height="${height}" fill="${background}"/>`,
  ];
  panels.forEach((item, index) => {
    const c = index % columns;
    const r = Math.floor(index / columns);
    const x = gap + columnWidths.slice(0, c).reduce((a, b) => a + b + gap, 0);
    const y = gap + rowHeights.slice(0, r).reduce((a, b) => a + b + gap, 0);
    const png = rasterize(item.svg);
    parts.push(
      `<image x="${x}" y="${y}" width="${item.width}" height="${item.height}" href="data:image/png;base64,${png.toString('base64')}"/>`,
    );
  });
  parts.push('</svg>');
  return parts.join('');
}
