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

const HIP = 206;
const GROUND = 260;

const leg = (id: string, x: number, far: boolean): PartNode => ({
  id,
  role: id,
  behind: true,
  pivot: [x, HIP],
  shapes: [
    { d: capsule(x, HIP, x, GROUND - 22, 12, 10.5), fill: far ? 'furFar' : 'fur' },
    { d: ellipse(x + 3, GROUND - 10, 14.5, 10), fill: far ? 'furFar' : 'fur' },
    ...(far
      ? []
      : [
          {
            d: `M${x + 5} ${GROUND - 6}L${x + 5} ${GROUND - 1}`,
            kind: 'line' as const,
            stroke: 'toe',
            width: 2.2,
          },
          {
            d: `M${x + 11} ${GROUND - 7}L${x + 11} ${GROUND - 2}`,
            kind: 'line' as const,
            stroke: 'toe',
            width: 2.2,
          },
        ]),
  ],
});

const TAIL = fluff(
  tube(
    [
      [86, 176],
      [58, 172],
      [36, 156],
      [26, 132],
      [30, 106],
      [44, 90],
    ],
    (t) => 12 + 16 * Math.sin(Math.PI * (0.15 + 0.8 * t)),
    48,
  ),
  20,
  4.5,
);

const BODY = smooth([
  [228, 168],
  [218, 146],
  [190, 134],
  [150, 134],
  [110, 138],
  [80, 152],
  [68, 176],
  [76, 202],
  [104, 218],
  [150, 224],
  [196, 218],
  [224, 198],
]);

const BELLY = fluff(ellipse(148, 211, 68, 15), 15, 3.4);

const HEAD = smooth([
  [240, 70],
  [266, 72],
  [286, 86],
  [296, 106],
  [318, 124],
  [302, 132],
  [314, 148],
  [292, 150],
  [272, 164],
  [256, 176],
  [240, 180],
  [224, 176],
  [208, 164],
  [188, 150],
  [166, 148],
  [178, 132],
  [162, 124],
  [184, 106],
  [194, 86],
  [214, 72],
]);

const ear = (id: string, pivot: Pt, outer: Pt[], inner: Pt[], core: Pt[], phase = 0): PartNode => ({
  id,
  role: 'ear',
  behind: true,
  phase,
  pivot,
  shapes: [
    { d: roundTri(outer, [8, 16, 8]), fill: 'fur' },
    { d: roundTri(inner, [6, 12, 6]), kind: 'detail', fill: 'shade' },
    { d: roundTri(core, [5, 9, 5]), kind: 'detail', fill: 'earInner' },
  ],
});

const offset = (parts: PartNode[], dx: number, dy: number): PartNode[] =>
  parts.map((p): PartNode => ({
    ...p,
    pivot: p.pivot && [p.pivot[0] + dx, p.pivot[1] + dy],
    shapes: p.shapes?.map((s) => ({ ...s, d: translatePath(s.d, dx, dy) })),
    children: p.children && offset(p.children, dx, dy),
  }));

const arcticFox: AnimalDef = {
  id: 'arctic-fox',
  name: 'Arctic Fox',
  kind: 'animal',
  aliases: ['white fox', 'snow fox', 'polar fox', 'fox'],
  group: 'mammal',
  habitats: ['polar'],
  box: [332, 220],
  size: 120,
  locomotion: 'walk4',
  gait: { stride: 72, swing: 20 },
  sound: 'arctic-fox',
  palette: {
    fur: '#f7f9fd',
    furFar: '#d9e1ed',
    shade: '#d9e2ef',
    furLine: '#c3cddc',
    earInner: '#f6c6d1',
    nose: '#262131',
    toe: '#a9b5c7',
  },
  parts: offset(
    [
      {
        id: 'body',
        role: 'body',
        pivot: [150, HIP],
        shapes: [
          { d: BODY, fill: 'fur' },
          { d: BELLY, fill: 'fur' },
          { d: BELLY, kind: 'detail', fill: 'shade' },
          { d: translatePath(BODY, -4, -10), kind: 'detail', fill: 'fur' },
        ],
        children: [
          {
            id: 'tail',
            role: 'tail',
            pivot: [84, 174],
            behind: true,
            shapes: [
              { d: TAIL, fill: 'fur' },
              { d: TAIL, kind: 'detail', fill: 'shade' },
              { d: translatePath(TAIL, -5, -7), kind: 'detail', fill: 'fur' },
            ],
          },
          leg('legBF', 122, true),
          leg('legFF', 212, true),
          leg('legBN', 100, false),
          leg('legFN', 190, false),
          {
            id: 'head',
            role: 'head',
            pivot: [222, 172],
            shapes: [
              { d: HEAD, fill: 'fur' },
              { d: HEAD, kind: 'detail', fill: 'shade' },
              { d: translatePath(HEAD, -3, -6), kind: 'detail', fill: 'fur' },
              { d: ellipse(204, 140, 9, 6), kind: 'feature', fill: 'blush', opacity: 0.5 },
              { d: ellipse(276, 140, 9, 6), kind: 'feature', fill: 'blush', opacity: 0.5 },
              { d: circle(221, 116, 10.5), kind: 'feature', fill: 'eye' },
              { d: circle(259, 116, 10.5), kind: 'feature', fill: 'eye' },
              { d: circle(224.8, 112, 4), kind: 'feature', fill: 'shine' },
              { d: circle(262.8, 112, 4), kind: 'feature', fill: 'shine' },
              {
                d: 'M229.5 145Q240 139 250.5 145Q249 154 240 157Q231 154 229.5 145Z',
                kind: 'feature',
                fill: 'nose',
              },
              {
                d: ellipse(236.5, 144.6, 3, 1.8, -12),
                kind: 'feature',
                fill: 'shine',
                opacity: 0.7,
              },
              { d: 'M240 157Q240 164 233 166', kind: 'line', stroke: 'mouth', width: 2.4 },
              { d: 'M240 157Q240 164 247 166', kind: 'line', stroke: 'mouth', width: 2.4 },
            ],
            children: [
              {
                id: 'ruff',
                behind: true,
                pivot: [232, 186],
                shapes: [
                  {
                    d: fluff(ellipse(230, 190, 34, 30), 11, 4),
                    fill: 'fur',
                  },
                  { d: ellipse(236, 216, 34, 12), kind: 'detail', fill: 'shade' },
                ],
              },
              ear(
                'earL',
                [210, 86],
                [
                  [194, 98],
                  [186, 46],
                  [232, 74],
                ],
                [
                  [198, 96],
                  [191, 53],
                  [227, 77],
                ],
                [
                  [201, 93],
                  [195, 59],
                  [223, 79],
                ],
              ),
              ear(
                'earR',
                [270, 86],
                [
                  [248, 74],
                  [294, 46],
                  [286, 98],
                ],
                [
                  [253, 77],
                  [289, 53],
                  [282, 96],
                ],
                [
                  [257, 79],
                  [285, 59],
                  [279, 93],
                ],
                0.5,
              ),
            ],
          },
        ],
      },
    ],
    10,
    -42,
  ),
};

export default arcticFox;
