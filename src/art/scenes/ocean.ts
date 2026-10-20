import {
  capsule,
  circle,
  curve,
  ellipse,
  f,
  leaf,
  pathBounds,
  roundRect,
  smooth,
  spiky,
  tube,
  type Bounds,
  type Pt,
} from '../core/paths';
import {
  coral,
  group,
  layered,
  lightRays,
  linearGradient,
  moon,
  palm,
  path,
  radialGlow,
  rock,
  seaweed,
  shell,
  starField,
  stroke,
  sun,
} from './props';
import { range, rng } from './rng';
import type { Mode, Palette, SceneDef } from './types';

const W = 3600;
const H = 2000;
const SURFACE = 250;

function waveLine(y: number, amp: number, step: number): string {
  let d = `M-60 ${f(y)}`;
  for (let x = -60; x < W + 60; x += step) {
    d += `Q${f(x + step / 2)} ${f(y - amp)} ${f(x + step)} ${f(y)}`;
  }
  return d;
}

const SEA = `${waveLine(SURFACE, 16, 120)}L${W + 60} ${H + 60}L-60 ${H + 60}Z`;

function aboveWater(id: string, content: string): string {
  return (
    `<defs><clipPath id="${id}"><path d="M-300 -300H${W + 300}V${H + 300}H-300Z${SEA}" clip-rule="evenodd"/></clipPath></defs>` +
    group(content, '', ` clip-path="url(#${id})"`)
  );
}

function surfaceTint(p: Palette): string {
  return (
    path(
      `${waveLine(SURFACE, 16, 120)}L${W + 60} ${SURFACE + 90}L-60 ${SURFACE + 90}Z`,
      p.waterTop,
      ' opacity=".6"',
    ) +
    stroke(waveLine(SURFACE + 16, 10, 120), p.surfaceLight, 10, ' stroke-opacity=".8"') +
    group(lightRays(-200, W, 1500, p.ray, 10, 5), `translate(0 ${SURFACE})`)
  );
}

function floorD(seed: number, baseY: number, amp: number, bumps: number): string {
  const r = rng(seed);
  const pts: Pt[] = [];
  const step = (W + 400) / bumps;
  for (let i = 0; i <= bumps; i++) {
    pts.push([
      -200 + i * step + range(r, -step * 0.2, step * 0.2),
      baseY - amp * (i % 2 ? range(r, 0.55, 1) : range(r, 0, 0.35)),
    ]);
  }
  return `${smooth(pts, false)}L${W + 200} ${H + 50}L-200 ${H + 50}Z`;
}

function islandSand(x: number, p: Palette): string {
  return (
    path(ellipse(x, SURFACE + 6, 170, 46), p.islandDark) +
    path(ellipse(x - 10, SURFACE + 2, 150, 40), p.island)
  );
}

function islandPalms(x: number, p: Palette): string {
  return (
    palm(x + 20, SURFACE - 22, 0.42, 34, p.trunk, p.trunkDark, p.frond, p.frondDark, p.coconut) +
    palm(x - 50, SURFACE - 16, 0.3, -30, p.trunk, p.trunkDark, p.frond, p.frondDark)
  );
}

function hullPath(x: number): string {
  const y = SURFACE + 4;
  return `M${f(x - 120)} ${f(y - 40)}L${f(x + 130)} ${f(y - 40)}Q${f(x + 110)} ${f(y + 16)} ${f(x + 60)} ${f(y + 20)}L${f(x - 70)} ${f(y + 20)}Q${f(x - 110)} ${f(y + 16)} ${f(x - 120)} ${f(y - 40)}Z`;
}

