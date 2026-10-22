import {
  capsule,
  circle,
  curve,
  ellipse,
  rotatePath,
  roundRect,
  scalePath,
  smooth,
  translatePath,
  tube,
  type Pt,
} from '../core/paths';
import type { AnimalDef, PartNode, Shape } from '../core/types';

const SHOULDER: Pt = [172, 116];
const WING_SCALE = 0.92;

const place = (d: string, tilt: number): string =>
  rotatePath(
    translatePath(scalePath(d, WING_SCALE), SHOULDER[0], SHOULDER[1]),
    tilt,
    SHOULDER[0],
    SHOULDER[1],
  );

const FINGERS: [number, number, number, number][] = [
  [-26, -40, -54, -62],
  [-20, -56, -48, -90],
  [-12, -68, -32, -114],
  [-2, -78, -14, -128],
  [8, -80, 6, -130],
];

const wing = (id: string, role: string, tilt: number, dark: boolean): PartNode => {
  const k = (name: string) => (dark ? `${name}Dark` : name);
  const raw: Shape[] = [
    {
      d: smooth([
        [16, 8],
        [26, -18],
        [28, -52],
        [20, -84],
        [6, -100],
        [-10, -102],
        [-26, -88],
        [-38, -62],
        [-42, -34],
        [-34, -8],
        [-16, 8],
      ]),
      fill: k('wing'),
    },
    ...FINGERS.map(([x1, y1, x2, y2]) => ({
      d: capsule(x1, y1, x2, y2, 9, 6.5),
      fill: k('wing'),
    })),
    { d: ellipse(-2, -10, 42, 44), kind: 'detail', fill: k('covert') },
    { d: curve(-36, -60, -22, -46, 3), kind: 'line', stroke: k('quill'), width: 2.2 },
    { d: curve(-26, -80, -14, -60, 3), kind: 'line', stroke: k('quill'), width: 2.2 },
    { d: curve(-12, -96, -4, -72, 3), kind: 'line', stroke: k('quill'), width: 2.2 },
  ];
  return {
    id,
    role,
    pivot: SHOULDER,
    behind: dark,
    shapes: raw.map((s) => ({ ...s, d: place(s.d, tilt) })),
  };
};

const tailFeather = (base: Pt, angle: number, length: number): string => {
  const a = (angle * Math.PI) / 180;
  const tip: Pt = [base[0] + Math.cos(a) * length, base[1] + Math.sin(a) * length];
  return tube([base, tip], (t) => 10 + 5 * Math.sin(Math.PI * Math.min(1, t * 1.2)), 30);
};

const BEAK = 'M252 62C282 54 310 70 326 98C328 104 323 107 316 106C298 104 278 108 258 114Z';

const offset = (parts: PartNode[], dx: number, dy: number): PartNode[] =>
  parts.map((p): PartNode => ({
    ...p,
    pivot: p.pivot && [p.pivot[0] + dx, p.pivot[1] + dy],
    shapes: p.shapes?.map((s) => ({ ...s, d: translatePath(s.d, dx, dy) })),
    children: p.children && offset(p.children, dx, dy),
  }));

const crow: AnimalDef = {
  id: 'crow',
  name: 'Crow',
  kind: 'animal',
  aliases: ['raven', 'blackbird', 'black bird', 'caw', 'bird'],
  group: 'bird',
  habitats: ['birds'],
  box: [316, 218],
  size: 90,
  locomotion: 'fly',
  gait: { swing: 30 },
  sound: 'crow',
  palette: {
    body: '#2d2d40',
    sheen: '#47527c',
    wing: '#313248',
    wingDark: '#232334',
    covert: '#3d4466',
    covertDark: '#2c3049',
    quill: '#4f5a85',
    quillDark: '#3a4062',
    tail: '#2a2a3c',
    tailDark: '#202030',
    beak: '#3e3c50',
    beakLight: '#5d5b75',
    beakLine: '#222030',
    ring: '#e3e7f2',
    feet: '#3d3a4c',
    gold: '#ffc53d',
    goldLight: '#fff0a8',
  },
  parts: offset(
    [
      {
        id: 'body',
        role: 'body',
        pivot: [168, 140],
        shapes: [
          {
            d: smooth([
              [212, 44],
              [240, 44],
              [260, 58],
              [268, 84],
              [264, 110],
              [254, 134],
              [238, 158],
              [214, 180],
              [184, 196],
              [150, 202],
              [118, 196],
              [96, 184],
              [84, 170],
              [90, 156],
              [112, 142],
              [142, 128],
              [168, 112],
              [178, 88],
              [190, 60],
            ]),
            fill: 'body',
          },
          { d: ellipse(222, 56, 24, 8, -12), kind: 'detail', fill: 'sheen' },
          { d: ellipse(248, 140, 8, 30, 34), kind: 'detail', fill: 'sheen' },
          { d: ellipse(240, 108, 8, 5), kind: 'feature', fill: 'blush', opacity: 0.7 },
          { d: circle(232, 80, 13.5), kind: 'feature', fill: 'ring' },
          { d: circle(235.6, 79.4, 8.8), kind: 'feature', fill: 'eye' },
          { d: circle(238.8, 76, 3.4), kind: 'feature', fill: 'shine' },
          { d: circle(232.6, 83.2, 1.5), kind: 'feature', fill: 'shine' },
        ],
        children: [
          wing('wingF', 'wingF', -28, true),
          {
            id: 'tail',
            role: 'tail',
            behind: true,
            pivot: [98, 166],
            shapes: [{ d: tailFeather([102, 166], 164, 78), fill: 'tail' }],
            children: [
              {
                id: 'tailBack',
                behind: true,
                shapes: [
                  { d: tailFeather([100, 160], 176, 70), fill: 'tailDark' },
                  { d: tailFeather([104, 172], 152, 70), fill: 'tailDark' },
                ],
              },
            ],
          },
          {
            id: 'feet',
            behind: true,
            pivot: [158, 198],
            shapes: [
              { d: capsule(152, 194, 143, 208, 4.5, 3.8), fill: 'feet' },
              { d: capsule(164, 194, 157, 210, 4.5, 3.8), fill: 'feet' },
            ],
          },
          {
            id: 'key',
            behind: true,
            pivot: [316, 104],
            motion: { rotate: 7, phase: 0.3 },
            shapes: [
              { d: circle(316, 112, 8.5), fill: 'gold' },
              { d: capsule(316, 118, 316, 151, 3.6), fill: 'gold' },
              { d: roundRect(316, 137, 11, 5.5, 2), fill: 'gold' },
              { d: roundRect(316, 145, 9, 5.5, 2), fill: 'gold' },
              { d: circle(316, 112, 3.4), kind: 'detail', fill: 'goldLight' },
              { d: ellipse(314, 133, 1.4, 12), kind: 'detail', fill: 'goldLight' },
            ],
          },
          {
            id: 'beak',
            behind: true,
            pivot: [258, 88],
            shapes: [
              { d: BEAK, fill: 'beak' },
              { d: ellipse(288, 70, 22, 4.5, 24), kind: 'detail', fill: 'beakLight' },
              {
                d: 'M262 94Q270 99 280 99Q300 100 318 104',
                kind: 'line',
                stroke: 'beakLine',
                width: 2.4,
              },
            ],
          },
          wing('wingN', 'wingN', -40, false),
        ],
      },
    ],
    -14,
    0,
  ),
};

export default crow;
