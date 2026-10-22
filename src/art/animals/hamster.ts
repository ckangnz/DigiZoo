import { capsule, circle, ellipse, smooth, translatePath } from '../core/paths';
import type { AnimalDef, PartNode } from '../core/types';

const HIP = 168;

const leg = (id: string, x: number, far: boolean): PartNode => ({
  id,
  role: id,
  behind: true,
  pivot: [x, HIP],
  shapes: [
    { d: capsule(x, HIP, x, 188, 10, 8.5), fill: far ? 'creamFar' : 'cream' },
    { d: ellipse(x + 3, 193, 11.5, 6.5), fill: far ? 'feetFar' : 'feet' },
  ],
});

const ear = (id: string, x: number, y: number, far: boolean): PartNode => ({
  id,
  role: id,
  behind: true,
  pivot: [x, y + 12],
  shapes: [
    { d: circle(x, y, 17), fill: far ? 'furFar' : 'fur' },
    { d: circle(x, y + 1.5, 10.5), kind: 'detail', fill: 'earInner' },
  ],
});

const offset = (parts: PartNode[], dx: number, dy: number): PartNode[] =>
  parts.map((p): PartNode => ({
    ...p,
    pivot: p.pivot && [p.pivot[0] + dx, p.pivot[1] + dy],
    shapes: p.shapes?.map((s) => ({ ...s, d: translatePath(s.d, dx, dy) })),
    children: p.children && offset(p.children, dx, dy),
  }));

const hamster: AnimalDef = {
  id: 'hamster',
  name: 'Hamster',
  kind: 'animal',
  aliases: ['hammy', 'golden hamster', 'syrian hamster', 'dwarf hamster'],
  group: 'mammal',
  habitats: ['pets'],
  box: [234, 169],
  size: 60,
  locomotion: 'walk4',
  gait: { period: 0.55, stride: 36, swing: 20 },
  sound: 'hamster',
  palette: {
    fur: '#f3aa4e',
    furFar: '#dc9038',
    cream: '#fff4e0',
    creamFar: '#efdcc2',
    earInner: '#ffb3c4',
    feet: '#ffb7c5',
    feetFar: '#f09fb2',
    nose: '#f4889f',
    whisker: '#c98f4f',
  },
  parts: offset(
    [
      {
        id: 'body',
        role: 'body',
        pivot: [118, 168],
        shapes: [
          {
            d: smooth([
              [40, 150],
              [36, 116],
              [52, 86],
              [84, 66],
              [124, 60],
              [162, 68],
              [188, 92],
              [196, 128],
              [186, 160],
              [158, 182],
              [118, 188],
              [76, 182],
              [50, 168],
            ]),
            fill: 'fur',
          },
          { d: ellipse(124, 190, 70, 30), kind: 'detail', fill: 'cream' },
        ],
        children: [
          {
            id: 'tail',
            role: 'tail',
            behind: true,
            pivot: [40, 128],
            shapes: [{ d: ellipse(33, 126, 10, 8, -20), fill: 'fur' }],
          },
          leg('legBF', 82, true),
          leg('legFF', 158, true),
          leg('legBN', 64, false),
          leg('legFN', 140, false),
          {
            id: 'head',
            role: 'head',
            pivot: [184, 140],
            shapes: [
              { d: circle(184, 96, 54), fill: 'fur' },
              { d: circle(146, 124, 26), fill: 'fur' },
              { d: circle(222, 124, 26), fill: 'fur' },
              { d: circle(146, 128, 24), kind: 'detail', fill: 'cream' },
              { d: circle(222, 128, 24), kind: 'detail', fill: 'cream' },
              { d: ellipse(184, 126, 32, 26), kind: 'detail', fill: 'cream' },
              { d: ellipse(150, 120, 10, 6.5), kind: 'feature', fill: 'blush', opacity: 0.55 },
              { d: ellipse(218, 120, 10, 6.5), kind: 'feature', fill: 'blush', opacity: 0.55 },
              { d: circle(164, 94, 10), kind: 'feature', fill: 'eye' },
              { d: circle(204, 94, 10), kind: 'feature', fill: 'eye' },
              { d: circle(167.6, 90.2, 3.8), kind: 'feature', fill: 'shine' },
              { d: circle(207.6, 90.2, 3.8), kind: 'feature', fill: 'shine' },
              {
                d: 'M178 108Q184 105 190 108Q189 113 184 115Q179 113 178 108Z',
                kind: 'feature',
                fill: 'nose',
              },
              {
                d: 'M184 115Q184 121 178 123Q174 123 172 120',
                kind: 'line',
                stroke: 'mouth',
                width: 2.4,
              },
              {
                d: 'M184 115Q184 121 190 123Q194 123 196 120',
                kind: 'line',
                stroke: 'mouth',
                width: 2.4,
              },
            ],
            children: [ear('earF', 146, 52, true), ear('earN', 222, 52, false)],
          },
        ],
      },
    ],
    -19,
    -31,
  ),
};

export default hamster;
