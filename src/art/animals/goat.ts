import { capsule, circle, ellipse, leaf, smooth, tube } from '../core/paths';
import type { AnimalDef, PartNode } from '../core/types';

function lock(
  x: number,
  y: number,
  len: number,
  width: number,
  angle: number,
  curl: number,
): string {
  const a = (angle * Math.PI) / 180;
  const dx = Math.cos(a);
  const dy = Math.sin(a);
  const nx = -dy;
  const ny = dx;
  const tx = x + dx * len;
  const ty = y + dy * len;
  const mx = x + dx * len * 0.5 + nx * curl;
  const my = y + dy * len * 0.5 + ny * curl;
  const p = (px: number, py: number) => `${px.toFixed(2)} ${py.toFixed(2)}`;
  return (
    `M${p(x + nx * width, y + ny * width)}` +
    `Q${p(mx + nx * width * 1.1, my + ny * width * 1.1)} ${p(tx, ty)}` +
    `Q${p(mx - nx * width * 0.7, my - ny * width * 0.7)} ${p(x - nx * width, y - ny * width)}Z`
  );
}

const hoof = (x: number, top: number, bottom: number, wTop: number, wBot: number): string => {
  const t = wTop / 2;
  const b = wBot / 2;
  const mid = top + (bottom - top) * 0.45;
  return (
    `M${x - t} ${top}Q${x} ${top - 3} ${x + t} ${top}Q${x + b} ${mid} ${x + b} ${bottom - 4}` +
    `Q${x + b} ${bottom} ${x + b - 4} ${bottom}L${x - b + 4} ${bottom}Q${x - b} ${bottom} ${x - b} ${bottom - 4}` +
    `Q${x - b} ${mid} ${x - t} ${top}Z`
  );
};

const HIP = 193;

const leg = (id: string, role: string, x: number, far: boolean): PartNode => ({
  id,
  role,
  behind: true,
  pivot: [x, HIP],
  shapes: [
    { d: capsule(x, HIP, x, 252, 17.5, 13), fill: far ? 'coatFar' : 'coat' },
    { d: hoof(x, 256, 270, 24, 27), fill: far ? 'hoofFar' : 'hoof' },
    ...(far
      ? []
      : [
          {
            d: `M${x + 1} 262L${x + 1} 269`,
            kind: 'line' as const,
            stroke: 'hoofLine',
            width: 2.2,
          },
        ]),
  ],
});

const goat: AnimalDef = {
  id: 'goat',
  name: 'Goat',
  aliases: ['kid', 'billy goat', 'nanny', 'nanny goat', 'billy'],
  group: 'mammal',
  habitats: ['farm'],
  box: [268, 272],
  size: 170,
  locomotion: 'walk4',
  gait: { stride: 96, swing: 18 },
  sound: 'goat',
  palette: {
    coat: '#fbf5ea',
    coatFar: '#e7dece',
    tan: '#d9ae7d',
    tanLight: '#f0d9bb',
    horn: '#dccdb2',
    hornFar: '#c6b697',
    hoof: '#6c5344',
    hoofFar: '#584237',
    hoofLine: '#3e2d25',
    earInner: '#f2b7ad',
    nose: '#b8746c',
  },
  parts: [
    {
      id: 'body',
      role: 'body',
      pivot: [101, 193],
      shapes: [
        {
          d: smooth([
            [27, 135],
            [59, 125],
            [91, 127],
            [127, 125],
            [147, 117],
            [159, 99],
            [167, 79],
            [195, 79],
            [203, 105],
            [197, 133],
            [187, 163],
            [175, 191],
            [151, 209],
            [101, 215],
            [61, 213],
            [31, 201],
            [15, 177],
            [15, 151],
          ]),
          fill: 'coat',
        },
        {
          d: smooth([
            [11, 129],
            [51, 117],
            [83, 125],
            [89, 153],
            [73, 179],
            [43, 189],
            [15, 181],
          ]),
          kind: 'detail',
          fill: 'tan',
        },
      ],
      children: [
        {
          id: 'tail',
          role: 'tail',
          pivot: [23, 137],
          behind: true,
          shapes: [
            { d: leaf(25, 141, 30, 9, -122), fill: 'coat' },
            { d: ellipse(9, 115, 9, 9), kind: 'detail', fill: 'tan' },
          ],
        },
        leg('legBF', 'legBF', 65, true),
        leg('legFF', 'legFF', 163, true),
        leg('legBN', 'legBN', 45, false),
        leg('legFN', 'legFN', 143, false),
        {
          id: 'head',
          role: 'head',
          pivot: [177, 105],
          shapes: [
            {
              d: smooth([
                [159.1, 58],
                [179.2, 37.8],
                [208.4, 31.1],
                [233, 42.3],
                [248.7, 66.9],
                [257.6, 96],
                [255.4, 116.2],
                [239.7, 128.5],
                [215.1, 130.8],
                [188.2, 120.7],
                [165.8, 102.8],
                [154.6, 80.4],
              ]),
              fill: 'coat',
            },
            { d: ellipse(250.9, 111.7, 19, 17.9), kind: 'detail', fill: 'tanLight' },
            { d: ellipse(199.4, 100.5, 12.3, 7.8), kind: 'feature', fill: 'blush', opacity: 0.55 },
            { d: circle(208.4, 71.4, 10.6), kind: 'feature', fill: 'eye' },
            { d: circle(212.4, 66.9, 4), kind: 'feature', fill: 'shine' },
            { d: ellipse(249.8, 98.3, 4.7, 3.4, -25), kind: 'feature', fill: 'nose' },
            {
              d: 'M230.8 117.3Q240.8 122.9 250.9 115.1',
              kind: 'line',
              stroke: 'mouth',
              width: 2.8,
            },
          ],
          children: [
            {
              id: 'hornF',
              behind: true,
              pivot: [177, 46.8],
              shapes: [
                {
                  d: tube(
                    [
                      [177, 49],
                      [170.3, 28.8],
                      [154.6, 17.6],
                      [141.2, 19.9],
                    ],
                    (t) => 7.2 - 3.9 * t,
                  ),
                  fill: 'hornFar',
                },
              ],
            },
            {
              id: 'hornN',
              behind: true,
              pivot: [192.7, 42.3],
              shapes: [
                {
                  d: tube(
                    [
                      [194.9, 44.5],
                      [190.4, 22.1],
                      [174.8, 8.7],
                      [159.1, 10.9],
                    ],
                    (t) => 8.4 - 4.5 * t,
                  ),
                  fill: 'horn',
                },
              ],
            },
            {
              id: 'ear',
              role: 'ear',
              behind: true,
              pivot: [172.5, 64.7],
              shapes: [
                { d: leaf(177, 64.7, 53.8, 14.6, 162), fill: 'tan' },
                { d: leaf(171.4, 65.8, 35.8, 6.7, 162), kind: 'detail', fill: 'earInner' },
              ],
            },
            {
              id: 'beard',
              behind: true,
              pivot: [217.3, 122.9],
              motion: { rotate: 6, phase: 0.2 },
              shapes: [{ d: lock(217, 118, 48, 11, 100, -5), fill: 'tan' }],
            },
          ],
        },
      ],
    },
  ],
};

export default goat;
