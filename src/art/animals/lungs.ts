import {
  circle,
  curve,
  ellipse,
  roundRect,
  smooth,
  translatePath,
  tube,
  type Pt,
} from '../core/paths';
import type { AnimalDef, PartNode, Shape } from '../core/types';

const MID = 170;

const LEFT_LUNG: Pt[] = [
  [112, 62],
  [134, 74],
  [146, 112],
  [152, 172],
  [156, 240],
  [150, 290],
  [118, 300],
  [70, 304],
  [32, 290],
  [18, 240],
  [22, 170],
  [44, 108],
  [78, 72],
];

const RIGHT_LUNG: Pt[] = [
  [228, 62],
  [206, 74],
  [194, 112],
  [190, 172],
  [204, 206],
  [210, 244],
  [196, 290],
  [222, 300],
  [270, 304],
  [308, 290],
  [322, 240],
  [318, 170],
  [296, 108],
  [262, 72],
];

const mx = (x: number) => 2 * MID - x;

function face(cx: number, cy: number): Shape[] {
  return [
    { d: ellipse(cx - 30, cy + 22, 11, 7), kind: 'feature', fill: 'blush', opacity: 0.55 },
    { d: ellipse(cx + 30, cy + 22, 11, 7), kind: 'feature', fill: 'blush', opacity: 0.55 },
    { d: circle(cx - 20, cy, 12.5), kind: 'feature', fill: 'eye' },
    { d: circle(cx + 20, cy, 12.5), kind: 'feature', fill: 'eye' },
    { d: circle(cx - 15.6, cy - 5, 4.7), kind: 'feature', fill: 'shine' },
    { d: circle(cx + 24.4, cy - 5, 4.7), kind: 'feature', fill: 'shine' },
    { d: curve(cx - 9, cy + 20, cx + 9, cy + 20, 6), kind: 'line', stroke: 'mouth', width: 3.2 },
  ];
}

const lung = (id: string, points: Pt[], cx: number, light: Pt): PartNode => ({
  id,
  behind: true,
  shapes: [
    { d: smooth(points), fill: 'lung' },
    { d: ellipse(light[0], light[1], 11, 24, cx < MID ? 24 : -24), kind: 'detail', fill: 'light' },
    ...face(cx, 228),
  ],
});

function branches(sign: 1 | -1): string[] {
  const x = (v: number) => (sign === 1 ? v : mx(v));
  const twig = (pts: Pt[], r0: number, r1: number) =>
    tube(
      pts.map(([px, py]): Pt => [x(px), py]),
      (t) => r0 + (r1 - r0) * t,
    );
  return [
    twig(
      [
        [MID, 122],
        [150, 146],
        [138, 166],
      ],
      13,
      11,
    ),
    twig(
      [
        [150, 148],
        [136, 136],
        [126, 120],
      ],
      7.5,
      4.5,
    ),
    twig(
      [
        [140, 162],
        [120, 170],
        [104, 184],
      ],
      8.5,
      5,
    ),
    twig(
      [
        [140, 162],
        [138, 184],
        [130, 202],
      ],
      8.5,
      5,
    ),
  ];
}

const RINGS = [24, 44, 64, 84, 104];

const offset = (parts: PartNode[], dx: number, dy: number): PartNode[] =>
  parts.map((p) => ({
    ...p,
    ...(p.pivot ? { pivot: [p.pivot[0] + dx, p.pivot[1] + dy] as Pt } : {}),
    ...(p.shapes ? { shapes: p.shapes.map((s) => ({ ...s, d: translatePath(s.d, dx, dy) })) } : {}),
    ...(p.children ? { children: offset(p.children, dx, dy) } : {}),
  }));

const lungs: AnimalDef = {
  id: 'lungs',
  name: 'Lungs',
  kind: 'object',
  aliases: ['lung', 'breathing', 'breath', 'windpipe', 'air'],
  group: 'body',
  habitats: ['body'],
  box: [330, 330],
  size: 260,
  locomotion: 'breathe',
  sound: 'lungs',
  palette: {
    lung: '#f793aa',
    light: '#ffc1cf',
    airway: '#ffd2da',
    ring: '#f4a9b9',
    blush: '#ff5f86',
  },
  parts: offset(
    [
      {
        id: 'chest',
        pivot: [MID, 180],
        shapes: [
          {
            d: tube(
              [
                [MID, 12],
                [MID, 70],
                [MID, 128],
              ],
              17,
            ),
            fill: 'airway',
          },
          ...branches(1).map((d): Shape => ({ d, fill: 'airway' })),
          ...branches(-1).map((d): Shape => ({ d, fill: 'airway' })),
          ...RINGS.map((y): Shape => ({
            d: roundRect(MID - 20, y, 40, 6, 3),
            kind: 'detail',
            fill: 'ring',
          })),
        ],
        children: [
          lung('lungL', LEFT_LUNG, 84, [52, 140]),
          lung('lungR', RIGHT_LUNG, mx(84), [mx(52), 140]),
        ],
      },
    ],
    -5,
    15,
  ),
};

export default lungs;
