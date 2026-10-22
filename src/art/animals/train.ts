import { capsule, circle, ellipse, f, roundRect, scallop, type Pt } from '../core/paths';
import type { AnimalDef, PartNode, Shape } from '../core/types';

const GROUND = 260;
const BIG = 34;
const SMALL = 17;
const BIG_Y = GROUND - BIG;
const CRANK = 14;
const DRIVERS = [262, 338];

function roundPoly(pts: Pt[], r: number): string {
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
}

const spinner = (id: string, pivot: Pt, speed: number, leaf: Partial<PartNode>): PartNode => {
  let node: PartNode = { ...leaf, id: `${id}${speed}`, role: 'spinner', pivot };
  for (let k = speed - 1; k >= 1; k--) {
    node = { id: `${id}${k}`, role: 'spinner', pivot, children: [node] };
  }
  return node;
};

const polar = (x: number, y: number, r: number, deg: number): Pt => {
  const a = ((deg - 90) * Math.PI) / 180;
  return [x + r * Math.cos(a), y + r * Math.sin(a)];
};

const wheel = (id: string, x: number, r: number, spokes: number, weight: boolean): PartNode => {
  const y = GROUND - r;
  const speed = r === BIG ? 1 : 2;
  const spin: Shape[] = [];
  if (weight) {
    const [a1x, a1y] = polar(x, y, r * 0.78, 220);
    const [a2x, a2y] = polar(x, y, r * 0.78, 320);
    spin.push({
      d: `M${f(a1x)} ${f(a1y)}A${f(r * 0.78)} ${f(r * 0.78)} 0 0 1 ${f(a2x)} ${f(a2y)}Q${f(x - r * 0.3)} ${f(y)} ${f(a1x)} ${f(a1y)}Z`,
      kind: 'feature',
      fill: 'wheelDark',
    });
  }
  for (let i = 0; i < spokes; i++) {
    const [sx, sy] = polar(x, y, r * 0.3, (360 * i) / spokes);
    const [ex, ey] = polar(x, y, r * 0.76, (360 * i) / spokes);
    spin.push({
      d: `M${f(sx)} ${f(sy)}L${f(ex)} ${f(ey)}`,
      kind: 'line',
      stroke: 'spoke',
      width: r > 20 ? 3.4 : 2.6,
    });
  }
  spin.push({
    d: circle(x, y, r * 0.32),
    kind: 'feature',
    fill: 'hub',
    stroke: 'auto',
    width: 1.8,
  });
  if (!weight) {
    const [px, py] = polar(x, y, r * 0.55, 0);
    spin.push({ d: circle(px, py, r * 0.12), kind: 'feature', fill: 'hub' });
  }
  return {
    id,
    shapes: [{ d: circle(x, y, r), fill: 'steel' }],
    children: [
      {
        id: `${id}Face`,
        shapes: [{ d: circle(x, y, r * 0.82), fill: 'wheel' }],
        children: [spinner(`${id}Spin`, [x, y], speed, { shapes: spin })],
      },
    ],
  };
};

const eye = (x: number, y: number): Shape[] => [
  { d: ellipse(x, y, 9.5, 12.5), kind: 'feature', fill: 'eye' },
  { d: circle(x + 3.3, y - 4.6, 3.8), kind: 'feature', fill: 'shine' },
  { d: circle(x - 3.2, y + 5.4, 1.7), kind: 'feature', fill: 'shine' },
];

const puff = (id: string, x: number, y: number, r: number, phase: number): PartNode => ({
  id,
  role: 'sparkle',
  phase,
  pivot: [x, y],
  shapes: [{ d: scallop(x, y, r, 7, r * 0.3, 10), fill: 'steam' }],
});

const rod: PartNode = {
  id: 'rodX',
  pivot: [DRIVERS[0], BIG_Y],
  motion: { x: CRANK, wave: 'cos' },
  children: [
    {
      id: 'rodY',
      pivot: [DRIVERS[0], BIG_Y],
      motion: { y: CRANK, wave: 'sin' },
      shapes: [
        { d: capsule(DRIVERS[0], BIG_Y, DRIVERS[1], BIG_Y, 5), fill: 'rod' },
        { d: circle(DRIVERS[0], BIG_Y, 3), kind: 'feature', fill: 'hub' },
        { d: circle(DRIVERS[1], BIG_Y, 3), kind: 'feature', fill: 'hub' },
      ],
    },
  ],
};

const FACE: Pt = [420, 140];

