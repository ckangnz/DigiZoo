import {
  capsule,
  circle,
  curve,
  ellipse,
  leaf,
  smooth,
  translatePath,
  type Pt,
} from '../core/paths';
import type { AnimalDef, PartNode, Shape } from '../core/types';

const GROUND = 200;
const HIP = 170;
const C: Pt = [140, 146];
const RX = 98;
const RY = 84;

const arc = (deg: number, k: number): Pt => {
  const a = (deg * Math.PI) / 180;
  return [C[0] + RX * k * Math.cos(a), C[1] - RY * k * Math.sin(a)];
};

const coatPoints = (): Pt[] => {
  const pts: Pt[] = [];
  const n = 17;
  const from = 196;
  const to = -8;
  for (let i = 0; i <= 2 * n; i++) {
    const deg = from + ((to - from) * i) / (2 * n);
    pts.push(arc(deg, i % 2 ? 1.13 : 0.98));
  }
  pts.push([226, 174], [140, 180], [56, 176]);
  return pts;
};

const quills: Shape[] = [
  [0.42, 5],
  [0.64, 8],
  [0.86, 11],
].flatMap(([k, count], row) =>
  Array.from({ length: count }, (_, i): Shape => {
    const deg = 176 - (166 * (i + 0.5 + (row % 2) * 0.25)) / count;
    const [x, y] = arc(deg, k);
    return { d: leaf(x, y, 17, 3.6, -deg), kind: 'detail', fill: 'spineLight' };
  }),
);

const leg = (id: string, x: number, far: boolean): PartNode => ({
  id,
  role: id,
  behind: true,
  pivot: [x, HIP],
  shapes: [
    { d: capsule(x, HIP, x, GROUND - 9, 8.5, 7.5), fill: far ? 'skinDark' : 'skin' },
    { d: ellipse(x + 3, GROUND - 6, 10.5, 6), fill: far ? 'skinDark' : 'skin' },
  ],
});

const offset = (parts: PartNode[], dx: number, dy: number): PartNode[] =>
  parts.map((p): PartNode => ({
    ...p,
    pivot: p.pivot && [p.pivot[0] + dx, p.pivot[1] + dy],
    shapes: p.shapes?.map((s) => ({ ...s, d: translatePath(s.d, dx, dy) })),
    children: p.children && offset(p.children, dx, dy),
  }));

const hedgehog: AnimalDef = {
  id: 'hedgehog',
  name: 'Hedgehog',
  kind: 'animal',
  aliases: ['hedgie', 'hoglet', 'hedge hog', 'spiky'],
  group: 'mammal',
  habitats: ['forest', 'pets'],
  box: [267, GROUND - 49],
  size: 80,
  locomotion: 'walk4',
  gait: { period: 0.7, stride: 30, swing: 16 },
  sound: 'hedgehog',
  palette: {
    spine: '#8a5a3b',
    spineLight: '#b4825a',
    belly: '#ecd2b0',
    face: '#f8e4c8',
    skin: '#e3b78e',
    skinDark: '#c99c72',
    earInner: '#f3b7a4',
    nose: '#2c1e1b',
  },
  parts: offset(
    [
      {
        id: 'body',
        role: 'body',
        pivot: [140, HIP],
        shapes: [
          { d: ellipse(146, 168, 84, 16), fill: 'belly' },
          { d: smooth(coatPoints(), true, 0.7), fill: 'spine' },
          ...quills,
        ],
        children: [
          leg('legBF', 98, true),
          leg('legFF', 196, true),
          leg('legBN', 78, false),
          leg('legFN', 176, false),
          {
            id: 'head',
            role: 'head',
            pivot: [206, 160],
            shapes: [
              {
                d: smooth([
                  [198, 102],
                  [226, 106],
                  [250, 118],
                  [270, 134],
                  [284, 147],
                  [286, 159],
                  [276, 167],
                  [254, 177],
                  [226, 183],
                  [202, 179],
                  [186, 160],
                  [184, 128],
                ]),
                fill: 'face',
              },
              { d: ellipse(228, 158, 9, 6), kind: 'feature', fill: 'blush', opacity: 0.55 },
              { d: circle(234, 134, 9), kind: 'feature', fill: 'eye' },
              { d: circle(237.4, 130.6, 3.4), kind: 'feature', fill: 'shine' },
              { d: circle(259, 131, 6.8), kind: 'feature', fill: 'eye' },
              { d: circle(261.6, 128.4, 2.6), kind: 'feature', fill: 'shine' },
              { d: circle(284, 152, 7.5), kind: 'feature', fill: 'nose' },
              { d: circle(281.6, 149.6, 2.2), kind: 'feature', fill: 'white', opacity: 0.55 },
              { d: curve(255, 165, 272, 163, 4), kind: 'line', stroke: 'mouth', width: 2.4 },
            ],
            children: [
              {
                id: 'ear',
                behind: true,
                pivot: [212, 108],
                shapes: [
                  { d: circle(212, 106, 12), fill: 'skin' },
                  { d: circle(212, 106, 6.5), kind: 'detail', fill: 'earInner' },
                ],
              },
            ],
          },
        ],
      },
    ],
    -27,
    -49,
  ),
};

export default hedgehog;
