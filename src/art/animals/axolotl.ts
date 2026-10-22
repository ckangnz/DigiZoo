import {
  capsule,
  circle,
  curve,
  ellipse,
  smooth,
  spline,
  translatePath,
  tube,
  type Pt,
} from '../core/paths';
import type { AnimalDef, PartNode, Shape } from '../core/types';

const TAU = Math.PI * 2;
const SAMPLES = 120;

const SPINE: Pt[] = [
  [240, 112],
  [214, 114],
  [188, 116],
  [162, 117],
  [138, 116],
  [118, 112],
  [100, 106],
  [84, 99],
  [70, 92],
  [58, 86],
];

const KEYS: Pt[] = [
  [0, 31],
  [0.15, 33],
  [0.32, 30],
  [0.48, 24],
  [0.64, 17],
  [0.82, 11],
  [1, 6.5],
];

const lerpKeys = (keys: Pt[], t: number): number => {
  const i = Math.max(0, Math.min(keys.length - 2, keys.findIndex(([k]) => k >= t) - 1));
  const [t0, v0] = keys[i];
  const [t1, v1] = keys[i + 1];
  const u = Math.min(1, Math.max(0, (t - t0) / (t1 - t0 || 1)));
  const s = u * u * (3 - 2 * u);
  return v0 + (v1 - v0) * s;
};

const radius = (t: number) => lerpKeys(KEYS, t);

const FIN_TOP: Pt[] = [
  [0, 0],
  [0.22, 0],
  [0.4, 7],
  [0.62, 13],
  [0.86, 15],
  [1, 13],
];

const FIN_BOTTOM: Pt[] = [
  [0, 0],
  [0.46, 0],
  [0.62, 9],
  [0.86, 13],
  [1, 13],
];

function spine(phase: number): Pt[] {
  const s = Math.sin(TAU * phase);
  const [ox, oy] = SPINE[3];
  return SPINE.map(([x, y], i) => {
    if (i <= 3) return [x, y] as Pt;
    const a = ((-7 * s * (i - 3)) / 6) * (Math.PI / 180);
    const dx = x - ox;
    const dy = y - oy;
    return [ox + dx * Math.cos(a) - dy * Math.sin(a), oy + dx * Math.sin(a) + dy * Math.cos(a)];
  });
}

function body(phase: number): Shape[] {
  const line = spine(phase);
  const pts = spline(line, SAMPLES);
  const bellyLine: Pt[] = [];
  for (let i = 0; i <= 60; i++) {
    const a = pts[Math.max(0, i - 1)];
    const b = pts[Math.min(SAMPLES, i + 1)];
    const len = Math.hypot(b[0] - a[0], b[1] - a[1]) || 1;
    const n: Pt = [-(b[1] - a[1]) / len, (b[0] - a[0]) / len];
    const r = radius(i / SAMPLES);
    bellyLine.push([pts[i][0] - n[0] * r * 0.9, pts[i][1] - n[1] * r * 0.9]);
  }
  return [
    { d: tube(line, radius, SAMPLES), fill: 'skin' },
    {
      d: tube(bellyLine, (t) => radius(t * 0.5) * 0.5, 60),
      kind: 'detail',
      fill: 'belly',
    },
  ];
}

function fin(phase: number): Shape[] {
  const pts = spline(spine(phase), SAMPLES);
  const normal = (i: number): Pt => {
    const a = pts[Math.max(0, i - 1)];
    const b = pts[Math.min(SAMPLES, i + 1)];
    const len = Math.hypot(b[0] - a[0], b[1] - a[1]) || 1;
    return [-(b[1] - a[1]) / len, (b[0] - a[0]) / len];
  };
  const up: Pt[] = [];
  const down: Pt[] = [];
  for (let i = Math.round(0.2 * SAMPLES); i <= SAMPLES; i += 4) {
    const t = i / SAMPLES;
    const [nx, ny] = normal(i);
    const r = radius(t) * 0.8;
    const hu = r + lerpKeys(FIN_TOP, t);
    const hd = r + lerpKeys(FIN_BOTTOM, t);
    up.push([pts[i][0] + nx * hu, pts[i][1] + ny * hu]);
    down.push([pts[i][0] - nx * hd, pts[i][1] - ny * hd]);
  }
  const end = pts[SAMPLES];
  const prev = pts[SAMPLES - 3];
  const len = Math.hypot(end[0] - prev[0], end[1] - prev[1]) || 1;
  const d: Pt = [(end[0] - prev[0]) / len, (end[1] - prev[1]) / len];
  const [nx, ny] = normal(SAMPLES);
  const hu = radius(1) * 0.8 + lerpKeys(FIN_TOP, 1);
  const hd = radius(1) * 0.8 + lerpKeys(FIN_BOTTOM, 1);
  const reach = (hu + hd) * 0.5;
  const cap: Pt[] = [0.2, 0.4, 0.6, 0.8].map((k) => {
    const th = Math.PI * k;
    const h = k < 0.5 ? hu : hd;
    return [
      end[0] + d[0] * reach * Math.sin(th) + nx * h * Math.cos(th),
      end[1] + d[1] * reach * Math.sin(th) + ny * h * Math.cos(th),
    ];
  });
  return [{ d: smooth([...up, ...cap, ...down.reverse()]), fill: 'fin' }];
}

