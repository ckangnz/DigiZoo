import { circle, curve, ellipse, f, roundRect, type Pt } from '../core/paths';
import type { AnimalDef, PartNode, Shape } from '../core/types';

const W = 470;
const H = 250;
const R = 41;
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
    { d: circle(x, WY, 24.5), kind: 'detail', fill: 'rim' },
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
          d: circle(x + 16 * Math.cos(a), WY + 16 * Math.sin(a), 3.2),
          kind: 'feature',
          fill: 'bolt',
        };
      }),
    },
  ],
});

const eye = (x: number, y: number): Shape[] => [
  { d: ellipse(x, y, 12, 15.5), kind: 'feature', fill: 'eye' },
  { d: circle(x + 4.2, y - 5.8, 4.8), kind: 'feature', fill: 'shine' },
  { d: circle(x - 4.1, y + 6.6, 2.1), kind: 'feature', fill: 'shine' },
];

const WINDOWS = [20, 84, 148, 212];

const kid = (x: number, skin: string, hair: string, shirt: string): Shape[] => {
  const cx = x + 27;
  return [
    {
      d: roundPoly(
        [
          [x + 11, 109],
          [x + 14, 95],
          [x + 40, 95],
          [x + 43, 109],
        ],
        7,
      ),
      kind: 'detail',
      fill: shirt,
    },
    { d: circle(cx, 79, 13), kind: 'detail', fill: skin },
    { d: ellipse(cx, 69.5, 13.6, 7.5), kind: 'detail', fill: hair },
    { d: ellipse(cx - 7.5, 85, 3, 2), kind: 'feature', fill: 'blush', opacity: 0.6 },
    { d: ellipse(cx + 7.5, 85, 3, 2), kind: 'feature', fill: 'blush', opacity: 0.6 },
    { d: circle(cx - 4.8, 80, 2.3), kind: 'feature', fill: 'eye' },
    { d: circle(cx + 4.8, 80, 2.3), kind: 'feature', fill: 'eye' },
    { d: curve(cx - 3.5, 86, cx + 3.5, 86, 2.6), kind: 'line', stroke: 'mouth', width: 1.8 },
  ];
};

const schoolBus: AnimalDef = {
  id: 'school-bus',
  name: 'School Bus',
  kind: 'object',
  aliases: ['bus', 'yellow bus', 'school', 'wheels on the bus'],
  group: 'vehicle',
  habitats: ['vehicles'],
  box: [W, H],
  size: 240,
  locomotion: 'drive',
  gait: { period: 0.8, stride: Math.PI * 2 * R },
  sound: 'school-bus',
  palette: {
    body: '#ffbe1f',
    bodyDark: '#eda30f',
    black: '#3a3546',
    glass: '#bfe8ff',
    tyre: '#45425a',
    rim: '#e3e7f0',
    hub: '#9aa3b8',
    bolt: '#7d869c',
    headlight: '#fff1a8',
    taillight: '#ff6b6b',
    amber: '#ff9f2e',
    grille: '#d8dce6',
    skinA: '#f6c9a4',
    hairA: '#8a4b2a',
    shirtA: '#ff7b7b',
    skinB: '#b97a52',
    hairB: '#3a2a26',
    shirtB: '#6fc3a0',
  },
  parts: [
    {
      id: 'body',
      pivot: [W / 2, H],
      shapes: [
        {
          d: roundPoly(
            [
              [10, 34],
              [368, 34],
              [384, 120],
              [384, 216],
              [10, 216],
            ],
            30,
          ),
          fill: 'body',
        },
        {
          d: roundPoly(
            [
              [360, 118],
              [440, 120],
              [462, 142],
              [462, 216],
              [360, 216],
            ],
            22,
          ),
          fill: 'body',
        },
        { d: roundRect(-10, 128, 384, 6, 0), kind: 'detail', fill: 'black' },
        { d: roundRect(-10, 152, 384, 6, 0), kind: 'detail', fill: 'black' },
        { d: roundRect(-10, 192, 490, 40, 0), kind: 'detail', fill: 'bodyDark' },
        { d: circle(100, WY, R + 7), kind: 'detail', fill: 'bodyDark' },
        { d: circle(394, WY, R + 7), kind: 'detail', fill: 'bodyDark' },
        ...WINDOWS.map((x): Shape => ({
          d: roundRect(x, 54, 54, 54, 11),
          kind: 'detail',
          fill: 'glass',
        })),
        { d: roundRect(282, 50, 82, 66, 14), kind: 'detail', fill: 'glass' },
        ...kid(84, 'skinA', 'hairA', 'shirtA'),
        ...kid(148, 'skinB', 'hairB', 'shirtB'),
        ...WINDOWS.map((x): Shape => ({
          d: `M${x + 10} ${64}Q${x + 6} ${76} ${x + 7} ${88}`,
          kind: 'line',
          stroke: 'white',
          width: 4,
          opacity: 0.8,
        })),
        { d: roundRect(454, 146, 10, 50, 5), kind: 'detail', fill: 'grille' },
        { d: ellipse(452, 140, 6.5, 9), kind: 'feature', fill: 'headlight', stroke: 'auto' },
        { d: roundRect(8, 60, 9, 18, 4), kind: 'feature', fill: 'taillight', stroke: 'auto' },
        { d: roundRect(8, 84, 9, 14, 4), kind: 'feature', fill: 'amber', stroke: 'auto' },
        { d: ellipse(294, 105, 8.5, 5), kind: 'feature', fill: 'blush', opacity: 0.6 },
        { d: ellipse(353, 105, 8.5, 5), kind: 'feature', fill: 'blush', opacity: 0.6 },
        ...eye(305, 82),
        ...eye(342, 82),
        {
          d: 'M418 164Q433 168 448 163Q448 180 433 181Q419 180 418 164Z',
          kind: 'feature',
          fill: 'mouth',
        },
        { d: ellipse(433.5, 175.5, 7, 3.6), kind: 'feature', fill: 'tongue' },
      ],
      children: [
        { id: 'bumperB', shapes: [{ d: roundRect(2, 196, 32, 18, 9), fill: 'black' }] },
        { id: 'bumperF', shapes: [{ d: roundRect(432, 196, 36, 18, 9), fill: 'black' }] },
        wheel('wheelB', 100),
        wheel('wheelF', 394),
      ],
    },
  ],
};

export default schoolBus;
