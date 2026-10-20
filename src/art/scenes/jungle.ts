import {
  circle,
  curve,
  ellipse,
  f,
  leaf,
  roundRect,
  scallop,
  smooth,
  spline,
  tube,
  type Pt,
} from '../core/paths';
import {
  bigLeaf,
  bush,
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
  tallGrass,
} from './props';
import { range, rng } from './rng';
import type { Mode, Palette, SceneDef } from './types';

const W = 3600;
const H = 2000;

type Blob = [number, number, number, number];

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

function place(x: number, y: number, s: number, pts: Pt[]): Pt[] {
  return pts.map(([px, py]) => [x + px * s, y + py * s]);
}

function karst(
  x: number,
  baseY: number,
  w: number,
  h: number,
  color: string,
  shade: string,
  top: string,
): string {
  const body =
    smooth(
      [
        [x - w / 2, baseY + 20],
        [x - w * 0.47, baseY - h * 0.5],
        [x - w * 0.36, baseY - h * 0.9],
        [x - w * 0.08, baseY - h],
        [x + w * 0.2, baseY - h * 0.96],
        [x + w * 0.4, baseY - h * 0.62],
        [x + w / 2, baseY + 20],
      ],
      false,
    ) + 'Z';
  const shadeD = smooth([
    [x + w * 0.06, baseY - h * 0.99],
    [x + w * 0.2, baseY - h * 0.96],
    [x + w * 0.4, baseY - h * 0.62],
    [x + w / 2, baseY + 20],
    [x + w * 0.16, baseY + 20],
    [x + w * 0.2, baseY - h * 0.55],
  ]);
  return (
    path(body, color) +
    path(shadeD, shade, ' fill-opacity=".75"') +
    path(scallop(x - w * 0.08, baseY - h * 0.97, 1, 9, w * 0.045, 0, w * 0.3, h * 0.07), top)
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
      scallop(x + dx * s, y + (dy + 18) * s, 1, 11, rx * 0.17 * s, dx, rx * s, ry * s),
      dark,
    );
  }
  for (const [dx, dy, rx, ry] of blobs) {
    out += path(
      scallop(
        x + (dx - 10) * s,
        y + dy * s,
        1,
        11,
        rx * 0.15 * s,
        dx + 15,
        rx * 0.92 * s,
        ry * 0.86 * s,
      ),
      mid,
    );
  }
  for (const [dx, dy, rx, ry] of blobs) {
    out += path(
      scallop(
        x + (dx - rx * 0.3) * s,
        y + (dy - ry * 0.32) * s,
        1,
        7,
        rx * 0.08 * s,
        0,
        rx * 0.42 * s,
        ry * 0.32 * s,
      ),
      light,
    );
  }
  return out;
}

function jungleTree(
  x: number,
  y: number,
  s: number,
  p: Palette,
  seed: number,
  banyan = false,
  vines = true,
  fruit = '',
): string {
  const blobs: Blob[] = [
    [-250, -470, 175, 118],
    [240, -490, 185, 122],
    [-10, -620, 230, 150],
    [-130, -420, 150, 96],
    [140, -430, 160, 100],
  ];
  const T = (pts: Pt[], r0: number, r1: number, color: string, extra = '') =>
    limb(place(x, y, s, pts), r0 * s, r1 * s, color, extra);
  let out = '';
  if (banyan) {
    [-330, -250, -175, 185, 265, 345].forEach((dx, i) => {
      const top = -430 + (i % 3) * 24;
      out += T(
        [
          [dx, top],
          [dx + 10, -200],
          [dx - 4, 6],
        ],
        6,
        9,
        p.root,
      );
    });
  }
  out += T(
    [
      [0, -280],
      [-120, -380],
      [-250, -460],
    ],
    22,
    12,
    p.trunk,
  );
  out += T(
    [
      [0, -290],
      [120, -390],
      [240, -480],
    ],
    22,
    12,
    p.trunk,
  );
  out += T(
    [
      [0, -320],
      [-14, -470],
      [-10, -600],
    ],
    20,
    12,
    p.trunk,
  );
  out += T(
    [
      [0, 8],
      [-14, -140],
      [8, -280],
      [0, -340],
    ],
    48,
    30,
    p.trunk,
  );
  out += path(
    `M${f(x - 110 * s)} ${f(y + 8)}Q${f(x - 46 * s)} ${f(y - 6 * s)} ${f(x - 42 * s)} ${f(y - 120 * s)}L${f(x + 42 * s)} ${f(y - 120 * s)}Q${f(x + 50 * s)} ${f(y - 6 * s)} ${f(x + 116 * s)} ${f(y + 8)}Z`,
    p.trunk,
  );
  out += T(
    [
      [24, 4],
      [16, -140],
      [32, -280],
    ],
    16,
    9,
    p.trunkDark,
    ' fill-opacity=".4"',
  );
  out += canopy(x, y, s, blobs, p.leavesDark, p.leaves, p.leavesLight);
  if (fruit) {
    const r = rng(seed * 7);
    for (let i = 0; i < 9; i++) {
      const fx = x + range(r, -330, 330) * s;
      const fy = y + range(r, -560, -400) * s;
      out += stroke(`M${f(fx)} ${f(fy - 18 * s)}L${f(fx)} ${f(fy - 4 * s)}`, p.leavesDark, 4 * s);
      out += path(ellipse(fx, fy + 10 * s, 13 * s, 17 * s, -15), fruit);
      out += path(
        ellipse(fx - 4 * s, fy + 4 * s, 4 * s, 6 * s, -15),
        '#fff6c8',
        ' fill-opacity=".6"',
      );
    }
  }
  if (!vines) return out;
  [
    [-330, -380, 200],
    [-190, -350, 140],
    [70, -360, 230],
    [230, -390, 150],
    [380, -400, 190],
  ].forEach(([dx, dy, len], i) => {
    out += liana(x + dx * s, y + dy * s, len * s, s, p.vine, p.vineLeaf, seed + i * 3);
  });
  return out;
}

