import {
  capsule,
  circle,
  curve,
  ellipse,
  leaf,
  scalePath,
  smooth,
  translatePath,
  tube,
  type Pt,
} from '../core/paths';
import type { AnimalDef, PartNode, Shape } from '../core/types';

const GROUND = 200;
const HIP = 160;
const DOME = { cx: 150, cy: 142, rx: 118, ry: 92 };
const SPIKE = 24;
const SWEEP = 0.32;
const TIPS = 17;
const FROM = Math.PI;
const TO = Math.PI * 1.96;

const domeAt = (a: number, k = 1): Pt => [
  DOME.cx + DOME.rx * k * Math.cos(a),
  DOME.cy + DOME.ry * k * Math.sin(a),
];

const tipAt = (a: number): Pt => {
  const [x, y] = domeAt(a);
  const t = a - SWEEP;
  return [x + SPIKE * Math.cos(t), y + SPIKE * 0.9 * Math.sin(t)];
};

const tipAngles = Array.from({ length: TIPS }, (_, i) => FROM + ((i + 0.5) / TIPS) * (TO - FROM));

const quillOutline = (): string => {
  const pts: Pt[] = [];
  for (let i = 0; i < TIPS; i++) {
    const a0 = FROM + (i / TIPS) * (TO - FROM);
    pts.push(domeAt(a0));
    pts.push(tipAt(tipAngles[i]));
  }
  pts.push(domeAt(TO));
  const skirt = 8;
  for (let i = 0; i <= skirt * 2; i++) {
    const t = 0.04 + (i / (skirt * 2)) * 0.9;
    const x = 250 - 206 * t;
    const y = 148 + 16 * Math.sin(Math.PI * t) - 4 * t;
    pts.push(i % 2 ? [x - 10, y + 9] : [x, y]);
  }
  return smooth(pts, true, 0.55);
};

const innerSpines = (): Shape[] => {
  const out: Shape[] = [];
  const rows = [
    { k: 0.36, n: 6, from: 1.22, to: 1.78, len: 20 },
    { k: 0.58, n: 9, from: 1.12, to: 1.86, len: 23 },
    { k: 0.8, n: 12, from: 1.07, to: 1.9, len: 25 },
  ];
  rows.forEach(({ k, n, from, to, len }, row) => {
    for (let i = 0; i < n; i++) {
      const a = Math.PI * (from + ((i + (row % 2) * 0.5) / n) * (to - from));
      const [x, y] = domeAt(a, k);
      if (y > 146) continue;
      const deg = ((a - SWEEP) * 180) / Math.PI;
      const rad = (deg * Math.PI) / 180;
      const mx = x + Math.cos(rad) * len * 0.5;
      const my = y + Math.sin(rad) * len * 0.5;
      out.push({ d: leaf(x, y, len, 5.4, deg), kind: 'detail', fill: 'quillLight' });
      out.push({ d: leaf(mx, my, len * 0.56, 3.8, deg), kind: 'detail', fill: 'quillTip' });
    }
  });
  return out;
};

const tipDots = (): Shape[] =>
  tipAngles.map((a) => {
    const [x, y] = tipAt(a);
    return { d: circle(x, y, 10), kind: 'detail', fill: 'quillTip' };
  });

const claws = (x: number, far: boolean): Shape[] =>
  [0, 6, 12].map((dx) => ({
    d: tube(
      [
        [x + dx, GROUND - 7],
        [x + dx + 5, GROUND - 6],
        [x + dx + 8, GROUND - 2],
      ],
      (u) => 2.6 - 1 * u,
      16,
    ),
    fill: far ? 'clawDark' : 'claw',
  }));

const leg = (id: string, x: number, far: boolean): PartNode => {
  const fill = far ? 'furDark' : 'fur';
  return {
    id,
    role: id,
    behind: true,
    pivot: [x, HIP],
    shapes: [
      ...claws(x + 2, far),
      { d: capsule(x, HIP, x + 1, GROUND - 12, 12, 10.5), fill },
      { d: ellipse(x + 4, GROUND - 7, 14, 7), fill },
    ],
  };
};

const LIFT = 26;
const NECK: Pt = [258, 152];
const grow = (shapes: Shape[]): Shape[] =>
  shapes.map((s) => ({ ...s, d: scalePath(s.d, 1.16, 1.16, NECK[0], NECK[1]) }));

const offset = (parts: PartNode[], dx: number, dy: number): PartNode[] =>
  parts.map((p): PartNode => ({
    ...p,
    pivot: p.pivot && [p.pivot[0] + dx, p.pivot[1] + dy],
    shapes: p.shapes?.map((s) => ({ ...s, d: translatePath(s.d, dx, dy) })),
    children: p.children && offset(p.children, dx, dy),
  }));

const echidna: AnimalDef = {
  id: 'echidna',
  name: 'Echidna',
  kind: 'animal',
  aliases: ['spiny anteater', 'spiny ant eater', 'short-beaked echidna', 'puggle'],
  group: 'mammal',
  habitats: ['aussie'],
  box: [358, GROUND - LIFT],
  size: 90,
  locomotion: 'walk4',
  gait: { period: 1.2, stride: 44, swing: 16 },
  sound: 'echidna',
  palette: {
    fur: '#7a5844',
    furDark: '#634634',
    quill: '#d8b986',
    quillLight: '#fbf0d3',
    quillTip: '#5a3f30',
    face: '#86624b',
    snout: '#4b3a33',
    claw: '#efe0c2',
    clawDark: '#d2c19f',
  },
  parts: offset(
    [
      {
        id: 'body',
        role: 'body',
        pivot: [150, 168],
        shapes: [
          {
            d: smooth([
              [36, 148],
              [56, 106],
              [108, 82],
              [172, 80],
              [234, 98],
              [266, 132],
              [264, 162],
              [236, 180],
              [170, 186],
              [100, 184],
              [54, 172],
            ]),
            fill: 'fur',
          },
        ],
        children: [
          leg('legBF', 100, true),
          leg('legFF', 232, true),
          leg('legBN', 78, false),
          leg('legFN', 210, false),
          {
            id: 'quills',
            pivot: [150, 142],
            shapes: [{ d: quillOutline(), fill: 'quill' }, ...tipDots(), ...innerSpines()],
          },
          {
            id: 'head',
            role: 'head',
            pivot: NECK,
            shapes: grow([
              {
                d: smooth([
                  [244, 142],
                  [254, 122],
                  [278, 116],
                  [300, 126],
                  [310, 146],
                  [302, 166],
                  [278, 176],
                  [254, 170],
                ]),
                fill: 'face',
              },
              {
                d: tube(
                  [
                    [298, 150],
                    [322, 158],
                    [346, 170],
                  ],
                  (u) => 10 - 5 * u,
                  28,
                ),
                fill: 'snout',
              },
              { d: ellipse(280, 160, 8, 5), kind: 'feature', fill: 'blush', opacity: 0.6 },
              { d: circle(282, 140, 7.6), kind: 'feature', fill: 'eye' },
              { d: circle(284.8, 137, 2.9), kind: 'feature', fill: 'shine' },
              { d: curve(290, 168, 304, 166, 3.5), kind: 'line', stroke: 'mouth', width: 2.4 },
            ]),
          },
        ],
      },
    ],
    -6,
    -LIFT,
  ),
};

export default echidna;
