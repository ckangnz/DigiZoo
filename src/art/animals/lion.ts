import { capsule, circle, ellipse, scallop, spiky } from '../core/paths';
import type { AnimalDef, PartNode } from '../core/types';

const leg = (id: string, role: string, x: number, far: boolean): PartNode => ({
  id,
  role,
  pivot: [x, 200],
  shapes: [
    { d: capsule(x, 200, x, 262, 19, 18), fill: far ? 'furDark' : 'fur' },
    { d: ellipse(x + 5, 273, 23, 14), fill: far ? 'furDark' : 'fur' },
    ...(far
      ? []
      : [
          { d: `M${x + 9} 279L${x + 9} 286`, kind: 'line' as const, stroke: 'toe', width: 2.6 },
          { d: `M${x + 18} 278L${x + 18} 285`, kind: 'line' as const, stroke: 'toe', width: 2.6 },
        ]),
  ],
});

const lion: AnimalDef = {
  id: 'lion',
  name: 'Lion',
  aliases: ['king', 'big cat', 'simba', 'lioness'],
  group: 'mammal',
  habitats: ['safari'],
  box: [380, 290],
  size: 230,
  locomotion: 'walk4',
  gait: { stride: 120 },
  sound: 'lion',
  palette: {
    fur: '#f6b94a',
    furDark: '#de9a35',
    mane: '#c9662e',
    maneLight: '#e3863c',
    belly: '#fce3a8',
    muzzle: '#fff3d6',
    earInner: '#f2a07b',
    nose: '#5b3326',
    toe: '#c98a2e',
  },
  parts: [
    {
      id: 'body',
      role: 'body',
      pivot: [166, 200],
      shapes: [
        { d: ellipse(166, 190, 100, 60), fill: 'fur' },
        { d: ellipse(170, 244, 80, 26), kind: 'detail', fill: 'belly' },
      ],
      children: [
        {
          id: 'tail',
          role: 'tail',
          pivot: [76, 178],
          behind: true,
          shapes: [
            { d: capsule(76, 178, 44, 156, 10, 8.5), fill: 'fur' },
            { d: capsule(44, 156, 32, 122, 8.5, 7.5), fill: 'fur' },
            { d: scallop(29, 108, 14, 7, 7), fill: 'mane' },
          ],
        },
        { ...leg('legBF', 'legBF', 128, true), behind: true },
        { ...leg('legFF', 'legFF', 256, true), behind: true },
        { ...leg('legBN', 'legBN', 100, false), behind: true },
        { ...leg('legFN', 'legFN', 230, false), behind: true },
        {
          id: 'head',
          role: 'head',
          pivot: [262, 170],
          shapes: [
            { d: circle(246, 76, 17), fill: 'fur' },
            { d: circle(318, 72, 17), fill: 'fur' },
            { d: circle(282, 126, 60), fill: 'fur' },
            { d: circle(243, 72, 8), kind: 'detail', fill: 'earInner' },
            { d: circle(321, 68, 8), kind: 'detail', fill: 'earInner' },
            { d: ellipse(290, 151, 31, 21), kind: 'detail', fill: 'muzzle' },
            { d: ellipse(248, 146, 11, 7), kind: 'feature', fill: 'blush', opacity: 0.55 },
            { d: ellipse(332, 143, 11, 7), kind: 'feature', fill: 'blush', opacity: 0.55 },
            { d: circle(262, 118, 9.5), kind: 'feature', fill: 'eye' },
            { d: circle(314, 116, 9.5), kind: 'feature', fill: 'eye' },
            { d: circle(265.5, 114, 3.6), kind: 'feature', fill: 'shine' },
            { d: circle(317.5, 112, 3.6), kind: 'feature', fill: 'shine' },
            {
              d: 'M280 135Q291 129 302 135Q300 145 291 148Q282 145 280 135Z',
              kind: 'feature',
              fill: 'nose',
            },
            { d: 'M291 148Q291 157 282 159', kind: 'line', stroke: 'nose', width: 3 },
            { d: 'M291 148Q291 157 300 159', kind: 'line', stroke: 'nose', width: 3 },
          ],
          children: [
            {
              id: 'mane',
              behind: true,
              pivot: [282, 124],
              shapes: [
                { d: spiky(282, 124, 90, 74, 13, -8, 0.85), fill: 'mane' },
                { d: spiky(282, 124, 78, 64, 13, 6, 0.85), kind: 'detail', fill: 'maneLight' },
              ],
            },
          ],
        },
      ],
    },
  ],
};

export default lion;