function sprig(x: number, y: number, s: number, color: string, r: () => number, n = 3): string {
  let out = '';
  for (let i = 0; i < n; i++) {
    const a = i % 2 ? range(r, -40, 35) : range(r, 145, 220);
    out += path(leaf(x, y, range(r, 70, 100) * s, 11 * s, a), color);
  }
  return out;
}

function bamboo(x: number, y: number, s: number, p: Palette, seed: number): string {
  const r = rng(seed);
  let stalks = '';
  let leaves = '';
  const n = 5;
  for (let i = 0; i < n; i++) {
    const bx = x + (i - (n - 1) / 2) * 34 * s + range(r, -8, 8) * s;
    const h = range(r, 480, 720) * s;
    const lean = (range(r, -50, 50) + (i - 2) * 24) * s;
    const line: Pt[] = [
      [bx, y + 4],
      [bx + lean * 0.3, y - h * 0.5],
      [bx + lean, y - h],
    ];
    const pts = spline(line, 40);
    stalks += limb(line, 13 * s, 10 * s, i % 2 ? p.bambooDark : p.bamboo);
    for (let k = 5; k < 40; k += 6) {
      const [px, py] = pts[k];
      stalks += stroke(
        `M${f(px - 13 * s)} ${f(py)}L${f(px + 13 * s)} ${f(py)}`,
        p.bambooNode,
        5 * s,
      );
      if (k > 14 && r() < 0.4) leaves += sprig(px, py, s * 0.8, p.bambooLeaf, r, 2);
    }
    leaves += sprig(bx + lean, y - h, s, p.bambooLeaf, r, 5);
  }
  return stalks + leaves;
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

function bananaPlant(x: number, y: number, s: number, p: Palette, fruit = false): string {
  const top: Pt = [x + 2 * s, y - 200 * s];
  let out = limb([[x, y + 4], [x + 6 * s, y - 100 * s], top], 22 * s, 15 * s, p.bananaStem);
  const leaves: [number, number, number, boolean][] = [
    [-172, -40, 240, true],
    [-12, 42, 240, true],
    [-132, -38, 250, false],
    [-52, 38, 250, false],
    [-96, 14, 200, false],
  ];
  for (const [a, b, len, back] of leaves) {
    out += archLeaf(
      top[0],
      top[1],
      len * s,
      44 * s,
      a,
      b,
      back ? p.bananaLeafDark : p.bananaLeaf,
      p.bananaVein,
    );
  }
  if (fruit) {
    const bx = x + 40 * s;
    const by = y - 150 * s;
    out += stroke(
      curve(top[0], top[1] + 10 * s, bx + 6 * s, by + 70 * s, -18 * s),
      p.bananaStem,
      7 * s,
    );
    for (let row = 0; row < 3; row++) {
      for (let k = -1; k <= 1; k++) {
        out += path(
          leaf(bx + k * 14 * s, by + row * 20 * s, 30 * s, 8 * s, -70 + k * 22),
          p.banana,
        );
      }
    }
    out += path(ellipse(bx + 8 * s, by + 80 * s, 13 * s, 18 * s, -10), p.bud);
  }
  return out;
}

const HEART = smooth([
  [0, 0],
  [-44, -16],
  [-74, 20],
  [-64, 74],
  [-32, 116],
  [0, 146],
  [32, 116],
  [64, 74],
  [74, 20],
  [44, -16],
]);

function elephantEar(x: number, y: number, s: number, p: Palette): string {
  const stalks: [number, number, number, boolean][] = [
    [-120, 230, -24, true],
    [110, 250, 20, true],
    [-40, 320, -8, false],
    [60, 290, 14, false],
  ];
  let out = '';
  for (const [dx, h, tilt, back] of stalks) {
    const tx = x + dx * s;
    const ty = y - h * s;
    out += stroke(curve(x, y, tx, ty, (dx > 0 ? -1 : 1) * 30 * s), p.earStem, 9 * s);
    out +=
      `<g transform="translate(${f(tx)} ${f(ty)}) rotate(${f(tilt)}) scale(${f(s)})">` +
      `<path d="${HEART}" fill="${back ? p.earDark : p.ear}"/>` +
      `<path d="M0 4L0 128M0 40L-40 64M0 40L40 64M0 80L-30 100M0 80L30 100" fill="none" stroke="${p.earVein}" stroke-width="4" stroke-linecap="round"/>` +
      `</g>`;
  }
  return out;
}

function hibiscus(x: number, y: number, s: number, petal: string, dark: string, center: string) {
  let d = '';
  for (let i = 0; i < 5; i++) {
    const a = (i / 5) * Math.PI * 2 - Math.PI / 2;
    d += circle(x + Math.cos(a) * 11 * s, y + Math.sin(a) * 11 * s, 11 * s);
  }
  let out = path(d, petal);
  out += path(circle(x, y, 7 * s), dark);
  out += stroke(`M${f(x)} ${f(y)}L${f(x + 14 * s)} ${f(y - 16 * s)}`, center, 3 * s);
  out += path(circle(x + 15 * s, y - 17 * s, 4 * s), center);
  return out;
}

function hibiscusBush(x: number, y: number, s: number, p: Palette, seed: number): string {
  const r = rng(seed);
  const colors = [p.hibiscus, p.hibiscusPink, p.hibiscusOrange];
  let out = bush(x, y, s, p.bush, p.bushDark);
  for (let i = 0; i < 5; i++) {
    out += hibiscus(
      x + range(r, -80, 70) * s,
      y - range(r, 24, 78) * s,
      s * range(r, 0.8, 1.1),
      colors[i % 3],
      p.hibiscusDark,
      p.hibiscusCenter,
    );
  }
  return out;
}

function lilyPad(x: number, y: number, s: number, rot: number, color: string, dark: string) {
  const rx = 40 * s;
  const ry = 15 * s;
  const shape = (cy: number) => {
    const a0 = rot + 0.32;
    const a1 = rot - 0.32 + Math.PI * 2;
    const sx = x + Math.cos(a0) * rx;
    const sy = cy + Math.sin(a0) * ry;
    const ex = x + Math.cos(a1) * rx;
    const ey = cy + Math.sin(a1) * ry;
    return `M${f(x)} ${f(cy)}L${f(sx)} ${f(sy)}A${f(rx)} ${f(ry)} 0 1 1 ${f(ex)} ${f(ey)}Z`;
  };
  return path(shape(y + 5 * s), dark) + path(shape(y), color);
}

function lotus(x: number, y: number, s: number, p: Palette, glow: boolean): string {
  let out = glow
    ? `<circle cx="${f(x)}" cy="${f(y - 14 * s)}" r="${f(70 * s)}" fill="url(#jgLotus)"/>`
    : '';
  out += lilyPad(x + 4 * s, y + 6 * s, s * 1.1, 0.4, p.lily, p.lilyDark);
  for (const a of [-160, -20]) out += path(leaf(x, y, 30 * s, 9 * s, a), p.lotusDark);
  for (const a of [-130, -50]) out += path(leaf(x, y, 36 * s, 11 * s, a), p.lotusDark);
  out += path(ellipse(x, y - 10 * s, 11 * s, 6 * s), p.lotusCenter);
  for (const a of [-112, -68]) out += path(leaf(x, y, 36 * s, 12 * s, a), p.lotus);
  out += path(leaf(x, y, 40 * s, 12 * s, -90), p.lotus);
  return out;
}

function prang(
  cx: number,
  baseY: number,
  w: number,
  h: number,
  p: Palette,
  broken = false,
): string {
  const hw = (t: number) => (w / 2) * Math.pow(Math.max(0, 1 - Math.pow(t, 2.4)), 0.55);
  const tMax = broken ? 0.5 : 1;
  const left: Pt[] = [];
  const right: Pt[] = [];
  for (let i = 0; i <= 12; i++) {
    const t = (i / 12) * tMax;
    left.push([cx - hw(t), baseY - h * t]);
    right.push([cx + hw(t), baseY - h * t]);
  }
  let out = '';
  if (broken) {
    const top = baseY - h * tMax;
    const half = hw(tMax);
    const jag: Pt[] = [
      [cx - half * 0.5, top - 22],
      [cx - half * 0.1, top + 6],
      [cx + half * 0.3, top - 34],
      [cx + half * 0.7, top - 4],
    ];
    out += path(smooth([...left, ...jag, ...right.slice().reverse()], true, 0.4), p.stone);
  } else {
    out += path(smooth([...left, ...right.slice(0, 12).reverse()], true), p.stone);
    out += path(circle(cx, baseY - h - 6, w * 0.07), p.stone);
  }
  out += path(
    smooth(
      [
        [cx + hw(0) * 0.35, baseY],
        ...right.slice(0, broken ? 13 : 11),
        [cx + hw(tMax * 0.9) * 0.3, baseY - h * tMax * 0.9],
      ],
      true,
      0.6,
    ),
    p.stoneShade,
    ' fill-opacity=".55"',
  );
  for (const t of [0.16, 0.32, 0.47, 0.6, 0.72, 0.83]) {
    if (t > tMax - 0.05) break;
    const yy = baseY - h * t;
    const half = hw(t);
    out += stroke(curve(cx - half + 4, yy, cx + half - 4, yy, -h * 0.02), p.stoneShade, w * 0.035);
  }
  return out;
}

function crown(cx: number, baseY: number, w: number, h: number, p: Palette): string {
  const n = 5;
  const th = h / (n + 0.8);
  let out = '';
  for (let i = 0; i < n; i++) {
    const wi = w * (1 - i * 0.17);
    const top = baseY - (i + 1) * th;
    const bump = th * 0.3;
    out += path(circle(cx - wi / 2 + bump * 0.6, top + bump * 0.4, bump), p.stone);
    out += path(circle(cx + wi / 2 - bump * 0.6, top + bump * 0.4, bump), p.stone);
    out += path(roundRect(cx - wi / 2, top, wi, th + 4, th * 0.4), p.stone);
    out += path(
      roundRect(cx - wi / 2, top + th * 0.62, wi, th * 0.38 + 4, th * 0.19),
      p.stoneShade,
    );
    out += path(
      roundRect(cx - wi * 0.42, top + th * 0.12, wi * 0.84, th * 0.16, th * 0.08),
      p.stoneLight,
    );
    out += path(
      roundRect(cx + wi * 0.18, top, wi * 0.32, th * 0.62, th * 0.1),
      p.stoneShade,
      ' fill-opacity=".4"',
    );
  }
  const top = baseY - n * th;
  out += path(
    `M${f(cx - th * 0.55)} ${f(top + 4)}Q${f(cx - th * 0.6)} ${f(top - th * 0.7)} ${f(cx)} ${f(top - th * 1.05)}Q${f(cx + th * 0.6)} ${f(top - th * 0.7)} ${f(cx + th * 0.55)} ${f(top + 4)}Z`,
    p.stone,
  );
  out += path(
    ellipse(cx + th * 0.18, top - th * 0.35, th * 0.16, th * 0.3),
    p.stoneShade,
    ' fill-opacity=".5"',
  );
  return out;
}

function temple(x: number, y: number, s: number, p: Palette, mode: Mode): string {
  const X = (v: number) => x + v * s;
  const Y = (v: number) => y + v * s;
  const block = (bx: number, by: number, bw: number, bh: number, rr = 10) =>
    path(roundRect(X(bx), Y(by), bw * s, bh * s, rr * s), p.stone) +
    path(roundRect(X(bx), Y(by + bh - 16), bw * s, 16 * s, 8 * s), p.stoneShade) +
    path(
      roundRect(X(bx + 10), Y(by + 4), (bw - 20) * s, 8 * s, 4 * s),
      p.stoneLight,
      ' fill-opacity=".85"',
    );
  const moss = (mx: number, my: number, mw: number) =>
    path(scallop(X(mx), Y(my + 6), 1, 7, 9 * s, 0, mw * s, 13 * s), p.mossDark) +
    path(scallop(X(mx - 4), Y(my), 1, 7, 8 * s, 10, mw * 0.9 * s, 11 * s), p.moss);
  const crack = (cx: number, cy: number) =>
    stroke(
      `M${f(X(cx))} ${f(Y(cy))}l${f(10 * s)} ${f(14 * s)}l${f(-8 * s)} ${f(12 * s)}l${f(12 * s)} ${f(16 * s)}`,
      p.stoneShade,
      4 * s,
    );
  let out = '';
  out += prang(X(-292), Y(-180), 112 * s, 280 * s, p);
  out += prang(X(292), Y(-180), 112 * s, 280 * s, p, true);
  out += block(-430, -96, 860, 100);
  out += block(-340, -186, 680, 96);
  out += block(-250, -272, 500, 92);
  out += path(
    `M${f(X(-150))} ${f(Y(4))}L${f(X(-62))} ${f(Y(-272))}L${f(X(62))} ${f(Y(-272))}L${f(X(150))} ${f(Y(4))}Z`,
    p.stoneLight,
  );
  for (let k = 1; k < 12; k++) {
    const t = k / 12;
    const yy = 4 - 276 * t;
    const half = 150 - 88 * t;
    out += stroke(`M${f(X(-half))} ${f(Y(yy))}L${f(X(half))} ${f(Y(yy))}`, p.stoneShade, 4 * s);
  }
  out += path(roundRect(X(-130), Y(-360), 260 * s, 96 * s, 12 * s), p.stone);
  out += path(
    `M${f(X(-40))} ${f(Y(-266))}L${f(X(-40))} ${f(Y(-318))}Q${f(X(0))} ${f(Y(-356))} ${f(X(40))} ${f(Y(-318))}L${f(X(40))} ${f(Y(-266))}Z`,
    p.stoneDark,
  );
  out += crown(X(0), Y(-540), 232 * s, 250 * s, p);
  out += path(capsuleV(X(-112), Y(-500), Y(-420), 16 * s), p.stoneShade);
  out += path(capsuleV(X(112), Y(-500), Y(-420), 16 * s), p.stoneShade);
  out += path(roundRect(X(-108), Y(-560), 216 * s, 210 * s, 40 * s), p.stone);
  out += stroke(curve(X(-80), Y(-510), X(80), Y(-510), -8 * s), p.stoneShade, 7 * s);
  out += stroke(curve(X(-66), Y(-480), X(-24), Y(-480), 12 * s), p.stoneDark, 7 * s);
  out += stroke(curve(X(24), Y(-480), X(66), Y(-480), 12 * s), p.stoneDark, 7 * s);
  out += path(ellipse(X(0), Y(-446), 14 * s, 20 * s), p.stoneShade);
  out += path(ellipse(X(-70), Y(-430), 20 * s, 11 * s), p.cheek, ' fill-opacity=".5"');
  out += path(ellipse(X(70), Y(-430), 20 * s, 11 * s), p.cheek, ' fill-opacity=".5"');
  out += stroke(curve(X(-36), Y(-408), X(36), Y(-408), 16 * s), p.stoneDark, 7 * s);
  out += moss(-360, -96, 70);
  out += moss(260, -96, 60);
  out += moss(-220, -186, 64);
  out += moss(170, -272, 52);
  out += moss(-40, -560, 56);
  out += crack(-320, -70);
  out += crack(200, -160);
  out += crack(-180, -250);
  out += fern(X(-300), Y(-186), 0.45 * s, p.fern, p.fernDark);
  out += fern(X(380), Y(-96), 0.5 * s, p.fern, p.fernDark);
  out += liana(X(-410), Y(-92), 80 * s, 0.7 * s, p.vine, p.vineLeaf, 3);
  out += liana(X(320), Y(-182), 110 * s, 0.7 * s, p.vine, p.vineLeaf, 5);
  out += liana(X(-230), Y(-268), 70 * s, 0.6 * s, p.vine, p.vineLeaf, 8);
  out += liana(X(96), Y(-552), 150 * s, 0.6 * s, p.vine, p.vineLeaf, 11);
  out += stroke(`M${f(X(292))} ${f(Y(-318))}L${f(X(296))} ${f(Y(-286))}`, p.trunk, 7 * s);
  out += path(scallop(X(292), Y(-330), 1, 8, 10 * s, 0, 52 * s, 34 * s), p.leavesDark);
  out += path(scallop(X(286), Y(-338), 1, 8, 9 * s, 0, 46 * s, 28 * s), p.leaves);
  out += lantern(X(-215), Y(34), s * 1.35, p, mode);
  out += lantern(X(215), Y(34), s * 1.35, p, mode);
  return out;
}

function capsuleV(x: number, y0: number, y1: number, r: number): string {
  return roundRect(x - r, y0, r * 2, y1 - y0, r);
}

function lantern(x: number, y: number, s: number, p: Palette, mode: Mode): string {
  let out = '';
  if (mode === 'night') {
    out += `<circle cx="${f(x)}" cy="${f(y - 94 * s)}" r="${f(120 * s)}" fill="url(#jgLamp)"/>`;
  }
  out += path(roundRect(x - 26 * s, y - 18 * s, 52 * s, 22 * s, 7 * s), p.stoneShade);
  out += path(roundRect(x - 11 * s, y - 70 * s, 22 * s, 56 * s, 5 * s), p.stone);
  out += path(roundRect(x - 28 * s, y - 120 * s, 56 * s, 54 * s, 12 * s), p.stone);
  out += path(roundRect(x - 15 * s, y - 110 * s, 30 * s, 34 * s, 12 * s), p.stoneDark);
  out += path(ellipse(x, y - 92 * s, 7 * s, 11 * s), p.flame);
  out += path(
    `M${f(x - 40 * s)} ${f(y - 116 * s)}Q${f(x)} ${f(y - 168 * s)} ${f(x + 40 * s)} ${f(y - 116 * s)}Z`,
    p.stoneShade,
  );
  out += path(circle(x, y - 150 * s, 7 * s), p.stone);
  return out;
}

function pillar(x: number, y: number, h: number, s: number, p: Palette): string {
  const w = 58 * s;
  let out = path(roundRect(x - w * 0.8, y - 26 * s, w * 1.6, 30 * s, 8 * s), p.stoneShade);
  out += path(
    `M${f(x - w / 2)} ${f(y - 20 * s)}L${f(x - w / 2)} ${f(y - h)}L${f(x - w * 0.2)} ${f(y - h - 18 * s)}L${f(x + w * 0.05)} ${f(y - h + 6 * s)}L${f(x + w * 0.3)} ${f(y - h - 26 * s)}L${f(x + w / 2)} ${f(y - h - 6 * s)}L${f(x + w / 2)} ${f(y - 20 * s)}Z`,
    p.stone,
  );
  out += path(
    roundRect(x + w * 0.16, y - h + 4 * s, w * 0.34, h - 26 * s, 4 * s),
    p.stoneShade,
    ' fill-opacity=".5"',
  );
  for (const k of [0.3, 0.62]) {
    out += path(roundRect(x - w * 0.56, y - h * k - 7 * s, w * 1.12, 14 * s, 7 * s), p.stoneLight);
  }
  out += path(scallop(x, y - h - 6 * s, 1, 6, 8 * s, 0, w * 0.62, 12 * s), p.moss);
  out += liana(x - w * 0.3, y - h, h * 0.45, 0.6 * s, p.vine, p.vineLeaf, Math.round(x));
  return out;
}

const RIVER: Pt[] = [
  [2760, 978],
  [2600, 1050],
  [2620, 1160],
  [2900, 1280],
  [3040, 1450],
  [2880, 1660],
  [2820, 1880],
  [2800, 2140],
];
const riverR = (u: number) => 14 + 270 * Math.pow(u, 1.35);
const RIVER_PTS = spline(RIVER, 80);

function wet(x: number, y: number, margin = 30): boolean {
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

function river(p: Palette, mode: Mode): string {
  const line = RIVER;
  const r = riverR;
  let out = path(
    tube(line, (u) => r(u) + 10 + 26 * u),
    p.bank,
  );
  out += path(tube(line, r), p.water);
  const pts = spline(line, 80);
  const rr = rng(17);
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
  const pads: [number, number, number][] = [
    [30, 0.4, 0.6],
    [44, -0.5, 0.8],
    [52, 0.45, 0.9],
    [63, -0.4, 1.1],
    [70, 0.5, 1.2],
  ];
  pads.forEach(([i, off, sc], k) => {
    const [px, py] = pts[i];
    const u = i / 80;
    out += lilyPad(px + off * r(u), py, sc, k * 1.7, p.lily, p.lilyDark);
  });
  out += lotus(pts[36][0] - 0.3 * r(0.45), pts[36][1], 1.1, p, mode === 'night');
  out += lotus(pts[58][0] + 0.25 * r(0.72), pts[58][1], 1.4, p, mode === 'night');
  out += lotus(pts[67][0] - 0.55 * r(0.84), pts[67][1], 1.6, p, mode === 'night');
  return out;
}

function steppingStones(p: Palette): string {
  const stones: [number, number, number][] = [
    [1640, 1150, 0.5],
    [1600, 1210, 0.6],
    [1540, 1280, 0.72],
    [1470, 1360, 0.84],
    [1440, 1460, 0.96],
    [1480, 1570, 1.1],
    [1430, 1690, 1.24],
  ];
  return stones
    .map(
      ([x, y, s]) =>
        path(ellipse(x, y + 6 * s, 58 * s, 22 * s), p.stoneShade) +
        path(ellipse(x, y, 56 * s, 20 * s), p.stoneLight),
    )
    .join('');
}

function meadowFlowers(p: Palette): [number, string][] {
  const r = rng(77);
  const out: [number, string][] = [];
  const colors = [p.flowerA, p.flowerB, p.flowerC];
  for (let i = 0; i < 16; i++) {
    const cx = range(r, 60, W - 60);
    const cy = range(r, 1160, 1860);
    const color = colors[i % 3];
    for (let k = 0; k < 3; k++) {
      const x = cx + range(r, -50, 50);
      const y = cy + range(r, -16, 16);
      const sc = range(r, 0.8, 1.15) * (0.7 + (cy - 1100) / 1600);
      if (wet(x, y)) continue;
      out.push([
        y,
        stroke(`M${f(x)} ${f(y)}L${f(x)} ${f(y - 26 * sc)}`, p.grassDark, 4 * sc) +
          flowerHead(x, y - 30 * sc, sc, color, p.flowerCenter),
      ]);
    }
  }
  return out;
}

function flowerHead(x: number, y: number, s: number, petal: string, center: string): string {
  let d = '';
  for (let i = 0; i < 5; i++) {
    const a = (i / 5) * Math.PI * 2 - Math.PI / 2;
    d += circle(x + Math.cos(a) * 8 * s, y + Math.sin(a) * 8 * s, 7 * s);
  }
  return path(d, petal) + path(circle(x, y, 5.5 * s), center);
}

function fireflies(seed: number, count: number): string {
  return scatter(seed, count, 100, W - 100, 1000, 1800, (x, y, r) => {
    const s = range(r, 0.7, 1.2);
    return (
      `<circle cx="${f(x)}" cy="${f(y)}" r="${f(26 * s)}" fill="url(#jgFly)"/>` +
      path(circle(x, y, 4.5 * s), '#fff8c4')
    );
  });
}

const jungle: SceneDef = {
  id: 'jungle',
  world: [W, H],
  horizon: 960,
  ambient: { clouds: 4, stars: 44, fireflies: 22, birds: 3, leaves: 6 },
  defaults: [
    { animal: 'parrot', x: 560, y: 560 },
    { animal: 'snake', x: 820, y: 1480 },
    { animal: 'peacock', x: 1180, y: 1270 },
    { animal: 'monkey', x: 1880, y: 875, flip: true },
    { animal: 'tiger', x: 2200, y: 1440, flip: true },
    { animal: 'crocodile', x: 2560, y: 1700 },
    { animal: 'elephant', x: 3280, y: 1180, flip: true },
  ],
  day: {
    skyTop: '#7cc6ee',
    skyMid: '#bfe6ef',
    skyBottom: '#f4f1c2',
    sun: '#ffd84d',
    sunRay: '#ffc531',
    face: '#8a4b1f',
    karstFar: '#d2e7cf',
    karst: '#b9dbbd',
    karstShade: '#a3cdab',
    karstTop: '#a9d48f',
    treeFar: '#b5d987',
    treeMid: '#9ccd6a',
    ground2: '#c8de6e',
    ground: '#b6d55a',
    groundLight: '#c9e173',
    grass: '#93c444',
    grassDark: '#78ad38',
    trunk: '#9a6a44',
    trunkDark: '#6f4a2c',
    root: '#ad7f55',
    leaves: '#7dbb3e',
    leavesDark: '#5f9e31',
    leavesLight: '#a2d256',
    vine: '#6d9a30',
    vineLeaf: '#8fc449',
    bamboo: '#b8d65c',
    bambooDark: '#98bd47',
    bambooNode: '#7fa13a',
    bambooLeaf: '#86bf44',
    banana: '#ffd84a',
    mango: '#ffae3c',
    ear: '#86c64a',
    earDark: '#6aad3c',
    earVein: '#b5e07a',
    earStem: '#7fb246',
    bananaStem: '#a8c859',
    bananaLeaf: '#8ccb4e',
    bananaLeafDark: '#6daf3c',
    bananaVein: '#b9e27a',
    bud: '#b8466a',
    stone: '#d3c6a8',
    stoneShade: '#b4a688',
    stoneLight: '#e9dfc6',
    stoneDark: '#7f7058',
    moss: '#91c34a',
    mossDark: '#74a83a',
    cheek: '#f2a0a0',
    flame: '#ffb347',
    water: '#5fc4d8',
    waterLight: '#c6f1f4',
    bank: '#d8cf86',
    lily: '#6fb846',
    lilyDark: '#56993a',
    lotus: '#ff9fc4',
    lotusDark: '#f27aa8',
    lotusCenter: '#ffe066',
    hibiscus: '#ff5a6e',
    hibiscusPink: '#ff8cc0',
    hibiscusOrange: '#ffa23f',
    hibiscusDark: '#d93a55',
    hibiscusCenter: '#ffd84a',
    bush: '#7fbe45',
    bushDark: '#629f35',
    bushFar: '#9ccd5c',
    bushFarDark: '#89bf4f',
    trunkFar: '#b39572',
    leavesFar: '#a7d468',
    leavesFarDark: '#93c75a',
    leavesFarLight: '#bde07f',
    flowerA: '#ffffff',
    flowerB: '#ffd23f',
    flowerC: '#ff9ccf',
    flowerCenter: '#ffb03b',
    fern: '#7cbb3f',
    fernDark: '#5f9c31',
    rock: '#c4b69c',
    rockShade: '#a6977c',
    rockLight: '#e3d9c3',
  },
  night: {
    skyTop: '#0b1438',
    skyMid: '#1b2459',
    skyBottom: '#3d3f80',
    sun: '#fff1c0',
    sunRay: '#ffe9a8',
    face: '#7a5a34',
    water: '#28488a',
    waterLight: '#8fb2ee',
    lotus: '#ffc2dc',
    lotusCenter: '#fff2a6',
    hibiscus: '#ff8597',
    hibiscusPink: '#ffb0d4',
    hibiscusOrange: '#ffbf73',
    hibiscusCenter: '#fff2a6',
    flame: '#ffe08a',
    karstFar: '#3f4f93',
    karst: '#384a86',
    karstShade: '#32427a',
    karstTop: '#3a5a80',
    flowerA: '#e8ecff',
    flowerB: '#fff0a0',
    flowerC: '#ffc4e4',
  },
  back: (p, mode) => {
    const night = mode === 'night';
    let out =
      `<defs>${linearGradient('jgSky', [
        [0, p.skyTop],
        [0.55, p.skyMid],
        [1, p.skyBottom],
      ])}${radialGlow('jgLamp', p.flame, 0.7)}${radialGlow('jgFly', '#fff3a0', 0.7)}${radialGlow('jgLotus', p.lotus, 0.55)}</defs>` +
      `<rect width="${W}" height="${H}" fill="url(#jgSky)"/>`;
    out += night
      ? starField(23, 70, 40, 40, W - 40, 700, '#fff6d6') +
        moon(1190, 250, 92, p.sun, p.sunRay, p.face)
      : sun(1190, 250, 100, p.sun, p.sunRay, p.face);
    out += karst(2050, 960, 300, 330, p.karstFar, p.karstFar, p.karstFar);
    out += karst(2600, 960, 260, 420, p.karstFar, p.karstFar, p.karstFar);
    out += karst(3300, 960, 320, 360, p.karstFar, p.karstFar, p.karstFar);
    out += karst(1080, 960, 280, 300, p.karstFar, p.karstFar, p.karstFar);
    out += karst(2300, 960, 300, 260, p.karst, p.karstShade, p.karstTop);
    out += karst(2880, 960, 340, 330, p.karst, p.karstShade, p.karstTop);
    out += karst(3500, 960, 260, 250, p.karst, p.karstShade, p.karstTop);
    out += karst(860, 960, 300, 220, p.karst, p.karstShade, p.karstTop);
    out += treeline(5, 930, 40, 50, 90, p.treeFar);
    out += treeline(9, 975, 30, 40, 70, p.treeMid);
    out += hills(4, 1000, 30, W, H, p.ground2, 7);
    out += hills(8, 1060, 36, W, H, p.ground, 6);
    out += scatter(31, 14, 0, W, 1120, 1900, (x, y, r) =>
      path(ellipse(x, y, 130 + r() * 150, 30 + r() * 24), p.groundLight, ' fill-opacity=".8"'),
    );
    for (const [sx, sy, rx] of [
      [430, 1118, 330],
      [3330, 1158, 300],
      [2470, 1056, 160],
      [1640, 1108, 460],
    ]) {
      out += path(ellipse(sx, sy, rx, rx * 0.12), p.grassDark, ' fill-opacity=".22"');
    }
    out += steppingStones(p);
    out += river(p, mode);
    const haze: Palette = {
      ...p,
      trunk: p.trunkFar,
      leaves: p.leavesFar,
      leavesDark: p.leavesFarDark,
      leavesLight: p.leavesFarLight,
    };
    out += jungleTree(1180, 1010, 0.42, haze, 51, false, false);
    out += jungleTree(2150, 1000, 0.38, haze, 53, false, false);
    out += jungleTree(3080, 1005, 0.4, haze, 57, false, false);
    out += jungleTree(60, 1000, 0.36, haze, 59, false, false);
    out += scatter(83, 26, -40, W + 40, 1040, 1075, (x, y, r) =>
      bush(x, y, 0.7 + r() * 0.5, p.bushFar, p.bushFarDark),
    );
    out += layered([
      [1040, jungleTree(2470, 1050, 0.55, p, 41)],
      [1110, jungleTree(430, 1110, 1, p, 11, true)],
      [1100, temple(1640, 1100, 0.85, p, mode)],
      [1080, bamboo(950, 1080, 1, p, 5)],
      [1130, bamboo(3560, 1130, 0.9, p, 9)],
      [1150, jungleTree(3330, 1150, 0.9, p, 29, false, true, p.mango)],
      [1120, pillar(1080, 1120, 220, 1, p)],
      [1140, pillar(2150, 1140, 140, 1, p)],
      [1200, bananaPlant(2290, 1200, 0.95, p, true)],
      [1260, bananaPlant(3480, 1260, 1.1, p, true)],
      [1210, bananaPlant(160, 1210, 1, p)],
      [1300, hibiscusBush(760, 1300, 0.9, p, 3)],
      [1520, hibiscusBush(1060, 1520, 1.1, p, 21)],
      [1400, elephantEar(170, 1400, 1, p)],
      [1290, elephantEar(2140, 1290, 0.75, p)],
      [1660, elephantEar(3560, 1660, 0.95, p)],
      [1240, hibiscusBush(2400, 1240, 0.8, p, 7)],
      [1600, hibiscusBush(3420, 1600, 1, p, 13)],
      [1220, rock(2560, 1220, 1, p.rock, p.rockShade, p.rockLight)],
      [1520, rock(3150, 1520, 1.3, p.rock, p.rockShade, p.rockLight)],
      [1340, fern(1960, 1340, 0.9, p.fern, p.fernDark)],
      [1450, fern(300, 1450, 1.1, p.fern, p.fernDark)],
      ...meadowFlowers(p),
      ...scatterDry(12, 46, 1120, 1900, (x, y, r) =>
        tuft(x, y, 0.8 + r() * 0.6, r() < 0.5 ? p.grass : p.grassDark),
      ),
      ...scatterDry(19, 10, 1150, 1850, (x, y, r) =>
        tallGrass(x, y, 0.6 + r() * 0.4, p.grass, p.grassDark),
      ),
    ]);
    if (night) out += fireflies(61, 18);
    return out;
  },
  front: (p) =>
    bigLeaf(40, 2010, 1.3, -60, p.leaves, p.leavesDark) +
    bigLeaf(30, 2020, 1.1, -25, p.leavesDark, p.leaves) +
    hibiscus(150, 1958, 1.5, p.hibiscus, p.hibiscusDark, p.hibiscusCenter) +
    fern(340, 2024, 1.3, p.fern, p.fernDark) +
    tallGrass(1100, 2010, 1.5, p.grass, p.grassDark) +
    fern(1900, 2024, 1.2, p.fern, p.fernDark) +
    tallGrass(2480, 2010, 1.4, p.grass, p.grassDark) +
    fern(3240, 2024, 1.25, p.fern, p.fernDark) +
    bigLeaf(3580, 2010, 1.3, -120, p.leaves, p.leavesDark) +
    bigLeaf(3590, 2020, 1.1, -155, p.leavesDark, p.leaves) +
    hibiscus(3460, 1962, 1.4, p.hibiscusPink, p.hibiscusDark, p.hibiscusCenter),
};

export default jungle;
