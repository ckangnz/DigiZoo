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
  scallop,
  smooth,
  translatePath,
  tube,
  type Bounds,
  type Pt,
} from '../core/paths';
import {
  barn,
  bush,
  fence,
  flower,
  grassTuft,
  group,
  haystack,
  layered,
  moon,
  path,
  pond,
  radialGlow,
  rock,
  roundTree,
  silo,
  sky,
  starField,
  stroke,
  sun,
  sunflower,
} from './props';
import { range, rng } from './rng';
import type { Mode, Palette, SceneDef } from './types';

const W = 3600;
const H = 2000;

function hillParts(seed: number, baseY: number, amp: number, bumps: number) {
  const r = rng(seed);
  const pts: Pt[] = [];
  const step = (W + 400) / bumps;
  for (let i = 0; i <= bumps; i++) {
    const x = -200 + i * step + range(r, -step * 0.2, step * 0.2);
    const y = baseY - amp * (i % 2 ? range(r, 0.55, 1) : range(r, 0, 0.35));
    pts.push([x, y]);
  }
  const top = smooth(pts, false);
  return { top, d: `${top}L${W + 200} ${H + 50}L-200 ${H + 50}Z` };
}

function patchworkHill(
  id: string,
  seed: number,
  baseY: number,
  amp: number,
  bumps: number,
  bands: number[],
  fields: string[],
  hedge: string,
): string {
  const { top, d } = hillParts(seed, baseY, amp, bumps);
  const r = rng(seed * 7 + 1);
  let defs = `<clipPath id="${id}"><path d="${d}"/></clipPath>`;
  let inner = '';
  let x = -300;
  let i = 0;
  const y0 = baseY - amp - 200;
  while (x < W + 300) {
    const w = range(r, 280, 480);
    const slant = range(r, -140, 140);
    const sid = `${id}s${i}`;
    defs += `<clipPath id="${sid}"><path d="${poly([
      [x, y0],
      [x + w, y0],
      [x + w + slant, H + 60],
      [x + slant, H + 60],
    ])}"/></clipPath>`;
    const fill = bands
      .map((off, k) =>
        path(
          translatePath(d, 0, off),
          fields[(i * 2 + k * 3 + Math.floor(r() * 2)) % fields.length],
        ),
      )
      .join('');
    inner += group(fill, '', ` clip-path="url(#${sid})"`);
    inner += stroke(`M${f(x + w)} ${f(y0)}L${f(x + w + slant)} ${f(H + 60)}`, hedge, 6);
    x += w;
    i++;
  }
  inner += bands
    .slice(1)
    .map((off) => stroke(translatePath(top, 0, off), hedge, 6))
    .join('');
  return `<defs>${defs}</defs>` + path(d, fields[0]) + group(inner, '', ` clip-path="url(#${id})"`);
}

function lollipopTree(x: number, y: number, s: number, trunk: string, leaves: string): string {
  return (
    path(roundRect(x - 6 * s, y - 50 * s, 12 * s, 52 * s, 5 * s), trunk) +
    path(circle(x, y - 70 * s, 34 * s), leaves)
  );
}

function windmill(
  x: number,
  y: number,
  s: number,
  wall: string,
  cap: string,
  blade: string,
  spar: string,
): string {
  const hubY = y - 214 * s;
  let blades = '';
  for (const a of [24, 114, 204, 294]) {
    blades += group(
      stroke(`M${f(x)} ${f(hubY)}L${f(x + 140 * s)} ${f(hubY)}`, spar, 7 * s) +
        path(roundRect(x + 30 * s, hubY - 1 * s, 106 * s, 32 * s, 5 * s), blade) +
        [58, 84, 110]
          .map((dx) =>
            stroke(
              `M${f(x + dx * s)} ${f(hubY)}L${f(x + dx * s)} ${f(hubY + 30 * s)}`,
              spar,
              3 * s,
            ),
          )
          .join('') +
        stroke(
          `M${f(x + 32 * s)} ${f(hubY + 15 * s)}L${f(x + 134 * s)} ${f(hubY + 15 * s)}`,
          spar,
          3 * s,
        ),
      `rotate(${a} ${f(x)} ${f(hubY)})`,
    );
  }
  return (
    path(
      `M${f(x - 46 * s)} ${f(y + 4)}L${f(x - 28 * s)} ${f(y - 200 * s)}L${f(x + 28 * s)} ${f(y - 200 * s)}L${f(x + 46 * s)} ${f(y + 4)}Z`,
      wall,
    ) +
    path(
      `M${f(x - 40 * s)} ${f(y - 194 * s)}Q${f(x)} ${f(y - 276 * s)} ${f(x + 40 * s)} ${f(y - 194 * s)}Z`,
      cap,
    ) +
    path(roundRect(x - 13 * s, y - 46 * s, 26 * s, 48 * s, 13 * s), spar) +
    path(circle(x, y - 120 * s, 11 * s), spar) +
    `<g data-spin="" data-idle="spin" style="transform-origin: ${f(x)}px ${f(hubY)}px">${blades}</g>` +
    path(circle(x, hubY, 13 * s), cap)
  );
}

