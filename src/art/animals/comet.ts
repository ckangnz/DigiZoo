import { circle, curve, ellipse, smooth, spline, tube, type Pt } from '../core/paths';
import type { AnimalDef, PartNode, Shape } from '../core/types';

const HX = 266;
const HY = 100;
const HR = 58;

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
        fill: 'star',
      },
    ],
  };
};

const streak = (pts: Pt[], r0: number, fill: string): Shape => ({
  d: tube(spline(pts, 24), (t) => r0 * (1 - t) ** 0.9 + 1.6, 80),
  fill,
});

const comet: AnimalDef = {
  id: 'comet',
  name: 'Comet',
  kind: 'object',
  aliases: ['shooting star', 'falling star', 'meteor', 'star'],
  group: 'space',
  habitats: ['space'],
  box: [340, 200],
  size: 160,
  locomotion: 'fly',
  gait: { period: 1, swing: 5 },
  sound: 'comet',
  palette: {
    ice: '#e9f7ff',
    iceDeep: '#c4e8fb',
    tail: '#9fd9fb',
    tailLight: '#cdeeff',
    glow: '#f4fbff',
    streak: '#b9c6ff',
    star: '#fff1a6',
    blush: '#ff9cbc',
  },
  parts: [
    {
      id: 'head',
      role: 'body',
      pivot: [HX, HY],
      shapes: [
        { d: circle(HX, HY, HR), fill: 'ice' },
        { d: circle(HX + 16, HY + 21, 20), kind: 'detail', fill: 'iceDeep' },
        { d: circle(HX - 25, HY + 30, 10), kind: 'detail', fill: 'iceDeep' },
        { d: circle(HX + 2, HY - 38, 8), kind: 'detail', fill: 'iceDeep' },
        { d: ellipse(HX - 22, HY + 18, 12, 7.2), kind: 'feature', fill: 'blush', opacity: 0.6 },
        { d: ellipse(HX + 38, HY + 18, 12, 7.2), kind: 'feature', fill: 'blush', opacity: 0.6 },
        {
          d: curve(HX + 1, HY + 14.5, HX + 17, HY + 14.5, 6.7),
          kind: 'line',
          stroke: 'mouth',
          width: 3.2,
        },
        { d: circle(HX - 10, HY - 4.5, 12.3), kind: 'feature', fill: 'eye' },
        { d: circle(HX + 28, HY - 4.5, 12.3), kind: 'feature', fill: 'eye' },
        { d: circle(HX - 5.5, HY - 9.2, 4.7), kind: 'feature', fill: 'shine' },
        { d: circle(HX + 32.5, HY - 9.2, 4.7), kind: 'feature', fill: 'shine' },
      ],
      children: [
        {
          id: 'tail',
          role: 'flame',
          behind: true,
          phase: 0.06,
          pivot: [HX, HY],
          shapes: [
            { d: circle(HX, HY, HR + 11), fill: 'tail' },
            {
              d: tube(
                spline(
                  [
                    [HX - 12, HY],
                    [HX - 90, HY - 6],
                    [HX - 170, HY - 18],
                    [16, HY - 36],
                  ],
                  30,
                ),
                (t) => 60 * (1 - t) ** 0.85 + 3,
                110,
              ),
              fill: 'tail',
            },
            {
              d: tube(
                spline(
                  [
                    [HX - 30, HY + 2],
                    [HX - 100, HY - 6],
                    [HX - 170, HY - 18],
                    [40, HY - 34],
                  ],
                  30,
                ),
                (t) => 34 * (1 - t) ** 0.9 + 2,
                100,
              ),
              kind: 'detail',
              fill: 'tailLight',
            },
            {
              d: tube(
                spline(
                  [
                    [HX - 40, HY - 2],
                    [HX - 110, HY - 10],
                    [HX - 160, HY - 18],
                  ],
                  20,
                ),
                (t) => 12 * (1 - t) + 1.5,
                60,
              ),
              kind: 'detail',
              fill: 'glow',
            },
          ],
          children: [
            {
              id: 'streakTop',
              role: 'wingN',
              behind: true,
              pivot: [HX - 20, HY - 30],
              shapes: [
                streak(
                  [
                    [HX - 20, HY - 34],
                    [HX - 80, HY - 56],
                    [HX - 150, HY - 70],
                    [HX - 205, HY - 74],
                  ],
                  12,
                  'streak',
                ),
              ],
            },
            {
              id: 'streakLow',
              role: 'wingF',
              behind: true,
              pivot: [HX - 20, HY + 32],
              shapes: [
                streak(
                  [
                    [HX - 20, HY + 34],
                    [HX - 80, HY + 46],
                    [HX - 140, HY + 44],
                    [HX - 190, HY + 34],
                  ],
                  11,
                  'streak',
                ),
              ],
            },
          ],
        },
        sparkle('sparkle1', HX - 128, HY - 44, 12, 0),
        sparkle('sparkle2', HX - 196, HY + 6, 9, 0.125),
      ],
    },
  ],
};

export default comet;
