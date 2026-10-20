import { capsule, circle, curve, ellipse, roundRect, smooth, spiky } from '../core/paths';
import type { AnimalDef } from '../core/types';

const astronaut: AnimalDef = {
  id: 'astronaut',
  name: 'Astronaut',
  kind: 'character',
  aliases: ['spaceman', 'spacewoman', 'space man', 'cosmonaut', 'space explorer', 'spacesuit'],
  group: 'space',
  habitats: ['space'],
  box: [292, 302],
  size: 200,
  locomotion: 'float',
  gait: { period: 2.4 },
  sound: 'astronaut',
  palette: {
    suit: '#f6f5fb',
    shade: '#dddbe9',
    trim: '#6f9df0',
    glass: '#aadcff',
    skin: '#f8cfab',
    hair: '#704634',
    panel: '#c9d6ee',
    flag: '#4fcfc2',
    star: '#ffd447',
    pole: '#a2a7ba',
  },
  parts: [
    {
      id: 'body',
      role: 'body',
      pivot: [140, 200],
      shapes: [
        {
          d: smooth([
            [86, 156],
            [194, 156],
            [206, 198],
            [202, 238],
            [178, 256],
            [102, 256],
            [78, 238],
            [74, 198],
          ]),
          fill: 'suit',
        },
        { d: roundRect(114, 180, 52, 32, 8), kind: 'detail', fill: 'panel' },
        { d: 'M60 228Q140 246 220 228L220 240Q140 258 60 240Z', kind: 'detail', fill: 'trim' },
        { d: circle(127, 196, 4.6), kind: 'feature', fill: '#ff6f6a', stroke: 'auto', width: 1.4 },
        { d: circle(140, 196, 4.6), kind: 'feature', fill: '#5d8ff0', stroke: 'auto', width: 1.4 },
        { d: circle(153, 196, 4.6), kind: 'feature', fill: '#ffd447', stroke: 'auto', width: 1.4 },
      ],
      children: [
        {
          id: 'pack',
          behind: true,
          shapes: [{ d: roundRect(64, 140, 152, 100, 26), fill: 'shade' }],
        },
        {
          id: 'legL',
          role: 'legN',
          behind: true,
          pivot: [114, 238],
          shapes: [
            { d: capsule(114, 236, 110, 274, 19, 18), fill: 'suit' },
            { d: ellipse(106, 284, 23, 14), fill: 'trim' },
          ],
        },
        {
          id: 'legR',
          role: 'legF',
          behind: true,
          pivot: [166, 238],
          shapes: [
            { d: capsule(166, 236, 170, 274, 19, 18), fill: 'suit' },
            { d: ellipse(174, 284, 23, 14), fill: 'trim' },
          ],
        },
        {
          id: 'armL',
          role: 'armN',
          pivot: [90, 172],
          shapes: [
            { d: capsule(90, 172, 62, 220, 18, 15.5), fill: 'suit' },
            { d: ellipse(66, 213, 19, 5.5, 30), kind: 'detail', fill: 'trim' },
            { d: circle(56, 230, 15), fill: 'trim' },
          ],
        },
        {
          id: 'armR',
          role: 'armF',
          phase: 0.5,
          pivot: [190, 172],
          shapes: [
            { d: capsule(190, 172, 224, 136, 18, 15.5), fill: 'suit' },
            { d: ellipse(219, 141, 19, 5.5, 43), kind: 'detail', fill: 'trim' },
          ],
          children: [
            {
              id: 'flag',
              behind: true,
              shapes: [
                { d: capsule(236, 152, 236, 44, 3.6, 3.6), fill: 'pole' },
                {
                  d: 'M238 46C254 48 270 56 286 63C270 70 254 78 238 82Q234 64 238 46Z',
                  fill: 'flag',
                },
                { d: spiky(255, 64, 9, 4, 5, -90, 0.35), kind: 'detail', fill: 'star' },
                { d: circle(236, 42, 5.5), fill: 'star' },
              ],
            },
            {
              id: 'gloveR',
              shapes: [{ d: circle(232, 128, 15), fill: 'trim' }],
            },
          ],
        },
        {
          id: 'helmet',
          role: 'head',
          pivot: [140, 156],
          shapes: [
            { d: circle(66, 100, 11), fill: 'shade' },
            { d: circle(214, 100, 11), fill: 'shade' },
            { d: circle(140, 96, 72), fill: 'suit' },
          ],
          children: [
            {
              id: 'visor',
              shapes: [
                { d: ellipse(140, 101, 56, 50), fill: 'glass' },
                { d: ellipse(140, 104, 43, 39), kind: 'detail', fill: 'skin' },
                {
                  d: smooth([
                    [90, 94],
                    [96, 66],
                    [118, 52],
                    [140, 48],
                    [162, 52],
                    [184, 66],
                    [190, 94],
                    [178, 80],
                    [164, 84],
                    [150, 77],
                    [136, 84],
                    [120, 78],
                    [104, 86],
                  ]),
                  kind: 'detail',
                  fill: 'hair',
                },
                { d: ellipse(110, 124, 8.5, 5), kind: 'feature', fill: 'blush', opacity: 0.55 },
                { d: ellipse(170, 124, 8.5, 5), kind: 'feature', fill: 'blush', opacity: 0.55 },
                { d: curve(133, 124, 147, 124, 5.5), kind: 'line', stroke: 'mouth', width: 2.8 },
                {
                  d: 'M100 104Q100 76 120 62',
                  kind: 'line',
                  stroke: 'white',
                  width: 5,
                  opacity: 0.75,
                },
              ],
              children: [
                {
                  id: 'eyes',
                  role: 'lid',
                  pivot: [140, 110],
                  shapes: [
                    { d: circle(122, 110, 9.5), kind: 'feature', fill: 'eye' },
                    { d: circle(158, 110, 9.5), kind: 'feature', fill: 'eye' },
                    { d: circle(125.5, 106.4, 3.6), kind: 'feature', fill: 'shine' },
                    { d: circle(161.5, 106.4, 3.6), kind: 'feature', fill: 'shine' },
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

export default astronaut;
