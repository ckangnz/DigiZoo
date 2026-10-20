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

const GROUND = 176;

const leg = (id: string, x: number, far: boolean): PartNode => {
  const fill = far ? 'furDark' : 'fur';
  return {
    id,
    role: id,
    behind: true,
    pivot: [x, 122],
    shapes: [
      { d: capsule(x, 122, x + 1, 158, 12, 10.5), fill },
      { d: ellipse(x + 4, GROUND - 10, 14, 8), fill },
      { d: ellipse(x + 4, GROUND - 6, 17, 6), kind: 'detail', fill: far ? 'pawDark' : 'paw' },
    ],
  };
};

const TAIL: Pt[] = [
  [120, 104],
  [88, 116],
  [58, 120],
  [32, 112],
  [16, 94],
  [12, 72],
];
const tailRadius = (t: number) => 3 + 16 * Math.sin(Math.PI * (0.3 + 0.7 * t));

const NECK: Pt = [246, 104];
const grow = (shapes: Shape[]): Shape[] =>
  shapes.map((s) => ({
    ...s,
    d: scalePath(translatePath(s.d, -16, 0), 1.2, 1.2, NECK[0], NECK[1]),
  }));

const tick = (x: number, y: number): Shape => ({
  d: `M${x} ${y}q3 4 2 9`,
  kind: 'line',
  stroke: 'tick',
  width: 2.4,
});

const mongoose: AnimalDef = {
  id: 'mongoose',
  name: 'Mongoose',
  kind: 'animal',
  aliases: ['grey mongoose', 'gray mongoose', 'rikki tikki tavi', 'rikki'],
  group: 'mammal',
  habitats: ['jungle'],
  box: [364, GROUND],
  size: 100,
  locomotion: 'walk4',
  gait: { period: 0.7, stride: 76 },
  sound: 'mongoose',
  palette: {
    fur: '#ae967a',
    furDark: '#937b61',
    belly: '#e3d5bf',
    muzzle: '#f0e6d4',
    earInner: '#7b6552',
    tailTip: '#6f5c4b',
    paw: '#7d6956',
    pawDark: '#6b594a',
    nose: '#5a3f37',
    tick: '#d2c2ac',
  },
  parts: [
    {
      id: 'body',
      role: 'body',
      pivot: [180, 126],
      shapes: [
        {
          d: smooth([
            [110, 90],
            [142, 80],
            [178, 78],
            [214, 81],
            [244, 89],
            [262, 104],
            [260, 124],
            [236, 135],
            [186, 139],
            [136, 137],
            [110, 128],
            [98, 110],
          ]),
          fill: 'fur',
        },
        { d: ellipse(182, 139, 68, 13), kind: 'detail', fill: 'belly' },
        tick(140, 89),
        tick(166, 86),
        tick(192, 86),
        tick(218, 91),
        tick(152, 105),
        tick(180, 103),
        tick(208, 106),
      ],
      children: [
        {
          id: 'tail',
          role: 'tail',
          pivot: [120, 104],
          behind: true,
          shapes: [
            { d: tube(TAIL, tailRadius, 90), fill: 'fur' },
            { d: ellipse(13, 72, 15, 14, -80), kind: 'detail', fill: 'tailTip' },
            tick(86, 108),
            tick(58, 110),
            tick(36, 100),
          ],
        },
        leg('legBF', 144, true),
        leg('legFF', 240, true),
        leg('legBN', 122, false),
        leg('legFN', 218, false),
        {
          id: 'head',
          role: 'head',
          pivot: NECK,
          shapes: grow([
            { d: circle(266, 52, 11.5), fill: 'fur' },
            {
              d: smooth([
                [252, 76],
                [262, 52],
                [286, 36],
                [314, 38],
                [334, 52],
                [346, 68],
                [356, 82],
                [352, 94],
                [334, 102],
                [306, 108],
                [280, 110],
                [260, 102],
                [250, 90],
              ]),
              fill: 'fur',
            },
            { d: circle(267, 53, 7), kind: 'detail', fill: 'earInner' },
            { d: ellipse(326, 98, 32, 13, 6), kind: 'detail', fill: 'muzzle' },
            { d: ellipse(282, 90, 8.5, 5.5), kind: 'feature', fill: 'blush', opacity: 0.5 },
            { d: circle(294, 70, 8.4), kind: 'feature', fill: 'eye' },
            { d: circle(297.2, 66.6, 3.2), kind: 'feature', fill: 'shine' },
            { d: circle(322, 66, 6.8), kind: 'feature', fill: 'eye' },
            { d: circle(324.6, 63.3, 2.6), kind: 'feature', fill: 'shine' },
            {
              d: 'M345 81Q352 77 358 82Q357 90 351 91Q344 88 345 81Z',
              kind: 'feature',
              fill: 'nose',
            },
            { d: curve(318, 104, 338, 100, 4), kind: 'line', stroke: 'mouth', width: 2.4 },
          ]),
          children: [
            {
              id: 'earFar',
              behind: true,
              shapes: grow([
                { d: circle(298, 38, 9.5), fill: 'furDark' },
                { d: circle(299, 39, 5.5), kind: 'detail', fill: 'earInner' },
              ]),
            },
          ],
        },
      ],
    },
  ],
};

export default mongoose;
