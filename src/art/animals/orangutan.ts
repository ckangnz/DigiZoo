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

const GROUND = 300;

function shaggy(
  cx: number,
  cy: number,
  rx: number,
  ry: number,
  n: number,
  tuft: number,
  from: number,
  sweep: number,
): string {
  const pts: Pt[] = [];
  for (let i = 0; i < n * 2; i++) {
    const a = (i / (n * 2)) * Math.PI * 2;
    const down = Math.sin(a);
    const tip = i % 2 === 1 && down > from;
    const k = tip ? 1 + tuft * Math.min(1, (down - from) / (1 - from) + 0.35) : 1;
    const aa = tip ? a + sweep : a;
    pts.push([cx + rx * k * Math.cos(aa), cy + ry * k * Math.sin(aa)]);
  }
  return smooth(pts, true, 0.75);
}

const leg = (id: string, x: number, far: boolean): PartNode => ({
  id,
  role: id,
  behind: true,
  pivot: [x, 236],
  shapes: [
    { d: capsule(x, 236, x + 3, 274, 15, 12.5), fill: far ? 'hairDark' : 'hair' },
    { d: ellipse(x + 9, GROUND - 10, 18, 9), fill: far ? 'skinDark' : 'skin' },
  ],
});

const arm = (id: string, x: number, dir: number, far: boolean): PartNode => {
  const fill = far ? 'hairDark' : 'hair';
  const line: Pt[] = [
    [x, 160],
    [x + dir * 10, 210],
    [x + dir * 14, 262],
  ];
  return {
    id,
    role: id,
    behind: far,
    pivot: [x, 160],
    motion: { rotate: 11, phase: far ? 0.3 : 0.22 },
    shapes: [
      { d: leaf(x + dir * 8, 172, 34, 8, 90 - dir * 30), fill },
      { d: leaf(x + dir * 11, 198, 34, 8, 90 - dir * 26), fill },
      { d: leaf(x + dir * 14, 224, 30, 7, 90 - dir * 22), fill },
      { d: tube(line, (t) => 14 - 3.5 * t, 40), fill },
      { d: ellipse(x + dir * 15, 272, 12, 14), fill: far ? 'skinDark' : 'skin' },
      ...(far
        ? []
        : [
            {
              d: `M${x + dir * 9} 276L${x + dir * 9} 282`,
              kind: 'line' as const,
              stroke: 'skinLine',
              width: 2.2,
            },
            {
              d: `M${x + dir * 16} 278L${x + dir * 16} 284`,
              kind: 'line' as const,
              stroke: 'skinLine',
              width: 2.2,
            },
          ]),
    ],
  };
};

const tuft = (x: number, y: number, len: number, angle: number): Shape => ({
  d: leaf(x, y, len, 8, angle),
  fill: 'hair',
});

const strand = (x: number, y: number, dx: number, dy: number): Shape => ({
  d: `M${x} ${y}q${dx * 0.7} ${dy * 0.35} ${dx} ${dy}`,
  kind: 'line',
  stroke: 'hairDark',
  width: 2.6,
});

const offset = (parts: PartNode[], dx: number, dy: number): PartNode[] =>
  parts.map((p): PartNode => ({
    ...p,
    pivot: p.pivot && [p.pivot[0] + dx, p.pivot[1] + dy],
    shapes: p.shapes?.map((s) => ({ ...s, d: translatePath(s.d, dx, dy) })),
    children: p.children && offset(p.children, dx, dy),
  }));

const orangutan: AnimalDef = {
  id: 'orangutan',
  name: 'Orangutan',
  kind: 'animal',
  aliases: ['orang utan', 'orang-utan', 'ape', 'red ape', 'great ape'],
  group: 'mammal',
  habitats: ['jungle'],
  box: [196, GROUND],
  size: 220,
  locomotion: 'walk2',
  gait: { stride: 74, swing: 22 },
  sound: 'orangutan',
  palette: {
    hair: '#d4622b',
    hairDark: '#b44e21',
    belly: '#e88c56',
    skin: '#b98468',
    skinDark: '#9f6d55',
    skinLight: '#f2cba5',
    skinLine: '#8a5a45',
    nose: '#6b4033',
  },
  parts: offset(
    [
      {
        id: 'body',
        role: 'body',
        pivot: [136, 240],
        shapes: [
          { d: shaggy(136, 196, 54, 60, 16, 0.1, 0.1, -0.05), fill: 'hair' },
          { d: ellipse(138, 206, 30, 38), kind: 'detail', fill: 'belly' },
          strand(100, 176, -3, 18),
          strand(96, 210, -3, 20),
          strand(172, 178, 3, 18),
          strand(176, 212, 3, 20),
        ],
        children: [
          leg('legF', 118, true),
          arm('armF', 90, -1, true),
          leg('legN', 152, false),
          {
            id: 'head',
            role: 'head',
            pivot: [138, 140],
            shapes: [
              tuft(138, 52, 34, -88),
              tuft(132, 54, 30, -118),
              tuft(146, 54, 30, -60),
              { d: shaggy(138, 94, 58, 50, 16, 0.08, -1, -0.06), fill: 'hair' },
              {
                d: smooth([
                  [140, 66],
                  [164, 70],
                  [178, 90],
                  [178, 116],
                  [168, 138],
                  [150, 152],
                  [130, 152],
                  [112, 138],
                  [102, 116],
                  [102, 90],
                  [116, 70],
                ]),
                fill: 'skin',
              },
              { d: ellipse(127, 97, 15, 14), kind: 'detail', fill: 'skinLight' },
              { d: ellipse(153, 97, 15, 14), kind: 'detail', fill: 'skinLight' },
              { d: ellipse(140, 128, 28, 21), kind: 'detail', fill: 'skinLight' },
              { d: ellipse(113, 120, 8, 5), kind: 'feature', fill: 'blush', opacity: 0.5 },
              { d: ellipse(167, 120, 8, 5), kind: 'feature', fill: 'blush', opacity: 0.5 },
              { d: circle(128, 98, 7.5), kind: 'feature', fill: 'eye' },
              { d: circle(154, 98, 7.5), kind: 'feature', fill: 'eye' },
              { d: circle(130.8, 95, 2.8), kind: 'feature', fill: 'shine' },
              { d: circle(156.8, 95, 2.8), kind: 'feature', fill: 'shine' },
              { d: ellipse(136.5, 116, 2.2, 1.8), kind: 'feature', fill: 'nose' },
              { d: ellipse(143.5, 116, 2.2, 1.8), kind: 'feature', fill: 'nose' },
              { d: curve(126, 129, 154, 129, 7), kind: 'line', stroke: 'mouth', width: 3 },
            ],
          },
          arm('armN', 182, 1, false),
        ],
      },
    ],
    -38,
    0,
  ),
};

export default orangutan;
