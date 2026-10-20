import {
  capsule,
  circle,
  curve,
  ellipse,
  f,
  leaf,
  pathBounds,
  poly,
  roundRect,
  samplePath,
  scallop,
  smooth,
  spiky,
  spline,
  tube,
  type Bounds,
  type Pt,
} from '../core/paths';
import {
  grassTuft,
  group,
  layered,
  linearGradient,
  moon,
  palm,
  path,
  radialGlow,
  starField,
  stroke,
  sun,
} from './props';
import { range, rng } from './rng';
import type { Interactive, Mode, Palette, SceneDef } from './types';

const W = 3600;
const H = 2000;

const SUN: Pt = [3190, 300];
const STAR: Pt = [1830, 400];
const STABLE: Pt = [1830, 1330];
const BETH = 1210;
const WELL: Pt = [196, 1716];
const OLIVE: Pt = [3420, 1112];
const FLOWERS: Pt = [2280, 1640];
const FOLD: Pt = [3130, 1028];

const farY = (x: number): number => 930 + 14 * Math.sin(x / 300 + 1) + 8 * Math.sin(x / 120 + 2);
const midY = (x: number): number =>
  1062 +
  16 * Math.sin(x / 250 + 0.4) +
  8 * Math.sin(x / 97) -
  292 * Math.exp(-(((x - BETH) / 350) ** 4));
const groundY = (x: number): number =>
  1172 + 14 * Math.sin(x / 340 + 2) - 172 * Math.exp(-(((x - 3300) / 470) ** 2));

const glowAt = (x: number, y: number, r: number, id: string): string =>
  `<circle cx="${f(x)}" cy="${f(y)}" r="${f(r)}" fill="url(#${id})"/>`;

function landD(fn: (x: number) => number, step = 40): string {
  const pts: Pt[] = [];
  for (let x = -200; x <= W + 200; x += step) pts.push([x, fn(x)]);
  return `${smooth(pts, false)}L${W + 200} ${H + 60}L-200 ${H + 60}Z`;
}

function arch(cx: number, bottom: number, w: number, h: number): string {
  const r = w / 2;
  return `M${f(cx - r)} ${f(bottom)}L${f(cx - r)} ${f(bottom - h + r)}A${f(r)} ${f(r)} 0 0 1 ${f(cx + r)} ${f(bottom - h + r)}L${f(cx + r)} ${f(bottom)}Z`;
}

function softCloud(
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

function sinai(p: Palette): string {
  const x = 2620;
  const base = 980;
  const w = 1320;
  const h = 436;
  const peak: Pt = [x - 24, base - h];
  const body =
    smooth(
      [
        [x - w / 2 - 80, base + 40],
        [x - w * 0.34, base - h * 0.34],
        [x - w * 0.17, base - h * 0.76],
        [x - w * 0.07, base - h * 0.96],
        peak,
        [x + w * 0.04, base - h * 0.95],
        [x + w * 0.12, base - h * 0.84],
        [x + w * 0.3, base - h * 0.44],
        [x + w / 2 + 80, base + 40],
      ],
      false,
    ) + 'Z';
  const ridge = smooth(
    [
      [peak[0] + 2, peak[1] - 30],
      [x - 40, base - h * 0.72],
      [x - 6, base - h * 0.46],
      [x - 64, base - h * 0.2],
      [x - 30, base + 60],
    ],
    false,
  );
  const shade = `${ridge}L${f(x - w)} ${f(base + 60)}L${f(x - w)} ${f(peak[1] - 30)}Z`;
  const gully = (pts: Pt[], wd: number) =>
    stroke(smooth(pts, false), p.mountShade, wd, ' stroke-opacity=".3"');
  return (
    `<defs><clipPath id="bbSinai"><path d="${body}"/></clipPath></defs>` +
    path(body, p.mount) +
    group(
      path(shade, p.mountShade) +
        gully(
          [
            [x + 60, base - h * 0.8],
            [x + 110, base - h * 0.55],
            [x + 170, base - h * 0.32],
          ],
          9,
        ) +
        gully(
          [
            [x + 220, base - h * 0.5],
            [x + 270, base - h * 0.3],
            [x + 330, base - h * 0.12],
          ],
          8,
        ) +
        stroke(
          smooth(
            [
              [x - 150, base - h * 0.62],
              [x - 220, base - h * 0.4],
              [x - 300, base - h * 0.18],
            ],
            false,
          ),
          p.mount,
          8,
          ' stroke-opacity=".35"',
        ) +
        path(
          smooth(
            [
              [peak[0] - 40, peak[1] + 30],
              [peak[0], peak[1] - 4],
              [peak[0] + 46, peak[1] + 26],
              [peak[0] + 20, peak[1] + 50],
              [peak[0] - 16, peak[1] + 44],
            ],
            true,
          ),
          p.mountLight,
          ' fill-opacity=".8"',
        ),
      '',
      ' clip-path="url(#bbSinai)"',
    )
  );
}

function farPeak(x: number, base: number, w: number, h: number, color: string): string {
  return path(
    smooth(
      [
        [x - w / 2, base + 30],
        [x - w * 0.24, base - h * 0.6],
        [x - w * 0.06, base - h * 0.98],
        [x + w * 0.06, base - h],
        [x + w * 0.26, base - h * 0.56],
        [x + w / 2, base + 30],
      ],
      false,
    ) + 'Z',
    color,
  );
}

function cypress(x: number, y: number, s: number, color: string, dark: string): string {
  return (
    path(
      `M${f(x)} ${f(y - 120 * s)}C${f(x + 24 * s)} ${f(y - 80 * s)} ${f(x + 26 * s)} ${f(y - 20 * s)} ${f(x + 12 * s)} ${f(y + 2)}L${f(x - 12 * s)} ${f(y + 2)}C${f(x - 26 * s)} ${f(y - 20 * s)} ${f(x - 24 * s)} ${f(y - 80 * s)} ${f(x)} ${f(y - 120 * s)}Z`,
      dark,
    ) +
    path(
      `M${f(x - 2 * s)} ${f(y - 112 * s)}C${f(x - 22 * s)} ${f(y - 76 * s)} ${f(x - 22 * s)} ${f(y - 22 * s)} ${f(x - 10 * s)} ${f(y)}L${f(x + 2 * s)} ${f(y)}C${f(x + 4 * s)} ${f(y - 40 * s)} ${f(x + 4 * s)} ${f(y - 80 * s)} ${f(x - 2 * s)} ${f(y - 112 * s)}Z`,
      color,
    )
  );
}

function shrub(x: number, y: number, s: number, color: string, dark: string): string {
  return (
    path(scallop(x, y - 22 * s, 1, 7, 7 * s, 180, 40 * s, 24 * s), dark) +
    path(scallop(x - 4 * s, y - 27 * s, 1, 7, 6 * s, 190, 32 * s, 18 * s), color)
  );
}

function smallOlive(x: number, y: number, s: number, p: Palette): string {
  return (
    path(ellipse(x, y + 2 * s, 70 * s, 9 * s), p.midShade, ' fill-opacity=".6"') +
    path(
      tube(
        [
          [x - 4 * s, y + 4 * s],
          [x + 6 * s, y - 40 * s],
          [x - 4 * s, y - 80 * s],
        ],
        (u) => (12 - 5 * u) * s,
      ),
      p.oliveTrunk,
    ) +
    path(scallop(x, y - 104 * s, 1, 12, 9 * s, 0, 78 * s, 44 * s), p.oliveLeafDark) +
    path(scallop(x - 4 * s, y - 110 * s, 1, 12, 8 * s, 10, 68 * s, 36 * s), p.oliveLeaf) +
    path(scallop(x - 18 * s, y - 122 * s, 1, 9, 6 * s, 0, 34 * s, 16 * s), p.oliveLeafLight)
  );
}

function farTree(x: number, y: number, s: number, color: string, trunk: string): string {
  return (
    path(roundRect(x - 3 * s, y - 22 * s, 6 * s, 24 * s, 3 * s), trunk) +
    path(scallop(x, y - 32 * s, 1, 7, 5 * s, 0, 24 * s, 16 * s), color)
  );
}

function terraces(p: Palette): string {
  const d = landD(midY);
  let lines = '';
  for (let k = 1; k <= 6; k++) {
    const pts: Pt[] = [];
    for (let x = BETH - 560; x <= BETH + 560; x += 40) {
      pts.push([x, midY(x) + 40 + k * 46 + 6 * Math.sin(x / 70 + k)]);
    }
    lines += stroke(smooth(pts, false), p.midShade, 6, ' stroke-opacity=".55"');
  }
  return (
    `<defs><clipPath id="bbTerr"><path d="${d}"/></clipPath></defs>` +
    group(lines, '', ' clip-path="url(#bbTerr)"')
  );
}

function fieldPatches(p: Palette): string {
  const d = landD(midY);
  const r = rng(61);
  let out = '';
  for (let i = 0; i < 9; i++) {
    const x = range(r, 1800, 3500);
    out += path(
      ellipse(x, midY(x) + range(r, 30, 70), range(r, 120, 220), range(r, 18, 30), range(r, -4, 4)),
      i % 2 ? p.midGold : p.midLight,
      ' fill-opacity=".75"',
    );
  }
  return (
    `<defs><clipPath id="bbFields"><path d="${d}"/></clipPath></defs>` +
    group(out, '', ' clip-path="url(#bbFields)"')
  );
}

function shorePoints(): Pt[] {
  return [
    [1150, 950],
    [1250, 978],
    [1296, 1050],
    [1270, 1170],
    [1170, 1300],
    [1000, 1410],
    [760, 1480],
    [460, 1520],
    [160, 1540],
    [-80, 1548],
  ];
}

const SHORE = smooth(shorePoints(), false);
const SEA_D = `${SHORE}L-80 950Z`;
const SEA_POLY = samplePath(SEA_D, 8);

function inSea(x: number, y: number, pad = 0): boolean {
  let inside = false;
  for (let i = 0, j = SEA_POLY.length - 1; i < SEA_POLY.length; j = i++) {
    const [xi, yi] = SEA_POLY[i];
    const [xj, yj] = SEA_POLY[j];
    if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) inside = !inside;
  }
  if (inside || !pad) return inside;
  return [
    [pad, 0],
    [-pad, 0],
    [0, pad],
    [0, -pad],
  ].some(([dx, dy]) => inSea(x + dx, y + dy));
}

