import { capsule, circle, ellipse, smooth, translatePath, tube, type Pt } from '../core/paths';
import type { AnimalDef, PartNode, Shape } from '../core/types';

const AIR = 0.62;
const HIP: Pt = [100, 198];
const FOLDED: Pt[] = [
  [130, 214],
  [98, 234],
  [160, 236],
];
const STRETCHED: Pt[] = [
  [92, 224],
  [76, 244],
  [42, 256],
];

const ease = (x: number) => {
  const c = Math.min(1, Math.max(0, x));
  return c * c * (3 - 2 * c);
};

function stretch(phase: number): number {
  const p = phase - Math.floor(phase);
  if (p >= AIR) return 0;
  const t = p / AIR;
  return t < 0.5 ? ease(t / 0.3) : ease((1 - t) / 0.34);
}

const lerp = (a: Pt, b: Pt, k: number): Pt => [a[0] + (b[0] - a[0]) * k, a[1] + (b[1] - a[1]) * k];

function joints(phase: number, ox: number, oy: number): Pt[] {
  const k = stretch(phase);
  return FOLDED.map((p, i) => {
    const q = lerp(p, STRETCHED[i], k);
    return [q[0] + ox, q[1] + oy] as Pt;
  });
}

const hindLeg = (id: string, far: boolean): PartNode => {
  const [ox, oy] = far ? [14, -5] : [0, 0];
  const fur = far ? 'furDark' : 'fur';
  const hip: Pt = [HIP[0] + ox, HIP[1] + oy];
  return {
    id,
    role: id,
    pivot: hip,
    motion: null,
    frames: (phase) => {
      const [knee, heel, toe] = joints(phase, ox, oy);
      const dx = knee[0] - hip[0];
      const dy = knee[1] - hip[1];
      const len = Math.hypot(dx, dy);
      const angle = (Math.atan2(dy, dx) * 180) / Math.PI;
      return [
        { d: capsule(knee[0], knee[1], heel[0], heel[1], 11, 7.5), fill: fur },
        { d: capsule(heel[0], heel[1], toe[0], toe[1], 7.5, 7), fill: fur },
        {
          d: ellipse(hip[0] + dx * 0.4, hip[1] + dy * 0.4, len * 0.5 + 20, 25, angle),
          fill: fur,
        },
      ];
    },
  };
};

const paw = (id: string, shoulder: Pt, end: Pt, far: boolean): PartNode => {
  const fill = far ? 'furDark' : 'fur';
  return {
    id,
    role: id,
    behind: far,
    pivot: shoulder,
    shapes: [
      { d: capsule(shoulder[0], shoulder[1], end[0], end[1], 8.5, 6.5), fill },
      { d: ellipse(end[0] + 2, end[1] + 1, 7, 5.5, 30), fill },
    ],
  };
};

const ear = (id: string, x: number, y: number, tilt: number, far: boolean): PartNode => ({
  id,
  role: id,
  behind: true,
  pivot: [x, y + 14],
  phase: far ? 0.06 : 0,
  shapes: [
    { d: ellipse(x, y, 13, 17, tilt), fill: far ? 'furDark' : 'fur' },
    { d: ellipse(x, y + 2, 7, 10, tilt), kind: 'detail', fill: 'earInner' },
  ],
});

const TAIL: Pt[] = [
  [76, 206],
  [52, 222],
  [30, 234],
  [12, 238],
];

const offset = (parts: PartNode[], dx: number, dy: number): PartNode[] =>
  parts.map((p): PartNode => ({
    ...p,
    pivot: p.pivot && [p.pivot[0] + dx, p.pivot[1] + dy],
    shapes: p.shapes?.map((s) => ({ ...s, d: translatePath(s.d, dx, dy) })),
    frames:
      p.frames &&
      ((phase: number) =>
        p.frames!(phase).map((s): Shape => ({ ...s, d: translatePath(s.d, dx, dy) }))),
    children: p.children && offset(p.children, dx, dy),
  }));

const quokka: AnimalDef = {
  id: 'quokka',
  name: 'Quokka',
  kind: 'animal',
  aliases: ['happy quokka', 'smiling quokka', 'quakka', 'short-tailed scrub wallaby'],
  group: 'mammal',
  habitats: ['aussie'],
  box: [232, 196],
  size: 110,
  locomotion: 'hop',
  gait: { lift: 44, stride: 110, swing: 18, period: 0.7 },
  sound: 'quokka',
  palette: {
    fur: '#b09077',
    furDark: '#94765e',
    belly: '#e2cfb9',
    muzzle: '#cfb69e',
    earInner: '#d99d8e',
    nose: '#3e2c27',
  },
  parts: offset(
    [
      {
        id: 'tail',
        role: 'tail',
        pivot: TAIL[0],
        motion: { rotate: 12, wave: 'lift' },
        shapes: [{ d: tube(TAIL, (t) => 9 - 5 * t, 30), fill: 'fur' }],
      },
      hindLeg('legBF', true),
      {
        id: 'body',
        role: 'body',
        pivot: HIP,
        shapes: [
          {
            d: smooth([
              [62, 172],
              [74, 138],
              [104, 118],
              [142, 116],
              [170, 130],
              [184, 160],
              [182, 196],
              [162, 222],
              [120, 232],
              [82, 224],
              [60, 202],
            ]),
            fill: 'fur',
          },
          { d: ellipse(162, 190, 22, 36, -14), kind: 'detail', fill: 'belly' },
        ],
        children: [
          paw('legFF', [174, 166], [192, 188], true),
          paw('legFN', [166, 170], [182, 194], false),
          {
            id: 'head',
            role: 'head',
            pivot: [168, 146],
            shapes: [
              {
                d: smooth([
                  [178, 66],
                  [206, 74],
                  [222, 98],
                  [228, 124],
                  [212, 146],
                  [180, 154],
                  [148, 148],
                  [132, 126],
                  [136, 98],
                  [150, 74],
                ]),
                fill: 'fur',
              },
              { d: ellipse(181, 136, 26, 15), kind: 'detail', fill: 'muzzle' },
              { d: ellipse(150, 128, 9, 6), kind: 'feature', fill: 'blush', opacity: 0.55 },
              { d: ellipse(212, 125, 9, 6), kind: 'feature', fill: 'blush', opacity: 0.55 },
              { d: circle(162, 106, 8.4), kind: 'feature', fill: 'eye' },
              { d: circle(198, 104, 8.4), kind: 'feature', fill: 'eye' },
              { d: circle(165.2, 102.6, 3.2), kind: 'feature', fill: 'shine' },
              { d: circle(201.2, 100.6, 3.2), kind: 'feature', fill: 'shine' },
              {
                d: 'M175 116Q182 113 189 116Q187 122 182 124Q177 122 175 116Z',
                kind: 'feature',
                fill: 'nose',
              },
              { d: 'M182 124L182 129', kind: 'line', stroke: 'mouth', width: 2.2 },
              {
                d: 'M166 129Q182 133 198 128Q196 143 182 145Q168 143 166 129Z',
                kind: 'feature',
                fill: 'mouth',
              },
              { d: ellipse(182, 140, 7, 3.6), kind: 'feature', fill: 'tongue' },
            ],
            children: [ear('earF', 150, 70, -18, true), ear('earN', 204, 68, 16, false)],
          },
        ],
      },
      hindLeg('legBN', false),
    ],
    -6,
    -48,
  ),
};

export default quokka;