function sailboat(x: number, p: Palette, lit: boolean): string {
  const y = SURFACE + 4;
  return (
    stroke(`M${f(x)} ${f(y - 30)}L${f(x)} ${f(y - 190)}`, p.mast, 7) +
    path(`M${f(x + 6)} ${f(y - 180)}L${f(x + 96)} ${f(y - 48)}L${f(x + 6)} ${f(y - 48)}Z`, p.sail) +
    path(
      `M${f(x - 6)} ${f(y - 150)}L${f(x - 70)} ${f(y - 48)}L${f(x - 6)} ${f(y - 48)}Z`,
      p.sail2,
    ) +
    path(`M${f(x)} ${f(y - 190)}L${f(x + 34)} ${f(y - 180)}L${f(x)} ${f(y - 168)}Z`, p.flag) +
    path(hullPath(x), p.hull) +
    path(roundRect(x - 112, y - 40, 236, 12, 6), p.hullStripe) +
    path(circle(x - 50, y - 10, 9), p.hullStripe) +
    path(circle(x + 10, y - 10, 9), p.hullStripe) +
    path(circle(x + 70, y - 10, 9), p.hullStripe) +
    (lit
      ? `<defs>${radialGlow('lantern', '#ffd36b', 0.75)}</defs><circle cx="${f(x)}" cy="${f(y - 196)}" r="64" fill="url(#lantern)"/>` +
        path(circle(x, y - 196, 10), '#ffe9a8')
      : '')
  );
}

function kelp(
  x: number,
  y: number,
  h: number,
  s: number,
  color: string,
  dark: string,
  seed: number,
): string {
  const n = Math.max(5, Math.round(h / (115 * s)));
  const pts: Pt[] = [];
  for (let i = 0; i <= n; i++) pts.push([x + Math.sin(i * 0.7 + seed) * 34 * s, y - (h * i) / n]);
  let out = path(
    tube(pts, (u) => (13 - 6 * u) * s),
    dark,
  );
  const r = rng(seed * 31 + 7);
  for (let i = 1; i <= n; i++) {
    const [px, py] = pts[i];
    const side = i % 2 ? 1 : -1;
    const a = side > 0 ? -32 + range(r, -10, 10) : -148 + range(r, -10, 10);
    const len = (150 - i * 5) * s;
    const rad = (a * Math.PI) / 180;
    out += path(leaf(px, py, len, 30 * s, a), i % 3 === 0 ? dark : color);
    out += stroke(
      curve(px, py, px + Math.cos(rad) * len * 0.8, py + Math.sin(rad) * len * 0.8, 0),
      dark,
      3 * s,
      ' stroke-opacity=".45"',
    );
    out += path(circle(px + side * 9 * s, py + 4 * s, 10 * s), color);
  }
  const [tx, ty] = pts[n];
  return out + path(leaf(tx, ty + 4 * s, 110 * s, 26 * s, -90 + range(r, -24, 24)), color);
}

function branchCoral(x: number, y: number, s: number, color: string, tip: string): string {
  const tips: [number, number, number][] = [
    [-10, -150, 12],
    [-60, -150, 9],
    [62, -140, 9],
    [28, -190, 7],
  ];
  return (
    coral(x, y, s, color, 'branch') +
    tips.map(([dx, dy, rr]) => path(circle(x + dx * s, y + dy * s, rr * s), tip)).join('')
  );
}

function fanCoral(x: number, y: number, s: number, color: string, vein: string): string {
  const cy = y - 44 * s;
  const pts: Pt[] = [];
  for (let k = 0; k <= 12; k++) {
    const a = Math.PI + (k / 12) * Math.PI;
    const j = k % 2 ? 1.04 : 0.93;
    pts.push([x + Math.cos(a) * 124 * s * j, cy + Math.sin(a) * 150 * s * j]);
  }
  pts.push([x + 26 * s, y - 26 * s], [x - 26 * s, y - 26 * s]);
  const body = smooth(pts, true);
  const id = `fan${Math.round(x)}x${Math.round(y)}`;
  let veins = '';
  const branch = (x0: number, y0: number, a: number, len: number, w: number, depth: number) => {
    const x1 = x0 + Math.cos(a) * len;
    const y1 = y0 + Math.sin(a) * len;
    veins += stroke(curve(x0, y0, x1, y1, len * 0.08), vein, w, ' stroke-opacity=".6"');
    if (depth > 0) {
      branch(x1, y1, a - 0.38, len * 0.78, w * 0.78, depth - 1);
      branch(x1, y1, a + 0.38, len * 0.78, w * 0.78, depth - 1);
    }
  };
  branch(x, y - 30 * s, -Math.PI / 2 - 0.62, 62 * s, 7 * s, 3);
  branch(x, y - 30 * s, -Math.PI / 2, 70 * s, 8 * s, 3);
  branch(x, y - 30 * s, -Math.PI / 2 + 0.62, 62 * s, 7 * s, 3);
  return (
    `<defs><clipPath id="${id}"><path d="${body}"/></clipPath></defs>` +
    path(roundRect(x - 10 * s, y - 52 * s, 20 * s, 56 * s, 9 * s), color) +
    path(body, color) +
    group(veins, '', ` clip-path="url(#${id})"`)
  );
}

