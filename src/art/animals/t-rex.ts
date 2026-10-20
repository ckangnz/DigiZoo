import {
  capsule,
  circle,
  curve,
  ellipse,
  scalePath,
  smooth,
  spline,
  tube,
  type Pt,
} from '../core/paths';
import type { AnimalDef, PartNode, Shape } from '../core/types';

const TAIL: Pt[] = [
  [178, 226],
  [130, 238],
  [86, 254],
  [50, 268],
  [22, 276],
  [6, 273],
];

const tailRadius = (t: number) => 46 * (1 - t) ** 1.2 + 6 * t;

function tailLine(phase: number): Pt[] {
  return TAIL.map(([x, y], i) => {
    const k = i / (TAIL.length - 1);
    return [x, y + 8 * k ** 1.5 * Math.sin(2 * Math.PI * phase - 1.4 * k)];
  });
}

const TORSO: Pt[] = [
  [262, 116],
  [302, 130],
  [320, 168],
  [320, 214],
  [300, 258],
  [258, 288],
  [206, 296],
  [162, 284],
  [134, 256],
  [128, 222],
  [148, 186],
  [192, 160],
  [234, 138],
];

function body(phase: number): Shape[] {
  const line = tailLine(phase);
  const pts = spline(line, 40);
  const stripes: Shape[] = [];
  [0.1, 0.28, 0.46, 0.64].forEach((t) => {
    const i = Math.round(t * 40);
    const a = pts[Math.max(0, i - 1)];
    const b = pts[Math.min(40, i + 1)];
    const ang = (Math.atan2(b[1] - a[1], b[0] - a[0]) * 180) / Math.PI;
    const r = tailRadius(t);
    const [x, y] = pts[i];
    const nx = -Math.sin((ang * Math.PI) / 180);
    const ny = Math.cos((ang * Math.PI) / 180);
    stripes.push({
      d: ellipse(x + nx * r, y + ny * r, r * 0.22, r * 0.62, ang),
      kind: 'detail',
      fill: 'stripe',
    });
  });
  return [
    { d: tube(line, tailRadius, 60), fill: 'skin' },
    { d: smooth(TORSO), fill: 'skin' },
    { d: ellipse(184, 160, 9, 22, 60), kind: 'detail', fill: 'stripe' },
    { d: ellipse(222, 142, 9, 22, 66), kind: 'detail', fill: 'stripe' },
    { d: ellipse(152, 186, 9, 22, 50), kind: 'detail', fill: 'stripe' },
    ...stripes,
    { d: ellipse(282, 232, 34, 62, -28), kind: 'detail', fill: 'belly' },
  ];
}

const leg = (id: string, hx: number, hy: number, far: boolean): PartNode => {
  const fill = far ? 'skinDark' : 'skin';
  return {
    id,
    role: id,
    behind: far,
    pivot: [hx, hy],
    shapes: [
      { d: capsule(hx + 4, hy + 60, hx, hy + 100, 22, 18), fill },
      { d: ellipse(hx + 20, hy + 110, 36, 14), fill },
      { d: ellipse(hx - 6, hy + 8, 40, 50, -10), fill },
      { d: ellipse(hx + 52, hy + 110, 5.5, 6.5), kind: 'detail', fill: far ? 'clawDark' : 'claw' },
      { d: ellipse(hx + 44, hy + 119, 5.5, 6), kind: 'detail', fill: far ? 'clawDark' : 'claw' },
      { d: ellipse(hx + 31, hy + 123, 5.5, 5.5), kind: 'detail', fill: far ? 'clawDark' : 'claw' },
    ],
  };
};

