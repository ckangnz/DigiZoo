import {
  capsule,
  circle,
  curve,
  ellipse,
  f,
  scalePath,
  smooth,
  tube,
  type Pt,
} from '../core/paths';
import type { AnimalDef, PartNode, Shape } from '../core/types';

const BODY: { c: Pt; rx: number; ry: number } = { c: [146, 92], rx: 82, ry: 36 };

const onBody = (deg: number, k = 1): Pt => {
  const a = (deg * Math.PI) / 180;
  return [BODY.c[0] + Math.cos(a) * BODY.rx * k, BODY.c[1] + Math.sin(a) * BODY.ry * k];
};

const spike = (deg: number, len: number, half: number): string => {
  const a = onBody(deg - half, 0.92);
  const b = onBody(deg + half, 0.92);
  const mid = onBody(deg, 1);
  const rad = (deg * Math.PI) / 180;
  const nx = Math.cos(rad) * BODY.ry;
  const ny = Math.sin(rad) * BODY.rx;
  const nl = Math.hypot(nx, ny) || 1;
  const tip: Pt = [mid[0] + (nx / nl) * len, mid[1] + (ny / nl) * len];
  return `M${f(a[0])} ${f(a[1])}Q${f(tip[0] - (nx / nl) * 2)} ${f(tip[1] - (ny / nl) * 2)} ${f(tip[0])} ${f(tip[1])}Q${f(tip[0] - (nx / nl) * 2)} ${f(tip[1] - (ny / nl) * 2)} ${f(b[0])} ${f(b[1])}Z`;
};

const hornTip = ([x, y, angle, len]: number[]): Pt => {
  const a = (angle * Math.PI) / 180;
  return [x + Math.cos(a) * len, y + Math.sin(a) * len];
};

const horn = (h: [number, number, number, number, number]): Shape => {
  const [x, y, , , r] = h;
  return { d: tube([[x, y], hornTip(h)], (t) => r * (1 - 0.8 * t), 16), fill: 'horn' };
};

const HIP = 112;

const leg = (id: string, x: number, far: boolean, front: boolean): PartNode => {
  const fill = far ? 'sandDark' : 'sand';
  const dir = front ? 1 : -1;
  const kx = x - 7 * dir;
  const ky = 128;
  const ax = x + 3 * dir;
  const ay = 138;
  const toe = (dx: number, dy: number): Shape[] => [
    { d: capsule(ax, ay, ax + dx, ay + dy, 2.8, 2.2), fill },
    { d: circle(ax + dx, ay + dy, 3), fill: far ? 'sandDark' : 'pad' },
  ];
  return {
    id,
    role: id,
    behind: true,
    pivot: [x, HIP],
    shapes: [
      { d: capsule(x, HIP, kx, ky, 10, 7.5), fill },
      { d: capsule(kx, ky, ax, ay, 7.5, 6), fill },
      ...toe(16 * dir, 7),
      ...toe(5 * dir, 8),
      ...(far ? [] : toe(-6 * dir, 8)),
      ...toe(-14 * dir, 5),
      { d: ellipse(ax, ay + 1, 6, 5), fill },
    ],
  };
};

const FRINGE = (() => {
  const pts: Pt[] = [];
  for (let i = 0; i <= 26; i++) {
    const deg = 168 - i * 6;
    pts.push(onBody(deg, i % 2 ? 0.56 : 0.76));
  }
  pts.push(onBody(10, 1.3), onBody(90, 1.4), onBody(170, 1.3));
  return pts;
})();

const BLOTCHES: [number, number, number][] = [
  [106, 74, 6.5],
  [140, 67, 7.5],
  [174, 70, 7],
  [204, 80, 5],
  [88, 92, 4.2],
  [123, 89, 4.6],
  [158, 88, 4.6],
  [190, 92, 4.2],
];

const HORNS: [number, number, number, number, number][] = [
  [212, 80, -178, 22, 6],
  [214, 71, -156, 31, 7.5],
  [220, 64, -132, 36, 8],
  [230, 60, -110, 26, 7],
  [241, 59, -92, 16, 5.5],
];

