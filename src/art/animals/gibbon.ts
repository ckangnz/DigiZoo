import { capsule, circle, curve, ellipse, translatePath, tube, type Pt } from '../core/paths';
import type { AnimalDef, PartNode } from '../core/types';

const GROUND = 300;

const leg = (id: string, x: number, far: boolean): PartNode => ({
  id,
  role: id,
  behind: true,
  pivot: [x, 246],
  shapes: [
    { d: capsule(x, 246, x + 2, 282, 10.5, 9), fill: far ? 'furDark' : 'fur' },
    { d: ellipse(x + 6, GROUND - 8, 14, 7.5), fill: far ? 'handDark' : 'hand' },
  ],
});

const arm = (id: string, x: number, dir: number, far: boolean): PartNode => {
  const line: Pt[] = [
    [x, 200],
    [x + dir * 24, 184],
    [x + dir * 40, 152],
    [x + dir * 46, 112],
    [x + dir * 46, 80],
  ];
  return {
    id,
    role: id,
    behind: true,
    pivot: [x, 200],
    motion: { rotate: 12, phase: 0.5 },
    shapes: [
      { d: tube(line, (t) => 10 - 2.5 * t, 60), fill: far ? 'furDark' : 'fur' },
      { d: circle(x + dir * 46, 72, 11), fill: far ? 'handDark' : 'hand' },
    ],
  };
};

const offset = (parts: PartNode[], dx: number, dy: number): PartNode[] =>
  parts.map((p): PartNode => ({
    ...p,
    pivot: p.pivot && [p.pivot[0] + dx, p.pivot[1] + dy],
    shapes: p.shapes?.map((s) => ({ ...s, d: translatePath(s.d, dx, dy) })),
    children: p.children && offset(p.children, dx, dy),
  }));

const gibbon: AnimalDef = {
  id: 'gibbon',
  name: 'Gibbon',
  kind: 'animal',
  aliases: ['lar gibbon', 'white-handed gibbon', 'white handed gibbon', 'ape', 'lesser ape'],
  group: 'mammal',
  habitats: ['jungle'],
  box: [236, GROUND],
  size: 170,
  locomotion: 'walk2',
  gait: { stride: 62, swing: 22 },
  sound: 'gibbon',
  palette: {
    fur: '#e2c48f',
    furDark: '#c9a874',
    belly: '#f0dcb3',
    ring: '#fffaf0',
    face: '#83675b',
    faceLight: '#a08072',
    hand: '#fff4e4',
    handDark: '#e6d6bd',
    nose: '#3c2a24',
    smile: '#e8c3b4',
  },
  parts: offset(
    [
      {
        id: 'body',
        role: 'body',
        pivot: [130, 252],
        shapes: [
          { d: ellipse(130, 216, 38, 42), fill: 'fur' },
          { d: ellipse(132, 224, 22, 28), kind: 'detail', fill: 'belly' },
        ],
        children: [
          leg('legF', 116, true),
          arm('armF', 100, -1, true),
          arm('armN', 160, 1, false),
          leg('legN', 142, false),
          {
            id: 'head',
            role: 'head',
            pivot: [130, 180],
            shapes: [
              { d: circle(89, 148, 7.5), fill: 'face' },
              { d: circle(171, 148, 7.5), fill: 'face' },
              { d: circle(130, 140, 44), fill: 'fur' },
              { d: ellipse(130, 146, 33, 35), kind: 'detail', fill: 'ring' },
              { d: ellipse(130, 148, 26, 28), kind: 'detail', fill: 'face' },
              { d: ellipse(130, 162, 15, 11), kind: 'detail', fill: 'faceLight' },
              { d: ellipse(111, 158, 6.5, 4.2), kind: 'feature', fill: 'blush', opacity: 0.55 },
              { d: ellipse(149, 158, 6.5, 4.2), kind: 'feature', fill: 'blush', opacity: 0.55 },
              { d: circle(119.5, 142, 7.6), kind: 'feature', fill: 'eye' },
              { d: circle(140.5, 142, 7.6), kind: 'feature', fill: 'eye' },
              { d: circle(122.3, 138.8, 2.9), kind: 'feature', fill: 'shine' },
              { d: circle(143.3, 138.8, 2.9), kind: 'feature', fill: 'shine' },
              { d: ellipse(127, 155, 1.8, 1.5), kind: 'feature', fill: 'nose' },
              { d: ellipse(133, 155, 1.8, 1.5), kind: 'feature', fill: 'nose' },
              { d: curve(122, 164, 138, 164, 5), kind: 'line', stroke: 'smile', width: 2.6 },
            ],
          },
        ],
      },
    ],
    -12,
    0,
  ),
};

export default gibbon;
