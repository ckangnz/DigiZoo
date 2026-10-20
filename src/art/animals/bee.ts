import {
  capsule,
  circle,
  curve,
  ellipse,
  smooth,
  translatePath,
  tube,
  type Pt,
} from '../core/paths';
import type { AnimalDef, PartNode, Shape } from '../core/types';

const stripe = (x: number, r: number): Shape => ({
  d: tube(
    [
      [x + 9, 62],
      [x, 130],
      [x + 9, 198],
    ],
    r,
  ),
  kind: 'detail',
  fill: 'stripe',
});

const antenna = (id: string, pts: Pt[]): PartNode => ({
  id,
  role: 'antenna',
  behind: true,
  pivot: pts[0],
  shapes: [
    { d: smooth(pts, false), kind: 'line', stroke: 'stripe', width: 3.4 },
    { d: circle(pts[pts.length - 1][0], pts[pts.length - 1][1], 4.2), fill: 'stripe' },
  ],
});

const wing = (
  id: string,
  cx: number,
  cy: number,
  rx: number,
  ry: number,
  rot: number,
  pivot: Pt,
): PartNode => ({
  id,
  role: id,
  behind: id === 'wingF',
  pivot,
  motion: { scaleX: id === 'wingF' ? -0.42 : -0.52, wave: 'abs', phase: id === 'wingF' ? 0.06 : 0 },
  shapes: [
    { d: ellipse(cx, cy, rx, ry, rot), fill: 'wing' },
    {
      d: curve(pivot[0], pivot[1] - 6, cx - (pivot[0] - cx) * 0.4, cy - (pivot[1] - cy) * 0.4, 5),
      kind: 'line',
      stroke: 'wingLine',
      width: 2.4,
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

const bee: AnimalDef = {
  id: 'bee',
  name: 'Bee',
  kind: 'animal',
  aliases: ['bumblebee', 'bumble bee', 'honeybee', 'honey bee', 'buzz', 'bug'],
  group: 'bug',
  habitats: ['farm'],
  box: [196, 204],
  size: 50,
  locomotion: 'flutter',
  sound: 'bee',
  palette: {
    body: '#ffcf3a',
    stripe: '#3b2c2a',
    wing: '#e8f5ff',
    wingLine: '#a9d2f0',
  },
  parts: offset(
    [
      {
        id: 'body',
        pivot: [118, 132],
        shapes: [
          { d: capsule(52, 134, 30, 137, 7, 2.6), fill: 'stripe' },
          { d: ellipse(118, 132, 76, 60), fill: 'body' },
          stripe(28, 9),
          stripe(62, 10.5),
          stripe(98, 11),
          { d: ellipse(143, 150, 8.5, 5.4), kind: 'feature', fill: 'blush', opacity: 0.6 },
          { d: ellipse(181, 149, 7.5, 5), kind: 'feature', fill: 'blush', opacity: 0.6 },
          { d: circle(154, 129, 8.8), kind: 'feature', fill: 'eye' },
          { d: circle(178, 128, 8.4), kind: 'feature', fill: 'eye' },
          { d: circle(157.2, 125.6, 3.3), kind: 'feature', fill: 'shine' },
          { d: circle(181, 124.8, 3.1), kind: 'feature', fill: 'shine' },
          { d: 'M159 145Q166 152 173 145', kind: 'line', stroke: 'mouth', width: 2.6 },
        ],
        children: [
          wing('wingF', 80, 44, 22, 36, -28, [94, 80]),
          antenna('antennaF', [
            [154, 84],
            [156, 62],
            [164, 46],
            [176, 42],
            [181, 50],
            [175, 56],
          ]),
          antenna('antennaN', [
            [174, 90],
            [182, 68],
            [194, 54],
            [208, 54],
            [211, 64],
            [203, 68],
          ]),
          wing('wingN', 110, 38, 25, 38, -12, [112, 80]),
        ],
      },
    ],
    -22,
    6,
  ),
};

export default bee;
