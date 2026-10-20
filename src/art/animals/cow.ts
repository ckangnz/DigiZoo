import { capsule, circle, ellipse, leaf, smooth, tube, type Pt } from '../core/paths';
import type { AnimalDef, PartNode, Shape } from '../core/types';

const hoof = (x: number, top: number, bottom: number, wTop: number, wBot: number): string => {
  const t = wTop / 2;
  const b = wBot / 2;
  const mid = top + (bottom - top) * 0.45;
  return (
    `M${x - t} ${top}Q${x} ${top - 4} ${x + t} ${top}Q${x + b} ${mid} ${x + b} ${bottom - 5}` +
    `Q${x + b} ${bottom} ${x + b - 5} ${bottom}L${x - b + 5} ${bottom}Q${x - b} ${bottom} ${x - b} ${bottom - 5}` +
    `Q${x - b} ${mid} ${x - t} ${top}Z`
  );
};

const patch = (pts: Pt[]): Shape => ({ d: smooth(pts), kind: 'detail', fill: 'patch' });

const HIP = 195;

const leg = (id: string, role: string, x: number, far: boolean): PartNode => ({
  id,
  role,
  behind: true,
  pivot: [x, HIP],
  shapes: [
    { d: capsule(x, HIP, x, 262, 20, 16.5), fill: far ? 'hideFar' : 'hide' },
    { d: hoof(x, 269, 288, 33, 37), fill: far ? 'hoofFar' : 'hoof' },
    ...(far
      ? []
      : [
          {
            d: `M${x + 1} 277L${x + 1} 286`,
            kind: 'line' as const,
            stroke: 'hoofLine',
            width: 2.6,
          },
        ]),
  ],
});

