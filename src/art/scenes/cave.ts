import { mix } from '../core/color';
import {
  circle,
  curve,
  ellipse,
  f,
  leaf,
  poly,
  scallop,
  smooth,
  spiky,
  spline,
  tube,
  type Pt,
} from '../core/paths';
import {
  cloud,
  grassTuft,
  group,
  layered,
  linearGradient,
  moon,
  mountain,
  path,
  roundTree,
  starField,
  stroke,
  sun,
  vine,
} from './props';
import { nightColor } from './render';
import { range, rng } from './rng';
import type { Interactive, Mode, Palette, SceneDef } from './types';

const W = 3600;
const H = 2000;

const SUN: Pt = [650, 570];
const POOL: Pt = [2700, 1650];
const POOL_R: Pt = [520, 130];
const CRYSTALS: Pt = [3330, 1650];
const MUSH: Pt = [560, 1780];
const MITES: Pt = [1500, 1600];
const DRIP_X = 2580;
const WORMS_X = 2170;
const FALL_X = 1840;
const FALL_TOP = 590;

const CLIFF: Pt[] = [
  [1510, 1226],
  [1540, 1120],
  [1572, 1010],
  [1566, 936],
  [1612, 884],
  [1640, 770],
  [1688, 694],
  [1740, 644],
  [1792, 604],
  [1840, 612],
  [1892, 596],
  [1958, 614],
  [2012, 654],
  [2056, 706],
  [2066, 770],
  [2116, 810],
  [2138, 926],
  [2156, 1040],
  [2196, 1130],
  [2240, 1226],
];

const STREAM: Pt[] = [
  [FALL_X, 1200],
  [1806, 1262],
  [1870, 1326],
  [2000, 1376],
  [2090, 1446],
  [2120, 1530],
  [2214, 1630],
];

const CEIL: Pt[] = [
  [-100, 760],
  [60, 560],
  [190, 360],
  [360, 215],
  [560, 150],
  [780, 135],
  [1000, 160],
  [1240, 196],
  [1480, 186],
  [1720, 168],
  [1960, 158],
  [2200, 172],
  [2440, 192],
  [2680, 206],
  [2920, 202],
  [3140, 226],
  [3330, 296],
  [3480, 430],
  [3600, 600],
  [3720, 820],
];

const MOUTH: Pt[] = [
  [250, 1200],
  [236, 1060],
  [250, 900],
  [242, 760],
  [280, 610],
  [330, 500],
  [400, 412],
  [466, 366],
  [526, 318],
  [612, 290],
  [692, 302],
  [764, 282],
  [852, 320],
  [912, 374],
  [962, 452],
  [992, 544],
  [1024, 652],
  [1014, 764],
  [1038, 884],
  [1046, 1014],
  [1072, 1200],
];
const MOUTH_C: Pt = [660, 860];
const inset = (d: number, dx = 0): Pt[] =>
  MOUTH.map(([x, y]): Pt => {
    const ox = x - MOUTH_C[0];
    const oy = y - MOUTH_C[1];
    const len = Math.hypot(ox, oy) || 1;
    return [x - (ox / len) * d + dx, y > 1150 ? y + d : y - (oy / len) * d];
  });
const MOUTH_A = inset(16, 4);
const MOUTH_B = inset(30, 8);
const MOUTH_IN = inset(44, 12);
const shape = (pts: Pt[]): string => smooth(pts, false) + 'Z';
const MOUTH_IN_D = shape(MOUTH_IN);

const LEFT_NEAR: Pt[] = [
  [-120, 620],
  [70, 600],
  [168, 760],
  [180, 980],
  [150, 1200],
  [196, 1420],
  [160, 1640],
  [120, 1840],
  [96, 2100],
];

const LEFT_MID: Pt[] = [
  [-60, 300],
  [150, 330],
  [262, 470],
  [250, 700],
  [228, 940],
  [250, 1160],
  [330, 1330],
  [300, 1480],
  [180, 1600],
];

const RIGHT_NEAR: Pt[] = [
  [3720, 760],
  [3540, 680],
  [3446, 840],
  [3426, 1060],
  [3380, 1270],
  [3410, 1470],
  [3466, 1670],
  [3514, 1870],
  [3540, 2100],
];

const RIGHT_MID: Pt[] = [
  [3720, 380],
  [3420, 330],
  [3250, 420],
  [3160, 600],
  [3120, 800],
  [3150, 960],
  [3110, 1180],
  [3150, 1380],
  [3260, 1520],
  [3480, 1600],
];

const baseY = (x: number): number => 1130 + 14 * Math.sin(x / 230 + 0.6) + 8 * Math.sin(x / 83);
const ridgeA = (x: number): number =>
  1310 + 26 * Math.sin(x / 290 + 0.4) + 12 * Math.sin(x / 117 + 1);
const ridgeB = (x: number): number => 1560 + 30 * Math.sin(x / 330 + 2) + 14 * Math.sin(x / 140);

type Zone = [number, number, number, number];

const AVOID: Zone[] = [
  [POOL[0], POOL[1], POOL_R[0] + 80, POOL_R[1] + 70],
  [CRYSTALS[0], CRYSTALS[1] - 40, 320, 150],
  [MUSH[0], MUSH[1] - 30, 260, 120],
  [MITES[0], MITES[1] - 20, 230, 90],
  [1840, 1200, 180, 60],
  [1820, 1270, 90, 50],
  [2000, 1380, 140, 70],
  [2180, 1520, 130, 90],
  [660, 1170, 470, 80],
];

const free = (x: number, y: number): boolean =>
  !AVOID.some(([cx, cy, rx, ry]) => ((x - cx) / rx) ** 2 + ((y - cy) / ry) ** 2 < 1);

const op = (a: number): string => ` fill-opacity="${f(a)}"`;

const glowAt = (x: number, y: number, r: number, id: string): string =>
  `<circle cx="${f(x)}" cy="${f(y)}" r="${f(r)}" fill="url(#${id})"/>`;

const glowOval = (x: number, y: number, rx: number, ry: number, id: string): string =>
  `<ellipse cx="${f(x)}" cy="${f(y)}" rx="${f(rx)}" ry="${f(ry)}" fill="url(#${id})"/>`;

function softGlow(id: string, color: string, a: number): string {
  return `<radialGradient id="${id}"><stop offset="0" stop-color="${color}" stop-opacity="${f(a)}"/><stop offset="0.5" stop-color="${color}" stop-opacity="${f(a * 0.42)}"/><stop offset="1" stop-color="${color}" stop-opacity="0"/></radialGradient>`;
}

function clipped(id: string, clip: string, content: string): string {
  return `<defs><clipPath id="${id}"><path d="${clip}"/></clipPath></defs><g clip-path="url(#${id})">${content}</g>`;
}

function heightAt(pts: Pt[], x: number): number {
  const line = spline(pts, 320);
  for (let i = 1; i < line.length; i++) {
    const [x0, y0] = line[i - 1];
    const [x1, y1] = line[i];
    if (x >= x0 && x <= x1) return y0 + ((y1 - y0) * (x - x0)) / (x1 - x0 || 1);
  }
  return line[line.length - 1][1];
}

const ceilAt = (x: number): number => heightAt(CEIL, x);

const midDrop = (x: number): number =>
  Math.min(1, Math.max(0, (x - 1020) / 160)) * (64 + 26 * Math.sin(x / 150 + 1.3));

const midCeilAt = (x: number): number => ceilAt(x) + midDrop(x);

function edgeLine(fn: (x: number) => number, x0: number, x1: number, step: number, bump: number) {
  const pts: Pt[] = [];
  let i = 0;
  for (let x = x0; x <= x1; x += step) {
    pts.push([x, fn(x) + (i % 2 ? bump : -bump * 0.4)]);
    i++;
  }
  return pts;
}

function lump(cx: number, cy: number, rx: number, ry: number, seed: number, jitter = 0.12): string {
  const r = rng(seed);
  const start = r() * Math.PI * 2;
  const pts: Pt[] = [];
  const n = 9;
  for (let i = 0; i < n; i++) {
    const a = start + (i / n) * Math.PI * 2;
    const k = 1 + range(r, -jitter, jitter);
    pts.push([cx + Math.cos(a) * rx * k, cy + Math.sin(a) * ry * k]);
  }
  return smooth(pts, true);
}

function sparkleStar(x: number, y: number, s: number): string {
  return spiky(x, y, s, s * 0.24, 4, 0, 0.32);
}

function dripPts(x: number, top: number, len: number, w: number, seed: number, lift = 60): Pt[] {
  const r = rng(seed);
  const bend = range(r, -0.08, 0.08) * w;
  const wave = range(r, 0, Math.PI * 2);
  const left: Pt[] = [];
  const right: Pt[] = [];
  const steps = 7;
  for (let i = 0; i <= steps; i++) {
    const t = (i / steps) * 0.9;
    const hw = (w / 2) * Math.pow(1 - t / 0.98, 0.8) * (1 + 0.07 * Math.sin(t * 15 + wave));
    const bx = x + bend * t * t;
    left.push([bx - hw, top + len * t]);
    right.push([bx + hw * range(r, 0.94, 1.06), top + len * t]);
  }
  return [
    [x - w * 0.62, top - lift],
    ...left,
    [x + bend, top + len],
    ...right.reverse(),
    [x + w * 0.62, top - lift],
  ];
}

const dripD = (x: number, top: number, len: number, w: number, seed: number, lift = 60): string =>
  smooth(dripPts(x, top, len, w, seed, lift));

