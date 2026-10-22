import { capsule, circle, curve, ellipse, scalePath, smooth, tube, type Pt } from '../core/paths';
import type { AnimalDef, PartNode, Shape } from '../core/types';

const GROUND = 190;
const STRIDE = 34;
const DUTY = 0.6;
const SHIFT = STRIDE * DUTY;
const LIFT = 12;
const FOOT_R = 3.6;

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
      const s: Pt = [k[0] + (f[0] - k[0]) * 0.5, k[1] + (f[1] - k[1]) * 0.5];
      return [
        { d: capsule(spec.hip[0], spec.hip[1], k[0], k[1], 6.2, 5.4), fill },
        { d: capsule(k[0], k[1], f[0], f[1], 5.2, FOOT_R), fill },
        { d: capsule(f[0], f[1], f[0] + 9 * dir, f[1] + 0.4, FOOT_R, 2.6), fill },
        { d: capsule(s[0], s[1], s[0] + 6 * dir, s[1] - 3.4, 2.4, 1.5), fill },
      ];
    },
  };
};

const NEAR: LegSpec[] = [
  {
    n: 1,
    hip: [196, 134],
    foot: [236, GROUND - FOOT_R],
    femur: 32,
    tibia: 36,
    bend: -1,
    offset: 0,
  },
  {
    n: 2,
    hip: [146, 144],
    foot: [162, GROUND - FOOT_R],
    femur: 24,
    tibia: 30,
    bend: -1,
    offset: 0.5,
  },
  { n: 3, hip: [104, 144], foot: [70, GROUND - FOOT_R], femur: 28, tibia: 34, bend: 1, offset: 0 },
];

const FAR: LegSpec[] = NEAR.map((l) => ({
  ...l,
  hip: [l.hip[0] - 8, l.hip[1] - 6] as Pt,
  foot: [l.foot[0] - 10, l.foot[1] - 8] as Pt,
  offset: (l.offset + 0.5) % 1,
}));

const jaw = (id: string, far: boolean): PartNode => {
  const dx = far ? 8 : 0;
  const dy = far ? -22 : 0;
  const m = (p: Pt): Pt => [p[0] + dx, p[1] + dy];
  const fill = far ? 'jawFar' : 'jaw';
  const beam: Pt[] = [m([262, 124]), m([288, 122]), m([310, 114]), m([324, 100]), m([329, 84])];
  const shapes: Shape[] = [
    { d: tube(beam, (t) => 8.2 - 3 * t, 48), fill },
    { d: capsule(...m([302, 118]), ...m([308, 101]), 4.8, 3.6), fill },
    { d: capsule(...m([328, 86]), ...m([333, 70]), 4.8, 3.8), fill },
    { d: capsule(...m([327, 88]), ...m([317, 76]), 4.4, 3.4), fill },
  ];
  if (!far) {
    shapes.push({
      d: tube([m([270, 119]), m([288, 117.5]), m([306, 110]), m([318, 98]), m([322, 88])], 1.9, 36),
      kind: 'detail',
      fill: 'jawLight',
    });
  }
  return {
    id,
    role: far ? 'clawF' : 'clawN',
    phase: far ? 0.5 : 0,
    behind: far,
    pivot: m([266, 122]),
    shapes,
  };
};

const antenna = (id: string, far: boolean): PartNode => {
  const dx = far ? -12 : 0;
  const dy = far ? -2 : 0;
  const m = (p: Pt): Pt => [p[0] + dx, p[1] + dy];
  const fill = far ? 'legFar' : 'leg';
  const elbow = m([258, 54]);
  return {
    id,
    role: 'antenna',
    phase: far ? 0.3 : 0,
    behind: true,
    pivot: m([254, 76]),
    shapes: [
      { d: capsule(...m([254, 76]), ...elbow, 3, 2.6), fill },
      { d: capsule(...elbow, ...m([272, 46]), 2.6, 2.4), fill },
      { d: ellipse(...m([276, 42]), 3.8, 6.2, 30), fill },
      { d: ellipse(...m([282, 46]), 3.4, 5.8, 40), fill },
      { d: ellipse(...m([287, 51]), 3, 5.2, 50), fill },
    ],
  };
};

