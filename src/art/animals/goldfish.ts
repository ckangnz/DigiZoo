import { capsule, circle, ellipse, f, smooth, translatePath, tube, type Pt } from '../core/paths';
import type { AnimalDef, PartNode, Shape } from '../core/types';

const TAU = Math.PI * 2;
const PIVOT: Pt = [138, 112];
const REACH = 150;

const TAIL: Pt[] = [
  [142, 100],
  [124, 78],
  [104, 52],
  [80, 28],
  [54, 14],
  [30, 12],
  [14, 24],
  [12, 44],
  [22, 62],
  [40, 80],
  [60, 96],
  [70, 112],
  [60, 128],
  [40, 144],
  [22, 162],
  [12, 180],
  [14, 200],
  [30, 212],
  [54, 210],
  [80, 196],
  [104, 172],
  [124, 146],
  [142, 124],
];

const TAIL_RAYS: Pt[] = [
  [44, 22],
  [26, 40],
  [32, 66],
  [54, 92],
  [54, 132],
  [32, 158],
  [26, 184],
  [44, 202],
];

const bend =
  (phase: number) =>
  ([x, y]: Pt): Pt => {
    const dx = x - PIVOT[0];
    const dy = y - PIVOT[1];
    const r = Math.hypot(dx, dy) / REACH;
    const deg = 6 * Math.sin(TAU * phase) + 9 * r * Math.sin(TAU * phase + 1.04 - 1.3 * r);
    const a = (deg * Math.PI) / 180;
    return [
      PIVOT[0] + dx * Math.cos(a) - dy * Math.sin(a),
      PIVOT[1] + dx * Math.sin(a) + dy * Math.cos(a),
    ];
  };

const ring = (cx: number, cy: number, rOut: number, rIn: number): string =>
  `M${f(cx - rOut)} ${f(cy)}A${rOut} ${rOut} 0 1 1 ${f(cx + rOut)} ${f(cy)}A${rOut} ${rOut} 0 1 1 ${f(cx - rOut)} ${f(cy)}Z` +
  `M${f(cx - rIn)} ${f(cy)}A${rIn} ${rIn} 0 1 0 ${f(cx + rIn)} ${f(cy)}A${rIn} ${rIn} 0 1 0 ${f(cx - rIn)} ${f(cy)}Z`;

const tail = (phase: number): Shape[] => {
  const move = bend(phase);
  return [
    { d: smooth(TAIL.map(move)), fill: 'fin' },
    { d: ring(PIVOT[0], PIVOT[1], 200, 112), kind: 'detail', fill: 'finTip' },
    ...TAIL_RAYS.map(([x, y]): Shape => {
      const line: Pt[] = [0.12, 0.4, 0.7, 1].map((k) =>
        move([PIVOT[0] + (x - PIVOT[0]) * k, PIVOT[1] + (y - PIVOT[1]) * k]),
      );
      return { d: tube(line, (t) => 2.4 - 1.2 * t, 24), kind: 'detail', fill: 'ray' };
    }),
  ];
};

const rays = (base: Pt, tips: Pt[]): Shape[] =>
  tips.map(([x, y]) => ({
    d: capsule(base[0], base[1], x, y, 2.2, 1.2),
    kind: 'detail',
    fill: 'ray',
  }));

const offset = (parts: PartNode[], dx: number, dy: number): PartNode[] =>
  parts.map((p): PartNode => {
    const frames = p.frames;
    return {
      ...p,
      pivot: p.pivot && [p.pivot[0] + dx, p.pivot[1] + dy],
      shapes: p.shapes?.map((s) => ({ ...s, d: translatePath(s.d, dx, dy) })),
      frames: frames && ((ph) => frames(ph).map((s) => ({ ...s, d: translatePath(s.d, dx, dy) }))),
      children: p.children && offset(p.children, dx, dy),
    };
  });

