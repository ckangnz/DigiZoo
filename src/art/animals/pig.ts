import { capsule, circle, curve, ellipse, smooth, tube, type Pt } from '../core/paths';
import type { AnimalDef, PartNode } from '../core/types';

const leg = (id: string, x: number, far: boolean): PartNode => {
  const fill = far ? 'skinDark' : 'skin';
  return {
    id,
    role: id,
    behind: true,
    pivot: [x, 190],
    shapes: [
      { d: capsule(x, 186, x, 232, 17.5, 16.5), fill },
      { d: ellipse(x + 2, 237, 19.5, 11), fill },
      {
        d: `M${x - 22} 233H${x + 26}V252H${x - 22}Z`,
        kind: 'detail',
        fill: far ? 'hoofDark' : 'hoof',
      },
      { d: `M${x + 3} 237L${x + 3} 246`, kind: 'line', stroke: 'hoofLine', width: 2.4 },
    ],
  };
};

const curl = (): Pt[] => {
  const pts: Pt[] = [
    [56, 138],
    [44, 134],
  ];
  const cx = 30;
  const cy = 124;
  for (let k = 0; k <= 10; k++) {
    const t = k / 10;
    const a = Math.PI * 0.15 + t * Math.PI * 1.75;
    const r = 13 - 6 * t;
    pts.push([cx + Math.cos(a) * r, cy + Math.sin(a) * r]);
  }
  return pts;
};

const ear = (pts: Pt[]): string => smooth(pts, true, 0.75);

const pig: AnimalDef = {
  id: 'pig',
  name: 'Pig',
  aliases: ['piggy', 'oink', 'piglet', 'hog', 'pink pig'],
  group: 'mammal',
  habitats: ['farm'],
  box: [320, 250],
  size: 160,
  locomotion: 'walk4',
  gait: { period: 0.75, swing: 22, stride: 64 },
  sound: 'pig',
  palette: {
    skin: '#f9b3c3',
    skinDark: '#e895aa',
    belly: '#fcd0da',
    snout: '#f590a8',
    nostril: '#b9506b',
    earInner: '#f28ca5',
    hoof: '#c9798c',
    hoofDark: '#b46a7c',
    hoofLine: '#94505f',
    mud: '#a97c58',
  },
  parts: [
    {
      id: 'body',
      role: 'body',
      pivot: [140, 190],
      shapes: [
        { d: ellipse(140, 156, 98, 68), fill: 'skin' },
        { d: ellipse(146, 212, 74, 20), kind: 'detail', fill: 'belly' },
        {
          d: smooth([
            [70, 120],
            [80, 110],
            [92, 114],
            [102, 108],
            [110, 118],
            [104, 128],
            [108, 138],
            [94, 140],
            [84, 134],
            [72, 136],
            [66, 128],
          ]),
          kind: 'detail',
          fill: 'mud',
          opacity: 0.85,
        },
        { d: circle(118, 108, 4.2), kind: 'detail', fill: 'mud', opacity: 0.85 },
        { d: circle(120, 132, 3), kind: 'detail', fill: 'mud', opacity: 0.85 },
        { d: circle(62, 108, 3.2), kind: 'detail', fill: 'mud', opacity: 0.85 },
      ],
      children: [
        {
          id: 'tail',
          role: 'tail',
          pivot: [52, 138],
          behind: true,
          shapes: [{ d: tube(curl(), (t) => 4.4 - 1.4 * t, 60), fill: 'skin' }],
        },
        leg('legBF', 108, true),
        leg('legFF', 206, true),
        leg('legBN', 84, false),
        leg('legFN', 182, false),
        {
          id: 'head',
          role: 'head',
          pivot: [200, 160],
          shapes: [
            {
              d: ear([
                [190, 78],
                [178, 44],
                [164, 50],
                [176, 34],
                [226, 56],
              ]),
              fill: 'skin',
            },
            {
              d: ear([
                [282, 78],
                [294, 44],
                [308, 50],
                [296, 34],
                [246, 56],
              ]),
              fill: 'skin',
            },
            { d: circle(236, 116, 62), fill: 'skin' },
            {
              d: ear([
                [194, 66],
                [184, 46],
                [212, 56],
              ]),
              kind: 'detail',
              fill: 'earInner',
            },
            {
              d: ear([
                [278, 66],
                [288, 46],
                [260, 56],
              ]),
              kind: 'detail',
              fill: 'earInner',
            },
            { d: ellipse(194, 140, 12, 7.5), kind: 'feature', fill: 'blush', opacity: 0.6 },
            { d: ellipse(280, 140, 12, 7.5), kind: 'feature', fill: 'blush', opacity: 0.6 },
            { d: circle(214, 104, 9), kind: 'feature', fill: 'eye' },
            { d: circle(260, 104, 9), kind: 'feature', fill: 'eye' },
            { d: circle(217.4, 100.4, 3.4), kind: 'feature', fill: 'shine' },
            { d: circle(263.4, 100.4, 3.4), kind: 'feature', fill: 'shine' },
            { d: curve(226, 164, 248, 164, 5), kind: 'line', stroke: 'mouth', width: 3 },
          ],
          children: [
            {
              id: 'snout',
              pivot: [237, 138],
              shapes: [
                { d: ellipse(237, 138, 29, 20), fill: 'snout' },
                { d: ellipse(227, 138, 5, 7.5), kind: 'feature', fill: 'nostril' },
                { d: ellipse(247, 138, 5, 7.5), kind: 'feature', fill: 'nostril' },
              ],
            },
          ],
        },
      ],
    },
  ],
};

export default pig;
