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
  group,
  layered,
  linearGradient,
  moon,
  path,
  radialGlow,
  scatterItems,
  starField,
  stroke,
  sun,
} from './props';
import { range, rng } from './rng';
import type { Interactive, Mode, Palette, SceneDef } from './types';

const W = 3600;
const H = 2000;

const SUN: Pt = [1960, 300];
const OAK: Pt = [560, 1236];
const PINE: Pt = [3420, 1296];
const SNAG: Pt = [2290, 1128];
const POND: Pt = [2882, 1162];
const LODGE: Pt = [3016, 1146];
const LOG: Pt = [830, 1706];
const BERRY: Pt = [300, 1448];
const SHROOMS: Pt = [1390, 1806];

type Blob = [number, number, number, number];
type Layer = [number, string][];
type Shape = [Bounds, Pt[]];
type Move = (pt: Pt) => Pt;
type Tones = [string, string, string];

const backY = (x: number): number =>
  1052 + 12 * Math.sin(x / 260 + 1.2) + 6 * Math.sin(x / 90 + 0.5);
const farY = (x: number): number => 938 + 10 * Math.sin(x / 210 + 2);
const midY = (x: number): number => 1006 + 12 * Math.sin(x / 250 + 0.7);

const g = (n: number): number => Math.round(n * 10) / 10;

function landD(fn: (x: number) => number, step = 40): string {
  const pts: Pt[] = [];
  for (let x = -200; x <= W + 200; x += step) pts.push([x, fn(x)]);
  return `${smooth(pts, false)}L${W + 200} ${H + 60}L-200 ${H + 60}Z`;
}

function limb(pts: Pt[], r0: number, r1: number, color: string, extra = ''): string {
  return path(
    tube(pts, (u) => r0 + (r1 - r0) * u, 18),
    color,
    extra,
  );
}

function tuft(x: number, y: number, s: number, color: string): string {
  return path(
    [-112, -96, -84, -68]
      .map((a, i) => leaf(x + (i - 1.5) * 4 * s, y + 2, (34 + (i % 2) * 14) * s, 6 * s, a))
      .join(''),
    color,
  );
}

function canopy(blobs: Blob[], dark: string, mid: string, light: string): string {
  let out = '';
  for (const [x, y, rx, ry] of blobs) {
    out += path(scallop(x, y + ry * 0.15, 1, 11, rx * 0.17, x % 37, rx, ry), dark);
  }
  for (const [x, y, rx, ry] of blobs) {
    out += path(
      scallop(x - rx * 0.05, y, 1, 11, rx * 0.15, (x % 37) + 15, rx * 0.92, ry * 0.86),
      mid,
    );
  }
  for (const [x, y, rx, ry] of blobs) {
    out += path(
      scallop(x - rx * 0.3, y - ry * 0.32, 1, 7, rx * 0.08, 0, rx * 0.42, ry * 0.32),
      light,
    );
  }
  return out;
}

function mountain(
  id: string,
  x: number,
  base: number,
  w: number,
  h: number,
  p: Palette,
  snowy: boolean,
): string {
  const body =
    smooth(
      [
        [x - w / 2, base + 40],
        [x - w * 0.32, base - h * 0.42],
        [x - w * 0.15, base - h * 0.85],
        [x - w * 0.03, base - h],
        [x + w * 0.09, base - h * 0.95],
        [x + w * 0.23, base - h * 0.66],
        [x + w * 0.37, base - h * 0.32],
        [x + w / 2, base + 40],
      ],
      false,
    ) + 'Z';
  const ridge = smooth(
    [
      [x - w * 0.03, base - h - 30],
      [x + w * 0.02, base - h * 0.64],
      [x - w * 0.05, base - h * 0.3],
      [x + w * 0.04, base + 60],
    ],
    false,
  );
  const shade = `${ridge}L${f(x + w)} ${f(base + 60)}L${f(x + w)} ${f(base - h - 60)}Z`;
  const snow = smooth(
    [
      [x - w * 0.34, base - h - 80],
      [x + w * 0.34, base - h - 80],
      [x + w * 0.3, base - h * 0.71],
      [x + w * 0.19, base - h * 0.78],
      [x + w * 0.1, base - h * 0.7],
      [x + w * 0.01, base - h * 0.8],
      [x - w * 0.08, base - h * 0.72],
      [x - w * 0.19, base - h * 0.79],
      [x - w * 0.3, base - h * 0.69],
    ],
    true,
    0.6,
  );
  const inner = snowy
    ? path(shade, p.mountShade) +
      path(snow, p.snow) +
      group(path(shade, p.snowShade), '', ` clip-path="url(#${id}s)"`)
    : path(shade, p.mountShade);
  return (
    `<defs><clipPath id="${id}"><path d="${body}"/></clipPath><clipPath id="${id}s"><path d="${snow}"/></clipPath></defs>` +
    path(body, p.mount) +
    group(inner, '', ` clip-path="url(#${id})"`)
  );
}

function farRange(p: Palette): string {
  const peak = (x: number, base: number, w: number, h: number) =>
    smooth(
      [
        [x - w / 2, base + 40],
        [x - w * 0.26, base - h * 0.6],
        [x - w * 0.06, base - h],
        [x + w * 0.12, base - h * 0.9],
        [x + w * 0.3, base - h * 0.46],
        [x + w / 2, base + 40],
      ],
      false,
    ) + 'Z';
  return path(
    peak(860, 930, 1500, 290) + peak(1780, 930, 1100, 230) + peak(3100, 930, 1500, 330),
    p.mountFar,
  );
}

function mist(y: number, h: number, opacity: number): string {
  return `<rect x="-100" y="${y}" width="${W + 200}" height="${h}" fill="url(#fsMist)" fill-opacity="${opacity}"/>`;
}

function pen(x: number, y: number) {
  let px = g(x);
  let py = g(y);
  let d = `M${px} ${py}`;
  const api = {
    q(c: Pt, e: Pt) {
      const ex = g(e[0] - px);
      const ey = g(e[1] - py);
      d += `q${g(c[0] - px)} ${g(c[1] - py)} ${ex} ${ey}`;
      px += ex;
      py += ey;
      return api;
    },
    l(e: Pt) {
      const ex = g(e[0] - px);
      const ey = g(e[1] - py);
      d += `l${ex} ${ey}`;
      px += ex;
      py += ey;
      return api;
    },
    close: () => d + 'z',
  };
  return api;
}

function firTier(
  cx: number,
  ty: number,
  by: number,
  hw: number,
  bumps: number,
  droop: number,
  sag: number,
  oy = 0,
): string {
  const hgt = by - ty;
  const base = (u: number): Pt => [cx - hw + 2 * hw * u, by + oy + sag * Math.sin(Math.PI * u)];
  const d = pen(cx, ty + oy).q([cx - hw * 0.3, by + oy - hgt * 0.22], [cx - hw, by + oy]);
  for (let k = 0; k < bumps; k++) {
    const [xm, ym] = base((k + 0.5) / bumps);
    d.q([xm, ym + droop * 2], base((k + 1) / bumps));
  }
  return d.q([cx + hw * 0.3, by + oy - hgt * 0.22], [cx, ty + oy]).close();
}

function firShade(cx: number, ty: number, by: number, hw: number, sag: number): string {
  const hgt = by - ty;
  const d = pen(cx, ty).q([cx + hw * 0.3, by - hgt * 0.22], [cx + hw, by]);
  for (let u = 0.95; u >= 0.57; u -= 0.06) {
    d.l([cx - hw + 2 * hw * u, by + sag * Math.sin(Math.PI * u)]);
  }
  return d.q([cx + hw * 0.06, by - hgt * 0.5], [cx, ty]).close();
}

function firGlint(cx: number, ty: number, by: number, hw: number): string {
  const hgt = by - ty;
  return pen(cx - hw * 0.02, ty + hgt * 0.06)
    .q([cx - hw * 0.26, by - hgt * 0.32], [cx - hw * 0.8, by - hgt * 0.06])
    .q([cx - hw * 0.44, by - hgt * 0.22], [cx - hw * 0.1, ty + hgt * 0.34])
    .close();
}

function firD(x: number, base: number, h: number, w: number, n: number): string {
  const top = base - h;
  const step = h / n;
  let d = '';
  for (let i = n - 1; i >= 0; i--) {
    const ub = (i + 1) / n;
    const ut = i === 0 ? 0 : (i - 0.85) / n;
    d += firTier(
      x,
      top + h * ut,
      top + h * ub,
      (w / 2) * (0.14 + 0.86 * ub),
      2 + Math.round(ub * 2),
      step * 0.12,
      step * 0.08,
    );
  }
  return d;
}

function firRow(
  seed: number,
  fn: (x: number) => number,
  gap: number,
  h0: number,
  h1: number,
  color: string,
): string {
  const r = rng(seed);
  let d = '';
  for (let x = -60; x < W + 60; x += gap * range(r, 0.55, 1.15)) {
    const h = range(r, h0, h1);
    d += firD(x, fn(x) + range(r, 0, 14), h, h * range(r, 0.4, 0.5), 4);
  }
  return path(landD(fn), color) + path(d, color);
}

function midRow(p: Palette): string {
  const r = rng(17);
  let firs = '';
  let rounds = '';
  for (let x = -80; x < W + 80; x += range(r, 80, 150)) {
    if (r() < 0.32) {
      const rr = range(r, 56, 90);
      rounds += scallop(x, midY(x) - rr * 0.85, 1, 9, rr * 0.13, x % 40, rr, rr * 0.86);
    } else {
      const h = range(r, 190, 290);
      firs += firD(x, midY(x) + range(r, 0, 12), h, h * range(r, 0.42, 0.5), 5);
    }
  }
  return path(rounds, p.forestRound) + path(landD(midY), p.forestMid) + path(firs, p.forestMid);
}

