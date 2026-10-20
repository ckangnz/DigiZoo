import { circle, ellipse, f, smooth } from '../core/paths';
import type { AnimalDef, PartNode, Shape } from '../core/types';

const CX = 210;
const CY = 206;
const R = 186;
const BAND = 14;
const BANDS = ['red', 'orange', 'yellow', 'green', 'blue', 'indigo', 'violet'];

const arc = (ro: number, ri: number): string =>
  `M${f(CX - ro)} ${CY}A${ro} ${ro} 0 0 1 ${f(CX + ro)} ${CY}` +
  `L${f(CX + ri)} ${CY}A${ri} ${ri} 0 0 0 ${f(CX - ri)} ${CY}Z`;

const bands = (): Shape[] =>
  BANDS.map((fill, i) => ({ d: arc(R - i * BAND, R - (i + 1) * BAND), fill }));

const gloss = (): string => {
  const pts: [number, number][] = [];
  const r = R - BAND * 0.42;
  for (let k = 0; k <= 12; k++) {
    const a = ((196 + (k / 12) * 52) * Math.PI) / 180;
    pts.push([CX + r * Math.cos(a), CY + r * Math.sin(a)]);
  }
  return pts.map(([x, y], i) => `${i ? 'L' : 'M'}${f(x)} ${f(y)}`).join('');
};

const cloud = (id: string, x: number, y: number, dir: 1 | -1, phase: number): PartNode => {
  const p = (dx: number, dy: number, r: number) => circle(x + dir * dx, y + dy, r);
  return {
    id,
    pivot: [x, y + 20],
    motion: { y: 2.4, scaleX: 0.02, scaleY: 0.03, phase },
    shapes: [
      { d: ellipse(x, y + 16, 70, 21), fill: 'cloud' },
      { d: p(-46, 6, 23), fill: 'cloud' },
      { d: p(-18, -12, 30), fill: 'cloud' },
      { d: p(18, -16, 31), fill: 'cloud' },
      { d: p(48, 0, 24), fill: 'cloud' },
      { d: p(66, 15, 15), fill: 'cloud' },
      { d: ellipse(x + dir * 4, y + 36, 66, 13), kind: 'detail', fill: 'cloudShade' },
    ],
  };
};

const sparkle = (id: string, x: number, y: number, r: number, phase: number): PartNode => {
  const k = r * 0.32;
  return {
    id,
    role: 'sparkle',
    phase,
    pivot: [x, y],
    shapes: [
      {
        d: smooth(
          [
            [x, y - r],
            [x + k, y - k],
            [x + r, y],
            [x + k, y + k],
            [x, y + r],
            [x - k, y + k],
            [x - r, y],
            [x - k, y - k],
          ],
          true,
          0.4,
        ),
        fill: 'star',
      },
    ],
  };
};

const rainbow: AnimalDef = {
  id: 'rainbow',
  name: 'Rainbow',
  kind: 'object',
  aliases: ['promise', 'colours', 'colors', 'gods promise'],
  group: 'bible',
  habitats: ['bible'],
  box: [420, 236],
  size: 300,
  locomotion: 'breathe',
  sound: 'rainbow',
  palette: {
    red: '#ff6f6f',
    redLight: '#ffa3a0',
    orange: '#ffa54f',
    yellow: '#ffdc5c',
    green: '#8edb72',
    blue: '#5cc3f0',
    indigo: '#7d8cf2',
    violet: '#b88cf0',
    cloud: '#ffffff',
    cloudShade: '#dfeaf7',
    star: '#fff1a6',
  },
  parts: [
    {
      id: 'arch',
      pivot: [CX, CY],
      shapes: [...bands(), { d: gloss(), kind: 'line', stroke: 'redLight', width: 4 }],
      children: [
        cloud('cloudL', 72, 196, 1, 0),
        cloud('cloudR', 348, 196, -1, 0.5),
        sparkle('sparkle1', 64, 70, 13, 0),
        sparkle('sparkle2', 362, 50, 10, 0.33),
        sparkle('sparkle3', 210, 132, 9, 0.66),
        sparkle('sparkle4', 300, 26, 7, 0.15),
      ],
    },
  ],
};

export default rainbow;
