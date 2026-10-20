import { capsule, circle, curve, ellipse, smooth } from '../core/paths';
import type { AnimalDef } from '../core/types';

const dolphin: AnimalDef = {
  id: 'dolphin',
  name: 'Dolphin',
  aliases: ['porpoise', 'flipper', 'bottlenose'],
  group: 'mammal',
  habitats: ['ocean'],
  box: [338, 184],
  size: 180,
  locomotion: 'swim',
  sound: 'dolphin',
  palette: {
    skin: '#6ea8d8',
    belly: '#ddeffc',
  },
  parts: [
    {
      id: 'body',
      role: 'body',
      pivot: [190, 100],
      shapes: [
        {
          d: smooth([
            [300, 110],
            [296, 86],
            [276, 62],
            [244, 48],
            [204, 44],
            [164, 48],
            [128, 56],
            [100, 62],
            [80, 66],
            [82, 82],
            [110, 102],
            [148, 128],
            [190, 146],
            [234, 148],
            [272, 142],
            [296, 130],
          ]),
          fill: 'skin',
        },
        { d: capsule(288, 119, 316, 121, 13, 9.5), fill: 'skin' },
        {
          d:
            smooth(
              [
                [332, 123],
                [300, 125],
                [266, 127],
                [226, 125],
                [180, 117],
                [136, 101],
                [100, 85],
                [70, 73],
              ],
              false,
            ) + 'L70 184L332 184Z',
          kind: 'detail',
          fill: 'belly',
        },
        { d: curve(322, 123, 284, 117, -6), kind: 'line', stroke: 'mouth', width: 3 },
        { d: ellipse(262, 113, 9.5, 6), kind: 'feature', fill: 'blush', opacity: 0.5 },
        { d: circle(270, 93, 11), kind: 'feature', fill: 'eye' },
        { d: circle(274, 88.6, 4.2), kind: 'feature', fill: 'shine' },
      ],
      children: [
        {
          id: 'tail',
          role: 'tail',
          behind: true,
          pivot: [84, 75],
          shapes: [
            {
              d: 'M96 69C83 55 61 35 44 21C35 13 24 18 28 27C35 41 42 55 45 66C37 75 26 84 15 94C8 100 13 110 25 107C47 100 74 90 92 86Z',
              fill: 'skin',
            },
          ],
        },
        {
          id: 'finTop',
          role: 'finTop',
          behind: true,
          pivot: [184, 54],
          shapes: [
            {
              d: 'M210 60C204 38 186 20 162 11C154 8 148 14 152 21C162 34 166 46 162 64Z',
              fill: 'skin',
            },
          ],
        },
        {
          id: 'flipper',
          role: 'finN',
          pivot: [230, 128],
          shapes: [
            {
              d: 'M218 124C212 138 202 150 188 160C180 166 186 174 196 170C216 162 232 148 240 130Z',
              fill: 'skin',
            },
          ],
        },
      ],
    },
  ],
};

export default dolphin;
