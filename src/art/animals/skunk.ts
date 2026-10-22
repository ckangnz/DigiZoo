import { capsule, circle, ellipse, poly, smooth, spline, tube, type Pt } from '../core/paths';
import type { AnimalDef, PartNode } from '../core/types';

const HIP = 226;
const GROUND = 270;
const FACE_X = 264;

const leg = (id: string, x: number, far: boolean): PartNode => ({
  id,
  role: id,
  behind: true,
  pivot: [x, HIP],
  shapes: [
    { d: capsule(x, HIP - 6, x + 1, GROUND - 13, 14, 11.5), fill: far ? 'furDark' : 'fur' },
    { d: ellipse(x + 4, GROUND - 7.5, 15, 7.5), fill: far ? 'furDark' : 'fur' },
    ...(far
      ? []
      : [
          {
            d: `M${x + 7} ${GROUND - 5}L${x + 7} ${GROUND - 1}`,
            kind: 'line' as const,
            stroke: 'toe',
            width: 2.2,
          },
          {
            d: `M${x + 13} ${GROUND - 5}L${x + 13} ${GROUND - 1}`,
            kind: 'line' as const,
            stroke: 'toe',
            width: 2.2,
          },
        ]),
  ],
});

const TAIL_LINE: Pt[] = [
  [108, 198],
  [76, 174],
  [56, 134],
  [58, 90],
  [80, 56],
  [116, 40],
  [150, 46],
  [168, 66],
];

const tailRadius = (t: number) => 10 + 28 * Math.sin(Math.PI * Math.min(1, 0.15 + t * 0.95)) ** 0.7;

const fluff = (t: number) => 1 + 0.16 * Math.abs(Math.sin(Math.PI * 7 * t)) * Math.min(1, t * 6);

const plume = (line: Pt[], samples: number): string => {
  const pts = spline(line, samples);
  const m = pts.length;
  const inner: Pt[] = [];
  const outer: Pt[] = [];
  for (let i = 0; i < m; i++) {
    const a = pts[Math.max(0, i - 1)];
    const b = pts[Math.min(m - 1, i + 1)];
    const len = Math.hypot(b[0] - a[0], b[1] - a[1]) || 1;
    const nx = -(b[1] - a[1]) / len;
    const ny = (b[0] - a[0]) / len;
    const t = i / (m - 1);
    const r = tailRadius(t);
    inner.push([pts[i][0] + nx * r, pts[i][1] + ny * r]);
    outer.push([pts[i][0] - nx * r * fluff(t), pts[i][1] - ny * r * fluff(t)]);
  }
  const tip = pts[m - 1];
  const rt = tailRadius(1);
  const [ix, iy] = inner[m - 1];
  const base = Math.atan2(iy - tip[1], ix - tip[0]);
  const cap: Pt[] = [];
  for (let k = 1; k < 10; k++) {
    const a = base - (Math.PI * k) / 10;
    cap.push([tip[0] + Math.cos(a) * rt, tip[1] + Math.sin(a) * rt]);
  }
  return poly([...inner, ...cap, ...outer.reverse()]);
};

const TAIL = plume(TAIL_LINE, 140);
const TAIL_STRIPE = tube(
  TAIL_LINE,
  (t) => 0.4 * tailRadius(t) * Math.max(0, Math.min(1, (0.9 - t) / 0.2)),
  120,
);

const ear = (id: string, cx: number, cy: number): PartNode => ({
  id,
  role: id,
  behind: true,
  pivot: [cx, cy + 8],
  shapes: [
    { d: circle(cx, cy, 12), fill: 'fur' },
    { d: circle(cx, cy + 1, 6.5), kind: 'detail', fill: 'earInner' },
  ],
});

