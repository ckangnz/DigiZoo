import { circle, ellipse, scalePath, scallop, tube, type Pt } from '../core/paths';
import type { AnimalDef, PartNode, Shape } from '../core/types';

const GROUND = 180;
const STRIDE = 40;
const DUTY = 0.76;
const SHIFT = STRIDE * DUTY;
const LIFT = 13;
const FOOT_R = 6;
const NEAR_Y = GROUND - FOOT_R;
const FAR_Y = GROUND - 10;

const frac = (v: number) => v - Math.floor(v);

function footAt(rest: Pt, offset: number, phase: number): Pt {
  const p = frac(phase + offset);
  const [x, y] = rest;
  if (p < DUTY) return [x + SHIFT / 2 - SHIFT * (p / DUTY), y];
  const q = (p - DUTY) / (1 - DUTY);
  const e = q * q * (3 - 2 * q);
  return [x - SHIFT / 2 + SHIFT * e, y - LIFT * Math.sin(Math.PI * q)];
}

const hairy = (base: (t: number) => number) => (t: number) =>
  base(t) + 0.9 * Math.sin(t * Math.PI * 22);

const leg = (n: number, far: boolean, hip: Pt, rest: Pt, foot: Pt, offset: number): PartNode => {
  const k = (name: string) => (far ? `${name}Far` : name);
  return {
    id: `leg${n}${far ? 'F' : 'N'}`,
    role: `leg${n}${far ? 'F' : 'N'}`,
    pivot: hip,
    motion: null,
    frames: (phase) => {
      const f = footAt(foot, offset, phase);
      const kn: Pt = [rest[0] + 0.5 * (f[0] - foot[0]), rest[1] + 0.7 * (f[1] - foot[1])];
      return [
        {
          d: tube(
            [hip, kn],
            hairy((t) => 8.4 - 0.6 * t),
            24,
          ),
          fill: k('leg'),
        },
        {
          d: tube(
            [kn, f],
            hairy((t) => 7.6 - 1.8 * t),
            30,
          ),
          fill: k('leg'),
        },
        { d: circle(kn[0], kn[1], 8.4), fill: k('leg') },
        { d: circle(f[0], f[1], FOOT_R + 1.6), fill: k('leg') },
        { d: circle(kn[0], kn[1], 9.6), kind: 'detail', fill: k('knee') },
        { d: circle(f[0], f[1], 6.4), kind: 'detail', fill: k('tip') },
      ];
    },
  };
};

const palp = (id: string, from: Pt, to: Pt, far: boolean): PartNode => {
  const fill = far ? 'legFar' : 'leg';
  return {
    id,
    role: far ? 'clawF' : 'clawN',
    behind: true,
    pivot: from,
    phase: far ? 0.5 : 0,
    shapes: [
      {
        d: tube(
          [from, [(from[0] + to[0]) / 2 + 6, (from[1] + to[1]) / 2 - 2], to],
          hairy(() => 6.5),
          24,
        ),
        fill,
      },
      { d: circle(to[0], to[1], 7.5), fill },
      { d: circle(to[0], to[1], 6), kind: 'detail', fill: far ? 'tipFar' : 'tip' },
    ],
  };
};

const NEAR: [Pt, Pt, Pt][] = [
  [
    [196, 116],
    [248, 78],
    [282, NEAR_Y],
  ],
  [
    [186, 120],
    [226, 64],
    [246, NEAR_Y],
  ],
  [
    [168, 124],
    [126, 66],
    [104, NEAR_Y],
  ],
  [
    [160, 122],
    [92, 76],
    [50, NEAR_Y],
  ],
];

const FAR: [Pt, Pt, Pt][] = [
  [
    [204, 112],
    [238, 68],
    [264, FAR_Y],
  ],
  [
    [194, 116],
    [212, 56],
    [228, FAR_Y],
  ],
  [
    [172, 118],
    [140, 56],
    [128, FAR_Y],
  ],
  [
    [162, 114],
    [112, 62],
    [78, FAR_Y],
  ],
];

const OFFSETS = [0, 0.25, 0.5, 0.75];

const grow = (shapes: Shape[]): Shape[] =>
  shapes.map((sh) => ({ ...sh, d: scalePath(sh.d, 1.18, 1.18, 196, 128) }));

const tarantula: AnimalDef = {
  id: 'tarantula',
  name: 'Tarantula',
  kind: 'animal',
  aliases: ['spider', 'red-knee tarantula', 'hairy spider'],
  group: 'bug',
  habitats: ['rainforest'],
  box: [300, 180],
  size: 70,
  locomotion: 'crawl',
  gait: { period: 1.1, stride: STRIDE },
  sound: 'tarantula',
  palette: {
    body: '#85583b',
    belly: '#7d5238',
    fuzz: '#b47d52',
    leg: '#6c4329',
    legFar: '#4f311f',
    knee: '#ff9b3d',
    kneeFar: '#d97c2c',
    tip: '#9a6b47',
    tipFar: '#6a4429',
    face: '#a8774f',
    eyeRing: '#fff1d6',
    cheek: '#ff9aa6',
  },
  parts: [
    ...FAR.map(([hip, kn, foot], i) => leg(i + 1, true, hip, kn, foot, (OFFSETS[i] + 0.5) % 1)),
    {
      id: 'abdomen',
      role: 'body',
      pivot: [150, 150],
      shapes: [
        { d: scallop(96, 106, 48, 24, 2.8, 0, 54, 44), fill: 'body' },
        { d: ellipse(90, 90, 36, 20, -12), kind: 'detail', fill: 'fuzz' },
      ],
    },
    ...NEAR.map(([hip, kn, foot], i) => leg(i + 1, false, hip, kn, foot, OFFSETS[i])),
    {
      id: 'body',
      role: 'body',
      pivot: [150, 150],
      shapes: grow([
        { d: scallop(178, 118, 40, 18, 2.4, 0, 44, 33), fill: 'belly' },
        { d: ellipse(190, 120, 28, 22), kind: 'detail', fill: 'face' },
        { d: ellipse(178, 128, 7.5, 4.8), kind: 'feature', fill: 'cheek', opacity: 0.85 },
        { d: ellipse(215, 126, 5.5, 4), kind: 'feature', fill: 'cheek', opacity: 0.85 },
        { d: circle(189, 110, 12), kind: 'feature', fill: 'eyeRing' },
        { d: circle(190, 110, 9.2), kind: 'feature', fill: 'eye' },
        { d: circle(193.4, 106.4, 3.4), kind: 'feature', fill: 'shine' },
        { d: circle(210.5, 108, 10), kind: 'feature', fill: 'eyeRing' },
        { d: circle(211.4, 108, 7.6), kind: 'feature', fill: 'eye' },
        { d: circle(214.2, 105, 2.8), kind: 'feature', fill: 'shine' },
        { d: 'M192 129Q198 134 205 128', kind: 'line', stroke: 'mouth', width: 2.8 },
      ]),
      children: [
        palp('palpF', [214, 132], [248, 158], true),
        palp('palpN', [206, 136], [238, 165], false),
      ],
    },
  ],
};

export default tarantula;
