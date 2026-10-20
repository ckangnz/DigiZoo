import { capsule, circle, ellipse, roundRect, smooth, type Pt } from '../core/paths';
import type { AnimalDef, PartNode, Shape } from '../core/types';

const CX = 110;
const GROUND = 306;

const stitch = (x1: number, y1: number, x2: number, y2: number, ticks: number): Shape[] => {
  const out: Shape[] = [
    { d: `M${x1} ${y1}L${x2} ${y2}`, kind: 'line', stroke: 'stitch', width: 2.6 },
  ];
  for (let i = 0; i < ticks; i++) {
    const t = (i + 0.5) / ticks;
    const x = x1 + (x2 - x1) * t;
    const y = y1 + (y2 - y1) * t;
    out.push({ d: `M${x} ${y - 5}L${x} ${y + 5}`, kind: 'line', stroke: 'stitch', width: 2.4 });
  }
  return out;
};

const leg = (id: string, x: number, far: boolean): PartNode => ({
  id,
  role: id,
  behind: true,
  pivot: [x, 238],
  shapes: [
    { d: capsule(x, 236, x, 276, 14, 13), fill: far ? 'pantsDark' : 'pants' },
    { d: roundRect(x - 18, 268, 44, 30, 13), fill: far ? 'bootDark' : 'boot' },
    { d: roundRect(x - 20, 292, 48, 14, 6), fill: far ? 'soleDark' : 'sole' },
  ],
});

const arm = (id: string, x: number, dir: 1 | -1, far: boolean): PartNode => {
  const elbow: Pt = [x + dir * 6, 204];
  const hand: Pt = [x + dir * 9, 228];
  return {
    id,
    role: id,
    behind: far,
    pivot: [x, 170],
    shapes: [
      {
        d: capsule(elbow[0], elbow[1], hand[0], hand[1], 10, 9.5),
        fill: far ? 'skinDark' : 'skin',
      },
      { d: circle(hand[0], hand[1] + 4, 12), fill: far ? 'skinDark' : 'skin' },
      { d: capsule(x, 170, elbow[0], elbow[1], 13, 12), fill: far ? 'jacketDark' : 'jacket' },
    ],
  };
};

const HAIR: Pt[] = [
  [CX - 70, 58],
  [CX - 68, 30],
  [CX - 52, 20],
  [CX, 18],
  [CX + 52, 20],
  [CX + 68, 30],
  [CX + 70, 58],
  [CX + 56, 64],
  [CX + 44, 56],
  [CX + 30, 66],
  [CX + 16, 56],
  [CX + 2, 66],
  [CX - 12, 56],
  [CX - 26, 66],
  [CX - 40, 56],
  [CX - 54, 66],
];

const bolt = (side: 1 | -1): PartNode => ({
  id: side === 1 ? 'boltR' : 'boltL',
  behind: true,
  pivot: [CX + side * 56, 136],
  shapes: [
    { d: capsule(CX + side * 52, 138, CX + side * 76, 138, 6.5), fill: 'bolt' },
    { d: ellipse(CX + side * 79, 138, 5.5, 10), fill: 'boltDark' },
  ],
});

