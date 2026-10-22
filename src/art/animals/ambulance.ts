import { circle, ellipse, f, roundRect, type Pt } from '../core/paths';
import type { AnimalDef, PartNode, Shape } from '../core/types';

const W = 352;
const H = 256;
const R = 38;
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
    { d: circle(x, WY, 22.5), kind: 'detail', fill: 'rim' },
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
  { d: ellipse(x, y, 10.5, 13.5), kind: 'feature', fill: 'eye' },
  { d: circle(x + 3.7, y - 5, 4.2), kind: 'feature', fill: 'shine' },
  { d: circle(x - 3.6, y + 5.8, 1.9), kind: 'feature', fill: 'shine' },
];

const ambulance: AnimalDef = {
  id: 'ambulance',
  name: 'Ambulance',
  kind: 'object',
  aliases: ['paramedic', 'emergency', 'siren', 'hospital van'],
  group: 'vehicle',
  habitats: ['vehicles'],
  box: [W, H],
  size: 220,
  locomotion: 'drive',
  gait: { period: 0.8, stride: Math.PI * 2 * R },
  sound: 'ambulance',
  palette: {
    body: '#f8f9fc',
    bodyDark: '#d9dde8',
    bodyLine: '#b9bfcd',
    red: '#ff5a5f',
    redGlow: '#ff7d86',
    blue: '#36a2ff',
    blueGlow: '#5cb8ff',
    glass: '#bfe8ff',
    tyre: '#45425a',
    rim: '#e3e7f0',
    hub: '#9aa3b8',
    bolt: '#7d869c',
    bar: '#5f6679',
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
              [10, 40],
              [270, 40],
              [296, 50],
              [342, 128],
              [346, 226],
              [10, 226],
            ],
            26,
          ),
          fill: 'body',
        },
        { d: roundRect(-10, 132, 330, 15, 7.5), kind: 'detail', fill: 'red' },
        { d: roundRect(-10, 196, 372, 40, 0), kind: 'detail', fill: 'bodyDark' },
        { d: circle(78, WY, R + 7), kind: 'detail', fill: 'bodyDark' },
        { d: circle(270, WY, R + 7), kind: 'detail', fill: 'bodyDark' },
        {
          d: roundRect(89, 58, 20, 60, 4) + roundRect(69, 78, 60, 20, 4),
          kind: 'detail',
          fill: 'red',
        },
        {
          d: roundPoly(
            [
              [198, 56],
              [284, 56],
              [324, 122],
              [198, 122],
            ],
            12,
          ),
          kind: 'detail',
          fill: 'glass',
        },
        { d: roundRect(20, 56, 30, 40, 9), kind: 'detail', fill: 'glass' },
        { d: roundRect(160, 158, 18, 6, 3), kind: 'detail', fill: 'bodyLine' },
        { d: 'M186 56L186 196', kind: 'line', stroke: 'bodyLine', width: 2.6 },
        { d: 'M28 64L28 84', kind: 'line', stroke: 'white', width: 4, opacity: 0.8 },
        { d: ellipse(338, 142, 6.5, 9.5), kind: 'feature', fill: 'headlight', stroke: 'auto' },
        { d: roundRect(8, 140, 9, 20, 4), kind: 'feature', fill: 'taillight', stroke: 'auto' },
        { d: ellipse(219, 110, 8, 4.8), kind: 'feature', fill: 'blush', opacity: 0.6 },
        { d: ellipse(296, 110, 8, 4.8), kind: 'feature', fill: 'blush', opacity: 0.6 },
        ...eye(238, 88),
        ...eye(274, 88),
        {
          d: 'M308 158Q323 162 338 157Q338 174 323 175Q309 174 308 158Z',
          kind: 'feature',
          fill: 'mouth',
        },
        { d: ellipse(323.5, 169.5, 7, 3.6), kind: 'feature', fill: 'tongue' },
      ],
      children: [
        {
          id: 'lightbar',
          behind: true,
          shapes: [{ d: roundRect(186, 28, 78, 16, 7), fill: 'bar' }],
          children: [
            light('lightRed', 206, 'red', 'redGlow', 0, [-165, -130, -95]),
            light('lightBlue', 244, 'blue', 'blueGlow', 0.25, [-85, -50, -15]),
          ],
        },
        { id: 'bumperB', shapes: [{ d: roundRect(2, 206, 30, 19, 9.5), fill: 'bumper' }] },
        { id: 'bumperF', shapes: [{ d: roundRect(318, 206, 32, 19, 9.5), fill: 'bumper' }] },
        wheel('wheelB', 78),
        wheel('wheelF', 270),
      ],
    },
  ],
};

export default ambulance;
