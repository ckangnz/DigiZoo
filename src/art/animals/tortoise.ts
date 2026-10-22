import { capsule, circle, ellipse, smooth, type Pt } from '../core/paths';
import type { AnimalDef, PartNode, Shape } from '../core/types';

const DOME = 118;
const dome = ([x, y]: Pt): Pt => [150 + DOME * Math.sin((x - 150) / DOME), y];

function hexagon(cx: number, cy: number, r: number, round = 0.28): string {
  const pts: Pt[] = [];
  for (let i = 0; i < 6; i++) {
    const a = (i * Math.PI) / 3;
    pts.push([cx + r * Math.cos(a), cy + r * Math.sin(a)]);
  }
  let d = '';
  for (let i = 0; i < 6; i++) {
    const p0 = pts[(i + 5) % 6];
    const p1 = pts[i];
    const p2 = pts[(i + 1) % 6];
    const a = dome([p1[0] + (p0[0] - p1[0]) * round, p1[1] + (p0[1] - p1[1]) * round]);
    const b = dome([p1[0] + (p2[0] - p1[0]) * round, p1[1] + (p2[1] - p1[1]) * round]);
    const c = dome(p1);
    d += `${i ? 'L' : 'M'}${a[0].toFixed(2)} ${a[1].toFixed(2)}Q${c[0].toFixed(2)} ${c[1].toFixed(2)} ${b[0].toFixed(2)} ${b[1].toFixed(2)}`;
  }
  return d + 'Z';
}

const R = 30;
const STEP = Math.sqrt(3) * R + 6;
const DX = STEP * Math.cos(Math.PI / 6);
const CY = 92;
const CELLS: Pt[] = [
  [150, CY],
  [150, CY - STEP],
  [150 - DX, CY - STEP / 2],
  [150 + DX, CY - STEP / 2],
  [150 - DX, CY + STEP / 2],
  [150 + DX, CY + STEP / 2],
  [150 - 2 * DX, CY],
  [150 + 2 * DX, CY],
  [150 - 2 * DX, CY - STEP],
  [150 + 2 * DX, CY - STEP],
  [150 - 2 * DX, CY + STEP],
  [150 + 2 * DX, CY + STEP],
  [150, CY + STEP],
];

const plates: Shape[] = CELLS.flatMap(([x, y]) => [
  { d: hexagon(x, y, R), kind: 'detail' as const, fill: 'plate' },
  { d: hexagon(x, y - 2, R * 0.58), kind: 'detail' as const, fill: 'plateLight' },
]);

const leg = (id: string, x: number, far: boolean): PartNode => {
  const fill = far ? 'skinDark' : 'skin';
  const nail = (dx: number, dy: number): Shape => ({
    d: ellipse(x + dx, 194 + dy, 4.6, 3.6),
    kind: 'feature',
    fill: 'nail',
    stroke: 'auto',
    width: 1.6,
  });
  return {
    id,
    role: id,
    behind: true,
    pivot: [x, 142],
    shapes: [
      { d: capsule(x, 142, x + 1, 180, 18, 19.5), fill },
      { d: ellipse(x + 2, 188, 23, 11), fill },
      ...(far ? [] : [nail(-10, -1), nail(2, 1), nail(14, -1)]),
    ],
  };
};

const tortoise: AnimalDef = {
  id: 'tortoise',
  name: 'Tortoise',
  aliases: ['turtle', 'terrapin'],
  group: 'reptile',
  habitats: ['desert', 'pets'],
  box: [334, 200],
  size: 100,
  locomotion: 'walk4',
  gait: { period: 1.8, stride: 40, swing: 11 },
  sound: 'tortoise',
  palette: {
    shell: '#80592c',
    plate: '#d39d4a',
    plateLight: '#e6b964',
    rim: '#e7c679',
    rimLine: '#b98b45',
    skin: '#b4ad63',
    skinDark: '#9a9452',
    nail: '#f6ecd2',
  },
  parts: [
    {
      id: 'body',
      role: 'body',
      pivot: [150, 160],
      shapes: [
        {
          d: smooth([
            [37, 150],
            [42, 106],
            [63, 64],
            [100, 36],
            [150, 25],
            [200, 36],
            [237, 64],
            [258, 106],
            [263, 150],
            [150, 158],
          ]),
          fill: 'shell',
        },
        ...plates,
      ],
      children: [
        {
          id: 'tail',
          role: 'tail',
          behind: true,
          pivot: [46, 152],
          shapes: [{ d: capsule(46, 152, 22, 164, 8, 3.5), fill: 'skin' }],
        },
        leg('legBF', 104, true),
        leg('legFF', 228, true),
        leg('legBN', 80, false),
        leg('legFN', 204, false),
        {
          id: 'head',
          role: 'head',
          behind: true,
          pivot: [240, 150],
          shapes: [
            { d: capsule(234, 152, 270, 130, 21, 20), fill: 'skin' },
            { d: ellipse(292, 115, 33, 30), fill: 'skin' },
            { d: ellipse(296, 136, 22, 9), kind: 'detail', fill: 'skinDark', opacity: 0.35 },
            { d: ellipse(271, 124, 8, 5), kind: 'feature', fill: 'blush', opacity: 0.55 },
            { d: ellipse(316, 121, 6.5, 4.5), kind: 'feature', fill: 'blush', opacity: 0.55 },
            { d: circle(283, 109, 8.6), kind: 'feature', fill: 'eye' },
            { d: circle(286.3, 105.6, 3.3), kind: 'feature', fill: 'shine' },
            { d: circle(308, 107, 7.4), kind: 'feature', fill: 'eye' },
            { d: circle(310.8, 104, 2.8), kind: 'feature', fill: 'shine' },
            { d: 'M288 125Q297 132 306 124', kind: 'line', stroke: 'mouth', width: 3 },
          ],
        },
        {
          id: 'rim',
          pivot: [150, 152],
          shapes: [
            {
              d: smooth([
                [27, 148],
                [38, 137],
                [94, 142],
                [150, 144],
                [206, 142],
                [262, 137],
                [273, 148],
                [264, 160],
                [206, 166],
                [150, 168],
                [94, 166],
                [36, 160],
              ]),
              fill: 'rim',
            },
            ...[
              [58, 141, 54, 162],
              [93, 143, 91, 165],
              [128, 144, 127, 167],
              [172, 144, 173, 167],
              [207, 143, 209, 165],
              [242, 141, 246, 162],
            ].map(([x1, y1, x2, y2]): Shape => ({
              d: `M${x1} ${y1 + 2}L${x2} ${y2 - 2}`,
              kind: 'line',
              stroke: 'rimLine',
              width: 2.6,
            })),
          ],
        },
      ],
    },
  ],
};

export default tortoise;