function fir(
  x: number,
  y: number,
  h: number,
  w: number,
  n: number,
  c: Tones,
  p: Palette,
  cones = 0,
  shadow = true,
): string {
  const trunkH = h * 0.1;
  const top = y - h;
  const F = h - trunkH;
  const step = F / n;
  let out = shadow
    ? path(ellipse(x, y + 4, w * 0.36, w * 0.05), p.groundShade, ' fill-opacity=".45"')
    : '';
  out += limb(
    [
      [x, y + 6],
      [x + w * 0.004, y - trunkH - step],
    ],
    w * 0.055,
    w * 0.04,
    p.pineTrunk,
  );
  out += limb(
    [
      [x + w * 0.024, y + 4],
      [x + w * 0.02, y - trunkH - step],
    ],
    w * 0.022,
    w * 0.014,
    p.pineTrunkDark,
    ' fill-opacity=".55"',
  );
  for (let i = n - 1; i >= 0; i--) {
    const ub = (i + 1) / n;
    const ut = i === 0 ? 0 : (i - 0.85) / n;
    const ty = top + F * ut;
    const by = top + F * ub;
    const hw = (w / 2) * (0.14 + 0.86 * ub);
    const bumps = 2 + Math.round(ub * 3);
    const droop = step * 0.13;
    const sag = step * 0.1;
    out += path(firTier(x, ty, by, hw, bumps, droop, sag, step * 0.14), c[1]);
    out += path(firTier(x, ty, by, hw, bumps, droop, sag), c[0]);
    out += path(firShade(x, ty, by, hw, sag), c[1], ' fill-opacity=".5"');
    out += path(firGlint(x, ty, by, hw), c[2], ' fill-opacity=".6"');
  }
  const r = rng(Math.round(x + h));
  for (let i = 0; i < cones; i++) {
    const ub = range(r, 0.3, 0.95);
    const hw = (w / 2) * (0.14 + 0.86 * ub) * range(r, 0.3, 0.8) * (i % 2 ? 1 : -1);
    out += pinecone(x + hw, top + F * ub + step * 0.1, 1, p);
  }
  return out;
}

function pinecone(x: number, y: number, s: number, p: Palette): string {
  let out = stroke(`M${f(x)} ${f(y - 10 * s)}L${f(x)} ${f(y)}`, p.coneDark, 3 * s);
  out += path(ellipse(x, y + 14 * s, 10 * s, 16 * s), p.coneDark);
  for (let k = 0; k < 4; k++) {
    out += path(ellipse(x, y + (4 + k * 7) * s, (8 - Math.abs(k - 1.5) * 1.6) * s, 4 * s), p.cone);
  }
  return out;
}

const OAK_CROWN: Blob[] = [
  [262, 566, 196, 122],
  [862, 552, 196, 120],
  [560, 424, 276, 172],
  [250, 384, 184, 124],
  [884, 372, 176, 118],
  [416, 244, 206, 132],
  [716, 236, 204, 130],
  [566, 610, 226, 108],
];

function acorn(x: number, y: number, s: number, p: Palette): string {
  return (
    path(ellipse(x, y + 7 * s, 9 * s, 12 * s), p.acorn) +
    path(ellipse(x - 3 * s, y + 4 * s, 2.6 * s, 4 * s), '#ffffff', ' fill-opacity=".4"') +
    path(
      `M${f(x - 11 * s)} ${f(y + 1 * s)}Q${f(x)} ${f(y - 12 * s)} ${f(x + 11 * s)} ${f(y + 1 * s)}Q${f(x)} ${f(y + 5 * s)} ${f(x - 11 * s)} ${f(y + 1 * s)}Z`,
      p.acornCap,
    ) +
    stroke(`M${f(x)} ${f(y - 5 * s)}l${f(2 * s)} ${f(-6 * s)}`, p.acornCap, 2.5 * s)
  );
}

function oakTree(p: Palette): string {
  const [x, y] = OAK;
  const T = (pts: Pt[]): Pt[] => pts.map(([dx, dy]): Pt => [x + dx, y + dy]);
  let out = limb(
    T([
      [-14, -440],
      [-160, -560],
      [-300, -660],
    ]),
    46,
    16,
    p.oakTrunk,
  );
  out += limb(
    T([
      [12, -450],
      [160, -580],
      [300, -690],
    ]),
    44,
    16,
    p.oakTrunk,
  );
  out += limb(
    T([
      [0, -460],
      [-16, -640],
      [-30, -820],
    ]),
    40,
    14,
    p.oakTrunk,
  );
  out += limb(
    T([
      [-60, -24],
      [-150, -4],
      [-236, 12],
    ]),
    30,
    7,
    p.oakTrunk,
  );
  out += limb(
    T([
      [60, -24],
      [160, -2],
      [250, 13],
    ]),
    30,
    7,
    p.oakTrunk,
  );
  const trunk =
    smooth(
      T([
        [-200, 12],
        [-128, -6],
        [-94, -60],
        [-82, -180],
        [-76, -320],
        [-86, -440],
        [-122, -530],
        [-46, -572],
        [46, -572],
        [128, -530],
        [88, -440],
        [78, -320],
        [82, -180],
        [98, -60],
        [140, -6],
        [214, 12],
      ]),
      false,
    ) + 'Z';
  out += path(trunk, p.oakTrunk);
  out += path(
    smooth(
      T([
        [14, -560],
        [84, -500],
        [78, -320],
        [82, -180],
        [98, -60],
        [140, -6],
        [214, 12],
        [46, 12],
        [34, -140],
        [26, -320],
        [32, -470],
      ]),
      true,
      0.8,
    ),
    p.oakTrunkDark,
    ' fill-opacity=".4"',
  );
  out += path(scallop(x - 130, y - 4, 1, 8, 9, 0, 58, 14), p.moss);
  out += path(scallop(x + 150, y - 2, 1, 7, 8, 0, 46, 12), p.mossDark);
  for (const pts of [
    [
      [-40, -20],
      [-30, -160],
      [-42, -300],
      [-30, -440],
    ],
    [
      [0, -40],
      [8, -200],
      [-6, -340],
      [6, -480],
    ],
    [
      [40, -24],
      [34, -150],
      [44, -280],
    ],
  ] as Pt[][]) {
    out += stroke(smooth(T(pts), false), p.oakTrunkDark, 6, ' stroke-opacity=".35"');
  }
  out += path(ellipse(x - 22, y - 300, 24, 32), p.oakTrunkDark);
  out += path(ellipse(x - 20, y - 296, 15, 22), p.hole);
  out += limb(
    T([
      [50, -396],
      [250, -440],
      [450, -462],
      [640, -500],
    ]),
    30,
    11,
    p.oakTrunk,
  );
  out += limb(
    T([
      [70, -384],
      [250, -426],
      [450, -449],
      [628, -492],
    ]),
    14,
    5,
    p.oakTrunkDark,
    ' fill-opacity=".35"',
  );
  out += limb(
    T([
      [330, -452],
      [372, -520],
      [360, -566],
    ]),
    7,
    3,
    p.oakTrunk,
  );
  out += canopy(OAK_CROWN, p.oakDark, p.oak, p.oakLight);
  out += canopy(
    [
      [x + 668, y - 540, 84, 54],
      [x + 586, y - 528, 56, 38],
      [x + 366, y - 586, 48, 34],
    ],
    p.oakDark,
    p.oak,
    p.oakLight,
  );
  const r = rng(7);
  for (const [bx, by, rx, ry] of OAK_CROWN) {
    for (let i = 0; i < 9; i++) {
      const a = range(r, 0, Math.PI * 2);
      const k = Math.sqrt(range(r, 0.1, 0.8));
      const lx = bx + Math.cos(a) * rx * k * 0.8;
      const ly = by + Math.sin(a) * ry * k * 0.75;
      out += path(
        leaf(lx, ly, range(r, 18, 26), 6, range(r, -60, 60) + (i % 2 ? 180 : 0)),
        Math.sin(a) < 0 ? p.oakLight : p.oakDark,
        ' fill-opacity=".6"',
      );
    }
  }
  for (const [ax, ay] of [
    [300, 646],
    [454, 690],
    [680, 700],
    [812, 640],
    [520, 560],
    [640, 470],
    [380, 470],
    [960, 560],
  ]) {
    out += acorn(ax, ay, 1, p) + acorn(ax + 16, ay + 6, 0.9, p);
  }
  return out;
}

function birch(x: number, y: number, h: number, s: number, p: Palette, seed: number): string {
  const r = rng(seed);
  const lean = range(r, -24, 24) * s;
  const line: Pt[] = [
    [x, y + 4],
    [x + lean * 0.3, y - h * 0.5],
    [x + lean, y - h],
  ];
  const pts = spline(line, 30);
  let out = path(ellipse(x, y + 3, 56 * s, 9 * s), p.groundShade, ' fill-opacity=".45"');
  out += limb([pts[17], [pts[17][0] - 64 * s, pts[17][1] - 74 * s]], 5 * s, 2.5 * s, p.birch);
  out += limb([pts[21], [pts[21][0] + 58 * s, pts[21][1] - 62 * s]], 5 * s, 2.5 * s, p.birch);
  out += limb(line, 15 * s, 8 * s, p.birch);
  out += limb(
    line.map(([px, py]): Pt => [px + 6 * s, py]),
    6 * s,
    3 * s,
    p.birchShade,
    ' fill-opacity=".8"',
  );
  for (let k = 2; k < 27; k += 2) {
    const [px, py] = pts[k];
    const rad = (15 - 7 * (k / 30)) * s;
    const w = rad * range(r, 0.5, 1.1);
    const sx = px + range(r, -rad * 0.6, rad * 0.6 - w * 0.4);
    out += path(roundRect(sx - w / 2, py - 2.5 * s, w, 5 * s, 2.5 * s), p.birchMark);
  }
  const [tx, ty] = line[2];
  out += canopy(
    [
      [tx - 46 * s, ty + 60 * s, 72 * s, 62 * s],
      [tx + 50 * s, ty + 80 * s, 66 * s, 56 * s],
      [tx, ty + 16 * s, 78 * s, 66 * s],
      [tx - 6 * s, ty + 124 * s, 62 * s, 46 * s],
    ],
    p.birchLeafDark,
    p.birchLeaf,
    p.birchLeafLight,
  );
  return out;
}

