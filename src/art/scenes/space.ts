import {
  capsule,
  circle,
  ellipse,
  f,
  roundRect,
  smooth,
  spiky,
  tube,
  type Pt,
} from '../core/paths';
import { group, path, stroke } from './props';
import { range, rng } from './rng';
import type { Interactive, Mode, Palette, Placement, SceneDef } from './types';

const W = 3600;
const H = 2000;
const SX = 360;
const SY = 1000;
const BELT = 1340;
const GALAXY: Pt = [2450, 330];
const GALAXY_R = 210;
const NEBULA: Pt = [700, 320];
const SHOOT: [number, number, number, number] = [1960, 300, 1560, 110];
const CLUSTER: Pt = [3180, 260];
const STATION: Pt = [1050, 1700];
const ROCK: Pt = [1520, 1700];
const SAT: Pt = [2960, 1720];

type Stop = [number, string, number?];
type Tone = { body: string; shade: string; light: string; crater: string };

const ORBITS: [string, number, number][] = [
  ['mercury', 365, -38],
  ['venus', 575, 28],
  ['earth', 820, -16],
  ['mars', 1065, 20],
  ['jupiter', 1650, -10],
  ['saturn', 2120, 12],
  ['uranus', 2540, -9],
  ['neptune', 2880, 8],
  ['pluto', 3130, -6],
];

const onOrbit = (r: number, deg: number): Pt => [
  Math.round(SX + Math.cos((deg * Math.PI) / 180) * r),
  Math.round(SY + Math.sin((deg * Math.PI) / 180) * r),
];

const stops = (list: Stop[]): string =>
  list
    .map(
      ([o, c, a]) =>
        `<stop offset="${o}" stop-color="${c}"${a === undefined ? '' : ` stop-opacity="${a}"`}/>`,
    )
    .join('');

const op = (a: number): string => ` fill-opacity="${f(a)}"`;

function glow(
  id: string,
  x: number,
  y: number,
  rx: number,
  ry: number,
  color: string,
  a: number,
): string {
  return (
    `<defs><radialGradient id="${id}">${stops([
      [0, color, a],
      [0.45, color, a * 0.45],
      [1, color, 0],
    ])}</radialGradient></defs>` +
    `<ellipse cx="${f(x)}" cy="${f(y)}" rx="${f(rx)}" ry="${f(ry)}" fill="url(#${id})"/>`
  );
}

const sparkle = (x: number, y: number, s: number): string => spiky(x, y, s, s * 0.24, 4, 0, 0.32);

const cuteStar = (x: number, y: number, s: number, rot = -90): string =>
  spiky(x, y, s, s * 0.5, 5, rot, 0.42);

function starField(seed: number, count: number, p: Palette): string {
  const r = rng(seed);
  const colors = [p.star, p.star, p.starWarm, p.starCool, p.starPink];
  const levels = [0.4, 0.65, 0.95];
  const dots = colors.map(() => levels.map(() => ''));
  let shapes = '';
  for (let i = 0; i < count; i++) {
    const x = range(r, 0, W);
    const y = range(r, 0, H);
    const c = Math.floor(r() * colors.length);
    const roll = r();
    if (roll < 0.07) {
      shapes += path(sparkle(x, y, range(r, 8, 16)), colors[c], op(range(r, 0.75, 1)));
    } else {
      const rad = roll < 0.25 ? range(r, 3, 4.6) : range(r, 1.3, 2.8);
      dots[c][Math.floor(r() * levels.length)] += circle(x, y, rad);
    }
  }
  let out = '';
  dots.forEach((row, c) =>
    row.forEach((d, k) => {
      if (d) out += path(d, colors[c], op(levels[k]));
    }),
  );
  return out + shapes;
}

function bigStars(p: Palette, mode: Mode): string {
  const list: [number, number, number, string][] = [
    [90, 580, 20, p.starWarm],
    [1240, 120, 16, p.starPink],
    [2060, 1300, 15, p.starWarm],
    [2780, 1180, 18, p.starCool],
    [3480, 1040, 16, p.starWarm],
    [560, 1420, 17, p.starCool],
    [1820, 1880, 15, p.starPink],
    [3350, 1720, 19, p.starWarm],
    [940, 980, 13, p.starPink],
    [2300, 120, 14, p.starCool],
  ];
  return list
    .map(
      ([x, y, s, c], i) =>
        glow(`spBig${i}${mode}`, x, y, s * 3.2, s * 3.2, c, 0.35) +
        path(cuteStar(x, y, s, -90 + i * 7), c),
    )
    .join('');
}

