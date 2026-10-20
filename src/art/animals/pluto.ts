import { circle, curve, ellipse, smooth, type Pt } from '../core/paths';
import type { AnimalDef } from '../core/types';

const CX = 110;
const CY = 110;
const R = 104;

const at = (x: number, y: number): Pt => [CX + x * R, CY + y * R];

function heart(cx: number, cy: number, s: number, tilt: number): string {
  const a = (tilt * Math.PI) / 180;
  const p = (x: number, y: number) => {
    const rx = x * Math.cos(a) - y * Math.sin(a);
    const ry = x * Math.sin(a) + y * Math.cos(a);
    return `${(CX + (cx + rx * s) * R).toFixed(2)} ${(CY + (cy + ry * s) * R).toFixed(2)}`;
  };
  return (
    `M${p(0, 0.92)}` +
    `C${p(-0.5, 0.56)} ${p(-1.04, 0.18)} ${p(-1.02, -0.3)}` +
    `C${p(-1.0, -0.78)} ${p(-0.38, -0.96)} ${p(0.02, -0.46)}` +
    `C${p(0.34, -0.86)} ${p(0.86, -0.74)} ${p(0.88, -0.3)}` +
    `C${p(0.9, 0.12)} ${p(0.46, 0.54)} ${p(0, 0.92)}Z`
  );
}

const pluto: AnimalDef = {
  id: 'pluto',
  name: 'Pluto',
  kind: 'object',
  aliases: ['dwarf planet', 'planet pluto', 'planet', 'heart planet'],
  group: 'space',
  habitats: ['space'],
  box: [220, 220],
  size: 80,
  locomotion: 'float',
  gait: { period: 2.4 },
  sound: 'pluto',
  palette: {
    rock: '#d2ad8e',
    dark: '#a97c62',
    frost: '#e0c3aa',
    heart: '#fbf4ec',
    blush: '#ff8f9c',
  },
  parts: [
    {
      id: 'planet',
      role: 'body',
      pivot: [CX, CY],
      shapes: [
        { d: circle(CX, CY, R), fill: 'rock' },
        {
          d: smooth(
            (
              [
                [-1.04, 0.3],
                [-0.78, 0.44],
                [-0.5, 0.62],
                [-0.22, 0.8],
                [-0.06, 1.02],
                [-0.5, 1.02],
                [-0.9, 0.8],
              ] as [number, number][]
            ).map(([x, y]) => at(x, y)),
          ),
          kind: 'detail',
          fill: 'dark',
        },
        {
          d: smooth(
            (
              [
                [-0.7, -0.78],
                [-0.3, -0.9],
                [0.2, -0.94],
                [0.66, -0.72],
                [0.5, -0.56],
                [0.1, -0.6],
                [-0.36, -0.58],
              ] as [number, number][]
            ).map(([x, y]) => at(x, y)),
          ),
          kind: 'detail',
          fill: 'frost',
        },
        { d: heart(0.4, 0.5, 0.42, -12), kind: 'detail', fill: 'heart' },
        { d: ellipse(CX - 70, CY + 6, 14, 8.5), kind: 'feature', fill: 'blush', opacity: 0.5 },
        { d: ellipse(CX + 50, CY + 0, 14, 8.5), kind: 'feature', fill: 'blush', opacity: 0.5 },
        { d: curve(CX - 20, CY + 2, CX + 2, CY + 2, 7), kind: 'line', stroke: 'mouth', width: 3.2 },
      ],
      children: [
        {
          id: 'eyes',
          role: 'lid',
          pivot: [CX, CY - 17],
          shapes: [
            { d: circle(CX - 43, CY - 17, 15), kind: 'feature', fill: 'eye' },
            { d: circle(CX + 25, CY - 17, 15), kind: 'feature', fill: 'eye' },
            { d: circle(CX - 37.4, CY - 22.8, 5.6), kind: 'feature', fill: 'shine' },
            { d: circle(CX + 30.6, CY - 22.8, 5.6), kind: 'feature', fill: 'shine' },
          ],
        },
      ],
    },
  ],
};

export default pluto;
