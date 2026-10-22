import { mix } from '../core/color';
import {
  circle,
  curve,
  ellipse,
  f,
  leaf,
  mirrorPath,
  poly,
  roundRect,
  scallop,
  smooth,
  tube,
  type Pt,
} from '../core/paths';
import {
  cloud,
  flower,
  grassTuft,
  group,
  linearGradient,
  moon,
  path,
  radialGlow,
  seaweed,
  starField,
  stroke,
  sun,
} from './props';
import { nightColor } from './render';
import { range, rng } from './rng';
import type { Interactive, Mode, Palette, SceneDef } from './types';

const W = 3600;
const H = 2000;
const FLOOR = 1300;
const VP: Pt = [1800, 720];

const WIN = { x: 1390, y: 150, w: 860, h: 760 };
const GLASS = { x: 1420, y: 180, w: 800, h: 700 };
const TRANSOM = 360;
const SUN: Pt = [1975, 600];

const DOOR = { x: 130, y: 150, w: 800 };
const VIEW = { x: 160, y: 180, w: 740, h: 1104 };
const PANEL_R = 530;
const OPEN_L = 556;

const DOGHOUSE: Pt = [728, 1238];
const CAT_TREE: Pt = [1155, 1440];
const LAMP: Pt = [2385, 1452];
const CAB = { x: 2470, y: 1100, w: 710, h: 340 };
const TANK = { x: 2495, y: 712, w: 390, h: 388 };
const AXO = { x: 2905, y: 893, w: 260, h: 207 };
const SHELF = { x: 3200, y: 990, w: 380, h: 450 };
const CAGE = { x: 3210, y: 715, w: 360, h: 275 };
const PLANT: Pt = [112, 1546];
const BASKET: Pt = [2690, 1735];
const BED: Pt = [530, 1640];
const RUG = { x: 1830, y: 1700, rx: 700, ry: 172 };
const POOL = { x: LAMP[0] - 60, y: LAMP[1] + 60, rx: 700, ry: 200 };

const rect = (x: number, y: number, w: number, h: number, fill: string, extra = ''): string =>
  `<rect x="${f(x)}" y="${f(y)}" width="${f(w)}" height="${f(h)}" fill="${fill}"${extra}/>`;

const glowAt = (x: number, y: number, r: number, id: string): string =>
  `<circle cx="${f(x)}" cy="${f(y)}" r="${f(r)}" fill="url(#${id})"/>`;

const glowOval = (x: number, y: number, rx: number, ry: number, id: string): string =>
  `<ellipse cx="${f(x)}" cy="${f(y)}" rx="${f(rx)}" ry="${f(ry)}" fill="url(#${id})"/>`;

const ring = (d: string, color: string, width: number, extra = ''): string =>
  `<path d="${d}" fill="none" stroke="${color}" stroke-width="${f(width)}"${extra}/>`;

function clipped(id: string, d: string, content: string): string {
  return (
    `<defs><clipPath id="${id}"><path d="${d}"/></clipPath></defs>` +
    group(content, '', ` clip-path="url(#${id})"`)
  );
}

function arch(cx: number, bottom: number, w: number, h: number): string {
  const r = w / 2;
  return `M${f(cx - r)} ${f(bottom)}L${f(cx - r)} ${f(bottom - h + r)}A${f(r)} ${f(r)} 0 0 1 ${f(cx + r)} ${f(bottom - h + r)}L${f(cx + r)} ${f(bottom)}Z`;
}

function paw(x: number, y: number, s: number, rot: number, color: string, extra = ''): string {
  const a = (rot * Math.PI) / 180;
  const at = (dx: number, dy: number): Pt => [
    x + (dx * Math.cos(a) - dy * Math.sin(a)) * s,
    y + (dx * Math.sin(a) + dy * Math.cos(a)) * s,
  ];
  const pad: Pt[] = [
    [-15, 7],
    [-9, -3],
    [0, -6],
    [9, -3],
    [15, 7],
    [9, 15],
    [0, 13],
    [-9, 15],
  ];
  const toes: [number, number, number, number][] = [
    [-19, -11, 5.6, -24],
    [-7, -20, 6.2, -8],
    [7, -20, 6.2, 8],
    [19, -11, 5.6, 24],
  ];
  return (
    path(smooth(pad.map(([dx, dy]) => at(dx, dy))), color, extra) +
    toes
      .map(([dx, dy, r, tilt]) => {
        const [tx, ty] = at(dx, dy);
        return path(ellipse(tx, ty, r * s, r * 1.3 * s, rot + tilt), color, extra);
      })
      .join('')
  );
}

function bone(x: number, y: number, s: number, rot: number, color: string): string {
  const a = (rot * Math.PI) / 180;
  const dx = Math.cos(a) * 30 * s;
  const dy = Math.sin(a) * 30 * s;
  const nx = -Math.sin(a) * 9 * s;
  const ny = Math.cos(a) * 9 * s;
  return (
    path(tube([[x - dx, y - dy] as Pt, [x + dx, y + dy] as Pt], 9 * s), color) +
    [-1, 1]
      .map((k) =>
        [-1, 1]
          .map((j) => path(circle(x + k * dx + j * nx, y + k * dy + j * ny, 11 * s), color))
          .join(''),
      )
      .join('')
  );
}

function wall(p: Palette): string {
  let out = rect(0, 0, W, FLOOR, p.wall);
  const r = rng(11);
  for (let row = 0; row < 8; row++) {
    const y = 160 + row * 116;
    for (let col = -1; col < 26; col++) {
      const x = 60 + col * 142 + (row % 2) * 71;
      out += paw(
        x + range(r, -8, 8),
        y + range(r, -6, 6),
        0.9,
        (row + col) % 2 ? -20 : 14,
        p.wallPaw,
      );
    }
  }
  out +=
    `<defs>${linearGradient('ptWallTop', [
      [0, p.wallShade, 0.6],
      [1, p.wallShade, 0],
    ])}</defs>` + rect(0, 56, W, 240, 'url(#ptWallTop)');
  out += rect(0, 0, W, 44, p.ceiling) + rect(0, 40, W, 22, p.trim) + rect(0, 62, W, 6, p.trimShade);
  out +=
    rect(0, FLOOR - 50, W, 8, p.trimShade) +
    rect(0, FLOOR - 46, W, 46, p.trim) +
    rect(0, FLOOR - 10, W, 10, p.trimShade);
  return out;
}

const floorX = (x0: number, y: number): number =>
  VP[0] + ((x0 - VP[0]) * (y - VP[1])) / (FLOOR - VP[1]);

function floor(p: Palette): string {
  let out = rect(0, FLOOR, W, H - FLOOR, p.floor);
  const tones = [p.floor, p.floorB, p.floor, p.floorC];
  const step = 112;
  const xs: number[] = [];
  for (let k = -22; k <= 22; k++) xs.push(VP[0] + k * step);
  const r = rng(5);
  for (let i = 0; i < xs.length - 1; i++) {
    const a = xs[i];
    const b = xs[i + 1];
    out += path(
      poly([
        [a, FLOOR],
        [b, FLOOR],
        [floorX(b, H), H],
        [floorX(a, H), H],
      ]),
      tones[i % tones.length],
    );
    let y = FLOOR + range(r, 30, 300);
    while (y < H) {
      out += stroke(`M${f(floorX(a, y))} ${f(y)}L${f(floorX(b, y))} ${f(y)}`, p.plank, 4);
      y += range(r, 280, 520);
    }
  }
  for (const a of xs) out += stroke(`M${f(a)} ${FLOOR}L${f(floorX(a, H))} ${H}`, p.plank, 4);
  out +=
    `<defs>${linearGradient('ptFloorShade', [
      [0, p.floorShade, 0.55],
      [1, p.floorShade, 0],
    ])}</defs>` + rect(0, FLOOR, W, 80, 'url(#ptFloorShade)');
  return out;
}

function rug(p: Palette): string {
  const { x, y, rx, ry } = RUG;
  let out = path(ellipse(x, y + 16, rx + 12, ry + 10), p.floorShade, ' fill-opacity=".35"');
  const rings: [number, string][] = [
    [1, p.rugA],
    [0.86, p.rugB],
    [0.72, p.rugC],
    [0.56, p.rugB],
    [0.42, p.rugD],
    [0.24, p.rugB],
  ];
  for (const [k, c] of rings) out += path(ellipse(x, y, rx * k, ry * k), c);
  for (const k of [0.93, 0.64, 0.33]) {
    out += ring(
      ellipse(x, y, rx * k, ry * k),
      p.rugDash,
      6,
      ' stroke-dasharray="3 22" stroke-linecap="round" stroke-opacity=".85"',
    );
  }
  return out;
}

function farTree(x: number, y: number, s: number, crown: string, trunk: string): string {
  return (
    path(roundRect(x - 5 * s, y - 40 * s, 10 * s, 44 * s, 4 * s), trunk) +
    path(circle(x, y - 58 * s, 30 * s), crown)
  );
}

function neighbourHouse(x: number, y: number, p: Palette): string {
  return (
    rect(x + 22, y - 116, 16, 36, p.houseRoof) +
    path(roundRect(x - 50, y - 72, 100, 76, 4), p.houseWall) +
    path(
      poly([
        [x - 64, y - 66],
        [x, y - 118],
        [x + 64, y - 66],
      ]),
      p.houseRoof,
    ) +
    path(roundRect(x - 38, y - 54, 22, 22, 3), p.houseWin) +
    path(roundRect(x + 16, y - 54, 22, 22, 3), p.houseWin) +
    path(roundRect(x - 10, y - 30, 20, 34, 3), p.houseDoor)
  );
}

function succulent(x: number, y: number, p: Palette): string {
  return (
    path(leaf(x, y - 40, 44, 10, -130), p.leafGDark) +
    path(leaf(x, y - 40, 44, 10, -50), p.leafGDark) +
    path(leaf(x, y - 40, 48, 11, -92), p.leafG) +
    path(leaf(x, y - 40, 36, 9, -160), p.leafG) +
    path(leaf(x, y - 40, 36, 9, -20), p.leafG) +
    path(`M${x - 26} ${y - 44}L${x + 26} ${y - 44}L${x + 20} ${y}L${x - 20} ${y}Z`, p.potSmall) +
    path(roundRect(x - 30, y - 50, 60, 14, 6), p.potSmallRim)
  );
}

