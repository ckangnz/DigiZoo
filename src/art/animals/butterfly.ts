import { capsule, circle, ellipse, mirrorPath, scalePath, smooth, type Pt } from '../core/paths';
import type { AnimalDef, PartNode, Shape } from '../core/types';

const MID = 150;

const FORE: Pt[] = [
  [154, 94],
  [188, 62],
  [232, 40],
  [270, 34],
  [288, 46],
  [287, 78],
  [273, 110],
  [246, 130],
  [206, 138],
  [168, 132],
  [154, 122],
];

const HIND: Pt[] = [
  [154, 128],
  [196, 136],
  [232, 150],
  [249, 175],
  [241, 204],
  [215, 225],
  [186, 229],
  [164, 213],
  [154, 190],
];

function wing(side: 1 | -1): Shape[] {
  const m = (d: string) => (side === 1 ? d : mirrorPath(d, MID));
  const fore = smooth(FORE);
  const hind = smooth(HIND);
  const dots: Shape[] = [
    circle(266, 47, 5.2),
    circle(280, 62, 4.4),
    circle(281, 79, 3.6),
    circle(250, 42, 3.4),
    circle(236, 206, 4),
    circle(219, 220, 3.4),
  ].map((d) => ({ d: m(d), kind: 'detail', fill: 'white' }));
  return [
    { d: m(fore), fill: 'edge' },
    { d: m(hind), fill: 'edge' },
    { d: m(scalePath(fore, 0.8, 0.8, 156, 112)), kind: 'detail', fill: 'blue' },
    { d: m(scalePath(hind, 0.78, 0.78, 156, 150)), kind: 'detail', fill: 'blue' },
    { d: m(ellipse(186, 108, 26, 15, -22)), kind: 'detail', fill: 'blueLight' },
    { d: m(ellipse(180, 162, 16, 13, 30)), kind: 'detail', fill: 'blueLight' },
    ...dots,
  ];
}

const antenna = (id: string, side: 1 | -1): PartNode => {
  const pts: Pt[] = [
    [146, 56],
    [139, 38],
    [127, 25],
    [114, 21],
    [105, 26],
    [106, 35],
    [114, 37],
  ];
  const d = smooth(pts, false);
  return {
    id,
    role: id,
    behind: true,
    pivot: [side === 1 ? 154 : 146, 58],
    shapes: [{ d: side === 1 ? mirrorPath(d, MID) : d, kind: 'line', stroke: 'body', width: 3.6 }],
  };
};

const butterfly: AnimalDef = {
  id: 'butterfly',
  name: 'Butterfly',
  aliases: ['blue morpho', 'morpho'],
  group: 'bug',
  habitats: ['rainforest', 'bugs'],
  box: [300, 240],
  size: 70,
  locomotion: 'flutter',
  sound: 'butterfly',
  palette: {
    edge: '#21205a',
    blue: '#2f9cf5',
    blueLight: '#7fd0ff',
    body: '#3b2f63',
    head: '#7465a8',
    stripe: '#5a4b8c',
  },
  parts: [
    {
      id: 'body',
      pivot: [MID, 140],
      shapes: [
        { d: ellipse(MID, 112, 13, 24), fill: 'body' },
        { d: capsule(MID, 130, MID, 198, 10.5, 6), fill: 'body' },
        { d: ellipse(MID, 150, 12, 2.6), kind: 'detail', fill: 'stripe' },
        { d: ellipse(MID, 166, 12, 2.6), kind: 'detail', fill: 'stripe' },
        { d: ellipse(MID, 182, 12, 2.4), kind: 'detail', fill: 'stripe' },
      ],
      children: [
        { id: 'wingF', role: 'wingF', behind: true, pivot: [MID - 4, 130], shapes: wing(-1) },
        { id: 'wingN', role: 'wingN', behind: true, pivot: [MID + 4, 130], shapes: wing(1) },
        {
          id: 'head',
          role: 'head',
          pivot: [MID, 92],
          shapes: [
            { d: circle(MID, 74, 21), fill: 'head' },
            { d: ellipse(135, 82, 5.5, 3.6), kind: 'feature', fill: 'blush', opacity: 0.6 },
            { d: ellipse(165, 82, 5.5, 3.6), kind: 'feature', fill: 'blush', opacity: 0.6 },
            { d: circle(141.5, 72, 5.6), kind: 'feature', fill: 'eye' },
            { d: circle(158.5, 72, 5.6), kind: 'feature', fill: 'eye' },
            { d: circle(143.6, 69.8, 2.1), kind: 'feature', fill: 'shine' },
            { d: circle(160.6, 69.8, 2.1), kind: 'feature', fill: 'shine' },
            { d: 'M145 83Q150 88 155 83', kind: 'line', stroke: 'mouth', width: 2.6 },
          ],
          children: [antenna('antennaF', -1), antenna('antennaN', 1)],
        },
      ],
    },
  ],
};

export default butterfly;
