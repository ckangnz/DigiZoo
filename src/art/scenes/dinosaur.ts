import {
  capsule,
  circle,
  curve,
  ellipse,
  f,
  leaf,
  scallop,
  smooth,
  spline,
  tube,
  type Pt,
} from '../core/paths';
import {
  layered,
  linearGradient,
  moon,
  mountain,
  path,
  radialGlow,
  scatter,
  scatterItems,
  starField,
  stroke,
  sun,
} from './props';
import { range, rng } from './rng';
import type { Interactive, Mode, Palette, SceneDef } from './types';

const W = 3600;
const H = 2000;

const SUN: Pt = [560, 270];
const VX = 2250;
const RIM = 430;
const VBASE = 1080;

const FAR_HILL: Pt[] = [
  [-200, 1010],
  [240, 950],
  [700, 996],
  [1160, 944],
  [1620, 986],
  [2100, 952],
  [2580, 984],
  [3040, 936],
  [3480, 986],
  [3800, 960],
];
const FAR_TOP = smooth(FAR_HILL, false);

const MID_HILL: Pt[] = [
  [-200, 1076],
  [320, 1032],
  [860, 1070],
  [1380, 1024],
  [1900, 1062],
  [2380, 1030],
  [2860, 1066],
  [3340, 1020],
  [3800, 1060],
];

const STREAM: Pt[] = [
  [872, 1062],
  [896, 1104],
  [872, 1150],
  [894, 1216],
];

function heightAt(pts: Pt[], x: number): number {
  const line = spline(pts, 240);
  for (let i = 1; i < line.length; i++) {
    const [x0, y0] = line[i - 1];
    const [x1, y1] = line[i];
    if (x >= x0 && x <= x1) return y0 + ((y1 - y0) * (x - x0)) / (x1 - x0 || 1);
  }
  return line[line.length - 1][1];
}

const LAKE_C: Pt = [720, 1340];
const LAKE: Pt[] = [
  [120, 1362],
  [190, 1276],
  [380, 1218],
  [620, 1198],
  [860, 1204],
  [1080, 1228],
  [1260, 1280],
  [1340, 1352],
  [1270, 1426],
  [1060, 1474],
  [800, 1496],
  [520, 1490],
  [280, 1462],
];

type Zone = [number, number, number, number];

const AVOID: Zone[] = [
  [884, 1140, 80, 90],
  [720, 1350, 720, 210],
  [230, 1254, 120, 70],
  [1530, 1320, 110, 70],
  [3330, 1282, 120, 70],
  [2790, 1345, 200, 80],
  [1960, 1750, 270, 90],
  [2790, 1490, 140, 40],
  [3480, 1414, 140, 40],
  [930, 1558, 120, 40],
];

function free(x: number, y: number): boolean {
  return !AVOID.some(([cx, cy, rx, ry]) => ((x - cx) / rx) ** 2 + ((y - cy) / ry) ** 2 < 1);
}

function limb(pts: Pt[], r0: number, r1: number, color: string, extra = ''): string {
  return path(
    tube(pts, (u) => r0 + (r1 - r0) * u, 18),
    color,
    extra,
  );
}

function clipped(id: string, clip: string, content: string): string {
  return `<defs><clipPath id="${id}"><path d="${clip}"/></clipPath></defs><g clip-path="url(#${id})">${content}</g>`;
}

function frond(
  x: number,
  y: number,
  len: number,
  width: number,
  angle: number,
  bend: number,
  color: string,
  rib = '',
  n = 9,
): string {
  const steps = n * 2;
  const mid: Pt[] = [[x, y]];
  const dirs: number[] = [];
  let px = x;
  let py = y;
  for (let i = 1; i <= steps; i++) {
    const a = ((angle + bend * (i / steps)) * Math.PI) / 180;
    px += (Math.cos(a) * len) / steps;
    py += (Math.sin(a) * len) / steps;
    mid.push([px, py]);
    dirs.push(a);
  }
  const left: Pt[] = [];
  const right: Pt[] = [];
  for (let i = 1; i < steps; i++) {
    const t = i / steps;
    const a = dirs[i - 1];
    const env = width * Math.pow(Math.sin(Math.PI * Math.pow(t, 0.7)), 0.7);
    const tip = i % 2 === 1;
    const k = tip ? 1 : 0.5;
    const fwd = tip ? (len / steps) * 0.55 : 0;
    const [mx, my] = mid[i];
    const nx = -Math.sin(a);
    const ny = Math.cos(a);
    const tx = Math.cos(a);
    const ty = Math.sin(a);
    left.push([mx + nx * env * k + tx * fwd, my + ny * env * k + ty * fwd]);
    right.push([mx - nx * env * k + tx * fwd, my - ny * env * k + ty * fwd]);
  }
  const outline: Pt[] = [[x, y], ...left, mid[steps], ...right.reverse()];
  let out = path(smooth(outline, true, 0.85), color);
  if (rib) out += stroke(smooth(mid, false), rib, Math.max(2, width * 0.1));
  return out;
}

function fiddlehead(x: number, y: number, s: number, dir: number, color: string): string {
  const R = 13 * s;
  const cx = x + dir * R;
  const cy = y - 52 * s;
  const pts: Pt[] = [
    [x, y],
    [x - dir * 2 * s, y - 26 * s],
  ];
  for (let i = 0; i <= 14; i++) {
    const t = i / 14;
    const a = dir > 0 ? Math.PI + t * Math.PI * 2.6 : -t * Math.PI * 2.6;
    const rr = R * (1 - 0.72 * t);
    pts.push([cx + Math.cos(a) * rr, cy + Math.sin(a) * rr]);
  }
  return stroke(smooth(pts, false), color, 6 * s);
}