function windowArt(p: Palette, mode: Mode): string {
  const night = mode === 'night';
  const { x, y, w, h } = GLASS;
  const low = y + h + 20;
  let view =
    `<defs>${linearGradient('ptWinSky', [
      [0, p.skyTop],
      [1, p.skyBottom],
    ])}${radialGlow('ptHouseGlow', p.windowGlow, 0.7)}</defs>` + rect(x, y, w, h, 'url(#ptWinSky)');
  view += night
    ? starField(23, 46, x + 16, y + 16, x + w - 16, y + 560, p.star)
    : cloud(1600, 540, 0.62, p.cloud, p.cloudShade) + cloud(2110, 268, 0.42, p.cloud, p.cloudShade);
  view += path(
    `${smooth(
      [
        [1380, 818],
        [1540, 776],
        [1720, 804],
        [1900, 766],
        [2080, 798],
        [2270, 772],
      ],
      false,
    )}L2270 ${low}L1380 ${low}Z`,
    p.hillFar,
  );
  view += (
    [
      [1800, 790, 0.7],
      [1858, 784, 0.55],
      [2150, 796, 0.85],
      [2200, 792, 0.6],
    ] as [number, number, number][]
  )
    .map(([tx, ty, s]) => farTree(tx, ty, s, p.tree, p.trunk))
    .join('');
  if (night) view += glowAt(1570, 787, 50, 'ptHouseGlow') + glowAt(1624, 787, 50, 'ptHouseGlow');
  view += neighbourHouse(1597, 852, p);
  view += path(
    `${smooth(
      [
        [1380, 866],
        [1580, 842],
        [1800, 862],
        [2020, 836],
        [2270, 856],
      ],
      false,
    )}L2270 ${low}L1380 ${low}Z`,
    p.hillNear,
  );
  const shine = night ? ' fill-opacity=".1"' : ' fill-opacity=".28"';
  let out = path(roundRect(WIN.x, WIN.y, WIN.w, WIN.h, 16), p.frame);
  out += clipped('ptWinClip', roundRect(x, y, w, h, 6), view);
  out += ring(roundRect(x, y, w, h, 6), p.frameShade, 6);
  out += rect(x, TRANSOM, w, 24, p.frame) + rect(x, TRANSOM + 20, w, 4, p.frameShade);
  for (const mx of [x + 254, x + 526]) out += rect(mx, y, 20, TRANSOM - y, p.frame);
  out +=
    path(
      poly([
        [1446, 872],
        [1500, 872],
        [1610, 690],
        [1556, 690],
      ]),
      p.glassShine,
      shine,
    ) +
    path(
      poly([
        [1530, 872],
        [1552, 872],
        [1662, 690],
        [1640, 690],
      ]),
      p.glassShine,
      shine,
    ) +
    path(
      poly([
        [1440, 352],
        [1474, 352],
        [1540, 196],
        [1506, 196],
      ]),
      p.glassShine,
      shine,
    );
  out += path(roundRect(1360, 896, 920, 36, 12), p.frame) + rect(1372, 928, 896, 10, p.frameShade);
  out += succulent(1478, 898, p);
  return out;
}

const CURTAIN =
  'M1290 118L1548 118C1530 300 1454 520 1424 646C1440 770 1480 900 1490 1010L1286 1010C1300 900 1320 760 1316 646C1306 480 1294 300 1290 118Z';
const CURTAIN_FOLDS = [
  'M1352 132C1354 330 1358 520 1348 640M1350 660C1344 780 1336 900 1332 1000',
  'M1412 132C1408 330 1392 520 1378 640M1382 660C1392 780 1404 900 1414 1000',
  'M1482 132C1462 320 1424 520 1402 640M1410 660C1430 780 1450 900 1458 1000',
];

function curtain(p: Palette, mirror: boolean): string {
  const m = (d: string) => (mirror ? mirrorPath(d, 1820) : d);
  const body = m(CURTAIN);
  let dots = '';
  for (let row = 0; row < 19; row++) {
    for (let col = 0; col < 6; col++) {
      const cx = 1300 + col * 48 + (row % 2) * 24;
      const cy = 140 + row * 48;
      dots += path(circle(mirror ? 3640 - cx : cx, cy, 8), p.curtainDot);
    }
  }
  const folds = CURTAIN_FOLDS.map((d) =>
    stroke(m(d), p.curtainDark, 10, ' stroke-opacity=".5"'),
  ).join('');
  const tie =
    path(m('M1306 628Q1370 640 1434 628L1438 660Q1370 676 1302 660Z'), p.tieDark) +
    path(m('M1306 628Q1370 640 1434 628L1436 650Q1370 664 1304 650Z'), p.tie) +
    path(m(leaf(1312, 646, 44, 15, 200)), p.tieDark) +
    path(m(leaf(1312, 646, 44, 15, 160)), p.tieDark) +
    path(m(leaf(1312, 646, 40, 12, 200)), p.tie) +
    path(m(leaf(1312, 646, 40, 12, 160)), p.tie) +
    path(m(leaf(1310, 652, 50, 8, 112)), p.tie) +
    path(m(leaf(1314, 652, 44, 8, 82)), p.tie) +
    path(m(circle(1312, 647, 10)), p.tieDark);
  return (
    path(body, p.curtain) + clipped(mirror ? 'ptCurtainR' : 'ptCurtainL', body, dots + folds) + tie
  );
}

function curtainRod(p: Palette): string {
  let out = path(roundRect(1262, 104, 1116, 18, 9), p.rod);
  out += path(circle(1252, 113, 20), p.rodDark) + path(circle(2388, 113, 20), p.rodDark);
  for (let i = 0; i < 6; i++) {
    for (const cx of [1304 + i * 46, 3640 - (1304 + i * 46)]) {
      out += ring(circle(cx, 120, 11), p.rodDark, 5);
    }
  }
  return out;
}

function stringLights(hooks: number[], y: number, sag: number, p: Palette, mode: Mode): string {
  const night = mode === 'night';
  const colors = [p.bulbA, p.bulbB, p.bulbC, p.bulbD];
  let wire = '';
  let bulbs = '';
  let glows = '';
  let k = 0;
  for (let i = 0; i < hooks.length - 1; i++) {
    const a: Pt = [hooks[i], y];
    const b: Pt = [hooks[i + 1], y];
    const c: Pt = [(a[0] + b[0]) / 2, y + sag];
    wire += `M${a[0]} ${a[1]}Q${c[0]} ${c[1]} ${b[0]} ${b[1]}`;
    for (const t of [0.2, 0.4, 0.6, 0.8]) {
      const u = 1 - t;
      const px = u * u * a[0] + 2 * u * t * c[0] + t * t * b[0];
      const py = u * u * a[1] + 2 * u * t * c[1] + t * t * b[1];
      if (night) glows += glowAt(px, py + 18, 40, 'ptBulbGlow');
      bulbs +=
        path(roundRect(px - 6, py - 2, 12, 10, 3), p.wire) +
        path(ellipse(px, py + 20, 9, 13), colors[k % 4]) +
        path(ellipse(px - 3, py + 15, 3, 4), p.white, ' fill-opacity=".7"');
      k++;
    }
  }
  return glows + stroke(wire, p.wire, 3) + bulbs;
}

function fairyLights(p: Palette, mode: Mode): string {
  return (
    `<defs>${radialGlow('ptBulbGlow', p.bulbGlow, 0.8)}</defs>` +
    stringLights([1290, 1555, 1820, 2085, 2350], 128, 120, p, mode) +
    stringLights([136, 401, 666, 926], 132, 110, p, mode)
  );
}

function picketFence(x0: number, x1: number, base: number, p: Palette): string {
  let out =
    rect(x0, base - 96, x1 - x0, 16, p.fenceShade) + rect(x0, base - 46, x1 - x0, 16, p.fenceShade);
  for (let x = x0; x < x1; x += 46) {
    out += path(
      poly([
        [x - 14, base],
        [x - 14, base - 106],
        [x, base - 124],
        [x + 14, base - 106],
        [x + 14, base],
      ]),
      p.fence,
    );
  }
  return out;
}

function gardenTree(x: number, y: number, s: number, p: Palette): string {
  const trunk = tube(
    [
      [x, y + 4],
      [x - 6 * s, y - 120 * s],
      [x + 4 * s, y - 260 * s],
    ],
    (u) => (24 - 9 * u) * s,
  );
  const blobs: [number, number, number][] = [
    [-90, -300, 96],
    [80, -310, 100],
    [-10, -400, 116],
    [0, -270, 96],
    [-120, -220, 70],
    [116, -230, 74],
  ];
  return (
    path(trunk, p.trunk) +
    blobs
      .map(([dx, dy, r]) => path(circle(x + dx * s, y + (dy + 14) * s, r * s), p.treeDark))
      .join('') +
    blobs
      .map(([dx, dy, r]) => path(circle(x + (dx - 8) * s, y + dy * s, r * 0.93 * s), p.tree))
      .join('')
  );
}

function gardenFlowers(x0: number, x1: number, y: number, p: Palette, seed: number): string {
  const r = rng(seed);
  let out = '';
  for (let x = x0; x < x1; x += range(r, 26, 40)) {
    const c = [p.flowerA, p.flowerB, p.flowerC][Math.floor(r() * 3)];
    const yy = y + range(r, -8, 8);
    out += path(leaf(x, yy + 26, 28, 6, -112), p.lawnDark);
    out += path(leaf(x, yy + 26, 26, 6, -68), p.lawnDark);
    out += flower(x, yy, 0.8 + r() * 0.3, c, p.flowerCenter);
  }
  return out;
}

const FIREFLIES: Pt[] = [
  [236, 760],
  [430, 690],
  [610, 820],
  [840, 700],
  [300, 1080],
  [470, 1150],
  [880, 900],
  [380, 900],
];

