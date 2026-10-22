import { circle, curve, ellipse, smooth, tube, type Pt } from '../core/paths';
import type { AnimalDef, PartNode, Shape } from '../core/types';

const GROUND = 190;
const STRIDE = 50;
const DUTY = 0.56;
const SHIFT = STRIDE * DUTY;
const LIFT = 12;
const FOOT_R = 5.6;

const frac = (v: number) => v - Math.floor(v);

function footAt(rest: Pt, offset: number, phase: number): Pt {
  const p = frac(phase + offset);
  const [x, y] = rest;
  if (p < DUTY) return [x + SHIFT / 2 - SHIFT * (p / DUTY), y];
  const q = (p - DUTY) / (1 - DUTY);
  const e = q * q * (3 - 2 * q);
  return [x - SHIFT / 2 + SHIFT * e, y - LIFT * Math.sin(Math.PI * q)];
}

function kneeAt(hip: Pt, foot: Pt, l1: number, l2: number, side: number): Pt {
  const dx = foot[0] - hip[0];
  const dy = foot[1] - hip[1];
  const d = Math.max(Math.abs(l1 - l2) + 0.01, Math.min(Math.hypot(dx, dy), l1 + l2 - 0.01));
  const a = Math.atan2(dy, dx);
  const b = Math.acos(Math.max(-1, Math.min(1, (l1 * l1 + d * d - l2 * l2) / (2 * l1 * d))));
  return [hip[0] + l1 * Math.cos(a + side * b), hip[1] + l1 * Math.sin(a + side * b)];
}

interface LegSpec {
  hip: Pt;
  knee: Pt;
  foot: Pt;
}

const leg = (n: number, far: boolean, spec: LegSpec, offset: number): PartNode => {
  const { hip, knee, foot } = spec;
  const l1 = Math.hypot(knee[0] - hip[0], knee[1] - hip[1]);
  const l2 = Math.hypot(foot[0] - knee[0], foot[1] - knee[1]);
  const cross = (foot[0] - hip[0]) * (knee[1] - hip[1]) - (foot[1] - hip[1]) * (knee[0] - hip[0]);
  const side = Math.sign(cross) || 1;
  const fill = far ? 'legFar' : 'leg';
  return {
    id: `leg${n}${far ? 'F' : 'N'}`,
    role: `leg${n}${far ? 'F' : 'N'}`,
    pivot: hip,
    motion: null,
    frames: (phase) => {
      const f = footAt(foot, offset, phase);
      const k = kneeAt(hip, f, l1, l2, side);
      const toe = Math.sign(foot[0] - hip[0]) || 1;
      return [
        { d: tube([hip, k], (t) => 6 - 1 * t, 20), fill },
        { d: tube([k, f], (t) => 5 - 1.2 * t, 20), fill },
        { d: circle(k[0], k[1], 5.4), fill },
        { d: ellipse(f[0] + toe * 2.2, f[1] - 0.4, FOOT_R + 1.6, FOOT_R), fill },
      ];
    },
  };
};

const NEAR: LegSpec[] = [
  { hip: [186, 124], knee: [214, 136], foot: [232, GROUND - FOOT_R] },
  { hip: [172, 128], knee: [180, 150], foot: [170, GROUND - FOOT_R] },
  { hip: [158, 124], knee: [128, 140], foot: [108, GROUND - FOOT_R] },
];

const FAR: LegSpec[] = [
  { hip: [192, 120], knee: [224, 128], foot: [246, GROUND - 11] },
  { hip: [178, 122], knee: [194, 144], foot: [190, GROUND - 11] },
  { hip: [164, 120], knee: [144, 132], foot: [128, GROUND - 11] },
];

const TRIPOD_NEAR = [0, 0.5, 0];
const TRIPOD_FAR = [0.5, 0, 0.5];

const antenna = (id: string, base: Pt, elbow: Pt, tip: Pt, far: boolean): PartNode => {
  const fill = far ? 'legFar' : 'leg';
  return {
    id,
    role: 'antenna',
    behind: true,
    pivot: base,
    phase: far ? 0.35 : 0,
    shapes: [
      { d: tube([base, elbow], (t) => 4.4 - 0.6 * t, 16), fill },
      {
        d: tube([elbow, [(elbow[0] + tip[0]) / 2, (elbow[1] + tip[1]) / 2 - 3], tip], 3.4, 20),
        fill,
      },
      { d: circle(elbow[0], elbow[1], 4.4), fill },
      { d: ellipse(tip[0] + 2, tip[1] + 1, 7.2, 5.6, 20), fill },
    ],
  };
};

