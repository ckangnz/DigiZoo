import {
  capsule,
  circle,
  curve,
  ellipse,
  leaf,
  rotatePath,
  scalePath,
  smooth,
  tube,
  type Pt,
} from '../core/paths';
import type { AnimalDef, PartNode, Shape } from '../core/types';

const SOLE = 370;
const HIP_Y = 218;
const THIGH = 70;
const SHIN = 76;
const STRIDE = 112;
const DUTY = 0.6;
const LIFT = 24;

const frac = (v: number) => v - Math.floor(v);

const footAt = (x: number, offset: number, phase: number): { at: Pt; tilt: number } => {
  const p = frac(phase + offset);
  const shift = STRIDE * DUTY;
  if (p < DUTY) return { at: [x + shift / 2 - shift * (p / DUTY), SOLE], tilt: 0 };
  const q = (p - DUTY) / (1 - DUTY);
  const e = q * q * (3 - 2 * q);
  const up = Math.sin(Math.PI * q);
  return { at: [x - shift / 2 + shift * e, SOLE - LIFT * up], tilt: 18 * up * (1 - q) };
};

const knee = (hip: Pt, ankle: Pt): Pt => {
  const dx = ankle[0] - hip[0];
  const dy = ankle[1] - hip[1];
  const dist = Math.hypot(dx, dy);
  const d = Math.min(THIGH + SHIN - 0.5, dist);
  const ux = dx / dist;
  const uy = dy / dist;
  const a = (THIGH * THIGH - SHIN * SHIN + d * d) / (2 * d);
  const h = Math.sqrt(Math.max(0, THIGH * THIGH - a * a));
  return [hip[0] + ux * a - uy * h, hip[1] + uy * a + ux * h];
};

const leg = (id: string, x: number, far: boolean, offset: number): PartNode => {
  const fill = far ? 'legDark' : 'leg';
  const hip: Pt = [x, HIP_Y];
  return {
    id,
    role: id,
    pivot: hip,
    motion: null,
    frames: (phase) => {
      const { at, tilt } = footAt(x + 8, offset, phase);
      const ankle: Pt = [at[0], at[1] - 12];
      const k = knee(hip, ankle);
      const foot = (d: string) => rotatePath(d, tilt, ankle[0], ankle[1]);
      const shapes: Shape[] = [
        { d: capsule(x, HIP_Y - 34, hip[0], hip[1], 15, 14), fill },
        { d: capsule(hip[0], hip[1], k[0], k[1], 14, 9), fill },
        { d: circle(k[0], k[1], 9), fill },
        { d: capsule(k[0], k[1], ankle[0], ankle[1], 8, 7), fill },
        { d: foot(capsule(ankle[0], ankle[1], ankle[0] + 34, at[1] - 5.5, 7, 5.5)), fill },
        { d: foot(capsule(ankle[0], ankle[1] + 2, ankle[0] + 22, at[1] - 4.5, 6, 5)), fill },
        { d: foot(capsule(ankle[0], ankle[1], ankle[0] - 10, at[1] - 6, 6, 5)), fill },
      ];
      if (!far) {
        for (const t of [0.3, 0.5, 0.7]) {
          const sx = k[0] + (ankle[0] - k[0]) * t;
          const sy = k[1] + (ankle[1] - k[1]) * t;
          shapes.push({
            d: `M${sx - 4.5} ${sy}L${sx + 4.5} ${sy + 1.5}`,
            kind: 'line',
            stroke: 'legLine',
            width: 2.2,
          });
        }
      }
      return shapes;
    },
  };
};

const TUFTS: [number, number, number][] = [
  [224, 206, 18],
  [206, 222, 26],
  [184, 232, 32],
  [160, 238, 36],
  [134, 240, 38],
  [108, 238, 38],
  [82, 230, 36],
  [58, 216, 32],
  [38, 196, 28],
  [26, 172, 22],
];

const shaggy = (): string => {
  const pts: Pt[] = [
    [40, 134],
    [68, 116],
    [100, 106],
    [142, 102],
    [180, 110],
    [208, 128],
    [226, 152],
    [232, 180],
  ];
  TUFTS.forEach(([x, y, len], i) => {
    const next = TUFTS[i + 1] ?? [24, 150, 0];
    pts.push([x - len * 0.28, y + len]);
    pts.push([(x + next[0]) / 2, (y + next[1]) / 2 + 2]);
  });
  pts.push([24, 150]);
  return smooth(pts, true, 0.62);
};

const underTuft = (x: number, y: number, len: number): Shape => ({
  d: leaf(x, y - 10, len + 10, (len + 10) * 0.22, 104),
  fill: 'bodyDark',
});