function puffs(
  seed: number,
  cx: number,
  cy: number,
  w: number,
  h: number,
  n: number,
  r0: number,
  r1: number,
): string {
  const r = rng(seed);
  let d = '';
  for (let i = 0; i < n; i++) {
    const a = r() * Math.PI * 2;
    const k = Math.sqrt(r());
    d += circle(
      cx + Math.cos(a) * k * w,
      cy + Math.sin(a) * k * h,
      range(r, r0, r1) * (1 - 0.5 * k),
    );
  }
  return d;
}

function nebula(
  id: string,
  seed: number,
  cx: number,
  cy: number,
  w: number,
  h: number,
  colors: [string, string, string],
  a: number,
  rot = 0,
): string {
  const body =
    glow(`${id}a`, cx - w * 0.35, cy + h * 0.1, w * 0.95, h * 1.5, colors[0], a * 0.75) +
    glow(`${id}b`, cx + w * 0.4, cy - h * 0.05, w * 0.85, h * 1.4, colors[1], a * 0.6) +
    path(puffs(seed, cx, cy, w, h * 0.8, 34, h * 0.5, h * 0.75), colors[0], op(a * 0.3)) +
    path(
      puffs(seed + 1, cx - w * 0.06, cy - h * 0.06, w * 0.7, h * 0.55, 26, h * 0.38, h * 0.58),
      colors[1],
      op(a * 0.32),
    ) +
    path(
      puffs(seed + 2, cx - w * 0.1, cy - h * 0.1, w * 0.4, h * 0.32, 16, h * 0.26, h * 0.4),
      colors[2],
      op(a * 0.38),
    ) +
    glow(`${id}c`, cx - w * 0.1, cy - h * 0.1, w * 0.35, h * 0.5, colors[2], a * 0.55);
  return rot ? group(body, `rotate(${rot} ${cx} ${cy})`) : body;
}

