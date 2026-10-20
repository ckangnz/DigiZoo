import {
  capsule,
  circle,
  curve,
  ellipse,
  scalePath,
  smooth,
  translatePath,
  tube,
  type Pt,
} from '../core/paths';
import type { AnimalDef, PartNode, Shape } from '../core/types';

const nails = (x: number, far: boolean): Shape[] =>
  [-10, 2, 14].map((dx) => ({
    d: ellipse(x + 6 + dx, 260, 5.5, 6),
    kind: 'detail' as const,
    fill: far ? 'nailDark' : 'nail',
  }));

const leg = (id: string, x: number, far: boolean): PartNode => {
  const fill = far ? 'blackDark' : 'black';
  return {
    id,
    role: id,
    behind: true,
    pivot: [x, 192],
    shapes: [
      { d: capsule(x, 192, x + 1, 242, 20, 18), fill },
      { d: ellipse(x + 5, 254, 23, 12.5), fill },
      ...nails(x, far),
    ],
  };
};

const NECK: Pt = [258, 146];
const grow = (shapes: Shape[]): Shape[] =>
  shapes.map((s) => ({ ...s, d: scalePath(s.d, 1.14, 1.14, NECK[0], NECK[1]) }));

const TRUNK: Pt[] = [
  [338, 98],
  [362, 104],
  [380, 118],
  [388, 138],
];

const SADDLE = smooth([
  [204, 70],
  [196, 120],
  [192, 170],
  [198, 240],
  [40, 240],
  [40, 70],
]);

const offset = (parts: PartNode[], dx: number, dy: number): PartNode[] =>
  parts.map((p): PartNode => ({
    ...p,
    pivot: p.pivot && [p.pivot[0] + dx, p.pivot[1] + dy],
    shapes: p.shapes?.map((s) => ({ ...s, d: translatePath(s.d, dx, dy) })),
    children: p.children && offset(p.children, dx, dy),
  }));

const tapir: AnimalDef = {
  id: 'tapir',
  name: 'Tapir',
  kind: 'animal',
  aliases: ['malayan tapir', 'asian tapir', 'saddle pig'],
  group: 'mammal',
  habitats: ['jungle'],
  box: [380, 268],
  size: 180,
  locomotion: 'walk4',
  gait: { period: 1, stride: 94, swing: 18 },
  sound: 'tapir',
  palette: {
    black: '#3e3a4a',
    blackDark: '#2f2c39',
    saddle: '#f4f1ea',
    rim: '#f7f4ee',
    earInner: '#4f4a5c',
    ring: '#8d87a3',
    nail: '#cfcad8',
    nailDark: '#a9a3b6',
    wrinkle: '#5d5870',
    smile: '#c9bfdc',
  },
  parts: offset(
    [
      {
        id: 'body',
        role: 'body',
        pivot: [170, 192],
        shapes: [
          {
            d: smooth([
              [96, 100],
              [150, 90],
              [206, 96],
              [252, 114],
              [278, 148],
              [274, 192],
              [246, 220],
              [170, 228],
              [100, 222],
              [70, 196],
              [64, 146],
            ]),
            fill: 'black',
          },
          { d: SADDLE, kind: 'detail', fill: 'saddle' },
          { d: ellipse(100, 226, 40, 36), kind: 'detail', fill: 'black' },
        ],
        children: [
          {
            id: 'tail',
            role: 'tail',
            pivot: [70, 150],
            behind: true,
            shapes: [{ d: capsule(70, 150, 60, 164, 6, 4.5), fill: 'saddle' }],
          },
          leg('legBF', 120, true),
          leg('legFF', 258, true),
          leg('legBN', 96, false),
          leg('legFN', 234, false),
          {
            id: 'head',
            role: 'head',
            pivot: NECK,
            shapes: grow([
              { d: circle(272, 72, 18), fill: 'rim' },
              {
                d: smooth([
                  [270, 76],
                  [306, 68],
                  [336, 80],
                  [354, 100],
                  [358, 124],
                  [348, 146],
                  [324, 158],
                  [294, 160],
                  [270, 150],
                  [256, 128],
                  [254, 100],
                ]),
                fill: 'black',
              },
              { d: tube(TRUNK, (t) => 16 - 5 * t, 40), fill: 'black' },
              { d: circle(274, 74, 12), kind: 'detail', fill: 'earInner' },
              { d: curve(360, 98, 352, 120, -4), kind: 'line', stroke: 'wrinkle', width: 2.4 },
              { d: curve(372, 106, 364, 126, -4), kind: 'line', stroke: 'wrinkle', width: 2.4 },
              { d: ellipse(390, 141, 4, 3, 60), kind: 'feature', fill: 'eye' },
              { d: ellipse(324, 128, 9.5, 6), kind: 'feature', fill: 'blush', opacity: 0.5 },
              { d: circle(314, 104, 11.5), kind: 'feature', fill: 'ring' },
              { d: circle(314, 104, 8), kind: 'feature', fill: 'eye' },
              { d: circle(317, 100.8, 3), kind: 'feature', fill: 'shine' },
              { d: curve(330, 147, 348, 144, 5), kind: 'line', stroke: 'smile', width: 2.8 },
            ]),
            children: [
              {
                id: 'earFar',
                behind: true,
                shapes: grow([
                  { d: circle(292, 66, 15), fill: 'rim' },
                  { d: circle(293, 68, 9.5), kind: 'detail', fill: 'earInner' },
                ]),
              },
            ],
          },
        ],
      },
    ],
    -44,
    0,
  ),
};

export default tapir;
