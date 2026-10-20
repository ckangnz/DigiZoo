import {
  capsule,
  circle,
  curve,
  ellipse,
  roundRect,
  smooth,
  translatePath,
  tube,
  type Pt,
} from '../core/paths';
import type { AnimalDef, PartNode, Shape } from '../core/types';

const CX = 146;
const GROUND = 380;
const HY = 82;
const HR = 66;
const EYE_Y = 88;
const EYE_R = 7.9;

const face = (): Shape[] => [
  { d: circle(CX, HY, HR), fill: 'skin' },
  { d: circle(CX, HY, HR - 1.2), kind: 'feature', fill: 'skin' },
  { d: ellipse(CX - 39, 105, 10, 5.8), kind: 'feature', fill: 'blush', opacity: 0.5 },
  { d: ellipse(CX + 39, 105, 10, 5.8), kind: 'feature', fill: 'blush', opacity: 0.5 },
  {
    d: `M${CX - 17} 106Q${CX} 111 ${CX + 17} 106Q${CX + 15} 126 ${CX} 126Q${CX - 15} 126 ${CX - 17} 106Z`,
    kind: 'feature',
    fill: 'mouth',
  },
  {
    d: `M${CX - 13} 107.6Q${CX} 111.6 ${CX + 13} 107.6L${CX + 12} 112Q${CX} 115.4 ${CX - 12} 112Z`,
    kind: 'feature',
    fill: 'white',
  },
  { d: ellipse(CX, 121, 8, 3.8), kind: 'feature', fill: 'tongue' },
];

const eye = (x: number): Shape[] => [
  { d: circle(x, EYE_Y, EYE_R), kind: 'feature', fill: 'eye' },
  { d: circle(x + 2.8, EYE_Y - 3, 2.9), kind: 'feature', fill: 'shine' },
];

const TUNIC: Pt[] = [
  [CX, 146],
  [CX + 50, 152],
  [CX + 72, 180],
  [CX + 76, 236],
  [CX + 80, 292],
  [CX + 52, 308],
  [CX, 311],
  [CX - 52, 308],
  [CX - 80, 292],
  [CX - 76, 236],
  [CX - 72, 180],
  [CX - 50, 152],
];

const scales = (): Shape[] => {
  const out: Shape[] = [];
  for (let row = 0; row < 4; row++) {
    const y = 190 + row * 19;
    const shift = row % 2 ? 12 : 0;
    for (let x = CX - 96 + shift; x <= CX + 96; x += 24) {
      out.push({
        d: tube(
          [
            [x - 12, y],
            [x - 6, y + 6],
            [x + 6, y + 6],
            [x + 12, y],
          ],
          1.3,
          16,
        ),
        kind: 'detail',
        fill: 'bronzeLine',
      });
    }
  }
  return out;
};

const skirt = (): Shape[] => {
  const out: Shape[] = [];
  for (let i = 0; i < 9; i++) {
    const x = CX - 80 + i * 18;
    out.push({
      d: roundRect(x + 1.5, 268, 15, 50, 5),
      kind: 'detail',
      fill: i % 2 ? 'leather' : 'bronze',
    });
  }
  return out;
};

const leg = (id: string, x: number, far: boolean): PartNode => {
  const skin = far ? 'skinDark' : 'skin';
  const bronze = far ? 'bronzeDark' : 'bronze';
  const sandal = far ? 'sandalDark' : 'sandal';
  return {
    id,
    role: id,
    behind: true,
    pivot: [x, 290],
    shapes: [
      { d: capsule(x, 292, x + 1, 362, 17, 15), fill: skin },
      {
        d: smooth([
          [x - 18, 375],
          [x + 6, 370],
          [x + 30, 373],
          [x + 33, GROUND - 1],
          [x + 12, GROUND],
          [x - 14, GROUND],
          [x - 20, 378],
        ]),
        fill: sandal,
      },
      {
        d: smooth([
          [x - 15, 366],
          [x + 4, 358],
          [x + 24, 364],
          [x + 28, 373],
          [x + 8, 376],
          [x - 12, 376],
          [x - 18, 372],
        ]),
        fill: skin,
      },
      { d: roundRect(x - 20, 318, 42, 38, 12), kind: 'detail', fill: bronze },
      { d: curve(x - 6, 324, x - 6, 350, 0), kind: 'line', stroke: 'bronzeLight', width: 2.4 },
      { d: capsule(x + 2, 362, x + 12, 375, 3), kind: 'detail', fill: 'sandal' },
    ],
  };
};

