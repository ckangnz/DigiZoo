import {
  circle,
  curve,
  ellipse,
  emptyBounds,
  extendBounds,
  f,
  leaf,
  poly,
  roundRect,
  samplePath,
  scallop,
  smooth,
  spline,
  tube,
  type Bounds,
  type Pt,
} from '../core/paths';
import {
  fern,
  hills,
  layered,
  linearGradient,
  moon,
  path,
  radialGlow,
  rock,
  scatter,
  scatterItems,
  starField,
  stroke,
  sun,
} from './props';
import { range, rng } from './rng';
import type { Mode, Palette, SceneDef } from './types';

const W = 3600;
const H = 2000;

type Blob = [number, number, number, number];
type Layer = [number, string][];
type Shape = [Bounds, Pt[]];
type Move = (pt: Pt) => Pt;

function limb(pts: Pt[], r0: number, r1: number, color: string, extra = ''): string {
  return path(
    tube(pts, (u) => r0 + (r1 - r0) * u, 18),
    color,
    extra,
  );
}

function liana(
  x: number,
  y: number,
  len: number,
  s: number,
  color: string,
  leafColor: string,
  seed: number,
): string {
  const r = rng(seed);
  const sway = (k: number) => x + Math.sin(k * 6 * 1.3 + seed) * 18 * s;
  const pts: Pt[] = [];
  for (let i = 0; i <= 6; i++) pts.push([sway(i / 6), y + (len * i) / 6]);
  let leaves = '';
  const n = Math.max(5, Math.round(len / (26 * s)));
  for (let i = 1; i < n; i++) {
    const k = i / n;
    const a = i % 2 ? 30 + range(r, -20, 20) : 150 + range(r, -20, 20);
    leaves += leaf(sway(k), y + len * k, 30 * s, 9 * s, a);
  }
  return path(tube(pts, 4.5 * s, 22), color) + path(leaves, leafColor);
}

function tuft(x: number, y: number, s: number, color: string): string {
  return path(
    [-112, -96, -84, -68]
      .map((a, i) => leaf(x + (i - 1.5) * 4 * s, y + 2, (34 + (i % 2) * 14) * s, 6 * s, a))
      .join(''),
    color,
  );
}

function canopy(
  x: number,
  y: number,
  s: number,
  blobs: Blob[],
  dark: string,
  mid: string,
  light: string,
): string {
  let out = '';
  for (const [dx, dy, rx, ry] of blobs) {
    out += path(
      scallop(x + dx * s, y + (dy + 20) * s, 1, 12, rx * 0.15 * s, dx, rx * s, ry * s),
      dark,
    );
  }
  for (const [dx, dy, rx, ry] of blobs) {
    out += path(
      scallop(
        x + (dx - 12) * s,
        y + dy * s,
        1,
        12,
        rx * 0.13 * s,
        dx + 15,
        rx * 0.92 * s,
        ry * 0.84 * s,
      ),
      mid,
    );
  }
  for (const [dx, dy, rx, ry] of blobs) {
    out += path(
      scallop(
        x + (dx - rx * 0.32) * s,
        y + (dy - ry * 0.34) * s,
        1,
        8,
        rx * 0.07 * s,
        0,
        rx * 0.4 * s,
        ry * 0.3 * s,
      ),
      light,
    );
  }
  return out;
}

function emergent(x: number, y: number, h: number, w: number, color: string): string {
  return (
    limb(
      [
        [x, y + 10],
        [x + w * 0.04, y - h * 0.5],
        [x - w * 0.02, y - h],
      ],
      w * 0.05,
      w * 0.03,
      color,
    ) +
    path(scallop(x - w * 0.02, y - h, 1, 11, w * 0.07, 0, w * 0.5, w * 0.2), color) +
    path(scallop(x - w * 0.22, y - h + w * 0.1, 1, 8, w * 0.06, 0, w * 0.3, w * 0.14), color) +
    path(scallop(x + w * 0.24, y - h + w * 0.12, 1, 8, w * 0.06, 0, w * 0.28, w * 0.13), color)
  );
}

function treeline(
  seed: number,
  baseY: number,
  amp: number,
  r0: number,
  r1: number,
  color: string,
): string {
  const r = rng(seed);
  let out = path(`M-100 ${baseY}H${W + 100}V${baseY + 400}H-100Z`, color);
  let x = -120;
  while (x < W + 120) {
    const rad = range(r, r0, r1);
    out += path(circle(x, baseY - range(r, 0, amp), rad), color);
    x += rad * range(r, 1, 1.45);
  }
  return out;
}

function mist(seed: number, y: number, h: number, opacity: number): string {
  const r = rng(seed);
  const top: Pt[] = [];
  const bottom: Pt[] = [];
  for (let i = 0; i <= 8; i++) {
    const x = -200 + (i * (W + 400)) / 8;
    top.push([x, y + range(r, -h * 0.25, h * 0.15)]);
    bottom.push([x, y + h + range(r, -h * 0.15, h * 0.25)]);
  }
  return path(
    smooth([...top, ...bottom.reverse()], true, 0.8),
    'url(#rfMist)',
    ` fill-opacity="${opacity}"`,
  );
}

function boulder(
  cx: number,
  cy: number,
  rx: number,
  ry: number,
  color: string,
  p: Palette,
  seed: number,
): string {
  const r = rng(seed);
  const pts: Pt[] = [];
  for (let i = 0; i < 10; i++) {
    const a = (i / 10) * Math.PI * 2;
    const k = range(r, 0.96, 1.04);
    pts.push([cx + Math.cos(a) * rx * k, cy + Math.sin(a) * ry * k * (Math.sin(a) > 0 ? 1.05 : 1)]);
  }
  return (
    path(smooth(pts), color) +
    path(
      ellipse(cx + rx * 0.24, cy + ry * 0.24, rx * 0.62, ry * 0.58),
      p.cliffDark,
      ' fill-opacity=".22"',
    ) +
    path(
      ellipse(cx - rx * 0.38, cy - ry * 0.4, rx * 0.32, ry * 0.2, -24),
      p.cliffLight,
      ' fill-opacity=".7"',
    ) +
    path(
      scallop(cx - rx * 0.08, cy - ry * 0.82, 1, 9, rx * 0.06, 0, rx * 0.56, ry * 0.18),
      p.mossDark,
    ) +
    path(scallop(cx - rx * 0.12, cy - ry * 0.88, 1, 9, rx * 0.055, 14, rx * 0.5, ry * 0.15), p.moss)
  );
}

