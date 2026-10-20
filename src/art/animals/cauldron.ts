import { capsule, circle, curve, ellipse, smooth, type Pt } from '../core/paths';
import type { AnimalDef, PartNode, Shape } from '../core/types';

const CX = 125;
const GROUND = 250;

const flame = (x: number, base: number, height: number, width: number): Shape[] => {
  const tip: Pt = [x + width * 0.15, base - height];
  const body = (k: number): string =>
    smooth([
      [x, base],
      [x + width * k, base - height * 0.25 * k],
      [x + width * 0.75 * k, base - height * 0.6],
      [tip[0], base - height * (0.4 + 0.6 * k)],
      [x - width * 0.6 * k, base - height * 0.55],
      [x - width * k, base - height * 0.22 * k],
    ]);
  return [
    { d: body(1), fill: 'flame' },
    { d: body(0.55), kind: 'detail', fill: 'flameCore' },
  ];
};

const bubble = (id: string, x: number, y: number, r: number, phase: number): PartNode => ({
  id,
  role: 'sparkle',
  phase,
  pivot: [x, y],
  shapes: [
    { d: circle(x, y, r), fill: 'bubble' },
    { d: circle(x + r * 0.35, y - r * 0.35, r * 0.28), kind: 'feature', fill: 'white' },
  ],
});

const leg = (id: string, x: number, lean: number): PartNode => ({
  id,
  behind: true,
  pivot: [x, 190],
  shapes: [
    { d: capsule(x, 186, x + lean, 228, 12, 10), fill: 'pot' },
    { d: ellipse(x + lean * 1.4, 236, 15, 9), fill: 'pot' },
  ],
});

const cauldron: AnimalDef = {
  id: 'cauldron',
  name: 'Cauldron',
  kind: 'object',
  aliases: ['witch pot', 'potion pot', 'magic pot', 'potion', 'bubbling pot', 'kettle'],
  group: 'spooky',
  habitats: ['halloween'],
  box: [250, GROUND],
  size: 150,
  locomotion: 'wobble',
  sound: 'cauldron',
  palette: {
    pot: '#40375a',
    potShine: '#5a4f7c',
    rim: '#584d78',
    rimShine: '#7a6ea0',
    potion: '#8fe36b',
    potionLight: '#c3f59a',
    bubble: '#b2ef86',
    flame: '#ff9a3c',
    flameCore: '#ffd84d',
    log: '#a8703f',
    logEnd: '#d9a46a',
    smile: '#e2d8f6',
    blush: '#ff8fbf',
  },
  parts: [
    {
      id: 'pot',
      pivot: [CX, 150],
      shapes: [
        {
          d: smooth([
            [CX - 70, 92],
            [CX + 70, 92],
            [CX + 96, 126],
            [CX + 92, 168],
            [CX + 64, 198],
            [CX, 208],
            [CX - 64, 198],
            [CX - 92, 168],
            [CX - 96, 126],
          ]),
          fill: 'pot',
        },
        { d: ellipse(CX - 60, 124, 11, 24, 24), kind: 'detail', fill: 'potShine' },
        { d: ellipse(CX - 50, 166, 11, 7), kind: 'feature', fill: 'blush', opacity: 0.6 },
        { d: ellipse(CX + 50, 166, 11, 7), kind: 'feature', fill: 'blush', opacity: 0.6 },
        { d: circle(CX - 30, 138, 15), kind: 'feature', fill: 'white' },
        { d: circle(CX + 30, 138, 15), kind: 'feature', fill: 'white' },
        { d: circle(CX - 28.5, 140, 10.5), kind: 'feature', fill: 'eye' },
        { d: circle(CX + 31.5, 140, 10.5), kind: 'feature', fill: 'eye' },
        { d: circle(CX - 24.5, 135.6, 4), kind: 'feature', fill: 'shine' },
        { d: circle(CX + 35.5, 135.6, 4), kind: 'feature', fill: 'shine' },
        { d: curve(CX - 14, 164, CX + 14, 164, 9), kind: 'line', stroke: 'smile', width: 3.4 },
      ],
      children: [
        leg('legL', CX - 62, -6),
        leg('legR', CX + 62, 6),
        {
          id: 'fire',
          role: 'flame',
          pivot: [CX, 240],
          shapes: [
            ...flame(CX - 27, 240, 36, 13),
            ...flame(CX + 27, 240, 38, 13),
            ...flame(CX, 242, 46, 18),
          ],
        },
        {
          id: 'logs',
          pivot: [CX, 238],
          shapes: [
            { d: capsule(CX - 42, 234, CX + 42, 243, 7), fill: 'log' },
            { d: capsule(CX - 42, 243, CX + 42, 234, 7), fill: 'log' },
            { d: ellipse(CX + 42, 234, 4, 6), kind: 'feature', fill: 'logEnd' },
            { d: ellipse(CX - 42, 234, 4, 6), kind: 'feature', fill: 'logEnd' },
          ],
        },
        {
          id: 'potion',
          pivot: [CX, 80],
          shapes: [
            { d: ellipse(CX, 84, 86, 16), fill: 'potion' },
            { d: circle(CX - 44, 76, 15), fill: 'potion' },
            { d: circle(CX - 6, 70, 20), fill: 'potion' },
            { d: circle(CX + 38, 76, 14), fill: 'potion' },
            { d: ellipse(CX - 12, 64, 8, 4.5, -20), kind: 'detail', fill: 'potionLight' },
            { d: ellipse(CX - 48, 70, 5, 3, -20), kind: 'detail', fill: 'potionLight' },
          ],
        },
        {
          id: 'rim',
          pivot: [CX, 92],
          shapes: [
            { d: capsule(CX - 100, 92, CX + 100, 92, 14), fill: 'rim' },
            { d: capsule(CX - 88, 86, CX - 30, 86, 3.2), kind: 'detail', fill: 'rimShine' },
          ],
        },
        bubble('bubble1', CX - 40, 44, 8, 0),
        bubble('bubble2', CX + 18, 34, 11, 0.33),
        bubble('bubble3', CX + 58, 52, 6.5, 0.66),
      ],
    },
  ],
};

export default cauldron;