function treeFern(x: number, y: number, s: number, lean: number, p: Palette): string {
  const top: Pt = [x + lean * s, y - 360 * s];
  const spine: Pt[] = [[x, y + 4], [x + lean * 0.3 * s, y - 180 * s], top];
  let out = path(ellipse(x + 10 * s, y + 4, 90 * s, 13 * s), p.grassDark, ' fill-opacity=".3"');
  out += path(
    `M${f(x - 46 * s)} ${f(y + 6)}Q${f(x - 20 * s)} ${f(y - 4 * s)} ${f(x - 18 * s)} ${f(y - 50 * s)}L${f(x + 18 * s)} ${f(y - 50 * s)}Q${f(x + 22 * s)} ${f(y - 4 * s)} ${f(x + 50 * s)} ${f(y + 6)}Z`,
    p.fernTrunk,
  );
  out += limb(spine, 22 * s, 16 * s, p.fernTrunk);
  const pts = spline(spine, 20);
  out += stroke(
    smooth(
      pts.slice(1, 18).map(([a, b]): Pt => [a + 9 * s, b]),
      false,
    ),
    p.trunkDark,
    6 * s,
    ' stroke-opacity=".35"',
  );
  for (let k = 2; k < 19; k += 2) {
    const [px, py] = pts[k];
    const rad = (21 - 6 * (k / 20)) * s;
    out += stroke(
      curve(px - rad * 0.75, py, px + rad * 0.75, py - 3 * s, 5 * s),
      p.trunkDark,
      3.5 * s,
      ' stroke-opacity=".55"',
    );
  }
  const back: [number, number, number][] = [
    [-150, -50, 240],
    [-30, 50, 240],
    [-115, -30, 220],
    [-65, 30, 220],
  ];
  const fore: [number, number, number][] = [
    [-176, -34, 250],
    [-4, 34, 250],
    [-138, -40, 270],
    [-42, 40, 270],
    [-100, -16, 210],
    [-80, 16, 210],
  ];
  for (const [a, b, len] of back) out += frond(top[0], top[1], len * s, 30 * s, a, b, p.frondDark);
  for (const [a, b, len] of fore) {
    out += frond(top[0], top[1], len * s, 30 * s, a, b, p.frond, p.rib);
  }
  out += fiddlehead(top[0] - 12 * s, top[1] + 2 * s, s, -1, p.frondLight);
  out += fiddlehead(top[0] + 14 * s, top[1] + 4 * s, s * 0.8, 1, p.frondLight);
  out += path(ellipse(top[0], top[1] + 4 * s, 20 * s, 12 * s), p.fernTrunk);
  return out;
}

function cycad(x: number, y: number, s: number, p: Palette): string {
  const tw = 40 * s;
  const th = 110 * s;
  const body =
    smooth(
      [
        [x - tw, y + 4],
        [x - tw * 1.08, y - th * 0.5],
        [x - tw * 0.82, y - th],
        [x + tw * 0.82, y - th],
        [x + tw * 1.08, y - th * 0.5],
        [x + tw, y + 4],
      ],
      false,
    ) + 'Z';
  const crown: Pt = [x, y - th + 6 * s];
  let out = path(ellipse(x + 8 * s, y + 3, 70 * s, 11 * s), p.grassDark, ' fill-opacity=".3"');
  const angles = [-172, -150, -128, -106, -74, -52, -30, -8];
  angles.forEach((a, i) => {
    out += frond(
      crown[0],
      crown[1],
      (150 + (i % 2) * 24) * s,
      20 * s,
      a + 6,
      (a < -90 ? -1 : 1) * 18,
      p.cycadDark,
      '',
      12,
    );
  });
  out += path(body, p.cycadTrunk);
  out += path(
    smooth(
      [
        [x + tw * 0.2, y - th + 2 * s],
        [x + tw * 0.82, y - th],
        [x + tw * 1.08, y - th * 0.5],
        [x + tw, y + 4],
        [x + tw * 0.3, y + 4],
      ],
      true,
      0.6,
    ),
    p.cycadTrunkDark,
    ' fill-opacity=".45"',
  );
  for (let row = 0; row < 5; row++) {
    const yy = y - 12 * s - row * 22 * s;
    const off = row % 2 ? 11 * s : 0;
    for (let k = -2; k <= 2; k++) {
      const xx = x + k * 22 * s + off;
      if (Math.abs(xx - x) > tw * 0.8) continue;
      out += stroke(curve(xx - 9 * s, yy, xx + 9 * s, yy, 7 * s), p.cycadTrunkDark, 3.5 * s);
    }
  }
  [-160, -136, -114, -66, -44, -20, -90].forEach((a, i) => {
    out += frond(
      crown[0],
      crown[1],
      (140 + (i % 3) * 16) * s,
      20 * s,
      a,
      a === -90 ? 0 : (a < -90 ? -1 : 1) * 16,
      p.cycad,
      p.cycadRib,
      12,
    );
  });
  out += path(ellipse(crown[0], crown[1] - 14 * s, 20 * s, 28 * s), p.cone);
  for (const dx of [-8, 8]) {
    out += stroke(
      curve(
        crown[0] + dx * s,
        crown[1] + 10 * s,
        crown[0] + dx * s,
        crown[1] - 38 * s,
        dx * 0.9 * s,
      ),
      p.coneDark,
      3 * s,
    );
  }
  return out;
}

function tuftPad(cx: number, cy: number, rx: number, ry: number, p: Palette): string {
  return (
    path(scallop(cx, cy + ry * 0.4, 1, 11, ry * 0.3, 0, rx, ry), p.needleDark) +
    path(scallop(cx - rx * 0.04, cy, 1, 11, ry * 0.28, 14, rx * 0.95, ry * 0.86), p.needle) +
    path(
      scallop(cx - rx * 0.22, cy - ry * 0.34, 1, 7, ry * 0.16, 0, rx * 0.5, ry * 0.3),
      p.needleLight,
    )
  );
}

function araucaria(x: number, y: number, s: number, p: Palette, flip = false): string {
  const d = flip ? -1 : 1;
  const T = (pts: Pt[]) => pts.map(([px, py]): Pt => [x + d * px * s, y + py * s]);
  let out = path(ellipse(x + 14 * s, y + 4, 120 * s, 16 * s), p.grassDark, ' fill-opacity=".3"');
  out += path(
    `M${f(x - 66 * s)} ${f(y + 6)}Q${f(x - 24 * s)} ${f(y - 4 * s)} ${f(x - 21 * s)} ${f(y - 72 * s)}L${f(x + 21 * s)} ${f(y - 72 * s)}Q${f(x + 26 * s)} ${f(y - 4 * s)} ${f(x + 70 * s)} ${f(y + 6)}Z`,
    p.trunk,
  );
  out += limb(
    T([
      [0, 4],
      [8, -380],
      [0, -770],
    ]),
    25 * s,
    9 * s,
    p.trunk,
  );
  out += limb(
    T([
      [11, 0],
      [17, -340],
      [9, -600],
    ]),
    8 * s,
    3 * s,
    p.trunkDark,
    ' fill-opacity=".35"',
  );
  const arms: [number, number, number, number, number][] = [
    [-500, -214, -150, 126, 40],
    [-516, 222, -140, 128, 40],
    [-602, -160, -114, 110, 36],
    [-614, 166, -108, 110, 36],
    [-692, -100, -74, 90, 32],
    [-702, 104, -70, 90, 32],
  ];
  for (const [ay, ex, ey] of arms) {
    out += limb(
      T([
        [ex * 0.04, ay + 6],
        [ex * 0.6, ay + 2],
        [ex, ay + ey],
      ]),
      13 * s,
      6 * s,
      p.trunk,
    );
  }
  for (const [ay, ex, ey, rx, ry] of arms) {
    out += tuftPad(x + d * ex * s, y + (ay + ey - 8) * s, rx * s, ry * s, p);
  }
  out += tuftPad(x, y - 798 * s, 96 * s, 38 * s, p);
  return out;
}

