import { circle, curve, ellipse, poly, smooth, translatePath, type Pt } from '../core/paths';
import type { AnimalDef, PartNode, Shape } from '../core/types';

const place = (base: Pt, angle: number, pts: Pt[]): Pt[] => {
  const a = (angle * Math.PI) / 180;
  const c = Math.cos(a);
  const s = Math.sin(a);
  return pts.map(([u, v]) => [base[0] + u * c - v * s, base[1] + u * s + v * c]);
};

const strokes = (pts: Pt[], width: number): Shape[] =>
  [0, 2, 4].map((i) => ({
    d: poly([pts[i], pts[i + 1]], false),
    kind: 'line',
    stroke: 'toe',
    width,
  }));

const hindFlipper = (id: string, base: Pt, angle: number, far: boolean): PartNode => {
  const L = 56;
  const outline = place(base, angle, [
    [0, -11],
    [24, -15],
    [L - 10, -22],
    [L - 1, -21],
    [L + 2, -14],
    [L - 6, -7],
    [L + 4, 0],
    [L - 6, 7],
    [L + 2, 14],
    [L - 1, 21],
    [L - 10, 22],
    [24, 15],
    [0, 11],
  ]);
  const toes = place(base, angle, [
    [22, -6],
    [L - 6, -15],
    [26, 0],
    [L - 3, 0],
    [22, 6],
    [L - 6, 15],
  ]);
  const lines = far ? [] : strokes(toes, 2.4);
  return {
    id,
    role: id,
    behind: true,
    pivot: base,
    shapes: [{ d: smooth(outline), fill: far ? 'furDark' : 'fur' }, ...lines],
  };
};

const frontFlipper = (id: string, base: Pt, angle: number, far: boolean): PartNode => {
  const outline = place(base, angle, [
    [0, -13],
    [18, -16],
    [36, -14],
    [48, -8],
    [51, 1],
    [44, 9],
    [26, 12],
    [8, 12],
    [-4, 6],
  ]);
  const claws = place(base, angle, [
    [37, -8],
    [44, -9],
    [39, -1],
    [46, -1],
    [37, 6],
    [43, 6],
  ]);
  const lines = far ? [] : strokes(claws, 2.2);
  return {
    id,
    role: id,
    behind: far,
    pivot: base,
    motion: { rotate: 12, phase: far ? 0.5 : 0 },
    shapes: [{ d: smooth(outline), fill: far ? 'furDark' : 'fur' }, ...lines],
  };
};

const offset = (parts: PartNode[], dx: number, dy: number): PartNode[] =>
  parts.map((p): PartNode => ({
    ...p,
    pivot: p.pivot && [p.pivot[0] + dx, p.pivot[1] + dy],
    shapes: p.shapes?.map((s) => ({ ...s, d: translatePath(s.d, dx, dy) })),
    children: p.children && offset(p.children, dx, dy),
  }));

const SPOTS: [number, number, number, number, number][] = [
  [212, 84, 6, 4.5, 20],
  [188, 100, 4.5, 3.5, -10],
  [166, 80, 5.5, 4, 30],
  [140, 96, 6, 4.5, 0],
  [116, 88, 4.5, 3.5, 40],
  [104, 112, 5, 4, -20],
  [150, 118, 4, 3, 10],
  [196, 124, 4.5, 3.5, 30],
  [228, 108, 4, 3, 0],
  [84, 128, 4, 3, 20],
  [124, 134, 3.5, 2.8, -30],
];

