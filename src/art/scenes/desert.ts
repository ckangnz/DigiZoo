import { mix } from '../core/color';
import { capsule, circle, curve, ellipse, f, leaf, scallop, smooth, type Pt } from '../core/paths';
import {
  barrelCactus,
  bush,
  cactus,
  flower,
  grassTuft,
  group,
  hills,
  layered,
  linearGradient,
  moon,
  palm,
  path,
  pond,
  radialGlow,
  rock,
  starField,
  stroke,
  sun,
} from './props';
import { nightColor } from './render';
import { range, rng } from './rng';
import type { Mode, Palette, SceneDef } from './types';

const W = 3600;
const H = 2000;

function skyBand(p: Palette): string {
  return (
    `<defs>${linearGradient('desertSky', [
      [0, p.skyTop],
      [0.26, p.skyMid],
      [0.5, p.skyBottom],
    ])}</defs>` + `<rect width="${W}" height="${H}" fill="url(#desertSky)"/>`
  );
}

function milkyWay(): string {
  return (
    `<defs>${radialGlow('milky', '#e2ccff', 0.3)}</defs>` +
    group(
      `<ellipse cx="1500" cy="430" rx="1800" ry="190" fill="url(#milky)"/>` +
        starField(23, 110, -300, 340, 3300, 520, '#fff6e6'),
      'rotate(-12 1500 430)',
    )
  );
}

function cliff(
  id: string,
  x: number,
  baseY: number,
  w: number,
  h: number,
  color: string,
  shade: string,
  stripe: string,
): string {
  const top = baseY - h;
  const t = Math.min(h * 0.38, w * 0.4);
  const l = x - w / 2;
  const rr = x + w / 2;
  const c = Math.min(28, w * 0.12);
  const foot = baseY - h * 0.32;
  const body =
    `M${f(l - t)} ${f(baseY + 24)}` +
    `C${f(l - t * 0.45)} ${f(baseY + 10)} ${f(l - 6)} ${f(baseY - h * 0.1)} ${f(l)} ${f(foot)}` +
    `L${f(l + 10)} ${f(top + c)}Q${f(l + 10)} ${f(top)} ${f(l + 10 + c)} ${f(top)}` +
    `L${f(rr - 10 - c)} ${f(top)}Q${f(rr - 10)} ${f(top)} ${f(rr - 10)} ${f(top + c)}` +
    `L${f(rr)} ${f(foot)}C${f(rr + 6)} ${f(baseY - h * 0.1)} ${f(rr + t * 0.45)} ${f(baseY + 10)} ${f(rr + t)} ${f(baseY + 24)}Z`;
  const band = (y0: number, hh: number, op: string) =>
    path(
      `M${f(l - t - 10)} ${f(y0)}H${f(rr + t + 10)}V${f(y0 + hh)}H${f(l - t - 10)}Z`,
      stripe,
      ` opacity="${op}"`,
    );
  const sx = x + w * 0.2;
  const shadeD = `M${f(sx)} ${f(top - 10)}C${f(sx + w * 0.08)} ${f(top + h * 0.3)} ${f(sx - w * 0.06)} ${f(top + h * 0.6)} ${f(sx + w * 0.06)} ${f(baseY + 30)}L${f(rr + t + 10)} ${f(baseY + 30)}L${f(rr + t + 10)} ${f(top - 10)}Z`;
  return (
    `<defs><clipPath id="${id}"><path d="${body}"/></clipPath></defs>` +
    path(body, color) +
    group(
      band(top, h * 0.07, '.85') +
        path(
          `M${f(l - t - 10)} ${f(top + h * 0.07)}H${f(rr + t + 10)}V${f(top + h * 0.095)}H${f(l - t - 10)}Z`,
          shade,
          ' opacity=".45"',
        ) +
        band(top + h * 0.27, h * 0.06, '.6') +
        band(top + h * 0.48, h * 0.05, '.5') +
        path(shadeD, shade, ' opacity=".55"'),
      '',
      ` clip-path="url(#${id})"`,
    )
  );
}

