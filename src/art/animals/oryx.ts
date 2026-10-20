import {
  capsule,
  circle,
  ellipse,
  leaf,
  scalePath,
  smooth,
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
    `M${x - t} ${top}Q${x} ${top - 3} ${x + t} ${top}Q${x + b} ${mid} ${x + b} ${bottom - 4}` +
    `Q${x + b} ${bottom} ${x + b - 4} ${bottom}L${x - b + 4} ${bottom}Q${x - b} ${bottom} ${x - b} ${bottom - 4}` +
    `Q${x - b} ${mid} ${x - t} ${top}Z`
  );
};

const HIP = 250;
const GROUND = 356;

const leg = (id: string, x: number, far: boolean): PartNode => ({
  id,
  role: id,
  behind: true,
  pivot: [x, HIP],
  shapes: [
    { d: capsule(x, HIP, x, GROUND - 26, 16, 11), fill: far ? 'coatFar' : 'coat' },
    { d: hoof(x, GROUND - 20, GROUND, 20, 23), fill: far ? 'markFar' : 'mark' },
    { d: ellipse(x, HIP + 20, 24, 26), kind: 'detail', fill: far ? 'markFar' : 'mark' },
  ],
});

const horn = (base: Pt, angle: number, length: number, fill: string): Shape[] => {
  const a = (angle * Math.PI) / 180;
  const pt = (k: number, bend: number): Pt => [
    base[0] + Math.cos(a) * length * k - Math.sin(a) * bend,
    base[1] + Math.sin(a) * length * k + Math.cos(a) * bend,
  ];
  const ring = (k: number): Shape => {
    const p = pt(k, 0);
    const w = 6.4 - 3 * k;
    return {
      d: `M${p[0] - Math.sin(a) * w} ${p[1] + Math.cos(a) * w}L${p[0] + Math.sin(a) * w} ${p[1] - Math.cos(a) * w}`,
      kind: 'line',
      stroke: 'hornRing',
      width: 2,
    };
  };
  return [
    {
      d: tube([pt(0, 0), pt(0.35, -2), pt(0.7, -3), pt(1, -2)], (t) => 7.4 - 4.6 * t, 40),
      fill,
    },
    ring(0.1),
    ring(0.18),
    ring(0.26),
  ];
};

const HEAD_PIVOT: Pt = [262, 146];
const hs = (d: string) => scalePath(d, 1.12, 1.12, HEAD_PIVOT[0], HEAD_PIVOT[1]);
const scaleShapes = (shapes: Shape[]): Shape[] => shapes.map((sh) => ({ ...sh, d: hs(sh.d) }));
const hp = ([x, y]: Pt): Pt => [
  HEAD_PIVOT[0] + (x - HEAD_PIVOT[0]) * 1.12,
  HEAD_PIVOT[1] + (y - HEAD_PIVOT[1]) * 1.12,
];

const offset = (parts: PartNode[], dx: number, dy: number): PartNode[] =>
  parts.map((p): PartNode => ({
    ...p,
    pivot: p.pivot && [p.pivot[0] + dx, p.pivot[1] + dy],
    shapes: p.shapes?.map((sh) => ({ ...sh, d: translatePath(sh.d, dx, dy) })),
    children: p.children && offset(p.children, dx, dy),
  }));

