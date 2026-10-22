import { circle, curve, ellipse, scalePath, smooth, tube, type Pt } from '../core/paths';
import type { AnimalDef, PartNode, Shape } from '../core/types';

const shift = (pts: Pt[], dx: number, dy: number): Pt[] => pts.map(([x, y]) => [x + dx, y + dy]);

const grow = (p: PartNode, k: number, [ox, oy]: Pt): PartNode => ({
  ...p,
  pivot: p.pivot && [ox + (p.pivot[0] - ox) * k, oy + (p.pivot[1] - oy) * k],
  shapes: p.shapes?.map((s) => ({ ...s, d: scalePath(s.d, k, k, ox, oy) })),
  children: p.children?.map((c) => grow(c, k, [ox, oy])),
});

const fold = (pts: Pt[], width: number): Shape => ({
  d: tube(pts, (t) => 0.6 + width * Math.sin(Math.PI * t), 40),
  kind: 'detail',
  fill: 'wrinkle',
});

const FRONT_FLIPPER: Pt[] = [
  [236, 196],
  [262, 194],
  [278, 214],
  [286, 242],
  [298, 260],
  [322, 268],
  [334, 276],
  [326, 284],
  [292, 285],
  [266, 282],
  [250, 268],
  [242, 240],
  [230, 214],
];

const frontFlipper = (id: string, dx: number, far: boolean): PartNode => ({
  id,
  role: id,
  behind: far,
  pivot: [250 + dx, 204],
  shapes: [
    { d: smooth(shift(FRONT_FLIPPER, dx, 0)), fill: far ? 'skinDark' : 'skin' },
    ...(far
      ? []
      : [300, 310, 320].map((x): Shape => ({
          d: curve(x - 6, 273, x, 282, 1.5),
          kind: 'line',
          stroke: 'toe',
          width: 2.2,
        }))),
  ],
});

const HIND_FLIPPER: Pt[] = [
  [70, 256],
  [48, 258],
  [26, 260],
  [8, 256],
  [2, 264],
  [10, 270],
  [0, 276],
  [8, 284],
  [38, 285],
  [68, 282],
  [82, 272],
];

const hindFlipper = (id: string, dy: number, far: boolean): PartNode => ({
  id,
  behind: true,
  pivot: [70, 270 + dy],
  motion: { rotate: 5, phase: far ? 0.5 : 0 },
  shapes: [{ d: smooth(shift(HIND_FLIPPER, far ? -4 : 0, dy)), fill: far ? 'skinDark' : 'skin' }],
});

const DOTS: Pt[] = [
  [236, 138],
  [246, 142],
  [256, 138],
  [240, 150],
  [251, 152],
  [278, 138],
  [288, 142],
  [298, 138],
  [284, 152],
  [295, 150],
];

const tusk = (x: number, dir: 1 | -1): string =>
  tube(
    [
      [x, 150],
      [x + dir * 1, 180],
      [x - dir * 2, 206],
      [x - dir * 7, 226],
    ],
    (t) => 7 - 3.6 * t,
    40,
  );

const HEAD: PartNode = {
  id: 'head',
  role: 'head',
  pivot: [250, 170],
  shapes: [
    { d: ellipse(266, 112, 62, 54), fill: 'skin' },
    { d: ellipse(218, 124, 10, 6.5), kind: 'feature', fill: 'blush', opacity: 0.55 },
    { d: ellipse(314, 124, 10, 6.5), kind: 'feature', fill: 'blush', opacity: 0.55 },
    { d: circle(244, 96, 9), kind: 'feature', fill: 'eye' },
    { d: circle(288, 96, 9), kind: 'feature', fill: 'eye' },
    { d: circle(247.4, 92.4, 3.4), kind: 'feature', fill: 'shine' },
    { d: circle(291.4, 92.4, 3.4), kind: 'feature', fill: 'shine' },
  ],
  children: [
    {
      id: 'tusks',
      shapes: [
        { d: tusk(250, 1), fill: 'tusk' },
        { d: tusk(282, -1), fill: 'tusk' },
      ],
    },
    {
      id: 'muzzle',
      shapes: [
        { d: ellipse(248, 140, 28, 22, -6), fill: 'muzzle' },
        { d: ellipse(284, 140, 28, 22, 6), fill: 'muzzle' },
        {
          d: 'M257 118Q266 113 275 118Q274 126 266 128Q258 126 257 118Z',
          kind: 'feature',
          fill: 'nose',
        },
        ...DOTS.map(([x, y]): Shape => ({ d: circle(x, y, 2), kind: 'feature', fill: 'whisker' })),
        { d: curve(260, 164, 272, 164, 3), kind: 'line', stroke: 'mouth', width: 2.6 },
        { d: 'M224 140L202 136', kind: 'line', stroke: 'whisker', width: 2 },
        { d: 'M224 148L202 152', kind: 'line', stroke: 'whisker', width: 2 },
        { d: 'M308 140L330 136', kind: 'line', stroke: 'whisker', width: 2 },
        { d: 'M308 148L330 152', kind: 'line', stroke: 'whisker', width: 2 },
      ],
    },
  ],
};

const walrus: AnimalDef = {
  id: 'walrus',
  name: 'Walrus',
  kind: 'animal',
  aliases: ['walruses', 'tusky', 'morse'],
  group: 'mammal',
  habitats: ['polar'],
  box: [340, 286],
  size: 220,
  locomotion: 'waddle',
  gait: { period: 1 },
  sound: 'walrus',
  palette: {
    skin: '#c99479',
    skinDark: '#a8745b',
    belly: '#dcac90',
    muzzle: '#e9c3a7',
    wrinkle: '#b07e64',
    toe: '#a06e55',
    whisker: '#8a5843',
    tusk: '#fffaf0',
    nose: '#4a2e26',
  },
  parts: [
    {
      id: 'body',
      role: 'body',
      pivot: [170, 286],
      motion: { rotate: -3.5 },
      shapes: [
        {
          d: smooth([
            [164, 90],
            [120, 104],
            [84, 136],
            [56, 180],
            [34, 222],
            [24, 256],
            [36, 280],
            [100, 286],
            [180, 286],
            [250, 280],
            [296, 250],
            [312, 200],
            [306, 150],
            [282, 110],
            [230, 88],
          ]),
          fill: 'skin',
        },
        {
          d: smooth([
            [320, 140],
            [290, 168],
            [264, 214],
            [222, 252],
            [160, 274],
            [100, 290],
            [330, 300],
          ]),
          kind: 'detail',
          fill: 'belly',
        },
        fold(
          [
            [196, 92],
            [184, 132],
            [186, 176],
          ],
          2.6,
        ),
        fold(
          [
            [170, 104],
            [160, 144],
            [164, 190],
          ],
          2.4,
        ),
      ],
      children: [
        hindFlipper('hindF', -6, true),
        hindFlipper('hindN', 0, false),
        frontFlipper('legF', 14, true),
        frontFlipper('legN', 0, false),
        grow(HEAD, 1.1, [266, 166]),
      ],
    },
  ],
};

export default walrus;
