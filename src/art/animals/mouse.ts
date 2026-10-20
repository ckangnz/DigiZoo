import { capsule, circle, ellipse, smooth, translatePath, tube, type Pt } from '../core/paths';
import type { AnimalDef, PartNode } from '../core/types';

const HIP = 176;

const leg = (id: string, x: number, far: boolean): PartNode => ({
  id,
  role: id,
  behind: true,
  pivot: [x, HIP],
  shapes: [
    { d: capsule(x, HIP, x, 198, 8, 6.5), fill: far ? 'furFar' : 'fur' },
    { d: ellipse(x + 3, 203.5, 10, 5.5), fill: far ? 'feetFar' : 'feet' },
  ],
});

const TAIL: Pt[] = [
  [68, 160],
  [42, 170],
  [20, 162],
  [10, 140],
  [16, 118],
  [34, 106],
  [50, 112],
  [52, 128],
  [41, 134],
];

const offset = (parts: PartNode[], dx: number, dy: number): PartNode[] =>
  parts.map((p): PartNode => ({
    ...p,
    pivot: p.pivot && [p.pivot[0] + dx, p.pivot[1] + dy],
    shapes: p.shapes?.map((s) => ({ ...s, d: translatePath(s.d, dx, dy) })),
    children: p.children && offset(p.children, dx, dy),
  }));

const mouse: AnimalDef = {
  id: 'mouse',
  name: 'Mouse',
  kind: 'animal',
  aliases: ['mice', 'mousey', 'little mouse', 'squeak'],
  group: 'mammal',
  habitats: ['farm'],
  box: [290, 178],
  size: 60,
  locomotion: 'walk4',
  gait: { period: 0.55, stride: 46, swing: 22 },
  sound: 'mouse',
  palette: {
    fur: '#b0abb8',
    furFar: '#9993a3',
    belly: '#ebe7ef',
    earInner: '#ffb3c4',
    feet: '#ffb3c4',
    feetFar: '#ee9fb1',
    tail: '#f4b2c0',
    nose: '#f4889f',
    whisker: '#7f7889',
  },
  parts: offset(
    [
      {
        id: 'body',
        role: 'body',
        pivot: [134, 176],
        shapes: [
          {
            d: smooth([
              [70, 168],
              [64, 140],
              [80, 116],
              [112, 104],
              [150, 106],
              [184, 118],
              [204, 140],
              [204, 166],
              [186, 186],
              [150, 196],
              [110, 196],
              [82, 188],
            ]),
            fill: 'fur',
          },
          { d: ellipse(140, 198, 58, 18), kind: 'detail', fill: 'belly' },
        ],
        children: [
          {
            id: 'tail',
            role: 'tail',
            pivot: [68, 160],
            behind: true,
            shapes: [{ d: tube(TAIL, (t) => 4.6 - 2.2 * t, 110), fill: 'tail' }],
          },
          leg('legBF', 98, true),
          leg('legFF', 176, true),
          leg('legBN', 82, false),
          leg('legFN', 160, false),
          {
            id: 'head',
            role: 'head',
            pivot: [210, 150],
            shapes: [
              {
                d: smooth([
                  [222, 66],
                  [252, 74],
                  [268, 100],
                  [264, 128],
                  [248, 148],
                  [222, 158],
                  [196, 148],
                  [180, 128],
                  [176, 100],
                  [192, 74],
                ]),
                fill: 'fur',
              },
              { d: ellipse(222, 140, 22, 15), kind: 'detail', fill: 'belly' },
              { d: ellipse(194, 128, 8.5, 5.4), kind: 'feature', fill: 'blush', opacity: 0.6 },
              { d: ellipse(250, 128, 8.5, 5.4), kind: 'feature', fill: 'blush', opacity: 0.6 },
              { d: circle(206, 108, 9), kind: 'feature', fill: 'eye' },
              { d: circle(238, 108, 9), kind: 'feature', fill: 'eye' },
              { d: circle(209.2, 104.6, 3.4), kind: 'feature', fill: 'shine' },
              { d: circle(241.2, 104.6, 3.4), kind: 'feature', fill: 'shine' },
              { d: circle(222, 133, 6), kind: 'feature', fill: 'nose', stroke: 'auto', width: 1.6 },
              {
                d: 'M222 139Q222 146 215 148Q210 148 208 144',
                kind: 'line',
                stroke: 'mouth',
                width: 2.4,
              },
              {
                d: 'M222 139Q222 146 229 148Q234 148 236 144',
                kind: 'line',
                stroke: 'mouth',
                width: 2.4,
              },
              { d: 'M206 134L178 128', kind: 'line', stroke: 'whisker', width: 2 },
              { d: 'M206 140L177 143', kind: 'line', stroke: 'whisker', width: 2 },
              { d: 'M238 134L266 128', kind: 'line', stroke: 'whisker', width: 2 },
              { d: 'M238 140L267 143', kind: 'line', stroke: 'whisker', width: 2 },
            ],
            children: [
              {
                id: 'earF',
                role: 'earF',
                behind: true,
                pivot: [194, 84],
                shapes: [
                  { d: circle(186, 70, 30), fill: 'fur' },
                  { d: circle(187, 72, 19), kind: 'detail', fill: 'earInner' },
                ],
              },
              {
                id: 'earN',
                role: 'earN',
                behind: true,
                pivot: [250, 84],
                shapes: [
                  { d: circle(258, 70, 30), fill: 'fur' },
                  { d: circle(257, 72, 19), kind: 'detail', fill: 'earInner' },
                ],
              },
            ],
          },
        ],
      },
    ],
    0,
    -32,
  ),
};

export default mouse;
