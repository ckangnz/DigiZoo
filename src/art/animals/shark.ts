import { circle, curve, ellipse, smooth, type Pt } from '../core/paths';
import type { AnimalDef, Shape } from '../core/types';

const LIP_L: Pt = [302, 139];
const LIP_R: Pt = [367, 137];
const LIP_TOP: Pt = [334, 150];
const LIP_BOTTOM: Pt = [346, 176];

const quad = (a: Pt, c: Pt, b: Pt, t: number): Pt => [
  (1 - t) * (1 - t) * a[0] + 2 * t * (1 - t) * c[0] + t * t * b[0],
  (1 - t) * (1 - t) * a[1] + 2 * t * (1 - t) * c[1] + t * t * b[1],
];

const blossom = (a: Pt, c: Pt, b: Pt, t0: number, t1: number): Pt => [
  (1 - t0) * (1 - t1) * a[0] + ((1 - t0) * t1 + t0 * (1 - t1)) * c[0] + t0 * t1 * b[0],
  (1 - t0) * (1 - t1) * a[1] + ((1 - t0) * t1 + t0 * (1 - t1)) * c[1] + t0 * t1 * b[1],
];

const p = ([x, y]: Pt) => `${x.toFixed(1)} ${y.toFixed(1)}`;

const mouth = `M${p(LIP_L)}Q${p(LIP_TOP)} ${p(LIP_R)}Q${p(LIP_BOTTOM)} ${p(LIP_L)}Z`;

function tongue(): string {
  const [t0, t1] = [0.24, 0.76];
  const a = quad(LIP_R, LIP_BOTTOM, LIP_L, t0);
  const b = quad(LIP_R, LIP_BOTTOM, LIP_L, t1);
  const c = blossom(LIP_R, LIP_BOTTOM, LIP_L, t0, t1);
  const up = (q: Pt): Pt => [q[0], q[1] - 1.2];
  const top: Pt = [(a[0] + b[0]) / 2, Math.min(a[1], b[1]) - 9];
  return `M${p(up(a))}Q${p(up(c))} ${p(up(b))}Q${p(top)} ${p(up(a))}Z`;
}

function tooth(t: number): Shape {
  const [x, y] = quad(LIP_L, LIP_TOP, LIP_R, t);
  const w = 3.1;
  return {
    d: `M${x - w} ${y - 2.5}L${x + w} ${y - 2.5}L${x + w} ${y + 1.6}Q${x + w} ${y + 4.6} ${x} ${y + 4.6}Q${x - w} ${y + 4.6} ${x - w} ${y + 1.6}Z`,
    kind: 'feature',
    fill: 'white',
  };
}

const shark: AnimalDef = {
  id: 'shark',
  name: 'Shark',
  aliases: ['baby shark', 'sharky', 'great white'],
  group: 'fish',
  habitats: ['ocean'],
  box: [384, 220],
  size: 200,
  locomotion: 'swim',
  sound: 'shark',
  palette: {
    skin: '#82a3c3',
    belly: '#f7fbff',
    gill: '#5d7d9c',
  },
  parts: [
    {
      id: 'body',
      role: 'body',
      pivot: [236, 116],
      shapes: [
        {
          d: smooth([
            [374, 128],
            [368, 98],
            [348, 74],
            [314, 58],
            [272, 52],
            [228, 56],
            [186, 66],
            [148, 80],
            [118, 94],
            [98, 102],
            [98, 120],
            [120, 130],
            [158, 148],
            [206, 164],
            [258, 174],
            [308, 172],
            [346, 162],
            [368, 146],
          ]),
          fill: 'skin',
        },
        {
          d:
            smooth(
              [
                [384, 128],
                [334, 128],
                [284, 134],
                [234, 137],
                [184, 130],
                [144, 120],
                [108, 113],
                [80, 110],
              ],
              false,
            ) + 'L80 220L384 220Z',
          kind: 'detail',
          fill: 'belly',
        },
        { d: curve(272, 96, 268, 128, 5), kind: 'line', stroke: 'gill', width: 3.2 },
        { d: curve(259, 98, 255, 128, 5), kind: 'line', stroke: 'gill', width: 3.2 },
        { d: curve(246, 100, 243, 127, 5), kind: 'line', stroke: 'gill', width: 3.2 },
        { d: mouth, kind: 'feature', fill: 'mouth' },
        { d: tongue(), kind: 'feature', fill: 'tongue' },
        tooth(0.27),
        tooth(0.5),
        tooth(0.73),
        { d: ellipse(294, 121, 11, 6.5), kind: 'feature', fill: 'blush', opacity: 0.5 },
        { d: circle(322, 102, 12.5), kind: 'feature', fill: 'eye' },
        { d: circle(326.5, 97, 4.6), kind: 'feature', fill: 'shine' },
      ],
      children: [
        {
          id: 'tail',
          role: 'tail',
          behind: true,
          pivot: [106, 111],
          shapes: [
            {
              d: 'M120 98C100 82 74 54 54 32C46 23 33 27 37 40C46 68 58 92 70 110C58 126 46 146 42 162C39 172 50 176 57 168C76 150 100 132 120 122Z',
              fill: 'skin',
            },
          ],
        },
        {
          id: 'finTop',
          role: 'finTop',
          behind: true,
          pivot: [236, 62],
          shapes: [
            {
              d: 'M196 70C204 48 222 20 246 11C257 7 264 13 261 22C256 37 260 52 280 64Z',
              fill: 'skin',
            },
          ],
        },
        {
          id: 'finBack',
          role: 'finF',
          behind: true,
          pivot: [170, 152],
          shapes: [
            {
              d: 'M160 148C154 158 146 166 136 172C130 176 134 182 141 180C156 176 170 168 180 156Z',
              fill: 'skin',
            },
          ],
        },
        {
          id: 'finSide',
          role: 'finN',
          pivot: [254, 154],
          shapes: [
            {
              d: 'M240 148C226 160 206 172 186 178C176 181 176 190 186 191C214 192 246 180 268 160Z',
              fill: 'skin',
            },
          ],
        },
      ],
    },
  ],
};

export default shark;
