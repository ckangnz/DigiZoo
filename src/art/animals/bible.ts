import { capsule, roundRect, smooth } from '../core/paths';
import type { AnimalDef, PartNode } from '../core/types';

const X = 10;
const Y = 8;
const CW = 150;
const CH = 184;
const DX = 20;
const DY = 16;
const CX = X + 86;
const CY = Y + 84;

const pageLines = (): string => {
  let d = '';
  for (let k = 1; k <= 2; k++) {
    const t = k / 3;
    const x = X + CW + (DX - 6) * t;
    const y = Y + CH + (DY - 6) * t;
    d += `M${x} ${Y + 16 + DY * t}L${x} ${y - 4}`;
    d += `M${X + 18 + DX * t} ${y}L${x - 4} ${y}`;
  }
  return d;
};

const sparkle = (id: string, x: number, y: number, r: number, phase: number): PartNode => {
  const k = r * 0.32;
  return {
    id,
    role: 'sparkle',
    phase,
    pivot: [x, y],
    shapes: [
      {
        d: smooth(
          [
            [x, y - r],
            [x + k, y - k],
            [x + r, y],
            [x + k, y + k],
            [x, y + r],
            [x - k, y + k],
            [x - r, y],
            [x - k, y - k],
          ],
          true,
          0.4,
        ),
        fill: 'glint',
      },
    ],
  };
};

const RIBBON_X = X + CW - 34;
const RIBBON_TOP = Y + CH - 6;
const RIBBON_END = Y + CH + DY + 34;

const bible: AnimalDef = {
  id: 'bible',
  name: 'Bible',
  kind: 'object',
  aliases: ['book', 'holy bible', 'scripture', 'holy book', 'good book'],
  group: 'bible',
  habitats: ['bible'],
  box: [X + CW + DX + 10, Y + CH + DY + 42],
  size: 120,
  locomotion: 'wobble',
  gait: { period: 1.6 },
  sound: 'bible',
  palette: {
    cover: '#b8384a',
    coverDark: '#8f2a3d',
    coverLight: '#d45a68',
    gold: '#f6c64e',
    goldLight: '#ffe597',
    goldDark: '#d99a2f',
    ribbon: '#8a63d2',
    ribbonDark: '#6f4cb5',
    glint: '#fff1a6',
  },
  parts: [
    {
      id: 'book',
      pivot: [X + CW / 2, Y + CH / 2],
      children: [
        {
          id: 'back',
          shapes: [{ d: roundRect(X + DX, Y + DY, CW, CH, 14), fill: 'coverDark' }],
        },
        {
          id: 'pages',
          shapes: [
            { d: roundRect(X + 6, Y + 6, CW + DX - 12, CH + DY - 12, 6), fill: 'gold' },
            { d: pageLines(), kind: 'line', stroke: 'goldDark', width: 1.8 },
          ],
        },
        {
          id: 'ribbon',
          pivot: [RIBBON_X, RIBBON_TOP],
          motion: { rotate: 5, phase: 0.2 },
          shapes: [
            {
              d:
                `M${RIBBON_X - 8} ${RIBBON_TOP}L${RIBBON_X + 8} ${RIBBON_TOP}` +
                `L${RIBBON_X + 9} ${RIBBON_END}L${RIBBON_X} ${RIBBON_END - 9}` +
                `L${RIBBON_X - 9} ${RIBBON_END}Z`,
              fill: 'ribbon',
            },
            {
              d: `M${RIBBON_X - 3} ${RIBBON_TOP}L${RIBBON_X - 3} ${RIBBON_END - 8}`,
              kind: 'line',
              stroke: 'ribbonDark',
              width: 2,
            },
          ],
        },
        {
          id: 'cover',
          shapes: [
            { d: roundRect(X, Y, CW, CH, 14), fill: 'cover' },
            { d: roundRect(X - 10, Y - 10, 30, CH + 20, 10), kind: 'detail', fill: 'coverDark' },
            {
              d: smooth([
                [X + 34, Y + 22],
                [X + 64, Y + 14],
                [X + 46, Y + 26],
                [X + 32, Y + 52],
              ]),
              kind: 'detail',
              fill: 'coverLight',
            },
            {
              d: roundRect(X + 32, Y + 12, CW - 44, CH - 24, 8),
              kind: 'line',
              stroke: 'gold',
              width: 2.8,
            },
            {
              d: `M${X + CW - 30} ${Y - 4}L${X + CW + 4} ${Y - 4}L${X + CW + 4} ${Y + 30}Z`,
              kind: 'detail',
              fill: 'gold',
            },
            {
              d: `M${X + CW - 30} ${Y + CH + 4}L${X + CW + 4} ${Y + CH + 4}L${X + CW + 4} ${Y + CH - 30}Z`,
              kind: 'detail',
              fill: 'gold',
            },
            { d: capsule(X + 10, Y + 22, X + 10, Y + 34, 1.6), kind: 'feature', fill: 'gold' },
            {
              d: capsule(X + 10, Y + CH - 34, X + 10, Y + CH - 22, 1.6),
              kind: 'feature',
              fill: 'gold',
            },
          ],
          children: [
            {
              id: 'cross',
              pivot: [CX, CY],
              shapes: [
                { d: roundRect(CX - 10, CY - 52, 20, 112, 4), fill: 'gold' },
                { d: roundRect(CX - 36, CY - 26, 72, 20, 4), fill: 'gold' },
                { d: roundRect(CX - 6, CY - 48, 6, 46, 3), kind: 'detail', fill: 'goldLight' },
                { d: roundRect(CX - 32, CY - 22, 24, 6, 3), kind: 'detail', fill: 'goldLight' },
              ],
            },
            sparkle('glint', CX + 30, CY - 44, 11, 0),
          ],
        },
      ],
    },
  ],
};

export default bible;
