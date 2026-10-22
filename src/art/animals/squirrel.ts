import {
  capsule,
  circle,
  ellipse,
  f,
  leaf,
  smooth,
  spline,
  translatePath,
  tube,
  type Pt,
} from '../core/paths';
import type { AnimalDef, PartNode, Shape } from '../core/types';

const GROUND = 260;

const TAIL: Pt[] = [
  [104, 236],
  [70, 232],
  [42, 214],
  [28, 182],
  [28, 144],
  [40, 108],
  [58, 78],
  [68, 50],
  [62, 26],
  [44, 12],
  [24, 16],
  [15, 32],
];
const tailLine = spline(TAIL, 90);
const tailRadius = (t: number) =>
  16 + 19 * Math.sin(Math.PI * Math.min(1, 0.92 * Math.pow(t, 0.75)));

const tailPuffs = (n: number): Shape[] =>
  Array.from({ length: n + 1 }, (_, k): Shape => {
    const t = k / n;
    const [x, y] = tailLine[Math.round(t * (tailLine.length - 1))];
    return { d: circle(x, y, tailRadius(t)), fill: 'fur' };
  });

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

const ear = (id: string, pts: Pt[], inner: Pt[], tuft: number, rotate: number): PartNode => ({
  id,
  behind: true,
  pivot: [(pts[0][0] + pts[2][0]) / 2, (pts[0][1] + pts[2][1]) / 2],
  motion: { rotate, freq: 2, phase: 0.2 },
  shapes: [
    { d: roundTri(pts, 9), fill: 'fur' },
    { d: leaf(pts[1][0], pts[1][1] + 6, 20, 5, tuft), fill: 'fur' },
    { d: roundTri(inner, 6), kind: 'detail', fill: 'earInner' },
  ],
});

const offset = (parts: PartNode[], dx: number, dy: number): PartNode[] =>
  parts.map((p): PartNode => ({
    ...p,
    pivot: p.pivot && [p.pivot[0] + dx, p.pivot[1] + dy],
    shapes: p.shapes?.map((s) => ({ ...s, d: translatePath(s.d, dx, dy) })),
    children: p.children && offset(p.children, dx, dy),
  }));

