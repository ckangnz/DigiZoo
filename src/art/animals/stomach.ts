import { circle, curve, ellipse, smooth, translatePath, tube, type Pt } from '../core/paths';
import type { AnimalDef, PartNode } from '../core/types';

const POUCH: Pt[] = [
  [176, 62],
  [200, 40],
  [240, 40],
  [268, 66],
  [278, 110],
  [270, 160],
  [246, 206],
  [206, 240],
  [154, 256],
  [104, 252],
  [64, 232],
  [40, 204],
  [32, 176],
  [40, 152],
  [64, 150],
  [94, 176],
  [130, 180],
  [156, 160],
  [164, 124],
  [156, 84],
];

const offset = (parts: PartNode[], dx: number, dy: number): PartNode[] =>
  parts.map((p) => ({
    ...p,
    ...(p.pivot ? { pivot: [p.pivot[0] + dx, p.pivot[1] + dy] as Pt } : {}),
    ...(p.shapes ? { shapes: p.shapes.map((s) => ({ ...s, d: translatePath(s.d, dx, dy) })) } : {}),
    ...(p.children ? { children: offset(p.children, dx, dy) } : {}),
  }));

const stomach: AnimalDef = {
  id: 'stomach',
  name: 'Stomach',
  kind: 'object',
  aliases: ['tummy', 'belly', 'tum'],
  group: 'body',
  habitats: ['body'],
  box: [298, 288],
  size: 200,
  locomotion: 'wobble',
  sound: 'stomach',
  palette: {
    pouch: '#f9a99b',
    tube: '#f2998d',
    light: '#ffd3c8',
    cookie: '#f2c27e',
    chip: '#9a5b3c',
    blush: '#ff6f86',
  },
  parts: offset(
    [
      {
        id: 'pouch',
        pivot: [150, 150],
        shapes: [
          { d: smooth(POUCH), fill: 'pouch' },
          { d: ellipse(214, 70, 20, 11, -14), kind: 'detail', fill: 'light' },
          { d: circle(246, 84, 5), kind: 'detail', fill: 'light' },
          { d: circle(104, 222, 14), kind: 'detail', fill: 'cookie' },
          { d: circle(116, 210, 7), kind: 'detail', fill: 'pouch' },
          { d: circle(98, 218, 2.6), kind: 'detail', fill: 'chip' },
          { d: circle(108, 228, 2.6), kind: 'detail', fill: 'chip' },
          { d: circle(96, 229, 2.2), kind: 'detail', fill: 'chip' },
          { d: ellipse(166, 178, 12, 7.5), kind: 'feature', fill: 'blush', opacity: 0.55 },
          { d: ellipse(246, 173, 12, 7.5), kind: 'feature', fill: 'blush', opacity: 0.55 },
          { d: circle(182, 154, 13.5), kind: 'feature', fill: 'eye' },
          { d: circle(228, 151, 13.5), kind: 'feature', fill: 'eye' },
          { d: circle(186.8, 148.5, 5.1), kind: 'feature', fill: 'shine' },
          { d: circle(232.8, 145.5, 5.1), kind: 'feature', fill: 'shine' },
          { d: curve(195, 175, 217, 174, 7), kind: 'line', stroke: 'mouth', width: 3.4 },
        ],
        children: [
          {
            id: 'esophagus',
            behind: true,
            shapes: [
              {
                d: tube(
                  [
                    [156, 8],
                    [160, 40],
                    [166, 84],
                  ],
                  16,
                ),
                fill: 'tube',
              },
            ],
          },
          {
            id: 'duodenum',
            behind: true,
            shapes: [
              {
                d: tube(
                  [
                    [48, 166],
                    [24, 172],
                    [16, 200],
                  ],
                  14,
                ),
                fill: 'tube',
              },
            ],
          },
        ],
      },
    ],
    9,
    20,
  ),
};

export default stomach;
