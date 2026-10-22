import { capsule, circle, ellipse, smooth, translatePath, tube, type Pt } from '../core/paths';
import type { AnimalDef, PartNode, Shape } from '../core/types';

const webFoot = (ankle: Pt, angle: number, len: number, toes: number, spread: number): string => {
  const pts: Pt[] = [];
  const a0 = ((angle - 90) * Math.PI) / 180;
  pts.push([ankle[0] + Math.cos(a0) * 6, ankle[1] + Math.sin(a0) * 6]);
  for (let i = 0; i < toes; i++) {
    const deg = angle - spread / 2 + (spread * i) / (toes - 1);
    const a = (deg * Math.PI) / 180;
    pts.push([ankle[0] + Math.cos(a) * len, ankle[1] + Math.sin(a) * len]);
    if (i < toes - 1) {
      const mid = ((deg + spread / (toes - 1) / 2) * Math.PI) / 180;
      pts.push([ankle[0] + Math.cos(mid) * len * 0.8, ankle[1] + Math.sin(mid) * len * 0.8]);
    }
  }
  const a1 = ((angle + 90) * Math.PI) / 180;
  pts.push([ankle[0] + Math.cos(a1) * 6, ankle[1] + Math.sin(a1) * 6]);
  return smooth(pts, true, 0.8);
};

const foot = (
  id: string,
  hip: Pt,
  ankle: Pt,
  angle: number,
  len: number,
  far: boolean,
): PartNode => ({
  id,
  role: id,
  behind: true,
  pivot: hip,
  shapes: [
    { d: capsule(hip[0], hip[1], ankle[0], ankle[1], 11, 7.5), fill: far ? 'furDark' : 'fur' },
    { d: webFoot(ankle, angle, len, 4, 80), fill: far ? 'footDark' : 'foot' },
    ...[0, 1, 2, 3].map((i): Shape => {
      const a = ((angle - 40 + (80 * i) / 3) * Math.PI) / 180;
      return {
        d: tube(
          [
            [ankle[0] + Math.cos(a) * 5, ankle[1] + Math.sin(a) * 5],
            [ankle[0] + Math.cos(a) * len * 0.96, ankle[1] + Math.sin(a) * len * 0.96],
          ],
          (u) => 2.6 - 0.8 * u,
          8,
        ),
        kind: 'detail',
        fill: far ? 'toeDark' : 'toe',
      };
    }),
  ],
});

const TAIL: Pt[] = [
  [96, 84],
  [60, 78],
  [30, 84],
  [16, 100],
  [24, 116],
  [54, 122],
  [96, 116],
];

const hatch = (): Shape[] => {
  const out: Shape[] = [];
  for (let k = -3; k <= 4; k++) {
    const x = 48 + k * 14;
    out.push({
      d: tube(
        [
          [x - 22, 72],
          [x + 22, 128],
        ],
        1.3,
        6,
      ),
      kind: 'detail',
      fill: 'tailLine',
    });
    out.push({
      d: tube(
        [
          [x + 22, 72],
          [x - 22, 128],
        ],
        1.3,
        6,
      ),
      kind: 'detail',
      fill: 'tailLine',
    });
  }
  return out;
};

const offset = (parts: PartNode[], dx: number, dy: number): PartNode[] =>
  parts.map((p): PartNode => ({
    ...p,
    pivot: p.pivot && [p.pivot[0] + dx, p.pivot[1] + dy],
    shapes: p.shapes?.map((s) => ({ ...s, d: translatePath(s.d, dx, dy) })),
    children: p.children && offset(p.children, dx, dy),
  }));

const platypus: AnimalDef = {
  id: 'platypus',
  name: 'Platypus',
  kind: 'animal',
  aliases: ['duck-billed platypus', 'duckbill', 'duck billed platypus', 'platypi'],
  group: 'mammal',
  habitats: ['aussie'],
  box: [360, 150],
  size: 110,
  locomotion: 'swim',
  gait: { period: 1.2 },
  sound: 'platypus',
  palette: {
    fur: '#8f5d3d',
    furDark: '#764b30',
    belly: '#c49670',
    tail: '#71492f',
    tailLine: '#5c3a24',
    bill: '#6d7891',
    billLight: '#8c97af',
    billLine: '#434a5c',
    foot: '#6d7891',
    footDark: '#5a647b',
    toe: '#56607a',
    toeDark: '#485169',
  },
  parts: offset(
    [
      {
        id: 'body',
        role: 'body',
        pivot: [180, 100],
        shapes: [
          {
            d: smooth([
              [80, 98],
              [104, 62],
              [154, 48],
              [208, 46],
              [250, 50],
              [278, 62],
              [294, 82],
              [296, 104],
              [284, 124],
              [258, 138],
              [210, 148],
              [156, 150],
              [108, 142],
              [82, 122],
            ]),
            fill: 'fur',
          },
          { d: ellipse(190, 152, 100, 24), kind: 'detail', fill: 'belly' },
          { d: ellipse(266, 108, 10, 6.5), kind: 'feature', fill: 'blush', opacity: 0.55 },
          { d: circle(258, 82, 9.8), kind: 'feature', fill: 'eye' },
          { d: circle(261.8, 78.2, 3.7), kind: 'feature', fill: 'shine' },
        ],
        children: [
          {
            id: 'tail',
            role: 'tail',
            behind: true,
            pivot: [94, 100],
            motion: { rotate: 7, phase: 0.25 },
            shapes: [{ d: smooth(TAIL), fill: 'tail' }, ...hatch()],
          },
          foot('flipperBF', [118, 126], [106, 146], 150, 25, true),
          foot('flipperFF', [240, 126], [236, 148], 112, 27, true),
          foot('flipperBN', [100, 130], [84, 150], 155, 28, false),
          foot('flipperFN', [218, 132], [212, 156], 118, 31, false),
          {
            id: 'head',
            role: 'head',
            pivot: [290, 96],
            shapes: [
              {
                d: smooth([
                  [282, 78],
                  [312, 70],
                  [342, 72],
                  [362, 84],
                  [368, 100],
                  [358, 114],
                  [328, 120],
                  [298, 118],
                  [282, 110],
                ]),
                fill: 'bill',
              },
              { d: ellipse(330, 82, 34, 10, 3), kind: 'detail', fill: 'billLight' },
              { d: ellipse(350, 86, 2.4, 1.8, 20), kind: 'feature', fill: 'billLine' },
              { d: ellipse(358, 89, 2.4, 1.8, 20), kind: 'feature', fill: 'billLine' },
              {
                d: 'M291 97Q318 113 358 100',
                kind: 'line',
                stroke: 'billLine',
                width: 2.6,
              },
            ],
          },
        ],
      },
    ],
    -12,
    -42,
  ),
};

export default platypus;
