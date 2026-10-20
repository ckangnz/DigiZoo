import {
  capsule,
  circle,
  curve,
  ellipse,
  smooth,
  translatePath,
  tube,
  type Pt,
} from '../core/paths';
import type { AnimalDef, PartNode, Shape } from '../core/types';

const GROUND = 300;

const strip = (x1: number, y1: number, x2: number, y2: number, fill = 'wrapLine'): Shape => ({
  d: capsule(x1, y1, x2, y2, fill === 'wrapLine' ? 1.4 : 6),
  kind: 'detail',
  fill,
});

const leg = (id: string, x: number, far: boolean): PartNode => {
  const fill = far ? 'wrapDark' : 'wrap';
  return {
    id,
    role: id,
    behind: true,
    pivot: [x, 252],
    shapes: [
      { d: capsule(x, 250, x + 2, 282, 13, 12), fill },
      {
        d: smooth([
          [x - 12, 284],
          [x + 6, 280],
          [x + 24, 284],
          [x + 27, 293],
          [x + 12, GROUND],
          [x - 8, GROUND - 1],
          [x - 15, 292],
        ]),
        fill,
      },
      strip(x - 20, 262, x + 20, 270),
      strip(x - 20, 276, x + 22, 282),
      strip(x - 2, 290, x + 30, 286),
    ],
  };
};

const arm = (id: string, sx: number, sy: number, far: boolean, phase: number): PartNode => {
  const fill = far ? 'wrapDark' : 'wrap';
  const hand: Pt = [sx + 64, sy + 4];
  return {
    id,
    role: id,
    behind: far,
    pivot: [sx, sy],
    motion: { rotate: 4, phase },
    children: far
      ? []
      : [
          {
            id: 'tail',
            role: 'tail',
            behind: true,
            pivot: TAIL[0],
            shapes: [
              {
                d: tube(
                  [
                    [168, 180],
                    [167, 196],
                    [173, 210],
                    [170, 226],
                  ],
                  (t) => 6 - 1.5 * t,
                  40,
                ),
                fill: 'wrap',
              },
              { d: tube(TAIL, 1.2, 40), kind: 'detail', fill: 'wrapLine' },
            ],
          },
        ],
    shapes: [
      { d: capsule(sx, sy, hand[0], hand[1], 12, 11), fill },
      { d: ellipse(hand[0] + 4, hand[1], 13, 11.5, 4), fill },
      strip(sx + 14, sy - 14, sx + 22, sy + 14),
      strip(sx + 32, sy - 14, sx + 38, sy + 16),
      strip(sx + 50, sy - 12, sx + 54, sy + 16),
      strip(hand[0] - 2, hand[1] - 14, hand[0] + 8, hand[1] + 14),
    ],
  };
};

const TAIL: Pt[] = [
  [168, 182],
  [167, 196],
  [173, 210],
  [170, 224],
];

const offset = (parts: PartNode[], dx: number, dy: number): PartNode[] =>
  parts.map((p): PartNode => ({
    ...p,
    pivot: p.pivot && [p.pivot[0] + dx, p.pivot[1] + dy],
    shapes: p.shapes?.map((s) => ({ ...s, d: translatePath(s.d, dx, dy) })),
    children: p.children && offset(p.children, dx, dy),
  }));

const mummy: AnimalDef = {
  id: 'mummy',
  name: 'Mummy',
  kind: 'character',
  aliases: ['mummy monster', 'bandages', 'bandage buddy', 'wrapped up'],
  group: 'spooky',
  habitats: ['halloween'],
  box: [206, GROUND],
  size: 230,
  locomotion: 'walk2',
  gait: { stride: 58, swing: 20 },
  sound: 'mummy',
  palette: {
    wrap: '#f4ead3',
    wrapDark: '#dfd2b5',
    wrapShade: '#e9ddc2',
    wrapLine: '#cdbb96',
    gap: '#4f4268',
    smile: '#ffb4cc',
    blush: '#ff9ab4',
  },
  parts: offset(
    [
      {
        id: 'body',
        role: 'body',
        pivot: [96, 252],
        shapes: [
          {
            d: smooth([
              [96, 136],
              [134, 142],
              [148, 170],
              [150, 214],
              [140, 246],
              [96, 258],
              [52, 246],
              [42, 214],
              [44, 170],
              [58, 142],
            ]),
            fill: 'wrap',
          },
          strip(30, 176, 160, 160, 'wrapShade'),
          strip(30, 218, 160, 204, 'wrapShade'),
          strip(30, 158, 160, 168),
          strip(30, 186, 160, 172),
          strip(30, 198, 160, 214),
          strip(30, 232, 160, 220),
          strip(30, 244, 160, 252),
        ],
        children: [
          leg('legF', 80, true),
          arm('armF', 110, 150, true, 0.5),
          leg('legN', 110, false),
          {
            id: 'head',
            role: 'head',
            pivot: [98, 144],
            shapes: [
              { d: ellipse(100, 88, 66, 62), fill: 'wrap' },
              strip(26, 48, 176, 40, 'wrapShade'),
              strip(26, 132, 176, 120, 'wrapShade'),
              strip(26, 36, 176, 52),
              strip(26, 62, 176, 50),
              strip(26, 124, 176, 108),
              strip(26, 136, 176, 144),
              {
                d: smooth([
                  [60, 86],
                  [82, 74],
                  [116, 72],
                  [142, 78],
                  [150, 92],
                  [138, 108],
                  [104, 114],
                  [74, 110],
                  [58, 100],
                ]),
                kind: 'detail',
                fill: 'gap',
              },
              { d: ellipse(50, 126, 10, 6), kind: 'feature', fill: 'blush', opacity: 0.6 },
              { d: ellipse(152, 126, 10, 6), kind: 'feature', fill: 'blush', opacity: 0.6 },
              { d: circle(84, 91, 13.5), kind: 'feature', fill: 'white' },
              { d: circle(124, 91, 13.5), kind: 'feature', fill: 'white' },
              { d: circle(86, 93, 9.5), kind: 'feature', fill: 'eye' },
              { d: circle(126, 93, 9.5), kind: 'feature', fill: 'eye' },
              { d: circle(89.6, 89, 3.6), kind: 'feature', fill: 'shine' },
              { d: circle(129.6, 89, 3.6), kind: 'feature', fill: 'shine' },
              { d: curve(97, 106, 113, 106, 5), kind: 'line', stroke: 'smile', width: 3 },
            ],
          },
          arm('armN', 124, 170, false, 0),
        ],
      },
    ],
    -20,
    0,
  ),
};

export default mummy;