function beach(p: Palette): string {
  const pts = spline(shorePoints(), 40);
  return (
    path(
      tube(pts, (u) => 22 + 26 * u),
      p.sandDark,
    ) +
    path(
      tube(pts, (u) => 16 + 22 * u),
      p.sand,
    )
  );
}

function waveMark(x: number, y: number, s: number, color: string, op: number): string {
  return stroke(
    `M${f(x - 24 * s)} ${f(y)}Q${f(x - 12 * s)} ${f(y - 7 * s)} ${f(x)} ${f(y)}T${f(x + 24 * s)} ${f(y)}`,
    color,
    4.5 * s,
    ` stroke-opacity="${op}"`,
  );
}

function sea(p: Palette, mode: Mode): string {
  const night = mode === 'night';
  const r = rng(17);
  let marks = '';
  for (let i = 0; i < 26; i++) {
    const x = range(r, 40, 1200);
    const y = range(r, 975, 1500);
    if (!inSea(x, y, 40)) continue;
    const k = (y - 950) / 560;
    marks += waveMark(x, y, 0.6 + k * 0.9, p.seaLight, 0.55 + k * 0.3);
  }
  const foam = spline(shorePoints(), 40).map(([x, y]): Pt => [x - 10, y - 12]);
  return (
    `<defs>${linearGradient('bbSeaGrad', [
      [0, p.seaFar],
      [0.45, p.sea],
      [1, p.seaNear],
    ])}</defs>` +
    path(SEA_D, 'url(#bbSeaGrad)') +
    stroke('M-60 962L1170 962', p.seaLight, 6, ' stroke-opacity=".6"') +
    stroke(smooth(foam, false), p.foam, 7, ' stroke-opacity=".7"') +
    marks +
    (
      [
        [40, 1190, 250, 10, 0.5, 0.6],
        [90, 1226, 200, 8, 0.38, 0.45],
        [960, 1012, 1150, 9, 0.42, 0.55],
        [470, 1452, 640, 8, 0.36, 0.45],
      ] as const
    )
      .map(([x0, y0, x1, wd, nightOp, dayOp]) =>
        stroke(
          curve(x0, y0, x1, y0, -wd * 0.6),
          night ? p.glint : p.seaShine,
          wd,
          ` stroke-opacity="${night ? nightOp : dayOp}"`,
        ),
      )
      .join('')
  );
}

function house(
  x: number,
  y: number,
  w: number,
  h: number,
  v: number,
  p: Palette,
  night: boolean,
): string {
  const wall = [p.houseA, p.houseB, p.houseC][v % 3];
  const side = [p.houseASide, p.houseBSide, p.houseCSide][v % 3];
  const d = w * 0.2;
  const l = x - w / 2;
  const rr = x + w / 2;
  const top = y - h;
  let out =
    path(
      poly([
        [l, y + 4],
        [l - d, y - d * 0.42 + 4],
        [l - d, top - d * 0.42],
        [l, top],
      ]),
      side,
    ) +
    path(
      poly([
        [l - 4, top + 1],
        [l - d - 2, top - d * 0.42],
        [rr - d + 4, top - d * 0.42],
        [rr + 4, top + 1],
      ]),
      p.roofTop,
    ) +
    path(roundRect(l, top, w, h + 4, 3), wall) +
    path(roundRect(l - 4, top - 4, w + 8, 12, 4), p.roofLip);
  const win = (cx: number, cy: number, ww: number, hh: number) =>
    (night ? glowAt(cx, cy, hh * 1.6, 'bbWinGlow') : '') +
    path(arch(cx, cy + hh / 2, ww, hh), p.window) +
    (night ? path(arch(cx, cy + hh / 2, ww * 0.5, hh * 0.6), p.windowCore) : '');
  const door = (cx: number) => path(arch(cx, y + 3, w * 0.22, h * 0.42), p.door);
  if (v === 0) {
    out += win(x - w * 0.22, top + h * 0.36, w * 0.16, h * 0.2) + door(x + w * 0.18);
  } else if (v === 1) {
    out +=
      win(x - w * 0.24, top + h * 0.3, w * 0.15, h * 0.16) +
      win(x + w * 0.22, top + h * 0.3, w * 0.15, h * 0.16) +
      door(x);
  } else {
    out += win(x + w * 0.2, top + h * 0.38, w * 0.18, h * 0.22) + door(x - w * 0.18);
  }
  return out;
}

function dome(x: number, y: number, r: number, p: Palette): string {
  return (
    path(roundRect(x - r * 0.9, y - r * 0.25, r * 1.8, r * 0.3, r * 0.1), p.roofLip) +
    path(
      `M${f(x - r)} ${f(y - r * 0.2)}A${f(r)} ${f(r * 0.95)} 0 0 1 ${f(x + r)} ${f(y - r * 0.2)}Z`,
      p.domeColor,
    ) +
    path(
      `M${f(x - r * 0.55)} ${f(y - r * 0.3)}A${f(r * 0.6)} ${f(r * 0.7)} 0 0 1 ${f(x - r * 0.05)} ${f(y - r * 0.92)}`,
      'none',
      ` stroke="${p.domeLight}" stroke-width="${f(r * 0.14)}" stroke-linecap="round"`,
    ) +
    path(circle(x, y - r * 1.12, r * 0.12), p.domeColor)
  );
}

const HOUSES: [number, number, number, number, number][] = [
  [BETH - 165, 784, 104, 108, 0],
  [BETH - 28, 776, 130, 146, 1],
  [BETH + 112, 782, 112, 100, 2],
  [BETH + 218, 792, 92, 80, 0],
  [BETH - 230, 852, 96, 84, 2],
  [BETH - 100, 858, 124, 100, 0],
  [BETH + 50, 854, 140, 112, 1],
  [BETH + 188, 866, 104, 86, 2],
  [BETH - 32, 928, 120, 82, 2],
  [BETH + 120, 934, 110, 78, 0],
];

function townWall(p: Palette, night: boolean): string {
  const x0 = BETH - 262;
  const x1 = BETH + 286;
  const base = 952;
  const hgt = 44;
  const gx = BETH + 62;
  const merlons = (a: number, b: number, top: number) => {
    let out = '';
    for (let mx = a; mx <= b - 18; mx += 30)
      out += path(roundRect(mx, top - 14, 18, 18, 3), p.wallStone);
    return out;
  };
  const tower = (tx: number, w: number, h: number) =>
    path(roundRect(tx - w / 2, base - h, w, h + 4, 4), p.wallStone) +
    merlons(tx - w / 2 + 2, tx + w / 2 + 2, base - h) +
    path(roundRect(tx - w / 2, base - h, w * 0.26, h + 4, 3), p.wallShade, ' fill-opacity=".7"') +
    path(arch(tx + 3, base - h * 0.44, 10, 22), p.window);
  let joints = '';
  for (let k = 1; k < 3; k++) {
    joints += stroke(
      `M${f(x0 + 6)} ${f(base - hgt + k * 15)}L${f(x1 - 6)} ${f(base - hgt + k * 15)}`,
      p.wallShade,
      2.5,
      ' stroke-opacity=".7"',
    );
  }
  for (let jx = x0 + 22; jx < x1 - 10; jx += 44) {
    for (let k = 0; k < 3; k++) {
      const ox = k % 2 ? 22 : 0;
      joints += stroke(
        `M${f(jx + ox)} ${f(base - hgt + k * 15 + 2)}L${f(jx + ox)} ${f(base - hgt + k * 15 + 13)}`,
        p.wallShade,
        2.5,
        ' stroke-opacity=".6"',
      );
    }
  }
  return (
    path(roundRect(x0, base - hgt, x1 - x0, hgt + 6, 4), p.wallStone) +
    merlons(x0 + 8, x1, base - hgt) +
    joints +
    path(roundRect(x0, base - hgt - 2, x1 - x0, 6, 3), p.wallLight) +
    tower(x0 + 12, 52, 74) +
    tower(x1 - 12, 52, 70) +
    path(roundRect(gx - 50, base - 86, 100, 90, 5), p.wallStone) +
    merlons(gx - 48, gx + 54, base - 86) +
    path(roundRect(gx - 50, base - 86, 100, 7, 3), p.wallLight) +
    (night ? glowAt(gx, base - 26, 70, 'bbWinGlow') : '') +
    path(arch(gx, base + 4, 52, 66), night ? p.window : p.gate) +
    stroke(
      `M${f(gx - 26)} ${f(base - 36)}L${f(gx - 26)} ${f(base + 2)}`,
      p.wallShade,
      3,
      ' stroke-opacity=".6"',
    )
  );
}

