import { capsule, circle, ellipse, smooth, spline, tube, type Pt } from '../core/paths';
import type { AnimalDef, PartNode, Shape } from '../core/types';

const spot = (x: number, y: number, r: number): Shape => ({
  d: ellipse(x, y, r, r * 0.84, (x * 7 + y * 3) % 60),
  kind: 'detail',
  fill: 'spot',
});

const BODY_SPOTS: [number, number, number][] = [
  [96, 118, 4.6],
  [117, 107, 4.8],
  [140, 102, 4.4],
  [163, 104, 4.8],
  [186, 102, 4.4],
  [209, 104, 4.8],
  [232, 110, 4.4],
  [86, 138, 4.4],
  [107, 128, 4.8],
  [129, 122, 4.2],
  [151, 123, 4.8],
  [174, 121, 4.4],
  [197, 123, 4.8],
  [220, 127, 4.4],
  [243, 130, 4.6],
  [98, 150, 4.2],
  [120, 143, 4.6],
  [142, 142, 4.2],
  [164, 141, 4.6],
  [187, 142, 4.2],
  [210, 146, 4.6],
  [233, 150, 4.2],
  [254, 148, 4],
  [134, 158, 3.8],
  [178, 160, 3.8],
  [222, 166, 3.8],
];

const TAIL: Pt[] = [
  [88, 122],
  [64, 132],
  [46, 150],
  [38, 174],
  [40, 198],
  [32, 216],
  [18, 221],
];
const tailLine = spline(TAIL, 60);

const tailAt = (t: number): [Pt, number] => {
  const i = Math.round(t * (tailLine.length - 1));
  const a = tailLine[Math.max(0, i - 1)];
  const b = tailLine[Math.min(tailLine.length - 1, i + 1)];
  return [tailLine[i], (Math.atan2(b[1] - a[1], b[0] - a[0]) * 180) / Math.PI];
};

const tailBand = (t: number, w: number): Shape => {
  const [[x, y], angle] = tailAt(t);
  return { d: ellipse(x, y, w, 14, angle), kind: 'detail', fill: 'spot' };
};

const tailSpot = (t: number, r: number, side: number): Shape => {
  const [[x, y]] = tailAt(t);
  return spot(x + side, y - side * 0.5, r);
};

const leg = (id: string, x: number, far: boolean): PartNode => ({
  id,
  role: id,
  behind: true,
  pivot: [x, 150],
  shapes: [
    { d: capsule(x, 150, x + 1, 228, 14.5, 9.8), fill: far ? 'furDark' : 'fur' },
    { d: ellipse(x + 5, 238, 14.5, 9.5), fill: far ? 'furDark' : 'fur' },
    spot(x - 3, 186, 3.4),
    spot(x + 5, 201, 3.2),
    spot(x - 2, 216, 3),
    ...(far
      ? []
      : [
          { d: `M${x + 7} 242L${x + 7} 247`, kind: 'line' as const, stroke: 'toe', width: 2.3 },
          { d: `M${x + 13} 241L${x + 13} 246`, kind: 'line' as const, stroke: 'toe', width: 2.3 },
        ]),
  ],
});