function bracket(x: number, y: number, w: number, p: Palette): string {
  return (
    path(
      `M${f(x - 6)} ${f(y)}Q${f(x + w * 0.5)} ${f(y - w * 0.44)} ${f(x + w)} ${f(y + 2)}Q${f(x + w * 0.5)} ${f(y + w * 0.18)} ${f(x - 6)} ${f(y + 7)}Z`,
      p.fungus,
    ) + stroke(curve(x + 4, y - 3, x + w - 8, y - 1, w * 0.26), p.fungusLight, 4)
  );
}

function hollowTree(p: Palette, mode: Mode): string {
  const [x, y] = SNAG;
  const night = mode === 'night';
  const T = (pts: Pt[]): Pt[] => pts.map(([dx, dy]): Pt => [x + dx, y + dy]);
  let out = limb(
    T([
      [-56, -370],
      [-140, -452],
      [-206, -546],
    ]),
    24,
    9,
    p.snag,
  );
  out += limb(
    T([
      [60, -290],
      [124, -332],
      [176, -398],
    ]),
    18,
    7,
    p.snag,
  );
  out += canopy(
    [
      [x - 214, y - 574, 64, 44],
      [x - 170, y - 534, 44, 30],
    ],
    p.oakDark,
    p.oak,
    p.oakLight,
  );
  out += canopy([[x + 186, y - 418, 46, 32]], p.oakDark, p.oak, p.oakLight);
  const trunk =
    smooth(
      T([
        [-206, 10],
        [-112, -20],
        [-90, -130],
        [-80, -270],
        [-88, -410],
        [-82, -500],
        [-70, -556],
        [-44, -526],
        [-18, -578],
        [8, -536],
        [34, -590],
        [60, -548],
        [84, -566],
        [94, -476],
        [86, -330],
        [92, -190],
        [114, -40],
        [212, 10],
      ]),
      false,
    ) + 'Z';
  out += path(trunk, p.snag);
  out += path(
    smooth(
      T([
        [-62, -520],
        [-74, -420],
        [-66, -280],
        [-74, -140],
        [-96, -24],
        [-60, -30],
        [-44, -150],
        [-38, -290],
        [-46, -430],
      ]),
      true,
      0.8,
    ),
    p.snagLight,
    ' fill-opacity=".45"',
  );
  out += path(
    smooth(
      T([
        [30, -556],
        [84, -540],
        [94, -476],
        [86, -330],
        [92, -190],
        [114, -40],
        [212, 10],
        [60, 10],
        [40, -160],
        [34, -330],
        [40, -470],
      ]),
      true,
      0.8,
    ),
    p.snagDark,
    ' fill-opacity=".38"',
  );
  for (const pts of [
    [
      [-50, -30],
      [-40, -180],
      [-52, -330],
      [-40, -480],
    ],
    [
      [-10, -40],
      [-2, -150],
    ],
    [
      [50, -30],
      [44, -160],
      [54, -250],
    ],
    [
      [-30, -420],
      [-24, -500],
    ],
  ] as Pt[][]) {
    out += stroke(smooth(T(pts), false), p.snagDark, 6, ' stroke-opacity=".4"');
  }
  out += path(ellipse(x + 8, y - 542, 72, 16), p.hole);
  out += path(
    `M${f(x - 64)} ${f(y - 540)}Q${f(x + 8)} ${f(y - 514)} ${f(x + 80)} ${f(y - 540)}Q${f(x + 8)} ${f(y - 500)} ${f(x - 64)} ${f(y - 540)}Z`,
    p.snagLight,
  );
  const hx = x + 6;
  const hy = y - 312;
  if (night) {
    out += `<circle cx="${f(hx)}" cy="${f(hy)}" r="130" fill="url(#fsHollow)"/>`;
  }
  out += path(ellipse(hx, hy + 6, 60, 78), p.snagDark);
  out += path(ellipse(hx, hy, 56, 74), p.snagLight);
  out += path(ellipse(hx + 2, hy + 5, 42, 60), night ? p.hollowGlow : p.hole);
  if (night) {
    out += path(ellipse(hx + 4, hy + 12, 30, 42), p.fireGlow, ' fill-opacity=".8"');
    for (const [fx, fy] of [
      [-14, -16],
      [12, 8],
      [-6, 30],
      [16, -30],
    ]) {
      out += path(circle(hx + fx, hy + fy, 4), p.firefly);
    }
  }
  out += path(
    `M${f(hx - 46)} ${f(hy + 44)}Q${f(hx)} ${f(hy + 72)} ${f(hx + 48)} ${f(hy + 44)}Q${f(hx)} ${f(hy + 90)} ${f(hx - 46)} ${f(hy + 44)}Z`,
    p.snagLight,
  );
  out += bracket(x + 86, y - 214, 46, p) + bracket(x + 90, y - 176, 66, p);
  out += bracket(x + 94, y - 138, 50, p);
  out += path(scallop(x - 30, y - 560, 1, 9, 8, 0, 44, 12), p.moss);
  out += path(scallop(x + 60, y - 556, 1, 7, 7, 0, 30, 10), p.moss);
  out += path(scallop(x - 150, y + 2, 1, 9, 10, 0, 64, 16), p.mossDark);
  out += path(scallop(x - 154, y - 4, 1, 9, 9, 10, 56, 13), p.moss);
  out += path(scallop(x + 150, y + 2, 1, 8, 9, 0, 52, 14), p.moss);
  out += path(circle(x - 40, y - 190, 10), p.hole) + path(circle(x + 44, y - 454, 8), p.hole);
  return out;
}

const POND_PTS: Pt[] = [
  [2520, 1206],
  [2560, 1116],
  [2690, 1074],
  [2880, 1062],
  [3064, 1068],
  [3196, 1102],
  [3246, 1172],
  [3206, 1240],
  [2880, 1262],
  [2556, 1252],
];
const POND_D = smooth(POND_PTS);
const POND_POLY = samplePath(POND_D, 8);

const STREAM: Pt[] = [
  [2866, 1250],
  [2846, 1320],
  [2904, 1430],
  [3006, 1544],
  [2994, 1690],
  [3056, 1830],
  [3116, 2080],
];
const streamR = (u: number): number => 34 + 176 * Math.pow(u, 1.15);
const STREAM_PTS = spline(STREAM, 80);

function inside([x, y]: Pt, poly: Pt[]): boolean {
  let hit = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const [ax, ay] = poly[i];
    const [bx, by] = poly[j];
    if (ay > y !== by > y && x < ax + ((bx - ax) * (y - ay)) / (by - ay)) hit = !hit;
  }
  return hit;
}

function wet(x: number, y: number, margin = 30): boolean {
  if (inside([x, y], POND_POLY)) return true;
  if (POND_POLY.some(([px, py]) => Math.hypot(x - px, y - py) < margin + 10)) return true;
  return STREAM_PTS.some(
    ([px, py], i) => Math.hypot(x - px, y - py) < streamR(i / 80) + 24 + margin,
  );
}

function lilyPad(x: number, y: number, s: number, rot: number, p: Palette): string {
  const rx = 34 * s;
  const ry = 12 * s;
  const a0 = rot + 0.3;
  const a1 = rot - 0.3 + Math.PI * 2;
  const shape = (cy: number) =>
    `M${f(x)} ${f(cy)}L${f(x + Math.cos(a0) * rx)} ${f(cy + Math.sin(a0) * ry)}A${f(rx)} ${f(ry)} 0 1 1 ${f(x + Math.cos(a1) * rx)} ${f(cy + Math.sin(a1) * ry)}Z`;
  return path(shape(y + 4 * s), p.lilyDark) + path(shape(y), p.lily);
}

function waterLily(x: number, y: number, s: number, p: Palette): string {
  let out = '';
  for (const a of [-160, -20, -130, -50]) out += path(leaf(x, y, 22 * s, 8 * s, a), p.lilyFlower);
  out += path(ellipse(x, y - 6 * s, 8 * s, 5 * s), p.lilyCenter);
  for (const a of [-110, -70, -90]) out += path(leaf(x, y, 24 * s, 8 * s, a), p.lilyFlower);
  return out;
}

function reeds(x: number, y: number, s: number, p: Palette): string {
  let out = '';
  [-116, -102, -90, -78, -64].forEach((a, i) => {
    out += path(
      leaf(x + (i - 2) * 6 * s, y + 2, (62 + (i % 2) * 32) * s, 6 * s, a),
      i % 2 ? p.reedDark : p.reed,
    );
  });
  for (const [dx, h, lean] of [
    [-6, 118, -14],
    [8, 96, 16],
  ]) {
    out += stroke(
      `M${f(x + dx * s)} ${f(y)}Q${f(x + (dx + lean * 0.3) * s)} ${f(y - h * 0.6 * s)} ${f(x + (dx + lean) * s)} ${f(y - h * s)}`,
      p.reedDark,
      3.5 * s,
    );
    out += path(
      roundRect(x + (dx + lean) * s - 7 * s, y - (h + 6) * s, 14 * s, 32 * s, 7 * s),
      p.cattail,
    );
  }
  return out;
}

