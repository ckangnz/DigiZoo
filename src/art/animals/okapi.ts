import { capsule, circle, ellipse, leaf, smooth, tube, type Pt } from '../core/paths';
import type { AnimalDef, PartNode, Shape } from '../core/types';

const HIP = 232;
const GROUND = 330;

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

const band = (pts: Pt[], r: number, fill: string, taper = 0): Shape => ({
  d: tube(pts, (t) => r * (1 - taper * t)),
  kind: 'detail',
  fill,
});

const legStripe = (x: number, y: number, r: number, fill: string): Shape =>
  band(
    [
      [x - 24, y + 3],
      [x, y - 3],
      [x + 24, y + 1],
    ],
    r,
    fill,
  );

const leg = (id: string, x: number, far: boolean, back: boolean): PartNode => {
  const coat = far ? 'coatFar' : 'coat';
  const white = far ? 'stripeFar' : 'stripe';
  const stripes = back
    ? [legStripe(x, 248, 4.4, white), legStripe(x, 263, 4.2, white), legStripe(x, 277, 4, white)]
    : [legStripe(x, 258, 4, white), legStripe(x, 272, 3.8, white)];
  return {
    id,
    role: id,
    behind: true,
    pivot: [x, HIP],
    shapes: [
      { d: capsule(x, HIP, x, 304, 17, 12), fill: coat },
      { d: hoof(x, 310, GROUND - 2, 23, 27), fill: far ? 'hoofFar' : 'hoof' },
      ...stripes,
      {
        d: `M${x - 20} 286Q${x} 280 ${x + 20} 286L${x + 20} 308Q${x} 304 ${x - 20} 308Z`,
        kind: 'detail',
        fill: white,
      },
      band(
        [
          [x - 20, 303],
          [x, 300],
          [x + 20, 303],
        ],
        2.8,
        far ? 'muzzleFar' : 'muzzle',
      ),
    ],
  };
};

const NECK: Pt[] = [
  [204, 214],
  [220, 172],
  [236, 132],
  [250, 104],
];

const RUMP_STRIPES: [Pt[], number][] = [
  [
    [
      [34, 196],
      [70, 192],
      [112, 200],
    ],
    6,
  ],
  [
    [
      [32, 214],
      [72, 210],
      [118, 218],
    ],
    6,
  ],
  [
    [
      [36, 232],
      [74, 228],
      [114, 236],
    ],
    5.6,
  ],
];

