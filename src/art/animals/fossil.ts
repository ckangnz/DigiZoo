import { circle, ellipse, f, poly, smooth, type Pt } from '../core/paths';
import type { AnimalDef, Shape } from '../core/types';

const TAU = Math.PI * 2;
const C: Pt = [122, 114];
const R = 72;
const Q = 0.64;
const START = -0.35 * Math.PI;

const spiral = (theta: number, inset = 0): Pt => {
  const r = R * Q ** (theta / TAU) - inset;
  const a = START - theta;
  return [C[0] + r * Math.cos(a), C[1] + r * Math.sin(a)];
};

const range = (from: number, to: number, steps: number): number[] =>
  Array.from({ length: steps + 1 }, (_, i) => from + ((to - from) * i) / steps);

const outline = (grow: number): string => {
  const pts = range(0, TAU, 96).map((t) => spiral(t, -grow));
  const a = START + 0.34;
  const lip = (R * (1 + Q)) / 2 + grow;
  const [x0, y0] = pts[0];
  return `${poly(pts, false)}Q${f(C[0] + lip * Math.cos(a))} ${f(C[1] + lip * Math.sin(a))} ${f(x0)} ${f(y0)}Z`;
};

const shell = outline(0);
const hollow = outline(9);
const groove = smooth(
  range(TAU, TAU * 3.3, 110).map((t) => spiral(t)),
  false,
);

const ribs: Shape[] = range(0.25, TAU * 2.2, 34).flatMap((t): Shape[] => {
  const outer = R * Q ** (t / TAU);
  if (outer < 22) return [];
  const band = outer * (1 - Q);
  const a = spiral(t, band * 0.12);
  const b = spiral(t + TAU, -band * 0.12);
  const m = spiral(t + 0.12, band * 0.5);
  return [
    {
      d: `M${a[0].toFixed(2)} ${a[1].toFixed(2)}Q${m[0].toFixed(2)} ${m[1].toFixed(2)} ${b[0].toFixed(2)} ${b[1].toFixed(2)}`,
      kind: 'line',
      stroke: 'rib',
      width: outer > 40 ? 2.4 : 2,
    },
  ];
});

const STONE: Pt[] = [
  [16, 150],
  [22, 96],
  [50, 50],
  [98, 24],
  [156, 22],
  [204, 42],
  [232, 90],
  [238, 146],
  [224, 182],
  [192, 197],
  [126, 199],
  [62, 197],
  [30, 184],
];

const fossil: AnimalDef = {
  id: 'fossil',
  name: 'Fossil',
  kind: 'object',
  aliases: ['ammonite', 'fossils', 'spiral fossil', 'fossil shell'],
  group: 'nature',
  habitats: ['cave'],
  box: [254, 200],
  size: 120,
  locomotion: 'wobble',
  sound: 'fossil',
  palette: {
    stone: '#c9bda9',
    stoneLight: '#ddd3c2',
    stoneDark: '#ab9e89',
    crack: '#a99c87',
    shell: '#efc07c',
    shellLight: '#f9dcac',
    rib: '#cc9254',
  },
  parts: [
    {
      id: 'stone',
      pivot: [126, 120],
      shapes: [
        { d: smooth(STONE), fill: 'stone' },
        { d: ellipse(104, 40, 52, 10, -8), kind: 'detail', fill: 'stoneLight' },
        { d: hollow, kind: 'detail', fill: 'stoneDark' },
        { d: circle(42, 132, 5), kind: 'detail', fill: 'stoneDark' },
        { d: circle(212, 120, 6), kind: 'detail', fill: 'stoneDark' },
        { d: circle(204, 64, 3.5), kind: 'detail', fill: 'stoneDark' },
        { d: circle(58, 74, 3), kind: 'detail', fill: 'stoneDark' },
        { d: circle(198, 168, 3.5), kind: 'detail', fill: 'stoneDark' },
        {
          d: 'M230 124Q218 134 221 146Q216 156 207 162',
          kind: 'line',
          stroke: 'crack',
          width: 2.2,
        },
        { d: 'M30 152Q40 158 42 170', kind: 'line', stroke: 'crack', width: 2 },
      ],
      children: [
        {
          id: 'ammonite',
          pivot: C,
          shapes: [
            { d: shell, fill: 'shell' },
            { d: ellipse(C[0] - 30, C[1] - 36, 28, 10, -40), kind: 'detail', fill: 'shellLight' },
            ...ribs,
            { d: groove, kind: 'line', stroke: 'rib', width: 3 },
          ],
        },
      ],
    },
  ],
};

export default fossil;
