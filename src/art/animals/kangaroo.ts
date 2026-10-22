import {
  capsule,
  circle,
  curve,
  ellipse,
  leaf,
  scalePath,
  smooth,
  translatePath,
  tube,
  type Pt,
} from '../core/paths';
import type { AnimalDef, PartNode, Shape } from '../core/types';

const AIR = 0.62;
const HIP: Pt = [128, 248];
const FOLDED: Pt[] = [
  [168, 284],
  [126, 318],
  [222, 322],
];
const STRETCHED: Pt[] = [
  [110, 292],
  [80, 318],
  [34, 336],
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
  const [ox, oy] = far ? [16, -6] : [0, 0];
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
      const shapes: Shape[] = [
        { d: capsule(knee[0], knee[1], heel[0], heel[1], 15, 10), fill: fur },
        { d: capsule(heel[0], heel[1], toe[0], toe[1], 10, 9), fill: fur },
        {
          d: ellipse(hip[0] + dx * 0.4, hip[1] + dy * 0.4, len * 0.5 + 26, 33, angle),
          fill: fur,
        },
      ];
      if (!far) {
        const a = Math.atan2(toe[1] - heel[1], toe[0] - heel[0]);
        const back = (k: number): Pt => [toe[0] - Math.cos(a) * k, toe[1] - Math.sin(a) * k];
        const [x1, y1] = back(16);
        const [x2, y2] = back(4);
        shapes.push({
          d: curve(x1, y1 + 2, x2, y2 + 3, 6),
          kind: 'line',
          stroke: 'toe',
          width: 2.2,
        });
      }
      return shapes;
    },
  };
};

const arm = (id: string, shoulder: Pt, elbow: Pt, paw: Pt, far: boolean): PartNode => {
  const fill = far ? 'furDark' : 'fur';
  return {
    id,
    role: id,
    behind: far,
    pivot: shoulder,
    shapes: [
      { d: capsule(shoulder[0], shoulder[1], elbow[0], elbow[1], 10.5, 8.5), fill },
      { d: capsule(elbow[0], elbow[1], paw[0], paw[1], 8.5, 7), fill },
      { d: ellipse(paw[0] + 3, paw[1] + 2, 8.5, 6.5, 40), fill },
    ],
  };
};

const HK = 1.2;
const HC: Pt = [196, 122];
const HDY = 6;
const hd = (d: string) => scalePath(translatePath(d, 0, HDY), HK, HK, HC[0], HC[1]);
const hpt = ([x, y]: Pt): Pt => [HC[0] + (x - HC[0]) * HK, HC[1] + (y + HDY - HC[1]) * HK];

const ear = (id: string, base: Pt, angle: number, far: boolean): PartNode => ({
  id,
  role: id,
  behind: true,
  pivot: hpt(base),
  phase: far ? 0.06 : 0,
  shapes: [
    {
      d: hd(leaf(base[0], base[1] + 4, far ? 46 : 52, far ? 13 : 15, angle)),
      fill: far ? 'furDark' : 'fur',
    },
    ...(far
      ? []
      : [
          {
            d: hd(leaf(base[0], base[1] + 2, 38, 7, angle)),
            kind: 'detail' as const,
            fill: 'earInner',
          },
        ]),
  ],
});

const TAIL: Pt[] = [
  [118, 252],
  [90, 276],
  [58, 302],
  [24, 322],
];

const joey: PartNode = {
  id: 'joey',
  pivot: [186, 230],
  motion: { rotate: 7, phase: 0.15 },
  shapes: [
    { d: leaf(174, 206, 24, 7.5, -114), fill: 'joey' },
    { d: leaf(188, 202, 27, 8, -80), fill: 'joey' },
    { d: circle(187, 214, 19.5), fill: 'joey' },
    { d: ellipse(199, 222, 10, 7), kind: 'detail', fill: 'belly' },
    { d: ellipse(184, 223, 5, 3.4), kind: 'feature', fill: 'blush', opacity: 0.6 },
    { d: circle(191, 209, 5.4), kind: 'feature', fill: 'eye' },
    { d: circle(193, 206.8, 2.1), kind: 'feature', fill: 'shine' },
    { d: ellipse(206, 216, 3.4, 2.7, 20), kind: 'feature', fill: 'nose' },
  ],
};