function waterDrop(x: number, y: number, s: number, p: Palette): string {
  return (
    path(
      `M${f(x)} ${f(y - 22 * s)}Q${f(x + 10 * s)} ${f(y - 5 * s)} ${f(x + 9.5 * s)} ${f(y + 2 * s)}A${f(9.6 * s)} ${f(9.6 * s)} 0 1 1 ${f(x - 9.5 * s)} ${f(y + 2 * s)}Q${f(x - 10 * s)} ${f(y - 5 * s)} ${f(x)} ${f(y - 22 * s)}Z`,
      p.drop,
    ) + path(ellipse(x - 3.5 * s, y, 2.6 * s, 3.6 * s, 20), p.dropLight, op(0.95))
  );
}

function stalactite(
  id: string,
  x: number,
  top: number,
  len: number,
  w: number,
  fill: string,
  shade: string,
  light: string,
  p: Palette,
  seed: number,
  drop = false,
  lift = 60,
): string {
  const body = dripD(x, top, len, w, seed, lift);
  let inner = path(ellipse(x + w * 0.42, top + len * 0.3, w * 0.34, len * 0.9), shade, op(0.7));
  inner += path(leaf(x - w * 0.26, top + len * 0.02, len * 0.66, w * 0.08, 86), light, op(0.55));
  for (const k of [0.3, 0.55, 0.76]) {
    const hw = (w / 2) * Math.pow(1 - k, 0.8);
    inner += stroke(
      curve(x - hw * 1.2, top + len * k, x + hw * 1.2, top + len * k + 4, -hw * 0.35),
      shade,
      Math.max(2.5, w * 0.04),
      ' stroke-opacity=".4"',
    );
  }
  let out = path(body, fill) + clipped(id, body, inner);
  if (drop) out += waterDrop(x, top + len + 18, Math.max(0.7, w / 110), p);
  return out;
}

function moundPts(x: number, base: number, h: number, w: number, seed: number): Pt[] {
  const r = rng(seed);
  const lean = range(r, -0.06, 0.06) * w;
  const wave = range(r, 0, Math.PI * 2);
  const tiers = Math.max(2, Math.round(h / (w * 0.62)));
  const left: Pt[] = [];
  const right: Pt[] = [];
  const steps = 8;
  for (let i = 0; i <= steps; i++) {
    const t = (i / steps) * 0.86;
    const hw = (w / 2) * (1 - t * 0.68) * (1 + 0.13 * Math.sin(t * tiers * Math.PI * 2 + wave));
    left.push([x - hw + lean * t, base - h * t]);
    right.push([x + hw * range(r, 0.95, 1.05) + lean * t, base - h * t]);
  }
  return [
    [x - w / 2, base + 12],
    ...left,
    [x + lean - w * 0.05, base - h * 0.985],
    [x + lean + w * 0.05, base - h * 0.985],
    ...right.reverse(),
    [x + w / 2, base + 12],
  ];
}

function moundD(x: number, base: number, h: number, w: number, seed: number): string {
  return smooth(moundPts(x, base, h, w, seed), false) + 'Z';
}

function stalagmite(
  id: string,
  x: number,
  base: number,
  h: number,
  w: number,
  c: { body: string; shade: string; light: string; tip: string },
  shadow: string,
  seed: number,
): string {
  const body = moundD(x, base, h, w, seed);
  let inner = path(ellipse(x + w * 0.46, base - h * 0.3, w * 0.38, h * 0.95), c.shade, op(0.75));
  inner += path(leaf(x - w * 0.3, base - h * 0.06, h * 0.72, w * 0.08, -86), c.light, op(0.6));
  for (const k of [0.22, 0.45, 0.66]) {
    const hw = (w / 2) * (1 - k * 0.74);
    inner += stroke(
      curve(x - hw * 1.2, base - h * k, x + hw * 1.2, base - h * k + 6, hw * 0.35),
      c.shade,
      Math.max(2.5, w * 0.03),
      ' stroke-opacity=".45"',
    );
  }
  inner += path(ellipse(x - w * 0.05, base - h * 0.9, w * 0.08, h * 0.04, -10), c.tip, op(0.75));
  return (
    path(ellipse(x + w * 0.1, base + 8, w * 0.64, Math.max(10, w * 0.11)), shadow, op(0.4)) +
    path(body, c.body) +
    clipped(id, body, inner)
  );
}

function boulder(
  id: string,
  x: number,
  base: number,
  rx: number,
  ry: number,
  c: { body: string; shade: string; light: string },
  shadow: string,
  seed: number,
): string {
  const cy = base - ry * 0.9;
  const body = lump(x, cy, rx, ry, seed, 0.08);
  const inner =
    path(ellipse(x + rx * 0.55, cy + ry * 0.45, rx * 0.95, ry * 1.05), c.shade, op(0.8)) +
    path(ellipse(x - rx * 0.34, cy - ry * 0.5, rx * 0.26, ry * 0.13, -18), c.light, op(0.7));
  return (
    path(ellipse(x + rx * 0.12, base + 4, rx * 1.1, ry * 0.2), shadow, op(0.4)) +
    path(body, c.body) +
    clipped(id, body, inner)
  );
}

type Tone = [string, string, string];

function prism(x: number, base: number, h: number, w: number, tilt: number, c: Tone): string {
  const sh = base - h + w * 0.8;
  const tipY = base - h;
  const lx = x - w / 2;
  const rx = x + w / 2;
  const m1 = x - w * 0.14;
  const m2 = x + w * 0.2;
  const tipX = x + w * 0.03;
  const rounded = (color: string) =>
    ` stroke="${color}" stroke-width="${f(w * 0.1)}" stroke-linejoin="round"`;
  let out = path(
    poly([
      [lx, base + 8],
      [lx, sh],
      [tipX, tipY],
      [rx, sh],
      [rx, base + 8],
    ]),
    c[0],
    rounded(c[0]),
  );
  out += path(
    poly([
      [lx, base + 8],
      [lx, sh],
      [tipX, tipY],
      [m1, sh + w * 0.12],
      [m1, base + 8],
    ]),
    c[1],
    rounded(c[1]),
  );
  out += path(
    poly([
      [m2, base + 8],
      [m2, sh + w * 0.14],
      [tipX, tipY],
      [rx, sh],
      [rx, base + 8],
    ]),
    c[2],
    rounded(c[2]),
  );
  out += path(
    poly([
      [lx + w * 0.1, base - h * 0.12],
      [lx + w * 0.1, sh + w * 0.1],
      [lx + w * 0.2, sh - w * 0.04],
      [lx + w * 0.2, base - h * 0.18],
    ]),
    '#ffffff',
    op(0.5),
  );
  return tilt ? group(out, `rotate(${f(tilt)} ${f(x)} ${f(base)})`) : out;
}

function crystalTones(p: Palette): Tone[] {
  return [
    [p.crystalA, p.crystalALight, p.crystalADark],
    [p.crystalB, p.crystalBLight, p.crystalBDark],
    [p.crystalC, p.crystalCLight, p.crystalCDark],
  ];
}

function smallCluster(
  x: number,
  base: number,
  s: number,
  p: Palette,
  tone: number,
  seed: number,
  glowId: string,
): string {
  const r = rng(seed);
  const tones = crystalTones(p);
  const c = tones[tone % 3];
  const c2 = tones[(tone + 1) % 3];
  let out = glowAt(x, base - 40 * s, 130 * s, glowId);
  const list: [number, number, number, number, Tone][] = [
    [-26, 70, 24, -24, c2],
    [24, 60, 22, 22, c],
    [0, 104 + range(r, -10, 10), 30, -4, c],
    [-8, 50, 20, -40, c],
    [16, 46, 18, 42, c2],
  ];
  for (const [dx, h, w, tilt, tc] of list) {
    out += prism(x + dx * s, base, h * s, w * s, tilt, tc);
  }
  out += path(lump(x, base + 6 * s, 50 * s, 15 * s, seed), p.stoneShade);
  return out;
}

function mushroom(
  x: number,
  base: number,
  h: number,
  r: number,
  lean: number,
  cap: Tone,
  p: Palette,
): string {
  const tx = x + lean;
  const ty = base - h;
  let out = path(
    tube(
      [
        [x, base + 4],
        [x + lean * 0.35, base - h * 0.5],
        [tx, ty + r * 0.1],
      ],
      (u) => r * (0.21 - 0.05 * u),
    ),
    p.mushStem,
  );
  out += path(
    tube(
      [
        [x + r * 0.1, base],
        [x + lean * 0.35 + r * 0.1, base - h * 0.5],
        [tx + r * 0.08, ty + r * 0.2],
      ],
      (u) => r * (0.07 - 0.02 * u),
    ),
    p.mushStemShade,
    op(0.7),
  );
  out += path(ellipse(tx, ty + r * 0.04, r * 0.88, r * 0.17), p.mushGill);
  out += path(
    `M${f(tx - r)} ${f(ty)}C${f(tx - r * 1.02)} ${f(ty - r * 0.98)} ${f(tx + r * 1.02)} ${f(ty - r * 0.98)} ${f(tx + r)} ${f(ty)}Q${f(tx)} ${f(ty + r * 0.2)} ${f(tx - r)} ${f(ty)}Z`,
    cap[0],
  );
  out += path(
    `M${f(tx + r * 0.25)} ${f(ty - r * 0.7)}C${f(tx + r * 0.8)} ${f(ty - r * 0.62)} ${f(tx + r)} ${f(ty - r * 0.3)} ${f(tx + r)} ${f(ty)}Q${f(tx + r * 0.6)} ${f(ty + r * 0.14)} ${f(tx + r * 0.2)} ${f(ty + r * 0.16)}Q${f(tx + r * 0.62)} ${f(ty - r * 0.3)} ${f(tx + r * 0.25)} ${f(ty - r * 0.7)}Z`,
    cap[2],
    op(0.6),
  );
  out += stroke(
    curve(tx - r * 0.66, ty - r * 0.34, tx - r * 0.06, ty - r * 0.72, r * 0.12),
    cap[1],
    r * 0.11,
    ' stroke-opacity=".85"',
  );
  for (const [dx, dy, rr] of [
    [-0.4, -0.42, 0.11],
    [0.18, -0.56, 0.09],
    [0.5, -0.3, 0.08],
    [-0.08, -0.26, 0.07],
  ]) {
    out += path(circle(tx + dx * r, ty + dy * r, rr * r), p.mushSpot, op(0.9));
  }
  return out;
}

