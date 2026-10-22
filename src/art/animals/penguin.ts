import { circle, curve, ellipse, smooth, translatePath, type Pt } from '../core/paths';
import type { AnimalDef, PartNode } from '../core/types';

const foot = (id: string, x: number, far: boolean): PartNode => {
  const fill = far ? 'feetDark' : 'feet';
  const y = 262;
  const outline: Pt[] = [
    [x - 14, y + 4],
    [x - 8, y - 6],
    [x + 8, y - 8],
    [x + 22, y - 6],
    [x + 34, y - 2],
    [x + 40, y + 6],
    [x + 34, y + 10],
    [x + 38, y + 16],
    [x + 30, y + 20],
    [x + 26, y + 26],
    [x + 12, y + 24],
    [x - 6, y + 22],
    [x - 16, y + 14],
  ];
  return {
    id,
    role: id,
    behind: true,
    pivot: [x, y - 10],
    shapes: [
      { d: smooth(outline), fill },
      ...(far
        ? []
        : [
            {
              d: curve(x + 8, y + 6, x + 28, y + 7, 2),
              kind: 'line' as const,
              stroke: 'toe',
              width: 2.4,
            },
            {
              d: curve(x + 6, y + 14, x + 24, y + 18, 2),
              kind: 'line' as const,
              stroke: 'toe',
              width: 2.4,
            },
          ]),
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

const penguin: AnimalDef = {
  id: 'penguin',
  name: 'Penguin',
  kind: 'animal',
  aliases: ['emperor penguin', 'king penguin', 'pingu', 'bird'],
  group: 'bird',
  habitats: ['ocean', 'polar'],
  box: [214, 280],
  size: 150,
  locomotion: 'waddle',
  sound: 'penguin',
  palette: {
    back: '#2c3146',
    flipper: '#3b4262',
    flipperDark: '#252a3d',
    belly: '#fbfaf5',
    chest: '#fff3c6',
    gold: '#ffc23a',
    beak: '#2c3146',
    beakAccent: '#ff8f2e',
    feet: '#ff9a2a',
    feetDark: '#e27c18',
    toe: '#c9650f',
  },
  parts: offset(
    [
      {
        id: 'body',
        role: 'body',
        pivot: [120, 270],
        shapes: [
          {
            d: smooth([
              [118, 20],
              [152, 23],
              [178, 40],
              [192, 68],
              [196, 104],
              [198, 140],
              [202, 180],
              [198, 218],
              [184, 248],
              [152, 268],
              [112, 272],
              [74, 262],
              [50, 236],
              [42, 196],
              [46, 150],
              [54, 104],
              [66, 64],
              [88, 34],
            ]),
            fill: 'back',
          },
          {
            d: smooth([
              [100, 76],
              [116, 82],
              [126, 106],
              [134, 134],
              [122, 150],
              [104, 140],
              [94, 112],
            ]),
            kind: 'detail',
            fill: 'gold',
          },
          { d: ellipse(198, 120, 12, 26, -12), kind: 'detail', fill: 'gold' },
          { d: ellipse(148, 188, 58, 90), kind: 'detail', fill: 'belly' },
          { d: ellipse(152, 130, 34, 17), kind: 'detail', fill: 'chest' },
          {
            d: smooth([
              [110, 74],
              [122, 56],
              [144, 54],
              [158, 62],
              [172, 55],
              [192, 58],
              [202, 84],
              [192, 110],
              [160, 120],
              [126, 112],
              [110, 94],
            ]),
            kind: 'detail',
            fill: 'belly',
          },
          { d: ellipse(130, 102, 9.5, 6), kind: 'feature', fill: 'blush', opacity: 0.5 },
          { d: ellipse(188, 100, 8, 5.5), kind: 'feature', fill: 'blush', opacity: 0.5 },
          { d: circle(140, 82, 10.5), kind: 'feature', fill: 'eye' },
          { d: circle(177, 80, 10), kind: 'feature', fill: 'eye' },
          { d: circle(143.8, 77.8, 4), kind: 'feature', fill: 'shine' },
          { d: circle(180.6, 75.8, 3.8), kind: 'feature', fill: 'shine' },
        ],
        children: [
          {
            id: 'tail',
            role: 'tail',
            behind: true,
            pivot: [62, 246],
            shapes: [
              {
                d: 'M74 236C62 244 50 254 43 262C40 267 44 271 49 268C60 263 72 257 84 251Z',
                fill: 'back',
              },
            ],
          },
          foot('legF', 92, true),
          foot('legN', 136, false),
          {
            id: 'wingF',
            role: 'wingF',
            behind: true,
            pivot: [186, 140],
            shapes: [
              {
                d: smooth([
                  [180, 132],
                  [196, 136],
                  [210, 160],
                  [218, 192],
                  [216, 206],
                  [206, 200],
                  [192, 176],
                  [180, 152],
                ]),
                fill: 'flipperDark',
              },
            ],
          },
          {
            id: 'beak',
            pivot: [164, 98],
            shapes: [
              {
                d: smooth([
                  [156, 94],
                  [167, 88],
                  [183, 90],
                  [196, 96],
                  [202, 102],
                  [194, 106],
                  [178, 107],
                  [164, 106],
                  [156, 101],
                ]),
                fill: 'beak',
              },
              {
                d: smooth([
                  [152, 101],
                  [176, 100],
                  [204, 102],
                  [186, 114],
                  [158, 112],
                ]),
                kind: 'detail',
                fill: 'beakAccent',
              },
            ],
          },
          {
            id: 'wingN',
            role: 'wingN',
            pivot: [64, 136],
            shapes: [
              {
                d: smooth([
                  [62, 126],
                  [76, 134],
                  [74, 162],
                  [62, 196],
                  [46, 222],
                  [36, 228],
                  [32, 216],
                  [38, 186],
                  [46, 154],
                  [52, 134],
                ]),
                fill: 'flipper',
              },
            ],
          },
        ],
      },
    ],
    -18,
    -8,
  ),
};

export default penguin;
