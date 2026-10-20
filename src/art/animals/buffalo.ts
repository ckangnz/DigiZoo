import {
  capsule,
  circle,
  ellipse,
  leaf,
  mirrorPath,
  scalePath,
  smooth,
  translatePath,
  tube,
  type Pt,
} from '../core/paths';
import type { AnimalDef, PartNode } from '../core/types';

const hoof = (x: number, top: number, bottom: number, wTop: number, wBot: number): string => {
  const t = wTop / 2;
  const b = wBot / 2;
  const mid = top + (bottom - top) * 0.45;
  return (
    `M${x - t} ${top}Q${x} ${top - 4} ${x + t} ${top}Q${x + b} ${mid} ${x + b} ${bottom - 5}` +
    `Q${x + b} ${bottom} ${x + b - 5} ${bottom}L${x - b + 5} ${bottom}Q${x - b} ${bottom} ${x - b} ${bottom - 5}` +
    `Q${x - b} ${mid} ${x - t} ${top}Z`
  );
};

const HIP = 196;

const leg = (id: string, x: number, far: boolean): PartNode => ({
  id,
  role: id,
  behind: true,
  pivot: [x, HIP],
  shapes: [
    { d: capsule(x, HIP - 4, x, 250, 21, 18), fill: far ? 'hideFar' : 'hide' },
    { d: hoof(x, 255, 278, 34, 38), fill: far ? 'hoofFar' : 'hoof' },
    ...(far
      ? []
      : [
          {
            d: `M${x + 1} 264L${x + 1} 275`,
            kind: 'line' as const,
            stroke: 'hoofLine',
            width: 2.6,
          },
        ]),
  ],
});

const FACE_X = 296;

const HORN: Pt[] = [
  [288, 90],
  [264, 92],
  [244, 104],
  [230, 116],
  [216, 110],
  [208, 94],
  [210, 76],
];

const horn = (pts: Pt[]) => tube(pts, (t) => 13 - 9 * t ** 0.8, 60);

const EAR = leaf(256, 136, 40, 13, 162);
const EAR_INNER = leaf(252, 136, 27, 6.5, 162);

const offset = (parts: PartNode[], dx: number, dy: number): PartNode[] =>
  parts.map((p): PartNode => ({
    ...p,
    pivot: p.pivot && [p.pivot[0] + dx, p.pivot[1] + dy],
    shapes: p.shapes?.map((s) => ({ ...s, d: translatePath(s.d, dx, dy) })),
    children: p.children && offset(p.children, dx, dy),
  }));

const grow = (parts: PartNode[], k: number, cx: number, cy: number): PartNode[] =>
  parts.map((p): PartNode => ({
    ...p,
    pivot: p.pivot && [cx + (p.pivot[0] - cx) * k, cy + (p.pivot[1] - cy) * k],
    shapes: p.shapes?.map((s) => ({
      ...s,
      d: scalePath(s.d, k, k, cx, cy),
      width: s.width && s.width * k,
    })),
    children: p.children && grow(p.children, k, cx, cy),
  }));

