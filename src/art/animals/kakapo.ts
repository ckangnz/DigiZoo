import { capsule, circle, curve, ellipse, leaf, rotatePath, smooth, type Pt } from '../core/paths';
import type { AnimalDef, PartNode, Shape } from '../core/types';

const SOLE = 250;
const HIP_Y = 204;
const STRIDE = 54;
const DUTY = 0.6;
const LIFT = 9;
const FACE: Pt = [216, 96];

const frac = (v: number) => v - Math.floor(v);

const footAt = (x: number, offset: number, phase: number): { at: Pt; tilt: number } => {
  const p = frac(phase + offset);
  const shift = STRIDE * DUTY;
  if (p < DUTY) return { at: [x + shift / 2 - shift * (p / DUTY), SOLE], tilt: 0 };
  const q = (p - DUTY) / (1 - DUTY);
  const e = q * q * (3 - 2 * q);
  const up = Math.sin(Math.PI * q);
  return { at: [x - shift / 2 + shift * e, SOLE - LIFT * up], tilt: 14 * up * (1 - q) };
};

const leg = (id: string, x: number, far: boolean, offset: number): PartNode => {
  const fill = far ? 'legDark' : 'leg';
  return {
    id,
    role: id,
    pivot: [x, HIP_Y],
    motion: null,
    frames: (phase) => {
      const { at, tilt } = footAt(x, offset, phase);
      const [fx, fy] = at;
      const ax = fx;
      const ay = fy - 9;
      const foot = (d: string) => rotatePath(d, tilt, ax, ay);
      return [
        { d: capsule(x, HIP_Y - 16, ax, ay, 12, 8.5), fill },
        { d: foot(capsule(ax, ay, ax + 22, fy - 4.5, 5.4, 4.4)), fill },
        { d: foot(capsule(ax, ay - 1, ax + 16, fy - 9, 5, 4.2)), fill },
        { d: foot(capsule(ax, ay, ax - 16, fy - 4.5, 5.2, 4.2)), fill },
        { d: foot(capsule(ax, ay - 1, ax - 11, fy - 9, 4.8, 4)), fill },
        { d: foot(ellipse(ax, ay + 1, 8.5, 6.5)), fill },
      ];
    },
  };
};

const bar = (x: number, y: number, angle: number, fill = 'bar', len = 11): Shape => ({
  d: leaf(x, y, len, 2.4, angle),
  kind: 'detail',
  fill,
});

const BODY: Pt[] = [
  [178, 58],
  [222, 72],
  [250, 108],
  [254, 150],
  [238, 190],
  [202, 216],
  [154, 226],
  [106, 222],
  [66, 204],
  [40, 176],
  [32, 142],
  [44, 108],
  [76, 80],
  [120, 62],
];

const WING: Pt[] = [
  [190, 112],
  [192, 140],
  [176, 170],
  [146, 192],
  [110, 202],
  [78, 198],
  [66, 182],
  [82, 160],
  [110, 134],
  [146, 114],
];

const whisker = (side: 1 | -1, dy: number, reach: number): Shape => {
  const x1 = FACE[0] + side * 9;
  const y1 = FACE[1] + 24 + dy * 0.4;
  return {
    d: curve(x1, y1, FACE[0] + side * reach, FACE[1] + 22 + dy, side * 3),
    kind: 'line',
    stroke: 'discLine',
    width: 2,
  };
};

