import { capsule, circle, curve, ellipse, roundRect, smooth, tube, type Pt } from '../core/paths';
import type { AnimalDef, PartNode, Shape } from '../core/types';

const CX = 88;
const GROUND = 300;
const HEAD_Y = 75;
const HEAD_R = 63;
const EYE_Y = 81;
const STAFF_X = CX + 84;

const leg = (id: string, x: number, far: boolean): PartNode => {
  const skin = far ? 'skinDark' : 'skin';
  return {
    id,
    role: id,
    behind: true,
    pivot: [x, 242],
    shapes: [
      { d: capsule(x, 246, x + 1, 287, 8.5, 8), fill: skin },
      {
        d: smooth([
          [x - 12, 296],
          [x + 4, 293],
          [x + 20, 295],
          [x + 22, GROUND - 1],
          [x + 8, GROUND],
          [x - 10, GROUND],
          [x - 14, 298],
        ]),
        fill: far ? 'sandalDark' : 'sandal',
      },
      {
        d: smooth([
          [x - 10, 290],
          [x + 3, 285],
          [x + 16, 289],
          [x + 19, 295],
          [x + 6, 297],
          [x - 8, 297],
          [x - 12, 294],
        ]),
        fill: skin,
      },
      { d: capsule(x + 1, 284, x + 9, 296, 2.2), kind: 'detail', fill: 'sandal' },
    ],
  };
};

const ROBE: Pt[] = [
  [CX, 128],
  [CX + 28, 132],
  [CX + 40, 158],
  [CX + 45, 205],
  [CX + 51, 252],
  [CX + 54, 272],
  [CX + 30, 280],
  [CX, 281],
  [CX - 30, 280],
  [CX - 54, 272],
  [CX - 51, 252],
  [CX - 45, 205],
  [CX - 40, 158],
  [CX - 28, 132],
];

const CLOAK: Pt[] = [
  [CX, 134],
  [CX + 36, 140],
  [CX + 50, 176],
  [CX + 56, 230],
  [CX + 60, 272],
  [CX + 44, 276],
  [CX, 270],
  [CX - 44, 276],
  [CX - 60, 272],
  [CX - 56, 230],
  [CX - 50, 176],
  [CX - 36, 140],
];

const SCARF: Pt[] = [
  [CX - 44, 168],
  [CX - 52, 136],
  [CX - 57, 100],
  [CX - 57, 66],
  [CX - 40, 46],
  [CX, 42],
  [CX + 40, 46],
  [CX + 57, 66],
  [CX + 57, 100],
  [CX + 52, 136],
  [CX + 44, 168],
  [CX + 68, 172],
  [CX + 75, 132],
  [CX + 76, 84],
  [CX + 68, 34],
  [CX + 40, 6],
  [CX, 0],
  [CX - 40, 6],
  [CX - 68, 34],
  [CX - 76, 84],
  [CX - 75, 132],
  [CX - 68, 172],
];

const BEARD: Pt[] = [
  [CX - 55, 102],
  [CX - 44, 109],
  [CX - 28, 113],
  [CX - 12, 114],
  [CX, 113],
  [CX + 12, 114],
  [CX + 28, 113],
  [CX + 44, 109],
  [CX + 55, 102],
  [CX + 55, 113],
  [CX + 45, 127],
  [CX + 26, 137],
  [CX, 140],
  [CX - 26, 137],
  [CX - 45, 127],
  [CX - 55, 113],
];

const stripe = (x: number): Shape => ({
  d: roundRect(x - 4, -10, 8, 200, 3),
  kind: 'detail',
  fill: 'stripe',
});

const eye = (x: number): Shape[] => [
  { d: circle(x, EYE_Y, 7.6), kind: 'feature', fill: 'eye' },
  { d: circle(x + 2.7, EYE_Y - 2.9, 2.8), kind: 'feature', fill: 'shine' },
];