function village(p: Palette, mode: Mode): [number, string][] {
  const night = mode === 'night';
  const layers: [number, string][] = [
    [
      700,
      `<defs>${radialGlow('bbWinGlow', p.windowGlow, night ? 0.75 : 0)}</defs>` +
        dome(BETH - 28, 776 - 146, 34, p),
    ],
  ];
  for (const [x, y, w, h, v] of HOUSES) layers.push([y, house(x, y, w, h, v, p, night)]);
  layers.push([792, cypress(BETH + 265, 796, 0.75, p.cypress, p.cypressDark)]);
  layers.push([862, cypress(BETH - 286, 866, 0.7, p.cypress, p.cypressDark)]);
  layers.push([950, townWall(p, night)]);
  layers.push([
    972,
    shrub(BETH - 120, 966, 0.95, p.bush, p.bushDark) +
      shrub(BETH + 196, 970, 0.9, p.bush, p.bushDark) +
      shrub(BETH - 20, 972, 0.7, p.bush, p.bushDark),
  ]);
  return layers;
}

function scallopEdge(pts: Pt[], size: number, bulge: number): string {
  let d = '';
  for (let k = 0; k < pts.length - 1; k++) {
    const [ax, ay] = pts[k];
    const [bx, by] = pts[k + 1];
    const len = Math.hypot(bx - ax, by - ay);
    const n = Math.max(1, Math.round(len / size));
    let nx = -(by - ay) / len;
    let ny = (bx - ax) / len;
    if (ny < 0) {
      nx = -nx;
      ny = -ny;
    }
    for (let i = 0; i < n; i++) {
      const x0 = ax + ((bx - ax) * i) / n;
      const y0 = ay + ((by - ay) * i) / n;
      const x1 = ax + ((bx - ax) * (i + 1)) / n;
      const y1 = ay + ((by - ay) * (i + 1)) / n;
      d += `Q${f((x0 + x1) / 2 + nx * bulge)} ${f((y0 + y1) / 2 + ny * bulge)} ${f(x1)} ${f(y1)}`;
    }
  }
  return d;
}

function strawPile(
  x0: number,
  x1: number,
  y: number,
  h: number,
  color: string,
  seed: number,
): string {
  const r = rng(seed);
  const n = Math.round((x1 - x0) / 13);
  const pts: Pt[] = [[x0 - 6, y + 4]];
  for (let i = 0; i <= n; i++) {
    const u = i / n;
    const px = x0 + (x1 - x0) * u;
    const hh = h * (0.55 + 0.45 * Math.sin(Math.PI * u)) * range(r, 0.85, 1.1);
    pts.push([px + range(r, -3, 3), y - hh - (i % 2 ? range(r, 8, 16) : 0)]);
  }
  pts.push([x1 + 6, y + 4]);
  return path(poly(pts), color);
}

