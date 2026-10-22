import { circle, ellipse, f, roundRect, type Pt } from '../core/paths';
import type { AnimalDef, PartNode, Shape } from '../core/types';

const W = 330;
const H = 224;
const R = 37;
const WY = H - R;
const BOUNCE = 0.012 * H;

function roundPoly(pts: Pt[], r: number): string {
  const n = pts.length;
  let d = '';
  for (let i = 0; i < n; i++) {
    const prev = pts[(i + n - 1) % n];
    const cur = pts[i];
    const next = pts[(i + 1) % n];
    const toward = (p: Pt): Pt => {
      const len = Math.hypot(p[0] - cur[0], p[1] - cur[1]);
      const k = Math.min(r, len / 2) / len;
      return [cur[0] + (p[0] - cur[0]) * k, cur[1] + (p[1] - cur[1]) * k];
    };
    const a = toward(prev);
    const b = toward(next);
    d += `${i ? 'L' : 'M'}${f(a[0])} ${f(a[1])}Q${f(cur[0])} ${f(cur[1])} ${f(b[0])} ${f(b[1])}`;
  }
  return d + 'Z';
}

const wheel = (id: string, x: number): PartNode => ({
  id,
  pivot: [x, WY],
  motion: { y: BOUNCE, wave: 'abs' },
  shapes: [
    { d: circle(x, WY, R), fill: 'tyre' },
    { d: circle(x, WY, 22), kind: 'detail', fill: 'rim' },
    { d: circle(x, WY, 7.5), kind: 'detail', fill: 'hub' },
  ],
  children: [
    {
      id: `${id}Spin`,
      role: 'spinner',
      pivot: [x, WY],
      shapes: Array.from({ length: 5 }, (_, i): Shape => {
        const a = (i / 5) * Math.PI * 2 - Math.PI / 2;
        return {
          d: circle(x + 14.5 * Math.cos(a), WY + 14.5 * Math.sin(a), 3),
          kind: 'feature',
          fill: 'bolt',
        };
      }),
    },
  ],
});

const ray = (x: number, y: number, deg: number, stroke: string): Shape => {
  const a = (deg * Math.PI) / 180;
  return {
    d: `M${f(x + 19 * Math.cos(a))} ${f(y + 19 * Math.sin(a))}L${f(x + 27 * Math.cos(a))} ${f(y + 27 * Math.sin(a))}`,
    kind: 'line',
    stroke,
    width: 3.2,
  };
};

const light = (
  id: string,
  x: number,
  fill: string,
  glow: string,
  phase: number,
  rays: number[],
): PartNode => ({
  id,
  role: 'sparkle',
  phase,
  pivot: [x, 38],
  shapes: [
    { d: ellipse(x, 28, 15, 12), fill },
    { d: ellipse(x - 4.5, 23, 4.5, 3, -20), kind: 'feature', fill: 'white', opacity: 0.8 },
    ...rays.map((deg) => ray(x, 28, deg, glow)),
  ],
});

const eye = (x: number, y: number): Shape[] => [
  { d: ellipse(x, y, 10, 13), kind: 'feature', fill: 'eye' },
  { d: circle(x + 3.5, y - 4.8, 4), kind: 'feature', fill: 'shine' },
  { d: circle(x - 3.4, y + 5.6, 1.8), kind: 'feature', fill: 'shine' },
];

const policeCar: AnimalDef = {
  id: 'police-car',
  name: 'Police Car',
  kind: 'object',
  aliases: ['police', 'cop car', 'siren', 'patrol car', 'squad car'],
  group: 'vehicle',
  habitats: ['vehicles'],
  box: [W, H],
  size: 180,
  locomotion: 'drive',
  gait: { period: 0.8, stride: Math.PI * 2 * R },
  sound: 'police-car',
  palette: {
    body: '#3f7fe6',
    bodyDark: '#2d62c2',
    bodyLine: '#2a56a8',
    cabin: '#f7f8fc',
    glass: '#bfe8ff',
    tyre: '#45425a',
    rim: '#e3e7f0',
    hub: '#9aa3b8',
    bolt: '#7d869c',
    bar: '#5f6679',
    red: '#ff5a64',
    redGlow: '#ff7d86',
    blue: '#36a2ff',
    blueGlow: '#5cb8ff',
    headlight: '#ffe07a',
    taillight: '#ff6b6b',
    bumper: '#c6ccd8',
  },
  parts: [
    {
      id: 'body',
      pivot: [W / 2, H],
      shapes: [
        {
          d: roundPoly(
            [
              [10, 116],
              [284, 110],
              [320, 128],
              [322, 194],
              [10, 194],
            ],
            22,
          ),
          fill: 'body',
        },
        {
          d: roundPoly(
            [
              [60, 120],
              [80, 40],
              [220, 40],
              [278, 120],
            ],
            24,
          ),
          fill: 'cabin',
        },
        { d: roundRect(-10, 142, 290, 12, 6), kind: 'detail', fill: 'cabin' },
        { d: circle(82, WY, R + 7), kind: 'detail', fill: 'bodyDark' },
        { d: circle(250, WY, R + 7), kind: 'detail', fill: 'bodyDark' },
        {
          d: roundPoly(
            [
              [90, 54],
              [140, 54],
              [140, 104],
              [77, 104],
            ],
            10,
          ),
          kind: 'detail',
          fill: 'glass',
        },
        {
          d: roundPoly(
            [
              [150, 54],
              [217, 54],
              [252, 104],
              [150, 104],
            ],
            10,
          ),
          kind: 'detail',
          fill: 'glass',
        },
        { d: roundRect(153, 124, 18, 6, 3), kind: 'detail', fill: 'cabin' },
        { d: 'M145 120L145 180', kind: 'line', stroke: 'bodyLine', width: 2.6 },
        { d: 'M98 64Q93 78 94 92', kind: 'line', stroke: 'white', width: 4.5, opacity: 0.8 },
        { d: ellipse(314, 131, 6.5, 9.5), kind: 'feature', fill: 'headlight', stroke: 'auto' },
        { d: roundRect(9, 122, 9, 18, 4), kind: 'feature', fill: 'taillight', stroke: 'auto' },
        { d: ellipse(166, 97, 7.5, 4.5), kind: 'feature', fill: 'blush', opacity: 0.6 },
        { d: ellipse(236, 97, 7.5, 4.5), kind: 'feature', fill: 'blush', opacity: 0.6 },
        ...eye(184, 78),
        ...eye(218, 78),
        {
          d: 'M283 147Q298 151 313 146Q313 163 298 164Q284 163 283 147Z',
          kind: 'feature',
          fill: 'mouth',
        },
        { d: ellipse(298.5, 158.5, 7, 3.6), kind: 'feature', fill: 'tongue' },
      ],
      children: [
        {
          id: 'lightbar',
          behind: true,
          shapes: [{ d: roundRect(112, 28, 76, 16, 7), fill: 'bar' }],
          children: [
            light('lightRed', 131, 'red', 'redGlow', 0, [-165, -130, -95]),
            light('lightBlue', 169, 'blue', 'blueGlow', 0.25, [-85, -50, -15]),
          ],
        },
        { id: 'bumperB', shapes: [{ d: roundRect(2, 168, 30, 19, 9.5), fill: 'bumper' }] },
        { id: 'bumperF', shapes: [{ d: roundRect(296, 168, 32, 19, 9.5), fill: 'bumper' }] },
        wheel('wheelB', 82),
        wheel('wheelF', 250),
      ],
    },
  ],
};

export default policeCar;
