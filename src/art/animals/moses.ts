import { capsule, circle, curve, ellipse, rotatePath, smooth, tube, type Pt } from '../core/paths';
import type { AnimalDef, Motion, PartNode, Shape } from '../core/types';

const CX = 100;
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

const tablet = (x: number, y: number, w: number, h: number): string =>
  `M${x} ${y + h}L${x} ${y + w / 2}A${w / 2} ${w / 2} 0 0 1 ${x + w} ${y + w / 2}L${x + w} ${y + h}Z`;

const TABLET_ROT = -8;
const TABLET_PIVOT: Pt = [CX - 64, 224];

const tabletShapes = (x: number): Shape[] => {
  const shapes: Shape[] = [{ d: tablet(x, 184, 29, 60), fill: 'stone' }];
  for (let i = 0; i < 4; i++) {
    const y = 206 + i * 9;
    shapes.push({
      d: `M${x + 7} ${y}L${x + 22} ${y}`,
      kind: 'line',
      stroke: 'stoneLine',
      width: 2.2,
    });
  }
  return shapes.map((s) => ({ ...s, d: rotatePath(s.d, TABLET_ROT, ...TABLET_PIVOT) }));
};

const ARM_F_PIVOT: Pt = [CX - 30, 152];
const ARM_F_MOTION: Motion = { rotate: 2.5, phase: 0.5 };

const sleeveF: PartNode = {
  id: 'armF',
  role: 'armF',
  pivot: ARM_F_PIVOT,
  motion: ARM_F_MOTION,
  shapes: [{ d: capsule(CX - 30, 152, CX - 46, 204, 12, 13), fill: 'robeDark' }],
};

const tablets: PartNode = {
  id: 'tablets',
  pivot: ARM_F_PIVOT,
  motion: ARM_F_MOTION,
  children: [
    { id: 'tabletL', shapes: tabletShapes(CX - 94) },
    { id: 'tabletR', shapes: tabletShapes(CX - 64) },
    { id: 'handF', shapes: [{ d: circle(CX - 40, 240, 9.5), fill: 'skinDark' }] },
  ],
};

const STAFF: Pt[] = [
  [CX + 72, 297],
  [CX + 70, 220],
  [CX + 73, 140],
  [CX + 70, 70],
  [CX + 72, 14],
];

const armN: PartNode = {
  id: 'armN',
  role: 'armN',
  pivot: [CX + 30, 152],
  motion: { rotate: 2 },
  shapes: [{ d: capsule(CX + 30, 152, CX + 56, 186, 12, 13), fill: 'robe' }],
  children: [
    {
      id: 'staff',
      behind: true,
      pivot: [CX + 72, 190],
      shapes: [
        { d: tube(STAFF, 5.4, 40), fill: 'wood' },
        { d: circle(CX + 72, 12, 7.5), fill: 'wood' },
        { d: curve(CX + 72, 100, CX + 69, 122, 2), kind: 'line', stroke: 'woodDark', width: 2 },
        { d: curve(CX + 72, 240, CX + 69, 262, -2), kind: 'line', stroke: 'woodDark', width: 2 },
      ],
    },
    { id: 'handN', shapes: [{ d: circle(CX + 67, 193, 9.5), fill: 'skin' }] },
  ],
};

const HAIR: Pt[] = [
  [CX - 64, 86],
  [CX - 69, 48],
  [CX - 50, 16],
  [CX, 5],
  [CX + 50, 16],
  [CX + 69, 48],
  [CX + 64, 86],
  [CX + 57, 74],
  [CX + 50, 50],
  [CX + 30, 33],
  [CX + 8, 28],
  [CX, 34],
  [CX - 8, 28],
  [CX - 30, 33],
  [CX - 50, 50],
  [CX - 57, 74],
];

const HAIR_BACK: Pt[] = [
  [CX, 20],
  [CX + 58, 34],
  [CX + 74, 80],
  [CX + 76, 126],
  [CX + 68, 156],
  [CX + 50, 150],
  [CX, 140],
  [CX - 50, 150],
  [CX - 68, 156],
  [CX - 76, 126],
  [CX - 74, 80],
  [CX - 58, 34],
];

const BEARD: Pt[] = [
  [CX - 60, 82],
  [CX - 52, 96],
  [CX - 40, 106],
  [CX - 24, 109],
  [CX - 12, 109],
  [CX, 112],
  [CX + 12, 109],
  [CX + 24, 109],
  [CX + 40, 106],
  [CX + 52, 96],
  [CX + 60, 82],
  [CX + 66, 106],
  [CX + 58, 140],
  [CX + 40, 172],
  [CX + 18, 198],
  [CX, 210],
  [CX - 18, 198],
  [CX - 40, 172],
  [CX - 58, 140],
  [CX - 66, 106],
];

const strand = (x1: number, y1: number, x2: number, y2: number, bend: number): Shape => ({
  d: curve(x1, y1, x2, y2, bend),
  kind: 'line',
  stroke: 'hairLine',
  width: 2.2,
});

const moses: AnimalDef = {
  id: 'moses',
  name: 'Moses',
  kind: 'character',
  aliases: ['ten commandments', 'tablets', 'red sea', 'exodus'],
  group: 'bible',
  habitats: ['bible'],
  box: [186, GROUND],
  size: 240,
  locomotion: 'walk2',
  gait: { stride: 54, swing: 18 },
  sound: 'moses',
  palette: {
    skin: '#c4875c',
    skinDark: '#b07650',
    robe: '#b8434a',
    robeDark: '#9d3540',
    robeLine: '#93303a',
    under: '#f0dfbf',
    belt: '#f2c14e',
    hair: '#f6f3ec',
    hairShade: '#e6e1d7',
    hairLine: '#d9d3c8',
    sandal: '#7a4a2c',
    sandalDark: '#653c23',
    wood: '#a8733f',
    woodDark: '#7d5230',
    stone: '#bfc3cf',
    stoneLine: '#8e94a6',
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
            [CX - 13, 150],
            [CX + 13, 150],
            [CX + 17, 240],
            [CX + 21, 290],
            [CX - 21, 290],
            [CX - 17, 240],
          ]),
          kind: 'detail',
          fill: 'under',
        },
        {
          d: smooth([
            [CX - 60, 214],
            [CX, 220],
            [CX + 60, 214],
            [CX + 60, 226],
            [CX, 232],
            [CX - 60, 226],
          ]),
          kind: 'detail',
          fill: 'belt',
        },
        { d: curve(CX + 28, 240, CX + 33, 264, -3), kind: 'line', stroke: 'robeLine', width: 2.4 },
      ],
      children: [
        leg('legF', CX - 16, true),
        leg('legN', CX + 14, false),
        sleeveF,
        armN,
        {
          id: 'head',
          role: 'head',
          pivot: [CX, 136],
          shapes: face(),
          children: [
            {
              id: 'hairBack',
              behind: true,
              pivot: [CX, 90],
              shapes: [{ d: smooth(HAIR_BACK), fill: 'hairShade' }],
            },
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
                strand(CX - 6, 16, CX - 40, 30, -4),
                strand(CX + 6, 16, CX + 40, 30, 4),
              ],
            },
            {
              id: 'beard',
              pivot: [CX, 110],
              shapes: [
                { d: smooth(BEARD), fill: 'hair' },
                strand(CX - 30, 128, CX - 14, 176, 4),
                strand(CX + 30, 128, CX + 14, 176, -4),
                strand(CX, 124, CX, 190, 0),
              ],
            },
          ],
        },
        tablets,
      ],
    },
  ],
};

export default moses;
