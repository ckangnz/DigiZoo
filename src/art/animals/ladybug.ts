import { circle, curve, ellipse, smooth, tube, type Pt } from '../core/paths';
import type { AnimalDef, PartNode, Shape } from '../core/types';

const GROUND = 170;
const STRIDE = 30;
const DUTY = 0.56;
const SHIFT = STRIDE * DUTY;
const LIFT = 8;
const FOOT_R = 4.8;

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
        { d: tube([hip, k], (t) => 5.6 - 0.8 * t, 16), fill },
        { d: tube([k, f], (t) => 4.8 - 1 * t, 16), fill },
        { d: circle(k[0], k[1], 5), fill },
        { d: ellipse(f[0] + toe * 2, f[1] - 0.2, FOOT_R + 1.4, FOOT_R), fill },
      ];
    },
  };
};

const NEAR: LegSpec[] = [
  { hip: [156, 136], knee: [172, 148], foot: [180, GROUND - FOOT_R] },
  { hip: [122, 138], knee: [128, 154], foot: [122, GROUND - FOOT_R] },
  { hip: [88, 136], knee: [72, 148], foot: [64, GROUND - FOOT_R] },
];

const FAR: LegSpec[] = [
  { hip: [166, 132], knee: [184, 142], foot: [196, GROUND - 9] },
  { hip: [134, 134], knee: [144, 148], foot: [142, GROUND - 9] },
  { hip: [100, 132], knee: [88, 144], foot: [84, GROUND - 9] },
];

const TRIPOD_NEAR = [0, 0.5, 0];
const TRIPOD_FAR = [0.5, 0, 0.5];

const spot = (x: number, y: number, r: number): Shape => ({
  d: circle(x, y, r),
  kind: 'detail',
  fill: 'spot',
});

const antenna = (id: string, pts: Pt[], far: boolean): PartNode => {
  const tip = pts[pts.length - 1];
  const fill = far ? 'legFar' : 'head';
  return {
    id,
    role: 'antenna',
    behind: true,
    pivot: pts[0],
    phase: far ? 0.3 : 0,
    shapes: [
      { d: tube(pts, (t) => 3.6 - 0.6 * t, 20), fill },
      { d: ellipse(tip[0] + 1.5, tip[1] - 1, 6.6, 5.2, -24), fill },
    ],
  };
};

const ladybug: AnimalDef = {
  id: 'ladybug',
  name: 'Ladybug',
  kind: 'animal',
  aliases: ['ladybird', 'lady bug', 'ladybird beetle', 'ladybug beetle'],
  group: 'bug',
  habitats: ['bugs'],
  box: [270, 170],
  size: 50,
  locomotion: 'crawl',
  gait: { period: 0.7, stride: STRIDE },
  sound: 'ladybug',
  palette: {
    shell: '#f0473a',
    shellHi: '#ff8a72',
    spot: '#2b2433',
    under: '#2b2433',
    head: '#38304a',
    headHi: '#554a6e',
    leg: '#3a3248',
    legFar: '#262031',
    sclera: '#ffffff',
    smile: '#ffc8d6',
  },
  parts: [
    ...FAR.map((spec, i) => leg(i + 1, true, spec, TRIPOD_FAR[i])),
    ...NEAR.map((spec, i) => leg(i + 1, false, spec, TRIPOD_NEAR[i])),
    {
      id: 'body',
      role: 'body',
      pivot: [120, 150],
      motion: { y: -1.6, wave: 'abs' },
      shapes: [
        { d: ellipse(118, 136, 82, 14), fill: 'under' },
        {
          d: smooth([
            [24, 124],
            [28, 90],
            [48, 56],
            [82, 32],
            [124, 24],
            [162, 32],
            [190, 54],
            [204, 86],
            [206, 116],
            [194, 134],
            [112, 142],
            [40, 136],
          ]),
          fill: 'shell',
        },
        spot(102, 24, 11),
        spot(156, 32, 9),
        spot(54, 44, 8),
        spot(74, 90, 16),
        spot(126, 76, 17),
        spot(168, 104, 14),
        spot(112, 126, 12),
        spot(40, 120, 10),
        { d: ellipse(92, 62, 22, 8, -24), kind: 'detail', fill: 'shellHi' },
        { d: ellipse(70, 72, 6, 3.4, -40), kind: 'detail', fill: 'shellHi' },
        {
          d: tube(
            [
              [204, 58],
              [150, 38],
              [102, 40],
              [62, 58],
              [36, 92],
              [24, 128],
            ],
            2,
            60,
          ),
          kind: 'detail',
          fill: 'spot',
        },
      ],
      children: [
        {
          id: 'pronotum',
          pivot: [196, 120],
          shapes: [
            { d: ellipse(198, 92, 22, 34, 14), fill: 'under' },
            { d: ellipse(192, 74, 9, 4.6, -30), kind: 'detail', fill: 'headHi' },
          ],
        },
        {
          id: 'head',
          role: 'head',
          pivot: [206, 126],
          shapes: [
            { d: circle(224, 112, 34), fill: 'head' },
            { d: ellipse(214, 88, 13, 6, -24), kind: 'detail', fill: 'headHi' },
            { d: ellipse(212, 130, 6.5, 4.4), kind: 'feature', fill: 'blush', opacity: 0.8 },
            { d: ellipse(254, 126, 4.6, 3.8), kind: 'feature', fill: 'blush', opacity: 0.8 },
            { d: circle(220, 106, 12.5), kind: 'feature', fill: 'sclera' },
            { d: circle(245, 104, 10.5), kind: 'feature', fill: 'sclera' },
            { d: circle(222, 107.5, 9), kind: 'feature', fill: 'eye' },
            { d: circle(246.4, 105.5, 7.6), kind: 'feature', fill: 'eye' },
            { d: circle(225.4, 103.2, 3.4), kind: 'feature', fill: 'shine' },
            { d: circle(249.2, 101.6, 2.9), kind: 'feature', fill: 'shine' },
            { d: curve(228, 128, 242, 127, 4.5), kind: 'line', stroke: 'smile', width: 2.8 },
          ],
          children: [
            antenna(
              'antennaF',
              [
                [238, 82],
                [250, 64],
                [262, 58],
              ],
              true,
            ),
            antenna(
              'antennaN',
              [
                [224, 80],
                [230, 58],
                [244, 46],
              ],
              false,
            ),
          ],
        },
      ],
    },
  ],
};

export default ladybug;
