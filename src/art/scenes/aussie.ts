import { mix } from '../core/color';
import {
  circle,
  curve,
  ellipse,
  emptyBounds,
  extendBounds,
  f,
  leaf,
  roundRect,
  samplePath,
  scallop,
  smooth,
  spiky,
  tube,
  type Bounds,
  type Pt,
} from '../core/paths';
import {
  flower,
  grassTuft,
  group,
  layered,
  linearGradient,
  moon,
  path,
  radialGlow,
  rock,
  starField,
  stroke,
  sun,
  termiteMound,
} from './props';
import { range, rng } from './rng';
import type { Interactive, Mode, Palette, SceneDef } from './types';

const W = 3600;
const H = 2000;

type Layer = [number, string];
type Zone = [number, number, number, number];
type Shape = [Bounds, Pt[]];
type Clump = [number, number, number, number];
type Pt3 = [number, number, number];

const SUN: Pt = [1330, 250];
const CROSS: Pt = [2080, 300];
const GUM: Pt = [300, 1290];
const ULURU: Pt = [1050, 1016];
const BILLA: Pt = [1130, 1500];
const WATTLE: Pt = [640, 1760];
const GEYSER: Pt = [2430, 1120];
const LUPINS: Pt = [2380, 1700];
const PONGA: Pt = [3200, 1330];

const smoothstep = (a: number, b: number, x: number): number => {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)));
  return t * t * (3 - 2 * t);
};

const nz = (x: number): number => smoothstep(1300, 2300, x);

const blend = (x: number, y: number): number => smoothstep(1160, 2480, x - (y - 1500) * 0.32);

const farY = (x: number): number =>
  960 + 5 * Math.sin(x / 190 + 1) - nz(x) * (52 + 30 * Math.sin(x / 210 + 0.8));
const midY = (x: number): number =>
  1024 + 4 * Math.sin(x / 160) - nz(x) * (12 + 18 * Math.sin(x / 260 + 2.4));
const nearY = (x: number): number =>
  1098 + 9 * Math.sin(x / 320 + 1.2) - nz(x) * (6 + 16 * Math.sin(x / 300 + 0.3));

function landD(fn: (x: number) => number, step = 40): string {
  const pts: Pt[] = [];
  for (let x = -200; x <= W + 200; x += step) pts.push([x, fn(x)]);
  return `${smooth(pts, false)}L${W + 200} ${H + 60}L-200 ${H + 60}Z`;
}

function sweep(
  id: string,
  colors: [string, string, string],
  cx: number,
  cy: number,
  half: number,
  tilt: number,
): string {
  const a = (tilt * Math.PI) / 180;
  const dx = Math.cos(a) * half;
  const dy = Math.sin(a) * half;
  return (
    `<linearGradient id="${id}" gradientUnits="userSpaceOnUse" x1="${f(cx - dx)}" y1="${f(cy - dy)}" x2="${f(cx + dx)}" y2="${f(cy + dy)}">` +
    `<stop offset="0" stop-color="${colors[0]}"/><stop offset=".5" stop-color="${colors[1]}"/><stop offset="1" stop-color="${colors[2]}"/>` +
    `</linearGradient>`
  );
}

const DOMES: Clump[] = [
  [3640, 1050, 320, 250],
  [3260, 1046, 440, 300],
  [2780, 1056, 470, 290],
  [2330, 1068, 380, 206],
  [1990, 1094, 280, 106],
  [2580, 1108, 340, 150],
  [3060, 1112, 380, 170],
];

const domeD = ([x, base, hw, h]: Clump): string =>
  `M${f(x - hw)} ${f(base + 50)}C${f(x - hw * 0.55)} ${f(base - h * 1.32)} ${f(x + hw * 0.55)} ${f(base - h * 1.32)} ${f(x + hw)} ${f(base + 50)}Z`;

function domeTop([x, base, hw, h]: Clump, px: number): number {
  const u = Math.min(1, Math.abs(px - x) / hw);
  return base + 50 - (h + 50) * (1 - u * u) * (1 - 0.25 * u * u);
}

function sheep(x: number, y: number, s: number, p: Palette, flip: boolean): string {
  const k = flip ? -1 : 1;
  let wool = '';
  for (const [dx, dy, rr] of [
    [-9, -12, 8],
    [0, -15, 9],
    [9, -12, 8],
    [-4, -7, 8],
    [6, -7, 8],
  ] as [number, number, number][]) {
    wool += circle(x + dx * s * k, y + dy * s, rr * s);
  }
  return (
    stroke(
      `M${f(x - 6 * s * k)} ${f(y - 4 * s)}V${f(y + 2 * s)}M${f(x + 6 * s * k)} ${f(y - 4 * s)}V${f(y + 2 * s)}`,
      p.sheepFace,
      2.6 * s,
    ) +
    path(wool, p.sheep) +
    path(ellipse(x + 17 * s * k, y - 13 * s, 5 * s, 6.5 * s, 20 * k), p.sheepFace)
  );
}

function rollingHills(p: Palette): string {
  let out = '';
  DOMES.forEach((dome, i) => {
    const [x, base, hw, h] = dome;
    const id = `auDome${i}`;
    const d = domeD(dome);
    const haze = Math.max(0, Math.min(1, (1100 - base) / 50)) * 0.3;
    const fill = mix(i % 2 ? p.hillA : p.hillB, p.hillFar, haze);
    out +=
      `<defs><clipPath id="${id}"><path d="${d}"/></clipPath></defs>` +
      path(d, fill) +
      group(
        path(
          ellipse(x - hw * 0.25, base - h * 0.78, hw * 0.62, h * 0.32, -8),
          p.hillLight,
          ' fill-opacity=".45"',
        ) +
          path(
            ellipse(x + hw * 0.55, base + 30, hw * 0.7, h * 0.55),
            p.hillShade,
            ' fill-opacity=".35"',
          ),
        '',
        ` clip-path="url(#${id})"`,
      );
    const r = rng(60 + i);
    for (let k = 0; k < Math.round(hw / 90); k++) {
      const px = x + range(r, -0.75, 0.75) * hw;
      const py = domeTop(dome, px) + range(r, 18, h * 0.7);
      out += path(
        scallop(px, py, 1, 8, 5, k * 30, range(r, 26, 44), range(r, 10, 15)),
        p.hillBush,
        ' fill-opacity=".85"',
      );
    }
    for (let k = 0; k < Math.round(hw / 120); k++) {
      const px = x + range(r, -0.7, 0.7) * hw;
      out += cabbageTree(px, domeTop(dome, px) + range(r, 20, h * 0.6), range(r, 0.55, 0.8), p);
    }
    if (i === 2) {
      out +=
        sheep(2620, 902, 0.85, p, false) +
        sheep(2700, 872, 0.9, p, true) +
        sheep(2762, 892, 0.85, p, false);
    }
  });
  return out;
}

function skyLayer(p: Palette, night: boolean): string {
  return (
    `<defs>${linearGradient('auSky', [
      [0, p.skyTop],
      [0.25, p.skyMid],
      [0.48, p.skyBottom],
    ])}${radialGlow('auHaze', p.haze, night ? 0.35 : 0.8)}${radialGlow('auMist', p.mist, night ? 0.25 : 0.7)}</defs>` +
    `<rect width="${W}" height="${H}" fill="url(#auSky)"/>` +
    `<ellipse cx="760" cy="980" rx="1500" ry="440" fill="url(#auHaze)"/>` +
    `<ellipse cx="2900" cy="880" rx="1200" ry="360" fill="url(#auMist)"/>`
  );
}

function milkyWay(p: Palette): string {
  return (
    `<defs>${radialGlow('auMilky', p.milky, 0.3)}</defs>` +
    group(
      `<ellipse cx="1900" cy="360" rx="2100" ry="180" fill="url(#auMilky)"/>` +
        starField(23, 130, -300, 270, 4100, 450, p.star),
      'rotate(-14 1900 360)',
    )
  );
}

const CROSS_STARS: [number, number, number][] = [
  [0, -118, 30],
  [-14, 120, 36],
  [-104, -6, 32],
  [92, -30, 24],
  [50, 56, 14],
];

function southernCross(p: Palette): string {
  let out = `<defs>${radialGlow('auCross', p.starGlow, 0.65)}</defs>`;
  for (const [dx, dy, r] of CROSS_STARS) {
    const x = CROSS[0] + dx;
    const y = CROSS[1] + dy;
    out +=
      `<circle cx="${f(x)}" cy="${f(y)}" r="${f(r * 2.6)}" fill="url(#auCross)"/>` +
      path(spiky(x, y, r, r * 0.26, 4, -90, 0.32), p.star) +
      path(circle(x, y, r * 0.3), '#ffffff');
  }
  return out;
}