function brainCoral(x: number, y: number, s: number, color: string, line: string): string {
  let out = path(
    `M${f(x - 84 * s)} ${f(y + 4)}C${f(x - 84 * s)} ${f(y - 112 * s)} ${f(x + 84 * s)} ${f(y - 112 * s)} ${f(x + 84 * s)} ${f(y + 4)}Z`,
    color,
  );
  for (let k = 0; k < 3; k++) {
    const half = (62 - k * 16) * s;
    const yy = y - (18 + k * 22) * s;
    const seg = (half * 2) / 6;
    let d = `M${f(x - half)} ${f(yy)}`;
    for (let i = 0; i < 6; i++) d += `q${f(seg / 2)} ${f((i % 2 ? 1 : -1) * 10 * s)} ${f(seg)} 0`;
    out += stroke(d, line, 5 * s, ' stroke-opacity=".55"');
  }
  return out;
}

function fishSchool(
  x: number,
  y: number,
  s: number,
  n: number,
  color: string,
  seed: number,
): string {
  const r = rng(seed);
  let out = '';
  for (let i = 0; i < n; i++) {
    const fx = x + range(r, -150, 150) * s;
    const fy = y + range(r, -60, 60) * s;
    const k = range(r, 0.8, 1.15) * s;
    out +=
      path(ellipse(fx, fy, 24 * k, 12 * k), color) +
      path(
        `M${f(fx - 18 * k)} ${f(fy)}L${f(fx - 38 * k)} ${f(fy - 12 * k)}L${f(fx - 36 * k)} ${f(fy + 12 * k)}Z`,
        color,
      );
  }
  return out;
}

function anemone(x: number, y: number, s: number, color: string, tip: string): string {
  let out = path(roundRect(x - 26 * s, y - 40 * s, 52 * s, 44 * s, 14 * s), color);
  for (let i = -4; i <= 4; i++) {
    const a = ((-90 + i * 17) * Math.PI) / 180;
    const len = (62 - Math.abs(i) * 4) * s;
    const bx = x + i * 5 * s;
    const by = y - 36 * s;
    const tx = bx + Math.cos(a) * len;
    const ty = by + Math.sin(a) * len;
    out += path(capsule(bx, by, tx, ty, 7 * s, 6 * s), color);
    out += path(circle(tx, ty, 7.5 * s), tip);
  }
  return out;
}

function sponges(x: number, y: number, s: number, color: string, dark: string): string {
  const tubes: [number, number, number][] = [
    [-30, 90, 18],
    [4, 130, 21],
    [38, 70, 16],
  ];
  return tubes
    .map(
      ([dx, h, rr]) =>
        path(capsule(x + dx * s, y, x + dx * s, y - h * s, rr * s), color) +
        path(ellipse(x + dx * s, y - h * s, rr * 0.62 * s, rr * 0.34 * s), dark),
    )
    .join('');
}

function starfish(
  x: number,
  y: number,
  s: number,
  rot: number,
  color: string,
  dot: string,
): string {
  let out = path(spiky(x, y, 36 * s, 15 * s, 5, rot, 0.62), color);
  for (let i = 0; i < 5; i++) {
    const a = ((rot + i * 72) * Math.PI) / 180;
    out += path(circle(x + Math.cos(a) * 16 * s, y + Math.sin(a) * 16 * s, 3.4 * s), dot);
  }
  return out + path(circle(x, y, 4 * s), dot);
}