const kakapo: AnimalDef = {
  id: 'kakapo',
  name: 'Kakapo',
  kind: 'animal',
  aliases: ['owl parrot', 'green parrot', 'parrot', 'bird'],
  group: 'bird',
  habitats: ['aussie', 'birds'],
  box: [300, SOLE],
  size: 110,
  locomotion: 'walk2',
  gait: { period: 0.8, stride: STRIDE },
  sound: 'kakapo',
  palette: {
    moss: '#7fae3c',
    mossDark: '#689a30',
    mossLight: '#a8cc5c',
    bar: '#4f7a26',
    belly: '#bfd068',
    wing: '#73a336',
    disc: '#e3d89a',
    discEdge: '#cbbf78',
    discLine: '#b8a866',
    beak: '#f1ebdd',
    beakDark: '#cfc5b0',
    leg: '#b9abab',
    legDark: '#9d9091',
  },
  parts: [
    leg('legF', 124, true, 0.55),
    leg('legN', 160, false, 0.05),
    {
      id: 'body',
      role: 'body',
      pivot: [150, HIP_Y],
      shapes: [
        { d: smooth(BODY), fill: 'moss' },
        { d: ellipse(196, 196, 62, 34, -22), kind: 'detail', fill: 'belly' },
        bar(70, 110, -30),
        bar(96, 92, -24),
        bar(126, 78, -16),
        bar(156, 70, -8),
        bar(58, 140, -40),
        bar(84, 122, -30),
        bar(112, 104, -22),
        bar(52, 170, -56),
        bar(214, 160, 60, 'mossLight', 10),
        bar(228, 140, 76, 'mossLight', 10),
        bar(206, 182, 46, 'mossLight', 10),
      ],
      children: [
        {
          id: 'tail',
          role: 'tail',
          behind: true,
          pivot: [52, 188],
          shapes: [
            { d: capsule(64, 186, 16, 172, 8, 11), fill: 'mossDark' },
            { d: capsule(64, 194, 10, 192, 8, 11.5), fill: 'mossDark' },
            { d: capsule(66, 202, 18, 212, 8, 11), fill: 'mossDark' },
            bar(30, 176, 168, 'bar', 14),
            bar(24, 193, 178, 'bar', 14),
            bar(32, 209, 190, 'bar', 12),
          ],
        },
        {
          id: 'wing',
          role: 'wingN',
          pivot: [176, 120],
          shapes: [
            { d: smooth(WING), fill: 'wing' },
            bar(160, 128, 150),
            bar(136, 140, 150),
            bar(112, 154, 150),
            bar(162, 156, 140),
            bar(138, 168, 144),
            bar(112, 180, 150),
            bar(88, 176, 160),
            bar(172, 136, 120, 'mossLight', 9),
            bar(150, 176, 130, 'mossLight', 9),
            bar(100, 168, 150, 'mossLight', 9),
          ],
        },
        {
          id: 'head',
          role: 'head',
          pivot: [200, 140],
          shapes: [
            { d: circle(FACE[0], FACE[1], 56), fill: 'moss' },
            { d: ellipse(FACE[0] - 18, FACE[1] + 2, 31, 34), kind: 'detail', fill: 'discEdge' },
            { d: ellipse(FACE[0] + 18, FACE[1] + 2, 31, 34), kind: 'detail', fill: 'discEdge' },
            { d: ellipse(FACE[0], FACE[1] + 22, 30, 26), kind: 'detail', fill: 'discEdge' },
            { d: ellipse(FACE[0] - 18, FACE[1] + 2, 27.5, 30.5), kind: 'detail', fill: 'disc' },
            { d: ellipse(FACE[0] + 18, FACE[1] + 2, 27.5, 30.5), kind: 'detail', fill: 'disc' },
            { d: ellipse(FACE[0], FACE[1] + 22, 26.5, 22.5), kind: 'detail', fill: 'disc' },
            bar(FACE[0] - 22, FACE[1] - 46, -20),
            bar(FACE[0] + 4, FACE[1] - 50, 0),
            bar(FACE[0] + 28, FACE[1] - 44, 24),
            whisker(-1, 0, 34),
            whisker(-1, 10, 30),
            whisker(1, 0, 34),
            whisker(1, 10, 30),
            {
              d: ellipse(FACE[0] - 30, FACE[1] + 18, 9, 5.5),
              kind: 'feature',
              fill: 'blush',
              opacity: 0.55,
            },
            {
              d: ellipse(FACE[0] + 30, FACE[1] + 18, 9, 5.5),
              kind: 'feature',
              fill: 'blush',
              opacity: 0.55,
            },
            { d: circle(FACE[0] - 18, FACE[1] - 2, 12), kind: 'feature', fill: 'eye' },
            { d: circle(FACE[0] + 18, FACE[1] - 2, 12), kind: 'feature', fill: 'eye' },
            { d: circle(FACE[0] - 13.6, FACE[1] - 6.8, 4.6), kind: 'feature', fill: 'shine' },
            { d: circle(FACE[0] + 22.4, FACE[1] - 6.8, 4.6), kind: 'feature', fill: 'shine' },
            { d: circle(FACE[0] - 21.6, FACE[1] + 2.6, 1.9), kind: 'feature', fill: 'shine' },
            { d: circle(FACE[0] + 14.4, FACE[1] + 2.6, 1.9), kind: 'feature', fill: 'shine' },
          ],
          children: [
            {
              id: 'beak',
              pivot: [FACE[0], FACE[1] + 8],
              shapes: [
                {
                  d: `M${FACE[0] - 11} ${FACE[1] + 8}Q${FACE[0]} ${FACE[1] + 2} ${FACE[0] + 11} ${FACE[1] + 8}Q${FACE[0] + 12} ${FACE[1] + 26} ${FACE[0] + 2} ${FACE[1] + 38}Q${FACE[0] - 2} ${FACE[1] + 40} ${FACE[0] - 3} ${FACE[1] + 34}Q${FACE[0] - 12} ${FACE[1] + 24} ${FACE[0] - 11} ${FACE[1] + 8}Z`,
                  fill: 'beak',
                },
                {
                  d: ellipse(FACE[0] + 3, FACE[1] + 18, 4, 9, 10),
                  kind: 'detail',
                  fill: 'beakDark',
                },
              ],
            },
          ],
        },
      ],
    },
  ],
};

export default kakapo;
