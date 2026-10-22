import { capsule, circle, curve, ellipse, smooth, translatePath, type Pt } from '../core/paths';
import type { AnimalDef, PartNode } from '../core/types';

const HIP = 204;
const GROUND = 249;

const leg = (id: string, x: number, far: boolean): PartNode => {
  const fill = far ? 'legDark' : 'leg';
  const foot: Pt[] = [
    [x - 6, GROUND - 13],
    [x + 6, GROUND - 14],
    [x + 20, GROUND - 11],
    [x + 31, GROUND - 6],
    [x + 31, GROUND - 1],
    [x + 14, GROUND],
    [x - 4, GROUND - 1],
    [x - 9, GROUND - 6],
  ];
  return {
    id,
    role: id,
    behind: true,
    pivot: [x, HIP],
    shapes: [
      { d: capsule(x, HIP, x + 1, GROUND - 12, 6.5, 5.5), fill },
      { d: smooth(foot), fill },
      ...(far
        ? []
        : [
            {
              d: curve(x + 4, GROUND - 8, x + 24, GROUND - 4, 1.5),
              kind: 'line' as const,
              stroke: 'toe',
              width: 2,
            },
            {
              d: curve(x + 2, GROUND - 4, x + 16, GROUND - 1.5, 1),
              kind: 'line' as const,
              stroke: 'toe',
              width: 2,
            },
          ]),
    ],
  };
};

const BODY = smooth([
  [128, 28],
  [156, 34],
  [174, 52],
  [180, 76],
  [176, 100],
  [170, 116],
  [182, 140],
  [186, 170],
  [176, 200],
  [150, 220],
  [116, 224],
  [84, 214],
  [62, 192],
  [54, 162],
  [60, 128],
  [74, 96],
  [86, 64],
  [102, 40],
]);

const BEAK = 'M150 54L172 49Q204 49 221 78Q229 90 221 98Q200 106 172 113L150 108Z';

const offset = (parts: PartNode[], dx: number, dy: number): PartNode[] =>
  parts.map((p): PartNode => ({
    ...p,
    pivot: p.pivot && [p.pivot[0] + dx, p.pivot[1] + dy],
    shapes: p.shapes?.map((s) => ({ ...s, d: translatePath(s.d, dx, dy) })),
    children: p.children && offset(p.children, dx, dy),
  }));

const puffin: AnimalDef = {
  id: 'puffin',
  name: 'Puffin',
  kind: 'animal',
  aliases: ['sea parrot', 'atlantic puffin', 'puffling', 'bird'],
  group: 'bird',
  habitats: ['polar', 'birds'],
  box: [200, 228],
  size: 80,
  locomotion: 'walk2',
  gait: { stride: 60, swing: 22 },
  sound: 'puffin',
  palette: {
    back: '#2e2f3e',
    wing: '#3a3b4d',
    wingLine: '#22232f',
    face: '#eceff3',
    belly: '#fbfbf8',
    beak: '#ff6a2b',
    beakBase: '#55637a',
    beakLine: '#ffd24a',
    groove: '#ffb04a',
    eyeRing: '#ff7a4a',
    leg: '#ff8a2a',
    legDark: '#e06d16',
    toe: '#c75b12',
  },
  parts: offset(
    [
      {
        id: 'body',
        role: 'body',
        pivot: [120, HIP],
        shapes: [
          { d: BODY, fill: 'back' },
          { d: ellipse(144, 78, 38, 32, -8), kind: 'detail', fill: 'face' },
          { d: ellipse(152, 180, 46, 54), kind: 'detail', fill: 'belly' },
          { d: ellipse(160, 98, 8, 5), kind: 'feature', fill: 'blush', opacity: 0.55 },
          { d: circle(150, 70, 10.8), kind: 'feature', fill: 'eyeRing' },
          { d: circle(150, 70, 8.6), kind: 'feature', fill: 'eye' },
          { d: circle(153, 66.6, 3.2), kind: 'feature', fill: 'shine' },
        ],
        children: [
          {
            id: 'tail',
            role: 'tail',
            behind: true,
            pivot: [66, 196],
            shapes: [{ d: 'M70 186Q50 198 36 214Q46 218 58 214Q70 208 80 200Z', fill: 'back' }],
          },
          leg('legF', 104, true),
          leg('legN', 128, false),
          {
            id: 'beak',
            behind: true,
            pivot: [176, 82],
            shapes: [
              { d: BEAK, fill: 'beak' },
              { d: 'M146 40L186 44Q196 80 186 118L146 118Z', kind: 'detail', fill: 'beakBase' },
              {
                d: 'M185 44Q195 80 185 118L192 118Q202 80 192 44Z',
                kind: 'detail',
                fill: 'beakLine',
              },
              { d: curve(204, 56, 205, 104, -4), kind: 'line', stroke: 'groove', width: 2.2 },
              { d: curve(213, 66, 214, 100, -3), kind: 'line', stroke: 'groove', width: 2.2 },
              { d: curve(180, 98, 220, 95, -2), kind: 'line', stroke: 'wingLine', width: 1.8 },
              { d: circle(181, 99, 3.6), kind: 'feature', fill: 'beakLine' },
            ],
          },
          {
            id: 'wing',
            role: 'wingN',
            pivot: [96, 116],
            shapes: [
              {
                d: smooth([
                  [96, 108],
                  [116, 118],
                  [122, 146],
                  [114, 176],
                  [96, 200],
                  [78, 208],
                  [72, 194],
                  [74, 162],
                  [80, 130],
                ]),
                fill: 'wing',
              },
              { d: curve(100, 150, 92, 178, 3), kind: 'line', stroke: 'wingLine', width: 2.2 },
              { d: curve(110, 158, 100, 186, 3), kind: 'line', stroke: 'wingLine', width: 2.2 },
            ],
          },
        ],
      },
    ],
    -28,
    -22,
  ),
};

export default puffin;
