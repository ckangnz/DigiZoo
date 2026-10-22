import {
  capsule,
  circle,
  curve,
  ellipse,
  rotatePath,
  scalePath,
  smooth,
  translatePath,
  tube,
  type Pt,
} from '../core/paths';
import type { AnimalDef, PartNode, Shape } from '../core/types';

const SHOULDER: Pt = [196, 138];

const place = (d: string, tilt: number): string =>
  rotatePath(translatePath(d, SHOULDER[0], SHOULDER[1]), tilt, SHOULDER[0], SHOULDER[1]);

const FINGERS: [number, number, number, number][] = [
  [-24, -36, -50, -58],
  [-20, -52, -44, -82],
  [-14, -66, -32, -102],
  [-6, -76, -16, -116],
  [4, -80, 2, -124],
];

const wing = (id: string, role: string, tilt: number, far: boolean): PartNode => {
  const k = (name: string) => (far ? `${name}Far` : name);
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
    { d: ellipse(-20, -76, 20, 34, 22), kind: 'detail', fill: k('wash') },
    { d: ellipse(-2, -6, 40, 36), kind: 'detail', fill: k('wing') },
    { d: curve(-40, -60, -30, -46, 3), kind: 'line', stroke: k('wingLine'), width: 2.2 },
    { d: curve(-30, -80, -20, -62, 3), kind: 'line', stroke: k('wingLine'), width: 2.2 },
    { d: curve(-16, -98, -10, -76, 3), kind: 'line', stroke: k('wingLine'), width: 2.2 },
    { d: curve(-2, -106, 0, -84, 2), kind: 'line', stroke: k('wingLine'), width: 2.2 },
  ];
  return {
    id,
    role,
    pivot: SHOULDER,
    behind: far,
    shapes: raw.map((s) => ({ ...s, d: place(s.d, tilt) })),
  };
};

const feather = (base: Pt, angle: number, length: number, bend: number, r: number): string => {
  const a = (angle * Math.PI) / 180;
  const tip: Pt = [base[0] + Math.cos(a) * length, base[1] + Math.sin(a) * length];
  const mid: Pt = [
    (base[0] + tip[0]) / 2 - Math.sin(a) * bend,
    (base[1] + tip[1]) / 2 + Math.cos(a) * bend,
  ];
  return tube(
    [base, mid, tip],
    (t) => r * (t < 0.25 ? 0.7 + 1.2 * t : 1 - 0.86 * ((t - 0.25) / 0.75)),
    30,
  );
};

const CREST: [number, number, number, number][] = [
  [-160, 42, -16, 6.5],
  [-140, 54, -18, 7],
  [-120, 62, -20, 7.5],
  [-100, 66, -20, 7.5],
  [-80, 60, -18, 7],
  [-62, 46, -14, 6.5],
];

const CREST_BASE: Pt = [254, 76];

const tailFeather = (angle: number, length: number, r: number, fill: string): Shape => {
  const base: Pt = [134, 186];
  const a = (angle * Math.PI) / 180;
  const tip: Pt = [base[0] + Math.cos(a) * length, base[1] + Math.sin(a) * length];
  return {
    d: tube([base, tip], (t) => r * (0.75 + 0.4 * Math.sin(Math.PI * Math.min(1, t * 1.2))), 30),
    fill,
  };
};

const offset = (parts: PartNode[], dx: number, dy: number): PartNode[] =>
  parts.map((p): PartNode => ({
    ...p,
    pivot: p.pivot && [p.pivot[0] + dx, p.pivot[1] + dy],
    shapes: p.shapes?.map((s) => ({ ...s, d: translatePath(s.d, dx, dy) })),
    children: p.children && offset(p.children, dx, dy),
  }));

const BEAK_UPPER = scalePath(
  'M285 92Q322 88 325 126Q325 146 311 157Q312 139 300 133L287 132Z',
  0.72,
  0.72,
  288,
  112,
);
const BEAK_LOWER = scalePath('M288 126Q308 124 310 138Q305 152 289 149Z', 0.72, 0.72, 288, 112);

const cockatoo: AnimalDef = {
  id: 'cockatoo',
  name: 'Cockatoo',
  kind: 'animal',
  aliases: ['sulphur-crested cockatoo', 'white cockatoo', 'cockie', 'parrot', 'bird'],
  group: 'bird',
  habitats: ['aussie', 'birds'],
  box: [322, 262],
  size: 120,
  locomotion: 'fly',
  sound: 'cockatoo',
  palette: {
    body: '#fdfcf8',
    belly: '#f1f1f4',
    wing: '#fbfbfd',
    wingFar: '#dfe3ee',
    wash: '#fff7d0',
    washFar: '#e9e4c8',
    wingLine: '#c2c8d8',
    wingLineFar: '#b2b8ca',
    tail: '#eef0f5',
    tailWash: '#fff0a6',
    crest: '#ffd23a',
    crestDark: '#f2b628',
    ring: '#dceffa',
    beak: '#4a4652',
    beakDark: '#34313b',
    feet: '#6e6a78',
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
              [244, 66],
              [270, 66],
              [290, 82],
              [298, 106],
              [294, 130],
              [282, 150],
              [264, 168],
              [244, 188],
              [216, 206],
              [184, 216],
              [154, 214],
              [134, 204],
              [124, 190],
              [130, 176],
              [148, 162],
              [174, 146],
              [198, 128],
              [214, 104],
              [226, 80],
            ]),
            fill: 'body',
          },
          { d: ellipse(214, 198, 56, 24, -24), kind: 'detail', fill: 'belly' },
          { d: ellipse(266, 128, 8, 5), kind: 'feature', fill: 'blush', opacity: 0.5 },
          { d: circle(272, 104, 12.5), kind: 'feature', fill: 'ring' },
          { d: circle(273, 104, 8.6), kind: 'feature', fill: 'eye' },
          { d: circle(276.2, 100.6, 3.3), kind: 'feature', fill: 'shine' },
          { d: circle(270.4, 107.6, 1.4), kind: 'feature', fill: 'shine' },
        ],
        children: [
          wing('wingF', 'wingF', -28, true),
          {
            id: 'crest',
            behind: true,
            pivot: CREST_BASE,
            motion: { rotate: 4, phase: 0.3 },
            shapes: CREST.map(([angle, length, bend, r], i) => ({
              d: feather(CREST_BASE, angle, length, bend, r),
              fill: i % 2 === 0 ? 'crest' : 'crestDark',
            })),
          },
          {
            id: 'tail',
            role: 'tail',
            behind: true,
            pivot: [134, 186],
            shapes: [
              tailFeather(164, 84, 13, 'tail'),
              tailFeather(150, 80, 13, 'tail'),
              tailFeather(178, 76, 12, 'tail'),
              { d: ellipse(92, 186, 22, 9, 166), kind: 'detail', fill: 'tailWash' },
              { d: curve(70, 172, 112, 182, 2), kind: 'line', stroke: 'wingLine', width: 2.2 },
              { d: curve(72, 194, 112, 192, -2), kind: 'line', stroke: 'wingLine', width: 2.2 },
            ],
          },
          {
            id: 'feet',
            behind: true,
            pivot: [184, 212],
            shapes: [
              { d: capsule(180, 208, 170, 223, 4.5, 3.8), fill: 'feet' },
              { d: capsule(192, 208, 184, 225, 4.5, 3.8), fill: 'feet' },
            ],
          },
          {
            id: 'beak',
            pivot: [290, 112],
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
    -2,
  ),
};

export default cockatoo;
