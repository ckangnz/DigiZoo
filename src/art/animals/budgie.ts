import { capsule, circle, ellipse, leaf, smooth, translatePath, tube } from '../core/paths';
import type { AnimalDef, PartNode, Shape } from '../core/types';

const HIP = 212;

const leg = (id: string, x: number, far: boolean): PartNode => {
  const fill = far ? 'legDark' : 'leg';
  return {
    id,
    role: id,
    behind: true,
    pivot: [x, HIP],
    shapes: [
      { d: capsule(x, HIP, x + 2, 240, 5.5, 4.5), fill },
      { d: capsule(x + 2, 242, x + 18, 246, 3.8, 3.2), fill },
      { d: capsule(x + 2, 242, x + 14, 249, 3.6, 3), fill },
      { d: capsule(x + 2, 242, x - 10, 247, 3.6, 3), fill },
    ],
  };
};

const bars = (pts: [number, number, number][]): Shape[] =>
  pts.map(([x, y, w]) => ({
    d: tube(
      [
        [x - w, y],
        [x, y - w * 0.45],
        [x + w, y],
      ],
      1.4,
      18,
    ),
    kind: 'detail',
    fill: 'bar',
  }));

const scallops = (pts: [number, number, number][]): Shape[] =>
  pts.map(([x, y, r]) => ({
    d: `M${x - r} ${y - r * 0.2}Q${x} ${y + r * 1.3} ${x + r} ${y - r * 0.2}`,
    kind: 'line',
    stroke: 'bar',
    width: 2.8,
  }));

const offset = (parts: PartNode[], dx: number, dy: number): PartNode[] =>
  parts.map((p): PartNode => ({
    ...p,
    pivot: p.pivot && [p.pivot[0] + dx, p.pivot[1] + dy],
    shapes: p.shapes?.map((s) => ({ ...s, d: translatePath(s.d, dx, dy) })),
    children: p.children && offset(p.children, dx, dy),
  }));

const budgie: AnimalDef = {
  id: 'budgie',
  name: 'Budgie',
  kind: 'animal',
  aliases: ['budgerigar', 'parakeet', 'budgy', 'shell parakeet'],
  group: 'bird',
  habitats: ['pets', 'birds'],
  box: [180, 231],
  size: 70,
  locomotion: 'walk2',
  gait: { period: 0.5, stride: 34, swing: 20 },
  sound: 'budgie',
  palette: {
    body: '#7fd65a',
    belly: '#a6e870',
    face: '#ffe45c',
    bar: '#3b3542',
    wing: '#f2e46a',
    wingTip: '#55505e',
    tail: '#3a78d0',
    tailLight: '#5aa2ea',
    cheek: '#6a66dc',
    cere: '#6d9cf0',
    beak: '#f6d98e',
    leg: '#dba3ab',
    legDark: '#c48a93',
  },
  parts: offset(
    [
      {
        id: 'body',
        role: 'body',
        pivot: [128, 214],
        shapes: [
          {
            d: smooth([
              [124, 26],
              [150, 32],
              [166, 50],
              [172, 72],
              [170, 94],
              [178, 120],
              [186, 154],
              [178, 192],
              [152, 216],
              [116, 226],
              [84, 216],
              [68, 188],
              [66, 150],
              [74, 114],
              [84, 84],
              [90, 50],
              [104, 32],
            ]),
            fill: 'body',
          },
          {
            d: 'M166 66Q186 66 186 84Q185 95 177 100Q179 89 169 87Z',
            fill: 'beak',
          },
          {
            d: smooth([
              [80, 40],
              [124, 18],
              [168, 36],
              [186, 76],
              [176, 112],
              [148, 120],
              [120, 108],
              [96, 92],
              [78, 70],
            ]),
            kind: 'detail',
            fill: 'face',
          },
          { d: ellipse(156, 178, 32, 48, -10), kind: 'detail', fill: 'belly' },
          ...bars([
            [100, 42, 9],
            [118, 33, 9],
            [88, 56, 9],
            [106, 49, 9],
            [84, 72, 9],
            [102, 65, 8],
            [82, 88, 9],
            [98, 82, 7],
          ]),
          { d: ellipse(170, 69, 7.5, 5.5, -10), kind: 'feature', fill: 'cere', stroke: 'auto' },
          { d: ellipse(152, 96, 6.5, 8.5, -10), kind: 'feature', fill: 'cheek' },
          { d: circle(142, 112, 3), kind: 'feature', fill: 'bar' },
          { d: circle(154, 114, 3), kind: 'feature', fill: 'bar' },
          { d: circle(166, 111, 3), kind: 'feature', fill: 'bar' },
          { d: ellipse(160, 82, 7, 4.5), kind: 'feature', fill: 'blush', opacity: 0.55 },
          { d: circle(144, 62, 10), kind: 'feature', fill: 'eye' },
          { d: circle(147.8, 58, 3.8), kind: 'feature', fill: 'shine' },
        ],
        children: [
          {
            id: 'tail',
            role: 'tail',
            behind: true,
            pivot: [100, 204],
            shapes: [
              { d: leaf(104, 204, 96, 15, 158), fill: 'tail' },
              { d: leaf(104, 210, 80, 12, 148), fill: 'tail' },
              { d: leaf(104, 202, 70, 6, 158), kind: 'detail', fill: 'tailLight' },
            ],
          },
          leg('legF', 118, true),
          leg('legN', 138, false),
          {
            id: 'wing',
            role: 'wingN',
            pivot: [104, 112],
            shapes: [
              {
                d: smooth([
                  [96, 108],
                  [124, 112],
                  [138, 140],
                  [130, 178],
                  [108, 210],
                  [84, 228],
                  [72, 214],
                  [74, 170],
                  [80, 132],
                ]),
                fill: 'wing',
              },
              {
                d: smooth([
                  [72, 206],
                  [96, 200],
                  [110, 210],
                  [94, 226],
                  [80, 236],
                  [68, 224],
                ]),
                kind: 'detail',
                fill: 'wingTip',
              },
              ...scallops([
                [94, 124, 7],
                [112, 126, 7],
                [88, 140, 7],
                [104, 142, 7],
                [120, 144, 7],
                [86, 158, 7],
                [102, 160, 7],
                [118, 162, 7],
                [94, 176, 7],
                [110, 178, 7],
              ]),
            ],
          },
        ],
      },
    ],
    -11,
    -22,
  ),
};

export default budgie;
