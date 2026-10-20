import { capsule, circle, curve, ellipse, leaf, smooth, tube, type Pt } from '../core/paths';
import type { AnimalDef, Shape } from '../core/types';

const W = 300;
const H = 240;
const HX = 112;
const HY = 98;
const HR = 47;
const TOP = HY - HR;
const EYE_Y = HY + 0.1 * HR;
const EYE_R = 0.14 * HR;
const EYE_DX = 0.36 * HR;

const eye = (x: number): Shape[] => [
  { d: circle(x, EYE_Y, EYE_R), kind: 'feature', fill: 'eye' },
  {
    d: circle(x + 0.36 * EYE_R, EYE_Y - 0.38 * EYE_R, 0.37 * EYE_R),
    kind: 'feature',
    fill: 'shine',
  },
];

const BASKET: Pt[] = [
  [30, 132],
  [150, 140],
  [270, 132],
  [262, 170],
  [236, 202],
  [150, 214],
  [64, 202],
  [38, 170],
];

const weave = (): Shape[] => {
  const out: Shape[] = [];
  for (let row = 0; row < 4; row++) {
    const y = 154 + row * 15;
    const shift = row % 2 ? 11 : 0;
    for (let x = 24 + shift; x < 280; x += 22) {
      out.push({
        d: tube(
          [
            [x - 9, y],
            [x, y + 4],
            [x + 9, y],
          ],
          1.4,
          12,
        ),
        kind: 'detail',
        fill: 'basketDark',
      });
    }
  }
  return out;
};

const reed = (base: Pt, top: Pt, bend: number): Shape[] => {
  const mid: Pt = [(base[0] + top[0]) / 2 + bend, (base[1] + top[1]) / 2];
  return [
    { d: tube([base, mid, top], 2.6, 20), fill: 'reed' },
    { d: capsule(top[0], top[1] - 2, top[0] + bend * 0.15, top[1] - 26, 6.5), fill: 'cattail' },
  ];
};

const WAVE_TOP = 200;

const water = (): Shape[] => {
  const pts: Pt[] = [];
  for (let i = 0; i <= 8; i++) {
    const x = 6 + i * 36;
    pts.push([x, WAVE_TOP + (i % 2 ? 6 : 0)]);
  }
  pts.push([292, 224], [270, 236], [30, 236], [8, 224]);
  return [
    { d: smooth(pts), fill: 'water' },
    { d: curve(40, 218, 84, 218, -4), kind: 'line', stroke: 'foam', width: 3 },
    { d: curve(128, 224, 176, 224, -4), kind: 'line', stroke: 'foam', width: 3 },
    { d: curve(214, 218, 258, 218, -4), kind: 'line', stroke: 'foam', width: 3 },
  ];
};

const BOB = 0.05 * H;