function behindHill(id: string, hill: string, content: string): string {
  return (
    `<defs><clipPath id="${id}"><path d="M-300 -300H${W + 300}V${H + 300}H-300Z${hill}" clip-rule="evenodd"/></clipPath></defs>` +
    group(content, '', ` clip-path="url(#${id})"`)
  );
}

function ladder(x: number, y: number, h: number, color: string): string {
  let out =
    stroke(`M${f(x - 12)} ${f(y - 4)}L${f(x - 12)} ${f(y - h)}`, color, 5) +
    stroke(`M${f(x + 12)} ${f(y - 4)}L${f(x + 12)} ${f(y - h)}`, color, 5);
  for (let k = y - 30; k > y - h; k -= 28) {
    out += stroke(`M${f(x - 12)} ${f(k)}L${f(x + 12)} ${f(k)}`, color, 4);
  }
  return out;
}

function duckHouse(
  x: number,
  y: number,
  s: number,
  wall: string,
  roof: string,
  hole: string,
  wood: string,
): string {
  return (
    path(roundRect(x - 34 * s, y - 6 * s, 12 * s, 42 * s, 4 * s), wood) +
    path(roundRect(x + 22 * s, y - 6 * s, 12 * s, 42 * s, 4 * s), wood) +
    stroke(`M${f(x - 56 * s)} ${f(y - 4 * s)}L${f(x - 104 * s)} ${f(y + 30 * s)}`, wood, 12 * s) +
    path(roundRect(x - 62 * s, y - 14 * s, 124 * s, 18 * s, 6 * s), wood) +
    path(roundRect(x - 42 * s, y - 76 * s, 84 * s, 66 * s, 8 * s), wall) +
    path(
      `M${f(x - 58 * s)} ${f(y - 64 * s)}Q${f(x - 60 * s)} ${f(y - 74 * s)} ${f(x - 50 * s)} ${f(y - 80 * s)}L${f(x - 6 * s)} ${f(y - 114 * s)}Q${f(x)} ${f(y - 118 * s)} ${f(x + 6 * s)} ${f(y - 114 * s)}L${f(x + 50 * s)} ${f(y - 80 * s)}Q${f(x + 60 * s)} ${f(y - 74 * s)} ${f(x + 58 * s)} ${f(y - 64 * s)}Z`,
      roof,
    ) +
    path(ellipse(x, y - 38 * s, 16 * s, 19 * s), hole)
  );
}

function barnTrim(x: number, y: number, s: number, trim: string): string {
  const bw = 340 * s;
  const bh = 210 * s;
  const left = x - bw / 2;
  const top = y - bh;
  return (
    stroke(
      `M${f(left)} ${f(top)}L${f(left + 50 * s)} ${f(top - 80 * s)}L${f(x)} ${f(top - 132 * s)}L${f(left + bw - 50 * s)} ${f(top - 80 * s)}L${f(left + bw)} ${f(top)}`,
      trim,
      12 * s,
    ) +
    path(roundRect(left - 6 * s, top - 6 * s, bw + 12 * s, 14 * s, 6 * s), trim) +
    path(roundRect(left - 4 * s, top, 16 * s, bh, 5 * s), trim) +
    path(roundRect(left + bw - 12 * s, top, 16 * s, bh, 5 * s), trim)
  );
}

