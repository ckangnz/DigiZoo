import {
  circle,
  curve,
  ellipse,
  mirrorPath,
  scallop,
  translatePath,
  tube,
  type Pt,
} from '../core/paths';
import type { AnimalDef, PartNode, Shape } from '../core/types';

const MID = 160;

const LEFT_FOLDS = [
  'M36 112C40 88 64 78 80 92C92 102 104 94 108 80',
  'M70 52C84 40 104 40 116 52',
  'M128 58C142 66 144 84 134 96C126 106 130 120 142 124',
  'M24 158C34 140 56 138 60 154C64 168 80 170 90 158',
  'M38 200C50 188 68 192 72 206',
];

const folds: Shape[] = LEFT_FOLDS.flatMap((d): Shape[] => [
  { d, kind: 'line', stroke: 'fold', width: 3.4 },
  { d: mirrorPath(d, MID), kind: 'line', stroke: 'fold', width: 3.4 },
]);

const offset = (parts: PartNode[], dx: number, dy: number): PartNode[] =>
  parts.map((p) => ({
    ...p,
    ...(p.pivot ? { pivot: [p.pivot[0] + dx, p.pivot[1] + dy] as Pt } : {}),
    ...(p.shapes ? { shapes: p.shapes.map((s) => ({ ...s, d: translatePath(s.d, dx, dy) })) } : {}),
    ...(p.children ? { children: offset(p.children, dx, dy) } : {}),
  }));

const brain: AnimalDef = {
  id: 'brain',
  name: 'Brain',
  kind: 'object',
  aliases: ['brainy', 'mind', 'noggin', 'thinker'],
  group: 'body',
  habitats: ['body'],
  box: [320, 262],
  size: 200,
  locomotion: 'wobble',
  sound: 'brain',
  palette: {
    brain: '#f7a8bf',
    fold: '#e07c9b',
    light: '#ffd3df',
    stem: '#f0b0c2',
  },
  parts: offset(
    [
      {
        id: 'brain',
        pivot: [MID, 135],
        shapes: [
          { d: scallop(114, 132, 0, 12, 11, 8, 100, 104), fill: 'brain' },
          { d: scallop(206, 132, 0, 12, 11, 172, 100, 104), fill: 'brain' },
          { d: ellipse(56, 74, 18, 9, -38), kind: 'detail', fill: 'light' },
          { d: circle(80, 56, 4.5), kind: 'detail', fill: 'light' },
          ...folds,
          { d: 'M160 42Q153 64 160 88Q167 112 160 136', kind: 'line', stroke: 'fold', width: 3.6 },
          { d: ellipse(104, 192, 12, 7.5), kind: 'feature', fill: 'blush', opacity: 0.55 },
          { d: ellipse(216, 192, 12, 7.5), kind: 'feature', fill: 'blush', opacity: 0.55 },
          { d: circle(128, 166, 13.5), kind: 'feature', fill: 'eye' },
          { d: circle(192, 166, 13.5), kind: 'feature', fill: 'eye' },
          { d: circle(132.8, 160.5, 5.1), kind: 'feature', fill: 'shine' },
          { d: circle(196.8, 160.5, 5.1), kind: 'feature', fill: 'shine' },
          { d: curve(149, 190, 171, 190, 7), kind: 'line', stroke: 'mouth', width: 3.4 },
        ],
        children: [
          {
            id: 'stem',
            behind: true,
            shapes: [
              {
                d: tube(
                  [
                    [MID, 214],
                    [MID, 234],
                    [MID + 2, 250],
                  ],
                  (t) => 19 - 4 * t,
                ),
                fill: 'stem',
              },
            ],
          },
        ],
      },
    ],
    0,
    -14,
  ),
};

export default brain;
