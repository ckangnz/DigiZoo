import { capsule, circle, ellipse, smooth, spline, tube, type Pt } from '../core/paths';
import type { AnimalDef, PartNode, Shape } from '../core/types';

const SPINE: Pt[] = [
  [342, 121],
  [298, 120],
  [254, 118],
  [210, 119],
  [166, 122],
  [124, 126],
  [88, 129],
  [58, 127],
  [35, 118],
  [18, 104],
];
const SAMPLES = 90;

const radius = (t: number) => {
  if (t < 0.3) {
    const s = t / 0.3;
    return 33 + 5 * s * s * (3 - 2 * s);
  }
  const u = Math.min(1, (t - 0.3) / 0.7);
  return 6.5 + 31.5 * Math.pow(1 - u, 1.3) * (1 + 1.3 * u);
};

function spine(phase: number): Pt[] {
  return SPINE.map(([x, y], i) => {
    const t = i / (SPINE.length - 1);
    const k = Math.max(0, (t - 0.45) / 0.55);
    return [x, y + 9 * Math.pow(k, 1.4) * Math.sin(2 * Math.PI * phase - 2.4 * k)];
  });
}

function frame(line: Pt[]) {
  const pts = spline(line, SAMPLES);
  return pts.map((p, i) => {
    const a = pts[Math.max(0, i - 1)];
    const b = pts[Math.min(pts.length - 1, i + 1)];
    const len = Math.hypot(b[0] - a[0], b[1] - a[1]) || 1;
    const n: Pt = [-(b[1] - a[1]) / len, (b[0] - a[0]) / len];
    return { p, n, t: i / SAMPLES, r: radius(i / SAMPLES) };
  });
}

function body(phase: number): Shape[] {
  const line = spine(phase);
  const f = frame(line);
  const ridge: Shape[] = [];
  for (let i = 7; i <= 80; i += 6) {
    const { p, n, t, r } = f[i];
    const b = t < 0.45 ? 9.5 : 9.5 - 5.5 * ((t - 0.45) / 0.55);
    ridge.push({ d: circle(p[0] + n[0] * (r - 2), p[1] + n[1] * (r - 2), b), fill: 'ridge' });
  }
  const bellyLine: Pt[] = f.map(({ p, n, r }) => [p[0] - n[0] * r * 0.92, p[1] - n[1] * r * 0.92]);
  const spot = (i: number, up: number, rx: number, ry: number): Shape => {
    const { p, n, r } = f[i];
    return {
      d: ellipse(p[0] + n[0] * r * up, p[1] + n[1] * r * up, rx, ry),
      kind: 'detail',
      fill: 'spot',
    };
  };
  return [
    ...ridge,
    { d: tube(line, radius, SAMPLES), fill: 'skin' },
    { d: ellipse(330, 132, 40, 25), fill: 'skin' },
    {
      d: tube(bellyLine, (t) => radius(t) * 0.5, SAMPLES),
      kind: 'detail',
      fill: 'belly',
    },
    spot(12, 0.42, 12, 6.5),
    spot(22, 0.5, 13, 7),
    spot(32, 0.42, 12, 6.5),
    spot(42, 0.5, 11, 6),
    spot(52, 0.38, 9, 5),
    spot(62, 0.3, 7, 4),
  ];
}

const leg = (id: string, x: number, far: boolean): PartNode => {
  const fill = far ? 'skinDark' : 'skin';
  return {
    id,
    role: id,
    behind: true,
    pivot: [x, 146],
    shapes: [
      { d: capsule(x, 146, x + 3, 174, 17, 14), fill },
      { d: ellipse(x + 7, 181.5, 21, 8.5), fill },
      { d: circle(x + 24, 184, 5.2), fill },
      { d: circle(x + 16, 186.4, 4.8), fill },
      ...(far
        ? []
        : [
            { d: `M${x + 6} 188.5L${x + 7} 184`, kind: 'line' as const, stroke: 'toe', width: 2.4 },
          ]),
    ],
  };
};