function barnGlow(x: number, y: number, s: number): string {
  const bw = 340 * s;
  const bh = 210 * s;
  const left = x - bw / 2;
  const top = y - bh;
  const spots: [number, number, number][] = [
    [x, top - 49 * s, 120 * s],
    [left + 52 * s, top + 55 * s, 100 * s],
    [left + bw - 52 * s, top + 55 * s, 100 * s],
  ];
  return (
    `<defs>${radialGlow('barnGlow', '#ffd36b', 0.55)}</defs>` +
    spots
      .map(
        ([cx, cy, rr]) =>
          `<circle cx="${f(cx)}" cy="${f(cy)}" r="${f(rr)}" fill="url(#barnGlow)"/>`,
      )
      .join('')
  );
}

function loftHay(x: number, y: number, s: number, hay: string): string {
  const top = y - 210 * s;
  return path(scallop(x, top - 34 * s, 1, 7, 5 * s, 180, 24 * s, 9 * s), hay);
}

function hayBale(x: number, y: number, s: number, color: string, dark: string): string {
  let out =
    path(roundRect(x - 80 * s, y - 104 * s, 120 * s, 106 * s, 24 * s), dark) +
    path(roundRect(x - 80 * s, y - 104 * s, 114 * s, 100 * s, 24 * s), color) +
    path(ellipse(x + 38 * s, y - 52 * s, 38 * s, 52 * s), dark) +
    path(ellipse(x + 36 * s, y - 53 * s, 34 * s, 48 * s), color);
  const spiral: Pt[] = [];
  for (let i = 0; i <= 36; i++) {
    const t = i / 36;
    const a = t * Math.PI * 5.2;
    spiral.push([x + 36 * s + Math.cos(a) * 28 * s * t, y - 53 * s + Math.sin(a) * 40 * s * t]);
  }
  out += stroke(smooth(spiral, false), dark, 4 * s);
  for (let i = -1; i <= 1; i++) {
    out += stroke(
      `M${f(x - 66 * s)} ${f(y - 52 * s + i * 30 * s)}L${f(x - 4 * s)} ${f(y - 52 * s + i * 30 * s)}`,
      dark,
      4 * s,
      ' stroke-opacity=".5"',
    );
  }
  return out;
}

function apple(x: number, y: number, s: number, color: string, stem: string): string {
  return (
    path(circle(x, y, 15 * s), color) +
    path(leaf(x + 1 * s, y - 13 * s, 14 * s, 4.5 * s, -50), stem) +
    path(ellipse(x - 5 * s, y - 5 * s, 4 * s, 3 * s, -30), '#ffffff', ' opacity=".55"')
  );
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
    out.push([y, svg]);
  }
  return out;
}

const AVOID: Zone[] = [
  [2520, 1500, 430, 130],
  [470, 1400, 330, 120],
  [810, 1700, 290, 90],
  [1270, 1230, 80, 140],
  [1280, 1420, 120, 110],
  [1220, 1600, 160, 110],
  [1320, 1790, 200, 110],
  [1400, 1980, 240, 110],
];

function reeds(x: number, y: number, s: number, color: string, dark: string, head: string): string {
  let out = '';
  [-114, -101, -90, -79, -66].forEach((a, i) => {
    out += path(
      leaf(x + (i - 2) * 6 * s, y + 2, (58 + (i % 2) * 30) * s, 6 * s, a),
      i % 2 ? dark : color,
    );
  });
  out += stroke(
    `M${f(x - 4 * s)} ${f(y)}Q${f(x - 8 * s)} ${f(y - 60 * s)} ${f(x - 14 * s)} ${f(y - 104 * s)}`,
    dark,
    3.5 * s,
  );
  out += path(capsule(x - 14 * s, y - 100 * s, x - 16 * s, y - 128 * s, 7 * s), head);
  out += stroke(
    `M${f(x + 6 * s)} ${f(y)}Q${f(x + 10 * s)} ${f(y - 50 * s)} ${f(x + 18 * s)} ${f(y - 86 * s)}`,
    dark,
    3.5 * s,
  );
  out += path(capsule(x + 18 * s, y - 82 * s, x + 20 * s, y - 106 * s, 6.5 * s), head);
  return out;
}

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

