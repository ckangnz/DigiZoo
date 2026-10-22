import { mix } from '../core/color';
import {
  circle,
  curve,
  ellipse,
  f,
  poly,
  roundRect,
  samplePath,
  scalePath,
  smooth,
  spline,
  translatePath,
  type Pt,
} from '../core/paths';
import { group, layered, moon, path, radialGlow, starField, stroke, sun } from './props';
import { range, rng } from './rng';
import type { Interactive, Mode, Palette, SceneDef } from './types';

const W = 3600;
const H = 2000;
const HORIZON = 868;
const SEA_FRONT = 1732;
const PEAK_BASE = HORIZON + 20;

const SUN: Pt = [3190, 250];
const BERG: Pt = [2080, 1150];
const IGLOO: Pt = [880, 1404];
const BALLS: Pt = [1250, 1650];

const LEFT_SHORE: Pt[] = [
  [990, HORIZON],
  [1060, 900],
  [1180, 920],
  [1306, 948],
  [1336, 988],
  [1268, 1030],
  [1202, 1086],
  [1216, 1160],
  [1306, 1222],
  [1382, 1300],
  [1372, 1386],
  [1338, 1462],
  [1366, 1556],
  [1438, 1636],
  [1490, 1694],
];

const BANK: Pt[] = [
  [1490, 1694],
  [1610, 1716],
  [1720, 1704],
  [1820, 1722],
  [1960, 1730],
  [2100, 1712],
  [2240, 1724],
  [2400, 1716],
  [2560, 1700],
  [2700, 1708],
];

const RIGHT_SHORE: Pt[] = [
  [3230, HORIZON],
  [3190, 912],
  [3110, 952],
  [3064, 1024],
  [3020, 1104],
  [2964, 1196],
  [2904, 1288],
  [2862, 1380],
  [2818, 1480],
  [2762, 1584],
  [2700, 1708],
];

type Stop = [number, string, number?];

const stops = (list: Stop[]): string =>
  list
    .map(
      ([o, c, a]) =>
        `<stop offset="${o}" stop-color="${c}"${a === undefined ? '' : ` stop-opacity="${a}"`}/>`,
    )
    .join('');

const vgrad = (id: string, y1: number, y2: number, list: Stop[]): string =>
  `<linearGradient id="${id}" gradientUnits="userSpaceOnUse" x1="0" y1="${f(y1)}" x2="0" y2="${f(y2)}">${stops(list)}</linearGradient>`;

const op = (a: number): string => ` fill-opacity="${f(a)}"`;
const sop = (a: number): string => ` stroke-opacity="${f(a)}"`;

const clipDef = (id: string, d: string, evenodd = false): string =>
  `<clipPath id="${id}"><path d="${d}"${evenodd ? ' clip-rule="evenodd"' : ''}/></clipPath>`;

const clipped = (id: string, content: string): string =>
  group(content, '', ` clip-path="url(#${id})"`);

const BIG = `M-200 -200L${W + 200} -200L${W + 200} ${H + 200}L-200 ${H + 200}Z`;

function cutOut(id: string, shapes: string[], content: string): string {
  return shapes.reduce(
    (inner, d, i) =>
      `<defs>${clipDef(`${id}${i}`, BIG + d, true)}</defs>` + clipped(`${id}${i}`, inner),
    content,
  );
}

const tail = (pts: Pt[]): string => smooth(pts, false).replace(/^M[^C]*/, '');
const shift = (pts: Pt[], dx: number, dy: number): Pt[] =>
  pts.map(([x, y]): Pt => [x + dx, y + dy]);

const SHORE = tail(LEFT_SHORE) + tail(BANK) + tail([...RIGHT_SHORE].reverse());
const SEA_D = `M${LEFT_SHORE[0][0]} ${HORIZON}${SHORE}Z`;
const LAND_D = `M-60 ${HORIZON}L${LEFT_SHORE[0][0]} ${HORIZON}${SHORE}L${W + 60} ${HORIZON}L${W + 60} ${H + 60}L-60 ${H + 60}Z`;
const NOT_SEA = BIG + SEA_D;
const SEA_POLY = samplePath(SEA_D, 10);

function inSea(x: number, y: number, pad = 0): boolean {
  let inside = false;
  for (let i = 0, j = SEA_POLY.length - 1; i < SEA_POLY.length; j = i++) {
    const [xi, yi] = SEA_POLY[i];
    const [xj, yj] = SEA_POLY[j];
    if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) inside = !inside;
  }
  if (inside || !pad) return inside;
  return (
    [
      [pad, 0],
      [-pad, 0],
      [0, pad],
      [0, -pad],
    ] as Pt[]
  ).some(([dx, dy]) => inSea(x + dx, y + dy));
}

type Peak = [cx: number, wl: number, wr: number, h: number, seed: number];

const FAR_PEAKS: Peak[] = [
  [-60, 520, 560, 168, 3],
  [660, 540, 600, 232, 5],
  [1560, 540, 470, 184, 7],
];

const NEAR_PEAKS: Peak[] = [
  [250, 470, 440, 262, 11],
  [1060, 380, 430, 194, 13],
];

function peakY(pk: Peak, x: number): number {
  const [cx, wl, wr, h, seed] = pk;
  const s = Math.abs((x - cx) / (x < cx ? wl : wr));
  if (s >= 1) return PEAK_BASE;
  const e = 0.08;
  const k = (Math.sqrt(s * s + e * e) - e) / (Math.sqrt(1 + e * e) - e);
  const bump = 0.05 * Math.sin(x / 41 + seed) + 0.03 * Math.sin(x / 17 + seed * 2);
  return PEAK_BASE - h * Math.pow(1 - k, 1.35) * (1 + bump * s);
}

function peakPts(pk: Peak): Pt[] {
  const [cx, wl, wr] = pk;
  const pts: Pt[] = [];
  for (let x = cx - wl; x < cx + wr; x += 16) pts.push([x, peakY(pk, x)]);
  pts.push([cx + wr, PEAK_BASE]);
  return pts;
}

const glacierTop = (x: number): number => {
  if (x < 2190) return HORIZON;
  const rise = Math.min(1, (x - 2190) / 140);
  return HORIZON - rise * (40 + 9 * Math.sin(x / 130) + 5 * Math.sin(x / 47));
};

const farRidge = (x: number): number =>
  x < 2330 ? HORIZON : 826 - Math.min(1, (x - 2330) / 220) * (34 + 16 * Math.sin(x / 260 + 1));

const skyline = (x: number): number =>
  Math.min(
    HORIZON,
    glacierTop(x),
    farRidge(x),
    ...[...FAR_PEAKS, ...NEAR_PEAKS].map((pk) => peakY(pk, x)),
  );

const AURORA_RIGHT = 3150;

const SKY_CLIP = (() => {
  const pts: Pt[] = [
    [0, 0],
    [AURORA_RIGHT, 0],
  ];
  for (let x = AURORA_RIGHT; x >= 0; x -= 15) pts.push([x, skyline(x) + 2]);
  pts.push([0, skyline(0) + 2]);
  return poly(pts);
})();

function mountain(pk: Peak, id: string, c: [string, string, string, string]): string {
  const [cx, wl, wr, h, seed] = pk;
  const top = PEAK_BASE - h;
  const body = `${smooth(peakPts(pk), false)}L${f(cx + wr)} ${PEAK_BASE + 40}L${f(cx - wl)} ${PEAK_BASE + 40}Z`;
  const snowPts: Pt[] = [];
  for (let x = cx - wl; x <= cx + wr + 24; x += 24) {
    snowPts.push([
      x,
      PEAK_BASE -
        h * 0.5 +
        h * 0.08 * Math.sin(x / 26 + seed) +
        h * 0.05 * Math.sin(x / 11 + seed * 3),
    ]);
  }
  const snowD = `${smooth(snowPts, false)}L${f(cx + wr + 24)} ${f(top - 40)}L${f(cx - wl)} ${f(top - 40)}Z`;
  const shadeD = poly([
    [cx + 6, top - 40],
    [cx + 3, top + h * 0.12],
    [cx - wl * 0.12, top + h * 0.46],
    [cx - wl * 0.04, top + h * 0.72],
    [cx - wl * 0.3, PEAK_BASE + 40],
    [cx - wl - 30, PEAK_BASE + 40],
    [cx - wl - 30, top - 40],
  ]);
  return (
    `<defs>${clipDef(`${id}m`, body)}${clipDef(`${id}s`, snowD)}</defs>` +
    path(body, c[0]) +
    clipped(
      `${id}m`,
      path(shadeD, c[1]) + clipped(`${id}s`, path(snowD, c[2]) + path(shadeD, c[3])),
    )
  );
}

