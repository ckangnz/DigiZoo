import { circle, curve, ellipse, tube, type Pt } from '../core/paths';
import type { AnimalDef, Shape } from '../core/types';

const CX = 140;
const CY = 140;
const R = 134;

const at = (x: number, y: number): Pt => [CX + x * R, CY + y * R];

const streak = (pts: [number, number][], r: number, fill: string): Shape => ({
  d: tube(
    pts.map(([x, y]) => at(x, y)),
    (t) => r * R * Math.max(0.18, Math.sin(Math.PI * t)),
    80,
  ),
  kind: 'detail',
  fill,
});

const neptune: AnimalDef = {
  id: 'neptune',
  name: 'Neptune',
  kind: 'object',
  aliases: ['planet neptune', 'planet', 'ice giant', 'windy planet'],
  group: 'space',
  habitats: ['space'],
  box: [280, 280],
  size: 210,
  locomotion: 'float',
  gait: { period: 2.4 },
  sound: 'neptune',
  palette: {
    sea: '#3d72e6',
    light: '#5f90f2',
    deep: '#2c56c8',
    spot: '#223f9e',
    wisp: '#ffffff',
    blush: '#ff9ccf',
  },
  parts: [
    {
      id: 'planet',
      role: 'body',
      pivot: [CX, CY],
      shapes: [
        { d: circle(CX, CY, R), fill: 'sea' },
        streak(
          [
            [-1.1, -0.74],
            [-0.3, -0.8],
            [0.4, -0.72],
            [1.1, -0.78],
          ],
          0.1,
          'light',
        ),
        streak(
          [
            [-1.1, 0.66],
            [-0.4, 0.6],
            [0.3, 0.68],
            [1.1, 0.62],
          ],
          0.12,
          'deep',
        ),
        streak(
          [
            [-0.9, 0.9],
            [0.0, 0.86],
            [0.9, 0.92],
          ],
          0.08,
          'light',
        ),
        {
          d: ellipse(CX - 0.42 * R, CY - 0.44 * R, 0.25 * R, 0.13 * R, -6),
          kind: 'detail',
          fill: 'deep',
        },
        {
          d: ellipse(CX - 0.42 * R, CY - 0.45 * R, 0.19 * R, 0.085 * R, -6),
          kind: 'detail',
          fill: 'spot',
        },
        streak(
          [
            [-0.66, -0.68],
            [-0.42, -0.72],
            [-0.16, -0.68],
          ],
          0.034,
          'wisp',
        ),
        streak(
          [
            [0.6, -0.16],
            [0.78, -0.2],
            [0.98, -0.14],
          ],
          0.034,
          'wisp',
        ),
        streak(
          [
            [0.7, -0.02],
            [0.82, -0.04],
            [0.96, 0.0],
          ],
          0.022,
          'wisp',
        ),
        streak(
          [
            [0.18, 0.78],
            [0.42, 0.74],
            [0.66, 0.78],
          ],
          0.032,
          'wisp',
        ),
        streak(
          [
            [-0.86, 0.56],
            [-0.66, 0.53],
            [-0.46, 0.57],
          ],
          0.026,
          'wisp',
        ),
        { d: ellipse(CX - 82, CY + 46, 19, 11), kind: 'feature', fill: 'blush', opacity: 0.55 },
        { d: ellipse(CX + 82, CY + 46, 19, 11), kind: 'feature', fill: 'blush', opacity: 0.55 },
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

export default neptune;
