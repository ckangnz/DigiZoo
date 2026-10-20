import { capsule, circle, ellipse, f, leaf, smooth } from '../core/paths';
import type { AnimalDef, PartNode, Shape } from '../core/types';

const CX = 140;

const tongue = (x: number, base: number, h: number, w: number, lean: number): string => {
  const tx = x + lean;
  const ty = base - h;
  return (
    `M${f(x - w)} ${f(base)}` +
    `C${f(x - w * 1.35)} ${f(base - h * 0.45)} ${f(tx - w * 0.75)} ${f(ty + h * 0.3)} ${f(tx)} ${f(ty)}` +
    `C${f(tx + w * 0.1)} ${f(ty + h * 0.32)} ${f(x + w * 1.35)} ${f(base - h * 0.42)} ${f(x + w)} ${f(base)}` +
    `A${f(w)} ${f(w * 0.8)} 0 0 1 ${f(x - w)} ${f(base)}Z`
  );
};

type Tongue = [number, number, number, number, number];

const fire = (tongues: Tongue[], fill: string, core: string): Shape[] => [
  ...tongues.map(([x, b, h, w, l]): Shape => ({ d: tongue(x, b, h, w, l), fill })),
  ...tongues.map(([x, b, h, w, l]): Shape => ({
    d: tongue(x, b + 4, h * 0.66, w * 0.56, l * 0.6),
    kind: 'detail',
    fill: core,
  })),
];

const flame = (id: string, tongues: Tongue[], phase: number, behind = true): PartNode => {
  const [x, b] = tongues[Math.floor(tongues.length / 2)];
  return {
    id,
    role: 'flame',
    phase,
    behind,
    pivot: [x, b],
    shapes: fire(tongues, 'flame', 'flameCore'),
  };
};

const CROWN: Tongue[] = [
  [CX - 74, 176, 92, 30, -16],
  [CX - 38, 164, 124, 34, -10],
  [CX + 4, 160, 140, 38, 8],
  [CX + 44, 164, 118, 34, 14],
  [CX + 80, 178, 88, 30, 18],
];

const BC = 174;
const BX = 90;
const BY = 46;

const AURA: [number, number][] = [
  [CX + 4, 2],
  [CX + 46, 36],
  [CX + 92, 84],
  [CX + 124, 142],
  [CX + 128, 194],
  [CX + 100, 236],
  [CX, 250],
  [CX - 100, 236],
  [CX - 128, 194],
  [CX - 124, 142],
  [CX - 90, 84],
  [CX - 40, 36],
];

const bushOutline = (): Shape[] => {
  const out: Shape[] = [{ d: ellipse(CX, BC + 4, BX, BY), fill: 'leaf' }];
  for (let k = 0; k <= 10; k++) {
    const a = ((180 + k * 18) * Math.PI) / 180;
    const r = k % 2 === 0 ? 25 : 21;
    out.push({ d: circle(CX + BX * Math.cos(a), BC + BY * Math.sin(a), r), fill: 'leaf' });
  }
  for (let k = 0; k < 5; k++) {
    const a = ((24 + k * 33) * Math.PI) / 180;
    out.push({ d: circle(CX + 80 * Math.cos(a), BC + 4 + 34 * Math.sin(a), 18), fill: 'leaf' });
  }
  const tips: [number, number, number][] = [
    [CX - 104, BC - 2, 192],
    [CX - 92, BC + 30, 158],
    [CX - 66, BC - 52, 238],
    [CX - 22, BC - 66, 262],
    [CX + 20, BC - 66, 284],
    [CX + 76, BC - 44, 312],
    [CX + 106, BC + 4, 352],
    [CX + 94, BC + 32, 22],
  ];
  for (const [x, y, a] of tips) out.push({ d: leaf(x, y, 24, 8, a), fill: 'leaf' });
  return out;
};

const LEAVES: [number, number, number][] = [
  [CX - 30, BC - 36, -60],
  [CX + 22, BC - 44, -110],
  [CX - 66, BC - 14, -30],
  [CX + 62, BC - 18, -150],
  [CX - 6, BC - 10, -84],
  [CX - 40, BC + 16, -50],
  [CX + 38, BC + 12, -128],
  [CX + 4, BC + 30, -96],
];

