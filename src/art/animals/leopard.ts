import {
  capsule,
  circle,
  ellipse,
  smooth,
  spline,
  translatePath,
  tube,
  type Pt,
} from '../core/paths';
import type { AnimalDef, PartNode, Shape } from '../core/types';

const jitter = (n: number) => {
  const v = Math.sin(n * 12.9898) * 43758.5453;
  return v - Math.floor(v);
};

const spot = (x: number, y: number, r: number): Shape => ({
  d: ellipse(x, y, r, r * 0.86, (x * 7 + y * 3) % 60),
  kind: 'detail',
  fill: 'spot',
});

const rosette = (x: number, y: number, r: number): Shape[] => {
  const seed = x * 3.1 + y * 1.7;
  const start = jitter(seed) * 360;
  const count = 4 + Math.round(jitter(seed + 1));
  const blobs: Shape[] = [];
  for (let k = 0; k < count; k++) {
    const a = start + (k * 360) / (count + 0.8) + 16 * (jitter(seed + k) - 0.5);
    const rad = (a * Math.PI) / 180;
    const len = r * (0.4 + 0.14 * jitter(seed + k * 2));
    blobs.push({
      d: ellipse(x + Math.cos(rad) * r * 0.86, y + Math.sin(rad) * r * 0.8, len, r * 0.31, a + 90),
      kind: 'detail',
      fill: 'spot',
    });
  }
  return [{ d: ellipse(x, y, r * 0.7, r * 0.62), kind: 'detail', fill: 'furDeep' }, ...blobs];
};

const ROSETTES: [number, number, number][] = [
  [100, 126, 8],
  [126, 114, 8.5],
  [154, 110, 8],
  [182, 113, 8.5],
  [210, 110, 8],
  [238, 116, 7.5],
  [88, 152, 7.5],
  [114, 144, 8.5],
  [142, 136, 8],
  [170, 140, 8.5],
  [198, 136, 8],
  [226, 140, 8.5],
  [252, 138, 7],
  [106, 172, 7.5],
  [132, 164, 8],
  [160, 165, 7.5],
  [188, 162, 8],
  [216, 165, 7.5],
  [244, 162, 7],
];

const TAIL: Pt[] = [
  [88, 128],
  [64, 138],
  [46, 158],
  [38, 184],
  [36, 208],
  [28, 226],
  [14, 230],
  [6, 220],
  [8, 204],
];
const tailLine = spline(TAIL, 80);

const tailAt = (t: number): [Pt, number] => {
  const i = Math.round(t * (tailLine.length - 1));
  const a = tailLine[Math.max(0, i - 1)];
  const b = tailLine[Math.min(tailLine.length - 1, i + 1)];
  return [tailLine[i], (Math.atan2(b[1] - a[1], b[0] - a[0]) * 180) / Math.PI];
};

const tailSpot = (t: number, r: number, side: number): Shape => {
  const [[x, y]] = tailAt(t);
  return spot(x + side, y - side * 0.4, r);
};

const tailBand = (t: number, w: number): Shape => {
  const [[x, y], angle] = tailAt(t);
  return { d: ellipse(x, y, w, 14, angle), kind: 'detail', fill: 'spot' };
};

const leg = (id: string, x: number, far: boolean): PartNode => ({
  id,
  role: id,
  behind: true,
  pivot: [x, 168],
  shapes: [
    { d: capsule(x, 168, x + 1, 234, 16, 12), fill: far ? 'furDark' : 'fur' },
    { d: ellipse(x + 5, 243, 17, 10.5), fill: far ? 'furDark' : 'fur' },
    spot(x - 4, 198, 3.4),
    spot(x + 6, 212, 3.2),
    spot(x - 2, 226, 3),
    ...(far
      ? []
      : [
          { d: `M${x + 7} 247L${x + 7} 252`, kind: 'line' as const, stroke: 'toe', width: 2.3 },
          { d: `M${x + 14} 246L${x + 14} 251`, kind: 'line' as const, stroke: 'toe', width: 2.3 },
        ]),
  ],
});

const offset = (parts: PartNode[], dx: number, dy: number): PartNode[] =>
  parts.map((p): PartNode => ({
    ...p,
    pivot: p.pivot && [p.pivot[0] + dx, p.pivot[1] + dy],
    shapes: p.shapes?.map((s) => ({ ...s, d: translatePath(s.d, dx, dy) })),
    children: p.children && offset(p.children, dx, dy),
  }));

