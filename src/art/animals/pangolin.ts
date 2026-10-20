import {
  capsule,
  circle,
  curve,
  ellipse,
  scalePath,
  smooth,
  spline,
  translatePath,
  tube,
  type Pt,
} from '../core/paths';
import type { AnimalDef, PartNode, Shape } from '../core/types';

const GROUND = 200;

interface Scale {
  x: number;
  y: number;
  r: number;
  ang: number;
  round?: boolean;
}

const drop = (x: number, y: number, r: number, ang: number): string =>
  smooth(
    Array.from({ length: 8 }, (_, k): Pt => {
      const a = ((ang + k * 45) * Math.PI) / 180;
      const rr = k === 0 ? r * 1.38 : r;
      return [x + rr * Math.cos(a), y + rr * Math.sin(a)];
    }),
    true,
    0.9,
  );

const scaleShapes = (scales: Scale[]): Shape[] =>
  scales.flatMap(({ x, y, r, ang, round }) => {
    const back = ((ang + 180) * Math.PI) / 180;
    const ix = x + Math.cos(back) * r * 0.22;
    const iy = y + Math.sin(back) * r * 0.22;
    return [
      {
        d: round ? circle(x, y, r) : drop(x, y, r, ang),
        kind: 'detail' as const,
        fill: 'scaleRim',
      },
      {
        d: round ? circle(ix, iy, r * 0.78) : drop(ix, iy, r * 0.78, ang),
        kind: 'detail' as const,
        fill: 'scaleLight',
      },
    ];
  });

const BODY = smooth([
  [112, 162],
  [106, 126],
  [120, 92],
  [148, 68],
  [188, 56],
  [228, 62],
  [258, 86],
  [276, 120],
  [274, 156],
  [246, 170],
  [190, 174],
  [140, 170],
]);

const bodyScales = (): Scale[] => {
  const out: Scale[] = [];
  let row = 0;
  for (let y = 48; y <= 182; y += 17, row++) {
    for (let x = 96 + (row % 2) * 11; x <= 292; x += 22) {
      out.push({ x, y, r: 16, ang: 135, round: true });
    }
  }
  return out.sort((a, b) => a.x - 0.9 * a.y - (b.x - 0.9 * b.y));
};

const TAIL: Pt[] = [
  [126, 124],
  [96, 140],
  [66, 156],
  [40, 160],
  [22, 150],
  [14, 132],
];
const tailRadius = (t: number) => 22 - 16 * t;
const tailLine = spline(TAIL, 40);

const tailScales = (): Scale[] => {
  const out: Scale[] = [];
  for (let i = tailLine.length - 5; i >= 1; i -= 4) {
    const t = i / (tailLine.length - 1);
    const [x, y] = tailLine[i];
    const [ax, ay] = tailLine[i - 1];
    const [bx, by] = tailLine[i + 1];
    const len = Math.hypot(bx - ax, by - ay) || 1;
    const ux = (bx - ax) / len;
    const uy = (by - ay) / len;
    const r = tailRadius(t);
    const ang = (Math.atan2(uy, ux) * 180) / Math.PI;
    for (const side of [-0.5, 0.5]) {
      out.push({ x: x - uy * side * r, y: y + ux * side * r, r: r * 0.66, ang });
    }
  }
  return out;
};

const claws = (x: number, far: boolean): Shape[] =>
  [0, 7, 14].map((dx) => ({
    d: tube(
      [
        [x + dx, GROUND - 8],
        [x + dx + 6, GROUND - 7],
        [x + dx + 9, GROUND - 2],
      ],
      (u) => 3 - 1.2 * u,
      16,
    ),
    fill: far ? 'clawDark' : 'claw',
  }));

const leg = (id: string, x: number, far: boolean): PartNode => {
  const fill = far ? 'legDark' : 'leg';
  return {
    id,
    role: id,
    behind: true,
    pivot: [x, 156],
    shapes: [
      ...claws(x - 2, far),
      { d: capsule(x, 156, x + 1, 184, 13, 11), fill },
      { d: ellipse(x + 2, GROUND - 9, 14, 8), fill },
    ],
  };
};