const arm = (id: string, sx: number, sy: number, far: boolean): PartNode => {
  const fill = far ? 'skinDark' : 'skin';
  return {
    id,
    role: id,
    behind: far,
    pivot: [sx, sy],
    shapes: [
      { d: capsule(sx, sy, sx + 12, sy + 22, 9.5, 7.5), fill },
      { d: capsule(sx + 12, sy + 22, sx + 28, sy + 16, 7.5, 6), fill },
      { d: circle(sx + 31, sy + 11, 4.2), fill },
      { d: circle(sx + 33, sy + 19, 4.2), fill },
    ],
  };
};

const tooth = (x: number, y: number, s = 1.15): Shape => ({
  d: `M${x - 5.5 * s} ${y - 1}C${x - 5.5 * s} ${y + 4 * s} ${x - 2.8 * s} ${y + 8 * s} ${x} ${y + 8 * s}C${x + 2.8 * s} ${y + 8 * s} ${x + 5.5 * s} ${y + 4 * s} ${x + 5.5 * s} ${y - 1}Z`,
  kind: 'feature',
  fill: 'white',
  stroke: 'auto',
  width: 1.8,
});

const HEAD_PIVOT: Pt = [296, 140];

const grow = (shapes: Shape[]): Shape[] =>
  shapes.map((s) => ({ ...s, d: scalePath(s.d, 1.1, 1.1, HEAD_PIVOT[0], HEAD_PIVOT[1]) }));

const tRex: AnimalDef = {
  id: 't-rex',
  name: 'T. rex',
  kind: 'animal',
  aliases: ['tyrannosaurus', 'tyrannosaurus rex', 'rex', 'trex', 't rex', 'dinosaur'],
  group: 'dinosaur',
  habitats: ['dinosaur'],
  box: [456, 380],
  size: 380,
  locomotion: 'walk2',
  gait: { period: 0.95, swing: 18, stride: 140 },
  sound: 't-rex',
  palette: {
    skin: '#7cc650',
    skinDark: '#63ab3e',
    stripe: '#5aa23a',
    belly: '#f1ef9e',
    claw: '#fff7dc',
    clawDark: '#e4dcbc',
    nostril: '#3d6e2a',
    cheek: '#ff8fa3',
  },
  parts: [
    {
      id: 'body',
      role: 'body',
      pivot: [214, 300],
      frames: body,
      children: [
        leg('legF', 182, 246, true),
        arm('armF', 296, 190, true),
        leg('legN', 214, 252, false),
        {
          id: 'head',
          role: 'head',
          pivot: HEAD_PIVOT,
          shapes: grow([
            {
              d: smooth([
                [292, 34],
                [352, 24],
                [404, 34],
                [430, 60],
                [436, 92],
                [426, 120],
                [394, 140],
                [340, 152],
                [292, 148],
                [262, 126],
                [252, 92],
                [262, 56],
              ]),
              fill: 'skin',
            },
            {
              d: 'M444 96Q372 132 304 108Q300 140 336 160L444 164Z',
              kind: 'detail',
              fill: 'belly',
            },
            { d: ellipse(300, 48, 10, 24, 74), kind: 'detail', fill: 'stripe' },
            { d: ellipse(268, 72, 9, 20, 40), kind: 'detail', fill: 'stripe' },
            { d: ellipse(318, 92, 13, 8), kind: 'feature', fill: 'cheek', opacity: 0.7 },
            { d: circle(340, 66, 14), kind: 'feature', fill: 'eye' },
            { d: circle(344.8, 60.6, 5.2), kind: 'feature', fill: 'shine' },
            { d: ellipse(418, 58, 4, 3, 20), kind: 'feature', fill: 'nostril' },
            tooth(412, 107),
            tooth(394, 114),
            tooth(375, 118),
            tooth(356, 119),
            {
              d: 'M428 98Q372 128 304 108',
              kind: 'line',
              stroke: 'mouth',
              width: 3.4,
            },
            { d: curve(304, 108, 296, 98, -3), kind: 'line', stroke: 'mouth', width: 3.4 },
          ]),
        },
        arm('armN', 308, 196, false),
      ],
    },
  ],
};

export default tRex;
