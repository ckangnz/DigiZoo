import {
  capsule,
  circle,
  ellipse,
  f,
  samplePath,
  smooth,
  translatePath,
  tube,
  type Pt,
} from '../core/paths';
import type { AnimalDef, PartNode } from '../core/types';

const fluff = (d: string, n: number, bump: number): string => {
  const raw = samplePath(d, 8);
  const pts = raw.filter(
    (p, i) => i === 0 || Math.hypot(p[0] - raw[i - 1][0], p[1] - raw[i - 1][1]) > 0.01,
  );
  const ring = [...pts, pts[0]];
  const lens = [0];
  for (let i = 1; i < ring.length; i++) {
    lens.push(lens[i - 1] + Math.hypot(ring[i][0] - ring[i - 1][0], ring[i][1] - ring[i - 1][1]));
  }
  const total = lens[lens.length - 1];
  const out: Pt[] = [];
  let j = 0;
  for (let k = 0; k < n; k++) {
    const t = (k / n) * total;
    while (lens[j + 1] < t) j++;
    const u = (t - lens[j]) / (lens[j + 1] - lens[j] || 1);
    out.push([
      ring[j][0] + (ring[j + 1][0] - ring[j][0]) * u,
      ring[j][1] + (ring[j + 1][1] - ring[j][1]) * u,
    ]);
  }
  let area = 0;
  for (let i = 0; i < n; i++) {
    const a = out[i];
    const b = out[(i + 1) % n];
    area += a[0] * b[1] - b[0] * a[1];
  }
  const loop = area > 0 ? out : out.reverse();
  let path = `M${f(loop[0][0])} ${f(loop[0][1])}`;
  for (let i = 0; i < n; i++) {
    const p1 = loop[i];
    const p2 = loop[(i + 1) % n];
    const chord = Math.hypot(p2[0] - p1[0], p2[1] - p1[1]);
    const rb = (chord * chord) / 4 / (2 * bump) + bump / 2;
    path += `A${f(rb)} ${f(rb)} 0 0 1 ${f(p2[0])} ${f(p2[1])}`;
  }
  return path + 'Z';
};

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

const HIP = 214;
const GROUND = 284;

const leg = (id: string, x: number, far: boolean): PartNode => ({
  id,
  role: id,
  behind: true,
  pivot: [x, HIP],
  shapes: [
    { d: capsule(x, HIP, x, GROUND - 22, 15, 13.5), fill: far ? 'snowFar' : 'snow' },
    { d: ellipse(x + 3, GROUND - 11, 18, 11), fill: far ? 'snowFar' : 'snow' },
    ...(far
      ? []
      : [
          {
            d: `M${x + 6} ${GROUND - 6}L${x + 6} ${GROUND - 1}`,
            kind: 'line' as const,
            stroke: 'toe',
            width: 2.4,
          },
          {
            d: `M${x + 13} ${GROUND - 7}L${x + 13} ${GROUND - 2}`,
            kind: 'line' as const,
            stroke: 'toe',
            width: 2.4,
          },
        ]),
  ],
});

const TAIL_LINE: Pt[] = [
  [78, 172],
  [54, 150],
  [48, 118],
  [64, 92],
  [94, 86],
  [114, 102],
  [112, 124],
];

const TAIL = fluff(
  tube(TAIL_LINE, (t) => 14 + 4 * Math.sin(Math.PI * t) - 4 * t, 56),
  22,
  3.4,
);

const BODY = smooth([
  [244, 176],
  [236, 152],
  [204, 140],
  [158, 140],
  [112, 140],
  [80, 152],
  [64, 178],
  [70, 206],
  [96, 226],
  [150, 234],
  [204, 228],
  [238, 208],
]);

const HEAD = smooth([
  [256, 64],
  [286, 70],
  [306, 92],
  [312, 120],
  [324, 140],
  [306, 148],
  [300, 166],
  [280, 180],
  [256, 186],
  [232, 180],
  [212, 166],
  [206, 148],
  [188, 140],
  [200, 120],
  [206, 92],
  [226, 70],
]);

const ear = (id: string, pivot: Pt, outer: Pt[], inner: Pt[], phase = 0): PartNode => ({
  id,
  role: 'ear',
  behind: true,
  phase,
  pivot,
  shapes: [
    { d: roundTri(outer, [8, 9, 8]), fill: 'coat' },
    { d: roundTri(inner, [6, 7, 6]), kind: 'detail', fill: 'snow' },
    {
      d: roundTri(
        inner.map(([x, y]) => [x + (pivot[0] - x) * 0.25, y + (pivot[1] + 6 - y) * 0.25] as Pt),
        [5, 6, 5],
      ),
      kind: 'detail',
      fill: 'earInner',
    },
  ],
});

const blueEye = (x: number, y: number) => [
  { d: circle(x, y, 11), kind: 'feature' as const, fill: 'iris', stroke: 'auto', width: 1.6 },
  { d: circle(x + 0.4, y + 0.6, 6.4), kind: 'feature' as const, fill: 'eye' },
  { d: circle(x + 3.6, y - 3.6, 3.6), kind: 'feature' as const, fill: 'shine' },
];

