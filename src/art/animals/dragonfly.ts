import { circle, curve, ellipse, scalePath, smooth, tube, type Pt } from '../core/paths';
import type { AnimalDef, PartNode, Shape } from '../core/types';

const AXIS = 128;
const THX = 196;

const toWorld = (pts: Pt[], root: Pt, angle: number): Pt[] => {
  const a = (angle * Math.PI) / 180;
  const c = Math.cos(a);
  const s = Math.sin(a);
  return pts.map(([x, y]): Pt => [root[0] + x * c - y * s, root[1] + x * s + y * c]);
};

const flipY = (d: string) => scalePath(d, 1, -1, 0, AXIS);

const seg = (a: Pt, b: Pt) =>
  `M${a[0].toFixed(2)} ${a[1].toFixed(2)}L${b[0].toFixed(2)} ${b[1].toFixed(2)}`;

interface WingSpec {
  id: string;
  root: Pt;
  angle: number;
  length: number;
  width: number;
  broad: number;
  phase: number;
}

const wing = (spec: WingSpec, lower: boolean): PartNode => {
  const { root, angle, length: L, width: w, broad } = spec;
  const at = (pts: Pt[]) => toWorld(pts, root, angle);
  const place = (d: string) => (lower ? flipY(d) : d);
  const outline: Pt[] = [
    [0, 0.35 * w],
    [0.22 * L, 0.6 * w],
    [0.55 * L, 0.6 * w],
    [0.84 * L, 0.52 * w],
    [L, 0.1 * w],
    [0.97 * L, -0.42 * w],
    [0.82 * L, -0.78 * w],
    [0.55 * L, -0.92 * w],
    [0.28 * L, -(0.95 + broad) * w],
    [0.1 * L, -(0.8 + broad) * w],
    [0, -0.45 * w],
  ];
  const veins: Pt[][] = [
    [
      [0.04 * L, 0.3 * w],
      [0.5 * L, 0.34 * w],
      [0.9 * L, 0.28 * w],
    ],
    [
      [0.05 * L, -0.08 * w],
      [0.5 * L, -0.12 * w],
      [0.92 * L, -0.08 * w],
    ],
    [
      [0.08 * L, -0.42 * w],
      [0.45 * L, -0.56 * w],
      [0.8 * L, -0.56 * w],
    ],
  ];
  const cross: string[] = [];
  for (let k = 1; k <= 7; k++) {
    const x = (0.1 + k * 0.105) * L;
    const [a, b] = at([
      [x, 0.32 * w],
      [x + 0.02 * L, -0.1 * w],
    ]);
    cross.push(seg(a, b));
  }
  for (let k = 1; k <= 5; k++) {
    const x = (0.14 + k * 0.11) * L;
    const [a, b] = at([
      [x, -0.12 * w],
      [x - 0.03 * L, -0.54 * w],
    ]);
    cross.push(seg(a, b));
  }
  const spot = at([[0.84 * L, 0.3 * w]])[0];
  const shapes: Shape[] = [
    { d: place(smooth(at(outline))), fill: 'wing' },
    {
      d: place(
        smooth(
          at([
            [0.14 * L, 0.06 * w],
            [0.5 * L, 0.2 * w],
            [0.82 * L, 0.12 * w],
            [0.5 * L, -0.02 * w],
          ]),
        ),
      ),
      kind: 'detail',
      fill: 'wingLight',
    },
    ...veins.map((v): Shape => ({
      d: place(smooth(at(v), false)),
      kind: 'line',
      stroke: 'vein',
      width: 1.8,
    })),
    { d: place(cross.join('')), kind: 'line', stroke: 'vein', width: 1.4 },
    {
      d: place(ellipse(spot[0], spot[1], 0.055 * L, 0.17 * w, angle)),
      kind: 'detail',
      fill: 'spot',
    },
  ];
  return {
    id: spec.id + (lower ? 'Lo' : 'Up'),
    role: 'wingN',
    behind: true,
    pivot: lower ? [root[0], 2 * AXIS - root[1]] : root,
    motion: { scaleY: -0.4, wave: 'abs', phase: spec.phase },
    shapes,
  };
};

const FORE: WingSpec = {
  id: 'fore',
  root: [THX + 12, AXIS - 12],
  angle: -64,
  length: 110,
  width: 20,
  broad: 0,
  phase: 0,
};
const HIND: WingSpec = {
  id: 'hind',
  root: [THX - 12, AXIS - 12],
  angle: -116,
  length: 104,
  width: 20,
  broad: 0.35,
  phase: 0.25,
};

const ABDOMEN: Pt[] = [
  [THX - 20, AXIS + 1],
  [THX - 56, AXIS + 3],
  [THX - 96, AXIS + 6],
  [THX - 134, AXIS + 6],
  [THX - 164, AXIS + 3],
];

