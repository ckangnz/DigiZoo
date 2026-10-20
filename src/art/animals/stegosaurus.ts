import {
  capsule,
  circle,
  curve,
  ellipse,
  rotatePath,
  scalePath,
  smooth,
  spline,
  translatePath,
  tube,
  type Pt,
} from '../core/paths';
import type { AnimalDef, PartNode, Shape } from '../core/types';

const TAIL: Pt[] = [
  [118, 168],
  [80, 166],
  [48, 156],
  [22, 140],
  [6, 124],
];
const SAMPLES = 40;

const tailRadius = (t: number) => 42 * (1 - t) ** 1.1 + 8 * t;

function tailLine(phase: number): Pt[] {
  return TAIL.map(([x, y], i) => {
    const k = i / (TAIL.length - 1);
    return [x, y + 9 * k ** 1.4 * Math.sin(2 * Math.PI * phase - 1.3 * k)];
  });
}

interface Frame {
  p: Pt;
  n: Pt;
  r: number;
}

function tailFrame(phase: number): Frame[] {
  const pts = spline(tailLine(phase), SAMPLES);
  return pts.map((p, i) => {
    const a = pts[Math.max(0, i - 1)];
    const b = pts[Math.min(SAMPLES, i + 1)];
    const len = Math.hypot(b[0] - a[0], b[1] - a[1]) || 1;
    return { p, n: [-(b[1] - a[1]) / len, (b[0] - a[0]) / len], r: tailRadius(i / SAMPLES) };
  });
}

const BACK: Frame[] = (() => {
  const line = spline(
    [
      [330, 172],
      [300, 140],
      [252, 110],
      [196, 98],
      [146, 108],
      [112, 134],
    ],
    30,
  );
  return line.map((p, i) => {
    const a = line[Math.max(0, i - 1)];
    const b = line[Math.min(30, i + 1)];
    const len = Math.hypot(b[0] - a[0], b[1] - a[1]) || 1;
    return { p, n: [-(b[1] - a[1]) / len, (b[0] - a[0]) / len], r: 0 };
  });
})();

const plate = (base: Pt, n: Pt, h: number, w: number, fill: string, inner: string): Shape[] => {
  const ang = (Math.atan2(n[1], n[0]) * 180) / Math.PI + 90;
  const local: Pt[] = [
    [-w * 0.42, h * 0.2],
    [-w * 0.5, -h * 0.42],
    [-w * 0.16, -h * 0.9],
    [0, -h],
    [w * 0.16, -h * 0.9],
    [w * 0.5, -h * 0.42],
    [w * 0.42, h * 0.2],
  ];
  const d = rotatePath(
    smooth(local.map(([x, y]) => [x + base[0], y + base[1]])),
    ang,
    base[0],
    base[1],
  );
  const di = rotatePath(
    smooth(local.map(([x, y]) => [x * 0.52 + base[0], y * 0.52 - h * 0.3 + base[1]])),
    ang,
    base[0],
    base[1],
  );
  return [
    { d, fill },
    { d: di, kind: 'detail', fill: inner },
  ];
};

const spike = (base: Pt, angle: number, len: number, fill: string): Shape => {
  const a = (angle * Math.PI) / 180;
  const tip: Pt = [base[0] + Math.cos(a) * len, base[1] + Math.sin(a) * len];
  return { d: tube([base, tip], (t) => 11 * (1 - t) + 3 * t, 24), fill };
};

function plates(phase: number): Shape[] {
  const tail = tailFrame(phase);
  const out: Shape[] = [];
  const onBack = (i: number): [Pt, Pt] => [BACK[i].p, BACK[i].n];
  const onTail = (t: number, lift = 0.82): [Pt, Pt] => {
    const { p, n, r } = tail[Math.round(t * SAMPLES)];
    return [[p[0] + n[0] * r * lift, p[1] + n[1] * r * lift], n];
  };
  const far: [Pt, Pt, number][] = [
    [...onBack(4), 34],
    [...onBack(11), 50],
    [...onBack(18), 54],
    [...onBack(25), 42],
    [...onTail(0.2), 32],
    [...onTail(0.48, 0.7), 22],
  ];
  const near: [Pt, Pt, number][] = [
    [...onBack(1), 26],
    [...onBack(7), 44],
    [...onBack(14), 56],
    [...onBack(21), 50],
    [...onBack(28), 36],
    [...onTail(0.34, 0.76), 26],
  ];
  for (const [b, n, h] of far) {
    out.push(...plate([b[0] + 6, b[1] - 4], n, h, h * 0.86, 'plateDark', 'plateDarkInner'));
  }
  for (const [b, n, h] of near) out.push(...plate(b, n, h, h * 0.86, 'plate', 'plateInner'));
  const tip = tail[SAMPLES - 3];
  const [tx, ty] = tip.p;
  out.push(spike([tx + 10, ty - 2], -138, 50, 'spikeDark'));
  out.push(spike([tx + 24, ty + 4], -108, 48, 'spikeDark'));
  out.push(spike([tx + 2, ty + 4], -164, 50, 'spike'));
  out.push(spike([tx + 16, ty + 8], -124, 52, 'spike'));
  return out;
}

