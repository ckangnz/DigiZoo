import { capsule, circle, curve, ellipse, leaf, smooth, tube, type Pt } from '../core/paths';
import type { AnimalDef, Motion, PartNode, Shape } from '../core/types';

const CX = 98;
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

const STAFF: Pt[] = [
  [CX - 70, 297],
  [CX - 72, 236],
  [CX - 68, 168],
  [CX - 71, 100],
  [CX - 67, 40],
];

const armF: PartNode = {
  id: 'armF',
  role: 'armF',
  behind: true,
  pivot: [CX - 30, 152],
  motion: { rotate: 2.5, phase: 0.5 },
  shapes: [
    { d: capsule(CX - 30, 152, CX - 56, 184, 12, 13), fill: 'robeDark' },
    { d: circle(CX - 65, 190, 9.5), fill: 'skinDark' },
  ],
  children: [
    {
      id: 'staff',
      behind: true,
      pivot: [CX - 70, 190],
      shapes: [
        { d: tube(STAFF, (t) => 5 + 0.6 * t, 40), fill: 'wood' },
        { d: circle(CX - 67, 34, 8.5), fill: 'wood' },
        { d: curve(CX - 69, 130, CX - 73, 150, -2), kind: 'line', stroke: 'woodDark', width: 2 },
        { d: curve(CX - 70, 236, CX - 73, 256, 2), kind: 'line', stroke: 'woodDark', width: 2 },
      ],
    },
  ],
};

const ARM_N_PIVOT: Pt = [CX + 30, 152];
const ARM_N_MOTION: Motion = { rotate: 3 };

const armN: PartNode = {
  id: 'armN',
  role: 'armN',
  pivot: ARM_N_PIVOT,
  motion: ARM_N_MOTION,
  shapes: [
    { d: capsule(CX + 30, 152, CX + 56, 176, 12, 13), fill: 'robe' },
    { d: circle(CX + 64, 178, 9.5), fill: 'skin' },
  ],
};

const DOVE_X = CX + 66;

const dove: PartNode = {
  id: 'doveHold',
  pivot: ARM_N_PIVOT,
  motion: ARM_N_MOTION,
  children: [
    {
      id: 'dove',
      pivot: [DOVE_X, 166],
      motion: { rotate: 4, freq: 2, phase: 0.2 },
      shapes: [
        {
          d: smooth([
            [DOVE_X - 18, 162],
            [DOVE_X - 8, 150],
            [DOVE_X + 10, 146],
            [DOVE_X + 20, 138],
            [DOVE_X + 30, 140],
            [DOVE_X + 32, 150],
            [DOVE_X + 22, 162],
            [DOVE_X + 4, 168],
            [DOVE_X - 12, 168],
          ]),
          fill: 'dove',
        },
        {
          d: smooth([
            [DOVE_X - 12, 156],
            [DOVE_X, 150],
            [DOVE_X + 14, 154],
            [DOVE_X + 6, 162],
          ]),
          kind: 'detail',
          fill: 'doveShade',
        },
        { d: circle(DOVE_X + 25, 145, 2.6), kind: 'feature', fill: 'eye' },
        {
          d: smooth([
            [DOVE_X + 31, 143],
            [DOVE_X + 39, 146],
            [DOVE_X + 31, 149],
          ]),
          kind: 'feature',
          fill: 'beak',
          stroke: 'auto',
          width: 1.2,
        },
        {
          d: leaf(DOVE_X + 36, 148, 16, 4, 70),
          kind: 'feature',
          fill: 'olive',
          stroke: 'auto',
          width: 1.2,
        },
        {
          d: leaf(DOVE_X + 36, 148, 14, 3.6, 20),
          kind: 'feature',
          fill: 'olive',
          stroke: 'auto',
          width: 1.2,
        },
      ],
    },
  ],
};

const BEARD: Pt[] = [
  [CX - 62, 74],
  [CX - 55, 86],
  [CX - 46, 101],
  [CX - 30, 108],
  [CX - 14, 109],
  [CX, 112],
  [CX + 14, 109],
  [CX + 30, 108],
  [CX + 46, 101],
  [CX + 55, 86],
  [CX + 62, 74],
  [CX + 68, 100],
  [CX + 64, 130],
  [CX + 52, 156],
  [CX + 40, 168],
  [CX + 30, 178],
  [CX + 16, 182],
  [CX, 194],
  [CX - 16, 182],
  [CX - 30, 178],
  [CX - 40, 168],
  [CX - 52, 156],
  [CX - 64, 130],
  [CX - 68, 100],
];

const HAIR: Pt[] = [
  [CX - 64, 82],
  [CX - 68, 50],
  [CX - 52, 20],
  [CX, 7],
  [CX + 52, 20],
  [CX + 68, 50],
  [CX + 64, 82],
  [CX + 58, 70],
  [CX + 52, 52],
  [CX + 36, 42],
  [CX + 18, 40],
  [CX, 46],
  [CX - 18, 40],
  [CX - 36, 42],
  [CX - 52, 52],
  [CX - 58, 70],
];

const strand = (x1: number, y1: number, x2: number, y2: number, bend: number): Shape => ({
  d: curve(x1, y1, x2, y2, bend),
  kind: 'line',
  stroke: 'hairLine',
  width: 2.2,
});

const noah: AnimalDef = {
  id: 'noah',
  name: 'Noah',
  kind: 'character',
  aliases: ['ark', 'flood', 'noahs ark', 'dove'],
  group: 'bible',
  habitats: ['bible'],
  box: [208, GROUND],
  size: 240,
  locomotion: 'walk2',
  gait: { stride: 54, swing: 18 },
  sound: 'noah',
  palette: {
    skin: '#dca57c',
    skinDark: '#c8906a',
    robe: '#a8764a',
    robeDark: '#916240',
    robeLine: '#8a5c3a',
    trim: '#e8c98a',
    belt: '#e2b866',
    hair: '#f6f3ec',
    hairLine: '#d9d3c8',
    sandal: '#7a4a2c',
    sandalDark: '#653c23',
    wood: '#b9844f',
    woodDark: '#8d6036',
    dove: '#ffffff',
    doveShade: '#dfe3ec',
    beak: '#f3a54b',
    olive: '#82b84a',
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
            [CX - 70, 262],
            [CX, 269],
            [CX + 70, 262],
            [CX + 70, 290],
            [CX - 70, 290],
          ]),
          kind: 'detail',
          fill: 'trim',
        },
        {
          d: smooth([
            [CX - 60, 204],
            [CX, 212],
            [CX + 60, 204],
            [CX + 60, 216],
            [CX, 224],
            [CX - 60, 216],
          ]),
          kind: 'detail',
          fill: 'belt',
        },
        { d: curve(CX - 20, 230, CX - 25, 256, 3), kind: 'line', stroke: 'robeLine', width: 2.4 },
        { d: curve(CX + 20, 230, CX + 25, 256, -3), kind: 'line', stroke: 'robeLine', width: 2.4 },
      ],
      children: [
        leg('legF', CX - 16, true),
        armF,
        leg('legN', CX + 14, false),
        armN,
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
                strand(CX - 32, 27, CX - 10, 18, 3),
                strand(CX + 10, 18, CX + 32, 27, 3),
              ],
            },
            {
              id: 'beard',
              pivot: [CX, 110],
              shapes: [
                { d: smooth(BEARD), fill: 'hair' },
                strand(CX - 32, 127, CX - 20, 158, 4),
                strand(CX + 32, 127, CX + 20, 158, -4),
                strand(CX, 125, CX, 172, 0),
              ],
            },
          ],
        },
        dove,
      ],
    },
  ],
};

export default noah;
