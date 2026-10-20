import { capsule, circle, ellipse, f, smooth, type Pt } from '../core/paths';
import type { AnimalDef, PartNode } from '../core/types';

const roundTri = (pts: Pt[], radii: number[]): string => {
  const n = pts.length;
  let d = '';
  for (let i = 0; i < n; i++) {
    const prev = pts[(i + n - 1) % n];
    const cur = pts[i];
    const next = pts[(i + 1) % n];
    const toward = (p: Pt): Pt => {
      const len = Math.hypot(p[0] - cur[0], p[1] - cur[1]);
      const k = Math.min(radii[i], len / 2) / len;
      return [cur[0] + (p[0] - cur[0]) * k, cur[1] + (p[1] - cur[1]) * k];
    };
    const a = toward(prev);
    const b = toward(next);
    d += `${i ? 'L' : 'M'}${f(a[0])} ${f(a[1])}Q${f(cur[0])} ${f(cur[1])} ${f(b[0])} ${f(b[1])}`;
  }
  return d + 'Z';
};

const HIP = 204;

const leg = (id: string, x: number, far: boolean): PartNode => ({
  id,
  role: id,
  behind: true,
  pivot: [x, HIP],
  shapes: [
    { d: capsule(x, HIP, x + 1, 270, 11, 7.5), fill: far ? 'legDark' : 'leg' },
    { d: ellipse(x + 5, 279, 11.5, 7.5), fill: far ? 'legDark' : 'leg' },
    ...(far
      ? []
      : [{ d: `M${x + 9} 282L${x + 9} 286`, kind: 'line' as const, stroke: 'toe', width: 2.2 }]),
  ],
});

const TAIL_BASE: Pt = [104, 186];
const TAIL_ANGLE = 150;
const TAIL_LEN = 98;

const tailPt = (u: number, v: number): Pt => {
  const a = (TAIL_ANGLE * Math.PI) / 180;
  const ux = Math.cos(a);
  const uy = Math.sin(a);
  return [TAIL_BASE[0] + ux * u * TAIL_LEN - uy * v, TAIL_BASE[1] + uy * u * TAIL_LEN + ux * v];
};

const TAIL = smooth(
  (
    [
      [0, 9],
      [0.22, 16],
      [0.45, 22],
      [0.66, 23],
      [0.84, 18],
      [0.96, 10],
      [1.04, 0],
      [0.97, -9],
      [0.9, -14],
      [0.83, -13],
      [0.75, -20],
      [0.5, -22],
      [0.25, -15],
      [0, -9],
    ] as Pt[]
  ).map(([u, v]) => tailPt(u, v)),
);

const TAIL_TIP = tailPt(1.02, 0);

const ear = (id: string, pivot: Pt, outer: Pt[], inner: Pt[], phase = 0): PartNode => ({
  id,
  role: 'ear',
  behind: true,
  phase,
  pivot,
  shapes: [
    { d: roundTri(outer, [10, 16, 10]), fill: 'earBack' },
    { d: roundTri(inner, [8, 12, 8]), kind: 'detail', fill: 'earInner' },
  ],
});

const coyote: AnimalDef = {
  id: 'coyote',
  name: 'Coyote',
  kind: 'animal',
  aliases: ['prairie wolf', 'brush wolf', 'wolf', 'wild dog'],
  group: 'mammal',
  habitats: ['desert'],
  box: [356, 290],
  size: 170,
  locomotion: 'walk4',
  gait: { stride: 106, swing: 20 },
  sound: 'coyote',
  palette: {
    fur: '#c8a888',
    saddle: '#a89584',
    leg: '#d2a476',
    legDark: '#b88a5e',
    earBack: '#cf9f70',
    cream: '#f8eedc',
    earInner: '#fbe9dc',
    tip: '#3b2f2a',
    nose: '#33261f',
    toe: '#977a5d',
  },
  parts: [
    {
      id: 'body',
      role: 'body',
      pivot: [168, 204],
      shapes: [
        {
          d: smooth([
            [100, 168],
            [126, 152],
            [164, 148],
            [204, 150],
            [234, 160],
            [248, 184],
            [238, 210],
            [208, 222],
            [164, 224],
            [124, 220],
            [98, 206],
            [90, 186],
          ]),
          fill: 'fur',
        },
        { d: ellipse(160, 148, 62, 10, -1), kind: 'detail', fill: 'saddle' },
        { d: ellipse(178, 230, 56, 15), kind: 'detail', fill: 'cream' },
        { d: ellipse(240, 196, 15, 24, -24), kind: 'detail', fill: 'cream' },
      ],
      children: [
        {
          id: 'tail',
          role: 'tail',
          pivot: TAIL_BASE,
          behind: true,
          shapes: [
            { d: TAIL, fill: 'fur' },
            { d: ellipse(80, 180, 30, 8, 22), kind: 'detail', fill: 'saddle' },
            { d: circle(TAIL_TIP[0], TAIL_TIP[1], 22), kind: 'detail', fill: 'tip' },
          ],
        },
        leg('legBF', 132, true),
        leg('legFF', 222, true),
        leg('legBN', 110, false),
        leg('legFN', 200, false),
        {
          id: 'head',
          role: 'head',
          pivot: [238, 168],
          shapes: [
            {
              d: smooth([
                [248, 62],
                [280, 64],
                [302, 82],
                [312, 104],
                [330, 114],
                [346, 126],
                [348, 140],
                [336, 152],
                [312, 160],
                [290, 170],
                [266, 176],
                [242, 174],
                [222, 166],
                [208, 148],
                [206, 118],
                [216, 86],
              ]),
              fill: 'fur',
            },
            {
              d: smooth([
                [226, 150],
                [256, 140],
                [290, 132],
                [324, 128],
                [350, 138],
                [340, 158],
                [306, 168],
                [272, 182],
                [236, 178],
              ]),
              kind: 'detail',
              fill: 'cream',
            },
            { d: ellipse(238, 136, 10, 6), kind: 'feature', fill: 'blush', opacity: 0.5 },
            { d: ellipse(300, 132, 8, 5), kind: 'feature', fill: 'blush', opacity: 0.5 },
            { d: circle(250, 110, 10.5), kind: 'feature', fill: 'eye' },
            { d: circle(290, 106, 9.8), kind: 'feature', fill: 'eye' },
            { d: circle(253.8, 106, 4), kind: 'feature', fill: 'shine' },
            { d: circle(293.6, 102.2, 3.7), kind: 'feature', fill: 'shine' },
            { d: ellipse(342, 131, 8.5, 6.5, 10), kind: 'feature', fill: 'nose' },
            {
              d: 'M305 150Q309 165 319 158Q315 150 309 150Z',
              kind: 'feature',
              fill: 'tongue',
              stroke: 'auto',
              width: 1.6,
            },
            { d: 'M340 141Q326 156 300 149', kind: 'line', stroke: 'mouth', width: 2.6 },
          ],
          children: [
            ear(
              'earF',
              [292, 86],
              [
                [272, 80],
                [316, 16],
                [318, 100],
              ],
              [
                [284, 84],
                [312, 36],
                [310, 94],
              ],
              0.5,
            ),
            ear(
              'earN',
              [238, 86],
              [
                [210, 104],
                [216, 20],
                [266, 74],
              ],
              [
                [222, 96],
                [223, 40],
                [255, 76],
              ],
            ),
          ],
        },
      ],
    },
  ],
};

export default coyote;
