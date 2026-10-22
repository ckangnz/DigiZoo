import { capsule, circle, curve, ellipse, leaf, translatePath, tube, type Pt } from '../core/paths';
import type { AnimalDef, PartNode, Shape } from '../core/types';

const TAIL: Pt = [62, 140];
const SHOULDER: Pt = [140, 80];

const wing = (id: 'wingN' | 'wingF', angle: number, length: number, phase: number): PartNode => {
  const far = id === 'wingF';
  const a = (angle * Math.PI) / 180;
  const along = (k: number): Pt => [
    SHOULDER[0] + Math.cos(a) * length * k,
    SHOULDER[1] + Math.sin(a) * length * k,
  ];
  const mid = along(0.5);
  const v0 = along(0.12);
  const v1 = along(0.8);
  return {
    id,
    role: id,
    behind: far,
    pivot: SHOULDER,
    motion: { rotate: 26, freq: 5, phase },
    shapes: [
      { d: leaf(SHOULDER[0], SHOULDER[1], length, 25, angle), fill: far ? 'wingFar' : 'wing' },
      {
        d: ellipse(mid[0], mid[1], length * 0.28, 7, angle),
        kind: 'detail',
        fill: far ? 'wing' : 'wingLight',
      },
      { d: curve(v0[0], v0[1], v1[0], v1[1], 5), kind: 'line', stroke: 'vein', width: 2.2 },
    ],
  };
};

const leg = (id: string, hip: Pt, knee: Pt, foot: Pt, far: boolean, phase: number): PartNode => {
  const fill = far ? 'legFar' : 'leg';
  return {
    id,
    behind: true,
    pivot: hip,
    motion: { rotate: 7, freq: 2, phase },
    shapes: [
      { d: capsule(hip[0], hip[1], knee[0], knee[1], 4.8, 4.2), fill },
      { d: capsule(knee[0], knee[1], foot[0], foot[1], 4.2, 3.6), fill },
      { d: ellipse(foot[0] + 2, foot[1] + 0.5, 5.6, 4.2), fill },
    ],
  };
};

const antenna = (id: string, pts: Pt[], far: boolean): PartNode => {
  const tip = pts[pts.length - 1];
  const fill = far ? 'legFar' : 'leg';
  return {
    id,
    behind: true,
    pivot: pts[0],
    motion: { rotate: 7, freq: 2, phase: far ? 0.3 : 0.1 },
    shapes: [
      { d: tube(pts, (t) => 3.2 - 0.8 * t, 24), fill },
      { d: ellipse(tip[0], tip[1], 5.6, 4.6, -30), fill },
    ],
  };
};

const GLOW: Pt = [TAIL[0] - 6, TAIL[1] + 4];

const glow: Shape[] = [
  { d: circle(GLOW[0], GLOW[1], 50), kind: 'feature', fill: 'glow', opacity: 0.3 },
  { d: circle(GLOW[0], GLOW[1], 41), kind: 'feature', fill: 'glow', opacity: 0.4 },
  { d: circle(GLOW[0], GLOW[1], 33), kind: 'feature', fill: 'glow', opacity: 0.55 },
];

const offset = (parts: PartNode[], dx: number, dy: number): PartNode[] =>
  parts.map((p): PartNode => ({
    ...p,
    pivot: p.pivot && [p.pivot[0] + dx, p.pivot[1] + dy],
    shapes: p.shapes?.map((sh) => ({ ...sh, d: translatePath(sh.d, dx, dy) })),
    children: p.children && offset(p.children, dx, dy),
  }));

