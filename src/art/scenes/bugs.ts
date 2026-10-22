import {
  capsule,
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
  spiky,
  spline,
  tube,
  type Bounds,
  type Pt,
} from '../core/paths';
import {
  cloud,
  grassTuft,
  layered,
  linearGradient,
  moon,
  path,
  radialGlow,
  starField,
  stroke,
  sun,
  tallGrass,
} from './props';
import { range, rng } from './rng';
import type { Interactive, Mode, Palette, SceneDef } from './types';

const W = 3600;
const H = 2000;

type Layer = [number, string];
type Shape = [Bounds, Pt[]];
type Zone = [number, number, number, number];

const SUN: Pt = [2930, 250];
const SUNFLOWER: Pt = [420, 1750];
const SUN_HEAD: Pt = [575, 455];
const DANDELION: Pt = [1450, 1600];
const CLOCK: Pt = [1380, 560];
const WEB_L: Pt = [1950, 1560];
const WEB_R: Pt = [2470, 1540];
const HUB: Pt = [2190, 610];
const DAISY: Pt = [3330, 1650];
const DAISY_HEAD: Pt = [3140, 820];
const MUSH: Pt = [910, 1640];
const ANTHILL: Pt = [1640, 1680];
const PUDDLE: Pt = [2230, 1830];
const LEAF_BASE: Pt = [2760, 1720];
const LEAF_TIP: Pt = [3440, 1600];
const LOG = { x0: -160, x1: 760, bottom: 1585, d: 270 };

const farGroundY = (x: number): number =>
  1300 + 14 * Math.sin(x / 260 + 0.6) + 8 * Math.sin(x / 97 + 2);
const groundY = (x: number): number => 1405 + 16 * Math.sin(x / 330 + 2.2) + 7 * Math.sin(x / 120);

const glowAt = (x: number, y: number, r: number, id: string): string =>
  `<circle cx="${f(x)}" cy="${f(y)}" r="${f(r)}" fill="url(#${id})"/>`;

const lerp = (a: Pt, b: Pt, t: number): Pt => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t];

const pick = (pts: Pt[], t: number): Pt => pts[Math.round(t * (pts.length - 1))];

function land(fn: (x: number) => number, step = 50): string {
  const pts: Pt[] = [];
  for (let x = -200; x <= W + 200; x += step) pts.push([x, fn(x)]);
  return `${smooth(pts, false)}L${W + 200} ${H + 50}L-200 ${H + 50}Z`;
}

function band(top: Pt[], bottom: Pt[]): string {
  return `${smooth(top, false)}${smooth([...bottom].reverse(), false).replace(/^M/, 'L')}Z`;
}

function ribbon(mid: Pt[], width: (t: number) => number): { left: Pt[]; right: Pt[] } {
  const n = mid.length;
  const left: Pt[] = [];
  const right: Pt[] = [];
  for (let i = 0; i < n; i++) {
    const a = mid[Math.max(0, i - 1)];
    const b = mid[Math.min(n - 1, i + 1)];
    const len = Math.hypot(b[0] - a[0], b[1] - a[1]) || 1;
    const nx = -(b[1] - a[1]) / len;
    const ny = (b[0] - a[0]) / len;
    const w = width(i / (n - 1));
    left.push([mid[i][0] + nx * w, mid[i][1] + ny * w]);
    right.push([mid[i][0] - nx * w, mid[i][1] - ny * w]);
  }
  return { left, right };
}

function bladeSpine(x: number, y: number, h: number, lean: number, curl: number): Pt[] {
  const ctrl: Pt[] = [
    [x, y],
    [x + lean * 0.1, y - h * 0.34],
    [x + lean * 0.45, y - h * 0.7],
    [x + lean, y - h],
  ];
  if (curl) ctrl.push([x + lean + curl, y - h + Math.abs(curl) * 0.75]);
  return spline(ctrl, 16);
}

function bladeFrom(mid: Pt[], w: number, color: string, shade?: string): string {
  const { left, right } = ribbon(mid, (t) => (w / 2) * Math.pow(1 - t, 0.8));
  const tip = mid[mid.length - 1];
  const back = right.slice(0, -1).reverse();
  let out = path(poly([...left.slice(0, -1), tip, ...back]), color);
  if (shade) out += path(poly([...mid, ...back]), shade);
  return out;
}

function blade(
  x: number,
  y: number,
  h: number,
  w: number,
  lean: number,
  curl: number,
  color: string,
  shade?: string,
): string {
  return bladeFrom(bladeSpine(x, y, h, lean, curl), w, color, shade);
}

const nearSun = (pts: Pt[], margin: number): boolean =>
  pts.some(([x, y]) => Math.hypot(x - SUN[0], y - SUN[1]) < margin);

function bladeField(
  seed: number,
  count: number,
  base: (x: number) => number,
  hMin: number,
  hMax: number,
  wMin: number,
  wMax: number,
  color: string,
  shade?: string,
): string {
  const r = rng(seed);
  let out = '';
  for (let i = 0; i < count; i++) {
    const x = ((i + range(r, 0.1, 0.9)) * (W + 300)) / count - 150;
    const h = range(r, hMin, hMax);
    const w = range(r, wMin, wMax);
    const lean = range(r, -0.3, 0.3) * h;
    const curl = r() < 0.35 ? range(r, -0.18, 0.18) * h : 0;
    const spine = bladeSpine(x, base(x) + 40, h, lean, curl);
    if (nearSun(spine, 230)) continue;
    out += bladeFrom(spine, w, color, shade);
  }
  return out;
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

function glint(x: number, y: number, s: number, color: string): string {
  return path(spiky(x, y, s, s * 0.2, 4, -90, 0.3), color);
}

function dew(x: number, y: number, r: number, p: Palette): string {
  return (
    path(circle(x, y + r * 0.08, r), p.dewShade, ' fill-opacity=".75"') +
    path(circle(x - r * 0.04, y - r * 0.02, r * 0.88), p.dew, ' fill-opacity=".9"') +
    path(ellipse(x - r * 0.3, y - r * 0.32, r * 0.32, r * 0.19, -35), p.dewLight) +
    path(circle(x + r * 0.34, y + r * 0.3, r * 0.11), p.dewLight, ' fill-opacity=".85"')
  );
}

function pebble(x: number, y: number, rx: number, ry: number, seed: number, p: Palette): string {
  const cy = y - ry * 0.8;
  return (
    path(blob(seed, x + rx * 0.05, cy + ry * 0.12, rx, ry, 0.08), p.pebbleShade) +
    path(blob(seed, x - rx * 0.03, cy, rx * 0.93, ry * 0.88, 0.08), p.pebble) +
    path(ellipse(x - rx * 0.32, cy - ry * 0.38, rx * 0.3, ry * 0.17, -12), p.pebbleLight)
  );
}

function clover(x: number, y: number, s: number, turn: number, p: Palette): string {
  const cx = x + 6 * s;
  const cy = y - 58 * s;
  let out = stroke(curve(x, y, cx, cy, 10 * s), p.cloverDark, 6 * s);
  let lobes = '';
  let marks = '';
  for (let k = 0; k < 3; k++) {
    const a = ((turn + k * 120) * Math.PI) / 180;
    const ux = Math.cos(a);
    const uy = Math.sin(a) * 0.72;
    const L = 36 * s;
    for (const side of [-1, 1]) {
      const b = a + side * 0.42;
      lobes += circle(cx + Math.cos(b) * L * 0.62, cy + Math.sin(b) * 0.72 * L * 0.62, L * 0.4);
    }
    lobes += poly([
      [cx - uy * L * 0.3, cy + ux * L * 0.22],
      [cx + ux * L * 0.75, cy + uy * L * 0.75],
      [cx + uy * L * 0.3, cy - ux * L * 0.22],
    ]);
    marks += `M${f(cx + ux * L * 0.28)} ${f(cy + uy * L * 0.28)}L${f(cx + ux * L * 0.62)} ${f(cy + uy * L * 0.62)}`;
  }
  out += path(lobes, p.clover);
  out += stroke(marks, p.cloverMark, 4 * s, ' stroke-opacity=".7"');
  return out;
}

function sprout(x: number, y: number, s: number, p: Palette): string {
  const tx = x + 8 * s;
  const ty = y - 70 * s;
  return (
    stroke(curve(x, y, tx, ty, -8 * s), p.sproutDark, 7 * s) +
    path(leaf(tx, ty, 46 * s, 16 * s, -160), p.sproutDark) +
    path(leaf(tx, ty, 50 * s, 18 * s, -20), p.sprout)
  );
}

function petalBit(x: number, y: number, s: number, angle: number, color: string): string {
  return path(ellipse(x, y, 20 * s, 8 * s, angle), color);
}

function tuft(x: number, y: number, s: number, p: Palette): string {
  return tallGrass(x, y, s, p.grass, p.grassDark);
}

function farBloom(
  x: number,
  y: number,
  h: number,
  lean: number,
  s: number,
  petal: string,
  center: string,
  stemColor: string,
): string {
  const hx = x + lean;
  const hy = y - h;
  let d = '';
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2;
    d += circle(hx + Math.cos(a) * 11 * s, hy + Math.sin(a) * 11 * s, 9 * s);
  }
  return (
    stroke(curve(x, y, hx, hy, lean * 0.2), stemColor, 6) +
    path(d, petal) +
    path(circle(hx, hy, 7 * s), center)
  );
}

