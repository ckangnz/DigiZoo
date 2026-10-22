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

const SHOULDER: Pt = [176, 118];
const WING_SCALE = 0.86;

const place = (d: string, tilt: number): string =>
  rotatePath(
    translatePath(scalePath(d, WING_SCALE), SHOULDER[0], SHOULDER[1]),
    tilt,
    SHOULDER[0],
    SHOULDER[1],
  );

const wing = (id: string, role: string, tilt: number, dark: boolean): PartNode => {
  const k = (name: string) => (dark ? `${name}Dark` : name);
  const raw: Shape[] = [
    {
      d: smooth([
        [18, 8],
        [30, -22],
        [32, -62],
        [22, -100],
        [4, -134],
        [-18, -160],
        [-26, -156],
        [-24, -134],
        [-28, -108],
        [-40, -80],
        [-54, -50],
        [-54, -22],
        [-40, -2],
        [-18, 8],
      ]),
      fill: k('wing'),
    },
    { d: ellipse(-4, -16, 44, 46), kind: 'detail', fill: k('covert') },
    { d: ellipse(-12, -168, 56, 64, -20), kind: 'detail', fill: k('tip') },
    { d: ellipse(-14, -142, 4.4, 8.5, 30), kind: 'detail', fill: k('mirror') },
    { d: curve(-46, -50, -32, -30, 3), kind: 'line', stroke: k('wingLine'), width: 2.2 },
    { d: curve(-38, -76, -26, -52, 3), kind: 'line', stroke: k('wingLine'), width: 2.2 },
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

const BEAK =
  'M262 80C286 78 306 86 318 98C323 103 320 109 313 108C305 107 299 112 290 113C278 114 270 113 264 111Z';

const offset = (parts: PartNode[], dx: number, dy: number): PartNode[] =>
  parts.map((p): PartNode => ({
    ...p,
    pivot: p.pivot && [p.pivot[0] + dx, p.pivot[1] + dy],
    shapes: p.shapes?.map((s) => ({ ...s, d: translatePath(s.d, dx, dy) })),
    children: p.children && offset(p.children, dx, dy),
  }));

const seagull: AnimalDef = {
  id: 'seagull',
  name: 'Seagull',
  kind: 'animal',
  aliases: ['gull', 'sea gull', 'herring gull', 'beach bird', 'bird'],
  group: 'bird',
  habitats: ['birds'],
  box: [282, 214],
  size: 100,
  locomotion: 'fly',
  gait: { period: 0.6, swing: 24 },
  sound: 'seagull',
  palette: {
    body: '#fdfdfb',
    belly: '#f0f2f6',
    mantle: '#b9c4d6',
    wing: '#b9c4d6',
    wingDark: '#9eabc0',
    covert: '#cbd4e2',
    covertDark: '#b0bccd',
    wingLine: '#8f9cb3',
    wingLineDark: '#7f8ca3',
    tip: '#33343f',
    tipDark: '#2a2a34',
    mirror: '#ffffff',
    mirrorDark: '#e3e6ee',
    tail: '#f4f6fa',
    tailDark: '#dde2ea',
    beak: '#ffd23f',
    beakLine: '#e0a21f',
    spot: '#f2533f',
    feet: '#ffa95a',
  },
  parts: offset(
    [
      {
        id: 'body',
        role: 'body',
        pivot: [170, 144],
        shapes: [
          {
            d: smooth([
              [216, 48],
              [246, 48],
              [268, 64],
              [276, 90],
              [270, 116],
              [254, 140],
              [230, 162],
              [198, 180],
              [162, 188],
              [126, 186],
              [100, 176],
              [86, 162],
              [94, 150],
              [118, 140],
              [150, 130],
              [176, 114],
              [186, 92],
              [194, 64],
            ]),
            fill: 'body',
          },
          {
            d: tube(
              [
                [196, 92],
                [178, 116],
                [150, 132],
                [118, 144],
                [92, 154],
              ],
              9,
            ),
            kind: 'detail',
            fill: 'mantle',
          },
          { d: ellipse(196, 184, 62, 22, -14), kind: 'detail', fill: 'belly' },
          { d: ellipse(252, 108, 8.5, 5.2), kind: 'feature', fill: 'blush', opacity: 0.55 },
          { d: circle(244, 82, 9.6), kind: 'feature', fill: 'eye' },
          { d: circle(247.6, 78.2, 3.6), kind: 'feature', fill: 'shine' },
        ],
        children: [
          wing('wingF', 'wingF', -18, true),
          {
            id: 'tail',
            role: 'tail',
            behind: true,
            pivot: [96, 160],
            shapes: [{ d: tailFeather([100, 160], 168, 46), fill: 'tail' }],
            children: [
              {
                id: 'tailBack',
                behind: true,
                shapes: [{ d: tailFeather([98, 154], 180, 42), fill: 'tailDark' }],
              },
            ],
          },
          {
            id: 'feet',
            behind: true,
            pivot: [150, 182],
            shapes: [
              { d: capsule(146, 180, 134, 194, 4.6, 3.8), fill: 'feet' },
              { d: capsule(158, 182, 148, 197, 4.6, 3.8), fill: 'feet' },
            ],
          },
          {
            id: 'beak',
            behind: true,
            pivot: [268, 94],
            shapes: [
              { d: BEAK, fill: 'beak' },
              { d: ellipse(302, 110, 7, 5.5, -10), kind: 'detail', fill: 'spot' },
              { d: 'M270 98Q294 98 316 102', kind: 'line', stroke: 'beakLine', width: 2.2 },
            ],
          },
          wing('wingN', 'wingN', -42, false),
        ],
      },
    ],
    -42,
    11,
  ),
};

export default seagull;
