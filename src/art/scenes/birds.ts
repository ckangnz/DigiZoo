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
const HORIZON = 1000;

const SUN: Pt = [2700, 300];
const TREE: Pt = [560, 1590];
const BOX: Pt = [960, 1552];
const LAKE: Pt = [1620, 1345];
const BATH: Pt = [1240, 1772];
const BLOOMS: Pt = [2300, 1806];
const LIGHT: Pt = [3390, 640];
const POLES: Pt[] = [
  [1700, 1144],
  [2170, 1154],
];

type Layer = [number, string];
type Shape = [Bounds, Pt[]];

const HILL_FAR: Pt[] = [
  [-200, 950],
  [140, 902],
  [470, 930],
  [800, 880],
  [1140, 914],
  [1480, 886],
  [1800, 928],
  [2060, 968],
  [2240, 1003],
];

const HILL_NEAR: Pt[] = [
  [-200, 1012],
  [240, 974],
  [620, 1000],
  [980, 962],
  [1360, 994],
  [1700, 972],
  [1960, 1006],
  [2110, 1040],
  [2180, 1076],
];

const EDGE = spline(
  [
    [-200, 1084],
    [300, 1066],
    [800, 1082],
    [1300, 1068],
    [1800, 1082],
    [2050, 1074],
    [2170, 1048],
    [2250, 1006],
    [2296, 1044],
    [2350, 1116],
    [2430, 1226],
    [2540, 1344],
    [2690, 1440],
    [2860, 1500],
    [3000, 1530],
    [3100, 1546],
  ],
  300,
);

const TIP = EDGE.reduce((a, b) => (b[1] < a[1] ? b : a));
const COAST = EDGE.filter(([x]) => x >= TIP[0]);

const FACE_PTS = spline(
  [
    [3086, 704],
    [3068, 790],
    [3092, 884],
    [3074, 990],
    [3098, 1096],
    [3080, 1204],
    [3104, 1310],
    [3088, 1410],
    [3098, 1490],
    [3100, 1546],
  ],
  80,
);

const DUNE = spline(
  [
    [2236, 1010],
    [2262, 1066],
    [2300, 1150],
    [2356, 1262],
    [2430, 1400],
    [2510, 1560],
    [2580, 1760],
    [2620, 2060],
  ],
  60,
);

function xAt(pts: Pt[], y: number): number {
  for (let i = 1; i < pts.length; i++) {
    const [x0, y0] = pts[i - 1];
    const [x1, y1] = pts[i];
    if ((y0 - y) * (y1 - y) <= 0 && y1 !== y0) return x0 + ((x1 - x0) * (y - y0)) / (y1 - y0);
  }
  return y < pts[0][1] ? pts[0][0] : pts[pts.length - 1][0];
}

const faceX = (y: number): number => xAt(FACE_PTS, y);
const duneX = (y: number): number => xAt(DUNE, y);

const SEA: Pt[] = [
  [TIP[0], HORIZON],
  [faceX(HORIZON), HORIZON],
  ...FACE_PTS.filter(([, y]) => y > HORIZON),
  ...COAST.slice().reverse(),
];

function inside([x, y]: Pt, pts: Pt[]): boolean {
  let hit = false;
  for (let i = 0, j = pts.length - 1; i < pts.length; j = i++) {
    const [ax, ay] = pts[i];
    const [bx, by] = pts[j];
    if (ay > y !== by > y && x < ax + ((bx - ax) * (y - ay)) / (by - ay)) hit = !hit;
  }
  return hit;
}

function inSea(x: number, y: number, pad = 0): boolean {
  const probes: Pt[] = [
    [0, 0],
    [pad, 0],
    [-pad, 0],
    [0, pad],
    [0, -pad],
  ];
  return probes.every(([dx, dy]) => inside([x + dx, y + dy], SEA));
}

function lakeOutline(k = 1, dy = 0): Pt[] {
  const [cx, cy] = LAKE;
  const pts: Pt[] = [
    [-490, 2],
    [-430, -70],
    [-280, -108],
    [-60, -122],
    [180, -116],
    [360, -92],
    [470, -40],
    [486, 30],
    [400, 92],
    [200, 118],
    [-60, 124],
    [-300, 108],
    [-440, 66],
  ];
  return pts.map(([x, y]) => [cx + x * k, cy + y * k + dy]);
}

const LAKE_PTS = samplePath(smooth(lakeOutline(1.08, 8), true), 8);

const inLake = (x: number, y: number): boolean => inside([x, y], LAKE_PTS);

function sunWithSpinningRays(p: Palette): string {
  const [x, y] = SUN;
  const svg = sun(x, y, 108, p.sun, p.sunRay, p.face);
  const rays = svg.match(new RegExp(`(<path[^>]*fill="${p.sunRay}"/>)+`))?.[0] ?? '';
  return svg.replace(rays, `<g data-spin="" style="transform-origin: ${x}px ${y}px">${rays}</g>`);
}

function puffCloud(x: number, y: number, s: number, stretch: number, p: Palette): string {
  const puffs: [number, number, number][] = [
    [-96, -12, 30],
    [-48, -30, 44],
    [12, -40, 54],
    [70, -24, 40],
    [116, -10, 26],
  ];
  const blob = (dy: number, color: string) =>
    puffs.map(([dx, py, r]) => path(circle(x + dx * s, y + (py + dy) * s, r * s), color)).join('') +
    path(roundRect(x - 130 * s, y + (dy - 20) * s, 272 * s, 30 * s, 15 * s), color);
  return group(
    blob(8, p.cloudShade) + blob(0, p.cloud),
    `translate(${f(x)} 0) scale(${stretch} 1) translate(${f(-x)} 0)`,
  );
}

function hillD(pts: Pt[]): string {
  const [ex] = pts[pts.length - 1];
  return `${smooth(pts, false)}L${f(ex)} 1140L-200 1140Z`;
}

function farTree(x: number, y: number, s: number, p: Palette): string {
  return (
    path(roundRect(x - 3 * s, y - 20 * s, 6 * s, 22 * s, 3 * s), p.hillTrunk) +
    path(scallop(x, y - 30 * s, 1, 7, 5 * s, 0, 22 * s, 16 * s), p.hillTree)
  );
}

function hills(p: Palette): string {
  return (
    path(hillD(HILL_FAR), p.hillFar) +
    [180, 420, 900, 1320, 1620]
      .map((x, i) => farTree(x, 916 + (i % 2) * 18, 0.8 + (i % 3) * 0.15, p))
      .join('') +
    path(hillD(HILL_NEAR), p.hillNear) +
    [330, 560, 1100, 1180, 1880]
      .map((x, i) => farTree(x, 994 + (i % 2) * 10, 1.1 + (i % 2) * 0.2, p))
      .join('')
  );
}

function land(p: Palette): string {
  const d = `${poly(EDGE, false)}L3240 1562L3650 1572L3650 ${H + 60}L-200 ${H + 60}Z`;
  const r = rng(77);
  let patches = '';
  for (let i = 0; i < 18; i++) {
    const x = range(r, 0, 2500);
    const y = range(r, 1180, 1900);
    if (inLake(x, y) || x > duneX(y) - 160) continue;
    patches += path(
      ellipse(x, y, range(r, 140, 280), range(r, 22, 40)),
      i % 3 ? p.groundLight : p.groundGold,
      ' fill-opacity=".6"',
    );
  }
  return path(d, p.ground) + patches;
}

function beach(p: Palette): string {
  const top = COAST.map(([x, y]): Pt => [x, y - 10]);
  const sand = poly([
    ...top,
    [3240, 1552],
    [3650, 1562],
    [3650, H + 60],
    ...DUNE.slice().reverse(),
  ]);
  const wet = COAST.map(([x, y]): Pt => [x - 4, y + 6]);
  const r = rng(41);
  let ripples = '';
  for (let i = 0; i < 12; i++) {
    const y = range(r, 1250, 1950);
    const x = range(r, duneX(y) + 80, 3550);
    if (y < 1470 && x > 3000) continue;
    if (inside([x, y], SEA)) continue;
    ripples += stroke(curve(x - 40, y, x + 40, y, -6), p.sandDark, 4, ' stroke-opacity=".45"');
  }
  return (
    path(sand, p.sand) +
    stroke(poly(wet, false), p.sandWet, 30, ' stroke-opacity=".8"') +
    stroke(poly(DUNE, false), p.sandLight, 14, ' stroke-opacity=".6"') +
    ripples
  );
}

function headlandOutline(shift: number): Pt[] {
  const top = spline(
    [
      [3660, 628],
      [3520, 614],
      [3360, 620],
      [3220, 632],
      [3130, 650],
      [3094, 676],
    ],
    24,
  );
  return [
    ...top,
    ...FACE_PTS.map(([x, y]): Pt => [x - shift, y]),
    [3100 - shift, 1556],
    [3240, 1566],
    [3420, 1572],
    [3660, 1576],
  ];
}

