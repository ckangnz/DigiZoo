import { capsule, circle, curve, ellipse, smooth, spline, tube, type Pt } from '../core/paths';
import type { AnimalDef, PartNode, Shape } from '../core/types';

const NECK: Pt[] = [
  [232, 164],
  [266, 138],
  [290, 108],
  [304, 80],
  [316, 58],
];
const SAMPLES = 40;
const SWAY = 7;
const LAG = 1.2;

const neckRadius = (t: number) => 32 - 14 * t;

function neckLine(phase: number): Pt[] {
  return NECK.map(([x, y], i) => {
    const k = i / (NECK.length - 1);
    return [x + SWAY * k ** 1.5 * Math.sin(2 * Math.PI * phase - LAG * k), y];
  });
}

function body(phase: number): Shape[] {
  const line = neckLine(phase);
  const pts = spline(line, SAMPLES);
  const front = pts.map(([x, y], i): Pt => {
    const r = neckRadius(i / SAMPLES);
    return [x + r * 0.62, y + r * 0.5];
  });
  return [
    { d: tube(line, neckRadius, SAMPLES), fill: 'skin' },
    {
      d: smooth([
        [84, 188],
        [102, 154],
        [146, 132],
        [198, 128],
        [240, 142],
        [266, 168],
        [268, 198],
        [246, 224],
        [198, 238],
        [146, 238],
        [104, 224],
      ]),
      fill: 'skin',
    },
    { d: ellipse(180, 240, 90, 28), kind: 'detail', fill: 'belly' },
    { d: ellipse(252, 206, 22, 40, 40), kind: 'detail', fill: 'belly' },
    {
      d: tube(front.slice(0, SAMPLES - 4), (t) => 13 - 5 * t, 40),
      kind: 'detail',
      fill: 'belly',
    },
    { d: circle(140, 152, 9), kind: 'detail', fill: 'spot' },
    { d: circle(176, 142, 11), kind: 'detail', fill: 'spot' },
    { d: circle(214, 150, 9), kind: 'detail', fill: 'spot' },
    { d: circle(114, 178, 7), kind: 'detail', fill: 'spot' },
    { d: circle(160, 176, 7), kind: 'detail', fill: 'spot' },
    { d: circle(200, 180, 7.5), kind: 'detail', fill: 'spot' },
  ];
}

const flipper = (
  id: string,
  pivot: Pt,
  outline: Pt[],
  far: boolean,
  rotate: number,
  phase: number,
): PartNode => ({
  id,
  role: id,
  behind: far,
  pivot,
  motion: { rotate, phase },
  shapes: [{ d: smooth(outline), fill: far ? 'skinDark' : 'skin' }],
});

const FRONT: Pt[] = [
  [212, 206],
  [238, 208],
  [240, 226],
  [224, 246],
  [200, 262],
  [178, 270],
  [170, 262],
  [184, 244],
  [200, 224],
];

const BACK: Pt[] = [
  [104, 206],
  [126, 208],
  [126, 222],
  [110, 238],
  [90, 250],
  [74, 254],
  [70, 246],
  [82, 232],
  [94, 218],
];

const shift = (pts: Pt[], dx: number, dy: number): Pt[] => pts.map(([x, y]) => [x + dx, y + dy]);

const plesiosaurus: AnimalDef = {
  id: 'plesiosaurus',
  name: 'Plesiosaurus',
  kind: 'animal',
  aliases: ['plesiosaur', 'nessie', 'loch ness', 'sea dinosaur', 'sea monster', 'dinosaur'],
  group: 'dinosaur',
  habitats: ['dinosaur'],
  box: [400, 280],
  size: 260,
  locomotion: 'swim',
  sound: 'plesiosaurus',
  palette: {
    skin: '#4cc0d6',
    skinDark: '#37a4bc',
    spot: '#3cabc4',
    belly: '#e0f7f4',
    cheek: '#ff8fa6',
    nostril: '#23778a',
  },
  parts: [
    {
      id: 'body',
      role: 'body',
      pivot: [176, 186],
      frames: body,
      children: [
        {
          id: 'tail',
          role: 'tail',
          behind: true,
          pivot: [94, 192],
          shapes: [{ d: capsule(100, 192, 46, 206, 18, 5), fill: 'skin' }],
        },
        flipper('flipperBF', [124, 210], shift(BACK, 20, -6), true, 14, 0),
        flipper('flipperFF', [244, 208], shift(FRONT, 22, -8), true, 18, 0.5),
        flipper('flipperBN', [112, 214], BACK, false, 14, 0.5),
        flipper('flipperFN', [224, 212], FRONT, false, 18, 0),
        {
          id: 'head',
          role: 'head',
          pivot: [316, 60],
          motion: { x: SWAY, rotate: 3, phase: -LAG / (2 * Math.PI) },
          shapes: [
            {
              d: smooth([
                [296, 54],
                [308, 30],
                [336, 20],
                [364, 28],
                [382, 46],
                [382, 66],
                [364, 80],
                [334, 84],
                [308, 78],
              ]),
              fill: 'skin',
            },
            { d: ellipse(346, 88, 34, 10), kind: 'detail', fill: 'belly' },
            { d: ellipse(330, 66, 9.5, 6), kind: 'feature', fill: 'cheek', opacity: 0.7 },
            { d: circle(338, 44, 11), kind: 'feature', fill: 'eye' },
            { d: circle(342.2, 39.8, 4.2), kind: 'feature', fill: 'shine' },
            { d: ellipse(374, 42, 2.8, 2.2, 15), kind: 'feature', fill: 'nostril' },
            { d: curve(376, 64, 348, 68, -4), kind: 'line', stroke: 'mouth', width: 3 },
          ],
        },
      ],
    },
  ],
};

export default plesiosaurus;