function chest(x: number, y: number, s: number, p: Palette): string {
  const w = 150 * s;
  const h = 86 * s;
  const left = x - w / 2;
  let coins = '';
  const r = rng(Math.round(x));
  for (let i = 0; i < 9; i++) {
    coins += path(
      circle(left + range(r, 18, w - 18), y - h - range(r, -4, 24) * s, 15 * s),
      i % 3 ? p.gold : p.goldDark,
    );
  }
  return (
    path(
      `M${f(left + 6 * s)} ${f(y - h)}L${f(left - 10 * s)} ${f(y - h - 70 * s)}Q${f(x - 10 * s)} ${f(y - h - 120 * s)} ${f(left + w - 26 * s)} ${f(y - h - 72 * s)}L${f(left + w - 6 * s)} ${f(y - h)}Z`,
      p.chestDark,
    ) +
    path(
      `M${f(left + 20 * s)} ${f(y - h - 8 * s)}L${f(left + 6 * s)} ${f(y - h - 62 * s)}Q${f(x - 10 * s)} ${f(y - h - 104 * s)} ${f(left + w - 34 * s)} ${f(y - h - 64 * s)}L${f(left + w - 20 * s)} ${f(y - h - 8 * s)}Z`,
      p.chestInside,
    ) +
    coins +
    path(roundRect(left, y - h, w, h + 4, 12 * s), p.chest) +
    path(roundRect(left, y - h, w, 16 * s, 8 * s), p.goldDark) +
    path(roundRect(left + 20 * s, y - h, 14 * s, h + 4, 4 * s), p.goldDark) +
    path(roundRect(left + w - 34 * s, y - h, 14 * s, h + 4, 4 * s), p.goldDark) +
    path(roundRect(x - 13 * s, y - h + 22 * s, 26 * s, 30 * s, 6 * s), p.gold) +
    path(circle(x, y - h + 34 * s, 5 * s), p.chestDark) +
    path(circle(left + w * 0.3, y - h - 34 * s, 7 * s), p.pearl) +
    path(circle(left + w * 0.42, y - h - 40 * s, 7 * s), p.pearl) +
    path(circle(left + w * 0.54, y - h - 42 * s, 7 * s), p.pearl)
  );
}

function bubbles(x: number, y: number, s: number, color: string): string {
  const b: [number, number, number][] = [
    [0, 0, 14],
    [18, -46, 10],
    [-6, -88, 16],
    [14, -140, 8],
  ];
  return b
    .map(
      ([dx, dy, rr]) =>
        `<circle cx="${f(x + dx * s)}" cy="${f(y + dy * s)}" r="${f(rr * s)}" fill="${color}" fill-opacity=".18" stroke="${color}" stroke-width="${f(3 * s)}" stroke-opacity=".7"/>` +
        path(circle(x + (dx - rr * 0.35) * s, y + (dy - rr * 0.35) * s, rr * 0.25 * s), color),
    )
    .join('');
}

const BIO = ['#7ff6ff', '#a6ffbf', '#d2b0ff'];

type Dot = { box: Bounds; svg: string };

function plankton(seed: number, count: number): Dot[] {
  const r = rng(seed);
  const out: Dot[] = [];
  for (let i = 0; i < count; i++) {
    const x = range(r, 30, W - 30);
    const y = range(r, SURFACE + 120, 1880);
    const k = Math.floor(r() * BIO.length);
    const rr = range(r, 4, 9);
    const halo = rr * 5 + 6;
    out.push({
      box: { minX: x - halo, minY: y - halo, maxX: x + halo, maxY: y + halo },
      svg:
        `<circle cx="${f(x)}" cy="${f(y)}" r="${f(rr * 5)}" fill="url(#bio${k})"/>` +
        path(circle(x, y, rr * 0.8), BIO[k]),
    });
  }
  return out;
}

function glowDots(dots: Dot[]): string {
  if (!dots.length) return '';
  return (
    `<defs>${BIO.map((c, i) => radialGlow(`bio${i}`, c, 0.75)).join('')}</defs>` +
    dots.map((d) => d.svg).join('')
  );
}

