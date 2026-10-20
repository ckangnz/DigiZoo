import { circle, curve, ellipse, scallop, smooth, type Pt } from '../core/paths';
import type { AnimalDef, Shape } from '../core/types';

const CX = 130;
const CY = 130;
const R = 124;

const at = (x: number, y: number): Pt => [CX + x * R, CY + y * R];

const PATCHES: Pt[][] = [
  [
    [-0.98, 0.42],
    [-0.7, 0.52],
    [-0.42, 0.62],
    [-0.22, 0.82],
    [-0.4, 0.98],
    [-0.8, 0.8],
  ],
  [
    [0.62, -0.42],
    [0.84, -0.5],
    [1.04, -0.3],
    [1.02, 0.06],
    [0.84, 0.0],
    [0.7, -0.2],
  ],
  [
    [0.36, 0.7],
    [0.6, 0.62],
    [0.78, 0.74],
    [0.62, 0.92],
    [0.4, 0.9],
  ],
];

const CRATERS: [number, number, number][] = [
  [-0.5, -0.44, 0.12],
  [0.3, -0.52, 0.09],
  [-0.06, -0.62, 0.06],
  [-0.84, -0.06, 0.07],
  [0.1, 0.76, 0.08],
  [0.86, 0.4, 0.06],
  [-0.62, 0.66, 0.06],
];

const crater = ([x, y, r]: [number, number, number]): Shape[] => {
  const [px, py] = at(x, y);
  const rr = r * R;
  return [
    { d: circle(px + rr * 0.14, py + rr * 0.14, rr * 1.12), kind: 'detail', fill: 'dust' },
    { d: circle(px, py, rr), kind: 'detail', fill: 'crater' },
  ];
};

const mars: AnimalDef = {
  id: 'mars',
  name: 'Mars',
  kind: 'object',
  aliases: ['planet mars', 'planet', 'red planet'],
  group: 'space',
  habitats: ['space'],
  box: [260, 260],
  size: 140,
  locomotion: 'float',
  gait: { period: 2.4 },
  sound: 'mars',
  palette: {
    rock: '#e8693f',
    patch: '#cc5233',
    crater: '#bd4a2f',
    dust: '#f4916a',
    ice: '#fff7f1',
    blush: '#ffb0b4',
  },
  parts: [
    {
      id: 'planet',
      role: 'body',
      pivot: [CX, CY],
      shapes: [
        { d: circle(CX, CY, R), fill: 'rock' },
        ...PATCHES.map((pts): Shape => ({
          d: smooth(pts.map(([x, y]) => at(x, y))),
          kind: 'detail',
          fill: 'patch',
        })),
        ...CRATERS.flatMap(crater),
        {
          d: scallop(CX, CY - R * 0.97, 0, 8, 6.5, 8, R * 0.36, R * 0.18),
          kind: 'detail',
          fill: 'ice',
        },
        { d: ellipse(CX - 76, CY + 43, 18, 10.5), kind: 'feature', fill: 'blush', opacity: 0.6 },
        { d: ellipse(CX + 76, CY + 43, 18, 10.5), kind: 'feature', fill: 'blush', opacity: 0.6 },
        {
          d: curve(CX - 14, CY + 37, CX + 14, CY + 37, 8.5),
          kind: 'line',
          stroke: 'mouth',
          width: 3.5,
        },
      ],
      children: [
        {
          id: 'eyes',
          role: 'lid',
          pivot: [CX, CY + 13],
          shapes: [
            { d: circle(CX - 45, CY + 13, 18.5), kind: 'feature', fill: 'eye' },
            { d: circle(CX + 45, CY + 13, 18.5), kind: 'feature', fill: 'eye' },
            { d: circle(CX - 38, CY + 5.8, 7), kind: 'feature', fill: 'shine' },
            { d: circle(CX + 52, CY + 5.8, 7), kind: 'feature', fill: 'shine' },
          ],
        },
      ],
    },
  ],
};

export default mars;