const leopard: AnimalDef = {
  id: 'leopard',
  name: 'Leopard',
  kind: 'animal',
  aliases: ['big cat', 'spotty cat', 'leopardess', 'panther', 'leppard'],
  group: 'mammal',
  habitats: ['safari'],
  box: [392, 246],
  size: 200,
  locomotion: 'walk4',
  gait: { stride: 124 },
  sound: 'leopard',
  palette: {
    fur: '#f5bb4e',
    furDark: '#dea23f',
    furDeep: '#e59d3a',
    spot: '#3a2a22',
    cream: '#fff3d6',
    earInner: '#fbdcb6',
    nose: '#c66f68',
    toe: '#bf8d38',
  },
  parts: offset(
    [
      {
        id: 'body',
        role: 'body',
        pivot: [172, 168],
        shapes: [
          {
            d: smooth([
              [286, 150],
              [276, 116],
              [246, 100],
              [202, 104],
              [156, 100],
              [112, 102],
              [82, 116],
              [70, 144],
              [82, 172],
              [118, 188],
              [166, 184],
              [212, 188],
              [254, 184],
              [278, 170],
            ]),
            fill: 'fur',
          },
          { d: ellipse(188, 190, 82, 14, 2), kind: 'detail', fill: 'cream' },
          ...ROSETTES.flatMap(([x, y, r]) => rosette(x, y, r)),
        ],
        children: [
          {
            id: 'tail',
            role: 'tail',
            pivot: [88, 128],
            behind: true,
            shapes: [
              { d: tube(TAIL, (t) => 9 - 2 * t, 90), fill: 'fur' },
              tailSpot(0.1, 3.6, 2),
              tailSpot(0.2, 3.4, -2),
              tailSpot(0.3, 3.6, 2),
              tailSpot(0.4, 3.4, -2),
              tailSpot(0.5, 3.4, 2),
              tailSpot(0.6, 3.2, -2),
              tailSpot(0.7, 3.2, 2),
              tailSpot(0.8, 3, -1.5),
              tailBand(0.97, 9),
            ],
          },
          leg('legBF', 130, true),
          leg('legFF', 254, true),
          leg('legBN', 102, false),
          leg('legFN', 228, false),
          {
            id: 'head',
            role: 'head',
            pivot: [270, 144],
            shapes: [
              { d: circle(262, 34, 16), fill: 'fur' },
              { d: circle(350, 31, 16), fill: 'fur' },
              { d: ellipse(306, 78, 62, 57), fill: 'fur' },
              { d: circle(263, 35, 8), kind: 'detail', fill: 'earInner' },
              { d: circle(349, 32, 8), kind: 'detail', fill: 'earInner' },
              { d: ellipse(310, 106, 26, 18.5), kind: 'detail', fill: 'cream' },
              spot(295, 33, 3.3),
              spot(309, 28, 3.5),
              spot(323, 33, 3.3),
              spot(282, 43, 3),
              spot(336, 41, 3),
              spot(301, 45, 2.8),
              spot(317, 45, 2.8),
              spot(253, 76, 3.4),
              spot(256, 92, 3),
              spot(243, 88, 2.8),
              spot(360, 73, 3.4),
              spot(358, 89, 3),
              spot(369, 85, 2.8),
              { d: ellipse(268, 98, 10.5, 6.8), kind: 'feature', fill: 'blush', opacity: 0.55 },
              { d: ellipse(352, 95, 10.5, 6.8), kind: 'feature', fill: 'blush', opacity: 0.55 },
              { d: circle(285, 71, 10), kind: 'feature', fill: 'eye' },
              { d: circle(333, 69, 10), kind: 'feature', fill: 'eye' },
              { d: circle(288.8, 67, 3.8), kind: 'feature', fill: 'shine' },
              { d: circle(336.8, 65, 3.8), kind: 'feature', fill: 'shine' },
              {
                d: 'M299.5 90.5Q310 85 320.5 90.5Q318.5 99 310 102Q301.5 99 299.5 90.5Z',
                kind: 'feature',
                fill: 'nose',
              },
              { d: 'M310 102Q310 110 302 112', kind: 'line', stroke: 'mouth', width: 2.8 },
              { d: 'M310 102Q310 110 318 112', kind: 'line', stroke: 'mouth', width: 2.8 },
            ],
          },
        ],
      },
    ],
    8,
    -8,
  ),
};

export default leopard;