function lump(cx: number, cy: number, rx: number, ry: number, seed: number, jitter = 0.13): string {
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

function asteroid(
  cx: number,
  cy: number,
  s: number,
  seed: number,
  c: Tone,
  craters = 3,
  squash = 0.84,
): string {
  const r = rng(seed * 13 + 5);
  const lx = cx - s * 0.08;
  const ly = cy - s * 0.1;
  let out =
    path(lump(cx, cy, s, s * squash, seed), c.shade) +
    path(lump(lx, ly, s * 0.88, s * squash * 0.86, seed), c.body);
  const placed: [number, number, number][] = [];
  for (let tries = 0; placed.length < craters && tries < 60; tries++) {
    const a = r() * Math.PI * 2;
    const k = Math.sqrt(r()) * 0.52;
    const x = lx + Math.cos(a) * s * k;
    const y = ly + Math.sin(a) * s * squash * k;
    const cr = s * range(r, 0.1, 0.2);
    if (placed.some(([px, py, pr]) => Math.hypot(px - x, py - y) < (pr + cr) * 1.2)) continue;
    placed.push([x, y, cr]);
  }
  for (const [x, y, cr] of placed) {
    out +=
      path(ellipse(x, y, cr, cr * 0.84), c.shade) +
      path(ellipse(x + cr * 0.18, y + cr * 0.16, cr * 0.8, cr * 0.66), c.crater);
  }
  return (
    out +
    path(ellipse(lx - s * 0.36, ly - s * squash * 0.4, s * 0.17, s * 0.08, -35), c.light, op(0.85))
  );
}

function tones(p: Palette): Tone[] {
  return [
    { body: p.rock, shade: p.rockShade, light: p.rockLight, crater: p.rockCrater },
    { body: p.rock2, shade: p.rock2Shade, light: p.rock2Light, crater: p.rock2Crater },
    { body: p.rock3, shade: p.rock3Shade, light: p.rock3Light, crater: p.rock3Crater },
  ];
}

function orbits(p: Palette): string {
  return ORBITS.map(
    ([, r]) =>
      `<circle cx="${SX}" cy="${SY}" r="${r}" fill="none" stroke="${p.orbit}" stroke-width="6" stroke-linecap="round" stroke-dasharray="0.5 26" stroke-opacity=".38"/>`,
  ).join('');
}

function belt(p: Palette): string {
  const r = rng(91);
  const t = tones(p);
  const items: [number, string][] = [];
  const band = (width: number, a: number) =>
    `<circle cx="${SX}" cy="${SY}" r="${BELT}" fill="none" stroke="${p.beltDust}" stroke-width="${width}" stroke-opacity="${a}"/>`;
  let dust = '';
  for (let i = 0; i < 520; i++) {
    const a = range(r, -0.92, 0.92);
    const rr = BELT + (r() + r() - 1) * 150;
    dust += circle(SX + Math.cos(a) * rr, SY + Math.sin(a) * rr, range(r, 1.8, 4.6));
  }
  for (let i = 0; i < 170; i++) {
    const a = range(r, -0.92, 0.92);
    const rr = BELT + (r() + r() - 1) * 120;
    const x = SX + Math.cos(a) * rr;
    const y = SY + Math.sin(a) * rr;
    const roll = r();
    const s = roll < 0.6 ? range(r, 7, 14) : roll < 0.9 ? range(r, 15, 26) : range(r, 28, 44);
    const tone = t[Math.floor(r() * t.length)];
    if (y < -50 || y > H + 50 || Math.hypot(x - ROCK[0], y - ROCK[1]) < 175) continue;
    items.push([s, asteroid(x, y, s, i + 7, tone, s > 24 ? 3 : s > 12 ? 2 : 1)]);
  }
  return (
    band(340, 0.035) +
    band(260, 0.035) +
    band(180, 0.04) +
    band(100, 0.045) +
    path(dust, p.rockLight, op(0.45)) +
    items
      .sort((a, b) => a[0] - b[0])
      .map(([, svg]) => svg)
      .join('')
  );
}

function ringedPlanet(cx: number, cy: number, R: number, p: Palette, mode: Mode): string {
  const id = `spFar${mode}`;
  const rot = -16;
  const rx = R * 1.9;
  const ry = R * 0.42;
  const a = (rot * Math.PI) / 180;
  const ring = (w: number, color: string, k = 1) =>
    `<ellipse cx="${cx}" cy="${cy}" rx="${f(rx * k)}" ry="${f(ry * k)}" transform="rotate(${rot} ${cx} ${cy})" fill="none" stroke="${color}" stroke-width="${w}"/>`;
  const front = (w: number, color: string, k = 1) =>
    stroke(
      `M${f(cx - Math.cos(a) * rx * k)} ${f(cy - Math.sin(a) * rx * k)}A${f(rx * k)} ${f(ry * k)} ${rot} 0 0 ${f(cx + Math.cos(a) * rx * k)} ${f(cy + Math.sin(a) * rx * k)}`,
      color,
      w,
    );
  return (
    glow(`${id}g`, cx, cy, R * 2.2, R * 2.2, p.farGlow, 0.35) +
    ring(R * 0.16, p.farRing) +
    ring(R * 0.06, p.farRingLight, 1.12) +
    `<defs><clipPath id="${id}"><path d="${circle(cx, cy, R)}"/></clipPath></defs>` +
    path(circle(cx, cy, R), p.farPlanet) +
    group(
      path(ellipse(cx, cy - R * 0.35, R * 1.2, R * 0.16, rot), p.farPlanetBand) +
        path(ellipse(cx, cy + R * 0.25, R * 1.2, R * 0.12, rot), p.farPlanetBand) +
        path(circle(cx + R * 0.42, cy + R * 0.38, R * 1.02), p.farPlanetShade),
      '',
      ` clip-path="url(#${id})"`,
    ) +
    front(R * 0.16, p.farRing) +
    front(R * 0.06, p.farRingLight, 1.12)
  );
}

function galaxy(cx: number, cy: number, R: number, p: Palette, mode: Mode): string {
  const r = rng(77);
  const gid = `spGalArm${mode}`;
  let arms = '';
  let dots = '';
  for (let k = 0; k < 2; k++) {
    const pts: Pt[] = [];
    for (let i = 0; i <= 14; i++) {
      const t = i / 14;
      const a = k * Math.PI + t * Math.PI * 1.95;
      const rr = R * (0.1 + 0.9 * t);
      pts.push([cx + Math.cos(a) * rr, cy + Math.sin(a) * rr]);
    }
    arms += path(
      tube(pts, (u) => R * (0.23 - 0.2 * u)),
      `url(#${gid})`,
      op(0.62),
    );
    arms += path(
      tube(pts.slice(0, 12), (u) => R * (0.1 - 0.075 * u)),
      p.galArmLight,
      op(0.78),
    );
    for (let j = 0; j < 18; j++) {
      const t = range(r, 0.15, 1);
      const a = k * Math.PI + t * Math.PI * 1.95;
      const rr = R * (0.1 + 0.9 * t) + range(r, -0.12, 0.12) * R;
      dots += circle(cx + Math.cos(a) * rr, cy + Math.sin(a) * rr, range(r, 2.5, 5.5));
    }
  }
  return (
    `<defs><radialGradient id="${gid}" gradientUnits="userSpaceOnUse" cx="${cx}" cy="${cy}" r="${R}">${stops(
      [
        [0, p.galCore],
        [0.3, p.galArmPink],
        [0.65, p.galArm],
        [1, p.galArmTip],
      ],
    )}</radialGradient></defs>` +
    glow(`spGalGlow${mode}`, cx, cy, R * 1.2, R * 1.2, p.galGlow, 0.55) +
    `<g data-spin="" style="transform-origin: ${cx}px ${cy}px">` +
    arms +
    path(dots, p.star, op(0.9)) +
    `</g>` +
    glow(`spGalCore${mode}`, cx, cy, R * 0.42, R * 0.42, p.galCore, 0.95) +
    path(circle(cx, cy, R * 0.11), p.galCore)
  );
}

function shootingStar(
  hx: number,
  hy: number,
  tx: number,
  ty: number,
  p: Palette,
  mode: Mode,
): string {
  const len = Math.hypot(tx - hx, ty - hy);
  const nx = -(ty - hy) / len;
  const ny = (tx - hx) / len;
  const trail: [string, number, number][] = [
    [p.trailPink, -26, 16],
    [p.trailGold, 0, 22],
    [p.trailTeal, 26, 16],
  ];
  let out = '';
  trail.forEach(([color, off, w], i) => {
    const id = `spTrail${i}${mode}`;
    const ax = hx + nx * off;
    const ay = hy + ny * off;
    const ex = tx + nx * off * 2.2;
    const ey = ty + ny * off * 2.2;
    out +=
      `<defs><linearGradient id="${id}" gradientUnits="userSpaceOnUse" x1="${f(ax)}" y1="${f(ay)}" x2="${f(ex)}" y2="${f(ey)}">${stops(
        [
          [0, color, 0.95],
          [1, color, 0],
        ],
      )}</linearGradient></defs>` +
      path(
        `M${f(ax + nx * w)} ${f(ay + ny * w)}L${f(ex)} ${f(ey)}L${f(ax - nx * w)} ${f(ay - ny * w)}A${w} ${w} 0 0 0 ${f(ax + nx * w)} ${f(ay + ny * w)}Z`,
        `url(#${id})`,
      );
  });
  const r = rng(5);
  for (let i = 0; i < 6; i++) {
    const t = range(r, 0.2, 0.85);
    const side = range(r, -60, 60);
    out += path(
      sparkle(hx + (tx - hx) * t + nx * side, hy + (ty - hy) * t + ny * side, range(r, 7, 13)),
      p.star,
      op(range(r, 0.6, 0.95)),
    );
  }
  return (
    out +
    glow(`spShootGlow${mode}`, hx, hy, 110, 110, p.trailGold, 0.6) +
    path(cuteStar(hx, hy, 50, -70), p.shootStar) +
    path(cuteStar(hx - 6, hy - 6, 22, -70), p.shootStarLight, op(0.8))
  );
}

function cluster(cx: number, cy: number, p: Palette, mode: Mode): string {
  const list: [number, number, number, string, boolean][] = [
    [0, 0, 34, p.starWarm, true],
    [-92, -40, 22, p.starCool, false],
    [78, -64, 26, p.star, false],
    [-40, 70, 20, p.starPink, false],
    [96, 48, 18, p.starWarm, true],
    [-128, 36, 14, p.star, false],
    [30, -118, 14, p.starPink, false],
    [150, -10, 12, p.starCool, false],
  ];
  const r = rng(29);
  let dust = '';
  for (let i = 0; i < 26; i++) {
    const a = r() * Math.PI * 2;
    const k = Math.sqrt(r());
    dust += circle(cx + Math.cos(a) * k * 170, cy + Math.sin(a) * k * 130, range(r, 2, 4.2));
  }
  let out =
    glow(`spCluster${mode}`, cx, cy, 230, 190, p.clusterGlow, mode === 'night' ? 0.6 : 0.45) +
    path(dust, p.star, op(0.85));
  list.forEach(([dx, dy, s, c, five], i) => {
    const x = cx + dx;
    const y = cy + dy;
    out += glow(`spCl${i}${mode}`, x, y, s * 2.6, s * 2.6, c, 0.55);
    out += path(five ? cuteStar(x, y, s, -90 + i * 9) : sparkle(x, y, s * 1.25), c);
  });
  return out;
}

function solarPanel(px: number, py: number, w: number, h: number, p: Palette): string {
  let out = path(roundRect(px, py, w, h, 6), p.panelEdge);
  out += path(roundRect(px + 4, py + 4, w - 8, h - 8, 4), p.panel);
  for (let i = 1; i < 3; i++) {
    const gx = px + 4 + ((w - 8) * i) / 3;
    out += stroke(`M${f(gx)} ${f(py + 5)}V${f(py + h - 5)}`, p.panelLine, 2.5);
  }
  out += stroke(`M${f(px + 5)} ${f(py + h / 2)}H${f(px + w - 5)}`, p.panelLine, 2.5);
  return (
    out +
    path(
      `M${f(px + w * 0.18)} ${f(py + h - 6)}L${f(px + w * 0.45)} ${f(py + 6)}L${f(px + w * 0.58)} ${f(py + 6)}L${f(px + w * 0.31)} ${f(py + h - 6)}Z`,
      '#ffffff',
      op(0.2),
    )
  );
}

function station(x: number, y: number, p: Palette, mode: Mode): string {
  let truss = path(roundRect(-182, -8, 364, 16, 8), p.truss);
  for (let i = -170; i < 170; i += 22) {
    truss += stroke(`M${i} 6L${i + 11} -6L${i + 22} 6`, p.trussDark, 2.5);
  }
  const windows = [-40, 0, 40]
    .map(
      (wx) =>
        path(circle(wx, -2, 12), p.hullRim) +
        path(circle(wx, -2, 8.5), p.window) +
        path(circle(wx - 3, -5, 2.6), '#ffffff', op(0.8)),
    )
    .join('');
  const lit = mode === 'night' ? glow(`spStationLit${mode}`, 0, -2, 120, 60, p.window, 0.45) : '';
  const body =
    truss +
    solarPanel(-184, -72, 70, 58, p) +
    solarPanel(-184, 14, 70, 58, p) +
    solarPanel(114, -72, 70, 58, p) +
    solarPanel(114, 14, 70, 58, p) +
    stroke('M-149 -14V-8M-149 8V14M149 -14V-8M149 8V14', p.trussDark, 5) +
    path(capsule(-78, 2, 78, 2, 36), p.hullShade) +
    path(capsule(-78, -2, 78, -2, 33), p.hull) +
    path(roundRect(-66, -35, 14, 66, 6), p.band) +
    path(roundRect(52, -35, 14, 66, 6), p.band) +
    path(roundRect(-12, -66, 24, 30, 8), p.hullShade) +
    path(circle(0, -70, 20), p.hull) +
    path(circle(0, -70, 9), p.window) +
    stroke('M0 -90V-118', p.trussDark, 4) +
    glow(`spStationLight${mode}`, 0, -122, 26, 26, p.beacon, 0.8) +
    path(circle(0, -122, 7), p.beacon) +
    lit +
    windows +
    path(ellipse(-44, -24, 26, 6, -4), '#ffffff', op(0.45));
  return group(body, `translate(${x} ${y}) rotate(-8)`);
}

function satellite(x: number, y: number, p: Palette, mode: Mode): string {
  const ux = Math.SQRT1_2;
  const uy = -Math.SQRT1_2;
  const dx = 18;
  const dy = -66;
  const kx = dx + ux * 40;
  const ky = dy + uy * 40;
  const waves = [22, 38, 54]
    .map((rr) => {
      const a0 = -Math.PI / 4 - 0.7;
      const a1 = -Math.PI / 4 + 0.7;
      return stroke(
        `M${f(kx + rr * Math.cos(a0))} ${f(ky + rr * Math.sin(a0))}A${rr} ${rr} 0 0 1 ${f(kx + rr * Math.cos(a1))} ${f(ky + rr * Math.sin(a1))}`,
        p.signal,
        5,
        ' stroke-opacity=".8"',
      );
    })
    .join('');
  const body =
    stroke('M-104 0H104', p.trussDark, 7) +
    solarPanel(-186, -28, 88, 56, p) +
    solarPanel(98, -28, 88, 56, p) +
    stroke(`M6 -34L${f(dx - ux * 8)} ${f(dy - uy * 8)}`, p.trussDark, 7) +
    path(roundRect(-38, -34, 76, 70, 16), p.goldDark) +
    path(roundRect(-38, -38, 76, 68, 16), p.gold) +
    stroke('M-38 -4H38M0 -38V30', p.goldDark, 3) +
    path(ellipse(-20, -24, 10, 5, -20), '#ffffff', op(0.55)) +
    path(ellipse(dx - ux * 9, dy - uy * 9, 38, 20, 45), p.hullShade) +
    path(ellipse(dx, dy, 38, 14, 45), p.hull) +
    path(ellipse(dx + ux * 2, dy + uy * 2, 28, 8, 45), p.hullShade) +
    stroke(`M${dx} ${dy}L${f(kx)} ${f(ky)}`, p.trussDark, 4) +
    (mode === 'night' ? glow(`spSatGlow${mode}`, kx, ky, 34, 34, p.beacon, 0.75) : '') +
    path(circle(kx, ky, 7), p.beacon) +
    waves;
  return group(body, `translate(${x} ${y}) rotate(-12)`);
}

function bigAsteroid(cx: number, cy: number, p: Palette): string {
  const t = tones(p)[1];
  const s = 128;
  const top = cy - s * 0.66;
  return group(
    asteroid(cx, cy, s, 410, t, 5, 0.72) +
      stroke(
        `M${f(cx - s * 0.62)} ${f(cy - s * 0.18)}Q${f(cx - s * 0.5)} ${f(cy - s * 0.55)} ${f(cx - s * 0.12)} ${f(cy - s * 0.66)}`,
        t.light,
        7,
        ' stroke-opacity=".75"',
      ) +
      stroke(`M${cx + 24} ${f(top + 14)}L${cx + 30} ${f(top - 92)}`, p.trussDark, 6) +
      path(
        `M${cx + 30} ${f(top - 92)}Q${cx + 66} ${f(top - 102)} ${cx + 102} ${f(top - 82)}Q${cx + 68} ${f(top - 66)} ${cx + 32} ${f(top - 54)}Z`,
        p.flag,
      ) +
      path(cuteStar(cx + 60, top - 78, 11, -80), p.flagStar) +
      path(circle(cx + 30, top - 94, 6.5), p.gold),
    `rotate(-12 ${cx} ${cy})`,
  );
}

function bigNebula(cx: number, cy: number, p: Palette, mode: Mode): string {
  const r = rng(12);
  let twinkles = '';
  for (let i = 0; i < 9; i++) {
    twinkles += path(
      sparkle(cx + range(r, -230, 230), cy + range(r, -110, 110), range(r, 8, 16)),
      p.star,
      op(range(r, 0.7, 1)),
    );
  }
  return (
    nebula(`spNebB${mode}`, 47, cx + 140, cy + 30, 160, 90, [p.nebV1, p.nebT1, p.nebV2], 1.4, -8) +
    nebula(`spNeb${mode}`, 31, cx - 30, cy, 240, 120, [p.neb1, p.nebV1, p.neb3], 1.7, -6) +
    twinkles
  );
}

function backdrop(p: Palette, mode: Mode): string {
  const washes: [number, number, number, number, string, number][] = [
    [560, 420, 1100, 760, p.washTeal, 0.42],
    [1900, 1000, 1500, 900, p.washViolet, 0.4],
    [3150, 1550, 1200, 800, p.washPink, 0.4],
    [3200, 300, 1000, 650, p.washBlue, 0.38],
    [700, 1750, 1100, 600, p.washPink, 0.3],
  ];
  return (
    `<defs><linearGradient id="spSky${mode}" x1="0" y1="0" x2="0.35" y2="1">${stops([
      [0, p.skyTop],
      [0.55, p.skyMid],
      [1, p.skyBottom],
    ])}</linearGradient></defs>` +
    `<rect width="${W}" height="${H}" fill="url(#spSky${mode})"/>` +
    washes
      .map(([x, y, rx, ry, c, a], i) => glow(`spWash${i}${mode}`, x, y, rx, ry, c, a))
      .join('') +
    `<defs><radialGradient id="spSunGlow${mode}">${stops([
      [0, p.sunGlow, 0.85],
      [0.45, p.sunGlow, 0.45],
      [0.72, p.sunGlow, 0.12],
      [1, p.sunGlow, 0],
    ])}</radialGradient></defs>` +
    `<circle cx="${SX}" cy="${SY}" r="500" fill="url(#spSunGlow${mode})"/>`
  );
}

const interactives: Interactive[] = [
  {
    id: 'galaxy',
    box: [GALAXY[0] - 260, GALAXY[1] - 260, 520, 520],
    kind: 'spin',
    effect: 'stars',
    sound: 'twinkle',
    render: (p, mode) => galaxy(GALAXY[0], GALAXY[1], GALAXY_R, p, mode),
  },
  {
    id: 'nebula',
    box: [NEBULA[0] - 354, NEBULA[1] - 200, 708, 416],
    kind: 'glow',
    effect: 'sparkle',
    sound: 'shine',
    night: { effect: 'stars', sound: 'twinkle' },
    render: (p, mode) => bigNebula(NEBULA[0], NEBULA[1], p, mode),
  },
  {
    id: 'shooting-star',
    box: [SHOOT[2] - 28, SHOOT[3] - 64, SHOOT[0] - SHOOT[2] + 152, SHOOT[1] - SHOOT[3] + 188],
    kind: 'pulse',
    effect: 'stars',
    sound: 'swoosh',
    effectAt: [SHOOT[0], SHOOT[1]],
    render: (p, mode) => shootingStar(SHOOT[0], SHOOT[1], SHOOT[2], SHOOT[3], p, mode),
  },
  {
    id: 'star-cluster',
    box: [CLUSTER[0] - 238, CLUSTER[1] - 200, 476, 400],
    kind: 'pulse',
    effect: 'stars',
    sound: 'sparkle',
    render: (p, mode) => cluster(CLUSTER[0], CLUSTER[1], p, mode),
  },
  {
    id: 'space-station',
    box: [STATION[0] - 212, STATION[1] - 166, 424, 282],
    kind: 'rock',
    origin: STATION,
    effect: 'sparkle',
    sound: 'whirr',
    render: (p, mode) => station(STATION[0], STATION[1], p, mode),
  },
  {
    id: 'asteroid',
    box: [ROCK[0] - 152, ROCK[1] - 210, 294, 328],
    kind: 'wiggle',
    origin: ROCK,
    effect: 'smoke',
    sound: 'thump',
    render: (p) => bigAsteroid(ROCK[0], ROCK[1], p),
  },
  {
    id: 'satellite',
    box: [SAT[0] - 208, SAT[1] - 180, 416, 266],
    kind: 'wiggle',
    origin: SAT,
    effect: 'notes',
    effectAt: [SAT[0] + 26, SAT[1] - 102],
    sound: 'chime',
    render: (p, mode) => satellite(SAT[0], SAT[1], p, mode),
  },
];

const planets: Placement[] = ORBITS.map(([animal, r, deg], i) => {
  const [x, y] = onOrbit(r, deg);
  return { animal, x, y, flip: i % 2 === 1 };
});

const earth = planets.find((pl) => pl.animal === 'earth') ?? planets[0];

const space: SceneDef = {
  id: 'space',
  world: [W, H],
  horizon: 1000,
  ambient: { twinkles: 40, meteors: 4, sparkles: 14, stars: 24 },
  defaults: [
    { animal: 'sun', x: SX, y: SY, scale: 1.3 },
    ...planets,
    { animal: 'moon', x: earth.x + 150, y: earth.y - 130, scale: 0.75 },
    { animal: 'rocket', x: 640, y: 1640 },
    { animal: 'astronaut', x: 2010, y: 1200 },
    { animal: 'ufo', x: 2660, y: 960, flip: true },
    { animal: 'comet', x: 3340, y: 1080, flip: true },
  ],
  day: {
    skyTop: '#232b7e',
    skyMid: '#3b3596',
    skyBottom: '#5a3c9e',
    washTeal: '#47c9e5',
    washPink: '#ff78c4',
    washViolet: '#9b6bff',
    washBlue: '#4f8dff',
    sunGlow: '#fff2cf',
    neb1: '#ff9fd8',
    neb2: '#ffc2e6',
    neb3: '#ffe9f6',
    nebV1: '#b79bff',
    nebV2: '#d8c8ff',
    nebT1: '#7ee6f0',
    nebT2: '#b4f3f5',
    star: '#fffaf0',
    starWarm: '#ffe9a8',
    starCool: '#cfe6ff',
    starPink: '#ffd1ee',
    orbit: '#d6ceff',
    rock: '#a397c8',
    rockShade: '#7f72ad',
    rockLight: '#cfc5ee',
    rockCrater: '#9184bd',
    rock2: '#bb9fbe',
    rock2Shade: '#937899',
    rock2Light: '#e2cde4',
    rock2Crater: '#a98bad',
    rock3: '#93a6cf',
    rock3Shade: '#6f80ad',
    rock3Light: '#c5d3f0',
    rock3Crater: '#8395c2',
    beltDust: '#d9cfff',
    galGlow: '#a77cff',
    galArmPink: '#ffa6dc',
    galArm: '#c6a8ff',
    galArmTip: '#8fe3f2',
    galArmLight: '#ffe1f6',
    galCore: '#fff6dc',
    farGlow: '#8f7bff',
    farPlanet: '#7a68c4',
    farPlanetBand: '#8a79d0',
    farPlanetShade: '#6553ad',
    farRing: '#a596e6',
    farRingLight: '#c3b8f2',
    trailPink: '#ff9fd8',
    trailGold: '#ffe08a',
    trailTeal: '#8ff0ea',
    shootStar: '#ffd54f',
    shootStarLight: '#fff4c2',
    clusterGlow: '#9fd4ff',
    hull: '#f4f1ff',
    hullShade: '#c8c1e8',
    hullRim: '#9c95c6',
    band: '#ff8a96',
    panel: '#3f63c9',
    panelEdge: '#2c4a9e',
    panelLine: '#86a8f5',
    truss: '#b4aed6',
    trussDark: '#8a83b5',
    window: '#ffd66b',
    beacon: '#ff6b7a',
    gold: '#ffc95c',
    goldDark: '#e0a03a',
    signal: '#bff4ff',
    flag: '#ff8fb8',
    flagStar: '#fff4c2',
  },
  night: {
    skyTop: '#080a24',
    skyMid: '#12133c',
    skyBottom: '#22184e',
    washTeal: '#1e5f86',
    washPink: '#7a3b8f',
    washViolet: '#4c3a9e',
    washBlue: '#22408a',
    sunGlow: '#ffdf9e',
    neb1: '#8d5cc4',
    neb2: '#b089d8',
    neb3: '#d9c2f0',
    nebV1: '#5a4fb5',
    nebV2: '#8478cf',
    nebT1: '#2f78a8',
    nebT2: '#5fa8cc',
    star: '#fffaf0',
    starWarm: '#ffefb8',
    starCool: '#d8ecff',
    starPink: '#ffd9f2',
    orbit: '#8e86d6',
    beltDust: '#8f86d6',
    rock: '#57519a',
    rockShade: '#3d3876',
    rockLight: '#7d77ba',
    rockCrater: '#4b4588',
    rock2: '#66508f',
    rock2Shade: '#493a72',
    rock2Light: '#9079b5',
    rock2Crater: '#5a4682',
    rock3: '#4b609f',
    rock3Shade: '#35477e',
    rock3Light: '#7489c4',
    rock3Crater: '#425591',
    hull: '#cfcbee',
    hullShade: '#9b96c8',
    hullRim: '#716ca4',
    gold: '#d8b25e',
    goldDark: '#a88540',
    flag: '#e07aa6',
    flagStar: '#ffe9a8',
    galCore: '#fff2d0',
    galArmLight: '#f3c8ff',
    trailGold: '#ffe08a',
    trailPink: '#ff9fd8',
    trailTeal: '#8ff0ea',
    shootStar: '#ffd54f',
    shootStarLight: '#fff4c2',
    clusterGlow: '#7fb8ff',
    window: '#ffd66b',
    beacon: '#ff6b7a',
    signal: '#9fdcff',
  },
  back: (p, mode) => {
    const k = mode === 'day' ? 1 : 0.8;
    return (
      backdrop(p, mode) +
      nebula(`spNebL${mode}`, 3, 2150, 1720, 380, 120, [p.nebT1, p.nebV1, p.nebT2], 0.9 * k, -6) +
      nebula(`spNebR${mode}`, 9, 3330, 960, 280, 140, [p.nebV1, p.neb1, p.nebV2], 0.9 * k, -28) +
      nebula(`spNebS${mode}`, 15, 230, 1500, 230, 120, [p.neb1, p.nebV1, p.neb2], 0.85 * k, 18) +
      nebula(`spNebM${mode}`, 21, 1500, 560, 260, 110, [p.nebT1, p.nebV1, p.nebT2], 0.6 * k, -20) +
      starField(mode === 'day' ? 4 : 8, mode === 'day' ? 520 : 950, p) +
      orbits(p) +
      ringedPlanet(200, 210, 74, p, mode) +
      belt(p) +
      bigStars(p, mode)
    );
  },
  front: (p) => {
    const t = tones(p);
    return (
      asteroid(200, 1985, 92, 211, t[0], 3) +
      asteroid(350, 1960, 34, 212, t[1], 1) +
      asteroid(1330, 2000, 70, 213, t[2], 2) +
      asteroid(2380, 1990, 80, 214, t[1], 3) +
      asteroid(2520, 1975, 30, 215, t[0], 1) +
      asteroid(3560, 1960, 60, 216, t[2], 2)
    );
  },
  interactives,
};

export default space;