const seal: AnimalDef = {
  id: 'seal',
  name: 'Seal',
  kind: 'animal',
  aliases: ['harbor seal', 'harbour seal', 'spotted seal', 'sea lion'],
  group: 'mammal',
  habitats: ['ocean'],
  box: [360, 184],
  size: 160,
  locomotion: 'swim',
  sound: 'seal',
  palette: {
    fur: '#9eabb8',
    furDark: '#8592a1',
    belly: '#dbe2e9',
    spot: '#76838f',
    muzzle: '#e9eef3',
    nose: '#3b3440',
    whisker: '#66717f',
    toe: '#7c8996',
  },
  parts: offset(
    [
      {
        id: 'body',
        role: 'body',
        pivot: [170, 128],
        shapes: [
          {
            d: smooth([
              [262, 82],
              [278, 120],
              [266, 158],
              [232, 178],
              [180, 184],
              [128, 176],
              [88, 156],
              [64, 138],
              [58, 122],
              [80, 104],
              [120, 84],
              [170, 70],
              [220, 66],
            ]),
            fill: 'fur',
          },
          {
            d:
              smooth(
                [
                  [290, 150],
                  [250, 156],
                  [200, 160],
                  [150, 154],
                  [104, 142],
                  [60, 128],
                ],
                false,
              ) + 'L60 210L290 210Z',
            kind: 'detail',
            fill: 'belly',
          },
          ...SPOTS.map(([x, y, rx, ry, rot]): Shape => ({
            d: ellipse(x, y, rx, ry, rot),
            kind: 'detail',
            fill: 'spot',
          })),
        ],
        children: [
          frontFlipper('flipperFF', [214, 164], 142, true),
          hindFlipper('flipperBF', [70, 122], 200, true),
          hindFlipper('flipperBN', [72, 136], 160, false),
          {
            id: 'head',
            role: 'head',
            pivot: [262, 120],
            shapes: [
              { d: ellipse(284, 96, 62, 56), fill: 'fur' },
              { d: ellipse(262, 52, 4.5, 3.5, 20), kind: 'detail', fill: 'spot' },
              { d: ellipse(286, 46, 3.5, 2.8, -10), kind: 'detail', fill: 'spot' },
              { d: ellipse(244, 70, 3.5, 2.8, 30), kind: 'detail', fill: 'spot' },
              { d: ellipse(286, 118, 15, 12), kind: 'detail', fill: 'muzzle' },
              { d: ellipse(310, 118, 15, 12), kind: 'detail', fill: 'muzzle' },
              { d: ellipse(258, 114, 10, 6.5), kind: 'feature', fill: 'blush', opacity: 0.5 },
              { d: ellipse(338, 114, 9, 6.5), kind: 'feature', fill: 'blush', opacity: 0.5 },
              { d: circle(272, 88, 13), kind: 'feature', fill: 'eye' },
              { d: circle(324, 88, 13), kind: 'feature', fill: 'eye' },
              { d: circle(277, 82.5, 5), kind: 'feature', fill: 'shine' },
              { d: circle(329, 82.5, 5), kind: 'feature', fill: 'shine' },
              {
                d: 'M290 105Q298 101 306 105Q305 112 298 115Q291 112 290 105Z',
                kind: 'feature',
                fill: 'nose',
              },
              { d: curve(292, 128, 304, 128, 4), kind: 'line', stroke: 'mouth', width: 2.6 },
              { d: circle(280, 116, 1.4), kind: 'feature', fill: 'whisker' },
              { d: circle(286, 121, 1.4), kind: 'feature', fill: 'whisker' },
              { d: circle(316, 116, 1.4), kind: 'feature', fill: 'whisker' },
              { d: circle(310, 121, 1.4), kind: 'feature', fill: 'whisker' },
              { d: 'M274 116L246 110', kind: 'line', stroke: 'whisker', width: 2 },
              { d: 'M274 122L246 124', kind: 'line', stroke: 'whisker', width: 2 },
              { d: 'M322 116L350 110', kind: 'line', stroke: 'whisker', width: 2 },
              { d: 'M322 122L350 124', kind: 'line', stroke: 'whisker', width: 2 },
            ],
          },
          frontFlipper('flipperFN', [240, 154], 148, false),
        ],
      },
    ],
    0,
    -28,
  ),
};

export default seal;