function pebbles(x: number, y: number, s: number, p: Palette): string {
  return (
    path(ellipse(x, y, 18 * s, 10 * s), p.pebbleShade) +
    path(ellipse(x - 2 * s, y - 3 * s, 16 * s, 8.5 * s), p.pebble) +
    path(ellipse(x - 6 * s, y - 6 * s, 6 * s, 3 * s), p.pebbleLight, op(0.8)) +
    path(ellipse(x + 26 * s, y + 4 * s, 11 * s, 6 * s), p.pebbleShade) +
    path(ellipse(x + 25 * s, y + 2 * s, 10 * s, 5 * s), p.pebble)
  );
}

function puddle(x: number, y: number, s: number, p: Palette): string {
  return (
    path(ellipse(x, y, 72 * s, 17 * s), p.floorShade, op(0.6)) +
    path(ellipse(x, y - 2 * s, 64 * s, 13 * s), p.water, op(0.8)) +
    stroke(
      curve(x - 34 * s, y - 5 * s, x + 6 * s, y - 6 * s, -2 * s),
      p.waterShine,
      3.5 * s,
      ' stroke-opacity=".8"',
    )
  );
}

function glowDot(x: number, y: number, s: number, p: Palette, id: string, night: boolean): string {
  return (
    glowAt(x, y, (night ? 30 : 18) * s, id) +
    path(circle(x, y, 4.2 * s), p.glow) +
    path(circle(x, y, 2 * s), p.glowCore)
  );
}

function thread(
  x: number,
  top: number,
  len: number,
  s: number,
  p: Palette,
  id: string,
  night: boolean,
  seed: number,
): string {
  const r = rng(seed);
  const sway = range(r, -6, 6);
  let out = stroke(
    `M${f(x)} ${f(top)}Q${f(x + sway)} ${f(top + len * 0.5)} ${f(x + sway * 0.4)} ${f(top + len)}`,
    p.silk,
    1.8 * s,
    ' stroke-opacity=".75"',
  );
  const n = Math.max(3, Math.round(len / (20 * s)));
  for (let i = 1; i <= n; i++) {
    const t = i / n;
    const bx = x + sway * (2 * t * (1 - t)) + sway * 0.4 * t * t;
    const by = top + len * t;
    const br = (2.2 + 2.4 * t + (i === n ? 1.6 : 0)) * s;
    if (night && i % 2 === 0) out += glowAt(bx, by, br * 4, id);
    out += path(circle(bx, by, br), p.glow);
    out += path(circle(bx - br * 0.3, by - br * 0.3, br * 0.35), p.glowCore, op(0.9));
  }
  return out;
}

function larva(x: number, y: number, s: number, p: Palette, id: string): string {
  let body = '';
  for (const [dx, dy, r] of [
    [-14, 1, 4.2],
    [-8, 3, 5],
    [-1, 4.5, 5.4],
    [6, 5, 5.2],
  ]) {
    body += circle(x + dx * s, y + dy * s, r * s);
  }
  return (
    glowAt(x + 10 * s, y + 6 * s, 30 * s, id) +
    stroke(
      curve(x - 18 * s, y - 2 * s, x + 16 * s, y - 2 * s, 3 * s),
      p.silk,
      2 * s,
      ' stroke-opacity=".7"',
    ) +
    path(body, p.larva) +
    path(circle(x - 15 * s, y, 1.3 * s), p.larvaEye) +
    path(circle(x + 12 * s, y + 5 * s, 4.6 * s), p.glow) +
    path(circle(x + 12 * s, y + 5 * s, 2 * s), p.glowCore)
  );
}

function outside(p: Palette, mode: Mode): string {
  const night = mode === 'night';
  const hills = (pts: Pt[], color: string) =>
    path(`${smooth(pts, false)}L1120 1240L180 1240Z`, color);
  let out =
    `<defs>${linearGradient(`cvSky${mode}`, [
      [0, p.skyTop],
      [1, p.skyBottom],
    ])}${softGlow(`cvHaze${mode}`, p.haze, night ? 0.4 : 0.85)}</defs>` +
    `<rect x="180" y="200" width="940" height="1040" fill="url(#cvSky${mode})"/>` +
    glowOval(680, 1010, 560, 280, `cvHaze${mode}`);
  if (night) {
    out += starField(23, 50, 270, 280, 1040, 920, p.star);
  } else {
    out += cloud(420, 470, 0.4, p.cloud, p.cloudShade);
    out += cloud(930, 720, 0.3, p.cloud, p.cloudShade);
  }
  out += mountain(470, 1010, 520, 150, p.mountain, p.mountainShade, p.snow);
  out += mountain(860, 1010, 460, 110, p.mountain, p.mountainShade, p.snow);
  out += hills(
    [
      [180, 1010],
      [330, 975],
      [520, 1000],
      [700, 966],
      [880, 994],
      [1120, 960],
    ],
    p.hillFar,
  );
  out += hills(
    [
      [180, 1056],
      [380, 1028],
      [600, 1066],
      [820, 1036],
      [1120, 1060],
    ],
    p.hill,
  );
  out += roundTree(915, 1068, 0.42, p.trunk, p.tree, p.treeDark);
  out += roundTree(372, 1056, 0.3, p.trunk, p.tree, p.treeDark);
  out += hills(
    [
      [180, 1104],
      [420, 1088],
      [700, 1110],
      [960, 1094],
      [1120, 1104],
    ],
    p.meadow,
  );
  const r = rng(9);
  for (let i = 0; i < 16; i++) {
    const x = range(r, 300, 1010);
    const y = range(r, 1112, 1150);
    out += path(circle(x, y, range(r, 4, 6.5)), i % 2 ? p.flowerA : p.flowerB);
  }
  return clipped(`cvMouthClip${mode}`, MOUTH_IN_D, out);
}

function mouthRim(p: Palette, mode: Mode): string {
  const night = mode === 'night';
  const ring = (a: Pt[], b: Pt[], color: string) =>
    path(shape(a) + shape(b), color, ' fill-rule="evenodd"');
  let out =
    ring(MOUTH, MOUTH_A, p.tunnelDark) +
    ring(MOUTH_A, MOUTH_B, p.tunnel) +
    ring(MOUTH_B, MOUTH_IN, p.tunnelLight);
  out += stroke(
    smooth(MOUTH_IN.slice(9, -2), false),
    p.rimLight,
    6,
    ` stroke-opacity="${night ? 0.35 : 0.6}"`,
  );
  out += stroke(smooth(MOUTH.slice(1, -1), false), p.midLight, 7, ' stroke-opacity=".45"');
  const r = rng(71);
  const top = spline(MOUTH_IN.slice(3, -3), 26);
  top.forEach(([x, y], i) => {
    if (i % 2 || y > 700) return;
    const len = range(r, 26, 58);
    for (let k = 0; k < 3; k++) {
      out += path(
        leaf(x + (k - 1) * 6, y - 6, len * (1 - k * 0.2), 6, 90 + (k - 1) * 18),
        k % 2 ? p.mossDark : p.moss,
      );
    }
  });
  for (const [x, s] of [
    [300, 1.2],
    [380, 0.9],
    [940, 1.1],
    [1010, 1.3],
  ]) {
    out += grassTuft(x, baseY(x) + 6, s, p.moss);
    out += grassTuft(x + 20, baseY(x) + 8, s * 0.8, p.mossDark);
  }
  return out;
}

function backWall(p: Palette, mode: Mode): string {
  const night = mode === 'night';
  let out =
    `<defs>${linearGradient(`cvWall${mode}`, [
      [0, p.backTop],
      [0.3, p.back],
      [0.58, p.backLow],
    ])}${softGlow(`cvMouthGlow${mode}`, p.backGlow, night ? 0.45 : 0.75)}${softGlow(
      `cvVioletGlow${mode}`,
      p.backGlowB,
      night ? 0.55 : 0.35,
    )}${softGlow(`cvTealGlow${mode}`, p.backGlowC, night ? 0.5 : 0.32)}</defs>` +
    `<rect x="-50" y="-50" width="${W + 100}" height="${H + 100}" fill="url(#cvWall${mode})"/>`;
  out += glowOval(2850, 1250, 900, 480, `cvTealGlow${mode}`);
  out += glowOval(3250, 1150, 520, 480, `cvVioletGlow${mode}`);
  const r = rng(13);
  for (let i = 0; i < 34; i++) {
    const x = range(r, 0, W);
    const y = range(r, 280, 1100);
    out += path(
      lump(x, y, range(r, 40, 110), range(r, 26, 60), i + 40),
      r() < 0.5 ? p.strata : p.strataLight,
      op(range(r, 0.2, 0.38)),
    );
  }
  for (let i = 0; i < 20; i++) {
    const x = range(r, 1100, 3300);
    const y = range(r, 380, 1050);
    const len = range(r, 40, 110);
    out += stroke(
      curve(x, y, x + range(r, -30, 30), y + len, range(r, -16, 16)),
      p.strata,
      range(r, 4, 7),
      ' stroke-opacity=".35"',
    );
  }
  out += glowOval(MOUTH_C[0] + 60, MOUTH_C[1] - 60, 980, 820, `cvMouthGlow${mode}`);
  return out;
}

