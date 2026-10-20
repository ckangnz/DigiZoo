import { capsule, circle, curve, ellipse, smooth, type Pt } from '../core/paths';
import type { AnimalDef, PartNode, Shape } from '../core/types';

function hex(cx: number, cy: number): Shape {
  const r = 21.5;
  const corner = 0.2;
  const v: Pt[] = [];
  for (let i = 0; i < 6; i++) {
    const a = ((60 * i - 90) * Math.PI) / 180;
    v.push([cx + r * Math.cos(a), cy + r * Math.sin(a)]);
  }
  const lerp = (a: Pt, b: Pt, t: number): string =>
    `${(a[0] + (b[0] - a[0]) * t).toFixed(1)} ${(a[1] + (b[1] - a[1]) * t).toFixed(1)}`;
  let d = `M${lerp(v[0], v[1], corner)}`;
  for (let i = 0; i < 6; i++) {
    const a = v[i];
    const b = v[(i + 1) % 6];
    const c = v[(i + 2) % 6];
    d += `L${lerp(a, b, 1 - corner)}Q${b[0].toFixed(1)} ${b[1].toFixed(1)} ${lerp(b, c, corner)}`;
  }
  return { d: d + 'Z', kind: 'detail', fill: 'scute' };
}

const flipper = (
  id: string,
  pivot: Pt,
  outline: Pt[],
  far: boolean,
  motion?: PartNode['motion'],
): PartNode => ({
  id,
  role: id,
  behind: true,
  pivot,
  motion,
  shapes: [{ d: smooth(outline), fill: far ? 'skinDark' : 'skin' }],
});

const seaTurtle: AnimalDef = {
  id: 'sea-turtle',
  name: 'Sea Turtle',
  aliases: ['turtle', 'green turtle', 'honu'],
  group: 'reptile',
  habitats: ['ocean'],
  box: [310, 160],
  size: 150,
  locomotion: 'swim',
  sound: 'sea-turtle',
  palette: {
    shell: '#3f9656',
    scute: '#62b86f',
    skin: '#b3dd8e',
    skinDark: '#8fc172',
  },
  parts: [
    {
      id: 'body',
      role: 'body',
      pivot: [134, 62],
      shapes: [
        {
          d: smooth([
            [26, 86],
            [30, 66],
            [52, 40],
            [88, 20],
            [134, 12],
            [178, 16],
            [214, 32],
            [236, 56],
            [244, 80],
            [234, 92],
            [188, 98],
            [134, 100],
            [78, 98],
            [40, 94],
          ]),
          fill: 'shell',
        },
        hex(50, 34),
        hex(92.4, 34),
        hex(134.8, 34),
        hex(177.2, 34),
        hex(219.6, 34),
        hex(29, 70.8),
        hex(71.4, 70.8),
        hex(113.8, 70.8),
        hex(156.2, 70.8),
        hex(198.6, 70.8),
        hex(241, 70.8),
        {
          d:
            smooth(
              [
                [8, 78],
                [78, 85],
                [134, 87],
                [190, 85],
                [260, 76],
              ],
              false,
            ) + 'L260 132L8 132Z',
          kind: 'detail',
          fill: 'shell',
        },
        { d: ellipse(30, 97.1, 12.2, 7.4), kind: 'detail', fill: 'scute' },
        { d: ellipse(58.5, 94.8, 12.2, 7.4), kind: 'detail', fill: 'scute' },
        { d: ellipse(87, 95.2, 12.2, 7.4), kind: 'detail', fill: 'scute' },
        { d: ellipse(115.5, 95.5, 12.2, 7.4), kind: 'detail', fill: 'scute' },
        { d: ellipse(144, 95.5, 12.2, 7.4), kind: 'detail', fill: 'scute' },
        { d: ellipse(172.5, 95.3, 12.2, 7.4), kind: 'detail', fill: 'scute' },
        { d: ellipse(201, 94.9, 12.2, 7.4), kind: 'detail', fill: 'scute' },
        { d: ellipse(229.5, 94.4, 12.2, 7.4), kind: 'detail', fill: 'scute' },
      ],
      children: [
        {
          id: 'tail',
          role: 'tail',
          behind: true,
          pivot: [40, 89],
          shapes: [{ d: capsule(42, 89, 14, 95, 6.5, 3), fill: 'skin' }],
        },
        flipper(
          'flipperBF',
          [68, 88],
          [
            [64, 82],
            [76, 86],
            [72, 94],
            [54, 100],
            [34, 104],
            [26, 100],
            [32, 92],
            [48, 86],
          ],
          true,
        ),
        flipper(
          'flipperFF',
          [204, 86],
          [
            [194, 78],
            [214, 80],
            [216, 94],
            [208, 114],
            [196, 134],
            [186, 146],
            [176, 146],
            [176, 136],
            [182, 114],
            [186, 94],
          ],
          true,
          { rotate: 18, phase: 0.5 },
        ),
        flipper(
          'flipperBN',
          [64, 92],
          [
            [54, 86],
            [74, 88],
            [72, 100],
            [56, 112],
            [38, 122],
            [28, 122],
            [30, 112],
            [42, 100],
          ],
          false,
        ),
        {
          id: 'head',
          role: 'head',
          behind: true,
          pivot: [226, 74],
          shapes: [
            { d: capsule(214, 78, 256, 64, 17, 16), fill: 'skin' },
            { d: ellipse(270, 58, 35, 30, -6), fill: 'skin' },
            { d: circle(260, 36, 3.2), kind: 'detail', fill: 'skinDark' },
            { d: circle(247, 48, 2.6), kind: 'detail', fill: 'skinDark' },
            { d: circle(274, 31, 2.2), kind: 'detail', fill: 'skinDark' },
            { d: ellipse(274, 71, 8.5, 5.2), kind: 'feature', fill: 'blush', opacity: 0.55 },
            { d: circle(282, 51, 9.5), kind: 'feature', fill: 'eye' },
            { d: circle(285.8, 47, 3.6), kind: 'feature', fill: 'shine' },
            { d: curve(288, 71, 300, 65, 4), kind: 'line', stroke: 'mouth', width: 3 },
          ],
        },
        flipper(
          'flipperFN',
          [206, 90],
          [
            [194, 82],
            [216, 84],
            [220, 98],
            [204, 118],
            [178, 136],
            [150, 150],
            [136, 152],
            [134, 144],
            [148, 130],
            [172, 108],
          ],
          false,
          { rotate: 18 },
        ),
      ],
    },
  ],
};

export default seaTurtle;
