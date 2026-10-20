import { circle, curve, ellipse, tube, type Pt } from '../core/paths';
import type { AnimalDef, PartNode, Shape } from '../core/types';

const TAU = Math.PI * 2;
const DEG = Math.PI / 180;
const STEPS = 16;

interface Arm {
  id: string;
  x: number;
  y: number;
  heading: number;
  length: number;
  curl: number;
  radius: number;
  side: 1 | -1;
  back: boolean;
  phase: number;
}

function armLine(a: Arm, phase: number): { pts: Pt[]; angles: number[] } {
  const pump = -Math.sin(TAU * phase);
  const ds = a.length / STEPS;
  const pts: Pt[] = [[a.x, a.y]];
  const angles: number[] = [];
  for (let i = 0; i < STEPS; i++) {
    const t = (i + 0.5) / STEPS;
    const wave = 9 * t * Math.sin(TAU * (phase + a.phase) - 3 * t);
    const local = a.heading - 12 * pump - a.curl * (1 + 0.18 * pump) * Math.pow(t, 2.6) + wave;
    const theta = (a.side === 1 ? local : 180 - local) * DEG;
    angles.push(theta);
    const [px, py] = pts[pts.length - 1];
    pts.push([px + ds * Math.cos(theta), py + ds * Math.sin(theta)]);
  }
  return { pts, angles };
}

const radiusOf = (a: Arm) => (t: number) => a.radius * (1 - 0.74 * t);

function armShapes(a: Arm, phase: number): Shape[] {
  const { pts, angles } = armLine(a, phase);
  const r = radiusOf(a);
  const fill = a.back ? 'skinDark' : 'skin';
  const cups: Shape[] = [];
  for (let i = 6; i < STEPS - 1; i += 2) {
    const t = i / STEPS;
    const theta = angles[i];
    const turn = Math.sign(angles[i + 1] - angles[i - 1]) || 1;
    const nx = -Math.sin(theta) * turn;
    const ny = Math.cos(theta) * turn;
    const rr = r(t);
    const [x, y] = pts[i];
    cups.push({
      d: circle(x + nx * rr * 0.42, y + ny * rr * 0.42, rr * 0.34),
      kind: 'detail',
      fill: 'cup',
    });
  }
  return [{ d: tube(pts, r, 96), fill }, ...cups];
}

const ARM_SPECS: Omit<Arm, 'id' | 'side'>[] = [
  { x: 92, y: 124, heading: 12, length: 96, curl: 200, radius: 10, back: true, phase: 0.1 },
  { x: 122, y: 148, heading: 64, length: 100, curl: 180, radius: 11, back: true, phase: 0.35 },
  { x: 104, y: 138, heading: 40, length: 118, curl: 190, radius: 12.5, back: false, phase: 0.2 },
  { x: 138, y: 152, heading: 84, length: 110, curl: 170, radius: 13, back: false, phase: 0.45 },
];

const ARMS: Arm[] = ARM_SPECS.flatMap((spec, i): Arm[] => [
  { ...spec, id: `arm${i + 1}L`, side: -1 },
  { ...spec, id: `arm${i + 1}R`, side: 1, x: 300 - spec.x, phase: spec.phase + 0.5 },
]);

const arms: PartNode[] = ARMS.map((a) => ({
  id: a.id,
  behind: true,
  pivot: [a.x, a.y],
  frames: (phase: number) => armShapes(a, phase),
}));

const octopus: AnimalDef = {
  id: 'octopus',
  name: 'Octopus',
  aliases: ['octo', 'octopi', 'squid'],
  group: 'sea',
  habitats: ['ocean'],
  box: [300, 248],
  size: 150,
  locomotion: 'pulse',
  sound: 'octopus',
  palette: {
    skin: '#e98ad6',
    skinDark: '#c66bbb',
    spot: '#f6b9ec',
    cup: '#ffe0f5',
    blush: '#ff5d8f',
  },
  parts: [
    {
      id: 'head',
      role: 'body',
      pivot: [150, 128],
      shapes: [
        { d: ellipse(150, 82, 79, 77), fill: 'skin' },
        { d: circle(116, 36, 8.5), kind: 'detail', fill: 'spot' },
        { d: circle(175, 26, 6.5), kind: 'detail', fill: 'spot' },
        { d: circle(200, 54, 5.5), kind: 'detail', fill: 'spot' },
        { d: circle(94, 66, 5), kind: 'detail', fill: 'spot' },
        { d: circle(146, 16, 4.5), kind: 'detail', fill: 'spot' },
        { d: ellipse(99, 125, 11.5, 7), kind: 'feature', fill: 'blush', opacity: 0.5 },
        { d: ellipse(201, 125, 11.5, 7), kind: 'feature', fill: 'blush', opacity: 0.5 },
        { d: circle(121, 100, 14), kind: 'feature', fill: 'eye' },
        { d: circle(179, 100, 14), kind: 'feature', fill: 'eye' },
        { d: circle(126, 94.4, 5.3), kind: 'feature', fill: 'shine' },
        { d: circle(184, 94.4, 5.3), kind: 'feature', fill: 'shine' },
        { d: curve(140, 122, 160, 122, 6), kind: 'line', stroke: 'mouth', width: 3.2 },
      ],
      children: arms,
    },
  ],
};

export default octopus;
