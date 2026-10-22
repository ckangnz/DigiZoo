import {
  circle,
  curve,
  ellipse,
  leaf,
  mirrorPath,
  smooth,
  translatePath,
  type Pt,
} from '../core/paths';
import type { AnimalDef, PartNode, Shape } from '../core/types';

const W = 320;
const CX = W / 2;

const WING: Pt[] = [
  [0, -18],
  [30, -34],
  [64, -36],
  [94, -26],
  [112, -10],
  [98, 0],
  [106, 14],
  [88, 16],
  [92, 31],
  [72, 30],
  [46, 28],
  [20, 22],
  [-2, 14],
];

const wing = (id: string, side: 1 | -1): PartNode => {
  const sx = CX + side * 52;
  const sy = 124;
  const place = (d: string) => {
    const moved = translatePath(d, sx, sy);
    return side === 1 ? moved : mirrorPath(translatePath(d, CX + 52, sy), CX);
  };
  const shapes: Shape[] = [
    { d: place(smooth(WING)), fill: 'wing' },
    {
      d: place(
        smooth([
          [0, -16],
          [30, -30],
          [62, -32],
          [76, -14],
          [52, -4],
          [22, -2],
          [0, 0],
        ]),
      ),
      kind: 'detail',
      fill: 'wingLight',
    },
    { d: place(curve(64, -2, 94, 4, -3)), kind: 'line', stroke: 'wingLine', width: 2.4 },
    { d: place(curve(56, 10, 82, 18, -3)), kind: 'line', stroke: 'wingLine', width: 2.4 },
  ];
  return {
    id,
    role: side === 1 ? 'wingN' : 'wingF',
    behind: true,
    pivot: [sx, sy],
    motion: { rotate: side * 26 },
    shapes,
  };
};

const eyeLid = (id: string, x: number, y: number): PartNode => ({
  id,
  role: 'lid',
  pivot: [x, y - 19],
  shapes: [
    { d: circle(x, y, 19), kind: 'feature', fill: 'ring' },
    { d: circle(x + 0.5, y + 1, 14), kind: 'feature', fill: 'eye' },
    { d: circle(x + 5.2, y - 4.4, 5.2), kind: 'feature', fill: 'shine' },
    { d: circle(x - 4, y + 6, 2.2), kind: 'feature', fill: 'shine' },
  ],
});

const chevron = (x: number, y: number): Shape => ({
  d: `M${x - 6} ${y - 3}Q${x} ${y + 4} ${x + 6} ${y - 3}`,
  kind: 'line',
  stroke: 'chevron',
  width: 2.6,
});

const owl: AnimalDef = {
  id: 'owl',
  name: 'Owl',
  aliases: ['owlet', 'hoot', 'hooty', 'night owl', 'bird'],
  group: 'bird',
  habitats: ['halloween', 'birds', 'forest'],
  box: [W, 236],
  size: 130,
  locomotion: 'fly',
  sound: 'owl',
  palette: {
    plum: '#8f6a80',
    wing: '#755467',
    wingLight: '#8f6a80',
    wingLine: '#5e4153',
    disc: '#f7e8d8',
    discEdge: '#e6cdb6',
    belly: '#f1dac2',
    chevron: '#c9a18a',
    ring: '#ffcf5a',
    beak: '#ffad3b',
    feet: '#ffad3b',
    blush: '#ff8fae',
  },
  parts: [
    {
      id: 'body',
      pivot: [CX, 130],
      shapes: [
        { d: leaf(CX - 38, 70, 44, 13, -120), fill: 'plum' },
        { d: leaf(CX + 38, 70, 44, 13, -60), fill: 'plum' },
        {
          d: smooth([
            [CX, 46],
            [CX + 46, 54],
            [CX + 68, 92],
            [CX + 72, 144],
            [CX + 58, 186],
            [CX, 206],
            [CX - 58, 186],
            [CX - 72, 144],
            [CX - 68, 92],
            [CX - 46, 54],
          ]),
          fill: 'plum',
        },
        { d: ellipse(CX, 160, 42, 40), kind: 'detail', fill: 'belly' },
        { d: circle(CX - 23, 104, 33), kind: 'detail', fill: 'discEdge' },
        { d: circle(CX + 23, 104, 33), kind: 'detail', fill: 'discEdge' },
        { d: circle(CX - 23, 104, 29.5), kind: 'detail', fill: 'disc' },
        { d: circle(CX + 23, 104, 29.5), kind: 'detail', fill: 'disc' },
        chevron(CX - 16, 156),
        chevron(CX + 16, 156),
        chevron(CX, 170),
        chevron(CX - 22, 180),
        chevron(CX + 22, 180),
        { d: ellipse(CX - 46, 132, 9, 5.5), kind: 'feature', fill: 'blush', opacity: 0.55 },
        { d: ellipse(CX + 46, 132, 9, 5.5), kind: 'feature', fill: 'blush', opacity: 0.55 },
        {
          d: `M${CX - 8} 122Q${CX} 118 ${CX + 8} 122Q${CX + 4} 134 ${CX} 138Q${CX - 4} 134 ${CX - 8} 122Z`,
          kind: 'feature',
          fill: 'beak',
          stroke: 'auto',
        },
      ],
      children: [
        wing('wingF', -1),
        wing('wingN', 1),
        {
          id: 'feet',
          behind: true,
          pivot: [CX, 200],
          shapes: [
            { d: ellipse(CX - 16, 206, 9, 6), fill: 'feet' },
            { d: ellipse(CX + 16, 206, 9, 6), fill: 'feet' },
          ],
        },
        eyeLid('eyeL', CX - 23, 104),
        eyeLid('eyeR', CX + 23, 104),
      ],
    },
  ],
};

export default owl;
