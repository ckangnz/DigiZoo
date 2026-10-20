import {
  capsule,
  circle,
  curve,
  ellipse,
  rotatePath,
  scalePath,
  scallop,
  smooth,
  translatePath,
  tube,
  type Pt,
} from '../core/paths';
import type { AnimalDef, PartNode, Shape } from '../core/types';

const SHOULDER: Pt = [178, 160];

const WING_SCALE = 0.88;

const place = (d: string, tilt: number): string =>
  rotatePath(
    translatePath(scalePath(d, WING_SCALE), SHOULDER[0], SHOULDER[1]),
    tilt,
    SHOULDER[0],
    SHOULDER[1],
  );

const PRIMARIES: [number, number, number, number][] = [
  [-46, -76, -134, 30],
  [-38, -92, -123, 36],
  [-26, -104, -112, 40],
  [-12, -111, -101, 42],
  [3, -111, -90, 40],
  [17, -102, -78, 32],
];

const primary = ([x, y, angle, len]: [number, number, number, number], fill: string): Shape => {
  const a = (angle * Math.PI) / 180;
  const tip: Pt = [x + Math.cos(a) * len, y + Math.sin(a) * len];
  const mid: Pt = [x + Math.cos(a) * len * 0.5, y + Math.sin(a) * len * 0.5];
  return { d: tube([[x, y], mid, tip], (t) => 9 - 4.5 * t, 24), fill };
};

const wing = (id: string, role: string, tilt: number, dark: boolean): PartNode => {
  const k = (name: string) => (dark ? `${name}Dark` : name);
  const raw: Shape[] = [
    ...PRIMARIES.map((p) => primary(p, k('quill'))),
    {
      d: smooth([
        [18, 6],
        [32, -22],
        [36, -58],
        [28, -92],
        [10, -112],
        [-12, -116],
        [-34, -104],
        [-50, -76],
        [-56, -42],
        [-46, -10],
        [-24, 6],
      ]),
      fill: k('wing'),
    },
    { d: ellipse(-6, -10, 50, 40), kind: 'detail', fill: k('covert') },
    { d: curve(-40, -54, 20, -66, -6), kind: 'line', stroke: k('quill'), width: 2.4 },
    { d: curve(-36, -78, 14, -90, -5), kind: 'line', stroke: k('quill'), width: 2.4 },
  ];
  return {
    id,
    role,
    pivot: SHOULDER,
    behind: dark,
    shapes: raw.map((s) => ({ ...s, d: place(s.d, tilt) })),
  };
};

const vulture: AnimalDef = {
  id: 'vulture',
  name: 'Vulture',
  kind: 'animal',
  aliases: ['buzzard', 'condor', 'griffon vulture', 'bird'],
  group: 'bird',
  habitats: ['desert'],
  box: [340, 270],
  size: 160,
  locomotion: 'fly',
  gait: { swing: 26 },
  sound: 'vulture',
  palette: {
    body: '#6f4c3b',
    wing: '#6f4c3b',
    wingDark: '#573a2d',
    quill: '#4e3428',
    quillDark: '#3f2a20',
    covert: '#9b745d',
    covertDark: '#755443',
    skin: '#f6aaa2',
    skinDark: '#e38c86',
    ruff: '#fdf8f0',
    ruffShade: '#ece2d4',
    beak: '#f4e6c8',
    beakTip: '#8a7a70',
    feet: '#d2aaa0',
  },
  parts: [
    {
      id: 'body',
      role: 'body',
      pivot: [170, 190],
      shapes: [
        {
          d: smooth([
            [238, 146],
            [254, 168],
            [250, 196],
            [232, 218],
            [200, 234],
            [160, 238],
            [124, 230],
            [100, 216],
            [98, 198],
            [118, 182],
            [150, 168],
            [190, 152],
          ]),
          fill: 'body',
        },
      ],
      children: [
        wing('wingF', 'wingF', -8, true),
        {
          id: 'tail',
          role: 'tail',
          behind: true,
          pivot: [106, 206],
          shapes: [
            {
              d: smooth([
                [114, 194],
                [88, 186],
                [62, 180],
                [50, 190],
                [46, 204],
                [52, 220],
                [66, 228],
                [92, 224],
                [114, 218],
              ]),
              fill: 'quill',
            },
            { d: curve(100, 200, 62, 192, 0), kind: 'line', stroke: 'quillDark', width: 2.2 },
            { d: curve(100, 207, 58, 206, 0), kind: 'line', stroke: 'quillDark', width: 2.2 },
            { d: curve(100, 214, 62, 220, 0), kind: 'line', stroke: 'quillDark', width: 2.2 },
          ],
        },
        {
          id: 'feet',
          behind: true,
          pivot: [170, 232],
          shapes: [
            { d: capsule(164, 228, 152, 246, 5, 4.2), fill: 'feet' },
            { d: capsule(178, 228, 168, 248, 5, 4.2), fill: 'feet' },
          ],
        },
        {
          id: 'head',
          role: 'head',
          pivot: [238, 158],
          shapes: [
            { d: capsule(236, 160, 262, 132, 15, 14), fill: 'skin' },
            { d: scallop(232, 164, 28, 12, 6.5, 0, 38, 27), fill: 'ruff' },
            { d: circle(273, 116, 38), fill: 'skin' },
            {
              d: 'M300 106Q322 106 328 124Q331 138 321 145Q321 133 312 130L300 131Z',
              fill: 'beak',
            },
            { d: ellipse(324, 140, 5.5, 7, 20), kind: 'detail', fill: 'beakTip' },
            { d: ellipse(222, 174, 22, 9), kind: 'detail', fill: 'ruffShade' },
            { d: ellipse(282, 136, 9, 5.5), kind: 'feature', fill: 'blush', opacity: 0.55 },
            { d: circle(280, 110, 11), kind: 'feature', fill: 'eye' },
            { d: circle(283.8, 105.8, 4.2), kind: 'feature', fill: 'shine' },
            { d: curve(297, 136, 307, 136, 2.5), kind: 'line', stroke: 'mouth', width: 2.4 },
            { d: 'M266 84Q264 78 268 75', kind: 'line', stroke: 'skinDark', width: 2.6 },
            { d: 'M272 83Q272 76 277 73', kind: 'line', stroke: 'skinDark', width: 2.6 },
            { d: 'M278 84Q280 79 285 78', kind: 'line', stroke: 'skinDark', width: 2.6 },
          ],
        },
        wing('wingN', 'wingN', -40, false),
      ],
    },
  ],
};

export default vulture;
