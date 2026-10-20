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
import type { AnimalDef, PartNode, Shape } from '../core/types';

const HIP_Y = 244;
const KNEE_Y = 312;
const SOLE = 382;

const foot = (x: number): string =>
  smooth([
    [x - 9, SOLE - 13],
    [x + 8, SOLE - 16],
    [x + 26, SOLE - 11],
    [x + 34, SOLE - 4],
    [x + 26, SOLE],
    [x + 4, SOLE],
    [x - 11, SOLE - 2],
    [x - 14, SOLE - 8],
  ]);

const leg = (id: string, role: string, x: number, far: boolean, phase: number): PartNode => {
  const fill = far ? 'skinFar' : 'skin';
  return {
    id,
    role,
    behind: true,
    pivot: [x, HIP_Y],
    shapes: [
      { d: capsule(x, HIP_Y, x + 5, KNEE_Y - 6, 23, 11.5), fill },
      { d: circle(x + 5, KNEE_Y, 10), fill },
    ],
    children: [
      {
        id: `${id}Shin`,
        behind: true,
        pivot: [x + 5, KNEE_Y],
        motion: { rotate: 26, wave: 'lift', phase },
        shapes: [
          { d: capsule(x + 5, KNEE_Y, x + 3, SOLE - 14, 7.5, 6.5), fill },
          { d: foot(x + 3), fill },
          ...(far
            ? []
            : [
                {
                  d: `M${x + 21} ${SOLE - 9}L${x + 24} ${SOLE - 3}`,
                  kind: 'line' as const,
                  stroke: 'skinLine',
                  width: 2.4,
                },
              ]),
        ],
      },
    ],
  };
};

const puffs = (pts: [number, number, number][], fill: string): Shape[] =>
  pts.map(([x, y, r]) => ({ d: circle(x, y, r), fill }));

const plume = (x: number, y: number, len: number, width: number, angle: number): Shape => ({
  d: leaf(x, y, len, width, angle),
  fill: 'plume',
});

const NECK: Pt[] = [
  [190, 200],
  [200, 164],
  [204, 128],
  [210, 98],
  [220, 76],
];

const offset = (parts: PartNode[], dx: number, dy: number): PartNode[] =>
  parts.map((p): PartNode => ({
    ...p,
    pivot: p.pivot && [p.pivot[0] + dx, p.pivot[1] + dy],
    shapes: p.shapes?.map((s) => ({ ...s, d: translatePath(s.d, dx, dy) })),
    children: p.children && offset(p.children, dx, dy),
  }));

const ostrich: AnimalDef = {
  id: 'ostrich',
  name: 'Ostrich',
  kind: 'animal',
  aliases: ['big bird', 'ostritch', 'bird'],
  group: 'bird',
  habitats: ['safari'],
  box: [316, 372],
  size: 300,
  locomotion: 'walk2',
  gait: { period: 0.8, stride: 120, swing: 15 },
  sound: 'ostrich',
  palette: {
    body: '#3b3545',
    bodyLight: '#57506a',
    plume: '#fdfbf7',
    plumeLine: '#d9d1dc',
    skin: '#e8bcbb',
    skinFar: '#d0a1a3',
    skinLine: '#b07f80',
    beak: '#f3be9c',
    beakLine: '#c48a63',
    lash: '#2b1d1a',
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
              [206, 168],
              [218, 200],
              [210, 232],
              [184, 256],
              [140, 266],
              [96, 264],
              [58, 248],
              [34, 220],
              [30, 190],
              [44, 162],
              [76, 142],
              [120, 134],
              [168, 142],
            ]),
            fill: 'body',
          },
          ...puffs(
            [
              [52, 240, 17],
              [78, 258, 17],
              [106, 266, 16],
              [136, 266, 16],
              [164, 258, 16],
              [188, 242, 15],
            ],
            'body',
          ),
          { d: curve(70, 166, 108, 154, 7), kind: 'line', stroke: 'bodyLight', width: 3 },
          { d: curve(124, 150, 164, 152, 7), kind: 'line', stroke: 'bodyLight', width: 3 },
          { d: curve(178, 178, 200, 200, 6), kind: 'line', stroke: 'bodyLight', width: 3 },
        ],
        children: [
          {
            id: 'tail',
            role: 'tail',
            behind: true,
            pivot: [44, 186],
            shapes: [
              plume(52, 190, 64, 22, 196),
              plume(50, 180, 66, 22, 218),
              plume(56, 172, 62, 21, 240),
              plume(64, 166, 52, 18, 262),
              plume(52, 200, 54, 19, 174),
              { d: curve(10, 176, 40, 186, 4), kind: 'line', stroke: 'plumeLine', width: 2.6 },
              { d: curve(26, 140, 46, 170, 4), kind: 'line', stroke: 'plumeLine', width: 2.6 },
            ],
          },
          leg('legF', 'legF', 108, true, 0.25),
          leg('legN', 'legN', 138, false, -0.25),
          {
            id: 'head',
            role: 'head',
            behind: true,
            pivot: [194, 196],
            shapes: [
              { d: tube(NECK, (t) => 16 - 5.5 * t, 60), fill: 'skin' },
              { d: 'M246 56Q276 50 290 62Q293 76 274 80Q256 82 242 76Z', fill: 'beak' },
              { d: circle(226, 60, 30), fill: 'skin' },
              { d: circle(216, 30, 8), fill: 'skin' },
              { d: circle(228, 28, 7.5), fill: 'skin' },
              { d: circle(206, 37, 7), fill: 'skin' },
              { d: 'M252 69Q268 71 285 67', kind: 'line', stroke: 'beakLine', width: 2.4 },
              { d: ellipse(281, 60, 2.6, 1.8, -10), kind: 'feature', fill: 'beakLine' },
              { d: ellipse(229, 80, 9, 5.5), kind: 'feature', fill: 'blush', opacity: 0.55 },
              { d: circle(234, 55, 12), kind: 'feature', fill: 'eye' },
              { d: circle(238.4, 50.2, 4.6), kind: 'feature', fill: 'shine' },
              { d: 'M227 44L222.5 37.5', kind: 'line', stroke: 'lash', width: 2.8 },
              { d: 'M234 42L233.5 34', kind: 'line', stroke: 'lash', width: 2.8 },
              { d: 'M241 44L245 37.5', kind: 'line', stroke: 'lash', width: 2.8 },
            ],
          },
          {
            id: 'wing',
            role: 'wingN',
            pivot: [172, 186],
            shapes: [
              plume(178, 182, 124, 25, 168),
              plume(178, 188, 114, 26, 154),
              plume(176, 194, 100, 25, 140),
              plume(172, 198, 84, 22, 126),
              { d: ellipse(160, 196, 26, 20, -20), fill: 'plume' },
              { d: curve(92, 202, 150, 196, 5), kind: 'line', stroke: 'plumeLine', width: 2.6 },
              { d: curve(106, 226, 156, 206, 5), kind: 'line', stroke: 'plumeLine', width: 2.6 },
            ],
          },
        ],
      },
    ],
    14,
    -12,
  ),
};

export default ostrich;
