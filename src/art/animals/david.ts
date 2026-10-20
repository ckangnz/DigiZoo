import { capsule, circle, curve, ellipse, smooth, type Pt } from '../core/paths';
import type { AnimalDef, PartNode, Shape } from '../core/types';

const CX = 94;
const GROUND = 300;
const HY = 81;
const HR = 69;
const EYE_Y = 88;
const EYE_R = 8.3;

const face = (): Shape[] => [
  { d: circle(CX, HY, HR), fill: 'skin' },
  { d: circle(CX, HY, HR - 1.2), kind: 'feature', fill: 'skin' },
  { d: ellipse(CX - 40, 105, 10.4, 6), kind: 'feature', fill: 'blush', opacity: 0.5 },
  { d: ellipse(CX + 40, 105, 10.4, 6), kind: 'feature', fill: 'blush', opacity: 0.5 },
  { d: curve(CX - 10, 108, CX + 10, 108, 6), kind: 'line', stroke: 'mouth', width: 2.9 },
];

const eye = (x: number): Shape[] => [
  { d: circle(x, EYE_Y, EYE_R), kind: 'feature', fill: 'eye' },
  { d: circle(x + 2.95, EYE_Y - 3.2, 3.05), kind: 'feature', fill: 'shine' },
];

const TUNIC: Pt[] = [
  [CX, 144],
  [CX + 26, 148],
  [CX + 38, 170],
  [CX + 42, 205],
  [CX + 47, 232],
  [CX + 24, 240],
  [CX, 241],
  [CX - 24, 240],
  [CX - 47, 232],
  [CX - 42, 205],
  [CX - 38, 170],
  [CX - 26, 148],
];

const leg = (id: string, x: number, far: boolean): PartNode => {
  const skin = far ? 'skinDark' : 'skin';
  const sandal = far ? 'sandalDark' : 'sandal';
  return {
    id,
    role: id,
    behind: true,
    pivot: [x, 226],
    shapes: [
      { d: capsule(x, 228, x + 1, 287, 9.5, 8.5), fill: skin },
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
        fill: sandal,
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
      { d: capsule(x - 12, 278, x + 12, 278, 2.2), kind: 'detail', fill: 'sandal' },
    ],
  };
};

const arm = (id: string, dir: 1 | -1, far: boolean, children?: PartNode[]): PartNode => ({
  id,
  role: id,
  behind: far,
  pivot: [CX + dir * 28, 160],
  shapes: [
    {
      d: capsule(CX + dir * 28, 160, CX + dir * 48, 200, 11.5, 12.5),
      fill: far ? 'tunicDark' : 'tunic',
    },
    { d: circle(CX + dir * 53, 207, 10), fill: far ? 'skinDark' : 'skin' },
  ],
  children,
});

const SLING_TOP: Pt = [CX + 53, 212];

const sling: PartNode = {
  id: 'sling',
  role: 'tail',
  behind: true,
  pivot: SLING_TOP,
  shapes: [
    {
      d: curve(SLING_TOP[0] - 3, 212, CX + 47, 266, 3),
      kind: 'line',
      stroke: 'cord',
      width: 2.4,
    },
    {
      d: curve(SLING_TOP[0] + 3, 212, CX + 69, 266, -3),
      kind: 'line',
      stroke: 'cord',
      width: 2.4,
    },
    { d: circle(CX + 58, 263, 9), fill: 'stone' },
    {
      d: smooth([
        [CX + 44, 264],
        [CX + 58, 268],
        [CX + 72, 264],
        [CX + 69, 276],
        [CX + 58, 280],
        [CX + 47, 276],
      ]),
      fill: 'pouch',
    },
    { d: circle(CX + 61.5, 259.5, 2.6), kind: 'feature', fill: 'white', opacity: 0.6 },
  ],
};

