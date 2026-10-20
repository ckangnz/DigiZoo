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
  [170, 194],
  [124, 202],
  [82, 214],
  [44, 228],
  [14, 238],
];
const SAMPLES = 40;

const tailRadius = (t: number) => 40 * (1 - t) ** 1.15 + 6 * t;

function tailLine(phase: number): Pt[] {
  return TAIL.map(([x, y], i) => {
    const k = i / (TAIL.length - 1);
    return [x, y + 8 * k ** 1.5 * Math.sin(2 * Math.PI * phase - 1.4 * k)];
  });
}

const TORSO: Pt[] = [
  [292, 92],
  [318, 104],
  [324, 140],
  [318, 182],
  [298, 220],
  [258, 246],
  [210, 252],
  [168, 240],
  [144, 214],
  [142, 180],
  [164, 152],
  [210, 136],
  [252, 124],
  [274, 104],
];

function body(phase: number): Shape[] {
  const line = tailLine(phase);
  const pts = spline(line, SAMPLES);
  const band = (t: number): Shape => {
    const i = Math.round(t * SAMPLES);
    const a = pts[Math.max(0, i - 1)];
    const b = pts[Math.min(SAMPLES, i + 1)];
    const ang = (Math.atan2(b[1] - a[1], b[0] - a[0]) * 180) / Math.PI;
    const r = tailRadius(t);
    const [x, y] = pts[i];
    const n: Pt = [-Math.sin((ang * Math.PI) / 180), Math.cos((ang * Math.PI) / 180)];
    return {
      d: ellipse(x + n[0] * r * 0.9, y + n[1] * r * 0.9, r * 0.28, r * 0.75, ang),
      kind: 'detail',
      fill: 'stripe',
    };
  };
  return [
    { d: tube(line, tailRadius, SAMPLES), fill: 'skin' },
    { d: smooth(TORSO), fill: 'skin' },
    { d: ellipse(292, 196, 30, 58, -24), kind: 'detail', fill: 'belly' },
    { d: ellipse(176, 152, 10, 26, 54), kind: 'detail', fill: 'stripe' },
    { d: ellipse(214, 136, 10, 26, 64), kind: 'detail', fill: 'stripe' },
    { d: ellipse(252, 122, 10, 24, 50), kind: 'detail', fill: 'stripe' },
    { d: ellipse(284, 96, 8, 20, 20), kind: 'detail', fill: 'stripe' },
    band(0.12),
    band(0.32),
    band(0.52),
    band(0.72),
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
      { d: capsule(hx + 2, hy + 48, hx - 2, hy + 88, 18, 14), fill },
      { d: ellipse(hx + 14, hy + 98, 28, 11), fill },
      { d: ellipse(hx - 4, hy + 8, 32, 44, -10), fill },
      ...[0, 12, 24].map((dx) => ({
        d: ellipse(hx + 4 + dx, hy + 106, 6, 5.5),
        kind: 'detail' as const,
        fill: far ? 'nailDark' : 'nail',
      })),
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
      { d: capsule(sx, sy, sx + 8, sy + 28, 10, 8), fill },
      { d: capsule(sx + 8, sy + 28, sx + 24, sy + 38, 8, 6.5), fill },
      { d: ellipse(sx + 29, sy + 40, 7.5, 6.5, 20), fill },
    ],
  };
};

const HEAD_PIVOT: Pt = [300, 100];

const grow = (shapes: Shape[]): Shape[] =>
  shapes.map((s) => ({ ...s, d: scalePath(s.d, 1.1, 1.1, HEAD_PIVOT[0], HEAD_PIVOT[1]) }));

const parasaurolophus: AnimalDef = {
  id: 'parasaurolophus',
  name: 'Parasaurolophus',
  kind: 'animal',
  aliases: ['parasaur', 'para', 'duck billed dinosaur', 'duckbill', 'hadrosaur', 'dinosaur'],
  group: 'dinosaur',
  habitats: ['dinosaur'],
  box: [420, 330],
  size: 300,
  locomotion: 'walk2',
  gait: { period: 0.9, swing: 18, stride: 110 },
  sound: 'parasaurolophus',
  palette: {
    skin: '#f797bd',
    skinDark: '#e27ba5',
    stripe: '#c873c9',
    belly: '#ffe2ee',
    crest: '#ffad45',
    crestLine: '#ffd56e',
    bill: '#ffd98a',
    nail: '#fff2f6',
    nailDark: '#f6c9da',
    cheek: '#ff7aa6',
    nostril: '#b34f7b',
  },
  parts: [
    {
      id: 'body',
      role: 'body',
      pivot: [214, 254],
      frames: body,
      children: [
        leg('legF', 188, 216, true),
        arm('armF', 290, 174, true),
        leg('legN', 214, 222, false),
        {
          id: 'head',
          role: 'head',
          pivot: HEAD_PIVOT,
          shapes: grow([
            {
              d: tube(
                [
                  [326, 66],
                  [294, 46],
                  [258, 30],
                  [226, 22],
                ],
                (t) => 13 - 3 * t,
                40,
              ),
              fill: 'crest',
            },
            {
              d: tube(
                [
                  [318, 60],
                  [292, 44],
                  [258, 30],
                  [232, 24],
                ],
                3.2,
                40,
              ),
              kind: 'detail',
              fill: 'crestLine',
            },
            {
              d: smooth([
                [370, 80],
                [398, 82],
                [414, 92],
                [414, 106],
                [398, 116],
                [370, 114],
              ]),
              fill: 'bill',
            },
            {
              d: smooth([
                [290, 84],
                [302, 60],
                [330, 50],
                [358, 56],
                [378, 70],
                [390, 86],
                [388, 104],
                [366, 114],
                [334, 116],
                [306, 108],
              ]),
              fill: 'skin',
            },
            { d: ellipse(340, 122, 40, 12), kind: 'detail', fill: 'belly' },
            { d: ellipse(326, 96, 10, 6), kind: 'feature', fill: 'cheek', opacity: 0.6 },
            { d: circle(334, 74, 11.5), kind: 'feature', fill: 'eye' },
            { d: circle(338.4, 69.6, 4.4), kind: 'feature', fill: 'shine' },
            { d: ellipse(404, 90, 3, 2.2, 10), kind: 'feature', fill: 'nostril' },
            { d: curve(408, 104, 360, 104, -5), kind: 'line', stroke: 'mouth', width: 3 },
          ]),
        },
        arm('armN', 298, 180, false),
      ],
    },
  ],
};

export default parasaurolophus;