function farAraucaria(x: number, y: number, s: number, color: string): string {
  const h = 260 * s;
  let out = limb(
    [
      [x, y + 4],
      [x, y - h],
    ],
    7 * s,
    3 * s,
    color,
  );
  for (const [dx, dy, rx] of [
    [-62, 0.78, 46],
    [64, 0.8, 46],
    [-36, 0.9, 38],
    [38, 0.92, 38],
    [0, 1.02, 40],
  ]) {
    out += stroke(
      curve(x, y - h * (dy - 0.14), x + dx * s, y - h * dy, dx * 0.2 * s),
      color,
      5 * s,
    );
    out += path(ellipse(x + dx * s, y - h * dy, rx * s, 13 * s), color);
  }
  return out;
}

function farFern(x: number, y: number, s: number, color: string): string {
  const top: Pt = [x + 6 * s, y - 120 * s];
  let out = limb([[x, y + 4], top], 6 * s, 4 * s, color);
  for (const a of [-170, -140, -110, -70, -40, -10]) {
    out += path(leaf(top[0], top[1], 70 * s, 12 * s, a + (a < -90 ? -10 : 10)), color);
  }
  return out;
}

function horsetails(x: number, y: number, s: number, p: Palette, seed: number): string {
  const r = rng(seed);
  let out = '';
  const n = 7;
  for (let i = 0; i < n; i++) {
    const c = i - (n - 1) / 2;
    const bx = x + c * 14 * s + range(r, -4, 4) * s;
    const h = range(r, 150, 230) * s * (1 - Math.abs(c) * 0.09);
    const lean = (c * 12 + range(r, -8, 8)) * s;
    const line: Pt[] = [
      [bx, y + 2],
      [bx + lean * 0.35, y - h * 0.5],
      [bx + lean, y - h],
    ];
    const color = i % 2 ? p.horsetailDark : p.horsetail;
    const pts = spline(line, 24);
    let whorl = '';
    for (let k = 5; k < 22; k += 4) {
      const [px, py] = pts[k];
      const len = (22 - k * 0.5) * s;
      whorl += leaf(px, py, len, 2.6 * s, 205 - k) + leaf(px, py, len, 2.6 * s, -25 + k);
    }
    out += path(whorl, color);
    out += limb(line, 5.5 * s, 4 * s, color);
    for (let k = 5; k < 22; k += 4) {
      const [px, py] = pts[k];
      out += stroke(`M${f(px - 5 * s)} ${f(py)}L${f(px + 5 * s)} ${f(py)}`, p.horsetailNode, 3 * s);
    }
    const [tx, ty] = pts[24];
    out += path(
      capsule(tx, ty + 2 * s, tx + lean * 0.05, ty - 18 * s, 6 * s, 4 * s),
      p.horsetailTip,
    );
  }
  return out;
}

function fernClump(x: number, y: number, s: number, p: Palette, angles: number[]): string {
  let back = '';
  let fore = '';
  angles.forEach((a, i) => {
    const bend = a < -90 ? -40 : a > -90 ? 40 : 0;
    const len = (150 + (i % 3) * 30) * s;
    if (i % 2) back += frond(x, y, len, 26 * s, a, bend, p.fernDark, '', 8);
    else fore += frond(x, y, len, 26 * s, a, bend, p.fern, p.fernRib, 8);
  });
  return back + fore;
}

const SHRUB: [number, number, number][] = [
  [-66, -38, 40],
  [64, -36, 40],
  [-32, -62, 50],
  [30, -64, 52],
  [0, -86, 46],
];

function magnolia(x: number, y: number, s: number, p: Palette, seed: number): string {
  const r = rng(seed);
  const blobs = (dx: number, dy: number) =>
    SHRUB.map(([bx, by, br]) => circle(x + (bx + dx) * s, y + (by + dy) * s, br * s)).join('') +
    ellipse(x + dx * s, y + (dy - 22) * s, 104 * s, 24 * s);
  let out = path(ellipse(x + 8 * s, y, 116 * s, 16 * s), p.grassDark, ' fill-opacity=".3"');
  out += path(blobs(6, 4), p.shrubDark);
  out += path(blobs(-2, -2), p.shrub);
  out += path(ellipse(x - 44 * s, y - 84 * s, 18 * s, 10 * s, -20), p.shrubLight);
  out += path(ellipse(x - 6 * s, y - 112 * s, 16 * s, 9 * s, -15), p.shrubLight);
  for (let i = 0; i < 6; i++) {
    const fx = x + range(r, -80, 74) * s;
    const fy = y - range(r, 40, 104) * s;
    const fs = s * range(r, 0.85, 1.1);
    out += path(leaf(fx, fy, 30 * fs, 12 * fs, -132), p.magnoliaDark);
    out += path(leaf(fx, fy, 30 * fs, 12 * fs, -48), p.magnoliaDark);
    out += path(leaf(fx, fy + 2 * fs, 34 * fs, 13 * fs, -90), p.magnolia);
    out += path(leaf(fx - 2 * fs, fy, 26 * fs, 9 * fs, -112), p.magnolia);
    out += path(leaf(fx + 2 * fs, fy, 26 * fs, 9 * fs, -68), p.magnolia);
    out += path(ellipse(fx, fy - 2 * fs, 5 * fs, 4 * fs), p.magnoliaCenter);
  }
  return out;
}

function boulder(
  id: string,
  cx: number,
  base: number,
  rx: number,
  ry: number,
  p: Palette,
  seed: number,
): string {
  const r = rng(seed);
  const cy = base - ry;
  const pts: Pt[] = [];
  for (let i = 0; i < 11; i++) {
    const a = (i / 11) * Math.PI * 2 + 0.2;
    const k = range(r, 0.93, 1.05);
    pts.push([cx + Math.cos(a) * rx * k, Math.min(base + 2, cy + Math.sin(a) * ry * k * 1.08)]);
  }
  const body = smooth(pts);
  let out = path(
    ellipse(cx + rx * 0.1, base, rx * 1.12, ry * 0.16),
    p.grassDark,
    ' fill-opacity=".35"',
  );
  out += path(body, p.rock);
  out += clipped(
    id,
    body,
    path(ellipse(cx + rx * 0.62, cy + ry * 0.5, rx * 0.9, ry * 1.05), p.rockShade) +
      path(ellipse(cx - rx * 0.36, cy - ry * 0.42, rx * 0.36, ry * 0.2, -22), p.rockLight) +
      stroke(
        curve(cx + rx * 0.05, cy - ry * 0.1, cx + rx * 0.3, cy + ry * 0.35, rx * 0.06),
        p.rockShade,
        Math.max(3, rx * 0.035),
      ),
  );
  out += path(
    scallop(cx - rx * 0.1, cy - ry * 0.86, 1, 9, rx * 0.06, 0, rx * 0.5, ry * 0.18),
    p.mossDark,
  );
  out += path(
    scallop(cx - rx * 0.14, cy - ry * 0.92, 1, 9, rx * 0.055, 14, rx * 0.44, ry * 0.15),
    p.moss,
  );
  return out;
}

