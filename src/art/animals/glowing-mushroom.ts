import { circle, ellipse, smooth, tube, type Pt } from '../core/paths';
import type { AnimalDef, PartNode, Shape } from '../core/types';

interface Shroom {
  id: string;
  base: Pt;
  top: Pt;
  rx: number;
  ry: number;
  stem: number;
  tone: string;
  sway: number;
}

const SHROOMS: Shroom[] = [
  {
    id: 'shroomBig',
    base: [100, 208],
    top: [94, 112],
    rx: 62,
    ry: 50,
    stem: 15,
    tone: 'teal',
    sway: 0,
  },
  {
    id: 'shroomMid',
    base: [166, 214],
    top: [170, 142],
    rx: 42,
    ry: 34,
    stem: 11,
    tone: 'blue',
    sway: 0.3,
  },
  {
    id: 'shroomSmall',
    base: [50, 214],
    top: [46, 172],
    rx: 28,
    ry: 23,
    stem: 8,
    tone: 'blue',
    sway: 0.55,
  },
  {
    id: 'shroomTiny',
    base: [204, 214],
    top: [208, 190],
    rx: 19,
    ry: 16,
    stem: 6,
    tone: 'teal',
    sway: 0.8,
  },
  {
    id: 'shroomBud',
    base: [134, 214],
    top: [134, 196],
    rx: 14,
    ry: 12,
    stem: 5,
    tone: 'teal',
    sway: 0.15,
  },
];

const cap = (cx: number, cy: number, rx: number, ry: number): string =>
  smooth([
    [cx - rx, cy + ry * 0.2],
    [cx - rx * 0.86, cy - ry * 0.45],
    [cx - rx * 0.45, cy - ry * 0.88],
    [cx, cy - ry],
    [cx + rx * 0.45, cy - ry * 0.88],
    [cx + rx * 0.86, cy - ry * 0.45],
    [cx + rx, cy + ry * 0.2],
    [cx + rx * 0.5, cy + ry * 0.32],
    [cx, cy + ry * 0.36],
    [cx - rx * 0.5, cy + ry * 0.32],
  ]);

const SPOTS: [number, number, number][] = [
  [-0.42, -0.42, 0.13],
  [0.18, -0.62, 0.11],
  [0.55, -0.2, 0.12],
  [-0.08, -0.12, 0.09],
  [-0.72, -0.02, 0.08],
];

const shroom = (s: Shroom): PartNode => {
  const [tx, ty] = s.top;
  const spots = SPOTS.map(([dx, dy, r]): Shape => ({
    d: ellipse(tx + dx * s.rx, ty + dy * s.ry, r * s.rx, r * s.rx * 0.8),
    kind: 'detail',
    fill: 'spot',
  }));
  return {
    id: s.id,
    pivot: s.base,
    motion: { rotate: 2.5, phase: s.sway },
    shapes: [
      {
        d: tube(
          [s.base, [(s.base[0] + tx) / 2 + 3, (s.base[1] + ty) / 2], [tx, ty]],
          (t) => s.stem * (1.05 - 0.22 * t),
          30,
        ),
        fill: 'stem',
      },
      { d: cap(tx, ty, s.rx, s.ry), fill: s.tone },
      {
        d: ellipse(tx, ty + s.ry * 0.3, s.rx * 0.82, s.ry * 0.13),
        kind: 'detail',
        fill: 'gills',
      },
      {
        d: ellipse(tx - s.rx * 0.3, ty - s.ry * 0.62, s.rx * 0.34, s.ry * 0.14, -18),
        kind: 'detail',
        fill: `${s.tone}Light`,
      },
      ...spots,
      {
        d: ellipse(
          s.base[0] + s.stem * 0.3,
          (s.base[1] + ty) / 2 + s.ry * 0.3,
          s.stem * 0.3,
          (s.base[1] - ty) * 0.28,
        ),
        kind: 'detail',
        fill: 'stemShade',
      },
    ],
  };
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

const spore = (id: string, x: number, y: number, r: number, phase: number): PartNode => ({
  id,
  role: 'sparkle',
  phase,
  pivot: [x, y],
  shapes: [
    { d: circle(x, y, r), fill: 'spore' },
    { d: circle(x - r * 0.3, y - r * 0.3, r * 0.35), kind: 'feature', fill: 'white' },
  ],
});

const MOUND: Pt[] = [
  [20, 228],
  [24, 212],
  [48, 202],
  [88, 206],
  [128, 199],
  [170, 204],
  [206, 201],
  [226, 213],
  [224, 228],
];

const glowingMushroom: AnimalDef = {
  id: 'glowing-mushroom',
  name: 'Glowing Mushroom',
  kind: 'object',
  aliases: ['mushroom', 'mushrooms', 'glow mushroom', 'toadstool', 'fungus'],
  group: 'nature',
  habitats: ['cave'],
  box: [246, 230],
  size: 120,
  locomotion: 'breathe',
  sound: 'glowing-mushroom',
  palette: {
    teal: '#45d8c2',
    tealLight: '#a6f4e8',
    blue: '#55c2ef',
    blueLight: '#aee3fa',
    gills: '#d4fcf4',
    spot: '#e2fffa',
    stem: '#eefcf8',
    stemShade: '#cfeee8',
    halo: '#dcfcf5',
    haloMid: '#bff6eb',
    soil: '#7f7596',
    soilDark: '#695f80',
    soilLight: '#9a91af',
    moss: '#5cc7a6',
    twinkle: '#fff3c2',
    spore: '#9ff3e6',
  },
  parts: [
    {
      id: 'glow',
      role: 'sparkle',
      pivot: [116, 140],
      motion: { scaleX: 0.04, scaleY: 0.04, freq: 1, wave: 'abs' },
      shapes: [
        { d: ellipse(96, 100, 86, 70), kind: 'feature', fill: 'halo' },
        { d: ellipse(170, 140, 60, 52), kind: 'feature', fill: 'halo' },
        { d: ellipse(48, 172, 42, 36), kind: 'feature', fill: 'halo' },
        { d: ellipse(206, 190, 30, 26), kind: 'feature', fill: 'halo' },
        { d: ellipse(96, 102, 70, 54), kind: 'feature', fill: 'haloMid' },
        { d: ellipse(170, 142, 48, 40), kind: 'feature', fill: 'haloMid' },
        { d: ellipse(48, 174, 32, 26), kind: 'feature', fill: 'haloMid' },
      ],
    },
    ...SHROOMS.map(shroom),
    {
      id: 'mound',
      pivot: [122, 220],
      shapes: [
        { d: smooth(MOUND), fill: 'soil' },
        { d: ellipse(98, 207, 36, 4.5, -3), kind: 'detail', fill: 'soilLight' },
        { d: circle(40, 220, 4.5), kind: 'detail', fill: 'soilDark' },
        { d: circle(160, 222, 3.5), kind: 'detail', fill: 'soilDark' },
        { d: circle(206, 218, 4), kind: 'detail', fill: 'soilDark' },
        { d: ellipse(72, 204, 9, 4, -8), kind: 'feature', fill: 'moss' },
        { d: ellipse(186, 204, 8, 3.5, 6), kind: 'feature', fill: 'moss' },
      ],
    },
    sparkle('sparkle1', 22, 96, 10, 0),
    sparkle('sparkle2', 214, 86, 9, 0.4),
    sparkle('sparkle3', 140, 40, 7, 0.7),
    spore('spore1', 46, 128, 4, 0.2),
    spore('spore2', 158, 76, 3.6, 0.55),
    spore('spore3', 220, 140, 3.4, 0.85),
  ],
};

export default glowingMushroom;