const MOUTH: [Pt, Pt, Pt, Pt] = [
  [455, 112],
  [430, 120],
  [394, 123],
  [368, 116],
];

function onMouth(t: number): Pt {
  const [a, b, c, d] = MOUTH;
  const u = 1 - t;
  return [
    u * u * u * a[0] + 3 * u * u * t * b[0] + 3 * u * t * t * c[0] + t * t * t * d[0],
    u * u * u * a[1] + 3 * u * u * t * b[1] + 3 * u * t * t * c[1] + t * t * t * d[1],
  ];
}

const tooth = (t: number): Shape => {
  const [x, y] = onMouth(t);
  return {
    d: `M${x - 5} ${y - 1}C${x - 5} ${y + 4} ${x - 2.6} ${y + 7.5} ${x} ${y + 7.5}C${x + 2.6} ${y + 7.5} ${x + 5} ${y + 4} ${x + 5} ${y - 1}Z`,
    kind: 'feature',
    fill: 'white',
    stroke: 'auto',
    width: 1.8,
  };
};

const crocodile: AnimalDef = {
  id: 'crocodile',
  name: 'Crocodile',
  aliases: ['croc', 'alligator', 'gator'],
  group: 'reptile',
  habitats: ['jungle', 'rainforest', 'safari'],
  box: [460, 190],
  size: 150,
  locomotion: 'walk4',
  gait: { stride: 60, swing: 20, period: 1 },
  sound: 'crocodile',
  palette: {
    skin: '#66b84e',
    skinDark: '#4f9a3f',
    ridge: '#4c963d',
    belly: '#e1ef93',
    spot: '#57a645',
    toe: '#3f7d31',
    nostril: '#2f5a27',
    cheek: '#ff92a6',
  },
  parts: [
    {
      id: 'body',
      role: 'body',
      pivot: [230, 150],
      frames: body,
      children: [
        leg('legBF', 176, true),
        leg('legFF', 314, true),
        leg('legBN', 150, false),
        leg('legFN', 288, false),
        {
          id: 'head',
          role: 'head',
          pivot: [338, 120],
          shapes: [
            { d: circle(348, 67, 17), fill: 'skinDark' },
            { d: circle(374, 71, 20.5), fill: 'skin' },
            { d: circle(445, 90, 9), fill: 'skin' },
            {
              d: smooth([
                [318, 104],
                [331, 85],
                [355, 75],
                [386, 77],
                [414, 85],
                [442, 89],
                [456, 99],
                [458, 113],
                [448, 126],
                [420, 134],
                [384, 140],
                [350, 142],
                [326, 134],
              ]),
              fill: 'skin',
            },
            { d: ellipse(394, 143, 76, 17), kind: 'detail', fill: 'belly' },
            { d: ellipse(360, 127, 10.5, 6.5), kind: 'feature', fill: 'cheek', opacity: 0.75 },
            { d: circle(350, 64, 8.6), kind: 'feature', fill: 'eye' },
            { d: circle(353.3, 60.4, 3.2), kind: 'feature', fill: 'shine' },
            { d: circle(377, 67, 10.8), kind: 'feature', fill: 'eye' },
            { d: circle(380.9, 62.8, 4.1), kind: 'feature', fill: 'shine' },
            { d: ellipse(441, 87, 2.6, 2), kind: 'feature', fill: 'nostril' },
            { d: ellipse(450, 89, 2.4, 1.9), kind: 'feature', fill: 'nostril' },
            tooth(0.1),
            tooth(0.32),
            tooth(0.55),
            {
              d: `M${MOUTH[0].join(' ')}C${MOUTH[1].join(' ')} ${MOUTH[2].join(' ')} ${MOUTH[3].join(' ')}Q356 113 352 103`,
              kind: 'line',
              stroke: 'mouth',
              width: 3,
            },
          ],
        },
      ],
    },
  ],
};

export default crocodile;
