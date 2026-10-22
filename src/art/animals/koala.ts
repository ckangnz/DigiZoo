import {
  capsule,
  circle,
  curve,
  ellipse,
  leaf,
  scallop,
  smooth,
  translatePath,
  tube,
  type Pt,
} from '../core/paths';
import type { AnimalDef, PartNode, Shape } from '../core/types';

const GROUND = 300;
const STEM_A: Pt = [78, 268];
const STEM_B: Pt = [222, 150];
const along = (t: number): Pt => [
  STEM_A[0] + (STEM_B[0] - STEM_A[0]) * t,
  STEM_A[1] + (STEM_B[1] - STEM_A[1]) * t,
];

const ear = (id: string, x: number, y: number, side: 1 | -1): PartNode => ({
  id,
  behind: true,
  pivot: [x - side * 18, y + 22],
  motion: { rotate: side * 5, phase: 0.3, freq: 2 },
  shapes: [
    { d: scallop(x, y, 36, 12, 5.5), fill: 'fur' },
    { d: scallop(x + side * 5, y + 2, 23, 10, 4), kind: 'detail', fill: 'fluff' },
  ],
});

const leg = (id: string, x: number): PartNode => ({
  id,
  role: id,
  behind: true,
  pivot: [x, 252],
  shapes: [
    { d: capsule(x, 248, x, GROUND - 16, 19, 17), fill: 'fur' },
    { d: ellipse(x + (x < 125 ? -4 : 4), GROUND - 11, 23, 11.5), fill: 'fur' },
  ],
});

const gumLeaf = (from: Pt, len: number, angle: number, dark = false): Shape => ({
  d: leaf(from[0], from[1], len, len * 0.2, angle),
  fill: dark ? 'leafDark' : 'leaf',
});

const branch: PartNode = {
  id: 'branch',
  pivot: along(0.5),
  shapes: [
    gumLeaf(along(0.96), 48, -62, true),
    gumLeaf(along(1), 52, -18),
    gumLeaf(along(0.98), 46, 26, true),
    gumLeaf(along(0.84), 44, -94),
    gumLeaf(along(0.8), 42, 58),
    gumLeaf(along(0.9), 40, -128, true),
    {
      d: tube([STEM_A, along(0.5), STEM_B], (u) => 6.5 - 2.5 * u, 32),
      fill: 'stem',
    },
    { d: circle(along(1.02)[0], along(1.02)[1], 6), fill: 'gumnut' },
  ],
};

const arm = (id: string, shoulder: Pt, elbow: Pt, t: number, phase: number): PartNode => {
  const paw = along(t);
  return {
    id,
    pivot: shoulder,
    motion: { rotate: 2, phase },
    shapes: [
      { d: capsule(shoulder[0], shoulder[1], elbow[0], elbow[1], 17, 15), fill: 'fur' },
      { d: capsule(elbow[0], elbow[1], paw[0], paw[1], 15, 13), fill: 'fur' },
      { d: ellipse(paw[0], paw[1], 14, 12.5), fill: 'fur' },
      ...[-4.5, 4.5].map((dy): Shape => ({
        d: curve(paw[0] - 3, paw[1] + dy - 3, paw[0] + 4, paw[1] + dy + 3, 2),
        kind: 'line',
        stroke: 'furLine',
        width: 2.1,
      })),
    ],
  };
};

const LIFT = 22;

const offset = (parts: PartNode[], dx: number, dy: number): PartNode[] =>
  parts.map((p): PartNode => ({
    ...p,
    pivot: p.pivot && [p.pivot[0] + dx, p.pivot[1] + dy],
    shapes: p.shapes?.map((s) => ({ ...s, d: translatePath(s.d, dx, dy) })),
    children: p.children && offset(p.children, dx, dy),
  }));

const koala: AnimalDef = {
  id: 'koala',
  name: 'Koala',
  kind: 'animal',
  aliases: ['koala bear', 'native bear', 'baby koala'],
  group: 'mammal',
  habitats: ['aussie'],
  box: [272, GROUND - LIFT],
  size: 140,
  locomotion: 'waddle',
  gait: { period: 0.8, stride: 30 },
  sound: 'koala',
  palette: {
    fur: '#a3a7b3',
    furLine: '#767b88',
    belly: '#f1ede8',
    fluff: '#f7f4f0',
    nose: '#37333d',
    leaf: '#86b99a',
    leafDark: '#6a9f80',
    stem: '#9b6e4c',
    gumnut: '#a7835f',
  },
  parts: offset(
    [
      {
        id: 'body',
        role: 'body',
        pivot: [125, 262],
        shapes: [
          {
            d: smooth([
              [125, 140],
              [168, 152],
              [192, 196],
              [194, 240],
              [176, 270],
              [125, 282],
              [74, 270],
              [56, 240],
              [58, 196],
              [82, 152],
            ]),
            fill: 'fur',
          },
          { d: ellipse(125, 226, 46, 50), kind: 'detail', fill: 'belly' },
        ],
        children: [
          leg('legF', 94),
          leg('legN', 156),
          branch,
          arm('armF', [76, 182], [84, 224], 0.3, 0),
          arm('armN', [174, 180], [186, 212], 0.55, 0.5),
          {
            id: 'head',
            role: 'head',
            pivot: [125, 160],
            shapes: [
              {
                d: smooth([
                  [125, 46],
                  [170, 52],
                  [198, 80],
                  [204, 118],
                  [190, 152],
                  [158, 172],
                  [125, 176],
                  [92, 172],
                  [60, 152],
                  [46, 118],
                  [52, 80],
                  [80, 52],
                ]),
                fill: 'fur',
              },
              { d: ellipse(125, 156, 40, 20), kind: 'detail', fill: 'belly' },
              { d: ellipse(76, 136, 11, 7), kind: 'feature', fill: 'blush', opacity: 0.55 },
              { d: ellipse(174, 136, 11, 7), kind: 'feature', fill: 'blush', opacity: 0.55 },
              { d: circle(88, 108, 9.8), kind: 'feature', fill: 'eye' },
              { d: circle(162, 108, 9.8), kind: 'feature', fill: 'eye' },
              { d: circle(91.6, 104.2, 3.7), kind: 'feature', fill: 'shine' },
              { d: circle(165.6, 104.2, 3.7), kind: 'feature', fill: 'shine' },
              {
                d: smooth([
                  [125, 90],
                  [138, 94],
                  [144, 112],
                  [145, 132],
                  [136, 146],
                  [125, 149],
                  [114, 146],
                  [105, 132],
                  [106, 112],
                  [112, 94],
                ]),
                kind: 'feature',
                fill: 'nose',
              },
              { d: ellipse(119, 104, 4, 7, 10), kind: 'feature', fill: 'shine', opacity: 0.45 },
              { d: curve(114, 158, 136, 158, 5), kind: 'line', stroke: 'mouth', width: 2.8 },
            ],
            children: [ear('earF', 50, 70, -1), ear('earN', 200, 70, 1)],
          },
        ],
      },
    ],
    0,
    -LIFT,
  ),
};

export default koala;
