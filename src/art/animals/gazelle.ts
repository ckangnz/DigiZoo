import {
  capsule,
  circle,
  ellipse,
  leaf,
  smooth,
  spline,
  translatePath,
  tube,
  type Pt,
} from '../core/paths';
import type { AnimalDef, PartNode, Shape } from '../core/types';

const hoof = (x: number, top: number, bottom: number, wTop: number, wBot: number): string => {
  const t = wTop / 2;
  const b = wBot / 2;
  const mid = top + (bottom - top) * 0.45;
  return (
    `M${x - t} ${top}Q${x} ${top - 3} ${x + t} ${top}Q${x + b} ${mid} ${x + b} ${bottom - 3}` +
    `Q${x + b} ${bottom} ${x + b - 3} ${bottom}L${x - b + 3} ${bottom}Q${x - b} ${bottom} ${x - b} ${bottom - 3}` +
    `Q${x - b} ${mid} ${x - t} ${top}Z`
  );
};

const HIP = 198;

const leg = (id: string, x: number, far: boolean): PartNode => ({
  id,
  role: id,
  behind: true,
  pivot: [x, HIP],
  shapes: [
    { d: capsule(x, HIP, x, 280, 12, 7), fill: far ? 'coatFar' : 'coat' },
    { d: hoof(x, 282, 298, 15, 18), fill: far ? 'hoofFar' : 'hoof' },
  ],
});

const ringedHorn = (pts: Pt[], fill: string): Shape[] => {
  const line = spline(pts, 40);
  const rings = [0.22, 0.36, 0.5, 0.64].map((t): Shape => {
    const i = Math.round(t * (line.length - 1));
    const a = line[Math.max(0, i - 1)];
    const b = line[Math.min(line.length - 1, i + 1)];
    const angle = (Math.atan2(b[1] - a[1], b[0] - a[0]) * 180) / Math.PI;
    return { d: ellipse(line[i][0], line[i][1], 1.6, 10, angle), kind: 'detail', fill: 'hornRing' };
  });
  return [{ d: tube(pts, (t) => 6.5 - 4 * t, 40), fill }, ...rings];
};

const NECK: Pt[] = [
  [214, 188],
  [230, 160],
  [246, 132],
  [258, 108],
];

const offset = (parts: PartNode[], dx: number, dy: number): PartNode[] =>
  parts.map((p): PartNode => ({
    ...p,
    pivot: p.pivot && [p.pivot[0] + dx, p.pivot[1] + dy],
    shapes: p.shapes?.map((s) => ({ ...s, d: translatePath(s.d, dx, dy) })),
    children: p.children && offset(p.children, dx, dy),
  }));

