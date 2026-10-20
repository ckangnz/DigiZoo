import {
  capsule,
  circle,
  ellipse,
  leaf,
  scallop,
  translatePath,
  tube,
  type Pt,
} from '../core/paths';
import type { AnimalDef, PartNode, Shape } from '../core/types';

const HIP_Y = 160;
const FOOT_Y = 200;

const leg = (id: string, x: number, far: boolean): PartNode => ({
  id,
  role: id,
  behind: true,
  pivot: [x, HIP_Y],
  shapes: [
    { d: capsule(x, HIP_Y - 4, x, FOOT_Y - 8, 10, 9.5), fill: far ? 'legFar' : 'leg' },
    { d: ellipse(x + 1.5, FOOT_Y - 4, 11.5, 7.5), fill: far ? 'legFar' : 'leg' },
    {
      d: `M${x - 14} ${FOOT_Y - 6}H${x + 16}V${FOOT_Y + 8}H${x - 14}Z`,
      kind: 'detail',
      fill: 'hoof',
    },
  ],
});

const ear = (id: string, x: number, y: number, side: 1 | -1): PartNode => {
  const deg = side === 1 ? 24 : 156;
  return {
    id,
    behind: true,
    pivot: [x, y],
    motion: { rotate: -side * 9, phase: 0.94 },
    shapes: [
      { d: leaf(x + side * 4, y, 34, 11, deg), fill: 'face' },
      { d: leaf(x + side * 6, y + 1, 25, 5, deg), kind: 'detail', fill: 'earInner' },
    ],
  };
};

const stroke = (pts: Pt[], r: number): string => tube(pts, r, 24);

const curls = (pts: Pt[]): Shape[] =>
  pts.map(([x, y]) => ({
    d: stroke(
      [
        [x - 8, y + 2],
        [x - 3.5, y - 2.5],
        [x + 3.5, y - 2.5],
        [x + 8, y + 2],
      ],
      1.4,
    ),
    kind: 'detail' as const,
    fill: 'woolLine',
  }));

const offset = (parts: PartNode[], dx: number, dy: number): PartNode[] =>
  parts.map((p): PartNode => ({
    ...p,
    pivot: p.pivot && [p.pivot[0] + dx, p.pivot[1] + dy],
    shapes: p.shapes?.map((s) => ({ ...s, d: translatePath(s.d, dx, dy) })),
    children: p.children && offset(p.children, dx, dy),
  }));

const lamb: AnimalDef = {
  id: 'lamb',
  name: 'Lamb',
  kind: 'animal',
  aliases: ['sheep', 'baby sheep', 'little lamb', 'lambie', 'baa'],
  group: 'mammal',
  habitats: ['bible'],
  box: [236, 154],
  size: 90,
  locomotion: 'hop',
  gait: { lift: 30, swing: 30 },
  sound: 'lamb',
  palette: {
    wool: '#fffaf0',
    woolShade: '#f1e7d6',
    woolLine: '#e2d3b8',
    face: '#f6e4d8',
    leg: '#f1ddd0',
    legFar: '#e2c9bb',
    earInner: '#ffbcc8',
    hoof: '#9c8580',
    nose: '#f39aac',
  },
  parts: offset(
    [
      {
        id: 'body',
        role: 'body',
        pivot: [112, 170],
        shapes: [
          { d: scallop(110, 124, 0, 14, 9, 0, 72, 52), fill: 'wool' },
          { d: ellipse(114, 178, 64, 18), kind: 'detail', fill: 'woolShade' },
          ...curls([
            [70, 104],
            [104, 94],
            [92, 128],
            [128, 120],
            [60, 140],
            [110, 152],
          ]),
        ],
        children: [
          {
            id: 'tail',
            role: 'tail',
            pivot: [46, 108],
            behind: true,
            shapes: [{ d: scallop(36, 110, 13, 7, 5), fill: 'wool' }],
          },
          leg('legBF', 86, true),
          leg('legFF', 158, true),
          leg('legBN', 66, false),
          leg('legFN', 138, false),
          {
            id: 'head',
            role: 'head',
            pivot: [172, 130],
            shapes: [
              { d: ellipse(190, 106, 38, 37), fill: 'face' },
              { d: ellipse(167, 120, 9, 5.5), kind: 'feature', fill: 'blush', opacity: 0.6 },
              { d: ellipse(213, 120, 9, 5.5), kind: 'feature', fill: 'blush', opacity: 0.6 },
              { d: circle(176, 104, 10), kind: 'feature', fill: 'eye' },
              { d: circle(204, 104, 10), kind: 'feature', fill: 'eye' },
              { d: circle(179.6, 100.2, 3.8), kind: 'feature', fill: 'shine' },
              { d: circle(207.6, 100.2, 3.8), kind: 'feature', fill: 'shine' },
              { d: circle(173.2, 108.4, 1.6), kind: 'feature', fill: 'shine' },
              { d: circle(201.2, 108.4, 1.6), kind: 'feature', fill: 'shine' },
              { d: ellipse(190, 121, 5, 3.4), kind: 'feature', fill: 'nose' },
              {
                d: 'M183 126Q186.5 130 190 126.5Q193.5 130 197 126',
                kind: 'line',
                stroke: 'mouth',
                width: 2.2,
              },
            ],
            children: [
              ear('earF', 164, 92, -1),
              ear('earN', 216, 92, 1),
              {
                id: 'tuft',
                pivot: [190, 72],
                shapes: [{ d: scallop(190, 72, 0, 9, 6, 0, 24, 14), fill: 'wool' }],
              },
            ],
          },
        ],
      },
    ],
    -17,
    -51,
  ),
};

export default lamb;