const streak = (x: number, y: number, len: number, angle: number, fill: string): Shape => ({
  d: leaf(x, y, len, 3, angle),
  kind: 'detail',
  fill,
});

const HEAD: Pt = [242, 54];

const crownTuft = (angle: number, len: number): Shape => {
  const a = (angle * Math.PI) / 180;
  return {
    d: leaf(HEAD[0] + Math.cos(a) * 22, HEAD[1] + Math.sin(a) * 22, len, 6.5, angle + 14),
    fill: 'cap',
  };
};

const grow = (shapes: Shape[]): Shape[] =>
  shapes.map((sh) => ({ ...sh, d: scalePath(sh.d, 1.18, 1.18, 238, 66) }));

const NECK: Pt[] = [
  [206, 168],
  [212, 136],
  [222, 106],
  [230, 80],
  [236, 60],
];

const emu: AnimalDef = {
  id: 'emu',
  name: 'Emu',
  kind: 'animal',
  aliases: ['emu bird', 'australian emu', 'big bird', 'bird'],
  group: 'bird',
  habitats: ['aussie', 'birds'],
  box: [312, SOLE],
  size: 280,
  locomotion: 'walk2',
  gait: { period: 0.9, stride: STRIDE },
  sound: 'emu',
  palette: {
    body: '#86614a',
    bodyDark: '#6c4c38',
    bodyLight: '#a7805f',
    neck: '#8cc6ec',
    neckDark: '#6aa8d8',
    cap: '#4d3b31',
    beak: '#4b4350',
    beakLine: '#2f2a33',
    leg: '#a8a09a',
    legDark: '#8b837d',
    legLine: '#7c736d',
  },
  parts: [
    leg('legF', 116, true, 0.55),
    leg('legN', 148, false, 0.05),
    {
      id: 'body',
      role: 'body',
      pivot: [130, 232],
      shapes: [
        underTuft(196, 226, 30),
        underTuft(146, 238, 38),
        underTuft(96, 234, 38),
        underTuft(50, 208, 30),
        { d: shaggy(), fill: 'body' },
        streak(80, 132, 30, 160, 'bodyLight'),
        streak(118, 118, 30, 168, 'bodyLight'),
        streak(158, 122, 28, 176, 'bodyLight'),
        streak(62, 170, 34, 116, 'bodyDark'),
        streak(98, 158, 36, 110, 'bodyDark'),
        streak(138, 156, 36, 104, 'bodyDark'),
        streak(178, 156, 32, 98, 'bodyDark'),
        streak(206, 168, 26, 94, 'bodyDark'),
        streak(80, 196, 34, 108, 'bodyLight'),
        streak(120, 200, 36, 102, 'bodyLight'),
        streak(160, 198, 32, 98, 'bodyLight'),
        streak(44, 176, 28, 122, 'bodyLight'),
      ],
      children: [
        {
          id: 'head',
          role: 'head',
          behind: true,
          pivot: [206, 168],
          shapes: [
            { d: tube(NECK, (t) => 17 - 6 * t, 60), fill: 'neck' },
            ...grow([
              ...[-158, -132, -106, -80].map((a, i) => crownTuft(a, 13 + (i % 2) * 3)),
              { d: circle(HEAD[0], HEAD[1], 29), fill: 'neck' },
              { d: 'M263 46Q283 42 293 51Q296 57 290 60Q277 65 263 62Z', fill: 'beak' },
              { d: ellipse(226, 32, 19, 11, 30), kind: 'detail', fill: 'cap' },
              { d: 'M267 56Q279 58 289 55', kind: 'line', stroke: 'beakLine', width: 2.2 },
            ]),
            { d: curve(222, 84, 216, 104, 3), kind: 'line', stroke: 'neckDark', width: 2.6 },
            { d: curve(216, 116, 210, 136, 3), kind: 'line', stroke: 'neckDark', width: 2.6 },
            { d: curve(230, 96, 228, 112, -2), kind: 'line', stroke: 'neckDark', width: 2.2 },
            ...grow([
              { d: ellipse(254, 72, 9, 5.8), kind: 'feature', fill: 'blush', opacity: 0.55 },
              { d: circle(252, 50, 11.5), kind: 'feature', fill: 'eye' },
              { d: circle(256.4, 45.2, 4.6), kind: 'feature', fill: 'shine' },
              { d: circle(248.2, 54.4, 1.9), kind: 'feature', fill: 'shine' },
            ]),
          ],
        },
      ],
    },
  ],
};

export default emu;
