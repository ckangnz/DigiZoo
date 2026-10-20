import { mix } from '../core/color';
import {
  circle,
  curve,
  ellipse,
  f,
  leaf,
  poly,
  roundRect,
  scallop,
  smooth,
  spline,
  translatePath,
  tube,
  type Pt,
} from '../core/paths';
import {
  flower,
  grassTuft,
  group,
  layered,
  linearGradient,
  path,
  radialGlow,
  starField,
  stroke,
  sun,
} from './props';
import { nightColor } from './render';
import { range, rng } from './rng';
import type { Interactive, Mode, Palette, SceneDef } from './types';

const W = 3600;
const H = 2000;

const groundY = (x: number): number => 1095 + 10 * Math.sin(x / 260 + 1);
const hillY = (x: number): number => 1110 - 210 * Math.exp(-(((x - 1250) / 460) ** 4));
const midY = (x: number): number => 1010 + 16 * Math.sin(x / 210 + 2) + 8 * Math.sin(x / 90);
const farY = (x: number): number => 930 + 26 * Math.sin(x / 380 + 1) + 12 * Math.sin(x / 150 + 3);
const farthestY = (x: number): number => 868 + 38 * Math.sin(x / 520) + 18 * Math.sin(x / 190 + 1);

const glowAt = (x: number, y: number, r: number, id: string): string =>
  `<circle cx="${f(x)}" cy="${f(y)}" r="${f(r)}" fill="url(#${id})"/>`;

function land(fn: (x: number) => number, color: string): string {
  const pts: Pt[] = [];
  for (let x = -200; x <= W + 200; x += 100) pts.push([x, fn(x)]);
  return path(`${smooth(pts, false)}L${W + 200} ${H + 60}L-200 ${H + 60}Z`, color);
}

function curl(
  x: number,
  y: number,
  angle: number,
  len: number,
  twist: number,
  shrink = 0.6,
  n = 24,
): Pt[] {
  const pts: Pt[] = [[x, y]];
  const a0 = (angle * Math.PI) / 180;
  let px = x;
  let py = y;
  for (let i = 1; i <= n; i++) {
    const t = (i - 0.5) / n;
    const a = a0 + twist * t ** 2.4;
    const step = (len / n) * (1 + shrink * (0.5 - t));
    px += Math.cos(a) * step;
    py += Math.sin(a) * step;
    pts.push([px, py]);
  }
  return pts;
}

function arch(cx: number, bottom: number, w: number, h: number): string {
  const r = w / 2;
  return `M${f(cx - r)} ${f(bottom)}L${f(cx - r)} ${f(bottom - h + r)}A${f(r)} ${f(r)} 0 0 1 ${f(cx + r)} ${f(bottom - h + r)}L${f(cx + r)} ${f(bottom)}Z`;
}

function scallopRow(x0: number, x1: number, y: number, w: number): string {
  let d = `M${f(x0)} ${f(y)}`;
  for (let x = x0; x < x1; x += w) d += `a${f(w / 2)} ${f(w * 0.42)} 0 0 0 ${f(w)} 0`;
  return d;
}

function witchHat(l: Pt, r: Pt, tip: Pt, bulge: number): string {
  const ml: Pt = [l[0] + (tip[0] - l[0]) * 0.55 + bulge, l[1] + (tip[1] - l[1]) * 0.3];
  const mr: Pt = [r[0] + (tip[0] - r[0]) * 0.55 - bulge, r[1] + (tip[1] - r[1]) * 0.3];
  return `M${f(l[0])} ${f(l[1])}Q${f(ml[0])} ${f(ml[1])} ${f(tip[0])} ${f(tip[1])}Q${f(mr[0])} ${f(mr[1])} ${f(r[0])} ${f(r[1])}Z`;
}

function windowPane(
  cx: number,
  cy: number,
  w: number,
  h: number,
  p: Palette,
  shape: 'arch' | 'round' | 'square',
  rot = 0,
  fw = 7,
): string {
  let frame: string;
  let glass: string;
  if (shape === 'round') {
    frame = circle(cx, cy, w / 2 + fw);
    glass = circle(cx, cy, w / 2);
  } else if (shape === 'arch') {
    frame = arch(cx, cy + h / 2 + fw, w + fw * 2, h + fw * 2);
    glass = arch(cx, cy + h / 2, w, h);
  } else {
    frame = roundRect(cx - w / 2 - fw, cy - h / 2 - fw, w + fw * 2, h + fw * 2, fw);
    glass = roundRect(cx - w / 2, cy - h / 2, w, h, fw * 0.6);
  }
  const bar = shape === 'arch' ? cy + h * 0.1 : cy;
  const out =
    path(frame, p.windowFrame) +
    path(glass, p.window) +
    path(ellipse(cx, cy + h * 0.1, w * 0.26, h * 0.24), p.windowCore) +
    stroke(
      `M${f(cx)} ${f(cy - h / 2)}L${f(cx)} ${f(cy + h / 2)}M${f(cx - w / 2)} ${f(bar)}L${f(cx + w / 2)} ${f(bar)}`,
      p.windowFrame,
      fw * 0.7,
    );
  return rot ? group(out, `rotate(${rot} ${f(cx)} ${f(cy)})`) : out;
}

function candle(
  x: number,
  y: number,
  h: number,
  s: number,
  p: Palette,
  mode: Mode,
  glowId: string,
): string {
  const w = 16 * s;
  return (
    (mode === 'night' ? glowAt(x, y - h - 12 * s, 46 * s, glowId) : '') +
    path(roundRect(x - w / 2, y - h, w, h, 4 * s), p.candle) +
    path(roundRect(x + w * 0.08, y - h, w * 0.42, h, 3 * s), p.candleShade) +
    path(circle(x - w * 0.22, y - h + 7 * s, 4 * s), p.candle) +
    path(roundRect(x - w * 0.36, y - h, w * 0.28, 12 * s, 2.5 * s), p.candle) +
    stroke(`M${f(x)} ${f(y - h)}L${f(x)} ${f(y - h - 6 * s)}`, p.trim, 2.2 * s) +
    path(leaf(x, y - h - 2 * s, 24 * s, 7.5 * s, -90), p.flame) +
    path(leaf(x, y - h - 4 * s, 12 * s, 4 * s, -90), p.flameCore)
  );
}

function pumpkinBody(
  x: number,
  y: number,
  r: number,
  c: string,
  dark: string,
  light: string,
): string {
  const cy = y - r * 0.64;
  return (
    path(ellipse(x - r * 0.48, cy + r * 0.02, r * 0.54, r * 0.6), dark) +
    path(ellipse(x + r * 0.48, cy + r * 0.02, r * 0.54, r * 0.6), dark) +
    path(ellipse(x - r * 0.25, cy - r * 0.01, r * 0.5, r * 0.64), c) +
    path(ellipse(x + r * 0.25, cy - r * 0.01, r * 0.5, r * 0.64), c) +
    path(ellipse(x, cy - r * 0.02, r * 0.34, r * 0.66), light) +
    stroke(curve(x - r * 0.2, y - r * 1.18, x - r * 0.2, y - r * 0.1, r * 0.1), dark, r * 0.05) +
    stroke(curve(x + r * 0.2, y - r * 1.18, x + r * 0.2, y - r * 0.1, -r * 0.1), dark, r * 0.05) +
    path(
      ellipse(x - r * 0.62, y - r * 0.9, r * 0.09, r * 0.18, 25),
      '#ffffff',
      ' fill-opacity=".35"',
    )
  );
}

function pumpkinTop(x: number, y: number, r: number, p: Palette): string {
  const top = y - r * 1.24;
  return (
    path(
      tube(
        [
          [x - r * 0.02, top + r * 0.06],
          [x + r * 0.03, top - r * 0.14],
          [x + r * 0.14, top - r * 0.26],
        ],
        (u) => r * (0.1 - 0.035 * u),
      ),
      p.stem,
    ) +
    path(leaf(x + r * 0.06, top - r * 0.04, r * 0.44, r * 0.15, -18), p.vineLeaf) +
    stroke(
      smooth(curl(x - r * 0.04, top - r * 0.04, -170, r * 0.5, -7, 0.9), false),
      p.vine,
      r * 0.04,
    )
  );
}

function pumpkin(x: number, y: number, r: number, p: Palette): string {
  return pumpkinBody(x, y, r, p.pumpkin, p.pumpkinDark, p.pumpkinLight) + pumpkinTop(x, y, r, p);
}

type Face = 'grin' | 'boo' | 'happy';

function carved(d: string, r: number, p: Palette): string {
  return path(translatePath(d, r * 0.02, r * 0.035), p.carveRim) + path(d, p.carve);
}