function bokeh(seed: number, count: number, p: Palette, k: number): string {
  const r = rng(seed);
  const soft = (id: string, color: string) =>
    `<radialGradient id="${id}"><stop offset="0" stop-color="${color}" stop-opacity=".9"/><stop offset=".7" stop-color="${color}" stop-opacity=".7"/><stop offset="1" stop-color="${color}" stop-opacity="0"/></radialGradient>`;
  let out = `<defs>${soft('bgBokeh', p.bokeh)}${soft('bgBokeh2', p.bokeh2)}</defs>`;
  for (let i = 0; i < count; i++) {
    const x = range(r, 0, W);
    const y = range(r, 60, 1250);
    const rr = range(r, 24, 80);
    const o = range(r, 0.18, 0.4) * k;
    out += `<circle cx="${f(x)}" cy="${f(y)}" r="${f(rr)}" fill="url(#${i % 3 ? 'bgBokeh' : 'bgBokeh2'})" fill-opacity="${f(o)}"/>`;
  }
  return out;
}

function beams(p: Palette, night: boolean): string {
  const spec: [number, number, number][] = night
    ? [
        [128, 4, 0.07],
        [146, 3, 0.06],
        [166, 5, 0.05],
      ]
    : [
        [122, 3.5, 0.1],
        [138, 2.5, 0.08],
        [152, 4, 0.07],
        [170, 3, 0.06],
      ];
  return spec
    .map(([deg, spread, o]) => {
      const a1 = ((deg - spread) * Math.PI) / 180;
      const a2 = ((deg + spread) * Math.PI) / 180;
      const L = 3200;
      return path(
        poly([
          [SUN[0] + Math.cos(a1) * 140, SUN[1] + Math.sin(a1) * 140],
          [SUN[0] + Math.cos(a1) * L, SUN[1] + Math.sin(a1) * L],
          [SUN[0] + Math.cos(a2) * L, SUN[1] + Math.sin(a2) * L],
          [SUN[0] + Math.cos(a2) * 140, SUN[1] + Math.sin(a2) * 140],
        ]),
        p.beam,
        ` fill-opacity="${o}"`,
      );
    })
    .join('');
}

const MID_BLADES: [number, number, number, number, number][] = [
  [170, 1250, 112, -70, 0],
  [260, 960, 92, 150, 90],
  [905, 1120, 100, -130, -80],
  [1010, 1380, 120, 90, 0],
  [1190, 880, 90, -70, 0],
  [1700, 1300, 112, -170, -110],
  [1790, 980, 96, 80, 0],
  [2610, 1150, 110, -110, -70],
  [2710, 880, 92, 130, 0],
  [3470, 1420, 122, -60, 0],
  [3560, 1120, 104, -150, -90],
];

const SHORT_BLADES: [number, number, number, number, number][] = [
  [700, 520, 70, -60, -40],
  [1290, 560, 74, 70, 50],
  [1560, 470, 66, -40, 0],
  [2080, 520, 70, 60, 40],
  [2560, 600, 76, -80, -50],
  [2860, 500, 70, 50, 0],
  [3050, 560, 72, -60, -40],
];

function midBlades(p: Palette): string {
  let out = '';
  MID_BLADES.forEach(([x, h, w, lean, curl], i) => {
    const spine = bladeSpine(x, groundY(x) + 30, h, lean, curl);
    out += bladeFrom(spine, w, p.grass, p.grassDark);
    if (i % 2 === 0) {
      const [dx, dy] = pick(spine, 0.42);
      const rr = 15 + (i % 3) * 4;
      out += dew(dx + w * 0.12, dy, rr, p);
      if (i % 4 === 0) out += glint(dx + w * 0.12 + rr, dy - rr, rr * 1.1, p.dewLight);
    }
  });
  for (const [x, h, w, lean, curl] of SHORT_BLADES) {
    out += blade(x, groundY(x) + 30, h, w, lean, curl, p.grassMid, p.grassMidDark);
  }
  return out;
}

function nearBlades(p: Palette): string {
  return (
    blade(30, 2060, 2050, 160, 120, 0, p.grassNear, p.grassNearDark) +
    blade(-40, 2060, 1450, 140, 200, 110, p.grassNear, p.grassNearDark) +
    blade(3600, 2060, 2100, 160, -130, 0, p.grassNear, p.grassNearDark) +
    blade(3670, 2060, 1300, 140, -150, -70, p.grassNear, p.grassNearDark)
  );
}

function mossEdge(p: Palette): string {
  const top: Pt[] = [];
  const bottom: Pt[] = [];
  for (let x = -200; x <= W + 200; x += 60) {
    top.push([x, groundY(x) - 4]);
    bottom.push([x, groundY(x) + 64 + 30 * Math.sin(x / 170 + 1) + 16 * Math.sin(x / 61)]);
  }
  let bumps = '';
  let tufts = '';
  const r = rng(52);
  for (let x = -180; x <= W + 180; x += 26) {
    bumps += circle(x + range(r, -8, 8), groundY(x) + range(r, 2, 12), range(r, 10, 20));
  }
  for (let x = -150; x <= W + 150; x += 70) {
    const s = range(r, 0.9, 1.6);
    tufts += grassTuft(
      x + range(r, -20, 20),
      groundY(x) + range(r, 8, 20),
      s,
      r() < 0.5 ? p.grassMid : p.grass,
    );
  }
  return path(band(top, bottom), p.moss) + path(bumps, p.mossLight) + tufts;
}

function soilTexture(p: Palette): string {
  const r = rng(77);
  let out = '';
  for (let i = 0; i < 16; i++) {
    const x = range(r, 0, W);
    const y = range(r, 1500, 1960);
    out += path(
      ellipse(x, y, range(r, 120, 280), range(r, 18, 34)),
      p.soilLight,
      ' fill-opacity=".45"',
    );
  }
  let dark = '';
  let light = '';
  for (let i = 0; i < 150; i++) {
    const x = range(r, 0, W);
    const y = range(r, 1480, 1990);
    const rr = range(r, 3, 7);
    if (i % 2) dark += circle(x, y, rr);
    else light += circle(x, y, rr);
  }
  return out + path(dark, p.soilDark, ' fill-opacity=".5"') + path(light, p.soilLight);
}

function farDetails(p: Palette): string {
  const r = rng(63);
  let out = '';
  const colors = [p.farPink, p.farYellow, p.farLilac, p.farWhite];
  for (let i = 0; i < 16; i++) {
    const x = ((i + range(r, 0.15, 0.85)) * W) / 16;
    const h = range(r, 160, 420);
    const lean = range(r, -60, 60);
    out += farBloom(
      x,
      farGroundY(x) + 30,
      h,
      lean,
      range(r, 1.4, 2.2),
      colors[i % 4],
      p.farCenter,
      p.grassFar2,
    );
  }
  return out;
}

function staticFireflies(seed: number, count: number, p: Palette): string {
  const r = rng(seed);
  let out = '';
  for (let i = 0; i < count; i++) {
    const x = range(r, 80, W - 80);
    const y = range(r, 700, 1800);
    const s = range(r, 0.7, 1.3);
    out += glowAt(x, y, 34 * s, 'bgFly') + path(circle(x, y, 5.5 * s), p.fly);
  }
  return out;
}