function longCloud(
  x: number,
  y: number,
  s: number,
  stretch: number,
  top: string,
  under: string,
): string {
  const puffs: [number, number, number][] = [
    [-96, -14, 30],
    [-46, -32, 44],
    [14, -40, 52],
    [72, -26, 38],
    [118, -12, 24],
  ];
  const blob = (dy: number, color: string) =>
    puffs.map(([dx, py, r]) => path(circle(x + dx * s, y + (py + dy) * s, r * s), color)).join('') +
    path(roundRect(x - 132 * s, y + (dy - 20) * s, 274 * s, 30 * s, 15 * s), color);
  return group(
    blob(8, under) + blob(0, top),
    `translate(${f(x)} 0) scale(${stretch} 1) translate(${f(-x)} 0)`,
  );
}

function alp(
  id: string,
  x: number,
  base: number,
  w: number,
  h: number,
  snowK: number,
  colors: [string, string, string, string],
  seed: number,
): string {
  const [color, shade, snow, snowShade] = colors;
  const peak: Pt = [x, base - h];
  const body =
    smooth(
      [
        [x - w / 2, base + 40],
        [x - w * 0.33, base - h * 0.3],
        [x - w * 0.2, base - h * 0.6],
        [x - w * 0.08, base - h * 0.88],
        peak,
        [x + w * 0.06, base - h * 0.9],
        [x + w * 0.14, base - h * 0.72],
        [x + w * 0.3, base - h * 0.38],
        [x + w / 2, base + 40],
      ],
      false,
      0.75,
    ) + 'Z';
  const ridge = smooth(
    [
      peak,
      [x + w * 0.03, base - h * 0.72],
      [x - w * 0.03, base - h * 0.46],
      [x + w * 0.04, base - h * 0.2],
      [x - w * 0.01, base + 50],
    ],
    false,
  );
  const shadeD = `${ridge}L${f(x + w)} ${f(base + 50)}L${f(x + w)} ${f(peak[1] - 30)}Z`;
  const r = rng(seed);
  const edge: Pt[] = [];
  for (let i = 0; i <= 10; i++) {
    const px = x + w * 0.5 - (i * w) / 10;
    const drip = i % 2 ? range(r, 0.07, 0.15) : range(r, -0.03, 0.02);
    edge.push([px, base - h * (snowK - drip)]);
  }
  const snowD = smooth(
    [[x + w * 0.6, base - h - 80], ...edge, [x - w * 0.6, base - h - 80]],
    true,
    0.7,
  );
  return (
    `<defs><clipPath id="${id}"><path d="${body}"/></clipPath><clipPath id="${id}s"><path d="${shadeD}"/></clipPath></defs>` +
    path(body, color) +
    group(
      path(shadeD, shade) +
        path(snowD, snow) +
        group(path(snowD, snowShade), '', ` clip-path="url(#${id}s)"`),
      '',
      ` clip-path="url(#${id})"`,
    )
  );
}

function alps(p: Palette): string {
  const far: [string, string, string, string] = [p.alpFar, p.alpFarShade, p.snow, p.snowShade];
  const near: [string, string, string, string] = [p.alp, p.alpShade, p.snow, p.snowShade];
  return (
    alp('auAlp1', 2330, 990, 760, 420, 0.5, far, 3) +
    alp('auAlp2', 2790, 990, 820, 500, 0.52, far, 5) +
    alp('auAlp3', 3330, 990, 860, 470, 0.5, far, 7) +
    alp('auAlp4', 2090, 1000, 700, 300, 0.42, near, 11) +
    alp('auAlp5', 2560, 1000, 880, 430, 0.5, near, 13) +
    alp('auAlp6', 3060, 1000, 1000, 520, 0.55, near, 17) +
    alp('auAlp7', 3560, 1000, 760, 380, 0.48, near, 19)
  );
}

function westRange(p: Palette): string {
  const d =
    smooth(
      [
        [-240, 1000],
        [-150, 924],
        [30, 902],
        [210, 908],
        [300, 934],
        [400, 922],
        [530, 928],
        [660, 960],
        [790, 1004],
      ],
      false,
    ) + 'Z';
  return (
    `<defs><clipPath id="auWest"><path d="${d}"/></clipPath></defs>` +
    path(d, p.rangeFar) +
    group(
      path('M-260 900H820V918H-260Z', p.rangeLight, ' fill-opacity=".7"') +
        path('M-260 944H820V954H-260Z', p.rangeShade, ' fill-opacity=".45"'),
      '',
      ' clip-path="url(#auWest)"',
    )
  );
}

function kataTjuta(p: Palette): string {
  const base = 984;
  const domes: [number, number, number][] = [
    [1500, 46, 56],
    [1792, 54, 72],
    [1560, 74, 96],
    [1726, 68, 104],
    [1642, 82, 134],
  ];
  return domes
    .map(([x, rx, h]) => {
      const d = `M${f(x - rx)} ${f(base + 10)}C${f(x - rx)} ${f(base - h * 1.3)} ${f(x + rx)} ${f(base - h * 1.3)} ${f(x + rx)} ${f(base + 10)}Z`;
      const shadeD = `M${f(x + rx * 0.15)} ${f(base - h * 0.95)}C${f(x + rx * 0.6)} ${f(base - h * 0.9)} ${f(x + rx)} ${f(base - h * 0.5)} ${f(x + rx)} ${f(base + 10)}L${f(x + rx * 0.3)} ${f(base + 10)}C${f(x + rx * 0.4)} ${f(base - h * 0.4)} ${f(x + rx * 0.35)} ${f(base - h * 0.7)} ${f(x + rx * 0.15)} ${f(base - h * 0.95)}Z`;
      return path(d, p.dome) + path(shadeD, p.domeShade, ' fill-opacity=".8"');
    })
    .join('');
}

function cabbageTree(x: number, y: number, s: number, p: Palette): string {
  const top: Pt = [x + 4 * s, y - 70 * s];
  let blades = '';
  for (let i = 0; i < 15; i++) {
    const a = -180 + (i * 180) / 14;
    blades += leaf(top[0], top[1], (22 + (i % 3) * 5) * s, 3.2 * s, a);
  }
  return (
    path(
      tube([[x, y + 2], [x + 2 * s, y - 36 * s], top], (u) => (3.4 - 1.2 * u) * s),
      p.cabbage,
    ) + path(blades, p.cabbageLeaf)
  );
}

function uluruGlow(p: Palette): string {
  const [x, base] = ULURU;
  return `<defs>${radialGlow('auUluruGlow', p.rockGlow, 0.55)}</defs><ellipse cx="${f(x)}" cy="${f(base - 110)}" rx="589" ry="267" fill="url(#auUluruGlow)"/>`;
}

function uluru(p: Palette): string {
  const [x, base] = ULURU;
  const w = 920;
  const h = 262;
  const L = x - w / 2;
  const R = x + w / 2;
  const top = base - h;
  const body =
    smooth(
      [
        [L - 56, base + 16],
        [L - 14, base - h * 0.28],
        [L + 22, base - h * 0.7],
        [L + 90, base - h * 0.95],
        [L + 220, top],
        [x - 50, top + 10],
        [x + 140, top + 4],
        [x + 290, top + 26],
        [R - 64, base - h * 0.8],
        [R - 12, base - h * 0.42],
        [R + 50, base + 16],
      ],
      false,
      0.85,
    ) + 'Z';
  const r = rng(9);
  let gullies = '';
  let gx = L + 30;
  while (gx < R - 20) {
    const len = h * range(r, 0.3, 0.85);
    const bend = range(r, -16, 16);
    const wd = range(r, 6, 15);
    gullies +=
      stroke(
        curve(gx + wd * 0.6, top - 30, gx + wd * 0.6 + bend * 0.6, top - 30 + len, bend),
        p.rockLight,
        wd * 0.5,
        ' stroke-opacity=".35"',
      ) +
      stroke(
        curve(gx, top - 30, gx + bend * 0.6, top - 30 + len, bend),
        p.rockDark,
        wd,
        ` stroke-opacity="${f(range(r, 0.24, 0.4))}"`,
      );
    gx += range(r, 34, 96);
  }
  let caves = '';
  for (const [cx, cy, rx, ry] of [
    [L + 120, base - 60, 26, 14],
    [L + 300, base - 40, 18, 10],
    [x + 80, base - 70, 22, 12],
    [x + 260, base - 46, 30, 13],
    [L + 200, base - 150, 14, 8],
    [x - 60, base - 120, 16, 9],
  ] as Clump[]) {
    caves += path(ellipse(cx, cy, rx, ry), p.rockDark, ' fill-opacity=".5"');
  }
  const highlight = smooth(
    [
      [L + 10, base - h * 0.62],
      [L + 80, base - h * 0.92],
      [L + 220, top + 8],
      [x - 50, top + 18],
      [x + 140, top + 12],
      [x + 290, top + 34],
      [x + 280, top + 64],
      [x + 130, top + 46],
      [x - 50, top + 52],
      [L + 220, top + 44],
      [L + 110, base - h * 0.78],
      [L + 40, base - h * 0.5],
    ],
    true,
    0.8,
  );
  const shadeR = `M${f(x + 210)} ${f(top - 20)}C${f(x + 300)} ${f(top + 80)} ${f(x + 200)} ${f(base - 90)} ${f(x + 260)} ${f(base + 30)}L${f(R + 80)} ${f(base + 30)}L${f(R + 80)} ${f(top - 20)}Z`;
  const shadeLow = `M${f(L - 80)} ${f(base - 34)}Q${f(x)} ${f(base - 70)} ${f(R + 80)} ${f(base - 34)}L${f(R + 80)} ${f(base + 30)}L${f(L - 80)} ${f(base + 30)}Z`;
  let skirt = path(
    `M${f(L - 70)} ${f(base + 18)}Q${f(x)} ${f(base - 16)} ${f(R + 70)} ${f(base + 18)}Z`,
    p.rockShade,
    ' fill-opacity=".35"',
  );
  const rs = rng(15);
  for (const [cx, k, n] of [
    [L - 10, 1.1, 3],
    [L + 150, 0.8, 2],
    [L + 400, 1, 3],
    [x + 60, 0.7, 2],
    [x + 250, 1.15, 3],
    [R - 30, 0.9, 2],
  ] as Pt3[]) {
    for (let i = 0; i < n; i++) {
      const sx = cx + (i - (n - 1) / 2) * 34 * k + range(rs, -8, 8);
      const sy = base + range(rs, 8, 16);
      const rx = range(rs, 18, 30) * k * (i === 1 ? 1.3 : 1);
      skirt +=
        path(scallop(sx, sy - rx * 0.32, 1, 7, rx * 0.16, i * 25, rx, rx * 0.5), p.scrubDark) +
        path(
          scallop(sx - rx * 0.1, sy - rx * 0.42, 1, 7, rx * 0.14, i * 31, rx * 0.86, rx * 0.4),
          p.scrub,
        );
    }
  }
  for (const [tx, ts] of [
    [L + 280, 0.3],
    [x + 330, 0.26],
  ] as Pt[]) {
    skirt += smallGum(tx, base + 14, ts, p);
  }
  return (
    `<defs><clipPath id="auUluru"><path d="${body}"/></clipPath></defs>` +
    path(body, p.rock) +
    group(
      path(highlight, p.rockLight, ' fill-opacity=".55"') +
        path(shadeLow, p.rockShade, ' fill-opacity=".45"') +
        gullies +
        path(shadeR, p.rockShade, ' fill-opacity=".6"') +
        caves,
      '',
      ' clip-path="url(#auUluru)"',
    ) +
    path(ellipse(L - 40, base + 10, 34, 16), p.rockShade) +
    path(ellipse(R + 36, base + 12, 28, 14), p.rockShade) +
    skirt
  );
}