function lodge(p: Palette): string {
  const [x, y] = LODGE;
  const w = 118;
  const h = 128;
  const P: Pt[] = [
    [x - w, y + 6],
    [x - w * 0.86, y - h],
    [x + w * 0.86, y - h],
    [x + w, y + 6],
  ];
  const at = (t: number, k: number): Pt => {
    const u = 1 - t;
    const c = [u * u * u, 3 * u * u * t, 3 * u * t * t, t * t * t];
    const px = c.reduce((s, v, i) => s + v * P[i][0], 0);
    const py = c.reduce((s, v, i) => s + v * P[i][1], 0);
    return [x + (px - x) * k, y + 6 + (py - y - 6) * k];
  };
  const dome = `M${f(P[0][0])} ${f(P[0][1])}C${f(P[1][0])} ${f(P[1][1])} ${f(P[2][0])} ${f(P[2][1])} ${f(P[3][0])} ${f(P[3][1])}Z`;
  let out = path(ellipse(x, y + 8, w * 1.12, 15), p.waterDeep, ' fill-opacity=".45"');
  out += path(dome, p.mud);
  out += path(
    `M${f(x + 10)} ${f(y - h * 0.7)}C${f(x + w * 0.6)} ${f(y - h * 0.7)} ${f(x + w * 0.9)} ${f(y - h * 0.3)} ${f(x + w)} ${f(y + 6)}L${f(x + 20)} ${f(y + 6)}Z`,
    p.mudDark,
    ' fill-opacity=".45"',
  );
  const r = rng(41);
  const colors = [p.stick, p.stickDark, p.stickLight];
  [0.96, 0.78, 0.6, 0.42, 0.24].forEach((k, row) => {
    let t = row % 2 ? 0.02 : 0.08;
    while (t < 0.96) {
      const t1 = Math.min(0.98, t + range(r, 0.2, 0.32) / (0.6 + k * 0.4));
      const a = at(t, k);
      const m = at((t + t1) / 2, k);
      const b = at(t1, k);
      const rad = range(r, 6, 8) * (0.7 + k * 0.3);
      out += limb([a, m, b], rad, rad * 0.85, colors[Math.floor(r() * 3)]);
      out += path(ellipse(b[0], b[1], rad * 0.55, rad * 0.8), p.stickEnd);
      t = t1 + range(r, 0.01, 0.04);
    }
  });
  for (const [t, len, dir] of [
    [0.34, 30, -1],
    [0.58, 26, 1],
  ]) {
    const [sx, sy] = at(t, 0.9);
    const a = ((-90 + dir * 32) * Math.PI) / 180;
    out += limb(
      [
        [sx, sy + 10],
        [sx + Math.cos(a) * len, sy + 10 + Math.sin(a) * len],
      ],
      5,
      3.5,
      p.stickDark,
    );
  }
  out += stroke(
    curve(x - w * 1.06, y + 7, x + w * 1.06, y + 7, -6),
    p.waterLight,
    5,
    ' stroke-opacity=".75"',
  );
  return out;
}

function pondWater(p: Palette, mode: Mode): string {
  const rim = smooth(
    POND_PTS.map(([px, py]): Pt => [
      POND[0] + (px - POND[0]) * 1.04,
      POND[1] + (py - POND[1]) * 1.18 + 2,
    ]),
  );
  let out =
    `<defs>${linearGradient('fsPond', [
      [0, p.waterFar],
      [1, p.water],
    ])}</defs>` +
    path(rim, p.bank) +
    path(POND_D, 'url(#fsPond)');
  for (const [x0, y0, x1, wd] of [
    [2620, 1100, 2780, 6],
    [2880, 1088, 3000, 5],
    [2690, 1150, 2850, 7],
    [2900, 1196, 3060, 6],
    [2600, 1214, 2680, 5],
    [3090, 1120, 3170, 5],
  ]) {
    out += stroke(curve(x0, y0, x1, y0, -3), p.waterLight, wd, ' stroke-opacity=".7"');
  }
  if (mode === 'night') {
    out += stroke(curve(2700, 1124, 2840, 1124, -2), p.glint, 5, ' stroke-opacity=".5"');
    out += stroke(curve(2740, 1170, 2800, 1170, -2), p.glint, 4, ' stroke-opacity=".4"');
  }
  out += lilyPad(2654, 1148, 1, 0.5, p) + lilyPad(2726, 1186, 0.8, 2.2, p);
  out += lilyPad(2604, 1204, 0.9, 4, p) + lilyPad(2806, 1118, 0.7, 1.2, p);
  out += waterLily(2656, 1142, 1, p) + waterLily(2606, 1198, 0.8, p);
  out += lodge(p);
  out += reeds(2552, 1222, 1, p) + reeds(3230, 1204, 1.1, p) + reeds(3176, 1232, 0.8, p);
  return out;
}

const DAM_X0 = 2532;
const DAM_X1 = 3232;
const DAM_BOT = 1284;
const damTop = (x: number): number =>
  1226 -
  6 * Math.sin((Math.PI * (x - DAM_X0)) / (DAM_X1 - DAM_X0)) +
  4 * Math.sin((x - DAM_X0) / 40);

function dam(p: Palette): string {
  const pts: Pt[] = [];
  for (let x = DAM_X0; x <= DAM_X1; x += 24) pts.push([x, damTop(x) - 6]);
  const mound = `${smooth([[DAM_X0 - 40, DAM_BOT], ...pts, [DAM_X1 + 40, DAM_BOT]], false)}Z`;
  let out = path(mound, p.mud);
  const r = rng(29);
  const colors = [p.stick, p.stickDark, p.stickLight];
  for (let i = 0; i < 7; i++) {
    const cx = DAM_X0 + 40 + ((DAM_X1 - DAM_X0 - 80) * (i + range(r, 0.2, 0.8))) / 7;
    if (Math.abs(cx - 2866) < 70) continue;
    const a = ((-90 + range(r, 18, 40) * (i % 2 ? 1 : -1)) * Math.PI) / 180;
    const len = range(r, 44, 70);
    const sy = damTop(cx) + 4;
    out += limb(
      [
        [cx, sy],
        [cx + Math.cos(a) * len, sy + Math.sin(a) * len],
      ],
      6,
      4,
      colors[i % 3],
    );
  }
  for (let row = 2; row >= 0; row--) {
    let x = DAM_X0 - 28 + row * 18 + range(r, 0, 20);
    while (x < DAM_X1 + 20 - row * 14) {
      const len = range(r, 100, 170);
      const x1 = Math.min(DAM_X1 + 34 - row * 14, x + len);
      const yy = (v: number) =>
        row === 2 ? damTop(v) + 4 : DAM_BOT - 13 - row * 17 + (damTop(v) - 1226) * 0.4;
      const rad = range(r, 8, 10.5) - row * 0.6;
      out += limb(
        [
          [x, yy(x) + range(r, -2, 2)],
          [(x + x1) / 2, yy((x + x1) / 2) - 1],
          [x1, yy(x1) + range(r, -2, 2)],
        ],
        rad,
        rad * 0.85,
        colors[Math.floor(r() * 3)],
      );
      out += path(ellipse(x1, yy(x1), rad * 0.5, rad * 0.82), p.stickEnd);
      out += path(ellipse(x1, yy(x1), rad * 0.22, rad * 0.36), p.stickDark, ' fill-opacity=".5"');
      x = x1 - range(r, 4, 16);
    }
  }
  const ox = 2866;
  out += path(
    `M${f(ox - 38)} ${f(damTop(ox - 38) - 2)}Q${f(ox)} ${f(damTop(ox) - 10)} ${f(ox + 38)} ${f(damTop(ox + 38) - 2)}L${f(ox + 42)} ${DAM_BOT + 4}L${f(ox - 42)} ${DAM_BOT + 4}Z`,
    p.water,
  );
  for (const dx of [-22, 0, 22]) {
    out += stroke(
      `M${f(ox + dx)} ${f(damTop(ox + dx) + 4)}L${f(ox + dx * 1.1)} ${DAM_BOT - 8}`,
      p.waterLight,
      5,
      ' stroke-opacity=".8"',
    );
  }
  out += path(scallop(ox, DAM_BOT + 2, 1, 9, 7, 0, 54, 13), p.foam);
  return out;
}

function stream(p: Palette): string {
  let out = path(
    tube(STREAM, (u) => streamR(u) + 16 + 22 * u),
    p.bank,
  );
  out += path(
    tube(STREAM, (u) => streamR(u) + 6 + 8 * u),
    p.bankDark,
    ' fill-opacity=".4"',
  );
  out += path(tube(STREAM, streamR), p.water);
  const rr = rng(19);
  for (let i = 4; i < 76; i += 3) {
    const u = i / 80;
    const [px, py] = STREAM_PTS[i];
    const [qx, qy] = STREAM_PTS[i + 2];
    const dx = qx - px;
    const dy = qy - py;
    const len = Math.hypot(dx, dy) || 1;
    const off = range(rr, -0.6, 0.6) * streamR(u);
    const ox = (-dy / len) * off;
    const oy = (dx / len) * off;
    if (py + oy > H - 30) continue;
    out += stroke(
      curve(px + ox, py + oy, px + ox + dx * 1.2, py + oy + dy * 1.2, range(rr, -0.25, 0.25) * len),
      p.waterLight,
      3 + 7 * u,
      ' stroke-opacity=".75"',
    );
  }
  for (let i = 6; i < 78; i += 5) {
    const u = i / 80;
    const [px, py] = STREAM_PTS[i];
    for (const side of [-1, 1]) {
      const R = streamR(u) + 12 + 14 * u;
      const x = px + side * R * range(rr, 0.9, 1.08);
      const y = py + range(rr, -10, 10);
      const s = 0.6 + u * 0.8;
      out += path(ellipse(x, y + 3 * s, 14 * s, 7 * s), p.stoneShade);
      out += path(ellipse(x - 1, y, 12 * s, 6 * s), p.stone);
    }
  }
  return out;
}

function steppingStones(p: Palette): string {
  const k = STREAM_PTS.findIndex(([, py]) => py > 1652);
  const [cx, cy] = STREAM_PTS[k];
  const R = streamR(k / 80);
  let out = '';
  [-0.92, -0.47, -0.02, 0.44, 0.9].forEach((t, i) => {
    const x = cx + t * R;
    const y = cy + (i % 2 ? 8 : -6) + t * 12;
    const rx = 50 - Math.abs(t) * 6;
    const ry = 20;
    out += stroke(ellipse(x, y + 8, rx + 12, ry + 6), p.waterLight, 4, ' stroke-opacity=".6"');
    out += path(ellipse(x, y + 6, rx, ry), p.stoneShade);
    out += path(ellipse(x - 2, y, rx - 2, ry - 3), p.stone);
    out += path(
      ellipse(x - rx * 0.3, y - ry * 0.3, rx * 0.36, ry * 0.26),
      p.stoneLight,
      ' fill-opacity=".85"',
    );
  });
  return out;
}

