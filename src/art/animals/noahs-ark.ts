import {
  capsule,
  circle,
  ellipse,
  f,
  leaf,
  roundRect,
  scalePath,
  smooth,
  spiky,
  spline,
  translatePath,
  tube,
  type Pt,
} from '../core/paths';
import type { AnimalDef, PartNode, Shape } from '../core/types';

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

const DECK: Pt[] = [
  [20, 232],
  [48, 266],
  [92, 290],
  [160, 299],
  [240, 301],
  [320, 299],
  [392, 290],
  [434, 266],
  [462, 226],
];

const HULL: Pt[] = [
  ...DECK,
  [450, 282],
  [420, 338],
  [374, 370],
  [300, 382],
  [180, 382],
  [108, 370],
  [62, 338],
  [34, 286],
];

const plank = (dy: number): Shape => ({
  d: tube(
    spline(
      DECK.map(([x, y]) => [x, y + dy] as Pt),
      40,
    ),
    1.8,
    120,
  ),
  kind: 'detail',
  fill: 'hullDark',
});

const HOUSE_SCALE = 1.12;
const grow = ([x, y]: Pt): Pt => [240 + (x - 240) * HOUSE_SCALE, 301 + (y - 281) * HOUSE_SCALE];

const house = (part: PartNode): PartNode => ({
  ...part,
  pivot: part.pivot && grow(part.pivot),
  shapes: part.shapes?.map((s) => ({
    ...s,
    d: translatePath(scalePath(s.d, HOUSE_SCALE, HOUSE_SCALE, 240, 281), 0, 20),
  })),
  children: part.children?.map(house),
});

const WL: Pt = [176, 222];
const WR: Pt = [304, 222];

const windowFrame = (id: string, [x, y]: Pt): PartNode => ({
  id,
  shapes: [
    { d: circle(x, y, 35), fill: 'rim' },
    { d: circle(x, y, 28), kind: 'detail', fill: 'window' },
  ],
});

const GIRAFFE_SCALE = 0.64;
const G = ([x, y]: Pt): Pt => [270 + (x - 223) * GIRAFFE_SCALE, 60 + (y - 90) * GIRAFFE_SCALE];
const onArk = (shapes: Shape[]): Shape[] =>
  shapes.map((s) => ({
    ...s,
    d: translatePath(scalePath(s.d, GIRAFFE_SCALE, GIRAFFE_SCALE, 223, 90), 47, -30),
  }));

const GIRAFFE_HEAD: Pt[] = [
  [222, 34],
  [256, 44],
  [271, 72],
  [267, 106],
  [256, 134],
  [224, 146],
  [192, 134],
  [180, 106],
  [176, 72],
  [190, 44],
];

const NECK: Pt[] = [
  [254, 166],
  [259, 136],
  [264, 110],
  [269, 86],
];

