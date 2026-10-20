import {
  capsule,
  circle,
  ellipse,
  leaf,
  smooth,
  translatePath,
  tube,
  type Pt,
} from '../core/paths';
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
    `M${x - t} ${top}Q${x} ${top - 4} ${x + t} ${top}Q${x + b} ${mid} ${x + b} ${bottom - 5}` +
    `Q${x + b} ${bottom} ${x + b - 5} ${bottom}L${x - b + 5} ${bottom}Q${x - b} ${bottom} ${x - b} ${bottom - 5}` +
    `Q${x - b} ${mid} ${x - t} ${top}Z`
  );
};

const HIP = 246;

const leg = (id: string, x: number, far: boolean): PartNode => ({
  id,
  role: id,
  behind: true,
  pivot: [x, HIP],
  shapes: [
    { d: capsule(x, HIP, x, 314, 18, 12.5), fill: far ? 'coatFar' : 'coat' },
    { d: hoof(x, 320, 338, 25, 29), fill: far ? 'hoofFar' : 'hoof' },
  ],
});

const CREST: Pt[] = [
  [234, 104],
  [224, 124],
  [212, 144],
  [198, 162],
];

const offset = (parts: PartNode[], dx: number, dy: number): PartNode[] =>
  parts.map((p): PartNode => ({
    ...p,
    pivot: p.pivot && [p.pivot[0] + dx, p.pivot[1] + dy],
    shapes: p.shapes?.map((s) => ({ ...s, d: translatePath(s.d, dx, dy) })),
    children: p.children && offset(p.children, dx, dy),
  }));

const donkey: AnimalDef = {
  id: 'donkey',
  name: 'Donkey',
  kind: 'animal',
  aliases: ['burro', 'mule', 'hee haw'],
  group: 'mammal',
  habitats: ['farm', 'bible'],
  box: [304, 340],
  size: 240,
  locomotion: 'walk4',
  gait: { stride: 120, swing: 18 },
  sound: 'donkey',
  palette: {
    coat: '#a3a1ab',
    coatFar: '#8b8994',
    pale: '#f3eee8',
    mane: '#57525c',
    earInner: '#e9c3c6',
    hoof: '#4d4450',
    hoofFar: '#3e3641',
    nostril: '#6f6570',
  },
  parts: offset(
    [
      {
        id: 'body',
        role: 'body',
        pivot: [164, 246],
        shapes: [
          {
            d: smooth([
              [68, 198],
              [102, 186],
              [134, 188],
              [172, 184],
              [198, 170],
              [214, 150],
              [226, 132],
              [250, 128],
              [270, 146],
              [276, 178],
              [272, 212],
              [258, 244],
              [232, 266],
              [186, 276],
              [134, 278],
              [102, 274],
              [72, 260],
              [54, 236],
              [56, 212],
            ]),
            fill: 'coat',
          },
          { d: ellipse(164, 280, 80, 24), kind: 'detail', fill: 'pale' },
        ],
        children: [
          {
            id: 'tail',
            role: 'tail',
            pivot: [66, 202],
            behind: true,
            shapes: [
              {
                d: tube(
                  [
                    [68, 204],
                    [52, 216],
                    [44, 238],
                    [42, 262],
                  ],
                  (t) => 5.5 - 1.5 * t,
                ),
                fill: 'coat',
              },
              { d: lock(42, 256, 38, 9, 96, 3), fill: 'mane' },
            ],
          },
          leg('legBF', 102, true),
          leg('legFF', 216, true),
          leg('legBN', 80, false),
          leg('legFN', 194, false),
          {
            id: 'mane',
            pivot: [216, 138],
            shapes: [
              { d: tube(CREST, 8), fill: 'mane' },
              { d: lock(234, 106, 22, 7.5, -118, 2), fill: 'mane' },
              { d: lock(227, 118, 24, 8, -128, 2), fill: 'mane' },
              { d: lock(220, 131, 24, 8, -136, 2), fill: 'mane' },
              { d: lock(212, 144, 22, 8, -142, 2), fill: 'mane' },
              { d: lock(204, 156, 18, 7, -148, 2), fill: 'mane' },
            ],
          },
          {
            id: 'head',
            role: 'head',
            pivot: [244, 160],
            shapes: [
              {
                d: smooth([
                  [215.4, 124.8],
                  [230.8, 100.6],
                  [257.2, 87.4],
                  [290.2, 91.8],
                  [312.2, 111.6],
                  [323.2, 140.2],
                  [325.4, 168.8],
                  [314.4, 188.6],
                  [290.2, 197.4],
                  [261.6, 193],
                  [237.4, 175.4],
                  [219.8, 151.2],
                ]),
                fill: 'coat',
              },
              { d: ellipse(310, 171, 29.7, 29.7), kind: 'detail', fill: 'pale' },
              { d: ellipse(270.4, 125.9, 17.6, 16.5), kind: 'detail', fill: 'pale' },
              {
                d: ellipse(257.2, 157.8, 13.2, 8.8),
                kind: 'feature',
                fill: 'blush',
                opacity: 0.55,
              },
              { d: circle(271.5, 124.8, 12.1), kind: 'feature', fill: 'eye' },
              { d: circle(275.9, 119.7, 4.6), kind: 'feature', fill: 'shine' },
              { d: ellipse(316.6, 157.8, 5.1, 3.6, -25), kind: 'feature', fill: 'nostril' },
              {
                d: 'M295.7 184.2Q306.7 190.8 318.8 183.1',
                kind: 'line',
                stroke: 'nostril',
                width: 3,
              },
            ],
            children: [
              {
                id: 'earF',
                role: 'earF',
                pivot: [241.8, 100.6],
                behind: true,
                shapes: [
                  { d: leaf(241.8, 102.8, 88, 16.5, -116), fill: 'coatFar' },
                  { d: leaf(215.6, 49.0, 34, 13.2, -116), kind: 'detail', fill: 'mane' },
                ],
              },
              {
                id: 'earN',
                role: 'earN',
                pivot: [259.4, 96.2],
                behind: true,
                shapes: [
                  { d: leaf(259.4, 98.4, 92.4, 18.2, -81), fill: 'coat' },
                  { d: leaf(260.5, 96.2, 68.2, 8.8, -81), kind: 'detail', fill: 'earInner' },
                  { d: leaf(269.5, 34.5, 34, 13.2, -81), kind: 'detail', fill: 'mane' },
                ],
              },
              {
                id: 'forelock',
                pivot: [244, 91.8],
                shapes: [
                  { d: lock(240, 97, 22, 6.5, -64, -3), fill: 'mane' },
                  { d: lock(245, 95, 20, 6, -40, -3), fill: 'mane' },
                  { d: lock(249, 95, 16, 5, -18, -2), fill: 'mane' },
                ],
              },
            ],
          },
        ],
      },
    ],
    -26,
    0,
  ),
};

export default donkey;