function cliff(p: Palette): string {
  let out = '';
  [1760, 1930, 2470, 2640].forEach((x, i) => {
    out += path(scallop(x, 470 - (i % 2) * 30, 1, 10, 16, 0, 130, 64), p.far2);
  });
  out += path(roundRect(2080, 470, 236, 650, 60), p.cliffDark);
  const rocks: [number, number, number, number, boolean][] = [
    [1890, 560, 170, 120, true],
    [2050, 520, 130, 96, true],
    [2350, 520, 140, 100, false],
    [2520, 560, 170, 120, false],
    [1720, 740, 180, 130, true],
    [1960, 720, 160, 140, true],
    [2440, 720, 160, 140, false],
    [2690, 750, 190, 130, false],
    [1610, 950, 190, 150, true],
    [1880, 930, 200, 160, true],
    [2500, 930, 200, 160, false],
    [2780, 960, 190, 150, false],
  ];
  rocks.forEach(([x, y, rx, ry, lit], i) => {
    out += boulder(x, y, rx, ry, lit ? p.cliff : p.cliffShade, p, 40 + i);
  });
  out += canopy(
    0,
    0,
    1,
    [
      [1830, 450, 120, 54],
      [2020, 428, 100, 46],
      [2370, 428, 100, 46],
      [2560, 450, 120, 54],
    ],
    p.canopyDark,
    p.canopy,
    p.canopyLight,
  );
  out += liana(1760, 470, 260, 1, p.liana, p.lianaLeaf, 4);
  out += liana(1960, 460, 170, 0.9, p.liana, p.lianaLeaf, 7);
  out += liana(2420, 460, 210, 0.9, p.liana, p.lianaLeaf, 9);
  out += liana(2640, 480, 280, 1, p.liana, p.lianaLeaf, 12);
  out += fern(1600, 812, 0.6, p.fern, p.fernDark);
  out += fern(2790, 822, 0.6, p.fern, p.fernDark);
  out += fern(2080, 640, 0.45, p.fern, p.fernDark);
  out += bromeliad(1780, 620, 0.7, p);
  out += bromeliad(2600, 640, 0.7, p);
  out += bromeliad(1900, 800, 0.6, p);
  return out;
}

function waterfall(x: number, top: number, bottom: number, w: number, p: Palette): string {
  const h = bottom - top;
  let out = path(
    `M${f(x - w / 2)} ${f(top + 14)}Q${f(x)} ${f(top - 14)} ${f(x + w / 2)} ${f(top + 14)}C${f(x + w * 0.54)} ${f(top + h * 0.4)} ${f(x + w * 0.62)} ${f(top + h * 0.8)} ${f(x + w * 0.7)} ${f(bottom)}L${f(x - w * 0.7)} ${f(bottom)}C${f(x - w * 0.62)} ${f(top + h * 0.8)} ${f(x - w * 0.54)} ${f(top + h * 0.4)} ${f(x - w / 2)} ${f(top + 14)}Z`,
    p.water,
  );
  out += stroke(
    curve(x - w * 0.42, top + 20, x + w * 0.42, top + 20, -10),
    p.waterLight,
    Math.max(6, w * 0.08),
  );
  const r = rng(Math.round(x));
  const n = Math.max(3, Math.round(w / 28));
  for (let i = 0; i < n; i++) {
    const k = (i + 0.5) / n - 0.5;
    const y0 = top + range(r, 50, h * 0.3);
    const y1 = y0 + range(r, h * 0.25, h * 0.55);
    const sx = (yy: number) => x + k * w * (0.9 + 0.4 * ((yy - top) / h));
    out += stroke(
      `M${f(sx(y0))} ${f(y0)}L${f(sx(y1))} ${f(y1)}`,
      p.waterLight,
      Math.max(4, w * 0.05),
      ' stroke-opacity=".8"',
    );
  }
  return out;
}

function foam(x: number, y: number, w: number, p: Palette): string {
  const r = rng(Math.round(x + y));
  let out = '';
  for (let i = 0; i < 9; i++) {
    out += path(
      circle(x + range(r, -0.75, 0.75) * w, y + range(r, -30, 10), range(r, 0.16, 0.3) * w),
      p.foam,
      ' fill-opacity=".55"',
    );
  }
  out += path(scallop(x, y + 6, 1, 10, w * 0.12, 0, w * 0.85, w * 0.2), p.foam);
  return out;
}

