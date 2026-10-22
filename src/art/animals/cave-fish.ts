import { circle, curve, ellipse, leaf, smooth, type Pt } from '../core/paths';
import type { AnimalDef, Shape } from '../core/types';

const BODY: Pt[] = [
  [268, 106],
  [260, 82],
  [238, 62],
  [202, 50],
  [162, 49],
  [126, 56],
  [98, 72],
  [80, 90],
  [74, 106],
  [82, 122],
  [102, 136],
  [136, 148],
  [176, 152],
  [214, 146],
  [244, 132],
  [262, 120],
];

const SHIMMER: [number, number, number][] = [
  [186, 80, 3],
  [164, 92, 2.6],
  [142, 80, 2.8],
  [120, 96, 2.4],
  [200, 100, 2.4],
  [150, 108, 2.2],
];

const rays = (pts: [number, number, number, number][]): Shape[] =>
  pts.map(([x1, y1, x2, y2]) => ({
    d: `M${x1} ${y1}L${x2} ${y2}`,
    kind: 'line',
    stroke: 'ray',
    width: 2,
  }));

const caveFish: AnimalDef = {
  id: 'cave-fish',
  name: 'Cave Fish',
  kind: 'animal',
  aliases: ['cavefish', 'blind cave fish', 'blind fish', 'mexican tetra'],
  group: 'fish',
  habitats: ['cave'],
  box: [300, 200],
  size: 70,
  locomotion: 'swim',
  sound: 'cave-fish',
  palette: {
    body: '#ffd9df',
    back: '#f8c2cf',
    belly: '#fff3f1',
    fin: '#f8aebf',
    finLight: '#ffd0da',
    ray: '#ec92aa',
    shimmer: '#ffffff',
    sheen: '#fdeef2',
    cheek: '#ff8ea6',
  },
  parts: [
    {
      id: 'body',
      role: 'body',
      pivot: [170, 102],
      shapes: [
        { d: smooth(BODY), fill: 'body' },
        {
          d:
            smooth(
              [
                [70, 98],
                [104, 76],
                [146, 64],
                [196, 62],
                [236, 72],
                [272, 92],
              ],
              false,
            ) + 'L280 20L60 20Z',
          kind: 'detail',
          fill: 'back',
        },
        {
          d:
            smooth(
              [
                [276, 112],
                [244, 124],
                [204, 132],
                [160, 132],
                [118, 124],
                [80, 110],
              ],
              false,
            ) + 'L80 190L276 190Z',
          kind: 'detail',
          fill: 'belly',
        },
        ...SHIMMER.map(([x, y, r]): Shape => ({
          d: circle(x, y, r),
          kind: 'detail',
          fill: 'shimmer',
        })),
        { d: ellipse(212, 60, 20, 5, -12), kind: 'detail', fill: 'sheen' },
        { d: 'M214 74Q204 100 214 128', kind: 'line', stroke: 'ray', width: 2.6 },
        { d: ellipse(236, 112, 9, 5.5), kind: 'feature', fill: 'cheek', opacity: 0.6 },
        { d: curve(222, 91, 245, 91, -8), kind: 'line', stroke: 'eye', width: 3.4 },
        { d: 'M256 116Q262 121 268 114', kind: 'line', stroke: 'mouth', width: 2.8 },
      ],
      children: [
        {
          id: 'tail',
          role: 'tail',
          behind: true,
          pivot: [86, 104],
          shapes: [
            {
              d: 'M92 96C74 84 52 66 34 54C22 46 12 54 16 66C22 80 34 94 40 104C34 114 22 128 16 142C12 154 22 162 34 154C52 142 74 124 92 112Z',
              fill: 'fin',
            },
            { d: leaf(84, 100, 54, 8, -146), kind: 'detail', fill: 'finLight' },
            { d: leaf(84, 108, 54, 8, 146), kind: 'detail', fill: 'finLight' },
            ...rays([
              [70, 94, 36, 64],
              [70, 114, 36, 144],
            ]),
          ],
        },
        {
          id: 'finTop',
          role: 'finTop',
          behind: true,
          pivot: [168, 52],
          shapes: [
            {
              d: 'M140 58C146 38 160 22 176 18C186 16 190 24 186 32C182 42 186 50 198 54Z',
              fill: 'fin',
            },
            ...rays([
              [158, 50, 170, 26],
              [174, 50, 180, 28],
            ]),
          ],
        },
        {
          id: 'adipose',
          behind: true,
          pivot: [104, 70],
          motion: { rotate: 6, phase: 0.4 },
          shapes: [{ d: ellipse(102, 66, 9, 6, -30), fill: 'fin' }],
        },
        {
          id: 'finBottom',
          role: 'finF',
          behind: true,
          pivot: [130, 144],
          shapes: [
            {
              d: 'M104 136C102 156 112 172 128 178C140 182 146 174 140 166C136 158 142 150 154 146Z',
              fill: 'fin',
            },
            ...rays([[122, 146, 128, 170]]),
          ],
        },
        {
          id: 'finSide',
          role: 'finN',
          pivot: [212, 128],
          shapes: [
            { d: leaf(214, 127, 42, 11, 164), fill: 'fin' },
            { d: leaf(208, 129, 22, 5, 164), kind: 'detail', fill: 'finLight' },
          ],
        },
      ],
    },
  ],
};

export default caveFish;
