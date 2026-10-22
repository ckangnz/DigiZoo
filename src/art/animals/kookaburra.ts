import {
  capsule,
  circle,
  curve,
  ellipse,
  leaf,
  rotatePath,
  smooth,
  tube,
  type Pt,
} from '../core/paths';
import type { AnimalDef, PartNode, Shape } from '../core/types';

const SOLE = 286;
const HIP_Y = 232;
const STRIDE = 52;
const DUTY = 0.6;
const LIFT = 9;
const HEAD: Pt = [196, 104];
const GAPE: Pt = [232, 112];

const frac = (v: number) => v - Math.floor(v);

const tilt = (parts: PartNode[], deg: number, c: Pt): PartNode[] =>
  parts.map((p): PartNode => {
    const turn = (q: Pt): Pt => {
      const a = (deg * Math.PI) / 180;
      const dx = q[0] - c[0];
      const dy = q[1] - c[1];
      return [
        c[0] + dx * Math.cos(a) - dy * Math.sin(a),
        c[1] + dx * Math.sin(a) + dy * Math.cos(a),
      ];
    };
    return {
      ...p,
      pivot: p.pivot && turn(p.pivot),
      shapes: p.shapes?.map((s) => ({ ...s, d: rotatePath(s.d, deg, c[0], c[1]) })),
      children: p.children && tilt(p.children, deg, c),
    };
  });

const footAt = (x: number, offset: number, phase: number): { at: Pt; tilt: number } => {
  const p = frac(phase + offset);
  const shift = STRIDE * DUTY;
  if (p < DUTY) return { at: [x + shift / 2 - shift * (p / DUTY), SOLE], tilt: 0 };
  const q = (p - DUTY) / (1 - DUTY);
  const e = q * q * (3 - 2 * q);
  const up = Math.sin(Math.PI * q);
  return { at: [x - shift / 2 + shift * e, SOLE - LIFT * up], tilt: 14 * up * (1 - q) };
};

const leg = (id: string, x: number, far: boolean, offset: number): PartNode => {
  const fill = far ? 'legDark' : 'leg';
  return {
    id,
    role: id,
    pivot: [x, HIP_Y],
    motion: null,
    frames: (phase) => {
      const { at, tilt } = footAt(x, offset, phase);
      const [fx, fy] = at;
      const ax = fx;
      const ay = fy - 8;
      const foot = (d: string) => rotatePath(d, tilt, ax, ay);
      return [
        { d: capsule(x, HIP_Y - 16, ax, ay, 9, 6.5), fill },
        { d: foot(capsule(ax, ay, ax + 20, fy - 4, 4.6, 3.8)), fill },
        { d: foot(capsule(ax, ay, ax + 13, fy - 3.4, 4.4, 3.6)), fill },
        { d: foot(capsule(ax, ay, ax - 12, fy - 4, 4.4, 3.6)), fill },
        { d: foot(ellipse(ax, ay + 1, 6.5, 5.5)), fill },
      ];
    },
  };
};

const bar = (x: number, y: number, len: number, angle: number, fill: string, w = 2.6): Shape => ({
  d: leaf(x, y, len, w, angle),
  kind: 'detail',
  fill,
});

const BODY: Pt[] = [
  [176, 112],
  [222, 136],
  [240, 170],
  [234, 206],
  [208, 234],
  [168, 246],
  [128, 238],
  [100, 214],
  [92, 180],
  [104, 146],
  [136, 120],
];

const WING: Pt[] = [
  [196, 140],
  [204, 168],
  [192, 198],
  [164, 222],
  [126, 240],
  [92, 250],
  [80, 242],
  [96, 214],
  [120, 176],
  [150, 146],
];

const TAIL_BASE: Pt = [108, 222];

