import { capsule, circle, ellipse, leaf, scallop, smooth, translatePath } from '../core/paths';
import type { AnimalDef, PartNode } from '../core/types';

const HIP: [number, number] = [88, 208];

const hindLeg = (id: string, far: boolean): PartNode => {
  const fill = far ? 'furFar' : 'fur';
  return far
    ? {
        id,
        role: id,
        behind: true,
        pivot: [HIP[0] + 22, HIP[1] - 4],
        shapes: [{ d: ellipse(132, 258, 36, 9.5), fill }],
      }
    : {
        id,
        role: id,
        pivot: HIP,
        shapes: [
          { d: circle(HIP[0], HIP[1], 42), fill },
          { d: ellipse(110, 259, 42, 11), fill },
          { d: ellipse(138, 262, 9, 4.5), kind: 'detail', fill: 'pad' },
        ],
      };
};

const frontLeg = (id: string, x: number, far: boolean): PartNode => ({
  id,
  role: id,
  behind: true,
  pivot: [x, 214],
  shapes: [
    { d: capsule(x, 214, x + 4, 254, 11, 9), fill: far ? 'furFar' : 'fur' },
    { d: ellipse(x + 8, 259, 13, 8), fill: far ? 'furFar' : 'fur' },
  ],
});

const ear = (
  id: string,
  x: number,
  y: number,
  len: number,
  w: number,
  deg: number,
  far: boolean,
): PartNode => ({
  id,
  role: 'ear',
  behind: true,
  pivot: [x, y],
  motion: { rotate: 10, phase: far ? 0.48 : 0.44 },
  shapes: [
    { d: leaf(x, y + 4, len, w, deg), fill: far ? 'furFar' : 'fur' },
    { d: leaf(x, y + 2, len * 0.78, w * 0.48, deg), kind: 'detail', fill: 'earInner' },
  ],
});

const offset = (parts: PartNode[], dx: number, dy: number): PartNode[] =>
  parts.map((p): PartNode => ({
    ...p,
    pivot: p.pivot && [p.pivot[0] + dx, p.pivot[1] + dy],
    shapes: p.shapes?.map((s) => ({ ...s, d: translatePath(s.d, dx, dy) })),
    children: p.children && offset(p.children, dx, dy),
  }));

const rabbit: AnimalDef = {
  id: 'rabbit',
  name: 'Rabbit',
  kind: 'animal',
  aliases: ['bunny', 'bunnies', 'bunny rabbit', 'easter bunny'],
  group: 'mammal',
  habitats: ['farm', 'forest', 'pets'],
  box: [224, 260],
  size: 100,
  locomotion: 'hop',
  gait: { lift: 50 },
  sound: 'rabbit',
  palette: {
    fur: '#fffaf6',
    furFar: '#efe5e4',
    earInner: '#ffb4c6',
    pad: '#ffd0da',
    nose: '#f4889f',
    whisker: '#c7b6bc',
    tail: '#ffffff',
  },
  parts: offset(
    [
      {
        id: 'body',
        role: 'body',
        pivot: [120, 266],
        shapes: [
          {
            d: smooth([
              [60, 172],
              [90, 150],
              [130, 146],
              [164, 156],
              [186, 180],
              [192, 212],
              [180, 240],
              [140, 254],
              [96, 254],
              [62, 240],
              [44, 212],
              [46, 188],
            ]),
            fill: 'fur',
          },
        ],
        children: [
          {
            id: 'tail',
            role: 'tail',
            behind: true,
            pivot: [52, 196],
            shapes: [{ d: scallop(40, 194, 19, 9, 5), fill: 'tail' }],
          },
          hindLeg('legBF', true),
          frontLeg('legFF', 156, true),
          frontLeg('legFN', 172, false),
          hindLeg('legBN', false),
          {
            id: 'head',
            role: 'head',
            pivot: [176, 170],
            shapes: [
              { d: circle(178, 126, 46), fill: 'fur' },
              { d: circle(142, 148, 17), fill: 'fur' },
              { d: circle(214, 148, 17), fill: 'fur' },
              { d: ellipse(148, 147, 9.5, 6), kind: 'feature', fill: 'blush', opacity: 0.55 },
              { d: ellipse(208, 147, 9.5, 6), kind: 'feature', fill: 'blush', opacity: 0.55 },
              { d: circle(160, 124, 9.5), kind: 'feature', fill: 'eye' },
              { d: circle(196, 124, 9.5), kind: 'feature', fill: 'eye' },
              { d: circle(163.4, 120.4, 3.6), kind: 'feature', fill: 'shine' },
              { d: circle(199.4, 120.4, 3.6), kind: 'feature', fill: 'shine' },
              {
                d: 'M171 138Q178 134 185 138Q183 144 178 146Q173 144 171 138Z',
                kind: 'feature',
                fill: 'nose',
              },
              {
                d: 'M178 146Q178 153 171 155Q166 155 164 151',
                kind: 'line',
                stroke: 'mouth',
                width: 2.6,
              },
              {
                d: 'M178 146Q178 153 185 155Q190 155 192 151',
                kind: 'line',
                stroke: 'mouth',
                width: 2.6,
              },
              { d: 'M152 140L126 135', kind: 'line', stroke: 'whisker', width: 2.2 },
              { d: 'M152 147L125 149', kind: 'line', stroke: 'whisker', width: 2.2 },
              { d: 'M204 140L230 135', kind: 'line', stroke: 'whisker', width: 2.2 },
              { d: 'M204 147L231 149', kind: 'line', stroke: 'whisker', width: 2.2 },
            ],
            children: [
              ear('earF', 164, 94, 74, 17, -104, true),
              ear('earN', 190, 92, 78, 18, -82, false),
            ],
          },
        ],
      },
    ],
    -12,
    -10,
  ),
};

export default rabbit;