const pauldron = (dir: 1 | -1): Shape[] => [
  { d: ellipse(CX + dir * 62, 172, 26, 22, dir * 18), fill: 'bronze' },
  {
    d: curve(CX + dir * 46, 178, CX + dir * 80, 166, dir * 7),
    kind: 'line',
    stroke: 'bronzeLine',
    width: 2.2,
  },
];

const armF: PartNode = {
  id: 'armF',
  role: 'armF',
  behind: true,
  pivot: [CX - 62, 172],
  motion: { rotate: 3, phase: 0.5 },
  shapes: [
    { d: capsule(CX - 62, 172, CX - 88, 214, 17, 15), fill: 'tunicDark' },
    { d: capsule(CX - 88, 214, CX - 98, 240, 14, 13), fill: 'skinDark' },
    { d: circle(CX - 100, 248, 16), fill: 'skinDark' },
  ],
};

const shield: PartNode = {
  id: 'shield',
  pivot: [CX - 62, 172],
  motion: { rotate: 3, phase: 0.5 },
  shapes: [
    { d: circle(CX - 96, 246, 50), fill: 'bronze' },
    { d: circle(CX - 96, 246, 38), kind: 'detail', fill: 'bronzeDark' },
    { d: circle(CX - 96, 246, 33), kind: 'detail', fill: 'bronze' },
    { d: circle(CX - 96, 246, 15), kind: 'detail', fill: 'bronzeLight' },
    { d: ellipse(CX - 112, 224, 12, 5, -40), kind: 'detail', fill: 'bronzeLight' },
    ...[0, 1, 2, 3, 4, 5, 6, 7].map((i): Shape => ({
      d: circle(
        CX - 96 + 44 * Math.cos((i * Math.PI) / 4),
        246 + 44 * Math.sin((i * Math.PI) / 4),
        2.8,
      ),
      kind: 'feature',
      fill: 'bronzeLight',
    })),
  ],
};

const HAND_N: Pt = [CX + 114, 116];

const armN: PartNode = {
  id: 'armN',
  role: 'armN',
  pivot: [CX + 62, 172],
  motion: { rotate: 8, freq: 2 },
  shapes: [
    { d: capsule(CX + 62, 172, CX + 96, 150, 17, 15), fill: 'tunic' },
    { d: capsule(CX + 96, 150, HAND_N[0], HAND_N[1] + 12, 14, 13), fill: 'skin' },
    { d: capsule(HAND_N[0] - 9, HAND_N[1] + 4, HAND_N[0] - 18, HAND_N[1] - 8, 6.5), fill: 'skin' },
    { d: ellipse(HAND_N[0] + 2, HAND_N[1], 15, 18, 12), fill: 'skin' },
    {
      d: curve(HAND_N[0] - 2, HAND_N[1] - 16, HAND_N[0] - 4, HAND_N[1] - 4, -1),
      kind: 'line',
      stroke: 'skinLine',
      width: 2.2,
    },
    {
      d: curve(HAND_N[0] + 7, HAND_N[1] - 15, HAND_N[0] + 5, HAND_N[1] - 3, -1),
      kind: 'line',
      stroke: 'skinLine',
      width: 2.2,
    },
  ],
};

const HELMET: Pt[] = [
  [CX - 72, 68],
  [CX - 70, 40],
  [CX - 50, 18],
  [CX, 10],
  [CX + 50, 18],
  [CX + 70, 40],
  [CX + 72, 68],
  [CX + 50, 60],
  [CX, 56],
  [CX - 50, 60],
];

const CREST = `M${CX - 42} 14A42 36 0 0 1 ${CX + 42} 14Q${CX} 24 ${CX - 42} 14Z`;

const crestLines = (): Shape[] =>
  [-58, -32, -12, 12, 32, 58].map((deg): Shape => {
    const a = ((deg - 90) * Math.PI) / 180;
    return {
      d: `M${CX + 12 * Math.cos(a)} ${18 + 12 * Math.sin(a)}L${CX + 34 * Math.cos(a)} ${14 + 30 * Math.sin(a)}`,
      kind: 'line',
      stroke: 'plumeLine',
      width: 2.2,
    };
  });

