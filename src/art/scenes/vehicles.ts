import {
  circle,
  curve,
  ellipse,
  f,
  leaf,
  poly,
  roundRect,
  smooth,
  spline,
  tube,
  type Pt,
} from '../core/paths';
import {
  bush,
  cloud,
  flower,
  grassTuft,
  group,
  linearGradient,
  moon,
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
const SEA_Y = 884;
const RAIL_Y = 966;
const WATER_Y = 1150;
const TOWN_Y = 1426;
const CURB_Y = 1494;
const ROAD_Y = 1504;
const ROAD_B = 1792;
const MID_Y = (ROAD_Y + ROAD_B) / 2;
const WALK_B = 1880;
const BRIDGE_X1 = 1250;
const QUAY_TOP: Pt = [1238, WATER_Y];
const QUAY_LOW: Pt = [1206, TOWN_Y];

const SUN: Pt = [3190, 270];
const LIGHTHOUSE: Pt = [196, 1214];
const FIRE_X = 1510;
const POLICE_X = 2140;
const HOSPITAL_X = 2870;
const SIDE_X = 2472;
const LIGHT_X = 2374;
const ZEBRA_X = 2286;
const STOP_X = 1852;
const TUNNEL_X = 3470;
const PIERS = [-120, 140, 400, 660, 920, 1180];
const QUAY_LAMPS: [number, 1 | -1][] = [
  [330, 1],
  [990, -1],
];

const glowAt = (x: number, y: number, r: number, id: string): string =>
  `<circle cx="${f(x)}" cy="${f(y)}" r="${f(r)}" fill="url(#${id})"/>`;

function arch(cx: number, bottom: number, w: number, h: number): string {
  const r = w / 2;
  return `M${f(cx - r)} ${f(bottom)}L${f(cx - r)} ${f(bottom - h + r)}A${f(r)} ${f(r)} 0 0 1 ${f(cx + r)} ${f(bottom - h + r)}L${f(cx + r)} ${f(bottom)}Z`;
}

function landD(pts: Pt[]): string {
  const last = pts[pts.length - 1];
  return `${smooth(pts, false)}L${f(last[0])} ${H + 60}L${f(pts[0][0])} ${H + 60}Z`;
}

const farY = (x: number): number =>
  812 + 18 * Math.sin(x / 250 + 0.4) + 10 * Math.sin(x / 105 + 1.7);

const hillY = (x: number): number => {
  const t = Math.max(0, Math.min(1, (x - 3150) / 330));
  return (
    866 + 14 * Math.sin(x / 290 + 1.1) + 8 * Math.sin(x / 120 + 0.3) - 140 * t * t * (3 - 2 * t)
  );
};

const STREET: Pt[] = [
  [SIDE_X, ROAD_Y + 4],
  [SIDE_X - 6, 1230],
  [SIDE_X, RAIL_Y],
  [SIDE_X + 26, 884],
];

const streetHalf = (u: number): number => 70 - 52 * u;

function waveMark(x: number, y: number, s: number, color: string, op: number): string {
  return stroke(
    `M${f(x - 24 * s)} ${f(y)}Q${f(x - 12 * s)} ${f(y - 7 * s)} ${f(x)} ${f(y)}T${f(x + 24 * s)} ${f(y)}`,
    color,
    4.5 * s,
    ` stroke-opacity="${op}"`,
  );
}

function lollipop(x: number, y: number, s: number, trunk: string, crown: string): string {
  return (
    path(roundRect(x - 5 * s, y - 40 * s, 10 * s, 42 * s, 4 * s), trunk) +
    path(circle(x, y - 58 * s, 30 * s), crown)
  );
}

function townTree(x: number, y: number, s: number, p: Palette): string {
  return (
    path(roundRect(x - 9 * s, y - 92 * s, 18 * s, 94 * s, 7 * s), p.trunk) +
    path(circle(x + 4 * s, y - 126 * s, 62 * s), p.treeDark) +
    path(circle(x - 4 * s, y - 134 * s, 56 * s), p.tree) +
    path(circle(x - 24 * s, y - 156 * s, 17 * s), p.treeLight, ' fill-opacity=".75"')
  );
}

function poplar(x: number, y: number, s: number, p: Palette): string {
  const body = (dx: number, fill: string) =>
    path(
      smooth(
        [
          [x + dx * s, y - 236 * s],
          [x + (dx + 40) * s, y - 150 * s],
          [x + (dx + 36) * s, y - 60 * s],
          [x + dx * s, y - 40 * s],
          [x + (dx - 36) * s, y - 60 * s],
          [x + (dx - 40) * s, y - 150 * s],
        ],
        true,
      ),
      fill,
    );
  return (
    path(roundRect(x - 7 * s, y - 60 * s, 14 * s, 62 * s, 5 * s), p.trunk) +
    body(4, p.treeDark) +
    body(-2, p.tree) +
    path(ellipse(x - 14 * s, y - 170 * s, 9 * s, 26 * s, 8), p.treeLight, ' fill-opacity=".7"')
  );
}

function farHouse(
  x: number,
  y: number,
  s: number,
  wall: string,
  roof: string,
  p: Palette,
  night: boolean,
): string {
  const w = 54 * s;
  const h = 40 * s;
  return (
    path(roundRect(x - w / 2, y - h, w, h + 4, 3 * s), wall) +
    path(
      poly([
        [x - w / 2 - 7 * s, y - h + 3 * s],
        [x, y - h - 30 * s],
        [x + w / 2 + 7 * s, y - h + 3 * s],
      ]),
      roof,
    ) +
    path(
      roundRect(x - 13 * s, y - h * 0.66, 11 * s, 12 * s, 2 * s),
      night ? p.glass : p.farWindow,
    ) +
    path(roundRect(x + 4 * s, y - h * 0.66, 11 * s, 12 * s, 2 * s), night ? p.glass : p.farWindow)
  );
}

function farSail(x: number, y: number, s: number, p: Palette): string {
  return (
    path(
      `M${f(x - 30 * s)} ${f(y - 8 * s)}L${f(x + 32 * s)} ${f(y - 8 * s)}L${f(x + 22 * s)} ${f(y + 4 * s)}L${f(x - 22 * s)} ${f(y + 4 * s)}Z`,
      p.farHull,
    ) +
    path(
      `M${f(x + 2 * s)} ${f(y - 64 * s)}L${f(x + 30 * s)} ${f(y - 12 * s)}L${f(x + 2 * s)} ${f(y - 12 * s)}Z`,
      p.farSail,
    ) +
    path(
      `M${f(x - 2 * s)} ${f(y - 50 * s)}L${f(x - 24 * s)} ${f(y - 12 * s)}L${f(x - 2 * s)} ${f(y - 12 * s)}Z`,
      p.farSail,
    )
  );
}

const CITY: [number, number, number, number][] = [
  [1390, 70, 118, 0],
  [1470, 86, 160, 1],
  [1560, 64, 128, 2],
  [1650, 92, 136, 0],
  [1746, 70, 146, 1],
  [2340, 74, 136, 2],
  [2424, 96, 130, 0],
  [2520, 66, 160, 1],
  [2600, 84, 120, 2],
  [3010, 70, 126, 0],
  [3090, 88, 156, 2],
];

function farCity(p: Palette, night: boolean): string {
  const tints = [p.cityA, p.cityB, p.cityC];
  let out = '';
  for (const [x, w, h, k] of CITY) {
    const base = farY(x) + 30;
    const top = base - h;
    out += path(roundRect(x - w / 2, top, w, h + 10, k === 1 ? w / 2 : 10), tints[k]);
    if (k === 0) out += path(roundRect(x - 3, top - 34, 6, 36, 3), tints[k]);
    if (k === 2) out += path(roundRect(x - w / 2 + 8, top - 14, w - 16, 18, 8), tints[k]);
    for (let row = 0; row < Math.floor((h - 30) / 30); row++) {
      for (let col = 0; col < Math.floor((w - 16) / 22); col++) {
        const wx = x - w / 2 + 12 + col * 22;
        const wy = top + 22 + row * 30;
        if (night && (row * 7 + col * 3 + k) % 4 === 0) continue;
        out += path(
          roundRect(wx, wy, 10, 14, 3),
          night ? p.glass : p.cityWindow,
          night ? '' : ' fill-opacity=".7"',
        );
      }
    }
  }
  return out;
}

function skyLayer(p: Palette, mode: Mode): string {
  const night = mode === 'night';
  return (
    `<defs>${linearGradient('vhSky', [
      [0, p.skyTop],
      [0.26, p.skyMid],
      [0.45, p.skyBottom],
    ])}${radialGlow('vhHaze', p.haze, night ? 0.25 : 0.6)}</defs>` +
    `<rect width="${W}" height="${H}" fill="url(#vhSky)"/>` +
    `<ellipse cx="${SUN[0]}" cy="${SUN[1] + 260}" rx="1400" ry="640" fill="url(#vhHaze)"/>` +
    (night ? starField(47, 120, 30, 20, W - 30, 680, p.star) : '') +
    cloud(560, 640, 0.9, p.cloud, p.cloudShade) +
    cloud(2020, 560, 1.15, p.cloud, p.cloudShade) +
    cloud(2760, 700, 0.75, p.cloud, p.cloudShade)
  );
}

function farSea(p: Palette): string {
  const r = rng(19);
  let marks = '';
  for (let i = 0; i < 18; i++) {
    const x = range(r, 40, 1100);
    const y = range(r, SEA_Y + 30, WATER_Y - 20);
    const k = (y - SEA_Y) / (WATER_Y - SEA_Y);
    marks += waveMark(x, y, 0.5 + k * 0.5, p.seaLight, 0.5 + k * 0.3);
  }
  return (
    `<defs>${linearGradient('vhSeaFar', [
      [0, p.seaFar],
      [1, p.sea],
    ])}</defs>` +
    path(roundRect(-40, SEA_Y, 1640, WATER_Y + 40 - SEA_Y, 0), 'url(#vhSeaFar)') +
    stroke(`M-40 ${SEA_Y + 5}L1500 ${SEA_Y + 5}`, p.seaLight, 6, ' stroke-opacity=".7"') +
    marks +
    farSail(560, SEA_Y + 18, 0.8, p) +
    farSail(880, SEA_Y + 26, 0.6, p)
  );
}

function farLand(p: Palette, mode: Mode): string {
  const night = mode === 'night';
  let out = farCity(p, night);
  const pts: Pt[] = [
    [700, SEA_Y + 14],
    [820, SEA_Y - 18],
    [940, farY(940) + 22],
  ];
  for (let x = 1040; x <= W + 200; x += 100) pts.push([x, farY(x)]);
  out += path(landD(pts), p.hillFar);
  out += [1080, 1200, 1900, 2020, 2760, 2880, 3260]
    .map((x, i) => lollipop(x, farY(x) + 8, 0.7 + (i % 2) * 0.15, p.hillFarTree, p.hillFarTree))
    .join('');
  const hill: Pt[] = [
    [1040, WATER_Y + 40],
    [1130, 1080],
    [1212, 980],
    [1320, 914],
  ];
  for (let x = 1420; x <= W + 200; x += 80) hill.push([x, hillY(x)]);
  out += path(landD(hill), p.hill);
  const r = rng(53);
  for (let i = 0; i < 9; i++) {
    const x = range(r, 1400, 3300);
    out += path(
      ellipse(x, range(r, 918, 940), range(r, 90, 180), range(r, 9, 14)),
      p.hillLight,
      ' fill-opacity=".7"',
    );
  }
  out += (
    [
      [1640, 0.8, 'farHouseA', 'farRoof'],
      [1710, 0.9, 'farHouseB', 'farRoof2'],
      [2760, 0.85, 'farHouseB', 'farRoof'],
      [2830, 0.75, 'farHouseA', 'farRoof2'],
    ] as [number, number, string, string][]
  )
    .map(([x, s, wall, roof]) => farHouse(x, hillY(x) + 12, s, p[wall], p[roof], p, night))
    .join('');
  out += field(p);
  out += [1480, 1560, 1880, 2020, 2240, 2620, 2700, 3290, 3400, 3560]
    .map((x, i) =>
      lollipop(
        x,
        hillY(x) + 18 + (i % 3) * 8,
        0.8 + (i % 2) * 0.2,
        p.trunk,
        i % 2 ? p.tree : p.treeDark,
      ),
    )
    .join('');
  return out;
}

function bridge(p: Palette): string {
  const top = RAIL_Y + 8;
  const foot = WATER_Y + 6;
  const pw = 64;
  let body = `M-60 ${top}L${BRIDGE_X1} ${top}L${BRIDGE_X1} ${foot}L-60 ${foot}Z`;
  let rings = '';
  let piers = '';
  for (let i = 0; i < PIERS.length - 1; i++) {
    const a = PIERS[i] + pw / 2;
    const b = PIERS[i + 1] - pw / 2;
    const r = (b - a) / 2;
    const spring = foot - 30;
    const ry = Math.min(r, spring - top - 44);
    body += `M${f(a)} ${f(foot)}L${f(a)} ${f(spring)}A${f(r)} ${f(ry)} 0 0 1 ${f(b)} ${f(spring)}L${f(b)} ${f(foot)}Z`;
    rings += stroke(
      `M${f(a - 9)} ${f(spring)}A${f(r + 9)} ${f(ry + 9)} 0 0 1 ${f(b + 9)} ${f(spring)}`,
      p.bridgeShade,
      12,
    );
    rings += path(roundRect(a + r - 11, spring - ry - 18, 22, 28, 4), p.bridgeLight);
  }
  for (const x of PIERS) {
    piers += path(roundRect(x - pw / 2 - 8, foot - 22, pw + 16, 26, 6), p.bridgeShade);
  }
  let rail = '';
  for (let x = -40; x < BRIDGE_X1; x += 44) {
    rail += path(roundRect(x, RAIL_Y - 52, 8, 34, 3), p.bridgeRail);
  }
  rail += path(roundRect(-60, RAIL_Y - 56, BRIDGE_X1 + 60, 9, 4), p.bridgeRail);
  return (
    rail +
    path(body, p.bridge, ' fill-rule="evenodd"') +
    rings +
    piers +
    path(roundRect(-60, top, BRIDGE_X1 + 60, 30, 4), p.bridgeLight) +
    path(roundRect(-60, top + 26, BRIDGE_X1 + 60, 7, 3), p.bridgeShade)
  );
}

function retainingWall(x0: number, x1: number, p: Palette): string {
  const y0 = RAIL_Y + 6;
  const h = 48;
  let joints = `M${f(x0)} ${y0 + 24}L${f(x1)} ${y0 + 24}`;
  for (let x = x0 + 30; x < x1; x += 56) {
    joints += `M${f(x)} ${y0 + 6}L${f(x)} ${y0 + 24}M${f(x + 28)} ${y0 + 24}L${f(x + 28)} ${y0 + h}`;
  }
  return (
    path(roundRect(x0, y0, x1 - x0, h, 4), p.wall) +
    stroke(joints, p.wallShade, 3) +
    path(roundRect(x0, y0, x1 - x0, 6, 3), p.wallLight)
  );
}

function track(x0: number, x1: number, p: Palette): string {
  let out =
    path(roundRect(x0, RAIL_Y - 22, x1 - x0, 30, 8), p.ballast) +
    path(roundRect(x0, RAIL_Y + 2, x1 - x0, 6, 3), p.ballastDark);
  for (let x = x0 + 8; x < x1 - 4; x += 30) {
    out += path(
      poly([
        [x, RAIL_Y + 4],
        [x + 13, RAIL_Y + 4],
        [x + 17, RAIL_Y - 20],
        [x + 5, RAIL_Y - 20],
      ]),
      p.sleeper,
    );
  }
  out += path(roundRect(SIDE_X - 52, RAIL_Y - 24, 104, 32, 6), p.crossingDeck);
  out +=
    path(roundRect(x0, RAIL_Y - 19, x1 - x0, 5, 2.5), p.rail) +
    path(roundRect(x0, RAIL_Y - 4, x1 - x0, 7, 3), p.rail) +
    path(roundRect(x0, RAIL_Y - 4, x1 - x0, 2.5, 1.2), p.railLight);
  return out;
}

function tunnel(p: Palette): string {
  const cx = TUNNEL_X;
  const b = RAIL_Y + 6;
  return (
    path(arch(cx, b, 220, 200), p.tunnel) +
    path(arch(cx, b, 150, 160), p.tunnelDark) +
    stroke(
      `M${cx - 92} ${b - 110}A92 92 0 0 1 ${cx + 92} ${b - 110}`,
      p.tunnelShade,
      6,
      ' stroke-opacity=".8"',
    ) +
    path(roundRect(cx - 15, b - 206, 30, 30, 5), p.tunnelShade)
  );
}

function lowerSlope(p: Palette): string {
  const d = `M${QUAY_TOP[0] + 12} ${RAIL_Y + 40}L${W + 40} ${RAIL_Y + 40}L${W + 40} ${TOWN_Y + 20}L${QUAY_LOW[0]} ${TOWN_Y + 20}L${QUAY_TOP[0]} ${QUAY_TOP[1]}Z`;
  const r = rng(61);
  let out = path(d, p.hillLow);
  for (let i = 0; i < 10; i++) {
    const x = range(r, 1300, 3500);
    const y = range(r, 1070, 1380);
    out += path(
      ellipse(x, y, range(r, 80, 160), range(r, 12, 20)),
      p.hillLowLight,
      ' fill-opacity=".6"',
    );
  }
  return out;
}

function sideStreet(p: Palette): string {
  const centre = spline(STREET, 30);
  let dashes = '';
  for (let i = 3; i < centre.length - 4; i += 3) {
    const [x, y] = centre[i];
    const u = i / (centre.length - 1);
    dashes += path(
      roundRect(x - 3.5 + 2 * u, y - 14 + 8 * u, 7 - 3 * u, 22 - 12 * u, 3),
      p.roadLine,
      ' fill-opacity=".85"',
    );
  }
  return (
    path(
      tube(STREET, (u) => streetHalf(u) + 8),
      p.curb,
    ) +
    path(tube(STREET, streetHalf), p.road) +
    dashes
  );
}

function streetMouth(p: Palette): string {
  const half = streetHalf(0);
  let bars = '';
  for (let k = -3; k <= 3; k++) {
    bars += path(roundRect(SIDE_X + k * 19 - 6, TOWN_Y + 10, 12, 52, 4), p.roadLine);
  }
  return (
    path(roundRect(SIDE_X - half, TOWN_Y - 10, half * 2, CURB_Y - TOWN_Y + 24, 0), p.road) +
    bars +
    path(roundRect(SIDE_X - half - 14, TOWN_Y - 6, 14, CURB_Y - TOWN_Y + 10, 5), p.curb) +
    path(roundRect(SIDE_X + half, TOWN_Y - 6, 14, CURB_Y - TOWN_Y + 10, 5), p.curb)
  );
}

function lotDirt(p: Palette): string {
  let out = path(
    smooth(
      [
        [3170, TOWN_Y + 12],
        [3200, 1320],
        [3380, 1290],
        [3620, 1286],
        [3640, TOWN_Y + 12],
      ],
      true,
      0.5,
    ),
    p.dirt,
  );
  out += path(ellipse(3300, 1392, 90, 12), p.dirtDark, ' fill-opacity=".45"');
  out += path(ellipse(3460, 1338, 70, 10), p.dirtDark, ' fill-opacity=".4"');
  out += path(
    `M3396 ${TOWN_Y - 2}C3420 1340 3478 1268 3530 1268C3584 1268 3628 1340 3650 ${TOWN_Y - 2}Z`,
    p.sand,
  );
  out += path(
    `M3530 1268C3584 1268 3628 1340 3650 ${TOWN_Y - 2}L3560 ${TOWN_Y - 2}C3566 1360 3556 1300 3530 1268Z`,
    p.sandShade,
  );
  out += path(ellipse(3486, 1306, 26, 9, -30), p.sandLight, ' fill-opacity=".8"');
  const r = rng(91);
  for (let i = 0; i < 6; i++) {
    out += path(
      ellipse(range(r, 3450, 3590), range(r, 1330, 1400), range(r, 5, 9), range(r, 3, 6)),
      p.sandShade,
    );
  }
  return out;
}

function field(p: Palette): string {
  const d = smooth(
    [
      [2870, 946],
      [2900, 896],
      [3020, 880],
      [3190, 876],
      [3236, 946],
    ],
    true,
    0.6,
  );
  let rows = '';
  for (let k = 0; k < 6; k++) {
    const y = 892 + k * 10;
    rows += stroke(curve(2860, y, 3250, y - 6, -6), k % 2 ? p.fieldDark : p.fieldLight, 5);
  }
  return (
    `<defs><clipPath id="vhField"><path d="${d}"/></clipPath></defs>` +
    path(d, p.field) +
    group(rows, '', ' clip-path="url(#vhField)"')
  );
}

function cone(x: number, y: number, s: number, p: Palette): string {
  return (
    path(roundRect(x - 26 * s, y - 10 * s, 52 * s, 12 * s, 4 * s), p.cone) +
    path(
      `M${f(x - 18 * s)} ${f(y - 8 * s)}L${f(x - 5 * s)} ${f(y - 74 * s)}Q${f(x)} ${f(y - 80 * s)} ${f(x + 5 * s)} ${f(y - 74 * s)}L${f(x + 18 * s)} ${f(y - 8 * s)}Z`,
      p.cone,
    ) +
    path(
      poly([
        [x - 13 * s, y - 28 * s],
        [x + 13 * s, y - 28 * s],
        [x + 10 * s, y - 44 * s],
        [x - 10 * s, y - 44 * s],
      ]),
      p.coneStripe,
    )
  );
}

function barrier(x: number, y: number, p: Palette): string {
  let stripes = '';
  for (let i = 0; i < 6; i++) {
    stripes += path(
      poly([
        [x - 76 + i * 30, y - 72],
        [x - 62 + i * 30, y - 72],
        [x - 76 + i * 30, y - 44],
        [x - 90 + i * 30, y - 44],
      ]),
      p.cone,
    );
  }
  return (
    path(roundRect(x - 66, y - 46, 10, 48, 3), p.lampPost) +
    path(roundRect(x + 56, y - 46, 10, 48, 3), p.lampPost) +
    `<defs><clipPath id="vhBarrier${x}"><path d="${roundRect(x - 76, y - 72, 152, 28, 6)}"/></clipPath></defs>` +
    path(roundRect(x - 76, y - 72, 152, 28, 6), p.coneStripe) +
    group(stripes, '', ` clip-path="url(#vhBarrier${x})"`)
  );
}

const lampPool = (hx: number, y: number, id: string): string =>
  `<ellipse cx="${f(hx)}" cy="${f(y + 30)}" rx="120" ry="30" fill="url(#${id})"/>`;

function streetLamp(
  x: number,
  y: number,
  dir: 1 | -1,
  p: Palette,
  mode: Mode,
  id: string,
  pool = true,
): string {
  const night = mode === 'night';
  const top = y - 300;
  const hx = x + dir * 52;
  return (
    (night ? (pool ? lampPool(hx, y, id) : '') + glowAt(hx, top + 34, 90, id) : '') +
    path(roundRect(x - 16, y - 16, 32, 20, 6), p.lampPost) +
    path(roundRect(x - 7, top + 20, 14, y - top - 30, 6), p.lampPost) +
    stroke(
      `M${f(x)} ${f(top + 30)}Q${f(x)} ${f(top)} ${f(x + dir * 30)} ${f(top)}L${f(hx)} ${f(top)}`,
      p.lampPost,
      12,
    ) +
    path(
      `M${f(hx - 30)} ${f(top + 12)}Q${f(hx - 30)} ${f(top - 10)} ${f(hx)} ${f(top - 10)}Q${f(hx + 30)} ${f(top - 10)} ${f(hx + 30)} ${f(top + 12)}Z`,
      p.lampPost,
    ) +
    path(ellipse(hx, top + 18, 24, 14), p.lamp)
  );
}

function busStop(p: Palette, mode: Mode): string {
  const night = mode === 'night';
  const x = STOP_X;
  const b = TOWN_Y + 36;
  const l = x - 62;
  const sx = x - 26;
  const sy = b - 250;
  return (
    path(ellipse(x, b + 4, 90, 9), p.shadow, ' fill-opacity=".15"') +
    path(roundRect(sx - 5, sy, 10, b - sy, 4), p.stopFrame) +
    path(roundRect(l, b - 150, 124, 120, 8), p.glass, ' fill-opacity=".55"') +
    path(roundRect(l + 8, b - 142, 12, 104, 4), p.glassShine, ' fill-opacity=".5"') +
    path(roundRect(l - 4, b - 156, 8, 156, 3), p.stopFrame) +
    path(roundRect(l + 120, b - 156, 8, 156, 3), p.stopFrame) +
    path(roundRect(l - 10, b - 170, 144, 22, 9), p.stopRoof) +
    path(roundRect(l + 12, b - 52, 100, 12, 5), p.stopBench) +
    path(roundRect(l + 20, b - 42, 8, 36, 3), p.stopFrame) +
    path(roundRect(l + 96, b - 42, 8, 36, 3), p.stopFrame) +
    (night ? glowAt(sx, sy, 70, 'vhStreet') : '') +
    path(circle(sx, sy, 34), p.stopRoof) +
    path(circle(sx, sy, 27), p.signBox) +
    path(roundRect(sx - 17, sy - 16, 34, 26, 6), p.stopRoof) +
    path(roundRect(sx - 13, sy - 12, 12, 9, 2), p.signBox) +
    path(roundRect(sx + 1, sy - 12, 12, 9, 2), p.signBox) +
    path(circle(sx - 9, sy + 12, 5), p.stopRoof) +
    path(circle(sx + 9, sy + 12, 5), p.stopRoof)
  );
}

function sidewalkAndRoad(p: Palette): string {
  let joints = '';
  for (let x = -30; x < W + 40; x += 90) {
    joints += `M${f(x)} ${TOWN_Y + 4}L${f(x - 10)} ${CURB_Y - 4}`;
  }
  joints += `M-40 ${(TOWN_Y + CURB_Y) / 2}L${W + 40} ${(TOWN_Y + CURB_Y) / 2}`;
  let dashes = '';
  for (let x = -20; x < W + 40; x += 150) {
    if (Math.abs(x + 42 - ZEBRA_X) < 110) continue;
    dashes += path(roundRect(x, MID_Y - 5, 84, 10, 5), p.roadLine);
  }
  let zebra = '';
  const bars = 7;
  const span = ROAD_B - ROAD_Y - 20;
  for (let i = 0; i < bars; i++) {
    const y0 = ROAD_Y + 12 + (i * span) / bars;
    const hh = (span / bars) * 0.56;
    const k = (y0 - ROAD_Y) / (ROAD_B - ROAD_Y);
    const half = 56 + 10 * k;
    zebra += path(roundRect(ZEBRA_X - half, y0, half * 2, hh, 6), p.roadLine);
  }
  const r = rng(83);
  let patches = '';
  for (let i = 0; i < 12; i++) {
    patches += path(
      ellipse(
        range(r, 0, W),
        range(r, ROAD_Y + 30, ROAD_B - 30),
        range(r, 70, 160),
        range(r, 8, 14),
      ),
      p.roadLight,
      ' fill-opacity=".45"',
    );
  }
  let frontJoints = '';
  for (let x = 20; x < W + 40; x += 110) {
    frontJoints += `M${f(x)} ${ROAD_B + 14}L${f(x + 14)} ${WALK_B - 4}`;
  }
  return (
    path(roundRect(-40, TOWN_Y, W + 80, CURB_Y - TOWN_Y + 4, 0), p.sidewalk) +
    stroke(joints, p.sidewalkJoint, 3) +
    path(roundRect(-40, TOWN_Y, QUAY_LOW[0] + 40, 14, 0), p.coping) +
    path(roundRect(-40, TOWN_Y + 12, QUAY_LOW[0] + 40, 4, 0), p.copingShade) +
    path(roundRect(-40, CURB_Y - 4, W + 80, 14, 4), p.curb) +
    path(roundRect(-40, CURB_Y + 6, W + 80, 6, 2), p.curbShade) +
    path(roundRect(-40, ROAD_Y + 6, W + 80, ROAD_B - ROAD_Y - 6, 0), p.road) +
    patches +
    dashes +
    zebra +
    path(roundRect(-40, ROAD_B - 2, W + 80, 16, 4), p.curb) +
    path(roundRect(-40, ROAD_B + 12, W + 80, WALK_B - ROAD_B - 12, 0), p.sidewalk) +
    stroke(frontJoints, p.sidewalkJoint, 3) +
    path(roundRect(-40, WALK_B, W + 80, H - WALK_B + 40, 0), p.grass) +
    path(roundRect(-40, WALK_B, W + 80, 8, 4), p.grassDark)
  );
}

function pane(
  x: number,
  y: number,
  w: number,
  h: number,
  p: Palette,
  night: boolean,
  frame: string,
  rounded = false,
): string {
  const fw = 7;
  const outer = rounded
    ? arch(x + w / 2, y + h + fw, w + fw * 2, h + fw * 2)
    : roundRect(x - fw, y - fw, w + fw * 2, h + fw * 2, 7);
  const inner = rounded ? arch(x + w / 2, y + h, w, h) : roundRect(x, y, w, h, 4);
  return (
    path(outer, frame) +
    path(inner, p.glass) +
    (night
      ? path(ellipse(x + w / 2, y + h * 0.58, w * 0.26, h * 0.24), p.glassCore)
      : path(
          poly([
            [x + w * 0.12, y + h * 0.72],
            [x + w * 0.12, y + h * 0.2],
            [x + w * 0.5, y + h * 0.08],
          ]),
          p.glassShine,
          ' fill-opacity=".55"',
        )) +
    stroke(
      `M${f(x + w / 2)} ${f(y + (rounded ? w * 0.2 : 0))}L${f(x + w / 2)} ${f(y + h)}M${f(x)} ${f(y + h * 0.55)}L${f(x + w)} ${f(y + h * 0.55)}`,
      frame,
      4,
    )
  );
}

function windowGlows(spots: [number, number, number][], id: string): string {
  return spots.map(([x, y, r]) => glowAt(x, y, r, id)).join('');
}

function flame(x: number, y: number, s: number, p: Palette): string {
  const outer = `M${f(x)} ${f(y - 30 * s)}C${f(x + 6 * s)} ${f(y - 14 * s)} ${f(x + 22 * s)} ${f(y - 8 * s)} ${f(x + 20 * s)} ${f(y + 10 * s)}C${f(x + 18 * s)} ${f(y + 26 * s)} ${f(x - 18 * s)} ${f(y + 26 * s)} ${f(x - 20 * s)} ${f(y + 10 * s)}C${f(x - 22 * s)} ${f(y - 6 * s)} ${f(x - 8 * s)} ${f(y - 10 * s)} ${f(x)} ${f(y - 30 * s)}Z`;
  const inner = `M${f(x + 2 * s)} ${f(y - 6 * s)}C${f(x + 6 * s)} ${f(y + 2 * s)} ${f(x + 12 * s)} ${f(y + 6 * s)} ${f(x + 10 * s)} ${f(y + 14 * s)}C${f(x + 8 * s)} ${f(y + 22 * s)} ${f(x - 8 * s)} ${f(y + 22 * s)} ${f(x - 10 * s)} ${f(y + 14 * s)}C${f(x - 11 * s)} ${f(y + 6 * s)} ${f(x - 2 * s)} ${f(y + 4 * s)} ${f(x + 2 * s)} ${f(y - 6 * s)}Z`;
  return path(outer, p.flame) + path(inner, p.flameCore);
}

function fireStation(p: Palette, mode: Mode): string {
  const night = mode === 'night';
  const cx = FIRE_X;
  const b = TOWN_Y;
  const w = 520;
  const l = cx - w / 2;
  const top = b - 316;
  const floor = b - 210;
  const doors = [cx - 122, cx + 122];
  const ups = [cx - 168, cx, cx + 168];
  let out = `<defs>${radialGlow('vhWin', p.windowGlow, 0.7)}</defs>`;
  out += path(ellipse(cx, b + 6, w * 0.52, 14), p.shadow, ' fill-opacity=".18"');
  out += path(
    poly([
      [cx - 186, top - 4],
      [cx, top - 104],
      [cx + 186, top - 4],
    ]),
    p.fireTrim,
  );
  out += path(
    poly([
      [cx - 160, top - 6],
      [cx, top - 90],
      [cx + 160, top - 6],
    ]),
    p.fire,
  );
  out += path(roundRect(l, top, w, b - top + 4, 6), p.fire);
  for (let row = 0; row < 7; row++) {
    const yy = top + 34 + row * 40;
    for (let i = 0; i < 6; i++) {
      const xx = l + 30 + ((i * 86 + row * 43) % (w - 60));
      out += path(roundRect(xx, yy, 34, 12, 4), p.fireDark, ' fill-opacity=".35"');
    }
  }
  out += path(roundRect(l + w - 26, top, 26, b - top + 4, 6), p.fireDark, ' fill-opacity=".45"');
  out += path(roundRect(l - 14, top - 14, w + 28, 24, 9), p.fireTrim);
  out += path(roundRect(l - 8, floor - 12, w + 16, 18, 7), p.fireTrim);
  out += path(circle(cx, top - 40, 34), p.fireTrim);
  out += path(circle(cx, top - 40, 28), p.emblem);
  out += flame(cx, top - 38, 0.8, p);
  if (night) {
    out += windowGlows(
      ups.map((x): [number, number, number] => [x, floor - 62, 80]),
      'vhWin',
    );
    out += windowGlows([[doors[0], b - 70, 120]], 'vhWin');
  }
  out += ups.map((x) => pane(x - 30, floor - 98, 60, 70, p, night, p.fireTrim, true)).join('');
  doors.forEach((x, i) => {
    out += path(arch(x, b + 2, 186, 196), p.fireTrim);
    if (i === 0) {
      out += path(arch(x, b + 2, 162, 182), p.garage);
      out += path(roundRect(x - 81, b - 26, 162, 28, 3), p.garageFloor);
      out += path(roundRect(x - 64, b - 150, 128, 10, 4), p.garageFloor, ' fill-opacity=".6"');
    } else {
      out += path(arch(x, b + 2, 162, 182), p.door);
      for (let k = 0; k < 8; k++) {
        out += path(roundRect(x - 81, b - 160 + k * 20, 162, 5, 2), p.doorSlat);
      }
      for (let k = 0; k < 3; k++) {
        out += path(roundRect(x - 66 + k * 46, b - 128, 36, 24, 4), p.glass);
      }
      out += path(roundRect(x - 20, b - 40, 40, 8, 4), p.doorSlat);
    }
    out += path(circle(x, b - 196, 12), p.fireLamp);
  });
  out += path(roundRect(l - 6, b - 14, w + 12, 18, 6), p.fireDark);
  return out;
}

function star(x: number, y: number, r: number, n: number): string {
  const pts: Pt[] = [];
  for (let i = 0; i < n * 2; i++) {
    const a = -Math.PI / 2 + (i * Math.PI) / n;
    const rr = i % 2 ? r * 0.48 : r;
    pts.push([x + Math.cos(a) * rr, y + Math.sin(a) * rr]);
  }
  return poly(pts);
}

function beaconRays(x: number, y: number, len: number, color: string, op: number): string {
  let rays = '';
  for (let i = 0; i < 8; i++) {
    const a = (i * 360) / 8 + 22.5;
    const rad = (a * Math.PI) / 180;
    rays += path(
      leaf(x + Math.cos(rad) * 30, y + Math.sin(rad) * 30, len, 9, a),
      color,
      ` fill-opacity="${op}"`,
    );
  }
  return `<g data-spin="" style="transform-origin: ${f(x)}px ${f(y)}px">${rays}</g>`;
}

function policeStation(p: Palette, mode: Mode): string {
  const night = mode === 'night';
  const cx = POLICE_X;
  const b = TOWN_Y;
  const w = 410;
  const l = cx - w / 2;
  const top = b - 290;
  const floor = b - 148;
  const bx = cx;
  const by = top - 50;
  let out = `<defs>${radialGlow('vhWin', p.windowGlow, 0.7)}${radialGlow('vhBeacon', p.beaconGlow, night ? 0.85 : 0.5)}</defs>`;
  out += path(ellipse(cx, b + 6, w * 0.56, 14), p.shadow, ' fill-opacity=".18"');
  out += glowAt(bx, by, night ? 110 : 70, 'vhBeacon');
  out += beaconRays(bx, by, 46, p.beaconLight, night ? 0.9 : 0.75);
  out += path(roundRect(bx - 30, by + 12, 60, 24, 6), p.policeTrim);
  out += path(
    `M${f(bx - 22)} ${f(by + 14)}L${f(bx - 22)} ${f(by)}A22 22 0 0 1 ${f(bx + 22)} ${f(by)}L${f(bx + 22)} ${f(by + 14)}Z`,
    p.beacon,
  );
  out += path(ellipse(bx - 8, by - 6, 6, 9, 20), p.beaconLight, ' fill-opacity=".9"');
  out += path(roundRect(l, top, w, b - top + 4, 6), p.police);
  out += path(roundRect(l + w - 24, top, 24, b - top + 4, 6), p.policeDark, ' fill-opacity=".5"');
  out += path(roundRect(l - 12, top - 16, w + 24, 26, 9), p.policeTrim);
  out += path(roundRect(l - 6, floor - 10, w + 12, 18, 7), p.policeTrim);
  for (let k = 0; k < 2; k++) {
    out += path(roundRect(l, floor + 24 + k * 44, w, 6, 3), p.policeDark, ' fill-opacity=".35"');
  }
  const ups = [l + 62, l + 148, cx + 86, cx + 172];
  const lows = [l + 70, cx + 135];
  if (night) {
    out += windowGlows(
      [
        ...ups.map((x): [number, number, number] => [x, top + 70, 66]),
        ...lows.map((x): [number, number, number] => [x, floor + 66, 76]),
      ],
      'vhWin',
    );
  }
  out += ups.map((x) => pane(x - 30, top + 40, 60, 60, p, night, p.policeTrim)).join('');
  out += lows.map((x) => pane(x - 40, floor + 36, 80, 62, p, night, p.policeTrim)).join('');
  out += path(circle(cx, top + 70, 40), p.policeTrim);
  out += path(circle(cx, top + 70, 33), p.policeDark);
  out += path(star(cx, top + 72, 26, 5), p.badge);
  out += path(circle(cx, top + 74, 7), p.badgeDark);
  out += path(roundRect(cx - 64, floor + 6, 128, b - floor - 6, 8), p.policeTrim);
  out += path(roundRect(cx - 54, floor + 16, 108, b - floor - 22, 6), p.policeDoor);
  out += path(roundRect(cx - 44, floor + 28, 38, 56, 5), p.glass);
  out += path(roundRect(cx + 6, floor + 28, 38, 56, 5), p.glass);
  out +=
    path(circle(cx - 12, floor + 104, 4), p.badge) + path(circle(cx + 12, floor + 104, 4), p.badge);
  if (night) out += glowAt(cx, floor - 26, 70, 'vhBeacon');
  out += path(roundRect(cx - 4, floor - 22, 8, 16, 3), p.policeTrim);
  out += path(roundRect(cx - 18, floor - 50, 36, 30, 7), p.beacon);
  out += path(roundRect(cx - 12, floor - 44, 24, 18, 5), p.beaconLight);
  out += path(roundRect(cx - 80, b - 12, 160, 16, 5), p.step);
  out += path(roundRect(cx - 68, b - 24, 136, 14, 5), p.stepLight);
  return out;
}

function redCross(x: number, y: number, s: number, color: string): string {
  return (
    path(roundRect(x - 12 * s, y - 36 * s, 24 * s, 72 * s, 6 * s), color) +
    path(roundRect(x - 36 * s, y - 12 * s, 72 * s, 24 * s, 6 * s), color)
  );
}

function hospital(p: Palette, mode: Mode): string {
  const night = mode === 'night';
  const cx = HOSPITAL_X;
  const b = TOWN_Y;
  const w = 540;
  const l = cx - w / 2;
  const top = b - 356;
  const f1 = b - 134;
  const f2 = b - 246;
  let out = `<defs>${radialGlow('vhWin', p.windowGlow, 0.7)}${radialGlow('vhCross', p.crossGlow, night ? 0.75 : 0)}</defs>`;
  out += path(ellipse(cx, b + 6, w * 0.56, 14), p.shadow, ' fill-opacity=".18"');
  out += path(roundRect(l, top, w, b - top + 4, 6), p.hospital);
  out += path(roundRect(l + w - 26, top, 26, b - top + 4, 6), p.hospitalShade);
  out += path(roundRect(l - 12, top - 16, w + 24, 26, 9), p.hospitalTrim);
  out += path(roundRect(l - 6, f1 - 9, w + 12, 16, 7), p.hospitalTrim);
  out += path(roundRect(l - 6, f2 - 9, w + 12, 16, 7), p.hospitalTrim);
  const cols = [l + 56, l + 140, l + 224, cx + 46, cx + 130, cx + 214];
  const lows = [l + 60, l + 144, cx + 128, cx + 212];
  const spots: [number, number, number][] = [];
  for (const x of cols) {
    if (Math.abs(x - cx) > 60) spots.push([x, top + 62, 60]);
    spots.push([x, f2 + 54, 60]);
  }
  for (const x of lows) spots.push([x, f1 + 52, 62]);
  if (night) out += windowGlows(spots, 'vhWin');
  for (const x of cols) {
    if (Math.abs(x - cx) > 60) {
      out += pane(x - 28, top + 34, 56, 58, p, night, p.hospitalTrim);
    }
    out += pane(x - 28, f2 + 26, 56, 58, p, night, p.hospitalTrim);
  }
  for (const x of lows) out += pane(x - 30, f1 + 24, 60, 58, p, night, p.hospitalTrim);
  if (night) out += glowAt(cx, top + 24, 150, 'vhCross');
  out += path(roundRect(cx - 74, top - 70, 148, 148, 26), p.hospitalTrim);
  out += path(roundRect(cx - 62, top - 58, 124, 124, 20), p.signBox);
  out += redCross(cx, top + 4, 1.2, p.cross);
  out += path(
    `M${f(cx - 130)} ${f(f1 + 10)}L${f(cx + 130)} ${f(f1 + 10)}L${f(cx + 116)} ${f(f1 - 18)}L${f(cx - 116)} ${f(f1 - 18)}Z`,
    p.canopy,
  );
  out += path(roundRect(cx - 86, f1 + 24, 172, b - f1 - 24, 6), p.hospitalTrim);
  out += path(roundRect(cx - 78, f1 + 32, 76, b - f1 - 32, 4), p.glass);
  out += path(roundRect(cx + 2, f1 + 32, 76, b - f1 - 32, 4), p.glass);
  out += path(
    poly([
      [cx - 70, b - 12],
      [cx - 70, f1 + 70],
      [cx - 40, f1 + 40],
    ]),
    p.glassShine,
    ' fill-opacity=".5"',
  );
  out += path(roundRect(cx - 110, b - 12, 220, 16, 5), p.step);
  return out;
}

function lampWheel(cx: number, cy: number, r: number, colors: string[], id: string): string {
  const wx = cx + r * 2.4;
  const R = r * 4;
  const n = colors.length;
  let sectors = '';
  colors.forEach((c, k) => {
    const mid = Math.PI - (k * 2 * Math.PI) / n;
    const a0 = mid - Math.PI / n;
    const a1 = mid + Math.PI / n;
    sectors += path(
      `M${f(wx)} ${f(cy)}L${f(wx + R * Math.cos(a0))} ${f(cy + R * Math.sin(a0))}A${f(R)} ${f(R)} 0 0 1 ${f(wx + R * Math.cos(a1))} ${f(cy + R * Math.sin(a1))}Z`,
      c,
    );
  });
  return (
    `<defs><clipPath id="${id}"><path d="${circle(cx, cy, r)}"/></clipPath></defs>` +
    `<g clip-path="url(#${id})"><g data-spin="" style="transform-origin: ${f(wx)}px ${f(cy)}px">${sectors}</g></g>`
  );
}

function trafficLight(p: Palette, mode: Mode): string {
  const night = mode === 'night';
  const x = LIGHT_X;
  const b = TOWN_Y + 50;
  const hy = 1112;
  const lamps = [hy + 44, hy + 108, hy + 172];
  let out = `<defs>${radialGlow('vhGreen', p.green, night ? 0.8 : 0.45)}</defs>`;
  out += path(ellipse(x, b + 4, 36, 8), p.shadow, ' fill-opacity=".2"');
  out += path(roundRect(x - 20, b - 16, 40, 20, 8), p.lightBox);
  out += path(roundRect(x - 9, hy + 180, 18, b - hy - 180, 7), p.lightBox);
  out += path(roundRect(x - 16, b - 134, 32, 42, 8), p.amber);
  out += path(circle(x, b - 113, 8), p.lightBox);
  out += path(roundRect(x - 44, hy, 88, 216, 22), p.lightBoxDark);
  out += path(roundRect(x - 37, hy + 7, 74, 202, 18), p.lightBox);
  out += glowAt(x, lamps[2], night ? 78 : 52, 'vhGreen');
  out += lampWheel(x, lamps[0], 24, [p.redDim, p.redDim, p.red], 'vhLampA');
  out += lampWheel(x, lamps[1], 24, [p.amberDim, p.amber, p.amberDim], 'vhLampB');
  out += lampWheel(x, lamps[2], 24, [p.green, p.greenDim, p.greenDim], 'vhLampC');
  for (const ly of lamps) {
    out += stroke(`M${x - 30} ${ly - 9}A30 30 0 0 1 ${x + 30} ${ly - 9}`, p.lightBoxDark, 8);
    out += path(ellipse(x - 9, ly - 9, 7, 4.5, -30), '#ffffff', ' fill-opacity=".45"');
  }
  out += path(circle(x, hy - 6, 10), p.lightBoxDark);
  return out;
}

function crossingPost(
  x: number,
  dir: 1 | -1,
  p: Palette,
  mode: Mode,
  id: string,
  colors: [string[], string[]],
): string {
  const b = RAIL_Y + 40;
  const top = b - 178;
  const lx = top + 78;
  const board = (rot: number) =>
    group(
      path(roundRect(x - 46, top + 13, 92, 20, 6), p.crossingRed) +
        path(roundRect(x - 42, top + 17, 84, 12, 5), p.crossingWhite),
      `rotate(${rot} ${x} ${top + 23})`,
    );
  const ay = b - 56;
  const len = 114;
  let stripes = '';
  for (let i = 0; i < 3; i++) {
    stripes += path(
      roundRect(dir > 0 ? x + 34 + i * 30 : x - 34 - i * 30 - 15, ay - 7, 15, 14, 2),
      p.crossingRed,
    );
  }
  return (
    path(ellipse(x, b + 2, 24, 6), p.shadow, ' fill-opacity=".2"') +
    path(roundRect(x - 7, top + 18, 14, b - top - 16, 5), p.crossingPole) +
    path(roundRect(dir > 0 ? x : x - len, ay - 8, len, 16, 7), p.crossingWhite) +
    stripes +
    path(roundRect(x - 18, ay - 16, 36, 30, 8), p.crossingPole) +
    path(circle(x, ay - 1, 6), p.lightBoxDark) +
    board(40) +
    board(-40) +
    path(circle(x, top + 23, 6), p.lightBoxDark) +
    glowAt(x - 19, lx, mode === 'night' ? 56 : 34, 'vhBell') +
    path(roundRect(x - 42, lx - 17, 84, 34, 15), p.lightBoxDark) +
    lampWheel(x - 19, lx, 12, colors[0], `${id}L`) +
    lampWheel(x + 19, lx, 12, colors[1], `${id}R`)
  );
}

function crossing(p: Palette, mode: Mode): string {
  const lamps: [string[], string[]] = [
    [p.red, p.redDim],
    [p.redDim, p.red],
  ];
  return (
    `<defs>${radialGlow('vhBell', p.red, mode === 'night' ? 0.7 : 0.35)}</defs>` +
    crossingPost(SIDE_X - 120, 1, p, mode, 'vhXa', lamps) +
    crossingPost(SIDE_X + 120, -1, p, mode, 'vhXb', lamps)
  );
}

function lighthouse(p: Palette, mode: Mode): string {
  const night = mode === 'night';
  const [cx, b] = LIGHTHOUSE;
  const top = b - 300;
  const tw0 = 60;
  const tw1 = 42;
  const ly = top - 40;
  const at = (y: number) => tw0 + ((tw1 - tw0) * (b - y)) / (b - top);
  const body = poly([
    [cx - tw0, b],
    [cx - tw1, top],
    [cx + tw1, top],
    [cx + tw0, b],
  ]);
  let stripes = '';
  for (let k = 0; k < 2; k++) {
    const y0 = b - 75 - k * 150;
    const y1 = y0 - 75;
    stripes += path(
      poly([
        [cx - at(y0), y0],
        [cx - at(y1), y1],
        [cx + at(y1), y1],
        [cx + at(y0), y0],
      ]),
      p.lighthouseRed,
    );
  }
  let beams = '';
  for (const dir of [-1, 1]) {
    beams += path(
      `M${f(cx)} ${f(ly - 6)}L${f(cx + dir * 176)} ${f(ly - 40)}L${f(cx + dir * 176)} ${f(ly + 30)}L${f(cx)} ${f(ly + 6)}Z`,
      p.beam,
      ` fill-opacity="${night ? 0.45 : 0.22}"`,
    );
  }
  let rocks = '';
  const rr = rng(71);
  for (let i = 0; i < 9; i++) {
    const x = -20 + i * 44 + range(rr, -8, 8);
    const s = range(rr, 0.8, 1.2);
    rocks += path(
      ellipse(x, b + 18 + range(rr, -6, 6), 34 * s, 22 * s),
      i % 2 ? p.rock : p.rockShade,
    );
  }
  return (
    `<defs>${radialGlow('vhLamp', p.lampGlow, night ? 0.85 : 0.4)}<clipPath id="vhTower"><path d="${body}"/></clipPath></defs>` +
    path(ellipse(150, b + 26, 230, 34), p.rockShade) +
    rocks +
    path(ellipse(180, b + 4, 150, 22), p.rockLight) +
    path(roundRect(cx - 80, b - 14, 160, 22, 8), p.lighthouseBase) +
    path(body, p.lighthouse) +
    group(stripes, '', ' clip-path="url(#vhTower)"') +
    path(arch(cx, b - 8, 40, 64), p.lighthouseDoor) +
    path(circle(cx, b - 140, 12), p.lighthouseDoor) +
    path(circle(cx, b - 220, 10), p.lighthouseDoor) +
    path(roundRect(cx - 62, top - 12, 124, 18, 7), p.lighthouseRed) +
    stroke(
      `M${cx - 54} ${top - 12}L${cx - 54} ${top - 34}M${cx + 54} ${top - 12}L${cx + 54} ${top - 34}M${cx - 58} ${top - 34}L${cx + 58} ${top - 34}`,
      p.lighthouseDark,
      5,
    ) +
    glowAt(cx, ly, night ? 150 : 90, 'vhLamp') +
    path(roundRect(cx - 34, top - 70, 68, 58, 10), p.lamp) +
    stroke(
      `M${cx - 12} ${top - 68}L${cx - 12} ${top - 14}M${cx + 12} ${top - 68}L${cx + 12} ${top - 14}`,
      p.lighthouseDark,
      4,
    ) +
    `<g data-spin="" style="transform-origin: ${cx}px ${ly}px">${beams}</g>` +
    path(
      `M${cx - 46} ${top - 66}Q${cx - 44} ${top - 112} ${cx} ${top - 116}Q${cx + 44} ${top - 112} ${cx + 46} ${top - 66}Z`,
      p.lighthouseRed,
    ) +
    path(circle(cx, top - 122, 10), p.lighthouseDark)
  );
}

function container(x: number, y: number, w: number, color: string, dark: string): string {
  const h = 66;
  let ribs = '';
  for (let k = 1; k < Math.floor(w / 18); k++) {
    ribs += path(roundRect(x + k * 18 - 3, y - h + 10, 6, h - 20, 3), dark, ' fill-opacity=".45"');
  }
  return (
    path(roundRect(x, y - h, w, h, 6), color) +
    ribs +
    path(roundRect(x, y - h, w, 8, 4), dark, ' fill-opacity=".6"') +
    path(roundRect(x + w - 26, y - h + 12, 6, h - 22, 3), dark) +
    path(roundRect(x + w - 14, y - h + 12, 6, h - 22, 3), dark)
  );
}

function harbour(p: Palette, mode: Mode): string {
  const night = mode === 'night';
  const d = `M-40 ${WATER_Y}L${QUAY_TOP[0]} ${QUAY_TOP[1]}L${QUAY_LOW[0]} ${QUAY_LOW[1]}L-40 ${TOWN_Y}Z`;
  const glints = (x: number, y0: number, n: number) => {
    let out = `<ellipse cx="${f(x)}" cy="${f(y0 + n * 12)}" rx="70" ry="${f(n * 20)}" fill="url(#vhQuayLamp)"/>`;
    for (let i = 0; i < n; i++) {
      const w = 44 - i * 6;
      out += stroke(
        `M${f(x - w)} ${f(y0 + i * 24)}L${f(x + w)} ${f(y0 + i * 24)}`,
        p.glint,
        7,
        ` stroke-opacity="${f(0.95 - i * 0.14)}"`,
      );
    }
    return out;
  };
  const r = rng(29);
  let marks = '';
  for (let i = 0; i < 24; i++) {
    const x = range(r, 30, 1000);
    const y = range(r, WATER_Y + 30, TOWN_Y - 30);
    const k = (y - WATER_Y) / (TOWN_Y - WATER_Y);
    marks += waveMark(x, y, 0.7 + k * 0.7, p.seaLight, 0.55 + k * 0.3);
  }
  const buoy = (x: number, y: number) =>
    (night ? glowAt(x, y - 76, 34, 'vhQuayLamp') : '') +
    path(ellipse(x, y + 4, 30, 9), p.seaLight, ' fill-opacity=".7"') +
    path(
      `M${x - 22} ${y}Q${x - 22} ${y - 48} ${x} ${y - 50}Q${x + 22} ${y - 48} ${x + 22} ${y}Z`,
      p.buoy,
    ) +
    path(roundRect(x - 22, y - 28, 44, 12, 3), p.white) +
    path(roundRect(x - 3, y - 74, 6, 26, 3), p.lampPost) +
    path(circle(x, y - 76, 8), night ? p.lamp : p.buoy);
  return (
    `<defs>${linearGradient('vhSeaNear', [
      [0, p.sea],
      [1, p.seaNear],
    ])}${radialGlow('vhQuayLamp', p.lampGlow, 0.75)}</defs>` +
    path(d, 'url(#vhSeaNear)') +
    path(roundRect(-40, WATER_Y, 1280, 16, 0), p.seaNear, ' fill-opacity=".45"') +
    marks +
    PIERS.filter((x) => x > 0)
      .map((x) => path(ellipse(x, WATER_Y + 8, 52, 7), p.foam, ' fill-opacity=".75"'))
      .join('') +
    (night
      ? glints(LIGHTHOUSE[0], 1276, 5) +
        QUAY_LAMPS.map(([x, dir]) => glints(x + dir * 52, 1300, 4)).join('')
      : '') +
    stroke(
      curve(100, 1290, 520, 1290, -6),
      p.seaShine,
      8,
      ` stroke-opacity="${night ? 0.35 : 0.5}"`,
    ) +
    stroke(
      curve(640, 1370, 1000, 1370, -6),
      p.seaShine,
      8,
      ` stroke-opacity="${night ? 0.3 : 0.45}"`,
    ) +
    buoy(870, 1250) +
    buoy(96, 1376) +
    QUAY_LAMPS.map(([x, dir]) =>
      streetLamp(x, TOWN_Y + 40, dir, p, mode, 'vhQuayLamp', false),
    ).join('') +
    [80, 300, 740, 960]
      .map(
        (x) =>
          path(roundRect(x - 14, TOWN_Y - 18, 28, 28, 8), p.lampPost) +
          path(roundRect(x - 20, TOWN_Y - 26, 40, 12, 6), p.lampPost),
      )
      .join('') +
    container(1022, TOWN_Y + 30, 110, p.boxA, p.boxADark) +
    container(1122, TOWN_Y + 34, 104, p.boxB, p.boxBDark) +
    container(1062, TOWN_Y - 34, 120, p.boxC, p.boxCDark)
  );
}

function sunWithSpinningRays(p: Palette): string {
  const svg = sun(SUN[0], SUN[1], 104, p.sun, p.sunRay, p.face);
  const rays = (svg.match(/<path[^>]*\/>/g) ?? []).slice(0, 12).join('');
  return svg.replace(
    rays,
    `<g data-spin="" style="transform-origin: ${SUN[0]}px ${SUN[1]}px">${rays}</g>`,
  );
}

const interactives: Interactive[] = [
  {
    id: 'harbour',
    box: [-60, WATER_Y - 60, 1320, TOWN_Y - WATER_Y + 124],
    kind: 'pulse',
    origin: [600, TOWN_Y],
    effect: 'splash',
    effectAt: [640, 1300],
    sound: 'splash',
    render: harbour,
  },
  {
    id: 'lighthouse',
    box: [-100, 700, 500, 600],
    kind: 'glow',
    effect: 'sparkle',
    effectAt: [LIGHTHOUSE[0], 870],
    sound: 'honk',
    render: lighthouse,
  },
  {
    id: 'fire-station',
    box: [FIRE_X - 314, TOWN_Y - 446, 628, 520],
    kind: 'wiggle',
    origin: [FIRE_X, TOWN_Y],
    effect: 'rain',
    effectAt: [FIRE_X, TOWN_Y - 360],
    sound: 'creak',
    render: fireStation,
  },
  {
    id: 'police-station',
    box: [POLICE_X - 250, TOWN_Y - 476, 500, 520],
    kind: 'bounce',
    origin: [POLICE_X, TOWN_Y],
    effect: 'stars',
    effectAt: [POLICE_X, TOWN_Y - 340],
    sound: 'whoosh',
    render: policeStation,
  },
  {
    id: 'hospital',
    box: [HOSPITAL_X - 320, TOWN_Y - 496, 640, 540],
    kind: 'glow',
    effect: 'hearts',
    effectAt: [HOSPITAL_X, TOWN_Y - 360],
    sound: 'sparkle',
    render: hospital,
  },
  {
    id: 'crossing',
    box: [SIDE_X - 210, 790, 420, 270],
    kind: 'glow',
    effect: 'notes',
    effectAt: [SIDE_X, 860],
    sound: 'chime',
    render: crossing,
  },
  {
    id: 'traffic-light',
    box: [LIGHT_X - 90, 1070, 180, 444],
    kind: 'glow',
    effect: 'sparkle',
    effectAt: [LIGHT_X, 1200],
    sound: 'click',
    render: trafficLight,
  },
  {
    id: 'sun',
    box: [SUN[0] - 272, SUN[1] - 272, 544, 544],
    kind: 'spin',
    origin: SUN,
    effect: 'sparkle',
    sound: 'shine',
    night: { kind: 'rock', effect: 'stars', sound: 'twinkle' },
    render: (p, mode) =>
      mode === 'day' ? sunWithSpinningRays(p) : moon(SUN[0], SUN[1], 96, p.sun, p.sunRay, p.face),
  },
];

function hydrant(x: number, y: number, s: number, p: Palette): string {
  return (
    path(ellipse(x, y + 2, 30 * s, 7 * s), p.shadow, ' fill-opacity=".2"') +
    path(roundRect(x - 24 * s, y - 12 * s, 48 * s, 14 * s, 5 * s), p.hydrant) +
    path(roundRect(x - 17 * s, y - 64 * s, 34 * s, 56 * s, 10 * s), p.hydrant) +
    path(roundRect(x - 28 * s, y - 50 * s, 56 * s, 14 * s, 7 * s), p.hydrant) +
    path(
      `M${f(x - 20 * s)} ${f(y - 62 * s)}A${f(20 * s)} ${f(18 * s)} 0 0 1 ${f(x + 20 * s)} ${f(y - 62 * s)}Z`,
      p.hydrantDark,
    ) +
    path(circle(x, y - 84 * s, 6 * s), p.hydrantDark) +
    path(ellipse(x - 8 * s, y - 40 * s, 4 * s, 12 * s), '#ffffff', ' fill-opacity=".35"')
  );
}

function flowerClump(x: number, y: number, s: number, p: Palette, seed: number): string {
  const r = rng(seed);
  let out = grassTuft(x, y, 1.4 * s, p.grassDark);
  const colors = [p.flowerPink, p.flowerYellow, p.flowerWhite];
  for (let i = 0; i < 4; i++) {
    out += flower(
      x + range(r, -50, 50) * s,
      y - range(r, 20, 46) * s,
      1.1 * s,
      colors[i % 3],
      p.flowerCenter,
      p.grassDark,
    );
  }
  return out;
}

const day: Palette = {
  skyTop: '#6fc2f2',
  skyMid: '#a6dbf7',
  skyBottom: '#e4f6ff',
  haze: '#fff4c8',
  sun: '#ffd34d',
  sunRay: '#ffc531',
  face: '#8a4b1f',
  star: '#fff6d6',
  cloud: '#ffffff',
  cloudShade: '#e3f1fb',
  seaFar: '#9adcf2',
  sea: '#5cc2e8',
  seaNear: '#3fa8dc',
  seaLight: '#d4f4fc',
  seaShine: '#ffffff',
  glint: '#fff1b0',
  foam: '#ffffff',
  farSail: '#ffffff',
  farHull: '#ef7b62',
  cityA: '#cfe0f2',
  cityB: '#dcd6f0',
  cityC: '#d2e9ec',
  cityWindow: '#ffffff',
  hillFar: '#c3e4cf',
  hillFarTree: '#acd6ba',
  hill: '#a3d97f',
  hillLight: '#b7e293',
  hillLow: '#92cf6c',
  hillLowLight: '#a5d880',
  tree: '#72c150',
  treeDark: '#59a83f',
  treeLight: '#a1db7a',
  trunk: '#9a6a44',
  bush: '#79c452',
  bushDark: '#5fa83f',
  bushDot: '#ff9ec4',
  farHouseA: '#ffe1b8',
  farHouseB: '#fbc6cf',
  farRoof: '#e8775f',
  farRoof2: '#6f9fd8',
  farWindow: '#8fc7e8',
  ballast: '#cfc2b2',
  ballastDark: '#b5a693',
  sleeper: '#9b6b47',
  rail: '#7f8a99',
  railLight: '#e1e7ef',
  crossingDeck: '#8b8f9c',
  wall: '#e2d4be',
  wallLight: '#f0e6d6',
  wallShade: '#c8b79e',
  bridge: '#f0cfa2',
  bridgeLight: '#f9e4c4',
  bridgeShade: '#d9b083',
  bridgeRail: '#5e8fd0',
  tunnel: '#d3cabd',
  tunnelShade: '#b8ad9e',
  tunnelDark: '#3d3754',
  coping: '#ddd6cb',
  copingShade: '#bfb6a8',
  dirt: '#e8c48c',
  dirtDark: '#cfa269',
  sand: '#f2cf8e',
  sandShade: '#ddb06c',
  sandLight: '#fbe6bd',
  field: '#f0d36a',
  fieldDark: '#d9b64a',
  fieldLight: '#f8e494',
  cone: '#ff8a3d',
  coneStripe: '#ffffff',
  road: '#7b8597',
  roadLight: '#8d97a8',
  roadLine: '#ffffff',
  curb: '#e3e6ec',
  curbShade: '#b8bfca',
  sidewalk: '#ecdfd0',
  sidewalkJoint: '#d9c8b4',
  grass: '#92d16c',
  grassDark: '#6fb54d',
  shadow: '#2c3550',
  lampPost: '#4d5a77',
  lamp: '#fff6d2',
  lampGlow: '#ffd36b',
  glass: '#bfe6fb',
  glassShine: '#ffffff',
  glassCore: '#ffffff',
  windowGlow: '#ffcf5a',
  stopRoof: '#2f9fdd',
  stopFrame: '#4d5a77',
  stopBench: '#f2a93b',
  fire: '#ea4b3f',
  fireDark: '#c63a31',
  fireTrim: '#fff4e4',
  fireLamp: '#ffd34d',
  emblem: '#3f7fd6',
  flame: '#ff8a2a',
  flameCore: '#ffe04d',
  garage: '#5c3b4a',
  garageFloor: '#7d5566',
  door: '#f4ede4',
  doorSlat: '#ddd2c4',
  police: '#4f8ddc',
  policeDark: '#3b72c2',
  policeTrim: '#ffffff',
  policeDoor: '#2f5c9f',
  badge: '#ffc93c',
  badgeDark: '#e3a526',
  beacon: '#3d8bff',
  beaconLight: '#cfe6ff',
  beaconGlow: '#7fb8ff',
  step: '#c9ced8',
  stepLight: '#e2e6ee',
  hospital: '#fbf8f2',
  hospitalShade: '#e8e0d4',
  hospitalTrim: '#74d2c1',
  signBox: '#ffffff',
  cross: '#ee4545',
  crossGlow: '#ff8a8a',
  canopy: '#5fc2b0',
  lightBox: '#3d4556',
  lightBoxDark: '#2b313e',
  red: '#ff4b4b',
  redDim: '#6e3640',
  amber: '#ffc431',
  amberDim: '#6f5a35',
  green: '#3ddc6e',
  greenDim: '#2f5c48',
  crossingPole: '#ffffff',
  crossingRed: '#ee4545',
  crossingWhite: '#ffffff',
  lighthouse: '#ffffff',
  lighthouseRed: '#ec4a3e',
  lighthouseDark: '#a8322b',
  lighthouseDoor: '#3f6fb8',
  lighthouseBase: '#d8d2c8',
  beam: '#fff3a0',
  rock: '#b8b1c4',
  rockShade: '#9d95ab',
  rockLight: '#d6d1df',
  buoy: '#ff5a4a',
  boxA: '#ff8a3d',
  boxADark: '#d86a22',
  boxB: '#3fb5a3',
  boxBDark: '#2b8f80',
  boxC: '#ffcf3f',
  boxCDark: '#d9a520',
  white: '#ffffff',
  hydrant: '#ec4a3e',
  hydrantDark: '#b8352d',
  flowerPink: '#ff9ec4',
  flowerYellow: '#ffd84d',
  flowerWhite: '#ffffff',
  flowerCenter: '#ffb03c',
};

const night: Palette = {
  skyTop: '#0a1336',
  skyMid: '#17266a',
  skyBottom: '#33479a',
  haze: '#7d95e6',
  sun: '#fff1c0',
  sunRay: '#ffe9a8',
  face: '#7a5a34',
  star: '#fff6d6',
  cloud: '#3e4f94',
  cloudShade: '#33427f',
  seaFar: '#3b5fa8',
  sea: '#2a4c94',
  seaNear: '#203f86',
  seaLight: '#7f9fe0',
  seaShine: '#dce6ff',
  glint: '#ffe08a',
  cityA: '#3d4f8e',
  cityB: '#46518f',
  cityC: '#3c5590',
  lamp: '#fff4c0',
  lampGlow: '#ffd36b',
  glass: '#ffd761',
  glassCore: '#fff6c4',
  windowGlow: '#ffc94a',
  fireLamp: '#ffe680',
  flame: '#ff9a3a',
  flameCore: '#ffe680',
  badge: '#ffd34d',
  beacon: '#4a9bff',
  beaconLight: '#d8ecff',
  beaconGlow: '#5aa8ff',
  signBox: '#fff3e0',
  cross: '#ff5a5a',
  crossGlow: '#ff7a7a',
  red: '#ff5a5a',
  amber: '#ffcf4a',
  green: '#4dff86',
  beam: '#fff2a0',
  buoy: '#d9554c',
  crossingWhite: '#c9cdf0',
  crossingPole: '#c9cdf0',
  lighthouse: '#c9cdf0',
  farWindow: '#ffd761',
};

const vehicles: SceneDef = {
  id: 'vehicles',
  world: [W, H],
  horizon: 830,
  ambient: { clouds: 6, birds: 4, stars: 60, fireflies: 6 },
  defaults: [
    { animal: 'train', x: 760, y: RAIL_Y - 130 },
    { animal: 'boat', x: 640, y: 1300 },
    { animal: 'airplane', x: 1060, y: 360 },
    { animal: 'helicopter', x: 2560, y: 520, flip: true },
    { animal: 'rocket', x: 1880, y: 230, scale: 0.7 },
    { animal: 'tractor', x: 3040, y: 936 - 110 },
    { animal: 'digger', x: 3360, y: TOWN_Y - 130, flip: true },
    { animal: 'taxi', x: 1050, y: 1612 - 85 },
    { animal: 'school-bus', x: 1930, y: 1612 - 120 },
    { animal: 'ambulance', x: 2830, y: 1612 - 110, flip: true },
    { animal: 'motorbike', x: 250, y: 1762 - 75 },
    { animal: 'garbage-truck', x: 700, y: 1762 - 125, flip: true },
    { animal: 'fire-truck', x: 1500, y: 1762 - 130 },
    { animal: 'police-car', x: 2250, y: 1762 - 90 },
    { animal: 'dump-truck', x: 3150, y: 1762 - 125, flip: true },
    { animal: 'bicycle', x: 2620, y: 1852 - 65 },
  ],
  day,
  night,
  interactives,
  back: (p, mode) => {
    const night = mode === 'night';
    return (
      `<defs>${radialGlow('vhStreet', p.lampGlow, night ? 0.75 : 0)}</defs>` +
      skyLayer(p, mode) +
      farSea(p) +
      farLand(p, mode) +
      bridge(p) +
      retainingWall(BRIDGE_X1, SIDE_X - 60, p) +
      retainingWall(SIDE_X + 60, W + 40, p) +
      lowerSlope(p) +
      tunnel(p) +
      sideStreet(p) +
      track(-60, W + 40, p) +
      bush(SIDE_X + 64, 900, 0.6, p.bush, p.bushDark) +
      townTree(1300, 1160, 0.9, p) +
      poplar(1800, 1170, 0.85, p) +
      poplar(SIDE_X + 120, 1180, 0.8, p) +
      townTree(3180, 1170, 0.9, p) +
      lotDirt(p) +
      sidewalkAndRoad(p) +
      streetMouth(p) +
      busStop(p, mode) +
      (night
        ? QUAY_LAMPS.map(([x, dir]) => lampPool(x + dir * 52, TOWN_Y + 40, 'vhStreet')).join('')
        : '') +
      streetLamp(SIDE_X + 92, TOWN_Y + 40, -1, p, mode, 'vhStreet') +
      streetLamp(3176, TOWN_Y + 40, 1, p, mode, 'vhStreet') +
      cone(3196, TOWN_Y + 30, 0.9, p) +
      cone(3590, TOWN_Y + 30, 0.9, p) +
      barrier(3420, TOWN_Y + 36, p)
    );
  },
  front: (p) =>
    bush(70, 2036, 1.5, p.bush, p.bushDark, p.bushDot) +
    flowerClump(330, 1990, 1, p, 3) +
    hydrant(1130, 1872, 1, p) +
    grassTuft(1460, 2004, 2, p.grassDark) +
    flowerClump(2050, 1996, 1, p, 7) +
    grassTuft(2780, 2004, 1.8, p.grassDark) +
    cone(3290, 1870, 1, p) +
    bush(3540, 2036, 1.6, p.bush, p.bushDark),
};

export default vehicles;
