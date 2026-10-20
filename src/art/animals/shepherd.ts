import {
  capsule,
  circle,
  curve,
  ellipse,
  roundRect,
  scallop,
  smooth,
  tube,
  type Pt,
} from '../core/paths';
import type { AnimalDef, PartNode, Shape } from '../core/types';

const CX = 86;
const GROUND = 300;
const HEAD_Y = 75;
const HEAD_R = 63;
const EYE_Y = 81;
const STAFF_X = CX + 82;

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

const TUNIC: Pt[] = [
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

const SCARF: Pt[] = [
  [CX - 46, 146],
  [CX - 55, 112],
  [CX - 57, 80],
  [CX - 44, 50],
  [CX, 44],
  [CX + 44, 50],
  [CX + 57, 80],
  [CX + 55, 112],
  [CX + 46, 146],
  [CX + 68, 150],
  [CX + 75, 112],
  [CX + 75, 74],
  [CX + 66, 32],
  [CX + 40, 6],
  [CX, 0],
  [CX - 40, 6],
  [CX - 66, 32],
  [CX - 75, 74],
  [CX - 75, 112],
  [CX - 68, 150],
];

const FRINGE: Pt[] = [
  [CX - 50, 64],
  [CX - 34, 48],
  [CX, 44],
  [CX + 34, 48],
  [CX + 50, 64],
  [CX + 36, 60],
  [CX + 22, 66],
  [CX + 8, 58],
  [CX - 6, 66],
  [CX - 20, 58],
  [CX - 34, 64],
];

const CROOK: Pt[] = [
  [STAFF_X + 1, 297],
  [STAFF_X, 200],
  [STAFF_X - 1, 110],
  [STAFF_X, 52],
  [STAFF_X + 4, 32],
  [STAFF_X + 16, 22],
  [STAFF_X + 28, 26],
  [STAFF_X + 33, 40],
  [STAFF_X + 29, 54],
];

const stripe = (x: number): Shape => ({
  d: roundRect(x - 4.5, -10, 9, 180, 3),
  kind: 'detail',
  fill: 'stripe',
});

const eye = (x: number): Shape[] => [
  { d: circle(x, EYE_Y, 7.6), kind: 'feature', fill: 'eye' },
  { d: circle(x + 2.7, EYE_Y - 2.9, 2.8), kind: 'feature', fill: 'shine' },
];

const shepherd: AnimalDef = {
  id: 'shepherd',
  name: 'Shepherd',
  kind: 'character',
  aliases: ['shepherd boy', 'sheep herder', 'herdsman', 'nativity shepherd'],
  group: 'bible',
  habitats: ['bible'],
  box: [206, GROUND],
  size: 230,
  locomotion: 'walk2',
  gait: { stride: 56, swing: 18 },
  sound: 'shepherd',
  palette: {
    skin: '#d29a6e',
    skinDark: '#c08a60',
    hair: '#2f2420',
    tunic: '#9b6b43',
    tunicDark: '#87593a',
    fold: '#82573a',
    belt: '#e4c992',
    fleece: '#fbf6ec',
    fleeceShade: '#e8dfcf',
    scarf: '#f0e2c4',
    stripe: '#cf6446',
    band: '#5a3b26',
    crook: '#b07a45',
    crookDark: '#8d5d31',
    sandal: '#8a5a34',
    sandalDark: '#744a2a',
  },
  parts: [
    {
      id: 'body',
      role: 'body',
      pivot: [CX, 240],
      shapes: [
        { d: smooth(TUNIC), fill: 'tunic' },
        { d: roundRect(CX - 50, 208, 100, 9, 4.5), kind: 'detail', fill: 'belt' },
        { d: capsule(CX - 18, 214, CX - 22, 240, 2.8), kind: 'feature', fill: 'belt' },
        { d: curve(CX - 20, 232, CX - 26, 274, 3), kind: 'line', stroke: 'fold', width: 2.6 },
        { d: curve(CX + 18, 246, CX + 22, 276, -2), kind: 'line', stroke: 'fold', width: 2.6 },
      ],
      children: [
        leg('legF', CX - 16, true),
        leg('legN', CX + 14, false),
        {
          id: 'armF',
          role: 'armF',
          behind: true,
          pivot: [CX - 30, 152],
          shapes: [
            { d: circle(CX - 53, 210, 10.5), fill: 'skinDark' },
            { d: capsule(CX - 30, 152, CX - 47, 198, 12, 13), fill: 'tunicDark' },
          ],
        },
        {
          id: 'fleece',
          pivot: [CX, 150],
          shapes: [
            { d: scallop(CX - 30, 152, 20, 9, 5), fill: 'fleece' },
            { d: scallop(CX + 30, 152, 20, 9, 5), fill: 'fleece' },
            { d: scallop(CX, 160, 22, 9, 5), fill: 'fleece' },
            { d: circle(CX - 28, 162, 3), kind: 'detail', fill: 'fleeceShade' },
            { d: circle(CX + 6, 172, 3), kind: 'detail', fill: 'fleeceShade' },
            { d: circle(CX + 34, 160, 3), kind: 'detail', fill: 'fleeceShade' },
          ],
        },
        {
          id: 'head',
          role: 'head',
          pivot: [CX, 136],
          shapes: [
            { d: circle(CX, HEAD_Y, HEAD_R), fill: 'skin' },
            { d: circle(CX, HEAD_Y, HEAD_R - 1.2), kind: 'feature', fill: 'skin' },
            { d: ellipse(CX - 37, 97, 9.5, 5.5), kind: 'feature', fill: 'blush', opacity: 0.55 },
            { d: ellipse(CX + 37, 97, 9.5, 5.5), kind: 'feature', fill: 'blush', opacity: 0.55 },
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
              id: 'fringe',
              pivot: [CX, 50],
              shapes: [{ d: smooth(FRINGE), fill: 'hair' }],
            },
            {
              id: 'scarf',
              pivot: [CX, 40],
              shapes: [
                { d: smooth(SCARF), fill: 'scarf' },
                stripe(CX - 60),
                stripe(CX - 30),
                stripe(CX),
                stripe(CX + 30),
                stripe(CX + 60),
                {
                  d: smooth([
                    [CX - 62, 58],
                    [CX - 40, 42],
                    [CX, 36],
                    [CX + 40, 42],
                    [CX + 62, 58],
                    [CX + 62, 68],
                    [CX + 40, 52],
                    [CX, 46],
                    [CX - 40, 52],
                    [CX - 62, 68],
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
            { d: capsule(CX + 32, 152, CX + 50, 196, 12, 11.5), fill: 'tunic' },
            { d: capsule(CX + 50, 196, CX + 72, 182, 11.5, 12), fill: 'tunic' },
          ],
          children: [
            {
              id: 'crook',
              behind: true,
              pivot: [STAFF_X, 196],
              shapes: [
                { d: tube(CROOK, 4.8, 64), fill: 'crook' },
                {
                  d: curve(STAFF_X - 2, 150, STAFF_X - 2, 122, -2),
                  kind: 'line',
                  stroke: 'crookDark',
                  width: 2,
                },
              ],
            },
            {
              id: 'handN',
              pivot: [STAFF_X, 180],
              shapes: [{ d: circle(STAFF_X - 1, 179, 11), fill: 'skin' }],
            },
          ],
        },
      ],
    },
  ],
};

export default shepherd;
