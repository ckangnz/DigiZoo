import { circle, ellipse, f, roundRect, type Pt } from '../core/paths';
import type { AnimalDef, PartNode, Shape } from '../core/types';

const W = 462;
const H = 252;
const R = 39;
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
    { d: circle(x, WY, 23), kind: 'detail', fill: 'rim' },
    { d: circle(x, WY, 8), kind: 'detail', fill: 'hub' },
  ],
  children: [
    {
      id: `${id}Spin`,
      role: 'spinner',
      pivot: [x, WY],
      shapes: Array.from({ length: 5 }, (_, i): Shape => {
        const a = (i / 5) * Math.PI * 2 - Math.PI / 2;
        return {
          d: circle(x + 15 * Math.cos(a), WY + 15 * Math.sin(a), 3.1),
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
    d: `M${f(x + 17 * Math.cos(a))} ${f(y + 17 * Math.sin(a))}L${f(x + 25 * Math.cos(a))} ${f(y + 25 * Math.sin(a))}`,
    kind: 'line',
    stroke,
    width: 3.2,
  };
};

const eye = (x: number, y: number): Shape[] => [
  { d: ellipse(x, y, 12, 15.5), kind: 'feature', fill: 'eye' },
  { d: circle(x + 4.2, y - 5.8, 4.8), kind: 'feature', fill: 'shine' },
  { d: circle(x - 4.1, y + 6.6, 2.1), kind: 'feature', fill: 'shine' },
];

const garbageTruck: AnimalDef = {
  id: 'garbage-truck',
  name: 'Garbage Truck',
  kind: 'object',
  aliases: ['rubbish truck', 'trash truck', 'bin lorry', 'dustbin lorry', 'recycling truck'],
  group: 'vehicle',
  habitats: ['vehicles'],
  box: [W, H],
  size: 250,
  locomotion: 'drive',
  gait: { period: 0.8, stride: Math.PI * 2 * R },
  sound: 'garbage-truck',
  palette: {
    body: '#55bf5a',
    bodyDark: '#3f9d47',
    bodyLine: '#358a3d',
    hopper: '#46a84c',
    stripe: '#ffd23f',
    glass: '#bfe8ff',
    metal: '#c6ccd8',
    metalDark: '#8f98ad',
    bin: '#4c96e8',
    binDark: '#3478c8',
    tyre: '#45425a',
    rim: '#e3e7f0',
    hub: '#9aa3b8',
    bolt: '#7d869c',
    amber: '#ffa62b',
    amberGlow: '#ffc35c',
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
              [84, 54],
              [338, 40],
              [338, 216],
              [84, 216],
            ],
            30,
          ),
          fill: 'body',
        },
        {
          d: roundPoly(
            [
              [326, 64],
              [426, 64],
              [450, 94],
              [452, 216],
              [326, 216],
            ],
            24,
          ),
          fill: 'body',
        },
        { d: roundRect(-10, 160, 352, 12, 0), kind: 'detail', fill: 'stripe' },
        ...[146, 208, 270].map((x): Shape => ({
          d: `M${x} 62L${x} 150`,
          kind: 'line',
          stroke: 'bodyLine',
          width: 2.6,
        })),
        { d: roundRect(-10, 190, 480, 40, 0), kind: 'detail', fill: 'bodyDark' },
        { d: circle(132, WY, R + 7), kind: 'detail', fill: 'bodyDark' },
        { d: circle(218, WY, R + 7), kind: 'detail', fill: 'bodyDark' },
        { d: circle(390, WY, R + 7), kind: 'detail', fill: 'bodyDark' },
        {
          d: roundPoly(
            [
              [346, 74],
              [421, 74],
              [442, 101],
              [442, 140],
              [346, 140],
            ],
            12,
          ),
          kind: 'detail',
          fill: 'glass',
        },
        { d: 'M344 146L344 206', kind: 'line', stroke: 'bodyLine', width: 2.6 },
        { d: roundRect(352, 152, 18, 6, 3), kind: 'detail', fill: 'metal' },
        { d: ellipse(448, 154, 6.5, 9.5), kind: 'feature', fill: 'headlight', stroke: 'auto' },
        { d: ellipse(361, 127, 8.5, 5), kind: 'feature', fill: 'blush', opacity: 0.6 },
        { d: ellipse(431, 127, 8.5, 5), kind: 'feature', fill: 'blush', opacity: 0.6 },
        ...eye(377, 104),
        ...eye(414, 104),
        {
          d: 'M416 168Q431 172 446 167Q446 184 431 185Q417 184 416 168Z',
          kind: 'feature',
          fill: 'mouth',
        },
        { d: ellipse(431.5, 179.5, 7, 3.6), kind: 'feature', fill: 'tongue' },
      ],
      children: [
        {
          id: 'beacon',
          behind: true,
          shapes: [{ d: roundRect(374, 52, 36, 16, 6), fill: 'metalDark' }],
          children: [
            {
              id: 'beaconLight',
              role: 'sparkle',
              pivot: [392, 60],
              shapes: [
                { d: ellipse(392, 50, 13, 11), fill: 'amber' },
                {
                  d: ellipse(388, 46, 4, 2.6, -20),
                  kind: 'feature',
                  fill: 'white',
                  opacity: 0.8,
                },
                ...[-160, -125, -90, -55, -20].map((deg) => ray(392, 50, deg, 'amberGlow')),
              ],
            },
          ],
        },
        {
          id: 'hopper',
          behind: true,
          shapes: [
            {
              d: roundPoly(
                [
                  [50, 84],
                  [98, 56],
                  [98, 212],
                  [62, 212],
                  [44, 176],
                ],
                16,
              ),
              fill: 'hopper',
            },
            { d: roundRect(54, 186, 20, 8, 4), kind: 'feature', fill: 'taillight', stroke: 'auto' },
          ],
        },
        {
          id: 'lifter',
          pivot: [52, 116],
          motion: { rotate: 4, freq: 0.5 },
          shapes: [
            { d: roundRect(40, 108, 16, 74, 6), fill: 'metal' },
            {
              d: roundPoly(
                [
                  [8, 112],
                  [44, 112],
                  [40, 176],
                  [12, 176],
                ],
                6,
              ),
              fill: 'bin',
            },
            { d: roundRect(4, 103, 44, 11, 5), fill: 'binDark' },
            { d: circle(16, 178, 6.5), fill: 'tyre' },
            { d: 'M18 126L36 126', kind: 'line', stroke: 'binDark', width: 2.6 },
          ],
        },
        { id: 'bumperF', shapes: [{ d: roundRect(424, 198, 34, 19, 9.5), fill: 'bumper' }] },
        wheel('wheelB', 132),
        wheel('wheelM', 218),
        wheel('wheelF', 390),
      ],
    },
  ],
};

export default garbageTruck;