function kapok(
  x: number,
  y: number,
  s: number,
  p: Palette,
  topY: number,
  blobs: Blob[],
  seed: number,
): string {
  const r = rng(seed);
  const fin = (sgn: number, h: number, d: number, color: string) =>
    path(
      `M${f(x + sgn * 36 * s)} ${f(y - h * s)}C${f(x + sgn * 44 * s)} ${f(y - h * 0.4 * s)} ${f(x + sgn * d * 0.5 * s)} ${f(y - 14 * s)} ${f(x + sgn * d * s)} ${f(y + 8)}L${f(x + sgn * 10 * s)} ${f(y + 8)}Z`,
      color,
    );
  let out = '';
  out += fin(-1, 230, 250, p.trunkDark);
  out += fin(1, 210, 270, p.trunkDark);
  const ht = y - topY;
  out += path(
    smooth(
      [
        [x - 80 * s, y + 8],
        [x - 66 * s, y - ht * 0.3],
        [x - 58 * s, y - ht * 0.65],
        [x - 50 * s, topY],
        [x + 50 * s, topY],
        [x + 58 * s, y - ht * 0.6],
        [x + 68 * s, y - ht * 0.3],
        [x + 84 * s, y + 8],
      ],
      false,
    ) + 'Z',
    p.trunk,
  );
  out += path(
    smooth(
      [
        [x + 20 * s, topY],
        [x + 50 * s, topY],
        [x + 58 * s, y - ht * 0.6],
        [x + 68 * s, y - ht * 0.3],
        [x + 84 * s, y + 8],
        [x + 36 * s, y + 8],
        [x + 30 * s, y - ht * 0.5],
      ],
      true,
      0.7,
    ),
    p.trunkDark,
    ' fill-opacity=".35"',
  );
  for (let i = 0; i < 4; i++) {
    const bx = x + range(r, -40, 30) * s;
    const y0 = y - range(r, 260, ht * 0.5);
    out += stroke(
      `M${f(bx)} ${f(y0)}L${f(bx + range(r, -6, 6) * s)} ${f(y0 - range(r, 120, 260) * s)}`,
      p.trunkLight,
      6 * s,
      ' stroke-opacity=".6"',
    );
  }
  for (let i = 0; i < 3; i++) {
    const gx = x + (-34 + i * 30) * s;
    out += stroke(
      curve(gx, y - 330 * s, gx + 8 * s, topY + 260 * s, 10 * s),
      p.trunkDark,
      5 * s,
      ' stroke-opacity=".3"',
    );
  }
  out += path(ellipse(x - 8 * s, y - ht * 0.42, 22 * s, 30 * s), p.trunkHole);
  out += fin(-1, 300, 190, p.trunkLight);
  out += fin(1, 280, 200, p.trunkLight);
  out += fin(-0.15, 190, 60, p.trunk);
  out += path(scallop(x - 40 * s, y - ht * 0.25, 1, 7, 8 * s, 0, 34 * s, 16 * s), p.moss);
  out += path(scallop(x + 46 * s, y - ht * 0.55, 1, 7, 8 * s, 0, 30 * s, 14 * s), p.moss);
  out += canopy(x, topY, s, blobs, p.canopyDark, p.canopy, p.canopyLight);
  return out;
}

function wrapVine(x: number, y0: number, y1: number, s: number, p: Palette): string {
  let stem = '';
  let leaves = '';
  const turns = Math.round((y0 - y1) / (150 * s));
  for (let i = 0; i < turns; i++) {
    const ya = y0 - i * 150 * s;
    const lx = x - 62 * s;
    const rx = x + 66 * s;
    stem += curve(lx, ya, rx, ya - 90 * s, 22 * s);
    leaves += leaf(lx, ya, 34 * s, 10 * s, 160) + leaf(rx, ya - 90 * s, 34 * s, 10 * s, -20);
    leaves += leaf(x, ya - 50 * s, 30 * s, 9 * s, i % 2 ? -60 : 120);
  }
  return (
    `<path d="${stem}" fill="none" stroke="${p.liana}" stroke-width="${f(9 * s)}" stroke-linecap="round"/>` +
    path(leaves, p.lianaLeaf)
  );
}

function branch(
  x0: number,
  y0: number,
  x1: number,
  y1: number,
  s: number,
  p: Palette,
  seed: number,
): string {
  const mx = (x0 + x1) / 2;
  const my = Math.min(y0, y1) - 26 * s;
  let out = limb(
    [
      [x0, y0],
      [mx, my],
      [x1, y1],
    ],
    30 * s,
    13 * s,
    p.trunk,
  );
  out += path(scallop(mx, my - 22 * s, 1, 7, 8 * s, 0, 70 * s, 14 * s), p.moss);
  out += canopy(
    x1,
    y1,
    s,
    [
      [0, -30, 130, 80],
      [80, 20, 100, 60],
    ],
    p.canopyDark,
    p.canopy,
    p.canopyLight,
  );
  const dir = Math.sign(x1 - x0);
  out += orchids(mx + dir * 40 * s, my + 20 * s, s, p, seed);
  return out;
}

function orchid(x: number, y: number, s: number, p: Palette): string {
  let out = '';
  for (const a of [-90, 30, 150]) {
    const rad = (a * Math.PI) / 180;
    out += path(
      ellipse(x + Math.cos(rad) * 11 * s, y + Math.sin(rad) * 11 * s, 11 * s, 7 * s, a),
      p.orchid,
    );
  }
  for (const a of [-20, -160]) {
    const rad = (a * Math.PI) / 180;
    out += path(
      ellipse(x + Math.cos(rad) * 12 * s, y + Math.sin(rad) * 12 * s, 12 * s, 9 * s, a),
      p.orchid,
    );
  }
  out += path(ellipse(x, y + 8 * s, 9 * s, 10 * s), p.orchidLip);
  out += path(circle(x, y - 1 * s, 4 * s), p.orchidCenter);
  return out;
}

function orchids(x: number, y: number, s: number, p: Palette, seed: number): string {
  const r = rng(seed);
  const pts: Pt[] = [
    [x, y],
    [x + 20 * s, y + 50 * s],
    [x + 6 * s, y + 110 * s],
  ];
  let out = stroke(smooth(pts, false), p.liana, 4 * s);
  const line = spline(pts, 10);
  for (const k of [3, 6, 9]) {
    out += orchid(line[k][0] + range(r, -10, 10) * s, line[k][1], s * range(r, 0.85, 1.05), p);
  }
  return out;
}

function bromeliad(x: number, y: number, s: number, p: Palette): string {
  let out = '';
  [-170, -145, -120, -60, -35, -10].forEach((a, i) => {
    out += path(
      leaf(x, y, (60 + (i % 3) * 14) * s, 12 * s, a),
      i % 2 ? p.bromeliadDark : p.bromeliad,
    );
  });
  out += path(leaf(x, y, 54 * s, 9 * s, -100), p.bromeliadCenter);
  out += path(leaf(x, y, 58 * s, 9 * s, -80), p.bromeliadCenter);
  out += path(leaf(x, y, 46 * s, 8 * s, -90), p.bromeliadTip);
  [-95, -85].forEach((a) => {
    out += path(leaf(x, y, 30 * s, 12 * s, a), p.bromeliad);
  });
  return out;
}

