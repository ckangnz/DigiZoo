import { capsule, circle, curve, ellipse, smooth, type Pt } from '../core/paths';
import type { AnimalDef, PartNode, Shape } from '../core/types';

const TAU = Math.PI * 2;
const CX = 115;
const LOBES = 4;
const HEM_LEFT = 14;
const HEM_RIGHT = 214;
const HEM_Y = 204;

function outline(phase: number): string {
  const pts: Pt[] = [];
  for (let i = 0; i <= 12; i++) {
    const a = Math.PI + (i / 12) * Math.PI;
    pts.push([CX + 80 * Math.cos(a), 94 + 82 * Math.sin(a)]);
  }
  pts.push([198, 130], [205, 162], [211, 190]);
  const w = (HEM_RIGHT - HEM_LEFT) / LOBES;
  for (let j = 0; j < LOBES; j++) {
    const wave = Math.sin(TAU * (phase - j / LOBES));
    const cx = HEM_RIGHT - j * w - w / 2 + 2.5 * wave - j * 1.5;
    const cy = HEM_Y + 4.5 * wave + j * 1.5;
    const r = w / 2;
    for (const deg of [10, 50, 90, 130, 170]) {
      const a = (deg * Math.PI) / 180;
      pts.push([cx + r * Math.cos(a), cy + r * 1.05 * Math.sin(a)]);
    }
    if (j < LOBES - 1) pts.push([cx - r, cy - 6]);
  }
  pts.push([16, 190], [24, 160], [32, 128]);
  return smooth(pts);
}

function bodyShapes(phase: number): Shape[] {
  return [
    { d: outline(phase), fill: 'sheet' },
    {
      d: smooth([
        [194, 112],
        [214, 170],
        [218, 240],
        [170, 246],
        [180, 204],
        [182, 156],
      ]),
      kind: 'detail',
      fill: 'shade',
    },
    { d: ellipse(72, 50, 13, 22, 36), kind: 'detail', fill: 'white' },
    { d: curve(80, 172, 70, 206, -5), kind: 'line', stroke: 'fold', width: 2.6 },
    { d: curve(150, 172, 160, 206, 5), kind: 'line', stroke: 'fold', width: 2.6 },
    { d: ellipse(72, 118, 12, 7.5), kind: 'feature', fill: 'blush', opacity: 0.6 },
    { d: ellipse(158, 118, 12, 7.5), kind: 'feature', fill: 'blush', opacity: 0.6 },
    { d: circle(91, 94, 12.5), kind: 'feature', fill: 'eye' },
    { d: circle(139, 94, 12.5), kind: 'feature', fill: 'eye' },
    { d: circle(95.6, 89, 4.8), kind: 'feature', fill: 'shine' },
    { d: circle(143.6, 89, 4.8), kind: 'feature', fill: 'shine' },
    { d: circle(87, 99.5, 2), kind: 'feature', fill: 'shine' },
    { d: circle(135, 99.5, 2), kind: 'feature', fill: 'shine' },
    {
      d: 'M104 113Q115 116 126 113Q126 131 115 131Q104 131 104 113Z',
      kind: 'feature',
      fill: 'mouth',
    },
    { d: ellipse(115, 126, 6.5, 4), kind: 'feature', fill: 'tongue' },
  ];
}

const arm = (id: string, role: string, side: 1 | -1, phase: number): PartNode => {
  const sx = CX + side * 74;
  const sy = 126;
  return {
    id,
    role,
    behind: true,
    phase,
    pivot: [sx, sy],
    shapes: [{ d: capsule(sx, sy, sx + side * 31, sy + 12, 14, 11.5), fill: 'sheet' }],
  };
};

const ghost: AnimalDef = {
  id: 'ghost',
  name: 'Ghost',
  kind: 'character',
  aliases: ['boo', 'spook', 'spooky ghost', 'friendly ghost', 'phantom', 'ghostie'],
  group: 'spooky',
  habitats: ['halloween'],
  box: [230, 250],
  size: 170,
  locomotion: 'float',
  sound: 'ghost',
  palette: {
    sheet: '#fbf8ff',
    shade: '#e9e1f7',
    fold: '#d9cdee',
    blush: '#ff8fb0',
  },
  parts: [
    {
      id: 'body',
      pivot: [CX, 130],
      frames: bodyShapes,
      children: [arm('armF', 'armF', -1, 0.5), arm('armN', 'armN', 1, 0)],
    },
  ],
};

export default ghost;
