import { circle, curve, ellipse, poly, translatePath, type Pt } from '../core/paths';
import type { AnimalDef, PartNode, Shape } from '../core/types';

const CX = 120;
const CY = 124;
const R = 92;
const IRIS_Y = CY + 10;

const blink = (phase: number) => {
  const p = phase - Math.floor(phase);
  return Math.max(0, 1 - Math.abs(p - 0.86) / 0.05);
};

function margin(phase: number) {
  const b = blink(phase);
  const peak = 54 + (194 - 54) * b;
  const bend = 0.0058 + (-0.0034 - 0.0058) * b;
  return (x: number) => peak + bend * (x - CX) ** 2;
}

function lidShape(phase: number): string {
  const m = margin(phase);
  const top: Pt[] = [];
  const bottom: Pt[] = [];
  for (let i = 0; i <= 96; i++) {
    const x = CX - R + (2 * R * i) / 96;
    const h = Math.sqrt(Math.max(0, R * R - (x - CX) ** 2));
    const y0 = CY - h;
    const y1 = Math.min(m(x), CY + h);
    if (y1 <= y0 + 0.01) continue;
    top.push([x, y0]);
    bottom.push([x, y1]);
  }
  return poly([...top, ...bottom.reverse()]);
}

function lashes(phase: number): Shape[] {
  const m = margin(phase);
  const b = blink(phase);
  return [-58, -29, 0, 29, 58].map((dx): Shape => {
    const x = CX + dx;
    const y = m(x);
    const slope = (m(x + 1) - m(x - 1)) / 2;
    const len = Math.hypot(1, slope);
    let nx = slope / len;
    let ny = -1 / len;
    if (b > 0.5) {
      nx = -nx;
      ny = -ny;
    }
    const flare = dx / 58;
    const l = 30 - 3 * Math.abs(flare);
    const tx = x + (nx + flare * 0.45) * l;
    const ty = y + ny * l;
    return {
      d: curve(x, y, tx, ty, (flare >= 0 ? -1 : 1) * (b > 0.5 ? -6.5 : 6.5)),
      kind: 'line',
      stroke: 'lash',
      width: 4.4,
    };
  });
}

const sclera: Shape[] = [
  { d: circle(CX, CY, R), fill: 'white' },
  { d: ellipse(CX + 30, CY + 66, 76, 32, -26), kind: 'detail', fill: 'shade' },
  { d: circle(CX, IRIS_Y, 45), kind: 'detail', fill: 'irisDark' },
  { d: circle(CX, IRIS_Y, 40), kind: 'detail', fill: 'iris' },
  { d: circle(CX, IRIS_Y, 28), kind: 'detail', fill: 'irisLight' },
  { d: circle(CX, IRIS_Y, 18.5), kind: 'detail', fill: 'pupil' },
  { d: circle(CX + 13, IRIS_Y - 13, 9.5), kind: 'detail', fill: 'white' },
  { d: circle(CX - 12, IRIS_Y + 13, 4.5), kind: 'detail', fill: 'white' },
  { d: ellipse(CX - 54, CY + 60, 11, 6.5, 24), kind: 'feature', fill: 'blush', opacity: 0.45 },
  { d: ellipse(CX + 54, CY + 60, 11, 6.5, -24), kind: 'feature', fill: 'blush', opacity: 0.45 },
  { d: curve(CX - 10, CY + 70, CX + 10, CY + 70, 6), kind: 'line', stroke: 'mouth', width: 3.3 },
];

const shift = (shapes: Shape[], dx: number, dy: number): Shape[] =>
  shapes.map((s) => ({ ...s, d: translatePath(s.d, dx, dy) }));

const offset = (parts: PartNode[], dx: number, dy: number): PartNode[] =>
  parts.map((p) => {
    const frames = p.frames;
    return {
      ...p,
      ...(p.pivot ? { pivot: [p.pivot[0] + dx, p.pivot[1] + dy] as Pt } : {}),
      ...(p.shapes ? { shapes: shift(p.shapes, dx, dy) } : {}),
      ...(frames ? { frames: (phase: number) => shift(frames(phase), dx, dy) } : {}),
      ...(p.children ? { children: offset(p.children, dx, dy) } : {}),
    };
  });

const eye: AnimalDef = {
  id: 'eye',
  name: 'Eye',
  kind: 'object',
  aliases: ['eyeball', 'eyes', 'peeper', 'eye ball'],
  group: 'body',
  habitats: ['body'],
  box: [204, 212],
  size: 120,
  locomotion: 'float',
  sound: 'eye',
  palette: {
    white: '#fbfcff',
    shade: '#e3e8f3',
    iris: '#4f9fe0',
    irisDark: '#2f74b8',
    irisLight: '#7cc0f2',
    pupil: '#1f2340',
    lid: '#f7bcaa',
    lidLight: '#ffd9cc',
    lash: '#3b2a3a',
  },
  parts: offset(
    [
      {
        id: 'ball',
        pivot: [CX, CY],
        shapes: sclera,
        children: [
          {
            id: 'lid',
            frames: (phase: number) => [
              { d: lidShape(phase), fill: 'lid' },
              { d: ellipse(CX - 40, CY - 72, 12, 5, -18), kind: 'detail', fill: 'lidLight' },
              ...lashes(phase),
            ],
          },
        ],
      },
    ],
    -18,
    -14,
  ),
};

export default eye;
