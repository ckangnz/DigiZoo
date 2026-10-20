import { capsule, circle, curve, ellipse, leaf, tube, type Pt } from '../core/paths';
import type { AnimalDef, PartNode, Shape } from '../core/types';

const leg = (id: string, x: number, far: boolean): PartNode => {
  const fill = far ? 'skinDark' : 'skin';
  return {
    id,
    role: id,
    behind: true,
    pivot: [x, 200],
    shapes: [
      { d: capsule(x, 196, x, 250, 25, 24), fill },
      { d: ellipse(x + 4, 262, 29, 14), fill },
      ...(far
        ? []
        : [
            { d: `M${x + 6} 268L${x + 6} 275`, kind: 'line' as const, stroke: 'fold', width: 2.6 },
            {
              d: `M${x + 18} 267L${x + 18} 274`,
              kind: 'line' as const,
              stroke: 'fold',
              width: 2.6,
            },
          ]),
    ],
  };
};

const horn = (base: Pt, tip: Pt, w: number, lean: number): string => {
  const [bx, by] = base;
  const [tx, ty] = tip;
  const len = Math.hypot(tx - bx, ty - by);
  const nx = -(ty - by) / len;
  const ny = (tx - bx) / len;
  const mid: Pt = [(bx + tx) / 2 + nx * lean, (by + ty) / 2 + ny * lean];
  return tube([base, mid, tip], (t) => w * (1 - t) ** 0.85 + 3.6 * t, 40);
};

const ear = (x: number, y: number, angle: number): Shape[] => {
  const a = (angle * Math.PI) / 180;
  const tip: Pt = [x + Math.cos(a) * 24, y + Math.sin(a) * 24];
  return [
    { d: leaf(x, y, 27, 14.5, angle), fill: 'skin' },
    { d: leaf(x, y, 20, 7.5, angle), kind: 'detail', fill: 'earInner' },
    { d: leaf(tip[0], tip[1], 9, 3.5, angle - 28), fill: 'tuft' },
    { d: leaf(tip[0], tip[1], 9, 3.5, angle + 28), fill: 'tuft' },
    { d: leaf(tip[0], tip[1], 11, 4, angle), fill: 'tuft' },
  ];
};

const rhino: AnimalDef = {
  id: 'rhino',
  name: 'Rhino',
  aliases: ['rhinoceros', 'rino'],
  group: 'mammal',
  habitats: ['safari'],
  box: [380, 280],
  size: 230,
  locomotion: 'walk4',
  gait: { period: 0.95, swing: 18, stride: 78 },
  sound: 'rhino',
  palette: {
    skin: '#b6ada5',
    skinDark: '#9b9088',
    muzzle: '#d0c7be',
    belly: '#c9c0b7',
    horn: '#f2e5cb',
    earInner: '#f0b0b8',
    tuft: '#6f6964',
    fold: '#8a7f77',
  },
  parts: [
    {
      id: 'body',
      role: 'body',
      pivot: [170, 200],
      shapes: [
        { d: ellipse(170, 175, 106, 71), fill: 'skin' },
        { d: ellipse(176, 238, 80, 22), kind: 'detail', fill: 'belly' },
        { d: curve(204, 108, 214, 196, 16), kind: 'line', stroke: 'fold', width: 3 },
        { d: curve(126, 112, 116, 190, 14), kind: 'line', stroke: 'fold', width: 3 },
      ],
      children: [
        {
          id: 'tail',
          role: 'tail',
          pivot: [68, 162],
          behind: true,
          shapes: [
            {
              d: tube(
                [
                  [72, 158],
                  [54, 168],
                  [46, 186],
                ],
                4.2,
              ),
              fill: 'skin',
            },
            { d: leaf(46, 183, 15, 5.5, 95), fill: 'tuft' },
            { d: leaf(46, 183, 13, 5, 120), fill: 'tuft' },
            { d: leaf(46, 183, 13, 5, 70), fill: 'tuft' },
          ],
        },
        leg('legBF', 132, true),
        leg('legFF', 248, true),
        leg('legBN', 102, false),
        leg('legFN', 218, false),
        {
          id: 'head',
          role: 'head',
          pivot: [248, 170],
          shapes: [
            ...ear(236, 86, -120),
            ...ear(292, 76, -76),
            { d: ellipse(270, 124, 56, 52), fill: 'skin' },
            { d: ellipse(320, 157, 50, 34, -8), fill: 'skin' },
            { d: ellipse(326, 161, 42, 27, -8), kind: 'detail', fill: 'muzzle' },
            { d: ellipse(240, 152, 11, 7), kind: 'feature', fill: 'blush', opacity: 0.55 },
            { d: ellipse(300, 154, 9, 6), kind: 'feature', fill: 'blush', opacity: 0.55 },
            { d: circle(250, 120, 9), kind: 'feature', fill: 'eye' },
            { d: circle(290, 115, 8.4), kind: 'feature', fill: 'eye' },
            { d: circle(253.4, 116.4, 3.4), kind: 'feature', fill: 'shine' },
            { d: circle(293.2, 111.6, 3.2), kind: 'feature', fill: 'shine' },
            { d: ellipse(364, 155, 3.6, 5, 10), kind: 'feature', fill: 'nose' },
            { d: curve(320, 178, 350, 173, 5), kind: 'line', stroke: 'mouth', width: 3 },
          ],
          children: [
            {
              id: 'horns',
              shapes: [
                { d: horn([313, 131], [311, 102], 10, 3), fill: 'horn' },
                { d: horn([343, 140], [339, 78], 16, 9), fill: 'horn' },
              ],
            },
          ],
        },
      ],
    },
  ],
};

export default rhino;
