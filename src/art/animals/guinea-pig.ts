import { capsule, circle, ellipse, smooth, translatePath } from '../core/paths';
import type { AnimalDef, PartNode } from '../core/types';

const HIP = 160;

const leg = (id: string, x: number, far: boolean): PartNode => ({
  id,
  role: id,
  behind: true,
  pivot: [x, HIP],
  shapes: [
    { d: capsule(x, HIP, x + 1, 178, 11, 9.5), fill: far ? 'furFar' : 'fur' },
    { d: ellipse(x + 5, 183, 12.5, 6.5), fill: far ? 'feetFar' : 'feet' },
  ],
});

const offset = (parts: PartNode[], dx: number, dy: number): PartNode[] =>
  parts.map((p): PartNode => ({
    ...p,
    pivot: p.pivot && [p.pivot[0] + dx, p.pivot[1] + dy],
    shapes: p.shapes?.map((s) => ({ ...s, d: translatePath(s.d, dx, dy) })),
    children: p.children && offset(p.children, dx, dy),
  }));

const guineaPig: AnimalDef = {
  id: 'guinea-pig',
  name: 'Guinea Pig',
  kind: 'animal',
  aliases: ['cavy', 'cavies', 'guinea'],
  group: 'mammal',
  habitats: ['pets'],
  box: [292, 150],
  size: 80,
  locomotion: 'walk4',
  gait: { period: 0.6, stride: 34, swing: 18 },
  sound: 'guinea-pig',
  palette: {
    fur: '#fffaf2',
    furFar: '#ece2d6',
    ginger: '#f19a45',
    patch: '#433a3f',
    earInner: '#c08a92',
    feet: '#f8c4bd',
    feetFar: '#e6aaa4',
    nose: '#e98a9b',
    whisker: '#b3a297',
  },
  parts: offset(
    [
      {
        id: 'body',
        role: 'body',
        pivot: [140, 166],
        shapes: [
          {
            d: smooth([
              [30, 140],
              [32, 102],
              [54, 72],
              [98, 56],
              [150, 54],
              [196, 62],
              [226, 86],
              [236, 120],
              [226, 152],
              [196, 170],
              [140, 176],
              [84, 174],
              [46, 162],
            ]),
            fill: 'fur',
          },
          {
            d: smooth([
              [20, 70],
              [70, 46],
              [104, 52],
              [112, 84],
              [100, 118],
              [82, 150],
              [60, 184],
              [16, 186],
            ]),
            kind: 'detail',
            fill: 'ginger',
          },
          {
            d: smooth([
              [104, 44],
              [160, 42],
              [178, 70],
              [170, 104],
              [148, 122],
              [120, 118],
              [104, 92],
              [100, 62],
            ]),
            kind: 'detail',
            fill: 'patch',
          },
        ],
        children: [
          leg('legBF', 76, true),
          leg('legFF', 196, true),
          leg('legBN', 58, false),
          leg('legFN', 178, false),
          {
            id: 'head',
            role: 'head',
            pivot: [214, 134],
            shapes: [
              {
                d: smooth([
                  [194, 66],
                  [228, 50],
                  [266, 52],
                  [294, 72],
                  [306, 104],
                  [300, 134],
                  [276, 154],
                  [238, 162],
                  [206, 154],
                  [188, 126],
                  [184, 94],
                ]),
                fill: 'fur',
              },
              {
                d: smooth([
                  [176, 40],
                  [248, 34],
                  [262, 58],
                  [266, 90],
                  [258, 114],
                  [234, 126],
                  [204, 132],
                  [178, 116],
                ]),
                kind: 'detail',
                fill: 'ginger',
              },
              { d: ellipse(262, 128, 12, 7.5), kind: 'feature', fill: 'blush', opacity: 0.55 },
              { d: circle(238, 94, 11.5), kind: 'feature', fill: 'eye' },
              { d: circle(242.2, 89.4, 4.4), kind: 'feature', fill: 'shine' },
              {
                d: 'M294 104Q302 100 307 106Q306 113 300 115Q294 112 294 104Z',
                kind: 'feature',
                fill: 'nose',
              },
              {
                d: 'M299 116Q300 125 291 128Q285 128 283 124',
                kind: 'line',
                stroke: 'mouth',
                width: 2.6,
              },
              { d: 'M284 113L310 106', kind: 'line', stroke: 'whisker', width: 1.8 },
              { d: 'M284 119L311 121', kind: 'line', stroke: 'whisker', width: 1.8 },
            ],
            children: [
              {
                id: 'ear',
                role: 'ear',
                pivot: [208, 64],
                shapes: [
                  {
                    d: smooth([
                      [220, 64],
                      [212, 50],
                      [194, 44],
                      [176, 50],
                      [168, 64],
                      [176, 74],
                      [196, 72],
                    ]),
                    fill: 'patch',
                  },
                  { d: ellipse(190, 60, 12, 5.5, -8), kind: 'detail', fill: 'earInner' },
                ],
              },
            ],
          },
        ],
      },
    ],
    -24,
    -40,
  ),
};

export default guineaPig;