function jackFace(x: number, y: number, r: number, face: Face, p: Palette): string {
  const ey = y - r * 0.78;
  const my = y - r * 0.44;
  const round = (color: string, w: number) =>
    ` stroke="${color}" stroke-width="${f(w)}" stroke-linejoin="round" stroke-linecap="round"`;
  let out = '';
  if (face === 'grin') {
    for (const side of [-1, 1]) {
      const ex = x + side * r * 0.34;
      const tri = poly([
        [ex - r * 0.13, ey + r * 0.09],
        [ex + side * r * 0.02, ey - r * 0.14],
        [ex + r * 0.13, ey + r * 0.09],
      ]);
      out +=
        path(translatePath(tri, r * 0.02, r * 0.035), p.carveRim, round(p.carveRim, r * 0.08)) +
        path(tri, p.carve, round(p.carve, r * 0.08));
      out += path(circle(ex, ey + r * 0.02, r * 0.045), p.carveCore);
    }
    const mouth = `M${f(x - r * 0.5)} ${f(my - r * 0.04)}Q${f(x)} ${f(my + r * 0.46)} ${f(x + r * 0.5)} ${f(my - r * 0.04)}Q${f(x)} ${f(my + r * 0.16)} ${f(x - r * 0.5)} ${f(my - r * 0.04)}Z`;
    out += carved(mouth, r, p);
    out += path(roundRect(x - r * 0.07, my + r * 0.04, r * 0.14, r * 0.13, r * 0.04), p.jack);
    out += path(ellipse(x - r * 0.24, my + r * 0.14, r * 0.1, r * 0.04, 18), p.carveCore);
  } else if (face === 'boo') {
    for (const side of [-1, 1]) {
      const ex = x + side * r * 0.32;
      out += carved(ellipse(ex, ey, r * 0.12, r * 0.16), r, p);
      out += path(circle(ex + r * 0.03, ey - r * 0.05, r * 0.04), p.carveCore);
    }
    out += carved(ellipse(x, my + r * 0.06, r * 0.15, r * 0.18), r, p);
    out += path(ellipse(x, my + r * 0.1, r * 0.07, r * 0.08), p.carveCore);
  } else {
    for (const side of [-1, 1]) {
      const ex = x + side * r * 0.33;
      const d = curve(ex - r * 0.14, ey + r * 0.05, ex + r * 0.14, ey + r * 0.05, -r * 0.16);
      out += stroke(translatePath(d, r * 0.02, r * 0.035), p.carveRim, r * 0.1);
      out += stroke(d, p.carve, r * 0.1);
    }
    const mouth = `M${f(x - r * 0.38)} ${f(my - r * 0.06)}Q${f(x)} ${f(my - r * 0.02)} ${f(x + r * 0.38)} ${f(my - r * 0.06)}Q${f(x + r * 0.3)} ${f(my + r * 0.38)} ${f(x)} ${f(my + r * 0.36)}Q${f(x - r * 0.3)} ${f(my + r * 0.38)} ${f(x - r * 0.38)} ${f(my - r * 0.06)}Z`;
    out += carved(mouth, r, p);
    out += path(ellipse(x, my + r * 0.2, r * 0.16, r * 0.08), p.carveCore);
  }
  out += path(
    ellipse(x - r * 0.64, y - r * 0.56, r * 0.13, r * 0.07),
    p.blush,
    ' fill-opacity=".5"',
  );
  out += path(
    ellipse(x + r * 0.64, y - r * 0.56, r * 0.13, r * 0.07),
    p.blush,
    ' fill-opacity=".5"',
  );
  return out;
}

function jackOLantern(
  x: number,
  y: number,
  r: number,
  face: Face,
  id: string,
  p: Palette,
  mode: Mode,
): string {
  const night = mode === 'night';
  return (
    `<defs>${radialGlow(id, p.carveGlow, night ? 0.7 : 0.3)}</defs>` +
    glowAt(x, y - r * 0.62, r * 1.2, id) +
    path(ellipse(x, y + r * 0.02, r * 0.9, r * 0.12), p.grass, ' fill-opacity=".6"') +
    pumpkinBody(x, y, r, p.jack, p.jackDark, p.jackLight) +
    pumpkinTop(x, y, r, p) +
    jackFace(x, y, r, face, p)
  );
}

function sweep(
  x: number,
  y: number,
  angle: number,
  len: number,
  bend: number,
  curlR: number,
  turns: number,
  side: number,
): Pt[] {
  const pts: Pt[] = [[x, y]];
  let a = (angle * Math.PI) / 180;
  let px = x;
  let py = y;
  const n = 16;
  for (let i = 1; i <= n; i++) {
    a += bend / n;
    px += (Math.cos(a) * len) / n;
    py += (Math.sin(a) * len) / n;
    pts.push([px, py]);
  }
  const cx = px - Math.sin(a) * side * curlR;
  const cy = py + Math.cos(a) * side * curlR;
  const start = Math.atan2(py - cy, px - cx);
  const m = 24;
  for (let k = 1; k <= m; k++) {
    const u = k / m;
    const th = start + side * u * turns * Math.PI * 2;
    const rr = curlR * (1 - 0.68 * u);
    pts.push([cx + Math.cos(th) * rr, cy + Math.sin(th) * rr]);
  }
  return pts;
}

function curlyTree(x: number, y: number, s: number, p: Palette, dir: 1 | -1, seed: number): string {
  const r = rng(seed);
  const P = (dx: number, dy: number): Pt => [x + dx * s * dir, y + dy * s];
  const limb = (
    from: Pt,
    ang: number,
    len: number,
    bend: number,
    curlR: number,
    side: number,
    r0: number,
  ) => {
    const pts = sweep(
      from[0],
      from[1],
      dir === 1 ? ang : 180 - ang,
      len * s,
      bend * dir,
      curlR * s,
      1.1,
      side * dir,
    );
    return {
      pts,
      svg: path(
        tube(pts, (u) => Math.max(3 * s, r0 * s * (1 - 0.84 * u))),
        p.trunk,
      ),
    };
  };
  const a = limb(P(-4, -300), -162, 230, 0.75, 36, -1, 20);
  const b = limb(P(6, -296), -18, 230, -0.75, 36, 1, 20);
  const c = limb(P(0, -318), -100, 180, 0.45, 30, 1, 16);
  const d = limb(P(-8, -214), -178, 170, 0.55, 27, -1, 14);
  const e = limb(P(8, -190), -2, 160, -0.55, 27, 1, 13);
  const twigs = [
    limb(a.pts[8], -112, 84, 0.3, 19, 1, 8),
    limb(b.pts[8], -68, 84, -0.3, 19, -1, 8),
    limb(c.pts[9], -150, 66, -0.2, 15, -1, 6),
    limb(d.pts[9], -118, 56, 0.2, 14, 1, 6),
    limb(e.pts[9], -62, 56, -0.2, 14, -1, 6),
  ];
  let out = path(ellipse(x, y + 6 * s, 130 * s, 16 * s), p.grass, ' fill-opacity=".5"');
  out += path(
    smooth(
      [
        P(-82, 8),
        P(-52, -6),
        P(-36, -42),
        P(-32, -110),
        P(30, -110),
        P(36, -42),
        P(54, -6),
        P(86, 8),
      ],
      false,
    ) + 'Z',
    p.trunk,
  );
  out += path(ellipse(...P(-72, 4), 24 * s, 9 * s), p.trunk);
  out += path(ellipse(...P(76, 5), 26 * s, 9 * s), p.trunk);
  out += path(
    tube([P(0, -60), P(-12, -150), P(8, -250), P(0, -318)], (u) => (40 - 18 * u) * s),
    p.trunk,
  );
  out += [a, b, c, d, e, ...twigs].map((l) => l.svg).join('');
  out += stroke(
    smooth([P(14, -10), P(20, -90), P(6, -170), P(16, -270)], false),
    p.trunkDark,
    5 * s,
    ' stroke-opacity=".6"',
  );
  out += stroke(
    smooth([P(-20, -40), P(-14, -120), P(-24, -200)], false),
    p.trunkDark,
    4 * s,
    ' stroke-opacity=".5"',
  );
  const [hx, hy] = P(8, -132);
  out += path(ellipse(hx, hy, 20 * s, 27 * s), p.trunkDark);
  out += path(ellipse(hx + 1 * s * dir, hy + 2 * s, 13 * s, 19 * s), p.hole);
  const colors = [p.leafOrange, p.leafYellow, p.leafRed];
  const spots: Pt[] = [
    a.pts[11],
    a.pts[17],
    b.pts[12],
    b.pts[18],
    c.pts[15],
    d.pts[14],
    e.pts[13],
    twigs[0].pts[14],
    twigs[1].pts[14],
  ];
  spots.forEach(([lx, ly], i) => {
    const ang = 90 + range(r, -40, 40);
    out += stroke(`M${f(lx)} ${f(ly)}L${f(lx)} ${f(ly + 9 * s)}`, p.trunk, 3 * s);
    out += path(leaf(lx, ly + 7 * s, 38 * s, 14 * s, ang), colors[i % 3]);
  });
  return out;
}