function hollowLog(p: Palette, mode: Mode): string {
  const [x, y] = LOG;
  const night = mode === 'night';
  const len = 580;
  const r = 70;
  const x0 = x - len / 2;
  const x1 = x + len / 2;
  const cy = y - r;
  const fr = r * 0.46;
  let out = limb(
    [
      [x0 + 150, cy - r + 14],
      [x0 + 166, cy - r - 30],
      [x0 + 196, cy - r - 58],
    ],
    14,
    6,
    p.log,
  );
  out += path(leaf(x0 + 196, cy - r - 58, 30, 9, -40), p.oak);
  out += path(leaf(x0 + 196, cy - r - 58, 26, 8, -110), p.oakDark);
  const body = `M${f(x1)} ${f(cy - r)}C${f(x1 - len * 0.3)} ${f(cy - r - 6)} ${f(x0 + len * 0.3)} ${f(cy - r + 2)} ${f(x0 + r * 0.6)} ${f(cy - r + 6)}C${f(x0 - r * 0.5)} ${f(cy - r + 14)} ${f(x0 - r * 0.5)} ${f(cy + r - 6)} ${f(x0 + r * 0.6)} ${f(cy + r)}L${f(x1)} ${f(cy + r)}Z`;
  out += path(body, p.log);
  out += path(
    `M${f(x0 + r * 0.2)} ${f(cy + r * 0.38)}L${f(x1)} ${f(cy + r * 0.38)}L${f(x1)} ${f(cy + r)}L${f(x0 + r * 0.6)} ${f(cy + r)}Q${f(x0 + 4)} ${f(cy + r * 0.86)} ${f(x0 + r * 0.2)} ${f(cy + r * 0.38)}Z`,
    p.logDark,
    ' fill-opacity=".5"',
  );
  out += stroke(
    `M${f(x0 + r * 0.7)} ${f(cy - r * 0.6)}L${f(x1 - 24)} ${f(cy - r * 0.66)}`,
    p.logLight,
    10,
    ' stroke-opacity=".7"',
  );
  for (const [k, wd] of [
    [-0.36, 5],
    [-0.02, 6],
    [0.3, 5],
    [0.62, 4],
  ]) {
    out += stroke(
      curve(x0 + r * 0.8, cy + r * k, x1 - fr * 0.6, cy + r * k, k < 0.1 ? -5 : 5),
      p.logDark,
      wd,
      ' stroke-opacity=".38"',
    );
  }
  out += path(ellipse(x1, cy, fr, r), p.logEnd);
  out += stroke(ellipse(x1, cy, fr * 0.8, r * 0.82), p.logRing, 5);
  out += path(ellipse(x1 + 2, cy + 6, fr * 0.6, r * 0.64), night ? p.hollowGlow : p.logHole);
  if (night) {
    out += `<circle cx="${f(x1 + 2)}" cy="${f(cy + 6)}" r="110" fill="url(#fsHollow)"/>`;
    out += path(ellipse(x1 + 3, cy + 10, fr * 0.4, r * 0.4), p.fireGlow, ' fill-opacity=".8"');
    for (const [fx, fy] of [
      [-6, -18],
      [8, 4],
      [-2, 24],
    ]) {
      out += path(circle(x1 + 2 + fx, cy + 6 + fy, 3.5), p.firefly);
    }
  }
  out += path(scallop(x - 40, cy - r + 6, 1, 11, 10, 0, len * 0.3, 16), p.mossDark);
  out += path(scallop(x - 46, cy - r, 1, 11, 9, 12, len * 0.27, 13), p.moss);
  out += path(scallop(x0 + 40, cy + r * 0.5, 1, 7, 7, 0, 30, 18), p.moss);
  out += toadstool(x + 120, cy - r + 4, 0.42, p, 13, p.brownCap);
  out += toadstool(x + 150, cy - r + 6, 0.32, p, 15, p.brownCap);
  return out;
}

function berryCluster(x: number, y: number, s: number, c: string, light: string): string {
  const pts: Pt[] = [
    [0, 0],
    [-9, 7],
    [9, 7],
    [0, 14],
  ];
  return (
    path(pts.map(([dx, dy]) => circle(x + dx * s, y + dy * s, 8 * s)).join(''), c) +
    path(
      pts.map(([dx, dy]) => circle(x + (dx - 2.5) * s, y + (dy - 2.5) * s, 2.4 * s)).join(''),
      light,
      ' fill-opacity=".9"',
    )
  );
}

function berrySprig(x: number, y: number, s: number, p: Palette): string {
  let out = stroke(
    `M${f(x)} ${f(y)}Q${f(x - 6 * s)} ${f(y - 40 * s)} ${f(x + 14 * s)} ${f(y - 70 * s)}`,
    p.bushDark,
    4 * s,
  );
  for (const [dx, dy, a] of [
    [-2, -24, -160],
    [0, -36, -20],
    [4, -52, -150],
    [10, -62, -30],
  ]) {
    out += path(leaf(x + dx * s, y + dy * s, 26 * s, 9 * s, a), dx % 4 ? p.bushLight : p.bush);
  }
  return out + berryCluster(x + 16 * s, y - 70 * s, s, p.berry, p.berryLight);
}

function berryBush(
  x: number,
  y: number,
  s: number,
  p: Palette,
  seed: number,
  berry: string,
  light: string,
  shadow = true,
): string {
  const r = rng(seed);
  let out = shadow
    ? path(ellipse(x, y + 4 * s, 150 * s, 18 * s), p.groundShade, ' fill-opacity=".5"')
    : '';
  out += canopy(
    [
      [x - 70 * s, y - 60 * s, 74 * s, 58 * s],
      [x + 66 * s, y - 62 * s, 76 * s, 60 * s],
      [x - 4 * s, y - 104 * s, 86 * s, 66 * s],
      [x, y - 44 * s, 106 * s, 46 * s],
    ],
    p.bushDark,
    p.bush,
    p.bushLight,
  );
  for (let i = 0; i < 12; i++) {
    const a = range(r, -170, -10);
    const rad = (a * Math.PI) / 180;
    out += path(
      leaf(x + Math.cos(rad) * 120 * s, y - 50 * s + Math.sin(rad) * 80 * s, 26 * s, 8 * s, a),
      i % 2 ? p.bushLight : p.bushDark,
    );
  }
  let n = 0;
  for (let i = 0; i < 40 && n < 10; i++) {
    const bx = range(r, -130, 130);
    const by = range(r, -150, -24);
    if ((bx / 140) ** 2 + ((by + 76) / 82) ** 2 > 0.9) continue;
    out += berryCluster(x + bx * s, y + by * s, s, berry, light);
    n++;
  }
  return out;
}

function toadstool(
  x: number,
  y: number,
  s: number,
  p: Palette,
  seed: number,
  cap = p.mushroom,
): string {
  const sh = 50 * s;
  const sw = 12 * s;
  const cw = 40 * s;
  const ch = 34 * s;
  const top = y - sh;
  let out = path(ellipse(x, y + 2 * s, cw * 0.8, 6 * s), p.groundShade, ' fill-opacity=".5"');
  out += path(
    `M${f(x - sw)} ${f(y + 2)}C${f(x - sw * 0.6)} ${f(y - sh * 0.4)} ${f(x - sw * 0.85)} ${f(top + 6 * s)} ${f(x - sw * 0.7)} ${f(top)}L${f(x + sw * 0.7)} ${f(top)}C${f(x + sw * 0.85)} ${f(top + 6 * s)} ${f(x + sw * 0.6)} ${f(y - sh * 0.4)} ${f(x + sw)} ${f(y + 2)}Z`,
    p.mushroomStem,
  );
  out += path(
    `M${f(x + sw * 0.15)} ${f(y + 2)}C${f(x + sw * 0.4)} ${f(y - sh * 0.4)} ${f(x + sw * 0.3)} ${f(top + 6 * s)} ${f(x + sw * 0.2)} ${f(top)}L${f(x + sw * 0.7)} ${f(top)}C${f(x + sw * 0.85)} ${f(top + 6 * s)} ${f(x + sw * 0.6)} ${f(y - sh * 0.4)} ${f(x + sw)} ${f(y + 2)}Z`,
    p.mushroomStemShade,
    ' fill-opacity=".7"',
  );
  if (cap === p.mushroom) {
    out += path(ellipse(x, y - sh * 0.56, sw * 1.2, 5 * s), p.mushroomStemShade);
    out += path(ellipse(x, y - sh * 0.6, sw * 1.05, 3.5 * s), p.mushroomStem);
  }
  out += path(ellipse(x, top + 7 * s, cw * 0.9, 7 * s), p.mushroomGill);
  const capD = `M${f(x - cw)} ${f(top + 6 * s)}C${f(x - cw * 1.02)} ${f(top - ch * 0.95)} ${f(x + cw * 1.02)} ${f(top - ch * 0.95)} ${f(x + cw)} ${f(top + 6 * s)}Q${f(x)} ${f(top + 13 * s)} ${f(x - cw)} ${f(top + 6 * s)}Z`;
  out += path(capD, cap);
  out += path(
    `M${f(x + cw * 0.2)} ${f(top - ch * 0.62)}C${f(x + cw * 0.8)} ${f(top - ch * 0.55)} ${f(x + cw)} ${f(top - ch * 0.1)} ${f(x + cw)} ${f(top + 6 * s)}Q${f(x + cw * 0.5)} ${f(top + 11 * s)} ${f(x + cw * 0.3)} ${f(top + 10 * s)}C${f(x + cw * 0.6)} ${f(top - ch * 0.2)} ${f(x + cw * 0.5)} ${f(top - ch * 0.5)} ${f(x + cw * 0.2)} ${f(top - ch * 0.62)}Z`,
    cap === p.mushroom ? p.mushroomShade : p.brownCapShade,
    ' fill-opacity=".45"',
  );
  if (cap === p.mushroom) {
    const r = rng(seed);
    for (const [u, v, rad] of [
      [-0.55, -0.22, 6],
      [-0.12, -0.56, 7],
      [0.34, -0.42, 5.5],
      [0.7, -0.08, 4.5],
      [-0.82, 0.02, 3.5],
      [0.08, -0.16, 4],
    ]) {
      out += path(
        ellipse(x + (u + range(r, -0.05, 0.05)) * cw, top + v * ch, rad * s, rad * 0.8 * s),
        p.mushroomDot,
      );
    }
  }
  out += path(
    ellipse(x - cw * 0.45, top - ch * 0.4, cw * 0.18, ch * 0.1, -30),
    '#ffffff',
    ' fill-opacity=".4"',
  );
  return out;
}

