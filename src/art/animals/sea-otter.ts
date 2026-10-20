import {
  capsule,
  circle,
  curve,
  ellipse,
  poly,
  smooth,
  translatePath,
  type Pt,
} from '../core/paths';
import type { AnimalDef, PartNode, Shape } from '../core/types';

const hindFoot = (id: string, base: Pt, tip: Pt, far: boolean): PartNode => {
  const fill = far ? 'furDark' : 'fur';
  const [bx, by] = base;
  const len = Math.hypot(tip[0] - bx, tip[1] - by);
  const a = Math.atan2(tip[1] - by, tip[0] - bx);
  const c = Math.cos(a);
  const s = Math.sin(a);
  const at = (u: number, v: number): Pt => [bx + c * u - s * v, by + s * u + c * v];
  const toes: Shape[] = far
    ? []
    : [-6, 6].map((v): Shape => ({
        d: poly([at(len - 14, v * 0.7), at(len - 3, v)], false),
        kind: 'line',
        stroke: 'toe',
        width: 2.2,
      }));
  return {
    id,
    role: id,
    behind: true,
    pivot: base,
    shapes: [
      {
        d: smooth([
          at(-4, -8),
          at(len * 0.5, -10),
          at(len - 3, -14),
          at(len + 3, -10),
          at(len + 1, -4),
          at(len + 5, 0),
          at(len + 1, 4),
          at(len + 3, 10),
          at(len - 3, 14),
          at(len * 0.5, 10),
          at(-4, 8),
        ]),
        fill,
      },
      ...toes,
    ],
  };
};

const SHELL: Pt = [214, 84];

const shell: Shape[] = [
  {
    d: smooth([
      [SHELL[0] - 27, SHELL[1] + 8],
      [SHELL[0] - 24, SHELL[1] - 10],
      [SHELL[0] - 12, SHELL[1] - 22],
      [SHELL[0], SHELL[1] - 25],
      [SHELL[0] + 12, SHELL[1] - 22],
      [SHELL[0] + 24, SHELL[1] - 10],
      [SHELL[0] + 27, SHELL[1] + 8],
      [SHELL[0] + 10, SHELL[1] + 18],
      [SHELL[0] - 10, SHELL[1] + 18],
    ]),
    fill: 'shell',
  },
  ...[-56, -28, 0, 28, 56].map((deg): Shape => {
    const a = ((deg - 90) * Math.PI) / 180;
    const from: Pt = [SHELL[0] + Math.cos(a) * 9, SHELL[1] + 16 + Math.sin(a) * 9];
    const to: Pt = [SHELL[0] + Math.cos(a) * 30, SHELL[1] + 16 + Math.sin(a) * 34];
    return { d: poly([from, to], false), kind: 'line', stroke: 'shellLine', width: 2.4 };
  }),
  {
    d: smooth([
      [SHELL[0] - 10, SHELL[1] + 14],
      [SHELL[0], SHELL[1] + 11],
      [SHELL[0] + 10, SHELL[1] + 14],
      [SHELL[0] + 8, SHELL[1] + 24],
      [SHELL[0] - 8, SHELL[1] + 24],
    ]),
    fill: 'shellBase',
  },
];

const offset = (parts: PartNode[], dx: number, dy: number): PartNode[] =>
  parts.map((p): PartNode => ({
    ...p,
    pivot: p.pivot && [p.pivot[0] + dx, p.pivot[1] + dy],
    shapes: p.shapes?.map((s) => ({ ...s, d: translatePath(s.d, dx, dy) })),
    children: p.children && offset(p.children, dx, dy),
  }));

