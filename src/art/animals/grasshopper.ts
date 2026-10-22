import { capsule, circle, curve, ellipse, smooth, tube, type Pt } from '../core/paths';
import type { AnimalDef, PartNode, Shape } from '../core/types';

const GROUND = 180;
const AIR = 0.62;
const HIP: Pt = [172, 122];
const FEMUR = 86;
const TIBIA = 110;
const FEMUR_REST = -146;
const FEMUR_KICK = -166;
const TIBIA_REST = 68.6;
const TIBIA_KICK = 142;

const ease = (x: number) => {
  const c = Math.min(1, Math.max(0, x));
  return c * c * (3 - 2 * c);
};
const lerp = (a: number, b: number, k: number) => a + (b - a) * k;
const rad = (deg: number) => (deg * Math.PI) / 180;

function kick(phase: number): number {
  const p = phase - Math.floor(phase);
  if (p >= AIR) return 0;
  const t = p / AIR;
  return t < 0.5 ? ease(t / 0.22) : ease((1 - t) / 0.34);
}

function hindJoints(phase: number, ox: number, oy: number): [Pt, Pt, Pt, Pt] {
  const k = kick(phase);
  const hip: Pt = [HIP[0] + ox, HIP[1] + oy];
  const fa = rad(lerp(FEMUR_REST, FEMUR_KICK, k));
  const knee: Pt = [hip[0] + FEMUR * Math.cos(fa), hip[1] + FEMUR * Math.sin(fa)];
  const ta = rad(lerp(TIBIA_REST, TIBIA_KICK, k));
  const foot: Pt = [knee[0] + TIBIA * Math.cos(ta), knee[1] + TIBIA * Math.sin(ta)];
  const toeA = rad(lerp(4, 150, k));
  const toe: Pt = [foot[0] + 18 * Math.cos(toeA), foot[1] + 18 * Math.sin(toeA) * 0.3];
  return [hip, knee, foot, toe];
}

const hindLeg = (id: string, far: boolean): PartNode => {
  const [ox, oy] = far ? [12, -5] : [0, 0];
  const fill = far ? 'legFar' : 'leg';
  return {
    id,
    role: id,
    behind: far,
    pivot: [HIP[0] + ox, HIP[1] + oy],
    motion: null,
    frames: (phase) => {
      const [hip, knee, foot, toe] = hindJoints(phase, ox, oy);
      const along = (t: number, side: number): Pt => {
        const dx = knee[0] - hip[0];
        const dy = knee[1] - hip[1];
        const len = Math.hypot(dx, dy);
        return [hip[0] + dx * t + (-dy / len) * side, hip[1] + dy * t + (dx / len) * side];
      };
      const chevrons: Shape[] = far
        ? []
        : [0.3, 0.46, 0.62].map((t) => ({
            d: tube([along(t - 0.07, 9), along(t, 0), along(t - 0.07, -9)], 1.6, 12),
            kind: 'detail' as const,
            fill: 'stripe',
          }));
      return [
        { d: tube([knee, foot], (t) => 4.4 - 1 * t, 24), fill },
        { d: capsule(foot[0], foot[1], toe[0], toe[1], 3.6, 3), fill },
        { d: circle(toe[0], toe[1], 4), fill },
        {
          d: tube(
            [hip, along(0.4, -2), knee],
            (t) => lerp(12.5, 6, t) + 4 * Math.sin(Math.PI * Math.min(1, t * 1.4)),
            30,
          ),
          fill,
        },
        { d: circle(knee[0], knee[1], 6.6), fill },
        ...chevrons,
        ...(far
          ? []
          : [
              {
                d: ellipse(along(0.35, -5)[0], along(0.35, -5)[1], 12, 4, -30),
                kind: 'detail' as const,
                fill: 'bodyHi',
              },
            ]),
      ];
    },
  };
};

const shortLeg = (id: string, hip: Pt, knee: Pt, foot: Pt, far: boolean): PartNode => {
  const fill = far ? 'legFar' : 'leg';
  return {
    id,
    role: id,
    behind: true,
    pivot: hip,
    shapes: [
      { d: tube([hip, knee], (t) => 5 - 0.6 * t, 14), fill },
      { d: tube([knee, foot], (t) => 4.2 - 0.8 * t, 14), fill },
      { d: circle(knee[0], knee[1], 4.6), fill },
      { d: capsule(foot[0], foot[1], foot[0] + 9, foot[1] + 0.5, 3.6, 3), fill },
    ],
  };
};

const shift = (p: Pt, dx: number, dy: number): Pt => [p[0] + dx, p[1] + dy];

const FRONT: [Pt, Pt, Pt] = [
  [210, 128],
  [226, 150],
  [220, GROUND - 3.6],
];
const MIDDLE: [Pt, Pt, Pt] = [
  [194, 130],
  [196, 154],
  [184, GROUND - 3.6],
];

const antenna = (id: string, pts: Pt[], far: boolean): PartNode => ({
  id,
  role: 'ear',
  behind: true,
  pivot: pts[0],
  phase: far ? 0.1 : 0,
  shapes: [
    { d: tube(pts, (t) => 3.6 - 1.2 * t, 30), fill: far ? 'legFar' : 'leg' },
    {
      d: circle(pts[pts.length - 1][0], pts[pts.length - 1][1], 3.4),
      fill: far ? 'legFar' : 'leg',
    },
  ],
});

