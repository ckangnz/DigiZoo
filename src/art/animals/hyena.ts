import {
  capsule,
  circle,
  ellipse,
  leaf,
  smooth,
  translatePath,
  tube,
  type Pt,
} from '../core/paths';
import type { AnimalDef, Motion, PartNode, Shape } from '../core/types';

const jitter = (n: number) => {
  const v = Math.sin(n * 12.9898) * 43758.5453;
  return v - Math.floor(v);
};

const spot = (cx: number, cy: number, r: number, fill = 'spot'): Shape => {
  const pts: Pt[] = [];
  const seed = cx * 1.3 + cy * 2.1;
  for (let k = 0; k < 6; k++) {
    const a = ((k * 60 + 24 * jitter(seed + k)) * Math.PI) / 180;
    const rr = r * (0.84 + 0.28 * jitter(seed + k * 3));
    pts.push([cx + Math.cos(a) * rr, cy + Math.sin(a) * rr]);
  }
  return { d: smooth(pts), kind: 'detail', fill };
};

const SOLE = 257;

const leg = (id: string, x: number, hip: number, far: boolean, motion?: Motion): PartNode => ({
  id,
  role: id,
  behind: true,
  pivot: [x, hip],
  ...(motion ? { motion } : {}),
  shapes: [
    { d: capsule(x, hip - 4, x + 1, SOLE - 22, 15.5, 12), fill: far ? 'furDark' : 'fur' },
    { d: ellipse(x + 5, SOLE - 10.5, 16.5, 10.5), fill: far ? 'furDark' : 'fur' },
    spot(x - 3, hip + 30, 5.5, far ? 'spotFar' : 'spot'),
    spot(x + 5, hip + 50, 4.6, far ? 'spotFar' : 'spot'),
    ...(far
      ? []
      : [
          {
            d: `M${x + 8} ${SOLE - 7}L${x + 8} ${SOLE - 2}`,
            kind: 'line' as const,
            stroke: 'toe',
            width: 2.4,
          },
          {
            d: `M${x + 15} ${SOLE - 8}L${x + 15} ${SOLE - 3}`,
            kind: 'line' as const,
            stroke: 'toe',
            width: 2.4,
          },
        ]),
  ],
});

const MANE: Pt[] = [
  [100, 126],
  [120, 116],
  [140, 108],
  [160, 101],
  [180, 95],
  [198, 91],
  [216, 89],
  [232, 92],
];

const BODY_SPOTS: [number, number, number][] = [
  [86, 156, 8],
  [108, 142, 8.5],
  [102, 174, 8],
  [130, 158, 8.5],
  [150, 132, 8],
  [126, 186, 7.5],
  [156, 174, 8],
  [180, 150, 8],
  [178, 124, 7],
  [204, 164, 7.5],
  [182, 188, 7],
  [72, 180, 7],
];

const offset = (parts: PartNode[], dx: number, dy: number): PartNode[] =>
  parts.map((p): PartNode => ({
    ...p,
    pivot: p.pivot && [p.pivot[0] + dx, p.pivot[1] + dy],
    shapes: p.shapes?.map((s) => ({ ...s, d: translatePath(s.d, dx, dy) })),
    children: p.children && offset(p.children, dx, dy),
  }));