const cheetah: AnimalDef = {
  id: 'cheetah',
  name: 'Cheetah',
  aliases: ['big cat', 'fast cat', 'cheeta', 'chita'],
  group: 'mammal',
  habitats: ['safari'],
  box: [400, 250],
  size: 200,
  locomotion: 'walk4',
  gait: { stride: 145 },
  sound: 'cheetah',
  palette: {
    fur: '#f7cb5a',
    furDark: '#e2b046',
    spot: '#3a2a22',
    cream: '#fff3d4',
    earInner: '#fbe0b8',
    nose: '#3b2724',
    tear: '#3a2a22',
    toe: '#c9963a',
  },
  parts: [
    {
      id: 'body',
      role: 'body',
      pivot: [170, 150],
      shapes: [
        {
          d: smooth([
            [278, 142],
            [262, 110],
            [230, 97],
            [180, 100],
            [130, 95],
            [88, 103],
            [68, 128],
            [78, 158],
            [110, 172],
            [152, 166],
            [196, 172],
            [238, 184],
            [268, 170],
          ]),
          fill: 'fur',
        },
        { d: ellipse(194, 181, 88, 15, 8), kind: 'detail', fill: 'cream' },
        ...BODY_SPOTS.map(([x, y, r]) => spot(x, y, r)),
      ],
      children: [
        {
          id: 'tail',
          role: 'tail',
          pivot: [88, 122],
          behind: true,
          shapes: [
            { d: tube(TAIL, (t) => 8.5 - 2.5 * t, 70), fill: 'fur' },
            tailSpot(0.12, 3.6, 2),
            tailSpot(0.24, 3.4, -2),
            tailSpot(0.36, 3.4, 2),
            tailSpot(0.48, 3.2, -2),
            tailBand(0.62, 3.6),
            tailBand(0.74, 3.6),
            tailBand(0.86, 3.4),
            { d: circle(TAIL[6][0], TAIL[6][1], 8), kind: 'detail', fill: 'cream' },
          ],
        },
        leg('legBF', 130, true),
        leg('legFF', 256, true),
        leg('legBN', 102, false),
        leg('legFN', 226, false),
        {
          id: 'head',
          role: 'head',
          pivot: [280, 126],
          shapes: [
            { d: circle(261, 32, 15), fill: 'fur' },
            { d: circle(351, 28, 15), fill: 'fur' },
            { d: circle(306, 79, 59), fill: 'fur' },
            { d: circle(262, 33, 7.5), kind: 'detail', fill: 'earInner' },
            { d: circle(350, 29, 7.5), kind: 'detail', fill: 'earInner' },
            { d: ellipse(310, 107, 23.5, 17), kind: 'detail', fill: 'cream' },
            { d: ellipse(285, 86, 10.5, 6.5), kind: 'detail', fill: 'cream' },
            { d: ellipse(334, 84, 10.5, 6.5), kind: 'detail', fill: 'cream' },
            spot(295, 38, 3.4),
            spot(309, 32, 3.6),
            spot(323, 38, 3.4),
            spot(281, 47, 3.2),
            spot(337, 45, 3.2),
            spot(302, 50, 3),
            spot(317, 50, 3),
            spot(255, 75, 3.6),
            spot(258, 94, 3.2),
            spot(357, 72, 3.6),
            spot(355, 92, 3.2),
            { d: ellipse(270, 102, 9.5, 6.4), kind: 'feature', fill: 'blush', opacity: 0.55 },
            { d: ellipse(349, 99, 9.5, 6.4), kind: 'feature', fill: 'blush', opacity: 0.55 },
            { d: circle(287, 71, 9.6), kind: 'feature', fill: 'eye' },
            { d: circle(332, 69, 9.6), kind: 'feature', fill: 'eye' },
            { d: circle(290.6, 67.2, 3.6), kind: 'feature', fill: 'shine' },
            { d: circle(335.6, 65.2, 3.6), kind: 'feature', fill: 'shine' },
            { d: 'M293 80Q282.5 94 288 111', kind: 'line', stroke: 'tear', width: 3 },
            { d: 'M326 78Q337 92 332 109', kind: 'line', stroke: 'tear', width: 3 },
            {
              d: 'M300 92Q310.5 86.5 321 92Q319 100 310.5 103.5Q302 100 300 92Z',
              kind: 'feature',
              fill: 'nose',
            },
            { d: 'M310.5 103.5Q310.5 111 303 113', kind: 'line', stroke: 'mouth', width: 2.8 },
            { d: 'M310.5 103.5Q310.5 111 318 113', kind: 'line', stroke: 'mouth', width: 2.8 },
          ],
        },
      ],
    },
  ],
};

export default cheetah;
