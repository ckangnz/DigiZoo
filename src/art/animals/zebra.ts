import { capsule, circle, ellipse, leaf, smooth, spline, tube, type Pt } from '../core/paths';
import type { AnimalDef, PartNode, Shape } from '../core/types';

const stripe = (pts: Pt[], r: number, taper = 0.8): Shape => ({
  d: tube(pts, (t) => r * (1 - taper * t)),
  kind: 'detail',
  fill: 'stripe',
});

const band = (pts: Pt[], r: number): Shape => ({ d: tube(pts, r), kind: 'detail', fill: 'stripe' });

function tufts(line: Pt[], n: number, offset: number, r: number): Shape[] {
  const pts = spline(line, n);
  const out: Shape[] = [{ d: tube(line, r * 0.95), fill: 'mane' }];
  pts.forEach(([x, y], i) => {
    if (i === 0) return;
    const a = pts[Math.max(0, i - 1)];
    const b = pts[Math.min(pts.length - 1, i + 1)];
    const len = Math.hypot(b[0] - a[0], b[1] - a[1]) || 1;
    const nx = (b[1] - a[1]) / len;
    const ny = -(b[0] - a[0]) / len;
    const k = Math.sin((Math.PI * i) / n) * 0.35 + 0.75;
    out.push({ d: circle(x + nx * offset * k, y + ny * offset * k, r * k), fill: 'mane' });
  });
  return out;
}

const hoof = (x: number, top: number, bottom: number, wTop: number, wBot: number): string => {
  const t = wTop / 2;
  const b = wBot / 2;
  const mid = top + (bottom - top) * 0.45;
  return (
    `M${x - t} ${top}Q${x} ${top - 4} ${x + t} ${top}Q${x + b} ${mid} ${x + b} ${bottom - 5}` +
    `Q${x + b} ${bottom} ${x + b - 5} ${bottom}L${x - b + 5} ${bottom}Q${x - b} ${bottom} ${x - b} ${bottom - 5}` +
    `Q${x - b} ${mid} ${x - t} ${top}Z`
  );
};

const HIP = 198;

const legBand = (x: number, y: number, r: number): Shape =>
  band(
    [
      [x - 26, y - 4],
      [x, y + 2],
      [x + 26, y - 4],
    ],
    r,
  );

const leg = (id: string, role: string, x: number, far: boolean): PartNode => ({
  id,
  role,
  behind: true,
  pivot: [x, HIP],
  shapes: [
    { d: capsule(x, HIP, x, 276, 16, 12.5), fill: far ? 'furFar' : 'fur' },
    { d: hoof(x, 283, 298, 24, 28), fill: far ? 'hoofFar' : 'hoof' },
    legBand(x, 236, 4.4),
    legBand(x, 252, 4.2),
    legBand(x, 267, 4),
  ],
});

const MANE: Pt[] = [
  [181, 146],
  [203, 134],
  [219, 114],
  [229, 92],
  [233, 64],
  [239, 40],
];

