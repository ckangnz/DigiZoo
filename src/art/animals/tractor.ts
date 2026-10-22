import {
  capsule,
  circle,
  ellipse,
  f,
  rotatePath,
  roundRect,
  scallop,
  tube,
  type Pt,
} from '../core/paths';
import type { AnimalDef, PartNode, Shape } from '../core/types';

const GROUND = 249;

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

const spinner = (id: string, pivot: Pt, speed: number, leaf: Partial<PartNode>): PartNode => {
  let node: PartNode = { ...leaf, id: `${id}${speed}`, role: 'spinner', pivot };
  for (let k = speed - 1; k >= 1; k--) {
    node = { id: `${id}${k}`, role: 'spinner', pivot, children: [node] };
  }
  return node;
};

const polar = (x: number, y: number, r: number, deg: number): Pt => {
  const a = ((deg - 90) * Math.PI) / 180;
  return [x + r * Math.cos(a), y + r * Math.sin(a)];
};

interface WheelSpec {
  id: string;
  x: number;
  r: number;
  lug: number;
  lugs: number;
  speed: number;
  holes: number;
}

const wheel = ({ id, x, r, lug, lugs, speed, holes }: WheelSpec): PartNode => {
  const y = GROUND - r - lug;
  const lugW = ((2 * Math.PI * r) / lugs) * 0.56;
  const tread: Shape[] = [{ d: circle(x, y, r), fill: 'tire' }];
  for (let i = 0; i < lugs; i++) {
    tread.push({
      d: rotatePath(
        roundRect(x - lugW / 2, y - r - lug, lugW, lug + 6, lugW * 0.3),
        (360 * i) / lugs,
        x,
        y,
      ),
      fill: 'tire',
    });
  }
  const rim = r * 0.6;
  const cap = rim * 0.38;
  const hub: Shape[] = [];
  for (let i = 0; i < holes; i++) {
    const deg = (360 * i) / holes;
    const [hx, hy] = polar(x, y, rim * 0.66, deg);
    hub.push({
      d: ellipse(hx, hy, rim * 0.17, rim * 0.21, deg),
      kind: 'feature',
      fill: 'rimDark',
    });
  }
  hub.push({ d: circle(x, y, cap), kind: 'feature', fill: 'rimLight', stroke: 'auto', width: 2 });
  for (let i = 0; i < 3; i++) {
    const [bx, by] = polar(x, y, cap * 0.52, 60 + 120 * i);
    hub.push({ d: circle(bx, by, cap * 0.17), kind: 'feature', fill: 'rimDark' });
  }
  return {
    id,
    shapes: [
      { d: circle(x, y, r - lug * 0.55), fill: 'tire' },
      { d: circle(x, y, rim + r * 0.12), kind: 'detail', fill: 'tireDark' },
    ],
    children: [
      { ...spinner(`${id}Tread`, [x, y], speed, { shapes: tread }), behind: true },
      {
        id: `${id}Rim`,
        shapes: [{ d: circle(x, y, rim), fill: 'rim' }],
        children: [spinner(`${id}Hub`, [x, y], speed, { shapes: hub })],
      },
    ],
  };
};

const REAR: WheelSpec = { id: 'rear', x: 92, r: 56, lug: 7, lugs: 18, speed: 1, holes: 3 };
const FRONT: WheelSpec = { id: 'front', x: 262, r: 28, lug: 3.5, lugs: 13, speed: 2, holes: 5 };
const REAR_Y = GROUND - REAR.r - REAR.lug;

const arc = (cx: number, cy: number, r: number, from: number, to: number, n = 24): Pt[] =>
  Array.from({ length: n + 1 }, (_, i) => polar(cx, cy, r, from + ((to - from) * i) / n));

const eye = (x: number, y: number): Shape[] => [
  { d: ellipse(x, y, 9.5, 12.5), kind: 'feature', fill: 'eye' },
  { d: circle(x + 3.3, y - 4.6, 3.8), kind: 'feature', fill: 'shine' },
  { d: circle(x - 3.2, y + 5.4, 1.7), kind: 'feature', fill: 'shine' },
];

const puff = (id: string, x: number, y: number, r: number, phase: number): PartNode => ({
  id,
  role: 'sparkle',
  phase,
  pivot: [x, y],
  shapes: [{ d: scallop(x, y, r, 6, r * 0.32, 15), fill: 'smoke' }],
});

