import { ellipse, poly, spline, translatePath, tube, type Pt } from '../core/paths';
import type { AnimalDef, PartNode, Shape } from '../core/types';

const CENTER: Pt[] = [
  [52, 58],
  [52, 88],
  [64, 116],
  [92, 140],
  [132, 152],
  [174, 148],
  [210, 130],
  [236, 102],
  [250, 72],
];

const SAMPLES = 90;
const PTS = spline(CENTER, SAMPLES);

const radiusAt = (t: number): number => {
  const flare = t > 0.84 ? 12 * ((t - 0.84) / 0.16) ** 2 : 0;
  return 7.5 + 21 * t ** 1.35 + flare;
};

interface Frame {
  p: Pt;
  n: Pt;
  tan: Pt;
  r: number;
}

const FRAMES: Frame[] = PTS.map((p, i) => {
  const a = PTS[Math.max(0, i - 1)];
  const b = PTS[Math.min(PTS.length - 1, i + 1)];
  const len = Math.hypot(b[0] - a[0], b[1] - a[1]) || 1;
  const tan: Pt = [(b[0] - a[0]) / len, (b[1] - a[1]) / len];
  return { p, n: [-tan[1], tan[0]], tan, r: radiusAt(i / (PTS.length - 1)) };
});

const frameAt = (t: number): Frame => FRAMES[Math.round(t * (FRAMES.length - 1))];
const at = (f: Frame, along: number, across: number): Pt => [
  f.p[0] + f.tan[0] * along + f.n[0] * across,
  f.p[1] + f.tan[1] * along + f.n[1] * across,
];

const END = FRAMES[FRAMES.length - 1];
const LIP = 0.42;

function hornOutline(): string {
  const left = FRAMES.map((f) => at(f, 0, f.r));
  const right = FRAMES.map((f) => at(f, 0, -f.r));
  const endCap: Pt[] = [];
  for (let k = 1; k < 12; k++) {
    const a = (Math.PI * k) / 12;
    endCap.push(at(END, END.r * LIP * Math.sin(a), END.r * Math.cos(a)));
  }
  const start = FRAMES[0];
  const startCap: Pt[] = [];
  for (let k = 1; k < 10; k++) {
    const a = (Math.PI * k) / 10;
    startCap.push(at(start, -start.r * Math.sin(a), -start.r * Math.cos(a)));
  }
  return poly([...left, ...endCap, ...right.reverse(), ...startCap]);
}

const ridge = (t: number): Shape => {
  const f = frameAt(t);
  return {
    d: tube([at(f, 0, f.r + 4), at(f, f.r * 0.32, 0), at(f, 0, -f.r - 4)], 1.7, 24),
    kind: 'detail',
    fill: 'ridge',
  };
};

const streak = (): Shape => {
  const pts: Pt[] = [];
  for (let t = 0.1; t <= 0.8; t += 0.05) {
    const f = frameAt(t);
    pts.push(at(f, 0, -f.r * 0.5));
  }
  return {
    d: tube(pts, (t) => 1.6 + 3.2 * Math.sin(Math.PI * t), 60),
    kind: 'detail',
    fill: 'hornLight',
  };
};

const tipShade = (): Shape => {
  const pts: Pt[] = [];
  for (let t = 0; t <= 0.12; t += 0.02) pts.push(frameAt(t).p);
  return { d: tube(pts, 9, 30), kind: 'detail', fill: 'tip' };
};

const angleDeg = (v: Pt) => (Math.atan2(v[1], v[0]) * 180) / Math.PI;

const wave = (id: string, k: number): PartNode => {
  const dist = END.r * LIP + 14 + k * 15;
  const half = END.r * (0.55 + 0.22 * k);
  const mid = at(END, dist, 0);
  const a = at(END, dist - half * 0.35, half);
  const b = at(END, dist - half * 0.35, -half);
  return {
    id,
    pivot: mid,
    motion: { x: END.tan[0] * 5, y: END.tan[1] * 5, freq: 2, phase: k * 0.18 },
    shapes: [
      {
        d: `M${a[0].toFixed(2)} ${a[1].toFixed(2)}Q${(2 * mid[0] - (a[0] + b[0]) / 2).toFixed(2)} ${(2 * mid[1] - (a[1] + b[1]) / 2).toFixed(2)} ${b[0].toFixed(2)} ${b[1].toFixed(2)}`,
        kind: 'line',
        stroke: 'wave',
        width: 4.2,
      },
    ],
  };
};

const offset = (parts: PartNode[], dx: number, dy: number): PartNode[] =>
  parts.map((p): PartNode => ({
    ...p,
    pivot: p.pivot && [p.pivot[0] + dx, p.pivot[1] + dy],
    shapes: p.shapes?.map((s) => ({ ...s, d: translatePath(s.d, dx, dy) })),
    children: p.children && offset(p.children, dx, dy),
  }));

const trumpet: AnimalDef = {
  id: 'trumpet',
  name: 'Trumpet',
  kind: 'object',
  aliases: ['shofar', 'horn', 'jericho', "ram's horn"],
  group: 'bible',
  habitats: ['bible'],
  box: [267, 162],
  size: 110,
  locomotion: 'wobble',
  sound: 'trumpet',
  palette: {
    horn: '#f0cb8e',
    hornLight: '#fbe6bd',
    ridge: '#d2a05f',
    tip: '#c28a4c',
    rim: '#e8be7c',
    inside: '#7c4b2b',
    insideDeep: '#5e3620',
    wave: '#ffc94d',
  },
  parts: offset(
    [
      {
        id: 'horn',
        pivot: [150, 120],
        shapes: [
          { d: hornOutline(), fill: 'horn' },
          tipShade(),
          streak(),
          ...[0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.79].map(ridge),
          {
            d: ellipse(END.p[0], END.p[1], END.r, END.r * LIP, angleDeg(END.n)),
            kind: 'feature',
            fill: 'rim',
            stroke: 'auto',
            width: 2,
          },
          {
            d: ellipse(
              END.p[0] + END.tan[0] * 1.5,
              END.p[1] + END.tan[1] * 1.5,
              END.r - 7,
              END.r * LIP - 4,
              angleDeg(END.n),
            ),
            kind: 'feature',
            fill: 'inside',
          },
          {
            d: ellipse(
              END.p[0] + END.tan[0] * 3,
              END.p[1] + END.tan[1] * 3,
              END.r - 16,
              END.r * LIP - 8,
              angleDeg(END.n),
            ),
            kind: 'feature',
            fill: 'insideDeep',
          },
        ],
        children: [wave('wave1', 0), wave('wave2', 1), wave('wave3', 2)],
      },
    ],
    -41,
    -9,
  ),
};

export default trumpet;