function headland(p: Palette): string {
  const body = poly(headlandOutline(8));
  const bands: [number, number, string, string][] = [
    [744, 30, p.cliffBand, '.7'],
    [826, 20, p.cliffLight, '.85'],
    [906, 56, p.cliffBand, '.6'],
    [1030, 22, p.cliffLight, '.8'],
    [1112, 64, p.cliffBand, '.55'],
    [1238, 24, p.cliffLight, '.75'],
    [1320, 74, p.cliffBand, '.5'],
    [1440, 22, p.cliffLight, '.6'],
  ];
  const strata = bands
    .map(([y, t, color, op], i) => {
      const pts: Pt[] = [];
      for (let x = 3040; x <= 3680; x += 40) pts.push([x, y + 7 * Math.sin(x / 70 + i)]);
      const low = pts.map(([x, yy]): Pt => [x, yy + t + 5 * Math.sin(x / 50 + i * 2)]).reverse();
      return path(smooth([...pts, ...low], true, 0.6), color, ` fill-opacity="${op}"`);
    })
    .join('');
  const shade = path(
    smooth(
      [
        [3340, 600],
        [3306, 820],
        [3344, 1040],
        [3312, 1260],
        [3350, 1600],
        [3700, 1600],
        [3700, 600],
      ],
      true,
      0.5,
    ),
    p.cliffShade,
    ' fill-opacity=".42"',
  );
  const cracks = (
    [
      [
        [3176, 940],
        [3168, 990],
        [3182, 1030],
      ],
      [
        [3250, 1150],
        [3240, 1196],
        [3254, 1236],
      ],
      [
        [3196, 1356],
        [3206, 1400],
        [3194, 1440],
      ],
      [
        [3420, 960],
        [3430, 1010],
      ],
      [
        [3470, 1260],
        [3460, 1310],
      ],
    ] as Pt[][]
  )
    .map((pts) => stroke(smooth(pts, false), p.cliffShade, 5, ' stroke-opacity=".7"'))
    .join('');
  const ledge = (y: number, w: number) => {
    const x0 = faceX(y) - 8;
    const lip = smooth(
      [
        [x0, y - 8],
        [x0 + w * 0.5, y - 6],
        [x0 + w, y + 2],
        [x0 + w * 0.5, y + 8],
        [x0, y + 9],
      ],
      true,
      0.7,
    );
    const under = smooth(
      [
        [x0, y + 8],
        [x0 + w * 0.6, y + 10],
        [x0 + w * 0.9, y + 6],
        [x0 + w * 0.6, y + 22],
        [x0, y + 26],
      ],
      true,
      0.7,
    );
    return path(under, p.cliffShade, ' fill-opacity=".75"') + path(lip, p.cliffLight);
  };
  const wetBase = path(
    smooth(
      [
        [3060, 1486],
        [3200, 1500],
        [3400, 1510],
        [3700, 1504],
        [3700, 1600],
        [3060, 1600],
      ],
      true,
      0.4,
    ),
    p.cliffWet,
    ' fill-opacity=".5"',
  );
  const capTop = spline(
    [
      [3660, 616],
      [3520, 602],
      [3360, 608],
      [3220, 620],
      [3130, 638],
      [3078, 670],
    ],
    24,
  );
  const capLow = spline(
    [
      [3072, 728],
      [3110, 704],
      [3170, 698],
      [3240, 680],
      [3330, 684],
      [3440, 672],
      [3560, 676],
      [3660, 668],
    ],
    30,
  );
  const cap = path(smooth([...capTop, ...capLow], true, 0.4), p.capGrass);
  const capShade = path(
    smooth(
      [
        ...capLow.map(([x, y]): Pt => [x, y - 14]),
        ...capLow
          .slice()
          .reverse()
          .map(([x, y]): Pt => [x, y + 4]),
      ],
      true,
      0.4,
    ),
    p.capDark,
  );
  const capAt = (x: number) =>
    capLow.reduce((a, b) => (Math.abs(b[0] - x) < Math.abs(a[0] - x) ? b : a))[1];
  const drips = [3092, 3146, 3210, 3276, 3350, 3430, 3520, 3604]
    .map((x, i) => path(ellipse(x, capAt(x) + 2, 26 + (i % 3) * 8, 14 + (i % 2) * 6), p.capGrass))
    .join('');
  const blades = [3120, 3190, 3262, 3318, 3460, 3540, 3610]
    .map((x, i) =>
      [-100, -80, -60]
        .map((a, k) =>
          path(
            leaf(
              x + (k - 1) * 8,
              612 + (x > 3300 ? -4 : 6) + Math.abs(x - 3300) * 0.02,
              26 + (k % 2) * 10,
              4,
              a - (i % 2) * 8,
            ),
            k % 2 ? p.capDark : p.capGrass,
          ),
        )
        .join(''),
    )
    .join('');
  const thrift = (
    [
      [3150, 662],
      [3222, 650],
      [3480, 640],
      [3570, 646],
      [3134, 1018],
      [3150, 1226],
      [3128, 816],
    ] as Pt[]
  )
    .map(
      ([x, y], i) =>
        path(scallop(x, y + 10, 1, 6, 4, 0, 18, 7), p.capDark) +
        path(circle(x - 7, y, 7), i % 2 ? p.thrift : p.thriftLight) +
        path(circle(x + 7, y + 2, 6), p.thrift) +
        path(circle(x, y - 6, 5), p.thriftLight),
    )
    .join('');
  return (
    `<defs><clipPath id="bdCliff"><path d="${body}"/></clipPath></defs>` +
    path(body, p.cliff) +
    group(strata + shade + wetBase + cracks, '', ' clip-path="url(#bdCliff)"') +
    ledge(828, 170) +
    ledge(1034, 190) +
    ledge(1242, 170) +
    blades +
    cap +
    capShade +
    drips +
    thrift
  );
}

function pole(x: number, y: number, h: number, p: Palette): string {
  const top = y - h;
  const arm = top + 34;
  const ins = (ix: number, iy: number) =>
    path(roundRect(ix - 3, iy - 4, 6, 10, 2), p.poleDark) +
    path(
      `M${f(ix - 8)} ${f(iy - 4)}Q${f(ix - 8)} ${f(iy - 18)} ${f(ix)} ${f(iy - 20)}Q${f(ix + 8)} ${f(iy - 18)} ${f(ix + 8)} ${f(iy - 4)}Z`,
      p.insulator,
    );
  return (
    path(ellipse(x, y + 3, 34, 7), p.groundShade, ' fill-opacity=".45"') +
    path(
      `M${f(x - 12)} ${f(y + 3)}L${f(x - 9)} ${f(top + 8)}Q${f(x)} ${f(top - 2)} ${f(x + 9)} ${f(top + 8)}L${f(x + 12)} ${f(y + 3)}Z`,
      p.poleWood,
    ) +
    stroke(
      `M${f(x + 4)} ${f(y - 10)}L${f(x + 3)} ${f(top + 20)}`,
      p.poleDark,
      3,
      ' stroke-opacity=".5"',
    ) +
    path(roundRect(x - 64, arm, 128, 13, 5), p.poleDark) +
    ins(x - 50, arm) +
    ins(x + 50, arm) +
    ins(x, top + 4)
  );
}

const WIRE_H: [number, number] = [410, 402];
const SAG = 40;

function wireAt(x: number): number {
  const [[ax, ay], [bx, by]] = POLES;
  const u = (x - ax) / (bx - ax);
  const tA = ay - WIRE_H[0] - 12;
  const tB = by - WIRE_H[1] - 12;
  return tA + (tB - tA) * u + 4 * SAG * u * (1 - u);
}

function wires(p: Palette): string {
  const [[ax, ay], [bx, by]] = POLES;
  const tA = ay - WIRE_H[0];
  const tB = by - WIRE_H[1];
  return (
    stroke(curve(ax + 50, tA + 18, bx - 50, tB + 18, SAG * 1.6), p.wire, 4.5) +
    stroke(curve(ax, tA - 12, bx, tB - 12, SAG * 2), p.wire, 4.5)
  );
}

function telegraph(p: Palette): string {
  const [[ax, ay], [bx, by]] = POLES;
  return pole(ax, ay, WIRE_H[0], p) + pole(bx, by, WIRE_H[1], p) + wires(p);
}

