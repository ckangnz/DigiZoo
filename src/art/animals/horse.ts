import { capsule, circle, ellipse, leaf, smooth, tube, type Pt } from '../core/paths';
import type { AnimalDef, PartNode } from '../core/types';

function lock(
  x: number,
  y: number,
  len: number,
  width: number,
  angle: number,
  curl: number,
): string {
  const a = (angle * Math.PI) / 180;
  const dx = Math.cos(a);
  const dy = Math.sin(a);
  const nx = -dy;
  const ny = dx;
  const tx = x + dx * len;
  const ty = y + dy * len;
  const mx = x + dx * len * 0.5 + nx * curl;
  const my = y + dy * len * 0.5 + ny * curl;
  const p = (px: number, py: number) => `${px.toFixed(2)} ${py.toFixed(2)}`;
  return (
    `M${p(x + nx * width, y + ny * width)}` +
    `Q${p(mx + nx * width * 1.1, my + ny * width * 1.1)} ${p(tx, ty)}` +
    `Q${p(mx - nx * width * 0.7, my - ny * width * 0.7)} ${p(x - nx * width, y - ny * width)}Z`
  );
}

const hoof = (x: number, top: number, bottom: number, wTop: number, wBot: number): string => {
  const t = wTop / 2;
  const b = wBot / 2;
  const mid = top + (bottom - top) * 0.45;
  return (
    `M${x - t} ${top}Q${x} ${top - 4} ${x + t} ${top}Q${x + b} ${mid} ${x + b} ${bottom - 5}` +
    `Q${x + b} ${bottom} ${x + b - 5} ${bottom}L${x - b + 5} ${bottom}Q${x - b} ${bottom} ${x - b} ${bottom - 5}` +
    `Q${x - b} ${mid} ${x - t} ${top}Z`
  );
};

const HIP = 214;

const leg = (id: string, role: string, x: number, far: boolean): PartNode => ({
  id,
  role,
  behind: true,
  pivot: [x, HIP],
  shapes: [
    { d: capsule(x, HIP, x, 304, 18, 11.5), fill: far ? 'coatFar' : 'coat' },
    { d: hoof(x, 312, 328, 24, 28), fill: far ? 'hoofFar' : 'hoof' },
  ],
});

const TAIL: Pt[] = [
  [70, 166],
  [50, 172],
  [36, 190],
  [30, 218],
  [32, 248],
  [26, 276],
  [14, 294],
];

const TAIL_LOCK: Pt[] = [
  [38, 214],
  [48, 240],
  [52, 266],
  [44, 292],
];

