import { capsule, circle, curve, ellipse, smooth, translatePath } from '../core/paths';
import type { AnimalDef, PartNode } from '../core/types';

const foot = (id: string, role: string, x: number, far: boolean): PartNode => {
  const fill = far ? 'feetDark' : 'feet';
  return {
    id,
    role,
    behind: true,
    pivot: [x, 214],
    shapes: [
      { d: capsule(x, 212, x + 2, 232, 5.5, 5), fill },
      {
        d: smooth([
          [x - 7, 239],
          [x - 3, 230],
          [x + 12, 228],
          [x + 28, 230],
          [x + 39, 236],
          [x + 35, 243],
          [x + 18, 244],
          [x + 2, 244],
        ]),
        fill,
      },
      ...(far
        ? []
        : [
            {
              d: `M${x + 8} 236L${x + 22} 238`,
              kind: 'line' as const,
              stroke: 'feetLine',
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

const duck: AnimalDef = {
  id: 'duck',
  name: 'Duck',
  aliases: ['ducky', 'duckling', 'quack', 'rubber duck', 'bird'],
  group: 'bird',
  habitats: ['farm'],
  box: [258, 231],
  size: 100,
  locomotion: 'waddle',
  sound: 'duck',
  palette: {
    body: '#ffd93b',
    wing: '#ffc72a',
    wingLine: '#e8a417',
    bill: '#ff9d1e',
    billLine: '#d9740f',
    feet: '#ff9a1f',
    feetDark: '#e07d16',
    feetLine: '#c9680f',
  },
  parts: offset(
    [
      {
        id: 'body',
        role: 'body',
        pivot: [135, 226],
        shapes: [
          {
            d: smooth([
              [140, 36],
              [166, 28],
              [194, 36],
              [212, 56],
              [216, 82],
              [208, 106],
              [198, 124],
              [212, 142],
              [224, 168],
              [222, 196],
              [204, 214],
              [168, 226],
              [122, 228],
              [80, 220],
              [50, 202],
              [38, 180],
              [44, 158],
              [70, 146],
              [104, 142],
              [128, 130],
              [120, 106],
              [116, 78],
              [124, 52],
            ]),
            fill: 'body',
          },
          { d: ellipse(190, 96, 8.5, 5.2), kind: 'feature', fill: 'blush', opacity: 0.55 },
          { d: circle(184, 66, 8.5), kind: 'feature', fill: 'eye' },
          { d: circle(187.1, 62.4, 3.2), kind: 'feature', fill: 'shine' },
        ],
        children: [
          {
            id: 'tail',
            role: 'tail',
            behind: true,
            pivot: [58, 156],
            shapes: [
              {
                d: 'M98 162C66 160 40 146 30 120C27 110 33 104 41 110C54 124 72 134 102 146Z',
                fill: 'body',
              },
            ],
          },
          foot('legF', 'legF', 108, true),
          foot('legN', 'legN', 146, false),
          {
            id: 'bill',
            pivot: [210, 86],
            shapes: [
              {
                d: 'M202 70C224 58 254 62 262 78C266 90 256 100 240 103C226 106 210 104 202 100Z',
                fill: 'bill',
              },
              { d: 'M210 90Q234 96 256 86', kind: 'line', stroke: 'billLine', width: 2.6 },
              { d: circle(226, 74, 2), kind: 'feature', fill: 'billLine' },
            ],
          },
          {
            id: 'wing',
            role: 'wingN',
            pivot: [154, 170],
            shapes: [
              {
                d: smooth([
                  [156, 166],
                  [166, 184],
                  [156, 204],
                  [128, 212],
                  [98, 208],
                  [74, 192],
                  [60, 170],
                  [86, 176],
                  [112, 170],
                  [136, 164],
                ]),
                fill: 'wing',
              },
              { d: curve(98, 192, 142, 194, 6), kind: 'line', stroke: 'wingLine', width: 2.6 },
            ],
          },
        ],
      },
    ],
    -17,
    -15,
  ),
};

export default duck;