const GUM_CLUMPS: Clump[] = [
  [-250, -650, 130, 64],
  [-150, -770, 140, 70],
  [20, -850, 160, 78],
  [190, -770, 140, 68],
  [380, -610, 124, 60],
  [-30, -690, 100, 50],
  [140, -660, 90, 46],
];

function gumTree(x: number, y: number, s: number, p: Palette, seed: number): string {
  const T = (pts: Pt[]): Pt[] => pts.map(([dx, dy]) => [x + dx * s, y + dy * s]);
  const limb = (pts: Pt[], r0: number, r1: number) =>
    path(
      tube(T(pts), (u) => (r0 + (r1 - r0) * u) * s),
      p.gumTrunk,
    );
  let out = path(ellipse(x, y + 6 * s, 150 * s, 18 * s), p.shadow, ' fill-opacity=".45"');
  GUM_CLUMPS.forEach(([dx, dy, rx, ry], i) => {
    out += path(
      scallop(x + dx * s, y + (dy + 10) * s, 1, 14, 10 * s, i * 11, rx * 0.93 * s, ry * 0.9 * s),
      p.gumLeafDark,
    );
  });
  out += limb(
    [
      [0, -350],
      [-70, -460],
      [-150, -560],
      [-240, -630],
    ],
    20,
    8,
  );
  out += limb(
    [
      [-110, -520],
      [-150, -620],
      [-140, -740],
    ],
    10,
    5,
  );
  out += limb(
    [
      [-118, -526],
      [-190, -540],
      [-266, -540],
    ],
    10,
    6,
  );
  out += limb(
    [
      [4, -360],
      [30, -520],
      [14, -680],
      [24, -830],
    ],
    19,
    7,
  );
  out += limb(
    [
      [20, -560],
      [100, -650],
      [180, -750],
    ],
    10,
    5,
  );
  out += limb(
    [
      [0, -320],
      [110, -396],
      [230, -428],
      [360, -440],
    ],
    17,
    9,
  );
  out += limb(
    [
      [330, -440],
      [380, -520],
      [390, -590],
    ],
    8,
    4,
  );
  out += path(
    tube(
      T([
        [0, 8],
        [-8, -120],
        [6, -250],
        [0, -370],
      ]),
      (u) => (32 - 12 * u) * s,
    ),
    p.gumTrunk,
  );
  out += path(
    smooth(
      T([
        [-74, 8],
        [-36, -4],
        [-28, -70],
        [28, -70],
        [36, -4],
        [78, 8],
      ]),
      false,
    ) + 'Z',
    p.gumTrunk,
  );
  out += path(
    smooth(
      T([
        [10, -360],
        [24, -250],
        [18, -120],
        [32, -10],
        [72, 8],
        [22, 8],
        [8, -120],
        [0, -250],
      ]),
      true,
      0.7,
    ),
    p.gumTrunkShade,
    ' fill-opacity=".75"',
  );
  const r = rng(seed);
  for (let i = 0; i < 6; i++) {
    out += path(
      ellipse(
        x + range(r, -14, 10) * s,
        y - range(r, 60, 330) * s,
        range(r, 7, 12) * s,
        range(r, 14, 24) * s,
        range(r, -10, 10),
      ),
      p.gumBark,
      ' fill-opacity=".5"',
    );
  }
  for (const [dx, dy] of [
    [-12, -210],
    [4, -120],
    [-6, -300],
  ]) {
    out += stroke(
      `M${f(x + dx * s)} ${f(y + dy * s)}q${f(5 * s)} ${f(-8 * s)} ${f(10 * s)} 0t${f(10 * s)} 0t${f(10 * s)} 0`,
      p.scribble,
      2.4 * s,
      ' stroke-opacity=".55"',
    );
  }
  GUM_CLUMPS.forEach(([dx, dy, rx, ry], i) => {
    out += gumFoliage(x + (dx - 8) * s, y + dy * s, rx * s, ry * s, s, p, r, i);
  });
  return out;
}

function gumFoliage(
  cx: number,
  cy: number,
  rx: number,
  ry: number,
  s: number,
  p: Palette,
  r: () => number,
  i: number,
): string {
  let dark = '';
  let mid = '';
  let light = '';
  const n = Math.round(10 + rx / (6 * s));
  for (let k = 0; k < n; k++) {
    const a = range(r, -0.1, 1.1) * Math.PI;
    const lx = cx + Math.cos(a) * rx * range(r, 0.78, 0.96);
    const ly = cy + Math.sin(a) * ry * range(r, 0.7, 0.95) + 4 * s;
    let dir = (Math.atan2(Math.sin(a) * ry, Math.cos(a) * rx) * 180) / Math.PI;
    if (dir < -90) dir += 360;
    const d = leaf(lx, ly, range(r, 38, 58) * s, range(r, 6, 8) * s, dir * 0.3 + 63);
    if (k % 3 === 0) mid += d;
    else dark += d;
  }
  for (let k = 0; k < Math.round(n * 0.55); k++) {
    const a = range(r, -0.92, -0.08) * Math.PI;
    const kk = range(r, 0.15, 0.7);
    light += leaf(
      cx - rx * 0.12 + Math.cos(a) * rx * kk,
      cy + Math.sin(a) * ry * kk,
      range(r, 22, 34) * s,
      range(r, 4.5, 6) * s,
      range(r, 50, 130),
    );
  }
  return (
    path(scallop(cx, cy, 1, 14, 9 * s, i * 13 + 5, rx * 0.9, ry * 0.82), p.gumLeaf) +
    path(dark, p.gumLeafDark) +
    path(mid, p.gumLeaf) +
    path(light, p.gumLeafLight)
  );
}

function smallGum(x: number, y: number, s: number, p: Palette): string {
  const T = (pts: Pt[]): Pt[] => pts.map(([dx, dy]) => [x + dx * s, y + dy * s]);
  const clumps: Clump[] = [
    [-70, -230, 70, 36],
    [10, -280, 84, 42],
    [90, -220, 66, 34],
  ];
  let out = '';
  for (const [dx, dy, rx, ry] of clumps) {
    out += path(
      scallop(x + dx * s, y + (dy + 10) * s, 1, 11, 7 * s, dx, rx * s, ry * s),
      p.gumLeafDark,
    );
  }
  out += path(
    tube(
      T([
        [0, 4],
        [-4, -120],
        [-50, -200],
      ]),
      (u) => (13 - 7 * u) * s,
    ),
    p.gumTrunk,
  );
  out += path(
    tube(
      T([
        [-3, -110],
        [20, -190],
        [70, -214],
      ]),
      (u) => (9 - 5 * u) * s,
    ),
    p.gumTrunk,
  );
  out += path(
    tube(
      T([
        [-2, -120],
        [6, -200],
        [10, -260],
      ]),
      (u) => (8 - 4 * u) * s,
    ),
    p.gumTrunk,
  );
  for (const [dx, dy, rx, ry] of clumps) {
    out += path(
      scallop(x + (dx - 5) * s, y + dy * s, 1, 11, 6 * s, dx + 7, rx * 0.88 * s, ry * 0.8 * s),
      p.gumLeaf,
    );
  }
  return out;
}

