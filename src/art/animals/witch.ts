import {
  capsule,
  circle,
  curve,
  ellipse,
  roundRect,
  scallop,
  poly,
  smooth,
  spiky,
  spline,
  type Pt,
} from '../core/paths';
import type { AnimalDef, PartNode, Shape } from '../core/types';

const HANDLE_A: Pt = [44, 240];
const HANDLE_B: Pt = [318, 210];

const handleY = (x: number) =>
  HANDLE_A[1] + ((HANDLE_B[1] - HANDLE_A[1]) * (x - HANDLE_A[0])) / (HANDLE_B[0] - HANDLE_A[0]);

function cone(line: Pt[], radius: (t: number) => number): string {
  const pts = spline(line, 40);
  const m = pts.length;
  const left: Pt[] = [];
  const right: Pt[] = [];
  for (let i = 0; i < m; i++) {
    const a = pts[Math.max(0, i - 1)];
    const b = pts[Math.min(m - 1, i + 1)];
    const len = Math.hypot(b[0] - a[0], b[1] - a[1]) || 1;
    const nx = -(b[1] - a[1]) / len;
    const ny = (b[0] - a[0]) / len;
    const r = radius(i / (m - 1));
    left.push([pts[i][0] + nx * r, pts[i][1] + ny * r]);
    right.push([pts[i][0] - nx * r, pts[i][1] - ny * r]);
  }
  const tip = pts[m - 1];
  const a0 = Math.atan2(left[m - 1][1] - tip[1], left[m - 1][0] - tip[0]);
  const cap: Pt[] = [];
  const r = radius(1);
  for (let k = 1; k < 8; k++) {
    const a = a0 - (Math.PI * k) / 8;
    cap.push([tip[0] + Math.cos(a) * r, tip[1] + Math.sin(a) * r]);
  }
  return poly([...left, ...cap, ...right.reverse()]);
}

const leg = (id: string, hip: Pt, foot: Pt, far: boolean): PartNode => {
  const sock = far ? 'stockingDark' : 'stocking';
  const stripe = far ? 'stripeDark' : 'stripe';
  const shoe = far ? 'shoeDark' : 'shoe';
  const len = Math.hypot(foot[0] - hip[0], foot[1] - hip[1]);
  const ux = (foot[0] - hip[0]) / len;
  const uy = (foot[1] - hip[1]) / len;
  const at = (t: number): Pt => [hip[0] + ux * len * t, hip[1] + uy * len * t];
  const band = (t: number): Shape => {
    const [x, y] = at(t);
    return {
      d: capsule(x - uy * 14, y + ux * 14, x + uy * 14, y - ux * 14, 2.8),
      kind: 'detail',
      fill: stripe,
    };
  };
  return {
    id,
    role: id,
    behind: true,
    pivot: hip,
    shapes: [
      { d: capsule(hip[0], hip[1], foot[0], foot[1], 10, 8.5), fill: sock },
      band(0.24),
      band(0.5),
      band(0.76),
      {
        d: smooth([
          [foot[0] - 11, foot[1] - 4],
          [foot[0] + 6, foot[1] - 7],
          [foot[0] + 20, foot[1] - 3],
          [foot[0] + 25, foot[1] - 9],
          [foot[0] + 26, foot[1] + 1],
          [foot[0] + 16, foot[1] + 8],
          [foot[0] - 4, foot[1] + 9],
          [foot[0] - 12, foot[1] + 4],
        ]),
        fill: shoe,
      },
    ],
  };
};

const BRISTLES: Pt[] = [
  [70, 228],
  [44, 214],
  [18, 210],
  [8, 226],
  [6, 244],
  [16, 262],
  [42, 266],
  [70, 252],
];

const broom: PartNode = {
  id: 'broom',
  behind: true,
  pivot: [180, handleY(180)],
  shapes: [
    {
      d: capsule(HANDLE_A[0], HANDLE_A[1], HANDLE_B[0], HANDLE_B[1], 6.5, 6),
      fill: 'wood',
    },
    { d: smooth(BRISTLES), fill: 'straw' },
    { d: curve(64, 236, 16, 222, 4), kind: 'line', stroke: 'strawDark', width: 2.4 },
    { d: curve(64, 242, 10, 242, 0), kind: 'line', stroke: 'strawDark', width: 2.4 },
    { d: curve(64, 248, 16, 260, -4), kind: 'line', stroke: 'strawDark', width: 2.4 },
    {
      d: roundRect(64, 226, 16, 28, 5),
      fill: 'tie',
    },
  ],
};

const CAPE: Pt[] = [
  [176, 156],
  [198, 164],
  [194, 198],
  [166, 224],
  [132, 236],
  [100, 238],
  [78, 232],
  [86, 220],
  [70, 210],
  [80, 196],
  [100, 184],
  [126, 170],
  [152, 160],
];

const HAT_LINE: Pt[] = [
  [184, 70],
  [182, 42],
  [172, 22],
  [154, 10],
  [134, 8],
];

