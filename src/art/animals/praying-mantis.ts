import { capsule, circle, curve, ellipse, scalePath, smooth, tube, type Pt } from '../core/paths';
import type { AnimalDef, PartNode, Shape } from '../core/types';

const GROUND = 262;
const STRIDE = 40;
const DUTY = 0.75;
const SHIFT = STRIDE * DUTY;
const LIFT = 13;
const FOOT_R = 3.4;

const frac = (v: number) => v - Math.floor(v);

function footAt(rest: Pt, offset: number, phase: number): Pt {
  const p = frac(phase + offset);
  const [x, y] = rest;
  if (p < DUTY) return [x + SHIFT / 2 - SHIFT * (p / DUTY), y];
  const q = (p - DUTY) / (1 - DUTY);
  const e = q * q * (3 - 2 * q);
  return [x - SHIFT / 2 + SHIFT * e, y - LIFT * Math.sin(Math.PI * q)];
}

function kneeOf(hip: Pt, foot: Pt, a: number, b: number, bend: 1 | -1): Pt {
  const dx = foot[0] - hip[0];
  const dy = foot[1] - hip[1];
  const d = Math.min(a + b - 0.01, Math.max(Math.abs(a - b) + 0.01, Math.hypot(dx, dy)));
  const base = Math.atan2(dy, dx);
  const cos = (a * a + d * d - b * b) / (2 * a * d);
  const ang = base + bend * Math.acos(Math.max(-1, Math.min(1, cos)));
  return [hip[0] + a * Math.cos(ang), hip[1] + a * Math.sin(ang)];
}

interface LegSpec {
  n: number;
  hip: Pt;
  foot: Pt;
  femur: number;
  tibia: number;
  bend: 1 | -1;
  offset: number;
}

const leg = (spec: LegSpec, far: boolean): PartNode => {
  const fill = far ? 'legFar' : 'leg';
  const id = `leg${spec.n}${far ? 'F' : 'N'}`;
  const dir = spec.foot[0] >= spec.hip[0] ? 1 : -1;
  return {
    id,
    role: id,
    pivot: spec.hip,
    motion: null,
    frames: (phase) => {
      const f = footAt(spec.foot, spec.offset, phase);
      const k = kneeOf(spec.hip, f, spec.femur, spec.tibia, spec.bend);
      return [
        { d: capsule(spec.hip[0], spec.hip[1], k[0], k[1], 4.8, 4), fill },
        { d: capsule(k[0], k[1], f[0], f[1], 4, FOOT_R), fill },
        { d: capsule(f[0], f[1], f[0] + 8 * dir, f[1] + 0.4, FOOT_R, 2.4), fill },
      ];
    },
  };
};

const NEAR: LegSpec[] = [
  {
    n: 1,
    hip: [190, 206],
    foot: [228, GROUND - FOOT_R],
    femur: 40,
    tibia: 44,
    bend: -1,
    offset: 0,
  },
  {
    n: 2,
    hip: [176, 210],
    foot: [126, GROUND - FOOT_R],
    femur: 42,
    tibia: 48,
    bend: 1,
    offset: 0.5,
  },
];

const FAR: LegSpec[] = NEAR.map((l) => ({
  ...l,
  hip: [l.hip[0] - 6, l.hip[1] - 4] as Pt,
  foot: [l.foot[0] - 12, l.foot[1] - 7] as Pt,
  offset: (l.offset + 0.25) % 1,
}));

const arm = (id: string, far: boolean): PartNode => {
  const dx = far ? -10 : 0;
  const dy = far ? -3 : 0;
  const m = (p: Pt): Pt => [p[0] + dx, p[1] + dy];
  const fill = far ? 'legFar' : 'green';
  const shoulder = m([206, 160]);
  const elbow = m([222, 184]);
  const wrist = m([252, 142]);
  const hand = m([241, 170]);
  const shapes: Shape[] = [
    { d: capsule(...shoulder, ...elbow, 7.4, 6.8), fill },
    { d: capsule(...elbow, ...wrist, 8.4, 6.6), fill },
    { d: capsule(...wrist, ...hand, 5.8, 4.6), fill },
    { d: capsule(...hand, ...m([250, 178]), 3.8, 2.8), fill },
  ];
  if (!far) {
    shapes.push({
      d: capsule(...m([226, 175]), ...m([247, 146]), 2.6, 2.2),
      kind: 'detail',
      fill: 'greenLight',
    });
  }
  return {
    id,
    role: far ? 'clawF' : 'clawN',
    behind: far,
    pivot: shoulder,
    shapes,
  };
};

const antenna = (id: string, pts: Pt[], far: boolean): PartNode => ({
  id,
  role: 'antenna',
  phase: far ? 0.35 : 0,
  behind: true,
  pivot: pts[0],
  shapes: [{ d: tube(pts, (t) => 2.6 - 1 * t, 40), fill: far ? 'legFar' : 'green' }],
});

const HEAD_C: Pt = [238, 122];
const HEAD_K = 1.3;
const big = (shapes: Shape[]): Shape[] =>
  shapes.map((sh) => ({ ...sh, d: scalePath(sh.d, HEAD_K, HEAD_K, HEAD_C[0], HEAD_C[1]) }));