function stable(p: Palette, mode: Mode): string {
  const [x, y] = STABLE;
  const night = mode === 'night';
  const half = 252;
  const L = x - half;
  const R = x + half;
  const top = y - 340;
  const peakY = top - 140;
  let planks = '';
  for (let py = top + 34; py < y - 10; py += 40) {
    planks += stroke(
      `M${f(L + 6)} ${f(py)}L${f(R - 6)} ${f(py)}`,
      p.stableInDark,
      4,
      ' stroke-opacity=".6"',
    );
    const jx = L + 70 + ((py * 7) % 160);
    planks += stroke(
      `M${f(jx)} ${f(py)}L${f(jx)} ${f(py + 40)}`,
      p.stableInDark,
      3,
      ' stroke-opacity=".5"',
    );
    planks += stroke(
      `M${f(jx + 250)} ${f(py)}L${f(jx + 250)} ${f(py + 40)}`,
      p.stableInDark,
      3,
      ' stroke-opacity=".5"',
    );
  }
  const wx = x + 150;
  const wy = top + 78;
  const backWindow =
    path(roundRect(wx - 44, wy - 38, 88, 76, 6), p.woodDark) +
    path(roundRect(wx - 34, wy - 28, 68, 56, 4), p.skyPeek) +
    (night ? path(spiky(wx + 12, wy - 6, 9, 3, 4, -90, 0.3), p.starCore) : '') +
    stroke(
      `M${f(wx)} ${f(wy - 28)}L${f(wx)} ${f(wy + 28)}M${f(wx - 34)} ${f(wy)}L${f(wx + 34)} ${f(wy)}`,
      p.woodDark,
      6,
    );
  const rackX = x - 160;
  const rackY = top + 66;
  let rack = path(scallop(rackX, rackY - 6, 1, 9, 9, 180, 66, 30), p.strawDark);
  rack += path(scallop(rackX - 2, rackY - 10, 1, 9, 8, 190, 56, 22), p.straw);
  rack += path(roundRect(rackX - 78, rackY - 4, 156, 14, 6), p.wood);
  for (let i = 0; i < 6; i++) {
    const bx = rackX - 66 + i * 26;
    rack += stroke(`M${f(bx)} ${f(rackY + 8)}L${f(bx + 10)} ${f(rackY + 54)}`, p.wood, 6);
  }
  rack += path(roundRect(rackX - 70, rackY + 50, 156, 12, 6), p.wood);
  const gable = poly([
    [L - 30, top + 8],
    [x, peakY],
    [R + 30, top + 8],
  ]);
  let boards = '';
  for (let bx = L - 30; bx < R + 30; bx += 34) {
    boards += stroke(
      `M${f(bx)} ${f(peakY)}L${f(bx)} ${f(top + 10)}`,
      p.woodDark,
      4,
      ' stroke-opacity=".55"',
    );
  }
  const eaveL: Pt = [L - 104, top + 44];
  const eaveR: Pt = [R + 104, top + 44];
  const ridge: Pt = [x, peakY - 76];
  const innerL: Pt = [L - 56, top + 72];
  const innerR: Pt = [R + 56, top + 72];
  const innerTop: Pt = [x, peakY - 10];
  const roofEdge = scallopEdge([eaveR, innerR, innerTop, innerL, eaveL], 30, 22);
  const roof = `M${f(eaveL[0])} ${f(eaveL[1])}L${f(ridge[0])} ${f(ridge[1])}L${f(eaveR[0])} ${f(eaveR[1])}${roofEdge}Z`;
  const drop = (q: Pt): Pt => [q[0], q[1] + 12];
  const roofShade = `M${f(eaveL[0])} ${f(eaveL[1] + 12)}L${f(ridge[0])} ${f(ridge[1] + 12)}L${f(eaveR[0])} ${f(eaveR[1] + 12)}${scallopEdge(
    [eaveR, innerR, innerTop, innerL, eaveL].map(drop),
    30,
    22,
  )}Z`;
  let thatch = '';
  for (let i = 1; i < 12; i++) {
    const t = i / 12;
    for (const side of [-1, 1]) {
      const ox = x + side * (half + 104) * t;
      const oy = ridge[1] + (eaveL[1] - ridge[1]) * t;
      const ix = x + side * (half + 56) * t;
      const iy = innerTop[1] + (innerL[1] - innerTop[1]) * t;
      thatch += stroke(
        `M${f(ox * 0.75 + ix * 0.25)} ${f(oy * 0.75 + iy * 0.25 + 4)}L${f(ix)} ${f(iy - 2)}`,
        p.thatchDark,
        5,
        ' stroke-opacity=".55"',
      );
    }
  }
  const roofLight = poly([
    [eaveL[0] + 14, eaveL[1] - 2],
    ridge,
    [eaveR[0] - 14, eaveR[1] - 2],
    [eaveR[0] - 30, eaveR[1] + 8],
    [x, ridge[1] + 22],
    [eaveL[0] + 30, eaveL[1] + 8],
  ]);
  const log = (px: number) =>
    path(
      tube(
        [
          [px, y + 8],
          [px - 3, (y + top) / 2],
          [px + 2, top - 4],
        ],
        (u) => 22 - 3 * u,
      ),
      p.wood,
    ) +
    stroke(
      `M${f(px - 8)} ${f(y - 14)}L${f(px - 10)} ${f(top + 20)}`,
      p.woodLight,
      6,
      ' stroke-opacity=".8"',
    ) +
    stroke(
      `M${f(px + 9)} ${f(y - 60)}L${f(px + 8)} ${f(y - 150)}`,
      p.woodDark,
      3,
      ' stroke-opacity=".6"',
    ) +
    path(ellipse(px + 5, top + 120, 5, 8), p.woodDark);
  const straw =
    strawPile(L - 10, L + 150, y, 66, p.strawDark, 3) +
    strawPile(R - 150, R + 10, y, 60, p.strawDark, 4) +
    strawPile(L + 10, R - 10, y + 6, 34, p.strawDark, 6) +
    strawPile(L, L + 130, y + 2, 50, p.straw, 8) +
    strawPile(R - 130, R, y + 2, 44, p.straw, 9) +
    strawPile(L + 30, R - 30, y + 8, 22, p.straw, 11);
  let strands = '';
  const r = rng(5);
  for (let i = 0; i < 30; i++) {
    const sx = range(r, L - 60, R + 60);
    const sy = y + range(r, -10, 20);
    const a = range(r, -35, 35) + (i % 2 ? 180 : 0);
    strands += stroke(
      `M${f(sx)} ${f(sy)}l${f(Math.cos((a * Math.PI) / 180) * 28)} ${f(Math.sin((a * Math.PI) / 180) * 28)}`,
      i % 3 ? p.straw : p.strawDark,
      4,
    );
  }
  const bale = (bx: number, by: number) =>
    path(roundRect(bx - 62, by - 70, 124, 72, 16), p.strawDark) +
    path(roundRect(bx - 62, by - 74, 118, 66, 16), p.straw) +
    stroke(
      `M${f(bx - 26)} ${f(by - 72)}L${f(bx - 26)} ${f(by - 6)}M${f(bx + 22)} ${f(by - 72)}L${f(bx + 22)} ${f(by - 6)}`,
      p.rope,
      6,
    ) +
    stroke(
      `M${f(bx - 50)} ${f(by - 40)}l20 -8M${f(bx + 30)} ${f(by - 52)}l18 6M${f(bx - 10)} ${f(by - 24)}l16 -6`,
      p.strawDark,
      3,
    );
  const lx = x;
  const ly = top + 70;
  const lantern =
    stroke(`M${f(lx)} ${f(top + 10)}L${f(lx)} ${f(ly - 30)}`, p.iron, 4) +
    path(circle(lx, ly - 34, 6), 'none', ` stroke="${p.iron}" stroke-width="3"`) +
    path(
      poly([
        [lx - 24, ly - 20],
        [lx, ly - 34],
        [lx + 24, ly - 20],
      ]),
      p.iron,
    ) +
    path(roundRect(lx - 20, ly - 22, 40, 56, 8), p.iron) +
    path(roundRect(lx - 14, ly - 15, 28, 42, 5), p.lanternGlass) +
    path(ellipse(lx, ly + 10, 7, 9), p.flameCore) +
    path(leaf(lx, ly + 14, 22, 6.5, -90), p.flame) +
    stroke(`M${f(lx)} ${f(ly - 15)}L${f(lx)} ${f(ly + 27)}`, p.iron, 3) +
    path(roundRect(lx - 23, ly + 30, 46, 9, 4), p.iron);
  const gw =
    path(circle(x, top - 58, 26), p.woodDark) + path(circle(x, top - 58, 18), p.stableWindow);
  return (
    `<defs>${linearGradient('bbStableWall', [
      [0, p.stableInTop],
      [0.55, p.stableIn],
      [1, p.stableInLow],
    ])}${radialGlow('bbLantern', p.lanternGlow, night ? 0.9 : 0.45)}${radialGlow('bbStableWarm', p.lanternGlow, night ? 0.6 : 0)}<clipPath id="bbGable"><path d="${gable}"/></clipPath><clipPath id="bbInside"><path d="${roundRect(L, top - 10, R - L, y - top + 10, 2)}"/></clipPath></defs>` +
    path(ellipse(x, y + 10, half + 120, 28), p.groundShade, ' fill-opacity=".5"') +
    (night
      ? `<ellipse cx="${f(x)}" cy="${f(y + 20)}" rx="${f(half + 160)}" ry="70" fill="url(#bbStableWarm)"/>`
      : '') +
    path(roundRect(L, top - 10, R - L, y - top + 10, 2), 'url(#bbStableWall)') +
    group(
      planks +
        backWindow +
        rack +
        (night
          ? `<ellipse cx="${f(x)}" cy="${f(y - 150)}" rx="${f(half + 40)}" ry="260" fill="url(#bbStableWarm)"/>`
          : ''),
      '',
      ' clip-path="url(#bbInside)"',
    ) +
    path(gable, p.wood) +
    group(boards, '', ' clip-path="url(#bbGable)"') +
    gw +
    path(roofShade, p.thatchDark) +
    path(roof, p.thatch) +
    path(roofLight, p.thatchLight, ' fill-opacity=".85"') +
    thatch +
    (night
      ? `<ellipse cx="${f(x)}" cy="${f(top + 10)}" rx="${f(half + 70)}" ry="120" fill="url(#bbStableWarm)"/>`
      : '') +
    path(roundRect(L - 54, top - 14, R - L + 108, 32, 14), p.woodDark) +
    path(roundRect(L - 50, top - 14, R - L + 100, 14, 7), p.wood) +
    log(L) +
    log(R) +
    straw +
    bale(R + 74, y + 4) +
    strands +
    glowAt(lx, ly + 4, night ? 220 : 80, 'bbLantern') +
    lantern
  );
}

function oliveTree(x: number, y: number, s: number, p: Palette, seed: number): string {
  const T = (pts: Pt[]): Pt[] => pts.map(([dx, dy]) => [x + dx * s, y + dy * s]);
  const limb = (pts: Pt[], r0: number, r1: number) =>
    path(
      tube(T(pts), (u) => (r0 + (r1 - r0) * u) * s),
      p.oliveTrunk,
    );
  let out = path(ellipse(x, y + 6 * s, 180 * s, 20 * s), p.groundShade, ' fill-opacity=".5"');
  out += limb(
    [
      [-20, -150],
      [-90, -200],
      [-170, -228],
      [-230, -236],
    ],
    20,
    7,
  );
  out += limb(
    [
      [16, -160],
      [90, -196],
      [170, -224],
      [236, -226],
    ],
    19,
    7,
  );
  out += limb(
    [
      [0, -170],
      [-30, -250],
      [-70, -300],
    ],
    15,
    6,
  );
  out += limb(
    [
      [4, -170],
      [40, -256],
      [80, -312],
    ],
    15,
    6,
  );
  out += path(
    smooth(
      T([
        [-96, 8],
        [-58, -6],
        [-46, -36],
        [-34, -90],
        [-52, -140],
        [-30, -176],
        [24, -180],
        [50, -146],
        [36, -96],
        [48, -40],
        [62, -6],
        [100, 8],
      ]),
      false,
    ) + 'Z',
    p.oliveTrunk,
  );
  out += path(
    smooth(
      T([
        [10, -8],
        [30, -40],
        [22, -96],
        [38, -144],
        [20, -176],
        [44, -150],
        [52, -96],
        [44, -40],
        [62, -6],
      ]),
      false,
    ) + 'Z',
    p.oliveTrunkDark,
    ' fill-opacity=".45"',
  );
  for (const pts of [
    [
      [-40, -14],
      [-24, -60],
      [-36, -110],
      [-14, -160],
    ],
    [
      [-4, -10],
      [8, -70],
      [-6, -120],
      [10, -168],
    ],
  ] as Pt[][]) {
    out += stroke(smooth(T(pts), false), p.oliveTrunkDark, 5 * s, ' stroke-opacity=".5"');
  }
  out += path(ellipse(x - 18 * s, y - 96 * s, 10 * s, 15 * s, 10), p.oliveTrunkDark);
  out += path(ellipse(x - 16 * s, y - 94 * s, 6 * s, 10 * s, 10), p.oliveHole);
  const clumps: [number, number, number, number][] = [
    [-232, -236, 86, 50],
    [232, -232, 86, 50],
    [-128, -272, 112, 62],
    [128, -270, 112, 62],
    [0, -300, 140, 72],
    [-78, -360, 108, 58],
    [86, -362, 104, 56],
    [0, -412, 92, 46],
  ];
  clumps.forEach(([dx, dy, rx, ry], i) => {
    out += path(
      scallop(x + dx * s, y + (dy + 14) * s, 1, 15, 8 * s, i * 9, rx * s, ry * s),
      p.oliveLeafDark,
    );
  });
  clumps.forEach(([dx, dy, rx, ry], i) => {
    out += path(
      scallop(x + (dx - 4) * s, y + (dy + 2) * s, 1, 15, 7 * s, i * 13, rx * 0.9 * s, ry * 0.8 * s),
      p.oliveLeaf,
    );
  });
  clumps.forEach(([dx, dy, rx, ry], i) => {
    out += path(
      scallop(
        x + (dx - rx * 0.22) * s,
        y + (dy - ry * 0.28) * s,
        1,
        11,
        5 * s,
        i * 17,
        rx * 0.5 * s,
        ry * 0.36 * s,
      ),
      p.oliveLeafLight,
    );
  });
  const r = rng(seed);
  clumps.forEach(([dx, dy, rx, ry]) => {
    for (let i = 0; i < 10; i++) {
      const a = range(r, 0, Math.PI * 2);
      const k = Math.sqrt(range(r, 0.05, 0.85));
      const lx = x + (dx + Math.cos(a) * rx * k) * s;
      const ly = y + (dy + Math.sin(a) * ry * k * 0.8) * s;
      const up = Math.sin(a) < 0.1;
      out += path(
        leaf(lx, ly, range(r, 15, 21) * s, 3.4 * s, range(r, -40, 40) + (i % 2 ? 180 : 0)),
        up ? p.oliveSilver : p.oliveLeafDark,
        ` fill-opacity="${up ? '.85' : '.6'}"`,
      );
    }
  });
  for (const [dx, dy] of [
    [-150, -244],
    [116, -252],
    [16, -282],
    [-60, -330],
    [190, -226],
  ]) {
    for (const [ox, oy, rot] of [
      [0, 0, -25],
      [12, 4, 25],
    ]) {
      const cx = x + (dx + ox) * s;
      const cy = y + (dy + oy) * s;
      out +=
        stroke(
          `M${f(cx)} ${f(cy - 6 * s)}l${f(-ox * 0.3 * s)} ${f(-8 * s)}`,
          p.oliveLeafDark,
          2 * s,
        ) +
        path(ellipse(cx, cy, 4.6 * s, 7 * s, rot), p.olive) +
        path(circle(cx - 1.5 * s, cy - 2.5 * s, 1.4 * s), '#ffffff', ' fill-opacity=".6"');
    }
  }
  return out;
}