function gardenView(p: Palette, mode: Mode): string {
  const night = mode === 'night';
  const { x, y, w, h } = VIEW;
  const bottom = y + h + 10;
  let v =
    `<defs>${linearGradient('ptGardenSky', [
      [0, p.skyTop],
      [1, p.skyBottom],
    ])}${radialGlow('ptFirefly', p.firefly, 0.85)}</defs>` + rect(x, y, w, h, 'url(#ptGardenSky)');
  v += night
    ? starField(37, 30, x + 12, y + 12, x + w - 12, 700, p.star)
    : cloud(360, 300, 0.5, p.cloud, p.cloudShade) + cloud(800, 500, 0.34, p.cloud, p.cloudShade);
  v += path(
    `${smooth(
      [
        [130, 900],
        [200, 846],
        [280, 864],
        [360, 836],
        [450, 858],
        [540, 832],
        [630, 856],
        [720, 830],
        [810, 852],
        [930, 836],
      ],
      false,
    )}L930 1000L130 1000Z`,
    p.hedgeDark,
  );
  v += gardenTree(300, 980, 1, p);
  v += path(
    `${smooth(
      [
        [130, 930],
        [240, 900],
        [380, 914],
        [520, 896],
        [660, 912],
        [800, 894],
        [930, 908],
      ],
      false,
    )}L930 1000L130 1000Z`,
    p.hedge,
  );
  v += picketFence(150, 940, 992, p);
  v += rect(x, 978, w, bottom - 978, p.lawn);
  v += path(ellipse(470, 1010, 420, 40), p.lawnLight, ' fill-opacity=".7"');
  v += path(ellipse(340, 1180, 220, 34), p.lawnLight, ' fill-opacity=".5"');
  v += gardenFlowers(176, 930, 994, p, 9);
  const r = rng(19);
  for (let i = 0; i < 16; i++) {
    const gx = range(r, 180, 540);
    const gy = range(r, 1040, 1270);
    v += grassTuft(gx, gy, 0.7 + r() * 0.4, r() < 0.5 ? p.lawnDark : p.hedge);
  }
  v += path(ellipse(330, 1256, 46, 14), p.stoneShade) + path(ellipse(330, 1252, 42, 12), p.stone);
  v += path(ellipse(410, 1188, 36, 11), p.stoneShade) + path(ellipse(410, 1185, 32, 9), p.stone);
  v += path(ellipse(470, 1130, 28, 8), p.stoneShade) + path(ellipse(470, 1128, 25, 7), p.stone);
  if (night) {
    for (const [fx, fy] of FIREFLIES) {
      v += glowAt(fx, fy, 30, 'ptFirefly') + path(circle(fx, fy, 5), p.firefly);
    }
  }
  return v;
}

function doorArt(p: Palette, mode: Mode): string {
  const night = mode === 'night';
  const { x, y, w } = DOOR;
  const viewD = roundRect(VIEW.x, VIEW.y, VIEW.w, VIEW.h, 4);
  const railY = VIEW.y + VIEW.h - 26;
  const shine = night ? ' fill-opacity=".1"' : ' fill-opacity=".26"';
  let out = path(roundRect(x, y, w, FLOOR - y + 6, 14), p.frame);
  out += clipped('ptDoorClip', viewD, gardenView(p, mode));
  out += ring(viewD, p.frameShade, 6);
  out += rect(PANEL_R, VIEW.y, OPEN_L - PANEL_R, VIEW.h, p.frameShade);
  out += rect(PANEL_R + 3, VIEW.y, OPEN_L - PANEL_R - 9, VIEW.h, p.frame);
  out += path(roundRect(PANEL_R + 8, 640, 12, 180, 6), p.handle);
  out += rect(VIEW.x, VIEW.y, 24, VIEW.h, p.frame);
  out += rect(PANEL_R - 24, VIEW.y, 24, VIEW.h, p.frame);
  out += rect(VIEW.x, VIEW.y, PANEL_R - VIEW.x, 24, p.frame);
  out += rect(VIEW.x, railY, PANEL_R - VIEW.x, 26, p.frame);
  out += ring(
    roundRect(VIEW.x + 24, VIEW.y + 24, PANEL_R - VIEW.x - 48, railY - VIEW.y - 24, 3),
    p.frameShade,
    4,
  );
  out +=
    path(
      poly([
        [192, 700],
        [240, 700],
        [470, 300],
        [422, 300],
      ]),
      p.glassShine,
      shine,
    ) +
    path(
      poly([
        [270, 700],
        [292, 700],
        [500, 340],
        [478, 340],
      ]),
      p.glassShine,
      shine,
    );
  out +=
    rect(x - 8, FLOOR - 16, w + 16, 16, p.track) + rect(x - 8, FLOOR - 16, w + 16, 4, p.trackDark);
  return out;
}

function doormat(p: Palette): string {
  return (
    path(
      poly([
        [584, 1310],
        [896, 1310],
        [924, 1362],
        [556, 1362],
      ]),
      p.matDark,
    ) +
    path(
      poly([
        [590, 1310],
        [890, 1310],
        [914, 1354],
        [566, 1354],
      ]),
      p.mat,
    ) +
    paw(740, 1334, 0.75, 0, p.matDark)
  );
}

function leashHook(p: Palette): string {
  return (
    path(roundRect(18, 556, 100, 24, 9), p.hook) +
    path(circle(42, 572, 9), p.hookDark) +
    path(circle(96, 572, 9), p.hookDark) +
    stroke('M42 578C30 650 26 720 40 760C52 790 72 770 66 730C60 690 50 630 44 580', p.leash, 9) +
    path(roundRect(28, 752, 26, 40, 10), p.leash) +
    ring(ellipse(96, 618, 26, 38), p.collar, 12) +
    path(circle(96, 662, 13), p.tag) +
    path(circle(96, 662, 5), p.hookDark)
  );
}

function clock(p: Palette): string {
  const cx = 1155;
  const cy = 300;
  let out = path(circle(cx, cy + 8, 78), p.wallShade, ' fill-opacity=".5"');
  out += path(circle(cx, cy, 76), p.clockRim) + path(circle(cx, cy, 60), p.clockFace);
  for (let i = 0; i < 12; i++) {
    const a = (i / 12) * Math.PI * 2;
    out += path(
      circle(cx + Math.cos(a) * 46, cy + Math.sin(a) * 46, i % 3 ? 4 : 7),
      i % 3 ? p.clockHand : p.clockRim,
    );
  }
  out += stroke(`M${cx} ${cy}L${cx - 22} ${cy - 14}`, p.clockHand, 8);
  out += stroke(`M${cx} ${cy}L${cx + 26} ${cy - 30}`, p.clockHand, 6);
  out += path(circle(cx, cy, 8), p.clockRim);
  out +=
    path(ellipse(cx - 70, cy - 66, 18, 12, -30), p.clockRim) +
    path(ellipse(cx + 70, cy - 66, 18, 12, 30), p.clockRim);
  return out;
}

function pictures(p: Palette): string {
  let out =
    path(roundRect(2530, 370, 230, 240, 12), p.wallShade, ' fill-opacity=".45"') +
    path(roundRect(2524, 360, 230, 240, 12), p.pictureFrame) +
    path(roundRect(2544, 380, 190, 200, 6), p.pictureBg) +
    paw(2639, 486, 2.6, -8, p.pawPink);
  out +=
    path(roundRect(2816, 410, 160, 160, 14), p.wallShade, ' fill-opacity=".45"') +
    path(roundRect(2810, 400, 160, 160, 14), p.pictureFrame2) +
    path(roundRect(2826, 416, 128, 128, 8), p.pictureBg2) +
    bone(2890, 480, 1.15, -30, p.white);
  return out;
}

function wallShelf(p: Palette): string {
  let out =
    path(roundRect(3262, 566, 286, 20, 6), p.shelfShade) +
    path(roundRect(3262, 560, 286, 18, 6), p.shelf) +
    path(
      poly([
        [3290, 586],
        [3306, 586],
        [3306, 620],
      ]),
      p.shelfShade,
    ) +
    path(
      poly([
        [3504, 586],
        [3520, 586],
        [3504, 620],
      ]),
      p.shelfShade,
    );
  const r = rng(4);
  const vines: [number, number][] = [
    [3300, 690],
    [3326, 650],
    [3352, 700],
  ];
  for (const [vx, vy] of vines) {
    const pts: Pt[] = [];
    for (let i = 0; i <= 6; i++)
      pts.push([vx + Math.sin(i * 1.2 + vx) * 10, 548 + ((vy - 548) * i) / 6]);
    out += stroke(smooth(pts, false), p.stem, 4);
    for (let i = 1; i <= 6; i++) {
      const [lx, ly] = pts[i];
      out += path(leaf(lx, ly, 26, 9, r() < 0.5 ? 30 : 150), i % 2 ? p.leafG : p.leafGDark);
    }
  }
  out +=
    path('M3290 512L3362 512L3354 560L3298 560Z', p.potSmall) +
    path(roundRect(3284, 504, 84, 16, 6), p.potSmallRim);
  for (const [a, l] of [
    [-150, 46],
    [-120, 52],
    [-60, 50],
    [-30, 44],
    [-90, 40],
  ] as [number, number][]) {
    out += path(leaf(3326, 506, l, 14, a), a === -90 ? p.leafGDark : p.leafG);
  }
  out +=
    path(roundRect(3440, 470, 40, 92, 18), p.cactus) +
    path(roundRect(3416, 498, 22, 40, 11), p.cactus) +
    path(roundRect(3482, 486, 22, 46, 11), p.cactus) +
    path(circle(3460, 466, 9), p.flowerA) +
    path('M3424 528L3496 528L3488 560L3432 560Z', p.potSmall) +
    path(roundRect(3420, 522, 80, 14, 6), p.potSmallRim);
  return out;
}