function hauntedHouse(cx: number, by: number, p: Palette, mode: Mode): string {
  const night = mode === 'night';
  const P = (dx: number, dy: number): Pt => [cx + dx, by + dy];
  const roofD = witchHat(P(-208, -280), P(218, -298), P(26, -566), 46);
  const towerD = witchHat(P(-292, -398), P(-116, -408), P(-222, -640), 18);
  const wingD = witchHat(P(138, -184), P(288, -194), P(222, -334), 14);
  const chimneyD = poly([P(110, -330), P(116, -486), P(166, -492), P(160, -330)]);
  const windows: [number, number, number, number, 'arch' | 'round', number][] = [
    [-96, -104, 60, 84, 'arch', 0],
    [98, -102, 60, 84, 'arch', 0],
    [-90, -240, 54, 70, 'arch', -6],
    [104, -246, 54, 70, 'arch', 5],
    [24, -404, 56, 56, 'round', 0],
    [-204, -318, 40, 70, 'arch', -2],
    [-202, -196, 38, 38, 'round', 0],
    [214, -98, 44, 58, 'arch', 3],
  ];
  let bricks = '';
  for (let row = 0; row < 7; row++) {
    const yy = by - 350 - row * 20;
    for (let i = 0; i < 3; i++) {
      bricks += path(
        roundRect(cx + 108 + (row % 2) * 14 + i * 26, yy, 22, 14, 4),
        row % 2 ? p.brickLight : p.brick,
      );
    }
  }
  let out = `<defs><clipPath id="hwRoofClip"><path d="${roofD}"/></clipPath><clipPath id="hwTowerClip"><path d="${towerD}"/></clipPath><clipPath id="hwWingClip"><path d="${wingD}"/></clipPath><clipPath id="hwChimneyClip"><path d="${chimneyD}"/></clipPath>${radialGlow(`hwHouseGlow${mode}`, p.windowGlow, night ? 0.75 : 0.4)}</defs>`;
  out += path(poly([P(148, 30), P(154, -194), P(270, -202), P(264, 30)]), p.wallSide);
  out += path(wingD, p.roof);
  out += group(
    [-170, -210, -250, -290]
      .map((dy) => stroke(scallopRow(cx + 130, cx + 300, by + dy, 30), p.roofLight, 4))
      .join(''),
    '',
    ' clip-path="url(#hwWingClip)"',
  );
  out += path(chimneyD, p.brickDark);
  out += group(bricks, '', ' clip-path="url(#hwChimneyClip)"');
  out += path(roundRect(cx + 104, by - 510, 68, 24, 9), p.trim);
  out += path(poly([P(-170, 30), P(-162, -300), P(178, -314), P(172, 30)]), p.wall);
  for (let dy = -40; dy > -300; dy -= 36) {
    out += stroke(
      `M${f(cx - 164)} ${f(by + dy)}L${f(cx + 172)} ${f(by + dy - 6)}`,
      p.wallShade,
      4,
      ' stroke-opacity=".5"',
    );
  }
  out += path(roundRect(cx - 180, by - 174, 362, 18, 9), p.trim);
  out += path(roofD, p.roof);
  out += group(
    [-300, -336, -372, -408, -444, -480, -516]
      .map((dy) => stroke(scallopRow(cx - 230, cx + 240, by + dy, 34), p.roofLight, 4.5))
      .join(''),
    '',
    ' clip-path="url(#hwRoofClip)"',
  );
  out += path(circle(cx + 26, by - 574, 9), p.trim);
  out += path(poly([P(-262, 30), P(-256, -404), P(-148, -414), P(-144, 30)]), p.wall);
  for (let dy = -50; dy > -400; dy -= 40) {
    out += stroke(
      `M${f(cx - 258)} ${f(by + dy)}L${f(cx - 146)} ${f(by + dy - 3)}`,
      p.wallShade,
      4,
      ' stroke-opacity=".5"',
    );
  }
  out += path(towerD, p.roof);
  out += group(
    [-430, -470, -510, -550, -590]
      .map((dy) => stroke(scallopRow(cx - 300, cx - 100, by + dy, 28), p.roofLight, 4))
      .join(''),
    '',
    ' clip-path="url(#hwTowerClip)"',
  );
  out += path(
    tube(curl(cx - 222, by - 634, -100, 84, -6.5, 0.8), (u) => Math.max(2.5, 9 - 7 * u)),
    p.roof,
  );
  out += windows
    .map(([dx, dy, w, h]) =>
      glowAt(cx + dx, by + dy, Math.max(w, h) * (night ? 1.05 : 0.8), `hwHouseGlow${mode}`),
    )
    .join('');
  out += windows
    .map(([dx, dy, w, h, shape, rot]) => windowPane(cx + dx, by + dy, w, h, p, shape, rot))
    .join('');
  for (const [dx, dy, rot] of [
    [-90, -240, -6],
    [104, -246, 5],
  ]) {
    for (const side of [-1, 1]) {
      out += group(
        path(roundRect(cx + dx + side * 44 - 11, by + dy - 40, 22, 80, 4), p.roof) +
          stroke(
            `M${f(cx + dx + side * 44)} ${f(by + dy - 30)}L${f(cx + dx + side * 44)} ${f(by + dy + 30)}`,
            p.roofLight,
            3,
          ),
        `rotate(${rot + side * 4} ${f(cx + dx)} ${f(by + dy)})`,
      );
    }
  }
  out += path(arch(cx, by + 10, 106, 150), p.trim);
  out += path(arch(cx, by + 10, 84, 136), p.door);
  for (const dx of [-21, 0, 21]) {
    out += stroke(`M${f(cx + dx)} ${f(by + 6)}L${f(cx + dx)} ${f(by - 100)}`, p.doorDark, 4);
  }
  out += path(circle(cx, by - 94, 14), p.windowFrame) + path(circle(cx, by - 94, 10), p.window);
  out += path(circle(cx + 26, by - 52, 6), p.window);
  if (night) {
    out += `<ellipse cx="${f(cx)}" cy="${f(by + 40)}" rx="150" ry="34" fill="url(#hwHouseGlow${mode})"/>`;
  }
  out += path(roundRect(cx - 186, by - 6, 372, 36, 10), p.stoneShade);
  for (let i = 0; i < 9; i++) {
    out += path(roundRect(cx - 180 + i * 41, by + 2, 34, 12, 5), p.stone, ' fill-opacity=".7"');
  }
  out += path(roundRect(cx - 76, by + 8, 152, 20, 8), p.stoneShade);
  out += path(roundRect(cx - 62, by - 4, 124, 16, 7), p.stone);
  out += path(scallop(cx - 216, by + 22, 1, 7, 10, 180, 74, 34), p.bushDark);
  out += path(scallop(cx + 214, by + 22, 1, 7, 10, 180, 70, 32), p.bushDark);
  out += path(scallop(cx - 212, by + 20, 1, 7, 9, 180, 64, 28), p.bush);
  out += path(scallop(cx + 210, by + 20, 1, 7, 9, 180, 60, 26), p.bush);
  out += candle(cx - 104, by + 22, 36, 1, p, mode, `hwHouseGlow${mode}`);
  out += candle(cx - 82, by + 24, 22, 0.85, p, mode, `hwHouseGlow${mode}`);
  out += candle(cx + 98, by + 24, 30, 0.95, p, mode, `hwHouseGlow${mode}`);
  return out;
}

function fullMoon(x: number, y: number, r: number, p: Palette): string {
  const crater = (dx: number, dy: number, rr: number) =>
    path(circle(x + dx * r, y + dy * r, rr * r), p.moonShade, ' fill-opacity=".7"');
  return (
    `<defs>${radialGlow('hwMoonGlow', p.moonGlow, 0.55)}</defs>` +
    glowAt(x, y, r * 1.95, 'hwMoonGlow') +
    path(circle(x, y, r * 1.1), p.moonGlow, ' fill-opacity=".25"') +
    path(circle(x, y, r), p.moon) +
    crater(0.5, -0.52, 0.15) +
    crater(-0.56, -0.44, 0.09) +
    crater(0.66, 0.2, 0.1) +
    crater(-0.22, 0.68, 0.08) +
    crater(0.2, -0.78, 0.06) +
    stroke(
      curve(x - r * 0.46, y - r * 0.02, x - r * 0.18, y - r * 0.02, -r * 0.14),
      p.face,
      r * 0.065,
    ) +
    stroke(
      curve(x + r * 0.18, y - r * 0.02, x + r * 0.46, y - r * 0.02, -r * 0.14),
      p.face,
      r * 0.065,
    ) +
    path(ellipse(x - r * 0.48, y + r * 0.2, r * 0.13, r * 0.075), p.blush, ' fill-opacity=".45"') +
    path(ellipse(x + r * 0.48, y + r * 0.2, r * 0.13, r * 0.075), p.blush, ' fill-opacity=".45"') +
    stroke(
      curve(x - r * 0.18, y + r * 0.24, x + r * 0.18, y + r * 0.24, r * 0.15),
      p.face,
      r * 0.06,
    )
  );
}