const tractor: AnimalDef = {
  id: 'tractor',
  name: 'Tractor',
  kind: 'object',
  aliases: ['farm tractor', 'farm machine', 'plow', 'plough'],
  group: 'vehicle',
  habitats: ['vehicles', 'farm'],
  box: [330, 250],
  size: 220,
  locomotion: 'drive',
  gait: { period: 1.8, stride: Math.PI * 2 * (REAR.r + REAR.lug) },
  sound: 'tractor',
  palette: {
    body: '#5cbf4b',
    bodyDark: '#3f9c3c',
    trim: '#ffd23f',
    roof: '#ffd23f',
    glass: '#c4ecff',
    tire: '#4a4658',
    tireDark: '#3b3748',
    rim: '#ffd23f',
    rimLight: '#ffe682',
    rimDark: '#c98f1c',
    metal: '#7d8396',
    chassis: '#5a5f70',
    headlight: '#fff3b0',
    smoke: '#f3f1ee',
  },
  parts: [
    {
      id: 'chassis',
      shapes: [
        { d: roundRect(112, 178, 180, 26, 10), fill: 'chassis' },
        { d: roundRect(240, 196, 44, 18, 8), fill: 'chassis' },
      ],
    },
    {
      id: 'body',
      pivot: [180, GROUND],
      motion: { y: -1.2, freq: 3, wave: 'abs' },
      children: [
        {
          id: 'stack',
          behind: true,
          shapes: [
            { d: capsule(234, 130, 234, 74, 6), fill: 'metal' },
            {
              d: roundPoly(
                [
                  [226, 74],
                  [244, 70],
                  [244, 80],
                  [226, 82],
                ],
                3,
              ),
              fill: 'metal',
            },
          ],
          children: [puff('puffA', 242, 52, 11, 0), puff('puffB', 222, 32, 8, 0.25)],
        },
        {
          id: 'cab',
          shapes: [
            {
              d: roundPoly(
                [
                  [56, 40],
                  [170, 40],
                  [184, 150],
                  [56, 150],
                ],
                14,
              ),
              fill: 'body',
            },
          ],
          children: [
            {
              id: 'roof',
              shapes: [{ d: roundRect(44, 24, 146, 20, 10), fill: 'roof' }],
            },
            {
              id: 'glass',
              shapes: [
                {
                  d: roundPoly(
                    [
                      [70, 54],
                      [160, 54],
                      [170, 116],
                      [70, 116],
                    ],
                    12,
                  ),
                  fill: 'glass',
                },
                {
                  d: 'M82 66Q78 82 80 98',
                  kind: 'line',
                  stroke: 'white',
                  width: 4.5,
                  opacity: 0.8,
                },
                { d: ellipse(116, 104, 7.5, 4.5), kind: 'feature', fill: 'blush', opacity: 0.6 },
                { d: ellipse(160, 104, 7.5, 4.5), kind: 'feature', fill: 'blush', opacity: 0.6 },
                ...eye(126, 84),
                ...eye(152, 84),
              ],
            },
          ],
        },
        {
          id: 'hood',
          shapes: [
            {
              d: roundPoly(
                [
                  [170, 124],
                  [296, 124],
                  [306, 136],
                  [306, 196],
                  [170, 196],
                ],
                16,
              ),
              fill: 'body',
            },
            { d: roundRect(160, 138, 160, 7, 3.5), kind: 'detail', fill: 'trim' },
            { d: roundRect(196, 158, 70, 5, 2.5), kind: 'detail', fill: 'bodyDark' },
            { d: roundRect(196, 170, 70, 5, 2.5), kind: 'detail', fill: 'bodyDark' },
            { d: ellipse(301, 152, 6.5, 9), kind: 'feature', fill: 'headlight', stroke: 'auto' },
            {
              d: 'M281 166Q292 170 304 165Q303 181 292 182Q282 181 281 166Z',
              kind: 'feature',
              fill: 'mouth',
            },
            { d: ellipse(292.5, 177.5, 6, 3.2), kind: 'feature', fill: 'tongue' },
          ],
        },
        {
          id: 'fender',
          shapes: [
            { d: tube(arc(REAR.x, REAR_Y, REAR.r + REAR.lug + 11, -78, 78), 7.5), fill: 'body' },
          ],
        },
      ],
    },
    wheel(REAR),
    wheel(FRONT),
  ],
};

export default tractor;