function fallenLog(p: Palette): string {
  const { x0, x1, bottom, d } = LOG;
  const top = bottom - d;
  const cy = bottom - d / 2;
  const rx = d * 0.3;
  const topPts: Pt[] = [];
  const midPts: Pt[] = [];
  const botPts: Pt[] = [];
  for (let x = x0; x <= x1; x += 92) {
    topPts.push([x, top + 6 * Math.sin(x / 90)]);
    midPts.push([x, cy + d * 0.2 + 5 * Math.sin(x / 70)]);
    botPts.push([x, bottom - 3 * Math.sin(x / 70 + 1)]);
  }
  topPts.push([x1, top]);
  midPts.push([x1, cy + d * 0.2]);
  botPts.push([x1, bottom]);
  let out = path(
    ellipse((x0 + x1) / 2 + 40, bottom + 4, (x1 - x0) / 2 + 80, 30),
    p.shadow,
    ' fill-opacity=".2"',
  );
  out += path(band(topPts, botPts), p.bark);
  out += path(band(midPts, botPts), p.barkDark, ' fill-opacity=".55"');
  out += path(roundRect(x0, top + 20, x1 - x0 - 30, 30, 15), p.barkLight, ' fill-opacity=".6"');
  const r = rng(41);
  let grooves = '';
  for (let i = 0; i < 16; i++) {
    const gx = range(r, x0 + 60, x1 - 200);
    const gy = range(r, top + 64, bottom - 36);
    const len = range(r, 110, 260);
    grooves += curve(gx, gy, gx + len, gy + range(r, -8, 8), range(r, -12, 12));
  }
  out += stroke(grooves, p.barkDark, 8, ' stroke-opacity=".55"');
  out += path(ellipse(x1, cy, rx + 14, d / 2 + 3), p.barkDark);
  out += path(ellipse(x1 + 5, cy, rx, d / 2 - 10), p.wood);
  for (const k of [0.78, 0.55, 0.32]) {
    out += stroke(ellipse(x1 + 5, cy, rx * k, (d / 2 - 10) * k), p.woodRing, 5);
  }
  out += path(ellipse(x1 + 5, cy, 9, 15), p.woodRing);
  out += stroke(
    `M${f(x1 + 5)} ${f(cy - 20)}L${f(x1 + 30)} ${f(cy - 90)}`,
    p.woodRing,
    4,
    ' stroke-opacity=".7"',
  );
  out += path(ellipse(330, cy + 22, 42, 30), p.barkDark);
  out += path(ellipse(333, cy + 24, 25, 17), p.knot);
  out += path(scallop(120, top + 6, 1, 11, 13, 0, 170, 24), p.mossDark);
  out += path(scallop(120, top + 1, 1, 11, 13, 0, 156, 20), p.moss);
  out += path(scallop(560, top + 6, 1, 8, 11, 0, 100, 18), p.mossDark);
  out += path(scallop(560, top + 2, 1, 8, 11, 0, 90, 15), p.moss);
  for (const [sx, sy, s] of [
    [60, cy + 36, 1],
    [118, cy + 70, 0.8],
    [480, cy + 56, 0.9],
  ]) {
    out += shelfFungus(sx, sy, s, p);
  }
  return out;
}

function shelfFungus(x: number, y: number, s: number, p: Palette): string {
  const d = `M${f(x - 44 * s)} ${f(y)}Q${f(x)} ${f(y - 52 * s)} ${f(x + 44 * s)} ${f(y)}Q${f(x)} ${f(y + 10 * s)} ${f(x - 44 * s)} ${f(y)}Z`;
  return (
    path(d, p.shelf) +
    stroke(curve(x - 30 * s, y - 8 * s, x + 30 * s, y - 8 * s, 14 * s), p.shelfBand, 6 * s)
  );
}

function sunWithSpinningRays(x: number, y: number, r: number, p: Palette): string {
  const svg = sun(x, y, r, p.sun, p.sunRay, p.face);
  const rays = svg.match(new RegExp(`(<path[^>]*fill="${p.sunRay}"/>)+`))?.[0] ?? '';
  return svg.replace(rays, `<g data-spin="" style="transform-origin: ${x}px ${y}px">${rays}</g>`);
}

function broadLeaf(
  x: number,
  y: number,
  len: number,
  width: number,
  angle: number,
  bend: number,
  color: string,
  shade: string,
  vein: string,
): string {
  const steps = 14;
  const mid: Pt[] = [[x, y]];
  const angs: number[] = [];
  let px = x;
  let py = y;
  for (let i = 1; i <= steps; i++) {
    const t = i / steps;
    const a = ((angle + bend * t) * Math.PI) / 180;
    px += (Math.cos(a) * len) / steps;
    py += (Math.sin(a) * len) / steps;
    mid.push([px, py]);
    angs.push(a);
  }
  const side = (sgn: number): Pt[] =>
    mid.slice(1, -1).map(([mx, my], i) => {
      const t = (i + 1) / steps;
      const a = angs[i];
      const w = width * Math.pow(Math.sin(Math.PI * Math.pow(t, 0.8)), 0.7);
      return [mx - Math.sin(a) * w * sgn, my + Math.cos(a) * w * sgn];
    });
  const left = side(1);
  const right = side(-1);
  const tip = mid[steps];
  const back = [...right].reverse();
  let out = path(smooth([[x, y], ...left, tip, ...back], true, 0.85), color);
  out += path(smooth([[x, y], ...mid.slice(1, -1), tip, ...back], true, 0.85), shade);
  out += stroke(smooth(mid.slice(0, -1), false), vein, width * 0.09);
  let veins = '';
  for (const t of [0.28, 0.46, 0.64]) {
    const i = Math.round(t * steps);
    const m = mid[i];
    const l = lerp(m, left[Math.min(left.length - 1, i + 1)], 0.8);
    const rr = lerp(m, right[Math.min(right.length - 1, i + 1)], 0.8);
    veins += `M${f(m[0])} ${f(m[1])}L${f(l[0])} ${f(l[1])}M${f(m[0])} ${f(m[1])}L${f(rr[0])} ${f(rr[1])}`;
  }
  out += stroke(veins, vein, width * 0.05, ' stroke-opacity=".8"');
  return out;
}

function sunflowerPlant(p: Palette): string {
  const [bx, by] = SUNFLOWER;
  const [hx, hy] = SUN_HEAD;
  const spine: Pt[] = [
    [bx, by + 12],
    [bx + 26, by - 430],
    [bx + 110, hy + 520],
    [hx - 4, hy + 100],
  ];
  const pts = spline(spine, 40);
  const leafAt = (t: number) => pick(pts, t);
  let out = '';
  const l1 = leafAt(0.5);
  const l2 = leafAt(0.63);
  const l3 = leafAt(0.79);
  out += broadLeaf(l1[0], l1[1], 330, 112, -170, -36, p.leafA, p.leafADark, p.leafVein);
  out += broadLeaf(l3[0], l3[1], 250, 90, -166, -30, p.leafA, p.leafADark, p.leafVein);
  out += path(
    tube(spine, (u) => 30 - 10 * u),
    p.stemDark,
  );
  out += path(
    tube(
      spine.map(([x, y]): Pt => [x + 7, y]),
      (u) => 21 - 7 * u,
    ),
    p.stem,
  );
  out += broadLeaf(l2[0], l2[1], 300, 104, -12, 34, p.leafA, p.leafADark, p.leafVein);
  const d = lerp(l2, [l2[0] + 220, l2[1] + 40], 0.7);
  out += dew(d[0], d[1] - 10, 20, p) + glint(d[0] + 18, d[1] - 30, 18, p.dewLight);
  out += sunflowerHead(hx, hy, p);
  return out;
}

function sunflowerHead(x: number, y: number, p: Palette): string {
  const sq = 0.95;
  let sepals = '';
  for (let i = 0; i < 16; i++) {
    const a = (i / 16) * 360 + 6;
    const rad = (a * Math.PI) / 180;
    sepals += leaf(x + Math.cos(rad) * 120 * sq, y + Math.sin(rad) * 120, 168, 26, a);
  }
  let back = '';
  let front = '';
  for (let i = 0; i < 26; i++) {
    const a = (i / 26) * 360;
    const rad = (a * Math.PI) / 180;
    back += leaf(x + Math.cos(rad) * 128 * sq, y + Math.sin(rad) * 128, 146, 33, a);
    const b = a + 360 / 52;
    const rb = (b * Math.PI) / 180;
    front += leaf(x + Math.cos(rb) * 126 * sq, y + Math.sin(rb) * 126, 128, 31, b);
  }
  let dots = '';
  const n = 120;
  for (let i = 1; i < n; i++) {
    const rr = 122 * Math.sqrt(i / n);
    const a = i * 2.39996;
    dots += circle(x + Math.cos(a) * rr * sq, y + Math.sin(a) * rr, 3.6 + 2.6 * (rr / 122));
  }
  return (
    path(sepals, p.sepal) +
    path(back, p.sunPetalBack) +
    path(front, p.sunPetal) +
    path(ellipse(x, y, 150 * sq, 150), p.sunSeedDark) +
    path(ellipse(x, y, 136 * sq, 136), p.sunSeed) +
    path(dots, p.sunSeedDot) +
    path(ellipse(x - 34, y - 40, 52, 36, -30), '#ffffff', ' fill-opacity=".1"')
  );
}

function daisyPlant(p: Palette): string {
  const [bx, by] = DAISY;
  const [hx, hy] = DAISY_HEAD;
  const spine: Pt[] = [
    [bx, by + 12],
    [bx - 30, by - 300],
    [hx + 70, hy + 300],
    [hx + 4, hy + 60],
  ];
  const pts = spline(spine, 40);
  let out = '';
  out += broadLeaf(bx - 4, by - 10, 230, 46, -150, -30, p.leafA, p.leafADark, p.leafVein);
  out += path(
    tube(spine, (u) => 17 - 5 * u),
    p.stemDark,
  );
  out += path(
    tube(
      spine.map(([x, y]): Pt => [x + 4, y]),
      (u) => 11 - 3 * u,
    ),
    p.stem,
  );
  const m = pick(pts, 0.45);
  out += broadLeaf(m[0], m[1], 210, 40, -20, 40, p.leafA, p.leafADark, p.leafVein);
  out += broadLeaf(bx + 4, by - 6, 170, 44, -40, 34, p.leafA, p.leafADark, p.leafVein);
  out += daisyHead(hx, hy, p);
  return out;
}

