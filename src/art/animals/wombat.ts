import { capsule, circle, curve, ellipse, leaf, smooth, translatePath } from '../core/paths';
import type { AnimalDef, PartNode, Shape } from '../core/types';

const GROUND = 220;
const HIP = 172;

const leg = (id: string, x: number, far: boolean): PartNode => {
  const fill = far ? 'furDark' : 'fur';
  const toes: Shape[] = far
    ? []
    : [9, 18, 27].map((dx) => ({
        d: `M${x + dx} ${GROUND - 9}L${x + dx + 1} ${GROUND - 3}`,
        kind: 'line',
        stroke: 'toe',
        width: 2.4,
      }));
  return {
    id,
    role: id,
    behind: true,
    pivot: [x, HIP],
    shapes: [
      { d: capsule(x, HIP, x + 1, GROUND - 16, 19, 17), fill },
      { d: ellipse(x + 7, GROUND - 10, 25, 10.5), fill },
      ...toes,
    ],
  };
};

const ear = (id: string, x: number, y: number, angle: number): PartNode => ({
  id,
  role: id,
  behind: true,
  pivot: [x, y],
  shapes: [
    { d: leaf(x, y, 34, 14, angle), fill: 'furDark' },
    { d: leaf(x, y, 23, 7, angle), kind: 'detail', fill: 'earInner' },
  ],
});

const LIFT = 60;

const offset = (parts: PartNode[], dx: number, dy: number): PartNode[] =>
  parts.map((p): PartNode => ({
    ...p,
    pivot: p.pivot && [p.pivot[0] + dx, p.pivot[1] + dy],
    shapes: p.shapes?.map((s) => ({ ...s, d: translatePath(s.d, dx, dy) })),
    children: p.children && offset(p.children, dx, dy),
  }));

const wombat: AnimalDef = {
  id: 'wombat',
  name: 'Wombat',
  kind: 'animal',
  aliases: ['common wombat', 'hairy-nosed wombat', 'bare-nosed wombat', 'wommy'],
  group: 'mammal',
  habitats: ['aussie'],
  box: [308, GROUND - LIFT],
  size: 130,
  locomotion: 'walk4',
  gait: { period: 0.95, stride: 62, swing: 18 },
  sound: 'wombat',
  palette: {
    fur: '#93714f',
    furDark: '#795a3d',
    belly: '#b0906f',
    muzzle: '#d2b796',
    earInner: '#cf9d90',
    nose: '#3d302d',
    toe: '#5f4430',
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
              [32, 146],
              [40, 108],
              [72, 82],
              [124, 68],
              [180, 68],
              [226, 82],
              [254, 114],
              [256, 160],
              [232, 192],
              [170, 204],
              [100, 202],
              [50, 186],
            ]),
            fill: 'fur',
          },
          { d: ellipse(150, 204, 88, 20), kind: 'detail', fill: 'belly' },
        ],
        children: [
          leg('legBF', 98, true),
          leg('legFF', 214, true),
          leg('legBN', 72, false),
          leg('legFN', 190, false),
          {
            id: 'head',
            role: 'head',
            pivot: [248, 150],
            shapes: [
              {
                d: smooth([
                  [198, 120],
                  [206, 90],
                  [230, 76],
                  [262, 72],
                  [294, 76],
                  [318, 90],
                  [326, 120],
                  [320, 152],
                  [298, 174],
                  [262, 180],
                  [226, 174],
                  [204, 152],
                ]),
                fill: 'fur',
              },
              { d: ellipse(262, 152, 46, 28), kind: 'detail', fill: 'muzzle' },
              { d: ellipse(212, 144, 10, 6.5), kind: 'feature', fill: 'blush', opacity: 0.55 },
              { d: ellipse(312, 144, 10, 6.5), kind: 'feature', fill: 'blush', opacity: 0.55 },
              { d: circle(230, 113, 8), kind: 'feature', fill: 'eye' },
              { d: circle(294, 113, 8), kind: 'feature', fill: 'eye' },
              { d: circle(233.2, 109.6, 3.1), kind: 'feature', fill: 'shine' },
              { d: circle(297.2, 109.6, 3.1), kind: 'feature', fill: 'shine' },
              {
                d: 'M236 128Q262 120 288 128Q295 141 282 151Q262 158 242 151Q229 141 236 128Z',
                kind: 'feature',
                fill: 'nose',
              },
              { d: ellipse(254, 128, 7, 2.6), kind: 'feature', fill: 'shine', opacity: 0.5 },
              { d: curve(252, 163, 272, 163, 5), kind: 'line', stroke: 'mouth', width: 2.6 },
            ],
            children: [ear('earF', 214, 94, -128), ear('earN', 310, 94, -52)],
          },
        ],
      },
    ],
    -26,
    -LIFT,
  ),
};

export default wombat;
