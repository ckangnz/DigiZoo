import {
  circle,
  ellipse,
  f,
  leaf,
  rotatePath,
  roundRect,
  scalePath,
  smooth,
  translatePath,
  tube,
  type Pt,
} from '../core/paths';
import type { AnimalDef, PartNode, Shape } from '../core/types';

const CX = 125;
const BAR_Y = 88;
const GLOW: Pt = [CX, 90];

function roundPoly(pts: Pt[], r: number): string {
  const n = pts.length;
  let d = '';
  for (let i = 0; i < n; i++) {
    const prev = pts[(i + n - 1) % n];
    const cur = pts[i];
    const next = pts[(i + 1) % n];
    const toward = (p: Pt): Pt => {
      const len = Math.hypot(p[0] - cur[0], p[1] - cur[1]);
      const k = Math.min(r, len / 2) / len;
      return [cur[0] + (p[0] - cur[0]) * k, cur[1] + (p[1] - cur[1]) * k];
    };
    const a = toward(prev);
    const b = toward(next);
    d += `${i ? 'L' : 'M'}${f(a[0])} ${f(a[1])}Q${f(cur[0])} ${f(cur[1])} ${f(b[0])} ${f(b[1])}`;
  }
  return d + 'Z';
}

const beam = (i: number, n: number): Shape => {
  const a = (i / n) * Math.PI * 2 - Math.PI / 2;
  const half = Math.PI / n / 2;
  const r = 110;
  const p = (t: number) => `${f(GLOW[0] + r * Math.cos(t))} ${f(GLOW[1] + r * Math.sin(t))}`;
  return {
    d: `M${GLOW[0]} ${GLOW[1]}L${p(a - half)}L${p(a + half)}Z`,
    kind: 'detail',
    fill: 'glowLight',
  };
};

const LILY: Pt[] = [
  [0, -3.5],
  [12, -5],
  [24, -8],
  [33, -13],
  [44, -21],
  [39, -8],
  [50, 0],
  [39, 8],
  [44, 21],
  [33, 13],
  [24, 8],
  [12, 5],
  [0, 3.5],
];

const lily = (id: string, x: number, y: number, angle: number, scale: number): PartNode => {
  const s = (d: string) => translatePath(rotatePath(scalePath(d, scale), angle, 0, 0), x, y);
  return {
    id,
    pivot: [x, y],
    motion: { rotate: 3, phase: x / 400 },
    shapes: [
      { d: s(roundPoly(LILY, 3.2)), fill: 'lily' },
      { d: s(ellipse(38, 0, 7, 12)), kind: 'detail', fill: 'lilyShade' },
      { d: s(ellipse(10, 0, 12, 3)), kind: 'detail', fill: 'lilyShade' },
      {
        d: s('M30 0L47 -6M30 0L49 0M30 0L47 6'),
        kind: 'line',
        stroke: 'stem',
        width: 1.6,
      },
      { d: s(circle(47, -6, 2.4)), kind: 'feature', fill: 'pollen' },
      { d: s(circle(49, 0, 2.4)), kind: 'feature', fill: 'pollen' },
      { d: s(circle(47, 6, 2.4)), kind: 'feature', fill: 'pollen' },
    ],
  };
};

const stem = (pts: Pt[]): Shape => ({ d: tube(pts, 2.8), fill: 'stem' });

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

const offset = (part: PartNode, dx: number, dy: number): PartNode => ({
  ...part,
  pivot: part.pivot && [part.pivot[0] + dx, part.pivot[1] + dy],
  shapes: part.shapes?.map((sh) => ({ ...sh, d: translatePath(sh.d, dx, dy) })),
  children: part.children?.map((c) => offset(c, dx, dy)),
});

const MOUND: Pt[] = [
  [6, 262],
  [14, 236],
  [40, 218],
  [80, 204],
  [125, 199],
  [170, 204],
  [210, 218],
  [236, 236],
  [244, 262],
];