function daisyHead(x: number, y: number, p: Palette): string {
  const sy = 0.9;
  let back = '';
  let front = '';
  const n = 22;
  for (let i = 0; i < n; i++) {
    const a = ((i + 0.5) / n) * Math.PI * 2;
    back += capsule(
      x + Math.cos(a) * 60,
      y + Math.sin(a) * 60 * sy,
      x + Math.cos(a) * 196,
      y + Math.sin(a) * 196 * sy,
      13,
      25,
    );
    const b = (i / n) * Math.PI * 2;
    const len = 178 + (i % 3) * 8;
    front += capsule(
      x + Math.cos(b) * 58,
      y + Math.sin(b) * 58 * sy,
      x + Math.cos(b) * len,
      y + Math.sin(b) * len * sy,
      12,
      23,
    );
  }
  let dots = '';
  for (const [k, cnt] of [
    [0.32, 6],
    [0.6, 12],
    [0.84, 18],
  ]) {
    for (let i = 0; i < cnt; i++) {
      const a = (i / cnt) * Math.PI * 2 + k * 3;
      dots += circle(x + Math.cos(a) * 62 * k, y + Math.sin(a) * 62 * k * sy, 4.5);
    }
  }
  return (
    path(back, p.daisyBack) +
    path(front, p.daisyPetal) +
    path(ellipse(x, y + 4, 76, 70 * sy), p.daisyCenterDark) +
    path(ellipse(x, y, 70, 64 * sy), p.daisyCenter) +
    path(dots, p.daisyCenterDark, ' fill-opacity=".7"') +
    path(ellipse(x - 24, y - 24, 22, 13, -30), '#ffffff', ' fill-opacity=".45"')
  );
}

function fan(x: number, y: number, a: number, s: number): string {
  let d = '';
  for (let k = -2; k <= 2; k++) {
    const b = a + k * 0.38;
    d += `M${f(x)} ${f(y)}L${f(x + Math.cos(b) * 17 * s)} ${f(y + Math.sin(b) * 17 * s)}`;
  }
  return d;
}

function dandelionPlant(p: Palette, mode: Mode): string {
  const [bx, by] = DANDELION;
  const [cx, cy] = CLOCK;
  const R = 200;
  const spine: Pt[] = [
    [bx, by + 12],
    [bx - 8, by - 400],
    [cx + 24, cy + 420],
    [cx + 2, cy + 20],
  ];
  let out = '';
  out += path(
    tube(spine, (u) => 12 - 3 * u),
    p.dandStemDark,
  );
  out += path(
    tube(
      spine.map(([x, y]): Pt => [x + 3, y]),
      (u) => 8 - 2 * u,
    ),
    p.dandStem,
  );
  if (mode === 'night') {
    out +=
      `<defs>${radialGlow('dnGlow', p.fluffGlow, 0.5)}</defs>` + glowAt(cx, cy, R * 1.4, 'dnGlow');
  }
  out += path(circle(cx, cy, R * 1.04), p.fluff, ' fill-opacity=".16"');
  out += path(circle(cx, cy, R * 0.8), p.fluff, ' fill-opacity=".14"');
  const r = rng(17);
  let rays = '';
  let fans = '';
  let puffs = '';
  const n = 60;
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2 + range(r, -0.03, 0.03);
    const len = R * range(r, 0.86, 0.96);
    const ex = cx + Math.cos(a) * len;
    const ey = cy + Math.sin(a) * len;
    rays += `M${f(cx + Math.cos(a) * 18)} ${f(cy + Math.sin(a) * 18)}L${f(ex)} ${f(ey)}`;
    fans += fan(ex, ey, a, range(r, 0.9, 1.15));
    puffs += circle(ex + Math.cos(a) * 9, ey + Math.sin(a) * 9, 11);
  }
  let innerRays = '';
  let innerFans = '';
  for (let i = 0; i < 30; i++) {
    const a = (i / 30) * Math.PI * 2 + 0.1;
    const len = R * range(r, 0.34, 0.66);
    const ex = cx + Math.cos(a) * len;
    const ey = cy + Math.sin(a) * len;
    innerRays += `M${f(cx + Math.cos(a) * 14)} ${f(cy + Math.sin(a) * 14)}L${f(ex)} ${f(ey)}`;
    innerFans += fan(ex, ey, a, range(r, 0.6, 0.8));
  }
  out += path(puffs, p.fluff, ' fill-opacity=".35"');
  out += stroke(innerRays, p.fluffLine, 1.8, ' stroke-opacity=".55"');
  out += stroke(innerFans, p.fluff, 2, ' stroke-opacity=".8"');
  out += stroke(rays, p.fluffLine, 2.2, ' stroke-opacity=".8"');
  out += stroke(fans, p.fluff, 2.4);
  out += path(circle(cx, cy, 22), p.dandHub);
  out += path(circle(cx - 6, cy - 6, 8), p.fluff, ' fill-opacity=".5"');
  const drift: [number, number, number][] = [
    [1630, 400, -40],
    [1700, 318, -28],
    [1585, 290, -52],
    [1665, 222, -18],
  ];
  let seeds = '';
  for (const [sx, sy, a] of drift) {
    const rad = (a * Math.PI) / 180;
    const tx = sx + Math.cos(rad) * 48;
    const ty = sy + Math.sin(rad) * 48;
    seeds += `M${f(sx)} ${f(sy)}L${f(tx)} ${f(ty)}` + fan(tx, ty, rad, 1.1);
    out += path(ellipse(sx, sy, 6, 3.5, a), p.dandSeed);
  }
  out += stroke(seeds, p.fluff, 2.4);
  return out;
}

function stalkSpine(x0: number, y0: number, x1: number, y1: number, bend: number): Pt[] {
  return [
    [x0, y0 + 10],
    [x0 + bend * 0.4, (y0 * 2 + y1) / 3],
    [x1 + bend * 0.3, (y0 + y1 * 2) / 3],
    [x1, y1],
  ];
}

const STALK_L = stalkSpine(WEB_L[0], WEB_L[1], 1872, 120, -30);
const STALK_R = stalkSpine(WEB_R[0], WEB_R[1], 2500, 150, 40);

function onStalk(spine: Pt[], y: number): Pt {
  const pts = spline(spine, 60);
  let best = pts[0];
  for (const pt of pts) if (Math.abs(pt[1] - y) < Math.abs(best[1] - y)) best = pt;
  return best;
}

function stalk(spine: Pt[], p: Palette): string {
  return (
    path(
      tube(spine, (u) => 13 - 6 * u),
      p.stalkDark,
    ) +
    path(
      tube(
        spine.map(([x, y]): Pt => [x + 3, y]),
        (u) => 8 - 4 * u,
      ),
      p.stalk,
    )
  );
}

function seedHead(x: number, y: number, p: Palette): string {
  let d = '';
  for (let i = 0; i < 7; i++) {
    const t = i / 6;
    const yy = y + t * 150;
    d += ellipse(x - 13 - t * 4, yy, 9, 20, 24);
    d += ellipse(x + 13 + t * 4, yy + 10, 9, 20, -24);
  }
  return path(d, p.stalkHead) + path(ellipse(x, y - 14, 8, 22), p.stalkHead);
}

function webFrame(): Pt[] {
  return [
    onStalk(STALK_L, 650),
    onStalk(STALK_L, 410),
    [2150, 300],
    onStalk(STALK_R, 380),
    onStalk(STALK_R, 640),
    [2420, 880],
    [2160, 935],
    onStalk(STALK_L, 860),
  ];
}

function rayHit(o: Pt, a: number, frame: Pt[]): Pt {
  const dx = Math.cos(a);
  const dy = Math.sin(a);
  let best = Infinity;
  for (let i = 0; i < frame.length; i++) {
    const [ax, ay] = frame[i];
    const [bx, by] = frame[(i + 1) % frame.length];
    const ex = bx - ax;
    const ey = by - ay;
    const den = dx * ey - dy * ex;
    if (Math.abs(den) < 1e-9) continue;
    const t = ((ax - o[0]) * ey - (ay - o[1]) * ex) / den;
    const u = ((ax - o[0]) * dy - (ay - o[1]) * dx) / den;
    if (t > 0 && u >= 0 && u <= 1) best = Math.min(best, t);
  }
  return [o[0] + dx * best, o[1] + dy * best];
}

