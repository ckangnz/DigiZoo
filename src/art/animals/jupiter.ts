import { circle, curve, ellipse, smooth, type Pt } from '../core/paths';
import type { AnimalDef, Shape } from '../core/types';

const CX = 150;
const CY = 150;
const R = 144;
const BOW = 0.07;

const at = (x: number, y: number): Pt => [CX + x * R, CY + y * R];

function edge(y: number, wave: number, seed: number, reverse: boolean): Pt[] {
  const pts: Pt[] = [];
  const n = 12;
  for (let i = 0; i <= n; i++) {
    const x = -1.15 + (2.3 * i) / n;
    const yy = y + BOW * (1 - x * x) + wave * Math.sin(x * 5.2 + seed);
    pts.push(at(x, yy));
  }
  return reverse ? pts.reverse() : pts;
}

const band = (y0: number, y1: number, fill: string, wave = 0.018, seed = 0): Shape => ({
  d: smooth([...edge(y0, wave, seed, false), ...edge(y1, wave, seed + 2, true)]),
  kind: 'detail',
  fill,
});

const jupiter: AnimalDef = {
  id: 'jupiter',
  name: 'Jupiter',
  kind: 'object',
  aliases: ['planet jupiter', 'planet', 'gas giant', 'biggest planet', 'great red spot'],
  group: 'space',
  habitats: ['space'],
  box: [300, 300],
  size: 320,
  locomotion: 'float',
  gait: { period: 2.4 },
  sound: 'jupiter',
  palette: {
    cream: '#f8e8cb',
    tan: '#ebc398',
    orange: '#e09a5e',
    brown: '#c97c4b',
    spot: '#dc5a3c',
    rim: '#f3ad84',
    blush: '#ff8f8f',
  },
  parts: [
    {
      id: 'planet',
      role: 'body',
      pivot: [CX, CY],
      shapes: [
        { d: circle(CX, CY, R), fill: 'cream' },
        band(-1.2, -0.74, 'tan', 0.012, 1),
        band(-0.6, -0.46, 'orange', 0.02, 2),
        band(-0.42, -0.36, 'tan', 0.012, 4),
        band(-0.24, -0.15, 'tan', 0.015, 3),
        band(0.42, 0.6, 'brown', 0.022, 5),
        band(0.62, 0.7, 'orange', 0.015, 1.5),
        band(0.8, 1.3, 'tan', 0.012, 6),
        {
          d: ellipse(CX + 0.44 * R, CY + 0.66 * R, 0.25 * R, 0.14 * R, -4),
          kind: 'detail',
          fill: 'rim',
        },
        {
          d: ellipse(CX + 0.44 * R, CY + 0.66 * R, 0.19 * R, 0.095 * R, -4),
          kind: 'detail',
          fill: 'spot',
        },
        { d: ellipse(CX - 88, CY + 46, 20, 11.5), kind: 'feature', fill: 'blush', opacity: 0.55 },
        { d: ellipse(CX + 88, CY + 46, 20, 11.5), kind: 'feature', fill: 'blush', opacity: 0.55 },
        {
          d: curve(CX - 16, CY + 40, CX + 16, CY + 40, 9.5),
          kind: 'line',
          stroke: 'mouth',
          width: 3.8,
        },
      ],
      children: [
        {
          id: 'eyes',
          role: 'lid',
          pivot: [CX, CY + 14],
          shapes: [
            { d: circle(CX - 51, CY + 14, 21), kind: 'feature', fill: 'eye' },
            { d: circle(CX + 51, CY + 14, 21), kind: 'feature', fill: 'eye' },
            { d: circle(CX - 43, CY + 6, 7.8), kind: 'feature', fill: 'shine' },
            { d: circle(CX + 59, CY + 6, 7.8), kind: 'feature', fill: 'shine' },
          ],
        },
      ],
    },
  ],
};

export default jupiter;