const NECK: Pt = [258, 140];
const grow = (shapes: Shape[]): Shape[] =>
  shapes.map((s) => ({ ...s, d: scalePath(s.d, 1.12, 1.12, NECK[0], NECK[1]) }));

const offset = (parts: PartNode[], dx: number, dy: number): PartNode[] =>
  parts.map((p): PartNode => ({
    ...p,
    pivot: p.pivot && [p.pivot[0] + dx, p.pivot[1] + dy],
    shapes: p.shapes?.map((s) => ({ ...s, d: translatePath(s.d, dx, dy) })),
    children: p.children && offset(p.children, dx, dy),
  }));

const LIFT = 24;

const pangolin: AnimalDef = {
  id: 'pangolin',
  name: 'Pangolin',
  kind: 'animal',
  aliases: ['scaly anteater', 'scaly ant eater', 'pinecone animal'],
  group: 'mammal',
  habitats: ['jungle'],
  box: [358, GROUND - LIFT],
  size: 110,
  locomotion: 'walk4',
  gait: { period: 1.6, stride: 42, swing: 14 },
  sound: 'pangolin',
  palette: {
    scale: '#b57c48',
    scaleLight: '#d39c63',
    scaleRim: '#8c5a31',
    leg: '#9a6a40',
    legDark: '#7f5634',
    skin: '#f2cdb0',
    skinDark: '#e2b593',
    claw: '#f6ead2',
    clawDark: '#dccbaa',
    nose: '#6a4234',
  },
  parts: offset(
    [
      {
        id: 'body',
        role: 'body',
        pivot: [190, 160],
        shapes: [{ d: BODY, fill: 'scale' }, ...scaleShapes(bodyScales())],
        children: [
          {
            id: 'tail',
            role: 'tail',
            pivot: [126, 124],
            behind: true,
            motion: { rotate: 5, phase: 0.25 },
            shapes: [
              { d: tube(TAIL, tailRadius, 80), fill: 'scale' },
              ...scaleShapes(tailScales()),
            ],
          },
          leg('legBF', 158, true),
          leg('legFF', 252, true),
          leg('legBN', 136, false),
          leg('legFN', 232, false),
          {
            id: 'head',
            role: 'head',
            pivot: NECK,
            shapes: grow([
              {
                d: smooth([
                  [250, 108],
                  [272, 96],
                  [298, 100],
                  [320, 114],
                  [338, 132],
                  [342, 146],
                  [332, 153],
                  [308, 154],
                  [282, 152],
                  [260, 144],
                  [248, 126],
                ]),
                fill: 'skin',
              },
              { d: ellipse(270, 104, 28, 16, 14), kind: 'detail', fill: 'scale' },
              { d: circle(258, 104, 9), kind: 'detail', fill: 'scaleRim' },
              { d: circle(260, 102, 7), kind: 'detail', fill: 'scaleLight' },
              { d: circle(276, 106, 9), kind: 'detail', fill: 'scaleRim' },
              { d: circle(278, 104, 7), kind: 'detail', fill: 'scaleLight' },
              { d: ellipse(300, 150, 30, 8), kind: 'detail', fill: 'skinDark' },
              { d: ellipse(282, 138, 8, 5), kind: 'feature', fill: 'blush', opacity: 0.55 },
              { d: circle(288, 122, 8), kind: 'feature', fill: 'eye' },
              { d: circle(291, 118.6, 3), kind: 'feature', fill: 'shine' },
              { d: circle(312, 122, 6.2), kind: 'feature', fill: 'eye' },
              { d: circle(314.3, 119.6, 2.4), kind: 'feature', fill: 'shine' },
              { d: ellipse(339, 143, 4.5, 3.5, 30), kind: 'feature', fill: 'nose' },
              { d: curve(306, 145, 324, 145, 4), kind: 'line', stroke: 'mouth', width: 2.6 },
            ]),
          },
        ],
      },
    ],
    0,
    -LIFT,
  ),
};

export default pangolin;