const zebra: AnimalDef = {
  id: 'zebra',
  name: 'Zebra',
  aliases: ['stripes', 'stripy horse', 'zeebra'],
  group: 'mammal',
  habitats: ['safari'],
  box: [342, 300],
  size: 240,
  locomotion: 'walk4',
  gait: { stride: 136, swing: 20 },
  sound: 'zebra',
  palette: {
    fur: '#fdfcf9',
    furFar: '#e3e1ea',
    stripe: '#2c2834',
    mane: '#2c2834',
    muzzle: '#46404f',
    hoof: '#37323f',
    hoofFar: '#4d4757',
    earInner: '#f2cfd6',
    nostril: '#25212b',
  },
  parts: [
    {
      id: 'body',
      role: 'body',
      pivot: [153, 200],
      shapes: [
        {
          d: smooth([
            [57, 152],
            [93, 142],
            [137, 146],
            [177, 144],
            [201, 134],
            [217, 116],
            [229, 86],
            [261, 82],
            [277, 112],
            [281, 150],
            [275, 184],
            [259, 210],
            [231, 227],
            [183, 234],
            [133, 236],
            [87, 232],
            [57, 218],
            [41, 198],
            [43, 170],
          ]),
          fill: 'fur',
        },
        stripe(
          [
            [97, 132],
            [93, 176],
            [99, 220],
          ],
          7.5,
        ),
        stripe(
          [
            [129, 134],
            [125, 180],
            [131, 226],
          ],
          7.5,
        ),
        stripe(
          [
            [161, 134],
            [157, 180],
            [163, 228],
          ],
          7.5,
        ),
        stripe(
          [
            [193, 128],
            [189, 174],
            [195, 222],
          ],
          7.5,
        ),
        stripe(
          [
            [69, 140],
            [57, 168],
            [61, 204],
          ],
          6.5,
          0.75,
        ),
        stripe(
          [
            [37, 172],
            [47, 196],
            [65, 222],
          ],
          5.5,
          0.7,
        ),
        stripe(
          [
            [213, 126],
            [241, 136],
            [283, 140],
          ],
          7,
          0.7,
        ),
        stripe(
          [
            [205, 146],
            [233, 162],
            [277, 176],
          ],
          7,
          0.7,
        ),
      ],
      children: [
        {
          id: 'tail',
          role: 'tail',
          pivot: [47, 160],
          behind: true,
          shapes: [
            { d: capsule(47, 160, 27, 180, 7.5, 6.5), fill: 'fur' },
            { d: capsule(27, 180, 19, 208, 6.5, 5.5), fill: 'fur' },
            { d: leaf(20, 198, 54, 13.5, 97), fill: 'stripe' },
            band(
              [
                [29, 160],
                [45, 178],
              ],
              3.4,
            ),
            band(
              [
                [11, 186],
                [33, 194],
              ],
              3.4,
            ),
          ],
        },
        {
          id: 'mane',
          pivot: [217, 100],
          behind: true,
          shapes: tufts(MANE, 6, 14, 11),
        },
        leg('legBF', 'legBF', 101, true),
        leg('legFF', 'legFF', 239, true),
        leg('legBN', 'legBN', 77, false),
        leg('legFN', 'legFN', 215, false),
        {
          id: 'head',
          role: 'head',
          pivot: [253, 102],
          shapes: [
            {
              d: smooth([
                [225, 58],
                [239, 34],
                [269, 20],
                [301, 24],
                [322, 44],
                [332, 70],
                [332, 98],
                [320, 118],
                [295, 126],
                [267, 122],
                [241, 110],
                [225, 86],
              ]),
              fill: 'fur',
            },
            { d: ellipse(323, 94, 26, 36), kind: 'detail', fill: 'muzzle' },
            stripe(
              [
                [295, 16],
                [293, 44],
                [299, 72],
              ],
              5.8,
              0.75,
            ),
            stripe(
              [
                [311, 22],
                [310, 46],
                [315, 66],
              ],
              5.2,
              0.75,
            ),
            stripe(
              [
                [259, 18],
                [265, 36],
                [267, 48],
              ],
              5,
              0.7,
            ),
            stripe(
              [
                [239, 46],
                [249, 74],
                [269, 106],
              ],
              5.5,
              0.65,
            ),
            { d: ellipse(273, 92, 11.5, 7.5), kind: 'feature', fill: 'blush', opacity: 0.55 },
            { d: circle(283, 64, 10.5), kind: 'feature', fill: 'eye' },
            { d: circle(287, 59.6, 4), kind: 'feature', fill: 'shine' },
            { d: ellipse(324, 82, 4.6, 3.4, -20), kind: 'feature', fill: 'nostril' },
            { d: 'M307 110Q316 116 326 109', kind: 'line', stroke: 'nostril', width: 3 },
          ],
          children: [
            {
              id: 'earF',
              role: 'earF',
              pivot: [243, 42],
              behind: true,
              shapes: [
                { d: leaf(243, 44, 33, 12, -106), fill: 'furFar' },
                { d: ellipse(233, 10, 12, 9), kind: 'detail', fill: 'stripe' },
              ],
            },
            {
              id: 'earN',
              role: 'earN',
              pivot: [261, 36],
              behind: true,
              shapes: [
                { d: leaf(261, 38, 36, 13, -80), fill: 'fur' },
                { d: leaf(262, 36, 27, 6.5, -80), kind: 'detail', fill: 'earInner' },
                { d: ellipse(268, 2, 12, 9), kind: 'detail', fill: 'stripe' },
              ],
            },
          ],
        },
      ],
    },
  ],
};

export default zebra;
