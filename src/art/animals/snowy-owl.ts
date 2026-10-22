import {
  capsule,
  circle,
  ellipse,
  rotatePath,
  smooth,
  translatePath,
  type Pt,
} from '../core/paths';
import type { AnimalDef, PartNode, Shape } from '../core/types';

const SHOULDER: Pt = [146, 134];

const place = (d: string, tilt: number): string =>
  rotatePath(translatePath(d, SHOULDER[0], SHOULDER[1]), tilt, SHOULDER[0], SHOULDER[1]);

const WING = smooth([
  [18, 8],
  [26, -22],
  [24, -58],
  [14, -90],
  [-2, -110],
  [-20, -116],
  [-36, -108],
  [-48, -92],
  [-56, -70],
  [-58, -46],
  [-52, -22],
  [-38, -2],
  [-14, 10],
]);

const FEATHERS: [number, number, number][] = [
  [4, -110, -82],
  [-15, -118, -100],
  [-33, -112, -118],
  [-47, -98, -136],
  [-56, -79, -152],
  [-60, -58, -168],
];

const FLECKS: Pt[] = [
  [-38, -34],
  [-18, -38],
  [2, -36],
  [-28, -56],
  [-8, -60],
  [12, -56],
  [-40, -76],
  [-20, -82],
  [0, -82],
];

const rad = (deg: number) => (deg * Math.PI) / 180;

const crescent = (x: number, y: number, w: number, t: number, rot = 0): string =>
  rotatePath(
    `M${x - w / 2} ${y}Q${x} ${y + t * 2.2} ${x + w / 2} ${y}Q${x} ${y + t * 0.5} ${x - w / 2} ${y}Z`,
    rot,
    x,
    y,
  );

const wing = (id: string, role: string, tilt: number, far: boolean): PartNode => {
  const k = (name: string) => (far ? `${name}Far` : name);
  const raw: Shape[] = [
    { d: WING, fill: k('wing') },
    ...FEATHERS.map(([x, y, a]): Shape => ({ d: ellipse(x, y, 19, 11.5, a), fill: k('wing') })),
    ...FEATHERS.map(([x, y, a]): Shape => ({
      d: ellipse(x + 7 * Math.cos(rad(a)), y + 7 * Math.sin(rad(a)), 2.6, 7.5, a),
      kind: 'detail',
      fill: k('fleck'),
    })),
    ...FLECKS.map(([x, y]): Shape => ({
      d: crescent(x, y, 12, 4.4, 180),
      kind: 'detail',
      fill: k('fleck'),
    })),
  ];
  return {
    id,
    role,
    pivot: SHOULDER,
    behind: far,
    shapes: raw.map((s) => ({ ...s, d: place(s.d, tilt) })),
  };
};

const fleck = (x: number, y: number, a = 0, s = 1): Shape => ({
  d: crescent(x, y, 12 * s, 4.4 * s, a),
  kind: 'detail',
  fill: 'fleck',
});

const claw = (x: number, y: number): string =>
  `M${x - 2.6} ${y - 1}Q${x + 1} ${y + 3} ${x + 1.4} ${y + 8.5}Q${x + 4.4} ${y + 3.4} ${x + 2.6} ${y - 1.6}Z`;

const eyeLid = (id: string, x: number, y: number): PartNode => ({
  id,
  role: 'lid',
  pivot: [x, y - 13],
  shapes: [
    { d: circle(x, y, 13), kind: 'feature', fill: 'iris', stroke: 'auto', width: 1.6 },
    { d: circle(x + 0.5, y + 0.5, 8), kind: 'feature', fill: 'eye' },
    { d: circle(x + 3.6, y - 3.2, 3.6), kind: 'feature', fill: 'shine' },
    { d: circle(x - 3, y + 4, 1.6), kind: 'feature', fill: 'shine' },
  ],
});

const offset = (parts: PartNode[], dx: number, dy: number): PartNode[] =>
  parts.map((p): PartNode => ({
    ...p,
    pivot: p.pivot && [p.pivot[0] + dx, p.pivot[1] + dy],
    shapes: p.shapes?.map((s) => ({ ...s, d: translatePath(s.d, dx, dy) })),
    children: p.children && offset(p.children, dx, dy),
  }));

const BODY = smooth([
  [196, 120],
  [222, 132],
  [236, 156],
  [232, 184],
  [212, 206],
  [178, 218],
  [140, 218],
  [104, 208],
  [78, 190],
  [66, 170],
  [74, 150],
  [100, 134],
  [140, 124],
]);

const HEAD = smooth([
  [216, 50],
  [244, 54],
  [264, 70],
  [272, 96],
  [270, 122],
  [258, 144],
  [238, 158],
  [216, 162],
  [194, 158],
  [174, 144],
  [162, 122],
  [160, 96],
  [168, 70],
  [188, 54],
]);