function canopy(x: number, y: number, p: Palette, seed: number): string {
  const blobs: [number, number, number, number][] = [
    [-470, -1000, 140, 112],
    [480, -1020, 150, 112],
    [-350, -880, 210, 140],
    [330, -890, 224, 140],
    [-250, -1110, 236, 160],
    [240, -1130, 246, 160],
    [-10, -990, 300, 190],
    [-10, -1270, 260, 160],
    [-150, -1370, 160, 100],
    [160, -1380, 160, 100],
  ];
  let out = '';
  blobs.forEach(([dx, dy, rx, ry], i) => {
    out += path(scallop(x + dx, y + dy + 20, 1, 13, rx * 0.13, i * 11, rx, ry), p.leavesDark);
  });
  blobs.forEach(([dx, dy, rx, ry], i) => {
    out += path(
      scallop(x + dx + 6, y + dy, 1, 13, rx * 0.12, i * 17 + 5, rx * 0.93, ry * 0.86),
      p.leaves,
    );
  });
  blobs.forEach(([dx, dy, rx, ry], i) => {
    out += path(
      scallop(
        x + dx + rx * 0.26,
        y + dy - ry * 0.34,
        1,
        9,
        rx * 0.06,
        i * 23,
        rx * 0.44,
        ry * 0.32,
      ),
      p.leavesLight,
    );
  });
  const r = rng(seed);
  blobs.forEach(([dx, dy, rx, ry]) => {
    for (let i = 0; i < 9; i++) {
      const a = range(r, 0, Math.PI * 2);
      const k = Math.sqrt(range(r, 0.1, 0.8));
      const lx = x + dx + Math.cos(a) * rx * k * 0.85;
      const ly = y + dy + Math.sin(a) * ry * k * 0.8;
      const up = Math.sin(a) < 0;
      out += path(
        leaf(lx, ly, range(r, 18, 26), 6, range(r, -60, 60) + (i % 2 ? 180 : 0)),
        up ? p.leavesLight : p.leavesDark,
        ` fill-opacity="${up ? '.9' : '.7'}"`,
      );
    }
  });
  return out;
}

function nest(x: number, y: number, p: Palette): string {
  let twigs = '';
  for (let i = 0; i < 7; i++) {
    const a = -56 + i * 18;
    twigs += stroke(
      curve(x + a, y + 4 + (i % 2) * 6, x + a + 34, y + 16 - (i % 3) * 4, 6),
      i % 2 ? p.nestDark : p.nestLight,
      4,
    );
  }
  return (
    path(
      `M${f(x - 66)} ${f(y - 4)}Q${f(x - 60)} ${f(y + 44)} ${f(x)} ${f(y + 46)}Q${f(x + 60)} ${f(y + 44)} ${f(x + 66)} ${f(y - 4)}Z`,
      p.nest,
    ) +
    twigs +
    path(ellipse(x - 22, y - 12, 15, 19, -12), p.egg) +
    path(ellipse(x + 22, y - 12, 15, 19, 12), p.egg) +
    path(ellipse(x, y - 18, 16, 20), p.eggLight) +
    path(circle(x - 4, y - 24, 3), p.eggSpot) +
    path(circle(x + 26, y - 18, 2.5), p.eggSpot) +
    path(circle(x - 26, y - 8, 2.5), p.eggSpot) +
    path(roundRect(x - 70, y - 10, 140, 16, 8), p.nestDark) +
    stroke(curve(x - 62, y - 3, x + 62, y - 3, -4), p.nestLight, 4, ' stroke-opacity=".8"')
  );
}

function oak(p: Palette): string {
  const [x, y] = TREE;
  const T = (pts: Pt[]): Pt[] => pts.map(([dx, dy]) => [x + dx, y + dy]);
  const limb = (pts: Pt[], r0: number, r1: number, color = p.trunk) =>
    path(
      tube(T(pts), (u) => r0 + (r1 - r0) * u),
      color,
    );
  const trunk =
    smooth(
      T([
        [-286, 12],
        [-204, -2],
        [-146, -38],
        [-110, -118],
        [-96, -260],
        [-92, -420],
        [-100, -560],
        [-126, -650],
        [-70, -694],
        [20, -704],
        [104, -662],
        [88, -540],
        [84, -400],
        [90, -250],
        [108, -128],
        [152, -44],
        [216, -6],
        [300, 12],
      ]),
      false,
    ) + 'Z';
  const shadeSide = smooth(
    T([
      [-300, 20],
      [-160, -30],
      [-118, -120],
      [-104, -270],
      [-100, -430],
      [-108, -570],
      [-140, -660],
      [-60, -640],
      [-50, -540],
      [-58, -420],
      [-56, -280],
      [-40, -150],
      [-10, -60],
      [-40, 20],
    ]),
    true,
    0.7,
  );
  const lightSide = smooth(
    T([
      [96, -640],
      [78, -540],
      [74, -400],
      [80, -250],
      [98, -128],
      [140, -50],
      [100, -60],
      [60, -150],
      [48, -280],
      [50, -420],
      [56, -560],
      [70, -640],
    ]),
    true,
    0.7,
  );
  const bark = (
    [
      [
        [-36, -40],
        [-48, -200],
        [-30, -330],
        [-44, -470],
        [-34, -600],
      ],
      [
        [18, -60],
        [30, -190],
        [16, -300],
        [26, -380],
      ],
      [
        [8, -490],
        [24, -560],
        [14, -630],
      ],
      [
        [-70, -110],
        [-64, -170],
      ],
    ] as Pt[][]
  )
    .map((pts) => stroke(smooth(T(pts), false), p.trunkDark, 6, ' stroke-opacity=".5"'))
    .join('');
  const rootLines = (
    [
      [
        [-120, -26],
        [-200, 2],
        [-262, 10],
      ],
      [
        [110, -24],
        [196, 2],
        [270, 10],
      ],
    ] as Pt[][]
  )
    .map((pts) => stroke(smooth(T(pts), false), p.trunkDark, 6, ' stroke-opacity=".45"'))
    .join('');
  const sprig = (sx: number, sy: number, a: number) =>
    path(leaf(sx, sy, 46, 12, a - 30), p.leavesDark) +
    path(leaf(sx, sy, 52, 13, a), p.leaves) +
    path(leaf(sx, sy, 42, 11, a + 34), p.leavesLight);
  return (
    `<defs><clipPath id="bdTrunk"><path d="${trunk}"/></clipPath></defs>` +
    path(ellipse(x + 20, y + 8, 420, 36), p.groundShade, ' fill-opacity=".45"') +
    limb(
      [
        [-40, -640],
        [-170, -760],
        [-300, -830],
        [-440, -850],
      ],
      46,
      16,
    ) +
    limb(
      [
        [-20, -660],
        [-90, -830],
        [-150, -990],
      ],
      42,
      18,
    ) +
    limb(
      [
        [30, -660],
        [110, -850],
        [170, -1010],
      ],
      42,
      18,
    ) +
    path(trunk, p.trunk) +
    group(
      path(shadeSide, p.trunkDark, ' fill-opacity=".4"') +
        path(lightSide, p.trunkLight, ' fill-opacity=".6"') +
        bark +
        rootLines,
      '',
      ' clip-path="url(#bdTrunk)"',
    ) +
    limb(
      [
        [-36, -30],
        [-84, -6],
        [-146, 14],
      ],
      22,
      9,
    ) +
    limb(
      [
        [44, -30],
        [100, -6],
        [168, 14],
      ],
      20,
      9,
    ) +
    stroke(curve(x - 120, y + 12, x - 60, y - 22, -6), p.trunkDark, 5, ' stroke-opacity=".4"') +
    path(ellipse(x - 12, y - 430, 47, 61), p.trunkDark) +
    path(ellipse(x - 12, y - 426, 35, 49), p.hollow) +
    path(ellipse(x - 2, y - 440, 12, 18), p.hollowLight, ' fill-opacity=".5"') +
    stroke(curve(x - 46, y - 388, x + 22, y - 388, 18), p.trunkLight, 8, ' stroke-opacity=".8"') +
    path(ellipse(x + 46, y - 210, 11, 15), p.trunkDark) +
    path(ellipse(x + 48, y - 212, 5, 8), p.trunk) +
    limb(
      [
        [50, -610],
        [240, -668],
        [440, -690],
        [620, -698],
        [770, -684],
      ],
      38,
      9,
    ) +
    stroke(
      smooth(
        T([
          [130, -668],
          [300, -696],
          [500, -708],
        ]),
        false,
      ),
      p.trunkLight,
      7,
      ' stroke-opacity=".55"',
    ) +
    stroke(
      smooth(
        T([
          [120, -618],
          [300, -650],
          [520, -672],
        ]),
        false,
      ),
      p.trunkDark,
      6,
      ' stroke-opacity=".35"',
    ) +
    canopy(x, y, p, 13) +
    limb(
      [
        [-300, -790],
        [-400, -806],
        [-500, -818],
      ],
      16,
      9,
    ) +
    nest(x - 420, y - 840, p) +
    sprig(x + 770, y - 684, -30) +
    sprig(x + 600, y - 698, -100) +
    sprig(x + 420, y - 690, 80) +
    sprig(x - 500, y - 818, -150)
  );
}

