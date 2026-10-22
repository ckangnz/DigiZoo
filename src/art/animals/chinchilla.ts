import {
  capsule,
  circle,
  ellipse,
  f,
  samplePath,
  scallop,
  smooth,
  spline,
  translatePath,
  type Pt,
} from '../core/paths';
import type { AnimalDef, PartNode, Shape } from '../core/types';

const fluffy = (outline: Pt[], n: number, bump: number): string => {
  const dense = samplePath(smooth(outline), 16);
  const lengths = [0];
  for (let i = 1; i < dense.length; i++) {
    const [ax, ay] = dense[i - 1];
    const [bx, by] = dense[i];
    lengths.push(lengths[i - 1] + Math.hypot(bx - ax, by - ay));
  }
  const total = lengths[lengths.length - 1];
  const pts: Pt[] = [];
  let j = 0;
  for (let k = 0; k < n; k++) {
    const target = (total * k) / n;
    while (j < lengths.length - 2 && lengths[j + 1] < target) j++;
    const u = (target - lengths[j]) / (lengths[j + 1] - lengths[j] || 1);
    pts.push([
      dense[j][0] + (dense[j + 1][0] - dense[j][0]) * u,
      dense[j][1] + (dense[j + 1][1] - dense[j][1]) * u,
    ]);
  }
  let d = `M${f(pts[0][0])} ${f(pts[0][1])}`;
  for (let k = 0; k < n; k++) {
    const [x1, y1] = pts[k];
    const [x2, y2] = pts[(k + 1) % n];
    const chord = Math.hypot(x2 - x1, y2 - y1);
    const rb = (chord * chord) / 4 / (2 * bump) + bump / 2;
    d += `A${f(rb)} ${f(rb)} 0 0 1 ${f(x2)} ${f(y2)}`;
  }
  return d + 'Z';
};

const HIP: Pt = [90, 206];

const hindLeg = (id: string, far: boolean): PartNode => {
  const fill = far ? 'furFar' : 'fur';
  return far
    ? {
        id,
        role: id,
        behind: true,
        pivot: [HIP[0] + 20, HIP[1] - 4],
        shapes: [{ d: ellipse(130, 244, 34, 9.5), fill }],
      }
    : {
        id,
        role: id,
        pivot: HIP,
        shapes: [
          { d: scallop(HIP[0], HIP[1], 36, 12, 3), fill },
          { d: ellipse(110, 246, 38, 10.5), fill },
          { d: ellipse(136, 249, 8, 4), kind: 'detail', fill: 'pad' },
        ],
      };
};

const frontLeg = (id: string, x: number, far: boolean): PartNode => ({
  id,
  role: id,
  behind: true,
  pivot: [x, 212],
  shapes: [
    { d: capsule(x, 212, x + 4, 240, 9.5, 8), fill: far ? 'furFar' : 'fur' },
    { d: ellipse(x + 7, 245, 11, 7), fill: far ? 'furFar' : 'fur' },
  ],
});

const ear = (id: string, cx: number, cy: number, tilt: number, far: boolean): PartNode => ({
  id,
  role: 'ear',
  behind: true,
  pivot: [cx + (far ? 12 : -12), cy + 26],
  motion: { rotate: far ? -7 : 7, phase: far ? 0.48 : 0.44 },
  shapes: [
    { d: ellipse(cx, cy, 29, 34, tilt), fill: far ? 'earFar' : 'ear' },
    { d: ellipse(cx, cy + 3, 19.5, 24.5, tilt), kind: 'detail', fill: 'earInner' },
  ],
});

const TAIL: Pt[] = [
  [64, 216],
  [40, 214],
  [22, 200],
  [16, 178],
  [24, 158],
  [42, 148],
];

const tailShapes = (): Shape[] => {
  const pts = spline(TAIL, 9);
  return pts.map(([x, y], i) => ({
    d: scallop(x, y, 9 + i * 0.85, 7, 3.4, i * 23),
    fill: 'tail',
  }));
};

const offset = (parts: PartNode[], dx: number, dy: number): PartNode[] =>
  parts.map((p): PartNode => ({
    ...p,
    pivot: p.pivot && [p.pivot[0] + dx, p.pivot[1] + dy],
    shapes: p.shapes?.map((s) => ({ ...s, d: translatePath(s.d, dx, dy) })),
    children: p.children && offset(p.children, dx, dy),
  }));