type ReefArt = [art: string, cover?: string];

function reef(p: Palette, mode: Mode): Record<string, ReefArt> {
  const bigRock = rock(820, 1702, 2.3, p.rock, p.rockShade, p.rockLight);
  return {
    kelp: [
      kelp(3630, 1740, 1150, 1.1, p.kelp, p.kelpDark, 5) +
        kelp(3480, 1730, 1380, 1.25, p.kelp, p.kelpDark, 9) +
        kelp(3330, 1750, 1100, 1.05, p.kelp, p.kelpDark, 6) +
        seaweed(3240, 1780, 330, 1.1, p.weed, 3),
    ],
    octopusRock: [
      bigRock,
      `<defs><clipPath id="octopusRock">${bigRock}</clipPath></defs>` +
        group(
          rock(1060, 1722, 1.2, p.rock, p.rockShade, p.rockLight),
          '',
          ' clip-path="url(#octopusRock)"',
        ),
    ],
    coralOrange: [branchCoral(2680, 1716, 1.7, p.coralOrange, p.coralOrangeTip)],
    coralRed: [branchCoral(1660, 1802, 0.85, p.coralRed, p.coralRedTip)],
    chest: [
      chest(2140, 1812, 1.05, p) +
        (mode === 'night'
          ? `<defs>${radialGlow('chestGlow', '#ffd36b', 0.5)}</defs>` +
            path(ellipse(2140, 1700, 170, 120), 'url(#chestGlow)')
          : ''),
    ],
    starfish: [
      `<g data-spin="" style="transform-origin: 1800px 1866px">${starfish(1800, 1866, 1.4, 10, p.star, p.starDot)}</g>`,
    ],
  };
}

const shapes = (svg: string): Bounds[] =>
  [...svg.matchAll(/ d="([^"]+)"/g)].map((m) => pathBounds(m[1]));

const touches = (a: Bounds[], b: Bounds[]): boolean =>
  a.some((r) =>
    b.some((q) => r.minX < q.maxX && q.minX < r.maxX && r.minY < q.maxY && q.minY < r.maxY),
  );

type Reef = { props: Record<string, ReefArt>; dots: Record<string, Dot[]>; loose: Dot[] };

let lastReef: { p: Palette; mode: Mode; reef: Reef } | undefined;

function reefLayers(p: Palette, mode: Mode): Reef {
  if (lastReef?.p !== p || lastReef.mode !== mode) {
    lastReef = { p, mode, reef: splitReef(p, mode) };
  }
  return lastReef.reef;
}

function splitReef(p: Palette, mode: Mode): Reef {
  const props = reef(p, mode);
  const outlines = Object.entries(props)
    .reverse()
    .map(([id, [art]]) => ({ id, b: shapes(art) }));
  const dots: Record<string, Dot[]> = {};
  const loose: Dot[] = [];
  for (const d of plankton(61, 60)) {
    const owner = outlines.find(({ b }) => touches([d.box], b));
    if (owner) (dots[owner.id] ??= []).push(d);
    else loose.push(d);
  }
  return { props, dots, loose };
}

const drawReef =
  (id: string) =>
  (p: Palette, mode: Mode): string => {
    const { props, dots } = reefLayers(p, mode);
    const [art, cover = ''] = props[id];
    return art + cover + (mode === 'night' ? glowDots(dots[id] ?? []) : '');
  };

