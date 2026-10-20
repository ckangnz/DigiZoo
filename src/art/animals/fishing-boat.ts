import { capsule, circle, poly, smooth, spline, translatePath, tube, type Pt } from '../core/paths';
import type { AnimalDef, PartNode, Shape } from '../core/types';

const MAST_X = 150;
const MAST_TOP = 34;

const RAIL: Pt[] = [
  [26, 146],
  [54, 170],
  [100, 184],
  [150, 188],
  [200, 184],
  [246, 170],
  [276, 144],
];

const HULL: Pt[] = [
  [20, 130],
  [32, 152],
  [56, 172],
  [100, 184],
  [150, 188],
  [200, 184],
  [246, 170],
  [272, 148],
  [286, 122],
  [294, 132],
  [288, 162],
  [268, 196],
  [232, 220],
  [180, 234],
  [124, 234],
  [76, 222],
  [44, 198],
  [26, 168],
  [14, 140],
];

const PLANKS: Pt[][] = [
  [
    [24, 164],
    [60, 188],
    [100, 198],
    [150, 202],
    [200, 198],
    [246, 184],
    [286, 156],
  ],
  [
    [32, 184],
    [66, 205],
    [104, 214],
    [150, 217],
    [196, 214],
    [240, 202],
    [276, 178],
  ],
  [
    [46, 204],
    [80, 220],
    [112, 228],
    [150, 231],
    [190, 228],
    [226, 218],
    [262, 198],
  ],
];

const STRIPE_L: Pt[] = [
  [124, 40],
  [130, 100],
  [132, 140],
  [128, 182],
];
const STRIPE_R: Pt[] = [
  [174, 40],
  [184, 100],
  [184, 140],
  [176, 182],
];

const smallFish = (x: number, y: number, k: number, deg: number, flip: boolean): Shape[] => {
  const pts = (list: Pt[]): Pt[] =>
    list.map(([px, py]) => {
      const fx = flip ? -px : px;
      const a = (deg * Math.PI) / 180;
      return [
        x + k * (fx * Math.cos(a) - py * Math.sin(a)),
        y + k * (fx * Math.sin(a) + py * Math.cos(a)),
      ];
    });
  const eye = pts([[9, -2]])[0];
  return [
    {
      d: smooth(
        pts([
          [-10, 0],
          [-19, -8],
          [-20, 0],
          [-19, 8],
        ]),
      ),
      fill: 'finSmall',
    },
    {
      d: smooth(
        pts([
          [15, 0],
          [8, -7],
          [-4, -8],
          [-12, -3],
          [-14, 0],
          [-12, 3],
          [-4, 8],
          [8, 7],
        ]),
      ),
      fill: 'fishSmall',
    },
    { d: circle(eye[0], eye[1], 2.2 * k), kind: 'feature', fill: 'eye' },
  ];
};

const lerp = (a: Pt, b: Pt, t: number): Pt => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t];

const NET_TOP = spline(
  [
    [174, 184],
    [200, 182],
    [226, 176],
    [252, 164],
  ],
  40,
);
const NET_BOTTOM = spline(
  [
    [182, 238],
    [206, 248],
    [232, 244],
    [256, 228],
  ],
  40,
);

const edgeAt = (edge: Pt[], u: number): Pt => {
  const x = Math.max(0, Math.min(1, u)) * (edge.length - 1);
  const i = Math.min(edge.length - 2, Math.floor(x));
  return lerp(edge[i], edge[i + 1], x - i);
};

const netPoint = (u: number, v: number): Pt => {
  const sag = Math.sin(Math.PI * u) * 4 * v;
  const p = lerp(edgeAt(NET_TOP, u), edgeAt(NET_BOTTOM, u), v);
  return [p[0], p[1] + sag];
};

const meshLine = (c: number, dir: 1 | -1, slope: number): Shape | null => {
  const pts: Pt[] = [];
  for (let k = 0; k <= 24; k++) {
    const v = k / 24;
    const u = c + dir * slope * v;
    if (u < -0.001 || u > 1.001) continue;
    pts.push(netPoint(u, v));
  }
  if (pts.length < 2) return null;
  return { d: poly(pts, false), kind: 'line', stroke: 'net', width: 2.3 };
};

const NET_SLOPE = 0.5;
const NET_STEP = 0.21;

const netShapes = (): Shape[] => {
  const out: Shape[] = [];
  for (let c = -NET_SLOPE; c <= 1 + NET_SLOPE; c += NET_STEP) {
    const a = meshLine(c, 1, NET_SLOPE);
    const b = meshLine(c, -1, NET_SLOPE);
    if (a) out.push(a);
    if (b) out.push(b);
  }
  const bottom: Pt[] = Array.from({ length: 21 }, (_, k) => netPoint(k / 20, 1));
  out.push({
    d: poly(bottom, false),
    kind: 'line',
    stroke: 'net',
    width: 2.6,
  });
  return out;
};

