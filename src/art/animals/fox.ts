import { capsule, circle, ellipse, f, smooth, spline, translatePath, type Pt } from '../core/paths';
import type { AnimalDef, PartNode, Shape } from '../core/types';

const roundTri = (pts: Pt[], radii: number[]): string => {
  const n = pts.length;
  let d = '';
  for (let i = 0; i < n; i++) {
    const prev = pts[(i + n - 1) % n];
    const cur = pts[i];
    const next = pts[(i + 1) % n];
    const toward = (p: Pt): Pt => {
      const len = Math.hypot(p[0] - cur[0], p[1] - cur[1]);
      const k = Math.min(radii[i], len / 2) / len;
      return [cur[0] + (p[0] - cur[0]) * k, cur[1] + (p[1] - cur[1]) * k];
    };
    const a = toward(prev);
    const b = toward(next);
    d += `${i ? 'L' : 'M'}${f(a[0])} ${f(a[1])}Q${f(cur[0])} ${f(cur[1])} ${f(b[0])} ${f(b[1])}`;
  }
  return d + 'Z';
};

const HIP = 212;
const GROUND = 282;
const CX = 240;

const leg = (id: string, x: number, far: boolean): PartNode => ({
  id,
  role: id,
  behind: true,
  pivot: [x, HIP],
  shapes: [
    { d: capsule(x, HIP, x, GROUND - 16, 10.5, 9), fill: far ? 'furDark' : 'fur' },
    { d: ellipse(x + 3, GROUND - 8, 12.5, 8), fill: far ? 'furDark' : 'fur' },
    { d: ellipse(x + 1, GROUND + 4, 19, 34), kind: 'detail', fill: far ? 'sockFar' : 'sock' },
  ],
});

const TAIL: Pt[] = [
  [102, 192],
  [74, 186],
  [48, 174],
  [26, 154],
  [14, 128],
];
const tailLine = spline(TAIL, 60);
const tailRadius = (t: number) => 6 + 27 * Math.sin(Math.PI * Math.pow(t, 1.25));
const TIP = tailLine[tailLine.length - 1];

const brush = (line: Pt[], r: (t: number) => number, n: number, reach: number): string => {
  const left: Pt[] = [];
  const right: Pt[] = [];
  for (let k = 0; k <= n; k++) {
    const t = k / n;
    const i = Math.round(t * (line.length - 1));
    const a = line[Math.max(0, i - 1)];
    const b = line[Math.min(line.length - 1, i + 1)];
    const len = Math.hypot(b[0] - a[0], b[1] - a[1]) || 1;
    const nx = -(b[1] - a[1]) / len;
    const ny = (b[0] - a[0]) / len;
    left.push([line[i][0] + nx * r(t), line[i][1] + ny * r(t)]);
    right.push([line[i][0] - nx * r(t), line[i][1] - ny * r(t)]);
  }
  const end = line[line.length - 1];
  const prev = line[line.length - 4];
  const len = Math.hypot(end[0] - prev[0], end[1] - prev[1]) || 1;
  const tip: Pt = [
    end[0] + ((end[0] - prev[0]) / len) * reach,
    end[1] + ((end[1] - prev[1]) / len) * reach,
  ];
  return smooth([...left, tip, ...right.reverse()]);
};

const ear = (id: string, side: number, phase: number): PartNode => {
  const m = (pts: Pt[]): Pt[] => pts.map(([x, y]): Pt => [CX + side * (x - CX), y]);
  const outer = m([
    [182, 144],
    [176, 58],
    [236, 112],
  ]);
  const inner = m([
    [195, 134],
    [187, 80],
    [225, 116],
  ]);
  const tip: Pt = [CX + side * (177 - CX), 61];
  return {
    id,
    role: 'ear',
    behind: true,
    phase,
    pivot: [CX + side * (206 - CX), 126],
    shapes: [
      { d: roundTri(side < 0 ? [...outer].reverse() : outer, [10, 16, 10]), fill: 'fur' },
      {
        d: roundTri(side < 0 ? [...inner].reverse() : inner, [8, 12, 8]),
        kind: 'detail',
        fill: 'cream',
      },
      { d: circle(tip[0], tip[1], 23), kind: 'detail', fill: 'sock' },
    ],
  };
};

