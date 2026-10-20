import { capsule, circle, curve, ellipse, smooth, tube, type Pt } from '../core/paths';
import type { AnimalDef, PartNode, Shape } from '../core/types';

const BALL: Pt = [206, 116];
const BALL_R = 54;
const GROUND = 170;
const STEPS = 10;

const leg = (id: string, hip: Pt, knee: Pt, foot: Pt, far: boolean, phase: number): PartNode => {
  const fill = far ? 'shellFar' : 'shell';
  const dir = foot[0] > hip[0] ? 1 : -1;
  return {
    id,
    role: id,
    behind: far,
    pivot: hip,
    motion: { rotate: 15, freq: STEPS, phase },
    shapes: [
      { d: capsule(hip[0], hip[1], knee[0], knee[1], 4.6, 3.8), fill },
      { d: capsule(knee[0], knee[1], foot[0], foot[1], 3.6, 2.6), fill },
      { d: capsule(foot[0], foot[1], foot[0] + 7 * dir, foot[1] + 1, 2.6, 2), fill },
      {
        d: capsule(knee[0], knee[1], knee[0] + 6 * dir, knee[1] - 5, 2.4, 1.4),
        fill,
      },
    ],
  };
};

const pusher = (
  id: string,
  hip: Pt,
  elbow: Pt,
  hand: Pt,
  far: boolean,
  phase: number,
): PartNode => {
  const fill = far ? 'shellFar' : 'shell';
  return {
    id,
    role: id,
    behind: far,
    pivot: hip,
    motion: { rotate: 6, freq: STEPS / 2, phase },
    shapes: [
      { d: capsule(hip[0], hip[1], elbow[0], elbow[1], 5.4, 4.4), fill },
      { d: capsule(elbow[0], elbow[1], hand[0], hand[1], 4.4, 3.8), fill },
      { d: ellipse(hand[0] + 1, hand[1] - 2, 4.6, 6.4, 30), fill },
    ],
  };
};

const onBall = (deg: number, k: number): Pt => {
  const t = (deg * Math.PI) / 180;
  return [BALL[0] + Math.cos(t) * BALL_R * k, BALL[1] + Math.sin(t) * BALL_R * k];
};

const lump = (deg: number, k: number, r: number, fill = 'ballDark'): Shape[] => {
  const [x, y] = onBall(deg, k);
  return [
    { d: circle(x, y, r), kind: 'feature', fill },
    { d: circle(x + r * 0.7, y + r * 0.3, r * 0.7), kind: 'feature', fill },
    { d: circle(x - r * 0.4, y + r * 0.6, r * 0.6), kind: 'feature', fill },
  ];
};

const straw = (deg: number, k: number, len: number, rot: number): Shape => {
  const [cx, cy] = onBall(deg, k);
  const r = (rot * Math.PI) / 180;
  const dx = (Math.cos(r) * len) / 2;
  const dy = (Math.sin(r) * len) / 2;
  return {
    d: `M${cx - dx} ${cy - dy}L${cx + dx} ${cy + dy}`,
    kind: 'line',
    stroke: 'straw',
    width: 2.6,
  };
};

const speck = (deg: number, k: number, r: number): Shape => {
  const [x, y] = onBall(deg, k);
  return { d: circle(x, y, r), kind: 'feature', fill: 'ballDark' };
};

