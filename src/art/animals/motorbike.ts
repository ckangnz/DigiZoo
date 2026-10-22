import { capsule, circle, curve, ellipse, f, roundRect, smooth } from '../core/paths';
import type { AnimalDef, PartNode, Shape } from '../core/types';

const W = 322;
const H = 262;
const R = 44;
const WY = H - R;
const RX = 66;
const FX = 256;

const wheel = (id: string, x: number): PartNode => ({
  id,
  pivot: [x, WY],
  shapes: [
    { d: circle(x, WY, R), fill: 'tyre' },
    { d: circle(x, WY, 31), kind: 'detail', fill: 'rim' },
    { d: circle(x, WY, 26), kind: 'detail', fill: 'tyreInner' },
  ],
  children: [
    {
      id: `${id}Spin`,
      role: 'spinner',
      pivot: [x, WY],
      shapes: [
        ...Array.from({ length: 5 }, (_, i): Shape => {
          const a = (i / 5) * Math.PI * 2 - Math.PI / 2;
          return {
            d: `M${f(x)} ${f(WY)}L${f(x + 25 * Math.cos(a))} ${f(WY + 25 * Math.sin(a))}`,
            kind: 'line',
            stroke: 'rim',
            width: 6,
          };
        }),
        { d: circle(x, WY, 8.5), kind: 'feature', fill: 'hub', stroke: 'auto' },
      ],
    },
  ],
});

