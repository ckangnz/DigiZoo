import { circle, curve, ellipse, rotatePath, smooth, translatePath, type Pt } from '../core/paths';
import type { AnimalDef, Shape } from '../core/types';

const W = 212;
const H = 290;
const CX = W / 2;
const CY = H / 2;
const R = 102;
const TILT = -78;
const U = Math.max(W, H) / 320;
const CUT = R + 2.2 * U;

const OUTER: [number, number] = [1.4 * R, 0.76 * R];
const INNER: [number, number] = [1.3 * R, 0.66 * R];

const f = (n: number) => n.toFixed(2);
const place = (d: string) => translatePath(rotatePath(d, TILT, 0, 0), CX, CY);

function hit(r: number, [ea, eb]: [number, number]): Pt {
  const x = Math.sqrt(((r * r - eb * eb) * ea * ea) / (ea * ea - eb * eb));
  return [x, Math.sqrt(Math.max(0, r * r - x * x))];
}

function ringPiece(): string {
  const [A, B] = OUTER;
  const [a, b] = INNER;
  const [xo, yo] = hit(CUT, OUTER);
  const [xi, yi] = hit(CUT, INNER);
  return place(
    `M${f(xo)} ${f(-yo)}A${f(A)} ${f(B)} 0 1 1 ${f(-xo)} ${f(-yo)}` +
      `A${f(CUT)} ${f(CUT)} 0 0 0 ${f(-xi)} ${f(-yi)}` +
      `A${f(a)} ${f(b)} 0 1 0 ${f(xi)} ${f(-yi)}` +
      `A${f(CUT)} ${f(CUT)} 0 0 0 ${f(xo)} ${f(-yo)}Z`,
  );
}

function band(y0: number, y1: number, fill: string): Shape {
  const edge = (y: number): Pt[] =>
    Array.from({ length: 11 }, (_, i) => {
      const x = -1.2 + (2.4 * i) / 10;
      return [x * R, (y + 0.06 * (1 - x * x)) * R];
    });
  return { d: place(smooth([...edge(y0), ...edge(y1).reverse()])), kind: 'detail', fill };
}

const uranus: AnimalDef = {
  id: 'uranus',
  name: 'Uranus',
  kind: 'object',
  aliases: ['planet uranus', 'planet', 'ice giant', 'sideways planet'],
  group: 'space',
  habitats: ['space'],
  box: [W, H],
  size: 220,
  locomotion: 'float',
  gait: { period: 2.4 },
  sound: 'uranus',
  palette: {
    ice: '#a4e2ec',
    light: '#c8f0f5',
    deep: '#8ccfdd',
    ring: '#e4f2f7',
    blush: '#ff9cb6',
  },
  parts: [
    {
      id: 'planet',
      role: 'body',
      pivot: [CX, CY],
      shapes: [
        { d: circle(CX, CY, R), fill: 'ice' },
        band(-1.3, -0.8, 'light'),
        band(0.84, 1.3, 'deep'),
        { d: ellipse(CX - 74, CY + 30, 14.5, 8.5), kind: 'feature', fill: 'blush', opacity: 0.55 },
        { d: ellipse(CX + 36, CY + 30, 14.5, 8.5), kind: 'feature', fill: 'blush', opacity: 0.55 },
        {
          d: curve(CX - 31, CY + 25, CX - 7, CY + 25, 7),
          kind: 'line',
          stroke: 'mouth',
          width: 3.3,
        },
      ],
      children: [
        {
          id: 'eyes',
          role: 'lid',
          pivot: [CX, CY + 7],
          shapes: [
            { d: circle(CX - 54, CY + 7, 15), kind: 'feature', fill: 'eye' },
            { d: circle(CX + 16, CY + 7, 15), kind: 'feature', fill: 'eye' },
            { d: circle(CX - 48.4, CY + 1.2, 5.6), kind: 'feature', fill: 'shine' },
            { d: circle(CX + 21.6, CY + 1.2, 5.6), kind: 'feature', fill: 'shine' },
          ],
        },
        {
          id: 'ring',
          shapes: [{ d: ringPiece(), fill: 'ring' }],
        },
      ],
    },
  ],
};

export default uranus;
