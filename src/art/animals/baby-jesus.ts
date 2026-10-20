import { capsule, circle, curve, ellipse, poly, smooth, spiky, type Pt } from '../core/paths';
import type { AnimalDef, PartNode, Shape } from '../core/types';

const HX = 104;
const HY = 84;
const HR = 44;

const plank = (x1: number, y1: number, x2: number, y2: number, fill: string): Shape => ({
  d: capsule(x1, y1, x2, y2, 7),
  fill,
});

const sparkle = (id: string, x: number, y: number, r: number, phase: number): PartNode => ({
  id,
  role: 'sparkle',
  pivot: [x, y],
  phase,
  shapes: [
    {
      d: spiky(x, y, r, r * 0.32, 4, -90, 0.35),
      kind: 'feature',
      fill: 'sparkle',
      stroke: 'auto',
      width: 1.4,
    },
  ],
});

const TROUGH: Pt[] = [
  [40, 116],
  [260, 116],
  [232, 176],
  [68, 176],
];

const STRAW: Pt[] = [
  [34, 122],
  [50, 104],
  [80, 96],
  [150, 98],
  [220, 96],
  [252, 104],
  [268, 122],
  [256, 128],
  [250, 142],
  [238, 129],
  [222, 137],
  [206, 127],
  [190, 141],
  [172, 128],
  [154, 135],
  [136, 128],
  [118, 142],
  [100, 128],
  [82, 138],
  [64, 127],
  [52, 141],
  [44, 128],
];

const SWADDLE: Pt[] = [
  [118, 68],
  [170, 64],
  [214, 68],
  [236, 88],
  [230, 112],
  [200, 122],
  [150, 122],
  [118, 116],
];

const babyJesus: AnimalDef = {
  id: 'baby-jesus',
  name: 'Baby Jesus',
  kind: 'character',
  aliases: ['manger', 'nativity', 'christmas', 'baby in a manger', 'christ child'],
  group: 'bible',
  habitats: ['bible'],
  box: [300, 220],
  size: 150,
  locomotion: 'breathe',
  sound: 'baby-jesus',
  palette: {
    skin: '#c98d63',
    skinDark: '#b77c54',
    hair: '#5c3a22',
    swaddle: '#fcf6ea',
    fold: '#e6dbc6',
    band: '#a9c6ee',
    straw: '#f4cf63',
    strawDark: '#d9a73a',
    wood: '#ad743f',
    woodDark: '#8d5d31',
    woodLine: '#86552b',
    halo: '#f6c843',
    glow: '#fff2c4',
    sparkle: '#ffd95a',
  },
  parts: [
    {
      id: 'manger',
      pivot: [150, 176],
      shapes: [
        { d: poly(TROUGH), fill: 'wood' },
        { d: `M40 136L260 136L258 140L42 140Z`, kind: 'detail', fill: 'woodLine' },
        { d: `M40 156L260 156L258 160L42 160Z`, kind: 'detail', fill: 'woodLine' },
        { d: circle(70, 126, 2.6), kind: 'feature', fill: 'woodDark' },
        { d: circle(230, 126, 2.6), kind: 'feature', fill: 'woodDark' },
        { d: circle(84, 167, 2.6), kind: 'feature', fill: 'woodDark' },
        { d: circle(216, 167, 2.6), kind: 'feature', fill: 'woodDark' },
      ],
      children: [
        {
          id: 'legs',
          behind: true,
          pivot: [150, 176],
          shapes: [
            plank(36, 96, 98, 212, 'woodDark'),
            plank(98, 96, 36, 212, 'wood'),
            plank(264, 96, 202, 212, 'woodDark'),
            plank(202, 96, 264, 212, 'wood'),
          ],
        },
        {
          id: 'glow',
          behind: true,
          pivot: [HX, HY],
          shapes: [
            { d: circle(HX, HY, 62), fill: 'halo' },
            { d: circle(HX, HY, 56), kind: 'detail', fill: 'glow' },
          ],
        },
        {
          id: 'straw',
          pivot: [150, 116],
          shapes: [
            { d: smooth(STRAW, true, 0.7), fill: 'straw' },
            { d: curve(52, 116, 74, 106, -2), kind: 'line', stroke: 'strawDark', width: 2.2 },
            { d: curve(98, 120, 120, 128, 2), kind: 'line', stroke: 'strawDark', width: 2.2 },
            { d: curve(196, 120, 216, 128, 2), kind: 'line', stroke: 'strawDark', width: 2.2 },
            { d: curve(232, 108, 252, 116, 2), kind: 'line', stroke: 'strawDark', width: 2.2 },
          ],
          children: [
            {
              id: 'baby',
              pivot: [160, 110],
              shapes: [
                { d: smooth(SWADDLE), fill: 'swaddle' },
                {
                  d: poly([
                    [178, 50],
                    [196, 50],
                    [176, 140],
                    [158, 140],
                  ]),
                  kind: 'detail',
                  fill: 'band',
                },
                { d: curve(206, 74, 222, 104, -4), kind: 'line', stroke: 'fold', width: 2.4 },
                { d: curve(140, 70, 150, 92, -3), kind: 'line', stroke: 'fold', width: 2.4 },
              ],
              children: [
                {
                  id: 'head',
                  pivot: [HX + 20, HY + 20],
                  shapes: [
                    { d: circle(HX, HY, HR), fill: 'skin' },
                    { d: circle(HX, HY, HR - 1.2), kind: 'feature', fill: 'skin' },
                    {
                      d: ellipse(HX - 26, HY + 13, 7.5, 4.5),
                      kind: 'feature',
                      fill: 'blush',
                      opacity: 0.6,
                    },
                    {
                      d: ellipse(HX + 26, HY + 13, 7.5, 4.5),
                      kind: 'feature',
                      fill: 'blush',
                      opacity: 0.6,
                    },
                    {
                      d: curve(HX - 22, HY + 3, HX - 8, HY + 3, 4),
                      kind: 'line',
                      stroke: 'eye',
                      width: 2.8,
                    },
                    {
                      d: curve(HX + 8, HY + 3, HX + 22, HY + 3, 4),
                      kind: 'line',
                      stroke: 'eye',
                      width: 2.8,
                    },
                    {
                      d: curve(HX - 6, HY + 17, HX + 6, HY + 17, 4),
                      kind: 'line',
                      stroke: 'mouth',
                      width: 2.6,
                    },
                  ],
                  children: [
                    {
                      id: 'hair',
                      pivot: [HX, HY - 30],
                      shapes: [
                        {
                          d: smooth([
                            [HX - 34, HY - 22],
                            [HX - 20, HY - 40],
                            [HX, HY - 45],
                            [HX + 20, HY - 40],
                            [HX + 34, HY - 22],
                            [HX + 16, HY - 30],
                            [HX + 4, HY - 26],
                            [HX - 10, HY - 32],
                          ]),
                          fill: 'hair',
                        },
                      ],
                    },
                  ],
                },
              ],
            },
          ],
        },
        sparkle('sparkle1', 40, 50, 11, 0),
        sparkle('sparkle2', 188, 30, 9, 0.3),
        sparkle('sparkle3', 262, 70, 12, 0.6),
      ],
    },
  ],
};

export default babyJesus;
