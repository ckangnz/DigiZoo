import { capsule, circle, curve, ellipse, leaf, smooth } from '../core/paths';
import type { AnimalDef, PartNode } from '../core/types';

const leg = (id: string, x: number, far: boolean): PartNode => {
  const fill = far ? 'furDark' : 'fur';
  return {
    id,
    role: id,
    behind: true,
    pivot: [x, 178],
    shapes: [
      { d: capsule(x, 174, x, 220, 15, 14), fill },
      { d: ellipse(x + 4, 227, 18, 10), fill },
      ...(far
        ? []
        : [
            { d: `M${x + 7} 230L${x + 7} 236`, kind: 'line' as const, stroke: 'toe', width: 2.4 },
            { d: `M${x + 16} 229L${x + 16} 235`, kind: 'line' as const, stroke: 'toe', width: 2.4 },
          ]),
    ],
  };
};

const capybara: AnimalDef = {
  id: 'capybara',
  name: 'Capybara',
  aliases: ['capy', 'capi'],
  group: 'mammal',
  habitats: ['rainforest'],
  box: [340, 240],
  size: 140,
  locomotion: 'walk4',
  gait: { period: 0.95, swing: 18, stride: 60 },
  sound: 'capybara',
  palette: {
    fur: '#bf8a5a',
    furDark: '#a17046',
    belly: '#d6a878',
    snout: '#a77449',
    earInner: '#8a5a37',
    nose: '#4f3222',
    toe: '#8a5c38',
    orange: '#ff9c33',
    leaf: '#5cbf4e',
    stem: '#7a5532',
  },
  parts: [
    {
      id: 'body',
      role: 'body',
      pivot: [140, 186],
      shapes: [
        {
          d: smooth([
            [60, 104],
            [110, 86],
            [170, 86],
            [222, 98],
            [250, 130],
            [246, 172],
            [214, 200],
            [150, 206],
            [86, 200],
            [48, 176],
            [40, 136],
          ]),
          fill: 'fur',
        },
        { d: ellipse(146, 206, 76, 18), kind: 'detail', fill: 'belly' },
      ],
      children: [
        leg('legBF', 108, true),
        leg('legFF', 214, true),
        leg('legBN', 84, false),
        leg('legFN', 190, false),
        {
          id: 'head',
          role: 'head',
          pivot: [212, 150],
          shapes: [
            { d: circle(214, 68, 12), fill: 'fur' },
            {
              d: smooth([
                [208, 70],
                [256, 58],
                [302, 62],
                [326, 84],
                [332, 120],
                [322, 152],
                [294, 166],
                [250, 166],
                [212, 152],
                [194, 112],
              ]),
              fill: 'fur',
            },
            { d: circle(214, 68, 6), kind: 'detail', fill: 'earInner' },
            {
              d: smooth([
                [298, 70],
                [328, 80],
                [340, 116],
                [330, 156],
                [300, 170],
                [288, 120],
              ]),
              kind: 'detail',
              fill: 'snout',
            },
            { d: ellipse(270, 130, 12, 7.5), kind: 'feature', fill: 'blush', opacity: 0.55 },
            { d: circle(262, 99, 7.6), kind: 'feature', fill: 'eye' },
            { d: circle(264.9, 96, 2.9), kind: 'feature', fill: 'shine' },
            { d: ellipse(324, 98, 4.2, 6, 15), kind: 'feature', fill: 'nose' },
            { d: curve(304, 147, 324, 142, 4), kind: 'line', stroke: 'mouth', width: 3 },
          ],
          children: [
            {
              id: 'fruit',
              pivot: [260, 48],
              shapes: [
                { d: circle(260, 47, 14.5), fill: 'orange' },
                { d: leaf(262, 33, 16, 6, -30), fill: 'leaf' },
                { d: 'M260 35L259 29', kind: 'line', stroke: 'stem', width: 2.6 },
                { d: circle(255, 42, 3.3), kind: 'feature', fill: 'white', opacity: 0.6 },
              ],
            },
          ],
        },
      ],
    },
  ],
};

export default capybara;