function spiderWeb(p: Palette, mode: Mode): string {
  const night = mode === 'night';
  let out = '';
  out += stalk(STALK_L, p);
  out += seedHead(1872, 110, p);
  out += stalk(STALK_R, p);
  out += blade(2496, 420, 260, 34, 170, 70, p.stalk, p.stalkDark);
  const frame = webFrame();
  const spokes = 20;
  const ends: Pt[] = [];
  for (let i = 0; i < spokes; i++) {
    const a = (i / spokes) * Math.PI * 2 + 0.08 * Math.sin(i * 2.3);
    ends.push(rayHit(HUB, a, frame));
  }
  let rim = `M${f(frame[0][0])} ${f(frame[0][1])}`;
  for (let i = 1; i <= frame.length; i++) {
    const a = frame[i - 1];
    const b = frame[i % frame.length];
    const c = lerp(HUB, lerp(a, b, 0.5), 0.97);
    rim += `Q${f(c[0])} ${f(c[1])} ${f(b[0])} ${f(b[1])}`;
  }
  out += path(rim + 'Z', p.thread, ' fill-opacity=".07"');
  let threads = rim;
  const tl = onStalk(STALK_L, 230);
  const tr = onStalk(STALK_R, 250);
  const bl = onStalk(STALK_L, 1060);
  const br = onStalk(STALK_R, 1010);
  threads += `M${f(tl[0])} ${f(tl[1])}L${f(frame[2][0])} ${f(frame[2][1])}L${f(tr[0])} ${f(tr[1])}`;
  threads += `M${f(frame[6][0])} ${f(frame[6][1])}L${f(bl[0])} ${f(bl[1])}`;
  threads += `M${f(frame[5][0])} ${f(frame[5][1])}L${f(br[0])} ${f(br[1])}`;
  for (const [x, y] of ends) threads += `M${f(HUB[0])} ${f(HUB[1])}L${f(x)} ${f(y)}`;
  const turns = 9;
  const k0 = 0.14;
  const k1 = 0.93;
  const steps = turns * spokes;
  const kAt = (j: number) => k0 + ((k1 - k0) * j) / steps;
  const point = (j: number) => lerp(HUB, ends[j % spokes], kAt(j));
  let spiral = `M${f(point(0)[0])} ${f(point(0)[1])}`;
  for (let j = 1; j <= steps; j++) {
    const a = point(j - 1);
    const b = point(j);
    const c = lerp(HUB, lerp(a, b, 0.5), 0.94);
    spiral += `Q${f(c[0])} ${f(c[1])} ${f(b[0])} ${f(b[1])}`;
  }
  let hub = '';
  for (const k of [0.05, 0.09]) {
    const ring = ends.map((e) => lerp(HUB, e, k));
    hub +=
      `M${f(ring[0][0])} ${f(ring[0][1])}` +
      ring.map(([x, y]) => `L${f(x)} ${f(y)}`).join('') +
      'Z';
  }
  if (night) {
    out +=
      `<defs>${radialGlow('wbGlow', p.threadGlow, 0.3)}</defs>` +
      glowAt(HUB[0], HUB[1], 340, 'wbGlow');
    out += stroke(threads + spiral, p.threadGlow, 9, ' stroke-opacity=".16"');
  }
  out += stroke(threads, p.thread, 3.6, ' stroke-opacity=".92"');
  out += stroke(spiral + hub, p.thread, 2.5, ' stroke-opacity=".85"');
  const r = rng(29);
  let beads = '';
  let shines = '';
  for (let i = 0; i < 34; i++) {
    const [x, y] = point(Math.floor(range(r, spokes * 1.5, steps)));
    const rr = range(r, 5, 9);
    beads += circle(x, y + rr * 0.6, rr);
    shines += circle(x - rr * 0.3, y + rr * 0.25, rr * 0.36);
  }
  out += path(beads, p.bead, ' fill-opacity=".9"') + path(shines, p.dewLight);
  for (const [j, s] of [
    [112, 26],
    [141, 22],
    [77, 20],
    [168, 24],
    [95, 18],
  ]) {
    const [x, y] = point(j);
    out += path(circle(x, y + 7, 10), p.bead) + glint(x, y + 7, s, p.dewLight);
  }
  return out;
}

function toadstool(
  x: number,
  y: number,
  s: number,
  cap: string,
  capShade: string,
  p: Palette,
): string {
  const stemH = 165 * s;
  const R = 135 * s;
  const capH = 108 * s;
  const cy = y - stemH;
  const dome = (cx: number, rr: number, hh: number) =>
    `M${f(cx - rr)} ${f(cy)}C${f(cx - rr)} ${f(cy - hh * 1.32)} ${f(cx + rr)} ${f(cy - hh * 1.32)} ${f(cx + rr)} ${f(cy)}Q${f(cx)} ${f(cy + 26 * s)} ${f(cx - rr)} ${f(cy)}Z`;
  let out = path(
    smooth(
      [
        [x - 34 * s, y + 4],
        [x - 27 * s, y - stemH * 0.5],
        [x - 21 * s, cy + 8 * s],
        [x + 21 * s, cy + 8 * s],
        [x + 27 * s, y - stemH * 0.5],
        [x + 36 * s, y + 4],
      ],
      true,
      0.6,
    ),
    p.mushStem,
  );
  out += path(
    smooth(
      [
        [x + 6 * s, y + 2],
        [x + 10 * s, y - stemH * 0.5],
        [x + 14 * s, cy + 10 * s],
        [x + 21 * s, cy + 8 * s],
        [x + 27 * s, y - stemH * 0.5],
        [x + 36 * s, y + 4],
      ],
      true,
      0.6,
    ),
    p.mushStemShade,
  );
  out += path(ellipse(x, y - stemH * 0.6, 36 * s, 13 * s), p.mushStemShade);
  out += path(ellipse(x, y - stemH * 0.6 - 4 * s, 33 * s, 10 * s), p.mushStem);
  out += path(ellipse(x, cy + 4 * s, R * 0.84, 22 * s), p.gill);
  out += path(dome(x, R, capH), capShade);
  out += path(dome(x - R * 0.06, R * 0.92, capH * 0.96), cap);
  out += path(
    ellipse(x - R * 0.44, cy - capH * 0.6, R * 0.2, capH * 0.12, -30),
    '#ffffff',
    ' fill-opacity=".3"',
  );
  let dots = '';
  for (const [u, v, k] of [
    [-0.52, 0.42, 0.13],
    [0.02, 0.8, 0.16],
    [0.5, 0.45, 0.12],
    [-0.18, 0.28, 0.08],
    [0.3, 0.74, 0.08],
    [-0.76, 0.16, 0.07],
    [0.78, 0.17, 0.065],
  ]) {
    dots += ellipse(x + u * R, cy - v * capH, k * R, k * R * 0.74);
  }
  out += path(dots, p.capDot);
  return out;
}

function mushrooms(p: Palette, mode: Mode): string {
  const [x, y] = MUSH;
  const night = mode === 'night';
  let out = '';
  if (night) {
    out += `<defs>${radialGlow('mgGlow', p.mushGlow, 0.55)}</defs>`;
    out += glowAt(x, y - 230, 190, 'mgGlow');
    out += glowAt(x + 160, y - 130, 125, 'mgGlow');
    out += glowAt(x - 125, y - 100, 95, 'mgGlow');
  }
  out += path(ellipse(x + 20, y + 4, 230, 26), p.shadow, ' fill-opacity=".18"');
  out += toadstool(x - 125, y + 20, 0.5, p.capTan, p.capTanShade, p);
  out += toadstool(x, y, 1, p.capRed, p.capRedShade, p);
  out += toadstool(x + 160, y + 26, 0.66, p.capOrange, p.capOrangeShade, p);
  return out;
}

