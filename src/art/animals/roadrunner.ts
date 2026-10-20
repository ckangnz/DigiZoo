import { capsule, circle, curve, ellipse, leaf, smooth, tube, type Pt } from '../core/paths';
import type { AnimalDef, PartNode, Shape } from '../core/types';

const HIP = 190;

const leg = (id: string, x: number, far: boolean): PartNode => {
  const fill = far ? 'legDark' : 'leg';
  return {
    id,
    role: id,
    behind: true,
    pivot: [x, HIP],
    shapes: [
      { d: capsule(x, HIP, x + 3, 212, 12, 8), fill: far ? 'brownDark' : 'brown' },
      { d: capsule(x + 3, 208, x + 6, 257, 5.8, 4.8), fill },
      { d: capsule(x + 6, 259, x + 31, 263, 4.8, 3.8), fill },
      { d: capsule(x + 6, 259, x - 13, 264, 4.6, 3.6), fill },
    ],
  };
};

const at = (base: Pt, angle: number, length: number): Pt => {
  const a = (angle * Math.PI) / 180;
  return [base[0] + Math.cos(a) * length, base[1] + Math.sin(a) * length];
};

const TAIL_BASE: Pt = [100, 152];

const feather = (angle: number, length: number, r: number, fill: string): Shape[] => {
  const cap = at(TAIL_BASE, angle, length - r);
  return [
    { d: circle(cap[0], cap[1], r), fill: 'cream' },
    {
      d: tube(
        [TAIL_BASE, at(TAIL_BASE, angle, length * 0.5), at(TAIL_BASE, angle, length - r * 1.5)],
        (t) => 6.5 + (r - 6.5) * Math.sin((Math.PI / 2) * Math.min(1, t / 0.75)),
        40,
      ),
      fill,
    },
  ];
};

const featherLine = (angle: number, from: number, to: number, off: number): Shape => {
  const a = ((angle + 90) * Math.PI) / 180;
  const p = at(TAIL_BASE, angle, from);
  const q = at(TAIL_BASE, angle, to);
  return {
    d: `M${p[0] + Math.cos(a) * off} ${p[1] + Math.sin(a) * off}L${q[0] + Math.cos(a) * off} ${q[1] + Math.sin(a) * off}`,
    kind: 'line',
    stroke: 'tailLine',
    width: 2.2,
  };
};

const streak = (x: number, y: number, rot: number, fill: string, len = 6.5): Shape => ({
  d: ellipse(x, y, len, 2, rot),
  kind: 'detail',
  fill,
});

