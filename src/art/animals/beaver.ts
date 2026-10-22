import { capsule, circle, ellipse, poly, roundRect, smooth, type Pt } from '../core/paths';
import type { AnimalDef, PartNode, Shape } from '../core/types';

const HIP = 176;
const GROUND = 230;
const FACE_X = 288;

const backLeg = (id: string, x: number, far: boolean): PartNode => ({
  id,
  role: id,
  behind: true,
  pivot: [x, HIP],
  shapes: [
    { d: capsule(x, HIP - 6, x + 1, GROUND - 14, 18, 14), fill: far ? 'furDark' : 'fur' },
    { d: ellipse(x + 9, GROUND - 7.5, 23, 7.5), fill: far ? 'pawFar' : 'paw' },
    ...(far
      ? []
      : [10, 19].map((dx): Shape => ({
          d: `M${x + dx} ${GROUND - 9}L${x + dx + 2} ${GROUND - 3}`,
          kind: 'line',
          stroke: 'toe',
          width: 2.2,
        }))),
  ],
});

const frontLeg = (id: string, x: number, far: boolean): PartNode => ({
  id,
  role: id,
  behind: true,
  pivot: [x, HIP - 8],
  shapes: [
    { d: capsule(x, HIP - 12, x + 1, GROUND - 12, 14, 11), fill: far ? 'furDark' : 'fur' },
    { d: ellipse(x + 5, GROUND - 7, 15, 7), fill: far ? 'pawFar' : 'paw' },
  ],
});

const PADDLE_C: Pt = [64, 186];
const PADDLE_RX = 58;
const PADDLE_RY = 26;
const PADDLE_ROT = -14;

const hatch = (angle: number): Shape[] => {
  const a = ((PADDLE_ROT + angle) * Math.PI) / 180;
  const dir: Pt = [Math.cos(a), Math.sin(a)];
  const n: Pt = [-dir[1], dir[0]];
  const out: Shape[] = [];
  for (let k = -6; k <= 6; k++) {
    const cx = PADDLE_C[0] + n[0] * k * 12;
    const cy = PADDLE_C[1] + n[1] * k * 12;
    const L = 90;
    const w = 1.3;
    out.push({
      d: poly([
        [cx - dir[0] * L + n[0] * w, cy - dir[1] * L + n[1] * w],
        [cx + dir[0] * L + n[0] * w, cy + dir[1] * L + n[1] * w],
        [cx + dir[0] * L - n[0] * w, cy + dir[1] * L - n[1] * w],
        [cx - dir[0] * L - n[0] * w, cy - dir[1] * L - n[1] * w],
      ]),
      kind: 'detail',
      fill: 'scale',
    });
  }
  return out;
};

const ear = (id: string, cx: number, cy: number): PartNode => ({
  id,
  role: id,
  behind: true,
  pivot: [cx, cy + 8],
  shapes: [
    { d: circle(cx, cy, 13), fill: 'fur' },
    { d: circle(cx, cy + 1, 7), kind: 'detail', fill: 'earInner' },
  ],
});

