import { capsule, circle, curve, ellipse, smooth, translatePath, type Pt } from '../core/paths';
import type { AnimalDef, PartNode, Shape } from '../core/types';

const CX = 103;
const GROUND = 300;
const HEAD_Y = 75;
const HEAD_R = 63;
const EYE_Y = 81;
const LIFT = 14;

const offset = (parts: PartNode[], dx: number, dy: number): PartNode[] =>
  parts.map((p): PartNode => ({
    ...p,
    pivot: p.pivot && [p.pivot[0] + dx, p.pivot[1] + dy],
    shapes: p.shapes?.map((s) => ({ ...s, d: translatePath(s.d, dx, dy) })),
    children: p.children && offset(p.children, dx, dy),
  }));

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

const arm = (id: string, dir: 1 | -1, far: boolean): PartNode => {
  const shoulder: Pt = [CX + dir * 30, 152];
  const wrist: Pt = [CX + dir * 74, 172];
  return {
    id,
    role: id,
    behind: true,
    pivot: shoulder,
    motion: { rotate: -dir * 5, phase: 0.25 },
    shapes: [
      { d: circle(wrist[0] + dir * 12, wrist[1] + 5, 11.5), fill: far ? 'skinDark' : 'skin' },
      {
        d: capsule(shoulder[0], shoulder[1], wrist[0], wrist[1], 12, 15),
        fill: far ? 'robeDark' : 'robe',
      },
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

const HAIR_BACK: Pt[] = [
  [CX, 6],
  [CX + 44, 12],
  [CX + 68, 42],
  [CX + 72, 90],
  [CX + 72, 132],
  [CX + 64, 156],
  [CX + 48, 152],
  [CX + 30, 132],
  [CX, 130],
  [CX - 30, 132],
  [CX - 48, 152],
  [CX - 64, 156],
  [CX - 72, 132],
  [CX - 72, 90],
  [CX - 68, 42],
  [CX - 44, 12],
];

const HAIR_FRONT: Pt[] = [
  [CX, 7],
  [CX + 36, 10],
  [CX + 58, 28],
  [CX + 66, 54],
  [CX + 63, 74],
  [CX + 55, 64],
  [CX + 44, 48],
  [CX + 24, 36],
  [CX, 32],
  [CX - 24, 36],
  [CX - 44, 48],
  [CX - 55, 64],
  [CX - 63, 74],
  [CX - 66, 54],
  [CX - 58, 28],
  [CX - 36, 10],
];

const BEARD: Pt[] = [
  [CX - 60, 94],
  [CX - 50, 106],
  [CX - 32, 111],
  [CX - 14, 112],
  [CX, 111],
  [CX + 14, 112],
  [CX + 32, 111],
  [CX + 50, 106],
  [CX + 60, 94],
  [CX + 60, 108],
  [CX + 49, 127],
  [CX + 28, 139],
  [CX, 142],
  [CX - 28, 139],
  [CX - 49, 127],
  [CX - 60, 108],
];

const halo = (r: number, cut: number): string => {
  const dx = Math.sqrt(r * r - (cut - HEAD_Y) ** 2);
  return `M${CX - dx} ${cut}A${r} ${r} 0 1 1 ${CX + dx} ${cut}Z`;
};

const eye = (x: number): Shape[] => [
  { d: circle(x, EYE_Y, 7.6), kind: 'feature', fill: 'eye' },
  { d: circle(x + 2.7, EYE_Y - 2.9, 2.8), kind: 'feature', fill: 'shine' },
];

const jesus: AnimalDef = {
  id: 'jesus',
  name: 'Jesus',
  kind: 'character',
  aliases: ['christ', 'jesus christ', 'lord', 'son of god', 'savior'],
  group: 'bible',
  habitats: ['bible'],
  box: [206, GROUND + LIFT],
  size: 240,
  locomotion: 'walk2',
  gait: { stride: 56, swing: 18 },
  sound: 'jesus',
  palette: {
    skin: '#c98d63',
    skinDark: '#b77c54',
    hair: '#66412a',
    hairShine: '#86593b',
    hairLine: '#472a17',
    robe: '#f6ecd8',
    robeDark: '#e8dbc0',
    fold: '#dfcfae',
    sash: '#d04a40',
    sashDark: '#b23a32',
    halo: '#f3c346',
    glow: '#fff2c4',
    sandal: '#8a5a34',
    sandalDark: '#744a2a',
  },
  parts: offset(
    [
      {
        id: 'body',
        role: 'body',
        pivot: [CX, 240],
        shapes: [
          { d: smooth(ROBE), fill: 'robe' },
          { d: capsule(CX - 46, 140, CX + 52, 238, 10), kind: 'detail', fill: 'sash' },
          {
            d: smooth([
              [CX + 32, 224],
              [CX + 44, 228],
              [CX + 40, 254],
              [CX + 32, 251],
            ]),
            kind: 'detail',
            fill: 'sashDark',
          },
          { d: curve(CX - 16, 212, CX - 22, 274, 3), kind: 'line', stroke: 'fold', width: 2.6 },
          { d: curve(CX + 8, 246, CX + 12, 276, -2), kind: 'line', stroke: 'fold', width: 2.6 },
        ],
        children: [
          leg('legF', CX - 16, true),
          leg('legN', CX + 14, false),
          arm('armF', -1, true),
          arm('armN', 1, false),
          {
            id: 'head',
            role: 'head',
            pivot: [CX, 136],
            shapes: [
              { d: circle(CX, HEAD_Y, HEAD_R), fill: 'skin' },
              { d: circle(CX, HEAD_Y, HEAD_R - 1.2), kind: 'feature', fill: 'skin' },
              { d: ellipse(CX - 37, 97, 9.5, 5.5), kind: 'feature', fill: 'blush', opacity: 0.5 },
              { d: ellipse(CX + 37, 97, 9.5, 5.5), kind: 'feature', fill: 'blush', opacity: 0.5 },
              {
                d: curve(CX - 9, 100, CX + 9, 100, 5.5),
                kind: 'line',
                stroke: 'mouth',
                width: 2.8,
              },
            ],
            children: [
              {
                id: 'halo',
                behind: true,
                pivot: [CX, HEAD_Y],
                shapes: [
                  { d: halo(84, 134), fill: 'halo' },
                  { d: halo(78, 134), kind: 'detail', fill: 'glow' },
                ],
              },
              {
                id: 'hairBack',
                behind: true,
                pivot: [CX, 80],
                shapes: [{ d: smooth(HAIR_BACK), fill: 'hair' }],
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
                  { d: smooth(HAIR_FRONT), fill: 'hair' },
                  { d: smooth(BEARD), fill: 'hair' },
                  { d: ellipse(CX - 36, 22, 14, 5, -28), kind: 'detail', fill: 'hairShine' },
                  { d: curve(CX, 8, CX, 30, 0), kind: 'line', stroke: 'hairLine', width: 2.4 },
                ],
              },
            ],
          },
        ],
      },
    ],
    0,
    LIFT,
  ),
};

export default jesus;
