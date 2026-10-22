import { circle, ellipse, f, smooth, type Pt } from '../core/paths';
import type { AnimalDef, PartNode } from '../core/types';

const CX = 120;

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

const crystal = (
  id: string,
  base: Pt,
  angle: number,
  h: number,
  w: number,
  tone: string,
): PartNode => {
  const a = (angle * Math.PI) / 180;
  const cos = Math.cos(a);
  const sin = Math.sin(a);
  const at = ([x, y]: Pt): Pt => [base[0] + x * cos - y * sin, base[1] + x * sin + y * cos];
  const poly = (pts: Pt[], r: number) => roundPoly(pts.map(at), r);
  const s = -h + w * 0.55;
  const c = w * 0.17;
  const tip: Pt = [0, -h];
  return {
    id,
    pivot: base,
    shapes: [
      {
        d: poly([[-w / 2, 14], [-w / 2, s], tip, [w / 2, s], [w / 2, 14]], 5),
        fill: tone,
      },
      {
        d: poly([[c, 20], [c, s + w * 0.08], tip, [w / 2 + 4, s - 2], [w / 2 + 4, 20]], 2),
        kind: 'detail',
        fill: `${tone}Dark`,
      },
      {
        d: poly([[-c, 20], [-c, s + w * 0.08], tip, [c, s + w * 0.08], [c, 20]], 2),
        kind: 'detail',
        fill: `${tone}Light`,
      },
      {
        d: poly(
          [
            [-c * 0.55, -h * 0.18],
            [-c * 0.55, s + w * 0.22],
            [-c * 0.05, s + w * 0.12],
            [-c * 0.05, -h * 0.2],
          ],
          1.5,
        ),
        kind: 'detail',
        fill: 'white',
      },
    ],
  };
};

const ROCK: Pt[] = [
  [26, 246],
  [22, 226],
  [38, 208],
  [66, 200],
  [94, 204],
  [120, 197],
  [148, 203],
  [176, 199],
  [204, 210],
  [218, 228],
  [214, 246],
];

const crystalDef: AnimalDef = {
  id: 'crystal',
  name: 'Crystal',
  kind: 'object',
  aliases: ['crystals', 'gem', 'gemstone', 'amethyst', 'quartz'],
  group: 'nature',
  habitats: ['cave'],
  box: [240, 250],
  size: 140,
  locomotion: 'breathe',
  sound: 'crystal',
  palette: {
    purple: '#a77cf0',
    purpleLight: '#cdb2fb',
    purpleDark: '#8a60dc',
    blue: '#7f9ff5',
    blueLight: '#b3c8fc',
    blueDark: '#6281e2',
    lilac: '#c6a5f7',
    lilacLight: '#e4d5fd',
    lilacDark: '#aa87ea',
    sky: '#8fc8f8',
    skyLight: '#c6e5fd',
    skyDark: '#6cade9',
    rock: '#8d86a2',
    rockDark: '#756e8b',
    rockLight: '#a8a2bc',
    halo: '#f1eaff',
    haloMid: '#e3d6ff',
    twinkle: '#fff3c2',
  },
  parts: [
    {
      id: 'glow',
      role: 'sparkle',
      pivot: [CX, 130],
      motion: { scaleX: 0.04, scaleY: 0.04, freq: 1, wave: 'abs' },
      shapes: [
        { d: ellipse(CX, 128, 104, 112), kind: 'feature', fill: 'halo' },
        { d: ellipse(CX, 138, 78, 86), kind: 'feature', fill: 'haloMid' },
      ],
    },
    crystal('crystalL', [92, 214], -26, 124, 40, 'blue'),
    crystal('crystalR', [152, 214], 24, 134, 42, 'lilac'),
    crystal('crystalC', [CX, 214], 2, 180, 54, 'purple'),
    crystal('crystalFL', [64, 222], -52, 74, 30, 'sky'),
    crystal('crystalFR', [178, 222], 48, 82, 32, 'blue'),
    crystal('crystalFC', [140, 226], 14, 54, 26, 'sky'),
    {
      id: 'rock',
      pivot: [CX, 230],
      shapes: [
        { d: smooth(ROCK), fill: 'rock' },
        { d: ellipse(92, 208, 34, 5, -4), kind: 'detail', fill: 'rockLight' },
        { d: ellipse(170, 206, 22, 4, 6), kind: 'detail', fill: 'rockLight' },
        { d: circle(56, 228, 6), kind: 'detail', fill: 'rockDark' },
        { d: circle(118, 234, 4.5), kind: 'detail', fill: 'rockDark' },
        { d: circle(182, 232, 5.5), kind: 'detail', fill: 'rockDark' },
        { d: circle(150, 222, 3), kind: 'detail', fill: 'rockDark' },
      ],
    },
    sparkle('sparkle1', 44, 92, 11, 0),
    sparkle('sparkle2', 196, 70, 9, 0.33),
    sparkle('sparkle3', 210, 160, 7, 0.66),
    sparkle('sparkle4', 26, 172, 7, 0.5),
    sparkle('sparkle5', 104, 58, 6, 0.8),
  ],
};

export default crystalDef;
