import { circle, curve, ellipse, scallop, tube, type Pt } from '../core/paths';
import type { AnimalDef, PartNode, Shape } from '../core/types';

const TAU = Math.PI * 2;
const W = 260;
const CX = W / 2;
const CY = 102;

interface LegSpec {
  hip: Pt;
  knee: Pt;
  foot: Pt;
  phase: number;
  dark: boolean;
}

const RIGHT: Omit<LegSpec, 'phase'>[] = [
  { hip: [164, 84], knee: [204, 42], foot: [252, 160], dark: false },
  { hip: [172, 100], knee: [226, 72], foot: [238, 166], dark: true },
  { hip: [172, 118], knee: [220, 108], foot: [222, 171], dark: false },
  { hip: [162, 134], knee: [194, 138], foot: [200, 174], dark: true },
];

const mirror = ([x, y]: Pt): Pt => [W - x, y];

const LEGS: (LegSpec & { id: string })[] = [
  ...RIGHT.map((l, i) => ({
    ...l,
    hip: mirror(l.hip),
    knee: mirror(l.knee),
    foot: mirror(l.foot),
    phase: (i * 0.25 + 0.5) % 1,
    id: `leg${i + 1}F`,
  })),
  ...RIGHT.map((l, i) => ({ ...l, phase: i * 0.25, id: `leg${i + 1}N` })),
];

function legShapes(l: LegSpec, phase: number): Shape[] {
  const lift = Math.max(0, Math.sin(TAU * (2 * phase + l.phase)));
  const out = Math.sign(l.foot[0] - CX);
  const knee: Pt = [l.knee[0] + out * 2 * lift, l.knee[1] - 7 * lift];
  const foot: Pt = [l.foot[0] + out * 4 * lift, l.foot[1] - 11 * lift];
  const ankle: Pt = [
    knee[0] + (foot[0] - knee[0]) * 0.55 + out * 6,
    knee[1] + (foot[1] - knee[1]) * 0.55,
  ];
  const fill = l.dark ? 'legDark' : 'leg';
  return [
    { d: tube([l.hip, knee, ankle, foot], (t) => 7.4 - 2.6 * t, 56), fill },
    {
      d: ellipse(foot[0] + out * 1.5, foot[1] - 1.5, 6.5, 5.5),
      fill: l.dark ? 'footDark' : 'foot',
    },
  ];
}

const legs: PartNode[] = [...LEGS]
  .sort((a, b) => Number(b.dark) - Number(a.dark))
  .map((l) => ({
    id: l.id,
    role: l.id,
    behind: true,
    motion: null,
    pivot: l.hip,
    frames: (phase: number) => legShapes(l, phase),
  }));

const eye = (x: number, y: number): Shape[] => [
  { d: circle(x, y, 15), kind: 'feature', fill: 'white', stroke: 'auto' },
  { d: circle(x + 1, y + 2, 10.5), kind: 'feature', fill: 'eye' },
  { d: circle(x + 4.6, y - 2.4, 4.2), kind: 'feature', fill: 'shine' },
  { d: circle(x - 2.6, y + 6, 1.8), kind: 'feature', fill: 'shine' },
];

const spider: AnimalDef = {
  id: 'spider',
  name: 'Spider',
  aliases: ['itsy bitsy spider', 'incy wincy spider', 'spidey', 'spooky spider', 'bug'],
  group: 'bug',
  habitats: ['halloween'],
  box: [W, 178],
  size: 80,
  locomotion: 'crawl',
  gait: { stride: 30 },
  sound: 'spider',
  palette: {
    fuzz: '#433466',
    fuzzLight: '#5f4e8e',
    tuft: '#433466',
    leg: '#403163',
    legDark: '#30254b',
    foot: '#8a74c4',
    footDark: '#6c58a6',
    smile: '#ffc4dc',
    blush: '#ff8fbf',
  },
  parts: [
    {
      id: 'body',
      role: 'body',
      pivot: [CX, 150],
      shapes: [
        {
          d: tube(
            [
              [CX - 4, 54],
              [CX - 2, 40],
              [CX + 8, 34],
              [CX + 15, 40],
              [CX + 11, 47],
              [CX + 5, 44],
            ],
            (t) => 5 - 2.6 * t,
            48,
          ),
          fill: 'tuft',
        },
        { d: scallop(CX, CY, 54, 26, 3.6), fill: 'fuzz' },
        { d: ellipse(CX, CY + 10, 40, 34), kind: 'detail', fill: 'fuzzLight' },
        { d: ellipse(104, 68, 12, 6, -30), kind: 'detail', fill: 'fuzzLight' },
        { d: ellipse(97, 124, 10, 6), kind: 'feature', fill: 'blush', opacity: 0.6 },
        { d: ellipse(163, 124, 10, 6), kind: 'feature', fill: 'blush', opacity: 0.6 },
        ...eye(110, 98),
        ...eye(150, 98),
        { d: curve(118, 124, 142, 124, 8), kind: 'line', stroke: 'smile', width: 3.4 },
      ],
      children: legs,
    },
  ],
};

export default spider;