function archLeaf(
  x: number,
  y: number,
  len: number,
  width: number,
  angle: number,
  bend: number,
  color: string,
  vein: string,
): string {
  const mid: Pt[] = [[x, y]];
  const left: Pt[] = [];
  const right: Pt[] = [];
  const steps = 10;
  let px = x;
  let py = y;
  for (let i = 1; i <= steps; i++) {
    const t = i / steps;
    const a = ((angle + bend * t) * Math.PI) / 180;
    px += (Math.cos(a) * len) / steps;
    py += (Math.sin(a) * len) / steps;
    mid.push([px, py]);
    if (i < steps) {
      const w = width * Math.pow(Math.sin(Math.PI * t), 0.6);
      left.push([px - Math.sin(a) * w, py + Math.cos(a) * w]);
      right.push([px + Math.sin(a) * w, py - Math.cos(a) * w]);
    }
  }
  const outline: Pt[] = [[x, y], ...left, mid[steps], ...right.reverse()];
  return path(smooth(outline, true, 0.9), color) + stroke(smooth(mid, false), vein, width * 0.1);
}

function heliconia(x: number, y: number, s: number, p: Palette): string {
  let out = '';
  out += archLeaf(x, y, 190 * s, 34 * s, -150, -30, p.bananaDark, p.vein);
  out += archLeaf(x, y, 200 * s, 34 * s, -30, 30, p.banana, p.vein);
  const top: Pt = [x + 6 * s, y - 240 * s];
  out += stroke(curve(x, y, top[0], top[1], 10 * s), p.bananaDark, 7 * s);
  for (let i = 0; i < 6; i++) {
    const t = 0.32 + i * 0.12;
    const bx = x + (top[0] - x) * t;
    const by = y + (top[1] - y) * t;
    const side = i % 2 ? 1 : -1;
    const a = side > 0 ? -30 : -150;
    const len = (66 - i * 6) * s;
    out += path(leaf(bx, by, len, 17 * s, a), p.heliconia);
    const rad = (a * Math.PI) / 180;
    out += path(
      leaf(bx + Math.cos(rad) * len * 0.62, by + Math.sin(rad) * len * 0.62, len * 0.38, 7 * s, a),
      p.heliconiaTip,
    );
  }
  return out;
}

function buildMonstera(): [string, string] {
  const A = 92;
  const rad = (t: number) => A * (1 + Math.cos(t)) * (1 + 0.18 * Math.pow(Math.cos(t), 8));
  const at = (t: number): Pt => [rad(t) * Math.cos(t), rad(t) * Math.sin(t)];
  const exit = (px: number, py: number, ux: number, uy: number) => {
    let lo = 0;
    let hi = 400;
    for (let i = 0; i < 32; i++) {
      const mid = (lo + hi) / 2;
      const x = px + ux * mid;
      const y = py + uy * mid;
      if (Math.hypot(x, y) < rad(Math.atan2(y, x))) lo = mid;
      else hi = mid;
    }
    return lo;
  };
  const gap = 13;
  const upper: Pt[] = [];
  let theta = 0;
  const arc = (from: number, to: number, n: number) => {
    for (let k = 1; k <= n; k++) upper.push(at(from + ((to - from) * k) / n));
  };
  for (const [m, deg] of [
    [150, -40],
    [108, -58],
    [62, -80],
    [20, -110],
  ]) {
    const psi = (deg * Math.PI) / 180;
    const ux = Math.cos(psi);
    const uy = Math.sin(psi);
    const nx = -uy;
    const ny = ux;
    const sx = m + ux * 36;
    const sy = uy * 36;
    const edges = [1, -1].map((sg) => {
      const ex = sx + nx * sg * (gap / 2);
      const ey = sy + ny * sg * (gap / 2);
      const t = exit(ex, ey, ux, uy);
      const hit: Pt = [ex + ux * t, ey + uy * t];
      return { sg, start: [ex, ey] as Pt, hit, th: Math.atan2(hit[1], hit[0]) };
    });
    edges.sort((e1, e2) => e2.th - e1.th);
    arc(theta, edges[0].th, 5);
    for (let k = 0; k <= 6; k++) {
      const phi = (k / 6) * Math.PI;
      const c = Math.cos(phi) * (gap / 2) * edges[0].sg;
      const d = Math.sin(phi) * (gap / 2);
      upper.push([sx + nx * c - ux * d, sy + ny * c - uy * d]);
    }
    upper.push(edges[1].hit);
    theta = edges[1].th;
  }
  arc(theta, -Math.PI, 6);
  const lower = upper
    .slice(0, -1)
    .reverse()
    .map(([x, y]): Pt => [x, -y]);
  const tip = at(0);
  const full = poly([tip, ...upper, ...lower]);
  const half = poly([[0, 0], ...lower, tip]);
  return [full, half];
}

const [LEAF_FULL, LEAF_HALF] = buildMonstera();

function monsteraLeaf(
  x: number,
  y: number,
  s: number,
  angle: number,
  color: string,
  dark: string,
  vein: string,
): string {
  return (
    `<g transform="translate(${f(x)} ${f(y)}) rotate(${f(angle)}) scale(${f(s * 1.1)} ${f(s * 0.9)})">` +
    `<path d="${LEAF_FULL}" fill="${color}"/><path d="${LEAF_HALF}" fill="${dark}" fill-opacity=".35"/>` +
    `<path d="M-4 0Q100 -5 204 0" fill="none" stroke="${vein}" stroke-width="5" stroke-linecap="round"/>` +
    `</g>`
  );
}

function monstera(x: number, y: number, s: number, p: Palette, angles: number[]) {
  let stems = '';
  let leaves = '';
  angles.forEach((a, i) => {
    const rad = (a * Math.PI) / 180;
    const reach = (110 + (i % 2) * 40) * s;
    const lx = x + Math.cos(rad) * reach;
    const ly = y + Math.sin(rad) * reach;
    stems += stroke(curve(x, y, lx, ly, (a < -90 ? -1 : 1) * 20 * s), p.stem, 7 * s);
    leaves += monsteraLeaf(
      lx,
      ly,
      s * (0.78 + (i % 3) * 0.08),
      a + (a < -90 ? -25 : 25),
      i % 2 ? p.leafDark : p.leaf,
      i % 2 ? p.leafShade : p.leafDark,
      p.vein,
    );
  });
  return stems + leaves;
}

