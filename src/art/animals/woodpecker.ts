import {
  capsule,
  circle,
  ellipse,
  leaf,
  smooth,
  translatePath,
  tube,
  type Pt,
} from '../core/paths';
import type { AnimalDef, PartNode, Shape } from '../core/types';

const HIP_Y = 212;
const SOLE = 254;

const leg = (id: string, x: number, far: boolean): PartNode => {
  const fill = far ? 'legDark' : 'leg';
  return {
    id,
    role: id,
    behind: true,
    pivot: [x, HIP_Y],
    shapes: [
      { d: capsule(x, HIP_Y, x + 3, SOLE - 7, 4.8, 3.8), fill },
      { d: capsule(x + 3, SOLE - 4, x + 17, SOLE - 3, 3.2, 2.6), fill },
      { d: capsule(x + 3, SOLE - 4, x + 14, SOLE - 9, 3, 2.4), fill },
      { d: capsule(x + 3, SOLE - 4, x - 9, SOLE - 3, 3, 2.4), fill },
    ],
  };
};

const bar = (x: number, y: number): Shape => ({
  d: ellipse(x, y, 4.2, 2.6, -40),
  kind: 'detail',
  fill: 'white',
});

const BARS: Pt[] = [
  [150, 180],
  [138, 192],
  [126, 204],
  [114, 214],
  [140, 170],
  [128, 182],
  [116, 194],
  [104, 206],
];

const tailFeather = (angle: number, length: number, width: number): Shape => ({
  d: leaf(116, 204, length, width, angle),
  fill: 'black',
});

const offset = (parts: PartNode[], dx: number, dy: number): PartNode[] =>
  parts.map((p): PartNode => ({
    ...p,
    pivot: p.pivot && [p.pivot[0] + dx, p.pivot[1] + dy],
    shapes: p.shapes?.map((s) => ({ ...s, d: translatePath(s.d, dx, dy) })),
    children: p.children && offset(p.children, dx, dy),
  }));

const woodpecker: AnimalDef = {
  id: 'woodpecker',
  name: 'Woodpecker',
  kind: 'animal',
  aliases: ['great spotted woodpecker', 'spotted woodpecker', 'wood pecker', 'bird'],
  group: 'bird',
  habitats: ['birds', 'forest'],
  box: [214, 223],
  size: 90,
  locomotion: 'hop',
  gait: { period: 0.62, swing: 26 },
  sound: 'woodpecker',
  palette: {
    black: '#2c2b38',
    white: '#fbf8f0',
    buff: '#f1e8da',
    red: '#e8383d',
    beak: '#55545f',
    beakLight: '#7d7c89',
    leg: '#8a8797',
    legDark: '#6f6c7c',
  },
  parts: offset(
    [
      {
        id: 'body',
        role: 'body',
        pivot: [156, SOLE],
        shapes: [
          {
            d: smooth([
              [170, 34],
              [202, 38],
              [226, 58],
              [234, 88],
              [228, 116],
              [216, 138],
              [214, 166],
              [208, 194],
              [190, 216],
              [162, 228],
              [134, 228],
              [112, 216],
              [102, 192],
              [104, 162],
              [114, 132],
              [124, 104],
              [130, 72],
              [146, 46],
            ]),
            fill: 'black',
          },
          {
            d: smooth([
              [242, 64],
              [246, 120],
              [228, 152],
              [222, 192],
              [202, 226],
              [160, 242],
              [128, 236],
              [140, 212],
              [164, 196],
              [178, 168],
              [178, 142],
              [168, 120],
              [160, 96],
              [166, 72],
              [190, 60],
              [218, 58],
            ]),
            kind: 'detail',
            fill: 'white',
          },
          { d: ellipse(190, 206, 32, 26), kind: 'detail', fill: 'buff' },
          {
            d: tube(
              [
                [234, 112],
                [206, 122],
                [180, 130],
                [164, 150],
              ],
              (t) => 6 + 2 * t,
            ),
            kind: 'detail',
            fill: 'black',
          },
          {
            d: smooth([
              [236, 70],
              [222, 44],
              [192, 28],
              [160, 30],
              [136, 48],
              [128, 74],
              [152, 66],
              [180, 58],
              [210, 60],
            ]),
            kind: 'detail',
            fill: 'red',
          },
          { d: ellipse(146, 224, 26, 14, -12), kind: 'detail', fill: 'red' },
          { d: ellipse(214, 102, 8.5, 5.2), kind: 'feature', fill: 'blush', opacity: 0.55 },
          { d: circle(202, 82, 10.2), kind: 'feature', fill: 'eye' },
          { d: circle(205.9, 77.8, 3.9), kind: 'feature', fill: 'shine' },
        ],
        children: [
          {
            id: 'tail',
            role: 'tail',
            behind: true,
            pivot: [116, 204],
            shapes: [tailFeather(152, 58, 11), tailFeather(124, 54, 11), tailFeather(138, 64, 12)],
          },
          leg('legBF', 146, true),
          leg('legBN', 164, false),
          {
            id: 'beak',
            behind: true,
            pivot: [226, 92],
            shapes: [
              { d: 'M222 76L268 88Q276 92 268 96L224 106Z', fill: 'beak' },
              { d: ellipse(244, 84, 16, 2.6, 13), kind: 'detail', fill: 'beakLight' },
            ],
          },
          {
            id: 'wing',
            role: 'legFN',
            pivot: [158, 132],
            motion: { rotate: 14, wave: 'lift' },
            shapes: [
              {
                d: smooth([
                  [166, 130],
                  [172, 156],
                  [162, 186],
                  [140, 208],
                  [112, 222],
                  [96, 218],
                  [104, 196],
                  [122, 166],
                  [140, 140],
                  [152, 128],
                ]),
                fill: 'black',
              },
              { d: ellipse(154, 148, 12, 22, 28), kind: 'detail', fill: 'white' },
              ...BARS.map(([x, y]) => bar(x, y)),
            ],
          },
        ],
      },
    ],
    -62,
    -31,
  ),
};

export default woodpecker;