const motorbike: AnimalDef = {
  id: 'motorbike',
  name: 'Motorbike',
  kind: 'object',
  aliases: ['motorcycle', 'motor bike', 'dirt bike', 'biker', 'vroom'],
  group: 'vehicle',
  habitats: ['vehicles'],
  box: [W, H],
  size: 150,
  locomotion: 'drive',
  gait: { period: 0.8, stride: Math.PI * 2 * R },
  sound: 'motorbike',
  palette: {
    paint: '#ff6b4a',
    paintDark: '#e5532f',
    stripe: '#fff4e0',
    seat: '#4a4458',
    metal: '#d3d8e2',
    metalDark: '#9aa3b8',
    engine: '#7d869c',
    tyre: '#45425a',
    tyreInner: '#5d5a70',
    rim: '#e3e7f0',
    hub: '#b9c0cf',
    headlight: '#ffe07a',
    taillight: '#ff6b6b',
    helmet: '#ffd23f',
    helmetStripe: '#ff6b4a',
    visor: '#8fd3ff',
    skin: '#f6c9a4',
    hair: '#8a4b2a',
    jacket: '#4c96e8',
    jacketDark: '#3a7fd0',
    pants: '#3d4f8a',
    boot: '#5a3b2e',
    glove: '#ff8a5c',
  },
  parts: [
    {
      id: 'bike',
      pivot: [W / 2, H],
      shapes: [
        {
          d: smooth([
            [22, 140],
            [62, 134],
            [128, 136],
            [158, 114],
            [204, 116],
            [226, 134],
            [214, 160],
            [188, 176],
            [128, 178],
            [70, 168],
            [32, 158],
          ]),
          fill: 'paint',
        },
        {
          d: smooth([
            [150, 132],
            [180, 124],
            [206, 128],
            [196, 140],
            [168, 142],
          ]),
          kind: 'detail',
          fill: 'stripe',
        },
        { d: roundRect(-10, 160, 400, 30, 0), kind: 'detail', fill: 'paintDark' },
        { d: roundRect(16, 141, 12, 9, 4), kind: 'feature', fill: 'taillight', stroke: 'auto' },
      ],
      children: [
        wheel('wheelB', RX),
        wheel('wheelF', FX),
        {
          id: 'swingarm',
          behind: true,
          shapes: [{ d: capsule(RX, WY, 146, 192, 7, 9), fill: 'metalDark' }],
        },
        {
          id: 'fork',
          behind: true,
          shapes: [
            { d: capsule(226, 120, FX, WY, 7, 7), fill: 'metal' },
            {
              d: 'M206 186Q256 150 300 190L292 198Q256 166 214 194Z',
              fill: 'paint',
            },
          ],
        },
        {
          id: 'engine',
          shapes: [
            { d: roundRect(118, 172, 62, 38, 12), fill: 'engine' },
            ...[184, 194].map((y): Shape => ({
              d: `M128 ${y}L170 ${y}`,
              kind: 'line',
              stroke: 'metalDark',
              width: 2.6,
            })),
            { d: capsule(34, 188, 128, 200, 5.5, 7), fill: 'metal' },
            { d: ellipse(35, 188, 4.5, 5.5), kind: 'feature', fill: 'metalDark' },
          ],
        },
        {
          id: 'seat',
          shapes: [
            {
              d: smooth([
                [52, 136],
                [86, 126],
                [130, 128],
                [138, 136],
                [92, 142],
              ]),
              fill: 'seat',
            },
          ],
        },
        {
          id: 'front',
          shapes: [
            {
              d: smooth([
                [210, 112],
                [236, 106],
                [262, 118],
                [266, 140],
                [244, 150],
                [222, 140],
              ]),
              fill: 'paint',
            },
            { d: ellipse(258, 128, 8, 11), kind: 'feature', fill: 'headlight', stroke: 'auto' },
            { d: capsule(204, 106, 228, 110, 4.5, 4.5), fill: 'metalDark' },
          ],
        },
        {
          id: 'rider',
          pivot: [112, 142],
          shapes: [
            { d: capsule(112, 146, 166, 150, 15, 13), fill: 'pants' },
            { d: capsule(166, 150, 162, 192, 12, 11), fill: 'pants' },
            { d: ellipse(170, 198, 17, 10), fill: 'boot' },
            {
              d: smooth([
                [96, 104],
                [122, 94],
                [146, 102],
                [148, 128],
                [138, 150],
                [104, 152],
                [92, 132],
              ]),
              fill: 'jacket',
            },
            { d: 'M122 106L120 146', kind: 'line', stroke: 'jacketDark', width: 2.6 },
          ],
          children: [
            {
              id: 'arm',
              shapes: [
                { d: capsule(128, 112, 196, 112, 11, 10), fill: 'jacket' },
                { d: circle(202, 110, 11), fill: 'glove' },
              ],
            },
            {
              id: 'head',
              role: 'head',
              pivot: [124, 100],
              shapes: [
                { d: circle(126, 62, 44), fill: 'helmet' },
                {
                  d: 'M84 46Q118 2 162 26L170 40Q126 14 92 58Z',
                  kind: 'detail',
                  fill: 'helmetStripe',
                },
                { d: ellipse(137, 76, 28, 25), kind: 'detail', fill: 'skin' },
                { d: ellipse(137, 76, 27, 24), kind: 'feature', fill: 'skin' },
                {
                  d: 'M111 66Q137 42 163 66Q151 59 143 61Q137 56 131 61Q121 58 111 66Z',
                  kind: 'feature',
                  fill: 'hair',
                },
                {
                  d: 'M102 50Q138 22 174 50Q172 58 168 60Q138 36 106 60Q102 56 102 50Z',
                  kind: 'feature',
                  fill: 'visor',
                  stroke: 'auto',
                },
                {
                  d: 'M116 44Q130 36 144 35',
                  kind: 'line',
                  stroke: 'white',
                  width: 3,
                  opacity: 0.85,
                },
                { d: ellipse(116, 86, 6.5, 4), kind: 'feature', fill: 'blush', opacity: 0.6 },
                { d: ellipse(158, 86, 6.5, 4), kind: 'feature', fill: 'blush', opacity: 0.6 },
                { d: circle(125, 76, 6.4), kind: 'feature', fill: 'eye' },
                { d: circle(149, 76, 6.4), kind: 'feature', fill: 'eye' },
                { d: circle(127.4, 73.4, 2.4), kind: 'feature', fill: 'shine' },
                { d: circle(151.4, 73.4, 2.4), kind: 'feature', fill: 'shine' },
                { d: curve(130, 88, 144, 88, 5.5), kind: 'line', stroke: 'mouth', width: 2.6 },
              ],
            },
          ],
        },
      ],
    },
  ],
};

export default motorbike;