function mushroomPatch(p: Palette): string {
  const [x, y] = SHROOMS;
  return (
    tuft(x - 150, y, 1.2, p.grassDark) +
    tuft(x + 150, y + 2, 1.1, p.grass) +
    toadstool(x - 70, y - 6, 1.0, p, 3) +
    toadstool(x + 66, y - 10, 0.82, p, 5) +
    toadstool(x - 4, y + 6, 1.35, p, 7) +
    toadstool(x + 112, y + 8, 0.6, p, 9) +
    toadstool(x - 122, y + 10, 0.55, p, 11) +
    tuft(x + 40, y + 12, 1, p.grassDark)
  );
}

function blade(x: number, y: number, len: number, w: number, deg: number): string {
  const a = (deg * Math.PI) / 180;
  const tx = x + Math.cos(a) * len;
  const ty = y + Math.sin(a) * len;
  const mx = (x + tx) / 2;
  const my = (y + ty) / 2;
  const nx = -Math.sin(a) * w;
  const ny = Math.cos(a) * w;
  return `M${g(x)} ${g(y)}q${g(mx + nx - x)} ${g(my + ny - y)} ${g(tx - x)} ${g(ty - y)}q${g(mx - nx - tx)} ${g(my - ny - ty)} ${g(x - tx)} ${g(y - ty)}z`;
}

function frond(x: number, y: number, len: number, angle: number, bend: number): [string, string] {
  const steps = 9;
  const pts: Pt[] = [[x, y]];
  let px = x;
  let py = y;
  let leaflets = '';
  for (let i = 1; i <= steps; i++) {
    const t = i / steps;
    const deg = angle + bend * t;
    const a = (deg * Math.PI) / 180;
    px += (Math.cos(a) * len) / steps;
    py += (Math.sin(a) * len) / steps;
    pts.push([px, py]);
    if (i < steps) {
      const ll = len * 0.25 * (1 - t * 0.7);
      leaflets += blade(px, py, ll, ll * 0.38, deg - 56) + blade(px, py, ll, ll * 0.38, deg + 56);
    }
  }
  leaflets += blade(px, py, len * 0.09, len * 0.03, angle + bend);
  return [smooth(pts, false), leaflets];
}

function fernClump(x: number, y: number, s: number, p: Palette, seed: number): string {
  const r = rng(seed);
  const fronds: [number, number, number, boolean][] = [
    [-152, -38, 0.85, true],
    [-28, 38, 0.85, true],
    [-104, -16, 1.05, true],
    [-76, 16, 1.05, true],
    [-126, -30, 1, false],
    [-54, 30, 1, false],
    [-90, 6, 0.95, false],
  ];
  const dark = ['', ''];
  const light = ['', ''];
  for (const [a, b, k, isDark] of fronds) {
    const [stem, leaves] = frond(x, y, 150 * s * k * range(r, 0.9, 1.1), a + range(r, -6, 6), b);
    const slot = isDark ? dark : light;
    slot[0] += stem;
    slot[1] += leaves;
  }
  return (
    stroke(dark[0], p.fernDark, 3.2 * s) +
    path(dark[1], p.fernDark) +
    stroke(light[0], p.fern, 3.2 * s) +
    path(light[1], p.fern)
  );
}

function bush(x: number, y: number, s: number, p: Palette): string {
  return canopy(
    [
      [x - 60 * s, y - 40 * s, 66 * s, 46 * s],
      [x + 56 * s, y - 42 * s, 64 * s, 46 * s],
      [x, y - 70 * s, 76 * s, 54 * s],
    ],
    p.bushDark,
    p.bush,
    p.bushLight,
  );
}

function mossyRock(x: number, y: number, s: number, p: Palette): string {
  const body = smooth([
    [x - 70 * s, y + 4],
    [x - 64 * s, y - 36 * s],
    [x - 30 * s, y - 62 * s],
    [x + 20 * s, y - 66 * s],
    [x + 60 * s, y - 40 * s],
    [x + 74 * s, y + 4],
  ]);
  return (
    path(ellipse(x, y + 4, 84 * s, 12 * s), p.groundShade, ' fill-opacity=".5"') +
    path(body, p.stone) +
    path(
      smooth([
        [x + 20 * s, y - 64 * s],
        [x + 60 * s, y - 40 * s],
        [x + 74 * s, y + 4],
        [x + 10 * s, y + 4],
        [x + 30 * s, y - 30 * s],
      ]),
      p.stoneShade,
    ) +
    path(ellipse(x - 26 * s, y - 42 * s, 18 * s, 9 * s, -20), p.stoneLight, ' fill-opacity=".7"') +
    path(scallop(x - 14 * s, y - 58 * s, 1, 8, 8 * s, 0, 44 * s, 12 * s), p.moss)
  );
}

function flowerHead(x: number, y: number, s: number, petal: string, center: string): string {
  let d = '';
  for (let i = 0; i < 5; i++) {
    const a = (i / 5) * Math.PI * 2 - Math.PI / 2;
    d += circle(x + Math.cos(a) * 8 * s, y + Math.sin(a) * 8 * s, 7 * s);
  }
  return path(d, petal) + path(circle(x, y, 5.5 * s), center);
}

function daisy(x: number, y: number, s: number, petal: string, p: Palette): string {
  return (
    stroke(`M${f(x)} ${f(y)}L${f(x)} ${f(y - 26 * s)}`, p.stem, 4 * s) +
    path(leaf(x, y - 4 * s, 18 * s, 5 * s, -140), p.stem) +
    flowerHead(x, y - 30 * s, s, petal, petal === p.buttercup ? p.daisy : p.flowerCenter)
  );
}

function bellflower(x: number, y: number, s: number, p: Palette): string {
  let out = stroke(
    `M${f(x)} ${f(y)}Q${f(x - 2 * s)} ${f(y - 40 * s)} ${f(x + 18 * s)} ${f(y - 46 * s)}`,
    p.stem,
    3.5 * s,
  );
  out += path(leaf(x, y - 2 * s, 20 * s, 5 * s, -120), p.stem);
  for (const [bx, by] of [
    [x + 2 * s, y - 34 * s],
    [x + 18 * s, y - 40 * s],
    [x - 6 * s, y - 20 * s],
  ]) {
    out += path(
      `M${f(bx - 7 * s)} ${f(by)}Q${f(bx - 8 * s)} ${f(by + 13 * s)} ${f(bx - 9 * s)} ${f(by + 15 * s)}Q${f(bx - 4.5 * s)} ${f(by + 12 * s)} ${f(bx)} ${f(by + 15 * s)}Q${f(bx + 4.5 * s)} ${f(by + 12 * s)} ${f(bx + 9 * s)} ${f(by + 15 * s)}Q${f(bx + 8 * s)} ${f(by + 13 * s)} ${f(bx + 7 * s)} ${f(by)}Q${f(bx)} ${f(by - 5 * s)} ${f(bx - 7 * s)} ${f(by)}Z`,
      p.bell,
    );
  }
  return out;
}

function fallenTwig(x: number, y: number, s: number, p: Palette): string {
  return (
    stroke(`M${f(x - 40 * s)} ${f(y)}L${f(x + 40 * s)} ${f(y - 6 * s)}`, p.stickDark, 6 * s) +
    stroke(
      `M${f(x + 6 * s)} ${f(y - 3 * s)}L${f(x + 26 * s)} ${f(y - 20 * s)}`,
      p.stickDark,
      4 * s,
    ) +
    path(leaf(x + 26 * s, y - 20 * s, 16 * s, 5 * s, -50), p.oak)
  );
}

function fireflies(seed: number, count: number, p: Palette): Layer {
  return scatterItems(seed, count, 100, W - 100, 1100, 1840, (x, y, r) => {
    const s = range(r, 0.7, 1.2);
    const fy = y - range(r, 40, 160);
    return (
      `<circle cx="${f(x)}" cy="${f(fy)}" r="${f(28 * s)}" fill="url(#fsFly)"/>` +
      path(circle(x, fy, 4.5 * s), p.firefly)
    );
  }).map(([, svg]): [number, string] => [H, svg]);
}

function meadowFlowers(p: Palette): Layer {
  const r = rng(77);
  const out: Layer = [];
  const colors = [p.daisy, p.buttercup, p.bell, p.pink];
  for (let i = 0; i < 26; i++) {
    const inClearing = i < 14;
    const cx = inClearing ? range(r, 1160, 2440) : range(r, 60, W - 60);
    const cy = inClearing ? range(r, 1220, 1830) : range(r, 1120, 1860);
    const color = colors[i % 4];
    for (let k = 0; k < 3; k++) {
      const x = cx + range(r, -46, 46);
      const y = cy + range(r, -14, 14);
      const sc = range(r, 0.8, 1.1) * (0.75 + (y - 1100) / 1500);
      if (wet(x, y)) continue;
      out.push([y, color === p.bell ? bellflower(x, y, sc, p) : daisy(x, y, sc, color, p)]);
    }
  }
  return out;
}

function scatterDry(
  seed: number,
  count: number,
  y0: number,
  y1: number,
  draw: (x: number, y: number, r: () => number) => string,
): Layer {
  return scatterItems(seed, count, 0, W, y0, y1, (x, y, r) => {
    const svg = draw(x, y, r);
    return wet(x, y) ? '' : svg;
  }).filter(([, svg]) => svg);
}

function glows(p: Palette): string {
  return radialGlow('fsFly', p.fireGlow, 0.75) + radialGlow('fsHollow', p.hollowGlow, 0.7);
}

const pineTones = (p: Palette): Tones => [p.pine, p.pineDark, p.pineLight];
const firTones = (p: Palette): Tones => [p.fir, p.firDark, p.firLight];