const beaver: AnimalDef = {
  id: 'beaver',
  name: 'Beaver',
  kind: 'animal',
  aliases: ['busy beaver', 'north american beaver', 'eurasian beaver'],
  group: 'mammal',
  habitats: ['forest'],
  box: [360, GROUND],
  size: 120,
  locomotion: 'walk4',
  gait: { period: 0.85, stride: 64, swing: 17 },
  sound: 'beaver',
  palette: {
    fur: '#a8693f',
    furDark: '#8c5532',
    belly: '#cf9a6c',
    muzzle: '#ecc9a0',
    tail: '#6a5650',
    scale: '#54433e',
    paw: '#5b3b29',
    pawFar: '#4c3122',
    toe: '#3e2819',
    earInner: '#7a4a2c',
    teeth: '#fffaf0',
    nose: '#3a2420',
  },
  parts: [
    {
      id: 'body',
      role: 'body',
      pivot: [200, HIP],
      shapes: [
        {
          d: smooth([
            [112, 150],
            [126, 112],
            [164, 90],
            [214, 84],
            [258, 96],
            [288, 126],
            [292, 162],
            [270, 192],
            [226, 204],
            [170, 206],
            [128, 194],
            [108, 174],
          ]),
          fill: 'fur',
        },
        { d: ellipse(214, 200, 66, 22), kind: 'detail', fill: 'belly' },
      ],
      children: [
        {
          id: 'tail',
          role: 'tail',
          pivot: [124, 168],
          behind: true,
          motion: { rotate: 4, phase: 0.25 },
          shapes: [{ d: capsule(126, 166, 100, 182, 16, 14), fill: 'fur' }],
          children: [
            {
              id: 'paddle',
              behind: true,
              shapes: [
                {
                  d: ellipse(PADDLE_C[0], PADDLE_C[1], PADDLE_RX, PADDLE_RY, PADDLE_ROT),
                  fill: 'tail',
                },
                ...hatch(38),
                ...hatch(-38),
              ],
            },
          ],
        },
        backLeg('legBF', 172, true),
        frontLeg('legFF', 262, true),
        backLeg('legBN', 148, false),
        frontLeg('legFN', 240, false),
        {
          id: 'head',
          role: 'head',
          pivot: [256, 150],
          shapes: [
            {
              d: smooth([
                [FACE_X, 50],
                [324, 56],
                [346, 80],
                [350, 110],
                [340, 138],
                [316, 156],
                [FACE_X, 162],
                [260, 156],
                [236, 138],
                [226, 110],
                [230, 80],
                [252, 56],
              ]),
              fill: 'fur',
            },
            { d: ellipse(244, 122, 10, 6.5), kind: 'feature', fill: 'blush', opacity: 0.55 },
            { d: ellipse(332, 122, 10, 6.5), kind: 'feature', fill: 'blush', opacity: 0.55 },
            { d: circle(262, 94, 9.5), kind: 'feature', fill: 'eye' },
            { d: circle(314, 94, 9.5), kind: 'feature', fill: 'eye' },
            { d: circle(265.4, 90.2, 3.6), kind: 'feature', fill: 'shine' },
            { d: circle(317.4, 90.2, 3.6), kind: 'feature', fill: 'shine' },
          ],
          children: [
            ear('earN', 240, 62),
            ear('earF', 336, 62),
            {
              id: 'muzzle',
              pivot: [FACE_X, 126],
              shapes: [
                { d: circle(FACE_X - 13, 128, 17), fill: 'muzzle' },
                { d: circle(FACE_X + 13, 128, 17), fill: 'muzzle' },
                {
                  d: `M${FACE_X - 11} 112Q${FACE_X} 106 ${FACE_X + 11} 112Q${FACE_X + 9} 121 ${FACE_X} 123Q${FACE_X - 9} 121 ${FACE_X - 11} 112Z`,
                  kind: 'feature',
                  fill: 'nose',
                },
                {
                  d: ellipse(FACE_X - 4, 111.5, 3.4, 1.9, -10),
                  kind: 'feature',
                  fill: 'shine',
                  opacity: 0.7,
                },
                { d: circle(FACE_X - 20, 128, 1.6), kind: 'feature', fill: 'toe' },
                { d: circle(FACE_X - 13, 134, 1.6), kind: 'feature', fill: 'toe' },
                { d: circle(FACE_X + 20, 128, 1.6), kind: 'feature', fill: 'toe' },
                { d: circle(FACE_X + 13, 134, 1.6), kind: 'feature', fill: 'toe' },
              ],
              children: [
                {
                  id: 'teeth',
                  behind: true,
                  shapes: [
                    { d: roundRect(FACE_X - 13, 130, 13, 28, 4), fill: 'teeth' },
                    { d: roundRect(FACE_X, 130, 13, 28, 4), fill: 'teeth' },
                    {
                      d: `M${FACE_X} 140L${FACE_X} 154`,
                      kind: 'line',
                      stroke: 'scale',
                      width: 1.8,
                    },
                  ],
                },
              ],
            },
          ],
        },
      ],
    },
  ],
};

export default beaver;
