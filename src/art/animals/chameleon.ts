import { capsule, circle, ellipse, smooth, spline, tube, type Pt } from '../core/paths';
import type { AnimalDef, PartNode, Shape } from '../core/types';

const GROUND = 200;
const TAU = Math.PI * 2;

const BODY: Pt[] = [
  [96, 104],
  [112, 76],
  [140, 56],
  [174, 48],
  [206, 56],
  [226, 76],
  [234, 102],
  [226, 128],
  [200, 144],
  [160, 150],
  [122, 142],
  [100, 126],
];

function tailLine(phase: number): Pt[] {
  const s = Math.sin(TAU * phase);
  const cx = 58;
  const cy = 148 + 1.2 * s;
  const r0 = 34;
  const pitch = 22.5 + 1.2 * s;
  const turns = 1.12;
  const lead: Pt[] = [
    [112, 112],
    [92, 116],
    [72, 115],
  ];
  const spiral: Pt[] = [];
  const n = 28;
  for (let i = 0; i <= n; i++) {
    const u = (i / n) * turns;
    const a = -Math.PI / 2 - u * TAU;
    const r = r0 - pitch * u;
    spiral.push([cx + r * Math.cos(a), cy + r * Math.sin(a)]);
  }
  return [...lead, ...spiral];
}

const tailRadius = (t: number) => (t < 0.2 ? 15 - 25 * t : 10 - 6 * ((t - 0.2) / 0.8) ** 0.9);

function body(phase: number): Shape[] {
  const line = tailLine(phase);
  const samples = 120;
  const pts = spline(line, samples);
  const at = (t: number) => {
    const i = Math.round(t * samples);
    const a = pts[Math.max(0, i - 1)];
    const b = pts[Math.min(samples, i + 1)];
    return { p: pts[i], angle: (Math.atan2(b[1] - a[1], b[0] - a[0]) * 180) / Math.PI };
  };
  const tailBand = (t: number): Shape => {
    const { p, angle } = at(t);
    return {
      d: ellipse(p[0], p[1], 2.8, tailRadius(t) + 2, angle),
      kind: 'detail',
      fill: 'stripe',
    };
  };
  const crest: Shape[] = [];
  for (let k = 0; k < 7; k++) {
    const u = k / 6;
    const x = 122 + u * 92;
    const y = 66 - 22 * Math.sin(Math.PI * (0.15 + 0.8 * u)) + 2;
    crest.push({ d: circle(x, y + 2.5, 5 - 1.2 * Math.abs(u - 0.4)), fill: 'skin' });
  }
  return [
    { d: tube(line, tailRadius, samples), fill: 'skin' },
    ...crest,
    { d: smooth(BODY), fill: 'skin' },
    { d: ellipse(166, 152, 64, 16), kind: 'detail', fill: 'belly' },
    {
      d: tube(
        [
          [228, 104],
          [196, 110],
          [160, 112],
          [124, 110],
          [96, 112],
        ],
        (t) => 8.5 - 3 * t,
      ),
      kind: 'detail',
      fill: 'stripe',
    },
    { d: ellipse(198, 80, 7, 13, 12), kind: 'detail', fill: 'bar' },
    { d: ellipse(166, 76, 7.5, 15, 4), kind: 'detail', fill: 'bar' },
    { d: ellipse(134, 84, 7, 13, -8), kind: 'detail', fill: 'bar' },
    { d: circle(184, 128, 3.6), kind: 'detail', fill: 'dot' },
    { d: circle(150, 132, 3.2), kind: 'detail', fill: 'dot' },
    { d: circle(120, 124, 3), kind: 'detail', fill: 'dot' },
    tailBand(0.16),
    tailBand(0.3),
    tailBand(0.44),
    tailBand(0.58),
    tailBand(0.72),
  ];
}

const foot = (x: number, y: number, fill: string): Shape[] => [
  { d: capsule(x, y - 1, x + 10, y + 5.5, 5.4, 4.4), fill },
  { d: capsule(x, y - 1, x - 9, y + 5.5, 5.4, 4.4), fill },
];

const leg = (id: string, top: Pt, joint: Pt, paw: Pt, far: boolean): PartNode => {
  const fill = far ? 'skinDark' : 'skin';
  return {
    id,
    role: id,
    behind: true,
    pivot: top,
    shapes: [
      { d: capsule(top[0], top[1], joint[0], joint[1], 8.5, 6.5), fill },
      { d: capsule(joint[0], joint[1], paw[0], paw[1], 6.5, 5), fill },
      ...foot(paw[0], paw[1], fill),
    ],
  };
};

const chameleon: AnimalDef = {
  id: 'chameleon',
  name: 'Chameleon',
  kind: 'animal',
  aliases: ['panther chameleon', 'veiled chameleon', 'lizard'],
  group: 'reptile',
  habitats: ['rainforest'],
  box: [304, 200],
  size: 90,
  locomotion: 'walk4',
  gait: { period: 1.7, stride: 56, swing: 12 },
  sound: 'chameleon',
  palette: {
    skin: '#5ccb4c',
    skinDark: '#46aa3e',
    belly: '#c3f27f',
    stripe: '#ffe14d',
    bar: '#49b741',
    dot: '#e9ff9a',
    casque: '#4fbc45',
    eyeRing: '#ffe873',
    lip: '#fff1a1',
    cheek: '#ff9cc0',
    casqueLine: '#3e9c38',
  },
  parts: [
    {
      id: 'body',
      role: 'body',
      pivot: [166, 150],
      frames: body,
      children: [
        leg('legBF', [132, 128], [146, 160], [134, GROUND - 9], true),
        leg('legFF', [222, 124], [210, 160], [228, GROUND - 9], true),
        leg('legBN', [116, 130], [130, 162], [116, GROUND - 8], false),
        leg('legFN', [206, 128], [194, 162], [212, GROUND - 8], false),
        {
          id: 'head',
          role: 'head',
          pivot: [222, 100],
          shapes: [
            {
              d: smooth([
                [292, 94],
                [282, 74],
                [262, 56],
                [238, 38],
                [216, 22],
                [204, 36],
                [202, 68],
                [214, 96],
                [236, 112],
                [266, 112],
                [286, 104],
              ]),
              fill: 'skin',
            },
            {
              d: smooth([
                [216, 20],
                [202, 36],
                [200, 62],
                [214, 60],
                [236, 50],
                [252, 46],
              ]),
              kind: 'detail',
              fill: 'casque',
            },
            {
              d: 'M214 30Q226 44 248 52',
              kind: 'line',
              stroke: 'casqueLine',
              width: 2.6,
            },
            {
              d: tube(
                [
                  [292, 100],
                  [270, 106],
                  [244, 106],
                  [222, 98],
                ],
                (t) => 4.5 - 1.5 * t,
              ),
              kind: 'detail',
              fill: 'lip',
            },
            { d: circle(250, 76, 19), fill: 'skin' },
            { d: circle(250, 76, 15.5), kind: 'detail', fill: 'eyeRing' },
            { d: circle(253, 75, 10), kind: 'feature', fill: 'eye' },
            { d: circle(257, 70.5, 3.8), kind: 'feature', fill: 'shine' },
            { d: circle(249.5, 79.5, 1.6), kind: 'feature', fill: 'shine' },
            { d: ellipse(270, 94, 8, 5), kind: 'feature', fill: 'cheek', opacity: 0.9 },
            { d: 'M289 99Q268 108 246 101', kind: 'line', stroke: 'mouth', width: 2.6 },
          ],
        },
      ],
    },
  ],
};

export default chameleon;