function undergrowth(p: Palette, mode: Mode): Layer {
  const night = mode === 'night';
  return [
    [1068, fir(110, 1068, 400, 210, 5, pineTones(p), p)],
    [1078, fir(1180, 1078, 420, 214, 5, firTones(p), p)],
    [1092, birch(1400, 1092, 450, 1, p, 3)],
    [1104, birch(1494, 1104, 380, 0.85, p, 5)],
    [1066, fir(2118, 1066, 410, 210, 5, firTones(p), p)],
    [1084, fir(2214, 1084, 320, 168, 4, pineTones(p), p)],
    [1060, fir(2640, 1060, 350, 186, 5, pineTones(p), p)],
    [1056, fir(3090, 1056, 330, 176, 4, firTones(p), p)],
    [1064, birch(3250, 1064, 380, 0.9, p, 9)],
    [1092, bush(960, 1092, 0.7, p)],
    [1084, bush(1560, 1084, 0.55, p)],
    [1080, bush(1700, 1078, 0.42, p)],
    [1090, bush(2010, 1092, 0.6, p)],
    [1084, bush(2470, 1088, 0.45, p)],
    [1300, fernClump(86, 1300, 1, p, 21)],
    [1312, fernClump(770, 1312, 0.85, p, 22)],
    [1334, fernClump(1110, 1334, 0.75, p, 23)],
    [1290, fernClump(2520, 1296, 0.7, p, 24)],
    [1606, fernClump(3254, 1606, 0.9, p, 25)],
    [1700, fernClump(3556, 1700, 1.1, p, 26)],
    [1530, fernClump(2730, 1530, 0.85, p, 27)],
    [1770, fernClump(1180, 1770, 0.9, p, 28)],
    [1700, fernClump(60, 1700, 1.15, p, 29)],
    [1770, fernClump(2480, 1770, 0.95, p, 30)],
    [1170, fernClump(1960, 1170, 0.55, p, 31)],
    [1478, mossyRock(1060, 1478, 0.7, p)],
    [1600, mossyRock(2640, 1600, 0.75, p)],
    [1766, mossyRock(3320, 1766, 1, p)],
    [1600, mossyRock(176, 1600, 0.8, p)],
    [1586, berryBush(3456, 1586, 0.7, p, 61, p.blueberry, p.blueberryLight)],
    [1272, toadstool(1010, 1272, 0.5, p, 41) + toadstool(1036, 1276, 0.36, p, 43)],
    [1186, toadstool(2470, 1186, 0.45, p, 45, p.brownCap)],
    [1330, toadstool(3330, 1330, 0.5, p, 47) + toadstool(3352, 1336, 0.34, p, 49)],
    [1632, fallenTwig(1720, 1632, 1, p)],
    [1420, fallenTwig(2380, 1420, 0.9, p)],
    [1740, pinecone(2140, 1700, 1.1, p)],
    [1560, pinecone(1520, 1530, 1, p)],
    ...meadowFlowers(p),
    ...scatterDry(12, 70, 1100, 1900, (x, y, r) =>
      tuft(x, y, 0.8 + r() * 0.6, r() < 0.5 ? p.grass : p.grassDark),
    ),
    ...(night ? fireflies(61, 16, p) : []),
  ];
}

const PROPS: Record<string, (p: Palette, mode: Mode) => Layer> = {
  pond: (p, mode) => [[1090, pondWater(p, mode)]],
  'hollow-tree': (p, mode) => [[SNAG[1], hollowTree(p, mode)]],
  dam: (p) => [[1250, dam(p)]],
  oak: (p) => [[OAK[1], oakTree(p)]],
  pine: (p) => [[PINE[1], fir(PINE[0], PINE[1], 1240, 560, 7, pineTones(p), p, 7, false)]],
  berries: (p) => [
    [BERRY[1], berryBush(BERRY[0], BERRY[1], 1.25, p, 11, p.berry, p.berryLight, false)],
  ],
  log: (p, mode) => [[LOG[1], hollowLog(p, mode)]],
  mushrooms: (p) => [[SHROOMS[1], mushroomPatch(p)]],
};

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

const hits = (a: Bounds, b: Bounds): boolean =>
  a.minX < b.maxX && b.minX < a.maxX && a.minY < b.maxY && b.minY < a.maxY;

function overlap(a: Shape[], b: Shape[]): boolean {
  return a.some(([ab, ap]) =>
    b.some(
      ([bb, bp]) =>
        hits(ab, bb) && (ap.some((pt) => inside(pt, bp)) || bp.some((pt) => inside(pt, ap))),
    ),
  );
}

type Cover = [number, number, Shape[], Bounds];

function outline(svg: string): [Shape[], Bounds] {
  const list = shapes(svg);
  const all = emptyBounds();
  for (const [b] of list) {
    extendBounds(all, [
      [b.minX, b.minY],
      [b.maxX, b.maxY],
    ]);
  }
  return [list, all];
}

const owners: Partial<Record<Mode, string[]>> = {};

function ownersOf(p: Palette, mode: Mode, items: Layer): string[] {
  const ids = Object.keys(PROPS);
  const covers = ids.flatMap((id, k) =>
    PROPS[id](p, mode).map(([y, svg]): Cover => [k, y, ...outline(svg)]),
  );
  return items.map(([y, svg]) => {
    const [own, box] = outline(svg);
    let best = -1;
    for (const [k, cy, c, cb] of covers) {
      if (k > best && y > cy && hits(box, cb) && overlap(own, c)) best = k;
    }
    if (best >= 0) covers.push([best, y, own, box]);
    return ids[best] ?? '';
  });
}

const sorted: Partial<Record<Mode, Layer>> = {};

function undergrowthOf(p: Palette, mode: Mode, id: string): Layer {
  const items = (sorted[mode] ??= undergrowth(p, mode).sort((a, b) => a[0] - b[0]));
  const owner = (owners[mode] ??= ownersOf(p, mode, items));
  return items.filter((_, i) => owner[i] === id);
}

const standing = (id: string) => (p: Palette, mode: Mode) =>
  `<defs>${glows(p)}</defs>` + layered([...PROPS[id](p, mode), ...undergrowthOf(p, mode, id)]);

function sunWithSpinningRays(p: Palette): string {
  const [x, y] = SUN;
  const svg = sun(x, y, 104, p.sun, p.sunRay, p.face);
  const rays = svg.match(new RegExp(`(<path[^>]*fill="${p.sunRay}"/>)+`))?.[0] ?? '';
  return svg.replace(rays, `<g data-spin="" style="transform-origin: ${x}px ${y}px">${rays}</g>`);
}

function sunbeams(p: Palette): string {
  const [sx, sy] = SUN;
  let out = `<defs>${linearGradient('fsBeam', [
    [0, p.beam, 0],
    [0.3, p.beam, 0.55],
    [1, p.beam, 0],
  ])}</defs>`;
  for (const [tx, ty, w0, w1, o] of [
    [1420, 1580, 50, 230, 0.4],
    [1860, 1640, 40, 200, 0.32],
    [2300, 1560, 44, 210, 0.36],
  ]) {
    const dx = tx - sx;
    const dy = ty - sy;
    const len = Math.hypot(dx, dy);
    const nx = -dy / len;
    const ny = dx / len;
    const ax = sx + (dx / len) * 230;
    const ay = sy + (dy / len) * 230;
    out += path(
      poly([
        [ax + nx * w0, ay + ny * w0],
        [ax - nx * w0, ay - ny * w0],
        [tx - nx * w1, ty - ny * w1],
        [tx + nx * w1, ty + ny * w1],
      ]),
      'url(#fsBeam)',
      ` fill-opacity="${o}"`,
    );
  }
  return out;
}

function propShadows(p: Palette): string {
  return (
    [
      [OAK[0] + 20, OAK[1] + 8, 320, 34],
      [SNAG[0] + 10, SNAG[1] + 8, 240, 26],
      [PINE[0], PINE[1] + 4, 210, 30],
      [BERRY[0], BERRY[1] + 5, 188, 22],
      [LOG[0] + 20, LOG[1] + 2, 330, 24],
      [SHROOMS[0], SHROOMS[1] + 6, 160, 20],
    ] as [number, number, number, number][]
  )
    .map(([x, y, rx, ry]) => path(ellipse(x, y, rx, ry), p.groundShade, ' fill-opacity=".5"'))
    .join('');
}

function clearing(p: Palette, mode: Mode): string {
  const o = mode === 'night' ? 0.55 : 0.9;
  return (
    `<defs><radialGradient id="fsClear"><stop offset="0" stop-color="${p.groundSun}" stop-opacity="${o}"/><stop offset=".6" stop-color="${p.groundSun}" stop-opacity="${o * 0.75}"/><stop offset="1" stop-color="${p.groundSun}" stop-opacity="0"/></radialGradient></defs>` +
    `<ellipse cx="1800" cy="1480" rx="980" ry="380" fill="url(#fsClear)"/>`
  );
}