const chinchilla: AnimalDef = {
  id: 'chinchilla',
  name: 'Chinchilla',
  kind: 'animal',
  aliases: ['chinchi', 'chilla', 'fluffy chinchilla'],
  group: 'mammal',
  habitats: ['pets'],
  box: [243, 242],
  size: 80,
  locomotion: 'hop',
  gait: { lift: 44 },
  sound: 'chinchilla',
  palette: {
    fur: '#aab1bf',
    furTop: '#9da4b3',
    furFar: '#959cab',
    belly: '#eeece9',
    muzzle: '#d8dbe3',
    ear: '#b9bcc8',
    earFar: '#a3a7b5',
    earInner: '#f3c2cc',
    pad: '#f3c2cc',
    tail: '#858c9b',
    nose: '#f29aac',
    whisker: '#6f7686',
  },
  parts: offset(
    [
      {
        id: 'body',
        role: 'body',
        pivot: [120, 252],
        shapes: [
          {
            d: fluffy(
              [
                [60, 162],
                [86, 134],
                [124, 124],
                [160, 134],
                [184, 160],
                [194, 198],
                [182, 230],
                [146, 246],
                [100, 248],
                [64, 234],
                [44, 206],
                [44, 182],
              ],
              30,
              3,
            ),
            fill: 'fur',
          },
          { d: ellipse(108, 140, 86, 32, -8), kind: 'detail', fill: 'furTop' },
          { d: scallop(192, 214, 30, 10, 3, 0, 24, 40), kind: 'detail', fill: 'belly' },
        ],
        children: [
          {
            id: 'tail',
            role: 'tail',
            behind: true,
            pivot: [60, 214],
            shapes: tailShapes(),
          },
          hindLeg('legBF', true),
          frontLeg('legFF', 150, true),
          frontLeg('legFN', 166, false),
          hindLeg('legBN', false),
          {
            id: 'head',
            role: 'head',
            pivot: [170, 156],
            shapes: [
              { d: scallop(172, 106, 50, 18, 3.4), fill: 'fur' },
              { d: scallop(134, 128, 20, 8, 3.4), fill: 'fur' },
              { d: scallop(210, 128, 20, 8, 3.4), fill: 'fur' },
              { d: ellipse(172, 132, 25, 16), kind: 'detail', fill: 'muzzle' },
              { d: ellipse(144, 124, 10, 6.5), kind: 'feature', fill: 'blush', opacity: 0.55 },
              { d: ellipse(200, 124, 10, 6.5), kind: 'feature', fill: 'blush', opacity: 0.55 },
              { d: circle(154, 102, 12), kind: 'feature', fill: 'eye' },
              { d: circle(190, 102, 12), kind: 'feature', fill: 'eye' },
              { d: circle(158.4, 97.4, 4.6), kind: 'feature', fill: 'shine' },
              { d: circle(194.4, 97.4, 4.6), kind: 'feature', fill: 'shine' },
              { d: circle(150, 106.6, 1.8), kind: 'feature', fill: 'shine' },
              { d: circle(186, 106.6, 1.8), kind: 'feature', fill: 'shine' },
              {
                d: 'M166 118Q172 115 178 118Q177 123 172 125Q167 123 166 118Z',
                kind: 'feature',
                fill: 'nose',
              },
              {
                d: 'M172 125Q172 131 166 133Q162 133 160 130',
                kind: 'line',
                stroke: 'mouth',
                width: 2.4,
              },
              {
                d: 'M172 125Q172 131 178 133Q182 133 184 130',
                kind: 'line',
                stroke: 'mouth',
                width: 2.4,
              },
              { d: 'M152 124L116 116', kind: 'line', stroke: 'whisker', width: 1.8 },
              { d: 'M152 130L115 133', kind: 'line', stroke: 'whisker', width: 1.8 },
              { d: 'M192 124L228 116', kind: 'line', stroke: 'whisker', width: 1.8 },
              { d: 'M192 130L229 133', kind: 'line', stroke: 'whisker', width: 1.8 },
            ],
            children: [ear('earF', 136, 54, -24, true), ear('earN', 206, 52, 22, false)],
          },
        ],
      },
    ],
    3,
    -15,
  ),
};

export default chinchilla;