function curtain(x: number, top: number, len: number, w: number, p: Palette, seed: number): string {
  const r = rng(seed);
  let out = '';
  const n = 6;
  for (let i = 0; i < n; i++) {
    const t = i / (n - 1);
    const fx = x - w / 2 + w * t;
    const fl = len * (0.6 + 0.4 * Math.sin(t * Math.PI)) * range(r, 0.85, 1.05);
    const fw = (w / n) * 1.25;
    out += path(dripD(fx, top, fl, fw, seed * 10 + i), i % 2 ? p.farShade : p.far);
  }
  return out;
}

function farLayer(p: Palette): string {
  const c = { body: p.far, shade: p.farShade, light: p.farLight, tip: p.farLight };
  let out = curtain(1450, ceilAt(1450) + 60, 300, 230, p, 3);
  out += curtain(2480, ceilAt(2480) + 60, 260, 210, p, 5);
  for (const [x, len, w, seed] of [
    [1180, 120, 56, 1],
    [1320, 80, 40, 2],
    [1620, 150, 62, 3],
    [2000, 120, 52, 4],
    [2300, 170, 64, 5],
    [2700, 140, 56, 7],
    [2850, 100, 46, 8],
    [3020, 130, 50, 9],
  ]) {
    out += path(dripD(x, ceilAt(x) + 60, len, w, seed + 300), p.far);
  }
  const r = rng(61);
  const back: string[] = [];
  const front: string[] = [];
  for (let x = 1080; x < 3240; x += range(r, 60, 170)) {
    const big = r() < 0.35;
    const rx = big ? range(r, 70, 120) : range(r, 30, 64);
    const ry = big ? range(r, 44, 70) : range(r, 18, 36);
    const row = r() < 0.5;
    const seed = Math.round(x);
    const svg = boulder(
      `cvRub${seed}`,
      x,
      baseY(x) + (row ? 4 : 22),
      rx,
      ry,
      row ? c : { body: p.farShade, shade: p.farDeep, light: p.far },
      p.floorShade,
      seed,
    );
    (row ? back : front).push(svg);
  }
  out += back.join('') + front.join('');
  for (const [x, h, w, seed] of [
    [1240, 130, 90, 1],
    [2060, 170, 100, 3],
    [2200, 100, 70, 4],
    [2430, 190, 110, 5],
    [3020, 160, 100, 7],
  ]) {
    out += stalagmite(`cvFar${seed}`, x, baseY(x) + 16, h, w, c, p.floorShade, seed + 400);
  }
  return out;
}

function midLayer(p: Palette, mode: Mode): string {
  let out = `<defs>${softGlow(`cvShelfGlow${mode}`, p.mushGlow, mode === 'night' ? 0.8 : 0.4)}</defs>`;
  for (const [x, len, w, seed] of [
    [1150, 160, 70, 1],
    [1260, 90, 50, 2],
    [1560, 210, 84, 3],
    [1680, 120, 56, 4],
    [2040, 170, 74, 5],
    [2310, 230, 88, 6],
    [2440, 110, 54, 7],
    [2740, 190, 80, 8],
    [2900, 120, 56, 9],
    [3060, 160, 70, 10],
  ]) {
    out += stalactite(
      `cvMidTite${seed}${mode}`,
      x,
      midCeilAt(x) - 6,
      len,
      w,
      p.mid,
      p.midShade,
      p.midLight,
      p,
      seed + 200,
    );
  }
  const edge = edgeLine(midCeilAt, -100, 3720, 110, 14);
  out += path(`${smooth(edge, false)}L3720 -100L-100 -100Z`, p.mid);
  out += stroke(smooth(edge.slice(9), false), p.midLight, 7, ' stroke-opacity=".5"');
  const sideD = (pts: Pt[], edgeX: number) =>
    `${smooth(pts, false)}L${edgeX} ${pts[pts.length - 1][1]}L${edgeX} ${pts[0][1]}Z`;
  out += path(sideD(LEFT_MID, -120), p.mid);
  out += stroke(smooth(LEFT_MID.slice(1), false), p.midLight, 8, ' stroke-opacity=".45"');
  out += path(sideD(RIGHT_MID, 3720), p.mid);
  out += stroke(smooth(RIGHT_MID.slice(1), false), p.midLight, 8, ' stroke-opacity=".45"');
  for (const [x, len, w, seed] of [
    [1210, 60, 40, 1],
    [1300, 96, 50, 2],
    [1420, 70, 40, 3],
    [1520, 50, 34, 4],
  ]) {
    out += path(dripD(x, 884, len, w, seed + 520), p.midShade);
  }
  out += path(
    smooth(
      [
        [1150, 842],
        [1230, 820],
        [1360, 810],
        [1500, 812],
        [1640, 820],
        [1640, 900],
        [1500, 904],
        [1360, 910],
        [1240, 900],
        [1158, 872],
      ],
      true,
      0.8,
    ),
    p.mid,
  );
  out += path(
    smooth(
      [
        [1154, 840],
        [1230, 816],
        [1360, 806],
        [1500, 808],
        [1640, 816],
        [1640, 834],
        [1500, 830],
        [1360, 834],
        [1230, 842],
      ],
      true,
      0.7,
    ),
    p.midLight,
  );
  const a: Tone = [p.mushA, p.mushALight, p.mushADark];
  const b: Tone = [p.mushB, p.mushBLight, p.mushBDark];
  out += glowOval(1400, 800, 90, 50, `cvShelfGlow${mode}`);
  out += mushroom(1390, 826, 46, 26, -4, a, p) + mushroom(1424, 830, 30, 18, 5, b, p);
  const ledgeTop: Pt[] = [
    [2930, 1018],
    [3000, 994],
    [3130, 986],
    [3260, 990],
  ];
  const ledgeD = smooth(
    [...ledgeTop, [3300, 1040], [3260, 1096], [3110, 1092], [3000, 1076], [2936, 1046]],
    true,
    0.8,
  );
  for (const [x, len, w, seed] of [
    [3000, 70, 44, 1],
    [3080, 110, 52, 2],
    [3180, 64, 40, 3],
  ]) {
    out += path(dripD(x, 1076, len, w, seed + 500), p.midShade);
  }
  out += path(ledgeD, p.mid);
  out += path(
    smooth(
      [
        [2934, 1014],
        [3000, 990],
        [3130, 982],
        [3260, 986],
        [3300, 1010],
        [3260, 1010],
        [3130, 1008],
        [3000, 1014],
      ],
      true,
      0.7,
    ),
    p.midLight,
  );
  return out;
}

function floor(p: Palette, mode: Mode): string {
  const line = (fn: (x: number) => number): Pt[] => {
    const pts: Pt[] = [];
    for (let x = -100; x <= W + 100; x += 60) pts.push([x, fn(x)]);
    return pts;
  };
  const top = line(baseY);
  let out =
    `<defs>${linearGradient(`cvFloor${mode}`, [
      [0, p.floorFar],
      [0.35, p.floor],
      [1, p.floorNear],
    ])}${softGlow(`cvLightPool${mode}`, p.lightPool, mode === 'night' ? 0.3 : 0.65)}</defs>` +
    `<path d="${smooth(top, false)}L${W + 100} ${H + 60}L-100 ${H + 60}Z" fill="url(#cvFloor${mode})"/>`;
  for (const fn of [ridgeA, ridgeB]) {
    const pts = line(fn);
    const shadeD = `${smooth(pts, false)}${smooth(
      pts
        .slice()
        .reverse()
        .map(([x, y]): Pt => [x, y + 70 + 16 * Math.sin(x / 90)]),
      false,
    ).replace(/^M/, 'L')}Z`;
    out += path(shadeD, p.floorShade, op(0.16));
  }
  out += glowOval(760, 1290, 820, 200, `cvLightPool${mode}`);
  const r = rng(77);
  for (let i = 0; i < 26; i++) {
    const x = range(r, 0, W);
    const y = range(r, 1180, 1960);
    if (!free(x, y)) continue;
    const k = (y - 1100) / 900;
    out += path(
      ellipse(x, y, range(r, 80, 200) * (0.6 + k), range(r, 10, 22) * (0.6 + k)),
      r() < 0.55 ? p.floorLight : p.floorShade,
      op(0.4),
    );
  }
  for (let i = 0; i < 18; i++) {
    const x = range(r, 100, W - 100);
    const y = range(r, 1250, 1950);
    if (!free(x, y)) continue;
    const len = range(r, 50, 120);
    out += stroke(
      curve(x, y, x + len, y + range(r, -10, 10), range(r, -12, 12)),
      p.crack,
      range(r, 3, 5),
      ' stroke-opacity=".45"',
    );
  }
  return out;
}