function sofa(p: Palette): string {
  let out = path(roundRect(1370, 1428, 900, 34, 17), p.floorShade, ' fill-opacity=".4"');
  for (const lx of [1404, 1512, 2128, 2236]) {
    out += path(
      poly([
        [lx - 13, 1404],
        [lx + 13, 1404],
        [lx + 7, 1454],
        [lx - 7, 1454],
      ]),
      p.leg,
    );
  }
  out += path(roundRect(1412, 948, 816, 320, 66), p.sofaDark);
  for (let i = 0; i < 3; i++) {
    const bx = 1440 + i * 256;
    out +=
      path(roundRect(bx, 968, 248, 268, 56), p.sofa) +
      path(roundRect(bx + 22, 984, 204, 50, 25), p.sofaLight, ' fill-opacity=".55"');
  }
  out += path(roundRect(1428, 1262, 784, 152, 28), p.sofaDark);
  for (let i = 0; i < 3; i++) {
    const sx = 1462 + i * 240;
    out +=
      path(roundRect(sx, 1184, 236, 116, 36), p.sofa) +
      path(roundRect(sx + 4, 1182, 228, 70, 32), p.sofaLight) +
      stroke(`M${sx + 30} ${1256}L${sx + 206} ${1256}`, p.sofaDark, 4, ' stroke-opacity=".35"');
  }
  for (const ax of [1352, 2158]) {
    out +=
      path(roundRect(ax, 1100, 130, 318, 54), p.sofa) +
      path(roundRect(ax + 8, 1340, 114, 70, 30), p.sofaDark, ' fill-opacity=".4"') +
      path(ellipse(ax + 65, 1126, 70, 42), p.sofaLight) +
      ring(ellipse(ax + 65, 1128, 30, 20), p.sofaDark, 5, ' stroke-opacity=".35"');
  }
  out +=
    path(circle(1590, 1146, 70), p.pillowPinkDark) +
    path(circle(1586, 1140, 66), p.pillowPink) +
    stroke(curve(1546, 1104, 1626, 1176, 16), p.pillowPinkDark, 4, ' stroke-opacity=".5"') +
    stroke(curve(1626, 1104, 1546, 1176, -16), p.pillowPinkDark, 4, ' stroke-opacity=".5"') +
    path(circle(1586, 1140, 9), p.pillowPinkDark);
  out += group(
    path(roundRect(1990, 1080, 140, 128, 30), p.pillowYellowDark) +
      path(roundRect(1990, 1074, 136, 124, 30), p.pillowYellow) +
      paw(2058, 1140, 1.5, 0, p.white, ' fill-opacity=".85"'),
    'rotate(9 2060 1140)',
  );
  const throwD =
    'M2146 1112C2160 1074 2286 1074 2300 1112L2306 1300Q2292 1318 2272 1306Q2252 1322 2230 1308Q2208 1322 2188 1308Q2168 1320 2150 1302Z';
  out +=
    path(throwD, p.blanket) +
    clipped(
      'ptThrowClip',
      throwD,
      stroke('M2140 1150Q2224 1138 2310 1150', p.blanketStripe, 16) +
        stroke('M2140 1196Q2224 1184 2310 1196', p.blanketStripe2, 12) +
        stroke('M2140 1242Q2224 1230 2310 1242', p.blanketStripe, 16) +
        path(
          'M2146 1112C2160 1074 2286 1074 2300 1112L2300 1124C2280 1096 2166 1096 2146 1124Z',
          p.white,
          ' fill-opacity=".5"',
        ),
    );
  for (const [fx, fy] of [
    [2160, 1304],
    [2182, 1312],
    [2204, 1314],
    [2226, 1312],
    [2248, 1314],
    [2270, 1310],
    [2292, 1306],
  ]) {
    out += stroke(`M${fx} ${fy}L${fx + 1} ${fy + 22}`, p.blanketStripe, 5);
  }
  return out;
}

function cabinet(p: Palette): string {
  const { x, y, w, h } = CAB;
  const bottom = y + h;
  let out = path(
    roundRect(x + 10, bottom - 14, w - 20, 28, 14),
    p.floorShade,
    ' fill-opacity=".4"',
  );
  for (const fx of [x + 34, x + w - 34])
    out += path(roundRect(fx - 16, bottom - 44, 32, 44, 6), p.woodDark);
  out += path(roundRect(x + 8, y + 20, w - 16, h - 56, 10), p.wood);
  const dw = (w - 48) / 3;
  for (let i = 0; i < 3; i++) {
    const dx = x + 24 + i * dw;
    out +=
      `<path d="${roundRect(dx + 6, y + 44, dw - 12, h - 104, 10)}" fill="${p.woodLight}" stroke="${p.woodDark}" stroke-width="5"/>` +
      path(circle(i === 2 ? dx + 28 : dx + dw - 28, y + h / 2 - 6, 10), p.knob);
  }
  out +=
    path(roundRect(x - 16, y, w + 32, 32, 10), p.woodDark) +
    path(roundRect(x - 16, y, w + 32, 22, 10), p.woodLight);
  return out;
}

function books(
  x0: number,
  x1: number,
  base: number,
  maxH: number,
  p: Palette,
  seed: number,
): string {
  const r = rng(seed);
  const colors = [p.book1, p.book2, p.book3, p.book4, p.book5, p.book6];
  let out = '';
  let x = x0;
  let i = 0;
  while (x < x1 - 20) {
    const bw = Math.min(range(r, 20, 36), x1 - x);
    const bh = range(r, maxH * 0.72, maxH);
    const c = colors[(i * 7 + Math.floor(r() * 3)) % colors.length];
    if (i === 4) {
      out += group(
        path(roundRect(x, base - bh, bw, bh, 4), c) +
          rect(x, base - bh + 16, bw, 6, p.bookBand, ' fill-opacity=".7"'),
        `rotate(14 ${f(x)} ${f(base)})`,
      );
      x += bh * 0.26 + bw;
    } else {
      out +=
        path(roundRect(x, base - bh, bw, bh, 4), c) +
        rect(x, base - bh + 16, bw, 6, p.bookBand, ' fill-opacity=".7"') +
        rect(x, base - 26, bw, 5, p.bookBand, ' fill-opacity=".5"');
      x += bw + 2;
    }
    i++;
  }
  return out;
}

function bookshelf(p: Palette): string {
  const { x, y, w, h } = SHELF;
  const bottom = y + h;
  const mid = y + 218;
  let out = path(roundRect(x + 6, bottom - 14, w - 12, 28, 14), p.floorShade, ' fill-opacity=".4"');
  out += path(roundRect(x, y + 10, w, h - 30, 8), p.shelf);
  out += rect(x + 22, y + 24, w - 44, mid - y - 24, p.shelfBack);
  out += rect(x + 22, mid + 20, w - 44, bottom - mid - 66, p.shelfBack);
  out += books(x + 30, x + w - 30, mid, 170, p, 3);
  out +=
    path('M3238 1300L3394 1300L3384 1394L3248 1394Z', p.basketW) +
    stroke('M3244 1330L3390 1330M3246 1362L3388 1362', p.basketWDark, 5) +
    path(roundRect(3232, 1290, 168, 18, 8), p.basketWDark);
  out +=
    path(roundRect(3414, 1356, 136, 38, 6), p.book2) +
    path(roundRect(3420, 1320, 124, 36, 6), p.book3) +
    path(roundRect(3410, 1286, 132, 34, 6), p.book1) +
    rect(3414, 1370, 136, 6, p.bookBand, ' fill-opacity=".6"');
  out += rect(x + 10, mid, w - 20, 20, p.shelfShade) + rect(x + 10, mid, w - 20, 14, p.shelf);
  out +=
    rect(x + 10, bottom - 46, w - 20, 26, p.shelf) +
    rect(x + 10, bottom - 46, w - 20, 6, p.shelfShade);
  out +=
    path(roundRect(x - 10, y, w + 20, 26, 8), p.shelfShade) +
    path(roundRect(x - 10, y, w + 20, 18, 8), p.shelf);
  out += path(roundRect(x + 4, bottom - 22, w - 8, 22, 6), p.shelfShade);
  return out;
}

function dogBed(p: Palette): string {
  const [x, y] = BED;
  return (
    path(ellipse(x, y + 92, 256, 32), p.floorShade, ' fill-opacity=".4"') +
    path(
      `M${x - 226} ${y + 10}C${x - 236} ${y - 130} ${x + 236} ${y - 130} ${x + 226} ${y + 10}Z`,
      p.bedDark,
    ) +
    path(`M${x - 214} ${y}C${x - 222} ${y - 116} ${x + 222} ${y - 116} ${x + 214} ${y}Z`, p.bed) +
    ring(
      `M${x - 196} ${y - 10}C${x - 200} ${y - 98} ${x + 200} ${y - 98} ${x + 196} ${y - 10}`,
      p.bedLight,
      5,
      ' stroke-dasharray="4 16" stroke-linecap="round"',
    ) +
    path(ellipse(x, y + 24, 240, 92), p.bedDark) +
    path(ellipse(x, y + 16, 236, 86), p.bed) +
    path(ellipse(x, y + 4, 172, 54), p.bedCushionShade) +
    path(ellipse(x, y + 10, 164, 48), p.bedCushion) +
    path(ellipse(x - 40, y - 4, 70, 16), p.white, ' fill-opacity=".5"') +
    path(
      `M${x - 236} ${y + 16}A236 86 0 0 0 ${x + 236} ${y + 16}L${x + 170} ${y + 14}A170 50 0 0 1 ${x - 170} ${y + 14}Z`,
      p.bed,
    ) +
    path(
      `M${x - 236} ${y + 16}A236 86 0 0 0 ${x + 236} ${y + 16}A236 64 0 0 1 ${x - 236} ${y + 16}Z`,
      p.bedDark,
      ' fill-opacity=".4"',
    ) +
    ring(
      `M${x - 206} ${y + 40}A210 62 0 0 0 ${x + 206} ${y + 40}`,
      p.bedLight,
      5,
      ' stroke-dasharray="4 16" stroke-linecap="round"',
    ) +
    bone(x, y + 78, 0.8, 0, p.bedLight)
  );
}

function bowl(x: number, y: number, body: string, inside: string, p: Palette): string {
  return (
    path(ellipse(x, y + 22, 64, 14), p.floorShade, ' fill-opacity=".4"') +
    path(`M${x - 56} ${y - 6}L${x + 56} ${y - 6}L${x + 44} ${y + 24}L${x - 44} ${y + 24}Z`, body) +
    path(ellipse(x, y - 6, 56, 14), body) +
    path(ellipse(x, y - 6, 44, 10), inside) +
    paw(x, y + 10, 0.42, 0, p.white, ' fill-opacity=".85"')
  );
}

function bowls(p: Palette): string {
  let kibble = '';
  const r = rng(7);
  for (let i = 0; i < 9; i++) {
    kibble += path(circle(840 + range(r, -30, 30), 1598 + range(r, -6, 4), 7), p.kibble);
  }
  return (
    bowl(842, 1606, p.bowlRed, p.kibbleDark, p) +
    kibble +
    bowl(970, 1614, p.bowlBlue, p.waterBowl, p)
  );
}

function lightPools(p: Palette, mode: Mode): string {
  if (mode === 'day') return '';
  return (
    `<defs>${radialGlow('ptRoomGlow', p.lampGlow, 0.5)}${radialGlow('ptPoolGlow', p.lampGlow, 0.45)}</defs>` +
    glowAt(LAMP[0], 760, 900, 'ptRoomGlow') +
    glowOval(POOL.x, POOL.y, POOL.rx, POOL.ry, 'ptPoolGlow')
  );
}

function sunArt(p: Palette, mode: Mode): string {
  return mode === 'day'
    ? sun(SUN[0], SUN[1], 82, p.sun, p.sunRay, p.face)
    : moon(SUN[0], SUN[1], 76, p.sun, p.sunRay, p.face);
}

