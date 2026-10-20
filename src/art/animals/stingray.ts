import { circle, curve, ellipse, smooth, translatePath, tube, type Pt } from '../core/paths';
import type { AnimalDef, Shape } from '../core/types';

const TAU = Math.PI * 2;
const MID = 120;
const SHIFT = -28;

const MARGIN: [number, number, number][] = [
  [326, 0, 0],
  [322, 13, 0.05],
  [310, 37, 0.25],
  [290, 62, 0.5],
  [266, 87, 0.75],
  [244, 103, 0.95],
  [224, 107, 1],
  [208, 101, 1],
  [197, 85, 0.8],
  [185, 63, 0.55],
  [171, 42, 0.35],
  [159, 24, 0.15],
  [151, 10, 0.05],
  [149, 0, 0],
];

const ripple = (phase: number, x: number) => Math.sin(TAU * phase - (224 - x) / 48);

function outline(phase: number): Pt[] {
  const side = (sign: number): Pt[] =>
    MARGIN.map(([x, dy, w]) => [
      x - 4 * w * ripple(phase + 0.25, x),
      MID + sign * (dy + 12 * w * ripple(phase, x)),
    ]);
  const top = side(-1);
  const bottom = side(1).reverse();
  return [...top.slice(0, -1), ...bottom.slice(0, -1)];
}

function tailLine(phase: number): Pt[] {
  const pts: Pt[] = [];
  for (let k = 0; k <= 10; k++) {
    const t = k / 10;
    const x = 158 - 116 * t;
    const y = MID + 9 * t * t * Math.sin(TAU * phase - 4 * t) + 5 * t;
    pts.push([x, y]);
  }
  return pts;
}

const SPOTS: [number, number, number][] = [
  [210, 54, 6],
  [236, 66, 4.5],
  [190, 76, 4],
  [218, 38, 3.5],
  [176, 98, 3.5],
  [210, 186, 6],
  [236, 174, 4.5],
  [190, 164, 4],
  [218, 202, 3.5],
  [176, 142, 3.5],
  [258, 84, 3.2],
  [258, 156, 3.2],
];

function shapesAt(phase: number): Shape[] {
  const wave = (x: number, y: number): number => {
    const w = Math.min(1, Math.abs(y - MID) / 107);
    return Math.sign(y - MID) * 12 * w * w * ripple(phase, x);
  };
  const shapes: Shape[] = [
    { d: tube(tailLine(phase), (t) => 8.5 - 5.7 * t, 60), fill: 'body' },
    { d: smooth(outline(phase)), fill: 'body' },
    {
      d: smooth([
        [306, MID],
        [286, MID - 24],
        [248, MID - 30],
        [204, MID - 22],
        [160, MID - 8],
        [160, MID + 8],
        [204, MID + 22],
        [248, MID + 30],
        [286, MID + 24],
      ]),
      kind: 'detail',
      fill: 'back',
    },
    ...SPOTS.map(([x, y, r]): Shape => ({
      d: circle(x, y + wave(x, y), r),
      kind: 'detail',
      fill: 'spot',
    })),
    { d: ellipse(249, 134, 9.5, 6), kind: 'feature', fill: 'blush', opacity: 0.5 },
    { d: ellipse(307, 134, 9, 6), kind: 'feature', fill: 'blush', opacity: 0.5 },
    { d: circle(262, 110, 13), kind: 'feature', fill: 'eye' },
    { d: circle(295, 110, 13), kind: 'feature', fill: 'eye' },
    { d: circle(266.8, 104.6, 4.9), kind: 'feature', fill: 'shine' },
    { d: circle(299.8, 104.6, 4.9), kind: 'feature', fill: 'shine' },
    { d: curve(269, 132, 288, 132, 6), kind: 'line', stroke: 'mouth', width: 3.2 },
  ];
  return shapes.map((sh) => ({ ...sh, d: translatePath(sh.d, SHIFT, 0) }));
}

const stingray: AnimalDef = {
  id: 'stingray',
  name: 'Stingray',
  kind: 'animal',
  aliases: ['ray', 'sting ray', 'manta', 'manta ray', 'skate'],
  group: 'fish',
  habitats: ['ocean'],
  box: [310, 240],
  size: 180,
  locomotion: 'swim',
  gait: { period: 1.3 },
  sound: 'stingray',
  palette: {
    body: '#57adbd',
    back: '#4c9fb0',
    spot: '#d2f3f2',
  },
  parts: [
    {
      id: 'body',
      role: 'body',
      pivot: [236 + SHIFT, MID],
      frames: shapesAt,
    },
  ],
};

export default stingray;
