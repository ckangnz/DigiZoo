import {
  circle,
  curve,
  ellipse,
  mirrorPath,
  scallop,
  smooth,
  spline,
  translatePath,
  tube,
  type Pt,
} from '../core/paths';
import type { AnimalDef, PartNode, Shape } from '../core/types';

const W = 330;
const CX = W / 2;

const FORE: Pt[] = [
  [0, -8],
  [30, -44],
  [70, -78],
  [112, -96],
  [140, -94],
  [150, -78],
  [142, -46],
  [128, -12],
  [104, 10],
  [66, 18],
  [28, 14],
  [2, 8],
];

const HIND: Pt[] = [
  [-2, -6],
  [38, -10],
  [76, 0],
  [96, 22],
  [94, 50],
  [74, 68],
  [44, 72],
  [18, 58],
  [2, 32],
];

const FORE_ROOT: Pt = [CX + 16, 134];
const HIND_ROOT: Pt = [CX + 14, 158];

const wavy = (pts: Pt[], amp: number, waves: number): string => {
  const path = spline(pts, waves * 8);
  const out: Pt[] = path.map((p, i) => {
    const a = path[Math.max(0, i - 1)];
    const b = path[Math.min(path.length - 1, i + 1)];
    const len = Math.hypot(b[0] - a[0], b[1] - a[1]) || 1;
    const k = amp * Math.sin((i / 8) * Math.PI * 2);
    return [p[0] - ((b[1] - a[1]) / len) * k, p[1] + ((b[0] - a[0]) / len) * k];
  });
  return tube(out, 1.3, out.length);
};

const vein = (pts: Pt[]): string => tube(pts, (t) => 1.4 - 0.6 * t, 24);

const wingSide = (side: 1 | -1): PartNode => {
  const put = (d: string, root: Pt) => {
    const moved = translatePath(d, root[0], root[1]);
    return side === 1 ? moved : mirrorPath(moved, CX);
  };
  const fore = (d: string) => put(d, FORE_ROOT);
  const hind = (d: string) => put(d, HIND_ROOT);
  const k = side === 1 ? 'N' : 'F';
  const hindShapes: Shape[] = [
    { d: hind(smooth(HIND)), fill: 'wingHind' },
    {
      d: hind(
        smooth([
          [38, 40],
          [72, 14],
          [96, 28],
          [92, 52],
          [72, 70],
          [44, 74],
          [22, 60],
        ]),
      ),
      kind: 'detail',
      fill: 'beige',
    },
    { d: hind(circle(58, 34, 14)), kind: 'detail', fill: 'pinkSpot' },
    { d: hind(circle(58, 34, 7)), kind: 'detail', fill: 'cream' },
    {
      d: hind(
        wavy(
          [
            [26, 64],
            [58, 68],
            [88, 48],
          ],
          2.4,
          4,
        ),
      ),
      kind: 'detail',
      fill: 'mauve',
    },
  ];
  const foreShapes: Shape[] = [
    { d: fore(smooth(FORE)), fill: 'wing' },
    {
      d: fore(
        smooth([
          [12, -16],
          [52, -56],
          [92, -78],
          [70, -40],
          [40, -6],
          [14, 4],
        ]),
      ),
      kind: 'detail',
      fill: 'wingLight',
    },
    {
      d: fore(
        smooth([
          [120, -96],
          [142, -94],
          [152, -76],
          [144, -44],
          [130, -10],
          [114, -14],
          [126, -46],
          [128, -78],
        ]),
      ),
      kind: 'detail',
      fill: 'beige',
    },
    { d: fore(circle(86, -30, 14)), kind: 'detail', fill: 'mauve' },
    { d: fore(circle(86, -30, 7)), kind: 'detail', fill: 'cream' },
    { d: fore(circle(89, -33, 2.6)), kind: 'detail', fill: 'white' },
    {
      d: fore(
        wavy(
          [
            [110, -88],
            [118, -46],
            [104, 2],
          ],
          2.4,
          5,
        ),
      ),
      kind: 'detail',
      fill: 'mauve',
    },
    {
      d: fore(
        vein([
          [8, -10],
          [40, -42],
          [72, -66],
        ]),
      ),
      kind: 'detail',
      fill: 'vein',
    },
    {
      d: fore(
        vein([
          [12, 2],
          [52, -6],
          [70, -14],
        ]),
      ),
      kind: 'detail',
      fill: 'vein',
    },
  ];
  return {
    id: `wing${k}`,
    role: `wing${k}`,
    behind: true,
    pivot: side === 1 ? FORE_ROOT : [W - FORE_ROOT[0], FORE_ROOT[1]],
    motion: { rotate: -side * 20 },
    shapes: foreShapes,
    children: [
      {
        id: `hind${k}`,
        behind: true,
        pivot: side === 1 ? HIND_ROOT : [W - HIND_ROOT[0], HIND_ROOT[1]],
        motion: { rotate: -side * 4, phase: 0.08 },
        shapes: hindShapes,
      },
    ],
  };
};