const horse: AnimalDef = {
  id: 'horse',
  name: 'Horse',
  aliases: ['pony', 'horsey', 'foal', 'stallion', 'mare'],
  group: 'mammal',
  habitats: ['farm'],
  box: [335, 330],
  size: 280,
  locomotion: 'walk4',
  gait: { stride: 140, swing: 18 },
  sound: 'horse',
  palette: {
    coat: '#cd7b43',
    coatFar: '#ad6233',
    mane: '#6f3a22',
    maneLight: '#8d4f2f',
    blaze: '#fff7ec',
    muzzle: '#f0b48e',
    hoof: '#4f3b34',
    hoofFar: '#3f2f2a',
    earInner: '#eaa287',
    nostril: '#6a3424',
  },
  parts: [
    {
      id: 'body',
      role: 'body',
      pivot: [164, 214],
      shapes: [
        {
          d: smooth([
            [74, 168],
            [106, 156],
            [140, 160],
            [176, 158],
            [198, 146],
            [212, 124],
            [222, 100],
            [230, 80],
            [262, 84],
            [272, 112],
            [274, 146],
            [272, 178],
            [262, 212],
            [240, 238],
            [194, 248],
            [142, 250],
            [106, 246],
            [76, 232],
            [58, 208],
            [60, 182],
          ]),
          fill: 'coat',
        },
      ],
      children: [
        {
          id: 'tail',
          role: 'tail',
          pivot: [70, 166],
          behind: true,
          shapes: [
            {
              d: tube(TAIL, (t) => 5 + 13 * Math.sin(Math.PI * Math.min(1, t * 1.08)) ** 0.7),
              fill: 'mane',
            },
            {
              d: tube(TAIL_LOCK, (t) => 1.5 + 8.5 * Math.sin(Math.PI * (0.12 + 0.88 * t))),
              fill: 'mane',
            },
            { d: 'M40 198Q30 226 36 256', kind: 'line', stroke: 'maneLight', width: 2.8 },
            { d: 'M46 240Q52 262 46 282', kind: 'line', stroke: 'maneLight', width: 2.8 },
          ],
        },
        leg('legBF', 'legBF', 118, true),
        leg('legFF', 'legFF', 234, true),
        leg('legBN', 'legBN', 94, false),
        leg('legFN', 'legFN', 210, false),
        {
          id: 'mane',
          pivot: [206, 110],
          shapes: [
            {
              d: tube(
                [
                  [180, 154],
                  [194, 134],
                  [205, 112],
                  [214, 88],
                  [222, 64],
                  [228, 44],
                ],
                10,
              ),
              fill: 'mane',
            },
            { d: lock(224, 62, 36, 12, 160, 7), fill: 'mane' },
            { d: lock(215, 88, 40, 13, 154, 7), fill: 'mane' },
            { d: lock(205, 112, 38, 12.5, 148, 7), fill: 'mane' },
            { d: lock(194, 134, 32, 11, 142, 6), fill: 'mane' },
            { d: lock(182, 150, 22, 9, 136, 4), fill: 'mane' },
            { d: 'M214 68Q204 70 196 76', kind: 'line', stroke: 'maneLight', width: 2.8 },
            { d: 'M206 94Q194 96 186 104', kind: 'line', stroke: 'maneLight', width: 2.8 },
            { d: 'M197 118Q187 120 179 128', kind: 'line', stroke: 'maneLight', width: 2.8 },
          ],
        },
        {
          id: 'head',
          role: 'head',
          pivot: [250, 118],
          shapes: [
            {
              d: smooth([
                [210, 70],
                [224, 44],
                [254, 30],
                [286, 34],
                [308, 52],
                [320, 78],
                [326, 104],
                [324, 128],
                [310, 143],
                [284, 148],
                [258, 141],
                [230, 126],
                [212, 98],
              ]),
              fill: 'coat',
            },
            {
              d: tube(
                [
                  [270, 32],
                  [292, 46],
                  [308, 72],
                  [317, 100],
                  [318, 124],
                ],
                (t) => 10 + 5 * t,
              ),
              kind: 'detail',
              fill: 'blaze',
            },
            { d: ellipse(318, 127, 21, 21), kind: 'detail', fill: 'muzzle' },
            { d: ellipse(256, 106, 12, 8), kind: 'feature', fill: 'blush', opacity: 0.55 },
            { d: circle(264, 77, 11), kind: 'feature', fill: 'eye' },
            { d: circle(268, 72.4, 4.2), kind: 'feature', fill: 'shine' },
            { d: ellipse(315, 113, 4.6, 3.3, -25), kind: 'feature', fill: 'nostril' },
            { d: 'M296 137Q306 143 317 137', kind: 'line', stroke: 'nostril', width: 3 },
          ],
          children: [
            {
              id: 'earF',
              role: 'earF',
              pivot: [230, 48],
              behind: true,
              shapes: [{ d: leaf(230, 50, 34, 11.5, -100), fill: 'coatFar' }],
            },
            {
              id: 'earN',
              role: 'earN',
              pivot: [246, 42],
              behind: true,
              shapes: [
                { d: leaf(246, 44, 38, 12.5, -76), fill: 'coat' },
                { d: leaf(247, 42, 26, 6.2, -76), kind: 'detail', fill: 'earInner' },
              ],
            },
            {
              id: 'forelock',
              pivot: [240, 36],
              shapes: [
                { d: leaf(234, 38, 42, 12, 26), fill: 'mane' },
                { d: leaf(242, 35, 34, 9.5, 6), fill: 'mane' },
              ],
            },
          ],
        },
      ],
    },
  ],
};

export default horse;
