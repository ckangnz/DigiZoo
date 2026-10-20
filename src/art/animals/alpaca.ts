import {
  capsule,
  circle,
  ellipse,
  mirrorPath,
  scallop,
  translatePath,
  tube,
  type Pt,
} from '../core/paths';
import type { AnimalDef, PartNode, Shape } from '../core/types';

const HIP = 248;

const leg = (id: string, x: number, far: boolean): PartNode => ({
  id,
  role: id,
  behind: true,
  pivot: [x, HIP],
  shapes: [
    { d: capsule(x, HIP, x, 318, 15, 10.5), fill: far ? 'legFar' : 'leg' },
    { d: ellipse(x + 3, 329, 13, 9.5), fill: far ? 'toeFar' : 'toe' },
    ...(far
      ? []
      : [
          { d: `M${x + 4} 324L${x + 4} 336`, kind: 'line' as const, stroke: 'toeLine', width: 2.4 },
        ]),
  ],
});

const curls = (pts: Pt[]): Shape[] =>
  pts.map(([x, y]) => ({
    d: tube(
      [
        [x - 9, y + 2],
        [x - 4, y - 3],
        [x + 4, y - 3],
        [x + 9, y + 2],
      ],
      1.5,
      24,
    ),
    kind: 'detail' as const,
    fill: 'woolLine',
  }));

const MID = 240;

const EAR = tube(
  [
    [210, 66],
    [196, 48],
    [191, 26],
    [199, 9],
  ],
  (t) => 3 + 7 * Math.sin(Math.PI * (0.15 + 0.85 * t)),
);

const EAR_INNER = tube(
  [
    [208, 62],
    [198, 46],
    [195, 28],
  ],
  (t) => 1.5 + 3 * Math.sin(Math.PI * (0.1 + 0.8 * t)),
);

const offset = (parts: PartNode[], dx: number, dy: number): PartNode[] =>
  parts.map((p): PartNode => ({
    ...p,
    pivot: p.pivot && [p.pivot[0] + dx, p.pivot[1] + dy],
    shapes: p.shapes?.map((s) => ({ ...s, d: translatePath(s.d, dx, dy) })),
    children: p.children && offset(p.children, dx, dy),
  }));

const alpaca: AnimalDef = {
  id: 'alpaca',
  name: 'Alpaca',
  kind: 'animal',
  aliases: ['llama', 'cria'],
  group: 'mammal',
  habitats: ['farm'],
  box: [288, 340],
  size: 240,
  locomotion: 'walk4',
  gait: { stride: 110, swing: 18 },
  sound: 'alpaca',
  palette: {
    wool: '#f8ecd4',
    woolShade: '#ecdcbc',
    woolLine: '#dcc6a0',
    face: '#f1dcba',
    muzzle: '#fdf6ea',
    leg: '#eed9b6',
    legFar: '#dcc49c',
    toe: '#8b6b55',
    toeFar: '#755845',
    toeLine: '#5e4434',
    earInner: '#f0b0a6',
    nose: '#7a5644',
    flower: '#ff7fa8',
    flowerMid: '#ffd45c',
  },
  parts: offset(
    [
      {
        id: 'body',
        role: 'body',
        pivot: [140, 248],
        shapes: [
          { d: scallop(138, 222, 0, 18, 11, 0, 100, 60), fill: 'wool' },
          { d: scallop(220, 152, 0, 12, 7, 0, 28, 58), fill: 'wool' },
          { d: ellipse(142, 286, 92, 26), kind: 'detail', fill: 'woolShade' },
          ...curls([
            [80, 196],
            [122, 184],
            [164, 192],
            [100, 228],
            [146, 222],
            [62, 238],
            [190, 228],
            [124, 256],
            [214, 140],
            [222, 172],
          ]),
        ],
        children: [
          {
            id: 'tail',
            role: 'tail',
            pivot: [50, 206],
            behind: true,
            shapes: [{ d: scallop(38, 204, 16, 7, 6), fill: 'wool' }],
          },
          leg('legBF', 92, true),
          leg('legFF', 196, true),
          leg('legBN', 70, false),
          leg('legFN', 174, false),
          {
            id: 'head',
            role: 'head',
            pivot: [232, 130],
            shapes: [
              { d: ellipse(MID, 94, 40, 42), fill: 'face' },
              { d: ellipse(MID, 118, 21, 15), kind: 'detail', fill: 'muzzle' },
              { d: ellipse(212, 112, 9, 5.6), kind: 'feature', fill: 'blush', opacity: 0.6 },
              { d: ellipse(268, 112, 9, 5.6), kind: 'feature', fill: 'blush', opacity: 0.6 },
              { d: circle(225, 96, 10), kind: 'feature', fill: 'eye' },
              { d: circle(255, 96, 10), kind: 'feature', fill: 'eye' },
              { d: circle(228.6, 92.2, 3.8), kind: 'feature', fill: 'shine' },
              { d: circle(258.6, 92.2, 3.8), kind: 'feature', fill: 'shine' },
              { d: ellipse(MID, 111, 5.2, 3.5), kind: 'feature', fill: 'nose' },
              { d: 'M240 114L240 119', kind: 'line', stroke: 'nose', width: 2.4 },
              { d: 'M232 119Q240 125 248 119', kind: 'line', stroke: 'nose', width: 2.4 },
            ],
            children: [
              {
                id: 'earF',
                role: 'earF',
                behind: true,
                pivot: [210, 66],
                shapes: [
                  { d: EAR, fill: 'face' },
                  { d: EAR_INNER, kind: 'detail', fill: 'earInner' },
                ],
              },
              {
                id: 'earN',
                role: 'earN',
                behind: true,
                pivot: [270, 66],
                shapes: [
                  { d: mirrorPath(EAR, MID), fill: 'face' },
                  { d: mirrorPath(EAR_INNER, MID), kind: 'detail', fill: 'earInner' },
                ],
              },
              {
                id: 'topknot',
                pivot: [MID, 50],
                shapes: [
                  { d: scallop(MID, 50, 0, 12, 8, 0, 34, 20), fill: 'wool' },
                  {
                    d: scallop(266, 62, 8.5, 6, 3.4, -90),
                    kind: 'feature',
                    fill: 'flower',
                    stroke: 'auto',
                    width: 1.8,
                  },
                  { d: circle(266, 62, 3.6), kind: 'feature', fill: 'flowerMid' },
                ],
              },
            ],
          },
        ],
      },
    ],
    -12,
    0,
  ),
};

export default alpaca;