function potionWell(x: number, y: number, s: number, p: Palette, mode: Mode): string {
  const night = mode === 'night';
  const X = (d: number) => x + d * s;
  const Y = (d: number) => y + d * s;
  const belly = smooth(
    [
      [X(-98), Y(-168)],
      [X(-122), Y(-112)],
      [X(-108), Y(-40)],
      [X(-60), Y(-6)],
      [X(60), Y(-6)],
      [X(108), Y(-40)],
      [X(122), Y(-112)],
      [X(98), Y(-168)],
    ],
    true,
    0.9,
  );
  let stones = '';
  for (let row = 0; row < 5; row++) {
    const yy = Y(-160 + row * 32);
    const off = row % 2 ? 22 : 0;
    for (let i = -4; i <= 4; i++) {
      stones += path(
        roundRect(X(off + i * 48), yy, 42 * s, 26 * s, 9 * s),
        row % 2 ? p.stoneLight : p.stone,
      );
    }
  }
  let bubbles = '';
  for (const [dx, dy, rr] of [
    [-40, -196, 10],
    [-6, -214, 14],
    [34, -200, 9],
    [16, -238, 7],
    [-26, -232, 6],
  ]) {
    bubbles +=
      path(circle(X(dx), Y(dy), rr * s), p.potionLight, ' fill-opacity=".85"') +
      path(
        circle(X(dx - rr * 0.35), Y(dy - rr * 0.35), rr * 0.3 * s),
        '#ffffff',
        ' fill-opacity=".8"',
      );
  }
  return (
    `<defs>${radialGlow(`hwPotionGlow${mode}`, p.potionGlow, night ? 0.75 : 0.4)}<clipPath id="hwWellClip"><path d="${belly}"/></clipPath></defs>` +
    path(ellipse(X(0), Y(4), 130 * s, 16 * s), p.grass, ' fill-opacity=".5"') +
    path(roundRect(X(-112), Y(-334), 20 * s, 190 * s, 7 * s), p.woodDark) +
    path(roundRect(X(92), Y(-334), 20 * s, 190 * s, 7 * s), p.woodDark) +
    path(roundRect(X(-104), Y(-312), 208 * s, 14 * s, 7 * s), p.wood) +
    stroke(`M${f(X(40))} ${f(Y(-306))}L${f(X(40))} ${f(Y(-250))}`, p.rope, 4 * s) +
    path(
      `M${f(X(22))} ${f(Y(-252))}L${f(X(58))} ${f(Y(-252))}L${f(X(54))} ${f(Y(-216))}L${f(X(26))} ${f(Y(-216))}Z`,
      p.wood,
    ) +
    stroke(curve(X(20), Y(-252), X(60), Y(-252), -16 * s), p.iron, 3 * s) +
    path(witchHat([X(-150), Y(-318)], [X(150), Y(-318)], [X(4), Y(-420)], 20 * s), p.roof) +
    path(roundRect(X(-154), Y(-326), 308 * s, 16 * s, 8 * s), p.trim) +
    glowAt(X(0), Y(-180), 150 * s, `hwPotionGlow${mode}`) +
    path(ellipse(X(-70), Y(2), 22 * s, 12 * s), p.iron) +
    path(ellipse(X(70), Y(2), 22 * s, 12 * s), p.iron) +
    path(belly, p.stoneShade) +
    group(stones, '', ' clip-path="url(#hwWellClip)"') +
    path(ellipse(X(0), Y(-170), 112 * s, 28 * s), p.stoneShade) +
    path(ellipse(X(0), Y(-174), 104 * s, 24 * s), p.stoneLight) +
    path(ellipse(X(0), Y(-174), 86 * s, 16 * s), p.potion) +
    path(ellipse(X(-20), Y(-177), 40 * s, 6 * s), p.potionLight, ' fill-opacity=".8"') +
    path(
      `M${f(X(-64))} ${f(Y(-166))}Q${f(X(-68))} ${f(Y(-140))} ${f(X(-58))} ${f(Y(-136))}Q${f(X(-48))} ${f(Y(-140))} ${f(X(-50))} ${f(Y(-166))}Z`,
      p.potion,
    ) +
    path(
      `M${f(X(44))} ${f(Y(-164))}Q${f(X(42))} ${f(Y(-150))} ${f(X(50))} ${f(Y(-148))}Q${f(X(58))} ${f(Y(-150))} ${f(X(56))} ${f(Y(-164))}Z`,
      p.potion,
    ) +
    bubbles
  );
}

function lampPost(x: number, y: number, s: number, p: Palette, mode: Mode): string {
  const night = mode === 'night';
  const X = (d: number) => x + d * s;
  const Y = (d: number) => y + d * s;
  const lx = X(74);
  return (
    `<defs>${radialGlow(`hwLampGlow${mode}`, p.windowGlow, night ? 0.8 : 0.4)}</defs>` +
    path(ellipse(X(0), Y(2), 46 * s, 10 * s), p.grass, ' fill-opacity=".6"') +
    (night
      ? `<ellipse cx="${f(lx)}" cy="${f(Y(2))}" rx="${f(96 * s)}" ry="${f(22 * s)}" fill="url(#hwLampGlow${mode})"/>`
      : '') +
    path(roundRect(X(-28), Y(-26), 56 * s, 30 * s, 10 * s), p.iron) +
    path(roundRect(X(-9), Y(-290), 18 * s, 270 * s, 8 * s), p.iron) +
    path(roundRect(X(-16), Y(-130), 32 * s, 12 * s, 6 * s), p.ironLight) +
    path(roundRect(X(-14), Y(-232), 28 * s, 10 * s, 5 * s), p.ironLight) +
    stroke(
      `M${f(X(0))} ${f(Y(-280))}Q${f(X(4))} ${f(Y(-318))} ${f(X(40))} ${f(Y(-318))}L${f(lx)} ${f(Y(-318))}`,
      p.iron,
      9 * s,
    ) +
    stroke(smooth(curl(X(6), Y(-262), -10, 60 * s, -7, 0.9), false), p.iron, 5 * s) +
    stroke(smooth(curl(X(-4), Y(-300), -150, 44 * s, 7, 0.9), false), p.iron, 5 * s) +
    path(circle(X(0), Y(-300), 11 * s), p.iron) +
    stroke(`M${f(lx)} ${f(Y(-318))}L${f(lx)} ${f(Y(-296))}`, p.iron, 4 * s) +
    glowAt(lx, Y(-240), 96 * s, `hwLampGlow${mode}`) +
    path(witchHat([X(44), Y(-268)], [X(104), Y(-268)], [lx + 6 * s, Y(-312)], 4 * s), p.iron) +
    path(roundRect(X(50), Y(-270), 48 * s, 66 * s, 10 * s), p.window) +
    path(ellipse(lx, Y(-228), 14 * s, 18 * s), p.windowCore) +
    path(roundRect(lx - 7 * s, Y(-226), 14 * s, 18 * s, 3 * s), p.candle) +
    path(leaf(lx, Y(-226), 18 * s, 6 * s, -90), p.flame) +
    stroke(
      `M${f(X(66))} ${f(Y(-268))}L${f(X(66))} ${f(Y(-206))}M${f(X(82))} ${f(Y(-268))}L${f(X(82))} ${f(Y(-206))}`,
      p.iron,
      4 * s,
    ) +
    path(roundRect(X(46), Y(-208), 56 * s, 12 * s, 6 * s), p.iron) +
    path(circle(lx, Y(-190), 7 * s), p.iron)
  );
}