const dungBeetle: AnimalDef = {
  id: 'dung-beetle',
  name: 'Dung Beetle',
  kind: 'animal',
  aliases: ['scarab', 'scarab beetle', 'beetle', 'dung roller', 'ball roller'],
  group: 'bug',
  habitats: ['desert'],
  box: [272, 172],
  size: 60,
  locomotion: 'crawl',
  gait: { stride: 2 * Math.PI * BALL_R, period: 4 },
  sound: 'dung-beetle',
  palette: {
    shell: '#2e3a73',
    shellFar: '#232c58',
    sheen: '#5470c9',
    sheenLight: '#8fb0f2',
    groove: '#45579f',
    ball: '#9a6941',
    ballDark: '#7c5132',
    ballLight: '#b07d50',
    straw: '#e2c06c',
    sclera: '#ffffff',
    smile: '#ffd3dc',
  },
  parts: [
    {
      id: 'ball',
      pivot: BALL,
      shapes: [{ d: circle(BALL[0], BALL[1], BALL_R), fill: 'ball' }],
      children: [
        {
          id: 'ballSpin',
          role: 'spinner',
          pivot: BALL,
          shapes: [
            ...lump(-70, 0.6, 6.5),
            ...lump(20, 0.62, 6),
            ...lump(140, 0.58, 7),
            ...lump(-150, 0.48, 5, 'ballLight'),
            ...lump(80, 0.28, 5.5, 'ballLight'),
            ...lump(-20, 0.18, 4.5),
            speck(-110, 0.78, 3),
            speck(50, 0.82, 2.6),
            speck(170, 0.84, 2.8),
            speck(-30, 0.82, 2.4),
            speck(110, 0.7, 2.6),
            straw(-100, 0.36, 20, 20),
            straw(60, 0.58, 18, -40),
            straw(200, 0.36, 16, 70),
            straw(-40, 0.5, 14, 110),
          ],
        },
      ],
    },
    {
      id: 'body',
      role: 'body',
      pivot: [96, 150],
      shapes: [
        {
          d: smooth([
            [36, 132],
            [40, 104],
            [58, 82],
            [86, 72],
            [116, 74],
            [136, 90],
            [142, 114],
            [132, 138],
            [98, 146],
            [60, 144],
          ]),
          fill: 'shell',
        },
        { d: ellipse(84, 88, 32, 8.5, -12), kind: 'detail', fill: 'sheen' },
        { d: ellipse(76, 86, 13, 4, -16), kind: 'detail', fill: 'sheenLight' },
        { d: curve(46, 112, 134, 106, -14), kind: 'line', stroke: 'groove', width: 2.4 },
        { d: curve(52, 128, 132, 124, -9), kind: 'line', stroke: 'groove', width: 2.4 },
      ],
      children: [
        leg('leg1F', [108, 136], [130, 144], [126, GROUND - 4], true, 0.5),
        leg('leg2F', [84, 136], [62, 144], [68, GROUND - 4], true, 0),
        leg('leg1N', [112, 134], [136, 150], [134, GROUND - 3], false, 0),
        leg('leg2N', [80, 136], [56, 150], [58, GROUND - 3], false, 0.5),
        pusher('clawF', [136, 124], [150, 132], [162, 120], true, 0.25),
        {
          id: 'head',
          role: 'head',
          pivot: [140, 110],
          shapes: [
            {
              d: smooth([
                [138, 84],
                [160, 80],
                [178, 90],
                [184, 108],
                [178, 126],
                [160, 134],
                [142, 128],
                [132, 108],
              ]),
              fill: 'shell',
            },
            { d: ellipse(156, 89, 15, 4.6, -8), kind: 'detail', fill: 'sheen' },
            { d: circle(153, 104, 8.5), kind: 'feature', fill: 'sclera' },
            { d: circle(172, 102, 7.4), kind: 'feature', fill: 'sclera' },
            { d: circle(154.4, 105, 5.8), kind: 'feature', fill: 'eye' },
            { d: circle(173, 103, 5.1), kind: 'feature', fill: 'eye' },
            { d: circle(156.5, 102.6, 2.3), kind: 'feature', fill: 'shine' },
            { d: circle(174.8, 100.8, 2), kind: 'feature', fill: 'shine' },
            { d: ellipse(147, 118, 5.6, 3.6), kind: 'feature', fill: 'blush', opacity: 0.7 },
            { d: ellipse(178, 115, 4.2, 3), kind: 'feature', fill: 'blush', opacity: 0.7 },
            { d: curve(157, 118, 170, 117, 4), kind: 'line', stroke: 'smile', width: 2.4 },
          ],
          children: [
            {
              id: 'antennaF',
              role: 'antenna',
              behind: true,
              pivot: [172, 86],
              phase: 0.3,
              shapes: [
                {
                  d: tube(
                    [
                      [172, 88],
                      [180, 74],
                      [190, 68],
                    ],
                    2.6,
                    16,
                  ),
                  fill: 'shellFar',
                },
                { d: ellipse(192, 66, 6, 4.5, -30), fill: 'shellFar' },
              ],
            },
            {
              id: 'antennaN',
              role: 'antenna',
              behind: true,
              pivot: [160, 84],
              shapes: [
                {
                  d: tube(
                    [
                      [160, 86],
                      [164, 70],
                      [174, 60],
                    ],
                    2.8,
                    16,
                  ),
                  fill: 'shell',
                },
                { d: ellipse(177, 58, 6.5, 5, -30), fill: 'shell' },
              ],
            },
          ],
        },
        pusher('clawN', [134, 134], [148, 152], [164, 146], false, 0.75),
      ],
    },
  ],
};

export default dungBeetle;
