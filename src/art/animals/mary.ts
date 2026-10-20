import { capsule, circle, curve, ellipse, poly, smooth, type Pt } from '../core/paths';
import type { AnimalDef, PartNode, Shape } from '../core/types';

const CX = 95;
const GROUND = 300;
const HEAD_Y = 75;
const HEAD_R = 63;
const EYE_Y = 81;

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

const MANTLE: Pt[] = [
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

const VEIL: Pt[] = [
  [CX - 42, 182],
  [CX - 50, 146],
  [CX - 57, 112],
  [CX - 57, 72],
  [CX - 42, 40],
  [CX, 29],
  [CX + 42, 40],
  [CX + 57, 72],
  [CX + 57, 112],
  [CX + 50, 146],
  [CX + 42, 182],
  [CX + 66, 188],
  [CX + 75, 146],
  [CX + 76, 92],
  [CX + 68, 38],
  [CX + 40, 6],
  [CX, -1],
  [CX - 40, 6],
  [CX - 68, 38],
  [CX - 76, 92],
  [CX - 75, 146],
  [CX - 66, 188],
];

const TRIM: Pt[] = [
  [CX - 47, 190],
  [CX - 52, 146],
  [CX - 59, 112],
  [CX - 59, 72],
  [CX - 44, 38],
  [CX, 27],
  [CX + 44, 38],
  [CX + 59, 72],
  [CX + 59, 112],
  [CX + 52, 146],
  [CX + 47, 190],
  [CX + 53, 190],
  [CX + 58, 146],
  [CX + 65, 112],
  [CX + 65, 70],
  [CX + 49, 32],
  [CX, 20],
  [CX - 49, 32],
  [CX - 65, 70],
  [CX - 65, 112],
  [CX - 58, 146],
  [CX - 53, 190],
];

const HAIR: Pt[] = [
  [CX - 56, 74],
  [CX - 48, 42],
  [CX, 30],
  [CX + 48, 42],
  [CX + 56, 74],
  [CX + 46, 58],
  [CX + 24, 44],
  [CX, 42],
  [CX - 24, 44],
  [CX - 46, 58],
];

const eye = (x: number): Shape[] => [
  { d: circle(x, EYE_Y, 7.6), kind: 'feature', fill: 'eye' },
  { d: circle(x + 2.7, EYE_Y - 2.9, 2.8), kind: 'feature', fill: 'shine' },
];

const mary: AnimalDef = {
  id: 'mary',
  name: 'Mary',
  kind: 'character',
  aliases: ['mother mary', 'virgin mary', 'madonna', 'mother of jesus'],
  group: 'bible',
  habitats: ['bible'],
  box: [190, GROUND],
  size: 230,
  locomotion: 'walk2',
  gait: { stride: 54, swing: 18 },
  sound: 'mary',
  palette: {
    skin: '#dca57c',
    skinDark: '#c99369',
    hair: '#4a2f20',
    veil: '#4a80d6',
    veilLight: '#7eaaf0',
    veilDark: '#3e6dbf',
    dress: '#f7efdc',
    fold: '#e2d3b4',
    sandal: '#8a5a34',
    sandalDark: '#744a2a',
  },
  parts: [
    {
      id: 'body',
      role: 'body',
      pivot: [CX, 240],
      shapes: [
        { d: smooth(MANTLE), fill: 'veil' },
        {
          d: poly([
            [CX - 14, 128],
            [CX + 14, 128],
            [CX + 24, 210],
            [CX + 32, 290],
            [CX - 32, 290],
            [CX - 24, 210],
          ]),
          kind: 'detail',
          fill: 'dress',
        },
        { d: curve(CX - 2, 236, CX - 4, 278, 2), kind: 'line', stroke: 'fold', width: 2.4 },
        { d: curve(CX - 24, 210, CX - 32, 282, 2), kind: 'line', stroke: 'veilLight', width: 2.6 },
        { d: curve(CX + 24, 210, CX + 32, 282, -2), kind: 'line', stroke: 'veilLight', width: 2.6 },
      ],
      children: [
        leg('legF', CX - 16, true),
        leg('legN', CX + 14, false),
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
              id: 'hair',
              pivot: [CX, 40],
              shapes: [{ d: smooth(HAIR), fill: 'hair' }],
            },
            {
              id: 'veil',
              pivot: [CX, 40],
              shapes: [
                { d: smooth(VEIL), fill: 'veil' },
                {
                  d: smooth(TRIM),
                  kind: 'detail',
                  fill: 'veilLight',
                },
              ],
            },
          ],
        },
        {
          id: 'arms',
          pivot: [CX, 160],
          shapes: [
            { d: capsule(CX - 34, 152, CX - 12, 200, 12, 14), fill: 'veilDark' },
            { d: capsule(CX + 34, 152, CX + 12, 200, 12, 14), fill: 'veilDark' },
            {
              d: smooth([
                [CX, 164],
                [CX + 9, 174],
                [CX + 11, 190],
                [CX + 7, 202],
                [CX, 205],
                [CX - 7, 202],
                [CX - 11, 190],
                [CX - 9, 174],
              ]),
              fill: 'skin',
            },
            { d: curve(CX, 172, CX, 198, 0), kind: 'line', stroke: 'skinDark', width: 2.2 },
          ],
        },
      ],
    },
  ],
};

export default mary;
