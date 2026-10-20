import { circle, curve, ellipse, smooth, type Pt } from '../core/paths';
import type { AnimalDef, Shape } from '../core/types';

const TAU = Math.PI * 2;
const DEG = Math.PI / 180;
const C: Pt = [100, 104];
const REACH = 76;
const VALLEY = 45;
const ARMS = [-90, -18, 54, 126, 198];

const width = (d: number) => 33 - (17 * d) / REACH;

function arm(angle: number, bend: number) {
  const at = (d: number): { p: Pt; n: Pt; dir: number } => {
    const t = d / REACH;
    const dir = (angle + bend * t * t) * DEG;
    const steps = 8;
    let x = C[0];
    let y = C[1];
    for (let k = 0; k < steps; k++) {
      const tk = ((k + 0.5) / steps) * t;
      const a = (angle + bend * tk * tk) * DEG;
      x += (Math.cos(a) * d) / steps;
      y += (Math.sin(a) * d) / steps;
    }
    return { p: [x, y], n: [-Math.sin(dir), Math.cos(dir)], dir };
  };
  return at;
}

function shapesAt(phase: number): Shape[] {
  const bends = ARMS.map((_, i) => 11 * Math.sin(TAU * (phase + i / 5)));
  const outline: Pt[] = [];
  const dots: Shape[] = [];
  ARMS.forEach((angle, i) => {
    const at = arm(angle, bends[i]);
    const side = (d: number, s: number): Pt => {
      const { p, n } = at(d);
      const w = width(d);
      return [p[0] + n[0] * w * s, p[1] + n[1] * w * s];
    };
    for (const d of [42, 58]) outline.push(side(d, -1));
    const tip = at(REACH);
    const wt = width(REACH);
    for (const off of [-55, 0, 55]) {
      const a = tip.dir + off * DEG;
      outline.push([tip.p[0] + Math.cos(a) * wt, tip.p[1] + Math.sin(a) * wt]);
    }
    for (const d of [58, 42]) outline.push(side(d, 1));
    const next = ARMS[(i + 1) % 5] + (i === 4 ? 360 : 0);
    const mid = ((angle + next) / 2 + (bends[i] + bends[(i + 1) % 5]) * 0.15) * DEG;
    outline.push([C[0] + Math.cos(mid) * VALLEY, C[1] + Math.sin(mid) * VALLEY]);
    [
      [44, 5],
      [59, 4.2],
      [72, 3.4],
    ].forEach(([d, r]) => {
      const { p } = at(d);
      dots.push({ d: circle(p[0], p[1], r), kind: 'detail', fill: 'dot' });
    });
  });
  return [
    { d: smooth(outline), fill: 'body' },
    ...dots,
    { d: ellipse(C[0] - 25, C[1] + 12, 8.5, 5.5), kind: 'feature', fill: 'blush', opacity: 0.5 },
    { d: ellipse(C[0] + 25, C[1] + 12, 8.5, 5.5), kind: 'feature', fill: 'blush', opacity: 0.5 },
    { d: circle(C[0] - 15, C[1] - 4, 9.5), kind: 'feature', fill: 'eye' },
    { d: circle(C[0] + 15, C[1] - 4, 9.5), kind: 'feature', fill: 'eye' },
    { d: circle(C[0] - 11.8, C[1] - 7.6, 3.4), kind: 'feature', fill: 'shine' },
    { d: circle(C[0] + 18.2, C[1] - 7.6, 3.4), kind: 'feature', fill: 'shine' },
    {
      d: curve(C[0] - 8, C[1] + 11, C[0] + 8, C[1] + 11, 5),
      kind: 'line',
      stroke: 'mouth',
      width: 3,
    },
  ];
}

const starfish: AnimalDef = {
  id: 'starfish',
  name: 'Starfish',
  kind: 'animal',
  aliases: ['sea star', 'star fish', 'star'],
  group: 'sea',
  habitats: ['ocean'],
  box: [200, 190],
  size: 80,
  locomotion: 'wobble',
  sound: 'starfish',
  palette: {
    body: '#ff8466',
    dot: '#ffcdb6',
  },
  parts: [
    {
      id: 'body',
      role: 'body',
      pivot: C,
      frames: shapesAt,
    },
  ],
};

export default starfish;
