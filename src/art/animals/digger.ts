import {
  capsule,
  circle,
  ellipse,
  f,
  rotatePath,
  roundRect,
  smooth,
  tube,
  type Pt,
} from '../core/paths';
import type { AnimalDef, PartNode, Shape } from '../core/types';

const X1 = 66;
const X2 = 206;
const TY = 229;
const R_IN = 26;
const BELT = 9;
const LUG = 5;
const LUGS = 25;
const STRIDE = 2 * Math.PI * R_IN;
const LOOP = 2 * (X2 - X1) + 2 * Math.PI * R_IN;

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

const loopAt = (s: number): { p: Pt; deg: number } => {
  const run = X2 - X1;
  const bend = Math.PI * R_IN;
  let t = ((s % LOOP) + LOOP) % LOOP;
  if (t < run) return { p: [X1 + t, TY - R_IN], deg: 0 };
  t -= run;
  if (t < bend) {
    const deg = (t / R_IN) * (180 / Math.PI);
    return { p: polar(X2, TY, R_IN, deg), deg };
  }
  t -= bend;
  if (t < run) return { p: [X2 - t, TY + R_IN], deg: 180 };
  t -= run;
  const deg = 180 + (t / R_IN) * (180 / Math.PI);
  return { p: polar(X1, TY, R_IN, deg), deg };
};

const trackShapes = (phase: number): Shape[] => {
  const out: Shape[] = [
    {
      d: roundRect(
        X1 - R_IN - BELT,
        TY - R_IN - BELT,
        X2 - X1 + 2 * (R_IN + BELT),
        2 * (R_IN + BELT),
        R_IN + BELT,
      ),
      fill: 'track',
    },
  ];
  const lugW = (LOOP / LUGS) * 0.55;
  for (let k = 0; k < LUGS; k++) {
    const { p, deg } = loopAt((k * LOOP) / LUGS + STRIDE * phase);
    const [cx, cy] = polar(p[0], p[1], BELT + LUG / 2 - 1, deg);
    out.push({
      d: rotatePath(roundRect(cx - lugW / 2, cy - (LUG + 2) / 2, lugW, LUG + 2, 2.2), deg, cx, cy),
      fill: 'track',
    });
    const [ix, iy] = polar(p[0], p[1], BELT / 2, deg);
    out.push({
      d: rotatePath(roundRect(ix - 1.2, iy - BELT / 2 - 2, 2.4, BELT + 4, 1.2), deg, ix, iy),
      kind: 'detail',
      fill: 'trackDark',
    });
  }
  return out;
};

const roller = (
  id: string,
  x: number,
  y: number,
  r: number,
  speed: number,
  holes: number,
): PartNode => {
  const hub: Shape[] = [];
  for (let i = 0; i < holes; i++) {
    const [hx, hy] = polar(x, y, r * 0.52, (360 * i) / holes);
    hub.push({
      d: circle(hx, hy, r * (holes > 3 ? 0.11 : 0.16)),
      kind: 'feature',
      fill: 'wheelDark',
    });
  }
  hub.push({ d: circle(x, y, r * 0.26), kind: 'feature', fill: 'hub', stroke: 'auto', width: 1.8 });
  return {
    id,
    shapes: [
      { d: circle(x, y, r), fill: 'wheel' },
      { d: circle(x, y, r * 0.74), kind: 'detail', fill: 'wheelLight' },
    ],
    children: [spinner(`${id}Spin`, [x, y], speed, { shapes: hub })],
  };
};

const eye = (x: number, y: number): Shape[] => [
  { d: ellipse(x, y, 9.5, 12.5), kind: 'feature', fill: 'eye' },
  { d: circle(x + 3.3, y - 4.6, 3.8), kind: 'feature', fill: 'shine' },
  { d: circle(x - 3.2, y + 5.4, 1.7), kind: 'feature', fill: 'shine' },
];

const BOOM_BASE: Pt = [184, 158];
const ELBOW: Pt = [272, 58];
const WRIST: Pt = [322, 160];

const bucket: PartNode = {
  id: 'bucket',
  pivot: WRIST,
  motion: { rotate: 9, freq: 0.5, phase: 0.35 },
  shapes: [
    {
      d: smooth([
        [314, 150],
        [338, 152],
        [354, 168],
        [358, 192],
        [348, 212],
        [326, 224],
        [298, 222],
        [302, 204],
        [310, 186],
        [312, 166],
      ]),
      fill: 'body',
    },
    { d: 'M340 166Q352 188 340 208', kind: 'line', stroke: 'bodyDark', width: 3.2 },
  ],
  children: [
    {
      id: 'teeth',
      behind: true,
      shapes: [
        {
          d: roundPoly(
            [
              [306, 190],
              [290, 196],
              [304, 204],
            ],
            3,
          ),
          fill: 'metal',
        },
        {
          d: roundPoly(
            [
              [303, 204],
              [287, 211],
              [301, 218],
            ],
            3,
          ),
          fill: 'metal',
        },
        {
          d: roundPoly(
            [
              [302, 216],
              [288, 226],
              [306, 225],
            ],
            3,
          ),
          fill: 'metal',
        },
      ],
    },
  ],
};