const giraffe: PartNode = {
  id: 'giraffeNeck',
  pivot: [254, 166],
  motion: { rotate: 3.5, phase: 0.1 },
  shapes: [
    { d: tube(NECK, (t) => 17 - 4 * t), fill: 'coat' },
    { d: ellipse(250, 132, 6, 8, 10), kind: 'detail', fill: 'spot' },
    { d: ellipse(270, 116, 5, 7, 10), kind: 'detail', fill: 'spot' },
    { d: ellipse(255, 104, 4.5, 6, 10), kind: 'detail', fill: 'spot' },
    { d: ellipse(271, 146, 5, 7, 10), kind: 'detail', fill: 'spot' },
  ],
  children: [
    {
      id: 'giraffeHead',
      role: 'head',
      pivot: [269, 92],
      shapes: onArk([
        { d: smooth(GIRAFFE_HEAD), fill: 'coat' },
        { d: ellipse(223, 122, 37, 26), kind: 'detail', fill: 'muzzle' },
        { d: ellipse(223, 48, 9, 7), kind: 'detail', fill: 'spot' },
        { d: ellipse(195, 58, 6, 5), kind: 'detail', fill: 'spot' },
        { d: ellipse(252, 60, 6, 5), kind: 'detail', fill: 'spot' },
        { d: ellipse(190, 104, 11, 7), kind: 'feature', fill: 'blush', opacity: 0.55 },
        { d: ellipse(256, 104, 11, 7), kind: 'feature', fill: 'blush', opacity: 0.55 },
        { d: ellipse(211, 117, 4.4, 3.4, -15), kind: 'feature', fill: 'nostril' },
        { d: ellipse(235, 117, 4.4, 3.4, 15), kind: 'feature', fill: 'nostril' },
        { d: 'M213 132Q223 139 233 132', kind: 'line', stroke: 'mouth', width: 2.4 },
      ]),
      children: [
        {
          id: 'giraffeHorns',
          behind: true,
          shapes: onArk([
            { d: capsule(208, 48, 202, 22, 7, 6), fill: 'coat' },
            { d: capsule(238, 48, 244, 22, 7, 6), fill: 'coat' },
            { d: circle(202, 17, 9.5), fill: 'knob' },
            { d: circle(244, 17, 9.5), fill: 'knob' },
          ]),
        },
        {
          id: 'giraffeEarL',
          behind: true,
          pivot: G([182, 60]),
          motion: { rotate: 6, freq: 2, phase: 0.3 },
          shapes: onArk([
            { d: leaf(186, 62, 38, 11.5, 200), fill: 'coat' },
            { d: leaf(182, 61, 25, 5.5, 200), kind: 'detail', fill: 'earInner' },
          ]),
        },
        {
          id: 'giraffeEarR',
          behind: true,
          pivot: G([264, 60]),
          motion: { rotate: -6, freq: 2, phase: 0.3 },
          shapes: onArk([
            { d: leaf(260, 62, 38, 11.5, -20), fill: 'coat' },
            { d: leaf(264, 61, 25, 5.5, -20), kind: 'detail', fill: 'earInner' },
          ]),
        },
        {
          id: 'giraffeEyes',
          role: 'lid',
          pivot: G([223, 72]),
          shapes: onArk([
            { d: circle(205, 80, 11), kind: 'feature', fill: 'eye' },
            { d: circle(242, 80, 11), kind: 'feature', fill: 'eye' },
            { d: circle(209.5, 75.5, 4.2), kind: 'feature', fill: 'shine' },
            { d: circle(246.5, 75.5, 4.2), kind: 'feature', fill: 'shine' },
          ]),
        },
      ],
    },
  ],
};

const elephant = ([x, w]: Pt): PartNode => {
  const y = w + 12;
  return {
    id: 'elephantHead',
    pivot: [x, y + 10],
    motion: { rotate: 3, phase: 0.5 },
    shapes: [
      { d: circle(x, y - 2, 25), fill: 'skin' },
      { d: ellipse(x - 15, y + 6, 6, 3.8), kind: 'feature', fill: 'blush', opacity: 0.55 },
      { d: ellipse(x + 15, y + 6, 6, 3.8), kind: 'feature', fill: 'blush', opacity: 0.55 },
      { d: circle(x - 9.5, y - 6, 5), kind: 'feature', fill: 'eye' },
      { d: circle(x + 9.5, y - 6, 5), kind: 'feature', fill: 'eye' },
      { d: circle(x - 7.6, y - 8.1, 1.9), kind: 'feature', fill: 'shine' },
      { d: circle(x + 11.4, y - 8.1, 1.9), kind: 'feature', fill: 'shine' },
    ],
    children: [
      {
        id: 'elephantEarL',
        behind: true,
        pivot: [x - 18, y - 6],
        motion: { rotate: -5, scaleX: 0.05, phase: 0.3 },
        shapes: [
          { d: ellipse(x - 27, y - 2, 17, 22, 8), fill: 'skin' },
          { d: ellipse(x - 28, y - 1, 10.5, 15, 8), kind: 'detail', fill: 'earPink' },
        ],
      },
      {
        id: 'elephantEarR',
        behind: true,
        pivot: [x + 18, y - 6],
        motion: { rotate: 5, scaleX: 0.05, phase: 0.3 },
        shapes: [
          { d: ellipse(x + 27, y - 2, 17, 22, -8), fill: 'skin' },
          { d: ellipse(x + 28, y - 1, 10.5, 15, -8), kind: 'detail', fill: 'earPink' },
        ],
      },
      {
        id: 'elephantTrunk',
        role: 'trunk',
        pivot: [x, y + 6],
        motion: { rotate: 9, phase: 0.2 },
        shapes: [
          {
            d: tube(
              [
                [x, y + 2],
                [x + 1, y + 17],
                [x + 4, y + 28],
                [x + 12, y + 34],
                [x + 21, y + 31],
                [x + 24, y + 23],
              ],
              (t) => 8 - 3 * t,
              80,
            ),
            fill: 'skin',
          },
          { d: ellipse(x + 24, y + 21.5, 3, 2.2, 30), kind: 'feature', fill: 'trunkTip' },
        ],
      },
    ],
  };
};