function dates(x: number, y: number, s: number, p: Palette): string {
  let out = stroke(curve(x, y, x + 6 * s, y + 34 * s, 6 * s), p.dateStem, 4 * s);
  const pts: [number, number][] = [
    [0, 26],
    [-10, 34],
    [10, 36],
    [-4, 44],
    [8, 48],
    [-14, 46],
    [2, 56],
    [14, 58],
    [-8, 60],
  ];
  pts.forEach(([dx, dy], i) => {
    out += path(ellipse(x + dx * s, y + dy * s, 6 * s, 8 * s), i % 3 ? p.date : p.dateDark);
  });
  return out;
}

function datePalm(x: number, y: number, s: number, lean: number, p: Palette): string {
  const tx = x + lean * s;
  const ty = y - 330 * s;
  return (
    path(ellipse(x, y + 4 * s, 70 * s, 12 * s), p.groundShade, ' fill-opacity=".45"') +
    palm(x, y, s, lean, p.palmTrunk, p.palmTrunkDark, p.frond, p.frondDark) +
    path(leaf(tx, ty - 2 * s, 96 * s, 20 * s, -104), p.frondDark) +
    path(leaf(tx, ty - 4 * s, 92 * s, 18 * s, -74), p.frond) +
    dates(tx - 26 * s, ty + 10 * s, s, p) +
    dates(tx + 18 * s, ty + 14 * s, s * 0.9, p)
  );
}

function well(p: Palette, mode: Mode): string {
  const [x, y] = WELL;
  const night = mode === 'night';
  const s = 1.05;
  const X = (d: number) => x + d * s;
  const Y = (d: number) => y + d * s;
  const rw = 96 * s;
  const top = Y(-112);
  const body = `M${f(x - rw)} ${f(top)}L${f(x - rw)} ${f(Y(-16))}A${f(rw)} ${f(22 * s)} 0 0 0 ${f(x + rw)} ${f(Y(-16))}L${f(x + rw)} ${f(top)}Z`;
  let stones = '';
  for (let row = 0; row < 4; row++) {
    const sy = top + (4 + row * 27) * s;
    const off = row % 2 ? 20 : 0;
    for (let i = -3; i <= 3; i++) {
      stones += path(
        roundRect(X(off + i * 44 - 20), sy, 40 * s, 23 * s, 9 * s),
        (i + row) % 3 ? p.stone : p.stoneLight,
      );
    }
  }
  const postL = X(-82);
  const postR = X(82);
  const barY = top - 168 * s;
  const T = (dx: number, dy: number): Pt => [x + dx * s, barY + dy * s];
  return (
    `<defs><clipPath id="bbWellBody"><path d="${body}"/></clipPath></defs>` +
    path(ellipse(x, y + 4, 136 * s, 18 * s), p.groundShade, ' fill-opacity=".5"') +
    path(roundRect(postL - 11 * s, barY - 6 * s, 22 * s, y - barY - 40 * s, 7 * s), p.woodDark) +
    path(roundRect(postR - 11 * s, barY - 6 * s, 22 * s, y - barY - 40 * s, 7 * s), p.woodDark) +
    path(body, p.stoneShade) +
    group(stones, '', ' clip-path="url(#bbWellBody)"') +
    path(ellipse(x, top, rw + 6 * s, 24 * s), p.stoneLight) +
    path(ellipse(x, top + 2 * s, rw - 14 * s, 15 * s), p.wellDark) +
    path(ellipse(x, top + 6 * s, rw - 26 * s, 9 * s), p.water) +
    path(ellipse(X(-20), top + 4 * s, 26 * s, 3 * s), p.seaLight, ' fill-opacity=".8"') +
    path(roundRect(postL - 18 * s, barY - 14 * s, postR - postL + 36 * s, 20 * s, 10 * s), p.wood) +
    path(circle(postR + 22 * s, barY - 4 * s, 8 * s), p.wood) +
    stroke(`M${f(postR + 22 * s)} ${f(barY - 4 * s)}l${f(18 * s)} ${f(22 * s)}`, p.wood, 7 * s) +
    stroke(`M${f(X(16))} ${f(barY + 4 * s)}L${f(X(16))} ${f(top - 74 * s)}`, p.rope, 4 * s) +
    path(
      `M${f(X(-4))} ${f(top - 76 * s)}L${f(X(36))} ${f(top - 76 * s)}L${f(X(31))} ${f(top - 40 * s)}L${f(X(1))} ${f(top - 40 * s)}Z`,
      p.wood,
    ) +
    stroke(curve(X(-4), top - 76 * s, X(36), top - 76 * s, -14 * s), p.iron, 3 * s) +
    stroke(`M${f(X(1))} ${f(top - 58 * s)}L${f(X(33))} ${f(top - 58 * s)}`, p.woodDark, 3 * s) +
    path(poly([T(-112, 2), T(0, -64), T(112, 2)]), p.woodDark) +
    stroke(`M${f(x)} ${f(barY - 60 * s)}L${f(x)} ${f(barY - 10 * s)}`, p.wood, 8 * s) +
    path(poly([T(-138, -2), T(0, -92), T(138, -2), T(120, 12), T(0, -70), T(-120, 12)]), p.tile) +
    (night
      ? stroke(
          curve(X(-40), top + 6 * s, X(10), top + 6 * s, -2 * s),
          p.glint,
          4 * s,
          ' stroke-opacity=".6"',
        )
      : '')
  );
}

function reeds(x: number, y: number, s: number, p: Palette): string {
  let out = '';
  [-114, -101, -90, -79, -66].forEach((a, i) => {
    out += path(
      leaf(x + (i - 2) * 6 * s, y + 2, (58 + (i % 2) * 30) * s, 6 * s, a),
      i % 2 ? p.grassDark : p.grass,
    );
  });
  out += stroke(
    `M${f(x - 4 * s)} ${f(y)}Q${f(x - 8 * s)} ${f(y - 60 * s)} ${f(x - 14 * s)} ${f(y - 104 * s)}`,
    p.grassDark,
    3.5 * s,
  );
  out += path(capsule(x - 14 * s, y - 100 * s, x - 16 * s, y - 128 * s, 7 * s), p.cattail);
  out += stroke(
    `M${f(x + 6 * s)} ${f(y)}Q${f(x + 10 * s)} ${f(y - 50 * s)} ${f(x + 18 * s)} ${f(y - 86 * s)}`,
    p.grassDark,
    3.5 * s,
  );
  out += path(capsule(x + 18 * s, y - 82 * s, x + 20 * s, y - 106 * s, 6.5 * s), p.cattail);
  return out;
}

