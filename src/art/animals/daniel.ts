import { capsule, circle, curve, ellipse, smooth, type Pt } from '../core/paths';
import type { AnimalDef, PartNode, Shape } from '../core/types';

const CX = 92;
const GROUND = 300;
const HY = 75;
const HR = 63;
const EYE_Y = 81;
const EYE_R = 7.6;

const face = (): Shape[] => [
  { d: circle(CX, HY, HR), fill: 'skin' },
  { d: circle(CX, HY, HR - 1.2), kind: 'feature', fill: 'skin' },
  { d: ellipse(CX - 37, 97, 9.5, 5.5), kind: 'feature', fill: 'blush', opacity: 0.5 },
  { d: ellipse(CX + 37, 97, 9.5, 5.5), kind: 'feature', fill: 'blush', opacity: 0.5 },
  { d: curve(CX - 9, 100, CX + 9, 100, 5.5), kind: 'line', stroke: 'mouth', width: 2.8 },
];

const eye = (x: number): Shape[] => [
  { d: circle(x, EYE_Y, EYE_R), kind: 'feature', fill: 'eye' },
  { d: circle(x + 2.7, EYE_Y - 2.9, 2.8), kind: 'feature', fill: 'shine' },
];

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

const armF: PartNode = {
  id: 'armF',
  role: 'armF',
  behind: true,
  pivot: [CX - 30, 152],
  shapes: [
    { d: capsule(CX - 30, 152, CX - 48, 194, 12, 13.5), fill: 'robeDark' },
    { d: capsule(CX - 44, 190, CX - 51, 198, 13.5), kind: 'detail', fill: 'goldDark' },
    { d: circle(CX - 52, 205, 9.5), fill: 'skinDark' },
  ],
};

const HAND: Pt = [CX + 75, 106];

const armN: PartNode = {
  id: 'armN',
  role: 'armN',
  pivot: [CX + 30, 152],
  motion: { rotate: 7, freq: 2 },
  shapes: [
    { d: capsule(CX + 30, 152, CX + 64, 124, 12, 13.5), fill: 'robe' },
    { d: capsule(CX + 58, 128, CX + 66, 122, 13.5), kind: 'detail', fill: 'gold' },
    { d: capsule(HAND[0] - 8, HAND[1] + 6, HAND[0] - 16, HAND[1] - 4, 5), fill: 'skin' },
    { d: ellipse(HAND[0] + 1, HAND[1] - 2, 10.5, 12.5, 14), fill: 'skin' },
    {
      d: curve(HAND[0] - 1, HAND[1] - 13, HAND[0] - 2, HAND[1] - 5, -1),
      kind: 'line',
      stroke: 'skinLine',
      width: 1.8,
    },
    {
      d: curve(HAND[0] + 5.5, HAND[1] - 12, HAND[0] + 4.5, HAND[1] - 4, -1),
      kind: 'line',
      stroke: 'skinLine',
      width: 1.8,
    },
  ],
};

const HAIR: Pt[] = [
  [CX - 64, 76],
  [CX - 68, 44],
  [CX - 50, 16],
  [CX, 6],
  [CX + 50, 16],
  [CX + 68, 44],
  [CX + 64, 76],
  [CX + 58, 62],
  [CX + 48, 44],
  [CX + 24, 40],
  [CX + 6, 36],
  [CX - 14, 44],
  [CX - 34, 38],
  [CX - 52, 46],
  [CX - 58, 62],
];

const daniel: AnimalDef = {
  id: 'daniel',
  name: 'Daniel',
  kind: 'character',
  aliases: ['lions den', 'daniel and the lions', 'lion den', 'prophet daniel'],
  group: 'bible',
  habitats: ['bible'],
  box: [184, GROUND],
  size: 230,
  locomotion: 'walk2',
  gait: { stride: 54, swing: 18 },
  sound: 'daniel',
  palette: {
    skin: '#b07450',
    skinDark: '#9d6545',
    skinLine: '#8a5636',
    hair: '#2e211c',
    hairShine: '#4d3a31',
    robe: '#7d5bc6',
    robeDark: '#6948ad',
    robeLine: '#5d3f9c',
    gold: '#f4c44f',
    goldDark: '#dcaa36',
    gem: '#e2475a',
    sandal: '#7a4a2c',
    sandalDark: '#653c23',
  },
  parts: [
    {
      id: 'body',
      role: 'body',
      pivot: [CX, 242],
      shapes: [
        { d: smooth(ROBE), fill: 'robe' },
        {
          d: smooth([
            [CX - 34, 128],
            [CX + 34, 128],
            [CX + 40, 146],
            [CX + 20, 160],
            [CX, 164],
            [CX - 20, 160],
            [CX - 40, 146],
          ]),
          kind: 'detail',
          fill: 'gold',
        },
        {
          d: smooth([
            [CX - 70, 264],
            [CX, 270],
            [CX + 70, 264],
            [CX + 70, 290],
            [CX - 70, 290],
          ]),
          kind: 'detail',
          fill: 'gold',
        },
        {
          d: smooth([
            [CX - 60, 206],
            [CX, 212],
            [CX + 60, 206],
            [CX + 60, 218],
            [CX, 224],
            [CX - 60, 218],
          ]),
          kind: 'detail',
          fill: 'goldDark',
        },
        { d: circle(CX, 216, 5), kind: 'feature', fill: 'gem', stroke: 'auto', width: 1.6 },
        { d: curve(CX - 22, 228, CX - 27, 256, 3), kind: 'line', stroke: 'robeLine', width: 2.4 },
        { d: curve(CX + 22, 228, CX + 27, 256, -3), kind: 'line', stroke: 'robeLine', width: 2.4 },
      ],
      children: [
        leg('legF', CX - 16, true),
        armF,
        leg('legN', CX + 14, false),
        {
          id: 'head',
          role: 'head',
          pivot: [CX, 136],
          shapes: face(),
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
              shapes: [
                { d: smooth(HAIR), fill: 'hair' },
                { d: ellipse(CX - 30, 22, 14, 5, -26), kind: 'detail', fill: 'hairShine' },
              ],
            },
            {
              id: 'band',
              pivot: [CX, 50],
              shapes: [
                {
                  d: `M${CX - 64} 58Q${CX} 34 ${CX + 64} 58L${CX + 63} 66Q${CX} 43 ${CX - 63} 66Z`,
                  fill: 'gold',
                },
                {
                  d: circle(CX, 48, 4.6),
                  kind: 'feature',
                  fill: 'gem',
                  stroke: 'auto',
                  width: 1.6,
                },
              ],
            },
          ],
        },
        armN,
      ],
    },
  ],
};

export default daniel;