const snowyOwl: AnimalDef = {
  id: 'snowy-owl',
  name: 'Snowy Owl',
  kind: 'animal',
  aliases: ['snow owl', 'white owl', 'arctic owl', 'owl'],
  group: 'bird',
  habitats: ['polar', 'birds'],
  box: [264, 252],
  size: 120,
  locomotion: 'fly',
  gait: { swing: 24 },
  sound: 'snowy-owl',
  palette: {
    body: '#f8fafd',
    shade: '#dbe3ef',
    wing: '#f6f8fc',
    wingFar: '#d3dce9',
    fleck: '#4a4858',
    fleckFar: '#5f5e70',
    disc: '#f8fafd',
    discEdge: '#e0e7f1',
    iris: '#ffd23c',
    beak: '#3d3a48',
    talon: '#3d3a48',
  },
  parts: offset(
    [
      {
        id: 'body',
        role: 'body',
        pivot: [150, 170],
        shapes: [
          { d: BODY, fill: 'body' },
          { d: BODY, kind: 'detail', fill: 'shade' },
          { d: translatePath(BODY, -4, -9), kind: 'detail', fill: 'body' },
          fleck(198, 184, -10),
          fleck(218, 170, -30),
          fleck(178, 200, 0),
          fleck(214, 194, -20, 0.9),
          fleck(160, 206, 0, 0.9),
          fleck(196, 206, 0, 0.8),
          fleck(98, 162, 20),
          fleck(86, 180, 30),
          fleck(110, 186, 10),
          fleck(124, 204, 10, 0.9),
        ],
        children: [
          wing('wingF', 'wingF', 6, true),
          {
            id: 'tail',
            role: 'tail',
            behind: true,
            pivot: [78, 182],
            shapes: [
              { d: capsule(88, 176, 40, 164, 10, 13), fill: 'body' },
              { d: capsule(88, 182, 34, 184, 10, 13), fill: 'body' },
              { d: capsule(88, 188, 40, 204, 10, 13), fill: 'body' },
              { d: ellipse(52, 166, 2.6, 8, 14), kind: 'detail', fill: 'fleck' },
              { d: ellipse(46, 184, 2.6, 8, 0), kind: 'detail', fill: 'fleck' },
              { d: ellipse(52, 201, 2.6, 8, -16), kind: 'detail', fill: 'fleck' },
            ],
          },
          {
            id: 'feet',
            behind: true,
            pivot: [184, 210],
            shapes: [
              { d: ellipse(168, 222, 15, 10, 16), fill: 'body' },
              { d: ellipse(196, 218, 15, 10, 16), fill: 'body' },
              { d: claw(176, 228), kind: 'feature', fill: 'talon' },
              { d: claw(167, 231), kind: 'feature', fill: 'talon' },
              { d: claw(204, 224), kind: 'feature', fill: 'talon' },
              { d: claw(195, 227), kind: 'feature', fill: 'talon' },
            ],
          },
          wing('wingN', 'wingN', -26, false),
          {
            id: 'head',
            role: 'head',
            pivot: [214, 150],
            shapes: [
              { d: HEAD, fill: 'body' },
              { d: HEAD, kind: 'detail', fill: 'shade' },
              { d: translatePath(HEAD, -3, -6), kind: 'detail', fill: 'body' },
              { d: circle(196, 104, 27), kind: 'detail', fill: 'discEdge' },
              { d: circle(236, 104, 27), kind: 'detail', fill: 'discEdge' },
              { d: circle(196, 104, 24.5), kind: 'detail', fill: 'disc' },
              { d: circle(236, 104, 24.5), kind: 'detail', fill: 'disc' },
              { d: ellipse(206, 62, 2.6, 2.2), kind: 'detail', fill: 'fleck' },
              { d: ellipse(226, 59, 2.6, 2.2), kind: 'detail', fill: 'fleck' },
              { d: ellipse(244, 67, 2.6, 2.2), kind: 'detail', fill: 'fleck' },
              { d: ellipse(190, 71, 2.6, 2.2), kind: 'detail', fill: 'fleck' },
              { d: ellipse(257, 82, 2.4, 2), kind: 'detail', fill: 'fleck' },
              { d: ellipse(176, 86, 2.4, 2), kind: 'detail', fill: 'fleck' },
              { d: ellipse(216, 73, 2.2, 1.9), kind: 'detail', fill: 'fleck' },
              { d: ellipse(235, 75, 2.2, 1.9), kind: 'detail', fill: 'fleck' },
              { d: ellipse(180, 130, 8.5, 5.5), kind: 'feature', fill: 'blush', opacity: 0.55 },
              { d: ellipse(252, 130, 8.5, 5.5), kind: 'feature', fill: 'blush', opacity: 0.55 },
              {
                d: 'M209 118Q216 114 223 118Q221 130 216 136Q211 130 209 118Z',
                kind: 'feature',
                fill: 'beak',
              },
            ],
            children: [eyeLid('eyeL', 196, 102), eyeLid('eyeR', 236, 102)],
          },
        ],
      },
    ],
    -14,
    9,
  ),
};

export default snowyOwl;
