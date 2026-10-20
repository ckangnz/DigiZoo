import { capsule, circle, curve, ellipse, leaf, smooth, tube, type Pt } from '../core/paths';
import type { AnimalDef, PartNode, Shape } from '../core/types';

const nails = (x: number, far: boolean): Shape[] =>
  [-15, 0, 15].map((dx) => ({
    d: ellipse(x + 4 + dx, 322, 7, 8),
    kind: 'detail' as const,
    fill: far ? 'nailDark' : 'nail',
  }));

const leg = (id: string, x: number, far: boolean): PartNode => {
  const fill = far ? 'skinDark' : 'skin';
  return {
    id,
    role: id,
    behind: true,
    pivot: [x, 228],
    shapes: [
      { d: capsule(x, 222, x, 296, 27, 27), fill },
      { d: ellipse(x + 4, 310, 31, 17), fill },
      ...nails(x, far),
    ],
  };
};

const mapPts = (pts: Pt[], cx: number, cy: number, dir: 1 | -1): Pt[] =>
  pts.map(([x, y]) => [cx + dir * x, cy + y]);

const EAR: Pt[] = [
  [0, -60],
  [-36, -68],
  [-68, -50],
  [-80, -10],
  [-72, 34],
  [-46, 64],
  [-18, 68],
  [4, 48],
  [10, 8],
  [8, -32],
];

const EAR_INNER: Pt[] = [
  [-6, -46],
  [-36, -52],
  [-60, -34],
  [-66, -4],
  [-58, 28],
  [-38, 50],
  [-20, 52],
  [-6, 36],
  [-2, 4],
];

const TRUNK: Pt[] = [
  [285, 148],
  [286, 176],
  [289, 204],
  [298, 226],
  [315, 237],
  [332, 233],
  [340, 219],
  [334, 207],
];

const trunkRadius = (t: number) => 16 - 7.5 * t;

const elephant: AnimalDef = {
  id: 'elephant',
  name: 'Elephant',
  aliases: ['ellie', 'jumbo', 'nellie'],
  group: 'mammal',
  habitats: ['safari', 'jungle'],
  box: [425, 330],
  size: 330,
  locomotion: 'walk4',
  gait: { period: 1.1, swing: 16, stride: 96 },
  sound: 'elephant',
  palette: {
    skin: '#a2b9d6',
    skinDark: '#869dbd',
    belly: '#bfd0e6',
    earInner: '#f7b3c2',
    tusk: '#fffaf0',
    nail: '#f2f5fa',
    nailDark: '#cad6e6',
    tuft: '#667a99',
    wrinkle: '#7d93b3',
  },
  parts: [
    {
      id: 'body',
      role: 'body',
      pivot: [168, 228],
      shapes: [
        { d: ellipse(166, 200, 110, 80), fill: 'skin' },
        { d: ellipse(172, 270, 88, 28), kind: 'detail', fill: 'belly' },
      ],
      children: [
        {
          id: 'tail',
          role: 'tail',
          pivot: [62, 178],
          behind: true,
          shapes: [
            {
              d: tube(
                [
                  [66, 174],
                  [46, 186],
                  [36, 208],
                  [36, 228],
                ],
                4.8,
              ),
              fill: 'skin',
            },
            { d: leaf(36, 224, 22, 8, 92), fill: 'tuft' },
            { d: leaf(36, 224, 18, 7, 117), fill: 'tuft' },
            { d: leaf(36, 224, 18, 7, 67), fill: 'tuft' },
          ],
        },
        leg('legBF', 122, true),
        leg('legFF', 250, true),
        leg('legBN', 92, false),
        leg('legFN', 220, false),
        {
          id: 'head',
          role: 'head',
          pivot: [258, 180],
          shapes: [
            {
              d: smooth([
                [285, 70],
                [330, 80],
                [354, 116],
                [352, 160],
                [330, 192],
                [285, 202],
                [240, 192],
                [218, 160],
                [216, 116],
                [240, 80],
              ]),
              fill: 'skin',
            },
            { d: ellipse(246, 158, 12, 7.5), kind: 'feature', fill: 'blush', opacity: 0.55 },
            { d: ellipse(324, 158, 12, 7.5), kind: 'feature', fill: 'blush', opacity: 0.55 },
            { d: circle(262, 128, 10), kind: 'feature', fill: 'eye' },
            { d: circle(308, 128, 10), kind: 'feature', fill: 'eye' },
            { d: circle(265.8, 124, 3.8), kind: 'feature', fill: 'shine' },
            { d: circle(311.8, 124, 3.8), kind: 'feature', fill: 'shine' },
            { d: curve(260, 180, 273, 186, 3), kind: 'line', stroke: 'mouth', width: 3 },
            { d: curve(298, 186, 311, 180, 3), kind: 'line', stroke: 'mouth', width: 3 },
          ],
          children: [
            {
              id: 'earN',
              role: 'ear',
              pivot: [230, 118],
              behind: true,
              motion: { rotate: 4, scaleX: 0.06, freq: 1, phase: 0.3 },
              shapes: [
                { d: smooth(mapPts(EAR, 230, 138, 1)), fill: 'skin' },
                { d: smooth(mapPts(EAR_INNER, 230, 138, 1)), kind: 'detail', fill: 'earInner' },
              ],
            },
            {
              id: 'earF',
              role: 'ear',
              pivot: [340, 118],
              behind: true,
              motion: { rotate: -4, scaleX: 0.06, freq: 1, phase: 0.3 },
              shapes: [
                { d: smooth(mapPts(EAR, 340, 138, -1)), fill: 'skin' },
                { d: smooth(mapPts(EAR_INNER, 340, 138, -1)), kind: 'detail', fill: 'earInner' },
              ],
            },
            {
              id: 'tusks',
              behind: true,
              shapes: [
                {
                  d: tube(
                    [
                      [265, 184],
                      [264, 204],
                      [258, 217],
                      [247, 223],
                    ],
                    (t) => 6.5 - 3.5 * t,
                    40,
                  ),
                  fill: 'tusk',
                },
                {
                  d: tube(
                    [
                      [309, 184],
                      [310, 204],
                      [316, 217],
                      [327, 223],
                    ],
                    (t) => 6.5 - 3.5 * t,
                    40,
                  ),
                  fill: 'tusk',
                },
              ],
            },
            {
              id: 'trunk',
              role: 'trunk',
              pivot: [285, 156],
              shapes: [
                { d: tube(TRUNK, trunkRadius, 90), fill: 'skin' },
                { d: curve(274, 178, 298, 178, 4), kind: 'line', stroke: 'wrinkle', width: 2.6 },
                { d: curve(276, 195, 301, 194, 4), kind: 'line', stroke: 'wrinkle', width: 2.6 },
                { d: ellipse(334.5, 208.5, 5, 3.6, -35), kind: 'feature', fill: 'wrinkle' },
              ],
            },
          ],
        },
      ],
    },
  ],
};

export default elephant;