const skunk: AnimalDef = {
  id: 'skunk',
  name: 'Skunk',
  kind: 'animal',
  aliases: ['striped skunk', 'polecat', 'stinky'],
  group: 'mammal',
  habitats: ['forest'],
  box: [330, GROUND],
  size: 110,
  locomotion: 'walk4',
  gait: { period: 0.8, stride: 60, swing: 18 },
  sound: 'skunk',
  palette: {
    fur: '#3e3a4c',
    furDark: '#2f2c3b',
    stripe: '#fbfaff',
    eyeRing: '#ffffff',
    earInner: '#8c8499',
    nose: '#f59ab0',
    smile: '#f6b9c7',
    toe: '#6c667e',
  },
  parts: [
    {
      id: 'body',
      role: 'body',
      pivot: [180, HIP],
      shapes: [
        {
          d: smooth([
            [104, 196],
            [124, 168],
            [164, 156],
            [206, 158],
            [240, 172],
            [256, 200],
            [250, 230],
            [222, 246],
            [170, 250],
            [126, 244],
            [102, 226],
          ]),
          fill: 'fur',
        },
        {
          d: tube(
            [
              [252, 174],
              [212, 157],
              [168, 153],
              [128, 163],
              [100, 189],
            ],
            15,
            40,
          ),
          kind: 'detail',
          fill: 'stripe',
        },
      ],
      children: [
        {
          id: 'tail',
          role: 'tail',
          pivot: [110, 196],
          behind: true,
          motion: { rotate: 5, phase: 0.25 },
          shapes: [
            { d: TAIL, fill: 'fur' },
            { d: TAIL_STRIPE, kind: 'detail', fill: 'stripe' },
          ],
        },
        leg('legBF', 148, true),
        leg('legFF', 232, true),
        leg('legBN', 128, false),
        leg('legFN', 212, false),
        {
          id: 'head',
          role: 'head',
          pivot: [236, 214],
          shapes: [
            {
              d: smooth([
                [FACE_X, 128],
                [296, 134],
                [314, 156],
                [318, 184],
                [306, 208],
                [286, 222],
                [FACE_X, 226],
                [242, 222],
                [222, 208],
                [210, 184],
                [214, 156],
                [232, 134],
              ]),
              fill: 'fur',
            },
            { d: ellipse(FACE_X, 128, 24, 16), kind: 'detail', fill: 'stripe' },
            {
              d: tube(
                [
                  [FACE_X, 128],
                  [FACE_X, 156],
                  [FACE_X, 184],
                ],
                (t) => 11 - 6 * t,
                30,
              ),
              kind: 'detail',
              fill: 'stripe',
            },
            { d: ellipse(226, 200, 9.5, 6), kind: 'feature', fill: 'blush', opacity: 0.6 },
            { d: ellipse(302, 200, 9.5, 6), kind: 'feature', fill: 'blush', opacity: 0.6 },
            { d: circle(241, 178, 12), kind: 'feature', fill: 'eyeRing' },
            { d: circle(287, 178, 12), kind: 'feature', fill: 'eyeRing' },
            { d: circle(241.4, 178, 9.2), kind: 'feature', fill: 'eye' },
            { d: circle(286.6, 178, 9.2), kind: 'feature', fill: 'eye' },
            { d: circle(244.6, 174.4, 3.4), kind: 'feature', fill: 'shine' },
            { d: circle(289.8, 174.4, 3.4), kind: 'feature', fill: 'shine' },
            {
              d: `M${FACE_X - 9} 196Q${FACE_X} 191 ${FACE_X + 9} 196Q${FACE_X + 8} 204 ${FACE_X} 206Q${FACE_X - 8} 204 ${FACE_X - 9} 196Z`,
              kind: 'feature',
              fill: 'nose',
            },
            {
              d: `M${FACE_X - 9} 212Q${FACE_X - 4} 217 ${FACE_X} 211Q${FACE_X + 4} 217 ${FACE_X + 9} 212`,
              kind: 'line',
              stroke: 'smile',
              width: 2.4,
            },
          ],
          children: [ear('earN', 226, 140), ear('earF', 302, 140)],
        },
      ],
    },
  ],
};

export default skunk;
