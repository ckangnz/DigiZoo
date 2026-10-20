import { capsule, circle, ellipse, leaf, scallop, tube, type Pt } from '../core/paths';
import type { AnimalDef, PartNode, Shape } from '../core/types';

const leg = (id: string, x: number, far: boolean): PartNode => ({
  id,
  role: id,
  behind: true,
  pivot: [x, 186],
  shapes: [
    { d: capsule(x, 182, x, 234, 10, 9.5), fill: far ? 'faceDark' : 'face' },
    { d: ellipse(x + 2, 239, 12.5, 8), fill: far ? 'faceDark' : 'face' },
    { d: `M${x - 14} 236H${x + 18}V250H${x - 14}Z`, kind: 'detail', fill: 'hoof' },
  ],
});

const stroke = (pts: Pt[], r: number): string => tube(pts, r, 24);

const curls = (pts: Pt[]): Shape[] =>
  pts.map(([x, y]) => ({
    d: stroke(
      [
        [x - 9, y + 2],
        [x - 4, y - 3],
        [x + 4, y - 3],
        [x + 9, y + 2],
      ],
      1.5,
    ),
    kind: 'detail' as const,
    fill: 'woolLine',
  }));

const sheep: AnimalDef = {
  id: 'sheep',
  name: 'Sheep',
  aliases: ['lamb', 'baa', 'ewe', 'ram', 'baa baa'],
  group: 'mammal',
  habitats: ['farm'],
  box: [330, 250],
  size: 170,
  locomotion: 'walk4',
  gait: { period: 0.8, swing: 20, stride: 82 },
  sound: 'sheep',
  palette: {
    wool: '#f9f0dd',
    woolShade: '#ede0c6',
    woolLine: '#dccbaa',
    face: '#57505e',
    faceDark: '#433d4a',
    earInner: '#b88a96',
    hoof: '#2f2a35',
    mouthLight: '#cfc3cc',
  },
  parts: [
    {
      id: 'body',
      role: 'body',
      pivot: [150, 190],
      shapes: [
        { d: scallop(150, 140, 0, 16, 10, 0, 104, 66), fill: 'wool' },
        { d: ellipse(156, 202, 84, 22), kind: 'detail', fill: 'woolShade' },
        ...curls([
          [92, 112],
          [134, 98],
          [176, 108],
          [112, 146],
          [156, 140],
          [74, 160],
          [196, 150],
          [132, 180],
        ]),
      ],
      children: [
        {
          id: 'tail',
          role: 'tail',
          pivot: [52, 124],
          behind: true,
          shapes: [{ d: scallop(40, 128, 15, 7, 6), fill: 'wool' }],
        },
        leg('legBF', 116, true),
        leg('legFF', 222, true),
        leg('legBN', 92, false),
        leg('legFN', 198, false),
        {
          id: 'head',
          role: 'head',
          pivot: [228, 150],
          shapes: [
            { d: leaf(224, 106, 36, 11, 160), fill: 'face' },
            { d: leaf(288, 106, 36, 11, 20), fill: 'face' },
            { d: leaf(220, 107, 26, 5, 160), kind: 'detail', fill: 'earInner' },
            { d: leaf(292, 107, 26, 5, 20), kind: 'detail', fill: 'earInner' },
            { d: ellipse(256, 126, 44, 50), fill: 'face' },
            { d: ellipse(232, 145, 9.5, 6), kind: 'feature', fill: 'blush', opacity: 0.6 },
            { d: ellipse(280, 145, 9.5, 6), kind: 'feature', fill: 'blush', opacity: 0.6 },
            { d: circle(240, 122, 8), kind: 'feature', fill: 'eye' },
            { d: circle(272, 122, 8), kind: 'feature', fill: 'eye' },
            { d: circle(243, 118.8, 3.1), kind: 'feature', fill: 'shine' },
            { d: circle(275, 118.8, 3.1), kind: 'feature', fill: 'shine' },
            { d: ellipse(256, 145, 6, 4), kind: 'feature', fill: 'mouthLight' },
            {
              d: stroke(
                [
                  [247, 153],
                  [251.5, 157],
                  [256, 153.5],
                  [260.5, 157],
                  [265, 153],
                ],
                1.4,
              ),
              kind: 'feature',
              fill: 'mouthLight',
            },
          ],
          children: [
            {
              id: 'tuft',
              pivot: [256, 84],
              shapes: [{ d: scallop(256, 84, 0, 10, 7, 0, 31, 20), fill: 'wool' }],
            },
          ],
        },
      ],
    },
  ],
};

export default sheep;
