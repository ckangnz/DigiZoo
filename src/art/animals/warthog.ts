import {
  capsule,
  circle,
  curve,
  ellipse,
  leaf,
  smooth,
  translatePath,
  tube,
  type Pt,
} from '../core/paths';
import type { AnimalDef, PartNode, Shape } from '../core/types';

const HIP = 184;

const leg = (id: string, x: number, far: boolean): PartNode => {
  const fill = far ? 'skinDark' : 'skin';
  return {
    id,
    role: id,
    behind: true,
    pivot: [x, HIP],
    shapes: [
      { d: capsule(x, HIP - 4, x, 226, 15, 13), fill },
      { d: ellipse(x + 2, 232, 16.5, 10), fill },
      {
        d: `M${x - 20} 229H${x + 24}V250H${x - 20}Z`,
        kind: 'detail',
        fill: far ? 'hoofDark' : 'hoof',
      },
      ...(far
        ? []
        : [
            {
              d: `M${x + 3} 233L${x + 3} 241`,
              kind: 'line' as const,
              stroke: 'hoofLine',
              width: 2.3,
            },
          ]),
    ],
  };
};

const strands = (base: Pt[], angle: number, len: number, width: number): Shape[] =>
  base.map(([x, y], i) => ({
    d: leaf(x, y, len * (0.82 + 0.18 * ((i * 5) % 3)), width, angle + ((i * 7) % 3) * 7 - 7),
    fill: 'mane',
  }));

const MANE_BASE: Pt[] = [
  [104, 96],
  [116, 92],
  [128, 90],
  [140, 88],
  [152, 88],
  [164, 88],
  [176, 89],
  [188, 92],
  [200, 96],
  [210, 100],
  [218, 104],
];

const offset = (parts: PartNode[], dx: number, dy: number): PartNode[] =>
  parts.map((p): PartNode => ({
    ...p,
    pivot: p.pivot && [p.pivot[0] + dx, p.pivot[1] + dy],
    shapes: p.shapes?.map((s) => ({ ...s, d: translatePath(s.d, dx, dy) })),
    children: p.children && offset(p.children, dx, dy),
  }));

