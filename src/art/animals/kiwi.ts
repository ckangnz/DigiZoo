import {
  capsule,
  circle,
  curve,
  ellipse,
  leaf,
  rotatePath,
  samplePath,
  smooth,
  tube,
  type Pt,
} from '../core/paths';
import type { AnimalDef, PartNode, Shape } from '../core/types';

const SOLE = 240;
const HIP_Y = 190;
const STRIDE = 64;
const DUTY = 0.6;
const LIFT = 10;

const frac = (v: number) => v - Math.floor(v);

const furry = (ctrl: Pt[], count: number, amp: (p: Pt) => number): string => {
  const dense = samplePath(smooth(ctrl), 16);
  const lengths = [0];
  for (let i = 1; i < dense.length; i++) {
    lengths.push(
      lengths[i - 1] + Math.hypot(dense[i][0] - dense[i - 1][0], dense[i][1] - dense[i - 1][1]),
    );
  }
  const total = lengths[lengths.length - 1];
  const cx = ctrl.reduce((s, p) => s + p[0], 0) / ctrl.length;
  const cy = ctrl.reduce((s, p) => s + p[1], 0) / ctrl.length;
  const pts: Pt[] = [];
  let j = 0;
  for (let k = 0; k < count; k++) {
    const target = (k / count) * total;
    while (j < lengths.length - 2 && lengths[j + 1] < target) j++;
    const a = dense[j];
    const b = dense[Math.min(dense.length - 1, j + 1)];
    const span = lengths[j + 1] - lengths[j] || 1;
    const u = (target - lengths[j]) / span;
    const p: Pt = [a[0] + (b[0] - a[0]) * u, a[1] + (b[1] - a[1]) * u];
    const len = Math.hypot(b[0] - a[0], b[1] - a[1]) || 1;
    let nx = -(b[1] - a[1]) / len;
    let ny = (b[0] - a[0]) / len;
    if (nx * (p[0] - cx) + ny * (p[1] - cy) < 0) {
      nx = -nx;
      ny = -ny;
    }
    const off = k % 2 === 0 ? amp(p) : -0.4 * amp(p);
    pts.push([p[0] + nx * off, p[1] + ny * off]);
  }
  return smooth(pts, true, 1);
};

const BODY: Pt[] = [
  [234, 52],
  [262, 60],
  [280, 84],
  [276, 110],
  [256, 132],
  [234, 160],
  [210, 188],
  [170, 204],
  [120, 206],
  [76, 194],
  [46, 166],
  [34, 128],
  [46, 88],
  [82, 56],
  [132, 40],
  [180, 42],
  [210, 54],
];

const BEAK: Pt[] = [
  [268, 98],
  [290, 112],
  [308, 130],
  [322, 152],
  [330, 172],
];

const fuzz = ([x, y]: Pt): number => (x > 236 && y < 130 ? 1.6 : y > 170 ? 4.6 : 3.6);

const footAt = (x: number, offset: number, phase: number): { at: Pt; tilt: number } => {
  const p = frac(phase + offset);
  const shift = STRIDE * DUTY;
  if (p < DUTY) return { at: [x + shift / 2 - shift * (p / DUTY), SOLE], tilt: 0 };
  const q = (p - DUTY) / (1 - DUTY);
  const e = q * q * (3 - 2 * q);
  const up = Math.sin(Math.PI * q);
  return { at: [x - shift / 2 + shift * e, SOLE - LIFT * up], tilt: 14 * up * (1 - q) };
};

const leg = (id: string, x: number, far: boolean, offset: number): PartNode => {
  const fill = far ? 'legDark' : 'leg';
  return {
    id,
    role: id,
    pivot: [x, HIP_Y],
    motion: null,
    frames: (phase) => {
      const { at, tilt } = footAt(x, offset, phase);
      const [fx, fy] = at;
      const ax = fx;
      const ay = fy - 9;
      const foot = (d: string) => rotatePath(d, tilt, ax, ay);
      return [
        { d: capsule(x, HIP_Y - 14, ax, ay, 11, 7.5), fill },
        { d: foot(capsule(ax, ay, ax + 26, fy - 4, 5, 4)), fill },
        { d: foot(capsule(ax, ay + 1, ax + 17, fy - 3.6, 4.6, 3.8)), fill },
        { d: foot(capsule(ax, ay, ax - 13, fy - 4, 4.6, 3.6)), fill },
        { d: foot(ellipse(ax + 1, ay + 1.5, 7.5, 6)), fill },
      ];
    },
  };
};

const strand = (x: number, y: number, len: number, angle: number): Shape => ({
  d: leaf(x, y, len, 2.6, angle),
  kind: 'detail',
  fill: 'furDark',
});

const kiwi: AnimalDef = {
  id: 'kiwi',
  name: 'Kiwi',
  kind: 'animal',
  aliases: ['kiwi bird', 'brown kiwi', 'bird'],
  group: 'bird',
  habitats: ['aussie', 'birds'],
  box: [340, SOLE],
  size: 90,
  locomotion: 'walk2',
  gait: { period: 0.6, stride: STRIDE },
  sound: 'kiwi',
  palette: {
    fur: '#a87a4f',
    furLight: '#b98b5b',
    furDark: '#8d633e',
    beak: '#f1d9b0',
    beakLine: '#c9a77a',
    leg: '#e2cba8',
    legDark: '#c4a883',
    whisker: '#5c3d26',
  },
  parts: [
    leg('legF', 124, true, 0.55),
    leg('legN', 162, false, 0.05),
    {
      id: 'body',
      role: 'body',
      pivot: [150, HIP_Y],
      shapes: [
        { d: furry(BODY, 56, fuzz), fill: 'fur' },
        { d: ellipse(214, 172, 52, 30, -24), kind: 'detail', fill: 'furLight' },
        strand(86, 92, 18, 130),
        strand(120, 70, 18, 120),
        strand(160, 64, 16, 115),
        strand(70, 140, 18, 115),
        strand(110, 120, 18, 120),
        strand(150, 104, 16, 118),
        strand(100, 170, 16, 110),
        strand(190, 92, 14, 112),
        strand(140, 150, 16, 116),
        strand(196, 132, 14, 112),
        { d: ellipse(254, 110, 9.5, 6), kind: 'feature', fill: 'blush', opacity: 0.55 },
        { d: circle(248, 84, 11.5), kind: 'feature', fill: 'eye' },
        { d: circle(252.2, 79.6, 4.4), kind: 'feature', fill: 'shine' },
        { d: circle(244.6, 88.4, 1.8), kind: 'feature', fill: 'shine' },
      ],
      children: [
        {
          id: 'beak',
          pivot: [270, 100],
          shapes: [
            { d: tube(BEAK, (t) => 8.5 - 5.5 * t, 40), fill: 'beak' },
            { d: curve(276, 108, 320, 158, -3), kind: 'line', stroke: 'beakLine', width: 2 },
            { d: 'M274 92L296 80', kind: 'line', stroke: 'whisker', width: 1.8 },
            { d: 'M276 98L300 92', kind: 'line', stroke: 'whisker', width: 1.8 },
            { d: 'M272 106L292 114', kind: 'line', stroke: 'whisker', width: 1.8 },
          ],
        },
      ],
    },
  ],
};

export default kiwi;
