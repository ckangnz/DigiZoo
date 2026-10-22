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

const SHOULDER: Pt = [166, 112];
const WING_SCALE = 0.86;

const BEAK =
  'M240 66C276 44 324 50 346 84C358 102 360 120 350 128C340 134 330 126 318 122C296 116 268 122 238 128Z';

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
    { d: ellipse(-4, -6, 44, 48), kind: 'detail', fill: k('covert') },
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
  return tube([base, tip], (t) => 11 + 4 * Math.sin(Math.PI * Math.min(1, t * 1.3)), 30);
};

const offset = (parts: PartNode[], dx: number, dy: number): PartNode[] =>
  parts.map((p): PartNode => ({
    ...p,
    pivot: p.pivot && [p.pivot[0] + dx, p.pivot[1] + dy],
    shapes: p.shapes?.map((s) => ({ ...s, d: translatePath(s.d, dx, dy) })),
    children: p.children && offset(p.children, dx, dy),
  }));

const toucan: AnimalDef = {
  id: 'toucan',
  name: 'Toucan',
  aliases: ['toco', 'toco toucan', 'bird'],
  group: 'bird',
  habitats: ['rainforest', 'birds'],
  box: [356, 226],
  size: 110,
  locomotion: 'fly',
  sound: 'toucan',
  palette: {
    body: '#2e2a3b',
    wing: '#36324a',
    wingDark: '#25222f',
    covert: '#454060',
    covertDark: '#2e2a3d',
    bib: '#ffe873',
    cheek: '#fffaf0',
    beak: '#ff9a26',
    beakLight: '#ffd23f',
    beakTip: '#3a2830',
    ring: '#5fc6f2',
    vent: '#ef3e4a',
    feet: '#7d9ad6',
  },
  parts: offset(
    [
      {
        id: 'body',
        role: 'body',
        pivot: [165, 140],
        shapes: [
          {
            d: smooth([
              [202, 44],
              [228, 46],
              [248, 60],
              [256, 84],
              [254, 110],
              [250, 132],
              [238, 156],
              [218, 178],
              [190, 194],
              [156, 200],
              [124, 194],
              [100, 182],
              [86, 168],
              [92, 152],
              [114, 138],
              [144, 124],
              [170, 108],
              [178, 86],
              [184, 60],
            ]),
            fill: 'body',
          },
          { d: ellipse(238, 136, 34, 46, -18), kind: 'detail', fill: 'bib' },
          { d: ellipse(244, 110, 26, 26), kind: 'detail', fill: 'cheek' },
          { d: ellipse(229, 108, 7.5, 4.6), kind: 'feature', fill: 'blush', opacity: 0.5 },
          { d: circle(227, 82, 14.5), kind: 'feature', fill: 'ring' },
          { d: circle(227, 82, 8.8), kind: 'feature', fill: 'eye' },
          { d: circle(230.3, 78.4, 3.3), kind: 'feature', fill: 'shine' },
        ],
        children: [
          wing('wingF', 'wingF', -28, true),
          {
            id: 'tail',
            role: 'tail',
            behind: true,
            pivot: [98, 162],
            shapes: [
              { d: ellipse(98, 184, 22, 13, -24), fill: 'vent' },
              { d: tailFeather([102, 162], 161, 70), fill: 'body' },
            ],
            children: [
              {
                id: 'tailBack',
                behind: true,
                shapes: [{ d: tailFeather([100, 154], 171, 62), fill: 'wingDark' }],
              },
            ],
          },
          {
            id: 'feet',
            behind: true,
            pivot: [160, 196],
            shapes: [
              { d: capsule(154, 192, 145, 206, 4.5, 3.8), fill: 'feet' },
              { d: capsule(166, 192, 159, 208, 4.5, 3.8), fill: 'feet' },
            ],
          },
          {
            id: 'beak',
            behind: true,
            pivot: [250, 92],
            shapes: [
              { d: BEAK, fill: 'beak' },
              { d: ellipse(290, 42, 66, 42, 12), kind: 'detail', fill: 'beakLight' },
              { d: ellipse(356, 116, 20, 28, -30), kind: 'detail', fill: 'beakTip' },
              { d: 'M254 110Q300 104 340 121', kind: 'line', stroke: 'beakTip', width: 2.6 },
            ],
          },
          wing('wingN', 'wingN', -40, false),
        ],
      },
    ],
    -13,
    2,
  ),
};

export default toucan;