function anthill(p: Palette): string {
  const [x, y] = ANTHILL;
  const hw = 290;
  const hh = 270;
  const height = (u: number) => hh * Math.pow(Math.max(0, 1 - u * u), 1.25);
  const pts: Pt[] = [];
  for (let i = 0; i <= 16; i++) {
    const u = -1 + (2 * i) / 16;
    const bump = i > 0 && i < 16 ? (i % 2 ? 7 : -3) : 0;
    pts.push([x + u * hw, y + 6 - height(u) - bump]);
  }
  let out = path(ellipse(x + 30, y + 6, hw + 50, 24), p.shadow, ' fill-opacity=".2"');
  out += path(smooth(pts, false) + 'Z', p.sand);
  const shade: Pt[] = [];
  for (let i = 9; i <= 16; i++) shade.push(pts[i]);
  shade.push([x + hw * 0.5, y + 6]);
  shade.push([x + hw * 0.26, y - hh * 0.4]);
  out += path(smooth(shade, true, 0.7), p.sandDark, ' fill-opacity=".55"');
  out += path(
    ellipse(x - hw * 0.38, y - hh * 0.55, hw * 0.16, hh * 0.1, -40),
    p.sandLight,
    ' fill-opacity=".7"',
  );
  const r = rng(91);
  let light = '';
  let dark = '';
  for (let i = 0; i < 150; i++) {
    const u = range(r, -0.94, 0.94);
    const v = range(r, 0.04, 0.92);
    const gx = x + u * hw;
    const gy = y - v * height(u);
    const gr = range(r, 4.5, 9.5);
    if (i % 2) light += circle(gx, gy, gr);
    else dark += circle(gx, gy, gr);
  }
  out +=
    path(dark, p.sandDark, ' fill-opacity=".7"') + path(light, p.sandLight, ' fill-opacity=".8"');
  out += path(ellipse(x + 8, y - hh + 24, 54, 24), p.sandLight);
  out += path(ellipse(x + 8, y - hh + 28, 38, 15), p.hole);
  out += path(ellipse(x - 132, y - 76, 34, 17, 8), p.sandLight);
  out += path(ellipse(x - 132, y - 73, 23, 11, 8), p.hole);
  out += path(ellipse(x + 150, y - 50, 26, 13, -10), p.sandLight);
  out += path(ellipse(x + 150, y - 48, 17, 8, -10), p.hole);
  let crumbs = '';
  for (const [cx, cr] of [
    [-330, 9],
    [-302, 6],
    [300, 8],
    [334, 11],
    [366, 6],
  ]) {
    crumbs += circle(x + cx, y + 2 - cr, cr);
  }
  out += path(crumbs, p.sand);
  return out;
}

function puddle(p: Palette, mode: Mode): string {
  const [x, y] = PUDDLE;
  const rx = 370;
  const ry = 88;
  let out = path(blob(13, x, y + 10, rx * 1.07, ry * 1.22, 0.08), p.waterRim);
  out += path(blob(13, x, y, rx, ry, 0.08), p.water);
  out += path(
    blob(19, x - 10, y - ry * 0.42, rx * 0.86, ry * 0.36, 0.1),
    p.waterDeep,
    ' fill-opacity=".45"',
  );
  out += path(ellipse(x - 50, y + 8, rx * 0.6, ry * 0.36), p.waterLight, ' fill-opacity=".4"');
  out += stroke(
    curve(x - rx * 0.62, y - ry * 0.1, x - rx * 0.2, y - ry * 0.3, -10),
    p.shine,
    10,
    ' stroke-opacity=".85"',
  );
  out += stroke(
    curve(x + rx * 0.18, y + ry * 0.42, x + rx * 0.48, y + ry * 0.3, -6),
    p.shine,
    7,
    ' stroke-opacity=".7"',
  );
  out += stroke(ellipse(x + 130, y + 6, 64, 15), p.shine, 4, ' stroke-opacity=".55"');
  out += stroke(ellipse(x + 130, y + 6, 116, 27), p.shine, 3, ' stroke-opacity=".3"');
  out += petalBit(x - 150, y + 22, 1.3, -20, p.petalPink);
  out +=
    path(leaf(x + 230, y - 20, 70, 20, -150), p.leafA) +
    stroke(`M${f(x + 230)} ${f(y - 20)}L${f(x + 170)} ${f(y - 52)}`, p.leafVein, 3);
  if (mode === 'night') {
    let streak = '';
    for (let i = 0; i < 4; i++) {
      streak += ellipse(x + 210 - i * 10, y - 40 + i * 22, 46 - i * 8, 6);
    }
    out += path(streak, p.reflect, ' fill-opacity=".7"');
    out += glint(x - 220, y + 4, 16, p.shine) + glint(x + 40, y + 36, 12, p.shine);
  }
  return out;
}

function groundLeaf(p: Palette): string {
  const B = LEAF_BASE;
  const T = LEAF_TIP;
  const C: Pt = [(B[0] + T[0]) / 2 - 40, Math.min(B[1], T[1]) - 90];
  const n = 40;
  const mid: Pt[] = [];
  for (let i = 0; i <= n; i++) {
    const t = i / n;
    const u = 1 - t;
    mid.push([
      u * u * B[0] + 2 * u * t * C[0] + t * t * T[0],
      u * u * B[1] + 2 * u * t * C[1] + t * t * T[1],
    ]);
  }
  const bites: [number, number, number][] = [
    [0.44, 0.07, 0.72],
    [0.585, 0.055, 0.6],
  ];
  const bite = (t: number) =>
    bites.reduce((acc, [t0, hw, depth]) => {
      const q = (t - t0) / hw;
      return Math.abs(q) < 1 ? Math.max(acc, depth * Math.sqrt(1 - q * q)) : acc;
    }, 0);
  const { left: up, right: down } = ribbon(mid, () => 1);
  const edge = (side: Pt[], i: number, w: number): Pt => lerp(mid[i], side[i], w);
  const top: Pt[] = [];
  const bottom: Pt[] = [];
  for (let i = 0; i <= n; i++) {
    const t = i / n;
    const prof = Math.pow(Math.sin(Math.PI * t), 0.7);
    top.push(edge(down, i, 122 * prof * (1 - bite(t))));
    bottom.push(edge(up, i, 92 * prof));
  }
  let out = path(ellipse((B[0] + T[0]) / 2, B[1] + 6, 380, 34), p.shadow, ' fill-opacity=".2"');
  out += path(tube([[B[0] - 90, B[1] + 36], [B[0] - 40, B[1] + 18], B], 9), p.bigLeafDark);
  out += path(smooth([...top, ...bottom.slice(1, -1).reverse()], true, 0.9), p.bigLeaf);
  out += path(smooth([...mid, ...bottom.slice(1, -1).reverse()], true, 0.9), p.bigLeafDark);
  out += stroke(smooth(mid.slice(0, -2), false), p.bigLeafVein, 9);
  let veins = '';
  for (const t of [0.16, 0.28, 0.4, 0.52, 0.64, 0.76, 0.86]) {
    const i = Math.round(t * n);
    const j = Math.min(n, i + 3);
    const m = mid[i];
    const a = lerp(m, top[j], 0.82);
    const b = lerp(m, bottom[j], 0.8);
    veins += `M${f(m[0])} ${f(m[1])}Q${f((m[0] + a[0]) / 2 + 10)} ${f((m[1] + a[1]) / 2)} ${f(a[0])} ${f(a[1])}`;
    veins += `M${f(m[0])} ${f(m[1])}Q${f((m[0] + b[0]) / 2 + 10)} ${f((m[1] + b[1]) / 2)} ${f(b[0])} ${f(b[1])}`;
  }
  out += stroke(veins, p.bigLeafVein, 4.5, ' stroke-opacity=".75"');
  const d1 = lerp(mid[13], top[13], 0.45);
  const d2 = lerp(mid[31], bottom[31], 0.35);
  out += dew(d1[0], d1[1], 28, p) + dew(d2[0], d2[1], 19, p) + dew(d1[0] + 52, d1[1] + 16, 10, p);
  out += glint(d1[0] + 26, d1[1] - 26, 22, p.dewLight);
  return out;
}

const AVOID: Zone[] = [
  [PUDDLE[0], PUDDLE[1], 470, 150],
  [(LEAF_BASE[0] + LEAF_TIP[0]) / 2, 1690, 460, 170],
  [ANTHILL[0], ANTHILL[1], 400, 150],
  [MUSH[0] + 20, MUSH[1], 300, 160],
  [SUNFLOWER[0], SUNFLOWER[1], 190, 110],
  [WEB_L[0], WEB_L[1], 140, 90],
  [WEB_R[0], WEB_R[1], 140, 90],
  [DANDELION[0], DANDELION[1], 120, 80],
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
    if (y < groundY(x) + 40) continue;
    out.push([y, svg]);
  }
  return out;
}

