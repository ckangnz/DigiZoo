import { capsule, circle, ellipse, f, tube, type Pt } from '../core/paths';
import type { AnimalDef, PartNode } from '../core/types';

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
  [80, 188],
  [54, 184],
  [38, 166],
  [31, 140],
  [32, 112],
  [41, 90],
  [57, 81],
  [71, 88],
  [72, 103],
  [61, 109],
];

const leg = (id: string, x: number, far: boolean): PartNode => ({
  id,
  role: id,
  behind: true,
  pivot: [x, 200],
  shapes: [
    { d: capsule(x, 200, x, 246, 14, 13), fill: far ? 'furDark' : 'fur' },
    { d: ellipse(x + 3, 254, 16, 10.5), fill: far ? 'furDark' : 'fur' },
    { d: ellipse(x + 2, 254, 22, 16), kind: 'detail', fill: far ? 'sockDark' : 'white' },
    ...(far
      ? []
      : [
          { d: `M${x + 6} 258L${x + 6} 263`, kind: 'line' as const, stroke: 'toe', width: 2.2 },
          { d: `M${x + 12} 257L${x + 12} 262`, kind: 'line' as const, stroke: 'toe', width: 2.2 },
        ]),
  ],
});

const cat: AnimalDef = {
  id: 'cat',
  name: 'Cat',
  aliases: ['kitty', 'kitten', 'pussycat', 'kitty cat', 'meow'],
  group: 'mammal',
  habitats: ['farm'],
  box: [320, 268],
  size: 120,
  locomotion: 'walk4',
  gait: { stride: 96 },
  sound: 'cat',
  palette: {
    fur: '#a9b8d0',
    furDark: '#93a3be',
    sockDark: '#e3e7f0',
    earInner: '#f7b3c3',
    nose: '#f28da2',
    whisker: '#73809a',
    toe: '#b9c0d2',
  },
  parts: [
    {
      id: 'body',
      role: 'body',
      pivot: [150, 200],
      shapes: [
        { d: ellipse(150, 192, 80, 47), fill: 'fur' },
        { d: ellipse(230, 204, 30, 40, -10), kind: 'detail', fill: 'white' },
        { d: ellipse(150, 240, 56, 14), kind: 'detail', fill: 'white' },
      ],
      children: [
        {
          id: 'tail',
          role: 'tail',
          pivot: [80, 188],
          behind: true,
          shapes: [{ d: tube(TAIL, (t) => 8.5 - 2 * t, 90), fill: 'fur' }],
        },
        leg('legBF', 116, true),
        leg('legFF', 214, true),
        leg('legBN', 94, false),
        leg('legFN', 194, false),
        {
          id: 'head',
          role: 'head',
          pivot: [214, 170],
          shapes: [
            {
              d: roundTri(
                [
                  [180, 104],
                  [186, 40],
                  [228, 74],
                ],
                9,
              ),
              fill: 'fur',
            },
            {
              d: roundTri(
                [
                  [258, 72],
                  [298, 36],
                  [304, 102],
                ],
                9,
              ),
              fill: 'fur',
            },
            { d: ellipse(242, 118, 66, 56), fill: 'fur' },
            {
              d: roundTri(
                [
                  [192, 86],
                  [194, 54],
                  [218, 74],
                ],
                6,
              ),
              kind: 'detail',
              fill: 'earInner',
            },
            {
              d: roundTri(
                [
                  [268, 72],
                  [292, 50],
                  [294, 86],
                ],
                6,
              ),
              kind: 'detail',
              fill: 'earInner',
            },
            { d: ellipse(236, 146, 18, 14), kind: 'detail', fill: 'white' },
            { d: ellipse(258, 146, 18, 14), kind: 'detail', fill: 'white' },
            { d: ellipse(247, 162, 16, 10), kind: 'detail', fill: 'white' },
            { d: ellipse(206, 138, 11, 7), kind: 'feature', fill: 'blush', opacity: 0.5 },
            { d: ellipse(290, 136, 11, 7), kind: 'feature', fill: 'blush', opacity: 0.5 },
            { d: circle(220, 116, 10), kind: 'feature', fill: 'eye' },
            { d: circle(274, 114, 10), kind: 'feature', fill: 'eye' },
            { d: circle(223.6, 112, 3.8), kind: 'feature', fill: 'shine' },
            { d: circle(277.6, 110, 3.8), kind: 'feature', fill: 'shine' },
            {
              d: 'M240 133Q247 129 254 133Q252 139 247 141Q242 139 240 133Z',
              kind: 'feature',
              fill: 'nose',
            },
            {
              d: 'M247 141Q247 148 240 150Q235 150 233 146',
              kind: 'line',
              stroke: 'mouth',
              width: 2.6,
            },
            {
              d: 'M247 141Q247 148 254 150Q259 150 261 146',
              kind: 'line',
              stroke: 'mouth',
              width: 2.6,
            },
            { d: 'M220 142L190 136', kind: 'line', stroke: 'whisker', width: 2.2 },
            { d: 'M220 149L188 151', kind: 'line', stroke: 'whisker', width: 2.2 },
            { d: 'M274 140L304 133', kind: 'line', stroke: 'whisker', width: 2.2 },
            { d: 'M274 147L306 148', kind: 'line', stroke: 'whisker', width: 2.2 },
          ],
        },
      ],
    },
  ],
};

export default cat;
