import { capsule, circle, ellipse, smooth, translatePath } from '../core/paths';
import type { AnimalDef, PartNode } from '../core/types';

const HIP = 214;
const GROUND = 296;
const CX = 292;

const leg = (id: string, x: number, far: boolean): PartNode => ({
  id,
  role: id,
  behind: true,
  pivot: [x, HIP],
  shapes: [
    { d: capsule(x, HIP, x, GROUND - 26, 23, 22), fill: far ? 'furDark' : 'fur' },
    { d: ellipse(x + 6, GROUND - 15, 27, 15), fill: far ? 'furDark' : 'fur' },
    ...(far
      ? []
      : [
          {
            d: `M${x + 10} ${GROUND - 9}L${x + 10} ${GROUND - 2}`,
            kind: 'line' as const,
            stroke: 'toe',
            width: 2.8,
          },
          {
            d: `M${x + 20} ${GROUND - 10}L${x + 20} ${GROUND - 3}`,
            kind: 'line' as const,
            stroke: 'toe',
            width: 2.8,
          },
        ]),
  ],
});

const offset = (parts: PartNode[], dx: number, dy: number): PartNode[] =>
  parts.map((p): PartNode => ({
    ...p,
    pivot: p.pivot && [p.pivot[0] + dx, p.pivot[1] + dy],
    shapes: p.shapes?.map((s) => ({ ...s, d: translatePath(s.d, dx, dy) })),
    children: p.children && offset(p.children, dx, dy),
  }));

const bear: AnimalDef = {
  id: 'bear',
  name: 'Bear',
  kind: 'animal',
  aliases: ['brown bear', 'grizzly', 'teddy bear', 'bear cub'],
  group: 'mammal',
  habitats: ['forest', 'cave'],
  box: [312, GROUND - 59],
  size: 280,
  locomotion: 'walk4',
  gait: { period: 1.1, stride: 100, swing: 18 },
  sound: 'bear',
  palette: {
    fur: '#a96f3d',
    furDark: '#8d5a31',
    belly: '#c48f5c',
    muzzle: '#f2d6ae',
    earInner: '#d9a87c',
    nose: '#3a2420',
    toe: '#74471f',
  },
  parts: offset(
    [
      {
        id: 'body',
        role: 'body',
        pivot: [176, HIP],
        shapes: [
          {
            d: smooth([
              [68, 186],
              [80, 150],
              [112, 128],
              [160, 120],
              [208, 110],
              [248, 118],
              [274, 148],
              [278, 192],
              [258, 228],
              [204, 244],
              [140, 246],
              [94, 236],
              [70, 214],
            ]),
            fill: 'fur',
          },
          { d: ellipse(176, 250, 86, 26), kind: 'detail', fill: 'belly' },
        ],
        children: [
          {
            id: 'tail',
            role: 'tail',
            pivot: [76, 170],
            behind: true,
            shapes: [{ d: circle(70, 168, 14), fill: 'fur' }],
          },
          leg('legBF', 134, true),
          leg('legFF', 252, true),
          leg('legBN', 104, false),
          leg('legFN', 222, false),
          {
            id: 'head',
            role: 'head',
            pivot: [270, 180],
            shapes: [
              { d: circle(242, 84, 23), fill: 'fur' },
              { d: circle(342, 84, 23), fill: 'fur' },
              { d: ellipse(CX, 138, 68, 62), fill: 'fur' },
              { d: circle(241, 83, 12), kind: 'detail', fill: 'earInner' },
              { d: circle(343, 83, 12), kind: 'detail', fill: 'earInner' },
              { d: ellipse(CX, 166, 36, 27), kind: 'detail', fill: 'muzzle' },
              { d: ellipse(250, 160, 11, 7), kind: 'feature', fill: 'blush', opacity: 0.55 },
              { d: ellipse(334, 160, 11, 7), kind: 'feature', fill: 'blush', opacity: 0.55 },
              { d: circle(265, 128, 10), kind: 'feature', fill: 'eye' },
              { d: circle(319, 128, 10), kind: 'feature', fill: 'eye' },
              { d: circle(268.8, 124, 3.8), kind: 'feature', fill: 'shine' },
              { d: circle(322.8, 124, 3.8), kind: 'feature', fill: 'shine' },
              {
                d: `M${CX - 13} 150Q${CX} 143 ${CX + 13} 150Q${CX + 11} 160 ${CX} 163Q${CX - 11} 160 ${CX - 13} 150Z`,
                kind: 'feature',
                fill: 'nose',
              },
              {
                d: ellipse(CX - 4, 149, 4, 2.4, -10),
                kind: 'feature',
                fill: 'white',
                opacity: 0.5,
              },
              {
                d: `M${CX} 163Q${CX} 173 ${CX - 10} 175Q${CX - 16} 175 ${CX - 18} 170`,
                kind: 'line',
                stroke: 'mouth',
                width: 3,
              },
              {
                d: `M${CX} 163Q${CX} 173 ${CX + 10} 175Q${CX + 16} 175 ${CX + 18} 170`,
                kind: 'line',
                stroke: 'mouth',
                width: 3,
              },
            ],
          },
        ],
      },
    ],
    -54,
    -59,
  ),
};

export default bear;
