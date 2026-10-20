import { circle, curve, ellipse, tube, type Pt } from '../core/paths';
import type { AnimalDef, Shape } from '../core/types';

const CX = 140;
const CY = 140;
const R = 134;

const at = (x: number, y: number): Pt => [CX + x * R, CY + y * R];

const band = (pts: [number, number][], r: number, fill: string): Shape => ({
  d: tube(
    pts.map(([x, y]) => at(x, y)),
    (t) => r * R * (0.55 + 0.45 * Math.sin(Math.PI * t)),
    90,
  ),
  kind: 'detail',
  fill,
});

const swirl = (
  cx: number,
  cy: number,
  r0: number,
  turns: number,
  w: number,
  fill: string,
): Shape => {
  const pts: Pt[] = [];
  const n = 26;
  for (let i = 0; i <= n; i++) {
    const t = i / n;
    const a = Math.PI * 2 * turns * t + Math.PI;
    const r = r0 * (1 - 0.72 * t);
    pts.push(at(cx + r * Math.cos(a), cy + r * Math.sin(a) * 0.7));
  }
  return {
    d: tube(pts, (t) => w * R * (1 - 0.55 * t), 120),
    kind: 'detail',
    fill,
  };
};

const venus: AnimalDef = {
  id: 'venus',
  name: 'Venus',
  kind: 'object',
  aliases: ['planet venus', 'planet', 'morning star', 'evening star'],
  group: 'space',
  habitats: ['space'],
  box: [280, 280],
  size: 160,
  locomotion: 'float',
  gait: { period: 2.4 },
  sound: 'venus',
  palette: {
    cloud: '#f7c674',
    light: '#fde3a7',
    deep: '#eda65a',
    blush: '#ff8a7a',
  },
  parts: [
    {
      id: 'planet',
      role: 'body',
      pivot: [CX, CY],
      shapes: [
        { d: circle(CX, CY, R), fill: 'cloud' },
        band(
          [
            [-1.2, -0.62],
            [-0.7, -0.74],
            [-0.2, -0.56],
            [0.3, -0.7],
            [1.2, -0.5],
          ],
          0.09,
          'light',
        ),
        band(
          [
            [-1.2, -0.3],
            [-0.6, -0.4],
            [-0.15, -0.26],
            [0.2, -0.36],
          ],
          0.055,
          'deep',
        ),
        band(
          [
            [-1.2, 0.58],
            [-0.6, 0.66],
            [0.0, 0.56],
            [0.5, 0.7],
            [1.2, 0.6],
          ],
          0.08,
          'light',
        ),
        band(
          [
            [-1.2, 0.86],
            [-0.5, 0.8],
            [0.2, 0.9],
            [1.2, 0.82],
          ],
          0.06,
          'deep',
        ),
        swirl(0.56, -0.3, 0.3, 1.25, 0.06, 'light'),
        swirl(-0.76, 0.02, 0.17, 1.1, 0.042, 'deep'),
        { d: ellipse(CX - 82, CY + 46, 19, 11), kind: 'feature', fill: 'blush', opacity: 0.5 },
        { d: ellipse(CX + 82, CY + 46, 19, 11), kind: 'feature', fill: 'blush', opacity: 0.5 },
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

export default venus;