const band = (x: number, k: number): Shape => ({
  d: tube(
    [
      [x + 12, 72],
      [x - 6 * k, 114],
      [x + 8, 158],
    ],
    3.6 * k,
    24,
  ),
  kind: 'detail',
  fill: 'band',
});

const shine = (x: number, y: number, rx: number, ry: number, rot: number): Shape => ({
  d: ellipse(x, y, rx, ry, rot),
  kind: 'detail',
  fill: 'bodyHi',
});

const ant: AnimalDef = {
  id: 'ant',
  name: 'Ant',
  kind: 'animal',
  aliases: ['ants', 'red ant', 'little ant', 'worker ant'],
  group: 'bug',
  habitats: ['bugs'],
  box: [300, 190],
  size: 50,
  locomotion: 'crawl',
  gait: { period: 0.6, stride: STRIDE },
  sound: 'ant',
  palette: {
    body: '#c95b32',
    bodyHi: '#ec8a5a',
    band: '#b44d2c',
    leg: '#a5442a',
    legFar: '#7c321f',
    face: '#f2a77c',
    sclera: '#ffffff',
  },
  parts: [
    ...FAR.map((spec, i) => leg(i + 1, true, spec, TRIPOD_FAR[i])),
    {
      id: 'gaster',
      role: 'body',
      pivot: [96, 150],
      motion: { y: -1.8, wave: 'abs' },
      shapes: [
        {
          d: smooth([
            [36, 142],
            [26, 116],
            [36, 90],
            [62, 76],
            [96, 76],
            [124, 90],
            [136, 112],
            [128, 134],
            [102, 150],
            [66, 154],
          ]),
          fill: 'body',
        },
        { d: circle(142, 120, 10), fill: 'body' },
        band(62, 1),
        band(90, 0.8),
        shine(78, 92, 24, 8.5, -14),
        shine(58, 98, 7, 3.6, -34),
      ],
    },
    ...NEAR.map((spec, i) => leg(i + 1, false, spec, TRIPOD_NEAR[i])),
    {
      id: 'thorax',
      role: 'body',
      pivot: [176, 150],
      motion: { y: -1.8, wave: 'abs', phase: 0.04 },
      shapes: [
        {
          d: smooth([
            [146, 126],
            [148, 106],
            [162, 94],
            [184, 90],
            [204, 98],
            [210, 116],
            [198, 132],
            [170, 136],
          ]),
          fill: 'body',
        },
        shine(176, 100, 15, 5.5, -10),
      ],
      children: [
        {
          id: 'head',
          role: 'head',
          pivot: [214, 118],
          shapes: [
            {
              d: smooth([
                [198, 104],
                [206, 74],
                [230, 56],
                [262, 56],
                [284, 76],
                [290, 104],
                [278, 130],
                [250, 142],
                [216, 136],
              ]),
              fill: 'body',
            },
            shine(226, 72, 14, 6.5, -32),
            { d: ellipse(258, 122, 26, 16, -4), kind: 'detail', fill: 'face' },
            { d: ellipse(232, 116, 7.5, 5), kind: 'feature', fill: 'blush', opacity: 0.75 },
            { d: ellipse(281, 113, 4.6, 4), kind: 'feature', fill: 'blush', opacity: 0.75 },
            { d: circle(243, 94, 13.5), kind: 'feature', fill: 'sclera' },
            { d: circle(272, 92, 11), kind: 'feature', fill: 'sclera' },
            { d: circle(245, 95.5, 10), kind: 'feature', fill: 'eye' },
            { d: circle(273.6, 93.4, 8), kind: 'feature', fill: 'eye' },
            { d: circle(248.6, 91, 3.8), kind: 'feature', fill: 'shine' },
            { d: circle(276.6, 89.4, 3.1), kind: 'feature', fill: 'shine' },
            { d: circle(241.8, 100, 1.7), kind: 'feature', fill: 'shine' },
            { d: curve(252, 120, 268, 119, 5), kind: 'line', stroke: 'mouth', width: 2.8 },
          ],
          children: [
            antenna('antennaF', [256, 60], [268, 30], [292, 26], true),
            antenna('antennaN', [240, 60], [244, 26], [270, 14], false),
          ],
        },
      ],
    },
  ],
};

export default ant;