const goldfish: AnimalDef = {
  id: 'goldfish',
  name: 'Goldfish',
  kind: 'animal',
  aliases: ['gold fish', 'fancy goldfish', 'fantail', 'pet fish'],
  group: 'fish',
  habitats: ['pets'],
  box: [274, 214],
  size: 70,
  locomotion: 'swim',
  gait: { period: 1.3 },
  sound: 'goldfish',
  palette: {
    body: '#ff962e',
    belly: '#ffc85c',
    scale: '#f47d1e',
    fin: '#ffad4d',
    finTip: '#ffd690',
    ray: '#f68a2e',
  },
  parts: offset(
    [
      {
        id: 'body',
        role: 'body',
        pivot: [200, 112],
        shapes: [
          {
            d: smooth([
              [274, 112],
              [266, 80],
              [242, 60],
              [206, 52],
              [170, 58],
              [142, 76],
              [128, 100],
              [128, 124],
              [144, 148],
              [174, 166],
              [210, 170],
              [246, 160],
              [268, 138],
            ]),
            fill: 'body',
          },
          { d: ellipse(212, 170, 70, 28), kind: 'detail', fill: 'belly' },
          { d: 'M216 72Q204 104 216 140', kind: 'line', stroke: 'scale', width: 2.8 },
          { d: 'M164 90Q172 98 164 106', kind: 'line', stroke: 'scale', width: 2.6 },
          { d: 'M164 116Q172 124 164 132', kind: 'line', stroke: 'scale', width: 2.6 },
          { d: 'M184 78Q192 86 184 94', kind: 'line', stroke: 'scale', width: 2.6 },
          { d: 'M184 104Q192 112 184 120', kind: 'line', stroke: 'scale', width: 2.6 },
          { d: 'M184 130Q192 138 184 146', kind: 'line', stroke: 'scale', width: 2.6 },
          { d: 'M146 104Q152 110 146 116', kind: 'line', stroke: 'scale', width: 2.6 },
          { d: ellipse(246, 126, 10, 6), kind: 'feature', fill: 'blush', opacity: 0.55 },
          { d: circle(240, 96, 13), kind: 'feature', fill: 'eye' },
          { d: circle(244.4, 91, 4.8), kind: 'feature', fill: 'shine' },
          { d: circle(235.6, 101.4, 2), kind: 'feature', fill: 'shine' },
          { d: 'M257 128Q265 134 271 124', kind: 'line', stroke: 'mouth', width: 3 },
        ],
        children: [
          {
            id: 'tail',
            role: 'tail',
            behind: true,
            pivot: PIVOT,
            motion: null,
            frames: tail,
          },
          {
            id: 'finTop',
            role: 'finTop',
            behind: true,
            pivot: [200, 58],
            shapes: [
              {
                d: smooth([
                  [238, 64],
                  [228, 38],
                  [206, 18],
                  [178, 10],
                  [148, 12],
                  [122, 22],
                  [132, 38],
                  [154, 52],
                  [176, 64],
                  [206, 66],
                ]),
                fill: 'fin',
              },
              { d: ellipse(134, 22, 26, 14, -12), kind: 'detail', fill: 'finTip' },
              ...rays(
                [208, 64],
                [
                  [196, 20],
                  [172, 16],
                  [148, 22],
                ],
              ),
            ],
          },
          {
            id: 'finBottom',
            role: 'finF',
            behind: true,
            pivot: [176, 156],
            shapes: [
              {
                d: smooth([
                  [196, 160],
                  [176, 174],
                  [150, 182],
                  [124, 186],
                  [108, 180],
                  [122, 170],
                  [146, 160],
                  [166, 150],
                ]),
                fill: 'fin',
              },
              { d: ellipse(110, 180, 14, 9, -10), kind: 'detail', fill: 'finTip' },
              ...rays(
                [180, 160],
                [
                  [126, 180],
                  [144, 176],
                  [162, 172],
                ],
              ),
            ],
          },
          {
            id: 'finSide',
            role: 'finN',
            pivot: [210, 136],
            shapes: [
              {
                d: smooth([
                  [214, 132],
                  [198, 136],
                  [182, 146],
                  [174, 158],
                  [186, 160],
                  [202, 150],
                  [214, 142],
                ]),
                fill: 'fin',
              },
              ...rays(
                [212, 138],
                [
                  [182, 154],
                  [192, 154],
                ],
              ),
            ],
          },
        ],
      },
    ],
    -4,
    -6,
  ),
};

export default goldfish;
