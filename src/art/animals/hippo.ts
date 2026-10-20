import { capsule, circle, curve, ellipse, leaf, smooth } from '../core/paths';
import type { AnimalDef, PartNode } from '../core/types';

const leg = (id: string, x: number, far: boolean): PartNode => {
  const fill = far ? 'skinDark' : 'skin';
  return {
    id,
    role: id,
    behind: true,
    pivot: [x, 190],
    shapes: [
      { d: capsule(x, 186, x, 232, 24, 24), fill },
      { d: ellipse(x + 3, 242, 28, 14), fill },
      ...(far
        ? []
        : [
            { d: `M${x + 6} 247L${x + 6} 254`, kind: 'line' as const, stroke: 'toe', width: 2.6 },
            { d: `M${x + 18} 246L${x + 18} 253`, kind: 'line' as const, stroke: 'toe', width: 2.6 },
          ]),
    ],
  };
};

const hippo: AnimalDef = {
  id: 'hippo',
  name: 'Hippo',
  aliases: ['hippopotamus', 'hippy'],
  group: 'mammal',
  habitats: ['safari'],
  box: [372, 260],
  size: 220,
  locomotion: 'walk4',
  gait: { period: 0.85, swing: 20, stride: 64 },
  sound: 'hippo',
  palette: {
    skin: '#a497c3',
    skinDark: '#887aab',
    muzzle: '#b9add7',
    belly: '#f3bccb',
    earInner: '#f4a3b8',
    nostril: '#5d4d80',
    toe: '#7a6c9c',
  },
  parts: [
    {
      id: 'body',
      role: 'body',
      pivot: [170, 200],
      shapes: [
        {
          d: smooth([
            [72, 110],
            [122, 88],
            [190, 84],
            [250, 94],
            [286, 126],
            [292, 170],
            [274, 206],
            [220, 222],
            [150, 224],
            [92, 216],
            [58, 188],
            [52, 144],
          ]),
          fill: 'skin',
        },
        { d: ellipse(176, 222, 86, 24), kind: 'detail', fill: 'belly' },
      ],
      children: [
        {
          id: 'tail',
          role: 'tail',
          pivot: [58, 140],
          behind: true,
          shapes: [
            { d: capsule(60, 140, 36, 158, 6.5, 4.5), fill: 'skin' },
            { d: leaf(37, 157, 13, 5, 150), fill: 'skinDark' },
            { d: leaf(37, 157, 13, 5, 115), fill: 'skinDark' },
          ],
        },
        leg('legBF', 126, true),
        leg('legFF', 244, true),
        leg('legBN', 96, false),
        leg('legFN', 214, false),
        {
          id: 'head',
          role: 'head',
          pivot: [262, 168],
          shapes: [
            { d: circle(242, 78, 12), fill: 'skin' },
            { d: circle(340, 78, 12), fill: 'skin' },
            { d: circle(270, 82, 18), fill: 'skin' },
            { d: circle(312, 82, 18), fill: 'skin' },
            { d: ellipse(291, 116, 57, 46), fill: 'skin' },
            { d: circle(242, 78, 6), kind: 'detail', fill: 'earInner' },
            { d: circle(340, 78, 6), kind: 'detail', fill: 'earInner' },
            { d: circle(270, 88, 8), kind: 'feature', fill: 'eye' },
            { d: circle(312, 88, 8), kind: 'feature', fill: 'eye' },
            { d: circle(272.8, 84.8, 3.1), kind: 'feature', fill: 'shine' },
            { d: circle(314.8, 84.8, 3.1), kind: 'feature', fill: 'shine' },
          ],
          children: [
            {
              id: 'muzzle',
              pivot: [292, 166],
              shapes: [
                { d: ellipse(292, 166, 72, 48), fill: 'muzzle' },
                { d: ellipse(270, 146, 7, 5, -18), kind: 'feature', fill: 'nostril' },
                { d: ellipse(314, 146, 7, 5, 18), kind: 'feature', fill: 'nostril' },
                { d: ellipse(242, 174, 12, 7.5), kind: 'feature', fill: 'blush', opacity: 0.55 },
                { d: ellipse(342, 174, 12, 7.5), kind: 'feature', fill: 'blush', opacity: 0.55 },
                { d: curve(258, 182, 326, 182, 13), kind: 'line', stroke: 'mouth', width: 3.2 },
              ],
            },
          ],
        },
      ],
    },
  ],
};

export default hippo;