const mantis: AnimalDef = {
  id: 'praying-mantis',
  name: 'Praying Mantis',
  kind: 'animal',
  aliases: ['mantis', 'mantid', 'praying mantid', 'green mantis', 'bug'],
  group: 'bug',
  habitats: ['bugs'],
  box: [312, GROUND],
  size: 90,
  locomotion: 'crawl',
  gait: { period: 1.3, stride: STRIDE },
  sound: 'praying-mantis',
  palette: {
    green: '#66cf6c',
    greenDark: '#4cae55',
    greenLight: '#aeefa6',
    leg: '#5ec466',
    legFar: '#44a24d',
    wing: '#96e28f',
    wingLight: '#c4f5bd',
    vein: '#72c56f',
    bulb: '#e6f994',
    belly: '#8edc8a',
    cheek: '#ffa0b4',
  },
  parts: [
    ...FAR.map((l) => leg(l, true)),
    {
      id: 'body',
      role: 'body',
      pivot: [176, 214],
      shapes: [
        {
          d: tube(
            [
              [190, 206],
              [156, 214],
              [112, 214],
              [72, 206],
              [40, 190],
            ],
            (t) => 15 - 5 * t + 3 * Math.sin(Math.PI * t),
            48,
          ),
          fill: 'green',
        },
        { d: ellipse(120, 226, 60, 6, 2), kind: 'detail', fill: 'belly' },
        { d: ellipse(150, 214, 2.4, 16, -6), kind: 'detail', fill: 'greenDark' },
        { d: ellipse(124, 216, 2.4, 17, -4), kind: 'detail', fill: 'greenDark' },
        { d: ellipse(98, 214, 2.4, 16, 6), kind: 'detail', fill: 'greenDark' },
        { d: ellipse(74, 207, 2.2, 14, 16), kind: 'detail', fill: 'greenDark' },
      ],
      children: [
        arm('armF', true),
        {
          id: 'wings',
          pivot: [180, 198],
          shapes: [
            {
              d: smooth([
                [184, 196],
                [156, 190],
                [116, 190],
                [76, 192],
                [46, 186],
                [62, 202],
                [104, 208],
                [150, 206],
              ]),
              fill: 'wing',
            },
            { d: ellipse(126, 194, 44, 3.6, -1), kind: 'detail', fill: 'wingLight' },
            {
              d: tube(
                [
                  [178, 200],
                  [130, 199],
                  [84, 198],
                  [56, 192],
                ],
                1.4,
                30,
              ),
              kind: 'detail',
              fill: 'vein',
            },
          ],
        },
        {
          id: 'neck',
          pivot: [190, 200],
          motion: { rotate: 2.5, phase: 0.1 },
          shapes: [
            {
              d: tube(
                [
                  [184, 204],
                  [198, 178],
                  [212, 148],
                  [228, 116],
                ],
                (t) => 9 - 2 * t,
                40,
              ),
              fill: 'green',
            },
            {
              d: tube(
                [
                  [190, 198],
                  [202, 174],
                  [214, 148],
                  [226, 122],
                ],
                2,
                30,
              ),
              kind: 'detail',
              fill: 'greenLight',
            },
          ],
          children: [
            {
              id: 'head',
              role: 'head',
              pivot: [232, 118],
              shapes: big([
                {
                  d: smooth([
                    [206, 74],
                    [238, 64],
                    [270, 70],
                    [264, 92],
                    [250, 114],
                    [240, 126],
                    [230, 114],
                    [214, 94],
                  ]),
                  fill: 'green',
                },
                { d: circle(210, 76, 16.5), fill: 'green' },
                { d: circle(266, 74, 16.5), fill: 'green' },
                { d: circle(210, 76, 13.6), kind: 'detail', fill: 'bulb' },
                { d: circle(266, 74, 13.6), kind: 'detail', fill: 'bulb' },
                { d: ellipse(238, 110, 9, 6), kind: 'detail', fill: 'greenLight' },
                { d: circle(211.5, 78, 9.6), kind: 'feature', fill: 'eye' },
                { d: circle(265, 76, 9.6), kind: 'feature', fill: 'eye' },
                { d: circle(215, 74.4, 3.6), kind: 'feature', fill: 'shine' },
                { d: circle(268.5, 72.4, 3.6), kind: 'feature', fill: 'shine' },
                { d: circle(209, 82, 1.6), kind: 'feature', fill: 'shine' },
                { d: circle(262.5, 80, 1.6), kind: 'feature', fill: 'shine' },
                { d: ellipse(222, 98, 6.4, 4), kind: 'feature', fill: 'cheek', opacity: 0.9 },
                { d: ellipse(256, 96, 6.4, 4), kind: 'feature', fill: 'cheek', opacity: 0.9 },
                { d: curve(233, 103, 245, 103, 4.6), kind: 'line', stroke: 'mouth', width: 2.6 },
              ]),
              children: [
                antenna(
                  'antennaF',
                  [
                    [230, 52],
                    [220, 34],
                    [204, 18],
                    [188, 12],
                  ],
                  true,
                ),
                antenna(
                  'antennaN',
                  [
                    [246, 51],
                    [258, 32],
                    [276, 18],
                    [292, 13],
                  ],
                  false,
                ),
              ],
            },
            arm('armN', false),
          ],
        },
      ],
    },
    ...NEAR.map((l) => leg(l, false)),
  ],
};

export default mantis;