const curls = (): Shape[] => {
  const out: Shape[] = [];
  for (let i = 0; i <= 10; i++) {
    const a = Math.PI * (1.04 + (0.92 * i) / 10);
    out.push({
      d: circle(CX + (HR + 1) * Math.cos(a), HY + (HR + 1) * Math.sin(a), 12.5),
      fill: 'hair',
    });
  }
  for (let i = 0; i < 5; i++) {
    const x = CX - 36 + i * 18;
    out.push({ d: circle(x, 44 + Math.abs(i - 2) * 3, 11), fill: 'hair' });
  }
  return out;
};

const HAIR: Pt[] = [
  [CX - 66, 74],
  [CX - 68, 40],
  [CX - 44, 16],
  [CX, 8],
  [CX + 44, 16],
  [CX + 68, 40],
  [CX + 66, 74],
  [CX + 52, 54],
  [CX, 44],
  [CX - 52, 54],
];

const david: AnimalDef = {
  id: 'david',
  name: 'David',
  kind: 'character',
  aliases: ['sling', 'shepherd boy', 'king david', 'david and goliath'],
  group: 'bible',
  habitats: ['bible'],
  box: [178, GROUND],
  size: 190,
  locomotion: 'walk2',
  gait: { stride: 70, swing: 20 },
  sound: 'david',
  palette: {
    skin: '#e9bc93',
    skinDark: '#d6a67c',
    hair: '#4a2c1e',
    hairShine: '#6e4632',
    tunic: '#74b85e',
    tunicDark: '#5f9e4e',
    tunicLine: '#4f8a40',
    belt: '#9a6a3c',
    bag: '#b98250',
    bagDark: '#9a6a3c',
    sandal: '#7a4a2c',
    sandalDark: '#653c23',
    cord: '#7a4a2c',
    pouch: '#a8733f',
    stone: '#a3a9b6',
  },
  parts: [
    {
      id: 'body',
      role: 'body',
      pivot: [CX, 226],
      shapes: [
        { d: smooth(TUNIC), fill: 'tunic' },
        { d: capsule(CX + 30, 150, CX - 36, 214, 4.5), kind: 'detail', fill: 'belt' },
        {
          d: smooth([
            [CX - 60, 196],
            [CX, 202],
            [CX + 60, 196],
            [CX + 60, 206],
            [CX, 212],
            [CX - 60, 206],
          ]),
          kind: 'detail',
          fill: 'belt',
        },
        { d: curve(CX - 16, 216, CX - 20, 234, 2), kind: 'line', stroke: 'tunicLine', width: 2.3 },
        { d: curve(CX + 18, 216, CX + 22, 234, -2), kind: 'line', stroke: 'tunicLine', width: 2.3 },
      ],
      children: [
        leg('legF', CX - 15, true),
        arm('armF', -1, true),
        leg('legN', CX + 14, false),
        {
          id: 'bag',
          pivot: [CX - 34, 218],
          shapes: [
            { d: circle(CX - 40, 212, 6), fill: 'stone' },
            { d: circle(CX - 29, 211, 5.5), fill: 'stone' },
            {
              d: smooth([
                [CX - 50, 212],
                [CX - 20, 212],
                [CX - 18, 230],
                [CX - 26, 240],
                [CX - 42, 240],
                [CX - 52, 230],
              ]),
              fill: 'bag',
            },
            {
              d: smooth([
                [CX - 52, 216],
                [CX - 18, 216],
                [CX - 22, 224],
                [CX - 35, 228],
                [CX - 48, 224],
              ]),
              kind: 'detail',
              fill: 'bagDark',
            },
          ],
        },
        {
          id: 'head',
          role: 'head',
          pivot: [CX, 148],
          shapes: face(),
          children: [
            {
              id: 'eyes',
              role: 'lid',
              pivot: [CX, EYE_Y],
              shapes: [...eye(CX - 24), ...eye(CX + 24)],
            },
            {
              id: 'hair',
              pivot: [CX, 40],
              shapes: [
                { d: smooth(HAIR), fill: 'hair' },
                ...curls(),
                { d: ellipse(CX - 30, 24, 12, 5, -24), kind: 'detail', fill: 'hairShine' },
              ],
            },
          ],
        },
        arm('armN', 1, false, [sling]),
      ],
    },
  ],
};

export default david;