function arch(
  x: number,
  baseY: number,
  w: number,
  h: number,
  color: string,
  shade: string,
  stripe: string,
): string {
  const outer =
    smooth(
      [
        [x - w / 2 - 40, baseY + 14],
        [x - w / 2 + 6, baseY - h * 0.5],
        [x - w * 0.32, baseY - h * 0.95],
        [x, baseY - h],
        [x + w * 0.3, baseY - h * 0.94],
        [x + w / 2 - 6, baseY - h * 0.5],
        [x + w / 2 + 40, baseY + 14],
      ],
      false,
    ) + 'Z';
  const iw = w * 0.26;
  const ih = h * 0.36;
  const hole = `M${f(x - iw)} ${f(baseY + 16)}L${f(x - iw)} ${f(baseY - h * 0.36)}A${f(iw)} ${f(ih)} 0 0 1 ${f(x + iw)} ${f(baseY - h * 0.36)}L${f(x + iw)} ${f(baseY + 16)}Z`;
  const id = `arch${Math.round(x)}`;
  return (
    `<defs><clipPath id="${id}"><path d="${outer}${hole}" clip-rule="evenodd"/></clipPath></defs>` +
    path(outer + hole, color, ' fill-rule="evenodd"') +
    group(
      path(
        `M${f(x - w)} ${f(baseY - h)}h${f(w * 2)}v${f(h * 0.08)}h${f(-w * 2)}Z`,
        stripe,
        ' opacity=".8"',
      ) +
        path(
          `M${f(x - w)} ${f(baseY - h * 0.74)}h${f(w * 2)}v${f(h * 0.06)}h${f(-w * 2)}Z`,
          stripe,
          ' opacity=".6"',
        ) +
        path(
          `M${f(x + iw * 0.6)} ${f(baseY - h - 10)}C${f(x + w * 0.3)} ${f(baseY - h * 0.6)} ${f(x + w * 0.2)} ${f(baseY - h * 0.3)} ${f(x + w * 0.34)} ${f(baseY + 20)}L${f(x + w)} ${f(baseY + 20)}L${f(x + w)} ${f(baseY - h - 10)}Z`,
          shade,
          ' opacity=".55"',
        ),
      '',
      ` clip-path="url(#${id})"`,
    )
  );
}