function bananaClump(x: number, y: number, s: number, p: Palette): string {
  const top: Pt = [x + 4 * s, y - 150 * s];
  let out = limb([[x, y + 4], [x + 6 * s, y - 80 * s], top], 18 * s, 12 * s, p.stem);
  const leaves: [number, number, number, boolean][] = [
    [-172, -36, 230, true],
    [-8, 40, 230, true],
    [-128, -34, 240, false],
    [-56, 34, 240, false],
    [-94, 12, 190, false],
  ];
  for (const [a, b, len, back] of leaves) {
    out += archLeaf(top[0], top[1], len * s, 44 * s, a, b, back ? p.bananaDark : p.banana, p.vein);
  }
  return out;
}

function mushroom(x: number, y: number, s: number, p: Palette, glow: boolean): string {
  let out = glow
    ? `<circle cx="${f(x)}" cy="${f(y - 20 * s)}" r="${f(60 * s)}" fill="url(#rfGlow)"/>`
    : '';
  out += path(roundRect(x - 6 * s, y - 26 * s, 12 * s, 28 * s, 6 * s), p.mushroomStem);
  out += path(
    `M${f(x - 24 * s)} ${f(y - 22 * s)}Q${f(x - 22 * s)} ${f(y - 52 * s)} ${f(x)} ${f(y - 52 * s)}Q${f(x + 22 * s)} ${f(y - 52 * s)} ${f(x + 24 * s)} ${f(y - 22 * s)}Z`,
    p.mushroom,
  );
  out += path(circle(x - 9 * s, y - 36 * s, 4 * s), p.mushroomDot);
  out += path(circle(x + 8 * s, y - 40 * s, 3 * s), p.mushroomDot);
  return out;
}

function mushrooms(x: number, y: number, s: number, p: Palette, glow: boolean): string {
  return (
    mushroom(x - 22 * s, y, s * 0.75, p, glow) +
    mushroom(x, y + 4 * s, s, p, glow) +
    mushroom(x + 26 * s, y + 2 * s, s * 0.6, p, glow)
  );
}

function log(x: number, y: number, len: number, s: number, p: Palette, glow: boolean): string {
  const rr = 40 * s;
  let out = path(roundRect(x - len / 2, y - rr * 2, len, rr * 2, rr), p.log);
  out += path(
    roundRect(x - len / 2 + rr, y - rr * 0.7, len - rr * 2, rr * 0.5, rr * 0.25),
    p.logDark,
    ' fill-opacity=".5"',
  );
  out += path(ellipse(x + len / 2 - rr * 0.5, y - rr, rr * 0.55, rr), p.logEnd);
  out += path(ellipse(x + len / 2 - rr * 0.5, y - rr, rr * 0.3, rr * 0.55), p.logRing);
  out += path(
    scallop(x - len * 0.12, y - rr * 2 + 4 * s, 1, 9, 9 * s, 0, len * 0.32, 14 * s),
    p.moss,
  );
  out += mushrooms(x + len * 0.18, y - rr * 1.85, s * 0.8, p, glow);
  out += fern(x - len * 0.38, y - rr * 1.6, 0.5 * s, p.fern, p.fernDark);
  return out;
}

function mossyRock(x: number, y: number, s: number, p: Palette): string {
  return (
    rock(x, y, s, p.rock, p.rockShade, p.rockLight) +
    path(scallop(x - 14 * s, y - 60 * s, 1, 8, 8 * s, 0, 44 * s, 12 * s), p.moss)
  );
}

function flowerHead(x: number, y: number, s: number, petal: string, center: string): string {
  let d = '';
  for (let i = 0; i < 5; i++) {
    const a = (i / 5) * Math.PI * 2 - Math.PI / 2;
    d += circle(x + Math.cos(a) * 9 * s, y + Math.sin(a) * 9 * s, 8 * s);
  }
  return path(d, petal) + path(circle(x, y, 6 * s), center);
}

function floorFlowers(p: Palette): [number, string][] {
  const r = rng(91);
  const colors = [p.flowerA, p.flowerB, p.flowerC, p.flowerD];
  const out: [number, string][] = [];
  for (let i = 0; i < 14; i++) {
    const cx = range(r, 60, W - 60);
    const cy = range(r, 1180, 1860);
    const color = colors[i % 4];
    for (let k = 0; k < 3; k++) {
      const x = cx + range(r, -50, 50);
      const y = cy + range(r, -14, 14);
      const sc = range(r, 0.8, 1.1) * (0.75 + (cy - 1100) / 1500);
      if (wet(x, y)) continue;
      out.push([
        y,
        stroke(`M${f(x)} ${f(y)}L${f(x)} ${f(y - 26 * sc)}`, p.fernDark, 4 * sc) +
          flowerHead(x, y - 30 * sc, sc, color, p.flowerCenter),
      ]);
    }
  }
  return out;
}

const RIVER: Pt[] = [
  [2160, 1130],
  [1960, 1210],
  [1720, 1320],
  [1580, 1480],
  [1680, 1660],
  [1600, 1860],
  [1570, 2140],
];
const riverR = (u: number) => 60 + 220 * Math.pow(u, 1.2);
const RIVER_PTS = spline(RIVER, 80);

function wet(x: number, y: number, margin = 30): boolean {
  if (((x - 2200) / (340 + margin)) ** 2 + ((y - 1132) / (84 + margin)) ** 2 < 1) return true;
  return RIVER_PTS.some(([px, py], i) => Math.hypot(x - px, y - py) < riverR(i / 80) + 30 + margin);
}

function scatterDry(
  seed: number,
  count: number,
  y0: number,
  y1: number,
  draw: (x: number, y: number, r: () => number) => string,
): [number, string][] {
  return scatterItems(seed, count, 0, W, y0, y1, (x, y, r) => {
    const svg = draw(x, y, r);
    return wet(x, y) ? '' : svg;
  });
}

function sunbeams(color: string): string {
  return [
    [1180, 130, 0.12],
    [1420, 80, 0.09],
    [1640, 150, 0.08],
    [2480, 110, 0.07],
  ]
    .map(([x, w, o]) =>
      path(
        poly([
          [x, -20],
          [x + w, -20],
          [x + w + 760, 1300],
          [x + 560, 1300],
        ]),
        color,
        ` fill-opacity="${o}"`,
      ),
    )
    .join('');
}