const offset = (parts: PartNode[], dx: number, dy: number): PartNode[] =>
  parts.map((p): PartNode => ({
    ...p,
    pivot: p.pivot && [p.pivot[0] + dx, p.pivot[1] + dy],
    shapes: p.shapes?.map((s) => ({ ...s, d: translatePath(s.d, dx, dy) })),
    children: p.children && offset(p.children, dx, dy),
  }));

const husky: AnimalDef = {
  id: 'husky',
  name: 'Husky',
  kind: 'animal',
  aliases: ['sled dog', 'siberian husky', 'snow dog', 'dog', 'puppy'],
  group: 'mammal',
  habitats: ['polar', 'pets'],
  box: [310, 258],
  size: 170,
  locomotion: 'walk4',
  gait: { stride: 92, swing: 20 },
  sound: 'husky',
  palette: {
    coat: '#8b95a8',
    coatDark: '#737e92',
    snow: '#f8fafd',
    snowFar: '#d5dce8',
    shade: '#dde4ee',
    earInner: '#f6c4cf',
    iris: '#5ab6f2',
    nose: '#262131',
    toe: '#a9b5c7',
  },
  parts: offset(
    [
      {
        id: 'body',
        role: 'body',
        pivot: [156, HIP],
        shapes: [
          { d: BODY, fill: 'coat' },
          { d: ellipse(150, 132, 92, 22), kind: 'detail', fill: 'coatDark' },
          { d: ellipse(160, 240, 92, 30), kind: 'detail', fill: 'snow' },
          { d: ellipse(160, 252, 88, 14), kind: 'detail', fill: 'shade' },
        ],
        children: [
          {
            id: 'tail',
            role: 'tail',
            pivot: [76, 168],
            behind: true,
            motion: { rotate: 8, freq: 2, phase: 0.25 },
            shapes: [
              { d: TAIL, fill: 'coat' },
              { d: TAIL, kind: 'detail', fill: 'coatDark' },
              { d: translatePath(TAIL, 3, 5), kind: 'detail', fill: 'coat' },
              { d: ellipse(110, 116, 22, 26, 20), kind: 'detail', fill: 'snow' },
            ],
          },
          leg('legBF', 124, true),
          leg('legFF', 224, true),
          leg('legBN', 100, false),
          leg('legFN', 200, false),
          {
            id: 'head',
            role: 'head',
            pivot: [238, 178],
            shapes: [
              { d: HEAD, fill: 'coat' },
              { d: ellipse(256, 154, 50, 34), kind: 'detail', fill: 'snow' },
              { d: ellipse(232, 122, 19, 17), kind: 'detail', fill: 'snow' },
              { d: ellipse(280, 122, 19, 17), kind: 'detail', fill: 'snow' },
              { d: ellipse(206, 148, 22, 14), kind: 'detail', fill: 'snow' },
              { d: ellipse(306, 148, 22, 14), kind: 'detail', fill: 'snow' },
              {
                d: tube(
                  [
                    [256, 66],
                    [256, 100],
                    [256, 130],
                  ],
                  (t) => 14 - 9 * t,
                  30,
                ),
                kind: 'detail',
                fill: 'coat',
              },
              { d: ellipse(234, 99, 6.5, 4.5, -8), kind: 'detail', fill: 'snow' },
              { d: ellipse(278, 99, 6.5, 4.5, 8), kind: 'detail', fill: 'snow' },
              { d: ellipse(220, 150, 9, 6), kind: 'feature', fill: 'blush', opacity: 0.5 },
              { d: ellipse(292, 150, 9, 6), kind: 'feature', fill: 'blush', opacity: 0.5 },
              ...blueEye(234, 120),
              ...blueEye(278, 120),
              {
                d: 'M245 139Q256 132 267 139Q266 148 256 151Q246 148 245 139Z',
                kind: 'feature',
                fill: 'nose',
              },
              {
                d: ellipse(256, 164, 6, 6.5),
                kind: 'feature',
                fill: 'tongue',
                stroke: 'auto',
                width: 1.6,
              },
              { d: 'M256 151Q256 159 247 161', kind: 'line', stroke: 'mouth', width: 2.6 },
              { d: 'M256 151Q256 159 265 161', kind: 'line', stroke: 'mouth', width: 2.6 },
            ],
            children: [
              {
                id: 'ruff',
                behind: true,
                pivot: [248, 196],
                shapes: [
                  { d: fluff(ellipse(246, 196, 36, 30), 12, 4), fill: 'snow' },
                  { d: ellipse(252, 222, 36, 12), kind: 'detail', fill: 'shade' },
                ],
              },
              ear(
                'earL',
                [228, 84],
                [
                  [208, 98],
                  [214, 30],
                  [250, 70],
                ],
                [
                  [216, 90],
                  [218, 46],
                  [242, 72],
                ],
              ),
              ear(
                'earR',
                [284, 84],
                [
                  [262, 70],
                  [298, 30],
                  [304, 98],
                ],
                [
                  [270, 72],
                  [294, 46],
                  [296, 90],
                ],
                0.5,
              ),
            ],
          },
        ],
      },
    ],
    -22,
    -28,
  ),
};

export default husky;