function farLands(p: Palette): string {
  const ridge: Pt[] = [];
  for (let x = 2300; x <= W + 60; x += 30) ridge.push([x, farRidge(x)]);
  const ice: Pt[] = [];
  for (let x = 2170; x <= W + 60; x += 20) ice.push([x, glacierTop(x)]);
  let cracks = '';
  const r = rng(71);
  for (let x = 2300; x < W + 40; x += range(r, 38, 70)) {
    const t = glacierTop(x);
    cracks += stroke(
      `M${f(x)} ${f(t + 12)}L${f(x + range(r, -6, 6))} ${f(HORIZON + 2)}`,
      p.glacierCrack,
      range(r, 3, 6),
      sop(0.55),
    );
  }
  const faceD = `${smooth(ice, false)}L${W + 60} ${HORIZON + 6}L2170 ${HORIZON + 6}Z`;
  return (
    path(`${smooth(ridge, false)}L${W + 60} ${HORIZON + 6}L2300 ${HORIZON + 6}Z`, p.farSnow) +
    path(faceD, p.glacierFace) +
    `<defs>${clipDef('plGlacier', faceD)}</defs>` +
    clipped('plGlacier', cracks + stroke(smooth(shift(ice, 0, 8), false), p.glacier, 18))
  );
}

function skyLayer(p: Palette, mode: Mode): string {
  let out =
    `<defs>${vgrad('plSky', 0, HORIZON, [
      [0, p.skyTop],
      [0.5, p.skyMid],
      [1, p.skyBottom],
    ])}</defs>` + `<rect width="${W}" height="${H}" fill="url(#plSky)"/>`;
  if (mode === 'night') {
    out +=
      `<defs>${radialGlow('plSkyGreen', p.auroraGreen, 0.24)}${radialGlow('plSkyViolet', p.auroraViolet, 0.2)}</defs>` +
      `<ellipse cx="1500" cy="720" rx="2100" ry="470" fill="url(#plSkyGreen)"/>` +
      `<ellipse cx="2100" cy="250" rx="1600" ry="380" fill="url(#plSkyViolet)"/>` +
      starField(41, 200, 20, 16, W - 20, 820, p.star);
  } else {
    out +=
      `<defs>${radialGlow('plHaze', p.haze, 0.7)}</defs>` +
      `<ellipse cx="3000" cy="820" rx="1500" ry="300" fill="url(#plHaze)"/>`;
  }
  return out;
}

const A_TOP: Pt[] = [
  [-60, 950],
  [140, 905],
  [400, 900],
  [620, 936],
  [800, 1000],
  [960, 1086],
  [1120, 1170],
  [1300, 1214],
  [1600, 1250],
];

const B_TOP: Pt[] = [
  [-60, 1290],
  [220, 1250],
  [480, 1236],
  [760, 1262],
  [1040, 1300],
  [1240, 1340],
  [1440, 1400],
  [1720, 1470],
];

const C_TOP: Pt[] = [
  [-60, 1660],
  [260, 1626],
  [620, 1660],
  [980, 1716],
  [1300, 1740],
  [1500, 1712],
  [1700, 1630],
  [2100, 1610],
  [2500, 1620],
  [2700, 1680],
  [2900, 1740],
  [3200, 1744],
  [3660, 1722],
];

const R_TOP: Pt[] = [
  [2500, 1220],
  [2700, 1130],
  [2900, 1090],
  [3100, 1050],
  [3350, 1040],
  [3660, 1010],
];

const R2_TOP: Pt[] = [
  [2560, 1600],
  [2760, 1520],
  [2960, 1480],
  [3200, 1446],
  [3420, 1456],
  [3660, 1430],
];

function band(id: string, top: Pt[], under: Pt[] | null, p: Palette, depth: number): string {
  const ys = top.map(([, y]) => y);
  const y0 = Math.min(...ys);
  const last = top[top.length - 1];
  const bottom = under
    ? `L${f(under[under.length - 1][0])} ${f(under[under.length - 1][1] + 40)}${tail(shift([...under].reverse(), 0, 40))}`
    : `L${f(last[0])} ${H + 60}L${f(top[0][0])} ${H + 60}`;
  return (
    stroke(smooth(shift(top, 0, -6), false), p.snowShade, 34, sop(0.32)) +
    `<defs>${vgrad(id, y0, y0 + depth, [
      [0, p.snowTop],
      [1, p.snowMid],
    ])}</defs>` +
    path(`${smooth(top, false)}${bottom}Z`, `url(#${id})`) +
    stroke(smooth(shift(top, 0, 6), false), p.snowRim, 7, sop(0.9))
  );
}

function terrain(p: Palette): string {
  return (
    band('plBandA', A_TOP, B_TOP, p, 320) +
    band(
      'plBandB',
      B_TOP,
      C_TOP.filter(([x]) => x <= 1720),
      p,
      300,
    ) +
    band('plBandR', R_TOP, R2_TOP, p, 380) +
    band(
      'plBandR2',
      R2_TOP,
      C_TOP.filter(([x]) => x >= 2480),
      p,
      300,
    ) +
    band('plBandC', C_TOP, null, p, 260)
  );
}

function pond(x: number, y: number, w: number, h: number, p: Palette): string {
  const r = rng(Math.round(x + y));
  let scratches = '';
  for (let i = 0; i < 4; i++) {
    const cx = x + range(r, -w * 0.25, w * 0.25);
    const cy = y + range(r, -h * 0.2, h * 0.2);
    const len = range(r, w * 0.14, w * 0.28);
    scratches += stroke(
      curve(cx - len / 2, cy, cx + len / 2, cy - range(r, 2, 8), range(r, -10, 10)),
      p.snowRim,
      3,
      sop(0.75),
    );
  }
  return (
    path(ellipse(x - 6, y + 6, w * 0.56, h * 0.62), p.snowShade) +
    path(ellipse(x, y, w * 0.5, h * 0.5), p.pond) +
    path(ellipse(x + w * 0.04, y + h * 0.06, w * 0.42, h * 0.36), p.pondLight, op(0.8)) +
    scratches +
    path(ellipse(x + w * 0.2, y - h * 0.16, w * 0.12, h * 0.07, -8), p.snowRim, op(0.85)) +
    snowBank(x - w * 0.56, x - w * 0.36, y + h * 0.3, 0.8, p, 3) +
    snowBank(x + w * 0.3, x + w * 0.54, y + h * 0.36, 0.8, p, 4)
  );
}

type Rock = { pts: Pt[]; snow: number; seed: number; strata?: boolean };

function rock(
  x: number,
  y: number,
  w: number,
  h: number,
  seed: number,
  snow = 0.3,
  flat = 0,
): Rock {
  const r = rng(seed);
  const j = (a: number) => range(r, -a, a);
  return {
    pts: [
      [x - w * 0.5, y + 6],
      [x - w * (0.48 + j(0.03)), y - h * (0.5 + j(0.06))],
      [x - w * (0.3 + j(0.04)), y - h * (0.9 + flat * 0.08 + j(0.02))],
      [x + w * (0.02 + j(0.05)), y - h],
      [x + w * (0.3 + j(0.04)), y - h * (0.9 + flat * 0.07 + j(0.02))],
      [x + w * (0.5 + j(0.02)), y - h * (0.42 + j(0.06))],
      [x + w * 0.47, y + 6],
    ],
    snow,
    seed,
  };
}

function frame(rk: Rock) {
  const xs = rk.pts.map(([x]) => x);
  const ys = rk.pts.map(([, y]) => y);
  const x0 = Math.min(...xs);
  const x1 = Math.max(...xs);
  const y0 = Math.min(...ys);
  const y1 = Math.max(...ys);
  return { x0, x1, y0, y1, w: x1 - x0, h: y1 - y0, cx: (x0 + x1) / 2 };
}

const snowUp = (h: number): number => Math.max(10, h * 0.08);

function capShape(rk: Rock, extra = 0): string {
  const { w, h, cx, y1 } = frame(rk);
  return scalePath(poly(rk.pts), 1 + (18 + extra) / w, 1 + (snowUp(h) + extra) / h, cx, y1);
}

const rockHoles = (rk: Rock): string[] => [poly(rk.pts), capShape(rk, 12)];