const warthog: AnimalDef = {
  id: 'warthog',
  name: 'Warthog',
  kind: 'animal',
  aliases: ['wart hog', 'pumbaa', 'hog', 'wild pig', 'warty pig'],
  group: 'mammal',
  habitats: ['safari'],
  box: [292, 210],
  size: 150,
  locomotion: 'walk4',
  gait: { period: 0.75, swing: 22, stride: 88 },
  sound: 'warthog',
  palette: {
    skin: '#a68b7d',
    skinDark: '#8c7468',
    belly: '#bfa799',
    mane: '#5f4a3f',
    snout: '#8f766a',
    nostril: '#4a3a33',
    tusk: '#fff3da',
    earInner: '#e3a7a0',
    hoof: '#56463e',
    hoofDark: '#47392f',
    hoofLine: '#352a24',
  },
  parts: offset(
    [
      {
        id: 'body',
        role: 'body',
        pivot: [140, HIP],
        shapes: [
          {
            d: smooth([
              [236, 140],
              [222, 104],
              [186, 90],
              [140, 88],
              [96, 94],
              [62, 114],
              [46, 146],
              [56, 180],
              [88, 204],
              [140, 212],
              [190, 206],
              [224, 184],
            ]),
            fill: 'skin',
          },
          { d: ellipse(146, 206, 70, 18), kind: 'detail', fill: 'belly' },
          { d: curve(84, 130, 92, 168, 8), kind: 'line', stroke: 'skinDark', width: 2.8 },
          { d: curve(196, 120, 204, 156, -8), kind: 'line', stroke: 'skinDark', width: 2.8 },
        ],
        children: [
          {
            id: 'mane',
            behind: true,
            pivot: [150, 92],
            shapes: strands(MANE_BASE, -128, 28, 7),
          },
          {
            id: 'tail',
            role: 'tail',
            pivot: [54, 124],
            behind: true,
            shapes: [
              {
                d: tube(
                  [
                    [58, 128],
                    [48, 108],
                    [44, 86],
                    [44, 66],
                  ],
                  (t) => 4 - 1 * t,
                  40,
                ),
                fill: 'skin',
              },
              { d: leaf(44, 70, 24, 6, -90), fill: 'mane' },
              { d: leaf(44, 70, 22, 5.5, -114), fill: 'mane' },
              { d: leaf(44, 70, 22, 5.5, -66), fill: 'mane' },
            ],
          },
          leg('legBF', 104, true),
          leg('legFF', 206, true),
          leg('legBN', 80, false),
          leg('legFN', 182, false),
          {
            id: 'head',
            role: 'head',
            pivot: [214, 150],
            shapes: [
              { d: leaf(216, 84, 36, 12, 206), fill: 'skin' },
              { d: leaf(276, 84, 36, 12, -26), fill: 'skin' },
              {
                d: smooth([
                  [216, 72],
                  [246, 64],
                  [276, 72],
                  [294, 98],
                  [298, 128],
                  [290, 158],
                  [270, 176],
                  [246, 180],
                  [222, 176],
                  [202, 158],
                  [194, 128],
                  [198, 98],
                ]),
                fill: 'skin',
              },
              { d: circle(199, 112, 9), fill: 'skin' },
              { d: circle(293, 112, 9), fill: 'skin' },
              { d: leaf(214, 84, 24, 5.5, 206), kind: 'detail', fill: 'earInner' },
              { d: leaf(278, 84, 24, 5.5, -26), kind: 'detail', fill: 'earInner' },
              { d: ellipse(214, 126, 9, 6), kind: 'feature', fill: 'blush', opacity: 0.55 },
              { d: ellipse(278, 126, 9, 6), kind: 'feature', fill: 'blush', opacity: 0.55 },
              { d: circle(228, 104, 9.5), kind: 'feature', fill: 'eye' },
              { d: circle(264, 104, 9.5), kind: 'feature', fill: 'eye' },
              { d: circle(231.4, 100.4, 3.6), kind: 'feature', fill: 'shine' },
              { d: circle(267.4, 100.4, 3.6), kind: 'feature', fill: 'shine' },
              { d: circle(207, 137, 4.4), kind: 'feature', fill: 'skin', stroke: 'auto', width: 2 },
              { d: circle(285, 137, 4.4), kind: 'feature', fill: 'skin', stroke: 'auto', width: 2 },
              { d: curve(237, 174, 255, 174, 4.5), kind: 'line', stroke: 'mouth', width: 2.8 },
            ],
            children: [
              {
                id: 'tuft',
                behind: true,
                pivot: [246, 70],
                shapes: [
                  { d: leaf(234, 76, 30, 7, -134), fill: 'mane' },
                  { d: leaf(244, 72, 34, 7.5, -116), fill: 'mane' },
                  { d: leaf(254, 72, 30, 7, -98), fill: 'mane' },
                  { d: leaf(226, 82, 26, 6.5, -146), fill: 'mane' },
                ],
              },
              {
                id: 'tusks',
                pivot: [246, 156],
                shapes: [
                  {
                    d: tube(
                      [
                        [218, 164],
                        [202, 158],
                        [194, 144],
                        [195, 130],
                      ],
                      (t) => 5.4 - 2.2 * t,
                      36,
                    ),
                    fill: 'tusk',
                  },
                  {
                    d: tube(
                      [
                        [274, 164],
                        [290, 158],
                        [298, 144],
                        [297, 130],
                      ],
                      (t) => 5.4 - 2.2 * t,
                      36,
                    ),
                    fill: 'tusk',
                  },
                ],
              },
              {
                id: 'snout',
                pivot: [246, 152],
                shapes: [
                  { d: ellipse(246, 149, 37, 19), fill: 'snout' },
                  { d: ellipse(234, 149, 5, 7.5), kind: 'feature', fill: 'nostril' },
                  { d: ellipse(258, 149, 5, 7.5), kind: 'feature', fill: 'nostril' },
                ],
              },
            ],
          },
        ],
      },
    ],
    -25,
    -33,
  ),
};

export default warthog;