const firefly: AnimalDef = {
  id: 'firefly',
  name: 'Firefly',
  kind: 'animal',
  aliases: ['lightning bug', 'glow bug', 'glowbug', 'bug'],
  group: 'bug',
  habitats: ['bugs'],
  box: [252, 206],
  size: 50,
  locomotion: 'fly',
  gait: { period: 1.6, stride: 70 },
  sound: 'firefly',
  palette: {
    shell: '#433c62',
    sheen: '#655d8c',
    sheenLight: '#9890c4',
    leg: '#3a3354',
    legFar: '#2b2640',
    hood: '#ff8a6a',
    hoodLight: '#ffb59c',
    face: '#ffd25c',
    faceLight: '#ffe58f',
    spot: '#433c62',
    lantern: '#d8f547',
    lanternLight: '#f6ffc4',
    lanternLine: '#b5d935',
    glow: '#e0ff5c',
    wing: '#eaf5ff',
    wingLight: '#f8fcff',
    wingFar: '#d4e6f6',
    vein: '#b7d3ee',
    smile: '#6b3b3b',
  },
  parts: offset(
    [
      {
        id: 'halo',
        role: 'sparkle',
        pivot: GLOW,
        shapes: glow,
      },
      {
        id: 'body',
        pivot: [124, 112],
        shapes: [
          { d: ellipse(124, 110, 58, 40, -20), fill: 'shell' },
          { d: ellipse(116, 86, 32, 10, -22), kind: 'detail', fill: 'sheen' },
          { d: ellipse(104, 88, 12, 4.4, -24), kind: 'detail', fill: 'sheenLight' },
          { d: curve(82, 118, 168, 80, -12), kind: 'line', stroke: 'sheen', width: 2.4 },
        ],
        children: [
          {
            id: 'lantern',
            role: 'sparkle',
            behind: true,
            pivot: TAIL,
            shapes: [
              { d: ellipse(TAIL[0], TAIL[1], 36, 31, -20), fill: 'lantern' },
              {
                d: ellipse(TAIL[0] - 8, TAIL[1] + 2, 17, 14, -20),
                kind: 'detail',
                fill: 'lanternLight',
              },
              {
                d: ellipse(TAIL[0] + 12, TAIL[1] - 4, 2.6, 34, -14),
                kind: 'detail',
                fill: 'lanternLine',
              },
              {
                d: ellipse(TAIL[0] + 25, TAIL[1] - 8, 2.6, 34, -14),
                kind: 'detail',
                fill: 'lanternLine',
              },
            ],
          },
          wing('wingF', -98, 84, 0.06),
          leg('legF1', [146, 136], [160, 146], [166, 160], true, 0.3),
          leg('legF2', [122, 144], [126, 156], [122, 168], true, 0.7),
          leg('legN1', [156, 136], [172, 146], [180, 160], false, 0),
          leg('legN2', [134, 146], [142, 158], [140, 172], false, 0.4),
          leg('legN3', [108, 148], [104, 160], [96, 170], false, 0.8),
          antenna(
            'antennaF',
            [
              [184, 48],
              [186, 28],
              [196, 12],
            ],
            true,
          ),
          antenna(
            'antennaN',
            [
              [202, 50],
              [214, 30],
              [230, 18],
            ],
            false,
          ),
          {
            id: 'pronotum',
            pivot: [160, 80],
            shapes: [
              { d: ellipse(160, 74, 36, 24, -28), fill: 'hood' },
              { d: ellipse(160, 58, 14, 4.4, -30), kind: 'detail', fill: 'hoodLight' },
              { d: ellipse(150, 76, 8.5, 6.5, -28), kind: 'detail', fill: 'spot' },
            ],
          },
          {
            id: 'head',
            role: 'head',
            pivot: [178, 100],
            shapes: [
              { d: circle(196, 94, 36), fill: 'face' },
              { d: ellipse(186, 72, 16, 6, -12), kind: 'detail', fill: 'faceLight' },
              { d: circle(185, 96, 9.8), kind: 'feature', fill: 'eye' },
              { d: circle(210, 94, 9), kind: 'feature', fill: 'eye' },
              { d: circle(188.6, 92.4, 3.7), kind: 'feature', fill: 'shine' },
              { d: circle(213.2, 90.6, 3.4), kind: 'feature', fill: 'shine' },
              { d: circle(182.4, 100.4, 1.6), kind: 'feature', fill: 'shine' },
              { d: ellipse(178, 111, 6.4, 4, -8), kind: 'feature', fill: 'blush', opacity: 0.7 },
              { d: ellipse(218, 108, 5.4, 3.6, -8), kind: 'feature', fill: 'blush', opacity: 0.7 },
              { d: curve(191, 109, 205, 108, 5), kind: 'line', stroke: 'smile', width: 2.6 },
            ],
          },
          wing('wingN', -120, 92, 0),
        ],
      },
    ],
    6,
    6,
  ),
};

export default firefly;
