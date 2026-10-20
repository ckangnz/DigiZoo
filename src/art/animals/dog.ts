import { capsule, circle, ellipse, mirrorPath, smooth, tube } from '../core/paths';
import type { AnimalDef, PartNode } from '../core/types';

const EAR = smooth([
  [202, 72],
  [212, 84],
  [208, 114],
  [199, 144],
  [186, 151],
  [173, 140],
  [173, 108],
  [184, 78],
]);

const leg = (id: string, x: number, far: boolean): PartNode => ({
  id,
  role: id,
  behind: true,
  pivot: [x, 200],
  shapes: [
    { d: capsule(x, 200, x, 250, 16, 15), fill: far ? 'furDark' : 'fur' },
    { d: ellipse(x + 4, 259, 19, 11.5), fill: far ? 'furDark' : 'fur' },
    ...(far
      ? []
      : [
          { d: `M${x + 8} 264L${x + 8} 270`, kind: 'line' as const, stroke: 'toe', width: 2.4 },
          { d: `M${x + 15} 263L${x + 15} 269`, kind: 'line' as const, stroke: 'toe', width: 2.4 },
        ]),
  ],
});

const dog: AnimalDef = {
  id: 'dog',
  name: 'Dog',
  aliases: ['puppy', 'doggy', 'pup', 'doggie', 'puppy dog', 'woof'],
  group: 'mammal',
  habitats: ['farm'],
  box: [340, 274],
  size: 150,
  locomotion: 'walk4',
  gait: { stride: 105 },
  sound: 'dog',
  palette: {
    fur: '#f2cf98',
    furDark: '#dcb67e',
    patch: '#b47648',
    ear: '#c4864f',
    belly: '#fff2db',
    muzzle: '#fff4e2',
    collar: '#e8433f',
    gold: '#f8c630',
    nose: '#3b2724',
    toe: '#c39a62',
  },
  parts: [
    {
      id: 'body',
      role: 'body',
      pivot: [158, 200],
      shapes: [
        { d: ellipse(158, 190, 86, 52), fill: 'fur' },
        { d: ellipse(164, 238, 66, 18), kind: 'detail', fill: 'belly' },
        { d: ellipse(112, 164, 30, 24, -20), kind: 'detail', fill: 'patch' },
      ],
      children: [
        {
          id: 'tail',
          role: 'tail',
          pivot: [80, 178],
          behind: true,
          motion: { rotate: 18, freq: 2, phase: 0.25 },
          shapes: [
            {
              d: tube(
                [
                  [82, 180],
                  [62, 168],
                  [50, 148],
                  [48, 126],
                ],
                (t) => 9.5 - 4 * t,
                40,
              ),
              fill: 'fur',
            },
          ],
        },
        leg('legBF', 124, true),
        leg('legFF', 226, true),
        leg('legBN', 100, false),
        leg('legFN', 204, false),
        {
          id: 'head',
          role: 'head',
          pivot: [232, 172],
          shapes: [
            { d: ellipse(250, 118, 62, 57), fill: 'fur' },
            { d: ellipse(226, 106, 25, 23, -12), kind: 'detail', fill: 'patch' },
            { d: ellipse(250, 146, 31, 22), kind: 'detail', fill: 'muzzle' },
            { d: ellipse(214, 142, 10, 6.5), kind: 'feature', fill: 'blush', opacity: 0.5 },
            { d: ellipse(286, 141, 10, 6.5), kind: 'feature', fill: 'blush', opacity: 0.5 },
            { d: circle(228, 112, 10), kind: 'feature', fill: 'eye' },
            { d: circle(272, 110, 10), kind: 'feature', fill: 'eye' },
            { d: circle(231.6, 108, 3.8), kind: 'feature', fill: 'shine' },
            { d: circle(275.6, 106, 3.8), kind: 'feature', fill: 'shine' },
            {
              d: 'M238 131Q250 124 262 131Q261 141 250 144Q239 141 238 131Z',
              kind: 'feature',
              fill: 'nose',
            },
            {
              d: ellipse(250, 156, 6, 6.5),
              kind: 'feature',
              fill: 'tongue',
              stroke: 'auto',
              width: 1.6,
            },
            { d: 'M250 144Q250 152 241 154', kind: 'line', stroke: 'mouth', width: 2.8 },
            { d: 'M250 144Q250 152 259 154', kind: 'line', stroke: 'mouth', width: 2.8 },
          ],
          children: [
            {
              id: 'collar',
              behind: true,
              pivot: [250, 176],
              shapes: [
                {
                  d: tube(
                    [
                      [204, 162],
                      [226, 176],
                      [250, 180],
                      [274, 176],
                      [296, 162],
                    ],
                    6.8,
                    40,
                  ),
                  fill: 'collar',
                },
                {
                  d: circle(250, 195, 8.5),
                  kind: 'feature',
                  fill: 'gold',
                  stroke: 'auto',
                  width: 2,
                },
                { d: circle(250, 195, 3), kind: 'feature', fill: 'collar', opacity: 0.35 },
              ],
            },
            {
              id: 'earL',
              role: 'ear',
              motion: { rotate: 8, freq: 2, phase: 0.3 },
              pivot: [194, 80],
              shapes: [{ d: EAR, fill: 'ear' }],
            },
            {
              id: 'earR',
              role: 'ear',
              motion: { rotate: 8, freq: 2, phase: 0.3 },
              phase: 0.5,
              pivot: [306, 80],
              shapes: [{ d: mirrorPath(EAR, 250), fill: 'ear' }],
            },
          ],
        },
      ],
    },
  ],
};

export default dog;
