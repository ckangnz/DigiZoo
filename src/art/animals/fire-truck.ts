import { circle, ellipse, f, roundRect, type Pt } from '../core/paths';
import type { AnimalDef, PartNode, Shape } from '../core/types';

const W = 474;
const H = 262;
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
  pivot: [x, 50],
  shapes: [
    { d: ellipse(x, 40, 15, 12), fill },
    { d: ellipse(x - 4.5, 35, 4.5, 3, -20), kind: 'feature', fill: 'white', opacity: 0.8 },
    ...rays.map((deg) => ray(x, 40, deg, glow)),
  ],
});

const eye = (x: number, y: number): Shape[] => [
  { d: ellipse(x, y, 12, 15.5), kind: 'feature', fill: 'eye' },
  { d: circle(x + 4.2, y - 5.8, 4.8), kind: 'feature', fill: 'shine' },
  { d: circle(x - 4.1, y + 6.6, 2.1), kind: 'feature', fill: 'shine' },
];

function spiral(cx: number, cy: number, r0: number, r1: number, turns: number): string {
  const steps = Math.round(turns * 36);
  let d = '';
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const a = -Math.PI / 2 + t * turns * Math.PI * 2;
    const r = r0 + (r1 - r0) * t;
    d += `${i ? 'L' : 'M'}${f(cx + r * Math.cos(a))} ${f(cy + r * Math.sin(a))}`;
  }
  return d;
}

const rungs = (x0: number, x1: number, step: number): Shape[] => {
  const out: Shape[] = [];
  for (let x = x0; x <= x1; x += step) out.push({ d: roundRect(x, 62, 7, 28, 2), fill: 'ladder' });
  return out;
};

const fireTruck: AnimalDef = {
  id: 'fire-truck',
  name: 'Fire Truck',
  kind: 'object',
  aliases: ['fire engine', 'firefighter', 'ladder truck', 'fire brigade', 'fire rescue'],
  group: 'vehicle',
  habitats: ['vehicles'],
  box: [W, H],
  size: 260,
  locomotion: 'drive',
  gait: { period: 0.8, stride: Math.PI * 2 * R },
  sound: 'fire-truck',
  palette: {
    body: '#f2483f',
    bodyDark: '#cf3530',
    bodyLine: '#b82c28',
    stripe: '#ffd23f',
    glass: '#bfe8ff',
    ladder: '#e6e9f0',
    silver: '#dfe3ea',
    silverDark: '#aeb5c4',
    reel: '#8f98ad',
    hose: '#fff1b8',
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
    taillight: '#ffb347',
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
              [10, 98],
              [318, 98],
              [318, 232],
              [10, 232],
            ],
            18,
          ),
          fill: 'body',
        },
        {
          d: roundPoly(
            [
              [300, 52],
              [420, 52],
              [452, 90],
              [464, 124],
              [464, 232],
              [300, 232],
            ],
            24,
          ),
          fill: 'body',
        },
        { d: roundRect(-10, 182, 424, 12, 0), kind: 'detail', fill: 'stripe' },
        { d: circle(98, WY, R + 7), kind: 'detail', fill: 'bodyDark' },
        { d: circle(184, WY, R + 7), kind: 'detail', fill: 'bodyDark' },
        { d: circle(392, WY, R + 7), kind: 'detail', fill: 'bodyDark' },
        { d: roundRect(24, 112, 112, 58, 9), kind: 'detail', fill: 'silver' },
        ...[126, 138, 150].map((y): Shape => ({
          d: `M34 ${y}L126 ${y}`,
          kind: 'line',
          stroke: 'silverDark',
          width: 2.4,
        })),
        { d: roundRect(70, 158, 24, 6, 3), kind: 'detail', fill: 'silverDark' },
        {
          d: roundPoly(
            [
              [356, 62],
              [418, 62],
              [447, 99],
              [447, 136],
              [356, 136],
            ],
            12,
          ),
          kind: 'detail',
          fill: 'glass',
        },
        { d: roundRect(314, 66, 36, 44, 10), kind: 'detail', fill: 'glass' },
        { d: 'M322 74L322 94', kind: 'line', stroke: 'white', width: 4, opacity: 0.8 },
        { d: 'M354 140L354 222', kind: 'line', stroke: 'bodyLine', width: 2.6 },
        { d: roundRect(362, 146, 18, 6, 3), kind: 'detail', fill: 'silver' },
        { d: ellipse(460, 148, 6.5, 9.5), kind: 'feature', fill: 'headlight', stroke: 'auto' },
        { d: roundRect(8, 120, 9, 20, 4), kind: 'feature', fill: 'taillight', stroke: 'auto' },
        { d: ellipse(368, 121, 8.5, 5), kind: 'feature', fill: 'blush', opacity: 0.6 },
        { d: ellipse(436, 121, 8.5, 5), kind: 'feature', fill: 'blush', opacity: 0.6 },
        ...eye(384, 97),
        ...eye(421, 97),
        {
          d: 'M426 160Q441 164 456 159Q456 176 441 177Q427 176 426 160Z',
          kind: 'feature',
          fill: 'mouth',
        },
        { d: ellipse(441.5, 171.5, 7, 3.6), kind: 'feature', fill: 'tongue' },
      ],
      children: [
        {
          id: 'ladder',
          behind: true,
          shapes: [
            { d: roundRect(52, 90, 14, 14, 3), fill: 'silverDark' },
            { d: roundRect(262, 90, 14, 14, 3), fill: 'silverDark' },
            { d: roundRect(8, 54, 308, 10, 5), fill: 'ladder' },
            { d: roundRect(8, 84, 308, 10, 5), fill: 'ladder' },
            ...rungs(20, 300, 31),
          ],
        },
        {
          id: 'lightbar',
          behind: true,
          shapes: [{ d: roundRect(338, 40, 78, 16, 7), fill: 'bar' }],
          children: [
            light('lightRed', 358, 'red', 'redGlow', 0, [-165, -130, -95]),
            light('lightBlue', 396, 'blue', 'blueGlow', 0.25, [-85, -50, -15]),
          ],
        },
        {
          id: 'reel',
          pivot: [238, 140],
          shapes: [
            { d: circle(238, 140, 32), fill: 'silver' },
            { d: circle(238, 140, 27), kind: 'detail', fill: 'reel' },
            { d: spiral(238, 140, 9, 23, 1.85), kind: 'line', stroke: 'hose', width: 4.6 },
            { d: circle(238, 140, 5), kind: 'feature', fill: 'silver', stroke: 'auto' },
          ],
        },
        { id: 'bumperB', shapes: [{ d: roundRect(2, 212, 30, 19, 9.5), fill: 'bumper' }] },
        { id: 'bumperF', shapes: [{ d: roundRect(436, 212, 34, 19, 9.5), fill: 'bumper' }] },
        wheel('wheelB', 98),
        wheel('wheelM', 184),
        wheel('wheelF', 392),
      ],
    },
  ],
};

export default fireTruck;