const stick: PartNode = {
  id: 'stick',
  pivot: ELBOW,
  motion: { rotate: 5, freq: 0.5, phase: 0.2 },
  shapes: [
    { d: tube([ELBOW, [300, 92], [316, 128], WRIST], (t) => 14 - 3 * t, 48), fill: 'body' },
    {
      d: circle(WRIST[0], WRIST[1], 6),
      kind: 'feature',
      fill: 'metal',
      stroke: 'auto',
      width: 1.8,
    },
  ],
  children: [bucket],
};

const boom: PartNode = {
  id: 'boom',
  pivot: BOOM_BASE,
  motion: { rotate: -3, freq: 0.5 },
  shapes: [
    { d: tube([BOOM_BASE, [214, 112], [244, 76], ELBOW], (t) => 18 - 4 * t, 48), fill: 'body' },
    {
      d: tube(
        [
          [196, 136],
          [222, 102],
          [248, 76],
        ],
        4,
        32,
      ),
      kind: 'detail',
      fill: 'metal',
    },
    {
      d: circle(ELBOW[0], ELBOW[1], 7),
      kind: 'feature',
      fill: 'metal',
      stroke: 'auto',
      width: 1.8,
    },
  ],
  children: [stick],
};

const digger: AnimalDef = {
  id: 'digger',
  name: 'Digger',
  kind: 'object',
  aliases: ['excavator', 'bulldozer', 'construction', 'backhoe'],
  group: 'vehicle',
  habitats: ['vehicles'],
  box: [360, 270],
  size: 260,
  locomotion: 'drive',
  gait: { period: 1.1, stride: STRIDE },
  sound: 'digger',
  palette: {
    body: '#ffc531',
    bodyDark: '#e09f1a',
    glass: '#c4ecff',
    track: '#4a4658',
    trackDark: '#3a3647',
    frame: '#5d6072',
    wheel: '#8b8899',
    wheelLight: '#a9a6b6',
    wheelDark: '#5d5a6b',
    hub: '#ffd75e',
    metal: '#9aa0b1',
    beacon: '#ff9a2e',
    beaconGlow: '#ffd36b',
  },
  parts: [
    {
      id: 'track',
      frames: trackShapes,
    },
    {
      id: 'frame',
      shapes: [{ d: roundRect(X1 - 4, TY - 16, X2 - X1 + 8, 30, 14), fill: 'frame' }],
    },
    roller('idler', X1, TY, 24, 1, 3),
    roller('sprocket', X2, TY, 24, 1, 3),
    roller('rollerA', 114, TY + R_IN - 13, 12, 2, 5),
    roller('rollerB', 158, TY + R_IN - 13, 12, 2, 5),
    {
      id: 'upper',
      pivot: [150, 190],
      shapes: [
        { d: roundRect(90, 178, 120, 16, 6), fill: 'frame' },
        {
          d: roundPoly(
            [
              [26, 118],
              [120, 118],
              [200, 124],
              [200, 184],
              [26, 184],
            ],
            22,
          ),
          fill: 'body',
        },
        { d: roundRect(40, 140, 50, 5, 2.5), kind: 'detail', fill: 'bodyDark' },
        { d: roundRect(40, 152, 50, 5, 2.5), kind: 'detail', fill: 'bodyDark' },
        { d: roundRect(40, 164, 50, 5, 2.5), kind: 'detail', fill: 'bodyDark' },
      ],
      children: [
        {
          id: 'exhaust',
          behind: true,
          shapes: [{ d: capsule(60, 122, 60, 92, 5.5), fill: 'metal' }],
        },
        boom,
        {
          id: 'cab',
          shapes: [
            {
              d: roundPoly(
                [
                  [104, 40],
                  [176, 40],
                  [196, 62],
                  [196, 184],
                  [104, 184],
                ],
                16,
              ),
              fill: 'body',
            },
          ],
          children: [
            {
              id: 'beacon',
              role: 'sparkle',
              behind: true,
              pivot: [139, 36],
              shapes: [
                {
                  d: roundPoly(
                    [
                      [127, 44],
                      [129, 26],
                      [149, 26],
                      [151, 44],
                    ],
                    7,
                  ),
                  fill: 'beacon',
                },
                { d: ellipse(134, 32, 2.8, 4.4), kind: 'feature', fill: 'beaconGlow' },
              ],
            },
            {
              id: 'glass',
              shapes: [
                {
                  d: roundPoly(
                    [
                      [116, 54],
                      [172, 54],
                      [184, 68],
                      [184, 126],
                      [116, 126],
                    ],
                    12,
                  ),
                  fill: 'glass',
                },
                {
                  d: 'M126 64Q122 80 124 96',
                  kind: 'line',
                  stroke: 'white',
                  width: 4.5,
                  opacity: 0.8,
                },
                { d: ellipse(140, 114, 7, 4.2), kind: 'feature', fill: 'blush', opacity: 0.6 },
                { d: ellipse(180, 114, 7, 4.2), kind: 'feature', fill: 'blush', opacity: 0.6 },
                ...eye(148, 92),
                ...eye(173, 92),
              ],
            },
            {
              id: 'mouth',
              shapes: [
                {
                  d: 'M146 146Q160 151 176 145Q175 164 161 165Q147 164 146 146Z',
                  kind: 'feature',
                  fill: 'mouth',
                },
                { d: ellipse(161.5, 159.5, 7, 3.6), kind: 'feature', fill: 'tongue' },
              ],
            },
          ],
        },
      ],
    },
  ],
};

export default digger;