const roadrunner: AnimalDef = {
  id: 'roadrunner',
  name: 'Roadrunner',
  kind: 'animal',
  aliases: ['road runner', 'chaparral bird', 'chaparral', 'cuckoo', 'bird', 'beep beep'],
  group: 'bird',
  habitats: ['desert'],
  box: [356, 270],
  size: 120,
  locomotion: 'walk2',
  gait: { stride: 126, swing: 28, period: 0.55 },
  sound: 'roadrunner',
  palette: {
    brown: '#a8764f',
    brownDark: '#86593a',
    streak: '#6e472d',
    cream: '#fbf1de',
    buff: '#f0d9b2',
    tail: '#7c5236',
    tailFar: '#6a442b',
    tailLine: '#5b3a24',
    crest: '#6f482e',
    wing: '#b9875a',
    wingLine: '#f6e4c4',
    beak: '#5e5661',
    leg: '#8e9cc0',
    legDark: '#7381a3',
    patch: '#5fb2e8',
    patchRed: '#ff8a5a',
  },
  parts: [
    {
      id: 'body',
      role: 'body',
      pivot: [160, 200],
      shapes: [
        {
          d: smooth([
            [250, 56],
            [282, 62],
            [298, 80],
            [302, 102],
            [294, 124],
            [276, 138],
            [256, 146],
            [240, 162],
            [224, 184],
            [196, 200],
            [158, 206],
            [122, 200],
            [96, 184],
            [86, 164],
            [94, 146],
            [118, 138],
            [152, 135],
            [184, 128],
            [206, 116],
            [214, 94],
            [226, 70],
          ]),
          fill: 'brown',
        },
        {
          d: smooth([
            [304, 98],
            [296, 128],
            [270, 146],
            [250, 166],
            [232, 190],
            [196, 206],
            [148, 212],
            [146, 196],
            [186, 186],
            [214, 168],
            [230, 146],
            [250, 124],
            [276, 112],
          ]),
          kind: 'detail',
          fill: 'cream',
        },
        streak(250, 152, 70, 'streak'),
        streak(238, 170, 62, 'streak'),
        streak(224, 186, 50, 'streak'),
        streak(206, 196, 34, 'streak'),
        streak(264, 140, 60, 'streak', 5.5),
        streak(124, 150, -8, 'buff'),
        streak(150, 143, -6, 'buff'),
        streak(178, 136, -14, 'buff'),
        streak(200, 126, -40, 'buff', 5.5),
        streak(112, 168, 10, 'buff', 5.5),
        { d: 'M294 86Q322 85 348 99Q352 104 346 106Q320 112 296 110Z', fill: 'beak' },
        { d: 'M298 100Q320 102 340 102', kind: 'line', stroke: 'streak', width: 2 },
        { d: leaf(254, 96, 30, 5.2, 184), kind: 'feature', fill: 'patch' },
        { d: leaf(230, 94, 14, 4.2, 184), kind: 'feature', fill: 'patchRed' },
        { d: ellipse(272, 118, 10, 6), kind: 'feature', fill: 'blush', opacity: 0.5 },
        { d: circle(268, 92, 11), kind: 'feature', fill: 'eye' },
        { d: circle(271.8, 87.8, 4.2), kind: 'feature', fill: 'shine' },
        { d: curve(289, 116, 299, 115, 2.5), kind: 'line', stroke: 'streak', width: 2.2 },
      ],
      children: [
        {
          id: 'tail',
          role: 'tail',
          behind: true,
          pivot: TAIL_BASE,
          shapes: [
            ...feather(-136, 104, 11.5, 'tailFar'),
            ...feather(-117, 104, 11.5, 'tailFar'),
            ...feather(-126, 124, 12.5, 'tail'),
            featherLine(-126, 34, 100, 0),
          ],
        },
        {
          id: 'crest',
          behind: true,
          pivot: [240, 66],
          motion: { rotate: 5, freq: 2, phase: 0.15 },
          shapes: [
            { d: leaf(232, 78, 40, 9, -168), fill: 'crest' },
            { d: leaf(234, 74, 46, 10, -146), fill: 'crest' },
            { d: leaf(240, 70, 46, 10, -124), fill: 'crest' },
            { d: leaf(248, 66, 38, 9, -104), fill: 'crest' },
            { d: leaf(258, 66, 26, 7, -84), fill: 'crest' },
            { d: leaf(214, 70, 16, 2.4, -150), kind: 'detail', fill: 'buff' },
            { d: leaf(228, 52, 16, 2.4, -124), kind: 'detail', fill: 'buff' },
            { d: leaf(246, 46, 14, 2.2, -104), kind: 'detail', fill: 'buff' },
          ],
        },
        leg('legF', 136, true),
        leg('legN', 162, false),
        {
          id: 'wing',
          role: 'wingN',
          pivot: [200, 150],
          shapes: [
            {
              d: smooth([
                [208, 146],
                [208, 166],
                [190, 182],
                [158, 188],
                [124, 182],
                [100, 170],
                [128, 158],
                [166, 148],
              ]),
              fill: 'wing',
            },
            { d: curve(192, 164, 150, 172, -4), kind: 'line', stroke: 'wingLine', width: 2.4 },
            { d: curve(178, 176, 136, 178, -4), kind: 'line', stroke: 'wingLine', width: 2.4 },
          ],
        },
      ],
    },
  ],
};

export default roadrunner;