const okapi: AnimalDef = {
  id: 'okapi',
  name: 'Okapi',
  kind: 'animal',
  aliases: ['forest giraffe', 'zebra giraffe', 'okapia'],
  group: 'mammal',
  habitats: ['rainforest'],
  box: [338, 330],
  size: 260,
  locomotion: 'walk4',
  gait: { stride: 120, swing: 18 },
  sound: 'okapi',
  palette: {
    coat: '#6e3b2c',
    coatFar: '#573024',
    stripe: '#fbf4e8',
    stripeFar: '#dcd1c1',
    face: '#f3e7d6',
    muzzle: '#3e2925',
    snout: '#8c5a49',
    muzzleFar: '#4e3832',
    knob: '#2f201c',
    hoof: '#30231f',
    hoofFar: '#43332e',
    earInner: '#d99a86',
    nostril: '#241815',
  },
  parts: [
    {
      id: 'body',
      role: 'body',
      pivot: [140, HIP],
      shapes: [
        {
          d: smooth([
            [48, 192],
            [86, 180],
            [134, 172],
            [180, 162],
            [214, 160],
            [238, 176],
            [244, 206],
            [236, 234],
            [204, 250],
            [146, 254],
            [92, 250],
            [54, 238],
            [38, 216],
          ]),
          fill: 'coat',
        },
        ...RUMP_STRIPES.map(([pts, r]) => band(pts, r, 'stripe', 0.75)),
      ],
      children: [
        {
          id: 'tail',
          role: 'tail',
          pivot: [44, 196],
          behind: true,
          shapes: [
            { d: capsule(44, 196, 28, 226, 5, 4), fill: 'coat' },
            { d: capsule(28, 226, 24, 256, 4, 3.6), fill: 'coat' },
            { d: leaf(24, 248, 36, 9, 96), fill: 'muzzle' },
          ],
        },
        leg('legBF', 92, true, true),
        leg('legFF', 222, true, false),
        leg('legBN', 68, false, true),
        leg('legFN', 198, false, false),
        {
          id: 'neck',
          role: 'neck',
          pivot: [206, 206],
          behind: true,
          motion: { rotate: 3, phase: 0.05 },
          shapes: [{ d: tube(NECK, (t) => 30 - 8 * t), fill: 'coat' }],
          children: [
            {
              id: 'head',
              role: 'head',
              pivot: [250, 110],
              shapes: [
                {
                  d: smooth([
                    [252, 26],
                    [286, 36],
                    [300, 64],
                    [296, 98],
                    [284, 128],
                    [252, 142],
                    [220, 128],
                    [208, 98],
                    [204, 64],
                    [218, 36],
                  ]),
                  fill: 'coat',
                },
                {
                  d: smooth([
                    [212, 70],
                    [232, 62],
                    [252, 70],
                    [272, 62],
                    [292, 70],
                    [294, 100],
                    [282, 130],
                    [252, 146],
                    [222, 130],
                    [210, 100],
                  ]),
                  kind: 'detail',
                  fill: 'face',
                },
                { d: ellipse(252, 130, 25, 15), kind: 'detail', fill: 'snout' },
                { d: ellipse(219, 100, 10, 6.5), kind: 'feature', fill: 'blush', opacity: 0.55 },
                { d: ellipse(285, 100, 10, 6.5), kind: 'feature', fill: 'blush', opacity: 0.55 },
                { d: circle(234, 82, 10.5), kind: 'feature', fill: 'eye' },
                { d: circle(270, 82, 10.5), kind: 'feature', fill: 'eye' },
                { d: circle(238, 77.6, 4), kind: 'feature', fill: 'shine' },
                { d: circle(274, 77.6, 4), kind: 'feature', fill: 'shine' },
                { d: ellipse(243, 126, 3.8, 3, -15), kind: 'feature', fill: 'nostril' },
                { d: ellipse(261, 126, 3.8, 3, 15), kind: 'feature', fill: 'nostril' },
                { d: 'M244 136Q252 141 260 136', kind: 'line', stroke: 'nostril', width: 2.8 },
              ],
              children: [
                {
                  id: 'ossicones',
                  behind: true,
                  pivot: [252, 36],
                  shapes: [
                    { d: capsule(238, 40, 234, 20, 6.5, 5.5), fill: 'coat' },
                    { d: capsule(266, 40, 270, 20, 6.5, 5.5), fill: 'coat' },
                    { d: circle(234, 17, 6), fill: 'knob' },
                    { d: circle(270, 17, 6), fill: 'knob' },
                  ],
                },
                {
                  id: 'earL',
                  behind: true,
                  pivot: [212, 56],
                  motion: { rotate: 6, freq: 2, phase: 0.3 },
                  shapes: [
                    { d: leaf(216, 58, 50, 17, 205), fill: 'coat' },
                    { d: leaf(210, 57, 34, 9, 205), kind: 'detail', fill: 'earInner' },
                  ],
                },
                {
                  id: 'earR',
                  behind: true,
                  pivot: [292, 56],
                  motion: { rotate: -6, freq: 2, phase: 0.3 },
                  shapes: [
                    { d: leaf(288, 58, 50, 17, -25), fill: 'coat' },
                    { d: leaf(294, 57, 34, 9, -25), kind: 'detail', fill: 'earInner' },
                  ],
                },
              ],
            },
          ],
        },
      ],
    },
  ],
};

export default okapi;
