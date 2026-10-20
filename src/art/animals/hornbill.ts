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

const SHOULDER: Pt = [170, 114];
const WING_SCALE = 0.9;

const place = (d: string, tilt: number): string =>
  rotatePath(
    translatePath(scalePath(d, WING_SCALE), SHOULDER[0], SHOULDER[1]),
    tilt,
    SHOULDER[0],
    SHOULDER[1],
  );

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
      fill: k('wing'),
    },
    ...FINGERS.map(([x1, y1, x2, y2]) => ({ d: capsule(x1, y1, x2, y2, 10, 8), fill: k('wing') })),
    { d: ellipse(-10, -58, 46, 13, 18), kind: 'detail', fill: k('bar') },
    { d: ellipse(-2, -8, 38, 34), kind: 'detail', fill: k('covert') },
  ];
  return {
    id,
    role,
    pivot: SHOULDER,
    behind: dark,
    shapes: raw.map((s) => ({ ...s, d: place(s.d, tilt) })),
  };
};

const TAIL_BASE: Pt = [100, 168];
const tailFeather = (base: Pt, angle: number, length: number): string => {
  const a = (angle * Math.PI) / 180;
  const tip: Pt = [base[0] + Math.cos(a) * length, base[1] + Math.sin(a) * length];
  return tube([base, tip], (t) => 11 + 4 * Math.sin(Math.PI * Math.min(1, t * 1.25)), 30);
};
const tailBand = (base: Pt, angle: number, at: number): string => {
  const a = (angle * Math.PI) / 180;
  return ellipse(base[0] + Math.cos(a) * at, base[1] + Math.sin(a) * at, 11, 24, angle);
};

const BILL_UPPER = 'M250 72C290 62 342 74 372 116C378 124 376 132 368 130C342 112 302 104 254 104Z';
const BILL_LOWER =
  'M254 102C292 102 330 110 358 126C352 134 338 133 322 129C298 123 274 118 254 118Z';
const CASQUE =
  'M246 78C248 52 276 40 306 44C324 46 338 44 350 34C357 46 353 64 340 74C312 72 282 72 252 84Z';
const CASQUE_LINE = 'M254 80C282 72 312 72 338 74';

const offset = (parts: PartNode[], dx: number, dy: number): PartNode[] =>
  parts.map((p): PartNode => ({
    ...p,
    pivot: p.pivot && [p.pivot[0] + dx, p.pivot[1] + dy],
    shapes: p.shapes?.map((s) => ({ ...s, d: translatePath(s.d, dx, dy) })),
    children: p.children && offset(p.children, dx, dy),
  }));

const hornbill: AnimalDef = {
  id: 'hornbill',
  name: 'Hornbill',
  kind: 'animal',
  aliases: ['great hornbill', 'great indian hornbill', 'bird'],
  group: 'bird',
  habitats: ['jungle'],
  box: [406, 236],
  size: 120,
  locomotion: 'fly',
  sound: 'hornbill',
  palette: {
    body: '#2e2a3b',
    wing: '#36324a',
    wingDark: '#25222f',
    covert: '#454060',
    covertDark: '#2e2a3d',
    bar: '#fffaf0',
    barDark: '#d9d4cc',
    white: '#fffaf0',
    neck: '#fff0c2',
    bill: '#ffd23f',
    billDark: '#f2a72e',
    casque: '#ffb42e',
    casqueLight: '#ffd36a',
    casqueLine: '#c97a1c',
    ring: '#f2614f',
    feet: '#6f6a80',
  },
  parts: offset(
    [
      {
        id: 'body',
        role: 'body',
        pivot: [170, 140],
        shapes: [
          {
            d: smooth([
              [214, 50],
              [240, 50],
              [258, 62],
              [266, 86],
              [264, 110],
              [256, 134],
              [240, 158],
              [216, 180],
              [186, 196],
              [152, 202],
              [120, 198],
              [96, 188],
              [84, 174],
              [92, 160],
              [116, 146],
              [146, 132],
              [172, 116],
              [184, 92],
              [196, 64],
            ]),
            fill: 'body',
          },
          {
            d: smooth([
              [196, 108],
              [222, 100],
              [250, 98],
              [266, 108],
              [262, 134],
              [244, 156],
              [216, 166],
              [192, 152],
              [186, 128],
            ]),
            kind: 'detail',
            fill: 'neck',
          },
          { d: ellipse(178, 198, 70, 26, -18), kind: 'detail', fill: 'white' },
          { d: ellipse(234, 110, 7.5, 4.6), kind: 'feature', fill: 'blush', opacity: 0.5 },
          { d: circle(240, 84, 12.5), kind: 'feature', fill: 'ring' },
          { d: circle(240, 84, 8.6), kind: 'feature', fill: 'eye' },
          { d: circle(243.2, 80.6, 3.2), kind: 'feature', fill: 'shine' },
        ],
        children: [
          wing('wingF', 'wingF', -28, true),
          {
            id: 'tail',
            role: 'tail',
            behind: true,
            pivot: TAIL_BASE,
            shapes: [
              { d: tailFeather(TAIL_BASE, 168, 108), fill: 'white' },
              { d: tailBand(TAIL_BASE, 168, 64), kind: 'detail', fill: 'body' },
            ],
            children: [
              {
                id: 'tailBack',
                behind: true,
                shapes: [
                  { d: tailFeather([98, 160], 178, 98), fill: 'barDark' },
                  { d: tailBand([98, 160], 178, 60), kind: 'detail', fill: 'wingDark' },
                ],
              },
            ],
          },
          {
            id: 'feet',
            behind: true,
            pivot: [160, 198],
            shapes: [
              { d: capsule(154, 194, 145, 208, 4.5, 3.8), fill: 'feet' },
              { d: capsule(166, 194, 159, 210, 4.5, 3.8), fill: 'feet' },
            ],
          },
          {
            id: 'bill',
            behind: true,
            pivot: [252, 90],
            shapes: [
              { d: BILL_LOWER, fill: 'billDark' },
              { d: BILL_UPPER, fill: 'bill' },
              { d: CASQUE, fill: 'casque' },
              { d: ellipse(296, 56, 30, 6.5, 2), kind: 'detail', fill: 'casqueLight' },
              { d: ellipse(256, 92, 10, 22), kind: 'detail', fill: 'billDark' },
              { d: CASQUE_LINE, kind: 'line', stroke: 'casqueLine', width: 2.6 },
            ],
          },
          wing('wingN', 'wingN', -40, false),
        ],
      },
    ],
    19,
    6,
  ),
};

export default hornbill;
