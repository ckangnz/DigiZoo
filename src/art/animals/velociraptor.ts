import {
  capsule,
  circle,
  curve,
  ellipse,
  leaf,
  smooth,
  spline,
  tube,
  type Pt,
} from '../core/paths';
import type { AnimalDef, PartNode, Shape } from '../core/types';

const TAIL: Pt[] = [
  [180, 138],
  [140, 132],
  [102, 126],
  [70, 121],
  [48, 118],
];
const SAMPLES = 40;

const tailRadius = (t: number) => 30 * (1 - t) ** 1.1 + 8 * t;

function tailLine(phase: number): Pt[] {
  return TAIL.map(([x, y], i) => {
    const k = i / (TAIL.length - 1);
    return [x, y + 5 * k ** 1.5 * Math.sin(2 * Math.PI * phase - 1.2 * k)];
  });
}

function body(phase: number): Shape[] {
  const line = tailLine(phase);
  const pts = spline(line, SAMPLES);
  const frames = pts.map((p, i) => {
    const a = pts[Math.max(0, i - 1)];
    const b = pts[Math.min(SAMPLES, i + 1)];
    const len = Math.hypot(b[0] - a[0], b[1] - a[1]) || 1;
    const n: Pt = [-(b[1] - a[1]) / len, (b[0] - a[0]) / len];
    const ang = (Math.atan2(b[1] - a[1], b[0] - a[0]) * 180) / Math.PI;
    return { p, n, ang, t: i / SAMPLES, r: tailRadius(i / SAMPLES) };
  });
  const start = Math.round(0.28 * SAMPLES);
  const upper: Pt[] = [];
  const lower: Pt[] = [];
  const bumps: Shape[] = [];
  for (let i = start; i <= SAMPLES; i++) {
    const { p, n, t, r } = frames[i];
    const s = Math.min(1, (t - 0.28) / 0.47);
    const w = r + 15 * s * s * (3 - 2 * s);
    upper.push([p[0] + n[0] * w, p[1] + n[1] * w]);
    lower.push([p[0] - n[0] * w, p[1] - n[1] * w]);
    if ((i - start) % 3 === 2) {
      bumps.push({ d: circle(p[0] + n[0] * (w - 1), p[1] + n[1] * (w - 1), 7.5), fill: 'feather' });
      bumps.push({ d: circle(p[0] - n[0] * (w - 1), p[1] - n[1] * (w - 1), 7.5), fill: 'feather' });
    }
  }
  const tip = frames[SAMPLES];
  const fringe: Shape[] = [
    { d: leaf(tip.p[0] + 8, tip.p[1] - 8, 44, 12, tip.ang - 22), fill: 'accent' },
    { d: leaf(tip.p[0] + 8, tip.p[1] + 8, 44, 12, tip.ang + 22), fill: 'accent' },
    { d: leaf(tip.p[0] + 8, tip.p[1], 52, 13, tip.ang), fill: 'crest' },
    ...bumps,
    { d: smooth([...upper, ...lower.reverse()]), fill: 'feather' },
  ];
  const stripe = (t: number): Shape => {
    const { p, n, r, ang } = frames[Math.round(t * SAMPLES)];
    return {
      d: ellipse(p[0] + n[0] * r * 0.85, p[1] + n[1] * r * 0.85, r * 0.26, r * 0.62, ang),
      kind: 'detail',
      fill: 'stripe',
    };
  };
  return [
    ...fringe,
    { d: leaf(236, 100, 38, 9, 196), fill: 'feather' },
    { d: leaf(204, 102, 36, 9, 190), fill: 'accent' },
    { d: leaf(174, 110, 34, 8, 186), fill: 'feather' },
    { d: tube(line, tailRadius, SAMPLES), fill: 'skin' },
    {
      d: smooth([
        [150, 122],
        [176, 102],
        [218, 94],
        [254, 98],
        [276, 86],
        [290, 70],
        [312, 74],
        [312, 100],
        [298, 124],
        [282, 152],
        [254, 174],
        [212, 184],
        [174, 176],
        [150, 154],
      ]),
      fill: 'skin',
    },
    { d: ellipse(262, 146, 26, 38, -30), kind: 'detail', fill: 'belly' },
    stripe(0.08),
    stripe(0.22),
    { d: ellipse(196, 104, 8, 16, 76), kind: 'detail', fill: 'stripe' },
    { d: ellipse(230, 100, 8, 15, 84), kind: 'detail', fill: 'stripe' },
  ];
}