const EGG = smooth([
  [0, -46],
  [22, -38],
  [32, -8],
  [27, 22],
  [0, 36],
  [-27, 22],
  [-32, -8],
  [-22, -38],
]);

function egg(
  x: number,
  y: number,
  s: number,
  rot: number,
  shell: string,
  spot: string,
  crack = '',
): string {
  const spots: [number, number, number, number][] = [
    [-12, -20, 7, 5],
    [10, -28, 5, 4],
    [14, -4, 8, 6],
    [-16, 6, 6, 5],
    [4, 16, 7, 5],
    [-2, -6, 4, 3],
  ];
  return (
    `<g transform="translate(${f(x)} ${f(y)}) rotate(${f(rot)}) scale(${f(s)})">` +
    `<path d="${EGG}" fill="${shell}"/>` +
    `<path d="M14 -40Q36 -10 26 22Q14 36 -4 36Q22 10 14 -40Z" fill="#000000" fill-opacity=".08"/>` +
    spots
      .map(([sx, sy, rx, ry]) => `<path d="${ellipse(sx, sy, rx, ry)}" fill="${spot}"/>`)
      .join('') +
    `<path d="${ellipse(-14, -26, 6, 10, 20)}" fill="#ffffff" fill-opacity=".7"/>` +
    (crack
      ? `<path d="M-24 -18L-14 -27L-6 -16L4 -27L12 -16L22 -24" fill="none" stroke="${crack}" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"/>`
      : '') +
    `</g>`
  );
}

function nest(x: number, y: number, s: number, p: Palette, mode: Mode): string {
  const X = (v: number) => x + v * s;
  const Y = (v: number) => y + v * s;
  let out = path(ellipse(X(6), Y(-4), 196 * s, 28 * s), p.grassDark, ' fill-opacity=".3"');
  if (mode === 'night') {
    out += `<defs>${radialGlow('dnEggGlow-night', p.eggGlow, 0.5)}</defs>`;
    out += `<circle cx="${f(X(0))}" cy="${f(Y(-84))}" r="${f(100 * s)}" fill="url(#dnEggGlow-night)"/>`;
  }
  out += path(ellipse(X(0), Y(-66), 154 * s, 46 * s), p.nestDark);
  out += path(ellipse(X(0), Y(-62), 128 * s, 32 * s), p.nestInner);
  out += egg(X(-60), Y(-86), s * 1.08, -16, p.eggA, p.spotA);
  out += egg(X(60), Y(-84), s * 1.04, 14, p.eggB, p.spotB);
  out += egg(X(2), Y(-74), s * 1.16, 2, p.eggC, p.spotC, p.crack);
  const rim = smooth([
    [X(-162), Y(-70)],
    [X(-144), Y(-26)],
    [X(-64), Y(0)],
    [X(64), Y(0)],
    [X(144), Y(-26)],
    [X(162), Y(-70)],
    [X(112), Y(-56)],
    [X(0), Y(-50)],
    [X(-112), Y(-56)],
  ]);
  out += path(rim, p.nest);
  const r = rng(19);
  let dark = '';
  let light = '';
  for (let i = 0; i < 18; i++) {
    const t = i / 17;
    const cx = -132 + t * 264;
    const cy = -40 + Math.pow(Math.abs(t - 0.5) * 2, 2) * -14 + range(r, -6, 22);
    const len = range(r, 56, 96);
    const tilt = (range(r, -16, 16) * Math.PI) / 180;
    const dx = (Math.cos(tilt) * len) / 2;
    const dy = (Math.sin(tilt) * len) / 2;
    const d = curve(X(cx - dx), Y(cy - dy), X(cx + dx), Y(cy + dy), range(r, -6, 6) * s);
    if (i % 2) dark += d;
    else light += d;
  }
  out += `<path d="${dark}" fill="none" stroke="${p.nestDark}" stroke-width="${f(5.5 * s)}" stroke-linecap="round"/>`;
  out += `<path d="${light}" fill="none" stroke="${p.nestLight}" stroke-width="${f(5.5 * s)}" stroke-linecap="round"/>`;
  out += stroke(curve(X(-150), Y(-70), X(-198), Y(-90), -8 * s), p.nestDark, 5.5 * s);
  out += stroke(curve(X(148), Y(-66), X(200), Y(-80), 8 * s), p.nestLight, 5.5 * s);
  out += stroke(curve(X(124), Y(-16), X(176), Y(2), 6 * s), p.nestDark, 5.5 * s);
  out += path(leaf(X(-128), Y(-26), 64 * s, 15 * s, 165), p.fern);
  out += path(leaf(X(-112), Y(-14), 50 * s, 12 * s, 140), p.fernDark);
  out += path(leaf(X(136), Y(-24), 58 * s, 14 * s, 15), p.fernDark);
  return out;
}

function lakeRing(k: number, ky: number, dy: number): string {
  return smooth(
    LAKE.map(([x, y]): Pt => [
      LAKE_C[0] + (x - LAKE_C[0]) * k,
      LAKE_C[1] + (y - LAKE_C[1]) * ky + dy,
    ]),
  );
}

function lilyPad(x: number, y: number, s: number, rot: number, color: string, dark: string) {
  const rx = 40 * s;
  const ry = 15 * s;
  const shape = (cy: number) => {
    const a0 = rot + 0.32;
    const a1 = rot - 0.32 + Math.PI * 2;
    return `M${f(x)} ${f(cy)}L${f(x + Math.cos(a0) * rx)} ${f(cy + Math.sin(a0) * ry)}A${f(rx)} ${f(ry)} 0 1 1 ${f(x + Math.cos(a1) * rx)} ${f(cy + Math.sin(a1) * ry)}Z`;
  };
  return path(shape(y + 5 * s), dark) + path(shape(y), color);
}