function rays(p: Palette, mode: Mode): string {
  const a = mode === 'night' ? 0.5 : 1;
  const list: [Pt, Pt, number, number, number][] = [
    [[880, 440], [1900, 1750], 60, 420, 0.1],
    [[760, 380], [1420, 1900], 70, 380, 0.12],
    [[960, 660], [2400, 1500], 50, 360, 0.07],
    [[640, 400], [980, 1950], 60, 340, 0.09],
  ];
  let out = `<defs><clipPath id="cvRayClip${mode}"><path d="M-100 -100H${W + 100}V${H + 100}H-100Z${MOUTH_IN_D}" clip-rule="evenodd"/></clipPath></defs><g clip-path="url(#cvRayClip${mode})">`;
  list.forEach(([s, e, ws, we, alpha], i) => {
    const dx = e[0] - s[0];
    const dy = e[1] - s[1];
    const len = Math.hypot(dx, dy);
    const nx = -dy / len;
    const ny = dx / len;
    const id = `cvRay${i}${mode}`;
    out +=
      `<defs><linearGradient id="${id}" gradientUnits="userSpaceOnUse" x1="${f(s[0])}" y1="${f(s[1])}" x2="${f(e[0])}" y2="${f(e[1])}"><stop offset="0" stop-color="${p.ray}" stop-opacity="${f(alpha * a)}"/><stop offset="1" stop-color="${p.ray}" stop-opacity="0"/></linearGradient></defs>` +
      path(
        poly([
          [s[0] + (nx * ws) / 2, s[1] + (ny * ws) / 2],
          [e[0] + (nx * we) / 2, e[1] + (ny * we) / 2],
          [e[0] - (nx * we) / 2, e[1] - (ny * we) / 2],
          [s[0] - (nx * ws) / 2, s[1] - (ny * ws) / 2],
        ]),
        `url(#${id})`,
      );
  });
  return out + '</g>';
}

function nearWalls(p: Palette): string {
  const side = (pts: Pt[], edgeX: number) =>
    `${smooth(pts, false)}L${edgeX} 2100L${edgeX} ${pts[0][1]}Z`;
  let out = path(side(LEFT_NEAR, -120), p.near) + path(side(RIGHT_NEAR, 3720), p.near);
  out += stroke(smooth(LEFT_NEAR.slice(1), false), p.nearLight, 10, ' stroke-opacity=".6"');
  out += stroke(smooth(RIGHT_NEAR.slice(1), false), p.nearLight, 10, ' stroke-opacity=".5"');
  const r = rng(29);
  for (let i = 0; i < 12; i++) {
    const left = i % 2 === 0;
    const y = range(r, 700, 1950);
    const x = left ? range(r, -40, 90) : range(r, 3500, 3640);
    out += path(lump(x, y, range(r, 30, 60), range(r, 20, 40), i + 90), p.nearShade, op(0.6));
  }
  return out;
}

function ceiling(p: Palette, mode: Mode): string {
  const night = mode === 'night';
  const glowId = `cvDot${mode}`;
  let out = `<defs>${linearGradient(`cvTite${mode}`, [
    [0, p.near],
    [0.5, p.stalactite],
    [1, p.stalactiteTip],
  ])}${softGlow(glowId, p.glowHalo, night ? 0.9 : 0.55)}</defs>`;
  for (const [x, len, w, seed, drop] of [
    [1300, 290, 124, 2, 1],
    [1420, 140, 70, 3, 0],
    [1980, 230, 104, 4, 1],
    [2080, 110, 60, 11, 0],
    [2850, 270, 116, 6, 1],
    [2970, 140, 70, 7, 0],
    [3150, 200, 96, 8, 1],
    [200, 150, 80, 10, 0],
    [3300, 110, 64, 9, 0],
  ] as [number, number, number, number, number][]) {
    out += stalactite(
      `cvTite${seed}${mode}`,
      x,
      ceilAt(x) - 6,
      len,
      w,
      `url(#cvTite${mode})`,
      p.nearShade,
      p.stalactiteTip,
      p,
      seed + 100,
      drop === 1,
    );
  }
  const edge = edgeLine(ceilAt, -100, 3720, 120, 16);
  const ceilD = `${smooth(edge, false)}L3720 -100L-100 -100Z`;
  out += path(ceilD, p.near);
  out += stroke(smooth(edge, false), p.nearLight, 9, ' stroke-opacity=".6"');
  const r = rng(41);
  for (let i = 0; i < 18; i++) {
    const x = range(r, 0, W);
    const y = range(r, 10, ceilAt(x) - 60);
    out += path(lump(x, y, range(r, 40, 90), range(r, 14, 30), i + 60), p.nearShade, op(0.6));
  }
  for (let i = 0; i < 130; i++) {
    const x = range(r, 40, W - 40);
    const cy = ceilAt(x);
    const y = range(r, Math.max(14, cy - 160), cy - 14);
    out += glowDot(x, y, range(r, 0.55, 1.1), p, glowId, night);
  }
  for (let i = 0; i < 16; i++) {
    const x = range(r, 1150, 3300);
    if (Math.abs(x - WORMS_X) < 260 || Math.abs(x - DRIP_X) < 110) continue;
    out += thread(x, ceilAt(x) - 10, range(r, 40, 120), 0.8, p, glowId, night, i + 7);
  }
  return out;
}

function sideGlows(p: Palette, mode: Mode): string {
  const night = mode === 'night';
  const glowId = `cvWallDot${mode}`;
  let out = `<defs>${softGlow(glowId, p.glowHalo, night ? 0.9 : 0.5)}</defs>`;
  const r = rng(83);
  for (let i = 0; i < 26; i++) {
    const left = i % 2 === 0;
    const y = range(r, 640, 1300);
    const x = left ? range(r, 20, 140) : range(r, 3480, 3580);
    out += glowDot(x, y, range(r, 0.5, 0.9), p, glowId, night);
  }
  return out;
}

function floorItems(p: Palette, mode: Mode): [number, string][] {
  const c = { body: p.stone, shade: p.stoneShade, light: p.stoneLight, tip: p.stoneTip };
  const b = { body: p.stone, shade: p.stoneShade, light: p.stoneLight };
  const glow = `cvClusterGlow${mode}`;
  const items: [number, string][] = [
    [1330, stalagmite(`cvMiteA${mode}`, 2300, 1330, 170, 140, c, p.floorShade, 21)],
    [1300, stalagmite(`cvMiteB${mode}`, 2420, 1300, 110, 100, c, p.floorShade, 22)],
    [1420, stalagmite(`cvMiteC${mode}`, 3060, 1420, 220, 160, c, p.floorShade, 23)],
    [1600, stalagmite(`cvMiteD${mode}`, 330, 1600, 240, 190, c, p.floorShade, 24)],
    [1500, stalagmite(`cvMiteE${mode}`, 460, 1500, 140, 120, c, p.floorShade, 25)],
    [1170, cliff(p, mode)],
    [1180, waterfall(p, mode)],
    [1200, stream(p)],
    [1440, boulder(`cvRockS${mode}`, 2060, 1440, 74, 46, b, p.floorShade, 34)],
    [1250, boulder(`cvRockT${mode}`, 1730, 1250, 60, 34, b, p.floorShade, 35)],
    [1246, boulder(`cvRockU${mode}`, 1960, 1246, 46, 28, b, p.floorShade, 36)],
    [1470, boulder(`cvRockA${mode}`, 1140, 1470, 90, 60, b, p.floorShade, 31)],
    [1900, boulder(`cvRockC${mode}`, 3330, 1900, 130, 80, b, p.floorShade, 33)],
    [1520, puddle(1960, 1520, 1, p)],
    [1850, puddle(1200, 1850, 1.2, p)],
    [1880, puddle(2240, 1880, 1, p)],
    [1530, smallCluster(2300, 1532, 0.8, p, 1, 5, glow)],
    [1300, smallCluster(880, 1300, 0.7, p, 0, 7, glow)],
    [994, smallCluster(3236, 994, 0.7, p, 2, 9, glow)],
  ];
  const r = rng(91);
  for (let i = 0; i < 22; i++) {
    const x = range(r, 160, W - 160);
    const y = range(r, 1220, 1930);
    if (!free(x, y)) continue;
    const s = 0.55 + ((y - 1100) / 900) * 0.9;
    items.push([
      y - 20,
      floorStone(`cvStone${i}${mode}`, x, y, s * range(r, 0.8, 1.2), p, i + 700),
    ]);
  }
  for (let i = 0; i < 44; i++) {
    const x = range(r, 120, W - 120);
    const y = range(r, 1200, 1940);
    if (!free(x, y)) continue;
    items.push([y, pebbles(x, y, 0.6 + ((y - 1100) / 900) * 0.8, p)]);
  }
  return items;
}

function cliff(p: Palette, mode: Mode): string {
  const pts = CLIFF;
  const body = smooth(pts, false) + 'Z';
  let inner = path(ellipse(2130, 960, 170, 460), p.midShade, op(0.85));
  inner += path(ellipse(1610, 900, 50, 300, 8), p.midLight, op(0.45));
  const r = rng(19);
  for (let i = 0; i < 9; i++) {
    const x = range(r, 1600, 2100);
    const y = range(r, 680, 1150);
    inner += stroke(
      curve(x, y, x + range(r, 30, 80), y + range(r, -14, 14), range(r, -10, 10)),
      p.midShade,
      range(r, 4, 7),
      ' stroke-opacity=".55"',
    );
  }
  for (const [x, y, rx] of [
    [1700, 700, 46],
    [1990, 660, 54],
    [1630, 1000, 40],
    [2080, 1060, 50],
  ]) {
    inner += path(lump(x, y, rx, rx * 0.5, x), p.midLight, op(0.3));
  }
  const top = smooth(pts.slice(3, 15), false);
  const c = { body: p.mid, shade: p.midShade, light: p.midLight };
  let base = '';
  for (const [x, rx, ry] of [
    [1560, 70, 40],
    [1650, 56, 30],
    [1730, 64, 36],
    [1960, 60, 34],
    [2050, 74, 42],
    [2150, 62, 34],
  ]) {
    base += boulder(`cvCliffRock${x}${mode}`, x, 1236, rx, ry, c, p.floorShade, x);
  }
  return (
    path(ellipse(1880, 1226, 400, 34), p.floorShade, op(0.5)) +
    path(body, p.mid) +
    clipped(`cvCliff${mode}`, body, inner) +
    stroke(top, p.midLight, 9, ' stroke-opacity=".7"') +
    base
  );
}

