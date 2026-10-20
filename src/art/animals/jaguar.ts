import { capsule, circle, ellipse, f, spline, tube, type Pt } from '../core/paths';
import type { AnimalDef, PartNode, Shape } from '../core/types';

const oval = (cx: number, cy: number, rx: number, ry: number, rot: number, sweep: 0 | 1) => {
  const a = (rot * Math.PI) / 180;
  const dx = rx * Math.cos(a);
  const dy = rx * Math.sin(a);
  return (
    `M${f(cx - dx)} ${f(cy - dy)}A${f(rx)} ${f(ry)} ${f(rot)} 1 ${sweep} ${f(cx + dx)} ${f(cy + dy)}` +
    `A${f(rx)} ${f(ry)} ${f(rot)} 1 ${sweep} ${f(cx - dx)} ${f(cy - dy)}Z`
  );
};

const SEGMENTS: [number, number][][] = [
  [
    [0, 150],
    [168, 262],
    [280, 342],
  ],
  [
    [0, 196],
    [214, 340],
  ],
  [
    [0, 118],
    [136, 250],
    [268, 344],
  ],
];

const rosette = (x: number, y: number, r: number, dot = false): Shape[] => {
  const rot = (x * 13 + y * 7) % 360;
  const squash = 0.84;
  const w = Math.max(3, r * 0.34);
  const rm = r - w * 0.5;
  const arcs = SEGMENTS[(x + y) % 3].map(([from, to]): Shape => {
    const pts: Pt[] = [];
    for (let i = 0; i <= 8; i++) {
      const a = ((rot + from + ((to - from) * i) / 8) * Math.PI) / 180;
      pts.push([x + rm * Math.cos(a), y + rm * squash * Math.sin(a)]);
    }
    return {
      d: tube(pts, (t) => w * 0.5 * (0.8 + 0.3 * Math.sin(Math.PI * t)), 28),
      kind: 'detail',
      fill: 'spot',
    };
  });
  return [
    { d: oval(x, y, rm, rm * squash, 0, 0), kind: 'detail', fill: 'furDeep' },
    ...arcs,
    ...(dot ? [{ d: circle(x, y, w * 0.7), kind: 'detail' as const, fill: 'spot' }] : []),
  ];
};

const spot = (x: number, y: number, r: number): Shape => ({
  d: circle(x, y, r),
  kind: 'detail',
  fill: 'spot',
});

const ROSETTES: [number, number, number, boolean][] = [
  [92, 150, 11, false],
  [120, 134, 12, true],
  [152, 128, 11, false],
  [184, 130, 12, true],
  [214, 138, 10.5, false],
  [104, 178, 11.5, true],
  [136, 162, 12, false],
  [168, 158, 11.5, true],
  [200, 164, 12, false],
  [228, 170, 10, true],
  [78, 190, 9, false],
  [128, 196, 10, false],
  [160, 192, 9.5, true],
  [192, 196, 10, false],
];

const TAIL: Pt[] = [
  [76, 168],
  [52, 162],
  [36, 144],
  [31, 120],
  [36, 98],
];
const tailLine = spline(TAIL, 48);

const tailAt = (t: number): [Pt, number] => {
  const i = Math.round(t * (tailLine.length - 1));
  const a = tailLine[Math.max(0, i - 1)];
  const b = tailLine[Math.min(tailLine.length - 1, i + 1)];
  return [tailLine[i], (Math.atan2(b[1] - a[1], b[0] - a[0]) * 180) / Math.PI];
};

const tailBand = (t: number, w: number): Shape => {
  const [[x, y], angle] = tailAt(t);
  return { d: ellipse(x, y, w, 16, angle), kind: 'detail', fill: 'spot' };
};

const leg = (id: string, x: number, far: boolean): PartNode => ({
  id,
  role: id,
  behind: true,
  pivot: [x, 190],
  shapes: [
    { d: capsule(x, 190, x, 246, 19, 18), fill: far ? 'furDark' : 'fur' },
    { d: ellipse(x + 5, 256, 23, 13), fill: far ? 'furDark' : 'fur' },
    spot(x - 6, 232, 4),
    spot(x + 8, 238, 3.6),
    spot(x - 1, 246, 3.4),
    ...(far
      ? []
      : [
          { d: `M${x + 9} 261L${x + 9} 268`, kind: 'line' as const, stroke: 'toe', width: 2.6 },
          { d: `M${x + 18} 260L${x + 18} 267`, kind: 'line' as const, stroke: 'toe', width: 2.6 },
        ]),
  ],
});

