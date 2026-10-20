import { capsule, circle, curve, ellipse, smooth, type Pt } from '../core/paths';
import type { AnimalDef, PartNode } from '../core/types';

function pincer(cx: number, cy: number, r: number, tilt: number): string {
  const a = (tilt * Math.PI) / 180;
  const place = ([x, y]: Pt): Pt => [
    cx + x * Math.cos(a) - y * Math.sin(a),
    cy + x * Math.sin(a) + y * Math.cos(a),
  ];
  const polar = (deg: number, k = 1): Pt => [
    r * k * Math.cos((deg * Math.PI) / 180),
    r * k * Math.sin((deg * Math.PI) / 180),
  ];
  const outline: Pt[] = [
    [0, -r * 0.32],
    polar(-66, 1.12),
    polar(-28),
    polar(12),
    polar(52),
    polar(90),
    polar(128),
    polar(168),
    polar(208),
    polar(246, 1.12),
  ];
  return smooth(outline.map(place));
}

const leg = (id: string, hip: Pt, knee: Pt, foot: Pt, phase: number, dark: boolean): PartNode => {
  const lift = foot[0] > hip[0] ? -16 : 16;
  const fill = dark ? 'legDark' : 'leg';
  return {
    id,
    role: id,
    behind: true,
    pivot: hip,
    motion: { rotate: lift, wave: 'lift', freq: 2, phase },
    shapes: [
      { d: capsule(hip[0], hip[1], knee[0], knee[1], 9, 7.5), fill },
      { d: capsule(knee[0], knee[1], foot[0], foot[1], 7.5, 4), fill },
    ],
  };
};

const mirror = ([x, y]: Pt): Pt => [300 - x, y];

const LEGS: [Pt, Pt, Pt][] = [
  [
    [216, 98],
    [258, 76],
    [286, 166],
  ],
  [
    [220, 118],
    [262, 110],
    [268, 167],
  ],
  [
    [208, 136],
    [238, 142],
    [244, 169],
  ],
];

const crab: AnimalDef = {
  id: 'crab',
  name: 'Crab',
  aliases: ['crabby', 'hermit crab', 'beach crab'],
  group: 'sea',
  habitats: ['ocean'],
  box: [300, 173],
  size: 80,
  locomotion: 'crawl',
  gait: { stride: 34 },
  sound: 'crab',
  palette: {
    shell: '#ff7a4d',
    leg: '#ef6a3e',
    legDark: '#d9552f',
    spot: '#ffa47f',
  },
  parts: [
    {
      id: 'body',
      role: 'body',
      pivot: [150, 150],
      shapes: [
        { d: ellipse(150, 110, 84, 50), fill: 'shell' },
        { d: circle(118, 80, 7), kind: 'detail', fill: 'spot' },
        { d: circle(150, 72, 5.5), kind: 'detail', fill: 'spot' },
        { d: circle(182, 80, 7), kind: 'detail', fill: 'spot' },
        { d: circle(96, 98, 4.5), kind: 'detail', fill: 'spot' },
        { d: circle(204, 98, 4.5), kind: 'detail', fill: 'spot' },
        { d: ellipse(110, 122, 12, 7), kind: 'feature', fill: 'blush', opacity: 0.5 },
        { d: ellipse(190, 122, 12, 7), kind: 'feature', fill: 'blush', opacity: 0.5 },
        { d: curve(136, 120, 164, 120, 9), kind: 'line', stroke: 'mouth', width: 3.4 },
      ],
      children: [
        ...LEGS.map(([h, k, f], i) =>
          leg(`leg${i + 1}F`, mirror(h), mirror(k), mirror(f), i / 3 + 0.5, i === 1),
        ),
        ...LEGS.map(([h, k, f], i) => leg(`leg${i + 1}N`, h, k, f, i / 3, i === 1)),
        {
          id: 'clawL',
          role: 'clawF',
          behind: true,
          pivot: [88, 92],
          shapes: [
            { d: capsule(88, 92, 54, 62, 11, 9.5), fill: 'shell' },
            { d: pincer(44, 36, 29, -18), fill: 'shell' },
          ],
        },
        {
          id: 'clawR',
          role: 'clawN',
          behind: true,
          phase: 0.5,
          pivot: [212, 92],
          shapes: [
            { d: capsule(212, 92, 246, 62, 11, 9.5), fill: 'shell' },
            { d: pincer(256, 36, 29, 18), fill: 'shell' },
          ],
        },
        {
          id: 'eyeL',
          role: 'antennaF',
          behind: true,
          pivot: [128, 68],
          shapes: [
            { d: capsule(128, 68, 122, 26, 6.5, 5.5), fill: 'shell' },
            { d: circle(121, 20, 15), fill: 'shell' },
            { d: circle(121, 20, 10.5), kind: 'feature', fill: 'eye' },
            { d: circle(124.6, 15.8, 4), kind: 'feature', fill: 'shine' },
          ],
        },
        {
          id: 'eyeR',
          role: 'antennaN',
          behind: true,
          pivot: [172, 68],
          shapes: [
            { d: capsule(172, 68, 178, 26, 6.5, 5.5), fill: 'shell' },
            { d: circle(179, 20, 15), fill: 'shell' },
            { d: circle(179, 20, 10.5), kind: 'feature', fill: 'eye' },
            { d: circle(182.6, 15.8, 4), kind: 'feature', fill: 'shine' },
          ],
        },
      ],
    },
  ],
};

export default crab;