const HEAD_C: Pt = [244, 106];
const big = (shapes: Shape[]): Shape[] =>
  shapes.map((sh) => ({ ...sh, d: scalePath(sh.d, 1.2, 1.2, HEAD_C[0], HEAD_C[1]) }));

const stagBeetle: AnimalDef = {
  id: 'stag-beetle',
  name: 'Stag Beetle',
  kind: 'animal',
  aliases: ['pinching bug', 'pincher beetle', 'antler beetle', 'beetle', 'bug'],
  group: 'bug',
  habitats: ['bugs'],
  box: [344, GROUND],
  size: 70,
  locomotion: 'crawl',
  gait: { period: 1, stride: STRIDE },
  sound: 'stag-beetle',
  palette: {
    shell: '#3d2619',
    shellDark: '#2c1a11',
    sheen: '#6f4831',
    sheenLight: '#b98a63',
    glint: '#f2dcc4',
    groove: '#57382a',
    leg: '#3a2418',
    legFar: '#271710',
    jaw: '#97492a',
    jawFar: '#6e3219',
    jawLight: '#d0855a',
    sclera: '#ffffff',
    smile: '#ffc9d2',
  },
  parts: [
    ...FAR.map((l) => leg(l, true)),
    {
      id: 'body',
      role: 'body',
      pivot: [128, 150],
      shapes: [
        {
          d: smooth([
            [44, 136],
            [48, 108],
            [66, 84],
            [96, 70],
            [132, 66],
            [164, 74],
            [184, 94],
            [188, 120],
            [178, 140],
            [146, 150],
            [102, 152],
            [64, 148],
          ]),
          fill: 'shell',
        },
        { d: ellipse(110, 84, 42, 9.5, -8), kind: 'detail', fill: 'sheen' },
        { d: ellipse(94, 84, 16, 4.2, -10), kind: 'detail', fill: 'sheenLight' },
        { d: circle(144, 79, 3), kind: 'detail', fill: 'sheenLight' },
        { d: ellipse(80, 86, 7, 2.6, -14), kind: 'detail', fill: 'glint' },
        { d: curve(52, 126, 184, 116, -14), kind: 'line', stroke: 'groove', width: 2.6 },
        { d: ellipse(118, 146, 66, 8.5), kind: 'detail', fill: 'shellDark' },
      ],
      children: [
        {
          id: 'pronotum',
          pivot: [198, 110],
          shapes: [
            {
              d: smooth([
                [176, 90],
                [196, 76],
                [218, 78],
                [230, 98],
                [228, 124],
                [208, 138],
                [184, 136],
                [172, 114],
              ]),
              fill: 'shell',
            },
            { d: ellipse(198, 86, 15, 4.6, -6), kind: 'detail', fill: 'sheen' },
            { d: ellipse(192, 85, 5.6, 2.2, -6), kind: 'detail', fill: 'sheenLight' },
          ],
        },
        {
          id: 'head',
          role: 'head',
          pivot: [226, 116],
          shapes: big([
            { d: ellipse(246, 102, 33, 31), fill: 'shell' },
            { d: ellipse(240, 79, 16, 4.6, -6), kind: 'detail', fill: 'sheen' },
            { d: circle(236, 98, 12.2), kind: 'feature', fill: 'sclera' },
            { d: circle(260, 96, 10.4), kind: 'feature', fill: 'sclera' },
            { d: circle(237.8, 99, 8.2), kind: 'feature', fill: 'eye' },
            { d: circle(261.6, 97, 7), kind: 'feature', fill: 'eye' },
            { d: circle(240.6, 95.8, 3), kind: 'feature', fill: 'shine' },
            { d: circle(264, 94, 2.6), kind: 'feature', fill: 'shine' },
            { d: ellipse(226, 115, 6.2, 3.9), kind: 'feature', fill: 'blush', opacity: 0.75 },
            { d: ellipse(268, 111, 4.6, 3.2), kind: 'feature', fill: 'blush', opacity: 0.75 },
            { d: curve(241, 114, 255, 113, 4.4), kind: 'line', stroke: 'smile', width: 2.6 },
          ]),
          children: [
            antenna('antennaF', true),
            antenna('antennaN', false),
            jaw('jawF', true),
            jaw('jawN', false),
          ],
        },
      ],
    },
    ...NEAR.map((l) => leg(l, false)),
  ],
};

export default stagBeetle;
