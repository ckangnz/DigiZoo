import { capsule, circle, ellipse, leaf, smooth, spline, tube, type Pt } from '../core/paths';
import type { AnimalDef, PartNode, Shape } from '../core/types';

const GROUND = 190;
const HIP = 142;

const SHELL: Pt[] = [
  [36, 150],
  [38, 118],
  [54, 84],
  [86, 58],
  [128, 44],
  [172, 44],
  [212, 56],
  [242, 80],
  [258, 112],
  [264, 146],
  [232, 156],
  [150, 160],
  [68, 156],
];

const domeTop = (x: number) => 44 + 0.0052 * (x - 150) ** 2;

const band = (x: number, lean: number): Shape => ({
  d: tube(
    [
      [x + lean, domeTop(x + lean) - 12],
      [x + lean * 0.4, 104],
      [x, 170],
    ],
    1.9,
  ),
  kind: 'detail',
  fill: 'shellDark',
});

const bandShine = (x: number, lean: number): Shape => ({
  d: tube(
    [
      [x + lean + 7, domeTop(x + lean) + 8],
      [x + lean * 0.4 + 7, 98],
      [x + 7, 140],
    ],
    3.2,
  ),
  kind: 'detail',
  fill: 'shellLight',
});

function scales(x0: number, x1: number): Shape[] {
  const out: Shape[] = [];
  const rows = [70, 92, 114, 136];
  rows.forEach((y, row) => {
    for (let x = x0 + (row % 2) * 9; x <= x1; x += 18) {
      if (y < domeTop(x) + 10) continue;
      out.push({ d: ellipse(x, y, 6.5, 5.2), kind: 'detail', fill: 'shellLight' });
    }
  });
  return out;
}

const leg = (id: string, x: number, far: boolean): PartNode => {
  const fill = far ? 'skinDark' : 'skin';
  const claw = (dx: number): Shape => ({
    d: `M${x + dx} ${GROUND - 9}L${x + dx + 1} ${GROUND - 4}`,
    kind: 'line',
    stroke: 'claw',
    width: 2.4,
  });
  return {
    id,
    role: id,
    behind: true,
    pivot: [x, HIP],
    shapes: [
      { d: capsule(x, HIP, x + 1, GROUND - 14, 12.5, 11), fill },
      { d: ellipse(x + 4, GROUND - 7.5, 15, 7.5), fill },
      ...(far ? [] : [claw(7), claw(13)]),
    ],
  };
};

const TAIL: Pt[] = [
  [50, 140],
  [32, 152],
  [18, 166],
  [8, 182],
];
const tailLine = spline(TAIL, 30);
const tailRing = (t: number): Shape => {
  const i = Math.round(t * 30);
  const a = tailLine[Math.max(0, i - 1)];
  const b = tailLine[Math.min(30, i + 1)];
  const angle = (Math.atan2(b[1] - a[1], b[0] - a[0]) * 180) / Math.PI;
  return {
    d: ellipse(tailLine[i][0], tailLine[i][1], 2.6, 12, angle),
    kind: 'detail',
    fill: 'shellDark',
  };
};

const armadillo: AnimalDef = {
  id: 'armadillo',
  name: 'Armadillo',
  kind: 'animal',
  aliases: ['nine-banded armadillo', 'dillo', 'armadilo'],
  group: 'mammal',
  habitats: ['rainforest', 'desert'],
  box: [332, 190],
  size: 100,
  locomotion: 'walk4',
  gait: { period: 0.8, stride: 56, swing: 18 },
  sound: 'armadillo',
  palette: {
    shell: '#c49a7b',
    shellDark: '#9c7357',
    shellLight: '#ddb898',
    skin: '#ebc3ab',
    skinDark: '#d4a68e',
    cap: '#c49a7b',
    earInner: '#f2a6a2',
    nose: '#6b4434',
    claw: '#8f6650',
  },
  parts: [
    {
      id: 'body',
      role: 'body',
      pivot: [150, HIP],
      shapes: [
        { d: smooth(SHELL), fill: 'shell' },
        ...scales(46, 108),
        ...scales(196, 258),
        bandShine(118, -6),
        bandShine(136, -3),
        bandShine(154, 0),
        bandShine(172, 3),
        bandShine(190, 6),
        band(112, -6),
        band(130, -3),
        band(148, 0),
        band(166, 3),
        band(184, 6),
        band(202, 9),
      ],
      children: [
        {
          id: 'tail',
          role: 'tail',
          behind: true,
          pivot: [50, 140],
          motion: { rotate: 6, phase: 0.25 },
          shapes: [
            { d: tube(TAIL, (t) => 10 - 6.5 * t), fill: 'shell' },
            tailRing(0.25),
            tailRing(0.45),
            tailRing(0.65),
            tailRing(0.83),
          ],
        },
        leg('legBF', 98, true),
        leg('legFF', 226, true),
        leg('legBN', 76, false),
        leg('legFN', 204, false),
        {
          id: 'head',
          role: 'head',
          pivot: [244, 134],
          shapes: [
            {
              d: smooth([
                [226, 102],
                [252, 84],
                [282, 90],
                [302, 110],
                [318, 132],
                [320, 144],
                [308, 152],
                [280, 158],
                [248, 156],
                [226, 140],
              ]),
              fill: 'skin',
            },
            {
              d: smooth([
                [228, 104],
                [254, 84],
                [284, 92],
                [298, 108],
                [272, 110],
                [242, 116],
              ]),
              kind: 'detail',
              fill: 'cap',
            },
            { d: ellipse(278, 140, 10, 6), kind: 'feature', fill: 'blush', opacity: 0.55 },
            { d: circle(270, 123, 8.4), kind: 'feature', fill: 'eye' },
            { d: circle(273.4, 119.6, 3.2), kind: 'feature', fill: 'shine' },
            { d: ellipse(318, 139, 5.5, 4.6, 20), kind: 'feature', fill: 'nose' },
            { d: 'M294 150Q302 154 310 149', kind: 'line', stroke: 'mouth', width: 2.6 },
          ],
          children: [
            {
              id: 'earF',
              role: 'earF',
              behind: true,
              pivot: [240, 98],
              shapes: [{ d: leaf(240, 100, 38, 11, -114), fill: 'skinDark' }],
            },
            {
              id: 'earN',
              role: 'earN',
              behind: true,
              pivot: [252, 94],
              shapes: [
                { d: leaf(252, 96, 40, 12, -88), fill: 'skin' },
                { d: leaf(252, 94, 27, 6, -88), kind: 'detail', fill: 'earInner' },
              ],
            },
          ],
        },
      ],
    },
  ],
};

export default armadillo;