const jaguar: AnimalDef = {
  id: 'jaguar',
  name: 'Jaguar',
  aliases: ['big cat', 'panther', 'onca', 'jag'],
  group: 'mammal',
  habitats: ['rainforest'],
  box: [370, 272],
  size: 200,
  locomotion: 'walk4',
  gait: { stride: 110 },
  sound: 'jaguar',
  palette: {
    fur: '#f1a23a',
    furDark: '#d98b2d',
    furDeep: '#de8b2f',
    spot: '#3a2621',
    cream: '#fff1d8',
    earInner: '#fbd7b0',
    nose: '#bf5f62',
    toe: '#b8762a',
  },
  parts: [
    {
      id: 'body',
      role: 'body',
      pivot: [158, 190],
      shapes: [
        { d: ellipse(158, 176, 98, 58), fill: 'fur' },
        { d: ellipse(164, 232, 80, 26), kind: 'detail', fill: 'cream' },
        ...ROSETTES.flatMap(([x, y, r, dot]) => rosette(x, y, r, dot)),
      ],
      children: [
        {
          id: 'tail',
          role: 'tail',
          pivot: [76, 168],
          behind: true,
          shapes: [
            { d: tube(TAIL, (t) => 10.5 - 2 * t, 60), fill: 'fur' },
            spot(66, 166, 4),
            spot(48, 158, 4),
            spot(38, 142, 3.8),
            tailBand(0.62, 3.8),
            tailBand(0.78, 3.8),
            { d: circle(TAIL[4][0], TAIL[4][1] + 1, 10), kind: 'detail', fill: 'spot' },
          ],
        },
        leg('legBF', 122, true),
        leg('legFF', 244, true),
        leg('legBN', 94, false),
        leg('legFN', 218, false),
        {
          id: 'head',
          role: 'head',
          pivot: [252, 160],
          shapes: [
            { d: circle(232, 72, 16), fill: 'fur' },
            { d: circle(314, 68, 16), fill: 'fur' },
            { d: ellipse(272, 118, 64, 57), fill: 'fur' },
            { d: circle(233, 73, 8), kind: 'detail', fill: 'earInner' },
            { d: circle(313, 69, 8), kind: 'detail', fill: 'earInner' },
            { d: ellipse(280, 145, 30, 20), kind: 'detail', fill: 'cream' },
            { d: ellipse(280, 166, 22, 12), kind: 'detail', fill: 'cream' },
            spot(262, 80, 3.4),
            spot(276, 74, 3.6),
            spot(290, 80, 3.4),
            spot(250, 88, 3),
            spot(304, 86, 3),
            spot(268, 90, 2.8),
            spot(284, 91, 2.8),
            spot(222, 114, 3.6),
            spot(228, 128, 3.2),
            spot(214, 128, 3),
            spot(326, 112, 3.6),
            spot(322, 126, 3.2),
            spot(334, 126, 3),
            { d: ellipse(238, 139, 11, 7), kind: 'feature', fill: 'blush', opacity: 0.55 },
            { d: ellipse(322, 137, 11, 7), kind: 'feature', fill: 'blush', opacity: 0.55 },
            { d: circle(252, 110, 9.5), kind: 'feature', fill: 'eye' },
            { d: circle(304, 108, 9.5), kind: 'feature', fill: 'eye' },
            { d: circle(255.5, 106, 3.6), kind: 'feature', fill: 'shine' },
            { d: circle(307.5, 104, 3.6), kind: 'feature', fill: 'shine' },
            {
              d: 'M269 129Q280 123 291 129Q289 139 280 142Q271 139 269 129Z',
              kind: 'feature',
              fill: 'nose',
            },
            { d: 'M280 142Q280 151 271 153', kind: 'line', stroke: 'mouth', width: 3 },
            { d: 'M280 142Q280 151 289 153', kind: 'line', stroke: 'mouth', width: 3 },
          ],
        },
      ],
    },
  ],
};

export default jaguar;
