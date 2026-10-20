import { capsule, circle, ellipse, f, mirrorPath, spline, tube, type Pt } from '../core/paths';
import type { AnimalDef, PartNode, Shape } from '../core/types';

const stripe = (x: number, y: number, len: number, w: number, angle = 90, bend = 0): string => {
  const a = (angle * Math.PI) / 180;
  const dx = Math.cos(a);
  const dy = Math.sin(a);
  const tx = x + dx * len;
  const ty = y + dy * len;
  const mx = x + dx * len * 0.5 - dy * bend;
  const my = y + dy * len * 0.5 + dx * bend;
  const hx = -dy * w * 0.5;
  const hy = dx * w * 0.5;
  return (
    `M${f(x + hx)} ${f(y + hy)}Q${f(mx + hx * 0.6)} ${f(my + hy * 0.6)} ${f(tx)} ${f(ty)}` +
    `Q${f(mx - hx * 0.6)} ${f(my - hy * 0.6)} ${f(x - hx)} ${f(y - hy)}Z`
  );
};

const RUFF = 'M238 124Q226 130 214 137Q222 142 229 146Q222 153 218 160Q230 162 242 168Z';

const dark = (d: string): Shape => ({ d, kind: 'detail', fill: 'stripe' });

const TAIL: Pt[] = [
  [82, 178],
  [58, 172],
  [42, 154],
  [35, 130],
  [38, 104],
];
const tailLine = spline(TAIL, 48);

const tailBand = (t: number, w: number): string => {
  const i = Math.round(t * (tailLine.length - 1));
  const a = tailLine[Math.max(0, i - 1)];
  const b = tailLine[Math.min(tailLine.length - 1, i + 1)];
  const angle = (Math.atan2(b[1] - a[1], b[0] - a[0]) * 180) / Math.PI;
  return ellipse(tailLine[i][0], tailLine[i][1], w, 16, angle);
};

const leg = (id: string, x: number, far: boolean): PartNode => ({
  id,
  role: id,
  behind: true,
  pivot: [x, 200],
  shapes: [
    { d: capsule(x, 200, x, 262, 19, 18), fill: far ? 'furDark' : 'fur' },
    { d: ellipse(x + 5, 273, 23, 14), fill: far ? 'furDark' : 'fur' },
    dark(stripe(x - 21, 241, 25, 10, 6)),
    dark(stripe(x + 21, 254, 20, 9, 178)),
    ...(far
      ? []
      : [
          { d: `M${x + 9} 279L${x + 9} 286`, kind: 'line' as const, stroke: 'toe', width: 2.6 },
          { d: `M${x + 18} 278L${x + 18} 285`, kind: 'line' as const, stroke: 'toe', width: 2.6 },
        ]),
  ],
});

const tiger: AnimalDef = {
  id: 'tiger',
  name: 'Tiger',
  aliases: ['tigress', 'tiger cub', 'big cat', 'stripy cat'],
  group: 'mammal',
  habitats: ['jungle'],
  box: [380, 290],
  size: 230,
  locomotion: 'walk4',
  gait: { stride: 120 },
  sound: 'tiger',
  palette: {
    fur: '#f8922f',
    furDark: '#e07a23',
    stripe: '#3b2520',
    cream: '#fff7ea',
    earInner: '#fde6d2',
    nose: '#d8656e',
    toe: '#b8621f',
  },
  parts: [
    {
      id: 'body',
      role: 'body',
      pivot: [166, 200],
      shapes: [
        { d: ellipse(166, 190, 100, 58), fill: 'fur' },
        { d: ellipse(172, 246, 84, 27), kind: 'detail', fill: 'cream' },
        dark(stripe(94, 130, 50, 14, 104, 4)),
        dark(stripe(121, 125, 60, 15, 96, -5)),
        dark(stripe(149, 124, 46, 14, 90, 4)),
        dark(stripe(177, 124, 58, 15, 84, -5)),
        dark(stripe(204, 128, 44, 13, 78, 4)),
        dark(stripe(70, 186, 30, 12, 0)),
        dark(stripe(72, 208, 24, 10, -10)),
      ],
      children: [
        {
          id: 'tail',
          role: 'tail',
          pivot: [80, 178],
          behind: true,
          shapes: [
            { d: tube(TAIL, (t) => 10.5 - 2.5 * t, 60), fill: 'fur' },
            dark(tailBand(0.3, 4)),
            dark(tailBand(0.52, 4)),
            dark(tailBand(0.72, 4)),
            dark(circle(TAIL[4][0], TAIL[4][1] + 2, 11)),
          ],
        },
        leg('legBF', 128, true),
        leg('legFF', 256, true),
        leg('legBN', 100, false),
        leg('legFN', 230, false),
        {
          id: 'head',
          role: 'head',
          pivot: [262, 170],
          shapes: [
            { d: circle(242, 76, 19), fill: 'stripe' },
            { d: circle(322, 72, 19), fill: 'stripe' },
            { d: RUFF, fill: 'fur' },
            { d: mirrorPath(RUFF, 282), fill: 'fur' },
            { d: ellipse(282, 126, 63, 58), fill: 'fur' },
            { d: circle(245, 79, 13), kind: 'detail', fill: 'fur' },
            { d: circle(319, 75, 13), kind: 'detail', fill: 'fur' },
            { d: circle(246, 80, 8), kind: 'detail', fill: 'earInner' },
            { d: circle(318, 76, 8), kind: 'detail', fill: 'earInner' },
            { d: ellipse(279, 154, 21, 17), kind: 'detail', fill: 'cream' },
            { d: ellipse(302, 153, 21, 17), kind: 'detail', fill: 'cream' },
            { d: ellipse(290, 170, 18, 12), kind: 'detail', fill: 'cream' },
            { d: ellipse(258, 99, 9, 5.5, -12), kind: 'detail', fill: 'cream' },
            { d: ellipse(316, 97, 9, 5.5, 12), kind: 'detail', fill: 'cream' },
            dark(stripe(286, 62, 26, 10, 90)),
            dark(stripe(270, 64, 18, 8, 104)),
            dark(stripe(302, 63, 18, 8, 76)),
            dark(stripe(220, 108, 26, 9, 18)),
            dark(stripe(216, 126, 28, 9, 4)),
            dark(stripe(214, 144, 18, 8, -8)),
            dark(stripe(344, 108, 26, 9, 162)),
            dark(stripe(348, 126, 28, 9, 176)),
            dark(stripe(350, 144, 18, 8, 188)),
            { d: ellipse(248, 146, 11, 7), kind: 'feature', fill: 'blush', opacity: 0.55 },
            { d: ellipse(332, 143, 11, 7), kind: 'feature', fill: 'blush', opacity: 0.55 },
            { d: circle(262, 118, 9.5), kind: 'feature', fill: 'eye' },
            { d: circle(314, 116, 9.5), kind: 'feature', fill: 'eye' },
            { d: circle(265.5, 114, 3.6), kind: 'feature', fill: 'shine' },
            { d: circle(317.5, 112, 3.6), kind: 'feature', fill: 'shine' },
            {
              d: 'M280 136Q291 130 302 136Q300 146 291 149Q282 146 280 136Z',
              kind: 'feature',
              fill: 'nose',
            },
            { d: 'M291 149Q291 158 282 160', kind: 'line', stroke: 'mouth', width: 3 },
            { d: 'M291 149Q291 158 300 160', kind: 'line', stroke: 'mouth', width: 3 },
          ],
        },
      ],
    },
  ],
};

export default tiger;