const day: Palette = {
  skyTop: '#6dbbe9',
  skyMid: '#a8dcf2',
  skyBottom: '#e4f6f2',
  sun: '#ffd84d',
  sunRay: '#ffc531',
  face: '#8a4b1f',
  beam: '#fff6cf',
  glint: '#fff6d0',
  mist: '#f1faf8',
  mountFar: '#c2dcea',
  mount: '#a6c8dc',
  mountShade: '#8fb3cb',
  snow: '#f7fbff',
  snowShade: '#d8e6f1',
  forestFar: '#9cc6bc',
  forestMid: '#6ea891',
  forestRound: '#7db58f',
  ground: '#84bf5b',
  groundLight: '#9dcd66',
  groundSun: '#c4e27a',
  groundShade: '#5f9a47',
  grass: '#6aa844',
  grassDark: '#538f38',
  pine: '#2f7c61',
  pineDark: '#215f4b',
  pineLight: '#4a9a78',
  fir: '#3a8a5e',
  firDark: '#2a6f4b',
  firLight: '#58a672',
  pineTrunk: '#7b4f37',
  pineTrunkDark: '#5a3826',
  cone: '#a06d40',
  coneDark: '#744a2a',
  oak: '#5ea54a',
  oakDark: '#478c3c',
  oakLight: '#86c45f',
  oakTrunk: '#8b6446',
  oakTrunkDark: '#664832',
  hole: '#3b2a20',
  acorn: '#c08a4a',
  acornCap: '#7d5634',
  birch: '#f4f1e8',
  birchShade: '#d9d2c2',
  birchMark: '#3d3936',
  birchLeaf: '#a6d05e',
  birchLeafDark: '#88ba4b',
  birchLeafLight: '#c4e27e',
  snag: '#937a62',
  snagDark: '#6c5644',
  snagLight: '#b39a80',
  fungus: '#eaa75a',
  fungusLight: '#ffd49a',
  moss: '#7fbb4c',
  mossDark: '#5f9e3c',
  water: '#4fb2df',
  waterFar: '#86d0ee',
  waterDeep: '#3a92c4',
  waterLight: '#d2f3fc',
  foam: '#ffffff',
  bank: '#b9a57c',
  bankDark: '#8f7b58',
  mud: '#8a6040',
  mudDark: '#6a452d',
  stick: '#a0714a',
  stickDark: '#7c5334',
  stickLight: '#c0905f',
  stickEnd: '#e8cb9c',
  stone: '#b9bfc0',
  stoneShade: '#959ca0',
  stoneLight: '#e2e6e6',
  log: '#9a6b47',
  logDark: '#77512f',
  logLight: '#b88a5f',
  logEnd: '#e9cd9f',
  logRing: '#c9a571',
  logHole: '#3e2b1f',
  bush: '#4e9a4b',
  bushDark: '#3c813f',
  bushLight: '#6db55c',
  berry: '#e3364c',
  berryLight: '#ff9aa6',
  blueberry: '#5a62c8',
  blueberryLight: '#b5bcff',
  mushroom: '#e8473d',
  mushroomShade: '#c23530',
  mushroomDot: '#fff8ee',
  mushroomStem: '#f6ecd8',
  mushroomStemShade: '#dfd0b4',
  mushroomGill: '#f0dcc0',
  brownCap: '#b5824f',
  brownCapShade: '#8d5f36',
  fern: '#4f9f50',
  fernDark: '#3b8444',
  reed: '#7aac52',
  reedDark: '#5c8f3e',
  cattail: '#7b5236',
  lily: '#5fae4e',
  lilyDark: '#4a9640',
  lilyFlower: '#ffffff',
  lilyCenter: '#ffd23f',
  daisy: '#ffffff',
  buttercup: '#ffd23f',
  bell: '#9b8cf0',
  pink: '#ff9cc8',
  flowerCenter: '#ffb52e',
  stem: '#5b9a3e',
  firefly: '#fff6b8',
  fireGlow: '#ffe88a',
  hollowGlow: '#ffcf6a',
};

const night: Palette = {
  skyTop: '#0a1332',
  skyMid: '#16285a',
  skyBottom: '#2b4477',
  sun: '#fff1c0',
  sunRay: '#ffe9a8',
  face: '#7a5a34',
  glint: '#e6eeff',
  mist: '#5d72ad',
  mountFar: '#34497f',
  mount: '#2f4377',
  mountShade: '#283a69',
  forestFar: '#2d4a73',
  forestMid: '#263f62',
  forestRound: '#2a4668',
  water: '#2b5295',
  waterFar: '#3c64a8',
  waterDeep: '#203f7a',
  waterLight: '#a3c4f2',
  foam: '#d3e2ff',
  snow: '#b9c7ea',
  snowShade: '#9aaad6',
  daisy: '#e6eaff',
  buttercup: '#fff0a0',
  bell: '#c7c0ff',
  pink: '#ffc4e2',
  lilyFlower: '#eef2ff',
  berry: '#ff6f82',
  mushroom: '#f0675f',
  mushroomDot: '#fff3e8',
  firefly: '#fff6b8',
  fireGlow: '#ffe88a',
  hollowGlow: '#ffc75a',
};

const interactives: Interactive[] = [
  {
    id: 'sun',
    box: [SUN[0] - 286, SUN[1] - 286, 572, 572],
    kind: 'spin',
    origin: SUN,
    effect: 'sparkle',
    sound: 'shine',
    night: { kind: 'rock', effect: 'stars', sound: 'twinkle' },
    render: (p, mode) =>
      mode === 'day' ? sunWithSpinningRays(p) : moon(SUN[0], SUN[1], 100, p.sun, p.sunRay, p.face),
  },
  {
    id: 'pond',
    box: [2476, 1022, 822, 286],
    kind: 'pulse',
    origin: POND,
    effect: 'splash',
    effectAt: [2800, 1150],
    sound: 'splash',
    render: standing('pond'),
  },
  {
    id: 'hollow-tree',
    box: [1978, 482, 574, 712],
    kind: 'wiggle',
    origin: [SNAG[0], SNAG[1] + 8],
    effect: 'leaves',
    sound: 'creak',
    night: { kind: 'glow', effect: 'sparkle', sound: 'twinkle' },
    render: standing('hollow-tree'),
  },
  {
    id: 'dam',
    box: [2400, 1134, 898, 226],
    kind: 'wiggle',
    origin: [2886, DAM_BOT],
    effect: 'splash',
    effectAt: [2866, 1236],
    sound: 'creak',
    render: standing('dam'),
  },
  {
    id: 'oak',
    box: [16, 72, 1332, 1276],
    kind: 'shake',
    origin: [OAK[0], OAK[1] + 8],
    effect: 'leaves',
    sound: 'rustle',
    render: standing('oak'),
  },
  {
    id: 'pine',
    box: [3114, 30, 612, 1328],
    kind: 'sway',
    origin: [PINE[0], PINE[1] + 6],
    effect: 'leaves',
    sound: 'rustle',
    render: standing('pine'),
  },
  {
    id: 'berries',
    box: [82, 1208, 434, 296],
    kind: 'bounce',
    origin: [BERRY[0], BERRY[1] + 6],
    effect: 'fruit',
    sound: 'rustle',
    render: standing('berries'),
  },
  {
    id: 'log',
    box: [498, 1458, 834, 382],
    kind: 'wiggle',
    origin: [LOG[0], LOG[1] + 4],
    effect: 'notes',
    effectAt: [LOG[0] + 290, LOG[1] - 170],
    sound: 'thump',
    render: standing('log'),
  },
  {
    id: 'mushrooms',
    box: [1192, 1686, 400, 162],
    kind: 'bounce',
    origin: [SHROOMS[0], SHROOMS[1] + 8],
    effect: 'sparkle',
    sound: 'boing',
    render: standing('mushrooms'),
  },
];

const forest: SceneDef = {
  id: 'forest',
  world: [W, H],
  horizon: 740,
  ambient: { clouds: 3, birds: 2, stars: 40, fireflies: 28, leaves: 12 },
  defaults: [
    { animal: 'squirrel', x: 1000, y: 713 },
    { animal: 'owl', x: 2298, y: 486 },
    { animal: 'woodpecker', x: 980, y: 1521 },
    { animal: 'beaver', x: 2700, y: 1154 },
    { animal: 'raccoon', x: 2960, y: 1590, flip: true },
    { animal: 'moose', x: 3250, y: 1290, flip: true },
    { animal: 'bear', x: 620, y: 1380 },
    { animal: 'deer', x: 1780, y: 1370 },
    { animal: 'wolf', x: 2130, y: 1260, flip: true },
    { animal: 'fox', x: 1262, y: 1630, flip: true },
    { animal: 'badger', x: 420, y: 1780 },
    { animal: 'hedgehog', x: 1580, y: 1790, flip: true },
    { animal: 'skunk', x: 1330, y: 1440 },
    { animal: 'rabbit', x: 1990, y: 1660, flip: true },
    { animal: 'robin', x: 296, y: 1210 },
  ],
  day,
  night,
  interactives,
  back: (p, mode) => {
    const isNight = mode === 'night';
    let out =
      `<defs>${linearGradient('fsSky', [
        [0, p.skyTop],
        [0.24, p.skyMid],
        [0.47, p.skyBottom],
      ])}${linearGradient('fsMist', [
        [0, p.mist, 0],
        [0.5, p.mist, 0.8],
        [1, p.mist, 0],
      ])}${glows(p)}</defs>` + `<rect width="${W}" height="${H}" fill="url(#fsSky)"/>`;
    if (isNight) out += starField(31, 80, 40, 30, W - 40, 600, '#fff6d6');
    out += farRange(p);
    out += mountain('fsMtA', 2560, 960, 1300, 440, p, true);
    out += mountain('fsMtB', 520, 960, 1200, 320, p, false);
    out += mountain('fsMtC', 3560, 960, 900, 300, p, false);
    out += mist(860, 120, 0.8);
    out += firRow(5, farY, 70, 120, 190, p.forestFar);
    out += mist(930, 90, 0.5);
    out += midRow(p);
    out += path(landD(backY), p.ground);
    out += path(ellipse(420, 1400, 620, 300), p.groundShade, ' fill-opacity=".35"');
    out += path(ellipse(3300, 1460, 520, 320), p.groundShade, ' fill-opacity=".3"');
    out += clearing(p, mode);
    if (!isNight) out += sunbeams(p);
    const r = rng(37);
    for (let i = 0; i < 14; i++) {
      const x = range(r, 0, W);
      const y = range(r, 1160, 1900);
      if (wet(x, y, 80)) continue;
      out += path(
        ellipse(x, y, range(r, 120, 260), range(r, 22, 40)),
        p.groundLight,
        ' fill-opacity=".6"',
      );
    }
    out += propShadows(p);
    out += stream(p);
    out += steppingStones(p);
    out += layered(undergrowthOf(p, mode, ''));
    return out;
  },
  front: (p) =>
    fernClump(70, 2034, 1.5, p, 1) +
    tuft(300, 2004, 2, p.grassDark) +
    berrySprig(390, 2004, 1.5, p) +
    tuft(980, 2004, 2, p.grass) +
    tuft(1640, 2006, 1.8, p.grassDark) +
    tuft(2300, 2004, 1.9, p.grass) +
    fernClump(2830, 2040, 1.15, p, 3) +
    fernClump(3420, 2040, 1.3, p, 4) +
    tuft(3580, 2004, 2, p.grassDark),
};

export default forest;