function rockArt(rk: Rock, id: string, p: Palette): string {
  const { x0, x1, y0, y1, w, h } = frame(rk);
  const r = rng(rk.seed * 13 + 3);
  const d = poly(rk.pts);
  const c: Pt = [x0 + w * range(r, 0.38, 0.48), y0 + h * range(r, 0.34, 0.44)];
  const q: Pt = [x0 + w * range(r, 0.3, 0.38), y1 + 12];
  const e: Pt = [x1 + 60, y0 + h * 0.36];
  const shade = poly([[x0 - 60, y0 - 60], [x0 + w * 0.36, y0 - 60], c, q, [x0 - 60, y1 + 60]]);
  const lit = poly([[x0 - 60, y0 - 60], [x1 + 60, y0 - 60], e, c, [x0 - 60, y0 + h * 0.22]]);
  let detail =
    stroke(poly([c, q], false), p.rockDark, 3.5, sop(0.4)) +
    stroke(poly([c, [x1, y0 + h * 0.36]], false), p.rockDark, 3, sop(0.3));
  for (let i = 0; i < 2; i++) {
    const cx = range(r, x0 + w * 0.5, x0 + w * 0.85);
    const cy = range(r, y0 + h * 0.5, y1 - h * 0.15);
    detail += stroke(
      `M${f(cx)} ${f(cy)}l${f(range(r, -12, 12))} ${f(h * 0.1)}l${f(range(r, -8, 8))} ${f(h * 0.08)}`,
      p.rockDark,
      3.5,
      sop(0.45),
    );
  }
  if (rk.strata) {
    for (let k = 1; k < 6; k++) {
      const sy = y0 + h * (0.16 + k * 0.14);
      detail += stroke(
        curve(x0 - 10, sy + range(r, -8, 8), x1 + 10, sy + range(r, -8, 8), range(r, -10, 10)),
        p.rockDark,
        4,
        sop(0.28),
      );
    }
  }
  const m = Math.max(4, Math.round(w / 46));
  const drip: Pt[] = [];
  for (let i = 0; i <= m; i++) {
    drip.push([
      x0 - 30 + ((w + 60) * i) / m,
      y0 + h * rk.snow + (i % 2 ? h * 0.07 + 6 : -h * 0.02) + range(r, -h * 0.02, h * 0.02),
    ]);
  }
  const capD = `${smooth(drip, false)}L${f(x1 + 60)} ${f(y0 - 90)}L${f(x0 - 60)} ${f(y0 - 90)}Z`;
  const cap = capShape(rk);
  return (
    `<defs>${clipDef(`${id}o`, d)}${clipDef(`${id}c`, capD)}</defs>` +
    path(d, p.rock) +
    clipped(`${id}o`, path(shade, p.rockShade) + path(lit, p.rockLight) + detail) +
    clipped(
      `${id}c`,
      path(cap, p.snowShade) +
        path(translatePath(cap, 7, -5), p.snowTop) +
        stroke(
          curve(x0 + w * 0.42, y0 - snowUp(h) + 8, x1 - w * 0.08, y0 - snowUp(h) + 14, -8),
          p.snowRim,
          6,
          sop(0.9),
        ),
    )
  );
}

const LEDGE: Rock = {
  pts: [
    [2870, 1462],
    [2846, 1408],
    [2786, 1388],
    [2704, 1376],
    [2684, 1324],
    [2760, 1286],
    [3000, 1262],
    [3150, 1286],
    [3212, 1350],
    [3236, 1462],
  ],
  snow: 0.22,
  seed: 23,
};

const CRAG: Rock = {
  pts: [
    [3296, 1316],
    [3306, 1150],
    [3332, 1010],
    [3378, 918],
    [3440, 876],
    [3522, 884],
    [3582, 944],
    [3614, 1064],
    [3628, 1316],
  ],
  snow: 0.1,
  seed: 25,
  strata: true,
};

const SEA_ROCKS: Rock[] = [
  rock(2900, 1712, 470, 180, 21, 0.3, 1),
  LEDGE,
  rock(2470, 1662, 270, 74, 27, 0.42, 1),
  rock(1376, 1352, 110, 54, 31),
  rock(1440, 1600, 90, 44, 29),
];

const LAND_ROCKS: Rock[] = [
  CRAG,
  rock(3290, 1690, 240, 116, 33),
  rock(3560, 1570, 200, 140, 35),
  rock(3236, 1062, 150, 90, 37),
];

function shoreEdge(p: Palette): string {
  return (
    `<defs>${clipDef('plNotSea', NOT_SEA, true)}</defs>` +
    clipped(
      'plNotSea',
      stroke(smooth(LEFT_SHORE, false), p.snowShade, 16, sop(0.45)) +
        stroke(smooth(BANK, false), p.snowShade, 16, sop(0.45)) +
        stroke(smooth(RIGHT_SHORE, false), p.snowShade, 16, sop(0.45)),
    )
  );
}

type Zone = [number, number, number, number];

const POND: Pt = [250, 1560];

const AVOID: Zone[] = [
  [IGLOO[0] - 40, IGLOO[1] - 60, 380, 180],
  [BALLS[0], BALLS[1] - 50, 150, 100],
  [340, 1200, 520, 130],
  [POND[0], POND[1], 260, 70],
  [3460, 1100, 220, 260],
  [2900, 1620, 300, 150],
  [3000, 1380, 300, 150],
  [3290, 1660, 170, 90],
  [3560, 1530, 130, 100],
  [3240, 1040, 110, 70],
];

type Layer = [number, string];

function scatterSnow(
  seed: number,
  count: number,
  y0: number,
  y1: number,
  draw: (x: number, y: number, r: () => number) => string,
): Layer[] {
  const r = rng(seed);
  const out: Layer[] = [];
  for (let i = 0; i < count; i++) {
    const x = range(r, 20, W - 20);
    const y = range(r, y0, y1);
    const svg = draw(x, y, r);
    if (inSea(x, y, 70)) continue;
    if (AVOID.some(([cx, cy, rx, ry]) => ((x - cx) / rx) ** 2 + ((y - cy) / ry) ** 2 < 1)) continue;
    out.push([y, svg]);
  }
  return out;
}

function tuft(x: number, y: number, s: number, p: Palette): string {
  let out = '';
  [-116, -100, -88, -74, -62].forEach((a, i) => {
    const len = (26 + (i % 2) * 16) * s;
    const rad = (a * Math.PI) / 180;
    out += stroke(
      `M${f(x + (i - 2) * 3 * s)} ${f(y)}Q${f(x + Math.cos(rad) * len * 0.5)} ${f(y + Math.sin(rad) * len * 0.6)} ${f(x + Math.cos(rad) * len)} ${f(y + Math.sin(rad) * len)}`,
      i % 2 ? p.grassDark : p.grass,
      3.2 * s,
    );
  });
  return path(ellipse(x, y + 2, 16 * s, 4 * s), p.snowShade, op(0.6)) + out;
}

function pebble(x: number, y: number, s: number, p: Palette): string {
  return (
    path(ellipse(x - 4 * s, y + 3 * s, 26 * s, 7 * s), p.snowShade, op(0.6)) +
    path(ellipse(x, y, 22 * s, 11 * s), p.rockShade) +
    path(ellipse(x + 3 * s, y - 2 * s, 17 * s, 8 * s), p.rock) +
    path(ellipse(x + 4 * s, y - 8 * s, 15 * s, 5 * s), p.snowTop)
  );
}

function sastrugi(x: number, y: number, s: number, p: Palette): string {
  const len = 90 * s;
  return (
    stroke(curve(x - len / 2, y, x + len / 2, y - 4 * s, -10 * s), p.snowShade, 6 * s, sop(0.55)) +
    stroke(
      curve(x - len * 0.3, y + 14 * s, x + len * 0.35, y + 11 * s, -7 * s),
      p.snowShade,
      5 * s,
      sop(0.4),
    )
  );
}

function prints(p: Palette): string {
  const trail: Pt[] = [
    [640, 1470],
    [560, 1540],
    [520, 1620],
    [400, 1690],
    [260, 1730],
    [120, 1790],
  ];
  const pts = spline(trail, 18);
  let out = '';
  pts.forEach(([x, y], i) => {
    if (i === 0) return;
    const side = i % 2 ? 1 : -1;
    const k = 0.8 + (y - 1400) / 1100;
    const px = x + side * 12 * k;
    out += path(ellipse(px, y, 9 * k, 6 * k, -20), p.print, op(0.8));
    out += path(ellipse(px - 5 * k, y - 10 * k, 3.4 * k, 2.8 * k), p.print, op(0.8));
    out += path(ellipse(px + 5 * k, y - 10 * k, 3.4 * k, 2.8 * k), p.print, op(0.8));
  });
  return out;
}

