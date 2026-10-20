import { circle, curve, ellipse, tube, type Pt } from '../core/paths';
import type { AnimalDef, PartNode, Shape } from '../core/types';

const TAU = Math.PI * 2;
const RIM_Y = 114;
const RIM_L = 18;
const RIM_R = 202;
const FRILLS = 8;

function bell(): string {
  const w = (RIM_R - RIM_L) / FRILLS;
  const r = (w / 2 + 2.5).toFixed(2);
  let d = `M${RIM_L} ${RIM_Y}C${RIM_L} 46 60 6 110 6C160 6 ${RIM_R} 46 ${RIM_R} ${RIM_Y}`;
  for (let i = 1; i <= FRILLS; i++) {
    d += `A${r} ${r} 0 0 1 ${(RIM_R - i * w).toFixed(2)} ${RIM_Y}`;
  }
  return d + 'Z';
}

interface Strand {
  id: string;
  x: number;
  length: number;
  sway: number;
  phase: number;
  oral: boolean;
}

const STRANDS: Strand[] = [
  { id: 'tentacle1', x: 40, length: 116, sway: 13, phase: 0, oral: false },
  { id: 'tentacle2', x: 180, length: 116, sway: 13, phase: 0.5, oral: false },
  { id: 'tentacle3', x: 70, length: 140, sway: 15, phase: 0.25, oral: false },
  { id: 'tentacle4', x: 150, length: 140, sway: 15, phase: 0.75, oral: false },
  { id: 'oral1', x: 98, length: 130, sway: 10, phase: 0.1, oral: true },
  { id: 'oral2', x: 122, length: 130, sway: 10, phase: 0.6, oral: true },
];

function strandShapes(s: Strand, phase: number): Shape[] {
  const pts: Pt[] = [];
  const n = 12;
  for (let k = 0; k <= n; k++) {
    const t = k / n;
    const x = s.x + s.sway * t * Math.sin(TAU * (1.2 * t - phase - s.phase));
    pts.push([x, RIM_Y - 14 + t * s.length]);
  }
  const radius = s.oral
    ? (t: number) => (8.5 - 4.5 * t) * (1 + 0.22 * Math.sin(t * 34 - TAU * phase))
    : (t: number) => 5.2 - 2.6 * t;
  return [{ d: tube(pts, radius, 110), fill: s.oral ? 'arm' : 'tentacle' }];
}

const strands: PartNode[] = STRANDS.map((s) => ({
  id: s.id,
  behind: true,
  pivot: [s.x, RIM_Y],
  frames: (phase: number) => strandShapes(s, phase),
}));

const jellyfish: AnimalDef = {
  id: 'jellyfish',
  name: 'Jellyfish',
  aliases: ['jelly', 'jelly fish', 'medusa'],
  group: 'sea',
  habitats: ['ocean'],
  box: [220, 250],
  size: 120,
  locomotion: 'pulse',
  sound: 'jellyfish',
  palette: {
    bell: '#bf98f0',
    glow: '#eadcff',
    frill: '#f3a6d6',
    tentacle: '#f6bde0',
    arm: '#e592d2',
  },
  parts: [
    {
      id: 'bell',
      role: 'bell',
      pivot: [110, RIM_Y],
      shapes: [
        { d: bell(), fill: 'bell' },
        {
          d: 'M34 112C34 58 66 22 110 22C154 22 186 58 186 112Z',
          kind: 'detail',
          fill: 'glow',
          opacity: 0.55,
        },
        { d: ellipse(110, RIM_Y + 6, 100, 18), kind: 'detail', fill: 'frill' },
        { d: ellipse(58, 44, 8, 19, 34), kind: 'detail', fill: 'white', opacity: 0.6 },
        { d: circle(152, 32, 4), kind: 'detail', fill: 'white', opacity: 0.6 },
        { d: circle(168, 48, 2.6), kind: 'detail', fill: 'white', opacity: 0.6 },
        { d: ellipse(70, 90, 10, 6), kind: 'feature', fill: 'blush', opacity: 0.5 },
        { d: ellipse(150, 90, 10, 6), kind: 'feature', fill: 'blush', opacity: 0.5 },
        { d: circle(86, 72, 10.5), kind: 'feature', fill: 'eye' },
        { d: circle(134, 72, 10.5), kind: 'feature', fill: 'eye' },
        { d: circle(90, 67.8, 4), kind: 'feature', fill: 'shine' },
        { d: circle(138, 67.8, 4), kind: 'feature', fill: 'shine' },
        { d: curve(100, 89, 120, 89, 6), kind: 'line', stroke: 'mouth', width: 3 },
      ],
      children: strands,
    },
  ],
};

export default jellyfish;