const BILLA_PTS: Pt[] = (
  [
    [-352, -4],
    [-310, -52],
    [-190, -78],
    [-60, -64],
    [50, -76],
    [190, -84],
    [312, -58],
    [362, -2],
    [318, 52],
    [170, 80],
    [-20, 72],
    [-180, 86],
    [-306, 54],
  ] as Pt[]
).map(([dx, dy]) => [BILLA[0] + dx, BILLA[1] + dy]);

function lilyPad(
  x: number,
  y: number,
  rx: number,
  ry: number,
  color: string,
  notch: number,
): string {
  const a1 = ((notch + 18) * Math.PI) / 180;
  const a2 = ((notch - 18) * Math.PI) / 180;
  return path(
    `M${f(x)} ${f(y)}L${f(x + Math.cos(a1) * rx)} ${f(y + Math.sin(a1) * ry)}A${f(rx)} ${f(ry)} 0 1 1 ${f(x + Math.cos(a2) * rx)} ${f(y + Math.sin(a2) * ry)}Z`,
    color,
  );
}

function waterLily(x: number, y: number, s: number, p: Palette): string {
  let out = '';
  for (const a of [-160, -125, -90, -55, -20]) {
    out += path(leaf(x, y, 22 * s, 7 * s, a), p.lily);
  }
  for (const a of [-140, -105, -75, -40]) {
    out += path(leaf(x, y - 2 * s, 16 * s, 6 * s, a), p.lilyLight);
  }
  return out + path(circle(x, y - 6 * s, 4.5 * s), p.lilyCenter);
}

function reeds(x: number, y: number, s: number, p: Palette): string {
  let blades = '';
  let dark = '';
  [-116, -103, -92, -80, -68].forEach((a, i) => {
    const d = leaf(x + (i - 2) * 6 * s, y + 2, (60 + (i % 2) * 34) * s, 6 * s, a);
    if (i % 2) dark += d;
    else blades += d;
  });
  return (
    path(blades, p.reed) +
    path(dark, p.reedDark) +
    stroke(
      `M${f(x - 4 * s)} ${f(y)}Q${f(x - 8 * s)} ${f(y - 60 * s)} ${f(x - 14 * s)} ${f(y - 104 * s)}`,
      p.reedDark,
      3.5 * s,
    ) +
    path(
      `M${f(x - 14 * s)} ${f(y - 96 * s)}m${f(-7 * s)} 0a${f(7 * s)} ${f(15 * s)} 0 1 0 ${f(14 * s)} 0a${f(7 * s)} ${f(15 * s)} 0 1 0 ${f(-14 * s)} 0Z`,
      p.cattail,
    ) +
    stroke(
      `M${f(x + 6 * s)} ${f(y)}Q${f(x + 10 * s)} ${f(y - 50 * s)} ${f(x + 18 * s)} ${f(y - 86 * s)}`,
      p.reedDark,
      3.5 * s,
    ) +
    path(
      `M${f(x + 18 * s)} ${f(y - 80 * s)}m${f(-6 * s)} 0a${f(6 * s)} ${f(13 * s)} 0 1 0 ${f(12 * s)} 0a${f(6 * s)} ${f(13 * s)} 0 1 0 ${f(-12 * s)} 0Z`,
      p.cattail,
    )
  );
}

function billabong(p: Palette, mode: Mode): Layer[] {
  const [x, y] = BILLA;
  const rim = BILLA_PTS.map(([px, py]): Pt => [x + (px - x) * 1.07, y + 10 + (py - y) * 1.32]);
  const bank = BILLA_PTS.map(([px, py]): Pt => [x + (px - x) * 1.03, y + 5 + (py - y) * 1.12]);
  let water =
    `<defs>${linearGradient('auBilla', [
      [0, p.waterDeep],
      [0.55, p.water],
      [1, p.water],
    ])}</defs>` +
    path(smooth(rim), p.mud) +
    path(smooth(bank), p.mudDark) +
    path(smooth(BILLA_PTS), 'url(#auBilla)') +
    stroke(curve(x - 210, y - 30, x - 40, y - 34, -6), p.waterLight, 8, ' stroke-opacity=".7"') +
    stroke(curve(x + 60, y + 20, x + 210, y + 18, -5), p.waterLight, 7, ' stroke-opacity=".6"') +
    stroke(curve(x - 120, y + 40, x - 20, y + 42, -3), p.waterLight, 5, ' stroke-opacity=".5"');
  if (mode === 'night') {
    water +=
      stroke(curve(x + 20, y - 18, x + 150, y - 20, -4), p.glint, 8, ' stroke-opacity=".6"') +
      stroke(curve(x + 50, y + 4, x + 120, y + 4, -3), p.glint, 6, ' stroke-opacity=".45"');
  }
  water +=
    lilyPad(x - 230, y + 18, 34, 12, p.lilyPad, -30) +
    lilyPad(x - 180, y + 36, 24, 9, p.lilyPadDark, 200) +
    lilyPad(x + 190, y + 8, 30, 11, p.lilyPad, 160) +
    lilyPad(x + 240, y + 30, 22, 8, p.lilyPadDark, 20) +
    lilyPad(x + 20, y + 50, 26, 9, p.lilyPad, 250) +
    waterLily(x - 226, y + 12, 1, p) +
    waterLily(x + 196, y + 4, 0.85, p);
  return [
    [y - 82, water],
    [y - 40, reeds(x - 330, y + 6, 1.1, p)],
    [y - 30, reeds(x + 336, y + 2, 0.95, p)],
    [y + 70, rock(x + 120, y + 96, 0.5, p.redRock, p.redRockShade, p.redRockLight)],
  ];
}

function wattle(x: number, y: number, s: number, p: Palette, seed: number): string {
  const r = rng(seed);
  const cx = x - 6 * s;
  const cy = y - 96 * s;
  let out = path(ellipse(x, y + 4 * s, 140 * s, 18 * s), p.shadow, ' fill-opacity=".45"');
  out += path(scallop(x, y - 88 * s, 1, 20, 12 * s, 0, 136 * s, 90 * s), p.wattleLeafDark);
  let fronds = '';
  let stems = '';
  let balls = '';
  let shine = '';
  const ball = (px: number, py: number, pr: number) => {
    balls += circle(px, py, pr);
    shine += circle(px - pr * 0.3, py - pr * 0.32, pr * 0.42);
  };
  for (let i = 0; i < 24; i++) {
    const a = range(r, -1.05, 0.05) * Math.PI;
    const lx = cx + Math.cos(a) * 120 * s;
    const ly = cy + Math.sin(a) * 76 * s;
    fronds += leaf(lx, ly, range(r, 30, 46) * s, 4.5 * s, (a * 180) / Math.PI + range(r, -20, 20));
  }
  for (let i = 0; i < 7; i++) {
    const a = (-0.95 + (i * 0.9) / 6) * Math.PI;
    const sx = cx + Math.cos(a) * 104 * s;
    const sy = cy + Math.sin(a) * 66 * s;
    const ex = sx + Math.cos(a) * 52 * s;
    const ey = sy + Math.sin(a) * 40 * s - 10 * s;
    stems += curve(sx, sy, ex, ey, 10 * s);
    for (let k = 1; k <= 3; k++) {
      const t = k / 3;
      ball(sx + (ex - sx) * t + range(r, -6, 6) * s, sy + (ey - sy) * t, range(r, 9, 12) * s);
    }
  }
  out += path(fronds, p.wattleLeafDark) + stroke(stems, p.wattleStem, 4 * s);
  out += path(scallop(cx, cy, 1, 20, 11 * s, 9, 124 * s, 80 * s), p.wattleLeaf);
  for (let i = 0; i < 54; i++) {
    const a = range(r, 0, Math.PI * 2);
    const k = Math.sqrt(range(r, 0.04, 1));
    ball(cx + Math.cos(a) * 112 * k * s, cy + Math.sin(a) * 72 * k * s, range(r, 9, 12.5) * s);
  }
  return out + path(balls, p.wattle) + path(shine, p.wattleLight);
}

function spinifex(x: number, y: number, s: number, p: Palette): string {
  let back = '';
  let front = '';
  for (let i = 0; i < 13; i++) {
    const a = -172 + (i * 164) / 12;
    const len = (50 + 30 * Math.sin(((a + 180) / 180) * Math.PI)) * s;
    back += leaf(x + (i - 6) * 3 * s, y + 2, len * 1.08, 5 * s, a + 3);
  }
  for (let i = 0; i < 11; i++) {
    const a = -164 + (i * 148) / 10;
    const len = (42 + 26 * Math.sin(((a + 180) / 180) * Math.PI)) * s;
    front += leaf(x + (i - 5) * 3 * s, y + 3, len, 4.4 * s, a);
  }
  return path(back, p.spinDark) + path(front, p.spin);
}

