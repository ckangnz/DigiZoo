import { circle, curve, ellipse, smooth, translatePath, tube, type Pt } from '../core/paths';
import type { AnimalDef, PartNode, Shape } from '../core/types';

const MID = 170;
const CY = 106;
const K = 1.18;

const BEAN: Pt[] = [
  [0, -58],
  [26, -52],
  [38, -30],
  [30, -10],
  [22, 0],
  [30, 10],
  [38, 30],
  [26, 52],
  [0, 58],
  [-30, 50],
  [-44, 20],
  [-46, -14],
  [-32, -48],
];

function kidney(id: string, cx: number, side: 1 | -1, phase: number): PartNode {
  const p = ([x, y]: Pt): Pt => [cx + side * x * K, CY + y * K];
  const fx = (x: number) => cx + side * x;
  const face: Shape[] = [
    { d: ellipse(fx(-34), CY + 22, 10, 6.5), kind: 'feature', fill: 'blush', opacity: 0.55 },
    { d: ellipse(fx(14), CY + 22, 10, 6.5), kind: 'feature', fill: 'blush', opacity: 0.55 },
    { d: circle(fx(-26), CY, 12), kind: 'feature', fill: 'eye' },
    { d: circle(fx(6), CY, 12), kind: 'feature', fill: 'eye' },
    { d: circle(fx(-26) + 4.3, CY - 4.8, 4.5), kind: 'feature', fill: 'shine' },
    { d: circle(fx(6) + 4.3, CY - 4.8, 4.5), kind: 'feature', fill: 'shine' },
    {
      d: curve(fx(-10) - 8, CY + 20, fx(-10) + 8, CY + 20, 5.5),
      kind: 'line',
      stroke: 'mouth',
      width: 3.2,
    },
  ];
  return {
    id,
    role: 'arm',
    phase,
    pivot: p([26, 0]),
    shapes: [
      { d: smooth(BEAN.map(p)), fill: 'kidney' },
      { d: ellipse(fx(-28), CY - 42, 10, 17, side * 30), kind: 'detail', fill: 'light' },
      ...face,
    ],
  };
}

const ureter = (side: 1 | -1): string => {
  const x = (v: number) => MID + side * (v - MID);
  return tube(
    [
      [x(108), CY + 4],
      [x(128), CY + 40],
      [x(152), CY + 86],
      [MID, CY + 108],
    ],
    9,
  );
};

const offset = (parts: PartNode[], dx: number, dy: number): PartNode[] =>
  parts.map((p) => ({
    ...p,
    ...(p.pivot ? { pivot: [p.pivot[0] + dx, p.pivot[1] + dy] as Pt } : {}),
    ...(p.shapes ? { shapes: p.shapes.map((s) => ({ ...s, d: translatePath(s.d, dx, dy) })) } : {}),
    ...(p.children ? { children: offset(p.children, dx, dy) } : {}),
  }));

const kidneys: AnimalDef = {
  id: 'kidneys',
  name: 'Kidneys',
  kind: 'object',
  aliases: ['kidney', 'kidney bean'],
  group: 'body',
  habitats: ['body'],
  box: [300, 242],
  size: 180,
  locomotion: 'wobble',
  sound: 'kidneys',
  palette: {
    kidney: '#cf5f63',
    light: '#ec9090',
    tube: '#ffd48a',
  },
  parts: offset(
    [
      {
        id: 'tubes',
        pivot: [MID, CY],
        shapes: [
          { d: ureter(1), fill: 'tube' },
          { d: ureter(-1), fill: 'tube' },
          {
            d: tube(
              [
                [MID, CY + 100],
                [MID, CY + 124],
                [MID, CY + 140],
              ],
              10,
            ),
            fill: 'tube',
          },
        ],
        children: [kidney('kidneyL', 86, 1, 0), kidney('kidneyR', 2 * MID - 86, -1, 0.5)],
      },
    ],
    -20,
    -26,
  ),
};

export default kidneys;