const leg = (id: string, hx: number, hy: number, far: boolean): PartNode => {
  const k = (name: string) => (far ? `${name}Dark` : name);
  return {
    id,
    role: id,
    behind: far,
    pivot: [hx, hy],
    shapes: [
      { d: capsule(hx + 2, hy + 34, hx - 4, hy + 92, 10, 8), fill: k('leg') },
      { d: capsule(hx - 4, hy + 98, hx + 26, hy + 101, 7, 5.5), fill: k('leg') },
      { d: capsule(hx - 4, hy + 98, hx - 14, hy + 102, 6, 5), fill: k('leg') },
      {
        d: `M${hx + 4} ${hy + 94}Q${hx + 12} ${hy + 80} ${hx + 22} ${hy + 84}Q${hx + 14} ${hy + 88} ${hx + 10} ${hy + 98}Z`,
        fill: 'claw',
      },
      { d: leaf(hx - 14, hy + 28, 28, 7, 120), fill: k('feather') },
      { d: ellipse(hx - 2, hy + 14, 25, 32, -12), fill: k('skin') },
    ],
  };
};

const arm = (id: string, sx: number, sy: number, far: boolean): PartNode => {
  const k = (name: string) => (far ? `${name}Dark` : name);
  return {
    id,
    role: id,
    behind: far,
    pivot: [sx, sy],
    shapes: [
      { d: leaf(sx + 2, sy + 10, 50, 12, 132), fill: k('feather') },
      { d: leaf(sx + 10, sy + 18, 56, 12, 142), fill: far ? 'accentDark' : 'accent' },
      { d: leaf(sx + 18, sy + 22, 52, 12, 152), fill: k('feather') },
      { d: leaf(sx + 26, sy + 22, 42, 11, 162), fill: far ? 'crestDark' : 'crest' },
      { d: capsule(sx, sy, sx + 10, sy + 24, 10, 7.5), fill: k('skin') },
      { d: capsule(sx + 10, sy + 24, sx + 26, sy + 22, 7.5, 6), fill: k('skin') },
      { d: circle(sx + 29, sy + 18, 3.8), fill: 'claw' },
      { d: circle(sx + 30, sy + 26, 3.8), fill: 'claw' },
    ],
  };
};

const velociraptor: AnimalDef = {
  id: 'velociraptor',
  name: 'Velociraptor',
  kind: 'animal',
  aliases: ['raptor', 'velo', 'feathered dinosaur', 'dinosaur'],
  group: 'dinosaur',
  habitats: ['dinosaur'],
  box: [400, 276],
  size: 170,
  locomotion: 'walk2',
  gait: { period: 0.6, swing: 24, stride: 96 },
  sound: 'velociraptor',
  palette: {
    skin: '#9a78e6',
    skinDark: '#7f60cf',
    stripe: '#7d5fd2',
    belly: '#efe6ff',
    feather: '#36c3b0',
    featherDark: '#2aa392',
    accent: '#ffcf4f',
    accentDark: '#e8b43a',
    crest: '#ff7fb3',
    crestDark: '#e8649b',
    leg: '#f5a94e',
    legDark: '#d98c38',
    claw: '#fff4dc',
    cheek: '#ff8fb8',
  },
  parts: [
    {
      id: 'body',
      role: 'body',
      pivot: [200, 176],
      frames: body,
      children: [
        leg('legF', 182, 170, true),
        arm('armF', 262, 126, true),
        leg('legN', 206, 174, false),
        {
          id: 'head',
          role: 'head',
          pivot: [298, 96],
          shapes: [
            { d: leaf(294, 70, 34, 8, 168), fill: 'feather' },
            { d: leaf(292, 82, 30, 7, 150), fill: 'accent' },
            { d: leaf(304, 50, 38, 9, -170), fill: 'crest' },
            { d: leaf(310, 44, 42, 9, -146), fill: 'accent' },
            { d: leaf(318, 40, 32, 8, -122), fill: 'feather' },
            {
              d: smooth([
                [286, 66],
                [300, 42],
                [330, 32],
                [356, 36],
                [374, 50],
                [382, 70],
                [372, 88],
                [346, 98],
                [316, 100],
                [294, 90],
              ]),
              fill: 'skin',
            },
            { d: ellipse(340, 104, 38, 12), kind: 'detail', fill: 'belly' },
            { d: ellipse(318, 82, 10, 6), kind: 'feature', fill: 'cheek', opacity: 0.7 },
            { d: circle(330, 60, 14), kind: 'feature', fill: 'eye' },
            { d: circle(335.2, 54.6, 5.2), kind: 'feature', fill: 'shine' },
            { d: ellipse(374, 60, 2.6, 2), kind: 'feature', fill: 'mouth' },
            { d: curve(376, 80, 344, 86, -5), kind: 'line', stroke: 'mouth', width: 3 },
          ],
        },
        arm('armN', 270, 132, false),
      ],
    },
  ],
};

export default velociraptor;
