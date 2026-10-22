import { capsule, circle, ellipse, scalePath, smooth, tube, type Pt } from '../core/paths';
import type { AnimalDef, PartNode, Shape } from '../core/types';

const GROUND = 200;
const STRIDE = 36;
const DUTY = 0.6;
const SHIFT = STRIDE * DUTY;
const LIFT = 10;

const frac = (v: number) => v - Math.floor(v);

function footAt(rest: Pt, offset: number, phase: number): Pt {
  const p = frac(phase + offset);
  const [x, y] = rest;
  if (p < DUTY) return [x + SHIFT / 2 - SHIFT * (p / DUTY), y];
  const q = (p - DUTY) / (1 - DUTY);
  const e = q * q * (3 - 2 * q);
  return [x - SHIFT / 2 + SHIFT * e, y - LIFT * Math.sin(Math.PI * q)];
}

const spines = (knee: Pt, foot: Pt, r: number, at: number[], size: number, fill: string) => {
  const dx = foot[0] - knee[0];
  const dy = foot[1] - knee[1];
  const len = Math.hypot(dx, dy) || 1;
  const ux = dx / len;
  const uy = dy / len;
  const nx = -uy;
  const ny = ux;
  const side = nx < 0 ? 1 : -1;
  return at.map((t): Shape => {
    const px = knee[0] + dx * t;
    const py = knee[1] + dy * t;
    const tip: Pt = [
      px + side * nx * (r + size) + ux * size * 0.7,
      py + side * ny * (r + size) + uy * size * 0.7,
    ];
    return {
      d: smooth(
        [
          [px - ux * size * 0.55, py - uy * size * 0.55],
          tip,
          [px + ux * size * 0.55, py + uy * size * 0.55],
        ],
        true,
        0.25,
      ),
      fill,
    };
  });
};

interface LegSpec {
  hip: Pt;
  knee: Pt;
  foot: Pt;
  thigh: number;
  shin: number;
  spikes: number[];
  spike: number;
}

const LEGS: LegSpec[] = [
  {
    hip: [238, 136],
    knee: [262, 154],
    foot: [282, GROUND - 5],
    thigh: 6.5,
    shin: 4.6,
    spikes: [0.35, 0.65],
    spike: 4.5,
  },
  {
    hip: [214, 140],
    knee: [228, 162],
    foot: [212, GROUND - 5],
    thigh: 6.5,
    shin: 4.6,
    spikes: [0.35, 0.65],
    spike: 4.5,
  },
  {
    hip: [178, 138],
    knee: [100, 92],
    foot: [52, GROUND - 5],
    thigh: 16,
    shin: 5.4,
    spikes: [0.16, 0.32, 0.48, 0.64, 0.8],
    spike: 8,
  },
];

const FAR_SHIFT: Pt = [12, -7];

const leg = (n: number, far: boolean, spec: LegSpec, offset: number): PartNode => {
  const k = (name: string) => (far ? `${name}Far` : name);
  const move = (p: Pt): Pt => (far ? [p[0] + FAR_SHIFT[0], p[1] + FAR_SHIFT[1]] : p);
  const hip = move(spec.hip);
  const restKnee = move(spec.knee);
  const restFoot = move(spec.foot);
  return {
    id: `leg${n}${far ? 'F' : 'N'}`,
    role: `leg${n}${far ? 'F' : 'N'}`,
    pivot: hip,
    motion: null,
    frames: (phase) => {
      const f = footAt(restFoot, offset, phase);
      const kn: Pt = [
        restKnee[0] + 0.5 * (f[0] - restFoot[0]),
        restKnee[1] + 0.6 * (f[1] - restFoot[1]),
      ];
      const thighEnd = Math.max(5.6, spec.thigh * 0.42);
      return [
        ...spines(kn, f, spec.shin, spec.spikes, spec.spike, k('leg')),
        { d: capsule(hip[0], hip[1], kn[0], kn[1], spec.thigh, thighEnd), fill: k('leg') },
        { d: capsule(kn[0], kn[1], f[0], f[1], spec.shin, spec.shin * 0.8), fill: k('leg') },
        { d: circle(kn[0], kn[1], thighEnd + 0.6), fill: k('leg') },
        { d: ellipse(f[0] + 4, f[1] + 1, 7, 4), fill: k('leg') },
        ...(n === 3
          ? [
              {
                d: ellipse(
                  (hip[0] + kn[0]) / 2,
                  (hip[1] + kn[1]) / 2,
                  24,
                  4.5,
                  (Math.atan2(kn[1] - hip[1], kn[0] - hip[0]) * 180) / Math.PI,
                ),
                kind: 'detail' as const,
                fill: k('stripe'),
              },
            ]
          : []),
      ];
    },
  };
};

const antenna = (id: string, base: Pt, pts: Pt[], fill: string, phase: number): PartNode => ({
  id,
  role: 'antenna',
  behind: true,
  pivot: base,
  phase,
  shapes: [{ d: tube([base, ...pts], (t) => 2.6 - 1.2 * t, 60), fill }],
});

