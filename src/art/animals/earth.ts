import { circle, curve, ellipse, smooth, type Pt } from '../core/paths';
import type { AnimalDef, Shape } from '../core/types';

const CX = 140;
const CY = 140;
const R = 134;

const at = (x: number, y: number): Pt => [CX + x * R, CY + y * R];
const blob = (pts: [number, number][], fill: string): Shape => ({
  d: smooth(pts.map(([x, y]) => at(x, y))),
  kind: 'detail',
  fill,
});
const cloud = (x: number, y: number, k: number): Shape[] =>
  (
    [
      [0, 0.2, 1, 0.3],
      [-0.46, 0.04, 0.36, 0.36],
      [0.04, -0.1, 0.5, 0.5],
      [0.52, 0.06, 0.34, 0.34],
    ] as const
  ).map(([dx, dy, rx, ry]) => ({
    d: ellipse(...at(x + dx * k, y + dy * k), rx * k * R, ry * k * R),
    kind: 'detail',
    fill: 'cloud',
  }));

const NORTH_AMERICA: [number, number][] = [
  [-1.06, -0.46],
  [-0.9, -0.64],
  [-0.7, -0.74],
  [-0.5, -0.76],
  [-0.38, -0.66],
  [-0.3, -0.58],
  [-0.18, -0.6],
  [-0.1, -0.5],
  [-0.2, -0.4],
  [-0.3, -0.34],
  [-0.36, -0.22],
  [-0.4, -0.1],
  [-0.48, -0.14],
  [-0.56, -0.08],
  [-0.56, 0.04],
  [-0.62, 0.06],
  [-0.72, -0.06],
  [-0.9, -0.2],
  [-1.06, -0.28],
];

const SOUTH_AMERICA: [number, number][] = [
  [-0.56, 0.14],
  [-0.4, 0.1],
  [-0.24, 0.18],
  [-0.08, 0.3],
  [-0.1, 0.44],
  [-0.2, 0.56],
  [-0.28, 0.7],
  [-0.36, 0.86],
  [-0.44, 0.98],
  [-0.5, 0.86],
  [-0.54, 0.62],
  [-0.62, 0.42],
  [-0.66, 0.26],
];

const GREENLAND: [number, number][] = [
  [-0.24, -0.96],
  [-0.04, -0.99],
  [0.06, -0.88],
  [-0.02, -0.74],
  [-0.14, -0.7],
  [-0.26, -0.8],
];

const EUROPE: [number, number][] = [
  [0.2, -0.66],
  [0.32, -0.8],
  [0.52, -0.84],
  [0.72, -0.74],
  [0.78, -0.56],
  [0.62, -0.46],
  [0.48, -0.44],
  [0.36, -0.46],
  [0.24, -0.48],
  [0.2, -0.56],
];

const AFRICA: [number, number][] = [
  [0.28, -0.36],
  [0.48, -0.38],
  [0.66, -0.36],
  [0.8, -0.26],
  [0.9, -0.06],
  [0.84, 0.12],
  [0.74, 0.34],
  [0.64, 0.56],
  [0.54, 0.72],
  [0.46, 0.66],
  [0.4, 0.46],
  [0.38, 0.26],
  [0.3, 0.14],
  [0.2, 0.06],
  [0.14, -0.1],
  [0.18, -0.26],
];

const SAHARA: [number, number][] = [
  [0.5, -0.3],
  [0.7, -0.32],
  [0.84, -0.2],
  [0.8, -0.08],
  [0.62, -0.1],
  [0.52, -0.18],
];

const DESERT_WEST: [number, number][] = [
  [-0.86, -0.3],
  [-0.7, -0.36],
  [-0.6, -0.26],
  [-0.64, -0.14],
  [-0.78, -0.16],
];

const earth: AnimalDef = {
  id: 'earth',
  name: 'Earth',
  kind: 'object',
  aliases: ['world', 'planet earth', 'planet', 'globe', 'our planet', 'blue planet'],
  group: 'space',
  habitats: ['space'],
  box: [280, 280],
  size: 170,
  locomotion: 'float',
  gait: { period: 2.4 },
  sound: 'earth',
  palette: {
    ocean: '#3d9ef0',
    land: '#5fc65a',
    desert: '#e2bd6e',
    cloud: '#ffffff',
    blush: '#ff7c9c',
  },
  parts: [
    {
      id: 'planet',
      role: 'body',
      pivot: [CX, CY],
      shapes: [
        { d: circle(CX, CY, R), fill: 'ocean' },
        blob(NORTH_AMERICA, 'land'),
        blob(SOUTH_AMERICA, 'land'),
        blob(GREENLAND, 'land'),
        blob(EUROPE, 'land'),
        blob(AFRICA, 'land'),
        blob(SAHARA, 'desert'),
        { d: ellipse(CX, CY + 1.04 * R, 0.56 * R, 0.14 * R), kind: 'detail', fill: 'cloud' },
        blob(DESERT_WEST, 'desert'),
        ...cloud(-0.76, 0.62, 0.2),
        ...cloud(0.12, -0.7, 0.17),
        ...cloud(0.8, 0.58, 0.16),
        { d: ellipse(CX - 82, CY + 46, 19, 11), kind: 'feature', fill: 'blush', opacity: 0.75 },
        { d: ellipse(CX + 82, CY + 46, 19, 11), kind: 'feature', fill: 'blush', opacity: 0.75 },
        {
          d: curve(CX - 15, CY + 39, CX + 15, CY + 39, 9),
          kind: 'line',
          stroke: 'mouth',
          width: 3.6,
        },
      ],
      children: [
        {
          id: 'eyes',
          role: 'lid',
          pivot: [CX, CY + 14],
          shapes: [
            { d: circle(CX - 48, CY + 14, 19.5), kind: 'feature', fill: 'eye' },
            { d: circle(CX + 48, CY + 14, 19.5), kind: 'feature', fill: 'eye' },
            { d: circle(CX - 40.6, CY + 6.4, 7.3), kind: 'feature', fill: 'shine' },
            { d: circle(CX + 55.4, CY + 6.4, 7.3), kind: 'feature', fill: 'shine' },
          ],
        },
      ],
    },
  ],
};

export default earth;
