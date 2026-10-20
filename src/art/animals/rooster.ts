import {
  capsule,
  circle,
  curve,
  ellipse,
  smooth,
  translatePath,
  tube,
  type Pt,
} from '../core/paths';
import type { AnimalDef, PartNode, Shape } from '../core/types';

function lock(
  x: number,
  y: number,
  len: number,
  width: number,
  angle: number,
  curl: number,
): string {
  const a = (angle * Math.PI) / 180;
  const dx = Math.cos(a);
  const dy = Math.sin(a);
  const nx = -dy;
  const ny = dx;
  const tx = x + dx * len;
  const ty = y + dy * len;
  const mx = x + dx * len * 0.5 + nx * curl;
  const my = y + dy * len * 0.5 + ny * curl;
  const p = (px: number, py: number) => `${px.toFixed(2)} ${py.toFixed(2)}`;
  return (
    `M${p(x + nx * width, y + ny * width)}` +
    `Q${p(mx + nx * width * 1.1, my + ny * width * 1.1)} ${p(tx, ty)}` +
    `Q${p(mx - nx * width * 0.7, my - ny * width * 0.7)} ${p(x - nx * width, y - ny * width)}Z`
  );
}

const HIP = 238;

const leg = (id: string, x: number, far: boolean): PartNode => {
  const fill = far ? 'legDark' : 'leg';
  return {
    id,
    role: id,
    behind: true,
    pivot: [x, HIP],
    shapes: [
      { d: capsule(x, HIP, x + 2, 282, 8, 5.8), fill },
      { d: capsule(x, 264, x - 12, 266, 3.8, 2.6), fill },
      { d: capsule(x + 2, 288, x + 27, 291, 5.2, 4), fill },
      { d: capsule(x + 2, 288, x - 13, 292, 4.8, 3.6), fill },
    ],
  };
};

const sickle = (pts: Pt[], r0: number, r1: number): Shape[] => [
  { d: tube(pts, (t) => r0 + (r1 - r0) * t), fill: 'tail' },
  {
    d: tube(pts.slice(1), (t) => (r0 + (r1 - r0) * t) * 0.3),
    kind: 'detail',
    fill: 'tailShine',
  },
];

const SICKLES: [Pt[], number][] = [
  [
    [
      [102, 148],
      [102, 112],
      [96, 82],
      [86, 62],
    ],
    9,
  ],
  [
    [
      [98, 150],
      [90, 112],
      [78, 74],
      [60, 44],
      [38, 30],
      [18, 36],
      [8, 58],
      [10, 84],
    ],
    12,
  ],
  [
    [
      [98, 154],
      [86, 122],
      [70, 94],
      [50, 76],
      [30, 74],
      [18, 90],
      [18, 112],
    ],
    11,
  ],
  [
    [
      [96, 160],
      [78, 142],
      [56, 128],
      [36, 126],
      [24, 140],
      [24, 160],
    ],
    10,
  ],
  [
    [
      [94, 166],
      [74, 168],
      [54, 170],
      [40, 182],
      [38, 198],
    ],
    9,
  ],
];

const COMB: [number, number, number][] = [
  [-150, 12, 8.5],
  [-124, 16, 10.5],
  [-96, 18, 11],
  [-68, 16, 10.5],
  [-42, 12, 8.5],
];

const comb = (): Shape[] =>
  COMB.map(([deg, len, w]) => {
    const a = (deg * Math.PI) / 180;
    return {
      d: ellipse(210 + Math.cos(a) * 26, 62 + Math.sin(a) * 26, len, w, deg),
      fill: 'comb',
    };
  });

const HACKLES: [number, number, number, number][] = [
  [168, 132, 36, 124],
  [180, 140, 38, 116],
  [194, 146, 36, 108],
  [208, 148, 32, 102],
  [222, 146, 26, 96],
  [234, 140, 20, 90],
];

