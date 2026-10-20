import { circle, curve, ellipse, smooth, translatePath, tube, type Pt } from '../core/paths';
import type { AnimalDef, PartNode } from '../core/types';

const LIVER: Pt[] = [
  [42, 198],
  [22, 150],
  [30, 92],
  [66, 48],
  [126, 26],
  [196, 28],
  [258, 44],
  [306, 70],
  [330, 96],
  [318, 112],
  [270, 130],
  [212, 160],
  [150, 190],
  [96, 210],
  [62, 212],
];

const offset = (parts: PartNode[], dx: number, dy: number): PartNode[] =>
  parts.map((p) => ({
    ...p,
    ...(p.pivot ? { pivot: [p.pivot[0] + dx, p.pivot[1] + dy] as Pt } : {}),
    ...(p.shapes ? { shapes: p.shapes.map((s) => ({ ...s, d: translatePath(s.d, dx, dy) })) } : {}),
    ...(p.children ? { children: offset(p.children, dx, dy) } : {}),
  }));

const liver: AnimalDef = {
  id: 'liver',
  name: 'Liver',
  kind: 'object',
  aliases: ['livers'],
  group: 'body',
  habitats: ['body'],
  box: [330, 212],
  size: 200,
  locomotion: 'wobble',
  sound: 'liver',
  palette: {
    liver: '#c55e4f',
    groove: '#a2483b',
    light: '#e48b79',
  },
  parts: offset(
    [
      {
        id: 'liver',
        pivot: [170, 120],
        shapes: [
          { d: smooth(LIVER), fill: 'liver' },
          { d: ellipse(80, 72, 24, 11, -30), kind: 'detail', fill: 'light' },
          { d: circle(110, 52, 5), kind: 'detail', fill: 'light' },
          {
            d: tube(
              [
                [214, 24],
                [208, 80],
                [198, 130],
                [186, 172],
              ],
              (t) => 0.8 + 2.4 * Math.sin(Math.PI * t),
            ),
            kind: 'detail',
            fill: 'groove',
          },
          { d: ellipse(66, 148, 12, 7.5), kind: 'feature', fill: 'blush', opacity: 0.55 },
          { d: ellipse(160, 140, 12, 7.5), kind: 'feature', fill: 'blush', opacity: 0.55 },
          { d: circle(88, 120, 13.5), kind: 'feature', fill: 'eye' },
          { d: circle(138, 114, 13.5), kind: 'feature', fill: 'eye' },
          { d: circle(92.8, 114.5, 5.1), kind: 'feature', fill: 'shine' },
          { d: circle(142.8, 108.5, 5.1), kind: 'feature', fill: 'shine' },
          { d: curve(102, 140, 124, 137, 7), kind: 'line', stroke: 'mouth', width: 3.4 },
        ],
      },
    ],
    -11,
    -13,
  ),
};

export default liver;