const lion = ([x, w]: Pt): PartNode => {
  const y = w + 12;
  return {
    id: 'lionHead',
    pivot: [x, y + 12],
    motion: { rotate: -3, phase: 0.75 },
    shapes: [
      { d: circle(x - 14, y - 19, 7), fill: 'fur' },
      { d: circle(x + 14, y - 19, 7), fill: 'fur' },
      { d: circle(x, y, 23), fill: 'fur' },
      { d: circle(x - 14, y - 20, 3.4), kind: 'detail', fill: 'lionEar' },
      { d: circle(x + 14, y - 20, 3.4), kind: 'detail', fill: 'lionEar' },
      { d: ellipse(x, y + 11, 13, 9), kind: 'detail', fill: 'lionMuzzle' },
      { d: ellipse(x - 16, y + 8, 5.5, 3.6), kind: 'feature', fill: 'blush', opacity: 0.55 },
      { d: ellipse(x + 16, y + 8, 5.5, 3.6), kind: 'feature', fill: 'blush', opacity: 0.55 },
      { d: circle(x - 9.5, y - 3, 4.8), kind: 'feature', fill: 'eye' },
      { d: circle(x + 9.5, y - 3, 4.8), kind: 'feature', fill: 'eye' },
      { d: circle(x - 7.7, y - 5, 1.8), kind: 'feature', fill: 'shine' },
      { d: circle(x + 11.3, y - 5, 1.8), kind: 'feature', fill: 'shine' },
      {
        d: `M${x - 5} ${y + 5}Q${x} ${y + 2.5} ${x + 5} ${y + 5}Q${x + 4} ${y + 9.5} ${x} ${y + 10.5}Q${x - 4} ${y + 9.5} ${x - 5} ${y + 5}Z`,
        kind: 'feature',
        fill: 'lionNose',
      },
      {
        d: `M${x} ${y + 10.5}Q${x} ${y + 14.5} ${x - 4.5} ${y + 15.5}M${x} ${y + 10.5}Q${x} ${y + 14.5} ${x + 4.5} ${y + 15.5}`,
        kind: 'line',
        stroke: 'lionNose',
        width: 1.8,
      },
    ],
    children: [
      {
        id: 'lionMane',
        behind: true,
        pivot: [x, y],
        shapes: [
          { d: spiky(x, y, 35, 28, 13, -8, 0.85), fill: 'mane' },
          { d: spiky(x, y, 30, 24, 13, 6, 0.85), kind: 'detail', fill: 'maneLight' },
        ],
      },
    ],
  };
};

const WAVE = 77;

