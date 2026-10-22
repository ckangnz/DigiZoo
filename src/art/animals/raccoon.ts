import {
  capsule,
  circle,
  ellipse,
  f,
  scalePath,
  smooth,
  spline,
  translatePath,
  tube,
  type Pt,
} from '../core/paths';
import type { AnimalDef, PartNode, Shape } from '../core/types';

const HIP = 184;
const GROUND = 252;
const CX = 272;

const roundTri = (pts: Pt[], r: number): string => {
  const n = pts.length;
  let d = '';
  for (let i = 0; i < n; i++) {
    const prev = pts[(i + n - 1) % n];
    const cur = pts[i];
    const next = pts[(i + 1) % n];
    const toward = (p: Pt): Pt => {
      const len = Math.hypot(p[0] - cur[0], p[1] - cur[1]);
      const k = Math.min(r, len / 2) / len;
      return [cur[0] + (p[0] - cur[0]) * k, cur[1] + (p[1] - cur[1]) * k];
    };
    const a = toward(prev);
    const b = toward(next);
    d += `${i ? 'L' : 'M'}${f(a[0])} ${f(a[1])}Q${f(cur[0])} ${f(cur[1])} ${f(b[0])} ${f(b[1])}`;
  }
  return d + 'Z';
};

const TAIL: Pt[] = [
  [100, 162],
  [68, 158],
  [42, 140],
  [30, 112],
  [32, 82],
  [46, 58],
];
const tailLine = spline(TAIL, 60);
const tailRadius = (t: number) => 18 + 9 * Math.sin(Math.PI * Math.min(1, 0.15 + t * 0.95));

const ring = (t: number, w: number): string => {
  const i = Math.round(t * (tailLine.length - 1));
  const a = tailLine[Math.max(0, i - 1)];
  const b = tailLine[Math.min(tailLine.length - 1, i + 1)];
  const angle = (Math.atan2(b[1] - a[1], b[0] - a[0]) * 180) / Math.PI;
  return ellipse(tailLine[i][0], tailLine[i][1], w, 40, angle);
};

const leg = (id: string, x: number, far: boolean): PartNode => {
  const fill = far ? 'legDark' : 'leg';
  return {
    id,
    role: id,
    behind: true,
    pivot: [x, HIP],
    shapes: [
      { d: capsule(x, HIP, x, GROUND - 20, 13.5, 12.5), fill },
      { d: ellipse(x + 3, GROUND - 10, 15.5, 10), fill },
      ...(far
        ? []
        : [
            {
              d: `M${x + 6} ${GROUND - 6}L${x + 6} ${GROUND - 1}`,
              kind: 'line' as const,
              stroke: 'toe',
              width: 2.2,
            },
            {
              d: `M${x + 12} ${GROUND - 7}L${x + 12} ${GROUND - 2}`,
              kind: 'line' as const,
              stroke: 'toe',
              width: 2.2,
            },
          ]),
    ],
  };
};

const pale = (d: string): Shape => ({ d, kind: 'detail', fill: 'pale' });

const eye = (x: number, y: number): Shape[] => [
  { d: circle(x, y, 12), kind: 'feature', fill: 'eyeRim' },
  { d: circle(x, y, 9.8), kind: 'feature', fill: 'eye' },
  { d: circle(x + 3.6, y - 3.8, 3.9), kind: 'feature', fill: 'shine' },
  { d: circle(x - 3, y + 4, 1.6), kind: 'feature', fill: 'shine' },
];

