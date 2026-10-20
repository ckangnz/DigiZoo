import { capsule, circle, curve, ellipse, smooth } from '../core/paths';
import type { AnimalDef, Shape } from '../core/types';

const SPOTS: [number, number, number, number][] = [
  [214, 84, 9, 5],
  [184, 98, 7, 4.5],
  [152, 88, 6.5, 4],
  [128, 100, 5.5, 3.5],
  [236, 110, 6, 4],
];

const riverDolphin: AnimalDef = {
  id: 'river-dolphin',
  name: 'River Dolphin',
  kind: 'animal',
  aliases: ['pink dolphin', 'amazon river dolphin', 'boto', 'dolphin'],
  group: 'mammal',
  habitats: ['rainforest'],
  box: [380, 190],
  size: 170,
  locomotion: 'swim',
  gait: { period: 1.3 },
  sound: 'river-dolphin',
  palette: {
    skin: '#f4a3b6',
    skinDark: '#e388a0',
    back: '#e48fa6',
    belly: '#ffd9e2',
    spot: '#fbc4d1',
  },
  parts: [
    {
      id: 'body',
      role: 'body',
      pivot: [214, 106],
      shapes: [
        { d: capsule(316, 118, 370, 121, 11.5, 6.5), fill: 'skin' },
        { d: ellipse(306, 92, 33, 40, 10), fill: 'skin' },
        {
          d: smooth([
            [334, 118],
            [330, 100],
            [314, 80],
            [292, 70],
            [270, 70],
            [248, 68],
            [220, 60],
            [192, 52],
            [160, 54],
            [128, 64],
            [100, 76],
            [80, 88],
            [80, 104],
            [104, 118],
            [140, 136],
            [184, 152],
            [232, 156],
            [276, 148],
            [310, 136],
            [330, 126],
          ]),
          fill: 'skin',
        },
        {
          d:
            smooth(
              [
                [70, 82],
                [110, 70],
                [150, 58],
                [190, 54],
                [230, 62],
                [262, 64],
                [292, 56],
                [326, 74],
                [348, 100],
              ],
              false,
            ) + 'L340 20L60 20Z',
          kind: 'detail',
          fill: 'back',
        },
        {
          d:
            smooth(
              [
                [380, 126],
                [340, 126],
                [306, 128],
                [264, 132],
                [218, 130],
                [172, 122],
                [128, 108],
                [92, 100],
              ],
              false,
            ) + 'L92 190L380 190Z',
          kind: 'detail',
          fill: 'belly',
        },
        ...SPOTS.map(([x, y, rx, ry]): Shape => ({
          d: ellipse(x, y, rx, ry, -10),
          kind: 'detail',
          fill: 'spot',
        })),
        { d: curve(368, 123, 314, 122, -6), kind: 'line', stroke: 'mouth', width: 3 },
        { d: ellipse(300, 116, 9, 5.5), kind: 'feature', fill: 'blush', opacity: 0.55 },
        { d: circle(298, 99, 8.4), kind: 'feature', fill: 'eye' },
        { d: circle(301.2, 95.8, 3.2), kind: 'feature', fill: 'shine' },
      ],
      children: [
        {
          id: 'tail',
          role: 'tail',
          behind: true,
          pivot: [88, 90],
          shapes: [
            {
              d: 'M98 84C84 70 64 52 46 40C36 33 26 38 30 48C36 60 42 72 44 84C36 92 24 102 14 112C8 120 14 128 24 124C46 116 74 106 96 100Z',
              fill: 'skin',
            },
          ],
        },
        {
          id: 'ridge',
          role: 'finTop',
          behind: true,
          pivot: [180, 54],
          shapes: [
            {
              d: 'M146 60C156 48 172 40 188 40C198 40 204 46 208 56Z',
              fill: 'back',
            },
          ],
        },
        {
          id: 'flipperFar',
          role: 'finF',
          behind: true,
          pivot: [266, 140],
          shapes: [
            {
              d: 'M276 136C280 150 278 162 268 168C260 172 254 166 256 158C258 150 260 144 262 138Q269 130 276 136Z',
              fill: 'skinDark',
            },
          ],
        },
        {
          id: 'flipper',
          role: 'finN',
          pivot: [250, 140],
          shapes: [
            {
              d: 'M262 132C258 150 246 166 226 176C214 182 206 174 212 164C220 152 228 142 236 132Q249 124 262 132Z',
              fill: 'skin',
            },
          ],
        },
      ],
    },
  ],
};

export default riverDolphin;
