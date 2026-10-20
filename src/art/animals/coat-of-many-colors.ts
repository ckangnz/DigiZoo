import {
  circle,
  leaf,
  mirrorPath,
  poly,
  smooth,
  translatePath,
  tube,
  type Pt,
} from '../core/paths';
import type { AnimalDef, PartNode, Shape } from '../core/types';

const CX = 145;
const HOOK: Pt = [CX, 50];
const HEM_Y = 288;

const STRIPES = ['red', 'orange', 'yellow', 'green', 'blue', 'purple', 'pink'];

const BODY: Pt[] = [
  [CX - 24, 62],
  [CX + 24, 62],
  [CX + 56, 74],
  [CX + 62, 124],
  [CX + 70, 190],
  [CX + 94, HEM_Y - 12],
  [CX + 58, HEM_Y],
  [CX, HEM_Y + 2],
  [CX - 58, HEM_Y],
  [CX - 94, HEM_Y - 12],
  [CX - 70, 190],
  [CX - 62, 124],
  [CX - 56, 74],
];

const bodyStripes = (): Shape[] => {
  const n = STRIPES.length;
  const top = (t: number) => CX - 58 + 116 * t;
  const bottom = (t: number) => CX - 100 + 200 * t;
  return STRIPES.map((fill, i) => ({
    d: poly([
      [top(i / n), 40],
      [top((i + 1) / n), 40],
      [bottom((i + 1) / n), HEM_Y + 20],
      [bottom(i / n), HEM_Y + 20],
    ]),
    kind: 'detail' as const,
    fill,
  }));
};

const SLEEVE: Pt[] = [
  [CX + 34, 68],
  [CX + 62, 74],
  [CX + 100, 112],
  [CX + 136, 158],
  [CX + 130, 184],
  [CX + 100, 196],
  [CX + 80, 160],
  [CX + 54, 124],
];

const SLEEVE_FROM: Pt = [CX + 56, 84];
const SLEEVE_TO: Pt = [CX + 120, 186];

const SLEEVE_LEN = Math.hypot(SLEEVE_TO[0] - SLEEVE_FROM[0], SLEEVE_TO[1] - SLEEVE_FROM[1]);
const AX = (SLEEVE_TO[0] - SLEEVE_FROM[0]) / SLEEVE_LEN;
const AY = (SLEEVE_TO[1] - SLEEVE_FROM[1]) / SLEEVE_LEN;
const along = (t: number, w: number): Pt => [
  SLEEVE_FROM[0] + AX * SLEEVE_LEN * t - AY * w,
  SLEEVE_FROM[1] + AY * SLEEVE_LEN * t + AX * w,
];
const band = (t0: number, t1: number): string =>
  poly([along(t0, -80), along(t1, -80), along(t1, 80), along(t0, 80)]);

const sleeveBands = (shift: number): Shape[] => {
  const n = 5;
  return Array.from({ length: n }, (_, i) => ({
    d: band(-0.1 + i / n, -0.1 + (i + 1) / n),
    kind: 'detail' as const,
    fill: STRIPES[(i + shift) % STRIPES.length],
  }));
};

const sleeve = (id: string, side: 1 | -1): PartNode => {
  const place = (d: string) => (side === 1 ? d : mirrorPath(d, CX));
  return {
    id,
    role: 'arm',
    behind: true,
    pivot: [CX + side * 56, 84],
    motion: { rotate: 4, phase: 0.15 },
    shapes: [
      { d: place(smooth(SLEEVE)), fill: 'coat' },
      ...sleeveBands(side === 1 ? 4 : 1).map((s) => ({ ...s, d: place(s.d) })),
      { d: place(band(0.9, 1.4)), kind: 'detail', fill: 'trim' },
    ],
  };
};

const offset = (parts: PartNode[], dx: number, dy: number): PartNode[] =>
  parts.map((p): PartNode => ({
    ...p,
    pivot: p.pivot && [p.pivot[0] + dx, p.pivot[1] + dy],
    shapes: p.shapes?.map((s) => ({ ...s, d: translatePath(s.d, dx, dy) })),
    children: p.children && offset(p.children, dx, dy),
  }));

const coatOfManyColors: AnimalDef = {
  id: 'coat-of-many-colors',
  name: 'Coat of Many Colors',
  kind: 'object',
  aliases: ['coat', 'joseph', 'colourful coat', 'colorful coat', 'rainbow coat'],
  group: 'bible',
  habitats: ['bible'],
  box: [280, 271],
  size: 150,
  locomotion: 'float',
  sound: 'coat-of-many-colors',
  palette: {
    coat: '#f7e7c4',
    red: '#f2726b',
    orange: '#f8a64f',
    yellow: '#ffd65c',
    green: '#7fcb6a',
    blue: '#62b4ea',
    purple: '#a98be0',
    pink: '#f592ba',
    trim: '#f6c445',
    sash: '#8e5fb4',
    lining: '#7d5a9e',
    hook: '#a87a4c',
  },
  parts: offset(
    [
      {
        id: 'hanger',
        pivot: HOOK,
        shapes: [
          {
            d: tube(
              [
                [CX, 64],
                [CX, 42],
                [CX + 6, 30],
                [CX + 17, 27],
                [CX + 25, 34],
              ],
              3.4,
              40,
            ),
            fill: 'hook',
          },
        ],
        children: [
          {
            id: 'coat',
            pivot: HOOK,
            motion: { rotate: 3, phase: 0.1 },
            shapes: [
              { d: smooth(BODY), fill: 'coat' },
              ...bodyStripes(),
              {
                d: poly([
                  [CX - 120, HEM_Y - 12],
                  [CX + 120, HEM_Y - 12],
                  [CX + 120, HEM_Y + 30],
                  [CX - 120, HEM_Y + 30],
                ]),
                kind: 'detail',
                fill: 'trim',
              },
              {
                d: smooth([
                  [CX - 22, 62],
                  [CX, 104],
                  [CX + 22, 62],
                  [CX, 68],
                ]),
                kind: 'feature',
                fill: 'lining',
                stroke: 'trim',
                width: 4,
              },
            ],
            children: [
              sleeve('sleeveL', -1),
              sleeve('sleeveR', 1),
              {
                id: 'sash',
                pivot: [CX + 30, 168],
                shapes: [
                  {
                    d: smooth([
                      [CX - 68, 160],
                      [CX, 164],
                      [CX + 68, 160],
                      [CX + 69, 171],
                      [CX, 175],
                      [CX - 69, 171],
                    ]),
                    fill: 'sash',
                  },
                  { d: leaf(CX + 30, 170, 40, 7, 100), fill: 'sash' },
                  { d: leaf(CX + 30, 170, 36, 7, 70), fill: 'sash' },
                  { d: circle(CX + 30, 168, 7.5), fill: 'sash' },
                ],
              },
            ],
          },
        ],
      },
    ],
    -5,
    -21,
  ),
};

export default coatOfManyColors;