const waves = (): Shape[] => {
  const top: Pt[] = [];
  for (let x = 8; x <= 472; x += 6) {
    top.push([x, 364 - 9 * Math.cos((2 * Math.PI * (x - 10)) / WAVE)]);
  }
  const crest = top.map(([x, y]) => `L${f(x)} ${f(y)}`).join('');
  const out: Shape[] = [
    { d: `M8 382${crest}L472 382Q472 394 440 398Q240 406 40 398Q8 394 8 382Z`, fill: 'water' },
    { d: roundRect(0, 386, 480, 30, 14), kind: 'detail', fill: 'waterDark' },
  ];
  for (let k = 1; k < 6; k++) {
    const x = 10 + k * WAVE;
    out.push({
      d: `M${f(x - 16)} 362Q${f(x)} 352 ${f(x + 16)} 362`,
      kind: 'line',
      stroke: 'foam',
      width: 3.4,
    });
  }
  return out;
};

const noahsArk: AnimalDef = {
  id: 'noahs-ark',
  name: "Noah's Ark",
  kind: 'object',
  aliases: ['ark', 'boat', 'flood', 'noah ark', 'big boat'],
  group: 'bible',
  habitats: ['bible'],
  box: [480, 402],
  size: 420,
  locomotion: 'float',
  gait: { period: 2.6 },
  sound: 'noahs-ark',
  palette: {
    hull: '#b9784a',
    hullDark: '#99603a',
    rail: '#d79a62',
    cabin: '#ecbd85',
    cabinLine: '#d29c62',
    door: '#b57444',
    roof: '#e0654f',
    roofDark: '#c4503f',
    rim: '#a86a3e',
    window: '#5b3b2a',
    water: '#66c0f0',
    waterDark: '#4fa8de',
    foam: '#d6f2ff',
    coat: '#f6c55f',
    spot: '#c4793a',
    muzzle: '#fde7bd',
    knob: '#9b5a31',
    earInner: '#f0a27a',
    nostril: '#8f5232',
    skin: '#a2b9d6',
    earPink: '#f7b3c2',
    trunkTip: '#8aa1c2',
    fur: '#f6b94a',
    mane: '#c9662e',
    maneLight: '#e3863c',
    lionMuzzle: '#fff3d6',
    lionEar: '#f2a07b',
    lionNose: '#5b3326',
  },
  parts: [
    {
      id: 'ark',
      pivot: [240, 280],
      children: [
        house({
          id: 'cabin',
          shapes: [
            { d: roundRect(120, 168, 240, 116, 8), fill: 'cabin' },
            ...[144, 168, 192, 216, 240, 264, 288, 312, 336].map((x): Shape => ({
              d: roundRect(x - 1.2, 160, 2.4, 130, 1.2),
              kind: 'detail',
              fill: 'cabinLine',
            })),
          ],
        }),
        giraffe,
        house({
          id: 'roof',
          shapes: [
            {
              d: roundPoly(
                [
                  [100, 182],
                  [152, 122],
                  [328, 122],
                  [380, 182],
                ],
                10,
              ),
              fill: 'roof',
            },
            { d: roundRect(80, 142, 320, 5, 2.5), kind: 'detail', fill: 'roofDark' },
            { d: roundRect(80, 162, 320, 5, 2.5), kind: 'detail', fill: 'roofDark' },
          ],
        }),
        house({
          id: 'door',
          shapes: [
            { d: 'M222 286L222 228A18 18 0 0 1 258 228L258 286Z', fill: 'door' },
            { d: roundRect(239, 204, 2.4, 90, 1.2), kind: 'detail', fill: 'hullDark' },
            { d: circle(250, 252, 3), kind: 'feature', fill: 'knob' },
          ],
        }),
        house(windowFrame('windowL', WL)),
        house(windowFrame('windowR', WR)),
        house(elephant(WL)),
        house(lion(WR)),
        {
          id: 'hull',
          shapes: [{ d: smooth(HULL, true, 0.9), fill: 'hull' }, plank(30), plank(60), plank(90)],
        },
        {
          id: 'rail',
          shapes: [{ d: tube(spline(DECK, 40), 8, 120), fill: 'rail' }],
        },
        {
          id: 'waves',
          pivot: [240, 382],
          motion: { x: 6, phase: 0.25 },
          shapes: waves(),
        },
      ],
    },
  ],
};

export default noahsArk;
