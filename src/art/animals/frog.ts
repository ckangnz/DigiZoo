import { capsule, circle, ellipse, smooth, type Pt } from '../core/paths';
import type { AnimalDef, PartNode, Shape } from '../core/types';

const AIR = 0.62;
const HIP: Pt = [56, 100];
const FOLDED: Pt[] = [
  [86, 130],
  [36, 143],
  [84, 146],
];
const STRETCHED: Pt[] = [
  [18, 122],
  [-26, 138],
  [-70, 146],
];

const ease = (x: number) => {
  const c = Math.min(1, Math.max(0, x));
  return c * c * (3 - 2 * c);
};

function stretch(phase: number): number {
  const p = phase - Math.floor(phase);
  if (p >= AIR) return 0;
  const t = p / AIR;
  return t < 0.5 ? ease(t / 0.32) : ease((1 - t) / 0.3);
}

const lerp = (a: Pt, b: Pt, k: number): Pt => [a[0] + (b[0] - a[0]) * k, a[1] + (b[1] - a[1]) * k];

function toes(x: number, y: number, angle: number, fill: string, spread: number[], len: number) {
  return spread.flatMap((da): Shape[] => {
    const a = ((angle + da) * Math.PI) / 180;
    const tx = x + Math.cos(a) * len;
    const ty = y + Math.sin(a) * len;
    return [
      { d: capsule(x, y, tx, ty, 3, 2.3), fill },
      { d: circle(tx, ty, 3.9), fill },
    ];
  });
}

function joints(phase: number, ox: number, oy: number): Pt[] {
  const k = stretch(phase);
  return FOLDED.map((p, i) => {
    const q = lerp(p, STRETCHED[i], k);
    return [q[0] + ox, q[1] + oy] as Pt;
  });
}

const backLeg = (id: string, far: boolean): PartNode => {
  const [ox, oy] = far ? [12, -3] : [0, 0];
  const skin = far ? 'skinDark' : 'skin';
  const toe = far ? 'toeDark' : 'toe';
  const hip: Pt = [HIP[0] + ox, HIP[1] + oy];
  return {
    id,
    role: id,
    behind: far,
    pivot: hip,
    motion: null,
    frames: (phase) => {
      const [knee] = joints(phase, ox, oy);
      return [
        { d: capsule(hip[0], hip[1], knee[0], knee[1], 27, 15), fill: skin },
        ...(far
          ? []
          : [
              {
                d: ellipse(
                  hip[0] + (knee[0] - hip[0]) * 0.45,
                  hip[1] + (knee[1] - hip[1]) * 0.45 - 6,
                  9,
                  6,
                ),
                kind: 'detail' as const,
                fill: 'spot',
              },
            ]),
      ];
    },
    children: [
      {
        id: `${id}Foot`,
        behind: true,
        pivot: hip,
        frames: (phase) => {
          const [knee, ankle, tip] = joints(phase, ox, oy);
          const footAngle = (Math.atan2(tip[1] - ankle[1], tip[0] - ankle[0]) * 180) / Math.PI;
          return [
            { d: capsule(knee[0], knee[1], ankle[0], ankle[1], 12.5, 9), fill: skin },
            { d: capsule(ankle[0], ankle[1], tip[0], tip[1], 9, 6.5), fill: skin },
            ...toes(tip[0], tip[1], footAngle, toe, [-50, -15, 18], 17),
          ];
        },
      },
    ],
  };
};

const frontLeg = (id: string, x: number, far: boolean): PartNode => ({
  id,
  role: id,
  behind: true,
  pivot: [x, 116],
  shapes: [
    { d: capsule(x, 116, x + 6, 140, 9.5, 7.5), fill: far ? 'skinDark' : 'skin' },
    ...toes(x + 6, 141, 20, far ? 'toeDark' : 'toe', [-42, 0, 42], 13),
  ],
});

const frog: AnimalDef = {
  id: 'frog',
  name: 'Frog',
  aliases: ['froggy', 'toad', 'tree frog'],
  group: 'amphibian',
  habitats: ['rainforest'],
  box: [206, 156],
  size: 70,
  locomotion: 'hop',
  gait: { lift: 44 },
  sound: 'frog',
  palette: {
    skin: '#8ad845',
    skinDark: '#6cba34',
    belly: '#fff2c6',
    spot: '#69bd38',
    toe: '#ff9d3a',
    toeDark: '#e8842a',
    cheek: '#ff92a6',
  },
  parts: [
    {
      id: 'body',
      role: 'body',
      pivot: [102, 152],
      shapes: [
        { d: circle(160, 28, 20), fill: 'skinDark' },
        { d: circle(120, 30, 24), fill: 'skin' },
        {
          d: smooth([
            [14, 124],
            [17, 92],
            [35, 65],
            [68, 46],
            [107, 37],
            [144, 37],
            [174, 47],
            [191, 65],
            [193, 83],
            [179, 101],
            [160, 116],
            [144, 134],
            [102, 144],
            [52, 142],
            [24, 136],
          ]),
          fill: 'skin',
        },
        { d: ellipse(148, 126, 54, 36), kind: 'detail', fill: 'belly' },
        { d: circle(50, 78, 7), kind: 'detail', fill: 'spot' },
        { d: circle(73, 60, 5), kind: 'detail', fill: 'spot' },
        { d: circle(34, 104, 5), kind: 'detail', fill: 'spot' },
        { d: ellipse(104, 70, 10, 6), kind: 'feature', fill: 'cheek', opacity: 0.8 },
        { d: ellipse(183, 62, 6.5, 5), kind: 'feature', fill: 'cheek', opacity: 0.8 },
        { d: circle(162, 25, 11.5), kind: 'feature', fill: 'eye' },
        { d: circle(166, 20.5, 4.2), kind: 'feature', fill: 'shine' },
        { d: circle(123, 27, 14), kind: 'feature', fill: 'eye' },
        { d: circle(128, 21.5, 5.2), kind: 'feature', fill: 'shine' },
        { d: circle(118, 33, 2), kind: 'feature', fill: 'shine' },
        { d: circle(178, 51, 1.8), kind: 'feature', fill: 'mouth' },
        { d: circle(185, 54, 1.6), kind: 'feature', fill: 'mouth' },
        { d: 'M110 67Q148 90 186 68', kind: 'line', stroke: 'mouth', width: 3.2 },
      ],
      children: [
        backLeg('legBF', true),
        frontLeg('legFF', 166, true),
        frontLeg('legFN', 152, false),
        backLeg('legBN', false),
      ],
    },
  ],
};

export default frog;
