import { circle, curve, ellipse, rotatePath, smooth, translatePath, type Pt } from '../core/paths';
import type { AnimalDef, Shape } from '../core/types';

const W = 380;
const H = 224;
const CX = W / 2;
const CY = H / 2;
const R = 104;
const TILT = -18;
const U = Math.max(W, H) / 320;
const CUT = R + 2.2 * U;

const OUTER: [number, number] = [1.86 * R, 0.6 * R];
const INNER: [number, number] = [1.28 * R, 0.4 * R];

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

function annulus(k0: number, k1: number): string {
  const lerp = (k: number): [number, number] => [
    INNER[0] + (OUTER[0] - INNER[0]) * k,
    INNER[1] + (OUTER[1] - INNER[1]) * k,
  ];
  const [A, B] = lerp(k1);
  const [a, b] = lerp(k0);
  return place(
    `M${f(A)} 0A${f(A)} ${f(B)} 0 1 1 ${f(-A)} 0A${f(A)} ${f(B)} 0 1 1 ${f(A)} 0Z` +
      `M${f(a)} 0A${f(a)} ${f(b)} 0 1 0 ${f(-a)} 0A${f(a)} ${f(b)} 0 1 0 ${f(a)} 0Z`,
  );
}

function band(y0: number, y1: number, fill: string): Shape {
  const edge = (y: number): Pt[] =>
    Array.from({ length: 11 }, (_, i) => {
      const x = -1.2 + (2.4 * i) / 10;
      return [x * R, (y + 0.08 * (1 - x * x)) * R];
    });
  const pts = [...edge(y0), ...edge(y1).reverse()];
  return { d: place(smooth(pts)), kind: 'detail', fill };
}

const saturn: AnimalDef = {
  id: 'saturn',
  name: 'Saturn',
  kind: 'object',
  aliases: ['planet saturn', 'planet', 'ringed planet', 'ring planet', 'rings'],
  group: 'space',
  habitats: ['space'],
  box: [W, H],
  size: 300,
  locomotion: 'float',
  gait: { period: 2.4 },
  sound: 'saturn',
  palette: {
    gold: '#f3d08a',
    band: '#e5b46d',
    light: '#f9e6b8',
    ring: '#e8d2a8',
    ringDark: '#c9a571',
    ringLight: '#f6ead0',
    blush: '#ff8f8f',
  },
  parts: [
    {
      id: 'planet',
      role: 'body',
      pivot: [CX, CY],
      shapes: [
        { d: circle(CX, CY, R), fill: 'gold' },
        band(-1.2, -0.72, 'band'),
        band(-0.62, -0.5, 'light'),
        band(-0.42, -0.34, 'band'),
        band(0.56, 0.7, 'band'),
        band(0.78, 1.2, 'band'),
        { d: ellipse(CX - 62, CY + 14, 15, 9), kind: 'feature', fill: 'blush', opacity: 0.55 },
        { d: ellipse(CX + 58, CY - 4, 15, 9), kind: 'feature', fill: 'blush', opacity: 0.55 },
        {
          d: curve(CX - 14, CY + 8, CX + 10, CY + 3, 7),
          kind: 'line',
          stroke: 'mouth',
          width: 3.4,
        },
      ],
      children: [
        {
          id: 'eyeL',
          role: 'lid',
          pivot: [CX - 38, CY - 10],
          shapes: [
            { d: circle(CX - 38, CY - 10, 15.5), kind: 'feature', fill: 'eye' },
            { d: circle(CX - 32, CY - 16, 5.8), kind: 'feature', fill: 'shine' },
          ],
        },
        {
          id: 'eyeR',
          role: 'lid',
          pivot: [CX + 36, CY - 22],
          shapes: [
            { d: circle(CX + 36, CY - 22, 15.5), kind: 'feature', fill: 'eye' },
            { d: circle(CX + 42, CY - 28, 5.8), kind: 'feature', fill: 'shine' },
          ],
        },
        {
          id: 'ring',
          shapes: [
            { d: ringPiece(), fill: 'ring' },
            { d: annulus(0.08, 0.3), kind: 'detail', fill: 'ringLight' },
            { d: annulus(0.52, 0.6), kind: 'detail', fill: 'ringDark' },
          ],
        },
      ],
    },
  ],
};

export default saturn;
