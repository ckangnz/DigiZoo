import { circle, curve, ellipse, smooth, tube, type Pt } from '../core/paths';
import type { AnimalDef, Shape } from '../core/types';

const groove = (pts: Pt[]): Shape => ({ d: tube(pts, 1.8), kind: 'detail', fill: 'groove' });

const JET: Pt[] = [
  [318, 94],
  [318, 64],
  [318, 36],
];

const ARC: Pt[] = [
  [316, 70],
  [308, 48],
  [294, 38],
  [280, 42],
  [274, 56],
];

const ARC_R = (t: number) => 4.5 + 2.5 * Math.sin(Math.PI * t) + 1.5 * t;

const mirror = (pts: Pt[]): Pt[] => pts.map(([x, y]) => [636 - x, y]);

const whale: AnimalDef = {
  id: 'whale',
  name: 'Whale',
  aliases: ['blue whale', 'humpback'],
  group: 'mammal',
  habitats: ['ocean'],
  box: [430, 250],
  size: 300,
  locomotion: 'swim',
  gait: { period: 1.5 },
  sound: 'whale',
  palette: {
    skin: '#4f80c9',
    back: '#3a63a8',
    throat: '#d7e9f8',
    groove: '#a3c1e4',
    water: '#a6dbf5',
    waterLight: '#e4f7ff',
  },
  parts: [
    {
      id: 'body',
      role: 'body',
      pivot: [260, 160],
      shapes: [
        {
          d: smooth([
            [414, 160],
            [406, 124],
            [382, 100],
            [346, 86],
            [300, 82],
            [252, 86],
            [206, 98],
            [164, 114],
            [128, 128],
            [100, 136],
            [98, 156],
            [126, 172],
            [170, 192],
            [226, 208],
            [290, 214],
            [348, 208],
            [390, 192],
            [410, 176],
          ]),
          fill: 'skin',
        },
        {
          d:
            smooth(
              [
                [96, 146],
                [150, 128],
                [210, 112],
                [270, 103],
                [326, 104],
                [372, 114],
                [404, 132],
                [424, 148],
              ],
              false,
            ) + 'L420 60L80 60Z',
          kind: 'detail',
          fill: 'back',
        },
        {
          d:
            smooth(
              [
                [420, 163],
                [384, 167],
                [344, 170],
                [300, 178],
                [250, 188],
                [196, 192],
                [150, 182],
                [110, 166],
              ],
              false,
            ) + 'L110 240L420 240Z',
          kind: 'detail',
          fill: 'throat',
        },
        groove([
          [396, 178],
          [356, 184],
          [306, 190],
          [262, 196],
        ]),
        groove([
          [396, 190],
          [356, 196],
          [310, 202],
          [270, 206],
        ]),
        groove([
          [384, 201],
          [350, 206],
          [314, 210],
        ]),
        { d: curve(412, 164, 326, 167, -9), kind: 'line', stroke: 'mouth', width: 3.4 },
        { d: ellipse(330, 158, 11, 6.5), kind: 'feature', fill: 'blush', opacity: 0.5 },
        { d: circle(346, 141, 9.5), kind: 'feature', fill: 'eye' },
        { d: circle(349.6, 137, 3.6), kind: 'feature', fill: 'shine' },
      ],
      children: [
        {
          id: 'spout',
          behind: true,
          pivot: [318, 90],
          motion: { scaleY: 0.08, scaleX: -0.04, freq: 2 },
          shapes: [
            { d: tube(JET, (t) => 5 + 4 * t), fill: 'water' },
            { d: tube(ARC, ARC_R), fill: 'water' },
            { d: tube(mirror(ARC), ARC_R), fill: 'water' },
            { d: circle(318, 33, 3.6), kind: 'detail', fill: 'waterLight' },
            { d: circle(300, 42, 2.6), kind: 'detail', fill: 'waterLight' },
            { d: circle(336, 42, 2.6), kind: 'detail', fill: 'waterLight' },
          ],
        },
        {
          id: 'tail',
          role: 'tail',
          behind: true,
          pivot: [112, 150],
          motion: { rotate: 11, phase: 0.25 },
          shapes: [
            {
              d: 'M122 170C96 168 70 152 60 128C52 110 50 94 48 82C36 76 18 70 8 58C2 50 8 42 18 44C34 46 50 52 58 62C66 52 84 44 102 42C114 41 118 50 110 56C98 66 82 74 72 82C74 98 82 114 96 124C104 129 112 131 122 132Z',
              fill: 'skin',
            },
            {
              d: smooth([
                [140, 147],
                [114, 144],
                [95, 136],
                [83, 121],
                [76, 102],
                [73, 86],
                [92, 86],
                [150, 112],
              ]),
              kind: 'detail',
              fill: 'back',
            },
          ],
        },
        {
          id: 'flipper',
          role: 'finN',
          pivot: [292, 196],
          shapes: [
            {
              d: 'M276 192C268 208 254 224 236 236C226 242 232 252 244 248C270 238 292 220 306 198Z',
              fill: 'skin',
            },
          ],
        },
      ],
    },
  ],
};

export default whale;
