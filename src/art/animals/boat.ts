import {
  capsule,
  circle,
  ellipse,
  f,
  roundRect,
  scallop,
  smooth,
  tube,
  type Pt,
} from '../core/paths';
import type { AnimalDef, PartNode, Shape } from '../core/types';

const WAVE = 60;

const eye = (x: number, y: number): Shape[] => [
  { d: ellipse(x, y, 9, 12), kind: 'feature', fill: 'eye' },
  { d: circle(x + 3.2, y - 4.4, 3.7), kind: 'feature', fill: 'shine' },
  { d: circle(x - 3.1, y + 5.2, 1.7), kind: 'feature', fill: 'shine' },
];

const puff = (id: string, x: number, y: number, r: number, phase: number): PartNode => ({
  id,
  role: 'sparkle',
  phase,
  pivot: [x, y],
  shapes: [{ d: scallop(x, y, r, 7, r * 0.3, 10), fill: 'smoke' }],
});

const SHEER: Pt[] = [
  [18, 134],
  [80, 140],
  [160, 141],
  [240, 137],
  [296, 124],
  [338, 100],
];

const HULL: Pt[] = [
  ...SHEER,
  [346, 110],
  [334, 150],
  [310, 188],
  [266, 212],
  [100, 214],
  [44, 198],
  [20, 166],
];

const tire = (id: string, x: number, y: number): PartNode => ({
  id,
  shapes: [
    { d: circle(x, y, 13), fill: 'tire' },
    { d: circle(x, y, 6), kind: 'detail', fill: 'tireIn' },
    { d: `M${x} ${y - 13}L${x} ${y - 26}`, kind: 'line', stroke: 'rope', width: 2.6 },
  ],
});

const water = (): Shape[] => {
  const top: Pt[] = [];
  for (let x = 2; x <= 358; x += 4) {
    top.push([x, 202 - 6 * Math.cos((2 * Math.PI * (x - 2)) / WAVE)]);
  }
  const crest = top.map(([x, y]) => `L${f(x)} ${f(y)}`).join('');
  const out: Shape[] = [
    { d: `M2 216${crest}L358 216Q358 230 330 233Q180 240 30 233Q2 230 2 216Z`, fill: 'water' },
    { d: roundRect(-10, 220, 380, 30, 10), kind: 'detail', fill: 'waterDark' },
  ];
  for (let k = 1; k < 6; k++) {
    const x = 2 + k * WAVE;
    out.push({
      d: `M${f(x - 14)} 200Q${f(x)} 192 ${f(x + 14)} 200`,
      kind: 'line',
      stroke: 'foam',
      width: 3.2,
    });
  }
  return out;
};

