import {
  capsule,
  circle,
  curve,
  ellipse,
  rotatePath,
  smooth,
  translatePath,
  tube,
  type Pt,
} from '../core/paths';
import type { AnimalDef, PartNode, Shape } from '../core/types';

const SHOULDER: Pt = [186, 152];

const place = (d: string, tilt: number): string =>
  rotatePath(translatePath(d, SHOULDER[0], SHOULDER[1]), tilt, SHOULDER[0], SHOULDER[1]);

const PRIMARIES: [number, number, number, number][] = [
  [20, -108, -82, 50],
  [6, -116, -98, 56],
  [-10, -118, -114, 56],
  [-26, -112, -130, 52],
  [-40, -100, -146, 44],
];

const COVERTS =
  'M-66 30L-66 -36A11 11 0 0 1 -46 -44A11 11 0 0 1 -26 -50A11 11 0 0 1 -6 -52A11 11 0 0 1 14 -50A11 11 0 0 1 34 -44L40 30Z';

const primary = ([x, y, angle, len]: [number, number, number, number], fill: string): Shape => {
  const a = (angle * Math.PI) / 180;
  const tip: Pt = [x + Math.cos(a) * len, y + Math.sin(a) * len];
  const mid: Pt = [x + Math.cos(a) * len * 0.5, y + Math.sin(a) * len * 0.5];
  return { d: tube([[x, y], mid, tip], (t) => 10.5 - 4.5 * t, 24), fill };
};

const wing = (id: string, role: string, tilt: number, far: boolean): PartNode => {
  const k = (name: string) => (far ? `${name}Far` : name);
  const raw: Shape[] = [
    ...PRIMARIES.map((p) => primary(p, k('quill'))),
    {
      d: smooth([
        [16, 6],
        [32, -24],
        [36, -64],
        [30, -100],
        [14, -118],
        [-10, -122],
        [-34, -110],
        [-52, -84],
        [-60, -48],
        [-52, -14],
        [-28, 4],
      ]),
      fill: k('wing'),
    },
    { d: COVERTS, kind: 'detail', fill: k('covert') },
    { d: curve(-50, -66, -34, -50, 3), kind: 'line', stroke: k('quill'), width: 2.4 },
    { d: curve(-38, -90, -22, -66, 3), kind: 'line', stroke: k('quill'), width: 2.4 },
    { d: curve(-20, -106, -8, -72, 3), kind: 'line', stroke: k('quill'), width: 2.4 },
  ];
  return {
    id,
    role,
    pivot: SHOULDER,
    behind: far,
    shapes: raw.map((s) => ({ ...s, d: place(s.d, tilt) })),
  };
};

const HOOD: Pt[] = [
  [262, 126],
  [266, 150],
  [256, 172],
  [246, 164],
  [236, 180],
  [226, 166],
  [214, 176],
  [208, 160],
  [196, 162],
  [204, 142],
  [226, 124],
];

const offset = (parts: PartNode[], dx: number, dy: number): PartNode[] =>
  parts.map((p): PartNode => ({
    ...p,
    pivot: p.pivot && [p.pivot[0] + dx, p.pivot[1] + dy],
    shapes: p.shapes?.map((s) => ({ ...s, d: translatePath(s.d, dx, dy) })),
    children: p.children && offset(p.children, dx, dy),
  }));

const eagle: AnimalDef = {
  id: 'eagle',
  name: 'Eagle',
  kind: 'animal',
  aliases: ['bald eagle', 'american eagle', 'eaglet', 'bird of prey', 'bird'],
  group: 'bird',
  habitats: ['birds'],
  box: [324, 287],
  size: 160,
  locomotion: 'fly',
  gait: { swing: 26 },
  sound: 'eagle',
  palette: {
    body: '#7a5236',
    wing: '#7a5236',
    wingFar: '#5f3f2a',
    quill: '#573a27',
    quillFar: '#452e1f',
    covert: '#a0764f',
    covertFar: '#7c5a3d',
    head: '#fffcf6',
    headShade: '#ebe4d8',
    tail: '#fbf8f1',
    tailLine: '#d8d0c2',
    beak: '#ffc93a',
    beakDark: '#f0a21e',
    feet: '#ffc93a',
  },
  parts: offset(
    [
      {
        id: 'body',
        role: 'body',
        pivot: [176, 186],
        shapes: [
          {
            d: smooth([
              [244, 142],
              [262, 164],
              [258, 192],
              [238, 214],
              [204, 228],
              [164, 232],
              [128, 224],
              [104, 210],
              [100, 192],
              [118, 176],
              [150, 162],
              [196, 146],
            ]),
            fill: 'body',
          },
        ],
        children: [
          wing('wingF', 'wingF', -6, true),
          {
            id: 'tail',
            role: 'tail',
            behind: true,
            pivot: [108, 200],
            shapes: [
              {
                d: smooth([
                  [116, 188],
                  [88, 180],
                  [58, 172],
                  [40, 180],
                  [34, 198],
                  [40, 216],
                  [58, 226],
                  [88, 220],
                  [116, 212],
                ]),
                fill: 'tail',
              },
              { d: curve(100, 196, 56, 186, 0), kind: 'line', stroke: 'tailLine', width: 2.2 },
              { d: curve(100, 202, 50, 200, 0), kind: 'line', stroke: 'tailLine', width: 2.2 },
              { d: curve(100, 208, 56, 214, 0), kind: 'line', stroke: 'tailLine', width: 2.2 },
            ],
          },
          {
            id: 'feet',
            behind: true,
            pivot: [176, 226],
            shapes: [
              { d: capsule(170, 222, 156, 240, 5.5, 4.6), fill: 'feet' },
              { d: capsule(184, 222, 172, 242, 5.5, 4.6), fill: 'feet' },
            ],
          },
          {
            id: 'head',
            role: 'head',
            pivot: [240, 152],
            shapes: [
              { d: smooth(HOOD, true, 0.8), fill: 'head' },
              { d: circle(278, 104, 40), fill: 'head' },
              {
                d: 'M300 88Q330 84 340 110Q344 128 332 142Q330 128 318 124L302 126Z',
                fill: 'beak',
              },
              { d: 'M304 124L320 125Q322 134 309 137Q303 135 304 124Z', fill: 'beakDark' },
              { d: ellipse(222, 172, 26, 10), kind: 'detail', fill: 'headShade' },
              { d: ellipse(286, 126, 9, 5.5), kind: 'feature', fill: 'blush', opacity: 0.55 },
              { d: circle(284, 98, 11), kind: 'feature', fill: 'eye' },
              { d: circle(288, 93.6, 4.2), kind: 'feature', fill: 'shine' },
              { d: curve(295, 130, 304, 129, 2.5), kind: 'line', stroke: 'mouth', width: 2.4 },
            ],
          },
          wing('wingN', 'wingN', -38, false),
        ],
      },
    ],
    -26,
    32,
  ),
};

export default eagle;
