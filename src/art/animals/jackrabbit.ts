import {
  capsule,
  circle,
  ellipse,
  scalePath,
  scallop,
  smooth,
  translatePath,
  type Pt,
} from '../core/paths';
import type { AnimalDef, PartNode, Shape } from '../core/types';

const DY = 48;
const AIR = 0.62;
const HIP: Pt = [100, 168 + DY];
const FOLDED: Pt[] = [
  [116, 200 + DY],
  [80, 226 + DY],
  [140, 230 + DY],
];
const STRETCHED: Pt[] = [
  [74, 198 + DY],
  [42, 214 + DY],
  [4, 222 + DY],
];

const ease = (x: number) => {
  const c = Math.min(1, Math.max(0, x));
  return c * c * (3 - 2 * c);
};

function stretch(phase: number): number {
  const p = phase - Math.floor(phase);
  if (p >= AIR) return 0;
  const t = p / AIR;
  return t < 0.5 ? ease(t / 0.3) : ease((1 - t) / 0.32);
}

const lerp = (a: Pt, b: Pt, k: number): Pt => [a[0] + (b[0] - a[0]) * k, a[1] + (b[1] - a[1]) * k];

function joints(phase: number, ox: number, oy: number): Pt[] {
  const k = stretch(phase);
  return FOLDED.map((p, i) => {
    const q = lerp(p, STRETCHED[i], k);
    return [q[0] + ox, q[1] + oy] as Pt;
  });
}

