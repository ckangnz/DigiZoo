import { capsule, circle, ellipse, smooth, tube, type Pt } from '../core/paths';
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
  { d: ellipse(CX - 37, 97, 9.5, 5.5), kind: 'feature', fill: 'blush', opacity: 0.5 },
  { d: ellipse(CX + 37, 97, 9.5, 5.5), kind: 'feature', fill: 'blush', opacity: 0.5 },
  {
    d: `M${CX - 11} 97Q${CX} 101 ${CX + 11} 97Q${CX + 10} 111 ${CX} 111Q${CX - 10} 111 ${CX - 11} 97Z`,
    kind: 'feature',
    fill: 'mouth',
  },
  { d: ellipse(CX, 107.5, 5.5, 2.8), kind: 'feature', fill: 'tongue' },
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

const arm = (id: string, dir: 1 | -1, far: boolean): PartNode => {
  const hand: Pt = [CX + dir * 80, 110];
  return {
    id,
    role: id,
    behind: far,
    pivot: [CX + dir * 30, 152],
    motion: { rotate: dir * 6, freq: 2, phase: far ? 0.5 : 0 },
    shapes: [
      {
        d: capsule(CX + dir * 30, 152, hand[0] - dir * 8, hand[1] + 14, 12, 13.5),
        fill: far ? 'robeDark' : 'robe',
      },
      { d: circle(hand[0], hand[1], 10.5), fill: far ? 'skinDark' : 'skin' },
    ],
  };
};

const HAIR: Pt[] = [
  [CX - 64, 80],
  [CX - 72, 52],
  [CX - 62, 36],
  [CX - 66, 18],
  [CX - 44, 18],
  [CX - 36, 2],
  [CX - 16, 10],
  [CX, -2],
  [CX + 14, 10],
  [CX + 36, 2],
  [CX + 44, 18],
  [CX + 66, 18],
  [CX + 62, 36],
  [CX + 72, 52],
  [CX + 64, 80],
  [CX + 58, 64],
  [CX + 50, 46],
  [CX + 34, 48],
  [CX + 22, 38],
  [CX + 8, 46],
  [CX - 8, 38],
  [CX - 22, 46],
  [CX - 36, 38],
  [CX - 50, 48],
  [CX - 58, 64],
];

const BEARD: Pt[] = [
  [CX - 58, 98],
  [CX - 48, 110],
  [CX - 32, 116],
  [CX - 14, 118],
  [CX, 116],
  [CX + 14, 118],
  [CX + 32, 116],
  [CX + 48, 110],
  [CX + 58, 98],
  [CX + 58, 114],
  [CX + 46, 130],
  [CX + 26, 140],
  [CX, 144],
  [CX - 26, 140],
  [CX - 46, 130],
  [CX - 58, 114],
];

const SEAWEED: Pt[] = [
  [CX - 26, 10],
  [CX - 4, 3],
  [CX + 20, 9],
  [CX + 40, 20],
  [CX + 54, 36],
  [CX + 64, 52],
  [CX + 70, 70],
  [CX + 66, 86],
  [CX + 72, 102],
];

const kelp = (): Shape => {
  const left: Pt[] = [];
  const right: Pt[] = [];
  const n = SEAWEED.length;
  for (let i = 0; i < n; i++) {
    const a = SEAWEED[Math.max(0, i - 1)];
    const b = SEAWEED[Math.min(n - 1, i + 1)];
    const len = Math.hypot(b[0] - a[0], b[1] - a[1]) || 1;
    const nx = -(b[1] - a[1]) / len;
    const ny = (b[0] - a[0]) / len;
    const r = (6.5 - 2.5 * (i / (n - 1))) * (i % 2 ? 1.25 : 0.85);
    left.push([SEAWEED[i][0] + nx * r, SEAWEED[i][1] + ny * r]);
    right.push([SEAWEED[i][0] - nx * r, SEAWEED[i][1] - ny * r]);
  }
  return { d: smooth([...left, ...right.reverse()]), fill: 'seaweed' };
};

const drop = (x: number, y: number, s: number): Shape => ({
  d: `M${x} ${y - 8 * s}C${x + 5 * s} ${y - 2 * s} ${x + 6 * s} ${y + 2 * s} ${x + 6 * s} ${y + 4 * s}A${6 * s} ${6 * s} 0 0 1 ${x - 6 * s} ${y + 4 * s}C${x - 6 * s} ${y + 2 * s} ${x - 5 * s} ${y - 2 * s} ${x} ${y - 8 * s}Z`,
  kind: 'feature',
  fill: 'drop',
  stroke: 'auto',
  width: 1.5,
});

const DROPS: [number, number, number][] = [
  [CX - 72, 22, 1],
  [CX + 84, 30, 0.85],
  [CX - 84, 66, 0.75],
];

const jonah: AnimalDef = {
  id: 'jonah',
  name: 'Jonah',
  kind: 'character',
  aliases: ['big fish', 'whale', 'jonah and the whale', 'prophet jonah'],
  group: 'bible',
  habitats: ['bible'],
  box: [204, GROUND],
  size: 230,
  locomotion: 'walk2',
  gait: { stride: 54, swing: 18 },
  sound: 'jonah',
  palette: {
    skin: '#d4996e',
    skinDark: '#c08660',
    hair: '#4a2e20',
    hairShine: '#6b4634',
    robe: '#4f9ad8',
    robeDark: '#3f86c2',
    wave: '#d9efff',
    rope: '#d9b27a',
    seaweed: '#5fb85a',
    seaweedDark: '#47994a',
    drop: '#a9dcfb',
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
          d: `M${CX - 70} 262Q${CX - 56} 254 ${CX - 42} 262Q${CX - 28} 270 ${CX - 14} 262Q${CX} 254 ${CX + 14} 262Q${CX + 28} 270 ${CX + 42} 262Q${CX + 56} 254 ${CX + 70} 262L${CX + 70} 300L${CX - 70} 300Z`,
          kind: 'detail',
          fill: 'wave',
        },
        {
          d: smooth([
            [CX - 60, 202],
            [CX, 208],
            [CX + 60, 202],
            [CX + 60, 212],
            [CX, 218],
            [CX - 60, 212],
          ]),
          kind: 'detail',
          fill: 'rope',
        },
        { d: capsule(CX + 14, 214, CX + 18, 236, 3.4), fill: 'rope' },
        { d: capsule(CX + 20, 214, CX + 28, 232, 3.4), fill: 'rope' },
      ],
      children: [
        leg('legF', CX - 16, true),
        arm('armF', -1, true),
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
              id: 'beard',
              pivot: [CX, 116],
              shapes: [{ d: smooth(BEARD), fill: 'hair' }],
            },
            {
              id: 'hair',
              pivot: [CX, 40],
              shapes: [
                { d: smooth(HAIR), fill: 'hair' },
                { d: ellipse(CX - 34, 24, 13, 5, -26), kind: 'detail', fill: 'hairShine' },
              ],
            },
            {
              id: 'seaweed',
              role: 'ear',
              pivot: [CX, 6],
              shapes: [
                kelp(),
                { d: tube(SEAWEED.slice(1, 8), 1.1, 30), kind: 'detail', fill: 'seaweedDark' },
              ],
            },
            ...DROPS.map(([x, y, size], i): PartNode => ({
              id: `drop${i}`,
              role: 'sparkle',
              pivot: [x, y],
              phase: i * 0.3,
              shapes: [drop(x, y, size)],
            })),
          ],
        },
        arm('armN', 1, false),
      ],
    },
  ],
};

export default jonah;
