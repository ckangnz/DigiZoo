import {
  capsule,
  circle,
  ellipse,
  mirrorPath,
  roundRect,
  smooth,
  translatePath,
  tube,
  type Pt,
} from '../core/paths';
import type { AnimalDef, PartNode, Shape } from '../core/types';

const CX = 110;
const BAR_Y = 66;
const BRIDGE_Y = 206;
const STRINGS = 6;

const ARM: Pt[] = [
  [CX - 50, 210],
  [CX - 70, 170],
  [CX - 76, 124],
  [CX - 66, 84],
  [CX - 54, 52],
  [CX - 54, 32],
  [CX - 64, 20],
  [CX - 78, 22],
  [CX - 82, 34],
  [CX - 74, 42],
];

const armRadius = (t: number) => (t < 0.55 ? 11.5 - 4 * (t / 0.55) : 7.5 - 3 * ((t - 0.55) / 0.45));

const arm = (id: string, side: 1 | -1): PartNode => {
  const d = tube(ARM, armRadius, 90);
  return {
    id,
    behind: true,
    shapes: [{ d: side === -1 ? d : mirrorPath(d, CX), fill: 'wood' }],
  };
};

const stringX = (i: number, spread: number) => CX - spread + (2 * spread * i) / (STRINGS - 1);

const strings: Shape[] = Array.from({ length: STRINGS }, (_, i) => ({
  d: `M${stringX(i, 42)} ${BAR_Y}L${stringX(i, 30)} ${BRIDGE_Y}`,
  kind: 'line' as const,
  stroke: 'string',
  width: 2.6,
}));

const pegs: Shape[] = Array.from({ length: STRINGS }, (_, i) => ({
  d: circle(stringX(i, 42), BAR_Y - 1, 4.2),
  kind: 'feature' as const,
  fill: 'gold',
  stroke: 'auto',
  width: 1.6,
}));

const note = (id: string, x: number, y: number, k: number, phase: number): PartNode => ({
  id,
  pivot: [x, y],
  motion: { rotate: 8, y: -3, phase },
  shapes: [
    { d: ellipse(x, y, 9 * k, 7 * k, -24), fill: 'note' },
    { d: capsule(x + 7.4 * k, y - 2 * k, x + 7.4 * k, y - 30 * k, 2.6 * k), fill: 'note' },
    {
      d: smooth([
        [x + 6 * k, y - 32 * k],
        [x + 18 * k, y - 22 * k],
        [x + 20 * k, y - 10 * k],
        [x + 16 * k, y - 18 * k],
        [x + 8 * k, y - 22 * k],
      ]),
      fill: 'note',
    },
  ],
});

const offset = (parts: PartNode[], dx: number, dy: number): PartNode[] =>
  parts.map((p): PartNode => ({
    ...p,
    pivot: p.pivot && [p.pivot[0] + dx, p.pivot[1] + dy],
    shapes: p.shapes?.map((s) => ({ ...s, d: translatePath(s.d, dx, dy) })),
    children: p.children && offset(p.children, dx, dy),
  }));

const harp: AnimalDef = {
  id: 'harp',
  name: 'Harp',
  kind: 'object',
  aliases: ['lyre', 'music', 'david', "david's harp"],
  group: 'bible',
  habitats: ['bible'],
  box: [210, 249],
  size: 150,
  locomotion: 'wobble',
  sound: 'harp',
  palette: {
    wood: '#c98a4c',
    woodLight: '#e4ae6e',
    woodDark: '#a26a3c',
    hole: '#6e4329',
    gold: '#f7c948',
    string: '#eab53a',
    note: '#a395e6',
  },
  parts: offset(
    [
      {
        id: 'body',
        pivot: [CX, 160],
        shapes: [
          {
            d: smooth([
              [CX - 64, 198],
              [CX + 64, 198],
              [CX + 74, 220],
              [CX + 58, 248],
              [CX, 258],
              [CX - 58, 248],
              [CX - 74, 220],
            ]),
            fill: 'wood',
          },
          { d: ellipse(CX, 200, 70, 9), kind: 'detail', fill: 'woodLight' },
          { d: ellipse(CX - 34, 234, 12, 6, -20), kind: 'detail', fill: 'woodLight' },
          { d: circle(CX, 230, 12), kind: 'feature', fill: 'hole', stroke: 'gold', width: 3 },
          {
            d: circle(CX - 60, 214, 4.5),
            kind: 'feature',
            fill: 'gold',
            stroke: 'auto',
            width: 1.6,
          },
          {
            d: circle(CX + 60, 214, 4.5),
            kind: 'feature',
            fill: 'gold',
            stroke: 'auto',
            width: 1.6,
          },
        ],
        children: [
          {
            id: 'backing',
            behind: true,
            shapes: [
              {
                d: smooth([
                  [CX - 56, 62],
                  [CX - 66, 86],
                  [CX - 75, 124],
                  [CX - 69, 168],
                  [CX - 50, 204],
                  [CX + 50, 204],
                  [CX + 69, 168],
                  [CX + 75, 124],
                  [CX + 66, 86],
                  [CX + 56, 62],
                ]),
                kind: 'feature',
                fill: 'white',
                opacity: 0.01,
              },
            ],
          },
          arm('armL', -1),
          arm('armR', 1),
          {
            id: 'strings',
            shapes: strings,
          },
          {
            id: 'bar',
            shapes: [
              { d: capsule(CX - 66, BAR_Y, CX + 66, BAR_Y, 7.5), fill: 'woodDark' },
              ...pegs,
            ],
          },
          {
            id: 'bridge',
            shapes: [{ d: roundRect(CX - 40, BRIDGE_Y - 5, 80, 11, 5.5), fill: 'gold' }],
          },
          note('note1', CX + 100, 64, 0.85, 0),
          note('note2', CX + 90, 118, 0.68, 0.5),
        ],
      },
    ],
    -20,
    -11,
  ),
};

export default harp;