const monster: AnimalDef = {
  id: 'monster',
  name: 'Monster',
  kind: 'character',
  aliases: ['frankenstein', 'frankie', 'friendly monster', 'monster kid', 'franken'],
  group: 'spooky',
  habitats: ['halloween'],
  box: [220, GROUND],
  size: 260,
  locomotion: 'walk2',
  gait: { period: 0.9, stride: 60, swing: 20 },
  sound: 'monster',
  palette: {
    skin: '#a3da70',
    skinDark: '#89c25a',
    hair: '#3a3150',
    hairShine: '#574b74',
    jacket: '#6b57a8',
    jacketDark: '#57468e',
    patch: '#ff9b45',
    patchStitch: '#c76a1f',
    pants: '#4a3d6c',
    pantsDark: '#3c315a',
    boot: '#3a3150',
    bootDark: '#2e2741',
    sole: '#2a2340',
    soleDark: '#221c33',
    bolt: '#c3c8d6',
    boltDark: '#99a0b4',
    stitch: '#4e7d36',
    button: '#ffd166',
    blush: '#ffa7c4',
  },
  parts: [
    {
      id: 'body',
      role: 'body',
      pivot: [CX, 238],
      shapes: [
        { d: capsule(CX, 140, CX, 168, 24), fill: 'skin' },
        {
          d: smooth([
            [CX, 160],
            [CX + 40, 162],
            [CX + 54, 196],
            [CX + 52, 238],
            [CX, 246],
            [CX - 52, 238],
            [CX - 54, 196],
            [CX - 40, 162],
          ]),
          fill: 'jacket',
        },
        { d: roundRect(CX - 42, 204, 26, 24, 6), kind: 'detail', fill: 'patch' },
        { d: `M${CX - 38} 200L${CX - 38} 208`, kind: 'line', stroke: 'patchStitch', width: 2.2 },
        { d: `M${CX - 29} 200L${CX - 29} 208`, kind: 'line', stroke: 'patchStitch', width: 2.2 },
        { d: `M${CX - 20} 200L${CX - 20} 208`, kind: 'line', stroke: 'patchStitch', width: 2.2 },
        { d: `M${CX - 38} 224L${CX - 38} 232`, kind: 'line', stroke: 'patchStitch', width: 2.2 },
        { d: `M${CX - 29} 224L${CX - 29} 232`, kind: 'line', stroke: 'patchStitch', width: 2.2 },
        { d: `M${CX - 20} 224L${CX - 20} 232`, kind: 'line', stroke: 'patchStitch', width: 2.2 },
        { d: circle(CX + 6, 190, 4.5), kind: 'feature', fill: 'button', stroke: 'auto' },
        { d: circle(CX + 6, 214, 4.5), kind: 'feature', fill: 'button', stroke: 'auto' },
      ],
      children: [
        leg('legF', CX - 20, true),
        arm('armF', CX - 46, -1, true),
        leg('legN', CX + 18, false),
        {
          id: 'head',
          role: 'head',
          pivot: [CX, 160],
          shapes: [
            { d: circle(CX - 66, 102, 11), fill: 'skin' },
            { d: circle(CX + 66, 102, 11), fill: 'skin' },
            { d: roundRect(CX - 64, 34, 128, 120, 34), fill: 'skin' },
            { d: roundRect(CX - 62.8, 35.2, 125.6, 117.6, 33), kind: 'feature', fill: 'skin' },
            ...stitch(CX + 16, 78, CX + 46, 74, 3),
            { d: ellipse(CX - 42, 126, 10, 6), kind: 'feature', fill: 'blush', opacity: 0.85 },
            { d: ellipse(CX + 42, 126, 10, 6), kind: 'feature', fill: 'blush', opacity: 0.85 },
            { d: circle(CX - 23, 102, 11.5), kind: 'feature', fill: 'eye' },
            { d: circle(CX + 23, 102, 11.5), kind: 'feature', fill: 'eye' },
            { d: circle(CX - 18.6, 97.6, 4.4), kind: 'feature', fill: 'shine' },
            { d: circle(CX + 27.4, 97.6, 4.4), kind: 'feature', fill: 'shine' },
            {
              d: `M${CX - 30} 122Q${CX} 129 ${CX + 30} 122Q${CX + 28} 148 ${CX} 148Q${CX - 28} 148 ${CX - 30} 122Z`,
              kind: 'feature',
              fill: 'mouth',
            },
            {
              d: `M${CX - 26} 124.2Q${CX} 130.5 ${CX + 26} 124.2L${CX + 24} 131Q${CX} 137 ${CX - 24} 131Z`,
              kind: 'feature',
              fill: 'white',
            },
            { d: ellipse(CX, 143, 10, 4.2), kind: 'feature', fill: 'tongue' },
          ],
          children: [
            bolt(-1),
            bolt(1),
            {
              id: 'hair',
              pivot: [CX, 40],
              shapes: [
                { d: smooth(HAIR), fill: 'hair' },
                { d: ellipse(CX - 34, 30, 16, 5, -6), kind: 'detail', fill: 'hairShine' },
              ],
            },
          ],
        },
        arm('armN', CX + 46, 1, false),
      ],
    },
  ],
};

export default monster;
