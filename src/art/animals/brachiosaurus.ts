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

const leg = (id: string, x: number, top: number, r: number, far: boolean): PartNode => {
  const fill = far ? 'skinDark' : 'skin';
  return {
    id,
    role: id,
    behind: true,
    pivot: [x, top],
    shapes: [
      { d: capsule(x, top - 8, x, 486, r, r - 2), fill },
      { d: ellipse(x + 4, 501, r + 5, 16), fill },
      ...[-14, 0, 14].map((dx) => ({
        d: ellipse(x + 7 + dx, 514, 6.5, 7.5),
        kind: 'detail' as const,
        fill: far ? 'nailDark' : 'nail',
      })),
    ],
  };
};

const NECK: Pt[] = [
  [258, 336],
  [276, 264],
  [292, 196],
  [302, 136],
  [308, 88],
];

const neckRadius = (t: number) => 50 - 28 * t ** 0.8;

function neckDetails(): Shape[] {
  const line = spline(NECK, 24);
  const front = line.map(([x, y], i): Pt => [x + neckRadius(i / 24) * 0.8, y + 4]);
  const out: Shape[] = [{ d: tube(front, (t) => 17 - 7 * t, 40), kind: 'detail', fill: 'belly' }];
  [0.3, 0.5, 0.7].forEach((t) => {
    const [x, y] = line[Math.round(t * 24)];
    out.push({
      d: circle(x - neckRadius(t) * 0.42, y, 7.5 - 3 * t),
      kind: 'detail',
      fill: 'spot',
    });
  });
  return out;
}

const HEAD_PIVOT: Pt = [304, 96];

const grow = (shapes: Shape[]): Shape[] =>
  shapes.map((s) => ({ ...s, d: scalePath(s.d, 1.12, 1.12, HEAD_PIVOT[0], HEAD_PIVOT[1]) }));

const offset = (parts: PartNode[], dx: number): PartNode[] =>
  parts.map((p): PartNode => ({
    ...p,
    pivot: p.pivot && [p.pivot[0] + dx, p.pivot[1]],
    shapes: p.shapes?.map((s) => ({ ...s, d: translatePath(s.d, dx, 0) })),
    children: p.children && offset(p.children, dx),
  }));

const brachiosaurus: AnimalDef = {
  id: 'brachiosaurus',
  name: 'Brachiosaurus',
  kind: 'animal',
  aliases: ['brachio', 'long neck', 'longneck', 'sauropod', 'brontosaurus', 'dinosaur'],
  group: 'dinosaur',
  habitats: ['dinosaur'],
  box: [404, 520],
  size: 520,
  locomotion: 'walk4',
  gait: { period: 1.2, swing: 14, stride: 110 },
  sound: 'brachiosaurus',
  palette: {
    skin: '#74c9aa',
    skinDark: '#5aae90',
    spot: '#5db596',
    belly: '#e4f4c4',
    nail: '#f2fbf3',
    nailDark: '#c8e6d6',
    cheek: '#ff93a6',
    nostril: '#3f8a70',
  },
  parts: offset(
    [
      {
        id: 'body',
        role: 'body',
        pivot: [180, 400],
        shapes: [
          {
            d: smooth([
              [52, 356],
              [76, 322],
              [124, 300],
              [184, 280],
              [240, 262],
              [286, 268],
              [314, 302],
              [314, 350],
              [290, 396],
              [232, 422],
              [164, 428],
              [102, 418],
              [62, 392],
            ]),
            fill: 'skin',
          },
          { d: ellipse(196, 432, 110, 34, -4), kind: 'detail', fill: 'belly' },
          { d: circle(132, 318, 11), kind: 'detail', fill: 'spot' },
          { d: circle(176, 302, 13), kind: 'detail', fill: 'spot' },
          { d: circle(222, 290, 11), kind: 'detail', fill: 'spot' },
          { d: circle(96, 340, 8), kind: 'detail', fill: 'spot' },
          { d: circle(150, 350, 8), kind: 'detail', fill: 'spot' },
          { d: circle(200, 334, 9), kind: 'detail', fill: 'spot' },
        ],
        children: [
          {
            id: 'tail',
            role: 'tail',
            pivot: [76, 356],
            behind: true,
            shapes: [
              {
                d: tube(
                  [
                    [96, 350],
                    [58, 360],
                    [26, 378],
                    [2, 400],
                    [-14, 418],
                  ],
                  (t) => 30 * (1 - t) ** 1.1 + 6 * t,
                  50,
                ),
                fill: 'skin',
              },
            ],
          },
          leg('legBF', 132, 390, 29, true),
          leg('legFF', 286, 366, 31, true),
          leg('legBN', 102, 396, 31, false),
          leg('legFN', 256, 372, 33, false),
          {
            id: 'neck',
            role: 'neck',
            pivot: [262, 330],
            behind: true,
            motion: { rotate: 2.5, phase: 0.05 },
            shapes: [{ d: tube(NECK, neckRadius, 60), fill: 'skin' }, ...neckDetails()],
            children: [
              {
                id: 'head',
                role: 'head',
                pivot: HEAD_PIVOT,
                shapes: grow([
                  {
                    d: smooth([
                      [274, 72],
                      [282, 42],
                      [304, 22],
                      [332, 20],
                      [350, 34],
                      [358, 52],
                      [374, 62],
                      [382, 82],
                      [370, 100],
                      [338, 110],
                      [302, 108],
                      [280, 96],
                    ]),
                    fill: 'skin',
                  },
                  { d: ellipse(338, 116, 44, 15), kind: 'detail', fill: 'belly' },
                  { d: ellipse(314, 86, 10, 6.5), kind: 'feature', fill: 'cheek', opacity: 0.7 },
                  { d: circle(322, 62, 11.5), kind: 'feature', fill: 'eye' },
                  { d: circle(326.4, 57.6, 4.4), kind: 'feature', fill: 'shine' },
                  { d: ellipse(362, 56, 3.2, 2.4, -20), kind: 'feature', fill: 'nostril' },
                  { d: curve(372, 90, 340, 94, -4.5), kind: 'line', stroke: 'mouth', width: 3.2 },
                ]),
              },
            ],
          },
        ],
      },
    ],
    20,
  ),
};

export default brachiosaurus;
