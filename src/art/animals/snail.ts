import { circle, curve, ellipse, rotatePath, smooth, tube, type Pt } from '../core/paths';
import type { AnimalDef, PartNode, Shape } from '../core/types';

const TAU = Math.PI * 2;
const GROUND = 220;
const STRIDE = 24;
const TAIL = 28;
const FRONT = 236;
const SHELL: Pt = [126, 112];
const SHELL_R = 78;

const frac = (v: number) => v - Math.floor(v);
const ease = (v: number) => {
  const c = Math.min(1, Math.max(0, v));
  return c * c * (3 - 2 * c);
};
const lerp = (a: number, b: number, k: number) => a + (b - a) * k;

function reach(phase: number): { t: number; f: number } {
  const p = frac(phase);
  const front = p < 0.5 ? STRIDE * ease(2 * p) : STRIDE;
  const tail = p < 0.5 ? 0 : STRIDE * ease(2 * p - 1);
  return { f: FRONT + front - STRIDE * p, t: TAIL + tail - STRIDE * p };
}

const turn = (shapes: Shape[], deg: number, o: Pt): Shape[] =>
  shapes.map((s) => ({ ...s, d: rotatePath(s.d, deg, o[0], o[1]) }));

function body(phase: number): Shape[] {
  const { t, f } = reach(phase);
  const foot = smooth([
    [t, GROUND - 8],
    [t + 12, GROUND - 1.5],
    [lerp(t, f, 0.35), GROUND],
    [lerp(t, f, 0.7), GROUND],
    [f + 4, GROUND],
    [f + 22, GROUND - 3],
    [f + 32, GROUND - 14],
    [f + 24, GROUND - 28],
    [f - 8, GROUND - 38],
    [lerp(t, f, 0.45), GROUND - 40],
    [t + 30, GROUND - 25],
    [t + 9, GROUND - 15],
  ]);
  const neck: Pt = [f + 2, GROUND - 40];
  const head: Pt = [f + 26, GROUND - 116];
  const tilt = 3.5 * Math.sin(TAU * (phase + 0.15));
  const sway = 4 * Math.sin(TAU * (2 * phase + 0.3));
  const [hx, hy] = head;
  const stalk = (base: Pt, tip: Pt, fill: string): Shape[] => [
    { d: tube([base, [(base[0] + tip[0]) / 2 - 3, (base[1] + tip[1]) / 2], tip], 5, 16), fill },
    { d: circle(tip[0], tip[1], 8.2), fill },
  ];
  const top = turn(
    [
      ...stalk([hx + 14, hy - 26], [hx + 32 + sway, hy - 62], 'bodyDark'),
      ...stalk([hx - 6, hy - 30], [hx + 2 + sway, hy - 74], 'body'),
      { d: circle(hx, hy, 39), fill: 'body' },
      { d: ellipse(hx - 16, hy - 20, 12, 6.4, -30), kind: 'detail', fill: 'bodyHi' },
      { d: ellipse(hx - 14, hy + 17, 8.6, 5.4), kind: 'feature', fill: 'blush', opacity: 0.75 },
      { d: ellipse(hx + 30, hy + 15, 6, 4.4), kind: 'feature', fill: 'blush', opacity: 0.75 },
      { d: circle(hx - 2, hy - 3, 12.4), kind: 'feature', fill: 'eye' },
      { d: circle(hx + 25, hy - 5, 10.6), kind: 'feature', fill: 'eye' },
      { d: circle(hx + 2.8, hy - 8, 4.7), kind: 'feature', fill: 'shine' },
      { d: circle(hx + 29, hy - 9.6, 4), kind: 'feature', fill: 'shine' },
      { d: circle(hx - 5.6, hy + 2, 2.1), kind: 'feature', fill: 'shine' },
      { d: curve(hx + 5, hy + 16, hx + 21, hy + 15, 6), kind: 'line', stroke: 'mouth', width: 3.2 },
    ],
    tilt,
    neck,
  );
  return [
    { d: foot, fill: 'body' },
    {
      d: tube(
        [
          [f - 22, GROUND - 26],
          [f, GROUND - 52],
          [f + 12, GROUND - 82],
          [f + 22, GROUND - 106],
        ],
        (k) => 23 - 2 * k,
        24,
      ),
      fill: 'body',
    },
    ...top.slice(0, 5),
    { d: ellipse(lerp(t, f, 0.55), GROUND - 2, (f - t) * 0.5, 7), kind: 'detail', fill: 'sole' },
    ...top.slice(5),
  ];
}

function spiral(c: Pt, r0: number, r1: number, turns: number, endDeg: number): Pt[] {
  const end = (endDeg * Math.PI) / 180;
  const total = turns * TAU;
  const pts: Pt[] = [];
  for (let a = 0; a <= total + 1e-6; a += 0.3) {
    const r = lerp(r0, r1, a / total);
    const ang = end + (total - a);
    pts.push([c[0] + r * Math.cos(ang), c[1] + r * Math.sin(ang)]);
  }
  return pts;
}

function shell(phase: number): Shape[] {
  const { t, f } = reach(phase);
  const mid = (t + f) / 2 - (TAIL + FRONT) / 2;
  const rock = -2.2 * Math.sin(TAU * phase);
  const c: Pt = [SHELL[0] + mid, SHELL[1] - 1.5 * Math.abs(Math.sin(TAU * phase))];
  const groove = spiral(c, 5, SHELL_R - 3, 2.2, 74);
  const band = spiral(c, 4, SHELL_R - 22, 1.9, 70);
  return turn(
    [
      { d: circle(c[0], c[1], SHELL_R), fill: 'shell' },
      { d: tube(band, (k) => 3 + 9 * k, 90), kind: 'detail', fill: 'band' },
      { d: ellipse(c[0] - 26, c[1] - 50, 22, 9, -28), kind: 'detail', fill: 'shellHi' },
      { d: smooth(groove, false), kind: 'line', stroke: 'groove', width: 4.4 },
    ],
    rock,
    [c[0], c[1] + SHELL_R],
  );
}

const parts: PartNode[] = [
  { id: 'body', frames: body },
  { id: 'shell', frames: shell },
];

const snail: AnimalDef = {
  id: 'snail',
  name: 'Snail',
  kind: 'animal',
  aliases: ['snails', 'garden snail', 'slow snail', 'snaily'],
  group: 'bug',
  habitats: ['bugs'],
  box: [320, 220],
  size: 70,
  locomotion: 'slither',
  gait: { period: 2.2, stride: STRIDE },
  sound: 'snail',
  palette: {
    body: '#f5d29d',
    bodyDark: '#e3b77d',
    bodyHi: '#fff0d2',
    sole: '#e6b47c',
    shell: '#ee9447',
    band: '#ffc46e',
    shellHi: '#ffe2ad',
    groove: '#a3542a',
  },
  parts,
};

export default snail;