function tussock(x: number, y: number, s: number, p: Palette): string {
  let back = '';
  let front = '';
  for (let i = 0; i < 12; i++) {
    const a = -160 + (i * 140) / 11;
    const len = (70 + 40 * Math.sin(((a + 180) / 180) * Math.PI)) * s;
    const d = leaf(x + (i - 5.5) * 3 * s, y + 2, len, 4 * s, a);
    if (i % 2) back += d;
    else front += d;
  }
  return path(back, p.tussockDark) + path(front, p.tussock);
}

function desertPea(x: number, y: number, s: number, p: Palette): string {
  let out =
    path(leaf(x, y, 30 * s, 8 * s, -160), p.peaLeaf) +
    path(leaf(x, y, 30 * s, 8 * s, -20), p.peaLeaf);
  for (const [dx, dy] of [
    [-16, -30],
    [10, -42],
    [28, -24],
  ]) {
    const fx = x + dx * s;
    const fy = y + dy * s;
    out +=
      stroke(curve(x, y, fx, fy + 8 * s, 4 * s), p.peaLeaf, 3 * s) +
      path(leaf(fx, fy, 22 * s, 7 * s, -100), p.pea) +
      path(leaf(fx, fy, 20 * s, 6 * s, 130), p.pea) +
      path(leaf(fx, fy, 20 * s, 6 * s, 50), p.pea) +
      path(ellipse(fx, fy - 3 * s, 5 * s, 6.5 * s), p.peaEye) +
      path(circle(fx - 1.5 * s, fy - 5 * s, 1.6 * s), '#ffffff', ' fill-opacity=".6"');
  }
  return out;
}

function pebbles(x: number, y: number, s: number, color: string, shade: string): string {
  return (
    path(ellipse(x, y, 22 * s, 13 * s), shade) +
    path(ellipse(x - 2 * s, y - 3 * s, 20 * s, 11 * s), color) +
    path(ellipse(x + 34 * s, y + 6 * s, 13 * s, 8 * s), shade) +
    path(ellipse(x + 33 * s, y + 4 * s, 12 * s, 7 * s), color)
  );
}

function scrubDot(x: number, y: number, s: number, p: Palette): string {
  return (
    path(scallop(x, y - 10 * s, 1, 7, 4 * s, x, 26 * s, 13 * s), p.scrubDark) +
    path(scallop(x - 3 * s, y - 13 * s, 1, 7, 3.5 * s, x + 9, 22 * s, 10 * s), p.scrub)
  );
}

function frond(
  x: number,
  y: number,
  len: number,
  width: number,
  angle: number,
  bend: number,
  teeth = 17,
): [string, string] {
  const n = teeth * 2;
  const spine: Pt[] = [[x, y]];
  let px = x;
  let py = y;
  for (let i = 1; i <= n; i++) {
    const a = ((angle + bend * Math.pow(i / n, 1.5)) * Math.PI) / 180;
    px += (Math.cos(a) * len) / n;
    py += (Math.sin(a) * len) / n;
    spine.push([px, py]);
  }
  const left: Pt[] = [];
  const right: Pt[] = [];
  for (let i = 1; i < n; i++) {
    const t = i / n;
    const [ax, ay] = spine[i - 1];
    const [bx, by] = spine[i + 1];
    const dl = Math.hypot(bx - ax, by - ay) || 1;
    const tx = (bx - ax) / dl;
    const ty = (by - ay) / dl;
    const env = Math.pow(Math.sin(Math.PI * Math.min(1, 0.12 + t * 0.95)), 0.9);
    const wv = width * env * (i % 2 ? 1 : 0.42);
    const fwd = i % 2 ? width * env * 0.45 : 0;
    const [sx, sy] = spine[i];
    left.push([sx - ty * wv + tx * fwd, sy + tx * wv + ty * fwd]);
    right.push([sx + ty * wv + tx * fwd, sy - tx * wv + ty * fwd]);
  }
  return [
    smooth([spine[0], ...left, spine[n], ...right.reverse()], true, 0.5),
    smooth(spine, false),
  ];
}

function koru(x: number, y: number, s: number, color: string): string {
  const cx = x + 16 * s;
  const cy = y - 66 * s;
  const pts: Pt[] = [
    [x, y],
    [x - 6 * s, y - 24 * s],
  ];
  for (let i = 0; i <= 26; i++) {
    const t = i / 26;
    const a = Math.PI + t * Math.PI * 3.1;
    const rad = (22 - 17 * t) * s;
    pts.push([cx + Math.cos(a) * rad, cy + Math.sin(a) * rad]);
  }
  return path(
    tube(pts, (u) => (6.5 - 3 * u) * s, 90),
    color,
  );
}

const PONGA_FRONDS: [number, number, number][] = [
  [-196, -44, 0.86],
  [16, 44, 0.86],
  [-174, -58, 1],
  [-6, 58, 1],
  [-150, -66, 1.06],
  [-30, 66, 1.06],
  [-126, -64, 1],
  [-54, 64, 1],
  [-104, -56, 0.9],
  [-76, 56, 0.9],
  [-92, -30, 0.62],
];

function ponga(
  x: number,
  y: number,
  s: number,
  p: Palette,
  lean: number,
  silver: number[],
  shadow = true,
): string {
  const top: Pt = [x + lean * s, y - 360 * s];
  const spine: Pt[] = [[x, y + 4], [x + lean * 0.25 * s, y - 180 * s], top];
  let out = shadow
    ? path(ellipse(x, y + 4 * s, 90 * s, 12 * s), p.shadowGreen, ' fill-opacity=".45"')
    : '';
  const trunk = tube(spine, (u) => (25 - 7 * u) * s);
  const id = `auPonga${Math.round(x)}`;
  let lattice = '';
  const step = 26 * s;
  for (let k = -16; k < 16; k++) {
    const y0 = y + 10 - k * step;
    lattice += `M${f(x - 60 * s)} ${f(y0)}l${f(120 * s)} ${f(-60 * s)}M${f(x - 60 * s)} ${f(y0 - 60 * s)}l${f(120 * s)} ${f(60 * s)}`;
  }
  out +=
    `<defs><clipPath id="${id}"><path d="${trunk}"/></clipPath></defs>` +
    path(trunk, p.pongaTrunk) +
    group(
      stroke(lattice, p.pongaTrunkDark, 4 * s, ' stroke-opacity=".7"') +
        path(
          tube(
            spine.map(([px, py]): Pt => [px + 12 * s, py]),
            (u) => (10 - 3 * u) * s,
          ),
          p.pongaTrunkDark,
          ' fill-opacity=".35"',
        ),
      '',
      ` clip-path="url(#${id})"`,
    );
  PONGA_FRONDS.forEach(([a, b, k], i) => {
    const [outline, rib] = frond(top[0], top[1], 270 * k * s, 34 * s, a, b);
    const silverSide = silver.includes(i);
    const fill = silverSide ? p.silver : i < 4 ? p.frondDark : i % 2 ? p.frond : p.frondLight;
    out += path(outline, fill) + stroke(rib, silverSide ? p.frondLight : p.frondDark, 3 * s);
  });
  out += koru(top[0] - 20 * s, top[1] + 8 * s, 0.55 * s, p.koru);
  out += koru(top[0] + 2 * s, top[1] + 4 * s, 0.45 * s, p.koru);
  return out;
}

function groundFern(x: number, y: number, s: number, p: Palette, curl = false): string {
  let out = '';
  (
    [
      [-170, -34, 0.8, p.frondDark],
      [-10, 34, 0.8, p.frondDark],
      [-140, -44, 1, p.frond],
      [-40, 44, 1, p.frond],
      [-104, -30, 0.92, p.frondLight],
      [-76, 30, 0.86, p.frond],
    ] as [number, number, number, string][]
  ).forEach(([a, b, k, color]) => {
    const [outline, rib] = frond(x, y, 130 * k * s, 20 * s, a, b, 12);
    out += path(outline, color) + stroke(rib, p.frondDark, 2 * s);
  });
  return curl ? out + koru(x - 6 * s, y + 2, 0.9 * s, p.koru) : out;
}

const BUSH_BACK: Clump[] = [
  [3060, 1060, 150, 110],
  [3220, 990, 200, 150],
  [3440, 930, 230, 170],
  [3660, 970, 210, 170],
];

const BUSH_FRONT: Clump[] = [
  [3010, 1124, 140, 74],
  [3200, 1132, 150, 70],
  [3390, 1146, 180, 80],
  [3600, 1170, 190, 86],
];

function nativeBush(p: Palette, blobs: Clump[]): string {
  let out = '';
  for (const [x, y, rx, ry] of blobs) {
    out += path(scallop(x, y + 16, 1, 12, rx * 0.14, x, rx, ry), p.bushDark);
  }
  for (const [x, y, rx, ry] of blobs) {
    out += path(scallop(x - 10, y, 1, 12, rx * 0.12, x + 15, rx * 0.92, ry * 0.84), p.bush);
  }
  for (const [x, y, rx, ry] of blobs) {
    out += path(
      scallop(x - rx * 0.32, y - ry * 0.34, 1, 8, rx * 0.06, 0, rx * 0.4, ry * 0.3),
      p.bushLight,
    );
  }
  return out;
}

