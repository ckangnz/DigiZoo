import { capsule, circle, ellipse, smooth, type Pt } from '../core/paths';
import type { AnimalDef, PartNode } from '../core/types';

const CX = 115;
const GROUND = 300;

const leg = (id: string, x: number, far: boolean): PartNode => ({
  id,
  role: id,
  behind: true,
  pivot: [x, 236],
  shapes: [
    { d: capsule(x, 234, x + 1, 276, 11, 10), fill: far ? 'pantsDark' : 'pants' },
    {
      d: smooth([
        [x - 11, 280],
        [x + 6, 276],
        [x + 22, 280],
        [x + 25, 290],
        [x + 10, GROUND],
        [x - 8, GROUND - 1],
        [x - 14, 291],
      ]),
      fill: far ? 'shoeDark' : 'shoe',
    },
  ],
});

const arm = (id: string, x: number, dir: 1 | -1, far: boolean): PartNode => ({
  id,
  role: id,
  behind: far,
  pivot: [x, 162],
  shapes: [
    { d: capsule(x, 162, x + dir * 8, 210, 11, 9.5), fill: far ? 'suitDark' : 'suit' },
    { d: circle(x + dir * 9, 218, 10), fill: far ? 'skinDark' : 'skin' },
  ],
});

const CAPE: Pt[] = [
  [CX, 146],
  [CX + 40, 150],
  [CX + 62, 196],
  [CX + 78, 252],
  [CX + 56, 246],
  [CX + 40, 262],
  [CX + 20, 250],
  [CX, 262],
  [CX - 20, 250],
  [CX - 40, 262],
  [CX - 56, 246],
  [CX - 78, 252],
  [CX - 62, 196],
  [CX - 40, 150],
];

const COLLAR = (side: 1 | -1): Pt[] => [
  [CX + side * 16, 152],
  [CX + side * 40, 146],
  [CX + side * 72, 112],
  [CX + side * 80, 128],
  [CX + side * 62, 158],
  [CX + side * 30, 170],
];

const HAIR: Pt[] = [
  [CX, 30],
  [CX + 44, 40],
  [CX + 64, 74],
  [CX + 62, 106],
  [CX + 54, 106],
  [CX + 50, 82],
  [CX + 30, 72],
  [CX + 10, 70],
  [CX, 84],
  [CX - 10, 70],
  [CX - 30, 72],
  [CX - 50, 82],
  [CX - 54, 106],
  [CX - 62, 106],
  [CX - 64, 74],
  [CX - 44, 40],
];

