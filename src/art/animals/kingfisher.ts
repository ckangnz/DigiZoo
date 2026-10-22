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

const SHOULDER: Pt = [184, 118];
const WING_SCALE = 0.76;

const place = (d: string, tilt: number): string =>
  rotatePath(
    translatePath(scalePath(d, WING_SCALE), SHOULDER[0], SHOULDER[1]),
    tilt,
    SHOULDER[0],
    SHOULDER[1],
  );

const FINGERS: [number, number, number, number][] = [
  [-24, -36, -48, -56],
  [-20, -52, -42, -80],
  [-14, -66, -30, -100],
  [-4, -76, -12, -114],
];

const SPOTS: Pt[] = [
  [-20, -20],
  [-6, -30],
  [8, -22],
  [-14, -44],
  [2, -46],
  [-26, -6],
  [-4, -8],
  [12, -6],
];

const wing = (id: string, role: string, tilt: number, dark: boolean): PartNode => {
  const k = (name: string) => (dark ? `${name}Dark` : name);
  const raw: Shape[] = [
    {
      d: smooth([
        [14, 6],
        [24, -20],
        [26, -54],
        [18, -86],
        [4, -106],
        [-10, -108],
        [-24, -92],
        [-36, -66],
        [-40, -40],
        [-34, -14],
        [-18, 4],
      ]),
      fill: k('wing'),
    },
    ...FINGERS.map(([x1, y1, x2, y2]) => ({ d: capsule(x1, y1, x2, y2, 10, 8), fill: k('wing') })),
    { d: ellipse(-4, -14, 42, 46), kind: 'detail', fill: k('covert') },
    ...SPOTS.map(([x, y]) => ({ d: circle(x, y, 3.6), kind: 'detail' as const, fill: k('spot') })),
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
  return tube([base, tip], (t) => 10 + 3 * Math.sin(Math.PI * Math.min(1, t * 1.3)), 30);
};

const BEAK = 'M256 76C286 74 316 86 342 101C318 106 286 110 258 112Z';

const offset = (parts: PartNode[], dx: number, dy: number): PartNode[] =>
  parts.map((p): PartNode => ({
    ...p,
    pivot: p.pivot && [p.pivot[0] + dx, p.pivot[1] + dy],
    shapes: p.shapes?.map((s) => ({ ...s, d: translatePath(s.d, dx, dy) })),
    children: p.children && offset(p.children, dx, dy),
  }));

const kingfisher: AnimalDef = {
  id: 'kingfisher',
  name: 'Kingfisher',
  kind: 'animal',
  aliases: ['common kingfisher', 'river kingfisher', 'blue bird', 'bird'],
  group: 'bird',
  habitats: ['birds'],
  box: [286, 168],
  size: 70,
  locomotion: 'fly',
  gait: { period: 0.42, swing: 30 },
  sound: 'kingfisher',
  palette: {
    blue: '#2389e0',
    wing: '#2a8de2',
    wingDark: '#1d6dbf',
    covert: '#35b6ec',
    covertDark: '#2994cc',
    spot: '#b9f1ff',
    spotDark: '#8fd6ef',
    stripe: '#46d8ee',
    orange: '#ff8a2e',
    white: '#fffaf0',
    tail: '#1f74c8',
    tailDark: '#185ea6',
    beak: '#2f2b3a',
    beakLight: '#4b4560',
    beakLine: '#57506a',
    feet: '#ff5a4c',
  },
  parts: offset(
    [
      {
        id: 'body',
        role: 'body',
        pivot: [180, 140],
        shapes: [
          {
            d: smooth([
              [220, 44],
              [248, 48],
              [266, 64],
              [272, 88],
              [270, 112],
              [260, 136],
              [242, 158],
              [216, 176],
              [184, 188],
              [150, 190],
              [124, 182],
              [108, 170],
              [110, 156],
              [128, 144],
              [154, 130],
              [178, 112],
              [190, 88],
              [200, 62],
            ]),
            fill: 'blue',
          },
          {
            d: tube(
              [
                [198, 80],
                [184, 108],
                [158, 130],
                [126, 150],
              ],
              7,
            ),
            kind: 'detail',
            fill: 'stripe',
          },
          { d: ellipse(212, 170, 70, 36, -26), kind: 'detail', fill: 'orange' },
          { d: ellipse(258, 124, 20, 15, -30), kind: 'detail', fill: 'white' },
          { d: ellipse(244, 94, 28, 15, 6), kind: 'detail', fill: 'orange' },
          { d: ellipse(206, 104, 9, 13, 20), kind: 'detail', fill: 'white' },
          { d: circle(214, 58, 3), kind: 'detail', fill: 'stripe' },
          { d: circle(228, 54, 3), kind: 'detail', fill: 'stripe' },
          { d: circle(242, 58, 3), kind: 'detail', fill: 'stripe' },
          { d: circle(222, 68, 3), kind: 'detail', fill: 'stripe' },
          { d: ellipse(252, 101, 7.5, 4.6), kind: 'feature', fill: 'blush', opacity: 0.6 },
          { d: circle(240, 86, 9.4), kind: 'feature', fill: 'eye' },
          { d: circle(243.5, 82.2, 3.5), kind: 'feature', fill: 'shine' },
        ],
        children: [
          wing('wingF', 'wingF', -26, true),
          {
            id: 'tail',
            role: 'tail',
            behind: true,
            pivot: [114, 166],
            shapes: [{ d: tailFeather([116, 166], 164, 44), fill: 'tail' }],
            children: [
              {
                id: 'tailBack',
                behind: true,
                shapes: [{ d: tailFeather([114, 160], 176, 38), fill: 'tailDark' }],
              },
            ],
          },
          {
            id: 'feet',
            behind: true,
            pivot: [168, 186],
            shapes: [
              { d: capsule(164, 184, 156, 197, 3.8, 3.2), fill: 'feet' },
              { d: capsule(176, 184, 170, 198, 3.8, 3.2), fill: 'feet' },
            ],
          },
          {
            id: 'beak',
            behind: true,
            pivot: [262, 94],
            shapes: [
              { d: BEAK, fill: 'beak' },
              { d: ellipse(286, 82, 22, 3.6, 10), kind: 'detail', fill: 'beakLight' },
              { d: 'M262 98Q298 100 330 101', kind: 'line', stroke: 'beakLine', width: 2.4 },
            ],
          },
          wing('wingN', 'wingN', -40, false),
        ],
      },
    ],
    -60,
    -36,
  ),
};

export default kingfisher;
