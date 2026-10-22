import { circle, ellipse, f, roundRect, type Pt } from '../core/paths';
import type { AnimalDef, PartNode, Shape } from '../core/types';

const W = 330;
const H = 218;
const R = 36;
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
    { d: circle(x, WY, 21.5), kind: 'detail', fill: 'rim' },
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
          d: circle(x + 14 * Math.cos(a), WY + 14 * Math.sin(a), 3),
          kind: 'feature',
          fill: 'bolt',
        };
      }),
    },
  ],
});

function checkers(x0: number, x1: number, y: number, s: number): string {
  let d = '';
  for (let x = x0, i = 0; x < x1; x += s, i++) {
    const top = i % 2 === 0;
    d += `M${f(x)} ${f(top ? y : y + s)}h${f(s)}v${f(s)}h${f(-s)}Z`;
  }
  return d;
}

const eye = (x: number, y: number): Shape[] => [
  { d: ellipse(x, y, 10, 13), kind: 'feature', fill: 'eye' },
  { d: circle(x + 3.5, y - 4.8, 4), kind: 'feature', fill: 'shine' },
  { d: circle(x - 3.4, y + 5.6, 1.8), kind: 'feature', fill: 'shine' },
];

const taxi: AnimalDef = {
  id: 'taxi',
  name: 'Taxi',
  kind: 'object',
  aliases: ['cab', 'taxi cab', 'yellow car', 'taxicab'],
  group: 'vehicle',
  habitats: ['vehicles'],
  box: [W, H],
  size: 170,
  locomotion: 'drive',
  gait: { period: 0.8, stride: Math.PI * 2 * R },
  sound: 'taxi',
  palette: {
    body: '#ffc83a',
    bodyDark: '#eea821',
    bodyLine: '#c98a12',
    glass: '#bfe8ff',
    check: '#3a3546',
    checkLight: '#fffaf0',
    sign: '#fff4cc',
    signLit: '#ffe27a',
    tyre: '#45425a',
    rim: '#e3e7f0',
    hub: '#9aa3b8',
    bolt: '#7d869c',
    headlight: '#fff1a8',
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
              [290, 108],
              [322, 128],
              [322, 190],
              [10, 190],
            ],
            24,
          ),
          fill: 'body',
        },
        {
          d: roundPoly(
            [
              [50, 140],
              [76, 62],
              [124, 40],
              [214, 40],
              [252, 64],
              [300, 140],
            ],
            28,
          ),
          fill: 'body',
        },
        { d: roundRect(-10, 124, 286, 18, 0), kind: 'detail', fill: 'checkLight' },
        { d: checkers(-2, 276, 124, 9), kind: 'detail', fill: 'check' },
        { d: circle(80, WY, R + 7), kind: 'detail', fill: 'bodyDark' },
        { d: circle(250, WY, R + 7), kind: 'detail', fill: 'bodyDark' },
        {
          d: roundPoly(
            [
              [98, 58],
              [140, 52],
              [140, 106],
              [78, 106],
            ],
            12,
          ),
          kind: 'detail',
          fill: 'glass',
        },
        {
          d: roundPoly(
            [
              [150, 52],
              [214, 54],
              [258, 106],
              [150, 106],
            ],
            12,
          ),
          kind: 'detail',
          fill: 'glass',
        },
        { d: roundRect(152, 148, 18, 6, 3), kind: 'detail', fill: 'bodyLine' },
        { d: 'M145 108L145 178', kind: 'line', stroke: 'bodyLine', width: 2.6 },
        { d: 'M100 68Q92 80 92 94', kind: 'line', stroke: 'white', width: 4.5, opacity: 0.8 },
        { d: ellipse(314, 134, 6.5, 9.5), kind: 'feature', fill: 'headlight', stroke: 'auto' },
        { d: roundRect(9, 128, 9, 18, 4), kind: 'feature', fill: 'taillight', stroke: 'auto' },
        { d: ellipse(166, 98, 7.5, 4.5), kind: 'feature', fill: 'blush', opacity: 0.6 },
        { d: ellipse(238, 98, 7.5, 4.5), kind: 'feature', fill: 'blush', opacity: 0.6 },
        ...eye(186, 79),
        ...eye(220, 79),
        {
          d: 'M283 150Q298 154 313 149Q313 166 298 167Q284 166 283 150Z',
          kind: 'feature',
          fill: 'mouth',
        },
        { d: ellipse(298.5, 161.5, 7, 3.6), kind: 'feature', fill: 'tongue' },
      ],
      children: [
        {
          id: 'sign',
          behind: true,
          shapes: [
            {
              d: roundPoly(
                [
                  [132, 46],
                  [142, 14],
                  [198, 14],
                  [208, 46],
                ],
                8,
              ),
              fill: 'sign',
            },
            { d: roundRect(146, 20, 48, 14, 6), kind: 'detail', fill: 'signLit' },
          ],
        },
        { id: 'bumperB', shapes: [{ d: roundRect(2, 166, 30, 19, 9.5), fill: 'bumper' }] },
        { id: 'bumperF', shapes: [{ d: roundRect(296, 166, 32, 19, 9.5), fill: 'bumper' }] },
        wheel('wheelB', 80),
        wheel('wheelF', 250),
      ],
    },
  ],
};

export default taxi;