const bushShapes = (): Shape[] => [
  ...bushOutline(),
  ...[-60, -20, 20, 60].map((dx): Shape => ({
    d: circle(CX + dx, BC + 52, 24),
    kind: 'detail',
    fill: 'leafDark',
  })),
  ...LEAVES.map(([x, y, a]): Shape => ({
    d: leaf(x, y, 20, 6, a),
    kind: 'detail',
    fill: 'leafDark',
  })),
  { d: ellipse(CX - 46, BC - 40, 14, 7, -28), kind: 'detail', fill: 'leafLight' },
  { d: ellipse(CX + 6, BC - 52, 11, 6, -8), kind: 'detail', fill: 'leafLight' },
  { d: ellipse(CX - 84, BC - 10, 8, 5, -50), kind: 'detail', fill: 'leafLight' },
];

const burningBush: AnimalDef = {
  id: 'burning-bush',
  name: 'Burning Bush',
  kind: 'object',
  aliases: ['fire', 'moses', 'holy fire', 'bush on fire', 'bush'],
  group: 'bible',
  habitats: ['bible'],
  box: [280, 266],
  size: 200,
  locomotion: 'wobble',
  gait: { period: 1.8 },
  sound: 'burning-bush',
  palette: {
    glow: '#ffeab0',
    flame: '#ff9a3a',
    flameCore: '#ffd94f',
    leaf: '#6cc04a',
    leafDark: '#53a03d',
    leafLight: '#a4e27e',
    trunk: '#9a6a42',
    sand: '#ecd09a',
    sandDark: '#dcb97f',
    pebble: '#c9a675',
  },
  parts: [
    {
      id: 'bush',
      pivot: [CX, 200],
      shapes: bushShapes(),
      children: [
        {
          id: 'glow',
          behind: true,
          pivot: [CX, 150],
          motion: { scaleX: 0.025, scaleY: 0.03, freq: 2 },
          shapes: [{ d: smooth(AURA), fill: 'glow' }],
        },
        { ...flame('crown', CROWN, 0), motion: { scaleY: 0.1, scaleX: -0.03, freq: 2 } },
        flame(
          'sideL',
          [
            [CX - 92, 196, 74, 19, -24],
            [CX - 78, 176, 52, 14, -14],
          ],
          0.4,
        ),
        flame(
          'sideR',
          [
            [CX + 92, 194, 76, 19, 24],
            [CX + 78, 174, 54, 14, 14],
          ],
          0.7,
        ),
        {
          id: 'branches',
          behind: true,
          pivot: [CX, 236],
          shapes: [
            { d: capsule(CX, 210, CX - 1, 250, 9, 11), fill: 'trunk' },
            { d: capsule(CX - 2, 234, CX - 34, 214, 4.5, 4), fill: 'trunk' },
            { d: capsule(CX + 2, 230, CX + 32, 212, 4.5, 4), fill: 'trunk' },
          ],
        },
        {
          id: 'ground',
          behind: true,
          pivot: [CX, 244],
          shapes: [
            {
              d: smooth([
                [CX - 108, 262],
                [CX - 90, 246],
                [CX - 40, 240],
                [CX + 40, 240],
                [CX + 90, 246],
                [CX + 108, 262],
              ]),
              fill: 'sand',
            },
            { d: ellipse(CX, 268, 104, 12), kind: 'detail', fill: 'sandDark' },
            { d: ellipse(CX - 78, 252, 8, 5.5), kind: 'feature', fill: 'pebble' },
            { d: ellipse(CX + 84, 254, 6.5, 4.5), kind: 'feature', fill: 'pebble' },
          ],
        },
        flame(
          'lickL',
          [
            [CX - 40, 148, 42, 11, -6],
            [CX - 56, 156, 26, 8, -8],
          ],
          0.25,
          false,
        ),
        flame(
          'lickR',
          [
            [CX + 42, 150, 38, 11, 7],
            [CX + 58, 158, 24, 8, 8],
          ],
          0.6,
          false,
        ),
      ],
    },
  ],
};

export default burningBush;