function waterfall(p: Palette, mode: Mode): string {
  const night = mode === 'night';
  const bottom = baseY(FALL_X) + 64;
  const top = FALL_TOP + 12;
  const L = bottom - top;
  const edge = (side: number): Pt[] =>
    [0, 0.06, 0.2, 0.4, 0.6, 0.8, 1].map((t): Pt => [
      FALL_X + side * (40 + 34 * t + (t > 0 && t < 0.12 ? 12 : 0)) + Math.sin(t * 13 + side) * 5,
      top + L * t,
    ]);
  const body = smooth([...edge(-1), ...edge(1).reverse()], false) + 'Z';
  let inner = path(
    `M${FALL_X - 30} ${top}L${FALL_X + 34} ${top}L${FALL_X + 60} ${bottom}L${FALL_X - 52} ${bottom}Z`,
    p.fallLight,
    op(0.55),
  );
  for (const [dx, w, a] of [
    [-44, 6, 0.75],
    [-22, 4, 0.6],
    [-4, 7, 0.85],
    [18, 4, 0.6],
    [40, 6, 0.7],
  ]) {
    inner += stroke(
      `M${FALL_X + dx * 0.8} ${top + 30}C${FALL_X + dx * 0.9} ${top + L * 0.4} ${FALL_X + dx * 1.2} ${top + L * 0.7} ${FALL_X + dx * 1.4} ${bottom - 30}`,
      p.waterShine,
      w,
      ` stroke-opacity="${f(a)}" stroke-dasharray="${f(L * 0.22)} ${f(L * 0.08)}"`,
    );
  }
  let splash = '';
  for (const [dx, dy, rr] of [
    [-110, -2, 24],
    [-74, -22, 30],
    [-26, -34, 36],
    [26, -32, 34],
    [72, -20, 30],
    [112, -2, 24],
  ]) {
    splash += path(circle(FALL_X + dx, bottom + dy + 10, rr), p.foam);
  }
  return (
    `<defs>${softGlow(`cvFallGlow${mode}`, p.waterGlow, night ? 0.75 : 0.4)}${softGlow(
      `cvMist${mode}`,
      p.foam,
      night ? 0.45 : 0.7,
    )}</defs>` +
    glowOval(FALL_X, (top + bottom) / 2, 200, 420, `cvFallGlow${mode}`) +
    path(body, p.fall, op(0.9)) +
    clipped(`cvFall${mode}`, body, inner) +
    stroke(
      curve(FALL_X - 40, top + 14, FALL_X + 42, top + 14, -8),
      p.waterShine,
      6,
      ' stroke-opacity=".8"',
    ) +
    stroke(smooth(CLIFF.slice(7, 13), false), p.midLight, 11) +
    glowOval(FALL_X, bottom - 10, 190, 70, `cvMist${mode}`) +
    splash
  );
}

function stream(p: Palette): string {
  const line = spline(STREAM, 30);
  let out = path(
    tube(STREAM, (u) => 34 + 58 * u),
    p.poolRim,
  );
  out += path(
    tube(STREAM, (u) => 26 + 50 * u),
    p.poolRimLight,
  );
  out += path(
    tube(STREAM, (u) => 20 + 44 * u),
    p.water,
  );
  out += stroke(smooth(line.slice(1, -1), false), p.waterLight, 6, ' stroke-opacity=".45"');
  line.slice(3, -2).forEach(([x, y], i) => {
    if (i % 3) return;
    const w = 12 + i * 1.4;
    out += stroke(
      `M${f(x - w)} ${f(y)}L${f(x + w * 0.4)} ${f(y - 2)}`,
      p.waterShine,
      4,
      ' stroke-opacity=".75"',
    );
  });
  const r = rng(45);
  for (let i = 0; i < 12; i++) {
    const k = Math.floor(range(r, 2, line.length - 2));
    const [x, y] = line[k];
    const side = i % 2 ? 1 : -1;
    const off = 30 + (k / line.length) * 56;
    const s = 0.7 + (k / line.length) * 0.7;
    out += path(ellipse(x + side * off, y + 4 * s, 16 * s, 8 * s), p.poolRim);
    out += path(ellipse(x + side * off - 2 * s, y + s, 13 * s, 6 * s), p.poolRimLight);
  }
  return out;
}

function floorStone(id: string, x: number, y: number, s: number, p: Palette, seed: number): string {
  const body = lump(x, y, 64 * s, 20 * s, seed, 0.1);
  return (
    path(ellipse(x + 6 * s, y + 10 * s, 66 * s, 16 * s), p.floorShade, op(0.55)) +
    path(body, p.floorStone) +
    clipped(
      id,
      body,
      path(ellipse(x + 20 * s, y + 14 * s, 70 * s, 18 * s), p.floorStoneShade) +
        path(ellipse(x - 20 * s, y - 9 * s, 22 * s, 5 * s, -4), p.floorStoneLight, op(0.8)),
    )
  );
}

function backdrop(p: Palette, mode: Mode): string {
  const night = mode === 'night';
  return (
    `<defs>${softGlow(`cvClusterGlow${mode}`, p.crystalGlow, night ? 0.8 : 0.45)}</defs>` +
    backWall(p, mode) +
    outside(p, mode) +
    mouthRim(p, mode) +
    farLayer(p) +
    midLayer(p, mode) +
    floor(p, mode) +
    layered(floorItems(p, mode)) +
    rays(p, mode) +
    nearWalls(p) +
    sideGlows(p, mode) +
    ceiling(p, mode)
  );
}

function sunWithSpinningRays(p: Palette): string {
  const svg = sun(SUN[0], SUN[1], 80, p.sun, p.sunRay, p.face);
  const rayPaths = (svg.match(/<path[^>]*\/>/g) ?? []).slice(0, 12).join('');
  return svg.replace(
    rayPaths,
    `<g data-spin="" style="transform-origin: ${SUN[0]}px ${SUN[1]}px">${rayPaths}</g>`,
  );
}

function poolD(k: number, dy = 0): string {
  const r = rng(17);
  const pts: Pt[] = [];
  const n = 14;
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2;
    const j = 1 + range(r, -0.05, 0.05);
    pts.push([
      POOL[0] + Math.cos(a) * POOL_R[0] * k * j,
      POOL[1] + dy + Math.sin(a) * POOL_R[1] * k * j * (Math.sin(a) > 0 ? 1.05 : 0.95),
    ]);
  }
  return smooth(pts, true);
}

function pool(p: Palette, mode: Mode): string {
  const night = mode === 'night';
  const water = poolD(1);
  const [cx, cy] = POOL;
  const [rx, ry] = POOL_R;
  let out = `<defs>${softGlow(`cvPoolAura${mode}`, p.waterGlow, night ? 0.6 : 0.32)}${softGlow(
    `cvPoolCore${mode}`,
    p.waterLight,
    night ? 0.85 : 0.6,
  )}${softGlow(`cvPoolGem${mode}`, p.crystalGlow, night ? 0.7 : 0.5)}</defs>`;
  out += glowOval(cx, cy - 30, rx * 1.28, ry * 2, `cvPoolAura${mode}`);
  out += path(poolD(1.08, 10), p.poolRim);
  out += path(poolD(1.03, 4), p.poolRimLight);
  out += path(water, p.waterDeep);
  let inner = path(poolD(0.96, 14), p.water);
  inner += glowOval(cx - 30, cy + 10, rx * 0.8, ry * 0.75, `cvPoolCore${mode}`);
  inner += glowOval(cx + rx * 0.7, cy + 4, rx * 0.34, ry * 0.5, `cvPoolGem${mode}`);
  for (const [x1, y1, x2, y2, b] of [
    [cx - 360, cy - 40, cx - 200, cy - 44, -6],
    [cx - 120, cy - 70, cx + 60, cy - 72, -6],
    [cx + 120, cy + 30, cx + 300, cy + 26, -7],
    [cx - 260, cy + 50, cx - 120, cy + 54, -5],
    [cx + 220, cy - 46, cx + 340, cy - 50, -4],
  ]) {
    inner += stroke(curve(x1, y1, x2, y2, b), p.waterShine, 6, ' stroke-opacity=".7"');
  }
  for (const [x, y, rr] of [
    [cx - 160, cy - 10, 60],
    [cx + 40, cy + 20, 90],
  ]) {
    inner += `<ellipse cx="${f(x)}" cy="${f(y)}" rx="${rr}" ry="${f(rr * 0.24)}" fill="none" stroke="${p.waterShine}" stroke-width="4" stroke-opacity=".45"/>`;
  }
  out += clipped(`cvPoolClip${mode}`, water, inner);
  const r = rng(33);
  for (let i = 0; i < 7; i++) {
    const a = range(r, 0.15, 0.85) * Math.PI;
    const x = cx + Math.cos(a) * rx * 1.02;
    const y = cy + Math.sin(a) * ry * 1.1;
    const s = range(r, 0.8, 1.3);
    out += path(ellipse(x, y + 6 * s, 30 * s, 13 * s), p.poolRim);
    out += path(ellipse(x - 2 * s, y + 2 * s, 26 * s, 10 * s), p.poolRimLight);
  }
  for (const [x, y, s] of [
    [cx - rx * 0.94, cy - 20, 1.2],
    [cx + rx * 0.9, cy - 24, 1],
    [cx - rx * 0.5, cy - ry * 0.98, 0.9],
    [cx + rx * 0.3, cy - ry * 1.02, 0.8],
  ]) {
    out += path(ellipse(x, y + 4 * s, 26 * s, 11 * s), p.poolRim);
    out += path(ellipse(x - 2 * s, y, 22 * s, 9 * s), p.poolRimLight);
  }
  for (const [x, y, s] of [
    [cx - 240, cy - 30, 14],
    [cx + 180, cy - 60, 11],
    [cx + 330, cy + 40, 12],
    [cx - 60, cy + 66, 10],
  ]) {
    out += path(sparkleStar(x, y, s), p.waterShine, op(0.9));
  }
  return out;
}