const hyena: AnimalDef = {
  id: 'hyena',
  name: 'Hyena',
  kind: 'animal',
  aliases: ['spotted hyena', 'laughing hyena', 'hyaena', 'hiena'],
  group: 'mammal',
  habitats: ['safari'],
  box: [330, 237],
  size: 180,
  locomotion: 'walk4',
  gait: { stride: 122, swing: 22 },
  sound: 'hyena',
  palette: {
    fur: '#dcb47c',
    furDark: '#c49b63',
    belly: '#efd6aa',
    spot: '#6e513b',
    spotFar: '#5e4432',
    mane: '#7a5c45',
    muzzle: '#624c3e',
    earInner: '#eab9a2',
    nose: '#2e2420',
    toe: '#a9835a',
  },
  parts: offset(
    [
      {
        id: 'body',
        role: 'body',
        pivot: [150, 176],
        shapes: [
          {
            d: smooth([
              [250, 146],
              [244, 108],
              [218, 88],
              [176, 96],
              [132, 112],
              [94, 128],
              [66, 144],
              [54, 168],
              [64, 192],
              [96, 204],
              [146, 200],
              [196, 190],
              [236, 174],
            ]),
            fill: 'fur',
          },
          { d: ellipse(156, 202, 72, 16, -6), kind: 'detail', fill: 'belly' },
          ...BODY_SPOTS.map(([x, y, r]) => spot(x, y, r)),
        ],
        children: [
          {
            id: 'mane',
            behind: true,
            pivot: [170, 96],
            shapes: [
              { d: tube(MANE, 6, 50), fill: 'mane' },
              ...MANE.slice(1).map(([x, y], i) => ({
                d: leaf(x, y + 2, 18 + (i % 2) * 4, 6, -122 + (i % 3) * 6),
                fill: 'mane',
              })),
            ],
          },
          {
            id: 'tail',
            role: 'tail',
            pivot: [64, 152],
            behind: true,
            shapes: [
              {
                d: tube(
                  [
                    [68, 150],
                    [50, 160],
                    [40, 180],
                  ],
                  5,
                  30,
                ),
                fill: 'fur',
              },
              { d: leaf(44, 174, 46, 12, 106), fill: 'mane' },
            ],
          },
          leg('legBF', 102, 184, true),
          leg('legFF', 228, 160, true, { rotate: 18.5, phase: 0.5 }),
          leg('legBN', 78, 186, false),
          leg('legFN', 204, 162, false, { rotate: 18.5 }),
          {
            id: 'head',
            role: 'head',
            pivot: [250, 150],
            shapes: [
              { d: ellipse(240, 54, 16, 20, -18), fill: 'fur' },
              { d: ellipse(322, 50, 16, 20, 18), fill: 'fur' },
              { d: ellipse(282, 102, 57, 53), fill: 'fur' },
              { d: ellipse(284, 134, 32, 25), fill: 'fur' },
              { d: ellipse(241, 56, 9, 12, -18), kind: 'detail', fill: 'earInner' },
              { d: ellipse(321, 52, 9, 12, 18), kind: 'detail', fill: 'earInner' },
              spot(250, 70, 4.5),
              spot(312, 66, 4.5),
              spot(234, 104, 4.2),
              spot(330, 100, 4.2),
              { d: ellipse(284, 134, 30, 23), kind: 'detail', fill: 'muzzle' },
              { d: ellipse(242, 126, 10, 6.5), kind: 'feature', fill: 'blush', opacity: 0.55 },
              { d: ellipse(326, 122, 10, 6.5), kind: 'feature', fill: 'blush', opacity: 0.55 },
              { d: circle(262, 96, 10), kind: 'feature', fill: 'eye' },
              { d: circle(304, 94, 10), kind: 'feature', fill: 'eye' },
              { d: circle(265.6, 92, 3.8), kind: 'feature', fill: 'shine' },
              { d: circle(307.6, 90, 3.8), kind: 'feature', fill: 'shine' },
              {
                d: 'M272 117Q284 110 296 117Q295 126 284 129Q273 126 272 117Z',
                kind: 'feature',
                fill: 'nose',
              },
              {
                d: 'M266 136Q284 142 302 136Q300 152 284 154Q268 152 266 136Z',
                kind: 'feature',
                fill: 'mouth',
              },
              {
                d: ellipse(284, 148, 9, 5.5),
                kind: 'feature',
                fill: 'tongue',
              },
            ],
          },
        ],
      },
    ],
    -14,
    -23,
  ),
};

export default hyena;