function undergrowth(p: Palette): Layer[] {
  const fixed: Layer[] = [
    [1764, tuft(380, 1764, 1.8, p)],
    [1770, tuft(470, 1770, 1.4, p)],
    [1585, tuft(1930, 1585, 1.4, p)],
    [1580, tuft(2000, 1580, 1.1, p)],
    [1566, tuft(2440, 1566, 1.5, p)],
    [1560, tuft(2506, 1560, 1.1, p)],
    [1678, tuft(880, 1678, 1.2, p)],
    [1690, tuft(1070, 1690, 1, p)],
    [1664, tuft(1384, 1664, 1.3, p)],
    [1660, tuft(1906, 1660, 1.2, p)],
    [1616, tuft(110, 1616, 1.7, p)],
    [1612, tuft(660, 1612, 1.4, p)],
    [1868, pebble(1880, 1868, 60, 38, 3, p)],
    [1890, pebble(2590, 1890, 80, 46, 5, p)],
    [1900, pebble(2660, 1902, 40, 26, 7, p)],
    [1700, pebble(2140, 1700, 52, 30, 9, p)],
    [1640, pebble(1260, 1640, 46, 30, 11, p)],
    [1850, pebble(3530, 1850, 70, 42, 13, p)],
    [1820, clover(700, 1820, 1.3, 20, p)],
    [1850, clover(980, 1850, 1.1, 70, p)],
    [1600, clover(3500, 1600, 1, 0, p)],
    [1890, sprout(3000, 1890, 1, p)],
    [1690, sprout(560, 1690, 1.1, p)],
    [1880, sprout(3220, 1880, 0.9, p)],
    [1780, petalBit(250, 1780, 1.2, 20, p.petalYellow)],
    [1800, petalBit(820, 1800, 1, -30, p.petalYellow)],
    [1840, petalBit(3260, 1840, 1.2, 10, p.daisyPetal)],
    [1870, petalBit(3380, 1870, 1, -40, p.daisyPetal)],
    [1790, petalBit(2900, 1790, 1, 60, p.petalPink)],
    [1880, dew(1500, 1880, 18, p)],
    [1840, dew(2720, 1842, 14, p)],
  ];
  return [
    ...fixed,
    ...scatterAround(5, 26, 0, W, 1450, 1880, (x, y, r) => tuft(x, y, range(r, 0.9, 1.5), p)),
    ...scatterAround(23, 10, 0, W, 1480, 1880, (x, y, r) =>
      pebble(x, y, range(r, 20, 44), range(r, 14, 26), Math.floor(r() * 1000), p),
    ),
    ...scatterAround(37, 8, 0, W, 1500, 1880, (x, y, r) =>
      clover(x, y, range(r, 0.8, 1.1), range(r, 0, 120), p),
    ),
  ];
}

const PROPS: Record<string, (p: Palette, mode: Mode) => Layer[]> = {
  web: (p, mode) => [[WEB_L[1], spiderWeb(p, mode)]],
  dandelion: (p, mode) => [[DANDELION[1], dandelionPlant(p, mode)]],
  sunflower: (p) => [[SUNFLOWER[1], sunflowerPlant(p)]],
  daisy: (p) => [[DAISY[1], daisyPlant(p)]],
  mushrooms: (p, mode) => [[MUSH[1], mushrooms(p, mode)]],
  anthill: (p) => [[ANTHILL[1], anthill(p)]],
  leaf: (p) => [[LEAF_BASE[1], groundLeaf(p)]],
  puddle: (p, mode) => [[PUDDLE[1] - 90, puddle(p, mode)]],
};

function shapes(svg: string): Shape[] {
  const out: Shape[] = [];
  for (const m of svg.matchAll(/ d="([^"]+)"/g)) {
    for (const d of m[1].split(/(?=M)/)) {
      const pts = samplePath(d, 6);
      if (pts.length > 1) out.push([extendBounds(emptyBounds(), pts), pts]);
    }
  }
  return out;
}