function cottage(
  x: number,
  y: number,
  s: number,
  wall: string,
  roof: string,
  lean: number,
  p: Palette,
  mode: Mode,
): string {
  const w = 150 * s;
  const h = 118 * s;
  const l = x - w / 2;
  const night = mode === 'night';
  const tip: Pt = [x + lean * s, y - h - 150 * s];
  return (
    path(roundRect(x + 24 * s, y - h - 90 * s, 26 * s, 70 * s, 4 * s), p.brick) +
    path(roundRect(x + 20 * s, y - h - 98 * s, 34 * s, 12 * s, 4 * s), p.trim) +
    path(
      poly([
        [l, y + 4],
        [l + 5 * s, y - h],
        [l + w - 3 * s, y - h - 5 * s],
        [l + w, y + 4],
      ]),
      wall,
    ) +
    path(
      witchHat([l - 20 * s, y - h + 12 * s], [l + w + 20 * s, y - h + 6 * s], tip, 18 * s),
      roof,
    ) +
    (night
      ? glowAt(x - 40 * s, y - 64 * s, 60 * s, 'hwBackGlow') +
        glowAt(x + 40 * s, y - 64 * s, 60 * s, 'hwBackGlow')
      : '') +
    windowPane(x - 40 * s, y - 64 * s, 30 * s, 32 * s, p, 'square', 0, 5 * s) +
    windowPane(x + 40 * s, y - 64 * s, 30 * s, 32 * s, p, 'square', 0, 5 * s) +
    windowPane(x + lean * 0.2 * s, y - h - 46 * s, 26 * s, 26 * s, p, 'round', 0, 5 * s) +
    path(arch(x, y + 3, 34 * s, 54 * s), p.door) +
    path(circle(x + 9 * s, y - 24 * s, 3 * s), p.window) +
    pumpkin(x - 34 * s, y + 4, 13 * s, p)
  );
}

function farHouse(x: number, y: number, s: number, tall: boolean, p: Palette): string {
  const w = 44 * s;
  const h = (tall ? 54 : 36) * s;
  const rh = (tall ? 54 : 34) * s;
  return (
    path(roundRect(x + w * 0.12, y - h - rh * 0.8, 8 * s, 26 * s, 1 * s), p.village) +
    path(roundRect(x - w / 2, y - h, w, h + 8, 3 * s), p.village) +
    path(
      poly([
        [x - w / 2 - 7 * s, y - h + 3 * s],
        [x + 3 * s, y - h - rh],
        [x + w / 2 + 7 * s, y - h + 3 * s],
      ]),
      p.village,
    ) +
    path(roundRect(x - w * 0.3, y - h * 0.68, 9 * s, 11 * s, 2 * s), p.villageLight) +
    (tall ? path(roundRect(x + w * 0.08, y - h * 0.68, 9 * s, 11 * s, 2 * s), p.villageLight) : '')
  );
}

function farTree(x: number, y: number, s: number, color: string): string {
  const branch = (from: Pt, ang: number, len: number, twist: number, r0: number) =>
    path(
      tube(curl(from[0], from[1], ang, len * s, twist, 0.7, 14), (u) =>
        Math.max(0.8 * s, r0 * s * (1 - 0.85 * u)),
      ),
      color,
    );
  return (
    path(
      tube(
        [
          [x, y + 4],
          [x - 2 * s, y - 24 * s],
          [x + 2 * s, y - 46 * s],
        ],
        (u) => (6 - 2.6 * u) * s,
      ),
      color,
    ) +
    branch([x, y - 38 * s], -140, 34, -5.2, 3.2) +
    branch([x + 1 * s, y - 42 * s], -42, 34, 5.2, 3.2) +
    branch([x + 2 * s, y - 46 * s], -92, 26, 4.6, 2.6)
  );
}

function autumnTree(x: number, y: number, s: number, trunk: string, crown: string, shade: string) {
  return (
    path(roundRect(x - 6 * s, y - 56 * s, 12 * s, 60 * s, 5 * s), trunk) +
    path(scallop(x, y - 86 * s, 1, 9, 8 * s, 0, 46 * s, 40 * s), shade) +
    path(scallop(x - 4 * s, y - 92 * s, 1, 9, 7 * s, 10, 40 * s, 34 * s), crown)
  );
}

function sunsetCloud(
  x: number,
  y: number,
  s: number,
  stretch: number,
  top: string,
  under: string,
): string {
  const puffs: [number, number, number][] = [
    [-100, -22, 32],
    [-46, -38, 48],
    [18, -46, 56],
    [80, -30, 40],
    [128, -16, 26],
  ];
  const blob = (dy: number, color: string) =>
    puffs.map(([dx, py, r]) => path(circle(x + dx * s, y + (py + dy) * s, r * s), color)).join('') +
    path(roundRect(x - 140 * s, y + (dy - 22) * s, 290 * s, 32 * s, 16 * s), color);
  return group(
    blob(10, under) + blob(0, top),
    `translate(${f(x)} 0) scale(${stretch} 1) translate(${f(-x)} 0)`,
  );
}

function crookedFence(x0: number, x1: number, base: number, p: Palette, seed: number): string {
  const r = rng(seed);
  const posts: { x: number; y: number; h: number; tilt: number }[] = [];
  for (let x = x0; x <= x1; x += 74 + r() * 20) {
    posts.push({ x, y: base + range(r, -6, 6), h: range(r, 100, 128), tilt: range(r, -7, 7) });
  }
  let out = '';
  for (const k of [0.4, 0.76]) {
    for (let i = 0; i < posts.length - 1; i++) {
      const a = posts[i];
      const b = posts[i + 1];
      out += stroke(
        `M${f(a.x)} ${f(a.y - a.h * k)}L${f(b.x)} ${f(b.y - b.h * k)}`,
        p.fenceDark,
        13,
      );
    }
  }
  for (const { x, y, h, tilt } of posts) {
    out += group(
      path(
        poly([
          [x - 12, y + 4],
          [x - 12, y - h + 14],
          [x, y - h],
          [x + 12, y - h + 14],
          [x + 12, y + 4],
        ]),
        p.fence,
      ) +
        stroke(
          `M${f(x + 4)} ${f(y - h + 20)}L${f(x + 4)} ${f(y - 6)}`,
          p.fenceDark,
          3,
          ' stroke-opacity=".5"',
        ),
      `rotate(${f(tilt)} ${f(x)} ${f(y)})`,
    );
  }
  return out;
}

function pumpkinLeaf(x: number, y: number, s: number, p: Palette): string {
  return (
    path(scallop(x, y + 3 * s, 30 * s, 5, 10 * s, -90), p.vineLeafDark) +
    path(scallop(x - 2 * s, y, 27 * s, 5, 9 * s, -90), p.vineLeaf) +
    stroke(`M${f(x)} ${f(y + 18 * s)}L${f(x)} ${f(y - 16 * s)}`, p.vineLeafDark, 3 * s) +
    stroke(
      `M${f(x)} ${f(y + 6 * s)}L${f(x - 16 * s)} ${f(y - 8 * s)}M${f(x)} ${f(y + 6 * s)}L${f(x + 16 * s)} ${f(y - 8 * s)}`,
      p.vineLeafDark,
      2.5 * s,
    )
  );
}

function vine(pts: Pt[], s: number, p: Palette, seed: number): string {
  const r = rng(seed);
  let out = path(tube(pts, 5 * s), p.vine);
  const sm = spline(pts, 28);
  for (let i = 3; i < sm.length - 1; i += 4) {
    const [vx, vy] = sm[i];
    const side = (i / 4) % 2 < 1 ? -1 : 1;
    out += stroke(
      smooth(curl(vx, vy, side < 0 ? -150 : -30, 34 * s, side * 7, 0.9, 16), false),
      p.vine,
      3 * s,
    );
    out += pumpkinLeaf(vx + side * 20 * s, vy - 22 * s, (0.8 + r() * 0.35) * s, p);
  }
  return out;
}

function hayBale(x: number, y: number, s: number, p: Palette): string {
  let out =
    path(ellipse(x, y + 2 * s, 112 * s, 12 * s), p.grass, ' fill-opacity=".5"') +
    path(roundRect(x - 96 * s, y - 86 * s, 192 * s, 88 * s, 16 * s), p.hayDark) +
    path(roundRect(x - 90 * s, y - 110 * s, 180 * s, 44 * s, 18 * s), p.hay);
  for (let i = 0; i < 9; i++) {
    const hx = x - 80 * s + i * 20 * s;
    out += stroke(
      `M${f(hx)} ${f(y - 56 * s + (i % 3) * 12 * s)}l${f(10 * s)} ${f(-14 * s)}`,
      p.hay,
      4 * s,
      ' stroke-opacity=".8"',
    );
    out += stroke(
      `M${f(hx + 4 * s)} ${f(y - 108 * s)}l${f((i % 2 ? 6 : -6) * s)} ${f(-12 * s)}`,
      p.hayDark,
      3 * s,
    );
  }
  for (const dx of [-46, 42]) {
    out += path(roundRect(x + (dx - 6) * s, y - 108 * s, 12 * s, 108 * s, 5 * s), p.rope);
  }
  return out;
}

