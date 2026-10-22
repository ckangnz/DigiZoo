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

const SHOULDER: Pt = [198, 136];
const WING_SCALE = 1;

const place = (d: string, tilt: number): string =>
  rotatePath(
    translatePath(scalePath(d, WING_SCALE), SHOULDER[0], SHOULDER[1]),
    tilt,
    SHOULDER[0],
    SHOULDER[1],
  );

const FINGERS: [number, number, number, number][] = [
  [-28, -40, -58, -60],
  [-22, -58, -52, -90],
  [-14, -72, -36, -116],
  [-4, -82, -18, -134],
  [6, -86, 4, -140],
];

const wing = (id: string, role: string, tilt: number, dark: boolean): PartNode => {
  const k = (name: string) => (dark ? `${name}Dark` : name);
  const raw: Shape[] = [
    {
      d: smooth([
        [18, 8],
        [28, -20],
        [30, -58],
        [22, -94],
        [8, -118],
        [-8, -124],
        [-26, -108],
        [-40, -80],
        [-46, -46],
        [-38, -14],
        [-18, 6],
      ]),
      fill: k('covert'),
    },
    ...FINGERS.map(([x1, y1, x2, y2]) => ({
      d: capsule(x1, y1, x2, y2, 10, 7.5),
      fill: k('quill'),
    })),
    {
      d: smooth([
        [-70, 30],
        [-28, 10],
        [-16, -20],
        [-10, -58],
        [-2, -96],
        [8, -122],
        [-20, -150],
        [-80, -80],
      ]),
      kind: 'detail',
      fill: k('quill'),
    },
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
  return tube([base, tip], (t) => 10 + 4 * Math.sin(Math.PI * Math.min(1, t * 1.2)), 30);
};

const leg = (id: string, hip: Pt, end: Pt, far: boolean): PartNode => {
  const fill = far ? 'legDark' : 'leg';
  return {
    id,
    behind: true,
    pivot: hip,
    motion: { rotate: 3, phase: far ? 0.45 : 0.3 },
    shapes: [
      { d: capsule(hip[0], hip[1], end[0], end[1], 4.6, 3.2), fill },
      { d: capsule(end[0], end[1], end[0] - 15, end[1] + 4, 3, 2.4), fill },
      { d: capsule(end[0], end[1], end[0] - 13, end[1] - 4, 2.8, 2.2), fill },
    ],
  };
};

const NECK: Pt[] = [
  [232, 150],
  [258, 138],
  [284, 124],
  [304, 114],
];

const BEAK = 'M344 90C374 93 404 105 432 118C406 124 376 125 346 120Z';

const offset = (parts: PartNode[], dx: number, dy: number): PartNode[] =>
  parts.map((p): PartNode => ({
    ...p,
    pivot: p.pivot && [p.pivot[0] + dx, p.pivot[1] + dy],
    shapes: p.shapes?.map((s) => ({ ...s, d: translatePath(s.d, dx, dy) })),
    children: p.children && offset(p.children, dx, dy),
  }));

const stork: AnimalDef = {
  id: 'stork',
  name: 'Stork',
  kind: 'animal',
  aliases: ['white stork', 'stalk', 'bird'],
  group: 'bird',
  habitats: ['birds'],
  box: [418, 220],
  size: 220,
  locomotion: 'fly',
  gait: { period: 0.75, swing: 22 },
  sound: 'stork',
  palette: {
    body: '#fdfdfb',
    belly: '#eef0f5',
    quill: '#2f2d3b',
    quillDark: '#242331',
    covert: '#fbfbf8',
    covertDark: '#d9dde8',
    tail: '#f3f4f8',
    tailDark: '#dde1ea',
    beak: '#f4553d',
    beakLine: '#c63c2b',
    leg: '#f4553d',
    legDark: '#d4432f',
  },
  parts: offset(
    [
      {
        id: 'body',
        role: 'body',
        pivot: [190, 164],
        shapes: [
          {
            d: smooth([
              [246, 132],
              [262, 148],
              [262, 168],
              [246, 186],
              [214, 198],
              [176, 200],
              [142, 192],
              [118, 178],
              [104, 164],
              [110, 152],
              [132, 144],
              [164, 136],
              [200, 128],
              [228, 126],
            ]),
            fill: 'body',
          },
          { d: ellipse(194, 196, 62, 16, -4), kind: 'detail', fill: 'belly' },
        ],
        children: [
          wing('wingF', 'wingF', -24, true),
          leg('legF', [150, 182], [38, 186], true),
          leg('legN', [160, 190], [46, 208], false),
          {
            id: 'tail',
            role: 'tail',
            behind: true,
            pivot: [112, 160],
            shapes: [{ d: tailFeather([114, 162], 172, 42), fill: 'tail' }],
            children: [
              {
                id: 'tailBack',
                behind: true,
                shapes: [{ d: tailFeather([112, 156], 184, 36), fill: 'tailDark' }],
              },
            ],
          },
          {
            id: 'head',
            role: 'head',
            behind: true,
            pivot: [240, 150],
            shapes: [
              { d: tube(NECK, (t) => 25 - 8 * t, 50), fill: 'body' },
              { d: circle(316, 102, 38), fill: 'body' },
              { d: ellipse(334, 122, 10, 6), kind: 'feature', fill: 'blush', opacity: 0.55 },
              { d: circle(328, 90, 11.2), kind: 'feature', fill: 'eye' },
              { d: circle(332.2, 85.4, 4.2), kind: 'feature', fill: 'shine' },
            ],
            children: [
              {
                id: 'beak',
                behind: true,
                pivot: [348, 104],
                shapes: [
                  { d: BEAK, fill: 'beak' },
                  {
                    d: 'M352 105Q388 108 420 117',
                    kind: 'line',
                    stroke: 'beakLine',
                    width: 2.4,
                  },
                ],
              },
            ],
          },
          wing('wingN', 'wingN', -40, false),
        ],
      },
    ],
    -18,
    3,
  ),
};

export default stork;
