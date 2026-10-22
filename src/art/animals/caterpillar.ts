import { circle, curve, ellipse, rotatePath, tube, type Pt } from '../core/paths';
import type { AnimalDef, PartNode, Shape } from '../core/types';

const TAU = Math.PI * 2;
const GROUND = 200;
const STRIDE = 34;
const DUTY = 0.7;
const SHIFT = STRIDE * DUTY;
const LIFT = 22;
const WAVE = 0.1;
const START = 0.15;

const SEGS: { x: number; r: number }[] = [
  { x: 42, r: 19 },
  { x: 76, r: 23 },
  { x: 112, r: 26 },
  { x: 150, r: 28 },
  { x: 188, r: 29 },
  { x: 226, r: 29 },
  { x: 262, r: 28 },
];

const frac = (v: number) => v - Math.floor(v);

interface Pose {
  x: number;
  y: number;
  lift: number;
}

function segPose(i: number, phase: number): Pose {
  const { x, r } = SEGS[i];
  const p = frac(phase - i * WAVE + START);
  const y = GROUND - 4 - r;
  if (p < DUTY) return { x: x + SHIFT / 2 - SHIFT * (p / DUTY), y, lift: 0 };
  const q = (p - DUTY) / (1 - DUTY);
  const e = q * q * (3 - 2 * q);
  const lift = Math.sin(Math.PI * q);
  return { x: x - SHIFT / 2 + SHIFT * e, y: y - LIFT * lift, lift };
}

const segment = (i: number): PartNode => ({
  id: `seg${i + 1}`,
  frames: (phase) => {
    const { x, y } = segPose(i, phase);
    const r = SEGS[i].r;
    const foot = r + 5.5 - 4;
    return [
      { d: ellipse(x - r * 0.18, y + foot, 7.4, 5.8), fill: 'foot' },
      { d: circle(x, y, r), fill: 'body' },
      { d: ellipse(x, y + r * 0.62, r * 0.96, r * 0.36), kind: 'detail', fill: 'belly' },
      { d: circle(x + r * 0.06, y - r * 0.5, r * 0.2), kind: 'detail', fill: 'spot' },
      {
        d: ellipse(x - r * 0.38, y - r * 0.3, r * 0.2, r * 0.12, -40),
        kind: 'detail',
        fill: 'bodyHi',
      },
    ];
  },
});

function headFrame(phase: number): { c: Pt; neck: Pt; nod: number } {
  const front = segPose(SEGS.length - 1, phase);
  const nod = 4 * Math.sin(TAU * (phase + 0.1));
  return {
    c: [front.x + 40, front.y - 42],
    neck: [front.x + 12, front.y - 8],
    nod,
  };
}

const turn = (shapes: Shape[], deg: number, o: Pt): Shape[] =>
  shapes.map((s) => ({ ...s, d: rotatePath(s.d, deg, o[0], o[1]) }));

const antennae: PartNode = {
  id: 'antennae',
  frames: (phase) => {
    const { c, neck, nod } = headFrame(phase);
    const [x, y] = c;
    const sway = 5 * Math.sin(TAU * (2 * phase + 0.2));
    const stalk = (base: Pt, tip: Pt, far: boolean): Shape[] => [
      {
        d: tube([base, [(base[0] + tip[0]) / 2 - 4, (base[1] + tip[1]) / 2], tip], 3.4, 16),
        fill: far ? 'bodyDark' : 'body',
      },
      { d: circle(tip[0], tip[1], 7), fill: far ? 'tipDark' : 'tip' },
    ];
    return turn(
      [
        ...stalk([x + 10, y - 30], [x + 26 + sway, y - 62], true),
        ...stalk([x - 8, y - 32], [x - 6 + sway, y - 68], false),
      ],
      nod,
      neck,
    );
  },
};

const head: PartNode = {
  id: 'head',
  frames: (phase) => {
    const { c, neck, nod } = headFrame(phase);
    const [x, y] = c;
    return turn(
      [
        { d: circle(x, y, 42), fill: 'head' },
        { d: ellipse(x - 17, y - 23, 12.5, 6.2, -30), kind: 'detail', fill: 'bodyHi' },
        { d: ellipse(x - 14, y + 18, 8.4, 5.4), kind: 'feature', fill: 'blush', opacity: 0.7 },
        { d: ellipse(x + 32, y + 16, 6.2, 4.6), kind: 'feature', fill: 'blush', opacity: 0.7 },
        { d: circle(x - 2, y - 3, 12.2), kind: 'feature', fill: 'eye' },
        { d: circle(x + 26, y - 5, 10.4), kind: 'feature', fill: 'eye' },
        { d: circle(x + 2.6, y - 8, 4.6), kind: 'feature', fill: 'shine' },
        { d: circle(x + 29.8, y - 9.4, 3.9), kind: 'feature', fill: 'shine' },
        { d: circle(x - 5.4, y + 2.2, 2.1), kind: 'feature', fill: 'shine' },
        { d: circle(x + 22.8, y - 0.6, 1.8), kind: 'feature', fill: 'shine' },
        { d: curve(x + 5, y + 17, x + 21, y + 16, 6), kind: 'line', stroke: 'mouth', width: 3 },
      ],
      nod,
      neck,
    );
  },
};

const caterpillar: AnimalDef = {
  id: 'caterpillar',
  name: 'Caterpillar',
  kind: 'animal',
  aliases: ['hungry caterpillar', 'inchworm', 'caterpiller', 'larva'],
  group: 'bug',
  habitats: ['bugs'],
  box: [360, 200],
  size: 70,
  locomotion: 'slither',
  gait: { period: 1.4, stride: STRIDE },
  sound: 'caterpillar',
  palette: {
    body: '#8fd14f',
    bodyDark: '#72b63c',
    bodyHi: '#bde985',
    belly: '#dcf27e',
    spot: '#ffd23f',
    foot: '#5f9f31',
    head: '#9cdb5c',
    tip: '#ffb23e',
    tipDark: '#ea9628',
  },
  parts: [...SEGS.map((_, i) => segment(i)), antennae, head],
};

export default caterpillar;