function doghouse(p: Palette): string {
  const [x, y] = DOGHOUSE;
  const hw = 116;
  const wallTop = y - 168;
  const peak = wallTop - 106;
  const roof =
    `M${x - hw - 34} ${wallTop + 30}L${x} ${peak - 8}L${x + hw + 34} ${wallTop + 30}` +
    `L${x + hw + 24} ${wallTop + 60}L${x} ${peak + 28}L${x - hw - 24} ${wallTop + 60}Z`;
  let out = path(ellipse(x, y + 6, hw + 40, 16), p.lawnDark, ' fill-opacity=".75"');
  out += path(
    poly([
      [x - hw, y],
      [x - hw, wallTop],
      [x, peak + 20],
      [x + hw, wallTop],
      [x + hw, y],
    ]),
    p.dogWall,
  );
  for (let k = 1; k < 6; k++) {
    out += stroke(
      `M${x - hw + 8} ${wallTop + k * 28}L${x + hw - 8} ${wallTop + k * 28}`,
      p.dogWallDark,
      4,
      ' stroke-opacity=".6"',
    );
  }
  out += path(arch(x, y, 108, 130), p.dogWallDark) + path(arch(x, y, 88, 118), p.dogHole);
  out += bone(x, wallTop - 32, 0.85, 0, p.bone);
  out +=
    path(roof, p.dogRoofDark) +
    path(
      `M${x - hw - 34} ${wallTop + 30}L${x} ${peak - 8}L${x + hw + 34} ${wallTop + 30}L${x + hw + 30} ${wallTop + 44}L${x} ${peak + 10}L${x - hw - 30} ${wallTop + 44}Z`,
      p.dogRoof,
    );
  out += stroke(
    `M${x - hw - 24} ${wallTop + 40}L${x} ${peak + 4}L${x + hw + 24} ${wallTop + 40}`,
    p.dogRoofDark,
    4,
    ' stroke-opacity=".55"',
  );
  for (const t of [0.25, 0.5, 0.75]) {
    for (const side of [-1, 1]) {
      const ex = x + side * (hw + 30) * t;
      const ey = peak - 8 + (wallTop + 38 - peak) * t;
      out += stroke(
        `M${f(ex)} ${f(ey)}L${f(ex + side * 4)} ${f(ey + 28)}`,
        p.dogRoofDark,
        4,
        ' stroke-opacity=".55"',
      );
    }
  }
  out += path(circle(x, peak - 4, 10), p.dogRoofDark);
  out += path(roundRect(x - hw - 4, y - 14, hw * 2 + 8, 16, 6), p.dogWallDark);
  out +=
    path(ellipse(x + 92, y + 6, 30, 9), p.bowlRed) +
    path(
      `M${x + 64} ${y - 2}L${x + 120} ${y - 2}L${x + 112} ${y + 10}L${x + 72} ${y + 10}Z`,
      p.bowlRed,
    ) +
    path(ellipse(x + 92, y - 2, 24, 6), p.kibbleDark);
  out +=
    grassTuft(x - hw - 14, y + 8, 0.9, p.lawnDark) + grassTuft(x + hw + 18, y + 8, 0.8, p.hedge);
  return out;
}

function lampArt(p: Palette, mode: Mode): string {
  const night = mode === 'night';
  const [x, y] = LAMP;
  const top = 636;
  const low = 800;
  const shadeD =
    `M${x - 64} ${top}L${x + 64} ${top}Q${x + 72} ${top} ${x + 74} ${top + 8}` +
    `L${x + 98} ${low - 10}Q${x + 100} ${low} ${x + 90} ${low}L${x - 90} ${low}` +
    `Q${x - 100} ${low} ${x - 98} ${low - 10}L${x - 74} ${top + 8}Q${x - 72} ${top} ${x - 64} ${top}Z`;
  let out = `<defs>${radialGlow('ptLampHalo', p.lampGlow, 0.8)}</defs>`;
  if (night) out += glowAt(x, 730, 250, 'ptLampHalo');
  out += path(ellipse(x, y + 6, 90, 18), p.floorShade, ' fill-opacity=".4"');
  out += path(ellipse(x, y - 4, 68, 18), p.brassDark) + path(ellipse(x, y - 10, 62, 14), p.brass);
  out += path(roundRect(x - 8, low - 24, 16, y - low + 12, 8), p.brass);
  out += stroke(`M${x - 3} ${low}L${x - 3} ${y - 16}`, p.brassLight, 3, ' stroke-opacity=".8"');
  out += path(roundRect(x - 14, 1060, 28, 18, 8), p.brassDark);
  out += path(ellipse(x, low - 2, 92, 16), night ? p.lampGlow : p.shadeDark);
  out += path(shadeD, p.shade);
  out += clipped(
    'ptShadeClip',
    shadeD,
    rect(x - 110, low - 34, 220, 16, p.shadeBand) +
      rect(x - 110, top + 14, 220, 8, p.shadeBand, ' fill-opacity=".7"') +
      (night
        ? ''
        : path(
            poly([
              [x + 30, top],
              [x + 76, top],
              [x + 104, low],
              [x + 46, low],
            ]),
            p.shadeDark,
            ' fill-opacity=".6"',
          )),
  );
  return out;
}

function sisalPost(id: string, x: number, y0: number, y1: number, w: number, p: Palette): string {
  const d = roundRect(x - w / 2, y0, w, y1 - y0, 6);
  let lines = '';
  for (let y = y0 - w; y < y1 + w; y += 14) {
    lines += stroke(
      `M${f(x - w / 2 - 4)} ${f(y + 10)}L${f(x + w / 2 + 4)} ${f(y)}`,
      p.sisalDark,
      4,
      ' stroke-opacity=".6"',
    );
  }
  return path(d, p.sisal) + clipped(id, d, lines);
}

function platform(x: number, y: number, w: number, p: Palette): string {
  return (
    path(roundRect(x, y, w, 36, 16), p.carpetDark) +
    path(roundRect(x, y, w, 26, 13), p.carpet) +
    path(roundRect(x + 14, y + 4, w - 28, 8, 4), p.carpetLight, ' fill-opacity=".8"')
  );
}

function catTree(p: Palette): string {
  let out = path(ellipse(1155, 1444, 196, 22), p.floorShade, ' fill-opacity=".4"');
  out += sisalPost('ptSisalA', 1041, 1110, 1400, 52, p);
  out += sisalPost('ptSisalB', 1085, 640, 1104, 52, p);
  out += sisalPost('ptSisalC', 1266, 880, 1200, 52, p);
  out += platform(985, 1392, 340, p);
  out +=
    path(roundRect(1150, 1196, 170, 204, 22), p.carpetDark) +
    path(roundRect(1150, 1196, 164, 198, 22), p.carpet) +
    path(circle(1232, 1300, 52), p.carpetDark) +
    path(circle(1232, 1302, 46), p.cubbyHole);
  out += platform(970, 1094, 214, p);
  out += platform(1136, 862, 202, p);
  out += stroke('M1310 896L1310 996', p.string, 3);
  out +=
    path(scallop(1310, 1020, 23, 18, 3), p.pompomDark) +
    path(scallop(1308, 1017, 20, 16, 3), p.pompom) +
    path(circle(1301, 1010, 7), p.white, ' fill-opacity=".55"');
  out +=
    stroke('M1000 1128Q1004 1170 996 1200', p.string, 3) +
    path(scallop(996, 1214, 17, 14, 3), p.tie) +
    stroke(curve(984, 1206, 1006, 1224, 6), p.tieDark, 3) +
    stroke(curve(988, 1222, 1010, 1204, -6), p.tieDark, 3);
  out +=
    path('M976 606Q984 676 1094 680Q1204 676 1212 606Z', p.carpetDark) +
    path('M992 606Q1000 650 1094 654Q1188 650 1196 606Z', p.cushion) +
    path(roundRect(970, 594, 248, 26, 13), p.carpet) +
    path(roundRect(984, 598, 220, 8, 4), p.carpetLight, ' fill-opacity=".8"');
  return out;
}

function tankBox(
  id: string,
  x: number,
  y: number,
  w: number,
  h: number,
  surfaceOffset: number,
  water: string,
  p: Palette,
  mode: Mode,
): string {
  const night = mode === 'night';
  const bottom = y + h;
  const top = y + 28;
  const surface = y + surfaceOffset;
  const glassD = roundRect(x, top, w, bottom - top, 10);
  const inner = roundRect(x + 6, surface, w - 12, bottom - surface - 6, 6);
  let out = `<defs>${linearGradient(`${id}Water`, [
    [0, p.water],
    [1, p.waterDeep],
  ])}${radialGlow(`${id}Glow`, p.tankGlow, 0.55)}</defs>`;
  if (night) out += glowOval(x + w / 2, y + h / 2 + 20, w * 0.62, h * 0.58, `${id}Glow`);
  out += path(glassD, p.waterTop);
  out += clipped(
    `${id}Clip`,
    inner,
    rect(x, surface - 10, w, bottom - surface + 10, `url(#${id}Water)`) + water,
  );
  const waves = Math.floor((w - 16) / 40);
  const step = (w - 16) / waves;
  let wave = `M${x + 8} ${surface}`;
  for (let k = 0; k < waves; k++) wave += `q${f(step / 4)} -6 ${f(step / 2)} 0t${f(step / 2)} 0`;
  out += stroke(wave, p.waterTop, 6, ' stroke-opacity=".9"');
  out += ring(glassD, p.glassEdge, 10);
  out +=
    path(
      poly([
        [x + w - 70, top + 20],
        [x + w - 46, top + 20],
        [x + w - 92, bottom - 30],
        [x + w - 116, bottom - 30],
      ]),
      p.glassShine,
      ' fill-opacity=".3"',
    ) +
    path(
      poly([
        [x + w - 34, top + 20],
        [x + w - 24, top + 20],
        [x + w - 64, bottom - 30],
        [x + w - 74, bottom - 30],
      ]),
      p.glassShine,
      ' fill-opacity=".3"',
    );
  out +=
    path(roundRect(x - 10, y, w + 20, 34, 10), p.lid) +
    rect(x + 6, y + 8, w - 12, 8, p.lidLight, ' fill-opacity=".8"');
  out += path(roundRect(x - 6, bottom - 14, w + 12, 16, 6), p.lid);
  return out;
}

function gravel(
  x0: number,
  x1: number,
  base: number,
  depth: number,
  p: Palette,
  seed: number,
): string {
  const r = rng(seed);
  const pts: Pt[] = [];
  for (let x = x0 - 20; x <= x1 + 20; x += 40) pts.push([x, base - depth + range(r, -6, 6)]);
  let out = path(
    `${smooth(pts, false)}L${x1 + 20} ${base + 10}L${x0 - 20} ${base + 10}Z`,
    p.gravel,
  );
  const colors = [p.gravelA, p.gravelB, p.gravelC, p.gravelD];
  for (let i = 0; i < (x1 - x0) / 7; i++) {
    out += path(
      ellipse(range(r, x0, x1), range(r, base - depth + 10, base), range(r, 6, 10), range(r, 5, 8)),
      colors[i % 4],
    );
  }
  return out;
}

