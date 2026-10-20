import { circle, ellipse, f, leaf, smooth, tube, type Pt } from '../core/paths';
import type { AnimalDef, Shape } from '../core/types';

const CX = 113;
const CY = 98;
const RX = 97;
const RY = 89;
const DEG = Math.PI / 180;

const dip = (deg: number, at: number, width: number, depth: number) =>
  depth * Math.exp(-(((deg - at) / width) ** 2));

function silhouette(): string {
  const pts: Pt[] = [];
  for (let i = 0; i < 120; i++) {
    const deg = (i / 120) * 360;
    const cut =
      dip(deg, 270, 10, 10) +
      dip(deg, 232, 7, 3.5) +
      dip(deg, 308, 7, 3.5) +
      dip(deg, 90, 8, 1.5) +
      dip(deg, 138, 7, 2.5) +
      dip(deg, 42, 7, 2.5);
    const k = 1 - cut / RY;
    pts.push([CX + RX * Math.cos(deg * DEG) * k, CY + RY * Math.sin(deg * DEG) * k]);
  }
  return smooth(pts);
}

function rib(longitude: number): string {
  const pts: Pt[] = [];
  for (let t = -72; t <= 78; t += 6) {
    pts.push([
      CX + RX * 0.98 * Math.sin(longitude * DEG) * Math.cos(t * DEG),
      CY + RY * 0.98 * Math.sin(t * DEG),
    ]);
  }
  return tube(pts, (t) => 1.2 + 1.2 * Math.sin(Math.PI * t), 60);
}

function roundPoly(pts: Pt[], r: number): string {
  const n = pts.length;
  let d = '';
  for (let i = 0; i < n; i++) {
    const prev = pts[(i + n - 1) % n];
    const cur = pts[i];
    const next = pts[(i + 1) % n];
    const toward = (p: Pt): Pt => {
      const len = Math.hypot(p[0] - cur[0], p[1] - cur[1]);
      const k = Math.min(r, len / 2) / len;
      return [cur[0] + (p[0] - cur[0]) * k, cur[1] + (p[1] - cur[1]) * k];
    };
    const a = toward(prev);
    const b = toward(next);
    d += `${i ? 'L' : 'M'}${f(a[0])} ${f(a[1])}Q${f(cur[0])} ${f(cur[1])} ${f(b[0])} ${f(b[1])}`;
  }
  return d + 'Z';
}

function mouth(dx: number, dy: number, grow: number): string {
  const left = 72 - grow;
  const right = 154 + grow;
  const half = (right - left) / 2;
  const mid = (left + right) / 2;
  const s = (x: number) => (x - mid) / half;
  const top = (x: number) => 124 - 8 * s(x) ** 4 + 3 * (1 - s(x) ** 2);
  const bottom = (x: number) => 116 + 36 * Math.sqrt(Math.max(0, 1 - s(x) ** 2)) + grow;
  const inTooth = (x: number) =>
    (x > 95 + grow && x < 107 - grow) || (x > 119 + grow && x < 131 - grow);
  const pts: Pt[] = [];
  const steps = 40;
  for (let i = 0; i <= steps; i++) {
    const x = left + (i / steps) * (right - left);
    pts.push([x, inTooth(x) ? top(x) + 8 - grow : top(x) - grow * 0.7]);
  }
  for (let i = steps - 1; i >= 1; i--) {
    const x = left + (i / steps) * (right - left);
    pts.push([x, bottom(x)]);
  }
  return roundPoly(
    pts.map(([x, y]) => [x + dx, y + dy]),
    2.6,
  );
}

const eye = (x: number, y: number): Shape[] => [
  { d: circle(x, y, 19), kind: 'feature', fill: 'carve' },
  { d: circle(x + 0.8, y + 2, 16.4), kind: 'feature', fill: 'glow' },
  { d: circle(x + 1, y + 2.8, 11.6), kind: 'feature', fill: 'eye' },
  { d: circle(x + 5, y - 1.4, 4.2), kind: 'feature', fill: 'shine' },
];