const tailShapes = (): Shape[] => {
  const angle = 192;
  const a = (angle * Math.PI) / 180;
  const at = (len: number): Pt => [
    TAIL_BASE[0] + Math.cos(a) * len,
    TAIL_BASE[1] + Math.sin(a) * len,
  ];
  const line: Pt[] = [TAIL_BASE, at(40), at(86)];
  const band = (len: number, fill: string): Shape => {
    const [x, y] = at(len);
    return { d: ellipse(x, y, 4, 20, angle), kind: 'detail', fill };
  };
  return [
    { d: tube(line, (t) => 13 + 5 * t, 40), fill: 'tail' },
    band(32, 'tailBar'),
    band(48, 'tailBar'),
    band(64, 'tailBar'),
    band(84, 'cream'),
  ];
};

const kookaburra: AnimalDef = {
  id: 'kookaburra',
  name: 'Kookaburra',
  kind: 'animal',
  aliases: ['laughing kookaburra', 'kookaburra bird', 'kingfisher', 'bird'],
  group: 'bird',
  habitats: ['aussie', 'birds'],
  box: [304, SOLE],
  size: 100,
  locomotion: 'walk2',
  gait: { period: 0.7, stride: STRIDE },
  sound: 'kookaburra',
  palette: {
    cream: '#f7efdd',
    belly: '#eee2c8',
    barLight: '#e2d2b0',
    brown: '#8b5e3c',
    brownDark: '#6e4529',
    wing: '#95653f',
    spot: '#d9c19a',
    blue: '#86c2e6',
    blueLight: '#b8e2f6',
    tail: '#c47a3e',
    tailBar: '#6b3f22',
    stripe: '#7a4f31',
    beak: '#3f3638',
    beakLow: '#eadcc0',
    beakLine: '#cdb994',
    mouth: '#d9606f',
    tongue: '#ff9aa8',
    leg: '#a8a19d',
    legDark: '#8d8682',
  },
  parts: [
    leg('legF', 150, true, 0.55),
    leg('legN', 178, false, 0.05),
    {
      id: 'body',
      role: 'body',
      pivot: [164, HIP_Y],
      shapes: [
        { d: smooth(BODY), fill: 'cream' },
        { d: ellipse(110, 160, 40, 60, 30), kind: 'detail', fill: 'brown' },
        { d: ellipse(204, 206, 40, 30, -30), kind: 'detail', fill: 'belly' },
        bar(214, 168, 14, 160, 'barLight'),
        bar(222, 190, 14, 160, 'barLight'),
        bar(208, 214, 14, 156, 'barLight'),
        bar(192, 230, 12, 150, 'barLight'),
      ],
      children: [
        {
          id: 'tail',
          role: 'tail',
          behind: true,
          pivot: TAIL_BASE,
          shapes: tailShapes(),
        },
        {
          id: 'wing',
          role: 'wingN',
          pivot: [184, 150],
          shapes: [
            { d: smooth(WING), fill: 'wing' },
            {
              d: smooth([
                [194, 150],
                [200, 166],
                [190, 184],
                [172, 198],
                [154, 204],
                [148, 194],
                [160, 178],
                [176, 160],
              ]),
              kind: 'detail',
              fill: 'blue',
            },
            { d: circle(186, 164, 2.6), kind: 'detail', fill: 'blueLight' },
            { d: circle(176, 178, 2.6), kind: 'detail', fill: 'blueLight' },
            { d: circle(164, 190, 2.4), kind: 'detail', fill: 'blueLight' },
            { d: circle(188, 178, 2.2), kind: 'detail', fill: 'blueLight' },
            { d: circle(194, 160, 2), kind: 'detail', fill: 'blueLight' },
            { d: circle(140, 204, 3.4), kind: 'detail', fill: 'spot' },
            { d: circle(124, 220, 3.2), kind: 'detail', fill: 'spot' },
            { d: circle(110, 232, 3), kind: 'detail', fill: 'spot' },
            { d: circle(156, 206, 3.2), kind: 'detail', fill: 'spot' },
            { d: circle(140, 224, 3), kind: 'detail', fill: 'spot' },
            { d: leaf(178, 198, 84, 2.6, 150), kind: 'detail', fill: 'brownDark' },
          ],
        },
        ...tilt(
          [
            {
              id: 'head',
              role: 'head',
              pivot: [188, 140],
              shapes: [
                { d: circle(HEAD[0], HEAD[1], 54), fill: 'cream' },
                {
                  d: ellipse(HEAD[0] - 18, HEAD[1] - 40, 46, 26, -24),
                  kind: 'detail',
                  fill: 'brown',
                },
                bar(HEAD[0] - 6, HEAD[1] - 26, 16, -10, 'brownDark', 2.2),
                bar(HEAD[0] - 30, HEAD[1] - 20, 16, -24, 'brownDark', 2.2),
                bar(HEAD[0] + 14, HEAD[1] - 36, 14, 6, 'brownDark', 2.2),
                {
                  d: tube(
                    [
                      [HEAD[0] + 22, HEAD[1] - 4],
                      [HEAD[0] - 4, HEAD[1] + 2],
                      [HEAD[0] - 34, HEAD[1] + 6],
                      [HEAD[0] - 60, HEAD[1] + 4],
                    ],
                    (t) => 9 + 4 * t,
                    40,
                  ),
                  kind: 'detail',
                  fill: 'stripe',
                },
                { d: circle(HEAD[0] + 16, HEAD[1] - 6, 14.5), kind: 'feature', fill: 'cream' },
                {
                  d: curve(HEAD[0] + 7, HEAD[1] - 3, HEAD[0] + 25, HEAD[1] - 3, -9),
                  kind: 'line',
                  stroke: 'eye',
                  width: 4.2,
                },
                {
                  d: ellipse(HEAD[0] + 18, HEAD[1] + 22, 9.5, 6),
                  kind: 'feature',
                  fill: 'blush',
                  opacity: 0.55,
                },
              ],
              children: [
                {
                  id: 'mouth',
                  pivot: GAPE,
                  shapes: [
                    {
                      d: smooth(
                        [
                          [GAPE[0] - 2, GAPE[1] - 4],
                          [GAPE[0] + 30, GAPE[1] - 24],
                          [GAPE[0] + 56, GAPE[1] - 30],
                          [GAPE[0] + 52, GAPE[1] - 18],
                          [GAPE[0] + 26, GAPE[1] - 6],
                        ],
                        true,
                        0.6,
                      ),
                      fill: 'mouth',
                    },
                    {
                      d: ellipse(GAPE[0] + 20, GAPE[1] - 14, 10, 4, -28),
                      kind: 'feature',
                      fill: 'tongue',
                    },
                  ],
                },
                {
                  id: 'jaw',
                  pivot: GAPE,
                  motion: { rotate: 9, freq: 3, wave: 'abs' },
                  shapes: [
                    {
                      d: smooth(
                        [
                          [GAPE[0] - 4, GAPE[1] - 2],
                          [GAPE[0] + 30, GAPE[1] - 10],
                          [GAPE[0] + 58, GAPE[1] - 16],
                          [GAPE[0] + 60, GAPE[1] - 10],
                          [GAPE[0] + 34, GAPE[1] + 2],
                          [GAPE[0] + 4, GAPE[1] + 10],
                        ],
                        true,
                        0.7,
                      ),
                      fill: 'beakLow',
                    },
                    {
                      d: curve(GAPE[0] + 8, GAPE[1] + 2, GAPE[0] + 50, GAPE[1] - 10, 2),
                      kind: 'line',
                      stroke: 'beakLine',
                      width: 2,
                    },
                  ],
                },
                {
                  id: 'beak',
                  pivot: GAPE,
                  shapes: [
                    {
                      d: smooth(
                        [
                          [GAPE[0] - 10, GAPE[1] - 26],
                          [GAPE[0] + 22, GAPE[1] - 48],
                          [GAPE[0] + 58, GAPE[1] - 62],
                          [GAPE[0] + 74, GAPE[1] - 64],
                          [GAPE[0] + 64, GAPE[1] - 52],
                          [GAPE[0] + 34, GAPE[1] - 32],
                          [GAPE[0] + 4, GAPE[1] - 8],
                        ],
                        true,
                        0.7,
                      ),
                      fill: 'beak',
                    },
                  ],
                },
              ],
            },
          ],
          -10,
          [188, 140],
        ),
      ],
    },
  ],
};

export default kookaburra;
