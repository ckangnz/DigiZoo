import { circle, ellipse, f, leaf, roundRect, smooth, type Pt } from '../core/paths';
import type { AnimalDef, PartNode, Shape } from '../core/types';

const HUB: Pt = [356, 138];
const BLADE = 50;
const SPINS = 3;

function roundPoly(pts: Pt[], r: number): string {
  const n = pts.length;
  let d = '';
  for (let i = 0; i < n; i++) {
    const prev = pts[(i + n - 1) % n];
    const cur = pts[i];
    const next = pts[(i + 1) % n];
    const toward = (p: Pt): Pt => {
      const len = Math.hypot(p[0] - cur[0], p[1] - cur[1]);
      const k = Math.min(r, len / 2) / len;
      return [cur[0] + (p[0] - cur[0]) * k, cur[1] + (p[1] - cur[1]) * k];
    };
    const a = toward(prev);
    const b = toward(next);
    d += `${i ? 'L' : 'M'}${f(a[0])} ${f(a[1])}Q${f(cur[0])} ${f(cur[1])} ${f(b[0])} ${f(b[1])}`;
  }
  return d + 'Z';
}

const spinner = (id: string, pivot: Pt, speed: number, leafPart: Partial<PartNode>): PartNode => {
  let node: PartNode = { ...leafPart, id: `${id}${speed}`, role: 'spinner', pivot };
  for (let k = speed - 1; k >= 1; k--) {
    node = { id: `${id}${k}`, role: 'spinner', pivot, children: [node] };
  }
  return node;
};

const eye = (x: number, y: number): Shape[] => [
  { d: ellipse(x, y, 9.5, 12.5), kind: 'feature', fill: 'eye' },
  { d: circle(x + 3.3, y - 4.6, 3.8), kind: 'feature', fill: 'shine' },
  { d: circle(x - 3.2, y + 5.4, 1.7), kind: 'feature', fill: 'shine' },
];

const BODY: Pt[] = [
  [28, 90],
  [66, 106],
  [130, 108],
  [200, 100],
  [262, 88],
  [308, 92],
  [338, 110],
  [352, 136],
  [344, 162],
  [318, 180],
  [258, 190],
  [180, 188],
  [110, 174],
  [60, 146],
  [32, 114],
];

const propeller = spinner('prop', HUB, SPINS, {
  shapes: [
    { d: leaf(HUB[0], HUB[1] - 4, BLADE, 9, -90), fill: 'blade' },
    { d: leaf(HUB[0], HUB[1] + 4, BLADE, 9, 90), fill: 'blade' },
    { d: ellipse(HUB[0], HUB[1] - BLADE + 9, 6, 7), kind: 'detail', fill: 'tip' },
    { d: ellipse(HUB[0], HUB[1] + BLADE - 9, 6, 7), kind: 'detail', fill: 'tip' },
    { d: circle(HUB[0], HUB[1], 8), kind: 'feature', fill: 'nose', stroke: 'auto', width: 2 },
    { d: circle(HUB[0] - 2.5, HUB[1] - 2.5, 2.4), kind: 'feature', fill: 'white', opacity: 0.8 },
  ],
});

const airplane: AnimalDef = {
  id: 'airplane',
  name: 'Airplane',
  kind: 'object',
  aliases: ['plane', 'jet', 'aeroplane', 'propeller plane', 'aircraft'],
  group: 'vehicle',
  habitats: ['vehicles'],
  box: [410, 240],
  size: 240,
  locomotion: 'float',
  gait: { period: 1.8, stride: 150 },
  sound: 'airplane',
  palette: {
    body: '#f7f8fc',
    bodyShade: '#dfe4ef',
    stripe: '#3f8ae6',
    tail: '#3f8ae6',
    tailLight: '#7ab3f5',
    glass: '#c4ecff',
    nose: '#ef4d48',
    blade: '#5b6075',
    tip: '#ffd23f',
  },
  parts: [
    {
      id: 'plane',
      pivot: [200, 140],
      shapes: [
        { d: smooth(BODY), fill: 'body' },
        { d: roundRect(0, 150, 272, 12, 6), kind: 'detail', fill: 'stripe' },
        { d: `M0 178Q200 200 400 170L400 240L0 240Z`, kind: 'detail', fill: 'bodyShade' },
        { d: `M326 60Q338 140 330 220L420 220L420 60Z`, kind: 'detail', fill: 'nose' },
        ...[132, 172, 212].map((x): Shape => ({
          d: circle(x, 128, 11),
          kind: 'feature',
          fill: 'glass',
          stroke: 'auto',
          width: 2.4,
        })),
        ...[132, 172, 212].map((x): Shape => ({
          d: `M${x - 6} ${125}Q${x - 5} ${119} ${x} ${118}`,
          kind: 'line',
          stroke: 'white',
          width: 2.6,
          opacity: 0.9,
        })),
        {
          d: 'M282 153Q294 157 308 152Q307 168 295 169Q283 168 282 153Z',
          kind: 'feature',
          fill: 'mouth',
        },
        { d: ellipse(295, 164, 5.5, 3), kind: 'feature', fill: 'tongue' },
      ],
      children: [
        {
          id: 'fin',
          behind: true,
          shapes: [
            {
              d: smooth([
                [28, 100],
                [22, 62],
                [34, 26],
                [62, 22],
                [78, 50],
                [110, 104],
              ]),
              fill: 'tail',
            },
            { d: 'M44 40Q38 60 40 82', kind: 'line', stroke: 'tailLight', width: 4 },
          ],
        },
        {
          id: 'farWing',
          behind: true,
          shapes: [
            {
              d: roundPoly(
                [
                  [200, 112],
                  [232, 110],
                  [262, 70],
                  [244, 68],
                ],
                10,
              ),
              fill: 'bodyShade',
            },
          ],
        },
        {
          id: 'window',
          shapes: [
            {
              d: roundPoly(
                [
                  [246, 98],
                  [298, 94],
                  [332, 116],
                  [334, 144],
                  [246, 144],
                ],
                14,
              ),
              fill: 'glass',
            },
            {
              d: 'M256 106Q252 118 254 132',
              kind: 'line',
              stroke: 'white',
              width: 4.2,
              opacity: 0.8,
            },
            { d: ellipse(266, 139, 6.5, 4), kind: 'feature', fill: 'blush', opacity: 0.6 },
            { d: ellipse(322, 139, 6.5, 4), kind: 'feature', fill: 'blush', opacity: 0.6 },
            ...eye(280, 121),
            ...eye(306, 121),
          ],
        },
        {
          id: 'stabilizer',
          shapes: [
            {
              d: roundPoly(
                [
                  [34, 118],
                  [96, 128],
                  [100, 140],
                  [30, 134],
                ],
                8,
              ),
              fill: 'tail',
            },
          ],
        },
        {
          id: 'wing',
          shapes: [
            {
              d: roundPoly(
                [
                  [150, 160],
                  [264, 160],
                  [212, 228],
                  [166, 228],
                ],
                14,
              ),
              fill: 'body',
            },
            { d: roundRect(140, 210, 100, 30, 0), kind: 'detail', fill: 'stripe' },
          ],
        },
        propeller,
      ],
    },
  ],
};

export default airplane;
