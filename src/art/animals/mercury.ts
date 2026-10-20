import { circle, curve, ellipse } from '../core/paths';
import type { AnimalDef, Shape } from '../core/types';

const CX = 120;
const CY = 120;
const R = 114;

const CRATERS: [number, number, number][] = [
  [-0.46, -0.52, 0.2],
  [0.36, -0.6, 0.14],
  [0.66, -0.16, 0.1],
  [-0.78, -0.02, 0.1],
  [-0.12, -0.8, 0.08],
  [0.06, -0.36, 0.09],
  [0.52, 0.66, 0.16],
  [-0.46, 0.72, 0.12],
  [0.04, 0.82, 0.07],
  [0.88, 0.32, 0.07],
];

const crater = ([x, y, r]: [number, number, number]): Shape[] => {
  const px = CX + x * R;
  const py = CY + y * R;
  const rr = r * R;
  return [
    { d: circle(px + rr * 0.12, py + rr * 0.12, rr * 1.08), kind: 'detail', fill: 'rim' },
    { d: circle(px, py, rr), kind: 'detail', fill: 'crater' },
    { d: circle(px - rr * 0.18, py - rr * 0.18, rr * 0.62), kind: 'detail', fill: 'pit' },
  ];
};

const mercury: AnimalDef = {
  id: 'mercury',
  name: 'Mercury',
  kind: 'object',
  aliases: ['planet mercury', 'planet', 'smallest planet', 'closest planet'],
  group: 'space',
  habitats: ['space'],
  box: [240, 240],
  size: 110,
  locomotion: 'float',
  gait: { period: 2.4 },
  sound: 'mercury',
  palette: {
    rock: '#ab9f99',
    rim: '#c7bcb6',
    crater: '#8e817b',
    pit: '#807470',
    blush: '#ff8f9c',
  },
  parts: [
    {
      id: 'planet',
      role: 'body',
      pivot: [CX, CY],
      shapes: [
        { d: circle(CX, CY, R), fill: 'rock' },
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

export default mercury;