const white = (d: string): Shape => ({ d, kind: 'detail', fill: 'cream' });

const offset = (parts: PartNode[], dx: number, dy: number): PartNode[] =>
  parts.map((p): PartNode => ({
    ...p,
    pivot: p.pivot && [p.pivot[0] + dx, p.pivot[1] + dy],
    shapes: p.shapes?.map((s) => ({ ...s, d: translatePath(s.d, dx, dy) })),
    children: p.children && offset(p.children, dx, dy),
  }));

const fox: AnimalDef = {
  id: 'fox',
  name: 'Fox',
  kind: 'animal',
  aliases: ['red fox', 'foxy', 'vixen', 'fox cub'],
  group: 'mammal',
  habitats: ['forest'],
  box: [316, GROUND - 60],
  size: 140,
  locomotion: 'walk4',
  gait: { stride: 96, swing: 20 },
  sound: 'fox',
  palette: {
    fur: '#ef7d32',
    furDark: '#d2652a',
    cream: '#fff6ec',
    sock: '#4a2e28',
    sockFar: '#3a231f',
    nose: '#2b1d1a',
  },
  parts: offset(
    [
      {
        id: 'body',
        role: 'body',
        pivot: [150, HIP],
        shapes: [
          { d: ellipse(150, 204, 76, 40), fill: 'fur' },
          white(ellipse(158, 244, 60, 14)),
          white(ellipse(224, 210, 18, 30, -22)),
        ],
        children: [
          {
            id: 'tail',
            role: 'tail',
            pivot: [100, 192],
            behind: true,
            shapes: [
              { d: brush(tailLine, tailRadius, 12, 8), fill: 'fur' },
              white(circle(TIP[0], TIP[1], 27)),
            ],
          },
          leg('legBF', 126, true),
          leg('legFF', 216, true),
          leg('legBN', 106, false),
          leg('legFN', 196, false),
          {
            id: 'head',
            role: 'head',
            pivot: [220, 196],
            shapes: [
              {
                d: smooth([
                  [CX, 108],
                  [270, 114],
                  [290, 134],
                  [297, 156],
                  [313, 177],
                  [292, 187],
                  [268, 201],
                  [CX, 207],
                  [212, 201],
                  [188, 187],
                  [167, 177],
                  [183, 156],
                  [190, 134],
                  [210, 114],
                ]),
                fill: 'fur',
              },
              white(ellipse(204, 182, 38, 20, 22)),
              white(ellipse(276, 182, 38, 20, -22)),
              white(ellipse(CX, 194, 30, 20)),
              {
                d: smooth([
                  [CX - 9, 150],
                  [CX + 9, 150],
                  [CX + 8, 168],
                  [CX, 176],
                  [CX - 8, 168],
                ]),
                kind: 'detail',
                fill: 'fur',
              },
              { d: ellipse(203, 178, 9, 6), kind: 'feature', fill: 'blush', opacity: 0.5 },
              { d: ellipse(277, 178, 9, 6), kind: 'feature', fill: 'blush', opacity: 0.5 },
              { d: circle(219, 150, 10.5), kind: 'feature', fill: 'eye' },
              { d: circle(261, 150, 10.5), kind: 'feature', fill: 'eye' },
              { d: circle(222.8, 146, 4), kind: 'feature', fill: 'shine' },
              { d: circle(264.8, 146, 4), kind: 'feature', fill: 'shine' },
              { d: ellipse(CX, 175, 7, 5.2), kind: 'feature', fill: 'nose' },
              {
                d: `M${CX} 179Q${CX} 186 ${CX - 7} 188`,
                kind: 'line',
                stroke: 'mouth',
                width: 2.4,
              },
              {
                d: `M${CX} 179Q${CX} 186 ${CX + 7} 188`,
                kind: 'line',
                stroke: 'mouth',
                width: 2.4,
              },
            ],
            children: [ear('earL', 1, 0), ear('earR', -1, 0.5)],
          },
        ],
      },
    ],
    2,
    -60,
  ),
};

export default fox;
