import { capsule, circle, ellipse, leaf, smooth, spline, tube, type Pt } from '../core/paths';
import type { AnimalDef, PartNode, Shape } from '../core/types';

const jitter = (n: number) => {
  const v = Math.sin(n * 12.9898) * 43758.5453;
  return v - Math.floor(v);
};

const spot = (cx: number, cy: number, r: number, seed: number, fill = 'spot'): Shape => {
  const pts: Pt[] = [];
  for (let k = 0; k < 6; k++) {
    const a = ((k * 60 + 30 * jitter(seed * 7 + k)) * Math.PI) / 180;
    const rr = r * (0.82 + 0.32 * jitter(seed * 13 + k * 3));
    pts.push([cx + Math.cos(a) * rr, cy + Math.sin(a) * rr]);
  }
  return { d: smooth(pts), kind: 'detail', fill };
};

const hoof = (x: number, top: number, bottom: number, wTop: number, wBot: number): string => {
  const t = wTop / 2;
  const b = wBot / 2;
  const mid = top + (bottom - top) * 0.45;
  return (
    `M${x - t} ${top}Q${x} ${top - 4} ${x + t} ${top}Q${x + b} ${mid} ${x + b} ${bottom - 5}` +
    `Q${x + b} ${bottom} ${x + b - 5} ${bottom}L${x - b + 5} ${bottom}Q${x - b} ${bottom} ${x - b} ${bottom - 5}` +
    `Q${x - b} ${mid} ${x - t} ${top}Z`
  );
};

const HIP = 270;

const leg = (id: string, role: string, x: number, far: boolean, seed: number): PartNode => ({
  id,
  role,
  behind: true,
  pivot: [x, HIP],
  shapes: [
    { d: capsule(x, HIP, x, 398, 17, 12), fill: far ? 'coatFar' : 'coat' },
    { d: hoof(x, 401, 418, 24, 28), fill: far ? 'hoofFar' : 'hoof' },
    spot(x - 4, 318, 10.5, seed, far ? 'spotFar' : 'spot'),
    spot(x + 5, 345, 8.5, seed + 1, far ? 'spotFar' : 'spot'),
    spot(x - 3, 370, 6.5, seed + 2, far ? 'spotFar' : 'spot'),
  ],
});

const NECK: Pt[] = [
  [166, 258],
  [182, 208],
  [198, 162],
  [216, 120],
];

const neckRadius = (t: number) => 32 - 10 * t;

function neckSpots(): Shape[] {
  const line = spline(NECK, 20);
  const out: Shape[] = [];
  const stops = [0.12, 0.26, 0.4, 0.54, 0.68, 0.82];
  stops.forEach((t, i) => {
    const idx = Math.round(t * 20);
    const [x, y] = line[idx];
    const side = i % 2 ? 1 : -1;
    const r = neckRadius(t);
    out.push(spot(x + side * r * 0.42, y, r * 0.5, 40 + i));
    out.push(spot(x - side * r * 0.62, y + 14, r * 0.34, 60 + i));
  });
  return out;
}

function bodySpots(): Shape[] {
  const out: Shape[] = [];
  const rows = [212, 242, 272, 300];
  rows.forEach((y, row) => {
    for (let x = 26 + (row % 2) * 17; x < 226; x += 34) {
      out.push(spot(x, y, 12.5, row * 20 + x));
    }
  });
  return out;
}

function manePath(): string {
  const line = spline(NECK, 16).slice(2, 16);
  const outer: Pt[] = [];
  const inner: Pt[] = [];
  line.forEach(([x, y], i) => {
    const a = line[Math.max(0, i - 1)];
    const b = line[Math.min(line.length - 1, i + 1)];
    const len = Math.hypot(b[0] - a[0], b[1] - a[1]) || 1;
    const nx = (b[1] - a[1]) / len;
    const ny = -(b[0] - a[0]) / len;
    const t = 0.12 + (i / (line.length - 1)) * 0.76;
    const r = neckRadius(t);
    const bump = i % 2 ? 4 : 9;
    outer.push([x + nx * (r + bump), y + ny * (r + bump)]);
    inner.push([x + nx * (r - 8), y + ny * (r - 8)]);
  });
  return smooth([...outer, ...inner.reverse()]);
}