function lupin(x: number, y: number, s: number, color: string, p: Palette): string {
  const light = mix(color, p.lupinLight, 0.45);
  const tip = y - 200 * s;
  let out = stroke(`M${f(x)} ${f(y)}L${f(x + 2 * s)} ${f(tip + 30 * s)}`, p.lupinLeaf, 5 * s);
  let petals = '';
  let shine = '';
  for (let i = 0; i < 9; i++) {
    const t = i / 8;
    const cy = y - 84 * s - t * 108 * s;
    const rr = (12 - 6 * t) * s;
    const sp = (11 - 6 * t) * s;
    petals += ellipse(x - sp, cy, rr, rr * 0.78) + ellipse(x + sp, cy - 4 * s, rr, rr * 0.78);
    shine += ellipse(x - sp - rr * 0.2, cy - rr * 0.32, rr * 0.45, rr * 0.28);
  }
  out += path(petals, color) + path(shine, light);
  return out + path(ellipse(x + 1 * s, tip + 4 * s, 5 * s, 10 * s), p.lupinBud);
}

function lupinLeaf(x: number, y: number, s: number, color: string): string {
  let d = '';
  for (let i = 0; i < 7; i++) d += leaf(x, y, 30 * s, 5 * s, -168 + i * 26);
  return path(d, color);
}

function lupinPatch(p: Palette): string {
  const [x, y] = LUPINS;
  const spikes: [number, number, number, string][] = [
    [-120, -10, 0.9, p.lupinPink],
    [-62, -24, 1.15, p.lupinPurple],
    [-10, -6, 1, p.lupinBlue],
    [44, -20, 1.2, p.lupinPink],
    [96, -4, 0.95, p.lupinPurple],
    [-90, 12, 0.8, p.lupinPurple],
    [70, 14, 0.82, p.lupinBlue],
  ];
  let out = path(ellipse(x, y + 8, 170, 20), p.shadowGreen, ' fill-opacity=".4"');
  out +=
    lupinLeaf(x - 130, y + 4, 1.2, p.lupinLeafDark) +
    lupinLeaf(x + 120, y + 6, 1.1, p.lupinLeafDark);
  for (const [dx, dy, s, color] of spikes) out += lupin(x + dx, y + dy, s, color, p);
  out +=
    lupinLeaf(x - 60, y + 14, 1.1, p.lupinLeaf) +
    lupinLeaf(x + 30, y + 18, 1.2, p.lupinLeaf) +
    lupinLeaf(x + 110, y + 20, 0.9, p.lupinLeaf);
  return out;
}

function geyser(p: Palette): string {
  const [x, y] = GEYSER;
  const s = 0.9;
  const X = (d: number) => x + d * s;
  const Y = (d: number) => y + d * s;
  const mound =
    smooth(
      [
        [X(-200), y + 8],
        [X(-130), Y(-30)],
        [X(-56), Y(-58)],
        [X(54), Y(-60)],
        [X(136), Y(-28)],
        [X(206), y + 8],
      ],
      false,
    ) + 'Z';
  let out = `<defs><clipPath id="auSinter"><path d="${mound}"/></clipPath></defs>`;
  out += path(ellipse(x, y + 6, 210 * s, 16 * s), p.shadowGreen, ' fill-opacity=".4"');
  out += path(mound, p.sinter);
  out += group(
    path(ellipse(X(-10), Y(-20), 170 * s, 22 * s), p.sinterWarm, ' fill-opacity=".55"') +
      stroke(curve(X(-150), Y(-14), X(150), Y(-14), -20 * s), p.sinterShade, 6 * s) +
      stroke(curve(X(-110), Y(-36), X(110), Y(-38), -16 * s), p.sinterShade, 5 * s) +
      path(ellipse(x, y + 10, 220 * s, 18 * s), p.sinterShade, ' fill-opacity=".6"'),
    '',
    ' clip-path="url(#auSinter)"',
  );
  out += path(ellipse(x, Y(-58), 64 * s, 13 * s), p.sinterShade);
  out += path(ellipse(x, Y(-57), 56 * s, 10 * s), p.pool);
  out += path(ellipse(X(-16), Y(-59), 20 * s, 3 * s), p.poolLight, ' fill-opacity=".8"');
  const col = `M${f(X(-20))} ${f(Y(-60))}C${f(X(-16))} ${f(Y(-130))} ${f(X(-22))} ${f(Y(-200))} ${f(X(-12))} ${f(Y(-258))}L${f(X(12))} ${f(Y(-258))}C${f(X(20))} ${f(Y(-200))} ${f(X(16))} ${f(Y(-130))} ${f(X(20))} ${f(Y(-60))}Z`;
  out += path(col, p.steam, ' fill-opacity=".92"');
  out += stroke(
    `M${f(X(-4))} ${f(Y(-70))}L${f(X(-2))} ${f(Y(-240))}`,
    p.poolLight,
    5 * s,
    ' stroke-opacity=".8"',
  );
  let plume = '';
  for (const [dx, dy, rr] of [
    [0, -276, 30],
    [-28, -256, 22],
    [26, -252, 20],
    [-8, -306, 20],
    [18, -294, 16],
  ] as [number, number, number][]) {
    plume += circle(X(dx), Y(dy), rr * s);
  }
  out += path(plume, p.steam, ' fill-opacity=".9"');
  let drops = '';
  for (const [dx, dy, rr] of [
    [-54, -230, 6],
    [-70, -190, 5],
    [-80, -150, 4],
    [52, -226, 6],
    [70, -186, 5],
    [82, -146, 4],
  ] as [number, number, number][]) {
    drops += circle(X(dx), Y(dy), rr * s);
  }
  out += path(drops, p.poolLight);
  let puffs = '';
  for (const [dx, dy, rr] of [
    [-50, -70, 26],
    [48, -72, 24],
    [-84, -60, 16],
  ] as [number, number, number][]) {
    puffs += circle(X(dx), Y(dy), rr * s);
  }
  return out + path(puffs, p.steam, ' fill-opacity=".55"');
}

function mossyLog(x: number, y: number, len: number, p: Palette): string {
  const rr = 34;
  return (
    path(ellipse(x, y + 4, len * 0.55, 12), p.shadowGreen, ' fill-opacity=".45"') +
    path(roundRect(x - len / 2, y - rr * 2, len, rr * 2, rr), p.log) +
    path(
      roundRect(x - len / 2 + rr, y - rr * 0.7, len - rr * 2, rr * 0.5, rr * 0.25),
      p.logDark,
      ' fill-opacity=".5"',
    ) +
    path(ellipse(x + len / 2 - rr * 0.5, y - rr, rr * 0.55, rr), p.logEnd) +
    path(ellipse(x + len / 2 - rr * 0.5, y - rr, rr * 0.3, rr * 0.55), p.logRing) +
    path(scallop(x - len * 0.12, y - rr * 2 + 4, 1, 9, 9, 0, len * 0.34, 14), p.moss) +
    path(scallop(x - len * 0.36, y - rr * 1.2, 1, 6, 6, 30, 30, 22), p.moss)
  );
}

const AVOID: Zone[] = [
  [BILLA[0], BILLA[1], 460, 150],
  [GUM[0], GUM[1], 170, 50],
  [WATTLE[0], WATTLE[1] - 40, 170, 80],
  [GEYSER[0], GEYSER[1] - 20, 240, 60],
  [LUPINS[0], LUPINS[1] - 20, 200, 70],
  [PONGA[0], PONGA[1], 120, 40],
  [2860, 1450, 200, 60],
  [2600, 1530, 120, 50],
];

function scatterAround(
  seed: number,
  count: number,
  x0: number,
  x1: number,
  y0: number,
  y1: number,
  draw: (x: number, y: number, r: () => number) => string,
): Layer[] {
  const r = rng(seed);
  const out: Layer[] = [];
  for (let i = 0; i < count; i++) {
    const x = range(r, x0, x1);
    const y = range(r, y0, y1);
    const svg = draw(x, y, r);
    if (AVOID.some(([cx, cy, rx, ry]) => ((x - cx) / rx) ** 2 + ((y - cy) / ry) ** 2 < 1)) continue;
    if (y < nearY(x) + 24) continue;
    out.push([y, svg]);
  }
  return out;
}

function midScrub(p: Palette): Layer[] {
  const r = rng(51);
  const out: Layer[] = [];
  for (let i = 0; i < 22; i++) {
    const x = range(r, -20, 1480);
    const y = range(r, midY(x) + 14, nearY(x) - 4);
    out.push([y, scrubDot(x, y, range(r, 0.6, 1.1), p)]);
  }
  return out;
}