function blob(seed: number, x: number, y: number, rx: number, ry: number, jitter: number): string {
  const r = rng(seed);
  const pts: Pt[] = [];
  const n = 12;
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2;
    const k = 1 + range(r, -jitter, jitter);
    pts.push([x + Math.cos(a) * rx * k, y + Math.sin(a) * ry * k]);
  }
  return smooth(pts, true);
}

function mudPuddle(
  x: number,
  y: number,
  rx: number,
  ry: number,
  mud: string,
  dark: string,
  light: string,
): string {
  return (
    path(blob(5, x, y + 6, rx * 1.04, ry * 1.1, 0.12), dark) +
    path(blob(5, x, y, rx, ry, 0.12), mud) +
    path(blob(9, x + rx * 0.15, y + ry * 0.1, rx * 0.5, ry * 0.42, 0.18), dark, ' opacity=".45"') +
    stroke(
      curve(x - rx * 0.6, y - ry * 0.3, x - rx * 0.2, y - ry * 0.42, -ry * 0.1),
      light,
      ry * 0.14,
    ) +
    stroke(
      curve(x + rx * 0.3, y + ry * 0.38, x + rx * 0.55, y + ry * 0.3, -ry * 0.06),
      light,
      ry * 0.1,
    ) +
    path(circle(x - rx * 1.12, y - ry * 0.2, ry * 0.16), mud) +
    path(circle(x - rx * 1.25, y + ry * 0.3, ry * 0.1), mud) +
    path(circle(x + rx * 1.14, y - ry * 0.35, ry * 0.13), mud) +
    path(circle(x + rx * 1.06, y + ry * 0.55, ry * 0.18), mud)
  );
}

function carrot(x: number, y: number, s: number, root: string, top: string): string {
  return (
    path(leaf(x, y - 4 * s, 34 * s, 6 * s, -112), top) +
    path(leaf(x, y - 4 * s, 40 * s, 6 * s, -90), top) +
    path(leaf(x, y - 4 * s, 34 * s, 6 * s, -68), top) +
    path(
      `M${f(x - 12 * s)} ${f(y - 4 * s)}Q${f(x)} ${f(y - 12 * s)} ${f(x + 12 * s)} ${f(y - 4 * s)}L${f(x)} ${f(y + 10 * s)}Z`,
      root,
    )
  );
}

function cabbage(x: number, y: number, s: number, color: string, dark: string): string {
  return (
    path(scallop(x, y - 22 * s, 1, 9, 6 * s, 0, 34 * s, 26 * s), dark) +
    path(circle(x, y - 26 * s, 20 * s), color) +
    stroke(
      curve(x - 8 * s, y - 20 * s, x + 4 * s, y - 40 * s, 4 * s),
      dark,
      3 * s,
      ' stroke-opacity=".6"',
    )
  );
}

function pumpkin(
  x: number,
  y: number,
  s: number,
  color: string,
  dark: string,
  stem: string,
): string {
  return (
    path(ellipse(x - 14 * s, y - 24 * s, 22 * s, 24 * s), dark) +
    path(ellipse(x + 14 * s, y - 24 * s, 22 * s, 24 * s), dark) +
    path(ellipse(x, y - 25 * s, 22 * s, 25 * s), color) +
    path(roundRect(x - 4 * s, y - 58 * s, 8 * s, 14 * s, 3 * s), stem) +
    path(leaf(x + 2 * s, y - 50 * s, 22 * s, 7 * s, -20), stem)
  );
}