const cross: AnimalDef = {
  id: 'cross',
  name: 'Cross',
  kind: 'object',
  aliases: ['easter', 'jesus', 'easter cross', 'wooden cross', 'he is risen'],
  group: 'bible',
  habitats: ['bible'],
  box: [272, 268],
  size: 260,
  locomotion: 'breathe',
  sound: 'cross',
  palette: {
    glow: '#ffe69a',
    glowLight: '#fff4cf',
    wood: '#bf8150',
    woodLight: '#d9a06b',
    grain: '#9a6038',
    grass: '#8fd16a',
    grassDark: '#75bb56',
    grassLight: '#b3e48e',
    stem: '#5da548',
    leaf: '#6fbd55',
    lily: '#ffffff',
    lilyShade: '#e4ecd8',
    pollen: '#ffb347',
    star: '#fff1a6',
    flowerPink: '#ff9fc0',
    flowerYellow: '#ffd84d',
  },
  parts: [
    offset(
      {
        id: 'scene',
        pivot: [CX, 200],
        children: [
          {
            id: 'glow',
            pivot: GLOW,
            motion: { scaleX: 0.03, scaleY: 0.03, freq: 1 },
            shapes: [
              { d: circle(GLOW[0], GLOW[1], 80), fill: 'glow' },
              ...Array.from({ length: 12 }, (_, i) => beam(i, 12)),
              { d: circle(GLOW[0], GLOW[1], 40), kind: 'detail', fill: 'glowLight' },
            ],
          },
          {
            id: 'wood',
            pivot: [CX, 210],
            shapes: [
              { d: roundRect(CX - 18, 22, 36, 210, 7), fill: 'wood' },
              { d: roundRect(CX - 70, BAR_Y - 17, 140, 34, 7), fill: 'wood' },
              { d: roundRect(CX - 14, 26, 9, 170, 4.5), kind: 'detail', fill: 'woodLight' },
              { d: roundRect(CX - 66, BAR_Y - 13, 46, 8, 4), kind: 'detail', fill: 'woodLight' },
              { d: roundRect(CX + 22, BAR_Y - 13, 44, 8, 4), kind: 'detail', fill: 'woodLight' },
              {
                d: `M${CX + 6} 120Q${CX + 9} 150 ${CX + 5} 182`,
                kind: 'line',
                stroke: 'grain',
                width: 2.4,
              },
              {
                d: `M${CX + 8} 40Q${CX + 5} 54 ${CX + 8} 64`,
                kind: 'line',
                stroke: 'grain',
                width: 2.4,
              },
              {
                d: `M${CX - 58} ${BAR_Y + 6}Q${CX - 44} ${BAR_Y + 3} ${CX - 30} ${BAR_Y + 7}`,
                kind: 'line',
                stroke: 'grain',
                width: 2.4,
              },
              {
                d: `M${CX + 30} ${BAR_Y + 6}Q${CX + 44} ${BAR_Y + 9} ${CX + 58} ${BAR_Y + 5}`,
                kind: 'line',
                stroke: 'grain',
                width: 2.4,
              },
            ],
          },
          {
            id: 'stems',
            shapes: [
              stem([
                [64, 214],
                [59, 196],
                [52, 181],
              ]),
              stem([
                [88, 208],
                [86, 186],
                [82, 166],
              ]),
              stem([
                [178, 212],
                [186, 194],
                [195, 179],
              ]),
              stem([
                [160, 206],
                [162, 186],
                [164, 168],
              ]),
              { d: leaf(66, 216, 44, 8.5, -140), fill: 'leaf' },
              { d: leaf(84, 210, 38, 7.5, -72), fill: 'leaf' },
              { d: leaf(182, 216, 44, 8.5, -40), fill: 'leaf' },
              { d: leaf(160, 210, 34, 7, -112), fill: 'leaf' },
            ],
          },
          {
            id: 'mound',
            pivot: [CX, 230],
            shapes: [
              { d: smooth(MOUND), fill: 'grass' },
              ...(
                [
                  [24, 230, -118],
                  [30, 228, -96],
                  [112, 202, -100],
                  [140, 202, -80],
                  [214, 222, -76],
                  [222, 228, -56],
                ] as [number, number, number][]
              ).map(([x, y, a]): Shape => ({ d: leaf(x, y + 6, 16, 4, a), fill: 'grass' })),
              { d: ellipse(CX, 268, 120, 30), kind: 'detail', fill: 'grassDark' },
              { d: ellipse(62, 214, 30, 7, -16), kind: 'detail', fill: 'grassLight' },
              { d: circle(40, 238, 4.5), kind: 'feature', fill: 'flowerPink' },
              { d: circle(40, 238, 1.8), kind: 'feature', fill: 'flowerYellow' },
              { d: circle(206, 232, 4.5), kind: 'feature', fill: 'flowerYellow' },
              { d: circle(150, 244, 4), kind: 'feature', fill: 'flowerPink' },
              { d: circle(150, 244, 1.6), kind: 'feature', fill: 'flowerYellow' },
              { d: circle(98, 250, 3.6), kind: 'feature', fill: 'flowerYellow' },
            ],
          },
          lily('lilyL', 52, 181, -146, 1.22),
          lily('lilyM', 82, 166, -104, 1),
          lily('lilyR', 195, 179, -34, 1.22),
          {
            id: 'bud',
            pivot: [164, 168],
            motion: { rotate: 3, phase: 0.6 },
            shapes: [
              { d: leaf(164, 170, 40, 8, -84), fill: 'lily' },
              { d: leaf(164, 170, 16, 5, -84), kind: 'detail', fill: 'lilyShade' },
            ],
          },
          sparkle('sparkle1', 36, 52, 12, 0),
          sparkle('sparkle2', 214, 40, 10, 0.33),
          sparkle('sparkle3', 222, 112, 8, 0.66),
        ],
      },
      11,
      0,
    ),
  ],
};

export default cross;