const joseph: AnimalDef = {
  id: 'joseph',
  name: 'Joseph',
  kind: 'character',
  aliases: ['saint joseph', 'st joseph', 'carpenter', 'joseph of nazareth'],
  group: 'bible',
  habitats: ['bible'],
  box: [184, GROUND],
  size: 240,
  locomotion: 'walk2',
  gait: { stride: 56, swing: 18 },
  sound: 'joseph',
  palette: {
    skin: '#b97a52',
    skinDark: '#a86c47',
    beard: '#4a2f1f',
    robe: '#dcc08f',
    robeDark: '#cbad7b',
    fold: '#c6a575',
    cloak: '#94643e',
    belt: '#6e4a2c',
    scarf: '#f3e9d2',
    stripe: '#86a6d8',
    band: '#6e4a2c',
    staff: '#a8743f',
    staffDark: '#8a5c30',
    sandal: '#8a5a34',
    sandalDark: '#744a2a',
  },
  parts: [
    {
      id: 'body',
      role: 'body',
      pivot: [CX, 240],
      shapes: [
        { d: smooth(ROBE), fill: 'robe' },
        { d: roundRect(CX - 50, 206, 100, 10, 5), kind: 'detail', fill: 'belt' },
        { d: capsule(CX + 10, 212, CX + 14, 244, 3), kind: 'feature', fill: 'belt' },
        { d: capsule(CX + 16, 212, CX + 22, 240, 3), kind: 'feature', fill: 'belt' },
        { d: curve(CX - 18, 226, CX - 24, 274, 3), kind: 'line', stroke: 'fold', width: 2.6 },
        { d: curve(CX + 20, 250, CX + 24, 276, -2), kind: 'line', stroke: 'fold', width: 2.6 },
      ],
      children: [
        {
          id: 'cloak',
          role: 'tail',
          behind: true,
          pivot: [CX, 140],
          motion: { rotate: 1.5, phase: 0.25 },
          shapes: [{ d: smooth(CLOAK), fill: 'cloak' }],
        },
        leg('legF', CX - 16, true),
        leg('legN', CX + 14, false),
        {
          id: 'armF',
          role: 'armF',
          behind: true,
          pivot: [CX - 30, 152],
          shapes: [
            { d: circle(CX - 53, 210, 10.5), fill: 'skinDark' },
            { d: capsule(CX - 30, 152, CX - 47, 198, 12, 14), fill: 'robeDark' },
          ],
        },
        {
          id: 'head',
          role: 'head',
          pivot: [CX, 136],
          shapes: [
            { d: circle(CX, HEAD_Y, HEAD_R), fill: 'skin' },
            { d: circle(CX, HEAD_Y, HEAD_R - 1.2), kind: 'feature', fill: 'skin' },
            { d: ellipse(CX - 37, 97, 9.5, 5.5), kind: 'feature', fill: 'blush', opacity: 0.5 },
            { d: ellipse(CX + 37, 97, 9.5, 5.5), kind: 'feature', fill: 'blush', opacity: 0.5 },
            { d: curve(CX - 9, 100, CX + 9, 100, 5.5), kind: 'line', stroke: 'mouth', width: 2.8 },
          ],
          children: [
            {
              id: 'eyes',
              role: 'lid',
              pivot: [CX, EYE_Y],
              shapes: [...eye(CX - 22), ...eye(CX + 22)],
            },
            {
              id: 'beard',
              pivot: [CX, 120],
              shapes: [{ d: smooth(BEARD), fill: 'beard' }],
            },
            {
              id: 'scarf',
              pivot: [CX, 40],
              shapes: [
                { d: smooth(SCARF), fill: 'scarf' },
                stripe(CX - 66),
                stripe(CX - 44),
                stripe(CX - 22),
                stripe(CX),
                stripe(CX + 22),
                stripe(CX + 44),
                stripe(CX + 66),
                {
                  d: smooth([
                    [CX - 62, 56],
                    [CX - 40, 38],
                    [CX, 32],
                    [CX + 40, 38],
                    [CX + 62, 56],
                    [CX + 62, 66],
                    [CX + 40, 48],
                    [CX, 42],
                    [CX - 40, 48],
                    [CX - 62, 66],
                  ]),
                  fill: 'band',
                },
              ],
            },
          ],
        },
        {
          id: 'armN',
          role: 'armN',
          pivot: [CX + 32, 152],
          motion: { rotate: 4, phase: 0.5 },
          shapes: [
            { d: capsule(CX + 32, 152, CX + 52, 198, 12, 12), fill: 'robe' },
            { d: capsule(CX + 52, 198, CX + 74, 184, 12, 13), fill: 'robe' },
          ],
          children: [
            {
              id: 'staff',
              behind: true,
              pivot: [STAFF_X, 200],
              shapes: [
                {
                  d: tube(
                    [
                      [STAFF_X + 1, 297],
                      [STAFF_X, 220],
                      [STAFF_X - 1, 130],
                      [STAFF_X + 1, 62],
                      [STAFF_X - 3, 40],
                    ],
                    (t) => 4.6 + 0.8 * t,
                    48,
                  ),
                  fill: 'staff',
                },
                {
                  d: curve(STAFF_X - 2, 150, STAFF_X - 2, 120, -2),
                  kind: 'line',
                  stroke: 'staffDark',
                  width: 2,
                },
              ],
            },
            {
              id: 'handN',
              pivot: [STAFF_X, 182],
              shapes: [{ d: circle(STAFF_X - 1, 181, 11), fill: 'skin' }],
            },
          ],
        },
      ],
    },
  ],
};

export default joseph;