const ear = (id: string, side: number, phase: number): PartNode => {
  const m = (pts: Pt[]): Pt[] => pts.map(([x, y]): Pt => [CX + side * (x - CX), y]);
  return {
    id,
    role: 'ear',
    behind: true,
    phase,
    pivot: [CX + side * (234 - CX), 84],
    shapes: [
      {
        d: roundTri(
          m([
            [212, 96],
            [220, 40],
            [258, 74],
          ]),
          15,
        ),
        fill: 'pale',
      },
      {
        d: roundTri(
          m([
            [222, 90],
            [226, 54],
            [250, 76],
          ]),
          10,
        ),
        kind: 'detail',
        fill: 'earInner',
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

const grow = (parts: PartNode[], k: number, [ox, oy]: Pt): PartNode[] =>
  parts.map((p): PartNode => ({
    ...p,
    pivot: p.pivot && [ox + (p.pivot[0] - ox) * k, oy + (p.pivot[1] - oy) * k],
    shapes: p.shapes?.map((s) => ({ ...s, d: scalePath(s.d, k, k, ox, oy) })),
    children: p.children && grow(p.children, k, [ox, oy]),
  }));

const raccoon: AnimalDef = {
  id: 'raccoon',
  name: 'Raccoon',
  kind: 'animal',
  aliases: ['racoon', 'bandit', 'masked bandit', 'ringtail'],
  group: 'mammal',
  habitats: ['forest'],
  box: [361, GROUND - 29],
  size: 120,
  locomotion: 'walk4',
  gait: { stride: 90, swing: 20 },
  sound: 'raccoon',
  palette: {
    fur: '#9d9aa6',
    furDark: '#85818f',
    belly: '#c7c4cd',
    pale: '#f6f4f8',
    mask: '#3d3946',
    ring: '#47434f',
    leg: '#5f5b68',
    legDark: '#4d4956',
    earInner: '#7a7584',
    eyeRim: '#cfcad6',
    nose: '#26202b',
    toe: '#3b3743',
  },
  parts: offset(
    [
      {
        id: 'body',
        role: 'body',
        pivot: [168, HIP],
        shapes: [
          {
            d: smooth([
              [92, 146],
              [118, 122],
              [160, 116],
              [204, 124],
              [238, 144],
              [250, 172],
              [238, 200],
              [198, 212],
              [148, 214],
              [104, 206],
              [82, 182],
            ]),
            fill: 'fur',
          },
          { d: ellipse(166, 216, 72, 16), kind: 'detail', fill: 'belly' },
        ],
        children: [
          {
            id: 'tail',
            role: 'tail',
            pivot: [100, 162],
            behind: true,
            shapes: [
              { d: tube(TAIL, tailRadius, 90), fill: 'fur' },
              { d: ring(0.3, 8), kind: 'detail', fill: 'ring' },
              { d: ring(0.52, 8), kind: 'detail', fill: 'ring' },
              { d: ring(0.74, 8), kind: 'detail', fill: 'ring' },
              { d: ring(1, 13), kind: 'detail', fill: 'ring' },
            ],
          },
          leg('legBF', 126, true),
          leg('legFF', 230, true),
          leg('legBN', 104, false),
          leg('legFN', 208, false),
          ...grow(
            [
              {
                id: 'head',
                role: 'head',
                pivot: [250, 168],
                shapes: [
                  {
                    d: smooth([
                      [CX, 66],
                      [306, 72],
                      [328, 94],
                      [336, 120],
                      [351, 141],
                      [330, 155],
                      [304, 169],
                      [CX, 175],
                      [240, 169],
                      [214, 155],
                      [193, 141],
                      [208, 120],
                      [216, 94],
                      [238, 72],
                    ]),
                    fill: 'fur',
                  },
                  pale(ellipse(244, 98, 19, 9.5, -12)),
                  pale(ellipse(300, 98, 19, 9.5, 12)),
                  pale(ellipse(214, 148, 24, 13, 24)),
                  pale(ellipse(330, 148, 24, 13, -24)),
                  pale(ellipse(CX, 154, 31, 21)),
                  {
                    d: tube(
                      [
                        [CX, 66],
                        [CX, 92],
                        [CX, 112],
                      ],
                      (t) => 6.5 - 2 * t,
                    ),
                    kind: 'detail',
                    fill: 'furDark',
                  },
                  { d: ellipse(244, 123, 28, 17, -16), kind: 'detail', fill: 'mask' },
                  { d: ellipse(300, 123, 28, 17, 16), kind: 'detail', fill: 'mask' },
                  { d: ellipse(CX, 126, 14, 9), kind: 'detail', fill: 'mask' },
                  { d: ellipse(229, 152, 8.5, 5.5), kind: 'feature', fill: 'blush', opacity: 0.55 },
                  { d: ellipse(315, 152, 8.5, 5.5), kind: 'feature', fill: 'blush', opacity: 0.55 },
                  ...eye(246, 121),
                  ...eye(298, 121),
                  {
                    d: `M${CX - 9} 141Q${CX} 135 ${CX + 9} 141Q${CX + 7} 148 ${CX} 150Q${CX - 7} 148 ${CX - 9} 141Z`,
                    kind: 'feature',
                    fill: 'nose',
                  },
                  {
                    d: `M${CX} 150Q${CX} 158 ${CX - 7} 160Q${CX - 12} 160 ${CX - 14} 156`,
                    kind: 'line',
                    stroke: 'mouth',
                    width: 2.6,
                  },
                  {
                    d: `M${CX} 150Q${CX} 158 ${CX + 7} 160Q${CX + 12} 160 ${CX + 14} 156`,
                    kind: 'line',
                    stroke: 'mouth',
                    width: 2.6,
                  },
                ],
                children: [ear('earL', 1, 0), ear('earR', -1, 0.5)],
              },
            ],
            1.12,
            [258, 172],
          ),
        ],
      },
    ],
    -3,
    -29,
  ),
};

export default raccoon;
