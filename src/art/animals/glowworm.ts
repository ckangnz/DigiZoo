import { circle, curve, ellipse, smooth, type Pt } from '../core/paths';
import type { AnimalDef, PartNode, Shape } from '../core/types';

const TAU = Math.PI * 2;
const W = 220;
const H = 240;
const BOB = 0.05 * H;
const BOUNCE = BOB * 0.66;
const BODY_PIVOT: Pt = [110, 108];
const TAIL: Pt = [42, 104];

const bob = (phase: number) => -BOUNCE * Math.sin(TAU * (phase - 0.15));

const squash = (phase: number) => {
  const c = 0.5 + 0.5 * Math.sin(TAU * phase);
  return { sx: 1 - 0.06 * c, sy: 1 + 0.05 * c };
};

const onBody = ([x, y]: Pt, phase: number): Pt => {
  const { sx, sy } = squash(phase);
  return [
    BODY_PIVOT[0] + (x - BODY_PIVOT[0]) * sx,
    BODY_PIVOT[1] + (y - BODY_PIVOT[1]) * sy + bob(phase),
  ];
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

interface Line {
  id: string;
  x: number;
  top: number;
  length: number;
  sway: number;
  phase: number;
}

const LINES: Line[] = [
  { id: 'line1', x: 72, top: 116, length: 88, sway: 6, phase: 0 },
  { id: 'line2', x: 98, top: 122, length: 102, sway: 7, phase: 0.35 },
  { id: 'line3', x: 124, top: 122, length: 80, sway: 6, phase: 0.7 },
  { id: 'line4', x: 148, top: 116, length: 96, sway: 7, phase: 0.2 },
];

const BEADS = [0.42, 0.62, 0.81, 1];

function lineShapes(l: Line, phase: number): Shape[] {
  const at = (t: number): Pt => [
    l.x + l.sway * t * t * Math.sin(TAU * (phase + l.phase - 0.4 * t)),
    l.top + t * l.length,
  ];
  const pts: Pt[] = Array.from({ length: 9 }, (_, i) => at(i / 8));
  const beads = BEADS.flatMap((t, i): Shape[] => {
    const [x, y] = at(t);
    const r = (3.6 + i * 0.75) * (1 + 0.12 * Math.sin(TAU * (2 * phase + l.phase + i * 0.21)));
    return [
      { d: circle(x, y, r), kind: 'feature', fill: 'bead', stroke: 'auto', width: 1.6 },
      { d: circle(x + r * 0.36, y - r * 0.36, r * 0.34), kind: 'feature', fill: 'shine' },
    ];
  });
  const d = smooth(pts, false);
  return [
    { d, kind: 'line', stroke: 'silkGlow', width: 6 },
    { d, kind: 'line', stroke: 'silk', width: 2.2 },
    ...beads,
  ];
}

const ROCK: Pt[] = [
  [22, 26],
  [26, 12],
  [42, 4],
  [64, 7],
  [84, 2],
  [108, 6],
  [132, 2],
  [158, 6],
  [182, 3],
  [198, 12],
  [202, 28],
  [194, 38],
  [176, 39],
  [168, 52],
  [160, 39],
  [138, 41],
  [126, 43],
  [119, 64],
  [112, 43],
  [96, 39],
  [78, 42],
  [64, 41],
  [57, 54],
  [50, 40],
  [32, 39],
];

const HANGERS: [Pt, Pt][] = [
  [
    [86, 36],
    [90, 100],
  ],
  [
    [146, 36],
    [140, 98],
  ],
];

const SEGMENTS: [number, number, number][] = [
  [62, 108, 17],
  [84, 112, 19],
  [108, 114, 20],
  [132, 112, 20],
  [154, 106, 19],
];

const glowworm: AnimalDef = {
  id: 'glowworm',
  name: 'Glowworm',
  kind: 'animal',
  aliases: ['glow worm', 'glowing worm', 'fungus gnat', 'cave worm'],
  group: 'bug',
  habitats: ['cave', 'bugs'],
  box: [W, H],
  size: 60,
  locomotion: 'pulse',
  gait: { stride: 0, period: 1.8 },
  sound: 'glowworm',
  palette: {
    rock: '#968bab',
    rockDark: '#7c7193',
    rockLight: '#b1a7c6',
    body: '#fde8c4',
    bodyLight: '#fff6e2',
    glow: '#5fe6cf',
    glowLight: '#d2fff6',
    halo: '#d4fbf4',
    haloMid: '#aaf3e7',
    silk: '#6fd5c7',
    silkGlow: '#cbf8f0',
    bead: '#8cf0e1',
    twinkle: '#cafcf2',
    cheek: '#ff9ab0',
  },
  parts: [
    {
      id: 'ceiling',
      pivot: [W / 2, 24],
      motion: { y: BOB, phase: -0.15 },
      shapes: [
        { d: smooth(ROCK, true, 0.75), fill: 'rock' },
        { d: ellipse(104, 9, 72, 6), kind: 'detail', fill: 'rockLight' },
        { d: circle(44, 26, 5), kind: 'detail', fill: 'rockDark' },
        { d: circle(116, 26, 4), kind: 'detail', fill: 'rockDark' },
        { d: circle(170, 21, 6), kind: 'detail', fill: 'rockDark' },
        { d: circle(154, 30, 3), kind: 'detail', fill: 'rockDark' },
        { d: circle(76, 28, 2.6), kind: 'detail', fill: 'rockDark' },
      ],
      children: [
        {
          id: 'hangers',
          behind: true,
          pivot: [W / 2, 40],
          frames: (phase) =>
            HANGERS.flatMap(([a, b]): Shape[] => {
              const end = onBody(b, phase);
              const d = `M${a[0]} ${a[1]}L${end[0].toFixed(2)} ${end[1].toFixed(2)}`;
              return [
                { d, kind: 'line', stroke: 'silkGlow', width: 6 },
                { d, kind: 'line', stroke: 'silk', width: 2.2 },
              ];
            }),
        },
        sparkle('sparkle1', 16, 154, 8, 0),
        sparkle('sparkle2', 202, 150, 8, 0.4),
        sparkle('sparkle3', 42, 202, 6, 0.7),
      ],
    },
    {
      id: 'hang',
      pivot: [W / 2, 40],
      motion: { y: BOB - BOUNCE, phase: -0.15 },
      children: [
        {
          id: 'body',
          role: 'body',
          pivot: BODY_PIVOT,
          shapes: [
            ...SEGMENTS.map(([x, y, r]): Shape => ({ d: circle(x, y, r), fill: 'body' })),
            ...SEGMENTS.map(([x, y, r]): Shape => ({
              d: ellipse(x - 1, y - r * 0.52, r * 0.5, r * 0.22),
              kind: 'detail',
              fill: 'bodyLight',
            })),
          ],
          children: [
            {
              id: 'halo',
              role: 'sparkle',
              behind: true,
              pivot: TAIL,
              motion: { scaleX: 0.08, scaleY: 0.08, freq: 1, wave: 'abs' },
              shapes: [
                { d: circle(TAIL[0], TAIL[1], 36), kind: 'feature', fill: 'halo' },
                { d: circle(TAIL[0], TAIL[1], 27), kind: 'feature', fill: 'haloMid' },
              ],
            },
            ...LINES.map((l): PartNode => ({
              id: l.id,
              behind: true,
              pivot: [l.x, l.top],
              frames: (phase) => lineShapes(l, phase),
            })),
            {
              id: 'tail',
              pivot: [54, 106],
              motion: { rotate: 4, phase: 0.3 },
              shapes: [
                { d: circle(TAIL[0], TAIL[1], 16), fill: 'glow' },
                { d: circle(TAIL[0] - 2, TAIL[1] + 1, 8.5), kind: 'detail', fill: 'glowLight' },
                { d: circle(TAIL[0] + 4, TAIL[1] - 6, 3), kind: 'feature', fill: 'white' },
              ],
            },
            {
              id: 'head',
              role: 'head',
              pivot: [158, 106],
              shapes: [
                { d: circle(176, 96, 28), fill: 'body' },
                { d: ellipse(170, 77, 12, 5, -16), kind: 'detail', fill: 'bodyLight' },
                { d: ellipse(163, 110, 7, 4.5), kind: 'feature', fill: 'cheek', opacity: 0.6 },
                { d: ellipse(195, 110, 6, 4.5), kind: 'feature', fill: 'cheek', opacity: 0.6 },
                { d: circle(169, 96, 7.4), kind: 'feature', fill: 'eye' },
                { d: circle(171.8, 93.1, 2.8), kind: 'feature', fill: 'shine' },
                { d: circle(189.5, 96, 6.8), kind: 'feature', fill: 'eye' },
                { d: circle(192.1, 93.3, 2.6), kind: 'feature', fill: 'shine' },
                { d: curve(174, 109, 185, 109, 4), kind: 'line', stroke: 'mouth', width: 2.4 },
              ],
            },
          ],
        },
      ],
    },
  ],
};

export default glowworm;
