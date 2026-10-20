import {
  capsule,
  circle,
  curve,
  ellipse,
  scalePath,
  smooth,
  spline,
  translatePath,
  tube,
  type Pt,
} from '../core/paths';
import type { AnimalDef, PartNode, Shape } from '../core/types';

const HIP = 150;

const leg = (id: string, x: number, far: boolean): PartNode => {
  const fill = far ? 'skinDark' : 'skin';
  return {
    id,
    role: id,
    behind: true,
    pivot: [x, HIP],
    shapes: [
      { d: capsule(x, HIP - 6, x + 2, 194, 21, 19), fill },
      { d: ellipse(x + 6, 206, 25, 12), fill },
      ...[-11, 0, 11].map((dx) => ({
        d: ellipse(x + 9 + dx, 216, 5, 6),
        kind: 'detail' as const,
        fill: far ? 'nailDark' : 'nail',
      })),
    ],
  };
};

interface Frame {
  p: Pt;
  n: Pt;
}

const frame = (pts: Pt[], n: number): Frame[] => {
  const line = spline(pts, n);
  return line.map((p, i) => {
    const a = line[Math.max(0, i - 1)];
    const b = line[Math.min(n, i + 1)];
    const len = Math.hypot(b[0] - a[0], b[1] - a[1]) || 1;
    return { p, n: [(b[1] - a[1]) / len, -(b[0] - a[0]) / len] };
  });
};

const TOP = frame(
  [
    [76, 126],
    [112, 98],
    [166, 82],
    [226, 78],
    [286, 84],
    [328, 102],
    [350, 128],
  ],
  32,
);

const cone = (base: Pt, dir: Pt, len: number, r: number, fill: string): Shape => {
  const tip: Pt = [base[0] + dir[0] * len, base[1] + dir[1] * len];
  return { d: tube([base, tip], (t) => r * (1 - t) + 3 * t, 24), fill };
};

const topSpikes = (): Shape[] =>
  [2, 6, 10, 14, 18, 22, 26, 30].map((i, k) => {
    const { p, n } = TOP[i];
    const len = k % 2 ? 18 : 26;
    return cone([p[0] - n[0] * 6, p[1] - n[1] * 6], n, len + 6, 11.5, 'spike');
  });

const sideSpikes = (): Shape[] => [
  cone([74, 150], [-0.9, 0.44], 32, 12, 'spike'),
  cone([104, 162], [-0.5, 0.86], 26, 11, 'spike'),
  cone([344, 152], [0.84, 0.54], 28, 11, 'spike'),
];

function scutes(): Shape[] {
  const out: Shape[] = [];
  const rows: [number, number, number][] = [
    [104, 134, 318],
    [136, 100, 340],
  ];
  rows.forEach(([y, x0, x1], row) => {
    for (let x = x0 + row * 18; x <= x1; x += 36) {
      const dy = row === 0 ? (x - 226) ** 2 * 0.0009 : 0;
      out.push({ d: ellipse(x, y + dy, 13, 10), kind: 'detail', fill: 'scute' });
      out.push({ d: circle(x - 2.5, y + dy - 2.5, 4.4), kind: 'detail', fill: 'scuteLight' });
    }
  });
  return out;
}

const HEAD_PIVOT: Pt = [346, 142];

const grow = (shapes: Shape[]): Shape[] =>
  shapes.map((s) => ({ ...s, d: scalePath(s.d, 1.12, 1.12, HEAD_PIVOT[0], HEAD_PIVOT[1]) }));

const offset = (parts: PartNode[], dy: number): PartNode[] =>
  parts.map((p): PartNode => ({
    ...p,
    pivot: p.pivot && [p.pivot[0], p.pivot[1] + dy],
    shapes: p.shapes?.map((s) => ({ ...s, d: translatePath(s.d, 0, dy) })),
    children: p.children && offset(p.children, dy),
  }));