function birdhouse(p: Palette, mode: Mode): string {
  const [x, y] = BOX;
  const night = mode === 'night';
  const hb = y - 250;
  const hw = 112;
  const wallTop = hb - 124;
  const peak = wallTop - 66;
  const roof = poly([
    [x - hw / 2 - 24, wallTop + 16],
    [x, peak - 8],
    [x + hw / 2 + 24, wallTop + 16],
    [x + hw / 2 + 10, wallTop + 30],
    [x, peak + 14],
    [x - hw / 2 - 10, wallTop + 30],
  ]);
  return (
    `<defs>${radialGlow('bdHole', p.holeGlow, night ? 0.85 : 0)}</defs>` +
    path(ellipse(x, y + 4, 60, 10), p.groundShade, ' fill-opacity=".5"') +
    path(roundRect(x - 14, hb - 6, 28, y - hb + 10, 7), p.post) +
    stroke(
      `M${f(x + 5)} ${f(hb + 10)}L${f(x + 5)} ${f(y - 8)}`,
      p.postDark,
      4,
      ' stroke-opacity=".6"',
    ) +
    path(
      poly([
        [x - 40, hb + 4],
        [x + 40, hb + 4],
        [x + 12, hb + 34],
        [x - 12, hb + 34],
      ]),
      p.postDark,
    ) +
    path(roundRect(x - hw / 2 - 12, hb - 6, hw + 24, 18, 7), p.postDark) +
    path(
      poly([
        [x - hw / 2, hb - 2],
        [x - hw / 2, wallTop + 10],
        [x, peak + 10],
        [x + hw / 2, wallTop + 10],
        [x + hw / 2, hb - 2],
      ]),
      p.houseWall,
    ) +
    path(
      poly([
        [x + hw / 2 - 18, hb - 2],
        [x + hw / 2 - 18, wallTop + 24],
        [x + hw / 2, wallTop + 12],
        [x + hw / 2, hb - 2],
      ]),
      p.houseWallShade,
    ) +
    (night ? `<circle cx="${f(x)}" cy="${f(wallTop + 52)}" r="70" fill="url(#bdHole)"/>` : '') +
    path(circle(x, wallTop + 52, 22), p.houseTrim) +
    path(circle(x, wallTop + 52, 17), p.hole) +
    path(circle(x, wallTop + 90, 7), p.postDark) +
    stroke(roof, p.houseRoof, 8) +
    path(roof, p.houseRoof) +
    stroke(
      `M${f(x - hw / 2 - 14)} ${f(wallTop + 20)}L${f(x)} ${f(peak + 2)}L${f(x + hw / 2 + 14)} ${f(wallTop + 20)}`,
      p.houseRoofDark,
      4,
      ' stroke-opacity=".5"',
    ) +
    path(circle(x, peak - 8, 9), p.houseRoofDark)
  );
}

function reeds(x: number, y: number, s: number, p: Palette): string {
  let out = '';
  [-116, -102, -90, -78, -64].forEach((a, i) => {
    out += path(
      leaf(x + (i - 2) * 6 * s, y + 2, (60 + (i % 2) * 32) * s, 6 * s, a),
      i % 2 ? p.reedDark : p.reed,
    );
  });
  out += stroke(
    `M${f(x - 4 * s)} ${f(y)}Q${f(x - 8 * s)} ${f(y - 64 * s)} ${f(x - 14 * s)} ${f(y - 110 * s)}`,
    p.reedDark,
    3.5 * s,
  );
  out += path(capsule(x - 14 * s, y - 106 * s, x - 16 * s, y - 134 * s, 7 * s), p.cattail);
  out += stroke(
    `M${f(x + 6 * s)} ${f(y)}Q${f(x + 10 * s)} ${f(y - 52 * s)} ${f(x + 18 * s)} ${f(y - 90 * s)}`,
    p.reedDark,
    3.5 * s,
  );
  out += path(capsule(x + 18 * s, y - 86 * s, x + 20 * s, y - 110 * s, 6.5 * s), p.cattail);
  return out;
}

function lilyPad(x: number, y: number, rx: number, ry: number, color: string, notch: number) {
  const a1 = ((notch + 18) * Math.PI) / 180;
  const a2 = ((notch - 18) * Math.PI) / 180;
  return path(
    `M${f(x)} ${f(y)}L${f(x + Math.cos(a1) * rx)} ${f(y + Math.sin(a1) * ry)}A${f(rx)} ${f(ry)} 0 1 1 ${f(x + Math.cos(a2) * rx)} ${f(y + Math.sin(a2) * ry)}Z`,
    color,
  );
}

function waterLily(x: number, y: number, s: number, p: Palette): string {
  let out = '';
  for (const a of [-160, -120, -60, -20]) {
    out += path(leaf(x, y, 20 * s, 7 * s, a), p.lilyDark);
  }
  for (const a of [-140, -90, -40]) {
    out += path(leaf(x, y, 24 * s, 8 * s, a), p.lily);
  }
  return out + path(circle(x, y - 4 * s, 5 * s), p.lilyCenter);
}

function lake(p: Palette, mode: Mode): Layer[] {
  const [cx, cy] = LAKE;
  const night = mode === 'night';
  const water = smooth(lakeOutline(), true);
  const rim = smooth(lakeOutline(1.05, 7), true);
  const bank = smooth(lakeOutline(1.09, 14), true);
  const shine = [
    [cx - 300, cy - 70, 220, 9],
    [cx + 120, cy - 40, 260, 8],
    [cx - 120, cy + 30, 300, 7],
    [cx + 220, cy + 70, 160, 6],
  ]
    .map(([x, y, w, wd]) =>
      stroke(
        curve(x - w / 2, y, x + w / 2, y, -wd * 0.6),
        p.lakeShine,
        wd,
        ` stroke-opacity="${night ? '.45' : '.75'}"`,
      ),
    )
    .join('');
  return [
    [
      cy - 130,
      `<defs>${linearGradient('bdLake', [
        [0, p.lakeFar],
        [1, p.lakeNear],
      ])}</defs>` +
        path(bank, p.groundShade, ' fill-opacity=".55"') +
        path(rim, p.lakeRim) +
        reeds(cx - 380, cy - 94, 1.05, p) +
        reeds(cx + 330, cy - 98, 0.95, p) +
        path(water, 'url(#bdLake)') +
        shine +
        lilyPad(cx - 350, cy + 40, 46, 16, p.pad, -30) +
        lilyPad(cx - 270, cy + 74, 30, 11, p.padDark, 200) +
        lilyPad(cx - 410, cy - 6, 28, 10, p.padDark, 160) +
        waterLily(cx - 346, cy + 34, 1.1, p) +
        lilyPad(cx + 300, cy + 60, 34, 12, p.pad, 210) +
        waterLily(cx + 302, cy + 56, 0.9, p),
    ],
    [cy + 100, reeds(cx - 470, cy + 40, 1.25, p) + reeds(cx - 420, cy + 88, 1, p)],
    [cy + 110, reeds(cx + 450, cy + 60, 1.2, p) + reeds(cx + 390, cy + 100, 0.95, p)],
  ];
}

function waveMark(x: number, y: number, s: number, color: string, op: number): string {
  return stroke(
    `M${f(x - 22 * s)} ${f(y)}Q${f(x - 11 * s)} ${f(y - 7 * s)} ${f(x)} ${f(y)}T${f(x + 22 * s)} ${f(y)}`,
    color,
    4.5 * s,
    ` stroke-opacity="${f(op)}"`,
  );
}

