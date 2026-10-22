import { capsule, circle, ellipse, leaf, mirrorPath, smooth, tube } from '../core/paths';
import type { AnimalDef, PartNode, Shape } from '../core/types';

const HIP = 146;
const GROUND = 214;
const FACE_X = 262;

const leg = (id: string, x: number, far: boolean): PartNode => {
  const fill = far ? 'darkFar' : 'dark';
  const claws: Shape[] = far
    ? []
    : [0, 6, 12].map((dx) => ({
        d: `M${x + 8 + dx} ${GROUND - 6}q4 1 5 5`,
        kind: 'line' as const,
        stroke: 'claw',
        width: 2.4,
      }));
  return {
    id,
    role: id,
    behind: true,
    pivot: [x, HIP],
    shapes: [
      { d: capsule(x, HIP - 6, x + 1, GROUND - 16, 16, 13), fill },
      { d: ellipse(x + 5, GROUND - 8.5, 17.5, 8.5), fill },
      ...claws,
    ],
  };
};

const STRIPE = tube(
  [
    [222, 44],
    [232, 76],
    [243, 106],
    [252, 134],
  ],
  (t) => 18 - 9 * t,
  40,
);

const tick = (x: number, y: number): Shape => ({
  d: `M${x} ${y}q3 4 2 9`,
  kind: 'line',
  stroke: 'furLight',
  width: 2.4,
});

const ear = (id: string, cx: number, cy: number): PartNode => ({
  id,
  role: id,
  behind: true,
  pivot: [cx, cy + 10],
  shapes: [
    { d: circle(cx, cy, 15), fill: 'face' },
    { d: circle(cx + (cx < FACE_X ? 3 : -3), cy + 4, 11), kind: 'detail', fill: 'dark' },
  ],
});

const badger: AnimalDef = {
  id: 'badger',
  name: 'Badger',
  kind: 'animal',
  aliases: ['european badger', 'american badger', 'brock'],
  group: 'mammal',
  habitats: ['forest'],
  box: [340, GROUND],
  size: 110,
  locomotion: 'walk4',
  gait: { period: 0.8, stride: 74, swing: 18 },
  sound: 'badger',
  palette: {
    fur: '#a7a4b0',
    furLight: '#c4c1cc',
    dark: '#3b3644',
    darkFar: '#2f2b37',
    face: '#fbfaf6',
    eyeRing: '#ffffff',
    nose: '#2a2530',
    claw: '#ece7dc',
  },
  parts: [
    {
      id: 'body',
      role: 'body',
      pivot: [150, HIP],
      shapes: [
        {
          d: smooth([
            [44, 120],
            [70, 94],
            [110, 80],
            [160, 76],
            [204, 82],
            [236, 100],
            [250, 128],
            [244, 156],
            [214, 170],
            [160, 174],
            [100, 172],
            [58, 162],
            [38, 142],
          ]),
          fill: 'fur',
        },
        { d: ellipse(146, 80, 92, 14, -1), kind: 'detail', fill: 'furLight' },
        { d: ellipse(150, 180, 96, 20), kind: 'detail', fill: 'dark' },
        tick(84, 104),
        tick(112, 94),
        tick(142, 90),
        tick(172, 92),
        tick(98, 126),
        tick(128, 116),
        tick(158, 114),
        tick(188, 112),
      ],
      children: [
        {
          id: 'tail',
          role: 'tail',
          pivot: [48, 116],
          behind: true,
          shapes: [
            { d: leaf(52, 118, 36, 11, 196), fill: 'fur' },
            { d: leaf(30, 112, 16, 6, 196), kind: 'detail', fill: 'furLight' },
          ],
        },
        leg('legBF', 98, true),
        leg('legFF', 222, true),
        leg('legBN', 76, false),
        leg('legFN', 200, false),
        {
          id: 'head',
          role: 'head',
          pivot: [228, 140],
          shapes: [
            {
              d: smooth([
                [FACE_X, 56],
                [300, 60],
                [326, 80],
                [334, 108],
                [326, 136],
                [304, 158],
                [282, 170],
                [FACE_X, 174],
                [242, 170],
                [220, 158],
                [198, 136],
                [190, 108],
                [198, 80],
                [224, 60],
              ]),
              fill: 'face',
            },
            { d: STRIPE, kind: 'detail', fill: 'dark' },
            { d: mirrorPath(STRIPE, FACE_X), kind: 'detail', fill: 'dark' },
            { d: ellipse(219, 134, 9.5, 6), kind: 'feature', fill: 'blush', opacity: 0.55 },
            { d: ellipse(305, 134, 9.5, 6), kind: 'feature', fill: 'blush', opacity: 0.55 },
            { d: circle(243, 104, 11.5), kind: 'feature', fill: 'eyeRing' },
            { d: circle(281, 104, 11.5), kind: 'feature', fill: 'eyeRing' },
            { d: circle(243.4, 104, 8.8), kind: 'feature', fill: 'eye' },
            { d: circle(280.6, 104, 8.8), kind: 'feature', fill: 'eye' },
            { d: circle(246.6, 100.6, 3.3), kind: 'feature', fill: 'shine' },
            { d: circle(283.8, 100.6, 3.3), kind: 'feature', fill: 'shine' },
            {
              d: `M${FACE_X - 12} 144Q${FACE_X} 138 ${FACE_X + 12} 144Q${FACE_X + 10} 154 ${FACE_X} 157Q${FACE_X - 10} 154 ${FACE_X - 12} 144Z`,
              kind: 'feature',
              fill: 'nose',
            },
            {
              d: ellipse(FACE_X - 4, 143.5, 3.6, 2, -10),
              kind: 'feature',
              fill: 'shine',
              opacity: 0.7,
            },
            {
              d: `M${FACE_X - 9} 163Q${FACE_X - 4} 167 ${FACE_X} 162Q${FACE_X + 4} 167 ${FACE_X + 9} 163`,
              kind: 'line',
              stroke: 'mouth',
              width: 2.4,
            },
          ],
          children: [ear('earN', 205, 64), ear('earF', 319, 64)],
        },
      ],
    },
  ],
};

export default badger;