const ankylosaurus: AnimalDef = {
  id: 'ankylosaurus',
  name: 'Ankylosaurus',
  kind: 'animal',
  aliases: ['ankylo', 'armoured dinosaur', 'armored dinosaur', 'club tail', 'dinosaur'],
  group: 'dinosaur',
  habitats: ['dinosaur'],
  box: [440, 186],
  size: 220,
  locomotion: 'walk4',
  gait: { period: 0.95, swing: 18, stride: 70 },
  sound: 'ankylosaurus',
  palette: {
    skin: '#f4c158',
    skinDark: '#daa440',
    belly: '#fde3a2',
    armour: '#eaac4c',
    scute: '#cf8c39',
    scuteLight: '#ffd27e',
    spike: '#ffe8bb',
    club: '#d08a38',
    nail: '#fff6e0',
    nailDark: '#f0d6a0',
    cheek: '#ff8f9c',
  },
  parts: offset(
    [
      {
        id: 'body',
        role: 'body',
        pivot: [216, HIP],
        shapes: [
          {
            d: smooth([
              [62, 152],
              [76, 122],
              [114, 96],
              [168, 80],
              [228, 76],
              [288, 82],
              [332, 102],
              [356, 134],
              [352, 162],
              [312, 172],
              [220, 176],
              [124, 172],
              [76, 166],
            ]),
            fill: 'armour',
          },
          { d: ellipse(220, 184, 132, 18), kind: 'detail', fill: 'belly' },
          ...scutes(),
        ],
        children: [
          { id: 'topSpikes', behind: true, shapes: topSpikes() },
          {
            id: 'tail',
            role: 'tail',
            pivot: [90, 142],
            behind: true,
            shapes: [
              {
                d: tube(
                  [
                    [110, 140],
                    [80, 138],
                    [54, 134],
                    [32, 130],
                  ],
                  (t) => 22 * (1 - t) + 9 * t,
                  40,
                ),
                fill: 'armour',
              },
              { d: ellipse(70, 130, 8, 6), kind: 'detail', fill: 'scute' },
              { d: ellipse(50, 127, 7, 5), kind: 'detail', fill: 'scute' },
              { d: ellipse(24, 120, 22, 18, -10), fill: 'club' },
              { d: ellipse(24, 142, 20, 16, 10), fill: 'club' },
              { d: circle(18, 114, 6), kind: 'detail', fill: 'scuteLight' },
              { d: circle(18, 138, 5), kind: 'detail', fill: 'scuteLight' },
            ],
          },
          leg('legBF', 140, true),
          leg('legFF', 296, true),
          leg('legBN', 116, false),
          leg('legFN', 272, false),
          { id: 'sideSpikes', behind: true, shapes: sideSpikes() },
          {
            id: 'head',
            role: 'head',
            pivot: HEAD_PIVOT,
            shapes: grow([
              { d: capsule(352, 108, 332, 92, 8.5, 4), fill: 'spike' },
              { d: capsule(348, 154, 330, 168, 8, 4), fill: 'spike' },
              {
                d: smooth([
                  [330, 124],
                  [350, 106],
                  [384, 100],
                  [414, 108],
                  [430, 126],
                  [428, 148],
                  [410, 160],
                  [378, 164],
                  [348, 162],
                  [330, 148],
                ]),
                fill: 'skin',
              },
              { d: ellipse(384, 170, 44, 14), kind: 'detail', fill: 'belly' },
              { d: ellipse(374, 144, 9.5, 6), kind: 'feature', fill: 'cheek', opacity: 0.7 },
              { d: circle(380, 122, 10), kind: 'feature', fill: 'eye' },
              { d: circle(383.8, 118.2, 3.8), kind: 'feature', fill: 'shine' },
              { d: ellipse(422, 120, 2.8, 2.1), kind: 'feature', fill: 'mouth' },
              { d: curve(424, 144, 392, 150, -4), kind: 'line', stroke: 'mouth', width: 3 },
            ]),
          },
        ],
      },
    ],
    -34,
  ),
};

export default ankylosaurus;