const buffalo: AnimalDef = {
  id: 'buffalo',
  name: 'Buffalo',
  kind: 'animal',
  aliases: ['cape buffalo', 'african buffalo', 'bison', 'water buffalo', 'bull'],
  group: 'mammal',
  habitats: ['safari'],
  box: [400, 225],
  size: 250,
  locomotion: 'walk4',
  gait: { period: 0.95, swing: 18, stride: 100 },
  sound: 'buffalo',
  palette: {
    hide: '#646a7a',
    hideFar: '#525767',
    belly: '#737a8a',
    muzzle: '#a7a1a8',
    nostril: '#4b4550',
    horn: '#cfc5b6',
    hornDark: '#a99d8b',
    earInner: '#c9a3a8',
    hoof: '#3c3a44',
    hoofFar: '#312f38',
    hoofLine: '#25232b',
    tuft: '#3f4350',
  },
  parts: offset(
    [
      {
        id: 'body',
        role: 'body',
        pivot: [150, HIP],
        shapes: [
          {
            d: smooth([
              [262, 150],
              [252, 112],
              [220, 92],
              [180, 92],
              [138, 98],
              [98, 104],
              [66, 126],
              [56, 160],
              [68, 196],
              [102, 218],
              [156, 224],
              [210, 220],
              [248, 200],
            ]),
            fill: 'hide',
          },
          { d: ellipse(162, 220, 78, 20), kind: 'detail', fill: 'belly' },
        ],
        children: [
          {
            id: 'tail',
            role: 'tail',
            pivot: [62, 132],
            behind: true,
            shapes: [
              { d: capsule(62, 132, 46, 162, 5.5, 4.8), fill: 'hide' },
              { d: capsule(46, 162, 41, 196, 4.8, 4.2), fill: 'hide' },
              { d: leaf(41, 190, 36, 10.5, 94), fill: 'tuft' },
            ],
          },
          leg('legBF', 116, true),
          leg('legFF', 226, true),
          leg('legBN', 90, false),
          leg('legFN', 200, false),
          ...grow(
            [
              {
                id: 'head',
                role: 'head',
                pivot: [256, 150],
                shapes: [
                  {
                    d: smooth([
                      [270, 88],
                      [296, 84],
                      [322, 88],
                      [338, 108],
                      [344, 136],
                      [338, 162],
                      [320, 180],
                      [296, 186],
                      [272, 180],
                      [254, 162],
                      [248, 136],
                      [254, 108],
                    ]),
                    fill: 'hide',
                  },
                  { d: ellipse(264, 146, 10, 6.5), kind: 'feature', fill: 'blush', opacity: 0.5 },
                  { d: ellipse(328, 146, 10, 6.5), kind: 'feature', fill: 'blush', opacity: 0.5 },
                  { d: circle(276, 124, 10), kind: 'feature', fill: 'eye' },
                  { d: circle(316, 124, 10), kind: 'feature', fill: 'eye' },
                  { d: circle(279.6, 120, 3.8), kind: 'feature', fill: 'shine' },
                  { d: circle(319.6, 120, 3.8), kind: 'feature', fill: 'shine' },
                ],
                children: [
                  {
                    id: 'earL',
                    behind: true,
                    pivot: [254, 136],
                    motion: { rotate: 7, freq: 2, phase: 0.3 },
                    shapes: [
                      { d: EAR, fill: 'hide' },
                      { d: EAR_INNER, kind: 'detail', fill: 'earInner' },
                    ],
                  },
                  {
                    id: 'earR',
                    behind: true,
                    pivot: [338, 136],
                    motion: { rotate: -7, freq: 2, phase: 0.3 },
                    shapes: [
                      { d: mirrorPath(EAR, FACE_X), fill: 'hide' },
                      { d: mirrorPath(EAR_INNER, FACE_X), kind: 'detail', fill: 'earInner' },
                    ],
                  },
                  {
                    id: 'horns',
                    pivot: [FACE_X, 90],
                    shapes: [
                      { d: horn(HORN), fill: 'horn' },
                      { d: mirrorPath(horn(HORN), FACE_X), fill: 'horn' },
                      {
                        d: smooth([
                          [258, 100],
                          [270, 82],
                          [296, 76],
                          [322, 82],
                          [334, 100],
                          [316, 98],
                          [296, 95],
                          [276, 98],
                        ]),
                        fill: 'horn',
                      },
                      { d: circle(210, 80, 7), kind: 'detail', fill: 'hornDark' },
                      { d: circle(382, 80, 7), kind: 'detail', fill: 'hornDark' },
                      { d: 'M296 80L296 92', kind: 'line', stroke: 'hornDark', width: 2.6 },
                    ],
                  },
                  {
                    id: 'muzzle',
                    pivot: [FACE_X, 160],
                    shapes: [
                      { d: ellipse(FACE_X, 160, 36, 24), fill: 'muzzle' },
                      { d: ellipse(284, 156, 5.5, 4.5, -10), kind: 'feature', fill: 'nostril' },
                      { d: ellipse(308, 156, 5.5, 4.5, 10), kind: 'feature', fill: 'nostril' },
                      { d: 'M284 171Q296 178 308 171', kind: 'line', stroke: 'mouth', width: 3 },
                    ],
                  },
                ],
              },
            ],
            1.12,
            256,
            150,
          ),
        ],
      },
    ],
    -12,
    -55,
  ),
};

export default buffalo;