const cow: AnimalDef = {
  id: 'cow',
  name: 'Cow',
  aliases: ['moo', 'cattle', 'calf', 'moo cow', 'bull'],
  group: 'mammal',
  habitats: ['farm', 'bible'],
  box: [356, 290],
  size: 250,
  locomotion: 'walk4',
  gait: { stride: 126, swing: 20 },
  sound: 'cow',
  palette: {
    hide: '#fdfcf9',
    hideFar: '#e4e1e8',
    patch: '#2f2a36',
    muzzle: '#f7b4bf',
    nostril: '#d66f80',
    horn: '#f4e3bd',
    earInner: '#f7b4bf',
    hoof: '#544650',
    hoofFar: '#43373f',
    hoofLine: '#2e252b',
    collar: '#e4544b',
    bell: '#f7c544',
    bellDark: '#c98d1d',
  },
  parts: [
    {
      id: 'body',
      role: 'body',
      pivot: [143, 195],
      shapes: [
        {
          d: smooth([
            [48, 118],
            [88, 106],
            [138, 106],
            [188, 106],
            [226, 112],
            [250, 130],
            [258, 162],
            [252, 198],
            [230, 224],
            [178, 232],
            [118, 234],
            [72, 228],
            [40, 208],
            [28, 176],
            [32, 140],
          ]),
          fill: 'hide',
        },
        patch([
          [96, 94],
          [154, 90],
          [174, 118],
          [164, 150],
          [138, 162],
          [110, 150],
          [96, 124],
        ]),
        patch([
          [22, 150],
          [48, 140],
          [74, 156],
          [78, 188],
          [62, 212],
          [34, 214],
          [20, 190],
        ]),
        patch([
          [192, 172],
          [218, 162],
          [240, 178],
          [236, 204],
          [210, 214],
          [190, 198],
        ]),
        { d: circle(154, 212, 13), kind: 'detail', fill: 'patch' },
      ],
      children: [
        {
          id: 'tail',
          role: 'tail',
          pivot: [36, 132],
          behind: true,
          shapes: [
            { d: capsule(36, 132, 20, 162, 5.5, 5), fill: 'hide' },
            { d: capsule(20, 162, 16, 204, 5, 4.2), fill: 'hide' },
            { d: leaf(16, 198, 42, 11.5, 93), fill: 'patch' },
          ],
        },
        leg('legBF', 'legBF', 96, true),
        leg('legFF', 'legFF', 232, true),
        leg('legBN', 'legBN', 70, false),
        leg('legFN', 'legFN', 206, false),
        {
          id: 'head',
          role: 'head',
          pivot: [243.9, 140],
          shapes: [
            {
              d: smooth([
                [207.1, 73.3],
                [216.3, 48],
                [237, 34.2],
                [260, 30.8],
                [283, 34.2],
                [303.7, 48],
                [312.9, 73.3],
                [310.6, 103.2],
                [299.1, 128.5],
                [260, 140],
                [220.9, 128.5],
                [209.4, 103.2],
              ]),
              fill: 'hide',
            },
            patch([
              [207.1, 48],
              [218.6, 29.6],
              [243.9, 27.3],
              [255.4, 41.1],
              [248.5, 59.5],
              [230.1, 68.7],
              [209.4, 66.4],
            ]),
            { d: ellipse(217.4, 105.5, 12.6, 8), kind: 'feature', fill: 'blush', opacity: 0.55 },
            { d: ellipse(302.6, 105.5, 12.6, 8), kind: 'feature', fill: 'blush', opacity: 0.55 },
            { d: circle(234.7, 84.8, 10.9), kind: 'feature', fill: 'eye' },
            { d: circle(285.3, 84.8, 10.9), kind: 'feature', fill: 'eye' },
            { d: circle(238.7, 80.2, 4.1), kind: 'feature', fill: 'shine' },
            { d: circle(289.3, 80.2, 4.1), kind: 'feature', fill: 'shine' },
          ],
          children: [
            {
              id: 'horns',
              behind: true,
              pivot: [260, 38.8],
              shapes: [
                {
                  d: tube(
                    [
                      [239.3, 43.4],
                      [227.8, 29.6],
                      [225.5, 11.2],
                    ],
                    (t) => 8.5 - 4.5 * t,
                  ),
                  fill: 'horn',
                },
                {
                  d: tube(
                    [
                      [280.7, 43.4],
                      [292.2, 29.6],
                      [294.5, 11.2],
                    ],
                    (t) => 8.5 - 4.5 * t,
                  ),
                  fill: 'horn',
                },
              ],
            },
            {
              id: 'earL',
              behind: true,
              pivot: [216.3, 68.7],
              motion: { rotate: 7, freq: 2, phase: 0.3 },
              shapes: [
                { d: leaf(218.6, 68.7, 46, 14.4, 168), fill: 'patch' },
                { d: leaf(214, 68.7, 29.9, 6.9, 168), kind: 'detail', fill: 'earInner' },
              ],
            },
            {
              id: 'earR',
              behind: true,
              pivot: [303.7, 68.7],
              motion: { rotate: -7, freq: 2, phase: 0.3 },
              shapes: [
                { d: leaf(301.4, 68.7, 46, 14.4, 12), fill: 'hide' },
                { d: leaf(306, 68.7, 29.9, 6.9, 12), kind: 'detail', fill: 'earInner' },
              ],
            },
            {
              id: 'collar',
              behind: true,
              pivot: [260, 180],
              shapes: [
                {
                  d: tube(
                    [
                      [209.4, 147.8],
                      [232.4, 170.8],
                      [260, 180],
                      [287.6, 170.8],
                      [310.6, 147.8],
                    ],
                    4.5,
                  ),
                  fill: 'collar',
                },
              ],
              children: [
                {
                  id: 'bell',
                  pivot: [260, 182.3],
                  motion: { rotate: 9, phase: 0.35 },
                  shapes: [
                    { d: circle(260, 208.8, 4.6), fill: 'bellDark' },
                    {
                      d: smooth([
                        [260, 181.2],
                        [270.4, 186.9],
                        [272.6, 198.4],
                        [277.2, 206.4],
                        [242.8, 206.4],
                        [247.4, 198.4],
                        [249.6, 186.9],
                      ]),
                      fill: 'bell',
                    },
                    { d: 'M250.8 199.6L269.2 199.6', kind: 'line', stroke: 'bellDark', width: 2.6 },
                  ],
                },
              ],
            },
            {
              id: 'muzzle',
              pivot: [260, 140],
              shapes: [
                { d: ellipse(260, 141, 51, 31), fill: 'muzzle' },
                { d: ellipse(243, 136, 6.6, 5, -10), kind: 'feature', fill: 'nostril' },
                { d: ellipse(277, 136, 6.6, 5, 10), kind: 'feature', fill: 'nostril' },
                { d: 'M249 152Q260 159.5 271 152', kind: 'line', stroke: 'mouth', width: 3 },
              ],
            },
          ],
        },
      ],
    },
  ],
};

export default cow;
