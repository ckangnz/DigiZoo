import {
  capsule,
  circle,
  curve,
  ellipse,
  poly,
  smooth,
  translatePath,
  tube,
  type Pt,
} from '../core/paths';
import type { AnimalDef, PartNode, Shape } from '../core/types';

const TAU = Math.PI * 2;
const DEG = Math.PI / 180;
const TAIL_START: Pt = [100, 206];
const TAIL_LEN = 220;

function tailLine(phase: number): Pt[] {
  const turn = 410 + 16 * Math.sin(TAU * phase);
  const n = 30;
  const pts: Pt[] = [TAIL_START];
  for (let k = 0; k < n; k++) {
    const t = (k + 0.5) / n;
    const heading = (104 - turn * Math.pow(t, 1.7)) * DEG;
    const [x, y] = pts[pts.length - 1];
    pts.push([x + (Math.cos(heading) * TAIL_LEN) / n, y + (Math.sin(heading) * TAIL_LEN) / n]);
  }
  return pts;
}

const tailRadius = (t: number) => 17 * (1 - 0.76 * Math.pow(t, 0.8));

const PLATES: Pt[] = [
  [124, 124],
  [124, 142],
  [127, 160],
  [125, 178],
  [123, 196],
];

const FIN_RAYS: [Pt, Pt][] = [
  [
    [66, 160],
    [46, 150],
  ],
  [
    [66, 170],
    [38, 166],
  ],
  [
    [66, 179],
    [38, 182],
  ],
  [
    [66, 189],
    [42, 198],
  ],
];

function bodyShapes(phase: number): Shape[] {
  const tail = tailLine(phase);
  return [
    {
      d: smooth([
        [92, 26],
        [96, 10],
        [104, 20],
        [112, 6],
        [120, 20],
        [130, 10],
        [130, 30],
      ]),
      fill: 'crown',
    },
    { d: tube(tail, tailRadius, 160), fill: 'body' },
    {
      d: smooth([
        [84, 36],
        [104, 24],
        [128, 26],
        [146, 40],
        [154, 60],
        [148, 80],
        [134, 94],
        [124, 104],
        [130, 120],
        [148, 138],
        [160, 164],
        [156, 192],
        [138, 212],
        [112, 222],
        [88, 220],
        [70, 202],
        [62, 174],
        [62, 146],
        [70, 120],
        [80, 100],
        [80, 74],
      ]),
      fill: 'body',
    },
    { d: capsule(146, 64, 188, 70, 11, 8.5), fill: 'body' },
    { d: ellipse(144, 172, 24, 50, -14), kind: 'detail', fill: 'belly' },
    ...PLATES.map(([x, y]): Shape => ({
      d: tube(
        [
          [x, y - 3],
          [x + 30, y + 2],
          [x + 60, y + 10],
        ],
        1.5,
        12,
      ),
      kind: 'detail',
      fill: 'ridge',
    })),
    { d: circle(92, 120, 2.8), kind: 'detail', fill: 'speck' },
    { d: circle(80, 146, 3.2), kind: 'detail', fill: 'speck' },
    { d: circle(92, 176, 2.6), kind: 'detail', fill: 'speck' },
    { d: circle(78, 196, 2.4), kind: 'detail', fill: 'speck' },
    { d: circle(96, 46, 2.6), kind: 'detail', fill: 'speck' },
    { d: ellipse(128, 84, 9, 5.5), kind: 'feature', fill: 'blush', opacity: 0.5 },
    { d: circle(118, 58, 12.5), kind: 'feature', fill: 'eye' },
    { d: circle(122.6, 53, 4.7), kind: 'feature', fill: 'shine' },
    { d: curve(180, 77, 190, 74, 3), kind: 'line', stroke: 'mouth', width: 2.6 },
  ];
}

const dorsalFin: PartNode = {
  id: 'dorsalFin',
  behind: true,
  pivot: [68, 174],
  motion: { rotate: 6, freq: 4 },
  shapes: [
    {
      d: smooth([
        [72, 138],
        [54, 140],
        [40, 148],
        [36, 160],
        [30, 172],
        [34, 186],
        [32, 198],
        [44, 208],
        [60, 210],
        [74, 206],
      ]),
      fill: 'fin',
    },
    ...FIN_RAYS.map((ray): Shape => ({
      d: poly(ray, false),
      kind: 'line',
      stroke: 'finLine',
      width: 2,
    })),
  ],
};

const offset = (parts: PartNode[], dx: number, dy: number): PartNode[] =>
  parts.map((p): PartNode => {
    const move = (list: Shape[]) => list.map((s) => ({ ...s, d: translatePath(s.d, dx, dy) }));
    const frames = p.frames;
    return {
      ...p,
      pivot: p.pivot && [p.pivot[0] + dx, p.pivot[1] + dy],
      shapes: p.shapes && move(p.shapes),
      frames: frames && ((phase: number) => move(frames(phase))),
      children: p.children && offset(p.children, dx, dy),
    };
  });

const seahorse: AnimalDef = {
  id: 'seahorse',
  name: 'Seahorse',
  kind: 'animal',
  aliases: ['sea horse', 'sea pony'],
  group: 'fish',
  habitats: ['ocean'],
  box: [196, 306],
  size: 110,
  locomotion: 'float',
  sound: 'seahorse',
  palette: {
    body: '#ffb43c',
    belly: '#ffe18c',
    ridge: '#f39b30',
    crown: '#ff8a3a',
    speck: '#fff3cc',
    fin: '#fff0b8',
    finLine: '#f3c25c',
  },
  parts: offset(
    [
      {
        id: 'body',
        pivot: [104, 150],
        frames: bodyShapes,
        children: [dorsalFin],
      },
    ],
    -16,
    6,
  ),
};

export default seahorse;