function scenery(p: Palette): Layer[] {
  return [
    ...midScrub(p),
    [1060, smallGum(1592, 1062, 0.42, p)],
    [1050, smallGum(160, 1050, 0.36, p)],
    [1146, termiteMound(1668, 1146, 0.5, p.mound, p.moundShade)],
    [1196, termiteMound(1740, 1196, 0.8, p.mound, p.moundShade)],
    [1180, termiteMound(760, 1180, 0.5, p.mound, p.moundShade)],
    [1560, rock(1570, 1560, 0.9, p.redRock, p.redRockShade, p.redRockLight)],
    [1830, rock(340, 1830, 0.7, p.redRock, p.redRockShade, p.redRockLight)],
    [1450, mossyLog(2860, 1450, 300, p)],
    [1530, rock(2600, 1530, 1.1, p.greyRock, p.greyRockShade, p.greyRockLight)],
    [1250, rock(3460, 1250, 0.7, p.greyRock, p.greyRockShade, p.greyRockLight)],
    [1480, groundFern(3010, 1480, 1, p)],
    [1600, groundFern(3420, 1600, 1.1, p)],
    [1380, groundFern(3500, 1380, 0.9, p)],
    ...scatterAround(11, 90, 0, W, 1110, 1920, (x, y, r) => {
      const k = blend(x, y);
      const pick = r();
      const s = 0.6 + r() * 0.5;
      const dark = r() < 0.5;
      if (pick > k + 0.2) return spinifex(x, y, s, p);
      if (pick > k - 0.12) return tussock(x, y, s * 0.9, p);
      return grassTuft(x, y, s + 0.25, dark ? p.grass : p.grassDark);
    }),
    ...scatterAround(17, 40, 1800, W, 1100, 1950, (x, y, r) =>
      grassTuft(x, y, 0.8 + r() * 0.6, r() < 0.5 ? p.grass : p.grassDark),
    ),
    ...scatterAround(19, 12, 0, 1500, 1150, 1880, (x, y, r) =>
      pebbles(x, y, 0.8 + r() * 0.6, p.redRockLight, p.redRock),
    ),
    ...scatterAround(23, 7, 100, 1450, 1200, 1850, (x, y, r) =>
      desertPea(x, y, 0.7 + r() * 0.3, p),
    ),
    ...scatterAround(29, 18, 2150, 3500, 1180, 1880, (x, y, r) =>
      flower(x, y, 0.7 + r() * 0.3, r() < 0.5 ? p.daisy : p.buttercup, p.flowerCenter),
    ),
  ];
}

function tappables(p: Palette, mode: Mode): Record<string, Layer[]> {
  return {
    uluru: [[ULURU[1], uluru(p)]],
    geyser: [[GEYSER[1], geyser(p)]],
    gum: [[GUM[1], gumTree(GUM[0], GUM[1], 1, p, 5)]],
    billabong: billabong(p, mode),
    wattle: [[WATTLE[1], wattle(WATTLE[0], WATTLE[1], 1.1, p, 7)]],
    ponga: [[PONGA[1], ponga(PONGA[0], PONGA[1], 1.25, p, -30, [0, 5])]],
    lupins: [[LUPINS[1], lupinPatch(p)]],
  };
}

function transformer(transform: string, outer: (pt: Pt) => Pt): (pt: Pt) => Pt {
  let move = outer;
  for (const [, op, args] of transform.matchAll(/(\w+)\(([^)]*)\)/g)) {
    const [a, b = op === 'scale' ? a : 0] = args
      .trim()
      .split(/[\s,]+/)
      .map(Number);
    const prev = move;
    if (op === 'translate') move = ([px, py]) => prev([px + a, py + b]);
    else if (op === 'scale') move = ([px, py]) => prev([px * a, py * b]);
  }
  return move;
}

function shapes(svg: string): Shape[] {
  const out: Shape[] = [];
  const stack: [(pt: Pt) => Pt, boolean][] = [[(pt) => pt, false]];
  const body = svg.replace(/<defs>[\s\S]*?<\/defs>/g, '');
  for (const m of body.matchAll(/<g([^>]*)>|<\/g>| d="([^"]+)"/g)) {
    const [move, clipped] = stack[stack.length - 1];
    if (m[0] === '</g>') stack.pop();
    else if (m[0].startsWith('<g')) {
      const t = m[1].match(/transform="([^"]*)"/);
      stack.push([t ? transformer(t[1], move) : move, clipped || m[1].includes('clip-path')]);
    } else if (m[2] && !clipped) {
      for (const d of m[2].split(/(?=M)/)) {
        const pts = samplePath(d).map(move);
        out.push([extendBounds(emptyBounds(), pts), pts]);
      }
    }
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

type Split = { props: Record<string, Layer[]>; loose: Layer[] };

let lastSplit: { p: Palette; mode: Mode; split: Split } | undefined;

function splitLayers(p: Palette, mode: Mode): Split {
  const props = tappables(p, mode);
  const owners = Object.entries(props)
    .reverse()
    .map(([id, layers]) => ({
      id,
      reach: Math.max(...layers.map(([k]) => k)) + 140,
      parts: layers.map(([k, svg]): [number, Shape[]] => [k, shapes(svg)]),
    }));
  const loose: Layer[] = [];
  for (const item of scenery(p).sort((a, b) => a[0] - b[0])) {
    const own = shapes(item[1]);
    const owner = owners.find(({ parts }) =>
      parts.some(([k, b]) => k < item[0] && overlap(own, b)),
    );
    if (owner) {
      props[owner.id].push(item);
      if (item[0] < owner.reach) owner.parts.push([item[0], own]);
    } else loose.push(item);
  }
  return { props, loose };
}

function aussieLayers(p: Palette, mode: Mode): Split {
  if (lastSplit?.p !== p || lastSplit.mode !== mode) {
    lastSplit = { p, mode, split: splitLayers(p, mode) };
  }
  return lastSplit.split;
}

const drawProp =
  (id: string) =>
  (p: Palette, mode: Mode): string =>
    layered(aussieLayers(p, mode).props[id]);

function sunWithSpinningRays(p: Palette): string {
  const svg = sun(SUN[0], SUN[1], 104, p.sun, p.sunRay, p.face);
  const rays = (svg.match(/<path[^>]*\/>/g) ?? []).slice(0, 12).join('');
  return svg.replace(
    rays,
    `<g data-spin="" style="transform-origin: ${SUN[0]}px ${SUN[1]}px">${rays}</g>`,
  );
}

const day: Palette = {
  skyTop: '#5fbcef',
  skyMid: '#a3dbf5',
  skyBottom: '#fdf0da',
  haze: '#ffc996',
  mist: '#f4fbff',
  sun: '#ffd34d',
  sunRay: '#ffbf38',
  face: '#8a4b1f',
  cloud: '#ffffff',
  cloudShade: '#e6eef8',
  alpFar: '#c9d2f0',
  alpFarShade: '#b4c0e8',
  alp: '#a9b6e3',
  alpShade: '#8e9cd4',
  snow: '#f9fbff',
  snowShade: '#dbe3f8',
  rangeFar: '#e2ae98',
  rangeLight: '#ecc3ae',
  rangeShade: '#cf957f',
  dome: '#dd9372',
  domeShade: '#c57a5c',
  plainFar: '#eab08e',
  goldFar: '#e6c99a',
  hillFar: '#b9dca2',
  plain: '#e7976a',
  gold: '#dfb878',
  hill: '#99cf76',
  hillA: '#9fd47a',
  hillB: '#86c766',
  hillLight: '#c8eaa2',
  hillShade: '#6aaa52',
  sheep: '#ffffff',
  sheepFace: '#4a4040',
  ground: '#ee9f6c',
  goldGround: '#e2b874',
  grassGround: '#93cc6c',
  groundLight: '#f5b588',
  grassLight: '#ace08a',
  groundDark: '#de8a5a',
  grassDark: '#78b856',
  grass: '#86c462',
  hillBush: '#6eae5b',
  shadow: '#cf7d50',
  shadowGreen: '#6aa94e',
  rock: '#e07040',
  rockShade: '#c4572d',
  rockLight: '#f4a06a',
  rockDark: '#a8452a',
  rockGlow: '#ffa24f',
  scrub: '#a3a356',
  scrubDark: '#878a45',
  gumTrunk: '#f4ece2',
  gumTrunkShade: '#ddcfc0',
  gumBark: '#cdbdae',
  scribble: '#8b7a6c',
  gumLeaf: '#93bf8c',
  gumLeafDark: '#709f72',
  gumLeafLight: '#b5d8a8',
  water: '#4fbfdc',
  waterDeep: '#3aa5cc',
  waterLight: '#c3f0fa',
  glint: '#fff1c0',
  mud: '#c98058',
  mudDark: '#ab6843',
  reed: '#8bb85c',
  reedDark: '#6e9d48',
  cattail: '#8b5a3c',
  lilyPad: '#78b858',
  lilyPadDark: '#5d9e46',
  lily: '#ff9ccb',
  lilyLight: '#ffd0e6',
  lilyCenter: '#ffd84d',
  spin: '#cfc56a',
  spinDark: '#aaa24f',
  tussock: '#dcb85e',
  tussockDark: '#c09c46',
  pea: '#ee3d3d',
  peaEye: '#4a1a24',
  peaLeaf: '#93a86a',
  wattleLeaf: '#82ad62',
  wattleLeafDark: '#64924c',
  wattle: '#ffd23a',
  wattleLight: '#fff3a6',
  wattleStem: '#7d7042',
  mound: '#d27a4c',
  moundShade: '#b25e37',
  redRock: '#d4744a',
  redRockShade: '#b65b37',
  redRockLight: '#efa077',
  greyRock: '#a9b0bb',
  greyRockShade: '#8d95a3',
  greyRockLight: '#d3d8df',
  bush: '#4f9c5b',
  bushDark: '#3b8049',
  bushLight: '#6db96f',
  cabbage: '#8a6a4e',
  cabbageLeaf: '#6fa858',
  pongaTrunk: '#6e4d39',
  pongaTrunkDark: '#523829',
  frond: '#4f9e57',
  frondDark: '#3b8448',
  frondLight: '#73bf6c',
  silver: '#dfe9e0',
  koru: '#8fd27a',
  sinter: '#eee6d8',
  sinterShade: '#d2c6b2',
  sinterWarm: '#f2c98c',
  pool: '#5ad2e2',
  poolLight: '#cdf8fc',
  steam: '#ffffff',
  lupinPurple: '#8b62dc',
  lupinPink: '#f27bbb',
  lupinBlue: '#6f8ff2',
  lupinLight: '#ffffff',
  lupinBud: '#b9dc8c',
  lupinLeaf: '#6aab58',
  lupinLeafDark: '#548f45',
  log: '#8c654a',
  logDark: '#6c4a35',
  logEnd: '#dcbc90',
  logRing: '#c09a6c',
  moss: '#7cc05e',
  daisy: '#ffffff',
  buttercup: '#ffd84d',
  flowerCenter: '#ffc23a',
};

