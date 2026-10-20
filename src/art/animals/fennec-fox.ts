import { capsule, circle, ellipse, f, smooth, type Pt } from '../core/paths';
import type { AnimalDef, PartNode } from '../core/types';

const roundTri = (pts: Pt[], radii: number[]): string => {
  const n = pts.length;
  let d = '';
  for (let i = 0; i < n; i++) {
    const prev = pts[(i + n - 1) % n];
    const cur = pts[i];
    const next = pts[(i + 1) % n];
    const toward = (p: Pt): Pt => {
      const len = Math.hypot(p[0] - cur[0], p[1] - cur[1]);
      const k = Math.min(radii[i], len / 2) / len;
      return [cur[0] + (p[0] - cur[0]) * k, cur[1] + (p[1] - cur[1]) * k];
    };
    const a = toward(prev);
    const b = toward(next);
    d += `${i ? 'L' : 'M'}${f(a[0])} ${f(a[1])}Q${f(cur[0])} ${f(cur[1])} ${f(b[0])} ${f(b[1])}`;
  }
  return d + 'Z';
};

const TAIL = smooth([
  [94, 190],
  [72, 186],
  [50, 178],
  [28, 169],
  [10, 166],
  [0, 175],
  [1, 192],
  [12, 208],
  [32, 220],
  [58, 223],
  [81, 215],
  [96, 206],
]);

const HEAD = smooth([
  [238, 104],
  [270, 111],
  [289, 132],
  [294, 156],
  [302, 176],
  [284, 186],
  [264, 199],
  [238, 205],
  [212, 199],
  [192, 186],
  [174, 176],
  [182, 156],
  [187, 132],
  [206, 111],
]);

const leg = (id: string, x: number, far: boolean): PartNode => ({
  id,
  role: id,
  behind: true,
  pivot: [x, 214],
  shapes: [
    { d: capsule(x, 214, x, 268, 9.5, 8), fill: far ? 'furDark' : 'fur' },
    { d: ellipse(x + 3, 276, 12, 8), fill: far ? 'furDark' : 'fur' },
    ...(far
      ? []
      : [{ d: `M${x + 6} 279L${x + 6} 283`, kind: 'line' as const, stroke: 'toe', width: 2 }]),
  ],
});

const shrink = (pts: Pt[], k: number): Pt[] => {
  const cx = (pts[0][0] + pts[1][0] + pts[2][0]) / 3;
  const cy = (pts[0][1] + pts[1][1] + pts[2][1]) / 3;
  return pts.map(([x, y]) => [cx + (x - cx) * k, cy + (y - cy) * k + (1 - k) * 14]);
};

const ear = (id: string, pivot: Pt, outer: Pt[], inner: Pt[], phase = 0): PartNode => ({
  id,
  role: 'ear',
  behind: true,
  phase,
  pivot,
  shapes: [
    { d: roundTri(outer, [10, 28, 10]), fill: 'fur' },
    { d: roundTri(inner, [8, 20, 8]), kind: 'detail', fill: 'pale' },
    { d: roundTri(shrink(inner, 0.66), [6, 14, 6]), kind: 'detail', fill: 'earInner' },
  ],
});

const fennecFox: AnimalDef = {
  id: 'fennec-fox',
  name: 'Fennec Fox',
  aliases: ['fox', 'desert fox', 'fennec', 'foxy'],
  group: 'mammal',
  habitats: ['desert'],
  box: [330, 287],
  size: 120,
  locomotion: 'walk4',
  gait: { stride: 100 },
  sound: 'fennec-fox',
  palette: {
    fur: '#f1d3a1',
    furDark: '#dfbd88',
    pale: '#fff5e4',
    earInner: '#f8c8b6',
    tip: '#3d2c25',
    nose: '#2f2220',
    toe: '#c9a673',
  },
  parts: [
    {
      id: 'body',
      role: 'body',
      pivot: [146, 214],
      shapes: [
        { d: ellipse(146, 206, 74, 42), fill: 'fur' },
        { d: ellipse(152, 246, 58, 16), kind: 'detail', fill: 'pale' },
      ],
      children: [
        {
          id: 'tail',
          role: 'tail',
          pivot: [88, 200],
          behind: true,
          shapes: [
            { d: TAIL, fill: 'fur' },
            { d: ellipse(2, 186, 24, 32, 16), kind: 'detail', fill: 'tip' },
          ],
        },
        leg('legBF', 124, true),
        leg('legFF', 216, true),
        leg('legBN', 104, false),
        leg('legFN', 196, false),
        {
          id: 'head',
          role: 'head',
          pivot: [218, 196],
          shapes: [
            { d: HEAD, fill: 'fur' },
            { d: ellipse(238, 184, 58, 26), kind: 'detail', fill: 'pale' },
            { d: ellipse(204, 172, 9, 6), kind: 'feature', fill: 'blush', opacity: 0.5 },
            { d: ellipse(274, 170, 9, 6), kind: 'feature', fill: 'blush', opacity: 0.5 },
            { d: circle(219, 148, 10.5), kind: 'feature', fill: 'eye' },
            { d: circle(259, 146, 10.5), kind: 'feature', fill: 'eye' },
            { d: circle(222.8, 144, 4), kind: 'feature', fill: 'shine' },
            { d: circle(262.8, 142, 4), kind: 'feature', fill: 'shine' },
            { d: ellipse(239, 166, 6.5, 4.8), kind: 'feature', fill: 'nose' },
            { d: 'M239 170Q239 177 232 179', kind: 'line', stroke: 'mouth', width: 2.4 },
            { d: 'M239 170Q239 177 246 179', kind: 'line', stroke: 'mouth', width: 2.4 },
          ],
          children: [
            ear(
              'earL',
              [207, 128],
              [
                [180, 146],
                [160, 34],
                [236, 110],
              ],
              [
                [193, 136],
                [174, 56],
                [224, 116],
              ],
            ),
            ear(
              'earR',
              [269, 128],
              [
                [240, 110],
                [316, 34],
                [296, 146],
              ],
              [
                [252, 116],
                [302, 56],
                [283, 136],
              ],
              0.5,
            ),
          ],
        },
      ],
    },
  ],
};

export default fennecFox;
