import { capsule, circle, curve, ellipse, smooth, spline, tube, type Pt } from '../core/paths';
import type { AnimalDef, PartNode, Shape } from '../core/types';

const CX = 92;
const GROUND = 302;

const knob = (x: number, y: number, r: number, fill: string): Shape[] => [
  { d: circle(x - r * 0.55, y, r * 0.8), fill },
  { d: circle(x + r * 0.55, y, r * 0.8), fill },
];

const leg = (id: string, x: number, far: boolean): PartNode => {
  const fill = far ? 'boneDark' : 'bone';
  return {
    id,
    role: id,
    behind: true,
    pivot: [x, 250],
    shapes: [
      { d: capsule(x, 250, x, 272, 7.5), fill },
      { d: circle(x, 274, 9.2), fill },
      { d: capsule(x, 276, x + 1, 290, 7), fill },
      {
        d: smooth([
          [x - 10, 291],
          [x + 6, 287],
          [x + 21, 290],
          [x + 24, 297],
          [x + 10, GROUND],
          [x - 8, GROUND - 1],
          [x - 13, 296],
        ]),
        fill,
      },
    ],
  };
};

const arm = (id: string, x: number, dir: 1 | -1, far: boolean): PartNode => {
  const fill = far ? 'boneDark' : 'bone';
  const elbow: Pt = [x + dir * 4, 199];
  const wrist: Pt = [x + dir * 8, 222];
  return {
    id,
    role: id,
    behind: far,
    pivot: [x, 172],
    shapes: [
      { d: circle(x, 172, 8.5), fill },
      { d: capsule(x, 174, elbow[0], elbow[1], 6.6), fill },
      { d: circle(elbow[0], elbow[1], 8.4), fill },
      { d: capsule(elbow[0], elbow[1], wrist[0], wrist[1], 6.2), fill },
      { d: circle(wrist[0], wrist[1] + 6, 10.5), fill },
      ...knob(wrist[0], wrist[1] + 16, 6.4, fill),
    ],
  };
};

const RIBS: number[] = [182, 197, 211];

const SKULL: Pt[] = [
  [CX + 4, 16],
  [CX + 48, 26],
  [CX + 70, 60],
  [CX + 70, 98],
  [CX + 58, 120],
  [CX + 48, 130],
  [CX + 46, 146],
  [CX + 30, 156],
  [CX - 20, 156],
  [CX - 36, 146],
  [CX - 38, 130],
  [CX - 48, 120],
  [CX - 60, 98],
  [CX - 60, 60],
  [CX - 40, 26],
];

const SKULL_CENTER: Pt = [CX + 5, 88];

const inset = (pts: Pt[], k: number): Pt[] =>
  pts.map(([x, y]) => [
    SKULL_CENTER[0] + (x - SKULL_CENTER[0]) * k,
    SKULL_CENTER[1] + (y - SKULL_CENTER[1]) * k,
  ]);

function shade(): string {
  const arc = spline(inset(SKULL, 0.975).slice(2, 9), 30);
  const inner = arc.map(([x, y], i): Pt => {
    const w = Math.sin((Math.PI * i) / (arc.length - 1));
    return [x - 7 * w, y - 8 * w];
  });
  return smooth([...arc, ...inner.reverse()]);
}