const night: Palette = {
  skyTop: '#0a1034',
  skyMid: '#17245e',
  skyBottom: '#34407e',
  haze: '#8a5ab0',
  mist: '#5a6fb0',
  milky: '#e2ccff',
  star: '#fff6d6',
  starGlow: '#fff2b8',
  sun: '#fff1c0',
  sunRay: '#ffe9a8',
  face: '#7a5a34',
  cloud: '#4b5b9e',
  cloudShade: '#3b4987',
  rock: '#d8652f',
  rockShade: '#b14d26',
  rockLight: '#f08f4e',
  rockDark: '#86341f',
  rockGlow: '#ff9a45',
  water: '#2a4d94',
  waterDeep: '#203d80',
  waterLight: '#93b4f0',
  glint: '#dce6ff',
  pool: '#3f78b8',
  poolLight: '#a9d4f4',
  lily: '#ffb3d6',
};

const interactives: Interactive[] = [
  {
    id: 'sun',
    box: [SUN[0] - 270, SUN[1] - 270, 540, 540],
    kind: 'spin',
    origin: SUN,
    effect: 'sparkle',
    sound: 'shine',
    night: { kind: 'rock', effect: 'stars', sound: 'twinkle' },
    render: (p, mode) =>
      mode === 'day' ? sunWithSpinningRays(p) : moon(SUN[0], SUN[1], 96, p.sun, p.sunRay, p.face),
  },
  {
    id: 'uluru',
    box: [487, 730, 1117, 355],
    kind: 'glow',
    origin: [ULURU[0], ULURU[1] - 120],
    effect: 'sparkle',
    effectAt: [ULURU[0], ULURU[1] - 200],
    sound: 'shine',
    night: { kind: 'glow', effect: 'stars', sound: 'twinkle' },
    render: drawProp('uluru'),
  },
  {
    id: 'geyser',
    box: [2217, 802, 426, 423],
    kind: 'bounce',
    origin: [GEYSER[0], GEYSER[1]],
    effect: 'splash',
    effectAt: [GEYSER[0], GEYSER[1] - 250],
    sound: 'whoosh',
    render: drawProp('geyser'),
  },
  {
    id: 'gum',
    box: [-125, 344, 957, 1010],
    kind: 'shake',
    origin: GUM,
    effect: 'leaves',
    sound: 'rustle',
    render: drawProp('gum'),
  },
  {
    id: 'billabong',
    box: [729, 1359, 939, 289],
    kind: 'pulse',
    origin: BILLA,
    effect: 'splash',
    effectAt: [BILLA[0], BILLA[1] - 10],
    sound: 'splash',
    render: drawProp('billabong'),
  },
  {
    id: 'wattle',
    box: [385, 1490, 469, 356],
    kind: 'bounce',
    origin: [WATTLE[0], WATTLE[1] + 4],
    effect: 'petals',
    sound: 'pop',
    render: drawProp('wattle'),
  },
  {
    id: 'ponga',
    box: [2800, 622, 724, 767],
    kind: 'sway',
    origin: PONGA,
    effect: 'leaves',
    sound: 'rustle',
    render: drawProp('ponga'),
  },
  {
    id: 'lupins',
    box: [2186, 1408, 388, 344],
    kind: 'bounce',
    origin: [LUPINS[0], LUPINS[1] + 10],
    effect: 'petals',
    sound: 'giggle',
    render: drawProp('lupins'),
  },
];

const aussie: SceneDef = {
  id: 'aussie',
  world: [W, H],
  horizon: 700,
  ambient: {
    clouds: 4,
    birds: 3,
    stars: 60,
    fireflies: 8,
    smoke: 4,
    smokeAt: [GEYSER[0], GEYSER[1] - 270],
    smokeScale: 0.55,
  },
  defaults: [
    { animal: 'koala', x: 520, y: 796 },
    { animal: 'kookaburra', x: 100, y: 694 },
    { animal: 'cockatoo', x: 1700, y: 540, flip: true },
    { animal: 'kangaroo', x: 1480, y: 1230, flip: true },
    { animal: 'emu', x: 1960, y: 1220 },
    { animal: 'wombat', x: 910, y: 1720 },
    { animal: 'echidna', x: 1650, y: 1790, flip: true },
    { animal: 'quokka', x: 420, y: 1460 },
    { animal: 'platypus', x: 1080, y: 1505 },
    { animal: 'crocodile', x: 1470, y: 1640, flip: true },
    { animal: 'kiwi', x: 3060, y: 1640, flip: true },
    { animal: 'kakapo', x: 2840, y: 1360 },
    { animal: 'weta', x: 2960, y: 1395, flip: true },
    { animal: 'tuatara', x: 2600, y: 1470 },
  ],
  day,
  night,
  interactives,
  back: (p, mode) => {
    const nightMode = mode === 'night';
    let out = skyLayer(p, nightMode);
    if (nightMode) {
      out += milkyWay(p);
      out += starField(31, 120, 30, 30, W - 30, 880, p.star);
      out += southernCross(p);
    }
    out += alps(p);
    out += longCloud(2760, 770, 1, 2.6, p.cloud, p.cloudShade);
    out += longCloud(3380, 690, 0.7, 2.2, p.cloud, p.cloudShade);
    out += westRange(p);
    out += kataTjuta(p);
    out +=
      `<defs>${sweep('auFar', [p.plainFar, p.goldFar, p.hillFar], 1700, 960, 420, 0)}${sweep(
        'auMid',
        [p.plain, p.gold, p.hill],
        1760,
        1050,
        520,
        0,
      )}${sweep('auNear', [p.ground, p.goldGround, p.grassGround], 1820, 1500, 720, -18)}</defs>` +
      path(landD(farY), 'url(#auFar)');
    out += path(landD(midY), 'url(#auMid)');
    out += rollingHills(p);
    out += path(landD(nearY), 'url(#auNear)');
    const r = rng(77);
    for (let i = 0; i < 34; i++) {
      const x = range(r, -100, W + 100);
      const y = range(r, 1150, 1920);
      const green = r() < blend(x, y);
      const color = green
        ? i % 2
          ? p.grassLight
          : p.grassDark
        : i % 3
          ? p.groundLight
          : p.groundDark;
      out += path(
        ellipse(x, y, range(r, 140, 320), range(r, 22, 44)),
        color,
        ' fill-opacity=".55"',
      );
    }
    out += nativeBush(p, BUSH_BACK);
    out += ponga(3020, 1180, 0.8, p, 20, [3], false);
    out += ponga(3400, 1150, 0.95, p, -16, [], false);
    out += ponga(3600, 1190, 0.85, p, 10, [6], false);
    out += nativeBush(p, BUSH_FRONT);
    if (nightMode) out += uluruGlow(p);
    out += layered(aussieLayers(p, mode).loose);
    return out;
  },
  front: (p) =>
    spinifex(110, 2010, 1.9, p) +
    rock(520, 2034, 1.3, p.redRock, p.redRockShade, p.redRockLight) +
    desertPea(700, 1996, 1.6, p) +
    spinifex(1260, 2014, 1.5, p) +
    tussock(1880, 2010, 1.5, p) +
    tussock(2240, 2012, 1.3, p) +
    groundFern(2760, 2030, 1.5, p) +
    koru(3060, 2010, 1.3, p.koru) +
    groundFern(3460, 2030, 1.7, p, true),
};

export default aussie;
