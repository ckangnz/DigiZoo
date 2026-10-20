import { capsule, circle, ellipse, smooth, tube, translatePath, type Pt } from '../core/paths';
import type { AnimalDef, PartNode } from '../core/types';

const leg = (id: string, role: string, x: number, far: boolean): PartNode => {
  const fill = far ? 'furDark' : 'fur';
  return {
    id,
    role,
    behind: true,
    pivot: [x, 246],
    shapes: [
      { d: capsule(x, 246, x + 3, 278, 14, 9.5), fill },
      { d: ellipse(x + 13, 284, 18, 7.5), fill },
    ],
  };
};

const arm = (id: string, role: string, dx: number, dy: number, far: boolean): PartNode => {
  const fill = far ? 'furDark' : 'fur';
  const [sx, sy] = [126 + dx, 150 + dy];
  return {
    id,
    role,
    behind: far,
    pivot: [sx, sy],
    motion: { rotate: 9, phase: far ? 0 : 0.5 },
    shapes: [
      { d: capsule(sx, sy, sx + 8, sy + 26, 9, 7.5), fill },
      { d: capsule(sx + 8, sy + 26, sx + 24, sy + 18, 7.5, 6.5), fill },
      { d: ellipse(sx + 29, sy + 26, 6.2, 9, -12), fill },
    ],
  };
};

const TAIL: Pt[] = [
  [80, 244],
  [58, 256],
  [40, 270],
  [26, 281],
  [15, 286],
];

const offset = (parts: PartNode[], dx: number, dy: number): PartNode[] =>
  parts.map((p): PartNode => ({
    ...p,
    pivot: p.pivot && [p.pivot[0] + dx, p.pivot[1] + dy],
    shapes: p.shapes?.map((s) => ({ ...s, d: translatePath(s.d, dx, dy) })),
    children: p.children && offset(p.children, dx, dy),
  }));

const meerkat: AnimalDef = {
  id: 'meerkat',
  name: 'Meerkat',
  aliases: ['suricate', 'meer cat'],
  group: 'mammal',
  habitats: ['safari', 'desert'],
  box: [188, 283],
  size: 110,
  locomotion: 'walk2',
  gait: { stride: 66 },
  sound: 'meerkat',
  palette: {
    fur: '#e3b77b',
    furDark: '#c99659',
    belly: '#f6dfb5',
    patch: '#7a5236',
    ear: '#8a5c3a',
    tailTip: '#5e3e2a',
    muzzle: '#f7e6c6',
  },
  parts: offset(
    [
      {
        id: 'body',
        role: 'body',
        pivot: [110, 258],
        shapes: [
          {
            d: smooth([
              [96, 126],
              [130, 124],
              [146, 146],
              [152, 178],
              [156, 210],
              [150, 240],
              [136, 258],
              [114, 266],
              [90, 264],
              [70, 248],
              [64, 218],
              [68, 184],
              [76, 152],
              [84, 134],
            ]),
            fill: 'fur',
          },
          { d: ellipse(124, 204, 23, 46, -4), kind: 'detail', fill: 'belly' },
        ],
        children: [
          {
            id: 'tail',
            role: 'tail',
            behind: true,
            pivot: [80, 244],
            motion: { rotate: 2, phase: 0.25 },
            shapes: [
              { d: tube(TAIL, (t) => 7.5 - 4 * t, 40), fill: 'fur' },
              { d: circle(17, 285, 12), kind: 'detail', fill: 'tailTip' },
            ],
          },
          leg('legF', 'legF', 90, true),
          arm('armF', 'armF', 6, -8, true),
          leg('legN', 'legN', 118, false),
          {
            id: 'head',
            role: 'head',
            pivot: [114, 132],
            shapes: [
              { d: circle(62, 80, 12), fill: 'ear' },
              { d: circle(164, 80, 12), fill: 'ear' },
              {
                d: smooth([
                  [112, 22],
                  [142, 27],
                  [160, 48],
                  [164, 76],
                  [157, 102],
                  [141, 124],
                  [120, 138],
                  [102, 137],
                  [85, 125],
                  [68, 104],
                  [60, 78],
                  [64, 50],
                  [82, 28],
                ]),
                fill: 'fur',
              },
              { d: ellipse(119, 112, 22, 19), kind: 'detail', fill: 'muzzle' },
              { d: ellipse(97, 80, 13, 17, 22), kind: 'detail', fill: 'patch' },
              { d: ellipse(136, 80, 13, 17, -22), kind: 'detail', fill: 'patch' },
              { d: ellipse(83, 106, 8, 5), kind: 'feature', fill: 'blush', opacity: 0.5 },
              { d: ellipse(152, 106, 8, 5), kind: 'feature', fill: 'blush', opacity: 0.5 },
              { d: circle(98, 78, 7.6), kind: 'feature', fill: 'eye' },
              { d: circle(135, 78, 7.6), kind: 'feature', fill: 'eye' },
              { d: circle(100.8, 74.8, 2.9), kind: 'feature', fill: 'shine' },
              { d: circle(137.8, 74.8, 2.9), kind: 'feature', fill: 'shine' },
              {
                d: 'M111 101Q119 96 127 101Q125 109 119 111Q113 109 111 101Z',
                kind: 'feature',
                fill: 'nose',
              },
              { d: 'M119 111Q119 119 111 120', kind: 'line', stroke: 'nose', width: 2.6 },
              { d: 'M119 111Q119 119 127 120', kind: 'line', stroke: 'nose', width: 2.6 },
            ],
          },
          arm('armN', 'armN', 0, 0, false),
        ],
      },
    ],
    0,
    -9,
  ),
};

export default meerkat;
