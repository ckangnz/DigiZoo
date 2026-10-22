import { capsule, circle, ellipse, leaf, smooth, spline, tube, type Pt } from '../core/paths';
import type { AnimalDef, PartNode, Shape } from '../core/types';

const TAU = Math.PI * 2;
const GROUND = 128;
const HIP = 104;
const SAMPLES = 150;

const SPINE: Pt[] = [
  [244, 92],
  [220, 95],
  [196, 97],
  [172, 97],
  [148, 96],
  [124, 94],
  [102, 90],
  [82, 84],
  [62, 79],
  [42, 78],
  [24, 81],
  [10, 86],
];

const KEYS: Pt[] = [
  [0, 16.5],
  [0.1, 19],
  [0.3, 19],
  [0.46, 16.5],
  [0.56, 13.5],
  [0.7, 10.5],
  [0.84, 8],
  [0.94, 5.5],
  [1, 3],
];

const FIN: Pt[] = [
  [0, 0],
  [0.5, 0],
  [0.62, 3],
  [0.76, 6.5],
  [0.9, 7],
  [1, 6],
];

const lerpKeys = (keys: Pt[], t: number): number => {
  const i = Math.max(0, keys.findIndex(([k]) => k >= t) - 1);
  const [t0, r0] = keys[i];
  const [t1, r1] = keys[Math.min(keys.length - 1, i + 1)];
  const u = t1 === t0 ? 0 : Math.min(1, Math.max(0, (t - t0) / (t1 - t0)));
  return r0 + (r1 - r0) * u * u * (3 - 2 * u);
};

const radius = (t: number) => lerpKeys(KEYS, t);
const finRadius = (t: number) => radius(t) + lerpKeys(FIN, t);

function spine(phase: number): Pt[] {
  return SPINE.map(([x, y], i) => {
    if (i <= 5) return [x, y] as Pt;
    const k = (i - 5) / 6;
    return [x, y + 6 * k * Math.sin(TAU * phase - 1.1 * (i - 5))] as Pt;
  });
}

function body(phase: number): Shape[] {
  const line = spine(phase);
  const pts = spline(line, SAMPLES);
  const at = (t: number) => {
    const i = Math.round(t * SAMPLES);
    const a = pts[Math.max(0, i - 1)];
    const b = pts[Math.min(SAMPLES, i + 1)];
    const len = Math.hypot(b[0] - a[0], b[1] - a[1]) || 1;
    return { p: pts[i], n: [-(b[1] - a[1]) / len, (b[0] - a[0]) / len] as Pt, r: radius(t) };
  };
  const edge = (from: number, to: number, k: number): Pt[] => {
    const out: Pt[] = [];
    for (let i = Math.round(from * SAMPLES); i <= Math.round(to * SAMPLES); i++) {
      const { p, n, r } = at(i / SAMPLES);
      out.push([p[0] + n[0] * r * k, p[1] + n[1] * r * k]);
    }
    return out;
  };
  return [
    { d: tube(line, finRadius, SAMPLES), fill: 'fin' },
    { d: tube(line, radius, SAMPLES), fill: 'skin' },
    {
      d: tube(edge(0, 0.55, -0.95), (t) => radius(t * 0.55) * 0.5, 80),
      kind: 'detail',
      fill: 'belly',
    },
    { d: tube(edge(0.04, 0.6, 0.5), (t) => 3.6 - 2 * t, 50), kind: 'detail', fill: 'shine2' },
  ];
}

const leg = (id: string, x: number, far: boolean, front: boolean): PartNode => {
  const fill = far ? 'skinDark' : 'skin';
  const dir = front ? 1 : -1;
  const ankle: Pt = [x + 4 * dir, GROUND - 6];
  const toes = front ? [-40, 0, 40] : [-24, 24];
  return {
    id,
    role: id,
    behind: true,
    pivot: [x, HIP],
    shapes: [
      { d: capsule(x, HIP - 4, ankle[0], ankle[1], 8, 5.5), fill },
      ...toes.map((deg): Shape => {
        const a = ((deg * dir + 90) * Math.PI) / 180;
        const tx = ankle[0] + Math.cos(a) * 6 + dir * 3;
        const ty = ankle[1] + Math.sin(a) * 3.5 + 1;
        return { d: capsule(ankle[0], ankle[1], tx, ty, 3.4, 2.8), fill };
      }),
    ],
  };
};

