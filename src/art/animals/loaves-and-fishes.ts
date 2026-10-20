import {
  capsule,
  circle,
  curve,
  ellipse,
  leaf,
  mirrorPath,
  roundRect,
  rotatePath,
  smooth,
  translatePath,
  type Pt,
} from '../core/paths';
import type { AnimalDef, PartNode, Shape } from '../core/types';

const CX = 120;
const RIM_Y = 115;

const fishShapes = (L: number): Shape[] => [
  {
    d: smooth([
      [-0.34 * L, 0],
      [-0.58 * L, -0.24 * L],
      [-0.62 * L, -0.12 * L],
      [-0.54 * L, 0],
      [-0.62 * L, 0.12 * L],
      [-0.58 * L, 0.24 * L],
    ]),
    fill: 'fin',
  },
  { d: leaf(-0.08 * L, -0.18 * L, 0.3 * L, 0.08 * L, -160), fill: 'fin' },
  {
    d: smooth([
      [0.5 * L, 0.02 * L],
      [0.4 * L, -0.15 * L],
      [0.16 * L, -0.24 * L],
      [-0.12 * L, -0.2 * L],
      [-0.34 * L, -0.08 * L],
      [-0.4 * L, 0],
      [-0.34 * L, 0.08 * L],
      [-0.12 * L, 0.19 * L],
      [0.16 * L, 0.22 * L],
      [0.4 * L, 0.14 * L],
    ]),
    fill: 'fish',
  },
  { d: ellipse(0.04 * L, 0.14 * L, 0.36 * L, 0.1 * L, -4), kind: 'detail', fill: 'fishBelly' },
  {
    d: curve(0.26 * L, -0.15 * L, 0.26 * L, 0.13 * L, -0.06 * L),
    kind: 'line',
    stroke: 'fishLine',
    width: 2.2,
  },
  {
    d: leaf(0.08 * L, 0.02 * L, 0.18 * L, 0.06 * L, 160),
    kind: 'feature',
    fill: 'fin',
    stroke: 'auto',
    width: 1.6,
  },
  { d: circle(0.37 * L, -0.04 * L, 0.055 * L), kind: 'feature', fill: 'eye' },
  { d: circle(0.385 * L, -0.06 * L, 0.02 * L), kind: 'feature', fill: 'shine' },
];

const fish = (
  id: string,
  x: number,
  y: number,
  len: number,
  deg: number,
  flip: boolean,
): PartNode => ({
  id,
  shapes: fishShapes(len).map((s) => {
    const facing = flip ? mirrorPath(s.d, 0) : s.d;
    return { ...s, d: translatePath(rotatePath(facing, deg, 0, 0), x, y) };
  }),
});

const loaf = (id: string, x: number, y: number, r: number): PartNode => ({
  id,
  behind: true,
  shapes: [
    { d: ellipse(x, y, r, r * 0.86), fill: 'bread' },
    {
      d: ellipse(x - r * 0.18, y - r * 0.3, r * 0.62, r * 0.4, -12),
      kind: 'detail',
      fill: 'breadLight',
    },
    {
      d: leaf(x - r * 0.56, y - r * 0.02, r * 0.62, r * 0.11, -48),
      kind: 'feature',
      fill: 'breadCut',
      stroke: 'breadLine',
      width: 1.8,
    },
    {
      d: leaf(x - r * 0.16, y + r * 0.26, r * 0.66, r * 0.11, -48),
      kind: 'feature',
      fill: 'breadCut',
      stroke: 'breadLine',
      width: 1.8,
    },
  ],
});

const twinkle = (id: string, x: number, y: number, r: number, phase: number): PartNode => ({
  id,
  role: 'sparkle',
  phase,
  pivot: [x, y],
  shapes: [
    {
      d: `M${x} ${y - r}Q${x + r * 0.16} ${y - r * 0.16} ${x + r} ${y}Q${x + r * 0.16} ${y + r * 0.16} ${x} ${y + r}Q${x - r * 0.16} ${y + r * 0.16} ${x - r} ${y}Q${x - r * 0.16} ${y - r * 0.16} ${x} ${y - r}Z`,
      fill: 'gold',
    },
  ],
});

const WEAVE: Shape[] = [];
for (let row = 0; row < 4; row++) {
  const y = RIM_Y + 9 + row * 17;
  const shift = row % 2 ? 15 : 0;
  for (let x = CX - 120 + shift; x < CX + 120; x += 30) {
    WEAVE.push({ d: roundRect(x, y, 26, 12, 6), kind: 'detail', fill: 'wicker' });
  }
}

const TWIST: Shape[] = [];
for (let x = CX - 102; x <= CX + 104; x += 13) {
  TWIST.push({
    d: capsule(x - 5, RIM_Y + 10, x + 5, RIM_Y - 10, 2.4),
    kind: 'detail',
    fill: 'rimDark',
  });
}

const BASKET: Pt[] = [
  [CX - 100, RIM_Y],
  [CX + 100, RIM_Y],
  [CX + 92, RIM_Y + 36],
  [CX + 70, RIM_Y + 66],
  [CX, RIM_Y + 76],
  [CX - 70, RIM_Y + 66],
  [CX - 92, RIM_Y + 36],
];

const loavesAndFishes: AnimalDef = {
  id: 'loaves-and-fishes',
  name: 'Loaves and Fishes',
  kind: 'object',
  aliases: ['bread', 'basket', 'fish', 'miracle', 'five loaves and two fish'],
  group: 'bible',
  habitats: ['bible'],
  box: [240, 193],
  size: 120,
  locomotion: 'wobble',
  sound: 'loaves-and-fishes',
  palette: {
    wicker: '#d8a160',
    wickerDark: '#a86c38',
    rim: '#cc8f4e',
    rimDark: '#b0763e',
    bread: '#f1b25c',
    breadLight: '#f9cf88',
    breadCut: '#fde6b4',
    breadLine: '#c4792f',
    fish: '#8fc0e2',
    fishBelly: '#dff0fa',
    fishLine: '#5a91c0',
    fin: '#6fa6d3',
    gold: '#ffd75e',
  },
  parts: [
    {
      id: 'basket',
      pivot: [CX, RIM_Y + 40],
      shapes: [{ d: smooth(BASKET), fill: 'wickerDark' }, ...WEAVE],
      children: [
        loaf('loaf1', CX - 31, RIM_Y - 58, 31),
        loaf('loaf2', CX + 31, RIM_Y - 58, 31),
        loaf('loaf3', CX - 62, RIM_Y - 26, 31),
        loaf('loaf4', CX, RIM_Y - 28, 32),
        loaf('loaf5', CX + 62, RIM_Y - 26, 31),
        {
          id: 'rim',
          pivot: [CX, RIM_Y],
          shapes: [{ d: capsule(CX - 106, RIM_Y, CX + 106, RIM_Y, 12), fill: 'rim' }, ...TWIST],
        },
        fish('fishL', CX - 53, RIM_Y - 8, 80, -10, true),
        fish('fishR', CX + 53, RIM_Y - 8, 80, 10, false),
        twinkle('twinkle1', CX - 96, RIM_Y - 84, 11, 0),
        twinkle('twinkle2', CX + 98, RIM_Y - 100, 13, 0.5),
      ],
    },
  ],
};

export default loavesAndFishes;
