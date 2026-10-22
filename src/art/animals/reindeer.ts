import {
  capsule,
  circle,
  curve,
  ellipse,
  leaf,
  mirrorPath,
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

const HIP = 258;
const GROUND = 336;

const leg = (id: string, x: number, far: boolean): PartNode => ({
  id,
  role: id,
  behind: true,
  pivot: [x, HIP],
  shapes: [
    { d: capsule(x, HIP, x, GROUND - 26, 14, 10.5), fill: far ? 'coatFar' : 'coat' },
    { d: ellipse(x, GROUND - 26, 13, 7), kind: 'detail', fill: far ? 'paleFar' : 'pale' },
    { d: hoof(x, GROUND - 22, GROUND, 22, 28), fill: far ? 'hoofFar' : 'hoof' },
    {
      d: `M${x} ${GROUND - 12}L${x} ${GROUND - 2}`,
      kind: 'line',
      stroke: far ? 'hoofFar' : 'hoofLine',
      width: 2.2,
    },
  ],
});

const ANTLER: Pt[][] = [
  [
    [252, 102],
    [238, 82],
    [220, 68],
    [200, 60],
    [182, 48],
    [172, 30],
    [172, 8],
  ],
  [
    [234, 78],
    [234, 58],
    [240, 40],
  ],
  [
    [206, 62],
    [204, 40],
    [210, 22],
  ],
  [
    [186, 52],
    [168, 50],
    [154, 40],
  ],
];

const antler = (mirror: boolean): Shape[] =>
  ANTLER.map((pts, i) => {
    const d = tube(pts, (t) => (i === 0 ? 8.5 - 3.2 * t : 6.4 - 2.4 * t), 40);
    return { d: mirror ? mirrorPath(d, 262) : d, fill: 'antler' };
  });

const HEAD_PIVOT: Pt = [258, 172];
const HEAD_SCALE = 1.12;

const grow = (parts: PartNode[]): PartNode[] =>
  parts.map((p): PartNode => ({
    ...p,
    pivot: p.pivot && [
      HEAD_PIVOT[0] + (p.pivot[0] - HEAD_PIVOT[0]) * HEAD_SCALE,
      HEAD_PIVOT[1] + (p.pivot[1] - HEAD_PIVOT[1]) * HEAD_SCALE,
    ],
    shapes: p.shapes?.map((sh) => ({
      ...sh,
      d: scalePath(sh.d, HEAD_SCALE, HEAD_SCALE, HEAD_PIVOT[0], HEAD_PIVOT[1]),
    })),
    children: p.children && grow(p.children),
  }));

const offset = (parts: PartNode[], dx: number, dy: number): PartNode[] =>
  parts.map((p): PartNode => ({
    ...p,
    pivot: p.pivot && [p.pivot[0] + dx, p.pivot[1] + dy],
    shapes: p.shapes?.map((s) => ({ ...s, d: translatePath(s.d, dx, dy) })),
    children: p.children && offset(p.children, dx, dy),
  }));

const BODY = smooth([
  [236, 214],
  [226, 190],
  [196, 180],
  [150, 182],
  [108, 180],
  [76, 192],
  [60, 216],
  [64, 246],
  [90, 266],
  [140, 272],
  [192, 268],
  [226, 250],
]);

const NECK = tube(
  [
    [206, 236],
    [226, 204],
    [242, 176],
    [254, 158],
  ],
  (t) => 32 - 8 * t,
  40,
);

const MANE = smooth([
  [266, 160],
  [272, 182],
  [262, 208],
  [252, 232],
  [254, 252],
  [242, 246],
  [238, 266],
  [226, 254],
  [216, 270],
  [208, 252],
  [196, 262],
  [196, 238],
  [208, 214],
  [226, 188],
  [244, 164],
]);

const HEAD = smooth([
  [262, 92],
  [288, 98],
  [304, 118],
  [306, 144],
  [296, 168],
  [282, 186],
  [262, 192],
  [242, 186],
  [228, 168],
  [218, 144],
  [220, 118],
  [236, 98],
]);

const reindeer: AnimalDef = {
  id: 'reindeer',
  name: 'Reindeer',
  kind: 'animal',
  aliases: ['rudolph', 'caribou', 'deer', 'christmas reindeer'],
  group: 'mammal',
  habitats: ['polar'],
  box: [360, 362],
  size: 250,
  locomotion: 'walk4',
  gait: { stride: 96, swing: 18 },
  sound: 'reindeer',
  palette: {
    coat: '#a0704a',
    coatFar: '#85593a',
    belly: '#c49a70',
    pale: '#f4ead9',
    paleFar: '#ddd0bb',
    maneLine: '#d9c6a8',
    muzzle: '#eadccb',
    antler: '#d6b585',
    earInner: '#f0c0b0',
    hoof: '#463730',
    hoofFar: '#382b25',
    hoofLine: '#2b201c',
    nose: '#3a2a26',
  },
  parts: offset(
    [
      {
        id: 'body',
        role: 'body',
        pivot: [150, HIP],
        shapes: [
          { d: NECK, fill: 'pale' },
          { d: BODY, fill: 'coat' },
          { d: ellipse(150, 282, 84, 22), kind: 'detail', fill: 'belly' },
          { d: ellipse(64, 224, 17, 28), kind: 'detail', fill: 'pale' },
          { d: MANE, fill: 'pale' },
          { d: curve(240, 194, 232, 222, 3), kind: 'line', stroke: 'maneLine', width: 2.2 },
          { d: curve(254, 184, 248, 212, 3), kind: 'line', stroke: 'maneLine', width: 2.2 },
          { d: curve(224, 224, 218, 248, 3), kind: 'line', stroke: 'maneLine', width: 2.2 },
          { d: curve(238, 230, 234, 252, 3), kind: 'line', stroke: 'maneLine', width: 2.2 },
        ],
        children: [
          {
            id: 'tail',
            role: 'tail',
            pivot: [64, 206],
            behind: true,
            shapes: [{ d: leaf(66, 204, 26, 12, 150), fill: 'pale' }],
          },
          leg('legBF', 114, true),
          leg('legFF', 218, true),
          leg('legBN', 92, false),
          leg('legFN', 196, false),
          ...grow([
            {
              id: 'head',
              role: 'head',
              pivot: HEAD_PIVOT,
              shapes: [
                { d: HEAD, fill: 'coat' },
                { d: ellipse(262, 178, 30, 20), kind: 'detail', fill: 'muzzle' },
                { d: ellipse(232, 160, 9, 6), kind: 'feature', fill: 'blush', opacity: 0.55 },
                { d: ellipse(292, 160, 9, 6), kind: 'feature', fill: 'blush', opacity: 0.55 },
                { d: circle(246, 136, 10.5), kind: 'feature', fill: 'eye' },
                { d: circle(278, 136, 10.5), kind: 'feature', fill: 'eye' },
                { d: circle(249.8, 132, 4), kind: 'feature', fill: 'shine' },
                { d: circle(281.8, 132, 4), kind: 'feature', fill: 'shine' },
                {
                  d: 'M251 164Q262 157 273 164Q272 173 262 176Q252 173 251 164Z',
                  kind: 'feature',
                  fill: 'nose',
                },
                {
                  d: ellipse(258, 162.6, 3.4, 2, -12),
                  kind: 'feature',
                  fill: 'shine',
                  opacity: 0.7,
                },
                { d: 'M262 176Q262 182 255 184', kind: 'line', stroke: 'mouth', width: 2.5 },
                { d: 'M262 176Q262 182 269 184', kind: 'line', stroke: 'mouth', width: 2.5 },
              ],
              children: [
                {
                  id: 'antlers',
                  behind: true,
                  pivot: [262, 100],
                  shapes: [...antler(false), ...antler(true)],
                },
                {
                  id: 'earL',
                  behind: true,
                  pivot: [232, 112],
                  motion: { rotate: 6, freq: 2, phase: 0.3 },
                  shapes: [
                    { d: leaf(236, 114, 46, 17, 196), fill: 'coat' },
                    { d: leaf(232, 113, 32, 8, 196), kind: 'detail', fill: 'earInner' },
                  ],
                },
                {
                  id: 'earR',
                  behind: true,
                  pivot: [292, 112],
                  motion: { rotate: -6, freq: 2, phase: 0.3 },
                  shapes: [
                    { d: leaf(288, 114, 46, 17, -16), fill: 'coat' },
                    { d: leaf(292, 113, 32, 8, -16), kind: 'detail', fill: 'earInner' },
                  ],
                },
              ],
            },
          ]),
        ],
      },
    ],
    -36,
    24,
  ),
};

export default reindeer;
