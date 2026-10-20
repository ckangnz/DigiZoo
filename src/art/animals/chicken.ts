import { capsule, circle, curve, ellipse, leaf, smooth } from '../core/paths';
import type { AnimalDef, PartNode } from '../core/types';

const leg = (id: string, role: string, x: number, far: boolean): PartNode => {
  const fill = far ? 'legDark' : 'leg';
  return {
    id,
    role,
    behind: true,
    pivot: [x, 232],
    shapes: [
      { d: capsule(x, 232, x + 3, 264, 6, 5), fill },
      { d: capsule(x + 3, 268, x + 24, 271, 4.6, 3.6), fill },
      { d: capsule(x + 3, 268, x - 12, 272, 4.2, 3.2), fill },
    ],
  };
};

const chicken: AnimalDef = {
  id: 'chicken',
  name: 'Chicken',
  aliases: ['hen', 'chick', 'chook', 'bird'],
  group: 'bird',
  habitats: ['farm'],
  box: [270, 280],
  size: 120,
  locomotion: 'walk2',
  gait: { stride: 60 },
  sound: 'chicken',
  palette: {
    body: '#fff4e2',
    wing: '#f2cf8e',
    wingDark: '#c9964f',
    tail: '#dc9b4c',
    comb: '#ef4d4d',
    beak: '#ffb238',
    leg: '#f7a43a',
    legDark: '#d8852a',
  },
  parts: [
    {
      id: 'body',
      role: 'body',
      pivot: [135, 236],
      shapes: [
        { d: circle(160, 50, 12), fill: 'comb' },
        { d: circle(176, 41, 13), fill: 'comb' },
        { d: circle(193, 47, 11), fill: 'comb' },
        {
          d: smooth([
            [172, 52],
            [198, 57],
            [216, 77],
            [219, 101],
            [210, 124],
            [212, 152],
            [216, 182],
            [202, 215],
            [170, 238],
            [130, 246],
            [92, 238],
            [64, 214],
            [53, 182],
            [60, 152],
            [84, 134],
            [120, 126],
            [146, 110],
            [150, 82],
            [157, 61],
          ]),
          fill: 'body',
        },
        { d: 'M214 84Q236 88 243 96Q235 104 214 107Z', fill: 'beak' },
        { d: ellipse(211, 119, 7, 11), fill: 'comb' },
        { d: ellipse(199, 101, 8, 5), kind: 'feature', fill: 'blush', opacity: 0.5 },
        { d: circle(195, 82, 7.5), kind: 'feature', fill: 'eye' },
        { d: circle(197.6, 79, 2.8), kind: 'feature', fill: 'shine' },
      ],
      children: [
        {
          id: 'tail',
          role: 'tail',
          behind: true,
          pivot: [72, 160],
          shapes: [
            { d: leaf(74, 160, 66, 15, -126), fill: 'tail' },
            { d: leaf(68, 168, 62, 14, -152), fill: 'tail' },
            { d: leaf(82, 152, 56, 13, -102), fill: 'tail' },
          ],
        },
        leg('legF', 'legF', 108, true),
        leg('legN', 'legN', 140, false),
        {
          id: 'wing',
          role: 'wingN',
          pivot: [120, 150],
          shapes: [
            {
              d: smooth([
                [92, 152],
                [128, 141],
                [166, 149],
                [184, 171],
                [171, 199],
                [137, 209],
                [104, 199],
                [88, 177],
              ]),
              fill: 'wing',
            },
            { d: curve(116, 178, 152, 182, 7), kind: 'line', stroke: 'wingDark', width: 2.6 },
            { d: curve(122, 193, 154, 195, 6), kind: 'line', stroke: 'wingDark', width: 2.6 },
          ],
        },
      ],
    },
  ],
};

export default chicken;