function garland(a: Pt, b: Pt, sag: number, n: number, p: Palette, mode: Mode): string {
  const c: Pt = [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2 + sag * 2];
  const at = (t: number): Pt => [
    (1 - t) ** 2 * a[0] + 2 * (1 - t) * t * c[0] + t * t * b[0],
    (1 - t) ** 2 * a[1] + 2 * (1 - t) * t * c[1] + t * t * b[1],
  ];
  const colors = [p.bulbA, p.bulbB, p.bulbC];
  let out = stroke(
    `M${f(a[0])} ${f(a[1])}Q${f(c[0])} ${f(c[1])} ${f(b[0])} ${f(b[1])}`,
    p.trim,
    2.5,
  );
  for (let i = 1; i < n; i++) {
    const [x, y] = at(i / n);
    if (mode === 'night') out += glowAt(x, y + 7, 18, 'hwBackGlow');
    out += path(ellipse(x, y + 7, 5.5, 7.5), colors[i % 3]);
  }
  return out;
}

function cornShock(x: number, y: number, s: number, p: Palette): string {
  let out = '';
  [-112, -104, -97, -90, -83, -76, -68].forEach((a, i) => {
    out += path(
      leaf(x + (i - 3) * 7 * s, y + 4, (150 + (i % 3) * 22) * s, 13 * s, a),
      i % 2 ? p.cornDark : p.corn,
    );
  });
  out += path(roundRect(x - 26 * s, y - 70 * s, 52 * s, 12 * s, 5 * s), p.rope);
  return out;
}

function mushroom(x: number, y: number, s: number, p: Palette): string {
  return (
    path(roundRect(x - 8 * s, y - 30 * s, 16 * s, 32 * s, 7 * s), p.mushroomStem) +
    path(
      `M${f(x - 32 * s)} ${f(y - 26 * s)}Q${f(x - 30 * s)} ${f(y - 62 * s)} ${f(x)} ${f(y - 64 * s)}Q${f(x + 30 * s)} ${f(y - 62 * s)} ${f(x + 32 * s)} ${f(y - 26 * s)}Z`,
      p.mushroom,
    ) +
    path(circle(x - 12 * s, y - 44 * s, 5 * s), p.mushroomDot) +
    path(circle(x + 10 * s, y - 50 * s, 4 * s), p.mushroomDot) +
    path(circle(x + 18 * s, y - 34 * s, 3.5 * s), p.mushroomDot)
  );
}

function jarCandle(x: number, y: number, s: number, p: Palette, mode: Mode): string {
  return (
    (mode === 'night' ? glowAt(x, y - 30 * s, 70 * s, 'hwBackGlow') : '') +
    path(
      roundRect(x - 20 * s, y - 50 * s, 40 * s, 52 * s, 12 * s),
      p.glass,
      ' fill-opacity=".55"',
    ) +
    path(roundRect(x - 9 * s, y - 26 * s, 18 * s, 24 * s, 4 * s), p.candle) +
    path(leaf(x, y - 26 * s, 20 * s, 6.5 * s, -90), p.flame) +
    path(leaf(x, y - 28 * s, 10 * s, 3.5 * s, -90), p.flameCore) +
    path(roundRect(x - 22 * s, y - 56 * s, 44 * s, 10 * s, 5 * s), p.iron)
  );
}

function signpost(x: number, y: number, s: number, p: Palette): string {
  const board = (cy: number, w: number, dir: number, tilt: number) => {
    const x0 = x - dir * 14 * s;
    const x1 = x0 + dir * w * s;
    const hh = 17 * s;
    return group(
      path(
        poly([
          [x0, cy - hh],
          [x1 - dir * 18 * s, cy - hh],
          [x1, cy],
          [x1 - dir * 18 * s, cy + hh],
          [x0, cy + hh],
        ]),
        p.wood,
      ) +
        stroke(
          `M${f(x0 + dir * 10 * s)} ${f(cy)}L${f(x1 - dir * 26 * s)} ${f(cy)}`,
          p.woodDark,
          3 * s,
          ' stroke-opacity=".5"',
        ),
      `rotate(${tilt} ${f(x)} ${f(cy)})`,
    );
  };
  return (
    path(ellipse(x, y + 2, 40 * s, 8 * s), p.grass, ' fill-opacity=".5"') +
    path(roundRect(x - 9 * s, y - 170 * s, 18 * s, 174 * s, 5 * s), p.woodDark) +
    board(y - 140 * s, 110, 1, -6) +
    board(y - 96 * s, 96, -1, 5) +
    path(circle(x, y - 176 * s, 9 * s), p.pumpkin)
  );
}

function pebbles(x: number, y: number, s: number, p: Palette): string {
  return (
    path(ellipse(x, y, 20 * s, 12 * s), p.stoneShade) +
    path(ellipse(x - 2 * s, y - 3 * s, 18 * s, 10 * s), p.stone) +
    path(ellipse(x + 30 * s, y + 5 * s, 12 * s, 7 * s), p.stoneShade) +
    path(ellipse(x + 29 * s, y + 3 * s, 11 * s, 6 * s), p.stone)
  );
}

function cobweb(
  cx: number,
  cy: number,
  r: number,
  from: number,
  to: number,
  color: string,
  w: number,
): string {
  const n = 6;
  const angles = Array.from(
    { length: n },
    (_, i) => ((from + ((to - from) * i) / (n - 1)) * Math.PI) / 180,
  );
  let out = '';
  for (const a of angles) {
    out += stroke(
      `M${f(cx)} ${f(cy)}L${f(cx + Math.cos(a) * r)} ${f(cy + Math.sin(a) * r)}`,
      color,
      w,
      ' stroke-opacity=".7"',
    );
  }
  for (const k of [0.3, 0.5, 0.7, 0.9]) {
    const rr = r * k;
    let d = '';
    for (let i = 0; i < n - 1; i++) {
      const a1 = angles[i];
      const a2 = angles[i + 1];
      const am = (a1 + a2) / 2;
      if (!i) d += `M${f(cx + Math.cos(a1) * rr)} ${f(cy + Math.sin(a1) * rr)}`;
      d += `Q${f(cx + Math.cos(am) * rr * 0.84)} ${f(cy + Math.sin(am) * rr * 0.84)} ${f(cx + Math.cos(a2) * rr)} ${f(cy + Math.sin(a2) * rr)}`;
    }
    out += stroke(d, color, w * 0.75, ' stroke-opacity=".6"');
  }
  for (const [i, k] of [
    [2, 0.7],
    [3, 0.5],
    [1, 0.9],
  ]) {
    const a = angles[i];
    out += path(
      circle(cx + Math.cos(a) * r * k, cy + Math.sin(a) * r * k, w * 1.5),
      '#ffffff',
      ' fill-opacity=".9"',
    );
  }
  return out;
}

type Zone = [number, number, number, number];

function scatterAround(
  seed: number,
  count: number,
  x0: number,
  x1: number,
  y0: number,
  y1: number,
  avoid: Zone[],
  draw: (x: number, y: number, r: () => number) => string,
): [number, string][] {
  const r = rng(seed);
  const out: [number, string][] = [];
  for (let i = 0; i < count; i++) {
    const x = range(r, x0, x1);
    const y = range(r, y0, y1);
    const svg = draw(x, y, r);
    if (avoid.some(([cx, cy, rx, ry]) => ((x - cx) / rx) ** 2 + ((y - cy) / ry) ** 2 < 1)) continue;
    if (y < Math.min(groundY(x), hillY(x)) + 20) continue;
    out.push([y, svg]);
  }
  return out;
}

const HOUSE: Pt = [1250, 900];
const SUN: Pt = [2650, 520];
const TREE_L: Pt = [340, 1330];
const TREE_R: Pt = [3280, 1290];
const WELL: Pt = [840, 1430];
const LAMP: Pt = [1610, 1560];
const JACKS: [number, number, number, Face][] = [
  [2560, 1480, 104, 'grin'],
  [2880, 1590, 90, 'boo'],
  [3150, 1470, 82, 'happy'],
];

const LANE: Pt[] = [
  [1250, 900],
  [1290, 1010],
  [1196, 1180],
  [1300, 1400],
  [1460, 1640],
  [1500, 1860],
  [1470, 2070],
];

const AVOID: Zone[] = [
  [1250, 960, 330, 80],
  [1250, 1060, 110, 90],
  [1210, 1200, 140, 100],
  [1300, 1400, 170, 110],
  [1440, 1630, 210, 120],
  [1500, 1880, 250, 140],
  [2870, 1500, 560, 190],
  [840, 1420, 170, 60],
  [1610, 1560, 70, 40],
  [1080, 1250, 70, 30],
];

