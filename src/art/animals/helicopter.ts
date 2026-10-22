import { capsule, circle, ellipse, f, leaf, roundRect, smooth, tube, type Pt } from '../core/paths';
import type { AnimalDef, PartNode, Shape } from '../core/types';

const MAST: Pt = [226, 40];
const ROTOR = 150;
const TILT = 0.07;
const TAIL: Pt = [38, 74];
const SPINS = 3;

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

const spinner = (id: string, pivot: Pt, speed: number, leafPart: Partial<PartNode>): PartNode => {
  let node: PartNode = { ...leafPart, id: `${id}${speed}`, role: 'spinner', pivot };
  for (let k = speed - 1; k >= 1; k--) {
    node = { id: `${id}${k}`, role: 'spinner', pivot, children: [node] };
  }
  return node;
};

const eye = (x: number, y: number): Shape[] => [
  { d: ellipse(x, y, 10, 13), kind: 'feature', fill: 'eye' },
  { d: circle(x + 3.5, y - 4.8, 4), kind: 'feature', fill: 'shine' },
  { d: circle(x - 3.4, y + 5.6, 1.8), kind: 'feature', fill: 'shine' },
];

const blade = (angle: number): Shape | null => {
  const reach = Math.cos(angle);
  const tip: Pt = [MAST[0] + ROTOR * reach, MAST[1] + ROTOR * TILT * Math.sin(angle)];
  if (Math.abs(reach) < 0.08) return null;
  return { d: capsule(MAST[0], MAST[1], tip[0], tip[1], 6, 4.5), fill: 'blade' };
};

const rotorShapes = (phase: number): Shape[] => {
  const theta = 2 * Math.PI * SPINS * phase;
  const out: Shape[] = [];
  const angles = [0, 1, 2, 3].map((k) => theta + (k * Math.PI) / 2);
  const far = angles.filter((a) => Math.sin(a) < 0);
  const near = angles.filter((a) => Math.sin(a) >= 0);
  for (const a of [...far, ...near]) {
    const s = blade(a);
    if (s) out.push(s);
  }
  out.push({ d: ellipse(MAST[0], MAST[1], 14, 7), fill: 'hub' });
  return out;
};

const BODY: Pt[] = [
  [150, 100],
  [190, 74],
  [254, 66],
  [312, 76],
  [348, 106],
  [358, 142],
  [344, 172],
  [302, 188],
  [222, 190],
  [170, 178],
  [146, 144],
];

const helicopter: AnimalDef = {
  id: 'helicopter',
  name: 'Helicopter',
  kind: 'object',
  aliases: ['chopper', 'copter', 'heli', 'whirlybird'],
  group: 'vehicle',
  habitats: ['vehicles'],
  box: [400, 230],
  size: 220,
  locomotion: 'float',
  gait: { period: 1.8, stride: 80 },
  sound: 'helicopter',
  palette: {
    body: '#ef4d48',
    bodyDark: '#c93a37',
    stripe: '#fff3dc',
    glass: '#c4ecff',
    blade: '#4a4658',
    hub: '#6d7286',
    metal: '#7d8396',
    skid: '#5d6275',
    tailBlade: '#8d93a8',
    tip: '#ffd23f',
  },
  parts: [
    {
      id: 'heli',
      pivot: [250, 130],
      children: [
        {
          id: 'mast',
          shapes: [
            { d: capsule(MAST[0], MAST[1] + 4, MAST[0], 76, 6), fill: 'metal' },
            {
              d: roundPoly(
                [
                  [184, 80],
                  [200, 58],
                  [256, 58],
                  [270, 80],
                ],
                12,
              ),
              fill: 'body',
            },
          ],
        },
        {
          id: 'skids',
          behind: true,
          shapes: [
            { d: capsule(204, 182, 194, 212, 4.5), fill: 'skid' },
            { d: capsule(298, 182, 308, 212, 4.5), fill: 'skid' },
            {
              d: tube(
                [
                  [150, 214],
                  [250, 214],
                  [330, 214],
                  [350, 206],
                ],
                5.5,
                40,
              ),
              fill: 'skid',
            },
          ],
        },
        {
          id: 'boom',
          shapes: [
            {
              d: tube(
                [
                  [170, 118],
                  [110, 110],
                  [48, 98],
                ],
                (t) => 17 - 8 * t,
                40,
              ),
              fill: 'body',
            },
            {
              d: tube(
                [
                  [168, 112],
                  [110, 106],
                  [50, 96],
                ],
                3,
                40,
              ),
              kind: 'detail',
              fill: 'stripe',
            },
          ],
          children: [
            {
              id: 'fin',
              shapes: [
                {
                  d: smooth([
                    [22, 106],
                    [18, 74],
                    [28, 46],
                    [46, 46],
                    [58, 80],
                    [66, 104],
                  ]),
                  fill: 'bodyDark',
                },
              ],
            },
            {
              id: 'stabilizer',
              shapes: [
                {
                  d: roundPoly(
                    [
                      [70, 104],
                      [104, 110],
                      [100, 120],
                      [66, 116],
                    ],
                    5,
                  ),
                  fill: 'bodyDark',
                },
              ],
            },
            spinner('tailRotor', TAIL, SPINS, {
              shapes: [
                { d: leaf(TAIL[0], TAIL[1] - 3, 30, 6.5, -90), fill: 'tailBlade' },
                { d: leaf(TAIL[0], TAIL[1] + 3, 30, 6.5, 90), fill: 'tailBlade' },
                {
                  d: circle(TAIL[0], TAIL[1], 6.5),
                  kind: 'feature',
                  fill: 'tip',
                  stroke: 'auto',
                  width: 1.8,
                },
              ],
            }),
          ],
        },
        {
          id: 'cabin',
          shapes: [
            { d: smooth(BODY), fill: 'body' },
            { d: roundRect(130, 150, 240, 9, 4.5), kind: 'detail', fill: 'stripe' },
            { d: 'M140 176Q250 200 370 170L370 210L140 210Z', kind: 'detail', fill: 'bodyDark' },
            {
              d: 'M318 152Q330 156 343 151Q342 166 331 167Q319 166 318 152Z',
              kind: 'feature',
              fill: 'mouth',
            },
            { d: ellipse(331, 162.5, 5.5, 3), kind: 'feature', fill: 'tongue' },
          ],
          children: [
            {
              id: 'door',
              shapes: [
                {
                  d: roundPoly(
                    [
                      [196, 88],
                      [238, 84],
                      [240, 136],
                      [194, 136],
                    ],
                    12,
                  ),
                  fill: 'glass',
                },
                {
                  d: 'M204 96Q201 108 202 122',
                  kind: 'line',
                  stroke: 'white',
                  width: 4,
                  opacity: 0.8,
                },
              ],
            },
            {
              id: 'canopy',
              shapes: [
                {
                  d: smooth([
                    [254, 82],
                    [300, 82],
                    [334, 100],
                    [348, 128],
                    [340, 142],
                    [258, 142],
                  ]),
                  fill: 'glass',
                },
                {
                  d: 'M266 92Q261 106 263 122',
                  kind: 'line',
                  stroke: 'white',
                  width: 4.2,
                  opacity: 0.8,
                },
                { d: ellipse(282, 134, 6.5, 4), kind: 'feature', fill: 'blush', opacity: 0.6 },
                { d: ellipse(326, 134, 6.5, 4), kind: 'feature', fill: 'blush', opacity: 0.6 },
                ...eye(291, 113),
                ...eye(318, 113),
              ],
            },
          ],
        },
        {
          id: 'rotor',
          frames: rotorShapes,
        },
      ],
    },
  ],
};

export default helicopter;
