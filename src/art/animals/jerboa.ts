import { capsule, circle, ellipse, smooth, translatePath, tube, type Pt } from '../core/paths';
import type { AnimalDef, PartNode, Shape } from '../core/types';

const DX = 34;
const DY = 16;
const AIR = 0.62;
const at = ([x, y]: Pt): Pt => [x + DX, y + DY];
const HIP: Pt = at([124, 150]);
const FOLDED: Pt[] = [at([140, 174]), at([104, 190]), at([168, 194])];
const STRETCHED: Pt[] = [at([100, 170]), at([72, 182]), at([30, 190])];

const shift = (d: string) => translatePath(d, DX, DY);

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
  const [ox, oy] = far ? [10, -3] : [0, 0];
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
          d: ellipse(hip[0] + dx * 0.4, hip[1] + dy * 0.4, len * 0.5 + 17, 21, angle),
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
            { d: capsule(knee[0], knee[1], heel[0], heel[1], 8, 5.5), fill: fur },
            { d: capsule(heel[0], heel[1], toe[0], toe[1], 5.5, 5), fill: fur },
          ];
        },
      },
    ],
  };
};

const arm = (id: string, far: boolean): PartNode => {
  const [ox, oy] = far ? [8, -4] : [0, 0];
  const fill = far ? 'furDark' : 'fur';
  return {
    id,
    role: id,
    behind: far,
    pivot: at([168 + ox, 132 + oy]),
    shapes: [
      { d: shift(capsule(168 + ox, 132 + oy, 178 + ox, 150 + oy, 5.5, 4.5)), fill },
      { d: shift(ellipse(181 + ox, 152 + oy, 5.5, 4.5)), fill },
    ],
  };
};

const ear = (id: string, base: Pt, angle: number, far: boolean): PartNode => {
  const a = (angle * Math.PI) / 180;
  const c: Pt = [base[0] + Math.cos(a) * 34, base[1] + Math.sin(a) * 34];
  const shapes: Shape[] = [
    { d: shift(ellipse(c[0], c[1], 38, 21, angle)), fill: far ? 'furDark' : 'fur' },
  ];
  if (!far) {
    shapes.push({
      d: shift(ellipse(c[0] + Math.cos(a) * 3, c[1] + Math.sin(a) * 3, 29, 13, angle)),
      kind: 'detail',
      fill: 'earInner',
    });
  }
  return {
    id,
    role: id,
    behind: true,
    pivot: at(base),
    phase: far ? 0.1 : 0,
    shapes,
  };
};

const TAIL: Pt[] = [
  [104, 154],
  [70, 170],
  [36, 176],
  [4, 170],
  [-16, 152],
];

const TUFT_BASE: Pt = [-16, 154];
const TUFT_ANGLE = -100;
const TUFT_LEN = 38;

const tuftPt = (u: number, v: number): Pt => {
  const a = (TUFT_ANGLE * Math.PI) / 180;
  return [
    TUFT_BASE[0] + Math.cos(a) * u * TUFT_LEN - Math.sin(a) * v,
    TUFT_BASE[1] + Math.sin(a) * u * TUFT_LEN + Math.cos(a) * v,
  ];
};

const TUFT = smooth(
  (
    [
      [0, 3],
      [0.3, 7.5],
      [0.62, 9],
      [0.88, 7],
      [1.04, 0],
      [0.88, -7],
      [0.62, -9],
      [0.3, -7.5],
      [0, -3],
    ] as Pt[]
  ).map(([u, v]) => tuftPt(u, v)),
);

const TUFT_BAND = tuftPt(0.2, 0);

const jerboa: AnimalDef = {
  id: 'jerboa',
  name: 'Jerboa',
  kind: 'animal',
  aliases: ['desert rat', 'jumping mouse', 'long eared jerboa', 'mouse'],
  group: 'mammal',
  habitats: ['desert'],
  box: [274, 216],
  size: 70,
  locomotion: 'hop',
  gait: { lift: 46 },
  sound: 'jerboa',
  palette: {
    fur: '#ecc995',
    furDark: '#d6b07a',
    belly: '#fff7ea',
    earInner: '#f7bfb6',
    tuft: '#33292a',
    tuftTip: '#ffffff',
    nose: '#ef9aa0',
    whisker: '#b9946a',
  },
  parts: [
    {
      id: 'body',
      role: 'body',
      pivot: at([130, 196]),
      shapes: [
        {
          d: shift(
            smooth([
              [116, 96],
              [146, 92],
              [170, 108],
              [178, 136],
              [170, 164],
              [146, 180],
              [116, 180],
              [96, 164],
              [92, 136],
              [98, 112],
            ]),
          ),
          fill: 'fur',
        },
        { d: shift(ellipse(152, 152, 20, 26, -20)), kind: 'detail', fill: 'belly' },
      ],
      children: [
        {
          id: 'tail',
          role: 'tail',
          behind: true,
          pivot: at([104, 154]),
          shapes: [
            { d: shift(tube(TAIL, (t) => 5.2 - 2 * t, 60)), fill: 'fur' },
            { d: shift(TUFT), fill: 'tuftTip' },
            { d: shift(circle(TUFT_BAND[0], TUFT_BAND[1], 15)), kind: 'detail', fill: 'tuft' },
          ],
        },
        backLeg('legBF', true),
        arm('legFF', true),
        {
          id: 'head',
          role: 'head',
          pivot: at([160, 110]),
          shapes: [
            {
              d: shift(
                smooth([
                  [158, 52],
                  [186, 52],
                  [208, 68],
                  [218, 90],
                  [214, 108],
                  [196, 120],
                  [170, 122],
                  [148, 112],
                  [140, 90],
                  [144, 66],
                ]),
              ),
              fill: 'fur',
            },
            { d: shift(ellipse(196, 108, 20, 11, -10)), kind: 'detail', fill: 'belly' },
            { d: shift(ellipse(190, 102, 8, 5)), kind: 'feature', fill: 'blush', opacity: 0.55 },
            { d: shift(circle(186, 80, 11)), kind: 'feature', fill: 'eye' },
            { d: shift(circle(190, 75.6, 4.2)), kind: 'feature', fill: 'shine' },
            { d: shift(ellipse(215, 92, 4.2, 3.4, 20)), kind: 'feature', fill: 'nose' },
            { d: shift('M214 96Q214 102 208 104'), kind: 'line', stroke: 'mouth', width: 2 },
            { d: shift('M204 99L226 95'), kind: 'line', stroke: 'whisker', width: 1.6 },
            { d: shift('M204 104L226 107'), kind: 'line', stroke: 'whisker', width: 1.6 },
          ],
          children: [ear('earF', [158, 62], -122, true), ear('earN', [172, 58], -98, false)],
        },
        backLeg('legBN', false),
        arm('legFN', false),
      ],
    },
  ],
};

export default jerboa;
