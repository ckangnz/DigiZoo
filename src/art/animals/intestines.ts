import { circle, curve, ellipse, spline, translatePath, tube, type Pt } from '../core/paths';
import type { AnimalDef, PartNode, Shape } from '../core/types';

const TAU = Math.PI * 2;

const COLON: Pt[] = [
  [66, 262],
  [58, 200],
  [56, 130],
  [62, 78],
  [104, 58],
  [166, 66],
  [228, 58],
  [268, 76],
  [272, 140],
  [270, 210],
  [262, 254],
  [228, 280],
  [190, 288],
  [172, 300],
];

const POUCHES = 17;
const colonRadius = (t: number) => 24 + 4 * (0.5 + 0.5 * Math.cos(TAU * POUCHES * t));

function colonFolds(): Shape[] {
  const pts = spline(COLON, 340);
  const out: Shape[] = [];
  for (let k = 1; k < POUCHES; k++) {
    const t = (k - 0.5) / POUCHES;
    const i = Math.round(t * (pts.length - 1));
    const a = pts[Math.max(0, i - 1)];
    const b = pts[Math.min(pts.length - 1, i + 1)];
    const len = Math.hypot(b[0] - a[0], b[1] - a[1]) || 1;
    const tx = (b[0] - a[0]) / len;
    const ty = (b[1] - a[1]) / len;
    const r = colonRadius(t) + 4;
    const [x, y] = pts[i];
    out.push({
      d: tube(
        [
          [x + ty * r, y - tx * r],
          [x + tx * 3, y + ty * 3],
          [x - ty * r, y + tx * r],
        ],
        (s) => 0.6 + 2 * Math.sin(Math.PI * s),
      ),
      kind: 'detail',
      fill: 'colonFold',
    });
  }
  return out;
}

const GAP = 3.6;
const RADII = [14, 14, 22, 14, 14];
const RUN_Y = RADII.reduce<number[]>((acc, r, k) => {
  acc.push(k === 0 ? 98 + r : acc[k - 1] + RADII[k - 1] + GAP + r);
  return acc;
}, []);
const TURNS_RIGHT = [222, 218];
const TURNS_LEFT = [110, 112];
const START = 220;
const END = 76;

function coil(phase: number): string {
  const pts: Pt[] = [];
  const radii: number[] = [];
  const wave = (x: number) => 2.4 * Math.sin(x / 20 - TAU * phase);
  let right = 0;
  let left = 0;
  RADII.forEach((r, k) => {
    const towardLeft = k % 2 === 0;
    const x0 = k === 0 ? START : towardLeft ? TURNS_RIGHT[right - 1] : TURNS_LEFT[left - 1];
    const last = k === RADII.length - 1;
    const x1 = last ? END : towardLeft ? TURNS_LEFT[left] : TURNS_RIGHT[right];
    for (let s = k === 0 ? 0 : 1; s <= 24; s++) {
      const x = x0 + ((x1 - x0) * s) / 24;
      pts.push([x, RUN_Y[k] + wave(x)]);
      radii.push(r);
    }
    if (last) return;
    const rr = (RUN_Y[k + 1] - RUN_Y[k]) / 2;
    const cy = RUN_Y[k] + rr + wave(x1);
    const dir = towardLeft ? -1 : 1;
    for (let s = 1; s < 16; s++) {
      const a = -Math.PI / 2 + (Math.PI * s) / 16;
      pts.push([x1 + dir * rr * Math.cos(a), cy + rr * Math.sin(a)]);
      radii.push(r + ((RADII[k + 1] - r) * s) / 16);
    }
    if (towardLeft) left++;
    else right++;
  });
  return tube(pts, (t) => radii[Math.round(t * (radii.length - 1))], pts.length - 1);
}

const FACE_Y = RUN_Y[2] - 4;

const face: Shape[] = [
  { d: ellipse(122, FACE_Y + 15, 12, 7.5), kind: 'feature', fill: 'blush', opacity: 0.55 },
  { d: ellipse(210, FACE_Y + 15, 12, 7.5), kind: 'feature', fill: 'blush', opacity: 0.55 },
  { d: circle(141, FACE_Y, 13.5), kind: 'feature', fill: 'eye' },
  { d: circle(191, FACE_Y, 13.5), kind: 'feature', fill: 'eye' },
  { d: circle(145.8, FACE_Y - 5.5, 5.1), kind: 'feature', fill: 'shine' },
  { d: circle(195.8, FACE_Y - 5.5, 5.1), kind: 'feature', fill: 'shine' },
  { d: curve(155, FACE_Y + 15, 177, FACE_Y + 15, 7), kind: 'line', stroke: 'mouth', width: 3.4 },
];

const shift = (shapes: Shape[], dx: number, dy: number): Shape[] =>
  shapes.map((s) => ({ ...s, d: translatePath(s.d, dx, dy) }));

const offset = (parts: PartNode[], dx: number, dy: number): PartNode[] =>
  parts.map((p) => {
    const frames = p.frames;
    return {
      ...p,
      ...(p.pivot ? { pivot: [p.pivot[0] + dx, p.pivot[1] + dy] as Pt } : {}),
      ...(p.shapes ? { shapes: shift(p.shapes, dx, dy) } : {}),
      ...(frames ? { frames: (phase: number) => shift(frames(phase), dx, dy) } : {}),
      ...(p.children ? { children: offset(p.children, dx, dy) } : {}),
    };
  });

const intestines: AnimalDef = {
  id: 'intestines',
  name: 'Intestines',
  kind: 'object',
  aliases: ['tummy', 'guts', 'belly', 'gut', 'bowel', 'intestine'],
  group: 'body',
  habitats: ['body'],
  box: [296, 320],
  size: 240,
  locomotion: 'wobble',
  sound: 'intestines',
  palette: {
    colon: '#f4a585',
    colonFold: '#df8668',
    small: '#f8a5b6',
    light: '#ffd3dd',
    blush: '#ff6688',
  },
  parts: offset(
    [
      {
        id: 'colon',
        pivot: [165, 180],
        shapes: [
          { d: tube(COLON, colonRadius, 340), fill: 'colon' },
          ...colonFolds(),
          {
            d: tube(
              [
                [60, 280],
                [48, 296],
                [44, 312],
              ],
              (t) => 9 - 3 * t,
            ),
            fill: 'colon',
          },
        ],
        children: [
          {
            id: 'small',
            frames: (phase: number) => [
              { d: coil(phase), fill: 'small' },
              { d: ellipse(132, RUN_Y[0] - 4, 14, 5, -6), kind: 'detail', fill: 'light' },
              ...face,
            ],
          },
        ],
      },
    ],
    -16,
    -19,
  ),
};

export default intestines;
