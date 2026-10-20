import { capsule, circle, ellipse, smooth, tube, type Pt } from '../core/paths';
import type { AnimalDef, PartNode, Shape } from '../core/types';

const GROUND = 180;

const LEAN = [-22, -9, 8, 20];

const leg = (n: number, x: number, far: boolean): PartNode => {
  const fill = far ? 'shellDark' : 'shell';
  const lean = LEAN[n - 1];
  const top = far ? 132 : 138;
  const footY = far ? GROUND - 9 : GROUND - 3.8;
  const line: Pt[] = [
    [x, top],
    [x + lean * 0.75, top + 16],
    [x + lean * 1.25, (top + 16 + footY) / 2 + 2],
    [x + lean * 1.45, footY],
  ];
  return {
    id: `leg${n}${far ? 'F' : 'N'}`,
    role: `leg${n}${far ? 'F' : 'N'}`,
    behind: true,
    phase: ((n - 1) * 0.25 + (far ? 0.5 : 0)) % 1,
    pivot: [x, top],
    shapes: [
      { d: tube(line, (u) => 5.4 - 2 * u, 24), fill },
      { d: circle(x + lean * 1.45, footY, 3.9), fill },
    ],
  };
};

const claw = (id: string, ox: number, oy: number, far: boolean): PartNode => {
  const fill = far ? 'shellDark' : 'shell';
  const t = (pts: Pt[]): Pt[] => pts.map(([x, y]) => [x + ox, y + oy]);
  const cap = (a: Pt, b: Pt, r1: number, r2: number): Shape => {
    const [p, q] = t([a, b]);
    return { d: capsule(p[0], p[1], q[0], q[1], r1, r2), fill };
  };
  const [palm, shine] = t([
    [214, 128],
    [209, 121],
  ]);
  return {
    id,
    role: id,
    behind: far,
    pivot: t([[158, 140]])[0],
    shapes: [
      cap([158, 140], [182, 150], 7.5, 6.5),
      cap([182, 150], [200, 136], 6.5, 7.5),
      {
        d: tube(
          t([
            [215, 115],
            [229, 106],
            [242, 109],
            [248, 120],
          ]),
          (u) => 10 - 4.5 * u,
          24,
        ),
        fill,
      },
      {
        d: tube(
          t([
            [218, 142],
            [232, 144],
            [243, 137],
          ]),
          (u) => 8 - 3 * u,
          20,
        ),
        fill,
      },
      { d: ellipse(palm[0], palm[1], 20, 17, -15), fill },
      ...(far
        ? []
        : [
            {
              d: ellipse(shine[0], shine[1], 7, 4.2, -18),
              kind: 'detail' as const,
              fill: 'shine2',
            },
          ]),
    ],
  };
};

const SEGMENTS: { c: Pt; r: number; a: number }[] = [
  { c: [40, 108], r: 15.5, a: -120 },
  { c: [28, 84], r: 14.5, a: -100 },
  { c: [30, 60], r: 13.5, a: -70 },
  { c: [46, 40], r: 12.5, a: -35 },
  { c: [70, 32], r: 12, a: 0 },
];

function tail(i: number): PartNode {
  const { c, r, a } = SEGMENTS[i];
  const prev = i ? SEGMENTS[i - 1].c : ([56, 124] as Pt);
  const pivot: Pt = [(prev[0] + c[0]) / 2, (prev[1] + c[1]) / 2];
  const child =
    i < SEGMENTS.length - 1
      ? tail(i + 1)
      : {
          id: 'stinger',
          pivot: [82, 34] as Pt,
          motion: { rotate: 5, phase: 0.62 },
          shapes: [
            {
              d: tube(
                [
                  [99, 49],
                  [106, 56],
                  [107, 63],
                ],
                (u) => 6.5 - 2.2 * u,
                16,
              ),
              fill: 'sting',
            },
            { d: ellipse(91, 42, 16, 13.5, 30), fill: 'shell' },
            { d: ellipse(88, 37, 5.5, 3.5, 30), kind: 'detail' as const, fill: 'shine2' },
          ],
        };
  return {
    id: `tail${i + 1}`,
    role: i === 0 ? 'tail' : undefined,
    behind: i === 0,
    pivot,
    motion: i === 0 ? undefined : { rotate: 3, phase: 0.3 + i * 0.07 },
    shapes: [
      { d: ellipse(c[0], c[1], r * 1.12, r, a), fill: 'shell' },
      { d: ellipse(c[0], c[1] - r * 0.35, r * 0.5, r * 0.28, a), kind: 'detail', fill: 'shine2' },
    ],
    children: [child],
  };
}

const scorpion: AnimalDef = {
  id: 'scorpion',
  name: 'Scorpion',
  aliases: ['scorpio'],
  group: 'bug',
  habitats: ['desert'],
  box: [282, 180],
  size: 70,
  locomotion: 'crawl',
  gait: { swing: 12 },
  sound: 'scorpion',
  palette: {
    shell: '#f3a43a',
    shellDark: '#d9862c',
    shine2: '#ffc867',
    belly: '#ffd98e',
    sting: '#b8662a',
    segment: '#c97a2a',
  },
  parts: [
    {
      id: 'body',
      role: 'body',
      pivot: [110, 140],
      shapes: [
        {
          d: smooth([
            [40, 128],
            [54, 106],
            [88, 96],
            [128, 95],
            [160, 101],
            [180, 116],
            [182, 133],
            [164, 145],
            [120, 150],
            [76, 149],
            [48, 142],
          ]),
          fill: 'shell',
        },
        { d: ellipse(120, 152, 60, 12), kind: 'detail', fill: 'belly' },
        { d: ellipse(110, 104, 40, 6), kind: 'detail', fill: 'shine2' },
        { d: 'M72 102Q66 122 72 144', kind: 'line', stroke: 'segment', width: 2.6 },
        { d: 'M94 97Q88 120 94 147', kind: 'line', stroke: 'segment', width: 2.6 },
        { d: 'M116 96Q110 120 116 148', kind: 'line', stroke: 'segment', width: 2.6 },
        { d: ellipse(156, 128, 8, 5), kind: 'feature', fill: 'blush', opacity: 0.6 },
        { d: ellipse(179, 125, 5, 4), kind: 'feature', fill: 'blush', opacity: 0.6 },
        { d: circle(154, 112, 8.5), kind: 'feature', fill: 'eye' },
        { d: circle(157.3, 108.6, 3.3), kind: 'feature', fill: 'shine' },
        { d: circle(173, 110, 7), kind: 'feature', fill: 'eye' },
        { d: circle(175.8, 107.2, 2.7), kind: 'feature', fill: 'shine' },
        { d: 'M160 128Q167 134 174 127', kind: 'line', stroke: 'mouth', width: 2.8 },
      ],
      children: [
        tail(0),
        ...[1, 2, 3, 4].map((n) => leg(n, 66 + n * 20, true)),
        ...[1, 2, 3, 4].map((n) => leg(n, 60 + n * 20, false)),
        claw('clawF', 16, -34, true),
        claw('clawN', 0, 0, false),
      ],
    },
  ],
};

export default scorpion;
