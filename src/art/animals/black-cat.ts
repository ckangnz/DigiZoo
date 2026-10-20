import { capsule, circle, ellipse, f, smooth, tube, type Pt } from '../core/paths';
import type { AnimalDef, PartNode, Shape } from '../core/types';

const roundTri = (pts: Pt[], r: number): string => {
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
};

const TAIL: Pt[] = [
  [84, 182],
  [60, 172],
  [46, 150],
  [42, 122],
  [46, 94],
  [60, 76],
  [78, 72],
  [90, 82],
  [88, 98],
  [76, 102],
];

const leg = (id: string, x: number, far: boolean): PartNode => ({
  id,
  role: id,
  behind: true,
  pivot: [x, 204],
  shapes: [
    { d: capsule(x, 204, x, 250, 13.5, 12.5), fill: far ? 'furDark' : 'fur' },
    { d: ellipse(x + 3, 258, 16, 10.5), fill: far ? 'furDark' : 'fur' },
    ...(far
      ? []
      : [
          { d: `M${x + 6} 262L${x + 6} 267`, kind: 'line' as const, stroke: 'toe', width: 2.2 },
          { d: `M${x + 12} 261L${x + 12} 266`, kind: 'line' as const, stroke: 'toe', width: 2.2 },
        ]),
  ],
});

const eye = (x: number, y: number): Shape[] => [
  { d: ellipse(x, y, 15.5, 16.5), kind: 'feature', fill: 'iris' },
  { d: ellipse(x + 1, y + 1.5, 9, 11.5), kind: 'feature', fill: 'eye' },
  { d: circle(x + 4.6, y - 3.4, 4.4), kind: 'feature', fill: 'shine' },
  { d: circle(x - 3.2, y + 6, 1.8), kind: 'feature', fill: 'shine' },
];

const blackCat: AnimalDef = {
  id: 'black-cat',
  name: 'Black Cat',
  aliases: ['spooky cat', 'halloween cat', 'witch cat', 'midnight'],
  group: 'mammal',
  habitats: ['halloween'],
  box: [330, 272],
  size: 130,
  locomotion: 'walk4',
  gait: { stride: 96 },
  sound: 'black-cat',
  palette: {
    fur: '#3d3552',
    furDark: '#2c263c',
    sheen: '#574b78',
    muzzle: '#4c4366',
    earInner: '#c98ab4',
    iris: '#cdeb57',
    nose: '#ff9fc0',
    whisker: '#b9a9d9',
    toe: '#6a5d8c',
    collar: '#9c5de6',
    bell: '#ffd23f',
    bellDark: '#c99a1c',
    blush: '#ff7eb0',
  },
  parts: [
    {
      id: 'body',
      role: 'body',
      pivot: [152, 204],
      shapes: [
        {
          d: smooth([
            [78, 192],
            [88, 162],
            [118, 144],
            [158, 140],
            [196, 148],
            [236, 156],
            [268, 172],
            [274, 198],
            [250, 220],
            [216, 230],
            [172, 234],
            [122, 234],
            [88, 222],
          ]),
          fill: 'fur',
        },
        { d: ellipse(146, 152, 40, 8, -4), kind: 'detail', fill: 'sheen' },
      ],
      children: [
        {
          id: 'tail',
          role: 'tail',
          pivot: [84, 182],
          behind: true,
          shapes: [
            { d: tube(TAIL, (t) => 9 - 2.5 * t, 90), fill: 'fur' },
            { d: ellipse(48, 118, 3.5, 16, 4), kind: 'detail', fill: 'sheen' },
          ],
        },
        leg('legBF', 118, true),
        leg('legFF', 218, true),
        leg('legBN', 96, false),
        leg('legFN', 196, false),
        {
          id: 'head',
          role: 'head',
          pivot: [230, 172],
          shapes: [
            {
              d: roundTri(
                [
                  [194, 98],
                  [196, 30],
                  [240, 64],
                ],
                9,
              ),
              fill: 'fur',
            },
            {
              d: roundTri(
                [
                  [262, 62],
                  [306, 28],
                  [306, 98],
                ],
                9,
              ),
              fill: 'fur',
            },
            { d: ellipse(250, 114, 68, 57), fill: 'fur' },
            {
              d: roundTri(
                [
                  [204, 82],
                  [205, 48],
                  [228, 66],
                ],
                6,
              ),
              kind: 'detail',
              fill: 'earInner',
            },
            {
              d: roundTri(
                [
                  [272, 64],
                  [296, 46],
                  [296, 82],
                ],
                6,
              ),
              kind: 'detail',
              fill: 'earInner',
            },
            { d: ellipse(216, 72, 16, 7, -24), kind: 'detail', fill: 'sheen' },
            { d: ellipse(250, 146, 30, 19), kind: 'detail', fill: 'muzzle' },
            { d: ellipse(202, 136, 12, 7), kind: 'feature', fill: 'blush', opacity: 0.6 },
            { d: ellipse(298, 136, 12, 7), kind: 'feature', fill: 'blush', opacity: 0.6 },
            ...eye(222, 108),
            ...eye(278, 108),
            {
              d: 'M243 134Q250 130 257 134Q255 140 250 142Q245 140 243 134Z',
              kind: 'feature',
              fill: 'nose',
            },
            {
              d: 'M250 142Q250 149 243 151Q238 151 236 147',
              kind: 'line',
              stroke: 'whisker',
              width: 2.6,
            },
            {
              d: 'M250 142Q250 149 257 151Q262 151 264 147',
              kind: 'line',
              stroke: 'whisker',
              width: 2.6,
            },
            { d: 'M222 142L192 136', kind: 'line', stroke: 'whisker', width: 2.2 },
            { d: 'M222 149L190 151', kind: 'line', stroke: 'whisker', width: 2.2 },
            { d: 'M278 142L308 136', kind: 'line', stroke: 'whisker', width: 2.2 },
            { d: 'M278 149L310 151', kind: 'line', stroke: 'whisker', width: 2.2 },
          ],
          children: [
            {
              id: 'collar',
              behind: true,
              pivot: [250, 172],
              shapes: [
                {
                  d: tube(
                    [
                      [210, 160],
                      [230, 173],
                      [250, 178],
                      [270, 173],
                      [290, 160],
                    ],
                    7,
                    60,
                  ),
                  fill: 'collar',
                },
              ],
              children: [
                {
                  id: 'bell',
                  pivot: [250, 182],
                  motion: { rotate: 10, freq: 2, phase: 0.2 },
                  shapes: [
                    { d: circle(250, 192, 11), fill: 'bell' },
                    { d: ellipse(245.5, 187, 4.2, 2.8, -30), kind: 'detail', fill: 'white' },
                    { d: 'M243 195L257 195', kind: 'line', stroke: 'bellDark', width: 2.2 },
                    { d: circle(250, 199.5, 2.1), kind: 'feature', fill: 'bellDark' },
                  ],
                },
              ],
            },
          ],
        },
      ],
    },
  ],
};

export default blackCat;