const vampire: AnimalDef = {
  id: 'vampire',
  name: 'Vampire',
  kind: 'character',
  aliases: ['dracula', 'count dracula', 'little vampire', 'vampy', 'cape kid'],
  group: 'spooky',
  habitats: ['halloween'],
  box: [230, GROUND],
  size: 230,
  locomotion: 'walk2',
  gait: { stride: 64, swing: 22 },
  sound: 'vampire',
  palette: {
    skin: '#fde3d6',
    skinDark: '#f1c9b8',
    hair: '#3b2f55',
    hairShine: '#5c4c84',
    cape: '#3d2f5c',
    capeDark: '#30254a',
    lining: '#ee5a6e',
    suit: '#4d3e74',
    suitDark: '#3d3060',
    shirt: '#ffffff',
    bow: '#ee5a6e',
    pants: '#3d2f5c',
    pantsDark: '#30254a',
    shoe: '#2c2342',
    shoeDark: '#231b36',
    fang: '#ffffff',
  },
  parts: [
    {
      id: 'body',
      role: 'body',
      pivot: [CX, 236],
      shapes: [
        {
          d: smooth([
            [CX, 148],
            [CX + 30, 152],
            [CX + 34, 196],
            [CX + 32, 240],
            [CX, 244],
            [CX - 32, 240],
            [CX - 34, 196],
            [CX - 30, 152],
          ]),
          fill: 'suit',
        },
        {
          d: smooth([
            [CX - 16, 150],
            [CX + 16, 150],
            [CX + 6, 196],
            [CX, 202],
            [CX - 6, 196],
          ]),
          kind: 'detail',
          fill: 'shirt',
        },
        { d: circle(CX, 180, 3), kind: 'feature', fill: 'cape' },
        { d: circle(CX, 191, 3), kind: 'feature', fill: 'cape' },
      ],
      children: [
        {
          id: 'cape',
          role: 'tail',
          behind: true,
          pivot: [CX, 150],
          motion: { rotate: 3, phase: 0.25 },
          shapes: [
            { d: smooth(CAPE), fill: 'cape' },
            {
              d: smooth([
                [CX - 40, 168],
                [CX + 40, 168],
                [CX + 58, 240],
                [CX, 262],
                [CX - 58, 240],
              ]),
              kind: 'detail',
              fill: 'lining',
            },
          ],
        },
        leg('legF', CX - 14, true),
        arm('armF', CX - 32, -1, true),
        leg('legN', CX + 13, false),
        {
          id: 'head',
          role: 'head',
          pivot: [CX, 150],
          shapes: [
            {
              d: smooth([
                [CX - 54, 100],
                [CX - 78, 90],
                [CX - 58, 124],
              ]),
              fill: 'skin',
            },
            {
              d: smooth([
                [CX + 54, 100],
                [CX + 78, 90],
                [CX + 58, 124],
              ]),
              fill: 'skin',
            },
            { d: ellipse(CX, 96, 60, 58), fill: 'skin' },
            { d: ellipse(CX, 96, 58.8, 56.8), kind: 'feature', fill: 'skin' },
            { d: ellipse(CX - 38, 122, 10, 6), kind: 'feature', fill: 'blush', opacity: 0.6 },
            { d: ellipse(CX + 38, 122, 10, 6), kind: 'feature', fill: 'blush', opacity: 0.6 },
            { d: circle(CX - 21, 104, 10), kind: 'feature', fill: 'eye' },
            { d: circle(CX + 21, 104, 10), kind: 'feature', fill: 'eye' },
            { d: circle(CX - 17.2, 100, 3.8), kind: 'feature', fill: 'shine' },
            { d: circle(CX + 24.8, 100, 3.8), kind: 'feature', fill: 'shine' },
            {
              d: `M${CX - 15} 124Q${CX} 128 ${CX + 15} 124Q${CX + 14} 142 ${CX} 142Q${CX - 14} 142 ${CX - 15} 124Z`,
              kind: 'feature',
              fill: 'mouth',
            },
            { d: ellipse(CX, 137.5, 7.5, 3.8), kind: 'feature', fill: 'tongue' },
            {
              d: `M${CX - 11} 125.2L${CX - 5} 126.4L${CX - 8.4} 132.5Z`,
              kind: 'feature',
              fill: 'fang',
            },
            {
              d: `M${CX + 11} 125.2L${CX + 5} 126.4L${CX + 8.4} 132.5Z`,
              kind: 'feature',
              fill: 'fang',
            },
          ],
          children: [
            {
              id: 'hair',
              pivot: [CX, 70],
              shapes: [
                { d: smooth(HAIR), fill: 'hair' },
                { d: ellipse(CX - 28, 50, 15, 6.5, -24), kind: 'detail', fill: 'hairShine' },
              ],
            },
            {
              id: 'collarL',
              behind: true,
              pivot: [CX, 150],
              shapes: [
                { d: smooth(COLLAR(-1)), fill: 'cape' },
                {
                  d: smooth([
                    [CX - 30, 156],
                    [CX - 44, 150],
                    [CX - 70, 120],
                    [CX - 60, 152],
                  ]),
                  kind: 'detail',
                  fill: 'lining',
                },
              ],
            },
            {
              id: 'collarR',
              behind: true,
              pivot: [CX, 150],
              shapes: [
                { d: smooth(COLLAR(1)), fill: 'cape' },
                {
                  d: smooth([
                    [CX + 30, 156],
                    [CX + 44, 150],
                    [CX + 70, 120],
                    [CX + 60, 152],
                  ]),
                  kind: 'detail',
                  fill: 'lining',
                },
              ],
            },
          ],
        },
        {
          id: 'bow',
          pivot: [CX, 162],
          shapes: [
            {
              d: smooth([
                [CX, 162],
                [CX - 17, 152],
                [CX - 19, 172],
              ]),
              fill: 'bow',
            },
            {
              d: smooth([
                [CX, 162],
                [CX + 17, 152],
                [CX + 19, 172],
              ]),
              fill: 'bow',
            },
            { d: circle(CX, 162, 5.5), fill: 'bow' },
          ],
        },
        arm('armN', CX + 32, 1, false),
      ],
    },
  ],
};

export default vampire;