const BACK = [204, 222, 240, 258, 276, 294, 312];

const NECK: Pt = [218, 88];
const HEAD_SCALE = 1.15;
const grow = (shapes: Shape[]): Shape[] =>
  shapes.map((sh) => ({ ...sh, d: scalePath(sh.d, HEAD_SCALE, HEAD_SCALE, NECK[0], NECK[1]) }));

const hornedLizard: AnimalDef = {
  id: 'horned-lizard',
  name: 'Horned Lizard',
  kind: 'animal',
  aliases: ['horned toad', 'horned frog', 'horn lizard', 'spiky lizard', 'lizard'],
  group: 'reptile',
  habitats: ['desert'],
  box: [300, 152],
  size: 70,
  locomotion: 'walk4',
  gait: { stride: 40, swing: 18 },
  sound: 'horned-lizard',
  palette: {
    sand: '#e9b974',
    sandDark: '#d09b59',
    belly: '#f8e6c0',
    blotch: '#9f6234',
    rim: '#fcefd2',
    horn: '#f5e0b4',
    hornTip: '#c89357',
    fringe: '#faebc9',
    pad: '#f2d6a2',
  },
  parts: [
    {
      id: 'body',
      role: 'body',
      pivot: [150, 120],
      shapes: [
        ...BACK.map((deg) => ({ d: spike(deg, 7, 5), fill: 'sand' })),
        ...[24, 34, 146, 156].map((deg) => ({ d: spike(deg, 7, 4.5), fill: 'sand' })),
        { d: ellipse(...BODY.c, BODY.rx, BODY.ry), fill: 'sand' },
        { d: smooth(FRINGE, true, 0.25), kind: 'detail', fill: 'fringe' },
        ...BLOTCHES.flatMap(([x, y, r]): Shape[] => [
          { d: ellipse(x - 3.5, y + 1, r * 1.32, r * 0.92, -8), kind: 'detail', fill: 'rim' },
          { d: ellipse(x, y, r * 1.2, r * 0.78, -8), kind: 'detail', fill: 'blotch' },
        ]),
      ],
      children: [
        {
          id: 'tail',
          role: 'tail',
          behind: true,
          pivot: [76, 100],
          shapes: [
            {
              d: tube(
                [
                  [82, 98],
                  [58, 104],
                  [38, 110],
                  [22, 116],
                ],
                (t) => 14 - 11 * t,
                30,
              ),
              fill: 'sand',
            },
            { d: circle(52, 105, 3), kind: 'detail', fill: 'blotch' },
          ],
        },
        leg('legBF', 112, true, false),
        leg('legFF', 206, true, true),
        leg('legBN', 92, false, false),
        leg('legFN', 186, false, true),
        {
          id: 'head',
          role: 'head',
          pivot: NECK,
          shapes: grow([
            {
              d: smooth([
                [212, 66],
                [236, 58],
                [258, 64],
                [274, 78],
                [280, 92],
                [272, 104],
                [248, 110],
                [222, 106],
                [206, 92],
              ]),
              fill: 'sand',
            },
            { d: ellipse(250, 108, 28, 7), kind: 'detail', fill: 'belly' },
            { d: ellipse(258, 94, 8, 5), kind: 'feature', fill: 'blush', opacity: 0.55 },
            { d: circle(244, 78, 9.5), kind: 'feature', fill: 'eye' },
            { d: circle(247.6, 74.4, 3.6), kind: 'feature', fill: 'shine' },
            { d: curve(264, 98, 278, 92, 3), kind: 'line', stroke: 'mouth', width: 2.4 },
          ]),
          children: [
            {
              id: 'crown',
              behind: true,
              pivot: [224, 70],
              shapes: grow([
                ...HORNS.map(horn),
                ...HORNS.map((h): Shape => {
                  const [tx, ty] = hornTip(h);
                  return { d: circle(tx, ty, h[3] * 0.34), kind: 'detail', fill: 'hornTip' };
                }),
              ]),
            },
          ],
        },
      ],
    },
  ],
};

export default hornedLizard;