function landDetails(p: Palette): string {
  return layered([
    [POND[1], pond(POND[0], POND[1], 380, 74, p)],
    ...scatterSnow(21, 30, HORIZON + 80, 1900, (x, y, r) => sastrugi(x, y, range(r, 0.7, 1.4), p)),
    ...scatterSnow(33, 24, 1000, 1900, (x, y, r) => tuft(x, y, range(r, 0.8, 1.3), p)),
    ...scatterSnow(45, 9, 1000, 1880, (x, y, r) => pebble(x, y, range(r, 0.7, 1.2), p)),
  ]);
}

function pineTier(
  cx: number,
  top: number,
  bottom: number,
  half: number,
  p: Palette,
  r: () => number,
): string {
  const hh = bottom - top;
  const ctrl = (s: number): Pt => [cx + s * half * 0.42, top + hh * 0.62];
  const droop = hh * 0.16;
  const n = 2 * (2 + Math.round(half / 90));
  const scallops = (from: number, to: number) => {
    let d = '';
    for (let j = from; j < to; j++) {
      const xa = cx + half - (2 * half * j) / n;
      const xb = cx + half - (2 * half * (j + 1)) / n;
      d += `Q${f((xa + xb) / 2)} ${f(bottom + droop * range(r, 0.8, 1.15))} ${f(xb)} ${f(bottom)}`;
    }
    return d;
  };
  const right = `M${f(cx)} ${f(top)}Q${f(ctrl(1)[0])} ${f(ctrl(1)[1])} ${f(cx + half)} ${f(bottom)}`;
  const body = `${right}${scallops(0, n)}Q${f(ctrl(-1)[0])} ${f(ctrl(-1)[1])} ${f(cx)} ${f(top)}Z`;
  const litD = `${right}${scallops(0, n / 2)}L${f(cx)} ${f(top)}Z`;
  const u = 0.52;
  const at = (s: number): Pt => {
    const c = ctrl(s);
    const R: Pt = [cx + s * half, bottom];
    return [
      (1 - u) ** 2 * cx + 2 * (1 - u) * u * c[0] + u * u * R[0],
      (1 - u) ** 2 * top + 2 * (1 - u) * u * c[1] + u * u * R[1],
    ];
  };
  const sub = (s: number): Pt => [cx + u * s * half * 0.42, top + u * hh * 0.62];
  const [ex, ey] = at(1);
  const m = 2 * (2 + Math.round(half / 110));
  const drips = (from: number, to: number) => {
    let d = '';
    for (let j = from; j < to; j++) {
      const xa = ex - (2 * (ex - cx) * j) / m;
      const xb = ex - (2 * (ex - cx) * (j + 1)) / m;
      const deep = j % 2 ? hh * 0.2 : hh * 0.08;
      d += `Q${f((xa + xb) / 2)} ${f(ey + deep * range(r, 0.8, 1.2))} ${f(xb)} ${f(ey)}`;
    }
    return d;
  };
  const capRight = `M${f(cx)} ${f(top - 4)}Q${f(sub(1)[0] + 6)} ${f(sub(1)[1] - 2)} ${f(ex + 8)} ${f(ey)}`;
  const cap = `${capRight}${drips(0, m)}Q${f(sub(-1)[0] - 6)} ${f(sub(-1)[1] - 2)} ${f(cx)} ${f(top - 4)}Z`;
  const capLit = `${capRight}${drips(0, m / 2)}L${f(cx)} ${f(top - 4)}Z`;
  return (
    path(body, p.pineDark) + path(litD, p.pine) + path(cap, p.snowShade) + path(capLit, p.snowTop)
  );
}

function pine(x: number, y: number, h: number, p: Palette, seed: number): string {
  const r = rng(seed);
  const trunkH = h * 0.09;
  const tiers = 5;
  const body = h - trunkH;
  let out =
    path(ellipse(x - h * 0.08, y + 6, h * 0.34, h * 0.05), p.snowShade, op(0.75)) +
    path(roundRect(x - h * 0.04, y - trunkH - 12, h * 0.08, trunkH + 16, h * 0.02), p.trunk);
  for (let i = 0; i < tiers; i++) {
    const u = i / tiers;
    const bottom = y - trunkH - body * u * 0.84;
    const top = i === tiers - 1 ? y - h : bottom - body * (0.4 - u * 0.05);
    const half = h * (0.3 - u * 0.19) * range(r, 0.95, 1.05);
    out += pineTier(x, top, bottom, half, p, r);
  }
  return out + snowBank(x - h * 0.13, x + h * 0.15, y + 4, h / 520, p, seed + 1);
}

const PINE_LIST: [number, number, number, number][] = [
  [60, 1150, 420, 41],
  [500, 1170, 470, 43],
  [270, 1210, 640, 45],
  [690, 1236, 330, 47],
];

function pines(p: Palette): string {
  return PINE_LIST.map(([x, y, h, s]) => pine(x, y, h, p, s)).join('');
}

function iglooDome(
  id: string,
  x: number,
  y: number,
  rx: number,
  ry: number,
  rows: number[],
  p: Palette,
): string {
  const dome = `M${f(x - rx)} ${f(y + 2)}A${f(rx)} ${f(ry)} 0 0 1 ${f(x + rx)} ${f(y + 2)}Z`;
  const bend = (half: number) => half * 0.12;
  const halfAt = (hgt: number) => rx * Math.sqrt(Math.max(0, 1 - (hgt / ry) ** 2));
  const sag = (hgt: number, jx: number) => {
    const half = halfAt(hgt);
    const t = (jx - x) / Math.max(1, half);
    return (bend(half) / 2) * Math.max(0, 1 - t * t);
  };
  let lines = '';
  for (const hgt of rows) {
    const half = halfAt(hgt);
    lines += stroke(
      curve(x - half, y - hgt, x + half, y - hgt, bend(half)),
      p.iglooLine,
      rx * 0.022,
    );
  }
  const bands = [0, ...rows];
  for (let k = 0; k < bands.length - 1; k++) {
    const y0 = bands[k];
    const y1 = bands[k + 1];
    const half = halfAt((y0 + y1) / 2);
    const n = Math.max(2, Math.round(half / (rx * 0.24)));
    for (let j = 0; j <= n; j++) {
      const th = -Math.PI / 2 + (Math.PI * (j + (k % 2 ? 0.5 : 0))) / n;
      if (Math.abs(th) > Math.PI / 2 - 0.15) continue;
      const jx = x + half * Math.sin(th);
      lines += stroke(
        `M${f(jx)} ${f(y - y0 + (k ? sag(y0, jx) : 0))}L${f(jx)} ${f(y - y1 + sag(y1, jx))}`,
        p.iglooLine,
        rx * 0.02,
      );
    }
  }
  return (
    `<defs>${clipDef(id, dome)}</defs>` +
    path(dome, p.iglooShade) +
    clipped(
      id,
      path(ellipse(x + rx * 0.22, y - ry * 0.62, rx * 0.98, ry * 0.98), p.igloo) +
        lines +
        path(ellipse(x + rx * 0.34, y - ry * 0.76, rx * 0.2, ry * 0.09, -24), p.snowRim, op(0.85)),
    )
  );
}

function snowBank(
  x0: number,
  x1: number,
  y: number,
  s: number,
  p: Palette,
  seed: number,
  skip?: (x: number, y: number) => boolean,
): string {
  const r = rng(seed);
  const n = Math.max(2, Math.round((x1 - x0) / (40 * s)));
  let shade = '';
  let lit = '';
  for (let i = 0; i <= n; i++) {
    const bx = x0 + ((x1 - x0) * i) / n + range(r, -6, 6) * s;
    const rr = range(r, 14, 24) * s;
    if (skip?.(bx, y)) continue;
    shade += ellipse(bx - 5 * s, y + 3 * s, rr * 1.4, rr * 0.78);
    lit += ellipse(bx + 3 * s, y - 2 * s, rr * 1.2, rr * 0.62);
  }
  return shade ? path(shade, p.snowShade) + path(lit, p.snowTop) : '';
}

