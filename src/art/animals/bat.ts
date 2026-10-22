import {
  capsule,
  circle,
  curve,
  ellipse,
  f,
  mirrorPath,
  translatePath,
  type Pt,
} from '../core/paths';
import type { AnimalDef, PartNode, Shape } from '../core/types';

const CX = 180;

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

const WING =
  'M-6 -10Q20 -36 56 -38Q96 -34 122 -10Q98 4 104 30Q78 24 66 48Q40 30 14 40Q-8 36 -6 -10Z';
const BONES = ['M58 -35Q92 -28 114 -11', 'M56 -34Q84 -8 98 25', 'M54 -33Q62 4 64 42'];
const THUMB = 'M52 -36Q54 -48 62 -50Q60 -42 60 -36Z';

const SHOULDER_Y = 134;

const wing = (id: string, role: string, dir: 1 | -1): PartNode => {
  const sx = CX + dir * 24;
  const put = (d: string) => translatePath(dir === 1 ? d : mirrorPath(d, 0), sx, SHOULDER_Y);
  const shapes: Shape[] = [
    { d: put(THUMB), fill: 'fur' },
    { d: put(WING), fill: 'wing' },
    ...BONES.map((d): Shape => ({ d: put(d), kind: 'line', stroke: 'bone', width: 3 })),
  ];
  return {
    id,
    role,
    behind: true,
    pivot: [sx, SHOULDER_Y],
    motion: { rotate: -dir * 28 },
    shapes,
  };
};

const ear = (dir: 1 | -1, inner: boolean): string => {
  const pts: Pt[] = inner
    ? [
        [CX + dir * 29, 70],
        [CX + dir * 43, 24],
        [CX + dir * 12, 58],
      ]
    : [
        [CX + dir * 42, 80],
        [CX + dir * 49, 8],
        [CX + dir * 4, 56],
      ];
  return roundTri(pts, inner ? 7 : 13);
};

const bat: AnimalDef = {
  id: 'bat',
  name: 'Bat',
  kind: 'animal',
  aliases: ['fruit bat', 'flying fox', 'vampire bat', 'spooky bat', 'halloween bat', 'batty'],
  group: 'mammal',
  habitats: ['jungle', 'halloween', 'cave'],
  box: [348, 216],
  size: 90,
  locomotion: 'fly',
  gait: { period: 0.42 },
  sound: 'bat',
  palette: {
    fur: '#6d5072',
    furLight: '#907294',
    face: '#bd9fbc',
    wing: '#89698d',
    bone: '#563d5a',
    earInner: '#f2a9bd',
    nose: '#45304a',
    smile: '#45304a',
  },
  parts: [
    {
      id: 'body',
      role: 'body',
      pivot: [CX, 150],
      shapes: [
        { d: ellipse(CX, 154, 30, 34), fill: 'fur' },
        { d: ellipse(CX, 164, 17, 21), kind: 'detail', fill: 'furLight' },
      ],
      children: [
        wing('wingF', 'wingF', -1),
        wing('wingN', 'wingN', 1),
        {
          id: 'feet',
          behind: true,
          shapes: [
            { d: capsule(CX - 10, 182, CX - 13, 196, 5, 4), fill: 'fur' },
            { d: capsule(CX + 10, 182, CX + 13, 196, 5, 4), fill: 'fur' },
          ],
        },
        {
          id: 'head',
          role: 'head',
          pivot: [CX, 140],
          shapes: [
            { d: ear(-1, false), fill: 'fur' },
            { d: ear(1, false), fill: 'fur' },
            { d: circle(CX, 100, 50), fill: 'fur' },
            { d: ear(-1, true), kind: 'detail', fill: 'earInner' },
            { d: ear(1, true), kind: 'detail', fill: 'earInner' },
            { d: ellipse(CX - 17, 104, 22, 21), kind: 'detail', fill: 'face' },
            { d: ellipse(CX + 17, 104, 22, 21), kind: 'detail', fill: 'face' },
            { d: ellipse(CX, 124, 23, 16), kind: 'detail', fill: 'face' },
            { d: ellipse(CX - 31, 122, 8, 5), kind: 'feature', fill: 'blush', opacity: 0.55 },
            { d: ellipse(CX + 31, 122, 8, 5), kind: 'feature', fill: 'blush', opacity: 0.55 },
            { d: circle(CX - 17, 102, 10), kind: 'feature', fill: 'eye' },
            { d: circle(CX + 17, 102, 10), kind: 'feature', fill: 'eye' },
            { d: circle(CX - 13.4, 98, 3.8), kind: 'feature', fill: 'shine' },
            { d: circle(CX + 20.6, 98, 3.8), kind: 'feature', fill: 'shine' },
            { d: ellipse(CX, 116, 4.8, 3.2), kind: 'feature', fill: 'nose' },
            {
              d: curve(CX - 10, 124, CX + 10, 124, 5.5),
              kind: 'line',
              stroke: 'smile',
              width: 2.8,
            },
          ],
        },
      ],
    },
  ],
};

export default bat;