const offset = (parts: PartNode[], dx: number, dy: number): PartNode[] =>
  parts.map((p): PartNode => ({
    ...p,
    pivot: p.pivot && [p.pivot[0] + dx, p.pivot[1] + dy],
    shapes: p.shapes?.map((s) => ({ ...s, d: translatePath(s.d, dx, dy) })),
    children: p.children && offset(p.children, dx, dy),
  }));

const rooster: AnimalDef = {
  id: 'rooster',
  name: 'Rooster',
  kind: 'animal',
  aliases: ['cockerel', 'cockadoodledoo', 'chicken', 'bird'],
  group: 'bird',
  habitats: ['farm'],
  box: [278, 292],
  size: 140,
  locomotion: 'walk2',
  gait: { stride: 80, swing: 24 },
  sound: 'rooster',
  palette: {
    body: '#cf5532',
    wing: '#a43f26',
    wingLine: '#7a2c19',
    hackle: '#f7a531',
    hackleLine: '#d9821c',
    tail: '#2a4741',
    tailShine: '#3f8a6c',
    comb: '#ee3b3b',
    beak: '#ffc53d',
    leg: '#f7b23a',
    legDark: '#da922a',
  },
  parts: offset(
    [
      {
        id: 'body',
        role: 'body',
        pivot: [168, 248],
        shapes: [
          {
            d: smooth([
              [104, 146],
              [140, 136],
              [180, 136],
              [214, 142],
              [240, 158],
              [256, 184],
              [252, 214],
              [232, 238],
              [196, 252],
              [156, 254],
              [120, 244],
              [96, 224],
              [84, 198],
              [88, 170],
            ]),
            fill: 'body',
          },
        ],
        children: [
          {
            id: 'tail',
            role: 'tail',
            behind: true,
            pivot: [96, 158],
            shapes: SICKLES.flatMap(([pts, r]) => sickle(pts, r, 4.5)),
          },
          leg('legF', 142, true),
          leg('legN', 174, false),
          {
            id: 'wing',
            role: 'wingN',
            pivot: [196, 178],
            shapes: [
              {
                d: smooth([
                  [152, 170],
                  [190, 172],
                  [208, 190],
                  [202, 212],
                  [176, 226],
                  [140, 228],
                  [110, 218],
                  [88, 202],
                  [108, 188],
                  [128, 176],
                ]),
                fill: 'wing',
              },
              { d: curve(112, 204, 160, 212, 6), kind: 'line', stroke: 'wingLine', width: 2.8 },
              { d: curve(126, 190, 176, 194, 6), kind: 'line', stroke: 'wingLine', width: 2.8 },
            ],
          },
          {
            id: 'head',
            role: 'head',
            pivot: [200, 156],
            shapes: [
              ...comb(),
              {
                d: smooth([
                  [192, 82],
                  [186, 104],
                  [176, 124],
                  [164, 140],
                  [180, 152],
                  [206, 156],
                  [230, 148],
                  [242, 130],
                  [242, 110],
                  [232, 98],
                ]),
                fill: 'hackle',
              },
              ...HACKLES.map(([x, y, len, deg]) => ({
                d: lock(x, y, len, 9, deg, -5),
                fill: 'hackle',
              })),
              { d: circle(214, 74, 33), fill: 'hackle' },
              { d: 'M240 64Q264 70 270 81Q262 92 240 96Z', fill: 'beak' },
              { d: ellipse(243, 114, 7.5, 13), fill: 'comb' },
              { d: ellipse(234, 109, 6.5, 11), fill: 'comb' },
              { d: curve(190, 126, 194, 150, -4), kind: 'line', stroke: 'hackleLine', width: 2.6 },
              { d: curve(212, 130, 214, 154, -3), kind: 'line', stroke: 'hackleLine', width: 2.6 },
              { d: ellipse(222, 91, 9, 5.5), kind: 'feature', fill: 'blush', opacity: 0.5 },
              { d: circle(220, 68, 9), kind: 'feature', fill: 'eye' },
              { d: circle(223.2, 64.4, 3.4), kind: 'feature', fill: 'shine' },
            ],
          },
        ],
      },
    ],
    0,
    -8,
  ),
};

export default rooster;
