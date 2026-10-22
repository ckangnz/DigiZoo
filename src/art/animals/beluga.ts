import { circle, curve, ellipse, smooth } from '../core/paths';
import type { AnimalDef } from '../core/types';

const beluga: AnimalDef = {
  id: 'beluga',
  name: 'Beluga',
  kind: 'animal',
  aliases: ['beluga whale', 'white whale', 'sea canary', 'belukha'],
  group: 'sea',
  habitats: ['polar'],
  box: [344, 220],
  size: 220,
  locomotion: 'swim',
  gait: { period: 1.4 },
  sound: 'beluga',
  palette: {
    skin: '#f5f9fd',
    shade: '#d5e1ee',
    shadeDark: '#c3d2e4',
    glow: '#ffffff',
    mouthLine: '#6f7f99',
  },
  parts: [
    {
      id: 'body',
      role: 'body',
      pivot: [200, 128],
      shapes: [
        {
          d: smooth([
            [340, 148],
            [330, 138],
            [336, 114],
            [326, 80],
            [300, 54],
            [262, 44],
            [226, 52],
            [196, 64],
            [150, 74],
            [110, 92],
            [78, 114],
            [60, 130],
            [74, 146],
            [110, 166],
            [160, 182],
            [214, 190],
            [264, 186],
            [300, 174],
            [326, 160],
          ]),
          fill: 'skin',
        },
        {
          d:
            smooth(
              [
                [344, 156],
                [310, 170],
                [262, 178],
                [210, 178],
                [160, 170],
                [116, 154],
                [80, 138],
                [56, 130],
              ],
              false,
            ) + 'L56 210L340 210Z',
          kind: 'detail',
          fill: 'shade',
        },
        { d: ellipse(300, 74, 26, 14, -30), kind: 'detail', fill: 'glow' },
        { d: curve(296, 148, 336, 151, 9), kind: 'line', stroke: 'mouthLine', width: 2.8 },
        { d: curve(297, 148, 291, 141, 2), kind: 'line', stroke: 'mouthLine', width: 2.6 },
        { d: ellipse(287, 154, 10.5, 6.5), kind: 'feature', fill: 'blush', opacity: 0.55 },
        { d: circle(280, 124, 11), kind: 'feature', fill: 'eye' },
        { d: circle(284.2, 119.4, 4.2), kind: 'feature', fill: 'shine' },
      ],
      children: [
        {
          id: 'tail',
          role: 'tail',
          behind: true,
          pivot: [72, 130],
          shapes: [
            {
              d: smooth([
                [84, 122],
                [58, 118],
                [36, 102],
                [20, 82],
                [8, 80],
                [4, 96],
                [12, 114],
                [30, 130],
                [12, 146],
                [4, 164],
                [8, 180],
                [20, 178],
                [36, 158],
                [58, 142],
                [84, 140],
              ]),
              fill: 'skin',
            },
            { d: ellipse(22, 172, 18, 14, -40), kind: 'detail', fill: 'shade' },
          ],
        },
        {
          id: 'flipperFar',
          role: 'finF',
          behind: true,
          pivot: [256, 172],
          shapes: [
            {
              d: smooth([
                [244, 170],
                [268, 172],
                [266, 188],
                [252, 202],
                [234, 208],
                [228, 198],
                [236, 184],
              ]),
              fill: 'shadeDark',
            },
          ],
        },
        {
          id: 'flipper',
          role: 'finN',
          pivot: [226, 178],
          shapes: [
            {
              d: smooth([
                [210, 174],
                [238, 178],
                [234, 194],
                [218, 208],
                [196, 214],
                [184, 210],
                [190, 196],
                [200, 184],
              ]),
              fill: 'skin',
            },
          ],
        },
      ],
    },
  ],
};

export default beluga;
