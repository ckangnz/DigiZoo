import { capsule, circle, ellipse, smooth, spline, tube, type Pt } from '../core/paths';
import type { AnimalDef, PartNode, Shape } from '../core/types';

const SPINE: Pt[] = [
  [234, 58],
  [204, 61],
  [172, 64],
  [140, 67],
  [111, 70],
  [84, 74],
  [60, 75],
  [40, 68],
  [27, 53],
  [25, 36],
  [33, 22],
  [48, 16],
  [62, 21],
  [68, 34],
  [61, 45],
  [50, 44],
];
const SAMPLES = 150;
const HIP = 76;

const KEYS: Pt[] = [
  [0, 19],
  [0.08, 24],
  [0.2, 25],
  [0.3, 20],
  [0.4, 13.5],
  [0.5, 10],
  [0.65, 8],
  [0.8, 6.5],
  [1, 4.6],
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
  const [ox, oy] = SPINE[5];
  return SPINE.map(([x, y], i) => {
    if (i <= 5) return [x, y] as Pt;
    const a = ((-4 * s * (i - 5)) / 10) * (Math.PI / 180);
    const dx = x - ox;
    const dy = y - oy;
    return [ox + dx * Math.cos(a) - dy * Math.sin(a), oy + dx * Math.sin(a) + dy * Math.cos(a)];
  });
}

function body(phase: number): Shape[] {
  const line = spine(phase);
  const pts = spline(line, SAMPLES);
  const at = (t: number) => {
    const i = Math.round(t * SAMPLES);
    const a = pts[Math.max(0, i - 1)];
    const b = pts[Math.min(SAMPLES, i + 1)];
    const len = Math.hypot(b[0] - a[0], b[1] - a[1]) || 1;
    return { p: pts[i], n: [-(b[1] - a[1]) / len, (b[0] - a[0]) / len] as Pt, r: radius(t) };
  };
  const spot = (t: number, up: number, s: number): Shape => {
    const { p, n, r } = at(t);
    return {
      d: circle(p[0] + n[0] * r * up, p[1] + n[1] * r * up, r * s),
      kind: 'detail',
      fill: 'spot',
    };
  };
  const bellyLine: Pt[] = pts.slice(0, 80).map((p, i) => {
    const { n, r } = at(i / SAMPLES);
    return [p[0] - n[0] * r * 0.95, p[1] - n[1] * r * 0.95];
  });
  return [
    { d: tube(line, radius, SAMPLES), fill: 'skin' },
    {
      d: tube(bellyLine, (t) => radius(t * (79 / SAMPLES)) * 0.55, 79),
      kind: 'detail',
      fill: 'belly',
    },
    spot(0.06, 0.45, 0.24),
    spot(0.14, 0.15, 0.2),
    spot(0.2, 0.55, 0.22),
    spot(0.28, 0.2, 0.24),
    spot(0.37, 0.5, 0.26),
    spot(0.46, 0.1, 0.3),
    spot(0.56, 0.35, 0.34),
    spot(0.68, 0.1, 0.36),
    spot(0.8, 0.2, 0.36),
  ];
}

const leg = (id: string, x: number, far: boolean, front: boolean): PartNode => {
  const fill = far ? 'skinDark' : 'skin';
  const dir = front ? 1 : -1;
  const kx = x - 6 * dir;
  const ky = 95;
  const ax = x + 4 * dir;
  const ay = 105;
  const toe = (dx: number, dy: number): Shape[] => [
    { d: capsule(ax, ay, ax + dx, ay + dy, 3.2, 2.4), fill },
    { d: circle(ax + dx, ay + dy, 4), fill: far ? 'skinDark' : 'pad' },
  ];
  return {
    id,
    role: id,
    behind: true,
    pivot: [x, HIP],
    shapes: [
      { d: capsule(x, HIP, kx, ky, 10, 8), fill },
      { d: capsule(kx, ky, ax, ay, 8, 6.5), fill },
      ...toe(20 * dir, 8),
      ...toe(7 * dir, 9),
      ...(far ? [] : toe(-6 * dir, 9)),
      ...toe(-17 * dir, 6),
      { d: ellipse(ax, ay + 1, 6.5, 5.5), fill },
    ],
  };
};

const lizard: AnimalDef = {
  id: 'lizard',
  name: 'Lizard',
  aliases: ['gecko', 'leopard gecko'],
  group: 'reptile',
  habitats: ['desert'],
  box: [330, 118],
  size: 70,
  locomotion: 'walk4',
  gait: { stride: 50, swing: 18 },
  sound: 'lizard',
  palette: {
    skin: '#ffb63c',
    skinDark: '#ec9630',
    belly: '#ffe18a',
    spot: '#a3592b',
    pad: '#ffd36e',
    eyeRing: '#fff3c4',
  },
  parts: [
    {
      id: 'body',
      role: 'body',
      pivot: [170, 90],
      frames: body,
      children: [
        leg('legBF', 134, true, false),
        leg('legFF', 226, true, true),
        leg('legBN', 104, false, false),
        leg('legFN', 196, false, true),
        {
          id: 'head',
          role: 'head',
          pivot: [236, 60],
          shapes: [
            {
              d: smooth([
                [226, 54],
                [232, 30],
                [252, 14],
                [280, 10],
                [304, 18],
                [318, 34],
                [318, 52],
                [304, 66],
                [276, 73],
                [248, 71],
              ]),
              fill: 'skin',
            },
            { d: ellipse(278, 76, 44, 13), kind: 'detail', fill: 'belly' },
            { d: circle(256, 20, 5), kind: 'detail', fill: 'spot' },
            { d: circle(242, 36, 4), kind: 'detail', fill: 'spot' },
            { d: circle(275, 35, 16.5), kind: 'feature', fill: 'eyeRing' },
            { d: circle(276, 35, 13), kind: 'feature', fill: 'eye' },
            { d: circle(280.5, 30, 4.8), kind: 'feature', fill: 'shine' },
            { d: circle(271.5, 40.5, 2), kind: 'feature', fill: 'shine' },
            { d: ellipse(292, 56, 9, 5.5), kind: 'feature', fill: 'blush', opacity: 0.55 },
            { d: circle(311, 34, 1.8), kind: 'feature', fill: 'spot' },
            { d: 'M314 48Q300 62 282 57', kind: 'line', stroke: 'mouth', width: 3 },
          ],
        },
      ],
    },
  ],
};

export default lizard;
