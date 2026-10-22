import {
  capsule,
  circle,
  ellipse,
  rotatePath,
  scalePath,
  smooth,
  translatePath,
  tube,
  type Pt,
} from '../core/paths';
import type { AnimalDef, PartNode, Shape } from '../core/types';

const SHOULDER: Pt = [192, 136];

const BEAK_UPPER = scalePath(
  'M285 92Q322 88 325 126Q325 146 311 157Q312 139 300 133L287 132Z',
  0.9,
  0.9,
  288,
  116,
);
const BEAK_LOWER = scalePath('M288 126Q308 124 310 138Q305 152 289 149Z', 0.9, 0.9, 288, 116);

const place = (d: string, tilt: number): string =>
  rotatePath(translatePath(d, SHOULDER[0], SHOULDER[1]), tilt, SHOULDER[0], SHOULDER[1]);

const FINGERS: [number, number, number, number][] = [
  [-24, -36, -50, -58],
  [-20, -52, -44, -82],
  [-14, -66, -32, -102],
  [-6, -76, -16, -116],
  [4, -80, 2, -124],
];

const wing = (id: string, role: string, tilt: number, dark: boolean): PartNode => {
  const k = (name: string) => (dark ? `${name}Dark` : name);
  const raw: Shape[] = [
    {
      d: smooth([
        [14, 6],
        [24, -20],
        [26, -56],
        [20, -90],
        [8, -112],
        [-6, -116],
        [-20, -100],
        [-34, -74],
        [-40, -44],
        [-34, -16],
        [-18, 4],
      ]),
      fill: k('blue'),
    },
    ...FINGERS.map(([x1, y1, x2, y2]) => ({ d: capsule(x1, y1, x2, y2, 10, 8), fill: k('blue') })),
    { d: ellipse(-6, -16, 52, 54), kind: 'detail', fill: k('yellow') },
    { d: ellipse(-4, -2, 46, 48), kind: 'detail', fill: k('red') },
  ];
  return {
    id,
    role,
    pivot: SHOULDER,
    behind: dark,
    shapes: raw.map((s) => ({ ...s, d: place(s.d, tilt) })),
  };
};

const featherRadius = (t: number) => (t < 0.3 ? 9 + 6 * (t / 0.3) : 15 - 10 * ((t - 0.3) / 0.7));

const SPLIT = 0.64;

const feather = (base: Pt, angle: number, length: number, bend: number): Shape[] => {
  const a = (angle * Math.PI) / 180;
  const tip: Pt = [base[0] + Math.cos(a) * length, base[1] + Math.sin(a) * length];
  const ctrl: Pt = [
    (base[0] + tip[0]) / 2 - Math.sin(a) * bend,
    (base[1] + tip[1]) / 2 + Math.cos(a) * bend,
  ];
  const at = (t: number): Pt => [
    (1 - t) ** 2 * base[0] + 2 * t * (1 - t) * ctrl[0] + t ** 2 * tip[0],
    (1 - t) ** 2 * base[1] + 2 * t * (1 - t) * ctrl[1] + t ** 2 * tip[1],
  ];
  const span = (t0: number, t1: number) =>
    Array.from({ length: 7 }, (_, i) => at(t0 + ((t1 - t0) * i) / 6));
  return [
    { d: tube(span(0, SPLIT), (t) => featherRadius(t * SPLIT), 40), fill: 'red' },
    {
      d: tube(span(SPLIT, 1), (t) => featherRadius(SPLIT + t * (1 - SPLIT)), 30),
      fill: 'blue',
    },
  ];
};

const offset = (parts: PartNode[], dx: number, dy: number): PartNode[] =>
  parts.map((p): PartNode => ({
    ...p,
    pivot: p.pivot && [p.pivot[0] + dx, p.pivot[1] + dy],
    shapes: p.shapes?.map((s) => ({ ...s, d: translatePath(s.d, dx, dy) })),
    children: p.children && offset(p.children, dx, dy),
  }));

const parrot: AnimalDef = {
  id: 'parrot',
  name: 'Parrot',
  aliases: ['macaw', 'scarlet macaw', 'polly', 'bird'],
  group: 'bird',
  habitats: ['jungle', 'rainforest', 'birds', 'pets'],
  box: [322, 258],
  size: 120,
  locomotion: 'fly',
  sound: 'parrot',
  palette: {
    red: '#ec3b33',
    redDark: '#c22a2c',
    yellow: '#ffcd38',
    yellowDark: '#e0a826',
    blue: '#2f7fd8',
    blueDark: '#2560ad',
    face: '#fdf7ee',
    beak: '#f5e8cf',
    beakDark: '#3b2d2f',
    feet: '#857b8f',
  },
  parts: offset(
    [
      {
        id: 'body',
        role: 'body',
        pivot: [200, 150],
        shapes: [
          {
            d: smooth([
              [240, 64],
              [266, 66],
              [286, 82],
              [296, 106],
              [294, 130],
              [282, 150],
              [264, 168],
              [244, 188],
              [216, 206],
              [184, 216],
              [154, 214],
              [132, 204],
              [120, 190],
              [126, 176],
              [146, 162],
              [172, 146],
              [196, 128],
              [210, 106],
              [220, 82],
              [228, 70],
            ]),
            fill: 'red',
          },
          { d: ellipse(274, 112, 26, 25, -10), kind: 'detail', fill: 'face' },
          { d: ellipse(262, 126, 8, 5), kind: 'feature', fill: 'blush', opacity: 0.5 },
          { d: circle(270, 104, 8.5), kind: 'feature', fill: 'eye' },
          { d: circle(273.2, 100.6, 3.2), kind: 'feature', fill: 'shine' },
        ],
        children: [
          wing('wingF', 'wingF', -28, true),
          {
            id: 'tail',
            role: 'tail',
            behind: true,
            pivot: [132, 192],
            shapes: feather([132, 192], 158, 112, 8),
            children: [
              { id: 'tailUpper', behind: true, shapes: feather([130, 186], 168, 94, 6) },
              { id: 'tailLower', behind: true, shapes: feather([136, 198], 148, 92, 6) },
            ],
          },
          {
            id: 'feet',
            behind: true,
            pivot: [180, 212],
            shapes: [
              { d: capsule(176, 208, 166, 223, 4.5, 3.8), fill: 'feet' },
              { d: capsule(188, 208, 180, 225, 4.5, 3.8), fill: 'feet' },
            ],
          },
          {
            id: 'beak',
            pivot: [292, 114],
            shapes: [
              { d: BEAK_LOWER, fill: 'beakDark' },
              { d: BEAK_UPPER, fill: 'beak' },
            ],
          },
          wing('wingN', 'wingN', -40, false),
        ],
      },
    ],
    -11,
    -5,
  ),
};

export default parrot;
