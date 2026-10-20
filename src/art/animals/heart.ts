import { circle, curve, ellipse, smooth, translatePath, tube, type Pt } from '../core/paths';
import type { AnimalDef, PartNode } from '../core/types';

const BODY: Pt[] = [
  [62, 162],
  [80, 130],
  [120, 120],
  [160, 134],
  [204, 126],
  [240, 138],
  [262, 172],
  [264, 222],
  [244, 264],
  [210, 296],
  [182, 313],
  [156, 306],
  [114, 282],
  [76, 244],
  [54, 202],
];

const vessel = (
  id: string,
  line: Pt[],
  radius: number,
  fill: string,
  shine?: { line: Pt[]; fill: string },
): PartNode => ({
  id,
  behind: true,
  shapes: [
    { d: tube(line, radius), fill },
    ...(shine
      ? [
          {
            d: tube(shine.line, (t: number) => 1.5 + 3 * Math.sin(Math.PI * t)),
            kind: 'detail' as const,
            fill: shine.fill,
          },
        ]
      : []),
  ],
});

const offset = (parts: PartNode[], dx: number, dy: number): PartNode[] =>
  parts.map((p) => ({
    ...p,
    ...(p.pivot ? { pivot: [p.pivot[0] + dx, p.pivot[1] + dy] as Pt } : {}),
    ...(p.shapes ? { shapes: p.shapes.map((s) => ({ ...s, d: translatePath(s.d, dx, dy) })) } : {}),
    ...(p.children ? { children: offset(p.children, dx, dy) } : {}),
  }));

const heart: AnimalDef = {
  id: 'heart',
  name: 'Heart',
  kind: 'object',
  aliases: ['ticker', 'heartbeat', 'love heart', 'beating heart'],
  group: 'body',
  habitats: ['body'],
  box: [244, 322],
  size: 200,
  locomotion: 'beat',
  sound: 'heart',
  palette: {
    heart: '#f25c6e',
    groove: '#d9435a',
    light: '#ff97a6',
    aorta: '#e8485d',
    aortaLight: '#ff7f90',
    vein: '#97a5f0',
    veinLight: '#bcc6ff',
  },
  parts: offset(
    [
      {
        id: 'body',
        pivot: [150, 200],
        shapes: [
          { d: smooth(BODY), fill: 'heart' },
          { d: ellipse(90, 186, 14, 28, 26), kind: 'detail', fill: 'light' },
          { d: circle(108, 150, 6), kind: 'detail', fill: 'light' },
          {
            d: tube(
              [
                [228, 142],
                [244, 200],
                [230, 254],
                [196, 304],
              ],
              (t) => 0.8 + 2.2 * Math.sin(Math.PI * t),
            ),
            kind: 'detail',
            fill: 'groove',
          },
          { d: ellipse(106, 238, 12, 7.5), kind: 'feature', fill: 'blush', opacity: 0.55 },
          { d: ellipse(206, 236, 12, 7.5), kind: 'feature', fill: 'blush', opacity: 0.55 },
          { d: circle(126, 212, 13.5), kind: 'feature', fill: 'eye' },
          { d: circle(186, 210, 13.5), kind: 'feature', fill: 'eye' },
          { d: circle(130.8, 206.5, 5.1), kind: 'feature', fill: 'shine' },
          { d: circle(190.8, 204.5, 5.1), kind: 'feature', fill: 'shine' },
          { d: curve(145, 233, 167, 233, 7), kind: 'line', stroke: 'mouth', width: 3.4 },
        ],
        children: [
          vessel(
            'branch1',
            [
              [168, 70],
              [162, 46],
              [158, 30],
            ],
            9,
            'aorta',
          ),
          vessel(
            'branch2',
            [
              [194, 60],
              [194, 36],
              [195, 20],
            ],
            9,
            'aorta',
          ),
          vessel(
            'branch3',
            [
              [220, 64],
              [228, 42],
              [234, 28],
            ],
            8,
            'aorta',
          ),
          vessel(
            'aorta',
            [
              [156, 160],
              [154, 112],
              [166, 80],
              [196, 64],
              [228, 70],
              [248, 96],
              [252, 140],
            ],
            22,
            'aorta',
            {
              line: [
                [146, 140],
                [146, 108],
                [160, 80],
                [190, 62],
              ],
              fill: 'aortaLight',
            },
          ),
          vessel(
            'cava',
            [
              [98, 160],
              [94, 112],
              [96, 64],
            ],
            17,
            'vein',
            {
              line: [
                [88, 150],
                [86, 110],
                [88, 66],
              ],
              fill: 'veinLight',
            },
          ),
          vessel(
            'pulmonary',
            [
              [178, 160],
              [188, 122],
              [212, 106],
              [246, 112],
            ],
            15,
            'vein',
          ),
        ],
      },
    ],
    -42,
    0,
  ),
};

export default heart;
