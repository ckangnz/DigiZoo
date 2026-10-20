import { capsule, circle, curve, ellipse, poly, roundRect, smooth, type Pt } from '../core/paths';
import type { AnimalDef, PartNode, Shape } from '../core/types';

const CX = 93;
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

const CAPE: Pt[] = [
  [CX, 132],
  [CX + 40, 138],
  [CX + 56, 180],
  [CX + 62, 232],
  [CX + 66, 270],
  [CX + 46, 274],
  [CX, 266],
  [CX - 46, 274],
  [CX - 66, 270],
  [CX - 62, 232],
  [CX - 56, 180],
  [CX - 40, 138],
];

const BEARD: Pt[] = [
  [CX - 55, 100],
  [CX - 43, 109],
  [CX - 26, 113],
  [CX - 12, 114],
  [CX, 113],
  [CX + 12, 114],
  [CX + 26, 113],
  [CX + 43, 109],
  [CX + 55, 100],
  [CX + 55, 111],
  [CX + 43, 127],
  [CX + 20, 139],
  [CX, 148],
  [CX - 20, 139],
  [CX - 43, 127],
  [CX - 55, 111],
];

const CROWN: Pt[] = [
  [CX - 50, 50],
  [CX - 55, 14],
  [CX - 27, 30],
  [CX, 6],
  [CX + 27, 30],
  [CX + 55, 14],
  [CX + 50, 50],
  [CX, 54],
];

const eye = (x: number): Shape[] => [
  { d: circle(x, EYE_Y, 7.6), kind: 'feature', fill: 'eye' },
  { d: circle(x + 2.7, EYE_Y - 2.9, 2.8), kind: 'feature', fill: 'shine' },
];

const jewel = (x: number, y: number, r: number, fill: string): Shape => ({
  d: circle(x, y, r),
  kind: 'feature',
  fill,
  stroke: 'auto',
  width: 1.4,
});

const wiseMan: AnimalDef = {
  id: 'wise-man',
  name: 'Wise Man',
  kind: 'character',
  aliases: ['king', 'magi', 'three kings', 'wise men', 'three wise men'],
  group: 'bible',
  habitats: ['bible'],
  box: [186, GROUND],
  size: 240,
  locomotion: 'walk2',
  gait: { stride: 54, swing: 18 },
  sound: 'wise-man',
  palette: {
    skin: '#a46b45',
    skinDark: '#93603d',
    hair: '#2a201c',
    robe: '#24a094',
    robeDark: '#1d897e',
    fold: '#1b8076',
    trim: '#f4c64a',
    cape: '#7d50bc',
    crown: '#f6c843',
    crownDark: '#dba42b',
    ruby: '#e2475a',
    sapphire: '#3d8be0',
    emerald: '#2fbf8f',
    chest: '#eab43c',
    chestLid: '#f6cd5e',
    chestDark: '#c98f23',
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
        { d: roundRect(CX - 70, 262, 140, 12, 4), kind: 'detail', fill: 'trim' },
        { d: curve(CX - 24, 230, CX - 30, 258, 2), kind: 'line', stroke: 'fold', width: 2.6 },
        { d: curve(CX + 24, 232, CX + 30, 258, -2), kind: 'line', stroke: 'fold', width: 2.6 },
      ],
      children: [
        {
          id: 'cape',
          role: 'tail',
          behind: true,
          pivot: [CX, 140],
          motion: { rotate: 1.5, phase: 0.25 },
          shapes: [{ d: smooth(CAPE), fill: 'cape' }],
        },
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
              id: 'hair',
              behind: true,
              pivot: [CX, 60],
              shapes: [
                { d: ellipse(CX - 56, 76, 13, 30, 8), fill: 'hair' },
                { d: ellipse(CX + 56, 76, 13, 30, -8), fill: 'hair' },
              ],
            },
            {
              id: 'eyes',
              role: 'lid',
              pivot: [CX, EYE_Y],
              shapes: [...eye(CX - 22), ...eye(CX + 22)],
            },
            {
              id: 'beard',
              pivot: [CX, 120],
              shapes: [{ d: smooth(BEARD), fill: 'hair' }],
            },
            {
              id: 'crown',
              pivot: [CX, 40],
              shapes: [
                { d: poly(CROWN), fill: 'crown' },
                {
                  d: poly([
                    [CX - 60, 38],
                    [CX + 60, 38],
                    [CX + 60, 60],
                    [CX - 60, 60],
                  ]),
                  kind: 'detail',
                  fill: 'crownDark',
                },
                jewel(CX - 55, 13, 5.5, 'crown'),
                jewel(CX, 5, 6, 'crown'),
                jewel(CX + 55, 13, 5.5, 'crown'),
                jewel(CX, 45, 5, 'ruby'),
                jewel(CX - 28, 44, 4, 'sapphire'),
                jewel(CX + 28, 44, 4, 'emerald'),
              ],
            },
          ],
        },
        {
          id: 'sleeves',
          pivot: [CX, 160],
          shapes: [
            { d: capsule(CX - 32, 152, CX - 34, 200, 12, 14), fill: 'robeDark' },
            { d: capsule(CX + 32, 152, CX + 34, 200, 12, 14), fill: 'robe' },
            { d: capsule(CX - 48, 196, CX - 20, 196, 4.5), kind: 'detail', fill: 'trim' },
            { d: capsule(CX + 20, 196, CX + 48, 196, 4.5), kind: 'detail', fill: 'trim' },
          ],
        },
        {
          id: 'gift',
          pivot: [CX, 206],
          shapes: [
            { d: roundRect(CX - 25, 196, 50, 30, 5), fill: 'chest' },
            { d: `M${CX - 27} 199Q${CX} 172 ${CX + 27} 199Z`, fill: 'chestLid' },
            { d: roundRect(CX - 30, 196, 60, 5, 2), kind: 'detail', fill: 'chestDark' },
            { d: roundRect(CX - 30, 220, 60, 8, 2), kind: 'detail', fill: 'chestDark' },
            jewel(CX, 207, 5, 'ruby'),
          ],
        },
        {
          id: 'hands',
          pivot: [CX, 210],
          shapes: [
            { d: circle(CX - 30, 212, 10.5), fill: 'skinDark' },
            { d: circle(CX + 30, 212, 10.5), fill: 'skin' },
          ],
        },
      ],
    },
  ],
};

export default wiseMan;