const backLeg = (id: string, far: boolean): PartNode => {
  const [ox, oy] = far ? [14, -4] : [0, 0];
  const fur = far ? 'furDark' : 'fur';
  const hip: Pt = [HIP[0] + ox, HIP[1] + oy];
  return {
    id,
    role: id,
    behind: far,
    pivot: hip,
    motion: null,
    frames: (phase) => {
      const [knee] = joints(phase, ox, oy);
      const dx = knee[0] - hip[0];
      const dy = knee[1] - hip[1];
      const len = Math.hypot(dx, dy);
      const angle = (Math.atan2(dy, dx) * 180) / Math.PI;
      return [
        {
          d: ellipse(hip[0] + dx * 0.42, hip[1] + dy * 0.42, len * 0.5 + 21, 27, angle),
          fill: fur,
        },
      ];
    },
    children: [
      {
        id: `${id}Foot`,
        behind: true,
        pivot: hip,
        frames: (phase) => {
          const [knee, heel, toe] = joints(phase, ox, oy);
          return [
            { d: capsule(knee[0], knee[1], heel[0], heel[1], 12, 8.5), fill: fur },
            { d: capsule(heel[0], heel[1], toe[0], toe[1], 8.5, 7.5), fill: fur },
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
  pivot: [x, 180 + DY],
  shapes: [
    { d: capsule(x, 180 + DY, x + 4, 226 + DY, 9.5, 7), fill: far ? 'furDark' : 'fur' },
    { d: ellipse(x + 9, 231 + DY, 11, 6.5), fill: far ? 'furDark' : 'fur' },
  ],
});

const earShape = (base: Pt, angle: number, length: number, width: number): Pt[] => {
  const a = (angle * Math.PI) / 180;
  const ux = Math.cos(a);
  const uy = Math.sin(a);
  const at = (u: number, v: number): Pt => [
    base[0] + ux * u * length - uy * v * width,
    base[1] + uy * u * length + ux * v * width,
  ];
  return (
    [
      [0, -0.55],
      [0.25, -0.9],
      [0.6, -1],
      [0.86, -0.8],
      [1, -0.32],
      [1.02, 0],
      [1, 0.32],
      [0.86, 0.8],
      [0.6, 1],
      [0.25, 0.9],
      [0, 0.55],
    ] as Pt[]
  ).map(([u, v]) => at(u, v));
};

const earTip = (base: Pt, angle: number, length: number): Pt => {
  const a = (angle * Math.PI) / 180;
  return [base[0] + Math.cos(a) * length, base[1] + Math.sin(a) * length];
};

const ear = (id: string, base: Pt, angle: number, far: boolean): PartNode => {
  const length = far ? 112 : 124;
  const tip = earTip(base, angle, length);
  const shapes: Shape[] = [
    { d: smooth(earShape(base, angle, length, far ? 16 : 18)), fill: far ? 'furDark' : 'fur' },
    { d: circle(tip[0], tip[1], 21), kind: 'detail', fill: 'tip' },
  ];
  if (!far) {
    shapes.splice(1, 0, {
      d: smooth(earShape(earTip(base, angle, 18), angle, 82, 8.5)),
      kind: 'detail',
      fill: 'earInner',
    });
  }
  return { id, role: id, behind: true, pivot: base, phase: far ? 0.08 : 0, shapes };
};

const shift = (d: string) => translatePath(d, 0, DY);
const hd = (d: string) => shift(scalePath(d, 1.1, 1.1, 200, 112));

const jackrabbit: AnimalDef = {
  id: 'jackrabbit',
  name: 'Jackrabbit',
  kind: 'animal',
  aliases: ['jack rabbit', 'hare', 'desert hare', 'bunny', 'rabbit'],
  group: 'mammal',
  habitats: ['desert'],
  box: [256, 288],
  size: 120,
  locomotion: 'hop',
  gait: { lift: 52 },
  sound: 'jackrabbit',
  palette: {
    fur: '#d6ad7c',
    furDark: '#bf9463',
    belly: '#fbf0dd',
    earInner: '#f6c0b4',
    tip: '#3a2c26',
    tail: '#fffaf2',
    nose: '#e98a8f',
  },
  parts: [
    {
      id: 'body',
      role: 'body',
      pivot: [120, 236 + DY],
      shapes: [
        {
          d: shift(
            smooth([
              [62, 150],
              [84, 128],
              [116, 118],
              [150, 120],
              [176, 134],
              [190, 162],
              [186, 190],
              [166, 208],
              [128, 216],
              [90, 212],
              [62, 196],
              [52, 174],
            ]),
          ),
          fill: 'fur',
        },
        { d: shift(ellipse(154, 200, 38, 18, -20)), kind: 'detail', fill: 'belly' },
      ],
      children: [
        {
          id: 'tail',
          role: 'tail',
          behind: true,
          pivot: [60, 156 + DY],
          shapes: [
            { d: shift(scallop(50, 152, 17, 8, 5.5)), fill: 'tail' },
            { d: shift(ellipse(54, 136, 14, 8, -20)), kind: 'detail', fill: 'furDark' },
          ],
        },
        backLeg('legBF', true),
        frontLeg('legFF', 180, true),
        frontLeg('legFN', 166, false),
        {
          id: 'head',
          role: 'head',
          pivot: [170, 130 + DY],
          shapes: [
            {
              d: hd(
                smooth([
                  [176, 78],
                  [206, 76],
                  [230, 90],
                  [242, 112],
                  [242, 128],
                  [230, 140],
                  [208, 148],
                  [182, 146],
                  [164, 132],
                  [158, 110],
                  [162, 90],
                ]),
              ),
              fill: 'fur',
            },
            { d: hd(ellipse(218, 136, 26, 14, -8)), kind: 'detail', fill: 'belly' },
            { d: hd(ellipse(212, 126, 9, 5.5)), kind: 'feature', fill: 'blush', opacity: 0.5 },
            { d: hd(circle(208, 104, 11)), kind: 'feature', fill: 'eye' },
            { d: hd(circle(211.8, 99.8, 4.2)), kind: 'feature', fill: 'shine' },
            { d: hd(ellipse(239, 117, 4.6, 3.6, 20)), kind: 'feature', fill: 'nose' },
            { d: hd('M238 121Q239 127 233 129'), kind: 'line', stroke: 'mouth', width: 2.2 },
          ],
          children: [
            ear('earF', [176, 84 + DY], -117, true),
            ear('earN', [192, 80 + DY], -97, false),
          ],
        },
        backLeg('legBN', false),
      ],
    },
  ],
};

export default jackrabbit;
