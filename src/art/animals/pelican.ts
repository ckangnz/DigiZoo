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
import type { AnimalDef, PartNode } from '../core/types';

const SOLE = 296;

const foot = (id: string, x: number, far: boolean): PartNode => {
  const fill = far ? 'feetDark' : 'feet';
  return {
    id,
    role: id,
    behind: true,
    pivot: [x, 246],
    shapes: [
      { d: capsule(x, 244, x + 2, SOLE - 12, 8, 7), fill },
      {
        d: smooth([
          [x - 12, SOLE - 3],
          [x - 6, SOLE - 14],
          [x + 14, SOLE - 17],
          [x + 36, SOLE - 14],
          [x + 50, SOLE - 5],
          [x + 44, SOLE],
          [x + 20, SOLE + 1],
          [x, SOLE],
        ]),
        fill,
      },
      ...(far
        ? []
        : [
            {
              d: `M${x + 8} ${SOLE - 7}L${x + 38} ${SOLE - 5}`,
              kind: 'line' as const,
              stroke: 'feetLine',
              width: 2.4,
            },
          ]),
    ],
  };
};

const NECK: Pt[] = [
  [164, 188],
  [180, 148],
  [188, 114],
  [194, 90],
];

const offset = (parts: PartNode[], dx: number, dy: number): PartNode[] =>
  parts.map((p): PartNode => ({
    ...p,
    pivot: p.pivot && [p.pivot[0] + dx, p.pivot[1] + dy],
    shapes: p.shapes?.map((s) => ({ ...s, d: translatePath(s.d, dx, dy) })),
    children: p.children && offset(p.children, dx, dy),
  }));

const pelican: AnimalDef = {
  id: 'pelican',
  name: 'Pelican',
  kind: 'animal',
  aliases: ['white pelican', 'brown pelican', 'pouch bird', 'bird'],
  group: 'bird',
  habitats: ['birds'],
  box: [320, 264],
  size: 200,
  locomotion: 'waddle',
  gait: { period: 0.75 },
  sound: 'pelican',
  palette: {
    body: '#fdfbf8',
    belly: '#f3f0ee',
    wing: '#eceef4',
    wingLine: '#bfc4d4',
    quill: '#454a5e',
    crest: '#f6f3f0',
    bill: '#ffd24a',
    billTip: '#f2793a',
    billLine: '#e09a1d',
    pouch: '#ffa33d',
    pouchLight: '#ffbf63',
    pouchLine: '#e5822a',
    feet: '#ff9d2e',
    feetDark: '#e07f17',
    feetLine: '#c4660e',
  },
  parts: offset(
    [
      {
        id: 'body',
        role: 'body',
        pivot: [134, 252],
        shapes: [
          {
            d: smooth([
              [170, 150],
              [204, 170],
              [218, 204],
              [210, 236],
              [182, 256],
              [140, 264],
              [100, 258],
              [68, 240],
              [50, 212],
              [54, 184],
              [78, 162],
              [120, 150],
            ]),
            fill: 'body',
          },
          { d: ellipse(156, 256, 62, 22), kind: 'detail', fill: 'belly' },
        ],
        children: [
          {
            id: 'tail',
            role: 'tail',
            behind: true,
            pivot: [62, 212],
            shapes: [
              { d: leaf(68, 208, 42, 12, 172), fill: 'wing' },
              { d: leaf(70, 216, 38, 11, 190), fill: 'wing' },
            ],
          },
          foot('legF', 114, true),
          foot('legN', 150, false),
          {
            id: 'head',
            role: 'head',
            behind: true,
            pivot: [172, 172],
            shapes: [
              { d: tube(NECK, (t) => 23 - 4 * t, 60), fill: 'body' },
              { d: leaf(184, 56, 34, 9, 196), fill: 'crest' },
              { d: leaf(182, 66, 28, 8, 174), fill: 'crest' },
              { d: circle(202, 74, 34), fill: 'body' },
              {
                d: smooth([
                  [214, 96],
                  [262, 104],
                  [306, 112],
                  [308, 124],
                  [290, 142],
                  [258, 154],
                  [228, 150],
                  [208, 132],
                  [204, 110],
                ]),
                fill: 'pouch',
              },
              { d: ellipse(254, 122, 30, 10, 10), kind: 'detail', fill: 'pouchLight' },
              { d: curve(222, 138, 270, 140, 8), kind: 'line', stroke: 'pouchLine', width: 2.4 },
              {
                d: smooth([
                  [216, 66],
                  [262, 78],
                  [306, 92],
                  [326, 100],
                  [334, 110],
                  [330, 122],
                  [322, 114],
                  [300, 108],
                  [258, 100],
                  [216, 94],
                ]),
                fill: 'bill',
              },
              { d: ellipse(330, 110, 12, 16, -20), kind: 'detail', fill: 'billTip' },
              { d: curve(226, 82, 304, 100, 2), kind: 'line', stroke: 'billLine', width: 2.4 },
              { d: ellipse(196, 96, 8, 5), kind: 'feature', fill: 'blush', opacity: 0.55 },
              { d: circle(209, 66, 9.4), kind: 'feature', fill: 'eye' },
              { d: circle(212.6, 62.3, 3.6), kind: 'feature', fill: 'shine' },
            ],
          },
          {
            id: 'wing',
            role: 'wingN',
            pivot: [176, 182],
            motion: { rotate: 4, phase: 0.25 },
            shapes: [
              {
                d: smooth([
                  [184, 178],
                  [196, 198],
                  [186, 222],
                  [156, 236],
                  [118, 238],
                  [80, 228],
                  [42, 212],
                  [70, 198],
                  [110, 186],
                  [150, 176],
                ]),
                fill: 'wing',
              },
              {
                d: 'M20 240L20 190L74 196Q96 212 100 240Z',
                kind: 'detail',
                fill: 'quill',
              },
              { d: curve(104, 206, 150, 200, 6), kind: 'line', stroke: 'wingLine', width: 2.6 },
              { d: curve(130, 192, 176, 190, 5), kind: 'line', stroke: 'wingLine', width: 2.6 },
            ],
          },
        ],
      },
    ],
    -16,
    -33,
  ),
};

export default pelican;