function igloo(p: Palette, mode: Mode): string {
  const [x, y] = IGLOO;
  const night = mode === 'night';
  const rx = 224;
  const ry = 196;
  const tx = x - 150;
  const ty = y + 22;
  const dw = 52;
  const door = `M${f(tx - dw)} ${f(ty + 2)}L${f(tx - dw)} ${f(ty - 44)}A${dw} ${dw} 0 0 1 ${f(tx + dw)} ${f(ty - 44)}L${f(tx + dw)} ${f(ty + 2)}Z`;
  const doorIn = `M${f(tx - 36)} ${f(ty + 2)}L${f(tx - 36)} ${f(ty - 38)}A36 36 0 0 1 ${f(tx + 36)} ${f(ty - 38)}L${f(tx + 36)} ${f(ty + 2)}Z`;
  const wx = x + 110;
  const wy = y - 100;
  return (
    path(ellipse(x - 60, y + 12, rx * 1.32, 36), p.snowShade, op(0.8)) +
    (night
      ? `<defs>${radialGlow('plIglooWarm', p.lamp, 0.7)}</defs>` +
        `<ellipse cx="${f(tx)}" cy="${f(ty + 30)}" rx="280" ry="58" fill="url(#plIglooWarm)"/>`
      : '') +
    iglooDome('plIglooDome', x, y, rx, ry, [40, 80, 116, 148, 174], p) +
    path(roundRect(wx - 34, wy - 26, 68, 52, 12), p.iglooLine) +
    path(roundRect(wx - 26, wy - 18, 52, 36, 8), p.window) +
    path(roundRect(wx - 20, wy - 13, 18, 10, 5), p.snowRim, op(night ? 0.4 : 0.8)) +
    (night ? `<circle cx="${f(wx)}" cy="${f(wy)}" r="100" fill="url(#plIglooWarm)"/>` : '') +
    iglooDome('plIglooTunnel', tx, ty, 112, 110, [38, 74], p) +
    path(door, p.door) +
    path(doorIn, p.doorDeep) +
    (night ? `<circle cx="${f(tx)}" cy="${f(ty - 30)}" r="140" fill="url(#plIglooWarm)"/>` : '') +
    snowBank(tx + dw + 6, x + rx + 14, y + 6, 1, p, 5) +
    snowBank(tx - 150, tx - dw - 8, ty + 8, 0.9, p, 7) +
    snowBank(tx + dw + 4, tx + 112, ty + 8, 0.8, p, 9)
  );
}

function snowballs(p: Palette): string {
  const [x, y] = BALLS;
  const balls: [number, number, number][] = [
    [-68, -33, 33],
    [0, -35, 35],
    [66, -32, 32],
    [-34, -92, 31],
    [34, -91, 30],
    [0, -144, 28],
  ];
  let out = path(ellipse(x - 26, y + 2, 130, 18), p.snowShade, op(0.8));
  for (const [dx, dy, r0] of balls) {
    const bx = x + dx;
    const by = y + dy;
    out +=
      path(circle(bx, by, r0), p.snowShade) +
      path(circle(bx + r0 * 0.14, by - r0 * 0.14, r0 * 0.84), p.snowTop) +
      path(ellipse(bx + r0 * 0.3, by - r0 * 0.4, r0 * 0.22, r0 * 0.13, -30), p.snowRim, op(0.9));
  }
  return out;
}

function floe(x: number, y: number, w: number, h: number, t: number, p: Palette, seed: number) {
  const r = rng(seed);
  const n = 11;
  const pts: Pt[] = [];
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2 + range(r, -0.14, 0.14);
    const k = range(r, 0.8, 1.06);
    pts.push([x + Math.cos(a) * (w / 2) * k, y + Math.sin(a) * (h / 2) * k]);
  }
  const top = smooth(pts, true, 0.4);
  const left = pts.reduce((a, b) => (b[0] < a[0] ? b : a));
  const right = pts.reduce((a, b) => (b[0] > a[0] ? b : a));
  const down = (dy: number) => smooth(shift(pts, 0, dy), true, 0.4);
  return (
    path(down(t + 10), p.iceUnder, op(0.3)) +
    stroke(ellipse(x, y + t + 2, w * 0.52, h * 0.5), p.foam, 4, sop(0.55)) +
    path(down(t), p.iceSide) +
    path(poly([left, [left[0], left[1] + t], [right[0], right[1] + t], right]), p.iceSide) +
    path(top, p.ice) +
    path(scalePath(top, 0.72, 0.6, x + w * 0.06, y - h * 0.1), p.snowRim, op(0.65))
  );
}

function chunk(x: number, y: number, s: number, p: Palette): string {
  const top = poly([
    [x - 22 * s, y - 4 * s],
    [x - 8 * s, y - 14 * s],
    [x + 18 * s, y - 10 * s],
    [x + 24 * s, y + 2 * s],
    [x + 4 * s, y + 8 * s],
  ]);
  const side = poly([
    [x - 22 * s, y - 4 * s],
    [x + 4 * s, y + 8 * s],
    [x + 24 * s, y + 2 * s],
    [x + 24 * s, y + 12 * s],
    [x + 4 * s, y + 18 * s],
    [x - 22 * s, y + 6 * s],
  ]);
  return (
    path(ellipse(x + 2 * s, y + 16 * s, 30 * s, 6 * s), p.iceUnder, op(0.35)) +
    path(side, p.iceSide) +
    path(top, p.ice)
  );
}

const FLOES: [number, number, number, number, number, number][] = [
  [1656, 1614, 390, 76, 28, 51],
  [2770, 992, 170, 32, 13, 53],
  [1470, 1300, 130, 28, 12, 55],
  [1560, 1440, 84, 18, 9, 57],
  [2380, 1304, 90, 20, 9, 59],
  [1350, 920, 70, 12, 7, 61],
  [2900, 930, 90, 12, 7, 63],
];

const CHUNKS: [number, number, number][] = [
  [1560, 1690, 1],
  [1960, 1712, 0.8],
  [2130, 1700, 1.1],
  [2290, 1712, 0.7],
  [1330, 1250, 0.8],
  [1290, 1560, 0.9],
  [2700, 1420, 0.8],
  [1700, 1240, 0.6],
];

function distantBergs(p: Palette): string {
  const berg = (x: number, w: number, h: number) =>
    path(
      poly([
        [x - w / 2, HORIZON + 4],
        [x - w * 0.3, HORIZON - h * 0.7],
        [x - w * 0.05, HORIZON - h],
        [x + w * 0.2, HORIZON - h * 0.8],
        [x + w / 2, HORIZON + 4],
      ]),
      p.iceMid,
    ) +
    path(
      poly([
        [x - w / 2, HORIZON + 4],
        [x - w * 0.3, HORIZON - h * 0.7],
        [x - w * 0.05, HORIZON - h],
        [x - w * 0.12, HORIZON + 4],
      ]),
      p.iceShade,
    );
  return berg(1800, 110, 34) + berg(1930, 60, 18) + berg(2470, 80, 24);
}

function foamLine(x0: number, x1: number, y: number, p: Palette): string {
  const n = Math.max(3, Math.round((x1 - x0) / 34));
  let d = `M${f(x0)} ${f(y)}`;
  for (let i = 0; i < n; i++) {
    const a = x0 + ((x1 - x0) * i) / n;
    const b = x0 + ((x1 - x0) * (i + 1)) / n;
    d += `Q${f((a + b) / 2)} ${f(y + (i % 2 ? -7 : 7))} ${f(b)} ${f(y)}`;
  }
  return stroke(d, p.foam, 6, sop(0.8));
}

