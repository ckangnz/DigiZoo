import { capsule, circle, curve, ellipse, smooth, tube, type Pt } from '../core/paths';
import type { AnimalDef, PartNode, Shape } from '../core/types';

const FAN: Pt = [140, 150];
const FAN_R = 136;
const TIP_R = 24;
const ANGLES = Array.from({ length: 11 }, (_, i) => 165 + 21 * i);

const polar = (r: number, deg: number): Pt => {
  const a = (deg * Math.PI) / 180;
  return [FAN[0] + Math.cos(a) * r, FAN[1] + Math.sin(a) * r];
};

const feather = (deg: number): Shape => {
  const [x, y] = polar(FAN_R - TIP_R, deg);
  return { d: capsule(FAN[0], FAN[1], x, y, 10, TIP_R), fill: 'fan' };
};

const BANDS: [number, string][] = [
  [FAN_R + 4, 'fanTip'],
  [FAN_R - 18, 'fanDark'],
  [FAN_R - 32, 'fanTan'],
  [FAN_R - 54, 'fanDark'],
  [FAN_R - 70, 'fan'],
];

const seam = (deg: number): Shape => {
  const [x1, y1] = polar(40, deg);
  const [x2, y2] = polar(FAN_R - 22, deg);
  return { d: `M${x1} ${y1}L${x2} ${y2}`, kind: 'line', stroke: 'fanLine', width: 2.4 };
};

const HIP = 228;

const leg = (id: string, x: number, far: boolean): PartNode => {
  const fill = far ? 'legDark' : 'leg';
  return {
    id,
    role: id,
    behind: true,
    pivot: [x, HIP],
    shapes: [
      { d: capsule(x, HIP, x + 2, 264, 8, 6), fill },
      { d: capsule(x + 2, 270, x + 28, 273, 5.4, 4.2), fill },
      { d: capsule(x + 2, 270, x - 13, 274, 5, 3.8), fill },
    ],
  };
};

const turkey: AnimalDef = {
  id: 'turkey',
  name: 'Turkey',
  kind: 'animal',
  aliases: ['gobble', 'gobble gobble', 'gobbler', 'bird'],
  group: 'bird',
  habitats: ['farm'],
  box: [300, 280],
  size: 160,
  locomotion: 'walk2',
  gait: { stride: 76, swing: 22 },
  sound: 'turkey',
  palette: {
    body: '#7d4a2c',
    wing: '#a8693c',
    wingLine: '#6e3d20',
    fan: '#c27a40',
    fanTan: '#dca061',
    fanDark: '#6b3b22',
    fanTip: '#f7e6c4',
    fanLine: '#8a4f2a',
    head: '#8fd0f2',
    wattle: '#ea4b4b',
    beak: '#f5c35e',
    leg: '#ef9a6c',
    legDark: '#d47f55',
  },
  parts: [
    {
      id: 'body',
      role: 'body',
      pivot: [150, 236],
      shapes: [
        {
          d: smooth([
            [150, 128],
            [190, 134],
            [218, 154],
            [228, 186],
            [218, 218],
            [190, 240],
            [150, 248],
            [110, 240],
            [82, 218],
            [74, 186],
            [84, 154],
            [112, 134],
          ]),
          fill: 'body',
        },
      ],
      children: [
        {
          id: 'tail',
          role: 'tail',
          behind: true,
          pivot: [FAN[0], FAN[1] + 40],
          motion: { rotate: 2, phase: 0.25 },
          shapes: [
            ...ANGLES.map(feather),
            ...BANDS.map(([r, fill]): Shape => ({
              d: circle(FAN[0], FAN[1], r),
              kind: 'detail',
              fill,
            })),
            ...ANGLES.slice(0, -1).map((a) => seam(a + 10.5)),
          ],
        },
        leg('legF', 134, true),
        leg('legN', 162, false),
        {
          id: 'head',
          role: 'head',
          behind: true,
          pivot: [214, 160],
          shapes: [
            {
              d: tube(
                [
                  [204, 170],
                  [226, 144],
                  [240, 116],
                  [246, 96],
                ],
                (t) => 17 - 3 * t,
              ),
              fill: 'head',
            },
            { d: circle(248, 80, 33), fill: 'head' },
            { d: ellipse(270, 108, 9, 14, -8), fill: 'wattle' },
            { d: ellipse(264, 124, 8.5, 12, 12), fill: 'wattle' },
            { d: ellipse(273, 128, 6.5, 9, -6), fill: 'wattle' },
            { d: ellipse(244, 96, 9, 5.5), kind: 'feature', fill: 'blush', opacity: 0.55 },
            { d: circle(255, 73, 9.4), kind: 'feature', fill: 'eye' },
            { d: circle(258.6, 69.4, 3.5), kind: 'feature', fill: 'shine' },
          ],
          children: [
            {
              id: 'snood',
              pivot: [270, 64],
              motion: { rotate: 5, phase: 0.4 },
              shapes: [
                {
                  d: tube(
                    [
                      [268, 62],
                      [281, 64],
                      [290, 76],
                      [292, 100],
                    ],
                    (t) => 4.4 + 2.6 * t,
                  ),
                  fill: 'wattle',
                },
              ],
            },
            {
              id: 'beak',
              pivot: [274, 84],
              shapes: [{ d: 'M274 72Q292 76 299 88Q291 97 272 94Z', fill: 'beak' }],
            },
          ],
        },
        {
          id: 'wing',
          role: 'wingN',
          pivot: [180, 170],
          shapes: [
            {
              d: smooth([
                [150, 160],
                [190, 164],
                [206, 186],
                [198, 210],
                [170, 222],
                [134, 222],
                [106, 210],
                [88, 196],
                [110, 182],
                [128, 170],
              ]),
              fill: 'wing',
            },
            { d: curve(116, 202, 164, 208, 6), kind: 'line', stroke: 'wingLine', width: 2.6 },
            { d: curve(130, 186, 178, 190, 6), kind: 'line', stroke: 'wingLine', width: 2.6 },
          ],
        },
      ],
    },
  ],
};

export default turkey;