function castle(x: number, base: number, p: Palette): string {
  const tower = (cx: number, w: number, h: number, c: string) => {
    let t = rect(cx - w / 2, base - h, w, h, c);
    for (let i = 0; i < 3; i++) {
      t += rect(cx - w / 2 + (i * w) / 3 + 2, base - h - 14, w / 3 - 4, 16, c);
    }
    return t;
  };
  return (
    tower(x - 34, 30, 92, p.castleDark) +
    tower(x + 34, 30, 92, p.castleDark) +
    tower(x, 46, 124, p.castle) +
    path(arch(x, base, 24, 40), p.castleDoor) +
    path(arch(x, base - 82, 12, 20), p.castleDoor) +
    path(arch(x - 34, base - 54, 10, 16), p.castleDoor) +
    path(arch(x + 34, base - 54, 10, 16), p.castleDoor) +
    path(
      poly([
        [x - 2, base - 140],
        [x - 2, base - 172],
        [x + 22, base - 162],
        [x - 2, base - 152],
      ]),
      p.flowerA,
    ) +
    stroke(`M${x - 2} ${base - 138}L${x - 2} ${base - 172}`, p.castleDoor, 3)
  );
}

function bubbles(pts: [number, number, number][], p: Palette): string {
  return pts
    .map(
      ([bx, by, r]) =>
        `<path d="${circle(bx, by, r)}" fill="${p.bubble}" fill-opacity=".3" stroke="${p.bubble}" stroke-width="${f(r * 0.3)}" stroke-opacity=".9"/>` +
        path(circle(bx - r * 0.35, by - r * 0.35, r * 0.28), p.bubble),
    )
    .join('');
}

function fishTank(p: Palette, mode: Mode): string {
  const { x, y, w, h } = TANK;
  const bottom = y + h;
  const water =
    path(
      poly([
        [x + 70, y + 60],
        [x + 130, y + 60],
        [x + 200, bottom],
        [x + 110, bottom],
      ]),
      p.waterTop,
      ' fill-opacity=".18"',
    ) +
    path(
      poly([
        [x + 200, y + 60],
        [x + 236, y + 60],
        [x + 300, bottom],
        [x + 250, bottom],
      ]),
      p.waterTop,
      ' fill-opacity=".14"',
    ) +
    seaweed(x + 40, bottom - 30, 230, 1, p.weedDark, 1) +
    seaweed(x + 72, bottom - 30, 170, 0.9, p.weed, 3) +
    seaweed(x + 26, bottom - 30, 140, 0.8, p.weed, 5) +
    seaweed(x + w - 34, bottom - 30, 200, 0.9, p.weedDark, 2) +
    castle(x + w - 108, bottom - 34, p) +
    seaweed(x + w - 150, bottom - 30, 120, 0.8, p.weed, 4) +
    gravel(x, x + w, bottom - 6, 44, p, 13) +
    path(roundRect(x + 124, bottom - 52, 34, 18, 8), p.stoneShade) +
    bubbles(
      [
        [x + 140, bottom - 70, 7],
        [x + 148, bottom - 112, 9],
        [x + 136, bottom - 160, 8],
        [x + 146, bottom - 214, 11],
        [x + 138, bottom - 268, 9],
        [x + 146, bottom - 310, 12],
      ],
      p,
    );
  return tankBox('ptTank', x, y, w, h, 66, water, p, mode);
}

function axolotlTank(p: Palette, mode: Mode): string {
  const { x, y, w, h } = AXO;
  const bottom = y + h;
  const water =
    seaweed(x + 30, bottom - 26, 120, 0.8, p.weedDark, 6) +
    seaweed(x + 52, bottom - 26, 86, 0.7, p.weed, 8) +
    path(
      `M${x + w - 120} ${bottom - 20}C${x + w - 120} ${bottom - 96} ${x + w - 10} ${bottom - 96} ${x + w - 10} ${bottom - 20}Z`,
      p.log,
    ) +
    path(
      `M${x + w - 100} ${bottom - 20}C${x + w - 100} ${bottom - 72} ${x + w - 30} ${bottom - 72} ${x + w - 30} ${bottom - 20}Z`,
      p.logDark,
    ) +
    stroke(
      `M${x + w - 112} ${bottom - 60}Q${x + w - 66} ${bottom - 104} ${x + w - 18} ${bottom - 60}`,
      p.logLight,
      5,
      ' stroke-opacity=".7"',
    ) +
    gravel(x, x + w, bottom - 6, 34, p, 21) +
    path(circle(x + 92, bottom - 34, 16), p.moss) +
    path(circle(x + 118, bottom - 30, 11), p.mossDark) +
    bubbles(
      [
        [x + 60, bottom - 120, 6],
        [x + 70, bottom - 150, 8],
        [x + 62, bottom - 180, 6],
      ],
      p,
    );
  return tankBox('ptAxo', x, y, w, h, 52, water, p, mode);
}

function hamsterCage(p: Palette): string {
  const { x, y, w, h } = CAGE;
  const trayTop = y + 212;
  const bottom = y + h;
  const doorL = x + 162;
  const doorR = x + 278;
  const doorTop = trayTop - 118;
  const [wx, wy] = [x + 84, y + 122];
  let out = path(roundRect(x + 4, bottom - 6, w - 8, 14, 7), p.shelfShade);
  out += path(roundRect(x + 14, y + 20, w - 28, trayTop - y, 40), p.cageBack);
  out += path(scallop(x + w / 2, trayTop + 2, 1, 14, 9, 180, w / 2 - 22, 16), p.bedding);
  out +=
    path(
      poly([
        [wx - 44, trayTop],
        [wx - 10, wy],
        [wx + 10, wy],
        [wx + 44, trayTop],
      ]),
      p.wheelDark,
    ) +
    `<g data-spin="" style="transform-origin: ${wx}px ${wy}px">` +
    ring(circle(wx, wy, 64), p.wheel, 14) +
    ring(circle(wx, wy, 52), p.wheelDark, 4) +
    [0, 45, 90, 135]
      .map((a) => {
        const r = (a * Math.PI) / 180;
        return stroke(
          `M${f(wx - Math.cos(r) * 56)} ${f(wy - Math.sin(r) * 56)}L${f(wx + Math.cos(r) * 56)} ${f(wy + Math.sin(r) * 56)}`,
          p.wheel,
          6,
        );
      })
      .join('') +
    `</g>` +
    path(circle(wx, wy, 12), p.wheelDark);
  out +=
    path(arch(x + w - 52, trayTop, 70, 74), p.hut) +
    path(arch(x + w - 52, trayTop, 32, 38), p.hutDark) +
    path(
      poly([
        [x + w - 96, trayTop - 42],
        [x + w - 52, trayTop - 88],
        [x + w - 8, trayTop - 42],
      ]),
      p.hutDark,
    ) +
    path(roundRect(x + w - 96, trayTop - 48, 88, 12, 6), p.hutDark) +
    path(ellipse(x + 210, trayTop - 6, 26, 9), p.bowlRed) +
    path(ellipse(x + 210, trayTop - 10, 20, 5), p.kibble);
  let bars = '';
  for (let bx = x + 26; bx < x + w - 18; bx += 18) {
    const end = bx > doorL && bx < doorR ? doorTop : trayTop;
    bars += stroke(`M${bx} ${y + 34}L${bx} ${end}`, p.bars, 4);
  }
  out += bars;
  out += ring(roundRect(x + 14, y + 20, w - 28, trayTop - y + 20, 40), p.bars, 9);
  out += stroke(
    `M${x + 16} ${y + 104}L${doorL} ${y + 104}M${doorR} ${y + 104}L${x + w - 16} ${y + 104}`,
    p.bars,
    6,
  );
  out += ring(roundRect(doorL, doorTop, doorR - doorL, trayTop - doorTop, 6), p.bars, 7);
  const swing = 52;
  const doorD = `M${doorL} ${doorTop}L${doorL - swing} ${doorTop + 12}L${doorL - swing} ${trayTop - 8}L${doorL} ${trayTop}Z`;
  let door = path(doorD, p.cageBack);
  for (let k = 1; k < 4; k++) {
    const t = k / 4;
    door += stroke(
      `M${f(doorL - swing * t)} ${f(doorTop + 12 * t)}L${f(doorL - swing * t)} ${f(trayTop - 8 * t)}`,
      p.bars,
      4,
    );
  }
  out +=
    door +
    ring(doorD, p.bars, 7) +
    path(circle(doorL - swing + 8, (doorTop + trayTop) / 2 + 4, 6), p.trayDark);
  out +=
    stroke(`M${x + w - 2} ${y + 132}L${x + w - 26} ${y + 156}`, p.barsShade, 6) +
    path(roundRect(x + w - 12, y + 44, 24, 92, 11), p.bottle, ' fill-opacity=".9"') +
    path(roundRect(x + w - 12, y + 92, 24, 44, 9), p.waterBowl) +
    path(roundRect(x + w - 14, y + 34, 28, 16, 6), p.bottleCap);
  out += path(roundRect(x + w / 2 - 40, y + 2, 80, 24, 12), p.trayDark);
  out += path(roundRect(x, trayTop, w, bottom - trayTop, 18), p.trayDark);
  out += path(roundRect(x, trayTop, w, bottom - trayTop - 9, 18), p.tray);
  out += path(roundRect(x + 30, trayTop + 12, w - 60, 8, 4), p.white, ' fill-opacity=".35"');
  out += paw(x + w / 2, trayTop + 34, 0.8, 0, p.white, ' fill-opacity=".6"');
  return out;
}