function waterLily(x: number, y: number, s: number, p: Palette): string {
  let out = lilyPad(x + 4 * s, y + 6 * s, s * 1.1, 0.4, p.lily, p.lilyDark);
  for (const a of [-160, -20]) out += path(leaf(x, y, 28 * s, 9 * s, a), p.lotusDark);
  for (const a of [-125, -55]) out += path(leaf(x, y, 34 * s, 11 * s, a), p.lotusDark);
  out += path(ellipse(x, y - 9 * s, 10 * s, 5 * s), p.lotusCenter);
  for (const a of [-108, -72]) out += path(leaf(x, y, 34 * s, 12 * s, a), p.lotus);
  return out;
}

function lake(p: Palette, mode: Mode): string {
  const water = lakeRing(1, 1, 0);
  let out = path(lakeRing(1.045, 1.14, 10), p.shore);
  out += path(lakeRing(1.022, 1.06, 5), p.shoreWet);
  out += path(water, p.waterDeep);
  let inner = path(lakeRing(1, 1, 22), p.water);
  inner += path(ellipse(760, 1400, 420, 46), p.waterMid, ' fill-opacity=".7"');
  const glint = mode === 'day' ? p.waterLight : p.sun;
  [
    [SUN[0] - 70, 1262, 150],
    [SUN[0] - 40, 1292, 110],
    [SUN[0] - 20, 1322, 70],
  ].forEach(([gx, gy, gw]) => {
    inner += stroke(
      `M${f(gx - gw / 2)} ${f(gy)}L${f(gx + gw / 2)} ${f(gy)}`,
      glint,
      9,
      ' stroke-opacity=".8"',
    );
  });
  for (const [x1, y1, x2, y2, b] of [
    [880, 1280, 1040, 1284, -6],
    [960, 1330, 1120, 1336, -6],
    [300, 1340, 420, 1344, -5],
    [520, 1440, 700, 1446, -7],
    [860, 1440, 980, 1444, -5],
  ]) {
    inner += stroke(curve(x1, y1, x2, y2, b), p.waterLight, 7, ' stroke-opacity=".7"');
  }
  out += clipped(`dnLake-${mode}`, water, inner);
  for (const [sx, sy, rx, ry] of [
    [168, 1446, 30, 18],
    [214, 1470, 18, 11],
    [1318, 1424, 32, 19],
    [1276, 1452, 19, 12],
    [452, 1206, 22, 12],
    [1016, 1214, 17, 10],
  ]) {
    out += path(ellipse(sx, sy + ry * 0.3, rx, ry), p.rockShade);
    out += path(ellipse(sx - rx * 0.06, sy, rx * 0.94, ry * 0.86), p.rock);
    out += path(ellipse(sx - rx * 0.3, sy - ry * 0.3, rx * 0.3, ry * 0.2, -15), p.rockLight);
  }
  out += lilyPad(240, 1400, 1, 0.3, p.lily, p.lilyDark);
  out += lilyPad(320, 1436, 0.8, 2.2, p.lilyDark, p.lilyDark);
  out += waterLily(286, 1398, 1, p);
  out += lilyPad(1150, 1418, 1.1, 4, p.lily, p.lilyDark);
  out += lilyPad(1214, 1384, 0.75, 1.2, p.lily, p.lilyDark);
  out += waterLily(1160, 1410, 0.9, p);
  return out;
}

function volcanoHalf(yy: number): number {
  const t = Math.min(1, Math.max(0, (VBASE - yy) / (VBASE - RIM)));
  return 150 + 640 * Math.pow(1 - t, 1.9);
}

function volcanoBody(): string {
  const left: Pt[] = [];
  const right: Pt[] = [];
  for (const t of [0, 0.18, 0.36, 0.54, 0.7, 0.84, 0.95]) {
    const yy = VBASE - (VBASE - RIM) * t;
    const w = volcanoHalf(yy);
    left.push([VX - w, yy]);
    right.push([VX + w, yy]);
  }
  return smooth(
    [
      ...left,
      [VX - 138, RIM - 10],
      [VX - 60, RIM - 17],
      [VX + 60, RIM - 17],
      [VX + 138, RIM - 10],
      ...right.reverse(),
    ],
    true,
  );
}

function smokePuff(x: number, y: number, s: number, color: string, shade: string): string {
  const blobs: [number, number, number][] = [
    [-34, 8, 30],
    [0, -12, 42],
    [36, 4, 32],
    [6, 16, 30],
  ];
  return (
    path(blobs.map(([dx, dy, r]) => circle(x + dx * s, y + (dy + 9) * s, r * s)).join(''), shade) +
    path(blobs.map(([dx, dy, r]) => circle(x + dx * s, y + dy * s, r * s)).join(''), color)
  );
}

function volcano(p: Palette, mode: Mode): string {
  const night = mode === 'night';
  const body = volcanoBody();
  let out = `<defs>${radialGlow(`dnCraterGlow-${mode}`, p.lava, night ? 0.6 : 0.22)}</defs>`;
  out += `<circle cx="${VX}" cy="${RIM - 10}" r="230" fill="url(#dnCraterGlow-${mode})"/>`;
  let cone = path(body, p.volcano);
  let detail = path(
    `M${VX - 900} ${RIM - 60}L${VX - 40} ${RIM - 60}Q${VX - 190} ${760} ${VX - 380} ${VBASE + 60}L${VX - 900} ${VBASE + 60}Z`,
    p.volcanoLight,
    ' fill-opacity=".55"',
  );
  detail += path(
    `M${VX + 50} ${RIM - 60}L${VX + 900} ${RIM - 60}L${VX + 900} ${VBASE + 60}L${VX + 330} ${VBASE + 60}Q${VX + 150} ${780} ${VX + 50} ${RIM - 60}Z`,
    p.volcanoShade,
  );
  for (const [d, len] of [
    [-104, 150],
    [-46, 110],
    [40, 120],
    [100, 160],
  ]) {
    detail += path(
      tube(
        [
          [VX + d, RIM + 24],
          [VX + d * 1.35, RIM + len * 0.55],
          [VX + d * 1.8, RIM + len],
        ],
        (u) => 9 * (1 - u) + 2,
      ),
      p.volcanoRidge,
      ' fill-opacity=".4"',
    );
  }
  const r = rng(31);
  const band = (y0: number, amp: number, bump: number, color: string) => {
    const pts: Pt[] = [];
    let blobs = '';
    for (let x = VX - 880; x <= VX + 880; x += 46) {
      const yy = y0 + Math.sin(x * 0.011) * amp + range(r, -6, 6);
      pts.push([x, yy]);
      blobs += circle(x + range(r, -10, 10), yy + 4, range(r, bump * 0.7, bump));
    }
    return (
      path(`${smooth(pts, false)}L${VX + 900} ${VBASE + 80}L${VX - 900} ${VBASE + 80}Z`, color) +
      path(blobs, color)
    );
  };
  detail += band(860, 16, 26, p.volcanoGreen);
  detail += band(925, 12, 22, p.volcanoGreenDark);
  cone += clipped(`dnVolcanoBody-${mode}`, body, detail);
  cone += path(ellipse(VX, RIM + 4, 124, 21), p.crater);
  cone += path(ellipse(VX, RIM + 11, 88, 11), p.lava);
  cone += path(ellipse(VX - 8, RIM + 12, 48, 5), p.lavaCore);
  cone += stroke(curve(VX - 122, RIM + 6, VX + 122, RIM + 6, 22), p.volcanoLight, 9);
  const eyeY = 648;
  for (const ex of [VX - 64, VX + 64]) {
    cone += stroke(curve(ex - 22, eyeY, ex + 22, eyeY, -15), p.volcanoFace, 9);
    cone += path(
      ellipse(ex + (ex < VX ? -30 : 30), eyeY + 40, 26, 14),
      p.cheek,
      ' fill-opacity=".55"',
    );
  }
  cone += stroke(curve(VX - 30, eyeY + 44, VX + 30, eyeY + 44, 18), p.volcanoFace, 9);
  out += clipped(`dnVolcanoHill-${mode}`, `${FAR_TOP}L${W + 200} -100L-200 -100Z`, cone);
  const puffs: [number, number, number][] = [
    [VX - 6, RIM - 44, 0.95],
    [VX + 54, RIM - 140, 0.78],
    [VX + 124, RIM - 220, 0.6],
  ];
  puffs.forEach(([x, y, s], i) => {
    out += smokePuff(x, y, s, p.smoke, night && i === 0 ? p.smokeGlow : p.smokeShade);
  });
  return out;
}

