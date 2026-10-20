import { circle, ellipse, smooth, translatePath } from '../core/paths';
import type { AnimalDef, PartNode } from '../core/types';

const offset = (parts: PartNode[], dx: number, dy: number): PartNode[] =>
  parts.map((p): PartNode => ({
    ...p,
    pivot: p.pivot && [p.pivot[0] + dx, p.pivot[1] + dy],
    shapes: p.shapes?.map((s) => ({ ...s, d: translatePath(s.d, dx, dy) })),
    children: p.children && offset(p.children, dx, dy),
  }));

const orca: AnimalDef = {
  id: 'orca',
  name: 'Orca',
  kind: 'animal',
  aliases: ['killer whale', 'orca whale', 'blackfish'],
  group: 'mammal',
  habitats: ['ocean'],
  box: [384, 244],
  size: 280,
  locomotion: 'swim',
  gait: { period: 1.3 },
  sound: 'orca',
  palette: {
    skin: '#2d3146',
    skinDark: '#23263a',
    white: '#fbfcff',
    saddle: '#b9c1d2',
    mouthLine: '#1d2030',
  },
  parts: offset(
    [
      {
        id: 'body',
        role: 'body',
        pivot: [260, 140],
        shapes: [
          {
            d: smooth([
              [410, 152],
              [404, 120],
              [384, 94],
              [350, 76],
              [304, 66],
              [254, 66],
              [208, 74],
              [168, 90],
              [138, 108],
              [118, 122],
              [114, 140],
              [134, 154],
              [170, 174],
              [216, 194],
              [272, 204],
              [328, 200],
              [374, 186],
              [400, 170],
            ]),
            fill: 'skin',
          },
          {
            d:
              smooth(
                [
                  [424, 150],
                  [404, 154],
                  [380, 157],
                  [356, 151],
                  [340, 160],
                  [304, 176],
                  [262, 186],
                  [230, 184],
                  [206, 176],
                  [184, 160],
                  [164, 140],
                  [150, 128],
                  [143, 136],
                  [145, 152],
                  [137, 164],
                  [120, 159],
                  [100, 146],
                ],
                false,
              ) + 'L100 260L424 260Z',
            kind: 'detail',
            fill: 'white',
          },
          { d: ellipse(204, 82, 30, 9, 14), kind: 'detail', fill: 'saddle' },
          { d: ellipse(342, 104, 25, 13.5, -10), kind: 'detail', fill: 'white' },
          {
            d: 'M409 153Q382 163 356 151Q351 148 350 143',
            kind: 'line',
            stroke: 'mouthLine',
            width: 3.2,
          },
          { d: ellipse(366, 172, 11, 6.5), kind: 'feature', fill: 'blush', opacity: 0.55 },
          { d: circle(352, 107, 10), kind: 'feature', fill: 'eye' },
          { d: circle(355.8, 102.8, 3.8), kind: 'feature', fill: 'shine' },
        ],
        children: [
          {
            id: 'tail',
            role: 'tail',
            behind: true,
            pivot: [124, 132],
            shapes: [
              {
                d: 'M136 122C122 110 102 96 86 84C78 78 67 82 69 92C73 104 79 116 83 128C73 136 61 146 53 156C47 164 53 170 61 167C81 160 108 150 134 142Z',
                fill: 'skin',
              },
            ],
          },
          {
            id: 'finTop',
            role: 'finTop',
            behind: true,
            pivot: [246, 72],
            shapes: [
              {
                d: 'M290 74C270 56 244 32 226 14C218 6 208 10 210 20C214 38 216 58 210 82Z',
                fill: 'skin',
              },
            ],
          },
          {
            id: 'flipperFar',
            role: 'finF',
            behind: true,
            pivot: [282, 192],
            shapes: [
              {
                d: smooth([
                  [272, 188],
                  [292, 192],
                  [288, 210],
                  [272, 226],
                  [254, 230],
                  [250, 220],
                  [260, 204],
                ]),
                fill: 'skinDark',
              },
            ],
          },
          {
            id: 'flipper',
            role: 'finN',
            pivot: [314, 190],
            shapes: [
              {
                d: smooth([
                  [302, 184],
                  [326, 188],
                  [320, 206],
                  [302, 222],
                  [278, 233],
                  [263, 231],
                  [268, 215],
                  [286, 199],
                ]),
                fill: 'skin',
              },
            ],
          },
        ],
      },
    ],
    -38,
    0,
  ),
};

export default orca;
