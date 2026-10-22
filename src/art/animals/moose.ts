import {
  capsule,
  circle,
  ellipse,
  f,
  leaf,
  mirrorPath,
  smooth,
  scalePath,
  translatePath,
  type Pt,
} from '../core/paths';
import type { AnimalDef, PartNode } from '../core/types';

const roundPoly = (pts: Pt[], radii: number[]): string => {
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

const HIP = 268;
const GROUND = 410;
const FACE_X = 300;

const leg = (id: string, x: number, far: boolean): PartNode => ({
  id,
  role: id,
  behind: true,
  pivot: [x, HIP],
  shapes: [
    { d: capsule(x, HIP - 6, x, GROUND - 28, 19, 12.5), fill: far ? 'legFar' : 'leg' },
    { d: hoof(x, GROUND - 24, GROUND, 27, 31), fill: far ? 'hoofFar' : 'hoof' },
    { d: ellipse(x, HIP + 4, 28, 34), kind: 'detail', fill: far ? 'furFar' : 'fur' },
    ...(far
      ? []
      : [
          {
            d: `M${x + 1} ${GROUND - 15}L${x + 1} ${GROUND - 3}`,
            kind: 'line' as const,
            stroke: 'hoofLine',
            width: 2.6,
          },
        ]),
  ],
});

const ANTLER = roundPoly(
  [
    [326, 116],
    [320, 100],
    [342, 84],
    [334, 52],
    [351, 66],
    [356, 30],
    [369, 58],
    [382, 30],
    [390, 60],
    [406, 42],
    [406, 72],
    [422, 70],
    [414, 96],
    [390, 110],
    [360, 112],
    [342, 118],
  ],
  [4, 4, 12, 5, 6, 5, 6, 5, 6, 5, 6, 5, 18, 22, 16, 8],
);

const ANTLER_SHADE = smooth([
  [344, 108],
  [372, 100],
  [404, 96],
  [418, 100],
  [398, 114],
  [362, 118],
]);

const offset = (parts: PartNode[], dx: number, dy: number): PartNode[] =>
  parts.map((p): PartNode => ({
    ...p,
    pivot: p.pivot && [p.pivot[0] + dx, p.pivot[1] + dy],
    shapes: p.shapes?.map((s) => ({ ...s, d: translatePath(s.d, dx, dy) })),
    children: p.children && offset(p.children, dx, dy),
  }));

const grow = (parts: PartNode[], k: number, cx: number, cy: number): PartNode[] =>
  parts.map((p): PartNode => ({
    ...p,
    pivot: p.pivot && [cx + (p.pivot[0] - cx) * k, cy + (p.pivot[1] - cy) * k],
    shapes: p.shapes?.map((s) => ({
      ...s,
      d: scalePath(s.d, k, k, cx, cy),
      width: s.width && s.width * k,
    })),
    children: p.children && grow(p.children, k, cx, cy),
  }));

const EAR = leaf(268, 128, 44, 13, 170);
const EAR_INNER = leaf(264, 128, 30, 6.5, 170);

const moose: AnimalDef = {
  id: 'moose',
  name: 'Moose',
  kind: 'animal',
  aliases: ['elk', 'bull moose', 'eurasian elk'],
  group: 'mammal',
  habitats: ['forest', 'polar'],
  box: [424, GROUND],
  size: 300,
  locomotion: 'walk4',
  gait: { period: 1.05, stride: 150, swing: 16 },
  sound: 'moose',
  palette: {
    fur: '#7b5134',
    furFar: '#66412a',
    leg: '#c4a98c',
    legFar: '#aa8e73',
    muzzle: '#9a6a48',
    nostril: '#3e271c',
    antler: '#f0deb6',
    antlerDark: '#d6bd8e',
    earInner: '#c8977a',
    hoof: '#3b2d28',
    hoofFar: '#30241f',
    hoofLine: '#241a16',
  },
  parts: offset(
    [
      {
        id: 'body',
        role: 'body',
        pivot: [176, HIP],
        shapes: [
          {
            d: smooth([
              [70, 196],
              [92, 174],
              [130, 166],
              [176, 160],
              [214, 144],
              [244, 132],
              [270, 140],
              [290, 170],
              [296, 210],
              [288, 250],
              [262, 282],
              [210, 292],
              [150, 292],
              [100, 286],
              [70, 266],
              [58, 232],
            ]),
            fill: 'fur',
          },
        ],
        children: [
          {
            id: 'tail',
            role: 'tail',
            pivot: [64, 196],
            behind: true,
            shapes: [{ d: leaf(66, 194, 32, 9, 160), fill: 'fur' }],
          },
          leg('legBF', 128, true),
          leg('legFF', 268, true),
          leg('legBN', 104, false),
          leg('legFN', 244, false),
          ...grow(
            [
              {
                id: 'head',
                role: 'head',
                pivot: [280, 200],
                shapes: [
                  {
                    d: smooth([
                      [FACE_X, 94],
                      [326, 98],
                      [340, 116],
                      [342, 142],
                      [348, 170],
                      [354, 198],
                      [346, 224],
                      [324, 238],
                      [FACE_X, 242],
                      [276, 238],
                      [254, 224],
                      [246, 198],
                      [252, 170],
                      [258, 142],
                      [260, 116],
                      [274, 98],
                    ]),
                    fill: 'fur',
                  },
                  {
                    d: smooth([
                      [250, 186],
                      [270, 170],
                      [FACE_X, 166],
                      [330, 170],
                      [350, 186],
                      [356, 212],
                      [340, 238],
                      [FACE_X, 248],
                      [260, 238],
                      [244, 212],
                    ]),
                    kind: 'detail',
                    fill: 'muzzle',
                  },
                  { d: ellipse(264, 160, 9, 6), kind: 'feature', fill: 'blush', opacity: 0.55 },
                  { d: ellipse(336, 160, 9, 6), kind: 'feature', fill: 'blush', opacity: 0.55 },
                  { d: circle(280, 134, 10), kind: 'feature', fill: 'eye' },
                  { d: circle(320, 134, 10), kind: 'feature', fill: 'eye' },
                  { d: circle(283.6, 130, 3.8), kind: 'feature', fill: 'shine' },
                  { d: circle(323.6, 130, 3.8), kind: 'feature', fill: 'shine' },
                  { d: ellipse(286, 204, 6, 8.5, 18), kind: 'feature', fill: 'nostril' },
                  { d: ellipse(314, 204, 6, 8.5, -18), kind: 'feature', fill: 'nostril' },
                  { d: 'M284 226Q300 234 316 226', kind: 'line', stroke: 'mouth', width: 3 },
                ],
                children: [
                  {
                    id: 'dewlap',
                    behind: true,
                    pivot: [FACE_X, 236],
                    motion: { rotate: 7, phase: 0.3 },
                    shapes: [
                      {
                        d: smooth([
                          [288, 232],
                          [312, 232],
                          [314, 256],
                          [306, 282],
                          [FACE_X, 288],
                          [294, 282],
                          [286, 256],
                        ]),
                        fill: 'fur',
                      },
                    ],
                  },
                  {
                    id: 'earN',
                    role: 'earN',
                    behind: true,
                    pivot: [262, 124],
                    shapes: [
                      { d: EAR, fill: 'fur' },
                      { d: EAR_INNER, kind: 'detail', fill: 'earInner' },
                    ],
                  },
                  {
                    id: 'earF',
                    role: 'earF',
                    behind: true,
                    pivot: [338, 124],
                    shapes: [
                      { d: mirrorPath(EAR, FACE_X), fill: 'fur' },
                      { d: mirrorPath(EAR_INNER, FACE_X), kind: 'detail', fill: 'earInner' },
                    ],
                  },
                  {
                    id: 'antlers',
                    behind: true,
                    pivot: [FACE_X, 100],
                    shapes: [
                      { d: ANTLER, fill: 'antler' },
                      { d: mirrorPath(ANTLER, FACE_X), fill: 'antler' },
                      { d: ANTLER_SHADE, kind: 'detail', fill: 'antlerDark' },
                      { d: mirrorPath(ANTLER_SHADE, FACE_X), kind: 'detail', fill: 'antlerDark' },
                    ],
                  },
                ],
              },
            ],
            1.14,
            280,
            200,
          ),
        ],
      },
    ],
    -20,
    0,
  ),
};

export default moose;