const giraffe: AnimalDef = {
  id: 'giraffe',
  name: 'Giraffe',
  aliases: ['raff', 'long neck', 'giraffa'],
  group: 'mammal',
  habitats: ['safari'],
  box: [306, 420],
  size: 420,
  locomotion: 'walk4',
  gait: { stride: 170, swing: 17 },
  sound: 'giraffe',
  palette: {
    coat: '#f6c55f',
    coatFar: '#dfab49',
    spot: '#c4793a',
    spotFar: '#a96530',
    mane: '#b3652f',
    muzzle: '#fde7bd',
    knob: '#9b5a31',
    hoof: '#6d4b37',
    hoofFar: '#58392a',
    earInner: '#f0a27a',
    nostril: '#8f5232',
  },
  parts: [
    {
      id: 'body',
      role: 'body',
      pivot: [126, 270],
      shapes: [
        {
          d: smooth([
            [40, 244],
            [80, 230],
            [130, 216],
            [166, 204],
            [196, 208],
            [214, 228],
            [216, 258],
            [204, 286],
            [160, 300],
            [100, 302],
            [56, 294],
            [34, 274],
            [30, 254],
          ]),
          fill: 'coat',
        },
        ...bodySpots(),
      ],
      children: [
        {
          id: 'tail',
          role: 'tail',
          pivot: [38, 248],
          behind: true,
          shapes: [
            { d: capsule(38, 248, 20, 280, 5.5, 4.6), fill: 'coat' },
            { d: capsule(20, 280, 16, 314, 4.6, 4), fill: 'coat' },
            { d: leaf(16, 308, 42, 10, 95), fill: 'mane' },
          ],
        },
        leg('legBF', 'legBF', 86, true, 3),
        leg('legFF', 'legFF', 202, true, 9),
        leg('legBN', 'legBN', 62, false, 5),
        leg('legFN', 'legFN', 178, false, 11),
        {
          id: 'neck',
          role: 'neck',
          pivot: [172, 248],
          behind: true,
          motion: { rotate: 3.5, phase: 0.05 },
          shapes: [{ d: tube(NECK, neckRadius), fill: 'coat' }, ...neckSpots()],
          children: [
            {
              id: 'mane',
              behind: true,
              pivot: [190, 180],
              shapes: [{ d: manePath(), fill: 'mane' }],
            },
            {
              id: 'head',
              role: 'head',
              pivot: [216, 124],
              shapes: [
                {
                  d: smooth([
                    [222, 34],
                    [256, 44],
                    [271, 72],
                    [267, 106],
                    [256, 134],
                    [224, 146],
                    [192, 134],
                    [180, 106],
                    [176, 72],
                    [190, 44],
                  ]),
                  fill: 'coat',
                },
                { d: ellipse(223, 122, 37, 26), kind: 'detail', fill: 'muzzle' },
                spot(223, 46, 8.5, 81),
                spot(195, 56, 6, 82),
                spot(252, 58, 6, 83),
                { d: ellipse(190, 102, 11, 7), kind: 'feature', fill: 'blush', opacity: 0.55 },
                { d: ellipse(256, 102, 11, 7), kind: 'feature', fill: 'blush', opacity: 0.55 },
                { d: circle(205, 80, 10.5), kind: 'feature', fill: 'eye' },
                { d: circle(242, 80, 10.5), kind: 'feature', fill: 'eye' },
                { d: circle(209, 75.6, 4), kind: 'feature', fill: 'shine' },
                { d: circle(246, 75.6, 4), kind: 'feature', fill: 'shine' },
                { d: ellipse(211, 117, 4.4, 3.4, -15), kind: 'feature', fill: 'nostril' },
                { d: ellipse(235, 117, 4.4, 3.4, 15), kind: 'feature', fill: 'nostril' },
                { d: 'M213 132Q223 139 233 132', kind: 'line', stroke: 'mouth', width: 3 },
              ],
              children: [
                {
                  id: 'ossicones',
                  behind: true,
                  pivot: [223, 44],
                  shapes: [
                    { d: capsule(208, 48, 202, 22, 7, 6), fill: 'coat' },
                    { d: capsule(238, 48, 244, 22, 7, 6), fill: 'coat' },
                    { d: circle(202, 17, 9.5), fill: 'knob' },
                    { d: circle(244, 17, 9.5), fill: 'knob' },
                  ],
                },
                {
                  id: 'earL',
                  behind: true,
                  pivot: [182, 60],
                  motion: { rotate: 6, freq: 2, phase: 0.3 },
                  shapes: [
                    { d: leaf(186, 62, 38, 11.5, 200), fill: 'coat' },
                    { d: leaf(182, 61, 25, 5.5, 200), kind: 'detail', fill: 'earInner' },
                  ],
                },
                {
                  id: 'earR',
                  behind: true,
                  pivot: [264, 60],
                  motion: { rotate: -6, freq: 2, phase: 0.3 },
                  shapes: [
                    { d: leaf(260, 62, 38, 11.5, -20), fill: 'coat' },
                    { d: leaf(264, 61, 25, 5.5, -20), kind: 'detail', fill: 'earInner' },
                  ],
                },
              ],
            },
          ],
        },
      ],
    },
  ],
};

export default giraffe;
