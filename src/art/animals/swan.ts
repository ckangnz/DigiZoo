import { circle, curve, ellipse, smooth, translatePath, tube, type Pt } from '../core/paths';
import type { AnimalDef, PartNode, Shape } from '../core/types';

const W = 300;
const WAVE_TOP = 238;

const water = (): Shape[] => {
  const top: Pt[] = [];
  for (let i = 0; i <= 8; i++) {
    const x = 22 + (i * (W - 44)) / 8;
    top.push([x, WAVE_TOP + (i % 2 ? 7 : 0)]);
  }
  const pts: Pt[] = [
    ...top,
    [W - 12, WAVE_TOP + 20],
    [W - 34, WAVE_TOP + 32],
    [34, WAVE_TOP + 32],
    [12, WAVE_TOP + 20],
  ];
  return [
    { d: smooth(pts), fill: 'water' },
    { d: ellipse(W / 2, WAVE_TOP + 38, 150, 13), kind: 'detail', fill: 'waterDark' },
    {
      d: curve(62, WAVE_TOP + 17, 102, WAVE_TOP + 17, 3),
      kind: 'line',
      stroke: 'ripple',
      width: 3,
    },
    {
      d: curve(136, WAVE_TOP + 21, 184, WAVE_TOP + 21, 3),
      kind: 'line',
      stroke: 'ripple',
      width: 3,
    },
    {
      d: curve(216, WAVE_TOP + 16, 252, WAVE_TOP + 16, 3),
      kind: 'line',
      stroke: 'ripple',
      width: 3,
    },
  ];
};

const NECK: Pt[] = [
  [202, 222],
  [222, 190],
  [230, 158],
  [222, 126],
  [208, 100],
  [208, 74],
  [220, 56],
];

const WING =
  'M204 206C218 214 216 232 196 242C170 252 112 254 78 240A16 16 0 0 1 56 214A17 17 0 0 1 44 182A18 18 0 0 1 44 148A18 18 0 0 1 64 116C96 116 152 148 204 206Z';

const SCALLOPS = [
  'M110 242A16 16 0 0 1 88 216A17 17 0 0 1 76 184A18 18 0 0 1 78 150',
  'M146 240A16 16 0 0 1 124 214A17 17 0 0 1 112 184A18 18 0 0 1 116 156',
];

const COVERTS =
  'M110 242A16 16 0 0 1 88 216A17 17 0 0 1 76 184A18 18 0 0 1 78 150L120 130L240 170L240 270L110 270Z';

const offset = (parts: PartNode[], dx: number, dy: number): PartNode[] =>
  parts.map((p): PartNode => ({
    ...p,
    pivot: p.pivot && [p.pivot[0] + dx, p.pivot[1] + dy],
    shapes: p.shapes?.map((s) => ({ ...s, d: translatePath(s.d, dx, dy) })),
    children: p.children && offset(p.children, dx, dy),
  }));

const swan: AnimalDef = {
  id: 'swan',
  name: 'Swan',
  kind: 'animal',
  aliases: ['mute swan', 'white swan', 'cygnet', 'bird'],
  group: 'bird',
  habitats: ['birds'],
  box: [W, 264],
  size: 170,
  locomotion: 'swim',
  gait: { period: 1.6, stride: 60 },
  sound: 'swan',
  palette: {
    body: '#fefcf8',
    wing: '#e9ebf3',
    wingLight: '#f8f8fb',
    wingLine: '#c2c7d8',
    bill: '#ff8d3a',
    knob: '#2f2b36',
    water: '#79c6ef',
    waterDark: '#5fb2e3',
    ripple: '#e0f4ff',
  },
  parts: offset(
    [
      {
        id: 'body',
        role: 'body',
        pivot: [150, 232],
        shapes: [
          {
            d: smooth([
              [222, 204],
              [242, 220],
              [242, 244],
              [220, 260],
              [160, 268],
              [100, 264],
              [66, 252],
              [52, 236],
              [52, 216],
              [90, 214],
              [140, 212],
              [190, 204],
            ]),
            fill: 'body',
          },
        ],
        children: [
          {
            id: 'head',
            role: 'head',
            behind: true,
            pivot: [206, 216],
            shapes: [
              { d: tube(NECK, (t) => 16 - 4 * t, 80), fill: 'body' },
              { d: circle(227, 50, 27), fill: 'body' },
              {
                d: 'M246 40Q250 31 257 37Q272 44 284 60Q278 68 264 67Q252 65 246 60Z',
                fill: 'bill',
              },
              { d: ellipse(247, 46, 5.5, 15, 8), kind: 'detail', fill: 'knob' },
              { d: ellipse(226, 64, 7.4, 4.4), kind: 'feature', fill: 'blush', opacity: 0.55 },
              { d: circle(231, 45, 8), kind: 'feature', fill: 'eye' },
              { d: circle(234, 41.8, 3), kind: 'feature', fill: 'shine' },
              { d: curve(238, 60, 244, 61, 1.6), kind: 'line', stroke: 'mouth', width: 2.2 },
            ],
          },
          {
            id: 'wing',
            pivot: [200, 206],
            motion: { rotate: 2, phase: 0.3 },
            shapes: [
              { d: WING, fill: 'wing' },
              { d: COVERTS, kind: 'detail', fill: 'wingLight' },
              ...SCALLOPS.map((d) => ({
                d,
                kind: 'line' as const,
                stroke: 'wingLine',
                width: 2.4,
              })),
              { d: curve(156, 226, 196, 222, 4), kind: 'line', stroke: 'wingLine', width: 2.4 },
            ],
          },
        ],
      },
      {
        id: 'water',
        pivot: [W / 2, WAVE_TOP],
        shapes: water(),
      },
    ],
    0,
    -15,
  ),
};

export default swan;
