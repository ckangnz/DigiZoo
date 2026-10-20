import {
  capsule,
  circle,
  ellipse,
  f,
  mirrorPath,
  smooth,
  spline,
  tube,
  type Pt,
} from '../core/paths';
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
  [104, 164],
  [70, 160],
  [44, 140],
  [32, 110],
  [34, 80],
  [48, 56],
];
const tailLine = spline(TAIL, 60);
const tailRadius = (t: number) => 17 + 7 * Math.sin(Math.PI * Math.min(1, 0.15 + t * 0.95));

const ring = (t: number, w: number): string => {
  const i = Math.round(t * (tailLine.length - 1));
  const a = tailLine[Math.max(0, i - 1)];
  const b = tailLine[Math.min(tailLine.length - 1, i + 1)];
  const angle = (Math.atan2(b[1] - a[1], b[0] - a[0]) * 180) / Math.PI;
  return ellipse(tailLine[i][0], tailLine[i][1], w, 34, angle);
};

const leg = (id: string, x: number, far: boolean): PartNode => {
  const fill = far ? 'legDark' : 'leg';
  return {
    id,
    role: id,
    behind: true,
    pivot: [x, 180],
    shapes: [
      { d: capsule(x, 180, x, 232, 14, 13), fill },
      { d: ellipse(x + 3, 243, 16, 11), fill },
      ...(far
        ? []
        : [
            { d: `M${x + 6} 247L${x + 6} 252`, kind: 'line' as const, stroke: 'toe', width: 2.2 },
            { d: `M${x + 12} 246L${x + 12} 251`, kind: 'line' as const, stroke: 'toe', width: 2.2 },
          ]),
    ],
  };
};

const mark = (d: string): Shape => ({ d, kind: 'detail', fill: 'mark' });

const RUFF = smooth(
  [
    [236, 104],
    [214, 108],
    [198, 120],
    [205, 129],
    [196, 141],
    [207, 148],
    [206, 160],
    [224, 160],
    [244, 148],
  ],
  true,
  1,
);

const redPanda: AnimalDef = {
  id: 'red-panda',
  name: 'Red Panda',
  kind: 'animal',
  aliases: ['lesser panda', 'firefox', 'fire fox', 'panda', 'red cat bear'],
  group: 'mammal',
  habitats: ['jungle'],
  box: [344, 256],
  size: 130,
  locomotion: 'walk4',
  gait: { stride: 98, swing: 20 },
  sound: 'red-panda',
  palette: {
    fur: '#d9612e',
    furDark: '#b94c24',
    ring: '#f5b47c',
    mark: '#fff6ea',
    leg: '#4d2c24',
    legDark: '#3c221c',
    earInner: '#6e3222',
    nose: '#2f1d1a',
    toe: '#2a1814',
  },
  parts: [
    {
      id: 'body',
      role: 'body',
      pivot: [168, 182],
      shapes: [
        { d: ellipse(168, 168, 86, 45), fill: 'fur' },
        { d: ellipse(172, 216, 76, 20), kind: 'detail', fill: 'leg' },
        { d: ellipse(218, 204, 20, 30), kind: 'detail', fill: 'leg' },
      ],
      children: [
        {
          id: 'tail',
          role: 'tail',
          pivot: [100, 162],
          behind: true,
          shapes: [
            { d: tube(TAIL, tailRadius, 90), fill: 'fur' },
            { d: ring(0.3, 9), kind: 'detail', fill: 'ring' },
            { d: ring(0.55, 9), kind: 'detail', fill: 'ring' },
            { d: ring(0.8, 9), kind: 'detail', fill: 'ring' },
            { d: ring(1, 12), kind: 'detail', fill: 'furDark' },
          ],
        },
        leg('legBF', 128, true),
        leg('legFF', 238, true),
        leg('legBN', 104, false),
        leg('legFN', 214, false),
        {
          id: 'head',
          role: 'head',
          pivot: [258, 166],
          shapes: [
            {
              d: roundTri(
                [
                  [206, 106],
                  [214, 50],
                  [260, 74],
                ],
                20,
              ),
              fill: 'mark',
            },
            {
              d: roundTri(
                [
                  [278, 74],
                  [324, 50],
                  [332, 106],
                ],
                20,
              ),
              fill: 'mark',
            },
            { d: RUFF, fill: 'mark' },
            { d: mirrorPath(RUFF, 269), fill: 'mark' },
            { d: ellipse(269, 114, 64, 52), fill: 'fur' },
            {
              d: roundTri(
                [
                  [219, 96],
                  [224, 64],
                  [250, 78],
                ],
                11,
              ),
              kind: 'detail',
              fill: 'earInner',
            },
            {
              d: roundTri(
                [
                  [288, 78],
                  [314, 64],
                  [319, 96],
                ],
                11,
              ),
              kind: 'detail',
              fill: 'earInner',
            },
            mark(ellipse(246, 86, 10.5, 7, -18)),
            mark(ellipse(292, 84, 10.5, 7, 18)),
            mark(ellipse(220, 140, 28, 24, 20)),
            mark(ellipse(318, 138, 28, 24, -20)),
            mark(ellipse(269, 145, 27, 21)),
            { d: ellipse(233, 134, 10, 6.5), kind: 'feature', fill: 'blush', opacity: 0.55 },
            { d: ellipse(305, 132, 10, 6.5), kind: 'feature', fill: 'blush', opacity: 0.55 },
            { d: circle(248, 110, 9.5), kind: 'feature', fill: 'eye' },
            { d: circle(290, 108, 9.5), kind: 'feature', fill: 'eye' },
            { d: circle(251.5, 106, 3.6), kind: 'feature', fill: 'shine' },
            { d: circle(293.5, 104, 3.6), kind: 'feature', fill: 'shine' },
            {
              d: 'M261 130Q269 125 277 130Q275 137 269 139Q263 137 261 130Z',
              kind: 'feature',
              fill: 'nose',
            },
            {
              d: 'M269 139Q269 147 262 149Q257 149 255 145',
              kind: 'line',
              stroke: 'mouth',
              width: 2.6,
            },
            {
              d: 'M269 139Q269 147 276 149Q281 149 283 145',
              kind: 'line',
              stroke: 'mouth',
              width: 2.6,
            },
          ],
        },
      ],
    },
  ],
};

export default redPanda;
