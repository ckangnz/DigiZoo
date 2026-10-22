import { capsule, circle, ellipse, smooth, spline, tube, type Pt } from '../core/paths';
import type { AnimalDef, PartNode, Shape } from '../core/types';

const GROUND = 150;
const HIP = 98;
const SAMPLES = 160;

const SPINE: Pt[] = [
  [246, 84],
  [216, 86],
  [186, 88],
  [156, 90],
  [128, 92],
  [100, 96],
  [74, 102],
  [50, 108],
  [30, 112],
  [16, 110],
  [8, 102],
];

const KEYS: Pt[] = [
  [0, 20],
  [0.1, 25],
  [0.24, 27],
  [0.36, 24],
  [0.46, 17],
  [0.58, 12.5],
  [0.72, 9],
  [0.86, 6.5],
  [1, 4.2],
];

function radius(t: number): number {
  const i = Math.max(0, KEYS.findIndex(([k]) => k >= t) - 1);
  const p0 = KEYS[Math.max(0, i - 1)];
  const p1 = KEYS[i];
  const p2 = KEYS[Math.min(KEYS.length - 1, i + 1)];
  const p3 = KEYS[Math.min(KEYS.length - 1, i + 2)];
  const u = p2[0] === p1[0] ? 0 : (t - p1[0]) / (p2[0] - p1[0]);
  const m1 = ((p2[1] - p0[1]) / (p2[0] - p0[0] || 1)) * (p2[0] - p1[0]);
  const m2 = ((p3[1] - p1[1]) / (p3[0] - p1[0] || 1)) * (p2[0] - p1[0]);
  const u2 = u * u;
  const u3 = u2 * u;
  return (
    (2 * u3 - 3 * u2 + 1) * p1[1] +
    (u3 - 2 * u2 + u) * m1 +
    (-2 * u3 + 3 * u2) * p2[1] +
    (u3 - u2) * m2
  );
}

function spine(phase: number): Pt[] {
  const s = Math.sin(2 * Math.PI * phase);
  const [ox, oy] = SPINE[4];
  return SPINE.map(([x, y], i) => {
    if (i <= 4) return [x, y] as Pt;
    const a = ((-5 * s * (i - 4)) / 6) * (Math.PI / 180);
    const dx = x - ox;
    const dy = y - oy;
    return [ox + dx * Math.cos(a) - dy * Math.sin(a), oy + dx * Math.sin(a) + dy * Math.cos(a)];
  });
}

function frame(phase: number) {
  const line = spine(phase);
  const pts = spline(line, SAMPLES);
  const at = (t: number) => {
    const i = Math.round(t * SAMPLES);
    const a = pts[Math.max(0, i - 1)];
    const b = pts[Math.min(SAMPLES, i + 1)];
    const len = Math.hypot(b[0] - a[0], b[1] - a[1]) || 1;
    return {
      p: pts[i],
      n: [-(b[1] - a[1]) / len, (b[0] - a[0]) / len] as Pt,
      u: [(b[0] - a[0]) / len, (b[1] - a[1]) / len] as Pt,
      r: radius(t),
    };
  };
  return { line, pts, at };
}

const CREST: [number, number][] = [
  [0.02, 15],
  [0.06, 17],
  [0.1, 16],
  [0.14, 13],
  [0.2, 14],
  [0.25, 15],
  [0.3, 14],
  [0.35, 12.5],
  [0.4, 11],
  [0.46, 9.5],
  [0.52, 8.5],
  [0.58, 7.5],
  [0.64, 6.5],
  [0.7, 6],
  [0.76, 5],
  [0.82, 4.5],
];

function crest(phase: number): Shape[] {
  const { at } = frame(phase);
  return CREST.map(([t, h]): Shape => {
    const { p, n, u, r } = at(t);
    const w = Math.max(3.6, h * 0.52);
    const base = r - 3;
    const b1: Pt = [p[0] + n[0] * base - u[0] * w, p[1] + n[1] * base - u[1] * w];
    const b2: Pt = [p[0] + n[0] * base + u[0] * w, p[1] + n[1] * base + u[1] * w];
    const tip: Pt = [
      p[0] + n[0] * (r + h) + u[0] * h * 0.35,
      p[1] + n[1] * (r + h) + u[1] * h * 0.35,
    ];
    return { d: smooth([b1, tip, b2], true, 0.3), fill: 'crest' };
  });
}