function veggiePatch(x: number, y: number, w: number, h: number, p: Palette): string {
  const inset = w * 0.08;
  const body = smooth(
    [
      [x - w / 2 + inset, y - h / 2],
      [x + w / 2 - inset, y - h / 2],
      [x + w / 2, y + h / 2],
      [x - w / 2, y + h / 2],
    ],
    true,
    0.25,
  );
  let out = path(
    smooth(
      [
        [x - w / 2 + inset - 10, y - h / 2 - 6],
        [x + w / 2 - inset + 10, y - h / 2 - 6],
        [x + w / 2 + 14, y + h / 2 + 12],
        [x - w / 2 - 14, y + h / 2 + 12],
      ],
      true,
      0.25,
    ),
    p.soilDark,
  );
  out += path(body, p.soil);
  const rows = 3;
  for (let k = 0; k < rows; k++) {
    const ry = y - h / 2 + (h * (k + 0.7)) / rows;
    const span = w - inset * 2 * (1 - (k + 0.7) / rows);
    out += path(
      roundRect(x - span / 2 + 10, ry - 6, span - 20, 16, 8),
      p.soilDark,
      ' opacity=".55"',
    );
    const n = 6 - (k === 2 ? 2 : 0);
    for (let i = 0; i < n; i++) {
      const vx = x - span / 2 + 40 + (i * (span - 80)) / (n - 1);
      const s = 0.9 + k * 0.12;
      if (k === 0) out += carrot(vx, ry, s, p.carrot, p.veg);
      else if (k === 1) out += cabbage(vx, ry + 6, s, p.cabbage, p.cabbageDark);
      else out += pumpkin(vx, ry + 8, s, p.pumpkin, p.pumpkinDark, p.veg);
    }
  }
  return out;
}

function daisy(
  x: number,
  y: number,
  s: number,
  petal: string,
  center: string,
  stem: string,
): string {
  return (
    path(leaf(x, y + 28 * s, 22 * s, 6 * s, -140), stem) + flower(x, y, s, petal, center, stem)
  );
}

type Layer = [number, string];

function tappables(p: Palette, mode: Mode): Record<string, Layer[]> {
  return {
    barn: [
      [
        1110,
        barn(1250, 1110, 1.35, p.barnWall, p.barnRoof, p.barnTrim, p.barnGlass) +
          barnTrim(1250, 1110, 1.35, p.barnTrim) +
          (mode === 'day' ? loftHay(1250, 1110, 1.35, p.hay) : barnGlow(1250, 1110, 1.35)),
      ],
    ],
    haystack: [
      [1140, haystack(1790, 1150, 0.85, p.hay, p.hayDark)],
      [1180, hayBale(1700, 1190, 0.75, p.hay, p.hayDark)],
    ],
    sunflowersWest: [870, 930, 990].map((x, i): Layer => [
      1160 + i * 4,
      sunflower(x, 1160 + i * 4, 1 + (i % 2) * 0.15, p.sunPetal, p.sunCenter, p.stem),
    ]),
    sunflowersEast: [1960, 2040, 2115].map((x, i): Layer => [
      1225 + i * 3,
      sunflower(x, 1225 + i * 3, 0.95 + (i % 2) * 0.2, p.sunPetal, p.sunCenter, p.stem),
    ]),
    appleTree: [
      [
        1300,
        roundTree(3170, 1300, 1.4, p.trunk, p.leaves, p.leavesDark) +
          (
            [
              [3040, 1040],
              [3110, 960],
              [3200, 1010],
              [3290, 950],
              [3330, 1060],
              [3160, 1120],
              [3060, 1150],
              [3250, 1140],
              [3010, 1240, 1],
              [3280, 1250, 1],
            ] as [number, number, number?][]
          )
            .map(([ax, ay, ground]) => apple(ax, ay + (ground ? 60 : 0), 1, p.apple, p.stem))
            .join(''),
      ],
    ],
    pond: [
      [
        1490,
        pond(2520, 1490, 380, 100, p.water, p.waterLight, p.waterRim) +
          (mode === 'night'
            ? stroke(curve(2400, 1476, 2560, 1476, -4), p.sun, 10, ' stroke-opacity=".5"') +
              stroke(curve(2440, 1500, 2530, 1500, -3), p.sun, 8, ' stroke-opacity=".35"')
            : '') +
          lilyPad(2290, 1512, 42, 16, p.lily, -30) +
          lilyPad(2350, 1536, 28, 10, p.lilyDark, 200) +
          lilyPad(2620, 1548, 34, 12, p.lily, 160) +
          flower(2294, 1504, 0.8, p.pink, p.center) +
          duckHouse(2780, 1486, 0.95, p.duckHouse, p.duckRoof, p.hole, p.fencePost),
      ],
      [1540, reeds(2900, 1540, 1, p.reed, p.reedDark, p.cattail)],
      [1590, rock(2420, 1596, 0.5, p.rock, p.rockShade, p.rockLight)],
      [1594, rock(2490, 1594, 0.32, p.rock, p.rockShade, p.rockLight)],
    ],
    mud: [[1700, mudPuddle(810, 1700, 240, 62, p.mud, p.mudDark, p.mudLight)]],
  };
}

