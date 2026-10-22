import { circle, ellipse, f, rotatePath, roundRect, smooth, type Pt } from '../core/paths';
import type { AnimalDef, PartNode, Shape } from '../core/types';

const GROUND = 249;
const TIRE = 32;
const LUG = 4;
const WY = GROUND - TIRE - LUG;
const HINGE: Pt = [22, 170];

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

const polar = (x: number, y: number, r: number, deg: number): Pt => {
  const a = ((deg - 90) * Math.PI) / 180;
  return [x + r * Math.cos(a), y + r * Math.sin(a)];
};

const wheel = (id: string, x: number): PartNode => {
  const y = WY;
  const lugs = 18;
  const lugW = ((2 * Math.PI * TIRE) / lugs) * 0.56;
  const tread: Shape[] = [{ d: circle(x, y, TIRE), fill: 'tire' }];
  for (let i = 0; i < lugs; i++) {
    tread.push({
      d: rotatePath(
        roundRect(x - lugW / 2, y - TIRE - LUG, lugW, LUG + 5, 2),
        (360 * i) / lugs,
        x,
        y,
      ),
      fill: 'tire',
    });
  }
  const rim = TIRE * 0.6;
  const hub: Shape[] = [];
  for (let i = 0; i < 3; i++) {
    const [hx, hy] = polar(x, y, rim * 0.62, 120 * i);
    hub.push({ d: circle(hx, hy, rim * 0.17), kind: 'feature', fill: 'bolt' });
  }
  hub.push({
    d: circle(x, y, rim * 0.3),
    kind: 'feature',
    fill: 'hub',
    stroke: 'auto',
    width: 1.8,
  });
  return {
    id,
    shapes: [
      { d: circle(x, y, TIRE - 2.4), fill: 'tire' },
      { d: circle(x, y, rim + 4), kind: 'detail', fill: 'tireDark' },
    ],
    children: [
      { id: `${id}Tread`, role: 'spinner', behind: true, pivot: [x, y], shapes: tread },
      {
        id: `${id}Rim`,
        shapes: [{ d: circle(x, y, rim), fill: 'rim' }],
        children: [{ id: `${id}Hub`, role: 'spinner', pivot: [x, y], shapes: hub }],
      },
    ],
  };
};

const eye = (x: number, y: number): Shape[] => [
  { d: ellipse(x, y, 9.5, 12.5), kind: 'feature', fill: 'eye' },
  { d: circle(x + 3.3, y - 4.6, 3.8), kind: 'feature', fill: 'shine' },
  { d: circle(x - 3.2, y + 5.4, 1.7), kind: 'feature', fill: 'shine' },
];

const PILE: Pt[] = [
  [26, 82],
  [42, 58],
  [66, 46],
  [94, 36],
  [124, 34],
  [154, 40],
  [182, 52],
  [204, 66],
  [216, 82],
];

const tipper: PartNode = {
  id: 'tipper',
  pivot: HINGE,
  motion: { rotate: -2.5, freq: 0.5, wave: 'lift' },
  shapes: [
    {
      d: roundPoly(
        [
          [8, 72],
          [226, 72],
          [226, 172],
          [36, 172],
        ],
        12,
      ),
      fill: 'tipper',
    },
    { d: roundRect(0, 72, 240, 12, 4), kind: 'detail', fill: 'tipperLight' },
    ...[70, 120, 170].map((x): Shape => ({
      d: roundRect(x, 90, 9, 90, 4.5),
      kind: 'detail',
      fill: 'tipperDark',
    })),
  ],
  children: [
    {
      id: 'load',
      behind: true,
      shapes: [
        { d: `${smooth(PILE, false)}L214 110L28 110Z`, fill: 'sand' },
        { d: ellipse(92, 52, 9, 6), kind: 'detail', fill: 'sandDark' },
        { d: ellipse(150, 46, 7, 5), kind: 'detail', fill: 'sandDark' },
        { d: ellipse(186, 62, 8, 5), kind: 'detail', fill: 'sandDark' },
        { d: ellipse(120, 40, 4, 3), kind: 'detail', fill: 'sandLight' },
        { d: ellipse(60, 64, 5, 3.4), kind: 'detail', fill: 'sandLight' },
      ],
    },
  ],
};

const dumpTruck: AnimalDef = {
  id: 'dump-truck',
  name: 'Dump Truck',
  kind: 'object',
  aliases: ['tipper truck', 'dumper', 'tipper', 'construction truck', 'sand truck'],
  group: 'vehicle',
  habitats: ['vehicles'],
  box: [360, 250],
  size: 250,
  locomotion: 'drive',
  gait: { period: 1, stride: Math.PI * 2 * (TIRE + LUG) },
  sound: 'dump-truck',
  palette: {
    cab: '#ff8a2e',
    cabDark: '#e2681c',
    tipper: '#ffc531',
    tipperDark: '#e8a21a',
    tipperLight: '#ffd96b',
    sand: '#e7b26c',
    sandDark: '#c98d4c',
    sandLight: '#f6d39a',
    glass: '#c4ecff',
    chassis: '#5a5f70',
    tire: '#4a4658',
    tireDark: '#3b3748',
    rim: '#e3e7f0',
    hub: '#9aa3b8',
    bolt: '#7d869c',
    metal: '#8a90a2',
    bumper: '#c6ccd8',
    headlight: '#fff0a0',
  },
  parts: [
    {
      id: 'chassis',
      shapes: [{ d: roundRect(20, 164, 300, 26, 10), fill: 'chassis' }],
    },
    tipper,
    {
      id: 'cab',
      shapes: [
        {
          d: roundPoly(
            [
              [236, 38],
              [304, 38],
              [342, 96],
              [346, 192],
              [236, 192],
            ],
            18,
          ),
          fill: 'cab',
        },
        { d: circle(294, WY, TIRE + LUG + 7), kind: 'detail', fill: 'cabDark' },
        { d: roundRect(230, 124, 130, 7, 3.5), kind: 'detail', fill: 'tipperLight' },
        { d: ellipse(339, 132, 6, 9), kind: 'feature', fill: 'headlight', stroke: 'auto' },
        {
          d: 'M313 146Q326 150 340 145Q339 162 327 163Q314 162 313 146Z',
          kind: 'feature',
          fill: 'mouth',
        },
        { d: ellipse(327, 157.5, 6.5, 3.4), kind: 'feature', fill: 'tongue' },
      ],
      children: [
        {
          id: 'glass',
          shapes: [
            {
              d: roundPoly(
                [
                  [250, 52],
                  [298, 52],
                  [330, 106],
                  [250, 106],
                ],
                12,
              ),
              fill: 'glass',
            },
            { d: 'M260 62Q256 78 258 94', kind: 'line', stroke: 'white', width: 4.5, opacity: 0.8 },
            { d: ellipse(276, 98, 7, 4.2), kind: 'feature', fill: 'blush', opacity: 0.6 },
            { d: ellipse(318, 98, 7, 4.2), kind: 'feature', fill: 'blush', opacity: 0.6 },
            ...eye(284, 80),
            ...eye(309, 80),
          ],
        },
      ],
    },
    { id: 'bumper', shapes: [{ d: roundRect(326, 168, 30, 18, 9), fill: 'bumper' }] },
    wheel('wheelA', 66),
    wheel('wheelB', 144),
    wheel('wheelC', 294),
  ],
};

export default dumpTruck;
