import { circle, curve, ellipse, smooth, translatePath, tube, type Pt } from '../core/paths';
import type { AnimalDef, PartNode } from '../core/types';

const MID = 120;

const BODY: Pt[] = [
  [MID, 50],
  [166, 58],
  [196, 94],
  [202, 140],
  [184, 182],
  [152, 206],
  [MID + 9, 214],
  [MID - 9, 214],
  [88, 206],
  [56, 182],
  [38, 140],
  [44, 94],
  [74, 58],
];

function liquid(): string {
  let d = 'M20 166';
  for (let x = 20; x <= 220; x += 10) {
    d += `L${x} ${(166 + 3.5 * Math.sin(x / 12)).toFixed(2)}`;
  }
  return d + 'L220 240L20 240Z';
}

const ureter = (id: string, side: 1 | -1, phase: number): PartNode => {
  const x = (v: number) => MID + side * (v - MID);
  return {
    id,
    role: 'arm',
    phase,
    behind: true,
    pivot: [x(68), 84],
    shapes: [
      {
        d: tube(
          [
            [x(76), 96],
            [x(62), 72],
            [x(50), 44],
            [x(42), 16],
          ],
          8,
        ),
        fill: 'tube',
      },
    ],
  };
};

const offset = (parts: PartNode[], dx: number, dy: number): PartNode[] =>
  parts.map((p) => ({
    ...p,
    ...(p.pivot ? { pivot: [p.pivot[0] + dx, p.pivot[1] + dy] as Pt } : {}),
    ...(p.shapes ? { shapes: p.shapes.map((s) => ({ ...s, d: translatePath(s.d, dx, dy) })) } : {}),
    ...(p.children ? { children: offset(p.children, dx, dy) } : {}),
  }));

const bladder: AnimalDef = {
  id: 'bladder',
  name: 'Bladder',
  kind: 'object',
  aliases: ['pee', 'wee', 'urine'],
  group: 'body',
  habitats: ['body'],
  box: [190, 251],
  size: 140,
  locomotion: 'beat',
  sound: 'bladder',
  palette: {
    body: '#ffd6b6',
    liquid: '#ffd27a',
    light: '#fff1e4',
    tube: '#f7bf8c',
    blush: '#ff7f95',
  },
  parts: offset(
    [
      {
        id: 'body',
        pivot: [MID, 140],
        shapes: [
          { d: smooth(BODY), fill: 'body' },
          { d: liquid(), kind: 'detail', fill: 'liquid' },
          { d: ellipse(76, 92, 11, 20, 30), kind: 'detail', fill: 'light' },
          { d: circle(96, 70, 5), kind: 'detail', fill: 'light' },
          { d: ellipse(80, 146, 11, 7), kind: 'feature', fill: 'blush', opacity: 0.55 },
          { d: ellipse(160, 146, 11, 7), kind: 'feature', fill: 'blush', opacity: 0.55 },
          { d: circle(98, 124, 12.5), kind: 'feature', fill: 'eye' },
          { d: circle(142, 124, 12.5), kind: 'feature', fill: 'eye' },
          { d: circle(102.5, 119, 4.7), kind: 'feature', fill: 'shine' },
          { d: circle(146.5, 119, 4.7), kind: 'feature', fill: 'shine' },
          { d: curve(110, 145, 130, 145, 6.5), kind: 'line', stroke: 'mouth', width: 3.3 },
        ],
        children: [
          ureter('ureterL', 1, 0),
          ureter('ureterR', -1, 0.5),
          {
            id: 'urethra',
            behind: true,
            shapes: [
              {
                d: tube(
                  [
                    [MID, 200],
                    [MID, 218],
                    [MID, 230],
                  ],
                  9,
                ),
                fill: 'tube',
              },
            ],
          },
        ],
      },
    ],
    -25,
    2,
  ),
};

export default bladder;