function toyBasket(p: Palette, mode: Mode): string {
  const [x, y] = BASKET;
  const top = y - 150;
  const body = `M${x - 132} ${top}L${x + 132} ${top}L${x + 108} ${y - 8}Q${x + 104} ${y} ${x + 94} ${y}L${x - 94} ${y}Q${x - 104} ${y} ${x - 108} ${y - 8}Z`;
  let weave = '';
  for (let k = 0; k < 6; k++) {
    weave += stroke(
      `M${x - 140} ${top + 18 + k * 24}L${x + 140} ${top + 18 + k * 24}`,
      p.wickerDark,
      5,
      ' stroke-opacity=".7"',
    );
  }
  for (let k = -6; k <= 6; k++) {
    weave += stroke(
      `M${x + k * 22} ${top}L${x + k * 18} ${y}`,
      p.wickerDark,
      4,
      ' stroke-opacity=".45"',
    );
  }
  let out = path(ellipse(x, y + 6, 140, 22), p.floorShade, ' fill-opacity=".4"');
  const ropeD = tube(
    [
      [x - 56, top + 30],
      [x - 74, top - 30],
      [x - 92, top - 78],
    ],
    14,
  );
  let twists = '';
  for (let k = 0; k < 9; k++) {
    const cy = top + 34 - k * 13;
    twists += stroke(`M${x - 110} ${cy}L${x - 40} ${cy - 30}`, p.ropeRed, 7);
  }
  out +=
    path(ropeD, p.rope) +
    clipped('ptRopeClip', ropeD, twists) +
    path(circle(x - 94, top - 84, 22), p.ropeRed) +
    path(circle(x - 100, top - 90, 8), p.rope, ' fill-opacity=".6"') +
    [-34, -14, 6]
      .map((a) =>
        stroke(
          `M${x - 98} ${top - 102}l${f(Math.cos(((a - 90) * Math.PI) / 180) * 30)} ${f(Math.sin(((a - 90) * Math.PI) / 180) * 30)}`,
          p.rope,
          6,
        ),
      )
      .join('');
  const toyBone = bone(x + 54, top - 46, 1.6, -64, p.toyBone);
  out += toyBone;
  out +=
    path(circle(x - 10, top - 18, 46), p.ball) +
    stroke(curve(x - 54, top - 30, x + 34, top - 30, 16), p.ballStripe, 9) +
    path(circle(x - 24, top - 38, 9), p.white, ' fill-opacity=".6"');
  out +=
    path(circle(x + 92, top - 14, 30), p.tennis) +
    stroke(curve(x + 66, top - 30, x + 100, top + 12, -14), p.white, 5);
  out += path(body, p.wicker) + clipped('ptBasketClip', body, weave);
  out +=
    path(roundRect(x - 142, top - 12, 284, 30, 15), p.wickerDark) +
    path(roundRect(x - 142, top - 12, 284, 22, 11), p.wicker);
  out +=
    ring(ellipse(x - 150, top + 40, 18, 26), p.wickerDark, 8) +
    ring(ellipse(x + 150, top + 40, 18, 26), p.wickerDark, 8);
  if (mode === 'night') {
    const lit = [
      body,
      roundRect(x - 142, top - 12, 284, 30, 15),
      circle(x - 10, top - 18, 46),
      circle(x + 92, top - 14, 30),
      ropeD,
      circle(x - 94, top - 84, 22),
      ...[...toyBone.matchAll(/ d="([^"]+)"/g)].map((m) => m[1]),
    ];
    const k = POOL.ry / POOL.rx;
    out +=
      `<defs><radialGradient id="ptBasketLight" gradientUnits="userSpaceOnUse" cx="${POOL.x}" cy="${POOL.y}" r="${POOL.rx}" gradientTransform="translate(0 ${f(POOL.y * (1 - k))}) scale(1 ${f(k)})"><stop offset="0" stop-color="${p.lampGlow}" stop-opacity=".45"/><stop offset="1" stop-color="${p.lampGlow}" stop-opacity="0"/></radialGradient>` +
      `<clipPath id="ptBasketLit">${lit.map((d) => `<path d="${d}"/>`).join('')}</clipPath></defs>` +
      group(
        rect(x - 170, top - 130, 340, y - top + 140, 'url(#ptBasketLight)'),
        '',
        ' clip-path="url(#ptBasketLit)"',
      );
  }
  return out;
}

function monsteraLeaf(
  bx: number,
  by: number,
  len: number,
  angle: number,
  color: string,
  vein: string,
): string {
  const a = (angle * Math.PI) / 180;
  const T = (u: number, v: number): Pt => [
    bx + (u * Math.cos(a) - v * Math.sin(a)) * len,
    by + (u * Math.sin(a) + v * Math.cos(a)) * len,
  ];
  const half: [number, number][] = [
    [-0.04, 0.2],
    [0.04, 0.4],
    [0.22, 0.5],
    [0.44, 0.5],
    [0.66, 0.4],
    [0.86, 0.22],
  ];
  const outline = smooth(
    [
      T(0.07, 0),
      ...half.map(([u, v]) => T(u, -v)),
      T(1, 0),
      ...half
        .slice()
        .reverse()
        .map(([u, v]) => T(u, v)),
    ],
    true,
  );
  let holes = '';
  for (const [u, v, rx] of [
    [0.3, 0.27, 0.1],
    [0.52, 0.27, 0.09],
    [0.72, 0.2, 0.07],
  ] as [number, number, number][]) {
    for (const side of [-1, 1]) {
      const [hx, hy] = T(u, side * v);
      holes += ellipse(hx, hy, rx * len, 0.028 * len, angle + side * 52);
    }
  }
  let veins = stroke(
    `M${f(T(0.07, 0)[0])} ${f(T(0.07, 0)[1])}L${f(T(0.94, 0)[0])} ${f(T(0.94, 0)[1])}`,
    vein,
    0.024 * len,
  );
  for (const u of [0.2, 0.42, 0.62, 0.8]) {
    for (const side of [-1, 1]) {
      const [x0, y0] = T(u, 0);
      const [x1, y1] = T(u + 0.12, side * 0.32 * (1 - u * 0.5));
      veins += stroke(
        `M${f(x0)} ${f(y0)}L${f(x1)} ${f(y1)}`,
        vein,
        0.012 * len,
        ' stroke-opacity=".7"',
      );
    }
  }
  return `<path d="${outline}${holes}" fill="${color}" fill-rule="evenodd"/>` + veins;
}

const MONSTERA: [number, number, number, number, number][] = [
  [92, 1180, 196, -128, 0],
  [96, 1060, 236, -100, 1],
  [146, 1110, 226, -66, 0],
  [150, 1210, 206, -36, 1],
  [170, 1300, 180, -10, 0],
  [70, 1290, 170, -158, 1],
];

function plant(p: Palette): string {
  const [x, y] = PLANT;
  const potTop = y - 150;
  let out = path(ellipse(x, y + 4, 110, 18), p.floorShade, ' fill-opacity=".4"');
  for (const [bx, by, len, angle, dark] of MONSTERA) {
    out += path(
      tube(
        [
          [x + (bx - x) * 0.1, potTop + 10],
          [x + (bx - x) * 0.6, (potTop + by) / 2],
          [bx, by],
        ],
        6,
      ),
      p.stem,
    );
    out += monsteraLeaf(bx, by, len, angle, dark ? p.leafGDark : p.leafG, p.leafVein);
  }
  out +=
    path(`M${x - 84} ${potTop}L${x + 84} ${potTop}L${x + 64} ${y}L${x - 64} ${y}Z`, p.pot) +
    path(
      `M${x + 20} ${potTop}L${x + 84} ${potTop}L${x + 64} ${y}L${x + 30} ${y}Z`,
      p.potDark,
      ' fill-opacity=".45"',
    ) +
    path(roundRect(x - 92, potTop - 12, 184, 32, 12), p.potRim) +
    stroke(
      `M${x - 70} ${potTop + 70}L${x + 70} ${potTop + 70}`,
      p.potDark,
      8,
      ' stroke-opacity=".5"',
    );
  return out;
}

const interactives: Interactive[] = [
  {
    id: 'sun',
    box: [SUN[0] - 214, SUN[1] - 214, 428, 428],
    kind: 'spin',
    origin: SUN,
    effect: 'sparkle',
    sound: 'shine',
    night: { kind: 'rock', effect: 'stars', sound: 'twinkle' },
    render: (p, mode) => sunArt(p, mode),
  },
  {
    id: 'doghouse',
    box: [552, 918, 352, 362],
    kind: 'wiggle',
    origin: [DOGHOUSE[0], DOGHOUSE[1] + 6],
    effect: 'hearts',
    effectAt: [DOGHOUSE[0], 1010],
    sound: 'creak',
    render: (p) => doghouse(p),
  },
  {
    id: 'lamp',
    box: [2125, 470, 520, 1010],
    kind: 'glow',
    effect: 'sparkle',
    effectAt: [LAMP[0], 720],
    sound: 'click',
    night: { effect: 'stars' },
    render: (p, mode) => lampArt(p, mode),
  },
  {
    id: 'cat-tree',
    box: [936, 562, 438, 922],
    kind: 'shake',
    origin: CAT_TREE,
    effect: 'stars',
    effectAt: [1150, 700],
    sound: 'boing',
    render: (p) => catTree(p),
  },
  {
    id: 'fish-tank',
    box: [2440, 690, 500, 470],
    kind: 'pulse',
    origin: [TANK.x + TANK.w / 2, TANK.y + TANK.h],
    effect: 'bubbles',
    effectAt: [TANK.x + TANK.w / 2, TANK.y + 180],
    sound: 'bubble',
    render: (p, mode) => fishTank(p, mode),
  },
  {
    id: 'axolotl-tank',
    box: [2866, 872, 340, 272],
    kind: 'pulse',
    origin: [AXO.x + AXO.w / 2, AXO.y + AXO.h],
    effect: 'bubbles',
    effectAt: [AXO.x + AXO.w / 2, AXO.y + 90],
    sound: 'splash',
    render: (p, mode) => axolotlTank(p, mode),
  },
  {
    id: 'hamster-cage',
    box: [3190, 696, 410, 318],
    kind: 'pulse',
    origin: [CAGE.x + CAGE.w / 2, CAGE.y + CAGE.h],
    effect: 'hearts',
    effectAt: [CAGE.x + CAGE.w / 2, CAGE.y + 90],
    sound: 'whirr',
    render: (p) => hamsterCage(p),
  },
  {
    id: 'toy-basket',
    box: [2498, 1428, 384, 354],
    kind: 'bounce',
    origin: [BASKET[0], BASKET[1] + 6],
    effect: 'notes',
    effectAt: [BASKET[0], BASKET[1] - 200],
    sound: 'boing',
    render: (p, mode) => toyBasket(p, mode),
  },
  {
    id: 'plant',
    box: [-110, 800, 480, 790],
    kind: 'sway',
    origin: [PLANT[0], PLANT[1]],
    effect: 'leaves',
    effectAt: [PLANT[0] + 40, 900],
    sound: 'rustle',
    render: (p) => plant(p),
  },
];