const ocean: SceneDef = {
  id: 'ocean',
  world: [W, H],
  horizon: SURFACE,
  ambient: { bubbles: 26, sparkles: 14, clouds: 2, birds: 2, stars: 24 },
  defaults: [
    { animal: 'whale', x: 1080, y: 560 },
    { animal: 'dolphin', x: 2480, y: 480, flip: true },
    { animal: 'jellyfish', x: 1700, y: 820 },
    { animal: 'shark', x: 3000, y: 930, flip: true },
    { animal: 'fish', x: 560, y: 1060 },
    { animal: 'sea-turtle', x: 2350, y: 1200, flip: true },
    { animal: 'fish', x: 1450, y: 1300, flip: true },
    { animal: 'octopus', x: 860, y: 1530 },
    { animal: 'crab', x: 1900, y: 1785 },
    { animal: 'orca', x: 2900, y: 520, flip: true },
    { animal: 'stingray', x: 1250, y: 1150 },
    { animal: 'pufferfish', x: 2700, y: 1060 },
    { animal: 'seahorse', x: 3110, y: 1300, flip: true },
  ],
  day: {
    skyTop: '#8cd6fb',
    skyBottom: '#e4f7ff',
    sun: '#ffd34d',
    sunRay: '#ffc531',
    face: '#8a4b1f',
    surfaceLight: '#c8f5f6',
    waterTop: '#68d0e6',
    waterMid: '#2a9dd6',
    waterBottom: '#1b5daf',
    ray: '#ffffff',
    farReef: '#3c8dc4',
    farReef2: '#3381bb',
    farSand: '#5aa2cc',
    sand: '#f0d9a0',
    sandDark: '#e2c78a',
    sandRipple: '#d2b475',
    rock: '#8f8fbd',
    rockShade: '#7474a3',
    rockLight: '#b8b8dc',
    kelp: '#43b07c',
    kelpDark: '#2f9065',
    kelpFar: '#3d93b4',
    weed: '#5cc47f',
    weedDark: '#3fa866',
    coralPink: '#ff7fa8',
    coralOrange: '#ff9a55',
    coralPurple: '#b48cf0',
    coralRed: '#ff6b6b',
    brain: '#c9d86c',
    brainDark: '#98ad3f',
    coralPinkTip: '#ffc4d8',
    coralOrangeTip: '#ffd2a6',
    coralRedTip: '#ffb8b0',
    fanVein: '#e6d6ff',
    fanVeinPink: '#ffd9e7',
    farFish: '#4da2d2',
    anemone: '#ff9ec4',
    anemoneTip: '#ffe3f0',
    sponge: '#ffb347',
    spongeDark: '#d98424',
    shell: '#ffd9c7',
    shellRidge: '#f0ad95',
    shell2: '#fff0d4',
    shellRidge2: '#e9c99a',
    star: '#ff8a5c',
    starDot: '#ffc8a8',
    star2: '#ffcf4d',
    star2Dot: '#fff0b0',
    chest: '#a8673f',
    chestDark: '#74442a',
    chestInside: '#5a3420',
    gold: '#ffd34d',
    goldDark: '#e6ab2a',
    pearl: '#fff8f0',
    bubble: '#ffffff',
    island: '#f6dc96',
    islandDark: '#e6c574',
    trunk: '#a8754f',
    trunkDark: '#86593a',
    frond: '#5fb35a',
    frondDark: '#449747',
    coconut: '#8b5a3c',
    hull: '#ff6f5e',
    hullStripe: '#ffffff',
    mast: '#8b5a3c',
    sail: '#ffffff',
    sail2: '#ffe9a8',
    flag: '#ffd34d',
  },
  night: {
    skyTop: '#0b1438',
    skyBottom: '#2b3878',
    sun: '#fff1c0',
    sunRay: '#ffe9a8',
    face: '#7a5a34',
    surfaceLight: '#7f9de0',
    waterTop: '#1d4486',
    waterMid: '#132d66',
    waterBottom: '#0a1940',
    ray: '#a9c8ff',
    farReef: '#183466',
    farReef2: '#152d5c',
    farSand: '#1e3a70',
    kelpFar: '#173a66',
    coralPink: '#ff5aa5',
    coralPurple: '#a77bff',
    anemone: '#ff6fb8',
    anemoneTip: '#a6fff2',
    brain: '#7cf0b4',
    coralPinkTip: '#ffc6ef',
    coralOrangeTip: '#ffe48f',
    coralRedTip: '#ffd0c4',
    fanVein: '#d9c4ff',
    farFish: '#1d3a73',
    star2: '#ffe066',
    bubble: '#bfe4ff',
  },
  back: (p, mode) => {
    let out =
      `<defs>${linearGradient('oceanSky', [
        [0, p.skyTop],
        [1, p.skyBottom],
      ])}${linearGradient('oceanWater', [
        [0, p.waterTop],
        [0.45, p.waterMid],
        [1, p.waterBottom],
      ])}</defs>` + `<rect width="${W}" height="${SURFACE + 40}" fill="url(#oceanSky)"/>`;
    if (mode === 'night') out += starField(37, 40, 30, 20, W - 30, SURFACE - 40, '#fff6d6');
    out += islandSand(560, p);
    out += path(SEA, 'url(#oceanWater)');
    out += surfaceTint(p);
    out += path(floorD(4, 1560, 90, 8), p.farReef2);
    out += [
      [300, 1500, 0.9],
      [1350, 1530, 0.7],
      [2050, 1510, 0.85],
      [3050, 1500, 0.8],
    ]
      .map(
        ([x, y, s]) =>
          coral(x, y, s * 1.4, p.farReef, 'branch') +
          coral(x + 120 * s, y + 10, s * 1.2, p.farReef, 'fan'),
      )
      .join('');
    out += [120, 420, 3150, 3420]
      .map((x, i) => kelp(x, 1600, 900 - i * 60, 0.9, p.kelpFar, p.kelpFar, i + 2))
      .join('');
    out += path(floorD(9, 1650, 70, 7), p.farSand);
    out += path(
      `${smooth(
        [
          [-200, 1700],
          [300, 1690],
          [820, 1668],
          [1250, 1705],
          [1650, 1760],
          [2050, 1772],
          [2450, 1722],
          [2860, 1676],
          [3300, 1694],
          [3800, 1700],
        ],
        false,
      )}L${W + 200} ${H + 50}L-200 ${H + 50}Z`,
      p.sand,
    );
    out += path(floorD(17, 1880, 40, 5), p.sandDark, ' opacity=".6"');
    const r = rng(23);
    for (let i = 0; i < 16; i++) {
      const x = range(r, 0, W);
      const y = range(r, 1760, 1960);
      const len = range(r, 70, 140);
      out += stroke(
        curve(x - len / 2, y, x + len / 2, y, -len * 0.1),
        p.sandRipple,
        6,
        ' stroke-opacity=".55"',
      );
    }
    out += fishSchool(1350, 720, 1, 7, p.farFish, 3) + fishSchool(2750, 1120, 0.8, 6, p.farFish, 8);
    out += layered([
      [1540, kelp(-30, 1740, 1150, 1.1, p.kelp, p.kelpDark, 2)],
      [1560, kelp(110, 1730, 1350, 1.2, p.kelp, p.kelpDark, 1)],
      [1590, kelp(270, 1760, 950, 1, p.kelp, p.kelpDark, 4)],
      [1640, fanCoral(990, 1650, 1.25, p.coralPurple, p.fanVein)],
      [1712, rock(1060, 1722, 1.2, p.rock, p.rockShade, p.rockLight)],
      [1715, branchCoral(560, 1716, 1.6, p.coralPink, p.coralPinkTip)],
      [1745, brainCoral(1170, 1748, 1.2, p.brain, p.brainDark)],
      [1760, anemone(460, 1764, 1.2, p.anemone, p.anemoneTip)],
      [1770, sponges(1275, 1772, 1, p.sponge, p.spongeDark)],
      [1768, seaweed(370, 1772, 300, 1.1, p.weed, 2)],
      [1778, seaweed(1350, 1782, 220, 0.9, p.weedDark, 5)],
      [1650, fanCoral(3060, 1660, 1.3, p.coralPurple, p.fanVein)],
      [1700, rock(2860, 1704, 2, p.rock, p.rockShade, p.rockLight)],
      [1750, brainCoral(2545, 1752, 1.05, p.brain, p.brainDark)],
      [1764, anemone(3150, 1766, 1.1, p.coralRed, p.anemoneTip)],
      [1772, sponges(2440, 1774, 0.9, p.coralPink, p.coralRed)],
      [1786, seaweed(2985, 1790, 200, 0.9, p.weedDark, 8)],
      [1836, shell(1500, 1836, 1.2, p.shell, p.shellRidge)],
      [1880, shell(2460, 1880, 1.3, p.shell2, p.shellRidge2)],
      [1900, starfish(2900, 1902, 1.3, -14, p.star2, p.star2Dot)],
      [1890, shell(740, 1892, 1.1, p.shell2, p.shellRidge2)],
      [1620, bubbles(2170, 1660, 1, p.bubble)],
      [1500, bubbles(610, 1500, 0.8, p.bubble)],
    ]);
    if (mode === 'night') out += glowDots(reefLayers(p, mode).loose);
    return out;
  },
  front: (p) =>
    seaweed(110, 2040, 360, 1.6, p.weed, 11) +
    seaweed(230, 2040, 250, 1.3, p.weedDark, 12) +
    fanCoral(1060, 2040, 0.95, p.coralPink, p.fanVeinPink) +
    starfish(1880, 1984, 1.5, 20, p.star2, p.star2Dot) +
    rock(2620, 2040, 1.3, p.rock, p.rockShade, p.rockLight) +
    branchCoral(3360, 2036, 1.5, p.coralOrange, p.coralOrangeTip) +
    seaweed(3520, 2040, 320, 1.4, p.weedDark, 13),
  interactives: [
    {
      id: 'sun',
      box: [2773, 0, 414, 270],
      kind: 'spin',
      origin: [2980, 118],
      effect: 'sparkle',
      sound: 'shine',
      night: { kind: 'rock', effect: 'stars', sound: 'twinkle' },
      render: (p, mode) =>
        aboveWater(
          'sunSea',
          mode === 'day'
            ? sun(2980, 118, 78, p.sun, p.sunRay, p.face)
            : moon(2980, 118, 72, p.sun, p.sunRay, p.face),
        ),
    },
    {
      id: 'island',
      box: [438, 7, 240, 257],
      kind: 'shake',
      origin: [545, 238],
      effect: 'leaves',
      sound: 'rustle',
      render: (p) => islandPalms(560, p),
    },
    {
      id: 'sailboat',
      box: [1760, 0, 290, 294],
      kind: 'rock',
      origin: [1900, 250],
      effect: 'splash',
      effectAt: [1900, 262],
      sound: 'honk',
      render: (p, mode) =>
        sailboat(1900, p, mode === 'night') +
        `<defs><clipPath id="hull"><path d="${hullPath(1900)}"/></clipPath></defs>` +
        group(surfaceTint(p), '', ' clip-path="url(#hull)"'),
    },
    {
      id: 'kelp',
      box: [3181, 209, 419, 1609],
      kind: 'wiggle',
      origin: [3435, 1750],
      effect: 'bubbles',
      sound: 'swoosh',
      render: drawReef('kelp'),
    },
    {
      id: 'octopusRock',
      box: [615, 1496, 467, 292],
      kind: 'wiggle',
      effect: 'bubbles',
      sound: 'bubble',
      render: drawReef('octopusRock'),
    },
    {
      id: 'coralOrange',
      box: [2534, 1361, 287, 432],
      kind: 'wiggle',
      origin: [2680, 1716],
      effect: 'bubbles',
      sound: 'bubble',
      render: drawReef('coralOrange'),
    },
    {
      id: 'coralRed',
      box: [1581, 1614, 160, 227],
      kind: 'wiggle',
      origin: [1660, 1802],
      effect: 'bubbles',
      sound: 'bubble',
      render: drawReef('coralRed'),
    },
    {
      id: 'chest',
      box: [1951, 1560, 378, 280],
      kind: 'bounce',
      origin: [2140, 1816],
      effect: 'coins',
      effectAt: [2130, 1700],
      sound: 'coins',
      render: drawReef('chest'),
    },
    {
      id: 'starfish',
      box: [1729, 1785, 142, 152],
      kind: 'bounce',
      effect: 'stars',
      sound: 'twinkle',
      render: drawReef('starfish'),
    },
  ],
};

export default ocean;