function inside([x, y]: Pt, pts: Pt[]): boolean {
  let hit = false;
  for (let i = 0, j = pts.length - 1; i < pts.length; j = i++) {
    const [ax, ay] = pts[i];
    const [bx, by] = pts[j];
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

const owners: Partial<Record<Mode, string[]>> = {};

function ownersOf(p: Palette, mode: Mode, items: Layer[]): string[] {
  const ids = Object.keys(PROPS);
  const covers = ids.flatMap((id, k) =>
    PROPS[id](p, mode).map(([y, svg]): [number, number, Shape[]] => [k, y, shapes(svg)]),
  );
  return items.map(([y, svg]) => {
    const own = shapes(svg);
    let best = -1;
    for (const [k, cy, c] of covers) if (k > best && y > cy && overlap(own, c)) best = k;
    if (best >= 0) covers.push([best, y, own]);
    return ids[best] ?? '';
  });
}

function undergrowthOf(p: Palette, mode: Mode, id: string): Layer[] {
  const items = undergrowth(p).sort((a, b) => a[0] - b[0]);
  const owner = (owners[mode] ??= ownersOf(p, mode, items));
  return items.filter((_, i) => owner[i] === id);
}

const standing = (id: string) => (p: Palette, mode: Mode) =>
  layered([...PROPS[id](p, mode), ...undergrowthOf(p, mode, id)]);

const day: Palette = {
  skyTop: '#5fbdf0',
  skyMid: '#9edcf6',
  skyBottom: '#e6f7ef',
  sunGlow: '#fff3b0',
  beam: '#fffbe0',
  bokeh: '#ffffff',
  bokeh2: '#fff2a8',
  sun: '#ffd84d',
  sunRay: '#ffc93a',
  face: '#8a4b1f',
  cloud: '#ffffff',
  cloudShade: '#e4f3fb',
  star: '#fff6d6',
  fly: '#f6ffc0',
  flyGlow: '#e9ff9a',
  grassFar: '#c3e7cf',
  grassFar2: '#a9dca0',
  grassFar2Dark: '#9bd294',
  grassMid: '#8fcd62',
  grassMidDark: '#7cbd52',
  grass: '#78c052',
  grassDark: '#63ab43',
  grassNear: '#5aa53f',
  grassNearDark: '#4a9134',
  haze: '#f1fbf2',
  farPink: '#f7cde0',
  farYellow: '#faeaa4',
  farLilac: '#ddd2f6',
  farWhite: '#ffffff',
  farCenter: '#fff2c4',
  groundFar: '#b9dc93',
  soilTop: '#d8ab78',
  soilDeep: '#c4925f',
  soilLight: '#e7c494',
  soilDark: '#ad7f52',
  moss: '#93c95a',
  mossDark: '#7bb548',
  mossLight: '#a8d672',
  shadow: '#4a3220',
  pebble: '#ddd3c4',
  pebbleShade: '#bfb2a0',
  pebbleLight: '#f6f1e8',
  clover: '#6db84a',
  cloverDark: '#5aa23c',
  cloverMark: '#b8e59a',
  sprout: '#9fdc63',
  sproutDark: '#7fc24a',
  petalPink: '#ffb3cc',
  petalYellow: '#ffd23f',
  bark: '#a87649',
  barkDark: '#80552f',
  barkLight: '#c49564',
  wood: '#ecd09e',
  woodRing: '#cfa36c',
  knot: '#5a3a22',
  shelf: '#f3dcaa',
  shelfBand: '#e3a35c',
  stem: '#6cb246',
  stemDark: '#4f9634',
  leafA: '#6fbd47',
  leafADark: '#5aa63a',
  leafVein: '#a9e07e',
  sepal: '#5aa63a',
  sunPetal: '#ffcf2e',
  sunPetalBack: '#f5a81c',
  sunSeed: '#7a4421',
  sunSeedDark: '#5c3016',
  sunSeedDot: '#a2622f',
  daisyPetal: '#ffffff',
  daisyBack: '#e5e8f4',
  daisyCenter: '#ffd03a',
  daisyCenterDark: '#f2a91f',
  fluff: '#ffffff',
  fluffLine: '#f4f6f0',
  fluffGlow: '#e8f0ff',
  dandStem: '#a7d47e',
  dandStemDark: '#86bb5e',
  dandHub: '#c9a55a',
  dandSeed: '#9a7a4a',
  stalk: '#b9cf72',
  stalkDark: '#97b356',
  stalkHead: '#d6c98a',
  thread: '#ffffff',
  threadGlow: '#cfe0ff',
  bead: '#dff4ff',
  dew: '#dcf3ff',
  dewShade: '#a5d6f0',
  dewLight: '#ffffff',
  capRed: '#ec4c3c',
  capRedShade: '#c73a2e',
  capOrange: '#f59b45',
  capOrangeShade: '#d97f30',
  capTan: '#d9a46a',
  capTanShade: '#bf8a52',
  capDot: '#fff6ea',
  mushStem: '#f7eedb',
  mushStemShade: '#e2d3b5',
  gill: '#e8d2b4',
  mushGlow: '#7ff5dc',
  sand: '#ddb070',
  sandDark: '#c08f52',
  sandLight: '#efcd94',
  hole: '#5c3b22',
  water: '#6cc6ee',
  waterDeep: '#4aa8dc',
  waterLight: '#c6f0ff',
  waterRim: '#a07650',
  shine: '#ffffff',
  reflect: '#fff1c0',
  bigLeaf: '#8fd458',
  bigLeafDark: '#76bf46',
  bigLeafVein: '#c4f09a',
};

const night: Palette = {
  skyTop: '#0a1240',
  skyMid: '#1c2a6e',
  skyBottom: '#3a4c94',
  sunGlow: '#c8d6ff',
  beam: '#d6e2ff',
  bokeh: '#8fb0f0',
  bokeh2: '#d8f09a',
  sun: '#fff1c0',
  sunRay: '#ffe9a8',
  face: '#7a5a34',
  star: '#fff6d6',
  fly: '#f6ffc0',
  flyGlow: '#e9ff9a',
  haze: '#5d72b4',
  fluff: '#eef3ff',
  fluffLine: '#dde6ff',
  fluffGlow: '#dfe8ff',
  thread: '#e6eeff',
  threadGlow: '#bcd2ff',
  bead: '#eaf4ff',
  dew: '#b4cdf6',
  dewShade: '#7d98d6',
  dewLight: '#ffffff',
  daisyPetal: '#c9d3f8',
  daisyBack: '#a6b2e4',
  daisyCenter: '#d9c271',
  daisyCenterDark: '#b39a52',
  sunPetal: '#b9a35a',
  sunPetalBack: '#977f45',
  capRed: '#5df0d0',
  capRedShade: '#33c9ad',
  capOrange: '#8fd8ff',
  capOrangeShade: '#5fb5e6',
  capTan: '#c3a8ff',
  capTanShade: '#9d83e0',
  capDot: '#f0fffb',
  mushStem: '#b9efe3',
  mushStemShade: '#8fd2c4',
  gill: '#8fd2c4',
  mushGlow: '#7ff5dc',
  water: '#2c4b93',
  waterDeep: '#203a7c',
  waterLight: '#7f9fe2',
  shine: '#dfe9ff',
  reflect: '#fff1c0',
};

const interactives: Interactive[] = [
  {
    id: 'sun',
    box: [SUN[0] - 280, SUN[1] - 280, 560, 560],
    kind: 'spin',
    origin: SUN,
    effect: 'sparkle',
    sound: 'shine',
    night: { kind: 'rock', effect: 'stars', sound: 'twinkle' },
    render: (p, mode) =>
      mode === 'day'
        ? sunWithSpinningRays(SUN[0], SUN[1], 100, p)
        : moon(SUN[0], SUN[1], 96, p.sun, p.sunRay, p.face),
  },
  {
    id: 'web',
    box: [1820, 50, 940, 1635],
    kind: 'shake',
    origin: [2210, 1560],
    effect: 'sparkle',
    effectAt: HUB,
    sound: 'twinkle',
    render: standing('web'),
  },
  {
    id: 'dandelion',
    box: [1080, 170, 705, 1520],
    kind: 'shake',
    origin: [DANDELION[0], DANDELION[1]],
    effect: 'sparkle',
    effectAt: CLOCK,
    sound: 'whoosh',
    render: standing('dandelion'),
  },
  {
    id: 'sunflower',
    box: [145, 145, 735, 1670],
    kind: 'sway',
    origin: [SUNFLOWER[0], SUNFLOWER[1]],
    effect: 'petals',
    effectAt: SUN_HEAD,
    sound: 'rustle',
    render: standing('sunflower'),
  },
  {
    id: 'daisy',
    box: [2900, 595, 612, 1105],
    kind: 'bounce',
    origin: [DAISY[0], DAISY[1]],
    effect: 'petals',
    effectAt: DAISY_HEAD,
    sound: 'pop',
    render: standing('daisy'),
  },
  {
    id: 'mushrooms',
    box: [670, 1200, 550, 515],
    kind: 'bounce',
    origin: [MUSH[0], MUSH[1] + 20],
    effect: 'sparkle',
    sound: 'boing',
    night: { kind: 'glow', effect: 'sparkle', sound: 'twinkle' },
    render: standing('mushrooms'),
  },
  {
    id: 'anthill',
    box: [1280, 1390, 755, 345],
    kind: 'wiggle',
    origin: [ANTHILL[0], ANTHILL[1]],
    effect: 'smoke',
    effectAt: [ANTHILL[0] + 8, ANTHILL[1] - 220],
    sound: 'giggle',
    render: standing('anthill'),
  },
  {
    id: 'leaf',
    box: [2640, 1438, 862, 350],
    kind: 'sway',
    origin: [LEAF_BASE[0] - 60, LEAF_BASE[1] + 30],
    effect: 'rain',
    effectAt: [3060, 1560],
    sound: 'rustle',
    render: standing('leaf'),
  },
  {
    id: 'puddle',
    box: [1802, 1705, 918, 256],
    kind: 'pulse',
    origin: PUDDLE,
    effect: 'splash',
    effectAt: [PUDDLE[0], PUDDLE[1] - 10],
    sound: 'splash',
    render: standing('puddle'),
  },
];

const bugs: SceneDef = {
  id: 'bugs',
  world: [W, H],
  horizon: 560,
  stickerScale: 2.6,
  groundTop: 1200,
  ambient: { fireflies: 30, sparkles: 14, leaves: 6 },
  defaults: [
    { animal: 'bee', x: 890, y: 330, scale: 2.8, flip: true },
    { animal: 'butterfly', x: 1010, y: 830, scale: 2.6 },
    { animal: 'moth', x: 2640, y: 640, scale: 2.6, flip: true },
    { animal: 'dragonfly', x: 2250, y: 1470, scale: 2.6, flip: true },
    { animal: 'firefly', x: 1160, y: 1190, scale: 2.8 },
    { animal: 'spider', x: HUB[0], y: HUB[1] + 10, scale: 2.5 },
    { animal: 'snail', x: 170, y: 1220, scale: 2.6 },
    { animal: 'praying-mantis', x: 610, y: 1196, scale: 2.6 },
    { animal: 'grasshopper', x: 2650, y: 1500, scale: 2.6 },
    { animal: 'ant', x: 1530, y: 1392, scale: 2.6 },
    { animal: 'earthworm', x: 660, y: 1745, scale: 2.6, flip: true },
    { animal: 'stag-beetle', x: 1250, y: 1735, scale: 2.6 },
    { animal: 'ladybug', x: 2950, y: 1596, scale: 2.8 },
    { animal: 'caterpillar', x: 3260, y: 1566, scale: 2.6, flip: true },
  ],
  day,
  night,
  interactives,
  back: (p, mode) => {
    const isNight = mode === 'night';
    let out =
      `<defs>${linearGradient('bgSky', [
        [0, p.skyTop],
        [0.36, p.skyMid],
        [0.66, p.skyBottom],
      ])}${radialGlow('bgSunGlow', p.sunGlow, isNight ? 0.3 : 0.45)}${radialGlow('bgFly', p.flyGlow, 0.7)}${linearGradient(
        'bgHaze',
        [
          [0, p.haze, 0],
          [0.55, p.haze, 0.85],
          [1, p.haze, 0],
        ],
      )}<linearGradient id="bgSoil" gradientUnits="userSpaceOnUse" x1="0" y1="1390" x2="0" y2="2000"><stop offset="0" stop-color="${p.soilTop}"/><stop offset="1" stop-color="${p.soilDeep}"/></linearGradient></defs>` +
      `<rect width="${W}" height="${H}" fill="url(#bgSky)"/>` +
      glowAt(SUN[0], SUN[1], 1100, 'bgSunGlow');
    if (isNight) {
      out += starField(7, 130, 30, 20, W - 30, 1000, p.star);
      out += [
        [380, 140, 22],
        [1620, 90, 18],
        [2420, 200, 16],
        [3380, 420, 20],
        [1050, 520, 14],
      ]
        .map(([x, y, s]) => glint(x, y, s, p.star))
        .join('');
    } else {
      out += cloud(1760, 180, 1.2, p.cloud, p.cloudShade);
      out += cloud(3420, 110, 0.85, p.cloud, p.cloudShade);
      out += cloud(160, 100, 0.75, p.cloud, p.cloudShade);
    }
    out += bokeh(isNight ? 47 : 43, 26, p, isNight ? 0.6 : 1);
    out += bladeField(11, 46, farGroundY, 380, 900, 30, 54, p.grassFar);
    out += path(roundRect(-100, 1000, W + 200, 360, 0), 'url(#bgHaze)');
    out += farDetails(p);
    out += bladeField(19, 28, farGroundY, 560, 1080, 46, 76, p.grassFar2, p.grassFar2Dark);
    out += beams(p, isNight);
    out += path(land(farGroundY), p.groundFar);
    out += midBlades(p);
    out += path(land(groundY), 'url(#bgSoil)');
    out += mossEdge(p);
    out += soilTexture(p);
    out += layered([
      [LOG.bottom, fallenLog(p)],
      [2060, nearBlades(p)],
      ...undergrowthOf(p, mode, ''),
    ]);
    if (isNight) out += staticFireflies(71, 16, p);
    return out;
  },
  front: (p) =>
    tallGrass(90, 2014, 1.5, p.grass, p.grassDark) +
    clover(250, 2000, 1.4, 10, p) +
    tallGrass(1180, 2014, 1.3, p.grass, p.grassDark) +
    pebble(1320, 2010, 70, 40, 21, p) +
    clover(2030, 2002, 1.3, 50, p) +
    tallGrass(2780, 2014, 1.4, p.grass, p.grassDark) +
    dew(2850, 1978, 16, p) +
    glint(2866, 1960, 16, p.dewLight) +
    clover(3330, 2000, 1.4, 80, p) +
    tallGrass(3510, 2014, 1.5, p.grass, p.grassDark),
};

export default bugs;