const leg = (id: string, x: number, far: boolean, front: boolean): PartNode => {
  const fill = far ? 'skinDark' : 'skin';
  const dir = front ? 1 : -1;
  const top = 126;
  const ax = x + 3 * dir;
  const ay = 152;
  const toe = (dx: number, dy: number): Shape[] => [
    { d: capsule(ax, ay, ax + dx, ay + dy, 3.6, 2.8), fill },
    { d: circle(ax + dx, ay + dy, 3.8), fill },
  ];
  return {
    id,
    role: id,
    behind: true,
    pivot: [x, top],
    shapes: [
      { d: capsule(x, top, ax, ay, 10, 7.5), fill },
      ...toe(14 * dir, 6),
      ...toe(4 * dir, 9),
      ...toe(-7 * dir, 7),
      { d: ellipse(ax, ay + 1, 7.5, 5.5), fill },
    ],
  };
};

const gill = (id: string, ox: number, oy: number, angles: number[], far: boolean): PartNode => {
  const fill = far ? 'gillDark' : 'gill';
  const shapes: Shape[] = angles.flatMap((deg, k): Shape[] => {
    const a = (deg * Math.PI) / 180;
    const len = k === 1 ? 50 : 44;
    const at = (u: number): Pt => [ox + Math.cos(a) * len * u, oy + Math.sin(a) * len * u];
    const tip = at(1);
    const nx = -Math.sin(a);
    const ny = Math.cos(a);
    const bumps = [0.4, 0.56, 0.72, 0.88].flatMap((u): Shape[] => {
      const [px, py] = at(u);
      const r = 3.9 - u * 0.9;
      return [
        { d: circle(px + nx * 4.6, py + ny * 4.6, r), fill },
        { d: circle(px - nx * 4.6, py - ny * 4.6, r), fill },
      ];
    });
    return [
      { d: capsule(ox, oy, tip[0], tip[1], 5, 3.4), fill },
      ...bumps,
      { d: circle(tip[0], tip[1], 4.6), fill },
    ];
  });
  return {
    id,
    behind: true,
    pivot: [ox, oy],
    motion: { rotate: far ? -5 : 5, freq: 1, phase: far ? 0.5 : 0 },
    shapes,
  };
};

const offset = (parts: PartNode[], dx: number, dy: number): PartNode[] =>
  parts.map((p): PartNode => {
    const frames = p.frames;
    return {
      ...p,
      pivot: p.pivot && [p.pivot[0] + dx, p.pivot[1] + dy],
      shapes: p.shapes?.map((s) => ({ ...s, d: translatePath(s.d, dx, dy) })),
      frames: frames && ((ph) => frames(ph).map((s) => ({ ...s, d: translatePath(s.d, dx, dy) }))),
      children: p.children && offset(p.children, dx, dy),
    };
  });

const axolotl: AnimalDef = {
  id: 'axolotl',
  name: 'Axolotl',
  kind: 'animal',
  aliases: ['water monster', 'axie', 'mexican salamander'],
  group: 'amphibian',
  habitats: ['pets'],
  box: [322, 132],
  size: 80,
  locomotion: 'walk4',
  gait: { period: 0.9, stride: 40, swing: 18 },
  sound: 'axolotl',
  palette: {
    skin: '#ffb6c9',
    skinDark: '#f39cb3',
    belly: '#ffd8e3',
    fin: '#ffdce5',
    gill: '#f24d78',
    gillDark: '#d93a64',
  },
  parts: offset(
    [
      {
        id: 'body',
        role: 'body',
        pivot: [160, 140],
        frames: body,
        children: [
          {
            id: 'fin',
            behind: true,
            pivot: [150, 117],
            frames: fin,
          },
          leg('legBF', 136, true, false),
          leg('legFF', 226, true, true),
          leg('legBN', 118, false, false),
          leg('legFN', 208, false, true),
          {
            id: 'head',
            role: 'head',
            pivot: [244, 116],
            shapes: [
              {
                d: smooth([
                  [262, 56],
                  [298, 60],
                  [318, 80],
                  [320, 106],
                  [306, 128],
                  [280, 138],
                  [244, 138],
                  [218, 128],
                  [204, 106],
                  [206, 80],
                  [226, 60],
                ]),
                fill: 'skin',
              },
              { d: ellipse(262, 132, 44, 14), kind: 'detail', fill: 'belly' },
              { d: ellipse(226, 108, 10, 6.5), kind: 'feature', fill: 'blush', opacity: 0.6 },
              { d: ellipse(298, 108, 10, 6.5), kind: 'feature', fill: 'blush', opacity: 0.6 },
              { d: circle(238, 92, 8.5), kind: 'feature', fill: 'eye' },
              { d: circle(286, 92, 8.5), kind: 'feature', fill: 'eye' },
              { d: circle(241, 88.6, 3.2), kind: 'feature', fill: 'shine' },
              { d: circle(289, 88.6, 3.2), kind: 'feature', fill: 'shine' },
              { d: curve(236, 108, 288, 108, 10), kind: 'line', stroke: 'mouth', width: 3 },
            ],
            children: [
              gill('gillF', 218, 84, [-104, -148, -192], true),
              gill('gillN', 306, 84, [-76, -32, 12], false),
            ],
          },
        ],
      },
    ],
    -36,
    -33,
  ),
};

export default axolotl;
