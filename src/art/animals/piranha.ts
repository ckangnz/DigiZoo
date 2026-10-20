import { circle, ellipse, leaf, smooth, type Pt } from '../core/paths';
import type { AnimalDef, Shape } from '../core/types';

const tooth = (x: number, y: number, h: number): Shape => ({
  d: `M${x - 3.8} ${y}Q${x - 2.8} ${y - h} ${x} ${y - h}Q${x + 2.8} ${y - h} ${x + 3.8} ${y}Z`,
  kind: 'feature',
  fill: 'white',
  stroke: 'auto',
  width: 1.4,
});

const SPARKLES: [number, number, number][] = [
  [196, 84, 3.4],
  [174, 100, 3],
  [150, 86, 3.2],
  [128, 104, 2.8],
  [208, 110, 2.6],
  [160, 120, 2.6],
  [112, 86, 2.6],
];

const BODY: Pt[] = [
  [252, 72],
  [268, 94],
  [272, 110],
  [288, 122],
  [280, 142],
  [250, 164],
  [202, 182],
  [152, 182],
  [108, 166],
  [80, 136],
  [74, 108],
  [92, 76],
  [134, 50],
  [184, 40],
  [226, 48],
];

const piranha: AnimalDef = {
  id: 'piranha',
  name: 'Piranha',
  kind: 'animal',
  aliases: ['red-bellied piranha', 'piranha fish', 'pirana', 'fish'],
  group: 'fish',
  habitats: ['rainforest'],
  box: [300, 220],
  size: 80,
  locomotion: 'swim',
  gait: { period: 0.9 },
  sound: 'piranha',
  palette: {
    body: '#aab7c6',
    back: '#8d9bb0',
    belly: '#ff7444',
    bellyLight: '#ffa071',
    fin: '#f9643a',
    finDark: '#d84c2c',
    tailFin: '#97a6b8',
    tailEdge: '#5f6b7d',
    sparkle: '#e8f0f8',
    eyeRing: '#ffad5c',
    gill: '#7f8da2',
  },
  parts: [
    {
      id: 'body',
      role: 'body',
      pivot: [176, 112],
      shapes: [
        { d: smooth(BODY), fill: 'body' },
        {
          d:
            smooth(
              [
                [70, 96],
                [110, 70],
                [160, 58],
                [210, 60],
                [250, 74],
                [280, 92],
              ],
              false,
            ) + 'L290 20L60 20Z',
          kind: 'detail',
          fill: 'back',
        },
        {
          d:
            smooth(
              [
                [290, 122],
                [262, 132],
                [228, 140],
                [186, 146],
                [146, 146],
                [108, 140],
                [80, 130],
              ],
              false,
            ) + 'L80 200L290 200Z',
          kind: 'detail',
          fill: 'belly',
        },
        { d: ellipse(214, 160, 26, 8, -18), kind: 'detail', fill: 'bellyLight' },
        ...SPARKLES.map(([x, y, r]): Shape => ({
          d: circle(x, y, r),
          kind: 'detail',
          fill: 'sparkle',
        })),
        { d: 'M222 80Q212 104 220 132', kind: 'line', stroke: 'gill', width: 3 },
        { d: ellipse(232, 121, 9, 5.5), kind: 'feature', fill: 'blush', opacity: 0.75 },
        { d: circle(240, 96, 15), kind: 'feature', fill: 'eyeRing' },
        { d: circle(241, 96, 12), kind: 'feature', fill: 'eye' },
        { d: circle(245.4, 91, 4.4), kind: 'feature', fill: 'shine' },
        { d: circle(237.4, 100.4, 1.8), kind: 'feature', fill: 'shine' },
        tooth(276, 124.5, 7.5),
        tooth(267, 126.5, 7),
        tooth(258, 126.5, 6),
        { d: 'M286 120Q268 133 248 123', kind: 'line', stroke: 'mouth', width: 3 },
      ],
      children: [
        {
          id: 'tail',
          role: 'tail',
          behind: true,
          pivot: [84, 112],
          shapes: [
            {
              d: 'M92 104C70 88 46 64 30 54C20 48 12 56 16 66C24 86 32 100 34 112C32 124 24 138 16 158C12 168 20 176 30 170C46 160 70 136 92 120Z',
              fill: 'tailFin',
            },
            { d: ellipse(20, 112, 14, 70), kind: 'detail', fill: 'tailEdge' },
          ],
        },
        {
          id: 'finTop',
          role: 'finTop',
          behind: true,
          pivot: [160, 50],
          shapes: [
            {
              d: 'M130 56C136 34 152 18 170 14C180 12 184 20 180 28C176 38 180 48 192 52Z',
              fill: 'tailFin',
            },
            { d: ellipse(164, 16, 22, 7, -18), kind: 'detail', fill: 'tailEdge' },
          ],
        },
        {
          id: 'adipose',
          behind: true,
          pivot: [100, 74],
          motion: { rotate: 6, phase: 0.4 },
          shapes: [{ d: ellipse(98, 70, 9, 6, -30), fill: 'tailFin' }],
        },
        {
          id: 'finBottom',
          role: 'finF',
          behind: true,
          pivot: [128, 168],
          shapes: [
            {
              d: 'M104 160C104 180 116 196 132 200C142 202 146 194 140 186C136 178 140 170 150 166Z',
              fill: 'fin',
            },
            { d: ellipse(134, 198, 14, 5, 20), kind: 'detail', fill: 'finDark' },
          ],
        },
        {
          id: 'finSide',
          role: 'finN',
          pivot: [214, 144],
          shapes: [
            { d: leaf(216, 143, 44, 12, 162), fill: 'fin' },
            { d: leaf(190, 151, 18, 6, 162), kind: 'detail', fill: 'finDark' },
          ],
        },
      ],
    },
  ],
};

export default piranha;