const grow = (shapes: Shape[]): Shape[] =>
  shapes.map((sh) => ({ ...sh, d: scalePath(sh.d, 1.16, 1.16, 238, 128) }));

const OFFSETS_NEAR = [0, 0.5, 0];
const OFFSETS_FAR = [0.5, 0, 0.5];

const ABDOMEN: Pt[] = [
  [200, 98],
  [170, 86],
  [130, 82],
  [90, 86],
  [56, 98],
  [34, 116],
  [36, 138],
  [60, 152],
  [102, 158],
  [148, 156],
  [186, 148],
  [208, 128],
];

const band = (x: number, y: number, ry: number, rot: number): Shape => ({
  d: ellipse(x, y, 5.5, ry, rot),
  kind: 'detail',
  fill: 'band',
});

const weta: AnimalDef = {
  id: 'weta',
  name: 'Weta',
  kind: 'animal',
  aliases: ['giant weta', 'tree weta', 'cricket', 'bug', 'insect'],
  group: 'bug',
  habitats: ['aussie', 'bugs'],
  box: [320, GROUND],
  size: 60,
  locomotion: 'crawl',
  gait: { period: 1, stride: STRIDE },
  sound: 'weta',
  palette: {
    body: '#b0703f',
    band: '#86512b',
    belly: '#dca86f',
    shell: '#93582f',
    sheen: '#c48c58',
    head: '#9c6034',
    face: '#bb8452',
    leg: '#a8693a',
    legFar: '#7f4d2a',
    stripe: '#8a5430',
    stripeFar: '#683f22',
    antenna: '#8a5531',
    antennaFar: '#6a4024',
    cheek: '#ff9aa6',
    eyeRing: '#fff1d6',
  },
  parts: [
    ...LEGS.map((spec, i) => leg(i + 1, true, spec, OFFSETS_FAR[i])),
    {
      id: 'body',
      role: 'body',
      pivot: [150, 160],
      shapes: [
        { d: smooth(ABDOMEN), fill: 'body' },
        { d: ellipse(120, 156, 84, 14, -2), kind: 'detail', fill: 'belly' },
        band(62, 120, 40, 18),
        band(86, 118, 44, 10),
        band(110, 118, 46, 4),
        band(134, 118, 46, 0),
        band(158, 118, 44, -4),
        band(182, 118, 40, -10),
        { d: ellipse(120, 92, 54, 6, -2), kind: 'detail', fill: 'sheen' },
        {
          d: smooth([
            [196, 92],
            [222, 84],
            [244, 94],
            [250, 120],
            [240, 142],
            [214, 146],
            [196, 132],
            [190, 110],
          ]),
          fill: 'shell',
        },
        { d: ellipse(220, 96, 18, 6, -8), kind: 'detail', fill: 'sheen' },
      ],
      children: [
        {
          id: 'head',
          role: 'head',
          pivot: [240, 120],
          shapes: grow([
            {
              d: smooth([
                [236, 92],
                [258, 82],
                [280, 90],
                [292, 112],
                [288, 138],
                [270, 152],
                [248, 150],
                [234, 132],
              ]),
              fill: 'head',
            },
            { d: ellipse(270, 128, 18, 20), kind: 'detail', fill: 'face' },
            { d: ellipse(256, 90, 16, 6, -14), kind: 'detail', fill: 'sheen' },
            { d: ellipse(254, 128, 7.5, 4.8), kind: 'feature', fill: 'cheek', opacity: 0.8 },
            { d: ellipse(287, 126, 5, 3.6), kind: 'feature', fill: 'cheek', opacity: 0.8 },
            { d: circle(262, 110, 12.5), kind: 'feature', fill: 'eyeRing' },
            { d: circle(263, 110, 9.6), kind: 'feature', fill: 'eye' },
            { d: circle(266.6, 106.2, 3.6), kind: 'feature', fill: 'shine' },
            { d: circle(260, 113.4, 1.5), kind: 'feature', fill: 'shine' },
            { d: circle(284, 108, 9), kind: 'feature', fill: 'eyeRing' },
            { d: circle(284.8, 108, 6.8), kind: 'feature', fill: 'eye' },
            { d: circle(287.4, 105.2, 2.6), kind: 'feature', fill: 'shine' },
            { d: 'M266 132Q273 138 281 132', kind: 'line', stroke: 'mouth', width: 2.6 },
          ]),
          children: [
            antenna(
              'antennaF',
              [284, 84],
              [
                [292, 58],
                [294, 34],
                [286, 14],
                [268, 4],
                [252, 8],
              ],
              'antennaFar',
              0.3,
            ),
            antenna(
              'antennaN',
              [270, 84],
              [
                [258, 54],
                [232, 32],
                [190, 18],
                [144, 16],
                [104, 28],
              ],
              'antenna',
              0,
            ),
          ],
        },
      ],
    },
    ...LEGS.map((spec, i) => leg(i + 1, false, spec, OFFSETS_NEAR[i])),
  ],
};

export default weta;
