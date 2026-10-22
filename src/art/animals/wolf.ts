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

const HIP = 208;
const GROUND = 298;

const leg = (id: string, x: number, far: boolean): PartNode => ({
  id,
  role: id,
  behind: true,
  pivot: [x, HIP],
  shapes: [
    { d: capsule(x, HIP, x + 1, GROUND - 22, 15, 12), fill: far ? 'furDark' : 'fur' },
    { d: ellipse(x + 5, GROUND - 9.5, 15.5, 9.5), fill: far ? 'furDark' : 'fur' },
    { d: ellipse(x + 3, GROUND - 10, 24, 26), kind: 'detail', fill: far ? 'paleFar' : 'pale' },
    ...(far
      ? []
      : [
          {
            d: `M${x + 8} ${GROUND - 6}L${x + 8} ${GROUND - 1}`,
            kind: 'line' as const,
            stroke: 'toe',
            width: 2.2,
          },
          {
            d: `M${x + 14} ${GROUND - 6}L${x + 14} ${GROUND - 1}`,
            kind: 'line' as const,
            stroke: 'toe',
            width: 2.2,
          },
        ]),
  ],
});

const TAIL_BASE: Pt = [102, 176];
const TAIL_ANGLE = 142;
const TAIL_LEN = 104;

const tailPt = (u: number, v: number): Pt => {
  const a = (TAIL_ANGLE * Math.PI) / 180;
  const ux = Math.cos(a);
  const uy = Math.sin(a);
  return [TAIL_BASE[0] + ux * u * TAIL_LEN - uy * v, TAIL_BASE[1] + uy * u * TAIL_LEN + ux * v];
};

const TAIL = smooth(
  (
    [
      [0, 10],
      [0.2, 19],
      [0.45, 26],
      [0.7, 26],
      [0.88, 20],
      [1.0, 10],
      [1.07, 0],
      [1.0, -10],
      [0.86, -18],
      [0.68, -24],
      [0.45, -23],
      [0.2, -16],
      [0, -9],
    ] as Pt[]
  ).map(([u, v]) => tailPt(u, v)),
);

const TAIL_TIP = tailPt(1.04, 0);
const TAIL_TOP = tailPt(0.5, 20);

const ear = (id: string, role: string, pivot: Pt, outer: Pt[], inner: Pt[]): PartNode => ({
  id,
  role,
  behind: true,
  pivot,
  shapes: [
    { d: roundTri(outer, [10, 9, 10]), fill: 'fur' },
    { d: roundTri(inner, [8, 7, 8]), kind: 'detail', fill: 'earInner' },
  ],
});

const RUFF = roundTri(
  [
    [216, 124],
    [232, 110],
    [256, 104],
    [274, 114],
    [284, 130],
    [294, 114],
    [312, 104],
    [336, 110],
    [352, 124],
    [372, 142],
    [354, 150],
    [366, 168],
    [342, 170],
    [344, 190],
    [320, 186],
    [302, 200],
    [284, 192],
    [266, 200],
    [248, 186],
    [224, 190],
    [226, 170],
    [202, 168],
    [214, 150],
    [196, 142],
  ],
  [40, 40, 40, 40, 10, 40, 40, 40, 40, 4, 8, 4, 8, 4, 8, 4, 8, 4, 8, 4, 8, 4, 8, 4],
);