const gill = (cx: number, cy: number, deg: number, len: number, fill: string): Shape[] => {
  const a = (deg * Math.PI) / 180;
  const ux = Math.cos(a);
  const uy = Math.sin(a);
  const tip: Pt = [cx + ux * len, cy + uy * len];
  const fronds = [0.4, 0.62, 0.84].flatMap((t, i): Shape[] => {
    const px = cx + ux * len * t;
    const py = cy + uy * len * t;
    const l = 8.6 - i * 0.9;
    return [
      { d: leaf(px, py, l, 3, deg + 52), fill },
      { d: leaf(px, py, l, 3, deg - 52), fill },
    ];
  });
  return [
    { d: capsule(cx, cy, tip[0], tip[1], 3.4, 2.6), fill },
    { d: leaf(tip[0] - ux * 2, tip[1] - uy * 2, 8, 3.4, deg), fill },
    ...fronds,
  ];
};

const GILLS: [number, number, number][] = [
  [-102, 32, -4],
  [-140, 34, 0],
  [-176, 29, 5],
];

const gillTuft = (id: string, far: boolean): PartNode => {
  const fill = far ? 'gillDark' : 'gill';
  const [ox, oy] = far ? [13, -8] : [0, 0];
  const base: Pt = [238 + ox, 82 + oy];
  return {
    id,
    role: far ? 'earF' : 'earN',
    behind: far,
    pivot: base,
    shapes: GILLS.flatMap(([deg, len, dy]) => gill(base[0], base[1] + dy, deg, len, fill)),
  };
};

const olm: AnimalDef = {
  id: 'olm',
  name: 'Olm',
  kind: 'animal',
  aliases: ['proteus', 'cave salamander', 'salamander', 'baby dragon'],
  group: 'amphibian',
  habitats: ['cave'],
  box: [334, GROUND],
  size: 70,
  locomotion: 'walk4',
  gait: { period: 1.1, stride: 26, swing: 16 },
  sound: 'olm',
  palette: {
    skin: '#ffc6cd',
    skinDark: '#f0a8b3',
    belly: '#ffe3e3',
    fin: '#ffecef',
    shine2: '#ffe9ec',
    gill: '#ff8398',
    gillDark: '#ea6c84',
    cheek: '#ff8fa3',
  },
  parts: [
    {
      id: 'body',
      role: 'body',
      pivot: [170, 110],
      frames: body,
      children: [
        leg('legBF', 140, true, false),
        leg('legFF', 226, true, true),
        gillTuft('gillsF', true),
        leg('legBN', 126, false, false),
        leg('legFN', 212, false, true),
        {
          id: 'head',
          role: 'head',
          pivot: [244, 90],
          shapes: [
            {
              d: smooth([
                [224, 82],
                [234, 63],
                [256, 52],
                [286, 48],
                [310, 52],
                [324, 64],
                [328, 80],
                [320, 95],
                [298, 104],
                [266, 107],
                [240, 104],
                [227, 94],
              ]),
              fill: 'skin',
            },
            { d: ellipse(286, 108, 40, 10), kind: 'detail', fill: 'belly' },
            { d: ellipse(278, 59, 22, 4.5, -4), kind: 'detail', fill: 'shine2' },
            { d: ellipse(284, 90, 8, 4.8), kind: 'feature', fill: 'cheek', opacity: 0.6 },
            { d: circle(294, 74, 5.8), kind: 'feature', fill: 'eye' },
            { d: circle(296.1, 71.9, 2.1), kind: 'feature', fill: 'shine' },
            { d: circle(321, 72, 1.7), kind: 'feature', fill: 'mouth' },
            { d: 'M322 87Q305 99 283 96', kind: 'line', stroke: 'mouth', width: 2.8 },
          ],
          children: [gillTuft('gillsN', false)],
        },
      ],
    },
  ],
};

export default olm;