const babyMoses: AnimalDef = {
  id: 'baby-moses',
  name: 'Baby Moses',
  kind: 'character',
  aliases: ['moses basket', 'baby in a basket', 'basket', 'bulrushes', 'river nile'],
  group: 'bible',
  habitats: ['bible'],
  box: [W, H],
  size: 140,
  locomotion: 'float',
  gait: { period: 2.6, stride: 20 },
  sound: 'baby-moses',
  palette: {
    skin: '#e3b088',
    hair: '#4a2c1e',
    basket: '#e2b465',
    basketDark: '#c08a44',
    basketRim: '#d3a052',
    inside: '#9a6a3a',
    pillow: '#fbf6ec',
    blanket: '#9ccaf0',
    blanketDot: '#e8f4ff',
    blanketHem: '#7fb3e0',
    water: '#5fb4e8',
    foam: '#e8f6ff',
    reed: '#7cb35a',
    leaf: '#8cc466',
    cattail: '#a8703f',
  },
  parts: [
    {
      id: 'scene',
      pivot: [W / 2, H / 2],
      motion: { y: -BOB * 0.7, freq: 0.5 },
      children: [
        {
          id: 'still',
          pivot: [W / 2, H / 2],
          motion: { rotate: -4 * 0.7, freq: 0.5, phase: 1 / (2 * Math.PI) },
          children: [
            {
              id: 'reeds',
              behind: true,
              pivot: [270, 200],
              motion: { rotate: 2, freq: 1, phase: 0.3 },
              shapes: [
                { d: leaf(262, 206, 140, 9, -86), fill: 'leaf' },
                ...reed([272, 206], [284, 56], 6),
                ...reed([256, 206], [250, 36], -4),
                { d: leaf(278, 206, 112, 8, -78), fill: 'leaf' },
                { d: leaf(30, 206, 110, 8, -102), fill: 'leaf' },
                ...reed([22, 206], [16, 80], -4),
              ],
            },
          ],
        },
      ],
    },
    {
      id: 'basket',
      pivot: [W / 2, 170],
      shapes: [
        { d: ellipse(150, 132, 120, 14), fill: 'basketRim' },
        { d: ellipse(150, 130, 108, 9), kind: 'detail', fill: 'inside' },
      ],
      children: [
        {
          id: 'pillow',
          pivot: [96, 128],
          shapes: [{ d: ellipse(92, 126, 50, 18, -6), fill: 'pillow' }],
        },
        {
          id: 'head',
          role: 'head',
          pivot: [HX, 136],
          shapes: [
            { d: circle(HX, HY, HR), fill: 'skin' },
            { d: circle(HX, HY, HR - 1.2), kind: 'feature', fill: 'skin' },
            {
              d: ellipse(HX - 0.6 * HR, EYE_Y + 0.27 * HR, 0.17 * HR, 0.1 * HR),
              kind: 'feature',
              fill: 'blush',
              opacity: 0.55,
            },
            {
              d: ellipse(HX + 0.6 * HR, EYE_Y + 0.27 * HR, 0.17 * HR, 0.1 * HR),
              kind: 'feature',
              fill: 'blush',
              opacity: 0.55,
            },
            {
              d: `M${HX - 8} ${EYE_Y + 13}Q${HX} ${EYE_Y + 16} ${HX + 8} ${EYE_Y + 13}Q${HX + 7} ${EYE_Y + 24} ${HX} ${EYE_Y + 24}Q${HX - 7} ${EYE_Y + 24} ${HX - 8} ${EYE_Y + 13}Z`,
              kind: 'feature',
              fill: 'mouth',
            },
            { d: ellipse(HX, EYE_Y + 21, 4.5, 2.4), kind: 'feature', fill: 'tongue' },
          ],
          children: [
            {
              id: 'eyes',
              role: 'lid',
              pivot: [HX, EYE_Y],
              shapes: [...eye(HX - EYE_DX), ...eye(HX + EYE_DX)],
            },
            {
              id: 'curl',
              pivot: [HX, TOP + 2],
              shapes: [
                {
                  d: smooth([
                    [HX - 14, TOP + 4],
                    [HX - 6, TOP - 6],
                    [HX + 8, TOP - 8],
                    [HX + 14, TOP],
                    [HX + 8, TOP + 6],
                    [HX + 2, TOP + 2],
                    [HX - 4, TOP + 6],
                  ]),
                  fill: 'hair',
                },
              ],
            },
          ],
        },
        {
          id: 'blanket',
          pivot: [190, 132],
          shapes: [
            {
              d: smooth([
                [124, 140],
                [136, 118],
                [168, 106],
                [210, 104],
                [244, 114],
                [262, 136],
                [250, 150],
                [190, 152],
                [130, 152],
              ]),
              fill: 'blanket',
            },
            { d: circle(170, 122, 4), kind: 'detail', fill: 'blanketDot' },
            { d: circle(200, 114, 4), kind: 'detail', fill: 'blanketDot' },
            { d: circle(228, 126, 4), kind: 'detail', fill: 'blanketDot' },
            { d: circle(150, 134, 4), kind: 'detail', fill: 'blanketDot' },
            { d: circle(206, 138, 4), kind: 'detail', fill: 'blanketDot' },
            { d: circle(240, 142, 4), kind: 'detail', fill: 'blanketDot' },
          ],
        },
        {
          id: 'arm',
          role: 'arm',
          pivot: [150, 126],
          shapes: [
            { d: capsule(150, 128, 166, 98, 8.5, 8), fill: 'blanket' },
            { d: circle(168, 92, 9), fill: 'skin' },
          ],
        },
        {
          id: 'front',
          pivot: [W / 2, 170],
          shapes: [
            { d: smooth(BASKET), fill: 'basket' },
            ...weave(),
            { d: capsule(34, 138, 266, 138, 8), kind: 'detail', fill: 'basketRim' },
          ],
        },
      ],
    },
    {
      id: 'waterFront',
      pivot: [W / 2, H / 2],
      motion: { y: -BOB * 0.7, freq: 0.5 },
      children: [
        {
          id: 'stillFront',
          pivot: [W / 2, H / 2],
          motion: { rotate: -4 * 0.7, freq: 0.5, phase: 1 / (2 * Math.PI) },
          children: [{ id: 'ripples', pivot: [W / 2, 220], shapes: water() }],
        },
      ],
    },
  ],
};

export default babyMoses;
