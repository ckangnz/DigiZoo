import { capsule, circle, ellipse, smooth, tube, translatePath, type Pt } from '../core/paths';
import type { AnimalDef, PartNode } from '../core/types';

const leg = (id: string, role: string, x: number, far: boolean): PartNode => ({
  id,
  role,
  behind: true,
  pivot: [x, 238],
  shapes: [
    { d: capsule(x, 238, x + 2, 278, 12, 10), fill: far ? 'furDark' : 'fur' },
    { d: ellipse(x + 10, 286, 16, 8.5), fill: far ? 'skinDark' : 'skin' },
  ],
});

const arm = (id: string, role: string, x: number, dir: number, far: boolean): PartNode => ({
  id,
  role,
  behind: far,
  pivot: [x, 166],
  shapes: [
    { d: capsule(x, 166, x + dir * 8, 222, 10.5, 8.5), fill: far ? 'furDark' : 'fur' },
    { d: circle(x + dir * 9, 230, 10), fill: far ? 'skinDark' : 'skin' },
  ],
});

const TAIL: Pt[] = [
  [106, 232],
  [78, 240],
  [52, 232],
  [36, 210],
  [34, 184],
  [46, 164],
  [66, 158],
  [80, 170],
  [76, 188],
  [60, 190],
  [54, 178],
];

const offset = (parts: PartNode[], dx: number, dy: number): PartNode[] =>
  parts.map((p): PartNode => ({
    ...p,
    pivot: p.pivot && [p.pivot[0] + dx, p.pivot[1] + dy],
    shapes: p.shapes?.map((s) => ({ ...s, d: translatePath(s.d, dx, dy) })),
    children: p.children && offset(p.children, dx, dy),
  }));

const monkey: AnimalDef = {
  id: 'monkey',
  name: 'Monkey',
  aliases: ['chimp', 'cheeky monkey', 'chimpanzee', 'ape'],
  group: 'mammal',
  habitats: ['jungle', 'rainforest'],
  box: [229, 292],
  size: 150,
  locomotion: 'walk2',
  gait: { stride: 80 },
  sound: 'monkey',
  palette: {
    fur: '#9a6239',
    furDark: '#7c4c2b',
    skin: '#f6c99b',
    skinDark: '#dfab7c',
    belly: '#f3c193',
  },
  parts: offset(
    [
      {
        id: 'body',
        role: 'body',
        pivot: [136, 240],
        shapes: [
          {
            d: smooth([
              [122, 148],
              [156, 148],
              [174, 172],
              [178, 204],
              [170, 232],
              [148, 248],
              [122, 248],
              [102, 232],
              [96, 204],
              [102, 172],
            ]),
            fill: 'fur',
          },
          { d: ellipse(142, 206, 26, 34), kind: 'detail', fill: 'belly' },
        ],
        children: [
          {
            id: 'tail',
            role: 'tail',
            behind: true,
            pivot: [106, 232],
            shapes: [{ d: tube(TAIL, (t) => 7.5 - 2.5 * t, 90), fill: 'fur' }],
          },
          leg('legF', 'legF', 124, true),
          arm('armF', 'armF', 106, -1, true),
          leg('legN', 'legN', 150, false),
          {
            id: 'head',
            role: 'head',
            pivot: [146, 150],
            shapes: [
              { d: 'M138 44C136 26 150 14 170 18C158 22 154 32 158 44Z', fill: 'fur' },
              { d: circle(90, 100, 21), fill: 'fur' },
              { d: circle(210, 100, 21), fill: 'fur' },
              { d: ellipse(150, 94, 64, 60), fill: 'fur' },
              { d: circle(90, 100, 12.5), kind: 'detail', fill: 'skin' },
              { d: circle(210, 100, 12.5), kind: 'detail', fill: 'skin' },
              { d: ellipse(137, 88, 23, 25, 12), kind: 'detail', fill: 'skin' },
              { d: ellipse(173, 88, 23, 25, -12), kind: 'detail', fill: 'skin' },
              { d: ellipse(155, 122, 40, 28), kind: 'detail', fill: 'skin' },
              { d: ellipse(124, 118, 8, 5), kind: 'feature', fill: 'blush', opacity: 0.5 },
              { d: ellipse(186, 118, 8, 5), kind: 'feature', fill: 'blush', opacity: 0.5 },
              { d: circle(139, 90, 8.5), kind: 'feature', fill: 'eye' },
              { d: circle(171, 90, 8.5), kind: 'feature', fill: 'eye' },
              { d: circle(142.2, 86.4, 3.2), kind: 'feature', fill: 'shine' },
              { d: circle(174.2, 86.4, 3.2), kind: 'feature', fill: 'shine' },
              { d: circle(150, 112, 2.4), kind: 'feature', fill: 'nose' },
              { d: circle(160, 112, 2.4), kind: 'feature', fill: 'nose' },
              { d: 'M139 124Q155 138 171 124', kind: 'line', stroke: 'mouth', width: 3 },
            ],
          },
          arm('armN', 'armN', 162, 1, false),
        ],
      },
    ],
    -14,
    -5,
  ),
};

export default monkey;
