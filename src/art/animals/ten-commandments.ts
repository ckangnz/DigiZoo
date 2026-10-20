import { circle, rotatePath, smooth, translatePath } from '../core/paths';
import type { AnimalDef, PartNode, Shape } from '../core/types';

const W = 112;
const H = 192;
const TOP = 26;
const BOTTOM = TOP + H;
const LX = 86;
const RX = 200;
const TILT = 3;

const tablet = (cx: number, top: number): string => {
  const x0 = cx - W / 2;
  const x1 = cx + W / 2;
  const ry = W * 0.44;
  const bottom = top + H;
  const r = 13;
  return (
    `M${x0} ${top + ry}A${W / 2} ${ry} 0 0 1 ${x1} ${top + ry}` +
    `L${x1} ${bottom - r}Q${x1} ${bottom} ${x1 - r} ${bottom}` +
    `L${x0 + r} ${bottom}Q${x0} ${bottom} ${x0} ${bottom - r}Z`
  );
};

const GLYPH = 18;
const GAP = 0.46 * GLYPH;

const glyphWidth = (c: string) => (c === 'I' ? 0 : 0.64 * GLYPH);

const numeral = (text: string, cx: number, cy: number): string => {
  const chars = text.split('');
  const total = chars.reduce((sum, c) => sum + glyphWidth(c), 0) + GAP * (chars.length - 1);
  let x = cx - total / 2;
  const top = cy - GLYPH / 2;
  const bottom = cy + GLYPH / 2;
  let d = '';
  for (const c of chars) {
    const w = glyphWidth(c);
    if (c === 'I') d += `M${x} ${top}L${x} ${bottom}`;
    if (c === 'V') d += `M${x} ${top}L${x + w / 2} ${bottom}L${x + w} ${top}`;
    if (c === 'X') d += `M${x} ${top}L${x + w} ${bottom}M${x + w} ${top}L${x} ${bottom}`;
    x += w + GAP;
  }
  return d;
};

const ROWS = [70, 100, 130, 160, 190];

const stoneTablet = (id: string, cx: number, side: -1 | 1, numerals: string[]): PartNode => {
  const pivot: [number, number] = [cx - side * (W / 2), BOTTOM];
  const tilt = (d: string) => rotatePath(d, side * TILT, pivot[0], pivot[1]);
  const shapes: Shape[] = [
    { d: tilt(translatePath(tablet(cx, TOP), side * 8, 6)), fill: 'stoneSide' },
    { d: tilt(tablet(cx, TOP)), fill: 'stone' },
    {
      d: tilt(
        smooth([
          [cx - W / 2 + 14, TOP + 52],
          [cx - W / 2 + 22, TOP + 26],
          [cx - W / 2 + 40, TOP + 12],
          [cx - W / 2 + 30, TOP + 30],
          [cx - W / 2 + 22, TOP + 58],
        ]),
      ),
      kind: 'detail',
      fill: 'stoneLight',
    },
    { d: tilt(circle(cx + side * 34, TOP + 150, 3)), kind: 'detail', fill: 'speck' },
    { d: tilt(circle(cx - side * 36, TOP + 104, 2.4)), kind: 'detail', fill: 'speck' },
    { d: tilt(circle(cx + side * 30, TOP + 44, 2.2)), kind: 'detail', fill: 'speck' },
    ...numerals.map((text, i): Shape => ({
      d: tilt(translatePath(numeral(text, cx, ROWS[i]), 0.8, 1.6)),
      kind: 'line',
      stroke: 'stoneLight',
      width: 3.8,
    })),
    ...numerals.map((text, i): Shape => ({
      d: tilt(numeral(text, cx, ROWS[i])),
      kind: 'line',
      stroke: 'carve',
      width: 3.8,
    })),
  ];
  return { id, pivot, shapes };
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

const tenCommandments: AnimalDef = {
  id: 'ten-commandments',
  name: 'Ten Commandments',
  kind: 'object',
  aliases: ['tablets', 'stone tablets', 'moses', 'commandments', 'tablets of stone'],
  group: 'bible',
  habitats: ['bible'],
  box: [286, 236],
  size: 160,
  locomotion: 'wobble',
  gait: { period: 1.6 },
  sound: 'ten-commandments',
  palette: {
    stone: '#c3c8d3',
    stoneSide: '#9ca3b4',
    stoneLight: '#e1e5ec',
    speck: '#a9b0be',
    carve: '#6f7689',
    glint: '#ffe58a',
  },
  parts: [
    {
      id: 'tablets',
      pivot: [143, BOTTOM],
      children: [
        stoneTablet('left', LX, -1, ['I', 'II', 'III', 'IV', 'V']),
        stoneTablet('right', RX, 1, ['VI', 'VII', 'VIII', 'IX', 'X']),
        sparkle('glintL', 24, 30, 13, 0),
        sparkle('glintR', 266, 46, 10, 0.5),
      ],
    },
  ],
};

export default tenCommandments;