const floats = (): Shape[] =>
  [0.08, 0.38, 0.68, 0.96].map((u) => {
    const [x, y] = netPoint(u, 0);
    return { d: circle(x, y + 1, 6), kind: 'feature', fill: 'cork', stroke: 'auto', width: 1.8 };
  });

const offset = (parts: PartNode[], dx: number, dy: number): PartNode[] =>
  parts.map((p): PartNode => ({
    ...p,
    pivot: p.pivot && [p.pivot[0] + dx, p.pivot[1] + dy],
    shapes: p.shapes?.map((s) => ({ ...s, d: translatePath(s.d, dx, dy) })),
    children: p.children && offset(p.children, dx, dy),
  }));

const fishingBoat: AnimalDef = {
  id: 'fishing-boat',
  name: 'Fishing Boat',
  kind: 'object',
  aliases: ['boat', 'galilee', 'peter', 'sailboat', 'fishing net'],
  group: 'bible',
  habitats: ['bible'],
  box: [284, 232],
  size: 260,
  locomotion: 'float',
  sound: 'fishing-boat',
  palette: {
    hull: '#c07e45',
    plank: '#9c6233',
    rail: '#8f5a32',
    mast: '#a8703f',
    sail: '#fbf3e0',
    sailStripe: '#e98a6c',
    flag: '#5fa8e0',
    rope: '#8d6b4a',
    net: '#6a5644',
    band: '#5fa3c9',
    sailLine: '#e6d9bf',
    fishSmall: '#8cc6ea',
    finSmall: '#62a2d6',
    cork: '#f3c46b',
  },
  parts: offset(
    [
      {
        id: 'hull',
        pivot: [150, 200],
        shapes: [
          { d: smooth(HULL), fill: 'hull' },
          { d: tube(PLANKS[0], 9, 60), kind: 'detail', fill: 'band' },
          ...PLANKS.map((pts) => ({
            d: tube(pts, 1.8, 60),
            kind: 'detail' as const,
            fill: 'plank',
          })),
        ],
        children: [
          {
            id: 'ropes',
            behind: true,
            shapes: [
              {
                d: `M${MAST_X} ${MAST_TOP + 4}L286 126`,
                kind: 'line',
                stroke: 'rope',
                width: 2,
              },
              {
                d: `M${MAST_X} ${MAST_TOP + 4}L22 134`,
                kind: 'line',
                stroke: 'rope',
                width: 2,
              },
            ],
          },
          {
            id: 'mast',
            behind: true,
            shapes: [{ d: capsule(MAST_X, 186, MAST_X, MAST_TOP, 5.5), fill: 'mast' }],
          },
          {
            id: 'flag',
            behind: true,
            pivot: [MAST_X, MAST_TOP],
            motion: { rotate: 7, freq: 2 },
            shapes: [
              {
                d: smooth([
                  [MAST_X, MAST_TOP - 9],
                  [MAST_X + 20, MAST_TOP - 6],
                  [MAST_X + 38, MAST_TOP - 1],
                  [MAST_X + 20, MAST_TOP + 3],
                  [MAST_X, MAST_TOP + 6],
                ]),
                fill: 'flag',
              },
            ],
          },
          {
            id: 'sail',
            behind: true,
            pivot: [MAST_X, 56],
            motion: { scaleX: 0.035, phase: 0.2 },
            shapes: [
              {
                d: smooth([
                  [96, 58],
                  [150, 56],
                  [206, 58],
                  [222, 90],
                  [226, 124],
                  [212, 158],
                  [180, 170],
                  [150, 166],
                  [116, 168],
                  [96, 158],
                  [86, 124],
                  [86, 90],
                ]),
                fill: 'sail',
              },
              { d: tube(STRIPE_L, 9.5, 40), kind: 'detail', fill: 'sailStripe' },
              { d: tube(STRIPE_R, 9.5, 40), kind: 'detail', fill: 'sailStripe' },
              {
                d: 'M104 72Q128 112 120 156',
                kind: 'line',
                stroke: 'sailLine',
                width: 2.2,
              },
              {
                d: 'M200 72Q216 112 198 154',
                kind: 'line',
                stroke: 'sailLine',
                width: 2.2,
              },
            ],
            children: [
              {
                id: 'yard',
                shapes: [{ d: capsule(86, 54, 216, 54, 4.6), fill: 'mast' }],
              },
            ],
          },
          {
            id: 'rail',
            shapes: [{ d: tube(RAIL, 6, 60), fill: 'rail' }],
          },
          {
            id: 'net',
            pivot: [214, 178],
            motion: { rotate: 1.6, phase: 0.3 },
            shapes: [...netShapes(), ...floats()],
            children: [
              { id: 'fish1', behind: true, shapes: smallFish(204, 231, 1.35, 8, true) },
              { id: 'fish2', behind: true, shapes: smallFish(238, 209, 1.3, -38, false) },
            ],
          },
        ],
      },
    ],
    -12,
    -22,
  ),
};

export default fishingBoat;