function foamEdge(pts: Pt[], size: number, bulge: number): string {
  let d = `M${f(pts[0][0])} ${f(pts[0][1])}`;
  for (let k = 0; k < pts.length - 1; k++) {
    const [ax, ay] = pts[k];
    const [bx, by] = pts[k + 1];
    const len = Math.hypot(bx - ax, by - ay);
    const n = Math.max(1, Math.round(len / size));
    let nx = -(by - ay) / len;
    let ny = (bx - ax) / len;
    if (ny > 0) {
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

function seaRock(x: number, y: number, s: number, p: Palette, foam = true): string {
  return (
    path(
      smooth([
        [x - 60 * s, y + 4],
        [x - 50 * s, y - 34 * s],
        [x - 14 * s, y - 56 * s],
        [x + 30 * s, y - 48 * s],
        [x + 58 * s, y - 16 * s],
        [x + 64 * s, y + 4],
      ]),
      p.rock,
    ) +
    path(
      smooth([
        [x + 20 * s, y - 50 * s],
        [x + 58 * s, y - 16 * s],
        [x + 64 * s, y + 4],
        [x + 6 * s, y + 4],
        [x + 24 * s, y - 24 * s],
      ]),
      p.rockShade,
    ) +
    path(ellipse(x - 20 * s, y - 36 * s, 14 * s, 7 * s, -20), p.rockLight, ' fill-opacity=".8"') +
    (foam
      ? path(scallop(x, y + 2, 1, 9, 7 * s, 180, 74 * s, 10 * s), p.foam, ' fill-opacity=".9"')
      : '')
  );
}

function post(x: number, y: number, h: number, s: number, p: Palette): string {
  const w = 30 * s;
  return (
    path(roundRect(x - w / 2, y - h, w, h + 4, 9 * s), p.postDark) +
    path(roundRect(x - w / 2, y - h, w * 0.6, h + 4, 8 * s), p.post) +
    path(ellipse(x, y - h + 3 * s, w / 2, 6 * s), p.postTop) +
    stroke(
      `M${f(x - 6 * s)} ${f(y - h + 22 * s)}L${f(x - 6 * s)} ${f(y - 14 * s)}`,
      p.postDark,
      3 * s,
      ' stroke-opacity=".5"',
    ) +
    path(roundRect(x - w / 2 - 1, y - 28 * s, w + 2, 24 * s, 6 * s), p.postWet) +
    path(scallop(x, y + 2, 1, 7, 5 * s, 180, w, 7 * s), p.foam, ' fill-opacity=".9"')
  );
}

function sailboat(x: number, y: number, s: number, p: Palette): string {
  return (
    stroke(
      `M${f(x - 30 * s)} ${f(y + 6 * s)}L${f(x + 30 * s)} ${f(y + 6 * s)}`,
      p.seaLight,
      3 * s,
      ' stroke-opacity=".7"',
    ) +
    path(
      `M${f(x - 26 * s)} ${f(y - 6 * s)}L${f(x + 26 * s)} ${f(y - 6 * s)}L${f(x + 18 * s)} ${f(y + 4 * s)}L${f(x - 18 * s)} ${f(y + 4 * s)}Z`,
      p.boatHull,
    ) +
    stroke(`M${f(x)} ${f(y - 6 * s)}L${f(x)} ${f(y - 52 * s)}`, p.boatMast, 2.5 * s) +
    path(
      `M${f(x + 3 * s)} ${f(y - 50 * s)}L${f(x + 3 * s)} ${f(y - 10 * s)}L${f(x + 30 * s)} ${f(y - 10 * s)}Z`,
      p.sail,
    ) +
    path(
      `M${f(x - 3 * s)} ${f(y - 42 * s)}L${f(x - 3 * s)} ${f(y - 10 * s)}L${f(x - 20 * s)} ${f(y - 10 * s)}Z`,
      p.sailShade,
    )
  );
}

function sea(p: Palette, mode: Mode): string {
  const night = mode === 'night';
  const r = rng(23);
  let marks = '';
  for (let i = 0; i < 60; i++) {
    const x = range(r, TIP[0], 3080);
    const y = range(r, 1012, 1520);
    if (!inSea(x, y, 36)) continue;
    const k = (y - HORIZON) / 540;
    marks += waveMark(x, y, 0.45 + k * 0.9, p.seaLight, 0.45 + 0.4 * k);
  }
  const [sx] = SUN;
  let glints = '';
  for (let i = 0; i < 8; i++) {
    const y = 1014 + i * 30 + i * i * 4;
    const w = 96 - i * 8;
    if (!inSea(sx, y, 12)) continue;
    glints += stroke(
      `M${f(sx - w / 2 + (i % 2) * 16)} ${f(y)}L${f(sx + w / 2 + (i % 2) * 16)} ${f(y)}`,
      night ? p.glint : p.foam,
      8 - i * 0.5,
      ` stroke-opacity="${night ? '.75' : '.6'}"`,
    );
  }
  const shore = COAST.filter(([x]) => x > TIP[0] + 30).map(([x, y]): Pt => [x, y - 6]);
  const swell = COAST.filter(([x]) => x > 2330 && x < 3060).map(([x, y]): Pt => [x + 22, y - 34]);
  return (
    `<defs>${linearGradient('bdSea', [
      [0, p.seaFar],
      [0.45, p.sea],
      [1, p.seaNear],
    ])}</defs>` +
    path(poly(SEA), 'url(#bdSea)') +
    stroke(
      `M${f(TIP[0] + 10)} ${f(HORIZON + 5)}L${f(faceX(HORIZON) - 10)} ${f(HORIZON + 5)}`,
      p.seaLight,
      5,
      ' stroke-opacity=".7"',
    ) +
    marks +
    glints +
    sailboat(2470, 1030, 0.9, p) +
    stroke(smooth(swell, false), p.seaLight, 5, ' stroke-opacity=".55"') +
    stroke(foamEdge(shore, 44, 10), p.foam, 7, ' stroke-opacity=".95"') +
    post(2786, 1312, 84, 0.72, p) +
    post(2700, 1352, 106, 0.86, p) +
    post(2612, 1394, 130, 1, p) +
    seaRock(2986, 1528, 0.62, p) +
    seaRock(3046, 1524, 1.1, p) +
    path(scallop(3094, 1530, 1, 8, 9, 0, 30, 18), p.foam, ' fill-opacity=".85"')
  );
}

function lighthouse(p: Palette, mode: Mode): string {
  const [x, y] = LIGHT;
  const night = mode === 'night';
  const top = y - 250;
  const wb = 60;
  const wt = 42;
  const tower = poly([
    [x - wb, y],
    [x - wt, top],
    [x + wt, top],
    [x + wb, y],
  ]);
  const band = (y0: number, y1: number) =>
    path(`M${f(x - 90)} ${f(y0)}H${f(x + 90)}V${f(y1)}H${f(x - 90)}Z`, p.lightBand);
  const lampY = top - 64;
  let rail = '';
  for (let k = -4; k <= 4; k++) {
    rail += stroke(
      `M${f(x + k * 12)} ${f(top - 34)}L${f(x + k * 12)} ${f(top - 12)}`,
      p.lightTrim,
      4,
    );
  }
  const beam = (dir: number, len: number, spread: number) =>
    path(
      poly([
        [x + dir * 20, lampY - 12],
        [x + dir * len, lampY - spread],
        [x + dir * len, lampY + spread * 0.7],
        [x + dir * 20, lampY + 12],
      ]),
      `url(#${dir < 0 ? 'bdBeamL' : 'bdBeamR'})`,
    );
  const beams = night
    ? `<defs>${linearGradient(
        'bdBeamL',
        [
          [0, p.lampGlow, 0],
          [1, p.lampGlow, 0.5],
        ],
        false,
      )}${linearGradient(
        'bdBeamR',
        [
          [0, p.lampGlow, 0.5],
          [1, p.lampGlow, 0],
        ],
        false,
      )}</defs>` +
      beam(-1, 560, 96) +
      beam(1, 196, 60)
    : '';
  const tufts = [
    [x - 80, y + 6],
    [x + 70, y + 8],
    [x - 30, y + 14],
  ]
    .map(([tx, ty], i) => grassTuft(tx, ty, 1.1, i % 2 ? p.capDark : p.grass))
    .join('');
  return (
    `<defs><clipPath id="bdTower"><path d="${tower}"/></clipPath>${radialGlow('bdLamp', p.lampGlow, night ? 0.8 : 0.35)}</defs>` +
    beams +
    path(roundRect(x - 78, y - 20, 156, 30, 12), p.stoneShade) +
    path(roundRect(x - 72, y - 24, 144, 16, 8), p.stone) +
    path(tower, p.lightWall) +
    group(
      band(top + 34, top + 76) +
        band(top + 118, top + 160) +
        band(top + 202, top + 244) +
        path(
          `M${f(x + 18)} ${f(top - 10)}L${f(x + 70)} ${f(top - 10)}L${f(x + 70)} ${f(y + 10)}L${f(x + 30)} ${f(y + 10)}Z`,
          p.lightTrim,
          ' fill-opacity=".16"',
        ),
      '',
      ' clip-path="url(#bdTower)"',
    ) +
    path(
      `M${f(x - 17)} ${f(y - 2)}L${f(x - 17)} ${f(y - 40)}A17 17 0 0 1 ${f(x + 17)} ${f(y - 40)}L${f(x + 17)} ${f(y - 2)}Z`,
      p.door,
    ) +
    path(circle(x, top + 97, 11), p.lightTrim) +
    path(circle(x, top + 97, 7), night ? p.lamp : p.window) +
    path(circle(x - 4, top + 181, 9), p.lightTrim) +
    path(circle(x - 4, top + 181, 5.5), night ? p.lamp : p.window) +
    path(roundRect(x - 62, top - 12, 124, 16, 6), p.lightTrim) +
    rail +
    path(roundRect(x - 58, top - 40, 116, 8, 4), p.lightTrim) +
    `<circle cx="${f(x)}" cy="${f(lampY)}" r="${night ? 190 : 90}" fill="url(#bdLamp)"/>` +
    path(roundRect(x - 32, top - 92, 64, 54, 6), p.lightTrim) +
    path(roundRect(x - 25, top - 86, 50, 44, 4), p.lamp) +
    path(circle(x, lampY, 11), p.lampCore) +
    stroke(
      `M${f(x - 9)} ${f(top - 86)}L${f(x - 9)} ${f(top - 42)}M${f(x + 9)} ${f(top - 86)}L${f(x + 9)} ${f(top - 42)}`,
      p.lightTrim,
      4,
    ) +
    path(roundRect(x - 44, top - 100, 88, 12, 6), p.lightRoofDark) +
    path(
      `M${f(x - 40)} ${f(top - 96)}Q${f(x - 34)} ${f(top - 150)} ${f(x)} ${f(top - 152)}Q${f(x + 34)} ${f(top - 150)} ${f(x + 40)} ${f(top - 96)}Z`,
      p.lightRoof,
    ) +
    path(circle(x, top - 156, 9), p.lightRoofDark) +
    stroke(`M${f(x)} ${f(top - 164)}L${f(x)} ${f(top - 182)}`, p.lightTrim, 4) +
    tufts
  );
}

function birdBath(p: Palette, mode: Mode): string {
  const [x, y] = BATH;
  const night = mode === 'night';
  const bowlY = y - 214;
  const column = smooth(
    [
      [x - 48, y - 26],
      [x - 30, y - 70],
      [x - 24, y - 118],
      [x - 34, y - 168],
      [x - 52, y - 190],
      [x + 52, y - 190],
      [x + 34, y - 168],
      [x + 24, y - 118],
      [x + 30, y - 70],
      [x + 48, y - 26],
    ],
    true,
    0.6,
  );
  return (
    path(ellipse(x, y + 4, 124, 16), p.groundShade, ' fill-opacity=".5"') +
    path(roundRect(x - 80, y - 30, 160, 34, 14), p.stoneShade) +
    path(roundRect(x - 72, y - 36, 144, 16, 8), p.stone) +
    path(column, p.stone) +
    path(
      smooth(
        [
          [x + 20, y - 30],
          [x + 12, y - 74],
          [x + 8, y - 118],
          [x + 16, y - 166],
          [x + 40, y - 188],
          [x + 52, y - 190],
          [x + 34, y - 168],
          [x + 24, y - 118],
          [x + 30, y - 70],
          [x + 48, y - 26],
        ],
        true,
        0.6,
      ),
      p.stoneShade,
      ' fill-opacity=".75"',
    ) +
    path(
      `M${f(x - 154)} ${f(bowlY)}Q${f(x - 120)} ${f(bowlY + 74)} ${f(x)} ${f(bowlY + 78)}Q${f(x + 120)} ${f(bowlY + 74)} ${f(x + 154)} ${f(bowlY)}Z`,
      p.stoneShade,
    ) +
    path(ellipse(x, bowlY, 156, 30), p.stone) +
    path(ellipse(x, bowlY - 2, 136, 22), p.stoneShade) +
    path(ellipse(x, bowlY + 1, 128, 18), p.bathWater) +
    stroke(
      curve(x - 80, bowlY - 2, x - 10, bowlY - 4, -4),
      p.lakeShine,
      6,
      ' stroke-opacity=".8"',
    ) +
    stroke(
      curve(x + 30, bowlY + 7, x + 80, bowlY + 6, -3),
      p.lakeShine,
      5,
      ' stroke-opacity=".6"',
    ) +
    stroke(
      curve(x - 140, bowlY + 14, x + 140, bowlY + 14, 26),
      p.stoneLight,
      6,
      ' stroke-opacity=".8"',
    ) +
    path(scallop(x - 50, y - 26, 1, 7, 6, 180, 30, 10), p.moss) +
    path(scallop(x + 90, bowlY + 16, 1, 6, 5, 0, 20, 7), p.moss, ' fill-opacity=".9"') +
    (night
      ? stroke(curve(x - 40, bowlY + 2, x + 40, bowlY + 2, -2), p.glint, 4, ' stroke-opacity=".6"')
      : '')
  );
}

function lupin(x: number, y: number, s: number, color: string, dark: string, p: Palette): string {
  let out = stroke(curve(x, y, x + 4 * s, y - 150 * s, 6 * s), p.stem, 5 * s);
  for (const a of [-168, -136, -104, -76, -44, -12]) {
    out += path(leaf(x, y - 8 * s, 34 * s, 6 * s, a), a % 2 ? p.stem : p.leafDark);
  }
  for (let k = 0; k < 11; k++) {
    const t = k / 10;
    const py = y - 66 * s - t * 108 * s;
    const px = x + 4 * s * t;
    const rr = (11 - 6 * t) * s;
    const side = k % 2 ? 1 : -1;
    out += path(ellipse(px + side * (8 - 4 * t) * s, py, rr, rr * 0.78), k % 3 ? color : dark);
  }
  return out + path(ellipse(x + 4 * s, y - 180 * s, 4 * s, 7 * s), dark);
}

function daisy(x: number, y: number, s: number, petal: string, center: string, p: Palette): string {
  let out =
    stroke(`M${f(x)} ${f(y)}L${f(x)} ${f(y - 34 * s)}`, p.stem, 3.5 * s) +
    path(leaf(x, y - 6 * s, 18 * s, 5 * s, -150), p.stem);
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2;
    out += path(
      ellipse(
        x + Math.cos(a) * 8 * s,
        y - 40 * s + Math.sin(a) * 8 * s,
        6 * s,
        4 * s,
        (a * 180) / Math.PI,
      ),
      petal,
    );
  }
  return out + path(circle(x, y - 40 * s, 5 * s), center);
}

function blooms(p: Palette): string {
  const [x, y] = BLOOMS;
  const k = 1.3;
  const L = (dx: number, dy: number, sc: number, c: string, d: string) =>
    lupin(x + dx * k, y + dy * k, sc * k, c, d, p);
  return (
    path(ellipse(x, y + 4, 160 * k, 18 * k), p.groundShade, ' fill-opacity=".45"') +
    path(leaf(x - 120 * k, y + 2, 64 * k, 13 * k, -158), p.leafDark) +
    path(leaf(x + 120 * k, y + 2, 64 * k, 13 * k, -22), p.leafDark) +
    L(-96, -2, 0.95, p.lupinBlue, p.lupinBlueDark) +
    L(-60, -6, 1.1, p.lupinPurple, p.lupinPurpleDark) +
    L(6, -14, 1.3, p.lupinPink, p.lupinPinkDark) +
    L(70, -6, 1.15, p.lupinBlue, p.lupinBlueDark) +
    L(110, 0, 0.9, p.lupinPink, p.lupinPinkDark) +
    L(-26, 6, 0.85, p.lupinPink, p.lupinPinkDark) +
    L(40, 8, 0.8, p.lupinPurple, p.lupinPurpleDark) +
    daisy(x - 128 * k, y + 10, 1.1 * k, p.daisy, p.daisyCenter, p) +
    daisy(x + 134 * k, y + 12, 1 * k, p.buttercup, p.daisy, p) +
    daisy(x - 6 * k, y + 18, 0.9 * k, p.daisy, p.daisyCenter, p) +
    daisy(x + 80 * k, y + 20, 0.8 * k, p.buttercup, p.daisy, p)
  );
}

function bushy(x: number, y: number, s: number, p: Palette, seed: number): string {
  const r = rng(seed);
  let dots = '';
  for (let i = 0; i < 7; i++) {
    const dx = range(r, -90, 80) * s;
    const dy = range(r, 24, 96) * s;
    dots +=
      path(circle(x + dx, y - dy, 9 * s), i % 3 ? p.thrift : p.daisy) +
      path(circle(x + dx, y - dy, 3.5 * s), p.daisyCenter);
  }
  return (
    path(scallop(x, y - 40 * s, 1, 11, 18 * s, 180, 130 * s, 80 * s), p.leavesDark) +
    path(scallop(x - 10 * s, y - 52 * s, 1, 10, 16 * s, 190, 112 * s, 64 * s), p.leaves) +
    path(scallop(x - 30 * s, y - 78 * s, 1, 8, 10 * s, 200, 54 * s, 26 * s), p.leavesLight) +
    dots
  );
}

function driftwood(x: number, y: number, s: number, p: Palette): string {
  const log: Pt[] = [
    [x - 130 * s, y],
    [x - 40 * s, y - 8 * s],
    [x + 60 * s, y - 4 * s],
    [x + 140 * s, y - 12 * s],
  ];
  return (
    path(ellipse(x, y + 14 * s, 160 * s, 14 * s), p.sandDark, ' fill-opacity=".55"') +
    path(
      tube(
        [
          [x + 30 * s, y - 10 * s],
          [x + 54 * s, y - 50 * s],
          [x + 86 * s, y - 70 * s],
        ],
        (u) => (10 - 5 * u) * s,
      ),
      p.drift,
    ) +
    path(
      tube(log, (u) => (24 - 6 * u) * s),
      p.drift,
    ) +
    stroke(
      smooth(
        log.map(([lx, ly]): Pt => [lx, ly - 8 * s]),
        false,
      ),
      p.driftLight,
      6 * s,
      ' stroke-opacity=".8"',
    ) +
    stroke(
      smooth(
        log.map(([lx, ly]): Pt => [lx + 6 * s, ly + 10 * s]),
        false,
      ),
      p.driftDark,
      5 * s,
      ' stroke-opacity=".6"',
    ) +
    path(ellipse(x - 130 * s, y, 10 * s, 23 * s), p.driftDark) +
    path(ellipse(x - 129 * s, y, 6 * s, 16 * s), p.driftLight) +
    path(ellipse(x + 10 * s, y - 4 * s, 8 * s, 5 * s), p.driftDark)
  );
}

function shell(x: number, y: number, s: number, p: Palette): string {
  let out = path(
    `M${f(x - 18 * s)} ${f(y)}A${f(18 * s)} ${f(18 * s)} 0 0 1 ${f(x + 18 * s)} ${f(y)}L${f(x + 4 * s)} ${f(y + 7 * s)}L${f(x - 4 * s)} ${f(y + 7 * s)}Z`,
    p.shell,
  );
  for (let i = -2; i <= 2; i++) {
    out += stroke(
      `M${f(x)} ${f(y + 5 * s)}L${f(x + i * 7 * s)} ${f(y - 14 * s + Math.abs(i) * 4 * s)}`,
      p.shellRidge,
      2 * s,
    );
  }
  return out;
}

function starfish(x: number, y: number, s: number, p: Palette): string {
  let d = '';
  for (let i = 0; i < 5; i++) {
    const a = ((i * 72 - 90) * Math.PI) / 180;
    d += leaf(x, y, 22 * s, 7 * s, (a * 180) / Math.PI);
  }
  return path(d, p.starfish) + path(circle(x, y, 6 * s), p.starfish);
}

function pebbles(x: number, y: number, s: number, p: Palette): string {
  return (
    path(ellipse(x, y, 16 * s, 9 * s), p.pebbleDark) +
    path(ellipse(x - 2 * s, y - 2 * s, 14 * s, 7 * s), p.pebble) +
    path(ellipse(x + 24 * s, y + 4 * s, 10 * s, 6 * s), p.pebbleDark) +
    path(ellipse(x + 23 * s, y + 2 * s, 9 * s, 5 * s), p.pebble)
  );
}

function beachGrass(x: number, y: number, s: number, p: Palette): string {
  let out = '';
  [-124, -110, -98, -86, -72, -58].forEach((a, i) => {
    out += path(
      leaf(x + (i - 2.5) * 4 * s, y + 2, (44 + (i % 3) * 16) * s, 4 * s, a),
      i % 2 ? p.dune : p.duneDark,
    );
  });
  return out;
}

function clover(x: number, y: number, s: number, p: Palette): string {
  return (
    path(circle(x - 6 * s, y - 4 * s, 6 * s), p.grassDark) +
    path(circle(x + 6 * s, y - 4 * s, 6 * s), p.grassDark) +
    path(circle(x, y - 12 * s, 6 * s), p.grass) +
    path(circle(x, y - 16 * s, 4 * s), p.cloverFlower)
  );
}

type Zone = [number, number, number, number];

const AVOID: Zone[] = [
  [LAKE[0], LAKE[1], 560, 170],
  [BATH[0], BATH[1] - 10, 170, 50],
  [BLOOMS[0], BLOOMS[1] - 10, 170, 50],
  [TREE[0], TREE[1] - 10, 300, 40],
  [BOX[0], BOX[1], 70, 30],
  [POLES[0][0], POLES[0][1], 60, 24],
  [POLES[1][0], POLES[1][1], 60, 24],
  [3130, 1786, 180, 44],
  [3400, 1600, 220, 50],
];

function scatterDry(
  seed: number,
  count: number,
  y0: number,
  y1: number,
  beachSide: boolean,
  draw: (x: number, y: number, r: () => number) => string,
): Layer[] {
  const r = rng(seed);
  const out: Layer[] = [];
  for (let i = 0; i < count; i++) {
    const y = range(r, y0, y1);
    const dx = duneX(y);
    const x = beachSide ? range(r, dx + 30, 3560) : range(r, 30, dx - 40);
    const svg = draw(x, y, r);
    if (AVOID.some(([cx, cy, rx, ry]) => ((x - cx) / rx) ** 2 + ((y - cy) / ry) ** 2 < 1)) continue;
    if (inside([x, y - 20], SEA) || inside([x, y], SEA)) continue;
    if (beachSide && x > 3060 && y < 1500) continue;
    out.push([y, svg]);
  }
  return out;
}

function scenery(p: Palette): Layer[] {
  const depth = (y: number) => 0.55 + ((y - 1080) / 900) * 0.75;
  return [
    ...scatterDry(21, 110, 1100, 1960, false, (x, y, rr) =>
      grassTuft(x, y, depth(y) * (0.9 + rr() * 0.5), rr() < 0.5 ? p.grass : p.grassDark),
    ),
    ...scatterDry(33, 34, 1160, 1920, false, (x, y, rr) =>
      daisy(
        x,
        y,
        depth(y) * (0.7 + rr() * 0.3),
        rr() < 0.6 ? p.daisy : p.buttercup,
        p.daisyCenter,
        p,
      ),
    ),
    ...scatterDry(45, 16, 1200, 1900, false, (x, y, rr) =>
      clover(x, y, depth(y) * (1 + rr() * 0.4), p),
    ),
    ...scatterDry(57, 14, 1240, 1950, true, (x, y, rr) => pebbles(x, y, 0.8 + rr() * 0.5, p)),
    ...scatterDry(63, 8, 1300, 1950, true, (x, y, rr) => shell(x, y, 0.9 + rr() * 0.5, p)),
    [1590, seaRock(3250, 1590, 0.9, p, false)],
    [1600, seaRock(3330, 1600, 0.6, p, false)],
    [1596, seaRock(3530, 1596, 1.1, p, false)],
    [1620, pebbles(3420, 1620, 1, p)],
    [1796, driftwood(3130, 1796, 1, p)],
    ...DUNE.filter((_, i) => i % 6 === 3).map(([x, y], i): Layer => [
      y,
      beachGrass(x + 10, y, 0.32 + ((y - 1000) / 1000) * 1.3 + (i % 2) * 0.1, p),
    ]),
  ];
}

function tappables(p: Palette, mode: Mode): Record<string, Layer[]> {
  return {
    sea: [[HORIZON, sea(p, mode)]],
    lighthouse: [[LIGHT[1], lighthouse(p, mode)]],
    lake: lake(p, mode),
    tree: [[TREE[1], oak(p)]],
    birdhouse: [[BOX[1], birdhouse(p, mode)]],
    bath: [[BATH[1], birdBath(p, mode)]],
    blooms: [[BLOOMS[1], blooms(p)]],
  };
}

function shapes(svg: string): Shape[] {
  const out: Shape[] = [];
  for (const m of svg.matchAll(/ d="([^"]+)"/g)) {
    for (const d of m[1].split(/(?=M)/)) {
      const pts = samplePath(d, 6);
      out.push([extendBounds(emptyBounds(), pts), pts]);
    }
  }
  return out;
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

const splits = new Map<string, Split>();

function birdsLayers(p: Palette, mode: Mode): Split {
  const key = `${mode}:${p.ground}`;
  let split = splits.get(key);
  if (!split) {
    split = splitLayers(p, mode);
    splits.set(key, split);
  }
  return split;
}

function splitLayers(p: Palette, mode: Mode): Split {
  const props = tappables(p, mode);
  const ids = Object.keys(props);
  const covers: [number, number, Shape[]][] = ids.flatMap((id, k) =>
    props[id].map(([y, svg]): [number, number, Shape[]] => [k, y, shapes(svg)]),
  );
  const loose: Layer[] = [];
  for (const item of scenery(p).sort((a, b) => a[0] - b[0])) {
    const own = shapes(item[1]);
    let best = -1;
    for (const [k, cy, c] of covers) if (k > best && item[0] > cy && overlap(own, c)) best = k;
    if (best >= 0) {
      props[ids[best]].push(item);
      covers.push([best, item[0], own]);
    } else loose.push(item);
  }
  return { props, loose };
}

const drawProp =
  (id: string) =>
  (p: Palette, mode: Mode): string =>
    layered(birdsLayers(p, mode).props[id]);

const day: Palette = {
  skyTop: '#58b2ec',
  skyMid: '#9cd5f4',
  skyBottom: '#e6f6fb',
  haze: '#fff3d2',
  sun: '#ffd34d',
  sunRay: '#ffc531',
  face: '#8a4b1f',
  star: '#fff6d6',
  glint: '#fff1c0',
  cloud: '#ffffff',
  cloudShade: '#dbeaf6',
  hillFar: '#c6e3c2',
  hillNear: '#acd69c',
  hillTree: '#94c783',
  hillTrunk: '#a99a84',
  ground: '#a2d665',
  groundLight: '#b5e07c',
  groundGold: '#cde08a',
  groundShade: '#83b84f',
  grass: '#7fbf4a',
  grassDark: '#62a23c',
  sand: '#f6e3b4',
  sandLight: '#fbf0d2',
  sandWet: '#e7cd98',
  sandDark: '#dcc08a',
  dune: '#a9c96a',
  duneDark: '#8db354',
  sea: '#3ea6dd',
  seaFar: '#8fd3f1',
  seaNear: '#2c8ccc',
  seaLight: '#dcf5fd',
  foam: '#ffffff',
  lakeFar: '#8adbee',
  lakeNear: '#4dbbe2',
  lakeRim: '#d4c08e',
  lakeShine: '#ecfbff',
  pad: '#6dbb55',
  padDark: '#539f42',
  lily: '#ffb3cf',
  lilyDark: '#ff8fb8',
  lilyCenter: '#ffd84d',
  reed: '#86c25a',
  reedDark: '#5f9e3c',
  cattail: '#8b5a3c',
  cliff: '#efd8b2',
  cliffBand: '#e2c59a',
  cliffShade: '#cfa97e',
  cliffLight: '#f9ebd2',
  cliffWet: '#b2906c',
  capGrass: '#8fcf5e',
  capDark: '#6fb247',
  thrift: '#ff8fb8',
  thriftLight: '#ffc2d8',
  rock: '#a99e93',
  rockShade: '#8a8077',
  rockLight: '#cbc2b8',
  lightWall: '#fbf8f2',
  lightBand: '#e4574a',
  lightRoof: '#d84c41',
  lightRoofDark: '#b23d35',
  lightTrim: '#4a4f6a',
  lamp: '#ffe9a0',
  lampCore: '#fff8dc',
  lampGlow: '#ffe08a',
  window: '#7fb7e6',
  door: '#4f6fa8',
  trunk: '#9a6a44',
  trunkDark: '#7a5134',
  trunkLight: '#b98a5e',
  hollow: '#4a2f1e',
  hollowLight: '#6b4630',
  leaves: '#6fbe4f',
  leavesDark: '#4f9c3c',
  leavesLight: '#93d468',
  nest: '#b98a55',
  nestDark: '#8f6638',
  nestLight: '#d3a874',
  egg: '#a8dcf2',
  eggLight: '#c4e8f8',
  eggSpot: '#7ab8d6',
  post: '#a97a4e',
  postDark: '#83593a',
  postTop: '#c99d70',
  postWet: '#6f5848',
  drift: '#cdbba4',
  boatHull: '#e4574a',
  boatMast: '#6b5444',
  sail: '#ffffff',
  sailShade: '#e3eef6',
  driftLight: '#e6d9c6',
  driftDark: '#a8957e',
  houseWall: '#7cc8ec',
  houseWallShade: '#5fb0d8',
  houseRoof: '#e65f4f',
  houseRoofDark: '#c64a3d',
  houseTrim: '#ffffff',
  hole: '#4a3426',
  holeGlow: '#ffd36b',
  stone: '#dcd6cb',
  stoneLight: '#eeeae3',
  stoneShade: '#bdb5a7',
  bathWater: '#80d6f2',
  moss: '#8cc35c',
  poleWood: '#9b7553',
  poleDark: '#76563c',
  insulator: '#d9f0e7',
  wire: '#4b4f63',
  stem: '#5f9e3c',
  leafDark: '#4f8a34',
  lupinPink: '#ff9cc4',
  lupinPinkDark: '#f0679e',
  lupinPurple: '#b49af2',
  lupinPurpleDark: '#8e6fe0',
  lupinBlue: '#8fb4f4',
  lupinBlueDark: '#5f8ee6',
  daisy: '#ffffff',
  daisyCenter: '#ffc93c',
  buttercup: '#ffd84d',
  cloverFlower: '#f7c4dc',
  shell: '#ffdccb',
  shellRidge: '#f0b39a',
  starfish: '#ff9a5c',
  pebble: '#cbc2b8',
  pebbleDark: '#ada397',
};

const night: Palette = {
  skyTop: '#0a1438',
  skyMid: '#172a6c',
  skyBottom: '#34489a',
  haze: '#7d95e6',
  sun: '#fff1c0',
  sunRay: '#ffe9a8',
  face: '#7a5a34',
  star: '#fff6d6',
  glint: '#fff1c0',
  cloud: '#4b5b9e',
  cloudShade: '#3b4987',
  sea: '#23468e',
  seaFar: '#3a5ea8',
  seaNear: '#1c3a7e',
  seaLight: '#8aa8ea',
  foam: '#b9c8f2',
  lakeFar: '#3a64ac',
  lakeNear: '#24478c',
  lakeShine: '#a9c2f4',
  bathWater: '#2f56a0',
  lamp: '#fff3b8',
  lampCore: '#ffffff',
  lampGlow: '#ffd76a',
  window: '#ffd761',
  hole: '#ffd36b',
  holeGlow: '#ffc94a',
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
      mode === 'day' ? sunWithSpinningRays(p) : moon(SUN[0], SUN[1], 98, p.sun, p.sunRay, p.face),
  },
  {
    id: 'sea',
    box: [2208, 952, 958, 622],
    kind: 'pulse',
    origin: [2860, 1220],
    effect: 'splash',
    effectAt: [2760, 1180],
    sound: 'splash',
    render: drawProp('sea'),
  },
  {
    id: 'lighthouse',
    box: [2810, 128, 800, 548],
    kind: 'glow',
    effect: 'sparkle',
    effectAt: [LIGHT[0], LIGHT[1] - 320],
    sound: 'chime',
    render: drawProp('lighthouse'),
  },
  {
    id: 'lake',
    box: [1066, 1083, 1110, 436],
    kind: 'pulse',
    origin: LAKE,
    effect: 'splash',
    effectAt: [LAKE[0], LAKE[1] - 10],
    sound: 'splash',
    render: drawProp('lake'),
  },
  {
    id: 'tree',
    box: [-90, 84, 1490, 1606],
    kind: 'shake',
    origin: [TREE[0], TREE[1]],
    effect: 'leaves',
    effectAt: [TREE[0], TREE[1] - 1100],
    sound: 'rustle',
    render: drawProp('tree'),
  },
  {
    id: 'birdhouse',
    box: [BOX[0] - 100, BOX[1] - 478, 200, 512],
    kind: 'wiggle',
    origin: [BOX[0], BOX[1]],
    effect: 'notes',
    effectAt: [BOX[0], BOX[1] - 330],
    sound: 'chime',
    night: { kind: 'glow', effect: 'notes', sound: 'chime' },
    render: drawProp('birdhouse'),
  },
  {
    id: 'bath',
    box: [BATH[0] - 178, BATH[1] - 266, 356, 306],
    kind: 'bounce',
    origin: [BATH[0], BATH[1]],
    effect: 'splash',
    effectAt: [BATH[0], BATH[1] - 220],
    sound: 'splash',
    render: drawProp('bath'),
  },
  {
    id: 'blooms',
    box: [BLOOMS[0] - 280, BLOOMS[1] - 356, 534, 452],
    kind: 'bounce',
    origin: [BLOOMS[0], BLOOMS[1] + 6],
    effect: 'petals',
    sound: 'pop',
    render: drawProp('blooms'),
  },
];

const birds: SceneDef = {
  id: 'birds',
  world: [W, H],
  horizon: HORIZON,
  ambient: { clouds: 5, birds: 6, stars: 70, fireflies: 14 },
  defaults: [
    { animal: 'owl', x: 360, y: 700 },
    { animal: 'parrot', x: 860, y: 560, flip: true },
    { animal: 'toucan', x: 1240, y: 760 },
    { animal: 'woodpecker', x: 770, y: 1548, flip: true },
    { animal: 'kingfisher', x: 1400, y: 1110 },
    { animal: 'swan', x: 1400, y: 1290 },
    { animal: 'flamingo', x: 2040, y: 1230, flip: true },
    { animal: 'pigeon', x: 1960, y: wireAt(1960) - 38 },
    { animal: 'stork', x: 1620, y: 380 },
    { animal: 'eagle', x: 2300, y: 520, flip: true },
    { animal: 'seagull', x: 2880, y: 880, flip: true },
    { animal: 'puffin', x: 3170, y: 988, flip: true },
    { animal: 'pelican', x: 2800, y: 1640, flip: true },
    { animal: 'robin', x: 1150, y: 1528 },
    { animal: 'peacock', x: 1820, y: 1700 },
  ],
  day,
  night,
  interactives,
  back: (p, mode) => {
    const nightMode = mode === 'night';
    let out =
      `<defs>${linearGradient('bdSky', [
        [0, p.skyTop],
        [0.26, p.skyMid],
        [0.5, p.skyBottom],
      ])}${radialGlow('bdHaze', p.haze, nightMode ? 0.25 : 0.6)}</defs>` +
      `<rect width="${W}" height="${H}" fill="url(#bdSky)"/>` +
      `<ellipse cx="2600" cy="1000" rx="1800" ry="320" fill="url(#bdHaze)"/>`;
    if (nightMode) out += starField(37, 170, 30, 24, W - 30, 940, p.star);
    out += puffCloud(1500, 620, 1, 1.6, p);
    out += puffCloud(2160, 360, 0.7, 1.5, p);
    out += puffCloud(3120, 220, 0.8, 1.7, p);
    out += hills(p);
    out += land(p);
    out += beach(p);
    out += headland(p);
    out += telegraph(p);
    out += layered(birdsLayers(p, mode).loose);
    return out;
  },
  front: (p) =>
    bushy(110, 2030, 1.5, p, 5) +
    daisy(300, 2004, 1.7, p.daisy, p.daisyCenter, p) +
    grassTuft(360, 2006, 1.9, p.grass) +
    grassTuft(980, 2004, 2, p.grassDark) +
    daisy(1040, 2006, 1.5, p.buttercup, p.daisy, p) +
    grassTuft(1660, 2006, 2, p.grass) +
    daisy(1730, 2004, 1.6, p.daisy, p.daisyCenter, p) +
    grassTuft(2230, 2006, 1.8, p.grassDark) +
    beachGrass(2660, 2006, 1.8, p) +
    shell(3010, 1996, 1.6, p) +
    seaRock(3340, 2000, 1.3, p, false) +
    starfish(3326, 1934, 1.3, p) +
    pebbles(3500, 1998, 1.4, p),
};

export default birds;