const day: Palette = {
  skyTop: '#6457c2',
  skyMid: '#c978c4',
  skyLow: '#ff9a8c',
  skyBottom: '#ffcc8a',
  haze: '#fff0b3',
  sun: '#ffb547',
  sunRay: '#ffc23f',
  face: '#8a4b1f',
  blush: '#ff7f8a',
  cloud: '#f7a9c9',
  cloudLight: '#ffd2a8',
  star: '#fff4d8',
  hillFarthest: '#d99bc2',
  hillFar: '#b986bd',
  village: '#9a74b0',
  villageLight: '#ffd36b',
  hillMid: '#7e9e86',
  treeMid: '#8a7a86',
  autumnA: '#eda25c',
  autumnB: '#f0c25e',
  autumnC: '#dc7f5e',
  autumnShade: '#c9875c',
  hill: '#9cc585',
  hillShade: '#87b673',
  ground: '#8fb878',
  groundLight: '#a3c98a',
  grass: '#6c9e5c',
  grassLight: '#9cc77e',
  bush: '#7aae63',
  bushDark: '#5f9450',
  path: '#efc796',
  pathEdge: '#d6a676',
  pathStone: '#e0b483',
  trunk: '#6d4c6c',
  trunkDark: '#563b58',
  hole: '#2f2340',
  leafOrange: '#ff993d',
  leafYellow: '#ffc94d',
  leafRed: '#f26b4a',
  wall: '#a28ed2',
  wallShade: '#8c78c0',
  wallSide: '#8a74bd',
  roof: '#5b4892',
  roofLight: '#7764ae',
  trim: '#3e3068',
  brick: '#b0657a',
  brickLight: '#c27a8c',
  brickDark: '#8e4f63',
  door: '#b4733f',
  doorDark: '#8d5531',
  window: '#ffd96b',
  windowCore: '#fff3b4',
  windowFrame: '#3e3068',
  windowGlow: '#ffcf5a',
  pumpkin: '#ff9431',
  pumpkinDark: '#ea761e',
  pumpkinLight: '#ffad52',
  jack: '#ff9431',
  jackDark: '#ea761e',
  jackLight: '#ffad52',
  stem: '#6f8f3e',
  vine: '#6a9e48',
  vineLeaf: '#7cb455',
  vineLeafDark: '#5e9142',
  patch: '#79a564',
  carve: '#ffdb5c',
  carveCore: '#fff4b0',
  carveRim: '#c25e14',
  carveGlow: '#ffc14a',
  flame: '#ffcf47',
  flameCore: '#fff6c8',
  candle: '#fff0d8',
  candleShade: '#ecd3b6',
  glass: '#e8dcff',
  fence: '#a87a5c',
  fenceDark: '#8a5f45',
  iron: '#3d3358',
  ironLight: '#5c4f80',
  stone: '#b4aac6',
  stoneShade: '#978cae',
  stoneLight: '#d2cae0',
  potion: '#8ee667',
  potionLight: '#d2ff9c',
  potionGlow: '#a8ff70',
  wood: '#a8754f',
  woodDark: '#85573a',
  rope: '#e3c58e',
  hay: '#f2c75a',
  hayDark: '#d6a63c',
  corn: '#e8c77a',
  cornDark: '#c9a35a',
  cottageA: '#ffd08f',
  cottageB: '#b2dccb',
  cottageC: '#f6b4cb',
  roofA: '#7a5aa8',
  roofB: '#e2705c',
  roofC: '#5f7fc0',
  web: '#fbf3ff',
  bulbA: '#ffab45',
  bulbB: '#ffe066',
  bulbC: '#c99bff',
  mushroom: '#b88be2',
  mushroomDot: '#fff6ff',
  mushroomStem: '#f6ead8',
  aster: '#b98ae6',
  asterCenter: '#ffd36b',
};

const dusk = (hex: string): string => mix(nightColor(hex), '#6b3fa6', 0.2);

const night: Palette = {
  ...Object.fromEntries(Object.entries(day).map(([k, v]) => [k, dusk(v)])),
  skyTop: '#170e3d',
  skyMid: '#2d1c66',
  skyLow: '#4a2f8c',
  skyBottom: '#7650a6',
  haze: '#a184ff',
  moon: '#fff3c6',
  moonShade: '#f0d99e',
  moonGlow: '#fff0c8',
  face: '#8a6a4a',
  blush: '#ff9f9a',
  star: '#fff4d8',
  villageLight: '#ffd96b',
  window: '#ffd761',
  windowCore: '#fff6c4',
  windowGlow: '#ffc94a',
  pumpkin: '#a9612f',
  pumpkinDark: '#8d4f27',
  pumpkinLight: '#ba7038',
  leafOrange: '#b86a42',
  leafYellow: '#bf9455',
  leafRed: '#a8564c',
  carve: '#ffe066',
  carveCore: '#fffbd6',
  carveRim: '#b4561a',
  carveGlow: '#ffb03b',
  jack: '#e57d2e',
  jackDark: '#c4621f',
  jackLight: '#f2933e',
  flame: '#ffd34d',
  flameCore: '#fff6c4',
  potion: '#7ee05a',
  potionLight: '#c8ff8a',
  potionGlow: '#9dff6a',
  candle: '#eed9c4',
  candleShade: '#d2b9a6',
  bulbA: '#ffb347',
  bulbB: '#ffe680',
  bulbC: '#dcbaff',
  web: '#d9ccff',
};

function backdrop(p: Palette, mode: Mode): string {
  const nightMode = mode === 'night';
  let out =
    `<defs>${linearGradient('hwSky', [
      [0, p.skyTop],
      [0.2, p.skyMid],
      [0.36, p.skyLow],
      [0.48, p.skyBottom],
    ])}${radialGlow('hwHaze', p.haze, nightMode ? 0.35 : 0.75)}${radialGlow('hwBackGlow', p.windowGlow, nightMode ? 0.7 : 0.35)}</defs>` +
    `<rect width="${W}" height="${H}" fill="url(#hwSky)"/>` +
    `<ellipse cx="${SUN[0]}" cy="${SUN[1] + 80}" rx="1500" ry="560" fill="url(#hwHaze)"/>`;
  out += nightMode
    ? starField(41, 120, 30, 20, W - 30, 840, p.star)
    : starField(5, 16, 60, 20, W - 60, 210, p.star);
  for (const [x, y, s, k] of [
    [620, 250, 1.15, 1.2],
    [1560, 150, 0.85, 1],
    [1900, 640, 0.7, 1.7],
    [3220, 230, 1.05, 1.1],
    [3420, 650, 0.62, 1.8],
    [330, 640, 0.8, 1.3],
  ]) {
    out += sunsetCloud(x, y, s, k, p.cloud, p.cloudLight);
  }
  out += land(farthestY, p.hillFarthest);
  for (const x of [180, 560, 2000, 2380, 3300]) {
    out += farTree(x, farthestY(x) + 6, 1, p.hillFar);
  }
  out += land(farY, p.hillFar);
  for (const [x, s, tall] of [
    [250, 0.9, true],
    [330, 0.8, false],
    [1760, 0.9, false],
    [1830, 1, true],
    [2920, 0.85, true],
    [2990, 0.9, false],
    [3080, 1, true],
    [3160, 0.8, false],
  ] as [number, number, boolean][]) {
    out += farHouse(x, farY(x) + 8, s, tall, p);
  }
  for (const x of [520, 700, 1640, 2700, 3420]) out += farTree(x, farY(x) + 8, 1.4, p.village);
  out += land(midY, p.hillMid);
  const crowns = [p.autumnA, p.autumnB, p.autumnC];
  [60, 190, 470, 610, 1700, 2560, 2690, 2830, 3470, 3590].forEach((x, i) => {
    const c = crowns[i % 3];
    out += autumnTree(
      x,
      midY(x) + 8,
      0.9 + (i % 2) * 0.2,
      p.treeMid,
      c,
      mix(c, p.autumnShade, 0.5),
    );
  });
  out += cottage(1920, midY(1920) + 8, 0.62, p.cottageA, p.roofA, -24, p, mode);
  out += cottage(2140, midY(2140) + 10, 0.74, p.cottageC, p.roofC, 30, p, mode);
  out += cottage(2370, midY(2370) + 8, 0.58, p.cottageB, p.roofB, -18, p, mode);
  out += garland([1976, 940], [2072, 930], 16, 6, p, mode);
  out += garland([2208, 925], [2316, 976], 14, 6, p, mode);
  out += land(hillY, p.hill);
  out += path(
    `M${f(1490)} ${f(hillY(1490))}C1600 960 1680 1040 1740 1110L1500 1110Z`,
    p.hillShade,
    ' fill-opacity=".7"',
  );
  out += path(ellipse(1180, 950, 300, 34), p.grassLight, ' fill-opacity=".5"');
  out += land(groundY, p.ground);
  const r = rng(77);
  for (let i = 0; i < 16; i++) {
    const x = range(r, 0, W);
    const y = range(r, 1200, 1900);
    out += path(
      ellipse(x, y, range(r, 140, 300), range(r, 26, 44)),
      p.groundLight,
      ' fill-opacity=".6"',
    );
  }
  out += path(
    tube(LANE, (u) => 34 + 180 * u),
    p.pathEdge,
  );
  out += path(
    tube(LANE, (u) => 24 + 168 * u),
    p.path,
  );
  const lane = spline(LANE, 18);
  lane.slice(2, -1).forEach(([x, y], i) => {
    const k = (i + 2) / 18;
    out += path(ellipse(x + (i % 2 ? 22 : -26) * k, y, 30 + 40 * k, 9 + 12 * k), p.pathStone);
  });
  return out;
}

