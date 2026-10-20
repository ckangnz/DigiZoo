import { capsule, circle, curve, ellipse, smooth, spline, tube, type Pt } from '../core/paths';
import type { AnimalDef, PartNode, Shape } from '../core/types';

const TAIL: Pt[] = [
  [176, 238],
  [128, 250],
  [84, 264],
  [46, 278],
  [16, 284],
];
const SAMPLES = 40;

const tailRadius = (t: number) => 44 * (1 - t) ** 1.15 + 6 * t;

function tailLine(phase: number): Pt[] {
  return TAIL.map(([x, y], i) => {
    const k = i / (TAIL.length - 1);
    return [x, y + 8 * k ** 1.5 * Math.sin(2 * Math.PI * phase - 1.4 * k)];
  });
}

const TORSO: Pt[] = [
  [276, 128],
  [314, 140],
  [334, 176],
  [332, 220],
  [310, 262],
  [266, 290],
  [212, 298],
  [166, 286],
  [138, 258],
  [132, 224],
  [150, 192],
  [196, 168],
  [240, 150],
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
      d: ellipse(x + n[0] * r * 0.9, y + n[1] * r * 0.9, r * 0.24, r * 0.66, ang),
      kind: 'detail',
      fill: 'stripe',
    };
  };
  return [
    { d: tube(line, tailRadius, SAMPLES), fill: 'skin' },
    { d: smooth(TORSO), fill: 'skin' },
    { d: ellipse(300, 238, 32, 60, -26), kind: 'detail', fill: 'belly' },
    band(0.14),
    band(0.34),
    band(0.54),
    band(0.74),
  ];
}

const SAIL_BASE: Pt[] = [
  [128, 236],
  [160, 196],
  [204, 172],
  [248, 156],
  [292, 146],
];

const SAIL_TOP: Pt[] = [
  [112, 214],
  [124, 140],
  [158, 82],
  [204, 50],
  [252, 52],
  [292, 82],
  [314, 128],
];

function sail(): Shape[] {
  const top = spline(SAIL_TOP, 12);
  const base = spline(SAIL_BASE, 12);
  const bumps = top.slice(1, 12).map(([x, y]) => ({ d: circle(x, y, 9), fill: 'sail' }));
  const ribs: Shape[] = [];
  for (let i = 1; i < 12; i += 2) {
    const [x1, y1] = base[i];
    const [x2, y2] = top[i];
    ribs.push({
      d: tube(
        [
          [x1, y1 + 12],
          [(x1 + x2) / 2, (y1 + y2) / 2],
          [x2, y2 + 4],
        ],
        (t) => 6.5 - 3 * t,
        24,
      ),
      kind: 'detail',
      fill: 'rib',
    });
  }
  return [...bumps, { d: smooth([...top, ...base.slice().reverse()]), fill: 'sail' }, ...ribs];
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
      ...[
        [52, 110, 6.5],
        [44, 119, 6],
        [31, 123, 5.5],
      ].map(([dx, dy, r]) => ({
        d: ellipse(hx + dx, hy + dy, r * 0.85, r),
        kind: 'detail' as const,
        fill: far ? 'clawDark' : 'claw',
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
      { d: capsule(sx, sy, sx + 12, sy + 30, 11, 8.5), fill },
      { d: capsule(sx + 12, sy + 30, sx + 32, sy + 24, 8.5, 7), fill },
      { d: circle(sx + 36, sy + 18, 4.6), fill: 'claw' },
      { d: circle(sx + 38, sy + 26, 4.6), fill: 'claw' },
      { d: circle(sx + 34, sy + 33, 4.4), fill: 'claw' },
    ],
  };
};

const tooth = (x: number, y: number): Shape => ({
  d: `M${x - 5} ${y - 1}C${x - 5} ${y + 4} ${x - 2.6} ${y + 7.5} ${x} ${y + 7.5}C${x + 2.6} ${y + 7.5} ${x + 5} ${y + 4} ${x + 5} ${y - 1}Z`,
  kind: 'feature',
  fill: 'white',
  stroke: 'auto',
  width: 1.8,
});

const spinosaurus: AnimalDef = {
  id: 'spinosaurus',
  name: 'Spinosaurus',
  kind: 'animal',
  aliases: ['spino', 'sail back', 'sailback', 'spine lizard', 'dinosaur'],
  group: 'dinosaur',
  habitats: ['dinosaur'],
  box: [470, 380],
  size: 360,
  locomotion: 'walk2',
  gait: { period: 1, swing: 18, stride: 136 },
  sound: 'spinosaurus',
  palette: {
    skin: '#45ad9c',
    skinDark: '#359483',
    stripe: '#348f80',
    belly: '#dbf4ea',
    sail: '#f6774f',
    rib: '#ffc95c',
    claw: '#fff4e2',
    clawDark: '#d4ebe2',
    cheek: '#ff8fa8',
    nostril: '#246b5f',
  },
  parts: [
    {
      id: 'body',
      role: 'body',
      pivot: [216, 300],
      frames: body,
      children: [
        { id: 'sail', behind: true, shapes: sail() },
        leg('legF', 184, 252, true),
        arm('armF', 304, 200, true),
        leg('legN', 216, 258, false),
        {
          id: 'head',
          role: 'head',
          pivot: [304, 150],
          shapes: [
            {
              d: smooth([
                [290, 112],
                [306, 86],
                [338, 74],
                [372, 80],
                [400, 98],
                [432, 106],
                [458, 114],
                [466, 130],
                [454, 144],
                [418, 150],
                [376, 154],
                [334, 156],
                [302, 144],
              ]),
              fill: 'skin',
            },
            { d: ellipse(380, 162, 72, 16), kind: 'detail', fill: 'belly' },
            { d: ellipse(336, 128, 11, 7), kind: 'feature', fill: 'cheek', opacity: 0.7 },
            { d: circle(344, 104, 13), kind: 'feature', fill: 'eye' },
            { d: circle(348.8, 98.8, 4.9), kind: 'feature', fill: 'shine' },
            { d: ellipse(452, 116, 3.4, 2.6, 15), kind: 'feature', fill: 'nostril' },
            tooth(448, 136),
            tooth(430, 139),
            tooth(412, 141),
            {
              d: 'M460 134Q410 146 356 138',
              kind: 'line',
              stroke: 'mouth',
              width: 3.2,
            },
            { d: curve(356, 138, 348, 130, -3), kind: 'line', stroke: 'mouth', width: 3.2 },
          ],
        },
        arm('armN', 314, 206, false),
      ],
    },
  ],
};

export default spinosaurus;