function lily(x: number, y: number, s: number, p: Palette): string {
  const bx = x + 2 * s;
  const by = y - 58 * s;
  const P = (dx: number, dy: number) => `${f(bx + dx * s)} ${f(by + dy * s)}`;
  const trumpet = `M${P(-3, 0)}C${P(-4, -12)} ${P(-10, -20)} ${P(-22, -28)}Q${P(-30, -32)} ${P(-35, -27)}Q${P(-26, -38)} ${P(-12, -38)}Q${P(-6, -50)} ${P(0, -56)}Q${P(6, -50)} ${P(12, -38)}Q${P(26, -38)} ${P(35, -27)}Q${P(30, -32)} ${P(22, -28)}C${P(10, -20)} ${P(4, -12)} ${P(3, 0)}Z`;
  const throat = `M${P(-2, -4)}Q${P(-9, -24)} ${P(-5, -34)}Q${P(0, -40)} ${P(5, -34)}Q${P(9, -24)} ${P(2, -4)}Z`;
  return (
    stroke(curve(x, y, bx, by, 5 * s), p.stem, 4 * s) +
    path(leaf(x, y, 44 * s, 7 * s, -118), p.stem) +
    path(leaf(x + 1 * s, y - 4 * s, 38 * s, 6 * s, -62), p.leafDark) +
    path(trumpet, p.lily) +
    path(throat, p.lilyThroat) +
    stroke(
      `M${P(0, -26)}L${P(-6, -42)}M${P(0, -26)}L${P(0, -46)}M${P(0, -26)}L${P(6, -42)}`,
      p.lilyStamen,
      1.8 * s,
    ) +
    path(circle(bx - 6 * s, by - 43 * s, 2.6 * s), p.lilyCenter) +
    path(circle(bx, by - 47 * s, 2.6 * s), p.lilyCenter) +
    path(circle(bx + 6 * s, by - 43 * s, 2.6 * s), p.lilyCenter)
  );
}

function anemone(x: number, y: number, s: number, color: string, p: Palette): string {
  let out =
    stroke(curve(x, y, x - 2 * s, y - 50 * s, -5 * s), p.stem, 4 * s) +
    path(leaf(x, y - 4 * s, 30 * s, 9 * s, -150), p.leafDark) +
    path(leaf(x, y - 4 * s, 30 * s, 9 * s, -30), p.stem);
  const cx = x - 2 * s;
  const cy = y - 56 * s;
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2 - Math.PI / 2;
    out += path(ellipse(cx + Math.cos(a) * 11 * s, cy + Math.sin(a) * 11 * s, 9 * s, 9 * s), color);
  }
  return (
    out + path(circle(cx, cy, 7 * s), p.anemoneRing) + path(circle(cx, cy, 5 * s), p.anemoneCenter)
  );
}

function flowerPatch(p: Palette): string {
  const [x, y] = FLOWERS;
  return (
    path(ellipse(x, y + 4, 140, 18), p.groundShade, ' fill-opacity=".45"') +
    path(leaf(x - 110, y + 2, 60, 12, -150), p.leafDark) +
    path(leaf(x + 110, y + 2, 60, 12, -30), p.leafDark) +
    lily(x - 70, y - 6, 1.25, p) +
    anemone(x - 100, y + 4, 1.1, p.anemone, p) +
    lily(x + 10, y - 14, 1.45, p) +
    anemone(x - 30, y + 10, 1.25, p.anemoneBlue, p) +
    anemone(x + 60, y + 2, 1.2, p.anemone, p) +
    lily(x + 96, y - 2, 1.15, p) +
    anemone(x + 124, y + 10, 1, p.anemonePink, p)
  );
}

function sheepfold(p: Palette): string {
  const [x, y] = FOLD;
  const rx = 214;
  const ry = 50;
  const hgt = 52;
  const at = (deg: number): Pt => {
    const a = (deg * Math.PI) / 180;
    return [x + Math.cos(a) * rx, y + Math.sin(a) * ry];
  };
  const band = (a0: number, a1: number) => {
    const n = 28;
    const lower: Pt[] = [];
    for (let i = 0; i <= n; i++) lower.push(at(a0 + ((a1 - a0) * i) / n));
    const upper = lower.map(([px, py]): Pt => [px, py - hgt]).reverse();
    return path(smooth([...lower, ...upper], true, 0.3), p.stoneShade);
  };
  const wall = (a0: number, a1: number, seed: number) => {
    const r = rng(seed);
    let out = band(a0, a1);
    const n = Math.round(Math.abs(a1 - a0) / 8.5);
    for (let row = 0; row < 2; row++) {
      for (let i = 0; i < n; i++) {
        const deg = a0 + ((a1 - a0) * (i + (row % 2 ? 0.75 : 0.25))) / n;
        const [px, py] = at(deg);
        const w = range(r, 26, 34);
        const hh = range(r, 16, 19);
        out += path(
          roundRect(px - w / 2, py - 12 - row * 21 - hh / 2, w, hh, 7),
          (i + row) % 3 ? p.stone : p.stoneLight,
        );
      }
    }
    const caps = Math.round(Math.abs(a1 - a0) / 11);
    for (let i = 0; i <= caps; i++) {
      const [px, py] = at(a0 + ((a1 - a0) * i) / caps);
      out += path(ellipse(px, py - hgt + 2, range(r, 18, 22), 8), p.stoneLight);
    }
    return out;
  };
  return (
    wall(180, 360, 3) +
    path(ellipse(x, y - 4, rx - 8, ry - 8), p.foldGrass) +
    path(ellipse(x - 30, y - 10, rx * 0.5, ry * 0.4), p.foldGrassLight, ' fill-opacity=".7"') +
    wall(0, 108, 7) +
    wall(142, 180, 9)
  );
}

function bethlehemStar(x: number, y: number, p: Palette): string {
  const ray = (len: number, wd: number, a: number) => path(leaf(x, y, len, wd, a), p.starRay);
  return (
    `<defs>${radialGlow('bbStarHalo', p.starGlow, 0.4)}${radialGlow('bbStarCore', p.starGlow, 0.8)}${linearGradient(
      'bbBeam',
      [
        [0, p.starGlow, 0.28],
        [1, p.starGlow, 0],
      ],
    )}</defs>` +
    path(
      poly([
        [x - 26, y + 40],
        [x + 26, y + 40],
        [x + 210, y + 520],
        [x - 210, y + 520],
      ]),
      'url(#bbBeam)',
    ) +
    glowAt(x, y, 300, 'bbStarHalo') +
    glowAt(x, y, 120, 'bbStarCore') +
    ray(250, 9, 90) +
    ray(170, 8, -90) +
    ray(190, 8, 180) +
    ray(190, 8, 0) +
    ray(92, 5, 45) +
    ray(92, 5, 135) +
    ray(92, 5, -45) +
    ray(92, 5, -135) +
    path(spiky(x, y, 54, 16, 4, -90, 0.3), p.starCore) +
    path(circle(x, y, 13), '#ffffff')
  );
}

type Layer = [number, string];
type Zone = [number, number, number, number];

const LANE: Pt[] = [
  [2030, 2080],
  [1930, 1880],
  [2040, 1680],
  [1910, 1500],
  [1850, 1340],
];

const TOWN_LANE: Pt[] = [
  [1640, 1338],
  [1500, 1266],
  [1400, 1150],
  [1330, 1034],
  [BETH + 62, 944],
];

function lanes(p: Palette): string {
  const stones = spline(LANE, 16)
    .slice(1, -1)
    .map(([x, y], i) => {
      const k = (2080 - y) / 740;
      const w = 1 - k * 0.6;
      return path(
        ellipse(x + (i % 2 ? 34 : -40) * w, y, 22 + 26 * w, 7 + 9 * w),
        p.pathStone,
        ' fill-opacity=".8"',
      );
    })
    .join('');
  return (
    path(
      tube(TOWN_LANE, (u) => 34 - 18 * u),
      p.pathEdge,
    ) +
    path(
      tube(TOWN_LANE, (u) => 26 - 14 * u),
      p.path,
    ) +
    path(
      tube(LANE, (u) => 160 - 124 * u),
      p.pathEdge,
    ) +
    path(
      tube(LANE, (u) => 148 - 118 * u),
      p.path,
    ) +
    stones
  );
}