const pouch: PartNode = {
  id: 'pouch',
  pivot: [184, 240],
  shapes: [
    {
      d: smooth([
        [160, 228],
        [184, 232],
        [212, 224],
        [216, 246],
        [202, 266],
        [178, 270],
        [160, 256],
      ]),
      fill: 'belly',
    },
  ],
};

const offset = (parts: PartNode[], dx: number, dy: number): PartNode[] =>
  parts.map((p): PartNode => ({
    ...p,
    pivot: p.pivot && [p.pivot[0] + dx, p.pivot[1] + dy],
    shapes: p.shapes?.map((s) => ({ ...s, d: translatePath(s.d, dx, dy) })),
    frames:
      p.frames &&
      ((phase: number) => p.frames!(phase).map((s) => ({ ...s, d: translatePath(s.d, dx, dy) }))),
    children: p.children && offset(p.children, dx, dy),
  }));

const kangaroo: AnimalDef = {
  id: 'kangaroo',
  name: 'Kangaroo',
  kind: 'animal',
  aliases: ['roo', 'joey', 'wallaby', 'red kangaroo', 'kanga'],
  group: 'mammal',
  habitats: ['aussie'],
  box: [278, 334],
  size: 260,
  locomotion: 'hop',
  gait: { lift: 62, stride: 168, swing: 20, period: 0.8 },
  sound: 'kangaroo',
  palette: {
    fur: '#c98c58',
    furDark: '#ad7243',
    belly: '#f2d9b5',
    joey: '#dba36e',
    earInner: '#f0aa98',
    nose: '#4a2f25',
    toe: '#8f5d36',
  },
  parts: offset(
    [
      {
        id: 'tail',
        role: 'tail',
        pivot: TAIL[0],
        motion: { rotate: 14, wave: 'lift' },
        shapes: [{ d: tube(TAIL, (t) => 21 - 14 * t, 40), fill: 'fur' }],
      },
      hindLeg('legBF', true),
      {
        id: 'body',
        role: 'body',
        pivot: HIP,
        shapes: [
          {
            d: smooth([
              [100, 262],
              [94, 226],
              [106, 186],
              [128, 152],
              [148, 124],
              [164, 104],
              [194, 102],
              [208, 128],
              [216, 160],
              [220, 200],
              [212, 240],
              [192, 268],
              [152, 282],
              [114, 280],
            ]),
            fill: 'fur',
          },
          { d: ellipse(190, 212, 26, 62, -10), kind: 'detail', fill: 'belly' },
        ],
        children: [
          arm('legFF', [208, 152], [222, 176], [238, 182], true),
          {
            id: 'head',
            role: 'head',
            pivot: hpt([184, 122]),
            shapes: [
              {
                d: hd(
                  smooth([
                    [172, 100],
                    [176, 72],
                    [198, 54],
                    [228, 54],
                    [248, 68],
                    [262, 86],
                    [266, 100],
                    [258, 112],
                    [236, 120],
                    [206, 122],
                    [184, 116],
                  ]),
                ),
                fill: 'fur',
              },
              { d: hd(ellipse(246, 108, 20, 12, -12)), kind: 'detail', fill: 'belly' },
              {
                d: hd(ellipse(222, 102, 8, 5.2)),
                kind: 'feature',
                fill: 'blush',
                opacity: 0.55,
              },
              { d: hd(circle(222, 82, 8.8)), kind: 'feature', fill: 'eye' },
              { d: hd(circle(225.4, 78.4, 3.3)), kind: 'feature', fill: 'shine' },
              { d: hd(ellipse(262, 95, 5.2, 4.2, 20)), kind: 'feature', fill: 'nose' },
              { d: hd('M261 103Q259 110 250 111'), kind: 'line', stroke: 'mouth', width: 2.3 },
            ],
            children: [ear('earF', [192, 70], -108, true), ear('earN', [206, 64], -88, false)],
          },
          joey,
          pouch,
          arm('legFN', [198, 158], [210, 184], [228, 190], false),
        ],
      },
      hindLeg('legBN', false),
    ],
    -10,
    0,
  ),
};

export default kangaroo;