function crystalsProp(p: Palette, mode: Mode): string {
  const night = mode === 'night';
  const [x, base] = CRYSTALS;
  const tones = crystalTones(p);
  let out = `<defs>${softGlow(`cvCrystalGlow${mode}`, p.crystalGlow, night ? 0.85 : 0.55)}${softGlow(
    `cvCrystalGlowB${mode}`,
    p.crystalGlowB,
    night ? 0.7 : 0.4,
  )}</defs>`;
  out += glowOval(x, base - 170, 280, 260, `cvCrystalGlow${mode}`);
  out += glowOval(x - 110, base - 90, 180, 130, `cvCrystalGlowB${mode}`);
  out += path(lump(x + 30, base - 30, 240, 70, 81), p.stoneShade);
  out += path(lump(x + 10, base - 44, 210, 56, 82), p.stone);
  const list: [number, number, number, number, number][] = [
    [-70, 230, 64, -22, 1],
    [120, 260, 70, 20, 0],
    [40, 380, 92, -2, 0],
    [-150, 150, 52, -36, 2],
    [190, 160, 54, 38, 1],
    [-30, 200, 60, -12, 2],
    [100, 140, 48, 8, 1],
    [-110, 96, 40, -14, 0],
  ];
  for (const [dx, h, w, tilt, tone] of list) {
    out += prism(x + dx, base - 26, h, w, tilt, tones[tone]);
  }
  out += path(lump(x - 30, base + 2, 150, 30, 83), p.stoneShade);
  out += path(lump(x - 40, base - 4, 120, 22, 84), p.stone);
  for (const [dx, dy, s] of [
    [40, -400, 22],
    [-96, -250, 14],
    [150, -290, 16],
    [-170, -170, 11],
    [210, -180, 12],
  ]) {
    out += path(sparkleStar(x + dx, base + dy, s), '#ffffff', op(0.95));
  }
  return out;
}

function dripProp(p: Palette, mode: Mode): string {
  const top = ceilAt(DRIP_X) - 10;
  const len = 400;
  const w = 160;
  let out = `<defs>${linearGradient(`cvDripFill${mode}`, [
    [0, p.near],
    [0.5, p.stalactite],
    [1, p.stalactiteTip],
  ])}${softGlow(`cvDropGlow${mode}`, p.waterGlow, mode === 'night' ? 0.75 : 0.45)}</defs>`;
  out += stalactite(
    `cvDripBody${mode}`,
    DRIP_X,
    top,
    len,
    w,
    `url(#cvDripFill${mode})`,
    p.nearShade,
    p.stalactiteTip,
    p,
    909,
    false,
    24,
  );
  const tip = dripPts(DRIP_X, top, len, w, 909, 24)[9];
  out += glowAt(tip[0], tip[1] + 44, 66, `cvDropGlow${mode}`);
  out += waterDrop(tip[0], tip[1] + 40, 2, p);
  return out;
}

function wormsProp(p: Palette, mode: Mode): string {
  const night = mode === 'night';
  const id = `cvWormGlow${mode}`;
  let out = `<defs>${softGlow(id, p.glowHalo, night ? 0.95 : 0.6)}</defs>`;
  const list: [number, number][] = [
    [-160, 230],
    [-100, 360],
    [-40, 280],
    [20, 430],
    [80, 300],
    [140, 390],
    [196, 250],
  ];
  for (const [dx, len] of list) {
    const x = WORMS_X + dx;
    out += thread(x, ceilAt(x) - 4, len, 1.4, p, id, night, Math.round(dx) + 300);
  }
  for (const [dx] of list) {
    const x = WORMS_X + dx;
    out += larva(x, ceilAt(x) - 6, 1.1, p, id);
  }
  return out;
}

function mushroomsProp(p: Palette, mode: Mode): string {
  const night = mode === 'night';
  const [x, base] = MUSH;
  const a: Tone = [p.mushA, p.mushALight, p.mushADark];
  const b: Tone = [p.mushB, p.mushBLight, p.mushBDark];
  let out = `<defs>${softGlow(`cvMushGlow${mode}`, p.mushGlow, night ? 0.85 : 0.45)}</defs>`;
  out += glowOval(x, base - 120, 260, 170, `cvMushGlow${mode}`);
  out += path(ellipse(x, base + 4, 200, 26), p.floorShade, op(0.5));
  out += mushroom(x - 120, base - 4, 120, 56, -16, b, p);
  out += mushroom(x + 110, base - 2, 150, 66, 14, a, p);
  out += mushroom(x - 10, base, 210, 92, 6, a, p);
  out += mushroom(x + 170, base + 6, 70, 36, 10, b, p);
  out += mushroom(x - 170, base + 8, 60, 32, -8, a, p);
  out += mushroom(x + 50, base + 10, 64, 34, -4, b, p);
  out += grassTuft(x - 70, base + 10, 1.1, p.moss);
  out += grassTuft(x + 140, base + 12, 1, p.mossDark);
  return out;
}

function mitesProp(p: Palette, mode: Mode): string {
  const [x, base] = MITES;
  const c = { body: p.stone, shade: p.stoneShade, light: p.stoneLight, tip: p.stoneTip };
  const night = mode === 'night';
  const id = `cvMossGlow${mode}`;
  let moss = `<defs>${softGlow(id, p.glowHalo, night ? 0.8 : 0.35)}</defs>`;
  for (const [mx, my, s] of [
    [x - 150, base + 2, 1.1],
    [x - 20, base + 6, 0.9],
    [x + 160, base + 14, 1],
    [x + 70, base + 40, 0.8],
  ]) {
    moss += glowOval(mx, my - 8 * s, 60 * s, 30 * s, id);
    moss += path(scallop(mx, my, 1, 9, 7 * s, 180, 36 * s, 13 * s), p.glowMossDark);
    moss += path(scallop(mx - 2 * s, my - 3 * s, 1, 8, 6 * s, 190, 30 * s, 10 * s), p.glowMoss);
    for (const [dx, dy] of [
      [-20, -12],
      [-4, -16],
      [14, -11],
    ]) {
      moss += path(circle(mx + dx * s, my + dy * s, 3.6 * s), p.glow);
    }
  }
  for (const [dx, dy] of [
    [-96, -220],
    [-60, -150],
    [96, -150],
    [110, -90],
  ]) {
    moss += glowDot(x + dx, base + dy, 0.9, p, id, night);
  }
  return (
    stalagmite(`cvMiteBig${mode}`, x - 80, base, 300, 210, c, p.floorShade, 61) +
    stalagmite(`cvMiteMid${mode}`, x + 100, base + 10, 210, 170, c, p.floorShade, 62) +
    stalagmite(`cvMiteLow${mode}`, x + 20, base + 36, 130, 140, c, p.floorShade, 63) +
    moss
  );
}

function vinesProp(p: Palette): string {
  return (
    vine(930, 330, 320, 1.1, p.vine, p.vineLeaf, 3) +
    vine(990, 420, 240, 1, p.vine, p.vineLeafDark, 5) +
    vine(864, 300, 190, 0.9, p.vine, p.vineLeaf, 8)
  );
}

const interactives: Interactive[] = [
  {
    id: 'sun',
    box: [SUN[0] - 226, SUN[1] - 226, 452, 452],
    kind: 'spin',
    origin: SUN,
    effect: 'sparkle',
    sound: 'shine',
    night: { kind: 'rock', effect: 'stars', sound: 'twinkle' },
    render: (p, mode) =>
      mode === 'day' ? sunWithSpinningRays(p) : moon(SUN[0], SUN[1], 84, p.sun, p.sunRay, p.face),
  },
  {
    id: 'vines',
    box: [820, 280, 230, 440],
    kind: 'sway',
    origin: [930, 300],
    effect: 'leaves',
    sound: 'rustle',
    render: (p) => vinesProp(p),
  },
  {
    id: 'pool',
    box: [POOL[0] - 720, POOL[1] - 360, 1440, 610],
    kind: 'pulse',
    origin: POOL,
    effect: 'splash',
    effectAt: [POOL[0], POOL[1] - 10],
    sound: 'splash',
    render: (p, mode) => pool(p, mode),
  },
  {
    id: 'crystals',
    box: [CRYSTALS[0] - 320, CRYSTALS[1] - 470, 640, 560],
    kind: 'glow',
    origin: [CRYSTALS[0], CRYSTALS[1]],
    effect: 'sparkle',
    effectAt: [CRYSTALS[0] + 20, CRYSTALS[1] - 260],
    sound: 'sparkle',
    render: (p, mode) => crystalsProp(p, mode),
  },
  {
    id: 'drip',
    box: [DRIP_X - 120, 130, 240, 580],
    kind: 'bounce',
    origin: [DRIP_X, 170],
    effect: 'rain',
    effectAt: [DRIP_X, 680],
    sound: 'bubble',
    render: (p, mode) => dripProp(p, mode),
  },
  {
    id: 'glowworms',
    box: [WORMS_X - 220, 120, 484, 520],
    kind: 'sway',
    origin: [WORMS_X, 160],
    effect: 'stars',
    effectAt: [WORMS_X, 420],
    sound: 'twinkle',
    render: (p, mode) => wormsProp(p, mode),
  },
  {
    id: 'mushrooms',
    box: [MUSH[0] - 280, MUSH[1] - 330, 560, 380],
    kind: 'bounce',
    origin: [MUSH[0], MUSH[1] + 10],
    effect: 'sparkle',
    effectAt: [MUSH[0], MUSH[1] - 200],
    sound: 'boing',
    render: (p, mode) => mushroomsProp(p, mode),
  },
  {
    id: 'stalagmites',
    box: [MITES[0] - 244, MITES[1] - 330, 494, 400],
    kind: 'shake',
    origin: [MITES[0], MITES[1] + 20],
    effect: 'notes',
    effectAt: [MITES[0], MITES[1] - 300],
    sound: 'chime',
    render: (p, mode) => mitesProp(p, mode),
  },
];