const offset = (parts: PartNode[], dx: number, dy: number): PartNode[] =>
  parts.map((p): PartNode => ({
    ...p,
    pivot: p.pivot && [p.pivot[0] + dx, p.pivot[1] + dy],
    shapes: p.shapes?.map((sh) => ({ ...sh, d: translatePath(sh.d, dx, dy) })),
    children: p.children && offset(p.children, dx, dy),
  }));

const LIFT = 14;

const goliath: AnimalDef = {
  id: 'goliath',
  name: 'Goliath',
  kind: 'character',
  aliases: ['giant', 'big giant', 'philistine', 'david and goliath'],
  group: 'bible',
  habitats: ['bible'],
  box: [282, GROUND + LIFT],
  size: 380,
  locomotion: 'walk2',
  gait: { period: 1.15, stride: 70, swing: 13 },
  sound: 'goliath',
  palette: {
    skin: '#b97a52',
    skinDark: '#a56a45',
    skinLine: '#94603e',
    plume: '#e8604f',
    plumeLine: '#c4473a',
    hair: '#33251f',
    tunic: '#c4573f',
    tunicDark: '#a94a35',
    bronze: '#dba849',
    bronzeDark: '#bd8a33',
    bronzeLight: '#f5d27a',
    bronzeLine: '#a8792b',
    leather: '#8f5d36',
    sandal: '#6e4426',
    sandalDark: '#5a371f',
  },
  parts: offset(
    [
      {
        id: 'body',
        role: 'body',
        pivot: [CX, 290],
        shapes: [
          { d: smooth(TUNIC), fill: 'tunic' },
          {
            d: smooth([
              [CX - 64, 160],
              [CX, 168],
              [CX + 64, 160],
              [CX + 76, 210],
              [CX + 74, 262],
              [CX, 270],
              [CX - 74, 262],
              [CX - 76, 210],
            ]),
            kind: 'detail',
            fill: 'bronze',
          },
          ...scales(),
          ...skirt(),
          { d: roundRect(CX - 82, 256, 164, 16, 7), kind: 'detail', fill: 'leather' },
          {
            d: roundRect(CX - 10, 255, 20, 18, 5),
            kind: 'feature',
            fill: 'bronzeLight',
            stroke: 'auto',
          },
        ],
        children: [
          leg('legF', CX - 30, true),
          armF,
          leg('legN', CX + 28, false),
          {
            id: 'shoulders',
            pivot: [CX, 172],
            shapes: [...pauldron(-1), ...pauldron(1)],
          },
          {
            id: 'head',
            role: 'head',
            pivot: [CX, 146],
            shapes: [
              { d: circle(CX - 66, 94, 15), fill: 'skin' },
              { d: circle(CX + 66, 94, 15), fill: 'skin' },
              ...face(),
            ],
            children: [
              {
                id: 'ears',
                pivot: [CX, 94],
                shapes: [
                  { d: circle(CX - 68, 95, 7), kind: 'feature', fill: 'skinDark' },
                  { d: circle(CX + 68, 95, 7), kind: 'feature', fill: 'skinDark' },
                ],
              },
              {
                id: 'eyes',
                role: 'lid',
                pivot: [CX, EYE_Y],
                shapes: [...eye(CX - 23), ...eye(CX + 23)],
              },
              {
                id: 'curls',
                pivot: [CX, 70],
                shapes: [
                  { d: circle(CX - 60, 72, 7.5), fill: 'hair' },
                  { d: circle(CX + 60, 72, 7.5), fill: 'hair' },
                ],
              },
              {
                id: 'helmet',
                pivot: [CX, 40],
                shapes: [
                  { d: smooth(HELMET), fill: 'bronze' },
                  { d: roundRect(CX - 76, 52, 152, 16, 8), fill: 'bronze' },
                  { d: ellipse(CX - 32, 30, 16, 6, -22), kind: 'detail', fill: 'bronzeLight' },
                  { d: roundRect(CX - 76, 52, 152, 16, 8), kind: 'detail', fill: 'bronzeDark' },
                  ...[-56, -28, 0, 28, 56].map((dx): Shape => ({
                    d: circle(CX + dx, 60, 2.6),
                    kind: 'feature',
                    fill: 'bronzeLight',
                  })),
                ],
              },
              {
                id: 'crest',
                behind: true,
                role: 'ear',
                pivot: [CX, 20],
                shapes: [{ d: CREST, fill: 'plume' }, ...crestLines()],
              },
            ],
          },
          shield,
          armN,
        ],
      },
    ],
    0,
    LIFT,
  ),
};

export default goliath;
