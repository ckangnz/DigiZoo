import { capsule, circle, curve, ellipse, smooth, type Pt } from '../core/paths';
import type { AnimalDef, PartNode, Shape } from '../core/types';

const CX = 100;
const GROUND = 300;
const HY = 75;
const HR = 63;
const EYE_Y = 81;
const EYE_R = 7.6;

const face = (): Shape[] => [
  { d: circle(CX, HY, HR), fill: 'skin' },
  { d: circle(CX, HY, HR - 1.2), kind: 'feature', fill: 'skin' },
  { d: ellipse(CX - 37, 97, 9.5, 5.5), kind: 'feature', fill: 'blush', opacity: 0.55 },
  { d: ellipse(CX + 37, 97, 9.5, 5.5), kind: 'feature', fill: 'blush', opacity: 0.55 },
  { d: curve(CX - 9, 100, CX + 9, 100, 5.5), kind: 'line', stroke: 'mouth', width: 2.8 },
];

const eye = (x: number): Shape[] => [
  { d: circle(x, EYE_Y, EYE_R), kind: 'feature', fill: 'eye' },
  { d: circle(x + 2.7, EYE_Y - 2.9, 2.8), kind: 'feature', fill: 'shine' },
];

const GOWN: Pt[] = [
  [CX, 128],
  [CX + 28, 132],
  [CX + 40, 158],
  [CX + 46, 205],
  [CX + 54, 252],
  [CX + 60, 274],
  [CX + 32, 282],
  [CX, 283],
  [CX - 32, 282],
  [CX - 60, 274],
  [CX - 54, 252],
  [CX - 46, 205],
  [CX - 40, 158],
  [CX - 28, 132],
];

const MANTLE: Pt[] = [
  [CX, 132],
  [CX + 44, 138],
  [CX + 66, 176],
  [CX + 76, 236],
  [CX + 82, 276],
  [CX + 50, 286],
  [CX - 50, 286],
  [CX - 82, 276],
  [CX - 76, 236],
  [CX - 66, 176],
  [CX - 44, 138],
];

const HAIR_BACK: Pt[] = [
  [CX, 8],
  [CX + 50, 18],
  [CX + 72, 56],
  [CX + 74, 120],
  [CX + 68, 180],
  [CX + 70, 218],
  [CX + 52, 232],
  [CX + 34, 220],
  [CX, 200],
  [CX - 34, 220],
  [CX - 52, 232],
  [CX - 70, 218],
  [CX - 68, 180],
  [CX - 74, 120],
  [CX - 72, 56],
  [CX - 50, 18],
];

const HAIR_FRONT: Pt[] = [
  [CX, 7],
  [CX + 38, 12],
  [CX + 60, 32],
  [CX + 70, 64],
  [CX + 72, 104],
  [CX + 74, 144],
  [CX + 66, 172],
  [CX + 54, 164],
  [CX + 58, 130],
  [CX + 60, 96],
  [CX + 54, 64],
  [CX + 40, 46],
  [CX + 20, 36],
  [CX, 32],
  [CX - 20, 36],
  [CX - 40, 46],
  [CX - 54, 64],
  [CX - 60, 96],
  [CX - 58, 130],
  [CX - 54, 164],
  [CX - 66, 172],
  [CX - 74, 144],
  [CX - 72, 104],
  [CX - 70, 64],
  [CX - 60, 32],
  [CX - 38, 12],
];

const CROWN: Pt[] = [
  [CX - 30, 34],
  [CX - 34, 14],
  [CX - 22, 22],
  [CX - 14, 4],
  [CX - 6, 18],
  [CX, 0],
  [CX + 6, 18],
  [CX + 14, 4],
  [CX + 22, 22],
  [CX + 34, 14],
  [CX + 30, 34],
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
    { d: capsule(CX - 30, 152, CX - 48, 196, 12, 14), fill: 'gownDark' },
    { d: capsule(CX - 44, 192, CX - 51, 200, 14), kind: 'detail', fill: 'goldDark' },
    { d: circle(CX - 52, 207, 9.5), fill: 'skinDark' },
  ],
};

const armN: PartNode = {
  id: 'armN',
  role: 'armN',
  pivot: [CX + 30, 152],
  motion: { rotate: 2 },
  shapes: [
    { d: capsule(CX + 30, 152, CX + 50, 190, 12, 14), fill: 'gown' },
    { d: capsule(CX + 46, 186, CX + 53, 194, 14), kind: 'detail', fill: 'gold' },
  ],
  children: [
    {
      id: 'sceptre',
      behind: true,
      pivot: [CX + 58, 200],
      shapes: [
        { d: capsule(CX + 58, 150, CX + 58, 248, 4.2), fill: 'gold' },
        { d: circle(CX + 58, 144, 10), fill: 'gold' },
        { d: ellipse(CX + 58, 157, 8, 4), fill: 'gold' },
        { d: circle(CX + 58, 144, 5), kind: 'detail', fill: 'ruby' },
        { d: circle(CX + 55, 140, 2.6), kind: 'feature', fill: 'white', opacity: 0.75 },
      ],
    },
    { id: 'handN', shapes: [{ d: circle(CX + 56, 200, 9.5), fill: 'skin' }] },
  ],
};