function river(p: Palette): string {
  const line = RIVER;
  const r = riverR;
  let out = path(ellipse(2200, 1132, 330, 74), p.bank);
  out += path(
    tube(line, (u) => r(u) + 16 + 20 * u),
    p.bank,
  );
  out += path(ellipse(2200, 1124, 304, 60), p.water);
  out += path(tube(line, r), p.water);
  out += stroke(ellipse(2200, 1128, 200, 34), p.waterLight, 6, ' stroke-opacity=".6"');
  const pts = spline(line, 80);
  const rr = rng(23);
  for (let i = 6; i < 76; i += 4) {
    const u = i / 80;
    const [px, py] = pts[i];
    const [qx, qy] = pts[i + 2];
    const dx = qx - px;
    const dy = qy - py;
    const len = Math.hypot(dx, dy) || 1;
    const off = range(rr, -0.55, 0.55) * r(u);
    const ox = (-dy / len) * off;
    const oy = (dx / len) * off;
    if (py + oy > H - 30) continue;
    out += stroke(
      curve(px + ox, py + oy, px + ox + dx * 1.2, py + oy + dy * 1.2, range(rr, -0.25, 0.25) * len),
      p.waterLight,
      3 + 8 * u,
      ' stroke-opacity=".75"',
    );
  }
  return out;
}

function fireflies(seed: number, count: number): Layer {
  return scatterItems(seed, count, 100, W - 100, 900, 1800, (x, y, r) => {
    const s = range(r, 0.7, 1.2);
    return (
      `<circle cx="${f(x)}" cy="${f(y)}" r="${f(26 * s)}" fill="url(#rfFly)"/>` +
      path(circle(x, y, 4.5 * s), '#efffd0')
    );
  }).map(([, svg]) => [H, svg]);
}

function glows(p: Palette): string {
  return (
    radialGlow('rfGlow', p.mushroom, 0.6) +
    radialGlow('rfFly', '#e9ffb0', 0.7) +
    radialGlow('rfSpray', p.foam, 0.45)
  );
}

function sunWithSpinningRays(x: number, y: number, r: number, p: Palette): string {
  const svg = sun(x, y, r, p.sun, p.sunRay, p.face);
  const rays = svg.match(new RegExp(`(<path[^>]*fill="${p.sunRay}"/>)+`))?.[0] ?? '';
  return svg.replace(rays, `<g data-spin="" style="transform-origin: ${x}px ${y}px">${rays}</g>`);
}

function transformer(transform: string, outer: Move): Move {
  let move = outer;
  for (const [, op, args] of transform.matchAll(/(\w+)\(([^)]*)\)/g)) {
    const [a, b = op === 'scale' ? a : 0] = args
      .trim()
      .split(/[\s,]+/)
      .map(Number);
    const prev = move;
    const cos = Math.cos((a * Math.PI) / 180);
    const sin = Math.sin((a * Math.PI) / 180);
    if (op === 'translate') move = ([x, y]) => prev([x + a, y + b]);
    else if (op === 'scale') move = ([x, y]) => prev([x * a, y * b]);
    else if (op === 'rotate') move = ([x, y]) => prev([x * cos - y * sin, x * sin + y * cos]);
  }
  return move;
}

function shapes(svg: string): Shape[] {
  const out: Shape[] = [];
  const stack: Move[] = [(pt) => pt];
  const add = (pts: Pt[]) => out.push([extendBounds(emptyBounds(), pts), pts]);
  const tags =
    /<g(?: transform="([^"]*)")?[^>]*>|<\/g>| d="([^"]+)"|<circle cx="([^"]+)" cy="([^"]+)" r="([^"]+)"/g;
  for (const m of svg.matchAll(tags)) {
    const move = stack[stack.length - 1];
    if (m[0] === '</g>') stack.pop();
    else if (m[0].startsWith('<g')) stack.push(m[1] ? transformer(m[1], move) : move);
    else if (m[2]) for (const d of m[2].split(/(?=M)/)) add(samplePath(d).map(move));
    else add(samplePath(circle(Number(m[3]), Number(m[4]), Number(m[5]))).map(move));
  }
  return out;
}

function inside([x, y]: Pt, poly: Pt[]): boolean {
  let hit = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const [ax, ay] = poly[i];
    const [bx, by] = poly[j];
    if (ay > y !== by > y && x < ax + ((bx - ax) * (y - ay)) / (by - ay)) hit = !hit;
  }
  return hit;
}

function overlap(a: Shape[], b: Shape[]): boolean {
  return a.some(([ab, ap]) =>
    b.some(
      ([bb, bp]) =>
        ab.minX < bb.maxX &&
        bb.minX < ab.maxX &&
        ab.minY < bb.maxY &&
        bb.minY < ab.maxY &&
        (ap.some((pt) => inside(pt, bp)) || bp.some((pt) => inside(pt, ap))),
    ),
  );
}

function undergrowth(p: Palette, mode: Mode): Layer {
  const night = mode === 'night';
  return [
    [1160, bananaClump(1280, 1160, 1, p)],
    [1150, bananaClump(3480, 1150, 1.1, p)],
    [1240, heliconia(860, 1240, 1.3, p)],
    [1200, heliconia(2740, 1200, 1.2, p)],
    [1560, monstera(150, 1560, 1, p, [-110, -60, -20])],
    [1420, bromeliad(640, 1420, 1.4, p)],
    [1640, bromeliad(2460, 1640, 1.5, p)],
    [1200, mossyRock(1840, 1200, 0.8, p)],
    [1700, mossyRock(1330, 1700, 1, p)],
    [1500, mossyRock(1900, 1500, 0.9, p)],
    [1380, mushrooms(560, 1380, 1, p, night)],
    [1360, fern(2300, 1360, 1, p.fern, p.fernDark)],
    [1760, fern(500, 1760, 1.2, p.fern, p.fernDark)],
    ...floorFlowers(p),
    ...scatterDry(14, 40, 1150, 1900, (x, y, r) =>
      tuft(x, y, 0.8 + r() * 0.6, r() < 0.5 ? p.fern : p.fernDark),
    ),
    ...(night ? fireflies(71, 18) : []),
  ];
}

