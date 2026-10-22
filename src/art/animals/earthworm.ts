import { circle, curve, ellipse, rotatePath, spline, tube, type Pt } from '../core/paths';
import type { AnimalDef, Shape } from '../core/types';

const TAU = Math.PI * 2;
const GROUND = 150;
const N = 27;
const X0 = 24;
const LEN = 208;
const STRIDE = 28;
const DUTY = 0.5;
const SHIFT = STRIDE * DUTY;
const WAVES = 1.6;
const SQUEEZE = 0.75;
const RAISE: Pt[] = [
  [17, -3],
  [33, -14],
  [43, -32],
  [46, -52],
  [52, -70],
];
const NECK = [16.8, 17.4, 18.4, 21, 27];
const RINGS = 15;

const frac = (v: number) => v - Math.floor(v);
const smoothstep = (v: number) => v * v * (3 - 2 * v);
const lerp = (a: number, b: number, k: number) => a + (b - a) * k;

const girth = (s: number) => 8.5 + 7.5 * smoothstep(Math.min(1, s / 0.3));

function groundX(s: number, phase: number): number {
  const p = frac(phase + WAVES * s);
  const x = X0 + s * LEN;
  if (p < DUTY) return x + SHIFT / 2 - SHIFT * (p / DUTY);
  return x - SHIFT / 2 + SHIFT * smoothstep((p - DUTY) / (1 - DUTY));
}

interface Spine {
  pts: Pt[];
  radii: number[];
  nod: number;
}

function spine(phase: number): Spine {
  const xs: number[] = [];
  for (let i = 0; i < N; i++) xs.push(groundX(i / (N - 1), phase));
  const step = LEN / (N - 1);
  const radii = xs.map((_, i) => {
    const a = xs[Math.max(0, i - 1)];
    const b = xs[Math.min(N - 1, i + 1)];
    const span = (Math.min(N - 1, i + 1) - Math.max(0, i - 1)) * step;
    return girth(i / (N - 1)) * Math.pow((b - a) / span, -SQUEEZE);
  });
  const pts: Pt[] = xs.map((x, i) => [x, GROUND - radii[i]]);
  const anchor = pts[N - 1];
  const nod = (4 * Math.PI * Math.sin(TAU * (phase + 0.1))) / 180;
  const cos = Math.cos(nod);
  const sin = Math.sin(nod);
  const front = radii[N - 1];
  RAISE.forEach(([dx, dy], k) => {
    pts.push([anchor[0] + dx * cos - dy * sin, anchor[1] + dx * sin + dy * cos]);
    radii.push(lerp(front, NECK[k], Math.min(1, (k + 1) / 2)));
  });
  return { pts, radii, nod };
}

const radiusAt = (radii: number[]) => (t: number) => {
  const u = t * (radii.length - 1);
  const i = Math.min(radii.length - 2, Math.floor(u));
  return lerp(radii[i], radii[i + 1], u - i);
};

function body(phase: number): Shape[] {
  const { pts, radii, nod } = spine(phase);
  const r = radiusAt(radii);
  const dense = spline(pts, 160);
  const at = (t: number) => {
    const i = Math.round(t * (dense.length - 1));
    const a = dense[Math.max(0, i - 1)];
    const b = dense[Math.min(dense.length - 1, i + 1)];
    const len = Math.hypot(b[0] - a[0], b[1] - a[1]) || 1;
    return { c: dense[i], n: [-(b[1] - a[1]) / len, (b[0] - a[0]) / len] as Pt, r: r(t) };
  };
  const rings: Shape[] = [];
  for (let k = 1; k <= RINGS; k++) {
    const t = (k / (RINGS + 1)) * 0.84 + 0.03;
    const { c, n, r: rr } = at(t);
    const tx = -n[1];
    const ty = n[0];
    const a: Pt = [c[0] + n[0] * rr * 1.2, c[1] + n[1] * rr * 1.2];
    const m: Pt = [c[0] - tx * rr * 0.3, c[1] - ty * rr * 0.3];
    const b: Pt = [c[0] - n[0] * rr * 1.2, c[1] - n[1] * rr * 1.2];
    rings.push({ d: tube([a, m, b], 1.7, 12), kind: 'detail', fill: 'ring' });
  }
  const bandPts = dense.slice(Math.round(0.62 * dense.length), Math.round(0.72 * dense.length));
  const belly = dense
    .slice(0, Math.round(0.9 * dense.length))
    .map(([x, y], i) => [x, y + r(i / (dense.length - 1)) * 0.68] as Pt);
  const [hx, hy] = pts[pts.length - 1];
  const deg = (nod * 180) / Math.PI;
  const faceShapes: Shape[] = [
    { d: ellipse(hx - 12, hy + 13, 7, 4.6), kind: 'feature', fill: 'cheek', opacity: 0.8 },
    { d: ellipse(hx + 17, hy + 12, 4.4, 3.6), kind: 'feature', fill: 'cheek', opacity: 0.8 },
    { d: circle(hx - 2, hy - 3, 10.2), kind: 'feature', fill: 'eye' },
    { d: circle(hx + 17.5, hy - 4.5, 8.4), kind: 'feature', fill: 'eye' },
    { d: circle(hx + 1.8, hy - 7.2, 3.9), kind: 'feature', fill: 'shine' },
    { d: circle(hx + 20.6, hy - 8.2, 3.2), kind: 'feature', fill: 'shine' },
    { d: circle(hx - 4.6, hy + 1, 1.8), kind: 'feature', fill: 'shine' },
    { d: curve(hx + 2, hy + 12, hx + 14, hy + 11, 5), kind: 'line', stroke: 'mouth', width: 2.9 },
  ];
  const face = faceShapes.map((s) => ({ ...s, d: rotatePath(s.d, deg, hx, hy) }));
  return [
    { d: tube(pts, r, 160), fill: 'body' },
    { d: tube(belly, (t) => r(t * 0.9) * 0.36, 120), kind: 'detail', fill: 'belly' },
    ...rings,
    { d: tube(bandPts, (t) => r(0.62 + t * 0.1) + 3, 30), kind: 'detail', fill: 'band' },
    { d: ellipse(hx - 11, hy - 15, 10, 5.4, -30), kind: 'detail', fill: 'bodyHi' },
    ...face,
  ];
}

const earthworm: AnimalDef = {
  id: 'earthworm',
  name: 'Worm',
  kind: 'animal',
  aliases: ['worm', 'wiggly worm', 'earth worm', 'wormy'],
  group: 'bug',
  habitats: ['bugs'],
  box: [320, 150],
  size: 60,
  locomotion: 'slither',
  gait: { period: 1.3, stride: STRIDE },
  sound: 'earthworm',
  palette: {
    body: '#f7a2b6',
    bodyHi: '#ffd2dd',
    belly: '#fcc3d0',
    ring: '#e88aa1',
    band: '#ec8ea6',
    cheek: '#ff6f91',
  },
  parts: [{ id: 'body', frames: body }],
};

export default earthworm;