const day: Palette = {
  wall: '#ffe4c9',
  wallPaw: '#fbd3b0',
  wallShade: '#f0c49e',
  ceiling: '#fff4e6',
  trim: '#fffaf3',
  trimShade: '#ecd8c0',
  floor: '#e5ae78',
  floorB: '#dda26b',
  floorC: '#ebb986',
  plank: '#c98f5a',
  floorShade: '#a8713f',
  skyTop: '#7cc8f2',
  skyBottom: '#d7f0fb',
  star: '#fff6d6',
  cloud: '#ffffff',
  cloudShade: '#e3f1f8',
  sun: '#ffd34d',
  sunRay: '#ffc531',
  face: '#8a4b1f',
  hillFar: '#a9d98e',
  hillNear: '#8ccc6c',
  tree: '#6fbf5a',
  treeDark: '#58a847',
  trunk: '#9a6a44',
  houseWall: '#fff1dc',
  houseRoof: '#e8685a',
  houseWin: '#8fc8e8',
  houseDoor: '#b07a52',
  windowGlow: '#ffcf5a',
  frame: '#ffffff',
  frameShade: '#e2e7ee',
  glassShine: '#ffffff',
  curtain: '#ff9fb5',
  curtainDark: '#ee7f99',
  curtainDot: '#fff4f6',
  tie: '#ffd45e',
  tieDark: '#efb93c',
  rod: '#c8955f',
  rodDark: '#a87643',
  wire: '#6f7d5c',
  bulbA: '#ffd84d',
  bulbB: '#ff9fc0',
  bulbC: '#8fe3c8',
  bulbD: '#9fc8ff',
  bulbGlow: '#ffe28a',
  lawn: '#97d16a',
  lawnLight: '#b4e08a',
  lawnDark: '#76b64c',
  hedge: '#74b85a',
  hedgeDark: '#5ea348',
  fence: '#fffaf1',
  fenceShade: '#e6dccb',
  flowerA: '#ff7f8f',
  flowerB: '#ffd24d',
  flowerC: '#c79bff',
  flowerCenter: '#ffb43c',
  stone: '#e2dbcd',
  stoneShade: '#bdb4a3',
  firefly: '#fff5a0',
  dogWall: '#f7c873',
  dogWallDark: '#e0a852',
  dogRoof: '#e5574a',
  dogRoofDark: '#c4453a',
  dogHole: '#5c3a2b',
  bone: '#fffaf0',
  bowlRed: '#ef5b5b',
  bowlBlue: '#5aa9e6',
  kibble: '#b9773f',
  kibbleDark: '#8e5a30',
  waterBowl: '#bfe9ff',
  track: '#cfc8bf',
  trackDark: '#a39c93',
  handle: '#9aa3ad',
  mat: '#dcb47e',
  matDark: '#bf9460',
  hook: '#c8955f',
  hookDark: '#a87643',
  leash: '#ef5b5b',
  collar: '#5a9fe6',
  tag: '#ffd34d',
  clockRim: '#5cb8c2',
  clockFace: '#fffdf8',
  clockHand: '#4a4560',
  pictureFrame: '#c8955f',
  pictureFrame2: '#ffd25e',
  pictureBg: '#c9ecd9',
  pictureBg2: '#ffd9e2',
  pawPink: '#ff8fa8',
  sofa: '#5cb8c2',
  sofaDark: '#4598a3',
  sofaLight: '#7fcfd6',
  leg: '#a0683e',
  pillowPink: '#ff9fb2',
  pillowPinkDark: '#ee8199',
  pillowYellow: '#ffd25e',
  pillowYellowDark: '#eeb53c',
  blanket: '#fff1d8',
  blanketStripe: '#ffb3c1',
  blanketStripe2: '#9fdcc8',
  carpet: '#ecdcc6',
  carpetDark: '#d1bb9e',
  carpetLight: '#f8eedf',
  sisal: '#ddb27a',
  sisalDark: '#bd8d55',
  cubbyHole: '#7a5a46',
  cushion: '#ffb3c6',
  pompom: '#ff8fb0',
  pompomDark: '#ec6f94',
  string: '#c79a6a',
  brass: '#d6a54a',
  brassDark: '#b08435',
  brassLight: '#f6d58a',
  shade: '#fff4dc',
  shadeDark: '#efd8ae',
  shadeBand: '#ff9fb2',
  lampGlow: '#ffd97a',
  wood: '#d9a46c',
  woodDark: '#b98450',
  woodLight: '#e8b985',
  knob: '#f6d58a',
  lid: '#41566b',
  lidLight: '#6a86a2',
  water: '#94ddee',
  waterDeep: '#4fb0d6',
  waterTop: '#e2f7fb',
  glassEdge: '#c4ecf4',
  gravel: '#d9c8b2',
  gravelA: '#ffb0c4',
  gravelB: '#ffe08a',
  gravelC: '#a8d8ff',
  gravelD: '#fff6ea',
  weed: '#5ec47a',
  weedDark: '#3fa860',
  castle: '#f7b6c8',
  castleDark: '#e396ad',
  castleDoor: '#7a4a5a',
  bubble: '#ffffff',
  tankGlow: '#7fe8ff',
  log: '#a8744a',
  logDark: '#7e5434',
  logLight: '#c99566',
  moss: '#8fd46a',
  mossDark: '#6dbb4c',
  shelf: '#fff7ec',
  shelfShade: '#e6d3ba',
  shelfBack: '#f1dfc6',
  book1: '#ef6f6c',
  book2: '#5aa9e6',
  book3: '#ffd166',
  book4: '#7bcf8e',
  book5: '#b48ce6',
  book6: '#ff9f5a',
  bookBand: '#fff8ea',
  basketW: '#d9b07a',
  basketWDark: '#b98e58',
  cageBack: '#e8f4fb',
  tray: '#7fc6f4',
  trayDark: '#5aa9de',
  bars: '#ffffff',
  barsShade: '#c3ced8',
  bedding: '#fff0cf',
  wheel: '#ffcf4a',
  wheelDark: '#e8a92c',
  hut: '#e8b27a',
  hutDark: '#c48852',
  bottle: '#d4f1ff',
  bottleCap: '#ff8fa8',
  wicker: '#e2b67e',
  wickerDark: '#c0915a',
  ball: '#ff6b6b',
  ballStripe: '#ffffff',
  tennis: '#d8ec5a',
  toyBone: '#6ab8ff',
  rope: '#f2e2c4',
  ropeRed: '#ef6f6c',
  pot: '#f08f64',
  potDark: '#c96a44',
  potRim: '#f6a27c',
  potSmall: '#f6f1ea',
  potSmallRim: '#e6ddd1',
  leafG: '#4fae5f',
  leafGDark: '#3b9450',
  leafVein: '#8bd894',
  stem: '#4b9a52',
  cactus: '#7cc47a',
  rugA: '#ff9fb2',
  rugB: '#fff1dc',
  rugC: '#9fdcc8',
  rugD: '#ffd970',
  rugDash: '#ffffff',
  bed: '#f78f7c',
  bedDark: '#de6f5c',
  bedLight: '#ffb2a2',
  bedCushion: '#fff1de',
  bedCushionShade: '#ecd6ba',
  white: '#ffffff',
};

const dusk = (hex: string): string => mix(nightColor(hex), '#33284d', 0.3);
const glowing = (hex: string): string => mix(hex, nightColor(hex), 0.42);
const TANK_KEYS = new Set([
  'gravel',
  'gravelA',
  'gravelB',
  'gravelC',
  'gravelD',
  'weed',
  'weedDark',
  'castle',
  'castleDark',
  'castleDoor',
  'log',
  'logDark',
  'logLight',
  'moss',
  'mossDark',
]);

const night: Palette = {
  ...Object.fromEntries(
    Object.entries(day).map(([k, v]) => [k, TANK_KEYS.has(k) ? glowing(v) : dusk(v)]),
  ),
  ceiling: '#423c6c',
  skyTop: '#0c1844',
  skyBottom: '#2c3f86',
  star: '#fff6d6',
  cloud: '#4b5b9e',
  cloudShade: '#3b4987',
  sun: '#fff1c0',
  sunRay: '#ffe9a8',
  face: '#7a5a34',
  houseWin: '#ffd761',
  windowGlow: '#ffc94a',
  glassShine: '#cfe0ff',
  bulbA: '#ffe066',
  bulbB: '#ffb3d0',
  bulbC: '#b0ffe4',
  bulbD: '#c8e0ff',
  bulbGlow: '#ffe28a',
  firefly: '#fff5a0',
  shade: '#ffe9a8',
  shadeBand: '#ffb08f',
  lampGlow: '#ffcf6a',
  water: '#3fb6d8',
  waterDeep: '#1f74b4',
  waterTop: '#a8ecf8',
  tankGlow: '#5fe0ff',
  glassEdge: '#7fd0e6',
  bubble: '#e8fbff',
};

const pets: SceneDef = {
  id: 'pets',
  world: [W, H],
  horizon: 760,
  stickerScale: 1.3,
  ambient: { sparkles: 6 },
  defaults: [
    { animal: 'dog', x: 545, y: 1562, scale: 1.3 },
    { animal: 'cat', x: 1095, y: 536, scale: 1.3 },
    { animal: 'chinchilla', x: 1236, y: 810, scale: 1.3, flip: true },
    { animal: 'hamster', x: 3430, y: 888, scale: 1.3, flip: true },
    { animal: 'goldfish', x: 2690, y: 905, scale: 1.3, flip: true },
    { animal: 'axolotl', x: 3035, y: 1030, scale: 1 },
    { animal: 'budgie', x: 1640, y: 852, scale: 1.3 },
    { animal: 'parrot', x: 2470, y: 380, scale: 1.3, flip: true },
    { animal: 'rabbit', x: 1010, y: 1770, scale: 1.3 },
    { animal: 'guinea-pig', x: 2150, y: 1696, scale: 1.3, flip: true },
    { animal: 'tortoise', x: 1430, y: 1760, scale: 1.3 },
    { animal: 'mouse', x: 1810, y: 1148, scale: 1.3, flip: true },
    { animal: 'hedgehog', x: 3130, y: 1740, scale: 1.3, flip: true },
  ],
  day,
  night,
  interactives,
  back: (p, mode) =>
    wall(p) +
    clock(p) +
    pictures(p) +
    wallShelf(p) +
    leashHook(p) +
    windowArt(p, mode) +
    curtain(p, false) +
    curtain(p, true) +
    curtainRod(p) +
    doorArt(p, mode) +
    fairyLights(p, mode) +
    floor(p) +
    rug(p) +
    doormat(p) +
    sofa(p) +
    cabinet(p) +
    bookshelf(p) +
    dogBed(p) +
    bowls(p) +
    lightPools(p, mode),
  front: (p) =>
    bone(760, 1978, 1.6, -12, p.bone) +
    path(circle(3370, 1984, 54), p.book5) +
    stroke(curve(3330, 1950, 3410, 2010, 20), p.white, 5, ' stroke-opacity=".5"') +
    stroke(curve(3324, 1990, 3400, 1946, -18), p.white, 5, ' stroke-opacity=".5"') +
    stroke('M3318 1996C3260 2010 3220 1980 3180 1996', p.book5, 6),
};

export default pets;