function patchItems(p: Palette): [number, string][] {
  const items: [number, string][] = [
    [1300, path(scallop(2870, 1490, 1, 22, 22, 0, 570, 180), p.patch)],
    [
      1310,
      vine(
        [
          [2330, 1430],
          [2480, 1390],
          [2660, 1410],
          [2820, 1380],
          [3000, 1410],
          [3180, 1380],
          [3380, 1420],
        ],
        1,
        p,
        3,
      ),
    ],
    [
      1500,
      vine(
        [
          [2370, 1580],
          [2560, 1550],
          [2720, 1580],
          [2900, 1540],
          [3080, 1580],
          [3330, 1550],
        ],
        1.1,
        p,
        5,
      ),
    ],
  ];
  for (const [x, y, rr] of [
    [2400, 1410, 34],
    [2740, 1420, 40],
    [2990, 1400, 30],
    [3330, 1430, 38],
    [2420, 1600, 30],
    [2700, 1630, 44],
    [3060, 1630, 36],
    [3310, 1590, 32],
    [3000, 1500, 26],
  ]) {
    items.push([y, pumpkin(x, y, rr, p)]);
  }
  return items;
}

const interactives: Interactive[] = [
  {
    id: 'sun',
    box: [SUN[0] - 326, SUN[1] - 326, 652, 652],
    kind: 'spin',
    origin: SUN,
    effect: 'sparkle',
    sound: 'shine',
    night: { kind: 'rock', effect: 'stars', sound: 'twinkle' },
    render: (p, mode) =>
      mode === 'day'
        ? sun(SUN[0], SUN[1], 138, p.sun, p.sunRay, p.face)
        : fullMoon(SUN[0], SUN[1], 170, p),
  },
  {
    id: 'house',
    box: [HOUSE[0] - 312, HOUSE[1] - 702, 620, 794],
    kind: 'wiggle',
    effect: 'stars',
    effectAt: [HOUSE[0] - 10, HOUSE[1] - 380],
    sound: 'creak',
    render: (p, mode) => hauntedHouse(HOUSE[0], HOUSE[1], p, mode),
  },
  {
    id: 'tree-left',
    box: [TREE_L[0] - 324, TREE_L[1] - 676, 650, 724],
    kind: 'shake',
    effect: 'leaves',
    sound: 'rustle',
    render: (p) => curlyTree(TREE_L[0], TREE_L[1], 1.25, p, 1, 11),
  },
  {
    id: 'tree-right',
    box: [TREE_R[0] - 302, TREE_R[1] - 622, 602, 668],
    kind: 'shake',
    effect: 'leaves',
    sound: 'rustle',
    render: (p) => curlyTree(TREE_R[0], TREE_R[1], 1.15, p, -1, 23),
  },
  {
    id: 'well',
    box: [WELL[0] - 144, WELL[1] - 356, 288, 392],
    kind: 'glow',
    effect: 'bubbles',
    effectAt: [WELL[0], WELL[1] - 150],
    sound: 'bubble',
    render: (p, mode) => potionWell(WELL[0], WELL[1], 0.8, p, mode),
  },
  {
    id: 'lantern',
    box: [LAMP[0] - 72, LAMP[1] - 384, 274, 430],
    kind: 'glow',
    effect: 'sparkle',
    effectAt: [LAMP[0] + 80, LAMP[1] - 260],
    sound: 'chime',
    render: (p, mode) => lampPost(LAMP[0], LAMP[1], 1.1, p, mode),
  },
  ...JACKS.map(([x, y, r, face], i): Interactive => ({
    id: `jack-${i + 1}`,
    box: [
      Math.round(x - r * 1.14 - 20),
      Math.round(y - r * 1.76 - 20),
      Math.round(r * 2.28 + 40),
      Math.round(r * 2.26 + 40),
    ],
    kind: 'bounce',
    effect: 'sparkle',
    sound: 'boo',
    render: (p, mode) => jackOLantern(x, y, r, face, `hwJack${i + 1}${mode}`, p, mode),
  })),
];

const halloween: SceneDef = {
  id: 'halloween',
  world: [W, H],
  horizon: 980,
  ambient: {
    bats: 6,
    stars: 50,
    fireflies: 16,
    sparkles: 8,
    smoke: 3,
    smokeAt: [1391, 384],
    smokeScale: 0.45,
  },
  defaults: [
    { animal: 'witch', x: 1880, y: 400 },
    { animal: 'bat', x: 760, y: 380, flip: true },
    { animal: 'ghost', x: 1720, y: 760, flip: true },
    { animal: 'owl', x: 3300, y: 380, flip: true },
    { animal: 'black-cat', x: 1640, y: 990 },
    { animal: 'pumpkin', x: 1000, y: 1500 },
    { animal: 'spider', x: 560, y: 1600 },
    { animal: 'skeleton', x: 2450, y: 1730, flip: true },
    { animal: 'vampire', x: 2010, y: 1160 },
    { animal: 'mummy', x: 760, y: 1720 },
    { animal: 'cauldron', x: 2110, y: 1650 },
    { animal: 'monster', x: 3090, y: 1700, flip: true },
  ],
  day,
  night,
  interactives,
  back: (p, mode) =>
    backdrop(p, mode) +
    layered([
      [1180, crookedFence(-30, 640, 1180, p, 7)],
      [1290, crookedFence(2260, 3640, 1290, p, 9)],
      ...patchItems(p),
      [1330, hayBale(2330, 1330, 0.9, p) + pumpkin(2310, 1250, 30, p)],
      [1286, cornShock(2230, 1290, 0.9, p)],
      [1300, cornShock(3570, 1300, 0.85, p)],
      [1250, signpost(1060, 1250, 1, p)],
      [1530, mushroom(640, 1530, 1.1, p) + mushroom(684, 1540, 0.75, p)],
      [1380, mushroom(3560, 1380, 1, p)],
      [1770, mushroom(1930, 1770, 0.9, p)],
      ...[
        [1010, 1340, 30],
        [1850, 1310, 26],
        [3450, 1490, 32],
        [2290, 1810, 30],
        [560, 1430, 24],
      ].map(([x, y, rr]): [number, string] => [y, pumpkin(x, y, rr, p)]),
      ...[
        [1150, 1010],
        [1370, 1080],
        [1080, 1300],
        [1450, 1400],
        [1170, 1560],
        [1640, 1770],
        [1300, 1800],
      ].map(([x, y]): [number, string] => [y, jarCandle(x, y, 0.9 + (y - 1000) / 1400, p, mode)]),
      ...scatterAround(21, 80, 0, W, 1120, 1950, AVOID, (x, y, rr) =>
        grassTuft(x, y, 0.8 + rr() * 0.6, rr() < 0.5 ? p.grass : p.bushDark),
      ),
      ...scatterAround(33, 46, 0, W, 1160, 1900, AVOID, (x, y, rr) =>
        path(
          leaf(x, y, 26 + rr() * 14, 9, range(rr, 0, 360)),
          [p.leafOrange, p.leafYellow, p.leafRed][Math.floor(rr() * 3)],
        ),
      ),
      ...scatterAround(45, 26, 0, W, 1200, 1880, AVOID, (x, y, rr) =>
        flower(x, y, 0.9 + rr() * 0.4, p.aster, p.asterCenter),
      ),
      ...scatterAround(57, 10, 0, W, 1250, 1880, AVOID, (x, y, rr) =>
        pebbles(x, y, 0.8 + rr() * 0.6, p),
      ),
    ]),
  front: (p, mode) =>
    `<defs>${radialGlow('hwFrontGlow', p.windowGlow, mode === 'night' ? 0.7 : 0.35)}</defs>` +
    cobweb(0, H, 330, -90, 0, p.web, 4) +
    cobweb(W, H, 300, -180, -90, p.web, 4) +
    pumpkin(250, 2014, 74, p) +
    pumpkin(380, 2004, 48, p) +
    grassTuft(490, 2004, 2, p.grass) +
    mushroom(1000, 1990, 1.6, p) +
    grassTuft(1080, 2004, 1.8, p.bushDark) +
    pebbles(1820, 2002, 1.6, p) +
    candle(1850, 1992, 64, 1.6, p, mode, 'hwFrontGlow') +
    candle(1892, 1998, 42, 1.3, p, mode, 'hwFrontGlow') +
    grassTuft(2500, 2004, 2, p.grass) +
    pumpkin(3250, 2012, 66, p) +
    mushroom(3390, 1996, 1.3, p),
};

export default halloween;