const vein = (pts: Pt[]): Shape => ({ d: tube(pts, 1.4, 20), kind: 'detail', fill: 'vein' });

const grasshopper: AnimalDef = {
  id: 'grasshopper',
  name: 'Grasshopper',
  kind: 'animal',
  aliases: ['hopper', 'locust', 'green grasshopper', 'grass hopper'],
  group: 'bug',
  habitats: ['bugs'],
  box: [300, 180],
  size: 70,
  locomotion: 'hop',
  gait: { period: 0.95, stride: 190, lift: 62 },
  sound: 'grasshopper',
  palette: {
    body: '#88d24b',
    bodyHi: '#bdeb86',
    belly: '#d4f08a',
    plate: '#7cc544',
    wing: '#63b23b',
    vein: '#4f9a2d',
    leg: '#7cc845',
    legFar: '#58a031',
    stripe: '#5ba634',
    head: '#93d855',
  },
  parts: [
    {
      id: 'body',
      role: 'body',
      pivot: [170, 150],
      shapes: [
        {
          d: smooth([
            [26, 114],
            [40, 102],
            [80, 97],
            [130, 95],
            [176, 95],
            [198, 106],
            [200, 124],
            [184, 136],
            [130, 139],
            [80, 133],
            [42, 124],
          ]),
          fill: 'body',
        },
        { d: ellipse(118, 140, 92, 12, -2), kind: 'detail', fill: 'belly' },
        ...[62, 86, 110, 134].map((x): Shape => ({
          d: tube(
            [
              [x, 102],
              [x - 3, 120],
              [x - 1, 140],
            ],
            1.5,
            14,
          ),
          kind: 'detail',
          fill: 'stripe',
        })),
      ],
      children: [
        hindLeg('legBF', true),
        shortLeg(
          'legFF',
          shift(FRONT[0], 8, -3),
          shift(FRONT[1], 8, -3),
          shift(FRONT[2], 8, -5),
          true,
        ),
        shortLeg(
          'legFF2',
          shift(MIDDLE[0], 8, -3),
          shift(MIDDLE[1], 8, -3),
          shift(MIDDLE[2], 8, -5),
          true,
        ),
        shortLeg('legFN2', ...MIDDLE, false),
        shortLeg('legFN', ...FRONT, false),
        {
          id: 'wing',
          pivot: [190, 100],
          shapes: [
            {
              d: smooth([
                [194, 96],
                [150, 84],
                [96, 82],
                [44, 88],
                [16, 100],
                [36, 109],
                [96, 107],
                [154, 104],
              ]),
              fill: 'wing',
            },
            vein([
              [186, 96],
              [120, 92],
              [40, 97],
            ]),
            vein([
              [170, 101],
              [110, 100],
              [50, 103],
            ]),
            { d: ellipse(120, 88, 34, 3.6, -3), kind: 'detail', fill: 'bodyHi' },
          ],
        },
        {
          id: 'plate',
          pivot: [196, 110],
          shapes: [
            {
              d: smooth([
                [170, 92],
                [196, 82],
                [218, 86],
                [226, 104],
                [220, 128],
                [200, 138],
                [178, 134],
                [170, 112],
              ]),
              fill: 'plate',
            },
            { d: ellipse(196, 92, 16, 5, -10), kind: 'detail', fill: 'bodyHi' },
          ],
        },
        hindLeg('legBN', false),
        {
          id: 'head',
          role: 'head',
          pivot: [222, 112],
          shapes: [
            {
              d: smooth([
                [214, 98],
                [220, 66],
                [244, 52],
                [270, 56],
                [286, 80],
                [288, 108],
                [276, 132],
                [252, 140],
                [228, 132],
              ]),
              fill: 'head',
            },
            { d: ellipse(236, 66, 13, 6, -36), kind: 'detail', fill: 'bodyHi' },
            { d: ellipse(256, 132, 22, 10), kind: 'detail', fill: 'belly' },
            { d: ellipse(236, 112, 7.6, 5), kind: 'feature', fill: 'blush', opacity: 0.75 },
            { d: ellipse(284, 108, 5, 4.2), kind: 'feature', fill: 'blush', opacity: 0.75 },
            { d: circle(248, 90, 12.6), kind: 'feature', fill: 'eye' },
            { d: circle(274, 88, 10.6), kind: 'feature', fill: 'eye' },
            { d: circle(252.6, 85.2, 4.8), kind: 'feature', fill: 'shine' },
            { d: circle(278, 83.8, 4), kind: 'feature', fill: 'shine' },
            { d: circle(244.4, 95, 2.1), kind: 'feature', fill: 'shine' },
            { d: curve(254, 118, 270, 117, 5.5), kind: 'line', stroke: 'mouth', width: 3 },
          ],
          children: [
            antenna(
              'antennaF',
              [
                [258, 58],
                [254, 30],
                [236, 12],
                [208, 6],
              ],
              true,
            ),
            antenna(
              'antennaN',
              [
                [244, 58],
                [236, 32],
                [214, 16],
                [184, 12],
              ],
              false,
            ),
          ],
        },
      ],
    },
  ],
};

export default grasshopper;