const squirrel: AnimalDef = {
  id: 'squirrel',
  name: 'Squirrel',
  kind: 'animal',
  aliases: ['red squirrel', 'chipmunk', 'squirrely', 'nutkin'],
  group: 'mammal',
  habitats: ['forest'],
  box: [205, GROUND + 16],
  size: 90,
  locomotion: 'hop',
  gait: { period: 0.6, lift: 38, stride: 100 },
  sound: 'squirrel',
  palette: {
    fur: '#c8642e',
    furDark: '#a94f25',
    furLight: '#e48d52',
    cream: '#fde8cf',
    earInner: '#f5b8a2',
    nose: '#3d2620',
    toe: '#8f4320',
    nut: '#e2a752',
    cap: '#8a5a32',
    capLight: '#a87447',
    stem: '#6b4426',
  },
  parts: offset(
    [
      {
        id: 'body',
        role: 'body',
        pivot: [128, GROUND],
        shapes: [
          {
            d: smooth([
              [118, 120],
              [152, 116],
              [174, 134],
              [184, 168],
              [184, 206],
              [174, 236],
              [148, 254],
              [110, 256],
              [84, 244],
              [74, 214],
              [80, 176],
              [96, 140],
            ]),
            fill: 'fur',
          },
          { d: ellipse(160, 196, 24, 46, -6), kind: 'detail', fill: 'cream' },
        ],
        children: [
          {
            id: 'tail',
            role: 'tail',
            pivot: [96, 240],
            behind: true,
            motion: { rotate: 5, phase: 0.2 },
            shapes: [
              ...tailPuffs(15),
              {
                d: tube(TAIL.slice(1, 10), (t) => 7 + 9 * Math.sin(Math.PI * t), 80),
                kind: 'detail',
                fill: 'furLight',
              },
            ],
          },
          {
            id: 'footF',
            role: 'legBF',
            pivot: [128, 226],
            behind: true,
            shapes: [{ d: ellipse(160, 252, 26, 8), fill: 'furDark' }],
          },
          {
            id: 'haunch',
            role: 'legBN',
            pivot: [110, 222],
            shapes: [
              { d: circle(110, 222, 32), fill: 'fur' },
              { d: ellipse(136, 251, 32, 9), fill: 'fur' },
              { d: `M156 252L156 257`, kind: 'line', stroke: 'toe', width: 2.2 },
              { d: `M163 251L163 256`, kind: 'line', stroke: 'toe', width: 2.2 },
            ],
          },
          {
            id: 'head',
            role: 'head',
            pivot: [140, 128],
            shapes: [
              {
                d: smooth([
                  [146, 44],
                  [176, 52],
                  [192, 78],
                  [193, 104],
                  [178, 124],
                  [146, 133],
                  [114, 124],
                  [99, 104],
                  [100, 78],
                  [116, 52],
                ]),
                fill: 'fur',
              },
              { d: ellipse(146, 114, 32, 18), kind: 'detail', fill: 'cream' },
              { d: ellipse(115, 104, 8.5, 5.5), kind: 'feature', fill: 'blush', opacity: 0.55 },
              { d: ellipse(177, 104, 8.5, 5.5), kind: 'feature', fill: 'blush', opacity: 0.55 },
              { d: circle(128, 86, 9.5), kind: 'feature', fill: 'eye' },
              { d: circle(164, 86, 9.5), kind: 'feature', fill: 'eye' },
              { d: circle(131.4, 82.4, 3.6), kind: 'feature', fill: 'shine' },
              { d: circle(167.4, 82.4, 3.6), kind: 'feature', fill: 'shine' },
              {
                d: 'M140 100Q146 96 152 100Q151 105 146 107Q141 105 140 100Z',
                kind: 'feature',
                fill: 'nose',
              },
              { d: 'M146 107Q146 113 140 115', kind: 'line', stroke: 'mouth', width: 2.3 },
              { d: 'M146 107Q146 113 152 115', kind: 'line', stroke: 'mouth', width: 2.3 },
            ],
            children: [
              ear(
                'earL',
                [
                  [104, 66],
                  [108, 26],
                  [134, 52],
                ],
                [
                  [111, 60],
                  [113, 38],
                  [127, 53],
                ],
                250,
                -6,
              ),
              ear(
                'earR',
                [
                  [158, 52],
                  [184, 26],
                  [188, 66],
                ],
                [
                  [165, 53],
                  [179, 38],
                  [181, 60],
                ],
                290,
                6,
              ),
            ],
          },
          {
            id: 'paws',
            role: 'legFN',
            pivot: [152, 144],
            motion: { rotate: 3, phase: 0.1 },
            shapes: [
              { d: capsule(128, 144, 137, 172, 8.5, 7.5), fill: 'fur' },
              { d: capsule(176, 142, 180, 170, 8.5, 7.5), fill: 'fur' },
              { d: ellipse(138, 173, 9, 8), fill: 'fur' },
              { d: ellipse(179, 171, 9, 8), fill: 'fur' },
            ],
            children: [
              {
                id: 'acorn',
                behind: true,
                pivot: [158, 160],
                shapes: [
                  { d: ellipse(158, 170, 17, 19), fill: 'nut' },
                  {
                    d: ellipse(151, 166, 4, 5.5, 20),
                    kind: 'feature',
                    fill: 'white',
                    opacity: 0.55,
                  },
                  {
                    d: 'M136 157Q135 136 158 134Q181 136 180 157Q158 163 136 157Z',
                    fill: 'cap',
                  },
                  { d: ellipse(148, 145, 3.4, 2.3), kind: 'detail', fill: 'capLight' },
                  { d: ellipse(160, 143, 3.4, 2.3), kind: 'detail', fill: 'capLight' },
                  { d: ellipse(171, 147, 3.4, 2.3), kind: 'detail', fill: 'capLight' },
                  { d: ellipse(142, 153, 3.4, 2.3), kind: 'detail', fill: 'capLight' },
                  { d: ellipse(154, 152, 3.4, 2.3), kind: 'detail', fill: 'capLight' },
                  { d: ellipse(166, 153, 3.4, 2.3), kind: 'detail', fill: 'capLight' },
                  { d: 'M158.5 135Q159 131 162.5 129', kind: 'line', stroke: 'stem', width: 3.2 },
                ],
              },
            ],
          },
        ],
      },
    ],
    9,
    16,
  ),
};

export default squirrel;