const esther: AnimalDef = {
  id: 'esther',
  name: 'Queen Esther',
  kind: 'character',
  aliases: ['queen', 'crown', 'princess', 'royal', 'purim'],
  group: 'bible',
  habitats: ['bible'],
  box: [200, GROUND],
  size: 240,
  locomotion: 'walk2',
  gait: { stride: 54, swing: 18 },
  sound: 'esther',
  palette: {
    skin: '#e3ae84',
    skinDark: '#cf9a72',
    hair: '#3a2420',
    hairShine: '#5c3b33',
    gown: '#ef84b4',
    gownDark: '#d96c9e',
    gownLine: '#d0679a',
    mantle: '#8a5cd0',
    mantleDark: '#7449b8',
    gold: '#f6c74e',
    goldDark: '#dcaa36',
    ruby: '#e2475a',
    sapphire: '#3d8be0',
    pearl: '#fff6e8',
    sandal: '#b07a3e',
    sandalDark: '#946430',
  },
  parts: [
    {
      id: 'body',
      role: 'body',
      pivot: [CX, 242],
      shapes: [
        { d: smooth(GOWN), fill: 'gown' },
        {
          d: smooth([
            [CX - 30, 128],
            [CX + 30, 128],
            [CX + 34, 140],
            [CX + 16, 152],
            [CX, 156],
            [CX - 16, 152],
            [CX - 34, 140],
          ]),
          kind: 'detail',
          fill: 'gold',
        },
        {
          d: smooth([
            [CX - 70, 266],
            [CX, 273],
            [CX + 70, 266],
            [CX + 70, 292],
            [CX - 70, 292],
          ]),
          kind: 'detail',
          fill: 'gold',
        },
        {
          d: smooth([
            [CX - 60, 196],
            [CX, 202],
            [CX + 60, 196],
            [CX + 60, 207],
            [CX, 213],
            [CX - 60, 207],
          ]),
          kind: 'detail',
          fill: 'goldDark',
        },
        { d: circle(CX, 206, 5), kind: 'feature', fill: 'sapphire', stroke: 'auto', width: 1.6 },
        { d: curve(CX - 20, 222, CX - 26, 256, 3), kind: 'line', stroke: 'gownLine', width: 2.4 },
        { d: curve(CX + 20, 222, CX + 26, 256, -3), kind: 'line', stroke: 'gownLine', width: 2.4 },
        ...[-16, -8, 0, 8, 16].map((dx): Shape => ({
          d: circle(CX + dx, 148 + Math.abs(dx) * -0.35, 3),
          kind: 'feature',
          fill: 'pearl',
          stroke: 'auto',
          width: 1.2,
        })),
      ],
      children: [
        {
          id: 'mantle',
          behind: true,
          pivot: [CX, 140],
          motion: { rotate: 1.5, phase: 0.25 },
          shapes: [
            { d: smooth(MANTLE), fill: 'mantle' },
            {
              d: curve(CX - 62, 214, CX - 70, 270, 4),
              kind: 'line',
              stroke: 'mantleDark',
              width: 2.4,
            },
            {
              d: curve(CX + 62, 214, CX + 70, 270, -4),
              kind: 'line',
              stroke: 'mantleDark',
              width: 2.4,
            },
          ],
        },
        {
          id: 'hairBack',
          behind: true,
          pivot: [CX, 20],
          motion: { rotate: 1.2, phase: 0.3 },
          shapes: [{ d: smooth(HAIR_BACK), fill: 'hair' }],
        },
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
                { d: smooth(HAIR_FRONT), fill: 'hair' },
                { d: ellipse(CX - 34, 24, 13, 5, -28), kind: 'detail', fill: 'hairShine' },
                { d: curve(CX, 8, CX, 30, 0), kind: 'line', stroke: 'hairShine', width: 2.2 },
              ],
            },
            {
              id: 'crown',
              pivot: [CX, 30],
              shapes: [
                { d: smooth(CROWN, true, 0.35), fill: 'gold' },
                { d: capsule(CX - 32, 30, CX + 32, 30, 5.5), fill: 'gold' },
                {
                  d: circle(CX, 30, 4.2),
                  kind: 'feature',
                  fill: 'ruby',
                  stroke: 'auto',
                  width: 1.4,
                },
                {
                  d: circle(CX - 19, 30, 3.2),
                  kind: 'feature',
                  fill: 'sapphire',
                  stroke: 'auto',
                  width: 1.2,
                },
                {
                  d: circle(CX + 19, 30, 3.2),
                  kind: 'feature',
                  fill: 'sapphire',
                  stroke: 'auto',
                  width: 1.2,
                },
                ...[-34, -14, 0, 14, 34].map((dx): Shape => ({
                  d: circle(CX + dx, dx === 0 ? 1 : Math.abs(dx) > 20 ? 14 : 5, 3),
                  kind: 'feature',
                  fill: 'pearl',
                  stroke: 'auto',
                  width: 1.2,
                })),
              ],
            },
          ],
        },
        armN,
      ],
    },
  ],
};

export default esther;
