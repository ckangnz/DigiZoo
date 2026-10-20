import {
  capsule,
  circle,
  curve,
  ellipse,
  leaf,
  smooth,
  translatePath,
  tube,
  type Pt,
} from '../core/paths';
import type { AnimalDef, PartNode } from '../core/types';

const HIP_Y = 214;
const KNEE_Y = 290;
const SOLE = 358;

const foot = (x: number): string =>
  smooth([
    [x - 6, SOLE - 9],
    [x + 8, SOLE - 9],
    [x + 22, SOLE - 4],
    [x + 24, SOLE],
    [x + 2, SOLE],
    [x - 10, SOLE - 1],
    [x - 11, SOLE - 6],
  ]);

const leg = (id: string, role: string, x: number, far: boolean, phase: number): PartNode => {
  const fill = far ? 'legFar' : 'leg';
  return {
    id,
    role,
    behind: true,
    pivot: [x, HIP_Y],
    shapes: [
      { d: capsule(x, HIP_Y, x + 3, KNEE_Y - 4, 9, 5.2), fill },
      { d: circle(x + 3, KNEE_Y, 7), fill },
    ],
    children: [
      {
        id: `${id}Shin`,
        behind: true,
        pivot: [x + 3, KNEE_Y],
        motion: { rotate: 28, wave: 'lift', phase },
        shapes: [
          { d: capsule(x + 3, KNEE_Y, x + 1, SOLE - 7, 4.6, 4.2), fill },
          { d: foot(x + 1), fill },
        ],
      },
    ],
  };
};

const NECK: Pt[] = [
  [184, 186],
  [204, 154],
  [204, 120],
  [186, 98],
  [168, 76],
  [166, 50],
  [180, 32],
  [198, 26],
];

const offset = (parts: PartNode[], dx: number, dy: number): PartNode[] =>
  parts.map((p): PartNode => ({
    ...p,
    pivot: p.pivot && [p.pivot[0] + dx, p.pivot[1] + dy],
    shapes: p.shapes?.map((s) => ({ ...s, d: translatePath(s.d, dx, dy) })),
    children: p.children && offset(p.children, dx, dy),
  }));

const flamingo: AnimalDef = {
  id: 'flamingo',
  name: 'Flamingo',
  kind: 'animal',
  aliases: ['pink bird', 'flemingo', 'bird'],
  group: 'bird',
  habitats: ['safari'],
  box: [266, 360],
  size: 260,
  locomotion: 'walk2',
  gait: { period: 0.85, stride: 92, swing: 14 },
  sound: 'flamingo',
  palette: {
    body: '#f8a3b6',
    bodyLight: '#fcc8d3',
    wing: '#f17f9c',
    wingLine: '#d8607f',
    tail: '#ec7896',
    leg: '#f597ad',
    legFar: '#dc7f98',
    beak: '#fdeceb',
    beakTip: '#2f2833',
  },
  parts: offset(
    [
      {
        id: 'body',
        role: 'body',
        pivot: [124, HIP_Y],
        shapes: [
          {
            d: smooth([
              [206, 178],
              [198, 206],
              [172, 224],
              [132, 230],
              [94, 224],
              [62, 208],
              [44, 188],
              [52, 170],
              [80, 160],
              [120, 156],
              [164, 156],
              [194, 162],
            ]),
            fill: 'body',
          },
          { d: ellipse(184, 196, 26, 22, -20), kind: 'detail', fill: 'bodyLight' },
        ],
        children: [
          {
            id: 'tail',
            role: 'tail',
            behind: true,
            pivot: [54, 184],
            shapes: [
              { d: leaf(60, 186, 44, 13, 192), fill: 'tail' },
              { d: leaf(58, 180, 40, 12, 210), fill: 'tail' },
              { d: leaf(62, 192, 36, 11, 172), fill: 'tail' },
            ],
          },
          leg('legF', 'legF', 112, true, 0.25),
          leg('legN', 'legN', 136, false, -0.25),
          {
            id: 'head',
            role: 'head',
            behind: true,
            pivot: [186, 184],
            shapes: [
              { d: tube(NECK, (t) => 13 - 4.5 * t, 80), fill: 'body' },
              { d: circle(206, 34, 25), fill: 'body' },
              {
                d: smooth([
                  [224, 22],
                  [244, 21],
                  [258, 30],
                  [263, 46],
                  [259, 62],
                  [252, 64],
                  [249, 52],
                  [241, 45],
                  [224, 47],
                ]),
                fill: 'beak',
              },
              {
                d: 'M251 34L274 28L274 72L245 72Z',
                kind: 'detail',
                fill: 'beakTip',
              },
              { d: curve(229, 35, 251, 39, 3), kind: 'line', stroke: 'wingLine', width: 2.2 },
              { d: ellipse(205, 48, 8, 5), kind: 'feature', fill: 'blush', opacity: 0.6 },
              { d: circle(211, 29, 9.5), kind: 'feature', fill: 'eye' },
              { d: circle(214.4, 25.2, 3.6), kind: 'feature', fill: 'shine' },
            ],
          },
          {
            id: 'wing',
            role: 'wingN',
            pivot: [160, 176],
            shapes: [
              {
                d: smooth([
                  [178, 172],
                  [182, 192],
                  [166, 210],
                  [132, 218],
                  [96, 212],
                  [64, 198],
                  [48, 186],
                  [78, 178],
                  [118, 170],
                  [150, 166],
                ]),
                fill: 'wing',
              },
              { d: curve(92, 196, 140, 196, 6), kind: 'line', stroke: 'wingLine', width: 2.6 },
              { d: curve(112, 182, 158, 182, 6), kind: 'line', stroke: 'wingLine', width: 2.6 },
            ],
          },
        ],
      },
    ],
    -8,
    0,
  ),
};

export default flamingo;