const AVOID: Zone[] = [
  [1980, 1980, 220, 120],
  [1940, 1800, 190, 110],
  [2020, 1650, 170, 100],
  [1920, 1500, 140, 90],
  [1840, 1360, 330, 60],
  [1530, 1290, 110, 60],
  [1420, 1170, 60, 60],
  [WELL[0], WELL[1] + 10, 200, 104],
  [WELL[0], WELL[1] - 160, 160, 170],
  [FLOWERS[0], FLOWERS[1] - 10, 170, 50],
  [FOLD[0], FOLD[1] - 10, 250, 70],
  [OLIVE[0], OLIVE[1], 160, 40],
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
    if (y < groundY(x) + 24) continue;
    if (inSea(x, y, 50)) continue;
    out.push([y, svg]);
  }
  return out;
}

function meadow(p: Palette): Layer[] {
  return [
    ...scatterAround(21, 90, 0, W, 1150, 1950, (x, y, rr) =>
      grassTuft(x, y, 0.8 + rr() * 0.6, rr() < 0.5 ? p.grass : p.grassDark),
    ),
    ...scatterAround(33, 26, 0, W, 1200, 1900, (x, y, rr) =>
      anemone(
        x,
        y,
        0.55 + rr() * 0.25,
        [p.anemone, p.anemonePink, p.anemoneBlue][Math.floor(rr() * 3)],
        p,
      ),
    ),
    ...scatterAround(45, 14, 0, W, 1250, 1900, (x, y, rr) => lily(x, y, 0.55 + rr() * 0.25, p)),
    ...scatterAround(57, 12, 0, W, 1200, 1880, (x, y, rr) => {
      const s = 0.8 + rr() * 0.6;
      return (
        path(ellipse(x, y, 20 * s, 12 * s), p.stoneShade) +
        path(ellipse(x - 2 * s, y - 3 * s, 18 * s, 10 * s), p.stone) +
        path(ellipse(x + 30 * s, y + 5 * s, 12 * s, 7 * s), p.stoneShade) +
        path(ellipse(x + 29 * s, y + 3 * s, 11 * s, 6 * s), p.stone)
      );
    }),
    [1236, shrub(2240, 1240, 1.1, p.bush, p.bushDark)],
    [1458, reeds(840, 1462, 1, p)],
    [1512, reeds(590, 1516, 0.9, p)],
    [1530, reeds(60, 1548, 1.1, p)],
    [
      1452,
      path(ellipse(930, 1452, 26, 14), p.stoneShade) + path(ellipse(926, 1448, 22, 11), p.stone),
    ],
    [1210, shrub(1480, 1214, 1, p.bush, p.bushDark)],
    [1560, shrub(820, 1600, 1.3, p.bush, p.bushDark)],
    [1500, shrub(2700, 1500, 1.2, p.bush, p.bushDark)],
    [1800, shrub(3300, 1800, 1.4, p.bush, p.bushDark)],
  ];
}

function tappables(p: Palette, mode: Mode): Record<string, Layer[]> {
  return {
    village: village(p, mode),
    sea: [[950, sea(p, mode)]],
    stable: [[STABLE[1], stable(p, mode)]],
    palms: [
      [1560, datePalm(1330, 1560, 0.8, 46, p)],
      [1626, datePalm(1196, 1626, 1, -84, p)],
    ],
    well: [[WELL[1], well(p, mode)]],
    olive: [[OLIVE[1], oliveTree(OLIVE[0], OLIVE[1], 1, p, 13)]],
    flowers: [[FLOWERS[1], flowerPatch(p)]],
  };
}

const shapes = (svg: string): Bounds[] =>
  [...svg.matchAll(/ d="([^"]+)"/g)].map((m) => pathBounds(m[1]));

const touches = (a: Bounds[], b: Bounds[]): boolean =>
  a.some((r) =>
    b.some((q) => r.minX < q.maxX && q.minX < r.maxX && r.minY < q.maxY && q.minY < r.maxY),
  );

const wet = (a: Bounds[]): boolean =>
  a.some((q) =>
    [0.1, 0.5, 0.9].some((u) =>
      [0.1, 0.5, 0.9].some((v) =>
        inSea(q.minX + (q.maxX - q.minX) * u, q.minY + (q.maxY - q.minY) * v),
      ),
    ),
  );

type Split = { props: Record<string, Layer[]>; loose: Layer[] };

let lastSplit: { p: Palette; mode: Mode; split: Split } | undefined;

function bibleLayers(p: Palette, mode: Mode): Split {
  if (lastSplit?.p !== p || lastSplit.mode !== mode) {
    lastSplit = { p, mode, split: splitLayers(p, mode) };
  }
  return lastSplit.split;
}

function splitLayers(p: Palette, mode: Mode): Split {
  const props = tappables(p, mode);
  const outlines = Object.entries(props)
    .reverse()
    .map(([id, layers]) => ({ id, parts: layers.map(([k, svg]) => [k, shapes(svg)] as const) }));
  const loose: Layer[] = [];
  for (const item of meadow(p)) {
    const s = shapes(item[1]);
    const owner = outlines.find(({ id, parts }) =>
      parts.some(([k, b]) => k < item[0] && (id === 'sea' ? wet(s) : touches(s, b))),
    );
    if (owner) props[owner.id].push(item);
    else loose.push(item);
  }
  return { props, loose };
}

const drawProp =
  (id: string) =>
  (p: Palette, mode: Mode): string =>
    layered(bibleLayers(p, mode).props[id]);

function sunWithSpinningRays(p: Palette): string {
  const svg = sun(SUN[0], SUN[1], 110, p.sun, p.sunRay, p.face);
  const rays = (svg.match(/<path[^>]*\/>/g) ?? []).slice(0, 12).join('');
  return svg.replace(
    rays,
    `<g data-spin="" style="transform-origin: ${SUN[0]}px ${SUN[1]}px">${rays}</g>`,
  );
}

const day: Palette = {
  skyTop: '#7ec8f0',
  skyMid: '#bfe5f5',
  skyBottom: '#fff0d0',
  haze: '#ffe6b0',
  sun: '#ffd34d',
  sunRay: '#ffbf38',
  face: '#8a4b1f',
  star: '#fff6d6',
  starGlow: '#fff2b8',
  starRay: '#fff4c8',
  starCore: '#fffbe6',
  cloud: '#ffffff',
  cloudShade: '#f3e4d6',
  mount: '#e8c6b2',
  mountShade: '#d6aa96',
  mountLight: '#f6e0d2',
  peakFar: '#efd8c8',
  far: '#d3e0b2',
  farTree: '#b8cc94',
  farTrunk: '#b9a68a',
  mid: '#d5d88e',
  midShade: '#bfc678',
  midLight: '#e2e2a0',
  midGold: '#ead78e',
  ground: '#b7d470',
  groundLight: '#c9df88',
  groundGold: '#e0d68e',
  groundShade: '#93b25a',
  grass: '#8dbd52',
  grassDark: '#74a643',
  bush: '#9cbf63',
  bushDark: '#7ea54d',
  cypress: '#6f9e52',
  cypressDark: '#567f40',
  sand: '#f6e2b0',
  sandDark: '#e5c98e',
  sea: '#5cc2e8',
  seaFar: '#9adcf2',
  seaNear: '#3fa8dc',
  seaLight: '#d4f4fc',
  seaShine: '#ffffff',
  foam: '#ffffff',
  glint: '#fff1c0',
  path: '#f2dcab',
  pathEdge: '#dec08a',
  pathStone: '#e6cd98',
  houseA: '#f8eedc',
  houseB: '#f2dcb8',
  houseC: '#fbf6ec',
  houseASide: '#e2cfb0',
  houseBSide: '#dcbf96',
  houseCSide: '#e6dccb',
  roofTop: '#efe0c4',
  roofLip: '#e6d2ae',
  domeColor: '#f9f3ea',
  domeLight: '#ffffff',
  window: '#8d6a52',
  windowCore: '#fff6c8',
  windowGlow: '#ffcf5a',
  door: '#a8754f',
  wood: '#b98250',
  woodLight: '#d39f68',
  woodDark: '#8f5c35',
  stableIn: '#9a6a42',
  stableInTop: '#6e4628',
  stableInLow: '#a87a4c',
  stableInDark: '#7a4f2e',
  stableWindow: '#5e3c26',
  skyPeek: '#bfe5f5',
  thatch: '#e8bf5f',
  thatchLight: '#f4d47e',
  thatchDark: '#c99a3e',
  straw: '#f5d36a',
  strawDark: '#ddb245',
  iron: '#5b4636',
  lanternGlass: '#ffe08a',
  lanternGlow: '#ffd36b',
  flame: '#ffb347',
  flameCore: '#fff6c8',
  stone: '#ddd2bf',
  stoneLight: '#ece4d6',
  stoneShade: '#bfb19a',
  wellDark: '#5c5248',
  water: '#5cc2e8',
  rope: '#e3c58e',
  cattail: '#8b5a3c',
  wallStone: '#ecdcb8',
  wallLight: '#f6ead0',
  wallShade: '#d4bd92',
  gate: '#8d6a52',
  tile: '#d9825a',
  oliveTrunk: '#9c8467',
  oliveTrunkDark: '#7a6450',
  oliveHole: '#5a4636',
  oliveLeaf: '#a7bc7a',
  oliveLeafDark: '#879f5e',
  oliveLeafLight: '#bfcf96',
  oliveSilver: '#e2e9cf',
  olive: '#6e5f86',
  palmTrunk: '#b88a5a',
  palmTrunkDark: '#946a40',
  frond: '#72b35a',
  frondDark: '#549646',
  date: '#d9822f',
  dateDark: '#b05e22',
  dateStem: '#c99a4a',
  foldGrass: '#a5c763',
  foldGrassLight: '#b8d475',
  stem: '#6fa64a',
  leafDark: '#5a8f3c',
  lily: '#ffffff',
  lilyThroat: '#eef4cf',
  lilyStamen: '#c9b04a',
  lilyCenter: '#ffc93c',
  anemone: '#ef4b4b',
  anemonePink: '#f27aa8',
  anemoneBlue: '#8a7be0',
  anemoneRing: '#ffffff',
  anemoneCenter: '#3b2b4a',
};