function dune(
  id: string,
  x: number,
  baseY: number,
  w: number,
  h: number,
  lean: number,
  light: string,
  shade: string,
  ripple: string,
): string {
  const crest: Pt = [x + lean, baseY - h];
  const body =
    smooth(
      [
        [x - w / 2, baseY + 40],
        [x - w * 0.32, baseY - h * 0.28],
        [x - w * 0.12 + lean * 0.6, baseY - h * 0.82],
        crest,
        [x + w * 0.16 + lean * 0.4, baseY - h * 0.78],
        [x + w * 0.34, baseY - h * 0.24],
        [x + w / 2, baseY + 40],
      ],
      false,
    ) + 'Z';
  const shadeD =
    smooth(
      [
        [crest[0] - 4, crest[1] - 20],
        [crest[0] + w * 0.03, baseY - h * 0.62],
        [crest[0] - w * 0.02, baseY - h * 0.3],
        [crest[0] + w * 0.06, baseY + 50],
      ],
      false,
    ) + `L${f(x + w)} ${f(baseY + 50)}L${f(x + w)} ${f(crest[1] - 40)}Z`;
  let ripples = '';
  for (let i = 0; i < 4; i++) {
    const k = 0.3 + i * 0.16;
    const rx = x - w * 0.2 + lean * 0.3 - i * w * 0.02;
    const ry = baseY - h * (1 - k);
    const len = w * (0.12 + k * 0.1);
    ripples += stroke(
      curve(rx - len / 2, ry + len * 0.05, rx + len / 2, ry - len * 0.02, -len * 0.08),
      ripple,
      7,
      ' stroke-opacity=".45"',
    );
  }
  return (
    `<defs><clipPath id="${id}"><path d="${body}"/></clipPath></defs>` +
    path(body, light) +
    group(path(shadeD, shade) + ripples, '', ` clip-path="url(#${id})"`)
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

function sandRipples(x: number, y: number, s: number, color: string): string {
  let out = '';
  for (let i = 0; i < 3; i++) {
    const len = (150 - i * 34) * s;
    const cx = x + i * 16 * s;
    const cy = y + i * 20 * s;
    out += stroke(
      curve(cx - len / 2, cy, cx + len / 2, cy, -len * 0.09),
      color,
      6 * s,
      ' stroke-opacity=".5"',
    );
  }
  return out;
}

function tumbleweed(x: number, y: number, s: number, color: string, dark: string): string {
  const r = 58 * s;
  const cy = y - r;
  let out =
    stroke(
      curve(x - r * 2.4, y - 4, x - r * 1.4, y - 6, -5),
      dark,
      6 * s,
      ' stroke-opacity=".35"',
    ) +
    stroke(
      curve(x - r * 2.7, y - r * 0.8, x - r * 1.6, y - r * 0.84, -6),
      dark,
      6 * s,
      ' stroke-opacity=".28"',
    ) +
    path(circle(x, cy, r), dark, ' opacity=".3"');
  for (let i = 0; i < 8; i++) {
    out += stroke(
      ellipse(x, cy, r * (0.94 - (i % 3) * 0.1), r * (0.34 + (i % 4) * 0.14), i * 23),
      i % 2 ? color : dark,
      5.5 * s,
    );
  }
  return out;
}

function pricklyPear(
  x: number,
  y: number,
  s: number,
  color: string,
  dark: string,
  fruit: string,
  spine: string,
): string {
  const pads: [number, number, number, number, number][] = [
    [0, -66, 46, 68, 0],
    [-54, -150, 38, 54, -28],
    [50, -140, 36, 52, 24],
    [-6, -214, 32, 46, 6],
  ];
  const r = rng(Math.round(x * 3 + y));
  let out = '';
  for (const [dx, dy, rx, ry, rot] of pads) {
    out += path(ellipse(x + (dx + 5) * s, y + (dy + 6) * s, rx * s, ry * s, rot), dark);
    out += path(ellipse(x + dx * s, y + dy * s, rx * s, ry * s, rot), color);
    for (let i = 0; i < 4; i++) {
      out += path(
        circle(
          x + (dx + range(r, -rx, rx) * 0.55) * s,
          y + (dy + range(r, -ry, ry) * 0.6) * s,
          3 * s,
        ),
        spine,
      );
    }
  }
  const fruits: [number, number][] = [
    [-70, -200],
    [-40, -205],
    [62, -188],
    [-12, -258],
    [14, -254],
  ];
  for (const [dx, dy] of fruits) {
    out += path(ellipse(x + dx * s, y + dy * s, 10 * s, 13 * s), fruit);
  }
  return out;
}

function burrow(x: number, y: number, s: number, mound: string, hole: string): string {
  return (
    path(
      `M${f(x - 130 * s)} ${f(y + 6)}C${f(x - 96 * s)} ${f(y - 70 * s)} ${f(x + 96 * s)} ${f(y - 70 * s)} ${f(x + 130 * s)} ${f(y + 6)}Z`,
      mound,
    ) + path(ellipse(x, y - 16 * s, 48 * s, 20 * s), hole)
  );
}

function shadow(x: number, y: number, rx: number, color: string): string {
  return path(ellipse(x, y + 2, rx, rx * 0.2), color, ' opacity=".5"');
}

function pebbles(x: number, y: number, s: number, color: string, shade: string): string {
  return (
    path(ellipse(x, y, 22 * s, 13 * s), shade) +
    path(ellipse(x - 2 * s, y - 3 * s, 20 * s, 11 * s), color) +
    path(ellipse(x + 34 * s, y + 6 * s, 13 * s, 8 * s), shade) +
    path(ellipse(x + 33 * s, y + 4 * s, 12 * s, 7 * s), color)
  );
}

function bloomPatch(
  x: number,
  y: number,
  s: number,
  petal: string,
  center: string,
  stem: string,
): string {
  return (
    path(leaf(x, y, 34 * s, 8 * s, -150), stem) +
    path(leaf(x, y, 30 * s, 7 * s, -30), stem) +
    flower(x - 20 * s, y - 22 * s, s * 0.8, petal, center, stem) +
    flower(x + 4 * s, y - 34 * s, s, petal, center, stem) +
    flower(x + 26 * s, y - 18 * s, s * 0.7, petal, center, stem)
  );
}

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

function oasis(p: Palette, mode: Mode): [number, string][] {
  const x = 2560;
  const y = 1262;
  const palms = (px: number, py: number, s: number, lean: number, nut = true): [number, string] => [
    py,
    palm(px, py, s, lean, p.trunk, p.trunkDark, p.frond, p.frondDark, nut ? p.coconut : undefined),
  ];
  let water = pond(x, y, 300, 62, p.water, p.waterLight, p.waterRim);
  if (mode === 'night') {
    water +=
      stroke(curve(x + 60, y - 18, x + 180, y - 18, -4), p.sun, 9, ' stroke-opacity=".55"') +
      stroke(curve(x + 90, y + 4, x + 160, y + 4, -3), p.sun, 7, ' stroke-opacity=".4"');
  }
  water +=
    lilyPad(x - 170, y + 14, 34, 13, p.lily, -30) +
    lilyPad(x - 120, y + 28, 24, 9, p.lilyDark, 200) +
    lilyPad(x + 200, y + 10, 30, 11, p.lily, 160) +
    flower(x - 168, y + 6, 0.7, p.flower, p.flowerCenter);
  return [
    [
      1160,
      path(scallop(x, y + 8, 1, 26, 16, 0, 410, 104), p.oasisGrassDark) +
        path(scallop(x - 6, y, 1, 26, 15, 6, 396, 96), p.oasisGrass),
    ],
    palms(2360, 1222, 1.05, -70),
    palms(2770, 1226, 1.2, 80),
    palms(2575, 1196, 0.8, 24, false),
    [1214, bush(2470, 1214, 0.42, p.oasisGrass, p.oasisGrassDark)],
    [1210, bush(2668, 1208, 0.36, p.oasisGrass, p.oasisGrassDark)],
    [y, water],
    [1290, reeds(2290, 1292, 1, p.oasisGrass, p.oasisGrassDark, p.trunkDark)],
    [1296, reeds(2850, 1290, 0.9, p.oasisGrass, p.oasisGrassDark, p.trunkDark)],
    [1336, grassTuft(2440, 1336, 1.1, p.oasisGrassDark)],
    [1340, grassTuft(2700, 1338, 1, p.oasisGrassDark)],
    [1330, bloomPatch(2560, 1346, 0.9, p.flower, p.flowerCenter, p.oasisGrassDark)],
  ];
}

const day: Palette = {
  skyTop: '#67c1ee',
  skyMid: '#a9ddf3',
  skyBottom: '#ffe1ba',
  sun: '#ffcf4a',
  sunRay: '#ffb630',
  face: '#8a4b1f',
  mesaFar: '#f4c4a8',
  mesaFarShade: '#e8ad92',
  mesaFarStripe: '#f9d6c2',
  mesa: '#e48d65',
  mesaShade: '#c96d4a',
  mesaStripe: '#efa887',
  duneFar: '#fbdcb6',
  duneFarShade: '#f3c99f',
  dune: '#f9cc93',
  duneShade: '#efb477',
  ground: '#fcd8a3',
  ground2: '#fad09a',
  sandPatch: '#fde3bd',
  ripple: '#e6a86b',
  cactus: '#6fb36b',
  cactusDark: '#4f9455',
  cactusFar: '#b5c99a',
  bloom: '#ff7aa8',
  bloomOrange: '#ff9d42',
  bloomYellow: '#ffd84d',
  rock: '#da8a62',
  rockShade: '#bc6b47',
  rockLight: '#f3b892',
  trunk: '#b27c50',
  trunkDark: '#8f5d38',
  frond: '#62b65a',
  frondDark: '#449747',
  coconut: '#8b5a3c',
  water: '#4cc3e6',
  waterLight: '#b9eefc',
  waterRim: '#e7b67d',
  lily: '#7cc35a',
  lilyDark: '#5eaa48',
  oasisGrass: '#a6d36b',
  oasisGrassDark: '#84bd52',
  tumble: '#c99a5e',
  tumbleDark: '#a57841',
  dryGrass: '#d4b66a',
  dryGrassDark: '#bb9b50',
  pear: '#86c06a',
  pearDark: '#67a352',
  pearFruit: '#ff5f8f',
  spine: '#e4f5c9',
  burrow: '#f3c48b',
  hole: '#9a6440',
  flower: '#ff8fb6',
  flowerCenter: '#ffd84d',
  shadow: '#efbc84',
};

const AVOID: Zone[] = [
  [2560, 1262, 480, 130],
  [3020, 1390, 160, 50],
  [2090, 1420, 160, 60],
];

const dusk = (hex: string): string => mix(nightColor(hex), '#8e62b8', 0.22);

const desert: SceneDef = {
  id: 'desert',
  world: [W, H],
  horizon: 960,
  ambient: { clouds: 3, stars: 70, birds: 2 },
  defaults: [
    { animal: 'camel', x: 1000, y: 1215 },
    { animal: 'meerkat', x: 3020, y: 1330 },
    { animal: 'lizard', x: 2060, y: 1392, flip: true },
    { animal: 'fennec-fox', x: 480, y: 1600 },
    { animal: 'snake', x: 2420, y: 1600, flip: true },
    { animal: 'tortoise', x: 1560, y: 1700 },
    { animal: 'scorpion', x: 3180, y: 1730, flip: true },
  ],
  day,
  night: {
    ...Object.fromEntries(
      [
        'ground',
        'ground2',
        'sandPatch',
        'dune',
        'duneShade',
        'duneFar',
        'duneFarShade',
        'burrow',
        'mesa',
        'mesaFar',
      ].map((k) => [k, dusk(day[k])]),
    ),
    skyTop: '#140a33',
    skyMid: '#2c1859',
    skyBottom: '#5d3b84',
    sun: '#fff1c0',
    sunRay: '#ffe9a8',
    face: '#7a5a34',
    water: '#2f4f97',
    waterLight: '#9db8f0',
  },
  back: (p, mode) => {
    let out = skyBand(p);
    out +=
      mode === 'day'
        ? sun(2980, 300, 108, p.sun, p.sunRay, p.face)
        : milkyWay() +
          starField(17, 150, 40, 30, W - 40, 900, '#fff6d6') +
          moon(2980, 300, 98, p.sun, p.sunRay, p.face);
    out += cliff('m1', 420, 965, 700, 210, p.mesaFar, p.mesaFarShade, p.mesaFarStripe);
    out += cliff('m2', 2130, 965, 210, 330, p.mesaFar, p.mesaFarShade, p.mesaFarStripe);
    out += cliff('m3', 3260, 965, 720, 240, p.mesaFar, p.mesaFarShade, p.mesaFarStripe);
    out += cliff('m4', 1040, 1000, 1000, 330, p.mesa, p.mesaShade, p.mesaStripe);
    out += cliff('m5', 2680, 1000, 270, 470, p.mesa, p.mesaShade, p.mesaStripe);
    out += arch(1880, 1012, 380, 250, p.mesa, p.mesaShade, p.mesaStripe);
    out += hills(4, 990, 50, W, H, p.duneFar, 8);
    out += dune('d1', 300, 1060, 1100, 170, 80, p.duneFar, p.duneFarShade, p.ripple);
    out += dune('d2', 3300, 1050, 1000, 190, -60, p.duneFar, p.duneFarShade, p.ripple);
    out += cactus(3050, 1040, 0.36, p.cactusFar, p.cactusFar);
    out += cactus(760, 1050, 0.3, p.cactusFar, p.cactusFar);
    out += dune('d3', 1500, 1110, 1300, 200, 120, p.dune, p.duneShade, p.ripple);
    out += dune('d4', 3500, 1120, 1100, 220, -140, p.dune, p.duneShade, p.ripple);
    out += hills(8, 1140, 36, W, H, p.ground2, 6);
    out += hills(12, 1190, 28, W, H, p.ground, 5);
    const r = rng(91);
    for (let i = 0; i < 18; i++) {
      out += path(
        ellipse(range(r, 0, W), range(r, 1240, 1900), range(r, 120, 260), range(r, 22, 40)),
        p.sandPatch,
        ' opacity=".7"',
      );
    }
    out += layered([
      ...oasis(p, mode),
      [
        1360,
        shadow(460, 1360, 70, p.shadow) + cactus(460, 1360, 1.25, p.cactus, p.cactusDark, p.bloom),
      ],
      [1372, bloomPatch(540, 1380, 1.5, p.bloomYellow, p.bloomOrange, p.cactusDark)],
      [
        1250,
        shadow(1700, 1250, 54, p.shadow) +
          cactus(1700, 1250, 0.95, p.cactus, p.cactusDark, p.bloomYellow),
      ],
      [
        1330,
        shadow(3330, 1330, 64, p.shadow) + cactus(3330, 1330, 1.1, p.cactus, p.cactusDark, p.bloom),
      ],
      [1344, bloomPatch(3240, 1350, 1.4, p.flower, p.flowerCenter, p.cactusDark)],
      [1700, bloomPatch(2200, 1700, 1.3, p.bloomOrange, p.bloomYellow, p.cactusDark)],
      [1500, bloomPatch(600, 1500, 1.2, p.flower, p.flowerCenter, p.cactusDark)],
      [1540, barrelCactus(760, 1540, 1.1, p.cactus, p.cactusDark, p.bloom)],
      [1560, barrelCactus(835, 1560, 0.7, p.cactus, p.cactusDark, p.bloomOrange)],
      [1650, barrelCactus(1990, 1650, 0.95, p.cactus, p.cactusDark, p.bloomYellow)],
      [1560, barrelCactus(2930, 1560, 1.05, p.cactus, p.cactusDark, p.bloom)],
      [1440, pricklyPear(1360, 1440, 0.85, p.pear, p.pearDark, p.pearFruit, p.spine)],
      [1410, rock(2060, 1430, 1.2, p.rock, p.rockShade, p.rockLight)],
      [1440, rock(2160, 1440, 0.7, p.rock, p.rockShade, p.rockLight)],
      [1780, rock(3400, 1780, 1, p.rock, p.rockShade, p.rockLight)],
      [1395, burrow(3020, 1395, 1, p.burrow, p.hole)],
      [1590, tumbleweed(1250, 1600, 1.35, p.tumble, p.tumbleDark)],
      ...scatterAround(31, 16, 0, W, 1260, 1880, AVOID, (x, y, rr) =>
        sandRipples(x, y, 0.8 + rr() * 0.6, p.ripple),
      ),
      ...scatterAround(43, 30, 0, W, 1220, 1900, AVOID, (x, y, rr) =>
        grassTuft(x, y, 0.7 + rr() * 0.5, rr() < 0.5 ? p.dryGrass : p.dryGrassDark),
      ),
      ...scatterAround(57, 12, 0, W, 1260, 1880, AVOID, (x, y, rr) =>
        pebbles(x, y, 0.8 + rr() * 0.6, p.rockLight, p.rock),
      ),
    ]);
    return out;
  },
  front: (p) =>
    pricklyPear(170, 2010, 1.35, p.pear, p.pearDark, p.pearFruit, p.spine) +
    rock(980, 2030, 1.5, p.rock, p.rockShade, p.rockLight) +
    grassTuft(1080, 2004, 1.8, p.dryGrass) +
    barrelCactus(1820, 2010, 1.5, p.cactus, p.cactusDark, p.bloom) +
    grassTuft(2600, 2004, 2, p.dryGrassDark) +
    rock(2700, 2036, 1.1, p.rock, p.rockShade, p.rockLight) +
    pricklyPear(3420, 2016, 1.25, p.pear, p.pearDark, p.pearFruit, p.spine),
};

export default desert;
