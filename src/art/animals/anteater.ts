import { capsule, circle, ellipse, smooth, spline, tube, type Pt } from '../core/paths';
import type { AnimalDef, PartNode, Shape } from '../core/types';

const GROUND = 250;
const HIP = 168;

const TAIL: Pt[] = [
  [122, 130],
  [92, 138],
  [62, 136],
  [38, 124],
  [20, 104],
  [14, 82],
];

const tailRadius = (t: number) => 13 + 25 * Math.sin(Math.PI * Math.min(1, 0.12 + t * 0.95)) ** 0.7;

function tailShapes(): Shape[] {
  const pts = spline(TAIL, 40);
  const out: Shape[] = [{ d: tube(TAIL, tailRadius, 40), fill: 'tail' }];
  for (let i = 6; i <= 40; i += 5) {
    const t = i / 40;
    const a = pts[Math.max(0, i - 1)];
    const b = pts[Math.min(40, i + 1)];
    const len = Math.hypot(b[0] - a[0], b[1] - a[1]) || 1;
    const nx = -(b[1] - a[1]) / len;
    const ny = (b[0] - a[0]) / len;
    const r = tailRadius(t);
    const fluff = 7 + 6 * Math.sin(Math.PI * Math.min(1, t * 1.1));
    out.push({
      d: circle(pts[i][0] - nx * (r - fluff * 0.55), pts[i][1] - ny * (r - fluff * 0.55), fluff),
      fill: 'tail',
    });
    if (t > 0.5) {
      const top = fluff * 0.8;
      out.push({
        d: circle(pts[i][0] + nx * (r - top * 0.6), pts[i][1] + ny * (r - top * 0.6), top),
        fill: 'tail',
      });
    }
  }
  return out;
}

const hair = (d: string): Shape => ({ d, kind: 'line', stroke: 'tailLight', width: 3 });

const leg = (id: string, x: number, far: boolean, front: boolean): PartNode => {
  const fill = front ? (far ? 'paleFar' : 'pale') : far ? 'furDark' : 'fur';
  const top = front ? HIP - 6 : HIP;
  const shapes: Shape[] = [
    { d: capsule(x, top, x + (front ? 2 : -2), GROUND - 22, 17, 14), fill },
    { d: ellipse(x + (front ? 5 : 2), GROUND - 10, 19, 10.5), fill },
  ];
  if (front) {
    shapes.push({
      d: ellipse(x + 2, GROUND - 34, 22, 6.5),
      kind: 'detail',
      fill: far ? 'stripeFar' : 'stripe',
    });
  }
  if (!far) {
    shapes.push(
      {
        d: `M${x + 11} ${GROUND - 6}L${x + 12} ${GROUND - 1}`,
        kind: 'line',
        stroke: 'toe',
        width: 2.4,
      },
      { d: `M${x + 3} ${GROUND - 5}L${x + 3} ${GROUND}`, kind: 'line', stroke: 'toe', width: 2.4 },
    );
  }
  return { id, role: id, behind: true, pivot: [x, top], shapes };
};

const STRIPE: Pt[] = [
  [322, 186],
  [294, 152],
  [258, 120],
  [222, 100],
  [180, 88],
];

const SNOUT: Pt[] = [
  [350, 118],
  [380, 128],
  [408, 140],
  [432, 154],
];

const anteater: AnimalDef = {
  id: 'anteater',
  name: 'Anteater',
  kind: 'animal',
  aliases: ['giant anteater', 'ant bear', 'ant eater'],
  group: 'mammal',
  habitats: ['rainforest'],
  box: [450, 250],
  size: 170,
  locomotion: 'walk4',
  gait: { period: 1.05, stride: 96, swing: 17 },
  sound: 'anteater',
  palette: {
    fur: '#a69686',
    furDark: '#8b7b6c',
    head: '#b3a595',
    pale: '#ece5d8',
    paleFar: '#d3cabb',
    stripe: '#2f2a31',
    stripeFar: '#47404a',
    stripeEdge: '#f7f2e8',
    tail: '#76685d',
    tailLight: '#aa9c8e',
    nose: '#372d2b',
    toe: '#6b5d52',
    earInner: '#d9a99a',
  },
  parts: [
    {
      id: 'body',
      role: 'body',
      pivot: [210, HIP],
      shapes: [
        {
          d: smooth([
            [106, 118],
            [140, 94],
            [190, 82],
            [244, 82],
            [286, 94],
            [312, 116],
            [318, 146],
            [304, 176],
            [262, 192],
            [200, 196],
            [144, 190],
            [110, 172],
            [98, 146],
          ]),
          fill: 'fur',
        },
        { d: tube(STRIPE, (t) => 22 - 13 * t), kind: 'detail', fill: 'stripeEdge' },
        { d: tube(STRIPE, (t) => 13 - 9 * t), kind: 'detail', fill: 'stripe' },
      ],
      children: [
        {
          id: 'tail',
          role: 'tail',
          behind: true,
          pivot: [120, 130],
          motion: { rotate: 4, phase: 0.25 },
          shapes: [
            ...tailShapes(),
            hair('M100 140Q72 146 48 134'),
            hair('M96 122Q70 124 46 110'),
            hair('M40 106Q30 96 26 82'),
          ],
        },
        leg('legBF', 160, true, false),
        leg('legFF', 290, true, true),
        leg('legBN', 136, false, false),
        leg('legFN', 266, false, true),
        {
          id: 'head',
          role: 'head',
          pivot: [300, 126],
          shapes: [
            {
              d: tube(
                [
                  [421, 158],
                  [424, 168],
                  [431, 175],
                  [439, 172],
                ],
                (t) => 3 - 0.6 * t,
              ),
              fill: 'tongue',
            },
            { d: ellipse(330, 114, 44, 38, 8), fill: 'head' },
            { d: tube(SNOUT, (t) => 21 - 13 * t), fill: 'head' },
            { d: ellipse(433, 154, 8, 7, 30), kind: 'feature', fill: 'nose' },
            { d: ellipse(431, 151.5, 2.6, 1.7, 30), kind: 'feature', fill: 'shine', opacity: 0.7 },
            { d: ellipse(348, 132, 11, 7), kind: 'feature', fill: 'blush', opacity: 0.55 },
            { d: circle(340, 106, 10), kind: 'feature', fill: 'eye' },
            { d: circle(343.8, 102, 3.8), kind: 'feature', fill: 'shine' },
            { d: 'M410 156Q416 162 424 161', kind: 'line', stroke: 'mouth', width: 2.6 },
          ],
          children: [
            {
              id: 'ear',
              behind: true,
              pivot: [304, 86],
              motion: { rotate: 5, freq: 2, phase: 0.3 },
              shapes: [
                { d: ellipse(300, 78, 14, 16, -24), fill: 'head' },
                { d: ellipse(301, 79, 7, 9, -24), kind: 'detail', fill: 'earInner' },
              ],
            },
          ],
        },
      ],
    },
  ],
};

export default anteater;
