import { capsule, circle, ellipse, smooth, translatePath } from '../core/paths';
import type { AnimalDef, PartNode, Shape } from '../core/types';

const HIP = 186;

const toes = (x: number): Shape[] =>
  [-9, 3, 15].map((dx) => ({
    d: `M${x + dx} 268L${x + dx + 1} 277`,
    kind: 'line' as const,
    stroke: 'toe',
    width: 2.6,
  }));

const leg = (id: string, x: number, far: boolean): PartNode => ({
  id,
  role: id,
  behind: true,
  pivot: [x, HIP],
  shapes: [
    { d: capsule(x, HIP, x + 3, 248, 28, 23), fill: far ? 'furFar' : 'fur' },
    { d: ellipse(x + 7, 264, 33, 16), fill: far ? 'furFar' : 'fur' },
    ...(far
      ? []
      : [
          { d: ellipse(x - 24, 226, 9, 46), kind: 'detail' as const, fill: 'furShade' },
          ...toes(x + 7),
        ]),
  ],
});

const offset = (parts: PartNode[], dx: number, dy: number): PartNode[] =>
  parts.map((p): PartNode => ({
    ...p,
    pivot: p.pivot && [p.pivot[0] + dx, p.pivot[1] + dy],
    shapes: p.shapes?.map((s) => ({ ...s, d: translatePath(s.d, dx, dy) })),
    children: p.children && offset(p.children, dx, dy),
  }));

const polarBear: AnimalDef = {
  id: 'polar-bear',
  name: 'Polar Bear',
  kind: 'animal',
  aliases: ['ice bear', 'white bear', 'snow bear', 'arctic bear', 'nanook'],
  group: 'mammal',
  habitats: ['polar'],
  box: [372, 280],
  size: 260,
  locomotion: 'walk4',
  gait: { period: 1.05, swing: 17, stride: 100 },
  sound: 'polar-bear',
  palette: {
    fur: '#fbf7ee',
    furShade: '#dbe4ef',
    furFar: '#d2dceb',
    muzzle: '#fffdf8',
    earInner: '#c7d2e2',
    nose: '#26232d',
    toe: '#aebbd0',
  },
  parts: offset(
    [
      {
        id: 'body',
        role: 'body',
        pivot: [188, 186],
        shapes: [
          {
            d: smooth([
              [70, 154],
              [80, 114],
              [112, 88],
              [160, 78],
              [210, 80],
              [254, 92],
              [286, 116],
              [306, 152],
              [298, 188],
              [266, 208],
              [216, 218],
              [166, 220],
              [122, 214],
              [90, 202],
              [72, 182],
            ]),
            fill: 'fur',
          },
          { d: ellipse(190, 232, 124, 34), kind: 'detail', fill: 'furShade' },
          { d: ellipse(118, 172, 44, 50, 12), kind: 'detail', fill: 'furShade' },
          { d: ellipse(126, 164, 42, 48, 12), kind: 'detail', fill: 'fur' },
        ],
        children: [
          {
            id: 'tail',
            role: 'tail',
            pivot: [76, 138],
            behind: true,
            shapes: [{ d: circle(68, 136, 14), fill: 'fur' }],
          },
          leg('legBF', 144, true),
          leg('legFF', 288, true),
          leg('legBN', 116, false),
          leg('legFN', 258, false),
          {
            id: 'head',
            role: 'head',
            pivot: [292, 170],
            shapes: [
              { d: circle(278, 90, 17), fill: 'fur' },
              { d: circle(366, 90, 17), fill: 'fur' },
              { d: ellipse(322, 140, 65, 58), fill: 'fur' },
              { d: circle(279, 91, 9), kind: 'detail', fill: 'earInner' },
              { d: circle(365, 91, 9), kind: 'detail', fill: 'earInner' },
              { d: ellipse(322, 198, 70, 22), kind: 'detail', fill: 'furShade' },
              { d: ellipse(276, 160, 11.5, 7), kind: 'feature', fill: 'blush', opacity: 0.55 },
              { d: ellipse(368, 160, 11.5, 7), kind: 'feature', fill: 'blush', opacity: 0.55 },
              { d: circle(297, 128, 10.5), kind: 'feature', fill: 'eye' },
              { d: circle(347, 128, 10.5), kind: 'feature', fill: 'eye' },
              { d: circle(301, 123.6, 4), kind: 'feature', fill: 'shine' },
              { d: circle(351, 123.6, 4), kind: 'feature', fill: 'shine' },
            ],
            children: [
              {
                id: 'muzzle',
                shapes: [
                  { d: ellipse(322, 164, 31, 23), fill: 'muzzle' },
                  {
                    d: 'M308 150Q322 142 336 150Q334 161 322 165Q310 161 308 150Z',
                    kind: 'feature',
                    fill: 'nose',
                  },
                  { d: ellipse(326, 149, 3.6, 2.2, -10), kind: 'feature', fill: 'shine' },
                  { d: 'M322 165Q322 174 313 177', kind: 'line', stroke: 'nose', width: 2.8 },
                  { d: 'M322 165Q322 174 331 177', kind: 'line', stroke: 'nose', width: 2.8 },
                ],
              },
            ],
          },
        ],
      },
    ],
    -34,
    0,
  ),
};

export default polarBear;
