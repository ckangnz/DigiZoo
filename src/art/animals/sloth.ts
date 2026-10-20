import { capsule, circle, ellipse, smooth, tube, type Pt } from '../core/paths';
import type { AnimalDef, PartNode, Shape } from '../core/types';

const GROUND = 200;

function shaggy(
  cx: number,
  cy: number,
  rx: number,
  ry: number,
  n: number,
  tuft: number,
  from: number,
  sweep: number,
): string {
  const pts: Pt[] = [];
  for (let i = 0; i < n * 2; i++) {
    const a = (i / (n * 2)) * Math.PI * 2;
    const down = Math.sin(a);
    const tip = i % 2 === 1 && down > from;
    const k = tip ? 1 + tuft * Math.min(1, (down - from) / (1 - from) + 0.35) : 1;
    const aa = tip ? a + sweep : a;
    pts.push([cx + rx * k * Math.cos(aa), cy + ry * k * Math.sin(aa)]);
  }
  return smooth(pts, true, 0.75);
}

const claws = (x: number, y: number, far: boolean): Shape[] =>
  [
    [0, 34, 0],
    [-4, 23, 1.5],
    [-8, 12, 3],
  ].map(([dx, reach, dy]) => {
    const ox = x + dx;
    const oy = y + dy;
    const line: Pt[] = [
      [ox, oy],
      [ox + reach * 0.5, oy - 5],
      [ox + reach * 0.88, oy + 1],
      [ox + reach, GROUND - 4.2],
    ];
    return { d: tube(line, (u) => 4.6 - 1.3 * u, 24), fill: far ? 'clawDark' : 'claw' };
  });

const limb = (id: string, top: Pt, joint: Pt, paw: Pt, far: boolean, r: number): PartNode => {
  const fill = far ? 'furDark' : 'fur';
  return {
    id,
    role: id,
    behind: true,
    pivot: [paw[0] + 12, top[1]],
    shapes: [
      ...claws(paw[0] + 6, paw[1], far),
      { d: capsule(top[0], top[1], joint[0], joint[1], r, r - 1.5), fill },
      { d: capsule(joint[0], joint[1], paw[0], paw[1], r - 1.5, r - 3), fill },
      { d: ellipse(paw[0] + 2, paw[1] + 1, r - 1, r - 5), fill },
    ],
  };
};

const strand = (x: number, y: number, dx: number, dy: number): Shape => ({
  d: `M${x} ${y}q${dx * 0.7} ${dy * 0.35} ${dx} ${dy}`,
  kind: 'line',
  stroke: 'furDark',
  width: 2.6,
});

const sloth: AnimalDef = {
  id: 'sloth',
  name: 'Sloth',
  aliases: ['three-toed sloth', 'two-toed sloth'],
  group: 'mammal',
  habitats: ['rainforest'],
  box: [308, 200],
  size: 140,
  locomotion: 'walk4',
  gait: { period: 2.6, stride: 54, swing: 10 },
  sound: 'sloth',
  palette: {
    fur: '#ad9476',
    furDark: '#90785c',
    furLight: '#cab595',
    face: '#f4e7cb',
    mask: '#6f5441',
    nose: '#4a3326',
    claw: '#f2e6c6',
    clawDark: '#d8c9a3',
  },
  parts: [
    {
      id: 'body',
      role: 'body',
      pivot: [126, 158],
      shapes: [
        { d: shaggy(116, 104, 100, 54, 24, 0.09, -0.35, -0.06), fill: 'fur' },
        { d: ellipse(121, 158, 76, 24), kind: 'detail', fill: 'furLight' },
        strand(68, 76, -4, 18),
        strand(100, 66, -3, 20),
        strand(134, 68, -2, 18),
        strand(48, 108, -5, 16),
        strand(82, 102, -4, 18),
        strand(116, 96, -3, 17),
      ],
      children: [
        limb('legBF', [80, 128], [64, 164], [78, 182], true, 17),
        limb('legFF', [210, 114], [232, 154], [254, 180], true, 16),
        limb('legBN', [56, 130], [40, 166], [54, 184], false, 18),
        limb('legFN', [188, 116], [210, 156], [232, 182], false, 17),
        {
          id: 'head',
          role: 'head',
          pivot: [204, 104],
          shapes: [
            { d: shaggy(226, 66, 54, 50, 15, 0.06, -1, -0.08), fill: 'fur' },
            { d: circle(218, 17, 8), fill: 'fur' },
            { d: circle(232, 15, 7), fill: 'fur' },
            { d: ellipse(227, 73, 47, 41), kind: 'detail', fill: 'face' },
            { d: ellipse(207, 67, 17, 9.5, -22), kind: 'detail', fill: 'mask' },
            { d: ellipse(247, 67, 17, 9.5, 22), kind: 'detail', fill: 'mask' },
            { d: ellipse(200, 89, 7.5, 5), kind: 'feature', fill: 'blush', opacity: 0.55 },
            { d: ellipse(254, 89, 7.5, 5), kind: 'feature', fill: 'blush', opacity: 0.55 },
            { d: circle(213, 65, 6.4), kind: 'feature', fill: 'eye' },
            { d: circle(241, 65, 6.4), kind: 'feature', fill: 'eye' },
            { d: circle(215.4, 62.6, 2.4), kind: 'feature', fill: 'shine' },
            { d: circle(243.4, 62.6, 2.4), kind: 'feature', fill: 'shine' },
            { d: ellipse(227, 80, 9, 6.5), kind: 'feature', fill: 'nose' },
            { d: ellipse(224.5, 78, 3, 1.8), kind: 'feature', fill: 'shine', opacity: 0.7 },
            { d: 'M218 92Q227 99 236 92', kind: 'line', stroke: 'nose', width: 2.8 },
          ],
        },
      ],
    },
  ],
};

export default sloth;
