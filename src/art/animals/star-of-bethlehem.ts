import { circle, smooth, tube, type Pt } from '../core/paths';
import type { AnimalDef, PartNode, Shape } from '../core/types';

const SX = 118;
const SY = 100;

const star = (tips: [number, number, number, number], valley: number, rot = 0): Pt[] => {
  const pts: Pt[] = [];
  for (let k = 0; k < 8; k++) {
    const deg = rot + k * 45 - 90;
    const r = k % 2 === 0 ? tips[k / 2] : valley;
    const a = (deg * Math.PI) / 180;
    pts.push([SX + r * Math.cos(a), SY + r * Math.sin(a)]);
  }
  return pts;
};

const sparkle = (id: string, x: number, y: number, r: number, phase: number): PartNode => {
  const k = r * 0.32;
  return {
    id,
    role: 'sparkle',
    phase,
    pivot: [x, y],
    shapes: [
      {
        d: smooth(
          [
            [x, y - r],
            [x + k, y - k],
            [x + r, y],
            [x + k, y + k],
            [x, y + r],
            [x - k, y + k],
            [x - r, y],
            [x - k, y - k],
          ],
          true,
          0.4,
        ),
        fill: 'twinkle',
      },
    ],
  };
};

const streak = (pts: Pt[], r0: number, r1: number, fill: string, kind?: 'detail'): Shape => ({
  d: tube(pts, (t) => r0 + (r1 - r0) * t ** 0.75, 48),
  fill,
  kind,
});

const starOfBethlehem: AnimalDef = {
  id: 'star-of-bethlehem',
  name: 'Star of Bethlehem',
  kind: 'object',
  aliases: ['christmas star', 'star', 'bethlehem star', 'guiding star', 'nativity star'],
  group: 'bible',
  habitats: ['bible'],
  box: [236, 262],
  size: 160,
  locomotion: 'float',
  gait: { period: 2.6, stride: 24 },
  sound: 'star-of-bethlehem',
  palette: {
    star: '#ffd23c',
    starLight: '#fff0a0',
    ray: '#ffe27a',
    rayLight: '#fff2b8',
    beam: '#fff0b8',
    beamLight: '#fffae6',
    twinkle: '#fff3b0',
  },
  parts: [
    {
      id: 'star',
      pivot: [SX, SY],
      shapes: [
        { d: smooth(star([90, 88, 132, 88], 35), true, 0.6), fill: 'star' },
        { d: smooth(star([54, 52, 76, 52], 22), true, 0.6), kind: 'detail', fill: 'starLight' },
        { d: circle(SX - 5, SY - 8, 7), kind: 'detail', fill: 'beamLight' },
      ],
      children: [
        {
          id: 'tail',
          behind: true,
          pivot: [SX, SY],
          motion: { scaleY: 0.03, freq: 2 },
          shapes: [
            streak(
              [
                [SX, SY + 10],
                [SX, SY + 80],
                [SX, 254],
              ],
              44,
              9,
              'beam',
            ),
            streak(
              [
                [SX, SY + 40],
                [SX, SY + 100],
                [SX, 248],
              ],
              22,
              4,
              'beamLight',
              'detail',
            ),
          ],
        },
        {
          id: 'rays',
          role: 'sparkle',
          behind: true,
          pivot: [SX, SY],
          motion: { scaleX: 0.08, scaleY: 0.08, freq: 2, wave: 'abs' },
          shapes: [
            { d: smooth(star([70, 70, 70, 70], 22, 45), true, 0.5), fill: 'ray' },
            {
              d: smooth(star([46, 46, 46, 46], 15, 45), true, 0.5),
              kind: 'detail',
              fill: 'rayLight',
            },
          ],
        },
        sparkle('sparkle1', 30, 30, 12, 0),
        sparkle('sparkle2', 206, 166, 10, 0.33),
        sparkle('sparkle3', 40, 196, 8, 0.66),
        sparkle('sparkle4', 206, 30, 7, 0.2),
      ],
    },
  ],
};

export default starOfBethlehem;