function body(phase: number): Shape[] {
  const tail = tailFrame(phase);
  return [
    {
      d: tube(
        tail.map((f) => f.p),
        tailRadius,
        SAMPLES,
      ),
      fill: 'skin',
    },
    {
      d: smooth([
        [352, 214],
        [334, 176],
        [298, 142],
        [250, 112],
        [196, 100],
        [146, 108],
        [110, 132],
        [96, 168],
        [110, 206],
        [150, 234],
        [210, 244],
        [270, 238],
        [322, 232],
      ]),
      fill: 'skin',
    },
    { d: ellipse(214, 250, 104, 30), kind: 'detail', fill: 'belly' },
    { d: circle(160, 150, 9), kind: 'detail', fill: 'spot' },
    { d: circle(196, 136, 11), kind: 'detail', fill: 'spot' },
    { d: circle(236, 146, 9), kind: 'detail', fill: 'spot' },
    { d: circle(268, 168, 8), kind: 'detail', fill: 'spot' },
    { d: circle(128, 176, 8), kind: 'detail', fill: 'spot' },
  ];
}

const leg = (id: string, x: number, top: number, r: number, far: boolean): PartNode => {
  const fill = far ? 'skinDark' : 'skin';
  return {
    id,
    role: id,
    behind: true,
    pivot: [x, top],
    shapes: [
      { d: capsule(x, top - 6, x, 266, r, r - 3), fill },
      { d: ellipse(x + 4, 282, r + 4, 14), fill },
      ...[-12, 0, 12].map((dx) => ({
        d: ellipse(x + 6 + dx * (r / 24), 294, 5.5, 6.5),
        kind: 'detail' as const,
        fill: far ? 'nailDark' : 'nail',
      })),
    ],
  };
};

const HEAD_PIVOT: Pt = [338, 210];

const grow = (shapes: Shape[]): Shape[] =>
  shapes.map((s) => ({ ...s, d: scalePath(s.d, 1.16, 1.16, HEAD_PIVOT[0], HEAD_PIVOT[1]) }));

const move = (s: Shape): Shape => ({ ...s, d: translatePath(s.d, 34, 0) });

const offset = (parts: PartNode[]): PartNode[] =>
  parts.map((p): PartNode => ({
    ...p,
    pivot: p.pivot && [p.pivot[0] + 34, p.pivot[1]],
    shapes: p.shapes?.map(move),
    frames: p.frames && ((phase: number) => p.frames!(phase).map(move)),
    children: p.children && offset(p.children),
  }));

const stegosaurus: AnimalDef = {
  id: 'stegosaurus',
  name: 'Stegosaurus',
  kind: 'animal',
  aliases: ['stego', 'spiky tail', 'plated dinosaur', 'dinosaur'],
  group: 'dinosaur',
  habitats: ['dinosaur'],
  box: [452, 300],
  size: 300,
  locomotion: 'walk4',
  gait: { period: 1.05, swing: 16, stride: 100 },
  sound: 'stegosaurus',
  palette: {
    skin: '#f5a64e',
    skinDark: '#dc8b38',
    spot: '#e8913c',
    belly: '#ffe3a6',
    plate: '#3fb8a2',
    plateInner: '#78d4c1',
    plateDark: '#2f9a88',
    plateDarkInner: '#4eb3a1',
    spike: '#fff3d8',
    spikeDark: '#e6d6b4',
    nail: '#fff4e0',
    nailDark: '#f0d2a8',
    cheek: '#ff8f9c',
  },
  parts: offset([
    {
      id: 'body',
      role: 'body',
      pivot: [210, 210],
      frames: body,
      children: [
        { id: 'plates', behind: true, frames: plates },
        leg('legBF', 176, 196, 25, true),
        leg('legFF', 312, 214, 21, true),
        leg('legBN', 148, 200, 27, false),
        leg('legFN', 286, 218, 22, false),
        {
          id: 'head',
          role: 'head',
          pivot: HEAD_PIVOT,
          shapes: grow([
            {
              d: smooth([
                [334, 184],
                [360, 166],
                [392, 168],
                [412, 186],
                [414, 208],
                [398, 226],
                [366, 232],
                [338, 226],
                [326, 206],
              ]),
              fill: 'skin',
            },
            { d: ellipse(372, 236, 40, 14), kind: 'detail', fill: 'belly' },
            { d: ellipse(366, 212, 9, 5.5), kind: 'feature', fill: 'cheek', opacity: 0.7 },
            { d: circle(376, 190, 9.5), kind: 'feature', fill: 'eye' },
            { d: circle(379.6, 186.4, 3.6), kind: 'feature', fill: 'shine' },
            { d: ellipse(406, 190, 2.6, 2), kind: 'feature', fill: 'mouth' },
            { d: curve(406, 210, 380, 214, -4), kind: 'line', stroke: 'mouth', width: 3 },
          ]),
        },
      ],
    },
  ]),
};

export default stegosaurus;