const skeleton: AnimalDef = {
  id: 'skeleton',
  name: 'Skeleton',
  kind: 'character',
  aliases: ['skelly', 'skeleton friend', 'bones', 'mr bones', 'skull'],
  group: 'spooky',
  habitats: ['halloween'],
  box: [186, GROUND],
  size: 230,
  locomotion: 'walk2',
  gait: { stride: 64, swing: 22 },
  sound: 'skeleton',
  palette: {
    bone: '#f8f2e4',
    boneDark: '#e0d5c0',
    boneShade: '#ebe2d0',
    gap: '#9f95b8',
    nose: '#5a4b6e',
    teeth: '#b9ad97',
    blush: '#ff9cb5',
  },
  parts: [
    {
      id: 'body',
      role: 'body',
      pivot: [CX, 250],
      shapes: [
        { d: capsule(CX + 1, 146, CX, 170, 8), fill: 'bone' },
        { d: capsule(CX - 34, 170, CX + 34, 170, 6), fill: 'bone' },
        {
          d: smooth([
            [CX, 164],
            [CX + 24, 167],
            [CX + 34, 184],
            [CX + 31, 206],
            [CX + 20, 222],
            [CX, 228],
            [CX - 20, 222],
            [CX - 31, 206],
            [CX - 34, 184],
            [CX - 24, 167],
          ]),
          fill: 'bone',
        },
        { d: capsule(CX, 222, CX, 242, 7.5), fill: 'bone' },
        {
          d: smooth([
            [CX - 24, 236],
            [CX, 242],
            [CX + 24, 236],
            [CX + 32, 248],
            [CX + 18, 258],
            [CX, 253],
            [CX - 18, 258],
            [CX - 32, 248],
          ]),
          fill: 'bone',
        },
        ...RIBS.flatMap((y, i): Shape[] =>
          [1, -1].map((s): Shape => ({
            d: tube(
              [
                [CX + s * 7, y],
                [CX + s * 18, y],
                [CX + s * (27 - i * 2), y + 6],
              ],
              3.4 - i * 0.3,
              24,
            ),
            kind: 'detail',
            fill: 'gap',
          })),
        ),
      ],
      children: [
        leg('legF', CX - 13, true),
        arm('armF', CX - 39, -1, true),
        leg('legN', CX + 12, false),
        {
          id: 'head',
          role: 'head',
          pivot: [CX + 2, 150],
          shapes: [
            { d: smooth(SKULL), fill: 'bone' },
            { d: smooth(inset(SKULL, 0.985)), kind: 'feature', fill: 'bone' },
            { d: shade(), kind: 'feature', fill: 'boneShade' },
            { d: ellipse(CX - 28, 42, 13, 7, -30), kind: 'feature', fill: 'white' },
            { d: ellipse(CX - 42, 116, 11, 7), kind: 'feature', fill: 'blush', opacity: 0.6 },
            { d: ellipse(CX + 52, 116, 11, 7), kind: 'feature', fill: 'blush', opacity: 0.6 },
            { d: ellipse(CX - 18, 92, 16, 17), kind: 'feature', fill: 'eye' },
            { d: ellipse(CX + 28, 92, 16, 17), kind: 'feature', fill: 'eye' },
            { d: circle(CX - 12.5, 85.5, 5.8), kind: 'feature', fill: 'shine' },
            { d: circle(CX + 33.5, 85.5, 5.8), kind: 'feature', fill: 'shine' },
            { d: circle(CX - 23, 100, 2.4), kind: 'feature', fill: 'shine' },
            { d: circle(CX + 23, 100, 2.4), kind: 'feature', fill: 'shine' },
            {
              d: `M${CX + 5} 120C${CX + 1} 114 ${CX - 6} 113 ${CX - 5} 108C${CX - 4} 104 ${CX + 1} 104 ${CX + 5} 108C${CX + 9} 104 ${CX + 14} 104 ${CX + 15} 108C${CX + 16} 113 ${CX + 9} 114 ${CX + 5} 120Z`,
              kind: 'feature',
              fill: 'nose',
            },
            { d: curve(CX - 20, 128, CX + 30, 128, 9), kind: 'line', stroke: 'mouth', width: 3.2 },
            { d: `M${CX - 8} 128.5L${CX - 8} 137`, kind: 'line', stroke: 'teeth', width: 2.4 },
            { d: `M${CX + 5} 130L${CX + 5} 139.5`, kind: 'line', stroke: 'teeth', width: 2.4 },
            { d: `M${CX + 18} 128.5L${CX + 18} 137`, kind: 'line', stroke: 'teeth', width: 2.4 },
          ],
        },
        arm('armN', CX + 39, 1, false),
      ],
    },
  ],
};

export default skeleton;