const witch: AnimalDef = {
  id: 'witch',
  name: 'Witch',
  kind: 'character',
  aliases: ['little witch', 'good witch', 'witchy', 'broomstick', 'sorceress', 'magic'],
  group: 'spooky',
  habitats: ['halloween'],
  box: [330, 300],
  size: 240,
  locomotion: 'float',
  sound: 'witch',
  palette: {
    hat: '#8b5ad8',
    hatDark: '#7446c2',
    band: '#9be36b',
    star: '#ffd34d',
    dress: '#5b4396',
    collar: '#9be36b',
    cape: '#4a3480',
    capeFold: '#6a4fa8',
    lining: '#9a6fe0',
    skin: '#ffd8c0',
    skinDark: '#f3bfa2',
    hair: '#ee8a3c',
    hairDark: '#d46f2a',
    stocking: '#a07be6',
    stockingDark: '#8462cc',
    stripe: '#9be36b',
    stripeDark: '#7fc955',
    shoe: '#4a3480',
    shoeDark: '#3b2a6a',
    wood: '#b07a45',
    straw: '#f4c85c',
    strawDark: '#d39a35',
    tie: '#8b5ad8',
  },
  parts: [
    {
      id: 'body',
      pivot: [182, 200],
      shapes: [
        {
          d: smooth([
            [170, 160],
            [196, 160],
            [210, 186],
            [222, 214],
            [232, 242],
            [216, 240],
            [202, 250],
            [188, 242],
            [173, 251],
            [160, 243],
            [144, 247],
            [150, 216],
            [160, 186],
          ]),
          fill: 'dress',
        },
        {
          d: smooth([
            [166, 160],
            [200, 160],
            [196, 172],
            [183, 176],
            [170, 172],
          ]),
          kind: 'detail',
          fill: 'collar',
        },
      ],
      children: [
        {
          id: 'cape',
          role: 'tail',
          behind: true,
          pivot: [182, 164],
          shapes: [
            { d: smooth(CAPE), fill: 'cape' },
            {
              d: smooth([
                [60, 222],
                [80, 228],
                [100, 232],
                [132, 230],
                [166, 218],
                [170, 250],
                [60, 250],
              ]),
              kind: 'detail',
              fill: 'lining',
            },
            { d: curve(150, 174, 108, 200, 6), kind: 'line', stroke: 'capeFold', width: 2.6 },
            { d: curve(164, 194, 118, 218, 5), kind: 'line', stroke: 'capeFold', width: 2.6 },
          ],
        },
        leg('legF', [172, 236], [180, 272], true),
        broom,
        leg('legN', [194, 238], [210, 276], false),
        {
          id: 'armN',
          pivot: [200, 172],
          shapes: [
            { d: capsule(200, 172, 232, 206, 10, 8.5), fill: 'dress' },
            { d: capsule(224, 197, 232, 206, 10), kind: 'detail', fill: 'collar' },
            { d: circle(238, handleY(238) - 2, 9.5), fill: 'skin' },
          ],
        },
        {
          id: 'head',
          role: 'head',
          pivot: [182, 160],
          shapes: [
            { d: ellipse(182, 114, 50, 48), fill: 'skin' },
            { d: ellipse(182, 114, 48.8, 46.8), kind: 'feature', fill: 'skin' },
            { d: ellipse(152, 132, 9.5, 6), kind: 'feature', fill: 'blush', opacity: 0.55 },
            { d: ellipse(214, 132, 9.5, 6), kind: 'feature', fill: 'blush', opacity: 0.55 },
            { d: circle(166, 115, 10.8), kind: 'feature', fill: 'eye' },
            { d: circle(200, 115, 10.8), kind: 'feature', fill: 'eye' },
            { d: circle(170, 110.8, 4.2), kind: 'feature', fill: 'shine' },
            { d: circle(204, 110.8, 4.2), kind: 'feature', fill: 'shine' },
            { d: circle(162.6, 119.6, 1.7), kind: 'feature', fill: 'shine' },
            { d: circle(196.6, 119.6, 1.7), kind: 'feature', fill: 'shine' },
            { d: curve(181, 124, 187, 125, 2), kind: 'line', stroke: 'skinDark', width: 2.4 },
            {
              d: 'M170 134Q184 138 198 134Q197 152 184 152Q171 152 170 134Z',
              kind: 'feature',
              fill: 'mouth',
            },
            { d: ellipse(184, 147, 7.5, 4.2), kind: 'feature', fill: 'tongue' },
          ],
          children: [
            {
              id: 'hairBack',
              behind: true,
              pivot: [182, 110],
              shapes: [
                { d: ellipse(182, 104, 58, 50), fill: 'hair' },
                { d: scallop(128, 136, 15, 7, 5), fill: 'hair' },
                { d: scallop(238, 136, 15, 7, 5), fill: 'hair' },
                { d: circle(138, 122, 5.5), kind: 'detail', fill: 'band' },
                { d: circle(227, 122, 5.5), kind: 'detail', fill: 'band' },
              ],
            },
            {
              id: 'bangs',
              pivot: [182, 84],
              shapes: [
                {
                  d: smooth([
                    [132, 96],
                    [140, 76],
                    [182, 66],
                    [226, 76],
                    [232, 98],
                    [218, 92],
                    [206, 100],
                    [194, 90],
                    [180, 98],
                    [168, 90],
                    [156, 100],
                    [146, 92],
                  ]),
                  fill: 'hair',
                },
              ],
            },
            {
              id: 'hat',
              pivot: [182, 72],
              shapes: [
                { d: cone(HAT_LINE, (t) => 36 * (1 - t) ** 0.85 + 3), fill: 'hat' },
                { d: ellipse(184, 60, 40, 9, -4), kind: 'detail', fill: 'band' },
              ],
              children: [
                {
                  id: 'brim',
                  pivot: [182, 74],
                  shapes: [{ d: ellipse(182, 74, 68, 12.5, -4), fill: 'hat' }],
                },
                {
                  id: 'star',
                  role: 'sparkle',
                  pivot: [186, 55],
                  shapes: [
                    {
                      d: spiky(186, 55, 9, 4, 5, -90, 0.5),
                      kind: 'feature',
                      fill: 'star',
                      stroke: 'auto',
                      width: 1.8,
                    },
                  ],
                },
              ],
            },
          ],
        },
      ],
    },
  ],
};

export default witch;