function body(phase: number): Shape[] {
  const { line, pts, at } = frame(phase);
  const spot = (t: number, up: number, s: number, fill = 'spot'): Shape => {
    const { p, n, r } = at(t);
    return {
      d: circle(p[0] + n[0] * r * up, p[1] + n[1] * r * up, Math.max(1.6, r * s)),
      kind: 'detail',
      fill,
    };
  };
  const bellyLine: Pt[] = pts.slice(0, 90).map((p, i) => {
    const { n, r } = at(i / SAMPLES);
    return [p[0] - n[0] * r * 0.95, p[1] - n[1] * r * 0.95];
  });
  const bands = [0.5, 0.6, 0.7, 0.8, 0.9].map((t): Shape => {
    const { p, u, r } = at(t);
    const angle = (Math.atan2(u[1], u[0]) * 180) / Math.PI;
    return { d: ellipse(p[0], p[1], 2.6, r + 2, angle), kind: 'detail', fill: 'band' };
  });
  return [
    { d: tube(line, radius, SAMPLES), fill: 'skin' },
    {
      d: tube(bellyLine, (t) => radius(t * (89 / SAMPLES)) * 0.5, 89),
      kind: 'detail',
      fill: 'belly',
    },
    ...bands,
    spot(0.05, 0.4, 0.1),
    spot(0.1, 0.05, 0.08),
    spot(0.14, 0.5, 0.09),
    spot(0.19, 0.15, 0.1),
    spot(0.24, 0.55, 0.08),
    spot(0.27, 0.05, 0.09),
    spot(0.32, 0.4, 0.1),
    spot(0.37, 0, 0.08),
    spot(0.42, 0.45, 0.1),
    spot(0.08, 0.7, 0.08, 'spotDark'),
    spot(0.17, 0.72, 0.08, 'spotDark'),
    spot(0.29, 0.72, 0.08, 'spotDark'),
    spot(0.4, 0.75, 0.09, 'spotDark'),
  ];
}

const leg = (id: string, x: number, far: boolean, front: boolean): PartNode => {
  const fill = far ? 'skinDark' : 'skin';
  const dir = front ? 1 : -1;
  const kx = x - 7 * dir;
  const ky = HIP + 24;
  const ax = x + 3 * dir;
  const ay = GROUND - 8;
  const toe = (dx: number, dy: number): Shape[] => [
    { d: capsule(ax, ay, ax + dx, ay + dy, 3.6, 2.8), fill },
    { d: circle(ax + dx, ay + dy, 3.8), fill: far ? 'skinDark' : 'pad' },
  ];
  return {
    id,
    role: id,
    behind: true,
    pivot: [x, HIP],
    shapes: [
      { d: capsule(x, HIP, kx, ky, 12, 9.5), fill },
      { d: capsule(kx, ky, ax, ay, 9.5, 7.5), fill },
      ...toe(19 * dir, 5),
      ...toe(8 * dir, 6.5),
      ...(far ? [] : toe(-4 * dir, 6.5)),
      ...toe(-14 * dir, 4.5),
      { d: ellipse(ax, ay + 1, 8, 6.5), fill },
    ],
  };
};

const tuatara: AnimalDef = {
  id: 'tuatara',
  name: 'Tuatara',
  kind: 'animal',
  aliases: ['lizard', 'living fossil', 'spiny lizard', 'reptile'],
  group: 'reptile',
  habitats: ['aussie'],
  box: [336, GROUND],
  size: 80,
  locomotion: 'walk4',
  gait: { period: 1.2, stride: 54, swing: 16 },
  sound: 'tuatara',
  palette: {
    skin: '#88a067',
    skinDark: '#6f8753',
    belly: '#cdd3a2',
    band: '#768d57',
    spot: '#c9d38f',
    spotDark: '#66794c',
    crest: '#ece6c2',
    pad: '#a6bb84',
    eyeRing: '#f2edc8',
    cheek: '#ff9cb0',
  },
  parts: [
    {
      id: 'body',
      role: 'body',
      pivot: [170, 120],
      frames: body,
      children: [
        { id: 'crest', behind: true, pivot: [170, 70], frames: crest },
        leg('legBF', 136, true, false),
        leg('legFF', 230, true, true),
        leg('legBN', 108, false, false),
        leg('legFN', 204, false, true),
        {
          id: 'head',
          role: 'head',
          pivot: [244, 86],
          shapes: [
            {
              d: smooth([
                [232, 72],
                [244, 52],
                [270, 42],
                [300, 46],
                [322, 60],
                [330, 80],
                [322, 98],
                [298, 108],
                [266, 110],
                [242, 102],
              ]),
              fill: 'skin',
            },
            { d: ellipse(290, 110, 38, 11, -4), kind: 'detail', fill: 'belly' },
            { d: circle(256, 58, 3), kind: 'detail', fill: 'spot' },
            { d: circle(246, 74, 2.6), kind: 'detail', fill: 'spot' },
            { d: circle(300, 52, 2.4), kind: 'detail', fill: 'spot' },
            { d: circle(284, 70, 16), kind: 'feature', fill: 'eyeRing' },
            { d: circle(285, 70, 12.4), kind: 'feature', fill: 'eye' },
            { d: circle(289.4, 65.2, 4.6), kind: 'feature', fill: 'shine' },
            { d: circle(281, 74.6, 1.9), kind: 'feature', fill: 'shine' },
            { d: ellipse(268, 92, 9, 5.5), kind: 'feature', fill: 'cheek', opacity: 0.75 },
            { d: circle(324, 70, 1.8), kind: 'feature', fill: 'spotDark' },
            { d: 'M327 88Q314 99 298 97', kind: 'line', stroke: 'mouth', width: 3 },
          ],
        },
      ],
    },
  ],
};

export default tuatara;