const day: Palette = {
  skyTop: '#86cdf2',
  skyBottom: '#fdf1cf',
  haze: '#fff4cf',
  sun: '#ffd84d',
  sunRay: '#ffc531',
  face: '#8a4b1f',
  cloud: '#ffffff',
  cloudShade: '#e6e9f5',
  star: '#fff6d6',
  mountain: '#b9cfe6',
  mountainShade: '#a3bcd9',
  snow: '#ffffff',
  hillFar: '#b8ddb9',
  hill: '#97cd85',
  meadow: '#86c46c',
  tree: '#6db35a',
  treeDark: '#579b48',
  trunk: '#8f6a48',
  flowerA: '#ffc2d9',
  flowerB: '#fff0a0',
  backTop: '#6f5784',
  back: '#9a82a8',
  backLow: '#b49bb0',
  backGlow: '#ffe3c2',
  backGlowB: '#d9b8ff',
  backGlowC: '#a6f0e8',
  strata: '#866d95',
  strataLight: '#b29ab9',
  far: '#a98fae',
  farShade: '#957b9d',
  farLight: '#c6b0c6',
  farDeep: '#86708f',
  mid: '#7c628a',
  midShade: '#684f77',
  midLight: '#9a80a5',
  near: '#563d5e',
  nearShade: '#45304d',
  nearLight: '#6f5577',
  tunnelDark: '#5c446a',
  tunnel: '#715a80',
  tunnelLight: '#8b7593',
  rimLight: '#f6d8b0',
  stalactite: '#86688a',
  stalactiteTip: '#cdb2c6',
  stone: '#a5808f',
  stoneLight: '#c6a1ad',
  stoneShade: '#84626f',
  stoneTip: '#e8d0d4',
  floorFar: '#a08395',
  floor: '#87686f',
  floorNear: '#6f525b',
  floorLight: '#9c7d84',
  floorShade: '#5f4650',
  crack: '#594250',
  pebble: '#a2878d',
  pebbleShade: '#7b6169',
  pebbleLight: '#bea6ab',
  floorStone: '#977782',
  floorStoneShade: '#7c5f6b',
  floorStoneLight: '#b39aa3',
  moss: '#93bf72',
  mossDark: '#74a35a',
  ray: '#fff1c8',
  lightPool: '#ffe2b0',
  water: '#43c0bd',
  waterDeep: '#2c97a3',
  waterLight: '#9cefe1',
  waterGlow: '#8cf3e4',
  waterShine: '#eafffb',
  poolRim: '#76596f',
  poolRimLight: '#9a7d92',
  crystalA: '#b38bff',
  crystalALight: '#dcc8ff',
  crystalADark: '#8a61d6',
  crystalB: '#55cfd0',
  crystalBLight: '#b6f3ef',
  crystalBDark: '#2c9faa',
  crystalC: '#ff9ccc',
  crystalCLight: '#ffd6ea',
  crystalCDark: '#dc6ea6',
  crystalGlow: '#d4b6ff',
  crystalGlowB: '#a2f4ee',
  glow: '#8af2e6',
  glowCore: '#f2fffd',
  glowHalo: '#71e7ee',
  glowMoss: '#79c99d',
  glowMossDark: '#5aa983',
  silk: '#e6f7f5',
  larva: '#f5ead6',
  larvaEye: '#5a4258',
  mushA: '#5fd3c6',
  mushALight: '#aaf3e9',
  mushADark: '#38a7a6',
  mushB: '#ab90f4',
  mushBLight: '#d9cbff',
  mushBDark: '#7c62d0',
  mushStem: '#f5e9dc',
  mushStemShade: '#ddcbbd',
  mushGill: '#e9d9cb',
  mushSpot: '#f7fffd',
  mushGlow: '#8ff5e6',
  vine: '#5f9a4a',
  vineLeaf: '#7dbd5b',
  vineLeafDark: '#5f9b46',
  drop: '#c6f0f6',
  dropLight: '#ffffff',
  foam: '#f2fffd',
  cleft: '#3f2b48',
  fall: '#7fdad6',
  fallLight: '#bff3ee',
};

const dusk = (hex: string): string => mix(nightColor(hex), '#4b3478', 0.22);

const night: Palette = {
  ...Object.fromEntries(Object.entries(day).map(([k, v]) => [k, dusk(v)])),
  skyTop: '#0b1440',
  skyBottom: '#2a3b82',
  haze: '#6b83d4',
  sun: '#fff1c0',
  sunRay: '#ffe9a8',
  face: '#7a5a34',
  star: '#fff6d6',
  backGlow: '#5d74c4',
  backGlowB: '#8d63e0',
  backGlowC: '#3fd8d0',
  ray: '#c4d6ff',
  lightPool: '#8aa2e8',
  rimLight: '#b9c9f4',
  water: '#2fb3b3',
  waterDeep: '#1f7a8f',
  waterLight: '#88f4e4',
  waterGlow: '#78f5e6',
  waterShine: '#e2fffb',
  crystalA: '#b18cff',
  crystalALight: '#e3d3ff',
  crystalADark: '#7d58d2',
  crystalB: '#4fd6d6',
  crystalBLight: '#bdfbf6',
  crystalBDark: '#2a9bab',
  crystalC: '#ff94c8',
  crystalCLight: '#ffd9ec',
  crystalCDark: '#d4649f',
  crystalGlow: '#b98cff',
  crystalGlowB: '#7ff3ea',
  glow: '#9bfff2',
  glowCore: '#ffffff',
  glowHalo: '#78f3f2',
  glowMoss: '#5fe0c4',
  glowMossDark: '#3fb89c',
  silk: '#bcece6',
  larva: '#d9e8e2',
  mushA: '#5fe3d4',
  mushALight: '#b8fff5',
  mushADark: '#37a9ad',
  mushB: '#b39cff',
  mushBLight: '#e3d8ff',
  mushBDark: '#7a5fd2',
  mushGlow: '#84f8ea',
  mushSpot: '#ffffff',
  mushStem: '#cfd6e6',
  mushGill: '#b9bfd8',
  drop: '#a5e9f3',
  dropLight: '#ffffff',
  foam: '#c9f7f1',
  fall: '#4fd0cc',
  fallLight: '#9ff6ee',
};

const cave: SceneDef = {
  id: 'cave',
  world: [W, H],
  horizon: 900,
  stickerScale: 1.4,
  ambient: { stars: 40, twinkles: 10, sparkles: 6, bats: 3 },
  defaults: [
    { animal: 'bear', x: 1180, y: 1170, scale: 0.9 },
    { animal: 'bat', x: 1640, y: 390, scale: 1.5 },
    { animal: 'bat', x: 3010, y: 450, scale: 1.4, flip: true },
    { animal: 'glowworm', x: 1430, y: 246, scale: 2 },
    { animal: 'cave-fish', x: 2560, y: 1650, scale: 1.7 },
    { animal: 'cave-fish', x: 2900, y: 1690, scale: 1.5, flip: true },
    { animal: 'olm', x: 1990, y: 1700, scale: 1.7 },
    { animal: 'cave-cricket', x: 960, y: 1590, scale: 1.9, flip: true },
    { animal: 'spider', x: 3090, y: 922, scale: 1.5 },
    { animal: 'crystal', x: 2460, y: 1390, scale: 1.3 },
    { animal: 'fossil', x: 1160, y: 1720, scale: 1.3 },
    { animal: 'glowing-mushroom', x: 1700, y: 1760, scale: 1.3 },
  ],
  day,
  night,
  interactives,
  back: (p, mode) => backdrop(p, mode),
  front: (p, mode) => {
    const glow = `cvFrontGlow${mode}`;
    const a: Tone = [p.mushA, p.mushALight, p.mushADark];
    const b: Tone = [p.mushB, p.mushBLight, p.mushBDark];
    return (
      `<defs>${softGlow(glow, p.crystalGlow, mode === 'night' ? 0.8 : 0.45)}${softGlow(
        `cvFrontMush${mode}`,
        p.mushGlow,
        mode === 'night' ? 0.8 : 0.4,
      )}</defs>` +
      path(lump(120, 2010, 260, 90, 501), p.nearShade) +
      path(lump(60, 1990, 170, 70, 502), p.near) +
      path(lump(3500, 2010, 280, 96, 503), p.nearShade) +
      path(lump(3560, 1990, 180, 70, 504), p.near) +
      smallCluster(430, 1992, 1.05, p, 1, 505, glow) +
      smallCluster(3200, 1996, 0.95, p, 0, 506, glow) +
      glowOval(2090, 1930, 150, 90, `cvFrontMush${mode}`) +
      mushroom(2050, 1996, 84, 44, -8, a, p) +
      mushroom(2130, 2000, 58, 32, 8, b, p) +
      pebbles(1400, 1985, 1.8, p) +
      pebbles(2500, 1990, 1.6, p) +
      pebbles(2900, 1980, 1.4, p)
    );
  },
};

export default cave;
