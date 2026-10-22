import {
  circle,
  curve,
  ellipse,
  leaf,
  rotatePath,
  scalePath,
  smooth,
  translatePath,
  type Pt,
} from '../core/paths';
import type { AnimalDef, PartNode, Shape } from '../core/types';

const shift = (pts: Pt[], dx: number, dy: number): Pt[] => pts.map(([x, y]) => [x + dx, y + dy]);

const FRONT_FLIPPER: Pt[] = [
  [204, 188],
  [226, 186],
  [242, 208],
  [250, 244],
  [262, 268],
  [286, 280],
  [300, 290],
  [292, 298],
  [258, 299],
  [232, 295],
  [216, 280],
  [208, 248],
  [198, 214],
];

const frontFlipper = (id: string, dx: number, far: boolean): PartNode => ({
  id,
  role: id,
  behind: far,
  pivot: [216 + dx, 196],
  shapes: [
    { d: smooth(shift(FRONT_FLIPPER, dx, 0)), fill: far ? 'flipperDark' : 'flipper' },
    ...(far
      ? []
      : [266, 276, 286].map((x): Shape => ({
          d: curve(x - 6, 286, x, 296, 1.5),
          kind: 'line',
          stroke: 'flipperLine',
          width: 2.2,
        }))),
  ],
});

const HIND_FLIPPER: Pt[] = [
  [74, 270],
  [52, 272],
  [28, 274],
  [10, 270],
  [4, 278],
  [12, 284],
  [2, 290],
  [10, 298],
  [40, 298],
  [70, 296],
  [84, 286],
];

const hindFlipper = (id: string, dx: number, far: boolean): PartNode => ({
  id,
  behind: true,
  pivot: [70 + dx, 284],
  motion: { rotate: 5, phase: far ? 0.5 : 0 },
  shapes: [
    { d: smooth(shift(HIND_FLIPPER, dx, far ? -6 : 0)), fill: far ? 'flipperDark' : 'flipper' },
  ],
});

const tilt = (d: string): string => rotatePath(scalePath(d, 1.14, 1.14, 200, 90), -9, 196, 110);

const headShape = (s: Shape): Shape => ({ ...s, d: tilt(s.d) });

const HEAD: Shape[] = [
  { d: ellipse(202, 80, 50, 44), fill: 'fur' },
  {
    d: smooth([
      [226, 66],
      [262, 70],
      [286, 80],
      [292, 92],
      [282, 104],
      [254, 110],
      [226, 106],
    ]),
    fill: 'fur',
  },
  {
    d: smooth([
      [244, 92],
      [266, 88],
      [288, 90],
      [292, 104],
      [262, 116],
      [240, 108],
    ]),
    kind: 'detail',
    fill: 'snout',
  },
  { d: ellipse(232, 96, 10, 6.5), kind: 'feature', fill: 'blush', opacity: 0.5 },
  { d: circle(224, 68, 10.5), kind: 'feature', fill: 'eye' },
  { d: circle(227.8, 64, 4), kind: 'feature', fill: 'shine' },
  {
    d: 'M280 82Q287 79 293 84Q292 91 286 93Q280 90 280 82Z',
    kind: 'feature',
    fill: 'nose',
  },
  { d: curve(262, 104, 280, 102, 3), kind: 'line', stroke: 'mouth', width: 2.6 },
  { d: circle(266, 95, 1.5), kind: 'feature', fill: 'whisker' },
  { d: circle(273, 98, 1.5), kind: 'feature', fill: 'whisker' },
  { d: circle(262, 99, 1.5), kind: 'feature', fill: 'whisker' },
  { d: 'M270 96L294 93', kind: 'line', stroke: 'whisker', width: 1.8 },
  { d: 'M270 100L293 102', kind: 'line', stroke: 'whisker', width: 1.8 },
];

const offset = (parts: PartNode[], dx: number, dy: number): PartNode[] =>
  parts.map((p): PartNode => ({
    ...p,
    pivot: p.pivot && [p.pivot[0] + dx, p.pivot[1] + dy],
    shapes: p.shapes?.map((s) => ({ ...s, d: translatePath(s.d, dx, dy) })),
    children: p.children && offset(p.children, dx, dy),
  }));

const seaLion: AnimalDef = {
  id: 'sea-lion',
  name: 'Sea Lion',
  kind: 'animal',
  aliases: ['sealion', 'california sea lion', 'steller sea lion', 'eared seal'],
  group: 'mammal',
  habitats: ['polar', 'ocean'],
  box: [284, 300],
  size: 180,
  locomotion: 'waddle',
  gait: { period: 0.75 },
  sound: 'sea-lion',
  palette: {
    fur: '#b9804f',
    chest: '#d9aa79',
    flipper: '#8a5a37',
    flipperDark: '#6f4629',
    flipperLine: '#5e3b22',
    snout: '#c99263',
    ear: '#9b6740',
    nose: '#3a2522',
    whisker: '#f6e6cf',
  },
  parts: offset(
    [
      {
        id: 'body',
        role: 'body',
        pivot: [162, 300],
        motion: { rotate: -3 },
        shapes: [
          {
            d: smooth([
              [181, 104],
              [161, 122],
              [147, 148],
              [137, 180],
              [124, 210],
              [105, 234],
              [83, 254],
              [61, 270],
              [49, 284],
              [56, 297],
              [101, 298],
              [163, 298],
              [214, 290],
              [248, 262],
              [264, 218],
              [264, 170],
              [252, 132],
              [228, 108],
            ]),
            fill: 'fur',
          },
          {
            d: smooth([
              [270, 100],
              [242, 116],
              [230, 150],
              [228, 200],
              [214, 246],
              [184, 278],
              [149, 304],
              [290, 310],
            ]),
            kind: 'detail',
            fill: 'chest',
          },
        ],
        children: [
          hindFlipper('hindF', 16, true),
          hindFlipper('hindN', 20, false),
          frontFlipper('legF', 12, true),
          {
            id: 'head',
            role: 'head',
            pivot: [196, 120],
            shapes: HEAD.map(headShape),
            children: [
              {
                id: 'ear',
                shapes: [{ d: tilt(leaf(166, 84, 22, 7.5, 150)), fill: 'ear' }],
              },
            ],
          },
          frontFlipper('legN', 0, false),
        ],
      },
    ],
    -20,
    0,
  ),
};

export default seaLion;