const feather = (id: string, side: 1 | -1): PartNode => {
  const raw: Pt[] = [
    [CX + 10, 66],
    [CX + 20, 46],
    [CX + 38, 28],
    [CX + 60, 18],
    [CX + 74, 20],
  ];
  const pts = raw.map(([x, y]): Pt => [side === 1 ? x : W - x, y]);
  const path = spline(pts, 26);
  const n = path.length;
  const widthAt = (t: number) => 2 + 11 * Math.sin(Math.PI * Math.min(1, t * 1.15)) ** 0.8;
  const left: Pt[] = [];
  const right: Pt[] = [];
  const barbs: string[] = [];
  path.forEach((p, i) => {
    const a = path[Math.max(0, i - 1)];
    const b = path[Math.min(n - 1, i + 1)];
    const len = Math.hypot(b[0] - a[0], b[1] - a[1]) || 1;
    const tx = (b[0] - a[0]) / len;
    const ty = (b[1] - a[1]) / len;
    const nx = -ty;
    const ny = tx;
    const t = i / (n - 1);
    const w = widthAt(t);
    left.push([p[0] + nx * w, p[1] + ny * w]);
    right.push([p[0] - nx * w, p[1] - ny * w]);
    if (i > 1 && i < n - 2) {
      const r = w * 0.86;
      const f = (x: number) => x.toFixed(2);
      barbs.push(
        `M${f(p[0])} ${f(p[1])}L${f(p[0] + nx * r + tx * 4)} ${f(p[1] + ny * r + ty * 4)}`,
        `M${f(p[0])} ${f(p[1])}L${f(p[0] - nx * r + tx * 4)} ${f(p[1] - ny * r + ty * 4)}`,
      );
    }
  });
  return {
    id,
    role: 'antenna',
    behind: true,
    pivot: pts[0],
    motion: { rotate: side * 5, phase: 0.15 },
    shapes: [
      { d: smooth([...left, ...right.reverse()]), fill: 'antenna' },
      { d: barbs.join(''), kind: 'line', stroke: 'antennaDark', width: 1.5 },
      { d: smooth(path, false), kind: 'line', stroke: 'antennaDark', width: 2.4 },
    ],
  };
};

const moth: AnimalDef = {
  id: 'moth',
  name: 'Moth',
  kind: 'animal',
  aliases: ['fluffy moth', 'night butterfly', 'silk moth', 'bug'],
  group: 'bug',
  habitats: ['bugs'],
  box: [W, 236],
  size: 70,
  locomotion: 'fly',
  gait: { period: 0.6, stride: 70 },
  sound: 'moth',
  palette: {
    wing: '#c6aaea',
    wingLight: '#dccaf6',
    wingHind: '#b796e2',
    mauve: '#8e6bc4',
    vein: '#a487d6',
    pinkSpot: '#f0a3c4',
    beige: '#f1dfc0',
    body: '#ecd8b4',
    bodyDark: '#d5b98d',
    cream: '#fff5e4',
    antenna: '#efd9ab',
    antennaDark: '#c29a66',
    smile: '#6b4a3a',
  },
  parts: [
    {
      id: 'body',
      pivot: [CX, 150],
      shapes: [
        { d: scallop(CX, 166, 30, 18, 3.4, 0, 28, 44), fill: 'body' },
        { d: ellipse(CX, 174, 30, 3.4), kind: 'detail', fill: 'bodyDark' },
        { d: ellipse(CX, 190, 26, 3.2), kind: 'detail', fill: 'bodyDark' },
        { d: ellipse(CX, 204, 20, 3), kind: 'detail', fill: 'bodyDark' },
      ],
      children: [
        wingSide(-1),
        wingSide(1),
        {
          id: 'ruff',
          pivot: [CX, 132],
          shapes: [
            { d: scallop(CX, 136, 40, 16, 4.2, 0, 42, 20), fill: 'cream' },
            { d: ellipse(CX, 142, 30, 9), kind: 'detail', fill: 'white' },
          ],
        },
        {
          id: 'head',
          role: 'head',
          pivot: [CX, 128],
          shapes: [
            { d: scallop(CX, 98, 36, 20, 3, 0, 38, 34), fill: 'body' },
            { d: ellipse(CX - 14, 76, 12, 5, -18), kind: 'detail', fill: 'cream' },
            { d: ellipse(CX - 26, 112, 8, 5), kind: 'feature', fill: 'blush', opacity: 0.6 },
            { d: ellipse(CX + 26, 112, 8, 5), kind: 'feature', fill: 'blush', opacity: 0.6 },
            { d: circle(CX - 14, 98, 9.8), kind: 'feature', fill: 'eye' },
            { d: circle(CX + 14, 98, 9.8), kind: 'feature', fill: 'eye' },
            { d: circle(CX - 10.6, 94.4, 3.7), kind: 'feature', fill: 'shine' },
            { d: circle(CX + 17.4, 94.4, 3.7), kind: 'feature', fill: 'shine' },
            { d: circle(CX - 16.6, 102.4, 1.6), kind: 'feature', fill: 'shine' },
            { d: circle(CX + 11.4, 102.4, 1.6), kind: 'feature', fill: 'shine' },
            { d: curve(CX - 7, 112, CX + 7, 112, 5), kind: 'line', stroke: 'smile', width: 2.6 },
          ],
          children: [feather('antennaF', -1), feather('antennaN', 1)],
        },
      ],
    },
  ],
};

export default moth;