const PROPS: Record<string, (p: Palette, mode: Mode) => Layer> = {
  waterfall: (p) => [[0, foam(2197, 1112, 150, p) + foam(2462, 1076, 56, p)]],
  'kapok-right': (p) => [
    [
      1230,
      kapok(
        3230,
        1230,
        1,
        p,
        90,
        [
          [60, -70, 430, 130],
          [-300, 90, 260, 100],
          [250, 80, 300, 110],
          [-60, 40, 260, 110],
          [-520, 170, 170, 90],
        ],
        8,
      ) +
        branch(3190, 540, 2800, 500, 1, p, 9) +
        liana(2680, 220, 560, 1.1, p.liana, p.lianaLeaf, 21) +
        bromeliad(3170, 780, 0.8, p) +
        orchids(3290, 900, 1, p, 25),
    ],
  ],
  'kapok-left': (p) => [
    [
      1250,
      kapok(
        430,
        1250,
        1,
        p,
        140,
        [
          [-200, 40, 330, 150],
          [200, 60, 320, 140],
          [0, -60, 380, 170],
          [440, 130, 220, 110],
          [-420, 120, 200, 110],
        ],
        3,
      ) +
        branch(470, 600, 900, 560, 1, p, 4) +
        wrapVine(424, 1130, 700, 1, p) +
        liana(990, 320, 480, 1.1, p.liana, p.lianaLeaf, 31) +
        liana(760, 360, 220, 1, p.liana, p.lianaLeaf, 33) +
        bromeliad(500, 840, 0.8, p) +
        orchids(372, 960, 1, p, 35),
    ],
  ],
  'monstera-right': (p) => [[1300, monstera(2930, 1300, 1, p, [-150, -100, -45])]],
  'monstera-left': (p) => [[1330, monstera(1180, 1330, 1, p, [-160, -120, -60, -20])]],
  heliconia: (p) => [[1520, heliconia(3420, 1520, 1.4, p)]],
  log: (p, mode) => [[1600, log(2900, 1600, 420, 1, p, mode === 'night')]],
  mushrooms: (p, mode) => [[1760, mushrooms(2250, 1760, 1.1, p, mode === 'night')]],
};

const owners: Partial<Record<Mode, string[]>> = {};

function ownersOf(p: Palette, mode: Mode, items: Layer): string[] {
  const ids = Object.keys(PROPS);
  const covers = ids.flatMap((id, k) =>
    PROPS[id](p, mode).map(([y, svg]): [number, number, Shape[]] => [k, y, shapes(svg)]),
  );
  return items.map(([y, svg]) => {
    const own = shapes(svg);
    let best = -1;
    for (const [k, cy, c] of covers) if (k > best && y > cy && overlap(own, c)) best = k;
    if (best >= 0) covers.push([best, y, own]);
    return ids[best] ?? '';
  });
}

function undergrowthOf(p: Palette, mode: Mode, id: string): Layer {
  const items = undergrowth(p, mode).sort((a, b) => a[0] - b[0]);
  const owner = (owners[mode] ??= ownersOf(p, mode, items));
  return items.filter((_, i) => owner[i] === id);
}

const standing = (id: string) => (p: Palette, mode: Mode) =>
  `<defs>${glows(p)}</defs>` + layered([...PROPS[id](p, mode), ...undergrowthOf(p, mode, id)]);