function seaArt(p: Palette, mode: Mode): string {
  const night = mode === 'night';
  const r = rng(17);
  let marks = '';
  for (let i = 0; i < 50; i++) {
    const x = range(r, 1140, 3160);
    const y = range(r, HORIZON + 20, SEA_FRONT - 20);
    if (!inSea(x, y, 34)) continue;
    const k = 0.45 + ((y - HORIZON) / (SEA_FRONT - HORIZON)) * 1.1;
    marks += stroke(
      `M${f(x - 24 * k)} ${f(y)}Q${f(x - 12 * k)} ${f(y - 7 * k)} ${f(x)} ${f(y)}T${f(x + 24 * k)} ${f(y)}`,
      p.seaLight,
      4.5 * k,
      sop(0.3 + k * 0.22),
    );
  }
  let shine = '';
  const rs = rng(23);
  for (let i = 0; i < 34; i++) {
    const x = range(rs, 1100, 3200);
    const y = range(rs, HORIZON + 14, 1560);
    if (!inSea(x, y, 40)) continue;
    const k = 0.5 + ((y - HORIZON) / (SEA_FRONT - HORIZON)) * 1.2;
    const len = range(rs, 50, 170) * k;
    shine += path(
      ellipse(x, y, len, (night ? 5 : 4) * k),
      night ? (i % 3 ? p.auroraGreen : p.auroraViolet) : p.glint,
      op(night ? range(rs, 0.2, 0.4) : range(rs, 0.22, 0.45)),
    );
  }
  const holes = SEA_ROCKS.flatMap(rockHoles);
  const floes = FLOES.map(([x, y, w, h, t, s]) => floe(x, y, w, h, t, p, s)).join('');
  const chunks = CHUNKS.map(([x, y, s]) => chunk(x, y, s, p)).join('');
  const lip = (pts: Pt[]) => stroke(smooth(pts, false), p.lip, 16, sop(0.36));
  const rockFoam = SEA_ROCKS.map((rk) => {
    const { x0, x1, y1 } = frame(rk);
    return foamLine(x0 - 10, x1 + 10, y1 - 6, p);
  }).join('');
  return (
    `<defs>${vgrad('plSeaGrad', HORIZON, SEA_FRONT, [
      [0, p.waterFar],
      [0.4, p.water],
      [1, p.waterNear],
    ])}${clipDef('plSea', SEA_D)}</defs>` +
    clipped(
      'plSea',
      cutOut(
        'plSeaHole',
        holes,
        path(SEA_D, 'url(#plSeaGrad)') +
          (night
            ? `<defs>${radialGlow('plSeaSheen', p.auroraGreen, 0.22)}</defs>` +
              `<ellipse cx="1900" cy="${HORIZON + 40}" rx="1100" ry="170" fill="url(#plSeaSheen)"/>`
            : '') +
          stroke(`M900 ${HORIZON + 3}L3300 ${HORIZON + 3}`, p.seaLight, 5, sop(0.6)) +
          lip(LEFT_SHORE) +
          lip(BANK) +
          lip(RIGHT_SHORE) +
          shine +
          marks +
          chunks +
          floes,
      ) + rockFoam,
    ) +
    distantBergs(p)
  );
}

function iceberg(p: Palette, mode: Mode): string {
  const [x, y] = BERG;
  const T = (pts: Pt[]): Pt[] => pts.map(([dx, dy]) => [x + dx, y + dy]);
  const sil = T([
    [-300, 2],
    [-282, -70],
    [-236, -118],
    [-206, -214],
    [-150, -262],
    [-112, -356],
    [-58, -430],
    [-20, -512],
    [26, -470],
    [62, -392],
    [104, -360],
    [136, -404],
    [172, -330],
    [210, -232],
    [252, -180],
    [284, -96],
    [306, 2],
  ]);
  const leftFace = T([
    [-20, -512],
    [-58, -430],
    [-112, -356],
    [-150, -262],
    [-206, -214],
    [-236, -118],
    [-282, -70],
    [-300, 2],
    [-160, 2],
    [-128, -120],
    [-76, -236],
    [-44, -372],
  ]);
  const frontFace = T([
    [-44, -372],
    [-76, -236],
    [-128, -120],
    [-160, 2],
    [96, 2],
    [120, -112],
    [92, -250],
    [104, -360],
    [62, -392],
    [26, -470],
    [-20, -512],
  ]);
  const crevice = T([
    [-30, 2],
    [-14, -120],
    [8, -262],
    [18, -120],
    [36, 2],
  ]);
  const under = smooth(
    T([
      [-316, 4],
      [-346, 70],
      [-270, 150],
      [-110, 196],
      [70, 190],
      [236, 132],
      [326, 56],
      [318, 4],
    ]),
    true,
  );
  return (
    `<defs>${vgrad('plBergUnder', y, y + 200, [
      [0, p.iceUnder, 0.6],
      [1, p.iceUnder, 0],
    ])}</defs>` +
    path(under, 'url(#plBergUnder)') +
    path(scalePath(under, 0.62, 0.55, x, y), p.iceUnder, op(0.2)) +
    path(poly(sil), p.ice) +
    path(poly(frontFace), p.iceMid) +
    path(poly(leftFace), p.iceShade) +
    path(poly(crevice), p.iceDeep, op(0.8)) +
    stroke(
      poly(
        T([
          [-20, -506],
          [26, -466],
          [62, -388],
          [104, -356],
          [136, -398],
        ]),
        false,
      ),
      p.snowRim,
      7,
      sop(0.9),
    ) +
    path(
      poly(
        T([
          [140, -390],
          [168, -330],
          [206, -232],
          [250, -176],
          [222, -170],
          [180, -250],
        ]),
      ),
      p.snowRim,
      op(mode === 'night' ? 0.35 : 0.7),
    ) +
    (mode === 'night' ? path(poly(sil), p.auroraGreen, op(0.1)) : '') +
    stroke(curve(x - 310, y + 2, x + 316, y + 2, 14), p.foam, 7, sop(0.85)) +
    stroke(curve(x - 250, y + 22, x + 250, y + 22, 10), p.foam, 4, sop(0.45))
  );
}

function icicles(p: Palette): string {
  const under = (x: number) => 1372 + ((x - 2700) * 12) / 80;
  const list: [number, number, number][] = [
    [2704, 78, 12],
    [2732, 122, 14],
    [2760, 66, 11],
    [2790, 120, 15],
    [2820, 88, 12],
    [2846, 100, 13],
  ];
  return list
    .map(([x, len, w]) => {
      const top = under(x) - 8;
      const d = `M${f(x - w)} ${f(top)}Q${f(x - w * 0.7)} ${f(top + len * 0.6)} ${f(x)} ${f(top + len)}Q${f(x + w * 0.7)} ${f(top + len * 0.6)} ${f(x + w)} ${f(top)}Z`;
      const shade = `M${f(x - w)} ${f(top)}Q${f(x - w * 0.7)} ${f(top + len * 0.6)} ${f(x)} ${f(top + len)}L${f(x - w * 0.2)} ${f(top)}Z`;
      return (
        path(d, p.icicle) +
        path(shade, p.icicleShade) +
        stroke(
          `M${f(x + w * 0.45)} ${f(top + 8)}L${f(x + w * 0.15)} ${f(top + len * 0.6)}`,
          p.snowRim,
          3.5,
          sop(0.9),
        ) +
        path(circle(x, top + len + 8, 4.5), p.icicle)
      );
    })
    .join('');
}

type Curtain = { base: Pt[]; h: [number, number, number]; seed: number; a: number; tint: number };

const CURTAINS: Curtain[] = [
  {
    base: [
      [520, 270],
      [980, 180],
      [1500, 136],
      [2020, 120],
      [2560, 176],
    ],
    h: [150, 220, 170],
    seed: 81,
    a: 0.62,
    tint: 0.3,
  },
  {
    base: [
      [-60, 610],
      [300, 530],
      [700, 590],
      [1100, 520],
      [1450, 400],
      [1820, 340],
      [2220, 400],
      [2620, 350],
      [2960, 250],
    ],
    h: [260, 380, 300],
    seed: 83,
    a: 1,
    tint: 0,
  },
  {
    base: [
      [1500, 740],
      [1900, 690],
      [2350, 720],
      [2820, 640],
    ],
    h: [140, 200, 150],
    seed: 85,
    a: 0.8,
    tint: 0.1,
  },
];

function auroraTone(p: Palette, u: number): string {
  const list: [number, string][] = [
    [0, p.auroraEdge],
    [0.16, p.auroraGreen],
    [0.45, p.auroraTeal],
    [0.75, p.auroraViolet],
    [1, p.auroraPink],
  ];
  for (let i = 1; i < list.length; i++) {
    if (u <= list[i][0]) {
      const [u0, c0] = list[i - 1];
      const [u1, c1] = list[i];
      return mix(c0, c1, (u - u0) / (u1 - u0));
    }
  }
  return p.auroraPink;
}

