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

const HIP = 200;
const GROUND = 304;
const CX = 264;

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

const leg = (id: string, x: number, far: boolean): PartNode => ({
  id,
  role: id,
  behind: true,
  pivot: [x, HIP],
  shapes: [
    { d: capsule(x, HIP, x, GROUND - 22, 13, 8.5), fill: far ? 'furFar' : 'fur' },
    { d: hoof(x, GROUND - 20, GROUND, 16, 19), fill: far ? 'hoofFar' : 'hoof' },
  ],
});

const SPOTS: [number, number, number][] = [
  [100, 152, 6],
  [126, 148, 6.5],
  [152, 147, 6.5],
  [178, 148, 6.5],
  [203, 153, 6],
  [88, 172, 5],
  [113, 168, 5.5],
  [139, 167, 5.5],
  [165, 167, 5.5],
  [191, 170, 5.5],
  [214, 175, 4.5],
  [127, 186, 4],
  [178, 187, 4],
];

const spots: Shape[] = SPOTS.map(([x, y, r]) => ({
  d: ellipse(x, y, r * 1.18, r * 0.92, -6),
  kind: 'detail',
  fill: 'spot',
}));

const mirror =
  (side: number) =>
  (pts: Pt[]): Pt[] =>
    pts.map(([x, y]): Pt => [CX + side * (x - CX), y]);

const antler = (side: number): Shape[] => {
  const m = mirror(side);
  return [
    {
      d: tube(
        m([
          [254, 60],
          [247, 42],
          [236, 30],
          [223, 22],
        ]),
        (t) => 6 - 2.4 * t,
        40,
      ),
      fill: 'antler',
    },
    {
      d: tube(
        m([
          [242, 37],
          [243, 24],
          [246, 11],
        ]),
        (t) => 4.6 - 1.3 * t,
        30,
      ),
      fill: 'antler',
    },
  ];
};

const ear = (id: string, x: number, angle: number, rotate: number): PartNode => ({
  id,
  behind: true,
  pivot: [x, 68],
  motion: { rotate, freq: 2, phase: 0.3 },
  shapes: [
    { d: leaf(x, 72, 60, 21, angle), fill: 'fur' },
    { d: leaf(x + (angle > 90 ? -4 : 4), 71, 43, 10.5, angle), kind: 'detail', fill: 'earInner' },
  ],
});

const NECK: Pt[] = [
  [214, 190],
  [230, 162],
  [246, 136],
  [258, 112],
];

const offset = (parts: PartNode[], dx: number, dy: number): PartNode[] =>
  parts.map((p): PartNode => ({
    ...p,
    pivot: p.pivot && [p.pivot[0] + dx, p.pivot[1] + dy],
    shapes: p.shapes?.map((s) => ({ ...s, d: translatePath(s.d, dx, dy) })),
    children: p.children && offset(p.children, dx, dy),
  }));

const grow = (parts: PartNode[], k: number, [ox, oy]: Pt): PartNode[] =>
  parts.map((p): PartNode => ({
    ...p,
    pivot: p.pivot && [ox + (p.pivot[0] - ox) * k, oy + (p.pivot[1] - oy) * k],
    shapes: p.shapes?.map((s) => ({ ...s, d: scalePath(s.d, k, k, ox, oy) })),
    children: p.children && grow(p.children, k, [ox, oy]),
  }));