function footprint(x: number, y: number, s: number, rot: number, color: string): string {
  const toes = [-34, 0, 34]
    .map((a) => {
      const rad = ((a - 90) * Math.PI) / 180;
      return `<path d="${capsule(0, 0, Math.cos(rad) * 46, Math.sin(rad) * 46, 12, 6)}"/>`;
    })
    .join('');
  return `<g transform="translate(${f(x)} ${f(y)}) scale(${f(s)} ${f(s * 0.5)}) rotate(${f(rot)})" fill="${color}"><path d="${ellipse(0, 12, 21, 19)}"/>${toes}</g>`;
}

function tuft(x: number, y: number, s: number, color: string): string {
  return path(
    [-112, -96, -84, -68]
      .map((a, i) => leaf(x + (i - 1.5) * 4 * s, y + 2, (34 + (i % 2) * 14) * s, 6 * s, a))
      .join(''),
    color,
  );
}

function pebbles(x: number, y: number, s: number, p: Palette): string {
  return (
    path(ellipse(x, y, 16 * s, 10 * s), p.rockShade) +
    path(ellipse(x - 1 * s, y - 2 * s, 14 * s, 8 * s), p.rock) +
    path(ellipse(x + 24 * s, y + 4 * s, 10 * s, 6 * s), p.rockShade) +
    path(ellipse(x + 23 * s, y + 3 * s, 8 * s, 5 * s), p.rockLight)
  );
}

function bloom(x: number, y: number, s: number, petal: string, center: string, stem: string) {
  let d = '';
  for (let i = 0; i < 5; i++) {
    const a = (i / 5) * Math.PI * 2 - Math.PI / 2;
    d += circle(x + Math.cos(a) * 8 * s, y + Math.sin(a) * 8 * s, 7 * s);
  }
  return (
    stroke(`M${f(x)} ${f(y)}L${f(x)} ${f(y + 28 * s)}`, stem, 4 * s) +
    path(d, petal) +
    path(circle(x, y, 5.5 * s), center)
  );
}

function fireflies(seed: number, count: number): string {
  return scatter(seed, count, 100, W - 100, 1000, 1800, (x, y, r) => {
    const s = range(r, 0.7, 1.2);
    return (
      `<circle cx="${f(x)}" cy="${f(y)}" r="${f(26 * s)}" fill="url(#dnFly)"/>` +
      path(circle(x, y, 4.5 * s), '#fff8c4')
    );
  });
}

function scatterFree(
  seed: number,
  count: number,
  y0: number,
  y1: number,
  draw: (x: number, y: number, r: () => number) => string,
): [number, string][] {
  return scatterItems(seed, count, 0, W, y0, y1, (x, y, r) => {
    const svg = draw(x, y, r);
    return free(x, y) ? svg : '';
  });
}

function sunWithSpinningRays(x: number, y: number, r: number, p: Palette): string {
  const svg = sun(x, y, r, p.sun, p.sunRay, p.face);
  const rays = (svg.match(/<path[^>]*\/>/g) ?? []).slice(0, 12).join('');
  return svg.replace(rays, `<g data-spin="" style="transform-origin: ${x}px ${y}px">${rays}</g>`);
}

const interactives: Interactive[] = [
  {
    id: 'sun',
    box: [SUN[0] - 254, SUN[1] - 254, 508, 508],
    kind: 'spin',
    effect: 'sparkle',
    sound: 'shine',
    night: { kind: 'rock', effect: 'stars', sound: 'twinkle' },
    render: (p, mode) =>
      mode === 'day'
        ? sunWithSpinningRays(SUN[0], SUN[1], 100, p)
        : moon(SUN[0], SUN[1], 92, p.sun, p.sunRay, p.face),
  },
  {
    id: 'volcano',
    box: [1582, 156, 1268, 850],
    kind: 'shake',
    origin: [VX, 985],
    effect: 'smoke',
    effectAt: [VX, RIM - 40],
    sound: 'rumble',
    render: (p, mode) => volcano(p, mode),
  },
  {
    id: 'araucaria-left',
    box: [-138, 362, 742, 910],
    kind: 'shake',
    effect: 'leaves',
    sound: 'rustle',
    render: (p) => araucaria(230, 1222, 1, p),
  },
  {
    id: 'araucaria-right',
    box: [2948, 356, 770, 944],
    kind: 'shake',
    effect: 'leaves',
    sound: 'rustle',
    render: (p) => araucaria(3340, 1250, 1.04, p, true),
  },
  {
    id: 'tree-fern',
    box: [1276, 710, 540, 626],
    kind: 'shake',
    effect: 'leaves',
    sound: 'rustle',
    render: (p) => treeFern(1530, 1290, 1, 16, p),
  },
  {
    id: 'tree-fern-back',
    box: [1864, 828, 388, 452],
    kind: 'shake',
    effect: 'leaves',
    sound: 'rustle',
    render: (p) => treeFern(2050, 1240, 0.7, 12, p),
  },
  {
    id: 'lake',
    box: [70, 1166, 1318, 384],
    kind: 'pulse',
    effect: 'splash',
    sound: 'splash',
    render: (p, mode) => lake(p, mode),
  },
  {
    id: 'boulder',
    box: [2626, 1074, 356, 294],
    kind: 'wiggle',
    sound: 'thump',
    render: (p, mode) => boulder(`dnBoulder-${mode}`, 2790, 1330, 140, 110, p, 7),
  },
  {
    id: 'nest',
    box: [1688, 1484, 546, 296],
    kind: 'bounce',
    effect: 'sparkle',
    sound: 'giggle',
    render: (p, mode) => nest(1960, 1730, 1.25, p, mode),
  },
];