function curtain(c: Curtain, p: Palette): string {
  const r = rng(c.seed);
  const N = 40;
  const pts = spline(c.base, N);
  const n = pts.length;
  const wobble = (lo: number, hi: number, passes: number) => {
    let v = pts.map(() => range(r, lo, hi));
    for (let k = 0; k < passes; k++) {
      const prev = v;
      v = prev.map((x, i) => (prev[Math.max(0, i - 1)] + x * 2 + prev[Math.min(n - 1, i + 1)]) / 4);
    }
    return v;
  };
  const swell = wobble(0.72, 1.24, 2);
  const hgt = (i: number) => {
    const u = i / (n - 1);
    const [a, b, e] = c.h;
    const ramp = (v: number) => {
      const t = Math.min(1, Math.max(0, v / 0.1));
      return t * t * (3 - 2 * t);
    };
    return (
      (u < 0.5 ? a + (b - a) * (u / 0.5) : b + (e - b) * ((u - 0.5) / 0.5)) *
      swell[i] *
      ramp(u) *
      ramp(1 - u)
    );
  };
  const at = (t: number): [number, number, number] => {
    const i = Math.min(n - 2, Math.floor(t));
    const k = t - i;
    return [
      pts[i][0] + (pts[i + 1][0] - pts[i][0]) * k,
      pts[i][1] + (pts[i + 1][1] - pts[i][1]) * k,
      hgt(i) + (hgt(i + 1) - hgt(i)) * k,
    ];
  };
  const lower = smooth(c.base, false);
  let out =
    stroke(smooth(shift(c.base, 0, -50), false), p.auroraGreen, 120, sop(c.a * 0.06)) +
    stroke(smooth(shift(c.base, 0, -24), false), p.auroraGreen, 56, sop(c.a * 0.08));
  const K = 8;
  for (let k = K; k >= 1; k--) {
    const u = k / K;
    const own = wobble(0.8, 1.16, 1);
    const t = pts.map(([x, y], i): Pt => [x, y - hgt(i) * own[i] * u]).reverse();
    out += path(
      `${lower}L${f(t[0][0])} ${f(t[0][1])}${tail(t)}Z`,
      auroraTone(p, Math.min(1, u * (1 - c.tint) + c.tint)),
      op(c.a * 0.11),
    );
  }
  const ray = (wMin: number, wMax: number, lMin: number, lMax: number, a: number) => {
    const [x, y, h] = at(range(r, 0.5, n - 1.5));
    const len = h * range(r, lMin, lMax);
    const w = range(r, wMin, wMax);
    return path(
      poly([
        [x - w / 2, y + 6],
        [x + w / 2, y + 6],
        [x + w * 0.3, y - len],
        [x - w * 0.3, y - len],
      ]),
      'url(#plRay)',
      op(c.a * a),
    );
  };
  for (let j = 0; j < 5; j++) out += ray(50, 90, 0.85, 1, 0.28);
  for (let j = 0; j < 40; j++) out += ray(6, 16, 0.5, 1.02, range(r, 0.45, 0.95));
  const edge = smooth(pts.slice(2, n - 2), false);
  return (
    out +
    stroke(edge, p.auroraGreen, 22, sop(c.a * 0.26)) +
    stroke(edge, p.auroraEdge, 6, sop(c.a * 0.82))
  );
}

function aurora(p: Palette): string {
  return (
    `<defs>${clipDef('plSkyClip', SKY_CLIP)}<linearGradient id="plRay" x1="0" y1="1" x2="0" y2="0">${stops(
      [
        [0, p.auroraEdge, 0.8],
        [0.25, p.auroraGreen, 0.55],
        [0.65, p.auroraViolet, 0.25],
        [1, p.auroraPink, 0],
      ],
    )}</linearGradient></defs>` + clipped('plSkyClip', CURTAINS.map((c) => curtain(c, p)).join(''))
  );
}

function pearlCloud(x: number, y: number, w: number, h: number, p: Palette): string {
  const lens = (cx: number, cy: number, hw: number, hh: number) =>
    `M${f(cx - hw)} ${f(cy)}Q${f(cx - hw * 0.1)} ${f(cy - hh * 2.1)} ${f(cx + hw)} ${f(cy)}Q${f(cx + hw * 0.1)} ${f(cy + hh * 1.1)} ${f(cx - hw)} ${f(cy)}Z`;
  return (
    path(lens(x, y + h * 0.3, w * 0.5, h * 0.8), p.pearlShade, op(0.9)) +
    path(lens(x - w * 0.02, y, w * 0.47, h * 0.75), p.pearlPink, op(0.85)) +
    path(lens(x + w * 0.02, y - h * 0.22, w * 0.42, h * 0.62), p.pearlMint, op(0.85)) +
    path(lens(x, y - h * 0.4, w * 0.36, h * 0.5), p.cloud) +
    path(lens(x + w * 0.06, y - h * 0.66, w * 0.2, h * 0.28), p.pearlLilac, op(0.7))
  );
}

function pearlClouds(p: Palette): string {
  return pearlCloud(980, 330, 560, 60, p) + pearlCloud(1960, 230, 680, 66, p);
}

function sunWithSpinningRays(p: Palette): string {
  const svg = sun(SUN[0], SUN[1], 104, p.sun, p.sunRay, p.face);
  const rays = (svg.match(/<path[^>]*\/>/g) ?? []).slice(0, 12).join('');
  return svg.replace(
    rays,
    `<g data-spin="" style="transform-origin: ${SUN[0]}px ${SUN[1]}px">${rays}</g>`,
  );
}

const day: Palette = {
  skyTop: '#5db3ea',
  skyMid: '#a3daf6',
  skyBottom: '#e8f7fe',
  haze: '#fff3e2',
  sun: '#ffd34d',
  sunRay: '#ffbf38',
  face: '#8a4b1f',
  star: '#fff6e0',
  cloud: '#ffffff',
  pearlShade: '#d4e4f3',
  pearlPink: '#ffe0ef',
  pearlMint: '#d6f6ea',
  pearlLilac: '#e6dcff',
  auroraGreen: '#7dffb6',
  auroraTeal: '#43e3c6',
  auroraViolet: '#a882ff',
  auroraPink: '#ff8fd8',
  auroraEdge: '#dcffe9',
  mountFar: '#b9cbe2',
  mountFarShade: '#a5b9d6',
  mountFarSnow: '#eef4fb',
  mountFarSnowShade: '#d5e1ef',
  mount: '#9fb3d0',
  mountShade: '#869dc0',
  mountSnow: '#f3f8fd',
  mountSnowShade: '#cbd9eb',
  farSnow: '#e2ecf6',
  glacier: '#f3f9fd',
  glacierFace: '#c4def0',
  glacierCrack: '#97c2e0',
  snowRim: '#ffffff',
  snowTop: '#f6fafd',
  snow: '#e8f1f8',
  snowMid: '#d6e4f0',
  snowShade: '#b8cde1',
  print: '#bed2e4',
  grass: '#cdbd8e',
  grassDark: '#ab9c6c',
  waterFar: '#7cc2ea',
  water: '#2f80c8',
  waterNear: '#1c5aa8',
  lip: '#123f80',
  seaLight: '#bfe6fb',
  foam: '#ffffff',
  glint: '#ffffff',
  ice: '#f5fbff',
  iceMid: '#d6edf9',
  iceShade: '#a9d3ec',
  iceDeep: '#78b6dc',
  iceUnder: '#7fe0f0',
  iceSide: '#9dcbe7',
  rock: '#6f7f97',
  rockShade: '#56657d',
  rockLight: '#8f9db4',
  rockDark: '#3c4759',
  pine: '#2f7c64',
  pineDark: '#23594c',
  trunk: '#8a5a3c',
  igloo: '#f4f9fd',
  iglooShade: '#c7d9e9',
  iglooLine: '#aec5da',
  door: '#3e5b7c',
  doorDeep: '#2b4262',
  window: '#bfe7f8',
  lamp: '#ffc95a',
  icicle: '#e3f5fe',
  icicleShade: '#a7d4ee',
  pond: '#a6daf2',
  pondLight: '#d2effb',
};