const gazelle: AnimalDef = {
  id: 'gazelle',
  name: 'Gazelle',
  kind: 'animal',
  aliases: ['thomsons gazelle', 'tommy', 'antelope', 'deer', 'springbok'],
  group: 'mammal',
  habitats: ['safari'],
  box: [300, 300],
  size: 200,
  locomotion: 'walk4',
  gait: { stride: 124, swing: 18 },
  sound: 'gazelle',
  palette: {
    coat: '#e0a364',
    coatFar: '#c78a4f',
    belly: '#fffaf1',
    stripe: '#4a3427',
    blaze: '#c98a4f',
    horn: '#6e5d50',
    hornRing: '#45392f',
    muzzle: '#fff3e2',
    earInner: '#f4c2b0',
    hoof: '#4a3a31',
    hoofFar: '#3b2e27',
    nose: '#3e2c25',
  },
  parts: offset(
    [
      {
        id: 'body',
        role: 'body',
        pivot: [148, HIP],
        shapes: [
          {
            d: smooth([
              [238, 170],
              [228, 146],
              [198, 136],
              [152, 138],
              [110, 136],
              [78, 146],
              [62, 170],
              [66, 196],
              [92, 214],
              [142, 220],
              [192, 216],
              [228, 200],
            ]),
            fill: 'coat',
          },
          {
            d: smooth([
              [50, 198],
              [100, 190],
              [160, 192],
              [222, 186],
              [256, 194],
              [256, 240],
              [50, 240],
            ]),
            kind: 'detail',
            fill: 'belly',
          },
          {
            d: tube(
              [
                [70, 196],
                [112, 189],
                [170, 191],
                [232, 186],
              ],
              4.6,
            ),
            kind: 'detail',
            fill: 'stripe',
          },
          { d: ellipse(68, 184, 15, 24), kind: 'detail', fill: 'belly' },
        ],
        children: [
          {
            id: 'tail',
            role: 'tail',
            pivot: [64, 162],
            behind: true,
            motion: { rotate: 18, freq: 2, phase: 0.25 },
            shapes: [{ d: leaf(66, 160, 30, 7, 116), fill: 'stripe' }],
          },
          leg('legBF', 100, true),
          leg('legFF', 214, true),
          leg('legBN', 78, false),
          leg('legFN', 192, false),
          {
            id: 'neck',
            role: 'neck',
            pivot: [216, 186],
            behind: true,
            motion: { rotate: 3, phase: 0.05 },
            shapes: [{ d: tube(NECK, (t) => 22 - 7 * t), fill: 'coat' }],
            children: [
              {
                id: 'head',
                role: 'head',
                pivot: [258, 112],
                shapes: [
                  {
                    d: smooth([
                      [264, 42],
                      [292.6, 48.6],
                      [308, 72.8],
                      [303.6, 101.4],
                      [290.4, 125.6],
                      [275, 138.8],
                      [253, 138.8],
                      [237.6, 125.6],
                      [224.4, 101.4],
                      [220, 72.8],
                      [235.4, 48.6],
                    ]),
                    fill: 'coat',
                  },
                  {
                    d: tube(
                      [
                        [264, 44.2],
                        [264, 75],
                        [264, 110.2],
                      ],
                      (t) => 6.6 + 3.3 * t,
                    ),
                    kind: 'detail',
                    fill: 'blaze',
                  },
                  { d: ellipse(264, 124.5, 23.1, 16.5), kind: 'detail', fill: 'muzzle' },
                  {
                    d: ellipse(233.2, 105.8, 9.4, 6),
                    kind: 'feature',
                    fill: 'blush',
                    opacity: 0.55,
                  },
                  {
                    d: ellipse(294.8, 105.8, 9.4, 6),
                    kind: 'feature',
                    fill: 'blush',
                    opacity: 0.55,
                  },
                  { d: circle(246.4, 81.6, 10.5), kind: 'feature', fill: 'eye' },
                  { d: circle(281.6, 81.6, 10.5), kind: 'feature', fill: 'eye' },
                  { d: circle(250.2, 77.6, 4), kind: 'feature', fill: 'shine' },
                  { d: circle(285.4, 77.6, 4), kind: 'feature', fill: 'shine' },
                  {
                    d: 'M256.3 113.5Q264 109.1 271.7 113.5Q270.6 120.1 264 122.3Q257.4 120.1 256.3 113.5Z',
                    kind: 'feature',
                    fill: 'nose',
                  },
                  {
                    d: 'M264 122.3Q264 128.9 257.4 131.1',
                    kind: 'line',
                    stroke: 'mouth',
                    width: 2.7,
                  },
                  {
                    d: 'M264 122.3Q264 128.9 270.6 131.1',
                    kind: 'line',
                    stroke: 'mouth',
                    width: 2.7,
                  },
                ],
                children: [
                  {
                    id: 'horns',
                    behind: true,
                    pivot: [264, 56],
                    shapes: [
                      ...ringedHorn(
                        [
                          [254, 60],
                          [246, 40],
                          [246, 21],
                          [252, 5],
                        ],
                        'horn',
                      ),
                      ...ringedHorn(
                        [
                          [274, 60],
                          [282, 40],
                          [282, 21],
                          [276, 5],
                        ],
                        'horn',
                      ),
                    ],
                  },
                  {
                    id: 'earL',
                    behind: true,
                    pivot: [233.2, 59.6],
                    motion: { rotate: 6, freq: 2, phase: 0.3 },
                    shapes: [
                      { d: leaf(235.4, 61.8, 50.6, 15.4, 204), fill: 'coat' },
                      { d: leaf(231, 60.7, 35.2, 7.7, 204), kind: 'detail', fill: 'earInner' },
                    ],
                  },
                  {
                    id: 'earR',
                    behind: true,
                    pivot: [294.8, 59.6],
                    motion: { rotate: -6, freq: 2, phase: 0.3 },
                    shapes: [
                      { d: leaf(292.6, 61.8, 50.6, 15.4, -24), fill: 'coat' },
                      { d: leaf(297, 60.7, 35.2, 7.7, -24), kind: 'detail', fill: 'earInner' },
                    ],
                  },
                ],
              },
            ],
          },
        ],
      },
    ],
    -43,
    0,
  ),
};

export default gazelle;
