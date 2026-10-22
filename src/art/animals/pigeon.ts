import { capsule, circle, curve, ellipse, smooth, translatePath, type Pt } from '../core/paths';
import type { AnimalDef, PartNode, Shape } from '../core/types';

const HIP_Y = 206;
const SOLE = 246;
const BOB = 10;
const HOLD = 0.7;

const bob = (phase: number): number => {
  const v = phase * 2 + 0.35;
  const u = v - Math.floor(v);
  if (u < HOLD) return BOB - (2 * BOB * u) / HOLD;
  const t = (u - HOLD) / (1 - HOLD);
  return -BOB + 2 * BOB * (0.5 - 0.5 * Math.cos(Math.PI * t));
};

const OUTLINE: [number, number, number][] = [
  [214, 46, 1],
  [230, 62, 1],
  [230, 84, 1],
  [222, 102, 0.6],
  [224, 126, 0.25],
  [222, 154, 0],
  [208, 186, 0],
  [184, 208, 0],
  [150, 222, 0],
  [112, 220, 0],
  [82, 206, 0],
  [60, 186, 0],
  [58, 170, 0],
  [80, 150, 0],
  [120, 132, 0],
  [156, 118, 0.25],
  [172, 96, 0.6],
  [174, 66, 1],
  [190, 46, 1],
];

const body = (phase: number): Shape[] => {
  const dx = bob(phase);
  const at = (d: string, k: number) => translatePath(d, dx * k, 0);
  const outline: Pt[] = OUTLINE.map(([x, y, k]) => [x + dx * k, y]);
  return [
    { d: smooth(outline), fill: 'body' },
    { d: ellipse(170, 214, 44, 20), kind: 'detail', fill: 'belly' },
    { d: at(ellipse(202, 70, 36, 34), 1), kind: 'detail', fill: 'head' },
    { d: at(ellipse(202, 128, 26, 15, -20), 0.3), kind: 'detail', fill: 'purple' },
    { d: at(ellipse(200, 106, 24, 14, -24), 0.55), kind: 'detail', fill: 'green' },
    { d: at(ellipse(206, 98, 8, 4, -24), 0.6), kind: 'detail', fill: 'sheen' },
    { d: at('M226 62Q244 66 250 77Q242 84 226 82Z', 1), fill: 'beak' },
    {
      d: at(ellipse(230, 64, 6, 4, 16), 1),
      kind: 'feature',
      fill: 'cere',
      stroke: 'auto',
    },
    { d: at(ellipse(206, 86, 7.5, 4.6), 1), kind: 'feature', fill: 'blush', opacity: 0.55 },
    { d: at(circle(210, 64, 11.5), 1), kind: 'feature', fill: 'ring' },
    { d: at(circle(210, 64, 8.2), 1), kind: 'feature', fill: 'eye' },
    { d: at(circle(213.2, 60.6, 3.1), 1), kind: 'feature', fill: 'shine' },
  ];
};

const leg = (id: string, role: string, x: number, far: boolean): PartNode => {
  const fill = far ? 'feetDark' : 'feet';
  return {
    id,
    role,
    behind: true,
    pivot: [x, HIP_Y],
    shapes: [
      { d: capsule(x, HIP_Y, x + 2, SOLE - 6, 5, 4.2), fill },
      { d: capsule(x + 2, SOLE - 4, x + 20, SOLE - 2, 3.8, 3), fill },
      { d: capsule(x + 2, SOLE - 4, x - 10, SOLE - 1, 3.6, 2.8), fill },
    ],
  };
};

const offset = (parts: PartNode[], dx: number, dy: number): PartNode[] =>
  parts.map((p): PartNode => {
    const frames = p.frames;
    return {
      ...p,
      pivot: p.pivot && [p.pivot[0] + dx, p.pivot[1] + dy],
      shapes: p.shapes?.map((s) => ({ ...s, d: translatePath(s.d, dx, dy) })),
      frames:
        frames &&
        ((phase: number) => frames(phase).map((s) => ({ ...s, d: translatePath(s.d, dx, dy) }))),
      children: p.children && offset(p.children, dx, dy),
    };
  });

const pigeon: AnimalDef = {
  id: 'pigeon',
  name: 'Pigeon',
  kind: 'animal',
  aliases: ['rock dove', 'city pigeon', 'homing pigeon', 'coo', 'bird'],
  group: 'bird',
  habitats: ['birds'],
  box: [254, 212],
  size: 80,
  locomotion: 'walk2',
  gait: { stride: 56, swing: 22 },
  sound: 'pigeon',
  palette: {
    body: '#aeb7cc',
    head: '#98a2bb',
    belly: '#bec5d6',
    wing: '#d3d8e4',
    bar: '#4b5064',
    quill: '#7d86a0',
    tail: '#8790aa',
    tailBand: '#4b5064',
    green: '#7fc8b2',
    purple: '#ab92d0',
    sheen: '#b9e6d5',
    beak: '#545160',
    cere: '#f6f4f7',
    ring: '#ff9d45',
    feet: '#f08a95',
    feetDark: '#d4707c',
  },
  parts: offset(
    [
      {
        id: 'body',
        role: 'body',
        pivot: [140, 210],
        frames: body,
        children: [
          {
            id: 'tail',
            role: 'tail',
            behind: true,
            pivot: [70, 180],
            shapes: [
              {
                d: smooth([
                  [80, 168],
                  [50, 166],
                  [24, 168],
                  [16, 180],
                  [24, 192],
                  [50, 194],
                  [80, 192],
                ]),
                fill: 'tail',
              },
              { d: 'M10 160L36 160L36 200L10 200Z', kind: 'detail', fill: 'tailBand' },
            ],
          },
          leg('legF', 'legF', 126, true),
          leg('legN', 'legN', 150, false),
          {
            id: 'wing',
            role: 'wingN',
            pivot: [168, 146],
            shapes: [
              {
                d: smooth([
                  [176, 142],
                  [186, 162],
                  [176, 186],
                  [148, 200],
                  [112, 200],
                  [80, 190],
                  [54, 176],
                  [80, 164],
                  [116, 150],
                  [148, 140],
                ]),
                fill: 'wing',
              },
              { d: 'M30 150L76 150Q90 176 84 210L30 210Z', kind: 'detail', fill: 'quill' },
              { d: curve(130, 150, 116, 196, -6), kind: 'line', stroke: 'bar', width: 5 },
              { d: curve(110, 156, 96, 196, -6), kind: 'line', stroke: 'bar', width: 5 },
            ],
          },
        ],
      },
    ],
    -6,
    -36,
  ),
};

export default pigeon;