const seaOtter: AnimalDef = {
  id: 'sea-otter',
  name: 'Sea Otter',
  kind: 'animal',
  aliases: ['otter', 'otter pup'],
  group: 'mammal',
  habitats: ['ocean'],
  box: [348, 160],
  size: 140,
  locomotion: 'float',
  sound: 'sea-otter',
  palette: {
    fur: '#93623f',
    furDark: '#774d31',
    tummy: '#b07f58',
    chest: '#c79c75',
    face: '#eedbc2',
    muzzle: '#faf0e2',
    earInner: '#6b4430',
    nose: '#3a2522',
    paw: '#6a4630',
    toe: '#6a452e',
    whisker: '#8a6c55',
    shell: '#ffc6b1',
    shellLine: '#ee9d86',
    shellBase: '#f6a68c',
  },
  parts: offset(
    [
      {
        id: 'body',
        pivot: [180, 140],
        shapes: [
          {
            d: smooth([
              [82, 148],
              [98, 118],
              [140, 100],
              [192, 96],
              [244, 102],
              [280, 118],
              [292, 148],
              [268, 176],
              [222, 190],
              [166, 192],
              [118, 186],
              [90, 170],
            ]),
            fill: 'fur',
          },
          {
            d:
              smooth(
                [
                  [76, 134],
                  [112, 116],
                  [160, 108],
                  [208, 108],
                  [256, 114],
                  [296, 132],
                ],
                false,
              ) + 'L296 60L64 60Z',
            kind: 'detail',
            fill: 'tummy',
          },
          { d: ellipse(270, 136, 30, 34, -20), kind: 'detail', fill: 'chest' },
        ],
        children: [
          {
            id: 'tail',
            role: 'tail',
            behind: true,
            pivot: [92, 160],
            shapes: [
              {
                d: smooth([
                  [100, 150],
                  [74, 146],
                  [48, 144],
                  [30, 150],
                  [36, 162],
                  [64, 168],
                  [100, 168],
                ]),
                fill: 'furDark',
              },
            ],
          },
          hindFoot('legF', [108, 122], [88, 84], true),
          hindFoot('legN', [128, 116], [122, 74], false),
          {
            id: 'arms',
            role: 'arm',
            pivot: [258, 128],
            motion: { rotate: 4, phase: 0.2 },
            shapes: shell,
            children: [
              {
                id: 'armNear',
                shapes: [{ d: capsule(252, 132, 239, 97, 11.5, 9.5), fill: 'fur' }],
              },
              {
                id: 'paws',
                shapes: [
                  { d: ellipse(191, 92, 7, 6, -30), fill: 'paw' },
                  { d: ellipse(240, 92, 7, 6, 30), fill: 'paw' },
                ],
              },
            ],
          },
          {
            id: 'head',
            role: 'head',
            pivot: [282, 140],
            shapes: [
              { d: circle(270, 80, 8.5), fill: 'fur' },
              { d: circle(336, 80, 8.5), fill: 'fur' },
              { d: ellipse(303, 112, 50, 46), fill: 'fur' },
              { d: circle(270, 80, 4.2), kind: 'detail', fill: 'earInner' },
              { d: circle(336, 80, 4.2), kind: 'detail', fill: 'earInner' },
              { d: ellipse(303, 124, 42, 36), kind: 'detail', fill: 'face' },
              { d: ellipse(294, 130, 12, 10), kind: 'detail', fill: 'muzzle' },
              { d: ellipse(312, 130, 12, 10), kind: 'detail', fill: 'muzzle' },
              { d: ellipse(273, 124, 8.5, 5.5), kind: 'feature', fill: 'blush', opacity: 0.5 },
              { d: ellipse(333, 124, 8.5, 5.5), kind: 'feature', fill: 'blush', opacity: 0.5 },
              { d: circle(284, 106, 8.5), kind: 'feature', fill: 'eye' },
              { d: circle(322, 106, 8.5), kind: 'feature', fill: 'eye' },
              { d: circle(287.2, 102.6, 3.2), kind: 'feature', fill: 'shine' },
              { d: circle(325.2, 102.6, 3.2), kind: 'feature', fill: 'shine' },
              {
                d: 'M294 116Q303 111 312 116Q311 124 303 127Q295 124 294 116Z',
                kind: 'feature',
                fill: 'nose',
              },
              { d: curve(297, 139, 309, 139, 4), kind: 'line', stroke: 'mouth', width: 2.6 },
              { d: circle(289, 129, 1.3), kind: 'feature', fill: 'whisker' },
              { d: circle(317, 129, 1.3), kind: 'feature', fill: 'whisker' },
              { d: 'M284 128L260 123', kind: 'line', stroke: 'whisker', width: 2 },
              { d: 'M284 133L260 136', kind: 'line', stroke: 'whisker', width: 2 },
              { d: 'M322 128L346 123', kind: 'line', stroke: 'whisker', width: 2 },
              { d: 'M322 133L346 136', kind: 'line', stroke: 'whisker', width: 2 },
            ],
          },
        ],
      },
    ],
    -17,
    -46,
  ),
};

export default seaOtter;