const deer: AnimalDef = {
  id: 'deer',
  name: 'Deer',
  kind: 'animal',
  aliases: ['fawn', 'doe', 'stag', 'buck', 'bambi'],
  group: 'mammal',
  habitats: ['forest'],
  box: [316, GROUND + 4],
  size: 240,
  locomotion: 'walk4',
  gait: { stride: 124, swing: 18 },
  sound: 'deer',
  palette: {
    fur: '#c47d45',
    furFar: '#a7663a',
    cream: '#fff4e3',
    spot: '#fffaf0',
    muzzle: '#fff3e2',
    earInner: '#f6c3b1',
    antler: '#f0dcb8',
    hoof: '#4a362c',
    hoofFar: '#3a2b24',
    nose: '#2f211d',
  },
  parts: offset(
    [
      {
        id: 'body',
        role: 'body',
        pivot: [150, HIP],
        shapes: [
          {
            d: smooth([
              [240, 172],
              [230, 148],
              [200, 136],
              [152, 138],
              [108, 136],
              [76, 146],
              [60, 170],
              [64, 198],
              [90, 216],
              [142, 222],
              [194, 218],
              [230, 202],
            ]),
            fill: 'fur',
          },
          { d: ellipse(150, 226, 84, 18), kind: 'detail', fill: 'cream' },
          { d: ellipse(238, 196, 13, 22, -10), kind: 'detail', fill: 'cream' },
          { d: ellipse(64, 182, 13, 21), kind: 'detail', fill: 'cream' },
          ...spots,
        ],
        children: [
          {
            id: 'tail',
            role: 'tail',
            pivot: [68, 158],
            behind: true,
            motion: { rotate: 16, freq: 2, phase: 0.25 },
            shapes: [
              { d: leaf(70, 160, 32, 10, 222), fill: 'fur' },
              { d: leaf(70, 165, 26, 6, 222), kind: 'detail', fill: 'cream' },
            ],
          },
          leg('legBF', 104, true),
          leg('legFF', 218, true),
          leg('legBN', 82, false),
          leg('legFN', 196, false),
          {
            id: 'neck',
            role: 'neck',
            pivot: [216, 188],
            behind: true,
            motion: { rotate: 3, phase: 0.05 },
            shapes: [
              { d: tube(NECK, (t) => 23 - 7 * t), fill: 'fur' },
              { d: ellipse(258, 140, 11, 16, 30), kind: 'detail', fill: 'cream' },
            ],
            children: grow(
              [
                {
                  id: 'head',
                  role: 'head',
                  pivot: [258, 114],
                  shapes: [
                    {
                      d: smooth([
                        [CX, 40],
                        [296, 45],
                        [315, 68],
                        [313, 100],
                        [299, 127],
                        [281, 144],
                        [CX, 149],
                        [247, 144],
                        [229, 127],
                        [215, 100],
                        [213, 68],
                        [232, 45],
                      ]),
                      fill: 'fur',
                    },
                    { d: ellipse(CX, 132, 26, 19), kind: 'detail', fill: 'muzzle' },
                    { d: ellipse(228, 112, 9.5, 6), kind: 'feature', fill: 'blush', opacity: 0.55 },
                    { d: ellipse(300, 112, 9.5, 6), kind: 'feature', fill: 'blush', opacity: 0.55 },
                    { d: circle(244, 90, 11), kind: 'feature', fill: 'eye' },
                    { d: circle(284, 90, 11), kind: 'feature', fill: 'eye' },
                    { d: circle(248, 86, 4.2), kind: 'feature', fill: 'shine' },
                    { d: circle(288, 86, 4.2), kind: 'feature', fill: 'shine' },
                    {
                      d: `M${CX - 9} 120Q${CX} 115 ${CX + 9} 120Q${CX + 8} 127 ${CX} 130Q${CX - 8} 127 ${CX - 9} 120Z`,
                      kind: 'feature',
                      fill: 'nose',
                    },
                    {
                      d: `M${CX} 130Q${CX} 137 ${CX - 7} 139`,
                      kind: 'line',
                      stroke: 'mouth',
                      width: 2.7,
                    },
                    {
                      d: `M${CX} 130Q${CX} 137 ${CX + 7} 139`,
                      kind: 'line',
                      stroke: 'mouth',
                      width: 2.7,
                    },
                  ],
                  children: [
                    {
                      id: 'antlers',
                      behind: true,
                      pivot: [CX, 56],
                      shapes: [...antler(1), ...antler(-1)],
                    },
                    ear('earL', 233, 198, 6),
                    ear('earR', 295, -18, -6),
                  ],
                },
              ],
              1.08,
              [262, 146],
            ),
          },
        ],
      },
    ],
    -44,
    4,
  ),
};

export default deer;