function meadow(p: Palette): Layer[] {
  return [
    ...scatterAround(21, 70, 0, W, 1160, 1950, AVOID, (x, y, rr) =>
      grassTuft(x, y, 0.8 + rr() * 0.6, rr() < 0.5 ? p.grassDark : p.stem),
    ),
    ...scatterAround(33, 30, 0, W, 1240, 1900, AVOID, (x, y, rr) => {
      const c = [p.white, p.pink, p.purple, p.yellow][Math.floor(rr() * 4)];
      return daisy(x, y, 1 + rr() * 0.4, c, c === p.yellow ? p.white : p.center, p.stem);
    }),
  ];
}

const shapes = (svg: string): Bounds[] =>
  [...svg.matchAll(/ d="([^"]+)"/g)].map((m) => pathBounds(m[1]));

const touches = (a: Bounds[], b: Bounds[]): boolean =>
  a.some((r) =>
    b.some((q) => r.minX < q.maxX && q.minX < r.maxX && r.minY < q.maxY && q.minY < r.maxY),
  );

type Split = { props: Record<string, Layer[]>; loose: Layer[] };

let lastSplit: { p: Palette; mode: Mode; split: Split } | undefined;

function farmLayers(p: Palette, mode: Mode): Split {
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
    const owner = outlines.find(({ parts }) =>
      parts.some(([k, b]) => k < item[0] && touches(s, b)),
    );
    if (owner) props[owner.id].push(item);
    else loose.push(item);
  }
  return { props, loose };
}

const drawProp =
  (id: string) =>
  (p: Palette, mode: Mode): string =>
    layered(farmLayers(p, mode).props[id]);