const along = (t: number): { p: Pt; a: number } => {
  const n = ABDOMEN.length - 1;
  const x = t * n;
  const i = Math.min(n - 1, Math.floor(x));
  const u = x - i;
  const p0 = ABDOMEN[i];
  const p1 = ABDOMEN[i + 1];
  return {
    p: [p0[0] + (p1[0] - p0[0]) * u, p0[1] + (p1[1] - p0[1]) * u],
    a: (Math.atan2(p1[1] - p0[1], p1[0] - p0[0]) * 180) / Math.PI,
  };
};

const rings: Shape[] = [0.14, 0.26, 0.38, 0.5, 0.62, 0.74].map((t): Shape => {
  const { p, a } = along(t);
  return { d: ellipse(p[0], p[1], 2.6, 16, a), kind: 'detail', fill: 'ring' };
});

const HX = THX + 58;

const dragonfly: AnimalDef = {
  id: 'dragonfly',
  name: 'Dragonfly',
  kind: 'animal',
  aliases: ['dragon fly', 'damselfly', 'darner', 'blue dragonfly', 'bug'],
  group: 'bug',
  habitats: ['bugs'],
  box: [308, 256],
  size: 80,
  locomotion: 'fly',
  gait: { period: 0.45, stride: 84 },
  sound: 'dragonfly',
  palette: {
    blue: '#3d9cf0',
    blueDark: '#2a78d0',
    ring: '#1f4f9e',
    blueLight: '#9ad8ff',
    thorax: '#2f86e0',
    head: '#46a8f4',
    bulb: '#6fe0f2',
    bulbLight: '#c4f6ff',
    wing: '#e4f3ff',
    wingLight: '#f8fcff',
    vein: '#9ccbec',
    spot: '#3d6fc2',
    smile: '#1f3f7a',
  },
  parts: [
    {
      id: 'thorax',
      pivot: [THX, AXIS],
      shapes: [
        { d: ellipse(THX, AXIS, 34, 25), fill: 'thorax' },
        { d: ellipse(THX - 6, AXIS - 10, 22, 7, -6), kind: 'detail', fill: 'blueLight' },
        { d: ellipse(THX + 8, AXIS + 12, 18, 4, 8), kind: 'detail', fill: 'blueDark' },
      ],
      children: [
        {
          id: 'abdomen',
          role: 'tail',
          behind: true,
          pivot: [THX - 20, AXIS + 1],
          motion: { rotate: 3, phase: 0.2 },
          shapes: [
            { d: tube(ABDOMEN, (t) => 8 + 4.4 * (1 - t) ** 2 + 1.6 * t ** 6, 48), fill: 'blue' },
            {
              d: tube(
                ABDOMEN.map(([x, y]): Pt => [x, y - 4.5]),
                1.8,
                40,
              ),
              kind: 'detail',
              fill: 'blueLight',
            },
            ...rings,
            { d: ellipse(THX - 166, AXIS + 3, 18, 14), kind: 'detail', fill: 'ring' },
          ],
        },
        wing(HIND, false),
        wing(HIND, true),
        wing(FORE, false),
        wing(FORE, true),
        {
          id: 'head',
          role: 'head',
          pivot: [HX - 28, AXIS],
          shapes: [
            { d: circle(HX - 18, AXIS - 26, 20), fill: 'head' },
            { d: circle(HX + 18, AXIS - 26, 20), fill: 'head' },
            { d: ellipse(HX, AXIS + 2, 36, 32), fill: 'head' },
            { d: circle(HX - 18, AXIS - 26, 17), kind: 'detail', fill: 'bulb' },
            { d: circle(HX + 18, AXIS - 26, 17), kind: 'detail', fill: 'bulb' },
            { d: ellipse(HX - 25, AXIS - 36, 6, 4, -30), kind: 'detail', fill: 'bulbLight' },
            { d: ellipse(HX + 11, AXIS - 36, 6, 4, -30), kind: 'detail', fill: 'bulbLight' },
            { d: ellipse(HX, AXIS + 18, 20, 9), kind: 'detail', fill: 'blueLight' },
            { d: circle(HX - 17, AXIS - 23, 10.5), kind: 'feature', fill: 'eye' },
            { d: circle(HX + 19, AXIS - 23, 10.5), kind: 'feature', fill: 'eye' },
            { d: circle(HX - 13, AXIS - 27.5, 4), kind: 'feature', fill: 'shine' },
            { d: circle(HX + 23, AXIS - 27.5, 4), kind: 'feature', fill: 'shine' },
            { d: circle(HX - 20, AXIS - 18, 1.8), kind: 'feature', fill: 'shine' },
            { d: circle(HX + 16, AXIS - 18, 1.8), kind: 'feature', fill: 'shine' },
            {
              d: ellipse(HX - 22, AXIS + 4, 7.5, 4.6),
              kind: 'feature',
              fill: 'blush',
              opacity: 0.75,
            },
            {
              d: ellipse(HX + 22, AXIS + 4, 7.5, 4.6),
              kind: 'feature',
              fill: 'blush',
              opacity: 0.75,
            },
            {
              d: curve(HX - 8, AXIS + 8, HX + 8, AXIS + 8, 6),
              kind: 'line',
              stroke: 'smile',
              width: 2.8,
            },
          ],
        },
      ],
    },
  ],
};

export default dragonfly;
