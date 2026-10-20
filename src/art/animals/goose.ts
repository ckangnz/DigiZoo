import { capsule, circle, curve, ellipse, smooth } from '../core/paths';
import type { AnimalDef, PartNode } from '../core/types';

const foot = (id: string, x: number, far: boolean): PartNode => {
  const fill = far ? 'feetDark' : 'feet';
  return {
    id,
    role: id,
    behind: true,
    pivot: [x, 258],
    shapes: [
      { d: capsule(x, 256, x + 2, 282, 6.5, 5.8), fill },
      {
        d: smooth([
          [x - 9, 294],
          [x - 4, 283],
          [x + 14, 280],
          [x + 32, 282],
          [x + 46, 291],
          [x + 41, 298],
          [x + 20, 299],
          [x + 2, 299],
        ]),
        fill,
      },
      ...(far
        ? []
        : [
            {
              d: `M${x + 6} 289L${x + 36} 292`,
              kind: 'line' as const,
              stroke: 'feetLine',
              width: 2.4,
            },
          ]),
    ],
  };
};

const goose: AnimalDef = {
  id: 'goose',
  name: 'Goose',
  kind: 'animal',
  aliases: ['geese', 'gosling', 'gander', 'honk', 'bird'],
  group: 'bird',
  habitats: ['farm'],
  box: [272, 300],
  size: 140,
  locomotion: 'waddle',
  sound: 'goose',
  palette: {
    body: '#fffaf0',
    belly: '#f3efe6',
    wing: '#eeedf0',
    wingLine: '#bdbfcc',
    bill: '#ff9a26',
    billLine: '#d9700f',
    feet: '#ff9a26',
    feetDark: '#e07e16',
    feetLine: '#c4660e',
  },
  parts: [
    {
      id: 'body',
      role: 'body',
      pivot: [130, 296],
      shapes: [
        {
          d: smooth([
            [198, 16],
            [224, 20],
            [240, 38],
            [242, 60],
            [233, 77],
            [218, 88],
            [210, 106],
            [210, 130],
            [218, 156],
            [236, 184],
            [240, 214],
            [228, 242],
            [196, 262],
            [146, 270],
            [96, 268],
            [56, 256],
            [30, 236],
            [22, 210],
            [30, 190],
            [56, 180],
            [100, 176],
            [146, 170],
            [178, 154],
            [188, 130],
            [186, 104],
            [178, 80],
            [174, 46],
          ]),
          fill: 'body',
        },
        { d: ellipse(146, 272, 92, 24), kind: 'detail', fill: 'belly' },
        { d: ellipse(220, 64, 9, 5.5), kind: 'feature', fill: 'blush', opacity: 0.55 },
        { d: circle(213, 42, 9.2), kind: 'feature', fill: 'eye' },
        { d: circle(216.6, 38.4, 3.5), kind: 'feature', fill: 'shine' },
      ],
      children: [
        {
          id: 'tail',
          role: 'tail',
          behind: true,
          pivot: [44, 204],
          shapes: [
            {
              d: 'M64 212C40 210 18 200 8 178C5 169 11 164 19 169C32 180 50 186 72 192Z',
              fill: 'body',
            },
          ],
        },
        foot('legF', 106, true),
        foot('legN', 142, false),
        {
          id: 'bill',
          pivot: [234, 55],
          shapes: [
            {
              d: 'M232 38C249 38 264 46 271 56C264 66 249 71 232 71C227 62 227 46 232 38Z',
              fill: 'bill',
            },
            { d: 'M237 57Q252 60 266 57', kind: 'line', stroke: 'billLine', width: 2.6 },
            { d: circle(247, 48, 1.8), kind: 'feature', fill: 'billLine' },
          ],
        },
        {
          id: 'wing',
          role: 'wingN',
          pivot: [184, 196],
          shapes: [
            {
              d: smooth([
                [186, 194],
                [200, 212],
                [188, 234],
                [158, 244],
                [124, 242],
                [94, 230],
                [70, 212],
                [62, 198],
                [94, 204],
                [128, 200],
                [158, 194],
              ]),
              fill: 'wing',
            },
            { d: curve(98, 220, 140, 228, 5), kind: 'line', stroke: 'wingLine', width: 2.6 },
            { d: curve(124, 210, 170, 214, 5), kind: 'line', stroke: 'wingLine', width: 2.6 },
          ],
        },
      ],
    },
  ],
};

export default goose;
