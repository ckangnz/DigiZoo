import { capsule, circle, ellipse, leaf, smooth, tube, type Pt } from '../core/paths';
import type { AnimalDef, PartNode } from '../core/types';

const HIP = 188;

const foot = (x: number): string =>
  smooth([
    [x - 14, 278],
    [x + 10, 277],
    [x + 22, 284],
    [x + 23, 294],
    [x + 4, 296],
    [x - 16, 295],
    [x - 19, 287],
  ]);

const leg = (id: string, role: string, x: number, far: boolean): PartNode => ({
  id,
  role,
  behind: true,
  pivot: [x, HIP],
  shapes: [
    { d: capsule(x, HIP, x, 238, 17.5, 12.5), fill: far ? 'furFar' : 'fur' },
    { d: capsule(x, 244, x + 1, 280, 11, 10), fill: far ? 'furFar' : 'fur' },
    { d: circle(x, 244, 14), fill: far ? 'furFar' : 'fur' },
    { d: foot(x), fill: far ? 'padFar' : 'pad' },
    { d: ellipse(x + 3, 246, 8.5, 9.5), kind: 'detail', fill: far ? 'kneeFar' : 'knee' },
    ...(far
      ? []
      : [{ d: `M${x + 9} 286L${x + 9} 294`, kind: 'line' as const, stroke: 'toe', width: 2.6 }]),
  ],
});

const NECK: Pt[] = [
  [196, 156],
  [232, 168],
  [262, 146],
  [278, 110],
  [286, 78],
];

const camel: AnimalDef = {
  id: 'camel',
  name: 'Camel',
  aliases: ['dromedary', 'hump', 'humpy'],
  group: 'mammal',
  habitats: ['desert', 'bible'],
  box: [356, 298],
  size: 320,
  locomotion: 'walk4',
  gait: { stride: 134, swing: 18 },
  sound: 'camel',
  palette: {
    fur: '#e2b373',
    furFar: '#c8995a',
    furLight: '#f4dcad',
    furDark: '#b9844a',
    knee: '#c99558',
    kneeFar: '#ad7d45',
    pad: '#c99a62',
    padFar: '#ad8150',
    toe: '#8a6038',
    earInner: '#e99f80',
    faceLine: '#7b4f2e',
  },
  parts: [
    {
      id: 'body',
      role: 'body',
      pivot: [126, 188],
      shapes: [
        {
          d: smooth([
            [30, 154],
            [44, 136],
            [62, 128],
            [72, 106],
            [86, 82],
            [106, 67],
            [127, 62],
            [148, 67],
            [168, 82],
            [182, 106],
            [190, 124],
            [210, 130],
            [228, 150],
            [230, 182],
            [212, 206],
            [158, 216],
            [100, 218],
            [56, 212],
            [30, 194],
            [20, 174],
          ]),
          fill: 'fur',
        },
        { d: ellipse(128, 224, 84, 24), kind: 'detail', fill: 'furLight' },
      ],
      children: [
        {
          id: 'tail',
          role: 'tail',
          pivot: [32, 156],
          behind: true,
          shapes: [
            { d: capsule(32, 156, 16, 192, 6.5, 5.2), fill: 'fur' },
            { d: leaf(16, 184, 38, 10.5, 98), fill: 'furDark' },
          ],
        },
        leg('legBF', 'legBF', 88, true),
        leg('legFF', 'legFF', 210, true),
        leg('legBN', 'legBN', 64, false),
        leg('legFN', 'legFN', 186, false),
        {
          id: 'neck',
          role: 'neck',
          pivot: [204, 154],
          behind: true,
          motion: { rotate: 3, phase: 0.05 },
          shapes: [
            { d: tube(NECK, (t) => 30 - 10 * t), fill: 'fur' },
            {
              d: tube(
                [
                  [226, 190],
                  [254, 176],
                  [276, 144],
                  [290, 106],
                ],
                8,
              ),
              kind: 'detail',
              fill: 'furLight',
            },
          ],
          children: [
            {
              id: 'head',
              role: 'head',
              pivot: [284, 84],
              shapes: [
                {
                  d: smooth([
                    [260, 48],
                    [272, 28],
                    [298, 18],
                    [324, 25],
                    [340, 44],
                    [346, 68],
                    [341, 87],
                    [322, 96],
                    [296, 95],
                    [272, 86],
                    [258, 68],
                  ]),
                  fill: 'fur',
                },
                { d: ellipse(327, 77, 24, 21), kind: 'detail', fill: 'furLight' },
                { d: ellipse(286, 73, 11, 7), kind: 'feature', fill: 'blush', opacity: 0.55 },
                { d: circle(294, 50, 10), kind: 'feature', fill: 'eye' },
                { d: circle(297.6, 45.8, 3.8), kind: 'feature', fill: 'shine' },
                { d: 'M299 41L302.5 35.5', kind: 'line', stroke: 'faceLine', width: 2.6 },
                { d: 'M303.5 45L309 41', kind: 'line', stroke: 'faceLine', width: 2.6 },
                { d: 'M331 58Q337 60 337 66', kind: 'line', stroke: 'faceLine', width: 2.8 },
                { d: 'M314 87Q323 92 332 87', kind: 'line', stroke: 'faceLine', width: 2.8 },
              ],
              children: [
                {
                  id: 'ear',
                  role: 'ear',
                  behind: true,
                  pivot: [268, 32],
                  shapes: [
                    { d: leaf(270, 35, 26, 9.5, -122), fill: 'fur' },
                    { d: leaf(269, 34, 15, 4.5, -122), kind: 'detail', fill: 'earInner' },
                  ],
                },
              ],
            },
          ],
        },
      ],
    },
  ],
};

export default camel;