const dinosaur: SceneDef = {
  id: 'dinosaur',
  world: [W, H],
  horizon: 980,
  ambient: {
    clouds: 4,
    birds: 3,
    stars: 50,
    fireflies: 20,
    smoke: 6,
    smokeAt: [VX, RIM - 30],
  },
  defaults: [
    { animal: 'pteranodon', x: 1250, y: 400 },
    { animal: 'brachiosaurus', x: 2000, y: 1010, flip: true },
    { animal: 'parasaurolophus', x: 3240, y: 1190, flip: true },
    { animal: 'plesiosaurus', x: 660, y: 1330 },
    { animal: 'spinosaurus', x: 1500, y: 1400, flip: true },
    { animal: 't-rex', x: 2440, y: 1420 },
    { animal: 'ankylosaurus', x: 520, y: 1690 },
    { animal: 'stegosaurus', x: 1220, y: 1688, flip: true },
    { animal: 'velociraptor', x: 2340, y: 1745, flip: true },
    { animal: 'triceratops', x: 3000, y: 1650, flip: true },
  ],
  day: {
    skyTop: '#6cc2ee',
    skyMid: '#aee0ef',
    skyBottom: '#f6efc8',
    sun: '#ffd84d',
    sunRay: '#ffc531',
    face: '#8a4b1f',
    mountainFar: '#c8e2dc',
    mountain: '#b3d5cd',
    mountainShade: '#a0c8c0',
    volcano: '#b8846b',
    volcanoShade: '#9c6b57',
    volcanoLight: '#d4a487',
    volcanoRidge: '#7c5040',
    volcanoFace: '#6b3f2f',
    volcanoGreen: '#9ccb82',
    volcanoGreenDark: '#88bd70',
    cheek: '#f39a8c',
    crater: '#6e4436',
    lava: '#ff9f43',
    lavaCore: '#ffd166',
    smoke: '#f5f1f8',
    smokeShade: '#dcd4e6',
    smokeGlow: '#dcd4e6',
    hillFar: '#bcdca5',
    treeFar: '#a6d095',
    hill: '#a9d47d',
    treeMid: '#93c56c',
    ground2: '#b2d669',
    ground: '#bdd964',
    groundLight: '#cde47f',
    print: '#a5c552',
    grass: '#93c64c',
    grassDark: '#78ad3c',
    water: '#5bc3e8',
    waterMid: '#7fd3f0',
    waterDeep: '#3fa6d6',
    waterLight: '#d2f4fd',
    shore: '#e6da9f',
    shoreWet: '#cdbd80',
    lily: '#6dbb55',
    lilyDark: '#57a645',
    lotus: '#ffa8cb',
    lotusDark: '#f27aa8',
    lotusCenter: '#ffe066',
    trunk: '#93643f',
    trunkDark: '#6c4529',
    needle: '#4f9e63',
    needleDark: '#3c8452',
    needleLight: '#72bd78',
    fernTrunk: '#82603f',
    frond: '#74c24a',
    frondDark: '#58a63b',
    frondLight: '#a4dc66',
    rib: '#4f9233',
    cycadTrunk: '#ad7f52',
    cycadTrunkDark: '#86603c',
    cycad: '#53a64b',
    cycadDark: '#3e8d3f',
    cycadRib: '#3b7f35',
    cone: '#f2b84c',
    coneDark: '#cc8b2a',
    horsetail: '#a5d25a',
    horsetailDark: '#86b846',
    horsetailNode: '#5f8f33',
    horsetailTip: '#c79a55',
    fern: '#6dbd45',
    fernDark: '#54a037',
    fernRib: '#4a8f30',
    rock: '#c2b5a2',
    rockShade: '#a69886',
    rockLight: '#e2d9cb',
    moss: '#92c656',
    mossDark: '#76ac43',
    nest: '#cc9b5a',
    nestDark: '#a5773d',
    nestLight: '#e8c88a',
    nestInner: '#7c5530',
    eggA: '#fdf4dc',
    spotA: '#7cc39a',
    eggB: '#dcf1fb',
    spotB: '#5eaee0',
    eggC: '#ffe7da',
    spotC: '#f39a7a',
    eggGlow: '#fff3c4',
    crack: '#c98a70',
    shrub: '#5fae4a',
    shrubDark: '#4a963f',
    shrubLight: '#7cc35c',
    magnolia: '#ffe1ec',
    magnoliaDark: '#f59cc2',
    magnoliaCenter: '#ffd84a',
    petalA: '#ff9ccf',
    petalB: '#ffd23f',
    petalC: '#ffffff',
    petalCenter: '#ffb03b',
  },
  night: {
    skyTop: '#0b1438',
    skyMid: '#1b2459',
    skyBottom: '#3d3f80',
    sun: '#fff1c0',
    sunRay: '#ffe9a8',
    face: '#7a5a34',
    lava: '#ffae4a',
    lavaCore: '#ffe28a',
    smoke: '#8a83ad',
    smokeShade: '#726b98',
    smokeGlow: '#d49a7c',
    water: '#2b4b8e',
    waterMid: '#34589c',
    waterDeep: '#223f7c',
    waterLight: '#8fb2ee',
    lotus: '#ffc2dc',
    lotusCenter: '#fff2a6',
    mountainFar: '#3f4f8f',
    mountain: '#394987',
    mountainShade: '#334280',
    magnolia: '#e9dcf4',
    magnoliaDark: '#d59ac8',
    magnoliaCenter: '#fff2a6',
    petalA: '#ffb0d0',
    petalB: '#fff0a0',
    petalC: '#e8ecff',
    eggGlow: '#fff3c4',
    eggA: '#d8daf2',
    spotA: '#8fcfb6',
    eggB: '#c4dcf6',
    spotB: '#7fb6ef',
    eggC: '#e6d2ea',
    spotC: '#e99aa6',
  },
  back: (p, mode) => {
    const night = mode === 'night';
    let out =
      `<defs>${linearGradient('dnSky', [
        [0, p.skyTop],
        [0.55, p.skyMid],
        [1, p.skyBottom],
      ])}${radialGlow('dnFly', '#fff3a0', 0.7)}</defs>` +
      `<rect width="${W}" height="${H}" fill="url(#dnSky)"/>`;
    if (night) out += starField(17, 80, 40, 40, W - 40, 760, '#fff6d6');
    out += mountain(980, 1000, 1000, 330, p.mountainFar, p.mountain);
    out += mountain(1480, 1000, 760, 230, p.mountainFar, p.mountain);
    out += mountain(3060, 1000, 1080, 360, p.mountainFar, p.mountain);
    out += mountain(3560, 1000, 760, 250, p.mountainFar, p.mountain);
    out += mountain(240, 1000, 800, 260, p.mountainFar, p.mountain);
    out += path(`${FAR_TOP}L${W + 200} ${H + 50}L-200 ${H + 50}Z`, p.hillFar);
    const rf = rng(5);
    for (let i = 0; i < 18; i++) {
      const x = range(rf, 40, W - 40);
      const y = heightAt(FAR_HILL, x) + range(rf, 8, 22);
      const svg =
        rf() < 0.5
          ? farAraucaria(x, y, range(rf, 0.35, 0.5), p.treeFar)
          : farFern(x, y, range(rf, 0.5, 0.75), p.treeFar);
      if (x < 1560 || x > 2940) out += svg;
    }
    out += path(`${smooth(MID_HILL, false)}L${W + 200} ${H + 50}L-200 ${H + 50}Z`, p.hill);
    const rm = rng(43);
    for (let i = 0; i < 24; i++) {
      const x = range(rm, 0, W);
      const y = heightAt(MID_HILL, x) + range(rm, 8, 24);
      const svg =
        rm() < 0.5
          ? farFern(x, y, range(rm, 0.7, 1), p.treeMid)
          : farAraucaria(x, y, range(rm, 0.45, 0.6), p.treeMid);
      if (x < 1560 || x > 2940) out += svg;
    }
    const ground: Pt[] = [
      [-200, 1130],
      [400, 1100],
      [1000, 1118],
      [1600, 1094],
      [2200, 1116],
      [2800, 1096],
      [3400, 1112],
      [3800, 1100],
    ];
    out += path(`${smooth(ground, false)}L${W + 200} ${H + 50}L-200 ${H + 50}Z`, p.ground);
    out += path(
      tube(STREAM, (u) => 12 + 34 * u),
      p.shoreWet,
    );
    out += path(
      tube(STREAM, (u) => 7 + 28 * u),
      p.water,
    );
    out += stroke(
      smooth(
        STREAM.slice(1).map(([x, y], i): Pt => [x - 6 - i * 4, y]),
        false,
      ),
      p.waterLight,
      5,
      ' stroke-opacity=".8"',
    );
    out += pebbles(852, 1070, 0.9, p) + pebbles(884, 1060, 0.7, p);
    out += scatter(37, 16, 0, W, 1180, 1900, (x, y, r) =>
      free(x, y)
        ? path(ellipse(x, y, 130 + r() * 160, 30 + r() * 24), p.groundLight, ' fill-opacity=".75"')
        : '',
    );
    [
      [2560, 1900, 1.3, -18],
      [2690, 1830, 1.25, -14],
      [2620, 1752, 1.2, -16],
      [2760, 1690, 1.12, -12],
      [2700, 1620, 1.05, -14],
      [2830, 1566, 1, -10],
    ].forEach(([x, y, s, rot], i) => {
      out += footprint(x + (i % 2 ? 26 : -26), y, s, rot, p.print);
    });
    out += layered([
      [1172, araucaria(560, 1172, 0.62, p)],
      [1182, horsetails(360, 1196, 0.9, p, 3)],
      [1200, horsetails(1120, 1214, 0.8, p, 5)],
      [1176, treeFern(1000, 1176, 0.6, -10, p)],
      [1210, cycad(2380, 1210, 0.8, p)],
      [1190, araucaria(2980, 1190, 0.55, p)],
      [1340, cycad(1790, 1340, 0.9, p)],
      [1480, magnolia(2790, 1480, 0.9, p, 41)],
      [1404, magnolia(3480, 1404, 0.95, p, 43)],
      [1548, magnolia(930, 1548, 0.8, p, 47)],
      [1380, boulder('dnRockA', 2990, 1380, 70, 56, p, 11)],
      [1430, fernClump(3120, 1430, 0.9, p, [-170, -140, -110, -70, -40, -10])],
      [1520, horsetails(1400, 1530, 1, p, 9)],
      [1560, fernClump(2560, 1560, 1, p, [-165, -135, -105, -75, -45, -15])],
      [1600, cycad(3460, 1600, 1.05, p)],
      [1620, fernClump(80, 1620, 1.1, p, [-120, -90, -60, -30, -5])],
      [1640, boulder('dnRockB', 1060, 1640, 84, 66, p, 13)],
      [1660, cycad(780, 1660, 1.1, p)],
      [1700, horsetails(1720, 1700, 1.05, p, 15)],
      [1770, fernClump(3300, 1770, 1.1, p, [-165, -135, -105, -75, -45, -15])],
      [1520, pebbles(2300, 1520, 1, p)],
      [1810, pebbles(1200, 1810, 1.2, p)],
      [1300, pebbles(3140, 1300, 0.8, p)],
      ...scatterFree(12, 60, 1150, 1900, (x, y, r) =>
        tuft(x, y, 0.8 + r() * 0.6, r() < 0.5 ? p.grass : p.grassDark),
      ),
      ...scatterFree(29, 26, 1200, 1860, (x, y, r) => {
        const c = [p.petalA, p.petalB, p.petalC][Math.floor(r() * 3)];
        const s = 0.8 + r() * 0.4;
        return bloom(x, y - 30 * s, s, c, p.petalCenter, p.grassDark);
      }),
    ]);
    if (night) out += fireflies(61, 18);
    return out;
  },
  front: (p) =>
    fernClump(40, 2030, 1.5, p, [-90, -65, -40, -15]) +
    horsetails(890, 2010, 0.8, p, 21) +
    cycad(1720, 2070, 0.7, p) +
    fernClump(2630, 2040, 1.15, p, [-150, -120, -60, -30]) +
    horsetails(3340, 2010, 0.8, p, 23) +
    fernClump(3570, 2030, 1.5, p, [-165, -140, -115, -90]),
  interactives,
};

export default dinosaur;