const oryx: AnimalDef = {
  id: 'oryx',
  name: 'Oryx',
  kind: 'animal',
  aliases: ['gemsbok', 'arabian oryx', 'antelope'],
  group: 'mammal',
  habitats: ['desert'],
  box: [330, 368],
  size: 260,
  locomotion: 'walk4',
  gait: { stride: 126, swing: 18 },
  sound: 'oryx',
  palette: {
    coat: '#f7efe1',
    coatFar: '#e6dccb',
    mark: '#3a3340',
    markFar: '#2d2833',
    horn: '#5e5566',
    hornFar: '#4a4352',
    hornRing: '#3b3441',
    eyeRing: '#ffffff',
    earInner: '#f0c3b5',
    nose: '#2f282f',
  },
  parts: offset(
    [
      {
        id: 'body',
        role: 'body',
        pivot: [150, 250],
        shapes: [
          {
            d: smooth([
              [78, 206],
              [102, 188],
              [140, 184],
              [180, 182],
              [210, 176],
              [226, 160],
              [248, 166],
              [256, 198],
              [246, 234],
              [222, 260],
              [176, 268],
              [130, 268],
              [94, 258],
              [72, 236],
            ]),
            fill: 'coat',
          },
          {
            d: tube(
              [
                [86, 238],
                [120, 248],
                [164, 250],
                [210, 244],
                [240, 230],
              ],
              (t) => 6 + 3 * Math.sin(Math.PI * t),
              40,
            ),
            kind: 'detail',
            fill: 'mark',
          },
        ],
        children: [
          {
            id: 'tail',
            role: 'tail',
            pivot: [78, 208],
            behind: true,
            shapes: [
              { d: capsule(78, 208, 62, 254, 5, 4), fill: 'coat' },
              { d: leaf(64, 242, 44, 9, 96), fill: 'mark' },
            ],
          },
          leg('legBF', 120, true),
          leg('legFF', 220, true),
          leg('legBN', 98, false),
          leg('legFN', 198, false),
          {
            id: 'neck',
            role: 'neck',
            pivot: [222, 196],
            behind: true,
            shapes: [
              {
                d: tube(
                  [
                    [218, 210],
                    [238, 182],
                    [254, 160],
                    [264, 146],
                  ],
                  (t) => 36 - 6 * t,
                  40,
                ),
                fill: 'coat',
              },
            ],
            children: [
              {
                id: 'head',
                role: 'head',
                pivot: HEAD_PIVOT,
                shapes: scaleShapes([
                  {
                    d: smooth([
                      [250, 122],
                      [276, 110],
                      [304, 116],
                      [326, 134],
                      [342, 156],
                      [338, 174],
                      [316, 180],
                      [290, 174],
                      [264, 164],
                      [246, 144],
                    ]),
                    fill: 'coat',
                  },
                  { d: capsule(270, 110, 284, 176, 12, 10), kind: 'detail', fill: 'mark' },
                  {
                    d: tube(
                      [
                        [280, 108],
                        [306, 114],
                        [328, 132],
                        [344, 154],
                      ],
                      7.5,
                      30,
                    ),
                    kind: 'detail',
                    fill: 'mark',
                  },
                  { d: ellipse(306, 166, 8.5, 5.5), kind: 'feature', fill: 'blush', opacity: 0.55 },
                  { d: circle(280, 140, 13.5), kind: 'feature', fill: 'eyeRing' },
                  { d: circle(280.5, 140, 10.5), kind: 'feature', fill: 'eye' },
                  { d: circle(284.4, 135.6, 4), kind: 'feature', fill: 'shine' },
                  { d: ellipse(338, 160, 4, 3, 40), kind: 'feature', fill: 'nose' },
                  { d: 'M318 173Q328 177 336 170', kind: 'line', stroke: 'mouth', width: 2.6 },
                ]),
                children: [
                  {
                    id: 'hornF',
                    behind: true,
                    pivot: hp([270, 120]),
                    shapes: scaleShapes(horn([270, 120], -126, 130, 'hornFar')),
                  },
                  {
                    id: 'hornN',
                    behind: true,
                    pivot: hp([258, 124]),
                    shapes: scaleShapes(horn([258, 124], -132, 132, 'horn')),
                  },
                  {
                    id: 'ear',
                    role: 'ear',
                    behind: true,
                    pivot: hp([254, 132]),
                    shapes: scaleShapes([
                      { d: leaf(258, 132, 40, 11, 168), fill: 'coat' },
                      { d: leaf(254, 132, 26, 5.5, 168), kind: 'detail', fill: 'earInner' },
                    ]),
                  },
                ],
              },
            ],
          },
        ],
      },
    ],
    -22,
    8,
  ),
};

export default oryx;