const SPIRAL: Pt[] = [
  [108, 20],
  [97, 17.5],
  [86, 16.5],
  ...Array.from({ length: 13 }, (_, k): Pt => {
    const a = (90 + k * 30) * DEG;
    const r = 8.5 - 5.2 * (k / 12);
    return [72 + r * Math.cos(a), 8.5 + r * Math.sin(a)];
  }),
];

const pumpkin: AnimalDef = {
  id: 'pumpkin',
  name: 'Pumpkin',
  kind: 'object',
  aliases: ['jack-o-lantern', 'jack o lantern', 'jackolantern', 'halloween pumpkin', 'gourd'],
  group: 'spooky',
  habitats: ['halloween'],
  box: [226, 196],
  size: 120,
  locomotion: 'roll',
  sound: 'pumpkin',
  palette: {
    pumpkin: '#ff9a2e',
    pumpkinLight: '#ffbb5e',
    rib: '#e47a1c',
    carve: '#b8501a',
    glow: '#ffe37a',
    stem: '#78b545',
    stemTop: '#a8d66e',
    leaf: '#8bcb52',
    vein: '#5e9a34',
    blush: '#ff6f8e',
  },
  parts: [
    {
      id: 'body',
      role: 'body',
      pivot: [CX, CY],
      shapes: [
        { d: silhouette(), fill: 'pumpkin' },
        { d: ellipse(58, 62, 11, 26, 24), kind: 'detail', fill: 'pumpkinLight' },
        { d: ellipse(95, 34, 9, 6, 0), kind: 'detail', fill: 'pumpkinLight' },
        { d: rib(-58), kind: 'detail', fill: 'rib' },
        { d: rib(-23), kind: 'detail', fill: 'rib' },
        { d: rib(23), kind: 'detail', fill: 'rib' },
        { d: rib(58), kind: 'detail', fill: 'rib' },
        { d: ellipse(52, 114, 12, 7.5), kind: 'feature', fill: 'blush', opacity: 0.55 },
        { d: ellipse(174, 114, 12, 7.5), kind: 'feature', fill: 'blush', opacity: 0.55 },
        ...eye(80, 80),
        ...eye(146, 80),
        {
          d: roundPoly(
            [
              [113, 98],
              [123, 112],
              [103, 112],
            ],
            4,
          ),
          kind: 'feature',
          fill: 'carve',
        },
        {
          d: roundPoly(
            [
              [113.5, 101.5],
              [121, 112],
              [106, 112],
            ],
            3,
          ),
          kind: 'feature',
          fill: 'glow',
        },
        { d: mouth(0, 0, 2.6), kind: 'feature', fill: 'carve' },
        { d: mouth(0.6, 1.8, 0), kind: 'feature', fill: 'glow' },
      ],
      children: [
        {
          id: 'stem',
          behind: true,
          pivot: [CX, 22],
          shapes: [
            {
              d: tube(
                [
                  [111, 30],
                  [112, 18],
                  [115, 8],
                  [120, 2],
                ],
                (t) => 9 - 2.2 * t,
                40,
              ),
              fill: 'stem',
            },
            { d: ellipse(120.5, 1.5, 6, 4, -40), kind: 'detail', fill: 'stemTop' },
          ],
        },
        {
          id: 'vine',
          pivot: [108, 20],
          shapes: [{ d: tube(SPIRAL, (t) => 3.1 - 1.1 * t, 120), fill: 'stem' }],
        },
        {
          id: 'leaf',
          pivot: [118, 20],
          shapes: [
            { d: leaf(117, 19, 38, 13, -24), fill: 'leaf' },
            { d: 'M121 17.5Q136 12 150 4', kind: 'line', stroke: 'vein', width: 2 },
          ],
        },
      ],
    },
  ],
};

export default pumpkin;
