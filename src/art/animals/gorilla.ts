import { circle, curve, ellipse, smooth, translatePath, tube } from '../core/paths';
import type { AnimalDef, Motion, PartNode } from '../core/types';

const SOLE = 276;
const SHOULDER = 104;
const HIP = 168;

const fist = (x: number): string =>
  smooth([
    [x - 18, SOLE - 26],
    [x + 4, SOLE - 32],
    [x + 24, SOLE - 27],
    [x + 33, SOLE - 13],
    [x + 28, SOLE - 1],
    [x - 2, SOLE],
    [x - 20, SOLE - 4],
    [x - 24, SOLE - 15],
  ]);

const arm = (id: string, x: number, far: boolean, motion: Motion): PartNode => ({
  id,
  role: id,
  behind: true,
  pivot: [x, SHOULDER],
  motion,
  shapes: [
    {
      d: tube(
        [
          [x, SHOULDER - 8],
          [x + 3, SHOULDER + 64],
          [x + 5, SOLE - 30],
        ],
        (t) => 30 - 13 * t,
        40,
      ),
      fill: far ? 'furDark' : 'fur',
    },
    { d: fist(x + 4), fill: far ? 'skinDark' : 'skin' },
    ...(far
      ? []
      : [
          {
            d: `M${x + 12} ${SOLE - 13}L${x + 13} ${SOLE - 3}`,
            kind: 'line' as const,
            stroke: 'skinLine',
            width: 2.4,
          },
          {
            d: `M${x + 21} ${SOLE - 15}L${x + 23} ${SOLE - 5}`,
            kind: 'line' as const,
            stroke: 'skinLine',
            width: 2.4,
          },
          {
            d: `M${x + 3} ${SOLE - 12}L${x + 3} ${SOLE - 2}`,
            kind: 'line' as const,
            stroke: 'skinLine',
            width: 2.4,
          },
        ]),
  ],
});

const leg = (id: string, x: number, far: boolean): PartNode => ({
  id,
  role: id,
  behind: true,
  pivot: [x, HIP],
  shapes: [
    {
      d: tube(
        [
          [x, HIP - 8],
          [x + 14, HIP + 38],
          [x + 8, SOLE - 18],
        ],
        (t) => 21 - 4.5 * t,
        40,
      ),
      fill: far ? 'furDark' : 'fur',
    },
    { d: ellipse(x + 16, SOLE - 10, 25, 10.5), fill: far ? 'skinDark' : 'skin' },
  ],
});

const offset = (parts: PartNode[], dx: number, dy: number): PartNode[] =>
  parts.map((p): PartNode => ({
    ...p,
    pivot: p.pivot && [p.pivot[0] + dx, p.pivot[1] + dy],
    shapes: p.shapes?.map((s) => ({ ...s, d: translatePath(s.d, dx, dy) })),
    children: p.children && offset(p.children, dx, dy),
  }));

const gorilla: AnimalDef = {
  id: 'gorilla',
  name: 'Gorilla',
  kind: 'animal',
  aliases: ['silverback', 'ape', 'big monkey', 'king kong', 'gorila'],
  group: 'mammal',
  habitats: ['safari', 'rainforest'],
  box: [280, 249],
  size: 260,
  locomotion: 'walk4',
  gait: { period: 1, swing: 16, stride: 120 },
  sound: 'gorilla',
  palette: {
    fur: '#4e4958',
    furDark: '#3d3946',
    silver: '#b9b6c3',
    silverDark: '#9c98a8',
    skin: '#8a7f86',
    skinDark: '#72686f',
    skinLine: '#5a5158',
    face: '#9a8f96',
    nose: '#4a4248',
  },
  parts: offset(
    [
      {
        id: 'body',
        role: 'body',
        pivot: [150, HIP],
        shapes: [
          {
            d: smooth([
              [258, 112],
              [252, 74],
              [226, 50],
              [186, 50],
              [146, 64],
              [112, 88],
              [88, 116],
              [80, 146],
              [90, 172],
              [116, 186],
              [156, 182],
              [196, 168],
              [230, 150],
              [252, 134],
            ]),
            fill: 'fur',
          },
          {
            d: smooth([
              [70, 168],
              [64, 118],
              [94, 72],
              [140, 42],
              [196, 34],
              [204, 56],
              [190, 72],
              [182, 80],
              [172, 84],
              [160, 98],
              [148, 100],
              [138, 108],
              [128, 122],
              [116, 124],
              [106, 134],
              [100, 150],
              [90, 154],
              [86, 170],
            ]),
            kind: 'detail',
            fill: 'silver',
          },
          { d: curve(106, 112, 146, 84, 6), kind: 'line', stroke: 'silverDark', width: 2.6 },
          { d: curve(130, 104, 170, 70, 6), kind: 'line', stroke: 'silverDark', width: 2.6 },
        ],
        children: [
          leg('legBF', 130, true),
          arm('legFF', 232, true, { rotate: 10, phase: 0.5 }),
          leg('legBN', 106, false),
          arm('legFN', 208, false, { rotate: 10 }),
          {
            id: 'head',
            role: 'head',
            pivot: [248, 132],
            shapes: [
              { d: circle(201.5, 110, 11.9), fill: 'fur' },
              { d: circle(322.5, 110, 11.9), fill: 'fur' },
              {
                d: smooth([
                  [262, 36.6],
                  [292.2, 49.5],
                  [316, 77.6],
                  [322.5, 112.2],
                  [311.7, 144.6],
                  [287.9, 166.2],
                  [262, 172.6],
                  [236.1, 166.2],
                  [212.3, 144.6],
                  [201.5, 112.2],
                  [208, 77.6],
                  [231.8, 49.5],
                ]),
                fill: 'fur',
              },
              { d: circle(201.5, 110, 5.9), kind: 'detail', fill: 'skin' },
              { d: circle(322.5, 110, 5.9), kind: 'detail', fill: 'skin' },
              { d: ellipse(243.6, 101.4, 22.7, 19.4, 8), kind: 'detail', fill: 'face' },
              { d: ellipse(280.4, 101.4, 22.7, 19.4, -8), kind: 'detail', fill: 'face' },
              { d: ellipse(262, 138.1, 38.9, 29.2), kind: 'detail', fill: 'face' },
              { d: ellipse(227.4, 135.9, 9.7, 6.5), kind: 'feature', fill: 'blush', opacity: 0.55 },
              { d: ellipse(296.6, 135.9, 9.7, 6.5), kind: 'feature', fill: 'blush', opacity: 0.55 },
              { d: circle(245.8, 102.4, 9.7), kind: 'feature', fill: 'eye' },
              { d: circle(278.2, 102.4, 9.7), kind: 'feature', fill: 'eye' },
              { d: circle(249.5, 98.7, 3.7), kind: 'feature', fill: 'shine' },
              { d: circle(281.9, 98.7, 3.7), kind: 'feature', fill: 'shine' },
              {
                d: 'M246.9 125.1Q262 114.3 277.1 125.1Q279.3 135.9 268.5 137Q262 134.8 255.5 137Q244.7 135.9 246.9 125.1Z',
                kind: 'feature',
                fill: 'nose',
              },
              { d: ellipse(254.4, 130.5, 3.7, 2.8), kind: 'feature', fill: 'eye' },
              { d: ellipse(269.6, 130.5, 3.7, 2.8), kind: 'feature', fill: 'eye' },
              { d: 'M244.7 151Q262 161.8 279.3 151', kind: 'line', stroke: 'mouth', width: 3.2 },
            ],
          },
        ],
      },
    ],
    -62,
    -29,
  ),
};

export default gorilla;