const rainforest: SceneDef = {
  id: 'rainforest',
  world: [W, H],
  horizon: 1000,
  ambient: { clouds: 3, stars: 36, fireflies: 26, birds: 2, leaves: 8 },
  defaults: [
    { animal: 'sloth', x: 720, y: 486 },
    { animal: 'jaguar', x: 1000, y: 1420 },
    { animal: 'butterfly', x: 1260, y: 1000 },
    { animal: 'frog', x: 1420, y: 1640 },
    { animal: 'parrot', x: 1760, y: 360, flip: true },
    { animal: 'capybara', x: 2600, y: 1240, flip: true },
    { animal: 'toucan', x: 2960, y: 420, flip: true },
    { animal: 'monkey', x: 2840, y: 1452, flip: true },
    { animal: 'hummingbird', x: 930, y: 960, scale: 1.2 },
    { animal: 'anteater', x: 560, y: 1700 },
    { animal: 'okapi', x: 2520, y: 1740, flip: true },
  ],
  day: {
    skyTop: '#5ec0c9',
    skyMid: '#a3dfd6',
    skyBottom: '#e0f5e8',
    sun: '#ffe066',
    sunRay: '#ffd23f',
    face: '#8a4b1f',
    beam: '#fffbe0',
    mist: '#f2fbf6',
    far: '#b3dccf',
    far2: '#98cfbd',
    canopyFar: '#86c5a8',
    cliff: '#7ea79b',
    cliffShade: '#6a9488',
    cliffLight: '#a2c6b9',
    cliffDark: '#4f7a72',
    canopy: '#3fa874',
    canopyDark: '#2d8d61',
    canopyLight: '#63c088',
    liana: '#4f7f45',
    lianaLeaf: '#5fae5c',
    water: '#45bce6',
    waterLight: '#c2f2fc',
    foam: '#ffffff',
    bank: '#6ea585',
    ground2: '#5fb382',
    ground: '#4ea673',
    groundLight: '#66b985',
    trunk: '#8d7260',
    trunkDark: '#6b5445',
    trunkLight: '#a98d79',
    trunkHole: '#4a3a32',
    moss: '#62b874',
    mossDark: '#4a9e63',
    leaf: '#36a874',
    leafDark: '#2a9467',
    leafShade: '#1d7350',
    vein: '#9fe0b4',
    stem: '#3f8f55',
    banana: '#5bb862',
    bananaDark: '#43a052',
    fern: '#3ea86e',
    fernDark: '#2a8a59',
    heliconia: '#ff5a3c',
    heliconiaTip: '#ffd23f',
    bromeliad: '#45b07c',
    bromeliadDark: '#2f9265',
    bromeliadCenter: '#ff4f86',
    bromeliadTip: '#ffb0c8',
    orchid: '#f39be9',
    orchidLip: '#b452d6',
    orchidCenter: '#ffe066',
    flowerA: '#ff6fa5',
    flowerB: '#ffb53d',
    flowerC: '#ffe14d',
    flowerD: '#b685ff',
    flowerCenter: '#fff3c4',
    mushroom: '#ff8a5c',
    mushroomDot: '#fff3e0',
    mushroomStem: '#f6ead2',
    rock: '#93b3a5',
    rockShade: '#78998c',
    rockLight: '#b9d3c7',
    log: '#9a7558',
    logDark: '#7a5a42',
    logEnd: '#e2c497',
    logRing: '#c49e72',
  },
  night: {
    skyTop: '#091235',
    skyMid: '#14275a',
    skyBottom: '#2b4676',
    sun: '#fff1c0',
    sunRay: '#ffe9a8',
    face: '#7a5a34',
    mist: '#a9bff0',
    far: '#3f5a8f',
    far2: '#395488',
    canopyFar: '#33507f',
    water: '#3460ad',
    waterLight: '#9cc4f4',
    foam: '#d4e4ff',
    mushroom: '#6ff2d2',
    mushroomDot: '#e8fff8',
    mushroomStem: '#b8f5e6',
    orchid: '#ffb3f6',
    orchidCenter: '#fff2a6',
    heliconia: '#ff8a6a',
    heliconiaTip: '#ffe08a',
    bromeliadCenter: '#ff86ad',
    flowerA: '#ffb0d0',
    flowerB: '#ffd08a',
    flowerC: '#fff2a0',
    flowerD: '#d4b8ff',
  },
  back: (p, mode) => {
    const night = mode === 'night';
    let out =
      `<defs>${linearGradient('rfSky', [
        [0, p.skyTop],
        [0.55, p.skyMid],
        [1, p.skyBottom],
      ])}${linearGradient('rfMist', [
        [0, p.mist, 0],
        [0.5, p.mist, 0.85],
        [1, p.mist, 0],
      ])}${glows(p)}</defs>` + `<rect width="${W}" height="${H}" fill="url(#rfSky)"/>`;
    if (night) out += starField(31, 60, 40, 40, W - 40, 640, '#fff6d6');
    const rf = rng(5);
    for (let i = 0; i < 9; i++) {
      const x = 120 + i * 420 + range(rf, -100, 100);
      out += emergent(x, 1000, range(rf, 420, 640), range(rf, 300, 420), p.far);
    }
    out += treeline(3, 860, 50, 60, 110, p.far);
    out += mist(11, 700, 220, 0.75);
    for (let i = 0; i < 7; i++) {
      const x = 260 + i * 520 + range(rf, -120, 120);
      out += emergent(x, 1010, range(rf, 300, 420), range(rf, 260, 340), p.far2);
    }
    out += treeline(7, 930, 40, 50, 90, p.canopyFar);
    out += cliff(p);
    out += waterfall(2197, 464, 1110, 150, p);
    out += waterfall(2462, 478, 1070, 46, p);
    out += mist(13, 900, 200, 0.6);
    if (!night) out += sunbeams(p.beam);
    out += hills(4, 1040, 30, W, H, p.ground2, 7);
    out += hills(8, 1100, 36, W, H, p.ground, 6);
    out += scatter(37, 12, 0, W, 1160, 1900, (x, y, r) =>
      path(ellipse(x, y, 130 + r() * 150, 30 + r() * 24), p.groundLight, ' fill-opacity=".7"'),
    );
    out += river(p);
    if (night) out += path(ellipse(2197, 1090, 300, 170), 'url(#rfSpray)');
    out += layered(undergrowthOf(p, mode, ''));
    return out;
  },
  front: (p) =>
    monstera(90, 2060, 1, p, [-75, -35]) +
    fern(760, 2024, 1.25, p.fern, p.fernDark) +
    heliconia(1180, 2070, 0.95, p) +
    fern(2150, 2024, 1.2, p.fern, p.fernDark) +
    bromeliad(2700, 2012, 1.5, p) +
    monstera(3520, 2060, 1, p, [-145, -105]),
  interactives: [
    {
      id: 'sun',
      box: [1226, -24, 508, 508],
      kind: 'spin',
      effect: 'sparkle',
      sound: 'shine',
      night: { kind: 'rock', effect: 'stars', sound: 'twinkle' },
      render: (p, mode) =>
        mode === 'day'
          ? sunWithSpinningRays(1480, 230, 96, p)
          : moon(1480, 230, 90, p.sun, p.sunRay, p.face),
    },
    {
      id: 'waterfall',
      box: [2044, 980, 488, 205],
      kind: 'pulse',
      effect: 'splash',
      sound: 'splash',
      render: standing('waterfall'),
    },
    {
      id: 'kapok-right',
      box: [2501, -166, 1333, 1466],
      origin: [3230, 1238],
      kind: 'shake',
      effect: 'leaves',
      sound: 'rustle',
      render: standing('kapok-right'),
    },
    {
      id: 'kapok-left',
      box: [-227, -136, 1362, 1454],
      origin: [430, 1258],
      kind: 'shake',
      effect: 'leaves',
      sound: 'rustle',
      render: standing('kapok-left'),
    },
    {
      id: 'monstera-right',
      box: [2628, 953, 614, 397],
      origin: [2930, 1300],
      kind: 'sway',
      effect: 'leaves',
      sound: 'rustle',
      render: standing('monstera-right'),
    },
    {
      id: 'monstera-left',
      box: [870, 1035, 657, 367],
      origin: [1180, 1330],
      kind: 'sway',
      effect: 'leaves',
      sound: 'rustle',
      render: standing('monstera-left'),
    },
    {
      id: 'heliconia',
      box: [3142, 1159, 570, 401],
      kind: 'bounce',
      effect: 'petals',
      sound: 'rustle',
      render: standing('heliconia'),
    },
    {
      id: 'log',
      box: [2667, 1426, 465, 194],
      kind: 'wiggle',
      sound: 'thump',
      render: standing('log'),
    },
    {
      id: 'mushrooms',
      box: [2157, 1657, 181, 170],
      kind: 'bounce',
      effect: 'sparkle',
      sound: 'boing',
      render: standing('mushrooms'),
    },
  ],
};

export default rainforest;
