import { capsule, circle, curve, ellipse, scalePath, smooth, tube, type Pt } from '../core/paths';
import type { AnimalDef, PartNode, Shape } from '../core/types';

const HIP = 204;

const leg = (id: string, x: number, far: boolean): PartNode => {
  const fill = far ? 'skinDark' : 'skin';
  return {
    id,
    role: id,
    behind: true,
    pivot: [x, HIP],
    shapes: [
      { d: capsule(x, HIP - 6, x, 262, 25, 24), fill },
      { d: ellipse(x + 4, 278, 29, 15), fill },
      ...[-14, 0, 14].map((dx) => ({
        d: ellipse(x + 6 + dx, 290, 6.5, 7.5),
        kind: 'detail' as const,
        fill: far ? 'nailDark' : 'nail',
      })),
    ],
  };
};

const horn = (base: Pt, tip: Pt, w: number, lean: number): string => {
  const [bx, by] = base;
  const [tx, ty] = tip;
  const len = Math.hypot(tx - bx, ty - by);
  const nx = -(ty - by) / len;
  const ny = (tx - bx) / len;
  const mid: Pt = [(bx + tx) / 2 + nx * lean, (by + ty) / 2 + ny * lean];
  return tube([base, mid, tip], (t) => w * (1 - t) ** 0.9 + 3.4 * t, 40);
};

const FRILL: Pt = [262, 112];
const FRILL_R: Pt = [60, 74];
const FRILL_TILT = -32;

const onFrill = (deg: number, k = 1): Pt => {
  const a = (deg * Math.PI) / 180;
  const t = (FRILL_TILT * Math.PI) / 180;
  const x = Math.cos(a) * FRILL_R[0] * k;
  const y = Math.sin(a) * FRILL_R[1] * k;
  return [
    FRILL[0] + x * Math.cos(t) - y * Math.sin(t),
    FRILL[1] + x * Math.sin(t) + y * Math.cos(t),
  ];
};

const frillShapes = (): Shape[] => {
  const knobs: Shape[] = [];
  for (let deg = 96; deg <= 404; deg += 19) {
    const [x, y] = onFrill(deg, 1.0);
    knobs.push({ d: circle(x, y, 9.5), fill: 'frillEdge' });
  }
  const dots: Shape[] = [];
  for (let deg = 112; deg <= 380; deg += 46) {
    const [x, y] = onFrill(deg, 0.72);
    dots.push({ d: circle(x, y, 6.5), kind: 'detail', fill: 'frillDot' });
  }
  return [
    ...knobs,
    { d: ellipse(FRILL[0], FRILL[1], FRILL_R[0], FRILL_R[1], FRILL_TILT), fill: 'frill' },
    ...dots,
  ];
};

const enlarge = (part: PartNode, k = 1.12, o: Pt = [276, 170]): PartNode => ({
  ...part,
  pivot: part.pivot && [o[0] + (part.pivot[0] - o[0]) * k, o[1] + (part.pivot[1] - o[1]) * k],
  shapes: part.shapes?.map((s) => ({ ...s, d: scalePath(s.d, k, k, o[0], o[1]) })),
  children: part.children?.map((c) => enlarge(c, k, o)),
});

const triceratops: AnimalDef = {
  id: 'triceratops',
  name: 'Triceratops',
  kind: 'animal',
  aliases: ['trike', 'three horns', 'three horned dinosaur', 'tricera', 'dinosaur'],
  group: 'dinosaur',
  habitats: ['dinosaur'],
  box: [452, 300],
  size: 300,
  locomotion: 'walk4',
  gait: { period: 1, swing: 18, stride: 100 },
  sound: 'triceratops',
  palette: {
    skin: '#78a5ea',
    skinDark: '#5f8bd3',
    spot: '#628fdb',
    belly: '#cfe0fb',
    frill: '#ffbb52',
    frillEdge: '#f47e3e',
    frillDot: '#f79a45',
    horn: '#fff3d8',
    hornDark: '#e8d8b8',
    beak: '#f0cf96',
    nail: '#eef3fb',
    nailDark: '#c4d3ec',
    cheek: '#ff93a8',
  },
  parts: [
    {
      id: 'body',
      role: 'body',
      pivot: [170, HIP],
      shapes: [
        {
          d: smooth([
            [58, 170],
            [76, 124],
            [124, 96],
            [186, 90],
            [244, 104],
            [290, 138],
            [300, 184],
            [280, 222],
            [226, 240],
            [160, 244],
            [100, 236],
            [66, 212],
          ]),
          fill: 'skin',
        },
        { d: ellipse(180, 248, 96, 30), kind: 'detail', fill: 'belly' },
        { d: ellipse(124, 116, 16, 11, -20), kind: 'detail', fill: 'spot' },
        { d: ellipse(168, 102, 18, 11, -6), kind: 'detail', fill: 'spot' },
        { d: ellipse(212, 108, 16, 10, 14), kind: 'detail', fill: 'spot' },
        { d: ellipse(146, 146, 12, 8, -10), kind: 'detail', fill: 'spot' },
        { d: ellipse(194, 140, 13, 8, 6), kind: 'detail', fill: 'spot' },
        { d: ellipse(98, 150, 11, 8, -30), kind: 'detail', fill: 'spot' },
      ],
      children: [
        {
          id: 'tail',
          role: 'tail',
          pivot: [70, 170],
          behind: true,
          shapes: [
            {
              d: tube(
                [
                  [84, 160],
                  [54, 176],
                  [30, 196],
                  [14, 214],
                ],
                (t) => 26 * (1 - t) + 6 * t,
                40,
              ),
              fill: 'skin',
            },
          ],
        },
        leg('legBF', 128, true),
        leg('legFF', 264, true),
        leg('legBN', 100, false),
        leg('legFN', 236, false),
        enlarge({
          id: 'head',
          role: 'head',
          pivot: [276, 170],
          shapes: [
            {
              d: smooth([
                [270, 132],
                [298, 104],
                [338, 98],
                [372, 112],
                [398, 138],
                [410, 166],
                [404, 190],
                [380, 202],
                [342, 206],
                [304, 200],
                [278, 182],
                [266, 158],
              ]),
              fill: 'skin',
            },
            {
              d: 'M398 150Q418 150 426 170Q430 190 416 204Q412 192 404 186Q396 182 394 170Z',
              fill: 'beak',
            },
            { d: ellipse(338, 210, 70, 24), kind: 'detail', fill: 'belly' },
            { d: ellipse(326, 170, 12, 7.5), kind: 'feature', fill: 'cheek', opacity: 0.7 },
            { d: circle(334, 140, 11.5), kind: 'feature', fill: 'eye' },
            { d: circle(338, 135.6, 4.3), kind: 'feature', fill: 'shine' },
            { d: curve(394, 184, 350, 184, -6), kind: 'line', stroke: 'mouth', width: 3.2 },
            { d: curve(350, 184, 343, 177, -2.5), kind: 'line', stroke: 'mouth', width: 3.2 },
          ],
          children: [
            {
              id: 'frill',
              behind: true,
              pivot: FRILL,
              shapes: frillShapes(),
            },
            {
              id: 'hornFar',
              behind: true,
              shapes: [{ d: horn([316, 112], [354, 44], 10, -6), fill: 'hornDark' }],
            },
            {
              id: 'horns',
              shapes: [
                { d: horn([342, 116], [392, 50], 12, -7), fill: 'horn' },
                { d: horn([384, 136], [394, 108], 9, -3), fill: 'horn' },
              ],
            },
          ],
        }),
      ],
    },
  ],
};

export default triceratops;
