import { circle, curve, ellipse, smooth, type Pt } from '../core/paths';
import type { AnimalDef, Shape } from '../core/types';

const CX = 120;
const CY = 120;
const R = 114;

const at = (x: number, y: number): Pt => [CX + x * R, CY + y * R];

const MARIA: Pt[][] = [
  [
    [-0.66, -0.56],
    [-0.42, -0.74],
    [-0.16, -0.66],
    [-0.12, -0.44],
    [-0.3, -0.3],
    [-0.56, -0.32],
  ],
  [
    [0.62, -0.5],
    [0.86, -0.42],
    [1.02, -0.1],
    [0.84, 0.06],
    [0.66, -0.06],
    [0.58, -0.28],
  ],
  [
    [0.16, -0.72],
    [0.34, -0.82],
    [0.46, -0.68],
    [0.32, -0.56],
  ],
  [
    [-0.36, 0.6],
    [-0.12, 0.56],
    [0.02, 0.68],
    [-0.08, 0.84],
    [-0.32, 0.82],
  ],
];

const CRATERS: [number, number, number][] = [
  [-0.4, -0.52, 0.09],
  [0.78, -0.24, 0.07],
  [0.04, -0.84, 0.07],
  [0.9, 0.2, 0.06],
  [0.5, 0.64, 0.13],
  [0.16, 0.84, 0.06],
  [-0.7, 0.62, 0.07],
  [-0.28, 0.66, 0.05],
  [-0.84, -0.22, 0.05],
];

const crater = ([x, y, r]: [number, number, number]): Shape[] => {
  const [px, py] = at(x, y);
  const rr = r * R;
  return [
    { d: circle(px + rr * 0.14, py + rr * 0.14, rr * 1.1), kind: 'detail', fill: 'rim' },
    { d: circle(px, py, rr), kind: 'detail', fill: 'crater' },
  ];
};

const moon: AnimalDef = {
  id: 'moon',
  name: 'Moon',
  kind: 'object',
  aliases: ['full moon', 'the moon', 'luna', 'moonlight'],
  group: 'space',
  habitats: ['space'],
  box: [240, 240],
  size: 120,
  locomotion: 'float',
  gait: { period: 2.4 },
  sound: 'moon',
  palette: {
    rock: '#e7e5ef',
    mare: '#d2cfdf',
    crater: '#c4c0d4',
    rim: '#f8f7fc',
    blush: '#ff9aa8',
  },
  parts: [
    {
      id: 'moon',
      role: 'body',
      pivot: [CX, CY],
      shapes: [
        { d: circle(CX, CY, R), fill: 'rock' },
        ...MARIA.map((pts): Shape => ({
          d: smooth(pts.map(([x, y]) => at(x, y))),
          kind: 'detail',
          fill: 'mare',
        })),
        ...CRATERS.flatMap(crater),
        { d: ellipse(CX - 70, CY + 40, 17, 10), kind: 'feature', fill: 'blush', opacity: 0.5 },
        { d: ellipse(CX + 70, CY + 40, 17, 10), kind: 'feature', fill: 'blush', opacity: 0.5 },
        {
          d: curve(CX - 13, CY + 34, CX + 13, CY + 34, 8),
          kind: 'line',
          stroke: 'mouth',
          width: 3.4,
        },
      ],
      children: [
        {
          id: 'eyes',
          role: 'lid',
          pivot: [CX, CY + 12],
          shapes: [
            { d: circle(CX - 41, CY + 12, 17), kind: 'feature', fill: 'eye' },
            { d: circle(CX + 41, CY + 12, 17), kind: 'feature', fill: 'eye' },
            { d: circle(CX - 34.6, CY + 5.2, 6.4), kind: 'feature', fill: 'shine' },
            { d: circle(CX + 47.4, CY + 5.2, 6.4), kind: 'feature', fill: 'shine' },
          ],
        },
      ],
    },
  ],
};

export default moon;
