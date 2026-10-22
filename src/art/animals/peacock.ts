import { capsule, circle, curve, ellipse, f, smooth, translatePath, type Pt } from '../core/paths';
import type { AnimalDef, PartNode, Shape } from '../core/types';

const FAN: Pt = [140, 214];
const FAN_R = 118;
const FAN_FROM = 170;
const FAN_TO = 370;
const FAN_STEP = 20;

const polar = (r: number, deg: number): Pt => {
  const a = (deg * Math.PI) / 180;
  return [FAN[0] + Math.cos(a) * r, FAN[1] + Math.sin(a) * r];
};

const fanOutline = (): string => {
  const bump = 10;
  const chord = 2 * FAN_R * Math.sin((FAN_STEP * Math.PI) / 360);
  const rb = f((chord * chord) / (8 * bump) + bump / 2);
  const [sx, sy] = polar(FAN_R, FAN_FROM);
  const [ex, ey] = polar(FAN_R, FAN_TO);
  let d = `M${f(sx)} ${f(sy)}`;
  for (let a = FAN_FROM + FAN_STEP; a <= FAN_TO; a += FAN_STEP) {
    const [x, y] = polar(FAN_R, a);
    d += `A${rb} ${rb} 0 0 1 ${f(x)} ${f(y)}`;
  }
  const bottom = `${FAN[0]} ${FAN[1] + 46}`;
  return `${d}Q${f((ex + FAN[0]) / 2)} ${f(ey + 40)} ${bottom}Q${f((sx + FAN[0]) / 2)} ${f(sy + 40)} ${f(sx)} ${f(sy)}Z`;
};

const eyeSpot = (r: number, deg: number, k: number): Shape[] => {
  const [x, y] = polar(r, deg);
  return [
    { d: ellipse(x, y, 13 * k, 10.5 * k, deg), kind: 'detail', fill: 'gold' },
    { d: ellipse(x, y, 9.5 * k, 7.6 * k, deg), kind: 'detail', fill: 'teal' },
    { d: ellipse(x, y, 5.8 * k, 4.6 * k, deg), kind: 'detail', fill: 'spot' },
  ];
};

const shaft = (deg: number, r1: number, r2: number): Shape => {
  const [x1, y1] = polar(r1, deg);
  const [x2, y2] = polar(r2, deg);
  return { d: capsule(x1, y1, x2, y2, 1.2, 0.9), kind: 'detail', fill: 'fanLine' };
};

const OUTER = [180, 200, 220, 240, 260, 280, 300, 320, 340, 360];
const INNER = [195, 222, 249, 276, 303, 330];

const leg = (id: string, role: string, x: number, far: boolean): PartNode => {
  const fill = far ? 'legDark' : 'leg';
  return {
    id,
    role,
    behind: true,
    pivot: [x, 266],
    shapes: [
      { d: capsule(x, 266, x + 2, 306, 6.5, 5.2), fill },
      { d: capsule(x + 2, 311, x + 24, 314, 4.8, 3.8), fill },
      { d: capsule(x + 2, 311, x - 12, 315, 4.4, 3.4), fill },
    ],
  };
};

const crest = (deg: number): Shape[] => {
  const a = (deg * Math.PI) / 180;
  const [bx, by] = [238, 110];
  const tip: Pt = [bx + Math.cos(a) * 33, by + Math.sin(a) * 33];
  return [
    { d: capsule(bx, by, tip[0], tip[1], 2, 1.6), fill: 'body' },
    { d: circle(tip[0], tip[1], 4.6), fill: 'crest' },
  ];
};

const offset = (parts: PartNode[], dx: number, dy: number): PartNode[] =>
  parts.map((p): PartNode => ({
    ...p,
    pivot: p.pivot && [p.pivot[0] + dx, p.pivot[1] + dy],
    shapes: p.shapes?.map((s) => ({ ...s, d: translatePath(s.d, dx, dy) })),
    children: p.children && offset(p.children, dx, dy),
  }));

const peacock: AnimalDef = {
  id: 'peacock',
  name: 'Peacock',
  aliases: ['peafowl', 'peahen', 'bird'],
  group: 'bird',
  habitats: ['jungle', 'birds'],
  box: [300, 260],
  size: 170,
  locomotion: 'walk2',
  gait: { stride: 75 },
  sound: 'peacock',
  palette: {
    body: '#2f66d8',
    wing: '#2f9d78',
    wingLine: '#1f7356',
    crest: '#27b3c4',
    fan: '#4cb862',
    fanLine: '#36964d',
    gold: '#f2c84b',
    teal: '#22b5a8',
    spot: '#1d3e9e',
    face: '#fdf8ef',
    beak: '#c8b39d',
    leg: '#a8948b',
    legDark: '#8a7770',
  },
  parts: offset(
    [
      {
        id: 'body',
        role: 'body',
        pivot: [190, 270],
        shapes: [
          {
            d: smooth([
              [212, 200],
              [236, 212],
              [246, 236],
              [238, 260],
              [216, 278],
              [184, 284],
              [154, 274],
              [134, 254],
              [128, 232],
              [142, 214],
              [168, 204],
              [192, 198],
            ]),
            fill: 'body',
          },
        ],
        children: [
          {
            id: 'tail',
            role: 'tail',
            behind: true,
            pivot: [FAN[0], FAN[1] + 30],
            motion: { rotate: 2.5, phase: 0.25 },
            shapes: [
              { d: fanOutline(), fill: 'fan' },
              ...OUTER.map((a) => shaft(a, 24, 84)),
              ...OUTER.flatMap((a) => eyeSpot(98, a, 1)),
              ...INNER.flatMap((a) => eyeSpot(60, a, 0.72)),
            ],
          },
          leg('legF', 'legF', 178, true),
          leg('legN', 'legN', 200, false),
          {
            id: 'head',
            role: 'head',
            behind: true,
            pivot: [212, 214],
            shapes: [
              ...[-140, -115, -90, -65, -40].flatMap(crest),
              { d: capsule(210, 222, 238, 152, 21, 16), fill: 'body' },
              { d: circle(242, 134, 29), fill: 'body' },
              { d: 'M264 126Q282 130 287 139Q279 147 263 146Z', fill: 'beak' },
              { d: ellipse(252, 135, 14, 17, 8), kind: 'detail', fill: 'face' },
              { d: ellipse(251, 146, 6.5, 4), kind: 'feature', fill: 'blush', opacity: 0.5 },
              { d: circle(253, 128, 7.8), kind: 'feature', fill: 'eye' },
              { d: circle(255.8, 125, 2.9), kind: 'feature', fill: 'shine' },
            ],
          },
          {
            id: 'wing',
            role: 'wingN',
            pivot: [200, 214],
            shapes: [
              {
                d: smooth([
                  [204, 210],
                  [220, 228],
                  [212, 252],
                  [186, 266],
                  [154, 262],
                  [136, 246],
                  [154, 228],
                  [180, 214],
                ]),
                fill: 'wing',
              },
              { d: curve(164, 244, 196, 250, 6), kind: 'line', stroke: 'wingLine', width: 2.6 },
              { d: curve(172, 230, 204, 236, 6), kind: 'line', stroke: 'wingLine', width: 2.6 },
            ],
          },
        ],
      },
    ],
    0,
    -60,
  ),
};

export default peacock;