const train: AnimalDef = {
  id: 'train',
  name: 'Train',
  kind: 'object',
  aliases: ['choo choo', 'locomotive', 'steam train', 'engine', 'railway'],
  group: 'vehicle',
  habitats: ['vehicles'],
  box: [462, 262],
  size: 260,
  locomotion: 'drive',
  gait: { period: 0.8, stride: Math.PI * 2 * BIG },
  sound: 'train',
  palette: {
    boiler: '#4a90e2',
    boilerDark: '#3672c4',
    band: '#ffd23f',
    cab: '#ef4d48',
    cabDark: '#c93a37',
    roof: '#4a4658',
    face: '#fff2dc',
    rim: '#3d4a6b',
    chimney: '#4a4658',
    glass: '#c4ecff',
    carriage: '#6cc04a',
    carriageDark: '#4b9e3a',
    trim: '#ffd23f',
    frame: '#4a4658',
    steel: '#4a4658',
    wheel: '#ef4d48',
    wheelDark: '#b83632',
    spoke: '#b83632',
    hub: '#ffd23f',
    rod: '#9aa0b1',
    metal: '#9aa0b1',
    steam: '#f4f2ee',
  },
  parts: [
    {
      id: 'carriage',
      shapes: [
        { d: roundRect(26, 200, 160, 16, 7), fill: 'frame' },
        { d: roundRect(180, 202, 34, 9, 4.5), fill: 'frame' },
        { d: roundRect(34, 206, 48, 30, 10), fill: 'frame' },
        { d: roundRect(128, 206, 48, 30, 10), fill: 'frame' },
      ],
      children: [
        {
          id: 'coach',
          shapes: [
            { d: roundRect(16, 74, 176, 132, 14), fill: 'carriage' },
            { d: roundRect(10, 166, 190, 9, 4.5), kind: 'detail', fill: 'trim' },
            { d: roundRect(10, 186, 190, 30, 0), kind: 'detail', fill: 'carriageDark' },
          ],
          children: [
            {
              id: 'coachRoof',
              shapes: [{ d: roundRect(8, 58, 192, 26, 13), fill: 'roof' }],
            },
            ...[38, 118].map((x, i): PartNode => ({
              id: `coachWindow${i + 1}`,
              shapes: [
                { d: roundRect(x, 96, 52, 52, 14), fill: 'glass' },
                {
                  d: `M${x + 11} ${106}Q${x + 7} ${118} ${x + 9} ${132}`,
                  kind: 'line',
                  stroke: 'white',
                  width: 4.2,
                  opacity: 0.8,
                },
              ],
            })),
          ],
        },
      ],
    },
    wheel('coachWheelA', 58, SMALL, 5, false),
    wheel('coachWheelB', 152, SMALL, 5, false),
    {
      id: 'engine',
      shapes: [
        { d: roundRect(204, 176, 236, 18, 7), fill: 'frame' },
        { d: roundRect(366, 186, 44, 48, 10), fill: 'frame' },
      ],
      children: [
        {
          id: 'chimney',
          behind: true,
          shapes: [
            {
              d: roundPoly(
                [
                  [378, 110],
                  [380, 80],
                  [370, 62],
                  [406, 62],
                  [396, 80],
                  [398, 110],
                ],
                4,
              ),
              fill: 'chimney',
            },
            { d: roundRect(366, 58, 44, 9, 4.5), kind: 'detail', fill: 'band' },
          ],
          children: [
            puff('puffA', 394, 40, 15, 0),
            puff('puffB', 366, 22, 12, 0.15),
            puff('puffC', 336, 14, 9, 0.3),
          ],
        },
        {
          id: 'dome',
          behind: true,
          shapes: [{ d: ellipse(334, 106, 15, 17), fill: 'band' }],
        },
        {
          id: 'boiler',
          shapes: [
            { d: roundRect(280, 102, 140, 76, 16), fill: 'boiler' },
            { d: roundRect(314, 96, 8, 90, 4), kind: 'detail', fill: 'band' },
            { d: roundRect(356, 96, 8, 90, 4), kind: 'detail', fill: 'band' },
            { d: roundRect(270, 160, 160, 30, 0), kind: 'detail', fill: 'boilerDark' },
          ],
        },
        {
          id: 'cab',
          shapes: [
            { d: roundRect(206, 56, 84, 128, 10), fill: 'cab' },
            { d: roundRect(196, 152, 100, 8, 4), kind: 'detail', fill: 'band' },
          ],
          children: [
            {
              id: 'cabRoof',
              shapes: [{ d: roundRect(194, 40, 108, 24, 11), fill: 'roof' }],
            },
            {
              id: 'cabWindow',
              shapes: [
                { d: roundRect(222, 76, 52, 50, 13), fill: 'glass' },
                {
                  d: 'M233 86Q229 98 231 112',
                  kind: 'line',
                  stroke: 'white',
                  width: 4.2,
                  opacity: 0.8,
                },
              ],
            },
          ],
        },
        {
          id: 'cowcatcher',
          shapes: [
            {
              d: roundPoly(
                [
                  [402, 190],
                  [436, 190],
                  [458, 250],
                  [402, 250],
                ],
                6,
              ),
              fill: 'cab',
            },
            ...[414, 428, 442].map((x): Shape => ({
              d: `M${x} 196L${x + 8} 248`,
              kind: 'line',
              stroke: 'cabDark',
              width: 3,
            })),
          ],
        },
        {
          id: 'front',
          shapes: [
            { d: circle(FACE[0], FACE[1], 45), fill: 'rim' },
            { d: circle(FACE[0], FACE[1], 38), kind: 'feature', fill: 'face' },
            {
              d: ellipse(FACE[0] - 22, FACE[1] + 9, 7, 4.2),
              kind: 'feature',
              fill: 'blush',
              opacity: 0.6,
            },
            {
              d: ellipse(FACE[0] + 22, FACE[1] + 9, 7, 4.2),
              kind: 'feature',
              fill: 'blush',
              opacity: 0.6,
            },
            ...eye(FACE[0] - 12.5, FACE[1] - 8),
            ...eye(FACE[0] + 12.5, FACE[1] - 8),
            {
              d: `M${FACE[0] - 12} ${FACE[1] + 12}Q${FACE[0]} ${FACE[1] + 16} ${FACE[0] + 12} ${FACE[1] + 12}Q${FACE[0] + 11} ${FACE[1] + 27} ${FACE[0]} ${FACE[1] + 28}Q${FACE[0] - 11} ${FACE[1] + 27} ${FACE[0] - 12} ${FACE[1] + 12}Z`,
              kind: 'feature',
              fill: 'mouth',
            },
            { d: ellipse(FACE[0], FACE[1] + 23.5, 6, 3.2), kind: 'feature', fill: 'tongue' },
          ],
        },
      ],
    },
    wheel('driverA', DRIVERS[0], BIG, 8, true),
    wheel('driverB', DRIVERS[1], BIG, 8, true),
    wheel('pony', 388, SMALL, 5, false),
    rod,
  ],
};

export default train;