const night: Palette = {
  skyTop: '#081238',
  skyMid: '#14246a',
  skyBottom: '#2f4796',
  haze: '#7d95e6',
  sun: '#fff1c0',
  sunRay: '#ffe9a8',
  face: '#7a5a34',
  star: '#fff6d6',
  starGlow: '#fff2b8',
  starRay: '#fff4c8',
  starCore: '#fffbe6',
  window: '#ffd761',
  windowCore: '#fff6c4',
  windowGlow: '#ffc94a',
  stableIn: '#8c5c34',
  stableInTop: '#5a3a26',
  stableInLow: '#a06e3e',
  stableInDark: '#74482a',
  stableWindow: '#ffd761',
  skyPeek: '#1c2c6c',
  cloud: '#4b5b9e',
  cloudShade: '#3b4987',
  lanternGlass: '#fff0a8',
  lanternGlow: '#ffcf5a',
  flame: '#ffd34d',
  flameCore: '#fffbe0',
  straw: '#d7b061',
  strawDark: '#b58e45',
  glint: '#dce6ff',
  sea: '#2a4c94',
  seaFar: '#3b5fa8',
  seaNear: '#213f84',
  seaLight: '#7f9fe0',
  water: '#2a4c94',
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
    id: 'village',
    box: [888, 560, 650, 446],
    kind: 'wiggle',
    effect: 'stars',
    sound: 'creak',
    night: { kind: 'glow', effect: 'sparkle', sound: 'sparkle' },
    render: drawProp('village'),
  },
  {
    id: 'sea',
    box: [-100, 920, 1420, 650],
    kind: 'pulse',
    origin: [560, 1010],
    effect: 'splash',
    effectAt: [760, 1250],
    sound: 'splash',
    render: drawProp('sea'),
  },
  {
    id: 'stable',
    box: [1400, 690, 880, 750],
    kind: 'glow',
    effect: 'sparkle',
    effectAt: [STABLE[0], STABLE[1] - 270],
    sound: 'chime',
    render: drawProp('stable'),
  },
  {
    id: 'palms',
    box: [950, 1126, 562, 548],
    kind: 'shake',
    origin: [1263, 1600],
    effect: 'fruit',
    sound: 'rustle',
    render: drawProp('palms'),
  },
  {
    id: 'well',
    box: [WELL[0] - 180, WELL[1] - 416, 380, 460],
    kind: 'pulse',
    origin: [WELL[0], WELL[1]],
    effect: 'splash',
    effectAt: [WELL[0], WELL[1] - 118],
    sound: 'splash',
    render: drawProp('well'),
  },
  {
    id: 'olive',
    box: [OLIVE[0] - 344, OLIVE[1] - 470, 674, 540],
    kind: 'shake',
    origin: OLIVE,
    effect: 'leaves',
    sound: 'rustle',
    render: drawProp('olive'),
  },
  {
    id: 'flowers',
    box: [FLOWERS[0] - 180, FLOWERS[1] - 200, 360, 240],
    kind: 'bounce',
    origin: [FLOWERS[0], FLOWERS[1] + 6],
    effect: 'petals',
    sound: 'pop',
    render: drawProp('flowers'),
  },
];

const bible: SceneDef = {
  id: 'bible',
  world: [W, H],
  horizon: 700,
  ambient: { clouds: 4, birds: 3, stars: 60, fireflies: 16, sparkles: 8 },
  defaults: [
    { animal: 'baby-jesus', x: 1830, y: 1255 },
    { animal: 'mary', x: 1650, y: 1218 },
    { animal: 'joseph', x: 2010, y: 1212, flip: true },
    { animal: 'star-of-bethlehem', x: STAR[0], y: STAR[1] },
    { animal: 'angel', x: 2170, y: 620, flip: true },
    { animal: 'wise-man', x: 2330, y: 1302, flip: true },
    { animal: 'camel', x: 2610, y: 1252, flip: true },
    { animal: 'shepherd', x: 2960, y: 1150 },
    { animal: 'sheep', x: 3210, y: 1180, flip: true },
    { animal: 'lamb', x: 3390, y: 1222 },
    { animal: 'noahs-ark', x: 580, y: 1200 },
    { animal: 'rainbow', x: 580, y: 760 },
    { animal: 'dove', x: 900, y: 1010, flip: true },
    { animal: 'david', x: 2560, y: 1700 },
    { animal: 'goliath', x: 3060, y: 1610, flip: true },
    { animal: 'jesus', x: 1680, y: 1700 },
  ],
  day,
  night,
  interactives,
  back: (p, mode) => {
    const nightMode = mode === 'night';
    let out =
      `<defs>${linearGradient('bbSky', [
        [0, p.skyTop],
        [0.24, p.skyMid],
        [0.47, p.skyBottom],
      ])}${radialGlow('bbHaze', p.haze, nightMode ? 0.3 : 0.7)}</defs>` +
      `<rect width="${W}" height="${H}" fill="url(#bbSky)"/>` +
      `<ellipse cx="2600" cy="900" rx="1900" ry="420" fill="url(#bbHaze)"/>`;
    if (nightMode) {
      out += starField(31, 170, 30, 24, W - 30, 880, p.star);
      out += bethlehemStar(STAR[0], STAR[1], p);
    }
    out += farPeak(2000, 975, 640, 230, p.peakFar);
    out += farPeak(3180, 975, 760, 280, p.peakFar);
    out += farPeak(520, 965, 900, 120, p.peakFar);
    out += sinai(p);
    out += softCloud(2400, 700, 1, 1.7, p.cloud, p.cloudShade);
    out += softCloud(2860, 640, 0.75, 1.6, p.cloud, p.cloudShade);
    out += path(landD(farY), p.far);
    out += [140, 380, 820, 2240, 2960, 3420]
      .map((x, i) => farTree(x, farY(x) + 6, 0.9 + (i % 2) * 0.2, p.farTree, p.farTrunk))
      .join('');
    out += path(landD(midY), p.mid);
    out += fieldPatches(p);
    out += terraces(p);
    out += [840, 920, 1700, 1760, 2100, 2580, 2650]
      .map((x, i) => shrub(x, midY(x) + 30 + (i % 3) * 14, 0.7, p.bush, p.bushDark))
      .join('');
    out += (
      [
        [2030, 26, 0.5],
        [2190, 44, 0.42],
        [2470, 30, 0.55],
        [2840, 22, 0.46],
        [3010, 34, 0.4],
      ] as [number, number, number][]
    )
      .map(([x, dy, k]) => smallOlive(x, midY(x) + dy, k, p))
      .join('');
    out += path(landD(groundY), p.ground);
    const r = rng(77);
    for (let i = 0; i < 18; i++) {
      const x = range(r, 0, W);
      const y = range(r, 1250, 1900);
      if (inSea(x, y, 120)) continue;
      out += path(
        ellipse(x, y, range(r, 140, 300), range(r, 24, 42)),
        i % 3 ? p.groundLight : p.groundGold,
        ' fill-opacity=".65"',
      );
    }
    out += beach(p);
    out += lanes(p);
    out += sheepfold(p);
    out += layered(bibleLayers(p, mode).loose);
    return out;
  },
  front: (p) =>
    shrub(120, 2004, 2.2, p.bush, p.bushDark) +
    lily(300, 1990, 1.5, p) +
    anemone(360, 2000, 1.3, p.anemone, p) +
    grassTuft(980, 2004, 2, p.grassDark) +
    anemone(1420, 1996, 1.4, p.anemonePink, p) +
    grassTuft(1500, 2004, 1.8, p.grass) +
    grassTuft(2520, 2004, 2, p.grassDark) +
    lily(2600, 1994, 1.4, p) +
    shrub(3480, 2010, 2, p.bush, p.bushDark) +
    anemone(3300, 1998, 1.3, p.anemone, p),
};

export default bible;