const night: Palette = {
  skyTop: '#040922',
  skyMid: '#0b1c48',
  skyBottom: '#173f6e',
  sun: '#fff1c0',
  sunRay: '#ffe9a8',
  face: '#7a5a34',
  star: '#fff6e0',
  auroraGreen: '#7dffb6',
  auroraTeal: '#43e3c6',
  auroraViolet: '#a882ff',
  auroraPink: '#ff8fd8',
  auroraEdge: '#dcffe9',
  snowRim: '#c4d3f2',
  snowTop: '#a3b5e2',
  snow: '#91a5d6',
  snowMid: '#8195ca',
  snowShade: '#6b7db8',
  print: '#6f81bb',
  farSnow: '#7a8cc4',
  glacier: '#a1b3e0',
  glacierFace: '#7487c2',
  glacierCrack: '#5e70ac',
  waterFar: '#29558f',
  water: '#183c7a',
  waterNear: '#0f2b60',
  lip: '#081a42',
  seaLight: '#7098dc',
  foam: '#b8cbf2',
  ice: '#bccdf2',
  iceMid: '#a0b5e6',
  iceShade: '#7f97d2',
  iceDeep: '#627cbb',
  iceUnder: '#3fa9c2',
  iceSide: '#7f96d0',
  igloo: '#b0c1ea',
  iglooShade: '#8a9dd2',
  iglooLine: '#7a8dc4',
  door: '#ffcf6a',
  doorDeep: '#ffb347',
  window: '#ffe39a',
  lamp: '#ffc95a',
  icicle: '#bed2f4',
  icicleShade: '#8aa4d8',
  pond: '#5b7cc6',
  pondLight: '#7d9de0',
};

const interactives: Interactive[] = [
  {
    id: 'aurora',
    box: [0, 0, 3060, 790],
    kind: 'glow',
    effect: 'sparkle',
    effectAt: [1500, 360],
    sound: 'shine',
    night: { kind: 'glow', effect: 'stars', sound: 'twinkle' },
    render: (p, mode) => (mode === 'day' ? pearlClouds(p) : aurora(p)),
  },
  {
    id: 'pines',
    box: [-160, 540, 980, 740],
    kind: 'shake',
    origin: [330, 1220],
    effect: 'sparkle',
    effectAt: [300, 760],
    sound: 'rustle',
    render: (p) => pines(p),
  },
  {
    id: 'igloo',
    box: [IGLOO[0] - 440, IGLOO[1] - 222, 730, 372],
    kind: 'wiggle',
    origin: [IGLOO[0], IGLOO[1]],
    effect: 'hearts',
    effectAt: [IGLOO[0], IGLOO[1] - 220],
    sound: 'giggle',
    night: { kind: 'glow', effect: 'sparkle', sound: 'chime' },
    render: (p, mode) => igloo(p, mode),
  },
  {
    id: 'snowballs',
    box: [BALLS[0] - 180, BALLS[1] - 200, 320, 230],
    kind: 'bounce',
    origin: [BALLS[0], BALLS[1]],
    effect: 'smoke',
    effectAt: [BALLS[0], BALLS[1] - 90],
    sound: 'poof',
    render: (p) => snowballs(p),
  },
  {
    id: 'sea',
    box: [960, 820, 2300, 940],
    kind: 'pulse',
    origin: [2100, 1300],
    effect: 'splash',
    effectAt: [1800, 1450],
    sound: 'splash',
    render: (p, mode) => seaArt(p, mode),
  },
  {
    id: 'iceberg',
    box: [BERG[0] - 400, BERG[1] - 540, 800, 760],
    kind: 'rock',
    origin: [BERG[0], BERG[1]],
    effect: 'splash',
    effectAt: [BERG[0], BERG[1] + 10],
    sound: 'creak',
    render: (p, mode) => iceberg(p, mode),
  },
  {
    id: 'icicles',
    box: [2670, 1340, 220, 196],
    kind: 'shake',
    origin: [2776, 1376],
    effect: 'sparkle',
    sound: 'chime',
    render: (p) => icicles(p),
  },
  {
    id: 'sun',
    box: [SUN[0] - 286, SUN[1] - 286, 572, 572],
    kind: 'spin',
    origin: SUN,
    effect: 'sparkle',
    sound: 'shine',
    night: { kind: 'rock', effect: 'stars', sound: 'twinkle' },
    render: (p, mode) =>
      mode === 'day' ? sunWithSpinningRays(p) : moon(SUN[0], SUN[1], 96, p.sun, p.sunRay, p.face),
  },
];

function back(p: Palette, mode: Mode): string {
  let out = skyLayer(p, mode);
  out += FAR_PEAKS.map((pk, i) =>
    mountain(pk, `plFar${i}`, [p.mountFar, p.mountFarShade, p.mountFarSnow, p.mountFarSnowShade]),
  ).join('');
  out += NEAR_PEAKS.map((pk, i) =>
    mountain(pk, `plNear${i}`, [p.mount, p.mountShade, p.mountSnow, p.mountSnowShade]),
  ).join('');
  out += farLands(p);
  out +=
    `<defs>${vgrad('plWaterBase', HORIZON, SEA_FRONT, [
      [0, p.waterFar],
      [0.4, p.water],
      [1, p.waterNear],
    ])}${vgrad('plLand', HORIZON, 1300, [
      [0, p.farSnow],
      [1, p.snow],
    ])}</defs>` +
    `<rect x="900" y="${HORIZON - 2}" width="2420" height="${SEA_FRONT + 40 - HORIZON}" fill="url(#plWaterBase)"/>` +
    path(LAND_D, 'url(#plLand)');
  out +=
    `<defs>${clipDef('plLandClip', NOT_SEA, true)}</defs>` +
    clipped(
      'plLandClip',
      terrain(p) +
        prints(p) +
        landDetails(p) +
        (mode === 'night'
          ? `<defs>${radialGlow('plLandGlow', p.auroraGreen, 0.16)}</defs>` +
            `<ellipse cx="1300" cy="960" rx="1700" ry="300" fill="url(#plLandGlow)"/>`
          : ''),
    );
  out += shoreEdge(p);
  out += [...LAND_ROCKS, ...SEA_ROCKS]
    .map((rk, i) => {
      const { x0, x1, y1, w } = frame(rk);
      return (
        rockArt(rk, `plRock${i}`, p) +
        snowBank(
          x0 - 4,
          x1 + 4,
          y1 - 2,
          Math.min(1, Math.max(0.5, w / 380)),
          p,
          rk.seed + 5,
          (bx, by) => inSea(bx, by, 16),
        )
      );
    })
    .join('');
  return out;
}

function front(p: Palette): string {
  const drift = (pts: Pt[], id: string) => {
    const top = Math.min(...pts.map(([, y]) => y));
    return (
      stroke(smooth(shift(pts, 0, -6), false), p.snowShade, 30, sop(0.3)) +
      `<defs>${vgrad(id, top, top + 120, [
        [0, p.snowTop],
        [1, p.snowMid],
      ])}</defs>` +
      path(
        `${smooth(pts, false)}L${f(pts[pts.length - 1][0])} 2060L${f(pts[0][0])} 2060Z`,
        `url(#${id})`,
      ) +
      stroke(smooth(shift(pts, 0, 6), false), p.snowRim, 7, sop(0.85))
    );
  };
  return (
    drift(
      [
        [-60, 1880],
        [120, 1858],
        [300, 1890],
        [460, 1950],
        [560, 2040],
      ],
      'plDriftL',
    ) +
    tuft(130, 1880, 1.6, p) +
    tuft(330, 1910, 1.3, p) +
    drift(
      [
        [3180, 2040],
        [3300, 1940],
        [3460, 1900],
        [3660, 1890],
      ],
      'plDriftR',
    ) +
    pebble(1560, 1975, 1.6, p) +
    pebble(2380, 1985, 1.3, p) +
    tuft(2460, 1990, 1.5, p)
  );
}

const polar: SceneDef = {
  id: 'polar',
  world: [W, H],
  horizon: 780,
  ambient: { clouds: 3, birds: 2, stars: 70, sparkles: 14, snow: 42 },
  defaults: [
    { animal: 'polar-bear', x: 1780, y: 1770 },
    { animal: 'penguin', x: 1594, y: 1534 },
    { animal: 'penguin', x: 1714, y: 1548, flip: true, scale: 0.8 },
    { animal: 'seal', x: 2470, y: 1570, flip: true },
    { animal: 'walrus', x: 3004, y: 1420, flip: true },
    { animal: 'sea-lion', x: 3060, y: 1180, flip: true },
    { animal: 'puffin', x: 3452, y: 800, flip: true, scale: 1.3 },
    { animal: 'arctic-fox', x: 520, y: 1740 },
    { animal: 'husky', x: 1000, y: 1534, flip: true },
    { animal: 'reindeer', x: 470, y: 1390 },
    { animal: 'snowy-owl', x: 1300, y: 520 },
    { animal: 'narwhal', x: 1590, y: 1060 },
    { animal: 'beluga', x: 2560, y: 1130, flip: true },
    { animal: 'orca', x: 2050, y: 1456, flip: true },
  ],
  day,
  night,
  interactives,
  back,
  front,
};

export default polar;
