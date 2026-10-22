import { capsule, circle, curve, ellipse, leaf, smooth, translatePath } from '../core/paths';
import type { AnimalDef, PartNode } from '../core/types';

const HIP_Y = 184;
const SOLE = 224;

const leg = (id: string, role: string, x: number, far: boolean): PartNode => {
  const fill = far ? 'legDark' : 'leg';
  return {
    id,
    role,
    behind: true,
    pivot: [x, HIP_Y],
    motion: { rotate: 26, wave: 'lift' },
    shapes: [
      { d: capsule(x, HIP_Y, x + 2, SOLE - 5, 4.2, 3.4), fill },
      { d: capsule(x + 2, SOLE - 3, x + 17, SOLE - 1.5, 3.2, 2.5), fill },
      { d: capsule(x + 2, SOLE - 3, x - 9, SOLE - 0.5, 3, 2.4), fill },
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

const robin: AnimalDef = {
  id: 'robin',
  name: 'Robin',
  kind: 'animal',
  aliases: ['robin redbreast', 'european robin', 'redbreast', 'bird'],
  group: 'bird',
  habitats: ['birds', 'forest'],
  box: [228, 199],
  size: 60,
  locomotion: 'hop',
  gait: { period: 0.6, stride: 70, lift: 34 },
  sound: 'robin',
  palette: {
    brown: '#a07a52',
    brownDark: '#86633f',
    wingLine: '#6e5032',
    breast: '#fa7638',
    grey: '#bcc4d2',
    belly: '#fdf6ec',
    beak: '#4a3b35',
    leg: '#c99a86',
    legDark: '#ad8070',
  },
  parts: offset(
    [
      {
        id: 'body',
        role: 'body',
        pivot: [124, 190],
        shapes: [
          {
            d: smooth([
              [150, 36],
              [186, 48],
              [208, 76],
              [214, 110],
              [206, 146],
              [184, 176],
              [148, 192],
              [108, 192],
              [74, 176],
              [52, 150],
              [44, 120],
              [56, 84],
              [84, 54],
              [116, 38],
            ]),
            fill: 'brown',
          },
          { d: ellipse(166, 128, 66, 70, -10), kind: 'detail', fill: 'grey' },
          { d: ellipse(176, 124, 58, 64, -10), kind: 'detail', fill: 'breast' },
          { d: ellipse(132, 196, 64, 34), kind: 'detail', fill: 'belly' },
          { d: 'M204 92L228 100L204 110Z', fill: 'beak' },
          { d: ellipse(182, 122, 9, 5.5), kind: 'feature', fill: 'blush', opacity: 0.6 },
          { d: circle(180, 90, 10.5), kind: 'feature', fill: 'eye' },
          { d: circle(183.8, 85.8, 4), kind: 'feature', fill: 'shine' },
          { d: curve(196, 112, 204, 110, 2), kind: 'line', stroke: 'mouth', width: 2.4 },
        ],
        children: [
          {
            id: 'tail',
            role: 'tail',
            behind: true,
            pivot: [60, 160],
            shapes: [
              { d: leaf(66, 160, 52, 15, 208), fill: 'brownDark' },
              { d: leaf(66, 166, 46, 13, 192), fill: 'brownDark' },
            ],
          },
          leg('legF', 'legFF', 112, true),
          leg('legN', 'legBN', 134, false),
          {
            id: 'wing',
            role: 'wing',
            pivot: [120, 120],
            shapes: [
              {
                d: smooth([
                  [128, 110],
                  [142, 128],
                  [136, 154],
                  [114, 172],
                  [84, 176],
                  [56, 168],
                  [40, 156],
                  [60, 140],
                  [84, 122],
                  [106, 110],
                ]),
                fill: 'brownDark',
              },
              { d: curve(64, 156, 112, 152, 6), kind: 'line', stroke: 'wingLine', width: 2.4 },
              { d: curve(82, 140, 126, 134, 6), kind: 'line', stroke: 'wingLine', width: 2.4 },
            ],
          },
        ],
      },
    ],
    -10,
    -27,
  ),
};

export default robin;