const wolf: AnimalDef = {
  id: 'wolf',
  name: 'Wolf',
  kind: 'animal',
  aliases: ['grey wolf', 'gray wolf', 'timber wolf', 'wolfie'],
  group: 'mammal',
  habitats: ['forest'],
  box: [372, 300],
  size: 200,
  locomotion: 'walk4',
  gait: { stride: 112, swing: 20 },
  sound: 'wolf',
  palette: {
    fur: '#a4adbb',
    furDark: '#8c95a4',
    saddle: '#7f8898',
    pale: '#f3f0ea',
    paleFar: '#dcd8d0',
    earInner: '#f3ddd7',
    tip: '#565c6b',
    nose: '#2b2730',
    toe: '#7c8494',
  },
  parts: [
    {
      id: 'body',
      role: 'body',
      pivot: [176, HIP],
      shapes: [
        {
          d: smooth([
            [96, 176],
            [118, 156],
            [156, 148],
            [198, 148],
            [236, 152],
            [262, 170],
            [266, 200],
            [250, 224],
            [210, 234],
            [160, 236],
            [118, 232],
            [94, 214],
            [88, 194],
          ]),
          fill: 'fur',
        },
        { d: ellipse(170, 148, 76, 15, -2), kind: 'detail', fill: 'saddle' },
        { d: ellipse(184, 240, 64, 16), kind: 'detail', fill: 'pale' },
        { d: ellipse(258, 206, 18, 30, -18), kind: 'detail', fill: 'pale' },
      ],
      children: [
        {
          id: 'tail',
          role: 'tail',
          pivot: TAIL_BASE,
          behind: true,
          shapes: [
            { d: TAIL, fill: 'fur' },
            {
              d: ellipse(TAIL_TOP[0], TAIL_TOP[1], 46, 10, TAIL_ANGLE),
              kind: 'detail',
              fill: 'saddle',
            },
            { d: circle(TAIL_TIP[0], TAIL_TIP[1], 21), kind: 'detail', fill: 'tip' },
          ],
        },
        leg('legBF', 140, true),
        leg('legFF', 236, true),
        leg('legBN', 118, false),
        leg('legFN', 214, false),
        {
          id: 'head',
          role: 'head',
          pivot: [262, 168],
          shapes: [
            {
              d: smooth([
                [284, 62],
                [320, 66],
                [342, 84],
                [352, 110],
                [352, 140],
                [338, 166],
                [312, 180],
                [284, 184],
                [256, 180],
                [230, 166],
                [216, 140],
                [216, 110],
                [226, 84],
                [248, 66],
              ]),
              fill: 'fur',
            },
            { d: RUFF, fill: 'pale' },
            { d: ellipse(256, 98, 9, 5, -10), kind: 'detail', fill: 'pale' },
            { d: ellipse(312, 98, 9, 5, 10), kind: 'detail', fill: 'pale' },
            { d: ellipse(238, 142, 10, 6.5), kind: 'feature', fill: 'blush', opacity: 0.5 },
            { d: ellipse(330, 142, 10, 6.5), kind: 'feature', fill: 'blush', opacity: 0.5 },
            { d: circle(258, 118, 10), kind: 'feature', fill: 'eye' },
            { d: circle(310, 118, 10), kind: 'feature', fill: 'eye' },
            { d: circle(261.6, 114, 3.8), kind: 'feature', fill: 'shine' },
            { d: circle(313.6, 114, 3.8), kind: 'feature', fill: 'shine' },
          ],
          children: [
            ear(
              'earN',
              'earN',
              [250, 80],
              [
                [226, 92],
                [230, 24],
                [274, 70],
              ],
              [
                [236, 86],
                [237, 42],
                [264, 72],
              ],
            ),
            ear(
              'earF',
              'earF',
              [318, 80],
              [
                [294, 70],
                [338, 24],
                [342, 92],
              ],
              [
                [304, 72],
                [331, 42],
                [332, 86],
              ],
            ),
            {
              id: 'muzzle',
              pivot: [284, 148],
              shapes: [
                { d: ellipse(284, 150, 30, 22), fill: 'pale' },
                {
                  d: 'M271 136Q284 130 297 136Q296 145 284 149Q272 145 271 136Z',
                  kind: 'feature',
                  fill: 'nose',
                },
                {
                  d: ellipse(279, 135.5, 4, 2.2, -10),
                  kind: 'feature',
                  fill: 'shine',
                  opacity: 0.7,
                },
                { d: 'M284 149L284 155', kind: 'line', stroke: 'mouth', width: 2.6 },
                {
                  d: 'M272 154Q278 161 284 155Q290 161 296 154',
                  kind: 'line',
                  stroke: 'mouth',
                  width: 2.6,
                },
              ],
            },
          ],
        },
      ],
    },
  ],
};

export default wolf;
