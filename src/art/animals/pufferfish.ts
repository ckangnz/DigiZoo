import { circle, ellipse, poly, smooth, translatePath, type Pt } from '../core/paths';
import type { AnimalDef, PartNode, Shape } from '../core/types';

const C: Pt = [140, 112];
const R = 76;

const SPIKE_ANGLES = [-150, -128, -106, -84, -62, -40, -18, 28, 50, 72, 94, 116, 138, 160];

const spikes: Shape[] = SPIKE_ANGLES.map((deg): Shape => {
  const a = (deg * Math.PI) / 180;
  const c = Math.cos(a);
  const s = Math.sin(a);
  const at = (u: number, v: number): Pt => [C[0] + c * (R + u) - s * v, C[1] + s * (R + u) + c * v];
  return {
    d: smooth([at(-8, -7.5), at(4, -4.8), at(14, -1.8), at(14, 1.8), at(4, 4.8), at(-8, 7.5)]),
    fill: 'body',
  };
});

const SPOTS: [number, number, number][] = [
  [104, 62, 5],
  [128, 52, 4],
  [150, 60, 3.5],
  [90, 88, 4],
  [114, 82, 3.2],
  [80, 116, 3.5],
  [172, 54, 3],
];

const fin = (
  id: string,
  role: string,
  pivot: Pt,
  outline: Pt[],
  rays: [Pt, Pt][],
  behind: boolean,
): PartNode => ({
  id,
  role,
  behind,
  pivot,
  shapes: [
    { d: smooth(outline), fill: 'fin' },
    ...rays.map((ray): Shape => ({
      d: poly(ray, false),
      kind: 'line',
      stroke: 'finLine',
      width: 2,
    })),
  ],
});

const offset = (parts: PartNode[], dx: number, dy: number): PartNode[] =>
  parts.map((p): PartNode => ({
    ...p,
    pivot: p.pivot && [p.pivot[0] + dx, p.pivot[1] + dy],
    shapes: p.shapes?.map((s) => ({ ...s, d: translatePath(s.d, dx, dy) })),
    children: p.children && offset(p.children, dx, dy),
  }));

const pufferfish: AnimalDef = {
  id: 'pufferfish',
  name: 'Pufferfish',
  kind: 'animal',
  aliases: ['puffer', 'puffer fish', 'blowfish', 'blow fish', 'puffy'],
  group: 'fish',
  habitats: ['ocean'],
  box: [224, 206],
  size: 90,
  locomotion: 'swim',
  gait: { period: 1.4 },
  sound: 'pufferfish',
  palette: {
    body: '#f5c96a',
    belly: '#fff2c9',
    spot: '#c99545',
    fin: '#ffd98a',
    finLine: '#e0a647',
  },
  parts: offset(
    [
      {
        id: 'body',
        role: 'body',
        pivot: C,
        motion: { scaleX: 0.06, scaleY: 0.06 },
        shapes: [
          ...spikes,
          { d: circle(C[0], C[1], R), fill: 'body' },
          { d: ellipse(160, 168, 74, 40, -10), kind: 'detail', fill: 'belly' },
          ...SPOTS.map(([x, y, r]): Shape => ({
            d: circle(x, y, r),
            kind: 'detail',
            fill: 'spot',
          })),
          { d: ellipse(144, 118, 10, 6.5), kind: 'feature', fill: 'blush', opacity: 0.5 },
          { d: ellipse(214, 116, 8, 6), kind: 'feature', fill: 'blush', opacity: 0.5 },
          { d: circle(160, 96, 13), kind: 'feature', fill: 'eye' },
          { d: circle(198, 94, 12), kind: 'feature', fill: 'eye' },
          { d: circle(164.8, 90.4, 4.9), kind: 'feature', fill: 'shine' },
          { d: circle(202.4, 88.6, 4.5), kind: 'feature', fill: 'shine' },
          { d: ellipse(184, 126, 5.5, 6.5), kind: 'line', stroke: 'mouth', width: 3 },
        ],
        children: [
          fin(
            'tail',
            'tail',
            [70, 112],
            [
              [74, 102],
              [52, 88],
              [34, 84],
              [28, 98],
              [34, 112],
              [28, 126],
              [34, 140],
              [52, 136],
              [74, 122],
            ],
            [
              [
                [64, 108],
                [38, 94],
              ],
              [
                [64, 112],
                [36, 112],
              ],
              [
                [64, 116],
                [38, 130],
              ],
            ],
            true,
          ),
          fin(
            'finTop',
            'finTop',
            [116, 44],
            [
              [100, 46],
              [104, 30],
              [118, 22],
              [132, 26],
              [134, 42],
            ],
            [],
            true,
          ),
          fin(
            'finBottom',
            'finF',
            [116, 182],
            [
              [100, 178],
              [104, 194],
              [118, 202],
              [132, 198],
              [134, 182],
            ],
            [],
            true,
          ),
          fin(
            'finSide',
            'finN',
            [128, 134],
            [
              [130, 128],
              [116, 124],
              [102, 130],
              [98, 142],
              [108, 150],
              [126, 142],
            ],
            [
              [
                [124, 133],
                [106, 132],
              ],
              [
                [124, 137],
                [108, 144],
              ],
            ],
            false,
          ),
        ],
      },
    ],
    -16,
    -9,
  ),
};

export default pufferfish;