const boat: AnimalDef = {
  id: 'boat',
  name: 'Boat',
  kind: 'object',
  aliases: ['tugboat', 'tug boat', 'ship', 'tug', 'steamboat'],
  group: 'vehicle',
  habitats: ['vehicles', 'ocean'],
  box: [360, 240],
  size: 220,
  locomotion: 'float',
  gait: { period: 2.2, stride: 80 },
  sound: 'boat',
  palette: {
    hull: '#ef4d48',
    hullDark: '#2f3e66',
    stripe: '#fff3dc',
    cabin: '#fdf8ee',
    cabinShade: '#e7dfd0',
    roof: '#3f8ae6',
    glass: '#c4ecff',
    stack: '#ffc531',
    stackBand: '#ef4d48',
    stackTop: '#4a4658',
    tire: '#4a4658',
    tireIn: '#2f2c3a',
    rope: '#a9784a',
    fender: '#b98552',
    fenderDark: '#946639',
    ring: '#ff8a2e',
    water: '#66c0f0',
    waterDark: '#4fa8de',
    foam: '#d6f2ff',
    smoke: '#f4f2ee',
  },
  parts: [
    {
      id: 'tug',
      pivot: [180, 160],
      children: [
        {
          id: 'stack',
          shapes: [
            { d: roundRect(102, 44, 40, 80, 8), fill: 'stack' },
            { d: roundRect(96, 62, 52, 14, 0), kind: 'detail', fill: 'stackBand' },
            { d: roundRect(96, 30, 52, 22, 0), kind: 'detail', fill: 'stackTop' },
          ],
          children: [puff('puffA', 128, 24, 13, 0), puff('puffB', 106, 6, 10, 0.2)],
        },
        {
          id: 'deckhouse',
          shapes: [
            { d: roundRect(80, 96, 110, 50, 10), fill: 'cabin' },
            { d: roundRect(70, 134, 130, 14, 0), kind: 'detail', fill: 'cabinShade' },
            { d: circle(152, 116, 9), kind: 'feature', fill: 'glass', stroke: 'auto', width: 2.4 },
          ],
          children: [
            {
              id: 'ring',
              shapes: [
                { d: circle(110, 118, 14), fill: 'ring' },
                ...[45, 135, 225, 315].map((deg): Shape => {
                  const a = ((deg - 20) * Math.PI) / 180;
                  const b = ((deg + 20) * Math.PI) / 180;
                  return {
                    d: `M110 118L${f(110 + 20 * Math.cos(a))} ${f(118 + 20 * Math.sin(a))}L${f(110 + 20 * Math.cos(b))} ${f(118 + 20 * Math.sin(b))}Z`,
                    kind: 'detail',
                    fill: 'white',
                  };
                }),
                { d: circle(110, 118, 6.5), kind: 'detail', fill: 'cabin' },
              ],
            },
          ],
        },
        {
          id: 'wheelhouse',
          shapes: [
            { d: roundRect(176, 42, 98, 104, 14), fill: 'cabin' },
            { d: roundRect(168, 134, 116, 14, 0), kind: 'detail', fill: 'cabinShade' },
            {
              d: 'M212 104Q225 108 239 103Q238 120 226 121Q213 120 212 104Z',
              kind: 'feature',
              fill: 'mouth',
            },
            { d: ellipse(226, 115.5, 6, 3.2), kind: 'feature', fill: 'tongue' },
          ],
          children: [
            {
              id: 'roof',
              shapes: [{ d: roundRect(166, 30, 118, 18, 9), fill: 'roof' }],
            },
            {
              id: 'window',
              shapes: [
                { d: roundRect(188, 54, 76, 42, 12), fill: 'glass' },
                {
                  d: 'M197 62Q194 72 195 84',
                  kind: 'line',
                  stroke: 'white',
                  width: 4,
                  opacity: 0.8,
                },
                { d: ellipse(202, 89, 6.5, 3.8), kind: 'feature', fill: 'blush', opacity: 0.6 },
                { d: ellipse(250, 89, 6.5, 3.8), kind: 'feature', fill: 'blush', opacity: 0.6 },
                ...eye(214, 74),
                ...eye(238, 74),
              ],
            },
          ],
        },
        {
          id: 'hull',
          shapes: [
            { d: smooth(HULL), fill: 'hull' },
            {
              d: tube(
                SHEER.map(([x, y]) => [x, y + 12] as Pt),
                4.5,
                60,
              ),
              kind: 'detail',
              fill: 'stripe',
            },
            { d: 'M0 184Q180 196 360 170L360 240L0 240Z', kind: 'detail', fill: 'hullDark' },
          ],
          children: [
            tire('tireA', 96, 168),
            tire('tireB', 162, 170),
            tire('tireC', 228, 166),
            {
              id: 'fender',
              shapes: [
                { d: capsule(342, 106, 332, 152, 9), fill: 'fender' },
                {
                  d: 'M330 118L348 122M328 132L344 136M326 146L340 148',
                  kind: 'line',
                  stroke: 'fenderDark',
                  width: 2.4,
                },
              ],
            },
          ],
        },
        {
          id: 'water',
          pivot: [180, 216],
          motion: { x: 7, phase: 0.25 },
          shapes: water(),
        },
      ],
    },
  ],
};

export default boat;