const farm: SceneDef = {
  id: 'farm',
  world: [W, H],
  horizon: 860,
  ambient: { clouds: 6, birds: 3, stars: 50, fireflies: 18 },
  defaults: [
    { animal: 'sheep', x: 470, y: 1215 },
    { animal: 'chicken', x: 1500, y: 1215 },
    { animal: 'goat', x: 2300, y: 1225 },
    { animal: 'horse', x: 2720, y: 1185, flip: true },
    { animal: 'duck', x: 2440, y: 1440 },
    { animal: 'cow', x: 3170, y: 1560, flip: true },
    { animal: 'pig', x: 810, y: 1650 },
    { animal: 'cat', x: 1980, y: 1660, flip: true },
    { animal: 'dog', x: 1340, y: 1745 },
    { animal: 'rabbit', x: 1700, y: 1530 },
    { animal: 'donkey', x: 3360, y: 1180, flip: true },
    { animal: 'goose', x: 2880, y: 1420, flip: true },
  ],
  day: {
    skyTop: '#6cc3f2',
    skyBottom: '#dcf3ff',
    sun: '#ffd34d',
    sunRay: '#ffc531',
    face: '#8a4b1f',
    fieldA: '#d5ecb4',
    fieldB: '#c4e4a6',
    fieldC: '#e8e6b2',
    fieldD: '#b9dea0',
    hedge: '#a9d48f',
    treeFar: '#a6d18c',
    trunkFar: '#b9ab94',
    fieldE: '#b5df8c',
    fieldF: '#a2d47e',
    fieldG: '#e9dc86',
    fieldH: '#c6e59a',
    fieldI: '#dcc690',
    hedge2: '#82bd60',
    ground: '#9bd468',
    groundLight: '#b4e080',
    grassDark: '#7fbc52',
    mill: '#f8f0e3',
    millRoof: '#dc604b',
    millBlade: '#fffaf1',
    millSpar: '#b98f65',
    duckHouse: '#ffe08a',
    duckRoof: '#4fa3d9',
    hole: '#6b4a35',
    barnWall: '#e2513d',
    barnRoof: '#8b4c42',
    barnTrim: '#fff8ee',
    barnGlass: '#8d3a2f',
    hay: '#f3cb52',
    hayDark: '#d9a832',
    siloWall: '#f2ebdf',
    siloRoof: '#c3ccd6',
    siloBand: '#ddd2c0',
    fencePost: '#c48c5a',
    fenceRail: '#dca871',
    trunk: '#8b5a3c',
    leaves: '#7cc24f',
    leavesDark: '#5fa83f',
    apple: '#ec4a3c',
    sunPetal: '#ffc928',
    sunCenter: '#7a4a26',
    stem: '#5f9e3c',
    water: '#5cc0e8',
    waterLight: '#b8ecfc',
    waterRim: '#cbb27c',
    reed: '#86c25a',
    reedDark: '#5f9e3c',
    cattail: '#8b5a3c',
    lily: '#6dbb55',
    lilyDark: '#57a645',
    mud: '#9b6b45',
    mudDark: '#7e5336',
    mudLight: '#bb8a5e',
    soil: '#a8754f',
    soilDark: '#8a5c3c',
    carrot: '#ff8a3d',
    veg: '#5fae45',
    cabbage: '#b3df86',
    cabbageDark: '#80c25d',
    pumpkin: '#ff9a2e',
    pumpkinDark: '#e47b1b',
    dirt: '#ecd8a4',
    dirtEdge: '#d9c08a',
    rock: '#cdc7bc',
    rockShade: '#ada599',
    rockLight: '#ece8e0',
    bush: '#7cc24f',
    bushDark: '#5fa83f',
    bushDot: '#ff9ec4',
    white: '#ffffff',
    pink: '#ff9ec4',
    purple: '#c49bff',
    yellow: '#ffd84d',
    center: '#ffbf3c',
  },
  night: {
    skyTop: '#0b1438',
    skyBottom: '#36427e',
    sun: '#fff1c0',
    sunRay: '#ffe9a8',
    face: '#7a5a34',
    barnGlass: '#ffd36b',
    barnTrim: '#9a9cc0',
    siloWall: '#7d81a8',
    siloBand: '#6c6f96',
    siloRoof: '#8a90b4',
    mill: '#7f85aa',
    millBlade: '#8c92b5',
    white: '#c9cdf0',
    duckRoof: '#3f5c9c',
    water: '#29498c',
    waterLight: '#8fb2ee',
  },
  back: (p, mode) => {
    let out = sky(W, H, p.skyTop, p.skyBottom);
    if (mode === 'night') out += starField(29, 80, 40, 40, W - 40, 800, '#fff6d6');
    out += patchworkHill(
      'far1',
      3,
      870,
      120,
      5,
      [0, 40, 88],
      [p.fieldA, p.fieldB, p.fieldC, p.fieldD],
      p.hedge,
    );
    out += [420, 600, 1900, 2050, 3300]
      .map((x, i) => lollipopTree(x, 868 + (i % 2) * 14, 0.7, p.trunkFar, p.treeFar))
      .join('');
    out += patchworkHill(
      'far2',
      11,
      1000,
      120,
      5,
      [0, 54, 118],
      [p.fieldE, p.fieldF, p.fieldG, p.fieldH, p.fieldI],
      p.hedge2,
    );
    out += [160, 330, 2760, 2900, 3480]
      .map((x, i) => roundTree(x, 1000 + (i % 2) * 14, 0.42, p.trunk, p.leaves, p.leavesDark))
      .join('');
    out += path(
      `${smooth(
        [
          [-200, 1210],
          [300, 1150],
          [900, 1105],
          [1350, 1090],
          [1900, 1120],
          [2500, 1170],
          [3100, 1150],
          [3800, 1170],
        ],
        false,
      )}L${W + 200} ${H + 50}L-200 ${H + 50}Z`,
      p.ground,
    );
    const r = rng(77);
    for (let i = 0; i < 16; i++) {
      out += path(
        ellipse(range(r, 0, W), range(r, 1260, 1900), range(r, 140, 300), range(r, 26, 44)),
        p.groundLight,
        ' opacity=".7"',
      );
    }
    const lane: Pt[] = [
      [1250, 1100],
      [1300, 1300],
      [1180, 1520],
      [1330, 1780],
      [1420, 2060],
    ];
    out += path(
      tube(lane, (u) => 46 + 190 * u),
      p.dirtEdge,
    );
    out += path(
      tube(lane, (u) => 36 + 176 * u),
      p.dirt,
    );
    out += layered([
      [
        1072,
        silo(1585, 1092, 1.3, p.siloWall, p.siloRoof, p.siloBand) +
          ladder(1630, 1092, 330, p.siloBand),
      ],
      [1150, fence(-40, 760, 1170, p.fencePost, p.fenceRail)],
      [1185, fence(1960, 3640, 1205, p.fencePost, p.fenceRail)],
      [1140, bush(820, 1140, 0.5, p.bush, p.bushDark, p.bushDot)],
      [1400, veggiePatch(470, 1400, 560, 170, p)],
      [1462, reeds(2170, 1478, 1.1, p.reed, p.reedDark, p.cattail)],
      ...farmLayers(p, mode).loose,
    ]);
    return out;
  },
  front: (p) =>
    bush(140, 2010, 1.7, p.bush, p.bushDark, p.bushDot) +
    daisy(420, 1960, 1.6, p.white, p.center, p.stem) +
    daisy(480, 1975, 1.3, p.pink, p.center, p.stem) +
    grassTuft(1000, 2004, 2, p.grassDark) +
    pumpkin(1820, 2004, 2.2, p.pumpkin, p.pumpkinDark, p.veg) +
    grassTuft(1900, 2004, 1.8, p.stem) +
    bush(2600, 2030, 1.4, p.bush, p.bushDark) +
    daisy(3000, 1970, 1.5, p.yellow, p.white, p.stem) +
    bush(3480, 2010, 1.8, p.bush, p.bushDark, p.bushDot),
  interactives: [
    {
      id: 'sun',
      box: [370, 20, 540, 540],
      kind: 'spin',
      origin: [640, 290],
      effect: 'sparkle',
      sound: 'shine',
      night: { kind: 'rock', effect: 'stars', sound: 'twinkle' },
      render: (p, mode) =>
        mode === 'day'
          ? sun(640, 290, 104, p.sun, p.sunRay, p.face)
          : moon(640, 290, 96, p.sun, p.sunRay, p.face),
    },
    {
      id: 'windmill',
      box: [2403, 600, 314, 372],
      kind: 'pulse',
      origin: [2560, 950],
      effect: 'sparkle',
      effectAt: [2560, 757],
      sound: 'whirr',
      render: (p) =>
        behindHill(
          'millHill',
          hillParts(11, 1000, 120, 5).d,
          windmill(2560, 960, 0.95, p.mill, p.millRoof, p.millBlade, p.millSpar),
        ),
    },
    {
      id: 'barn',
      box: [936, 579, 628, 558],
      kind: 'wiggle',
      origin: [1250, 1110],
      effect: 'stars',
      effectAt: [1250, 760],
      sound: 'creak',
      render: drawProp('barn'),
    },
    {
      id: 'haystack',
      box: [1619, 1041, 285, 180],
      kind: 'bounce',
      effect: 'smoke',
      sound: 'thump',
      render: drawProp('haystack'),
    },
    {
      id: 'sunflowersWest',
      box: [804, 897, 252, 296],
      kind: 'bounce',
      effect: 'petals',
      sound: 'pop',
      render: drawProp('sunflowersWest'),
    },
    {
      id: 'sunflowersEast',
      box: [1896, 961, 283, 312],
      kind: 'bounce',
      effect: 'petals',
      sound: 'pop',
      render: drawProp('sunflowersEast'),
    },
    {
      id: 'appleTree',
      box: [2951, 816, 427, 539],
      kind: 'shake',
      effect: 'fruit',
      sound: 'rustle',
      render: drawProp('appleTree'),
    },
    {
      id: 'pond',
      box: [2097, 1355, 859, 307],
      kind: 'pulse',
      origin: [2520, 1490],
      effect: 'splash',
      effectAt: [2520, 1480],
      sound: 'splash',
      render: drawProp('pond'),
    },
    {
      id: 'mud',
      box: [483, 1619, 629, 178],
      kind: 'pulse',
      origin: [810, 1700],
      effect: 'splash',
      effectAt: [810, 1690],
      sound: 'splash',
      render: drawProp('mud'),
    },
  ],
};

export default farm;
