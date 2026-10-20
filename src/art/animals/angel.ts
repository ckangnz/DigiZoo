import { capsule, circle, curve, ellipse, smooth, type Pt } from '../core/paths';
import type { AnimalDef, PartNode, Shape } from '../core/types';

const CX = 130;
const HEAD_Y = 103;
const HEAD_R = 63;
const EYE_Y = 109;
const SHOULDER_Y = 178;

const feathers = (dir: 1 | -1): Shape[] => {
  const root: Pt = [CX + dir * 26, SHOULDER_Y];
  const spec: [number, number][] = [
    [-40, 92],
    [-20, 100],
    [0, 96],
    [20, 84],
    [40, 66],
  ];
  const out: Shape[] = spec.map(([deg, len]) => {
    const a = (deg * Math.PI) / 180;
    const cx = root[0] + dir * Math.cos(a) * len * 0.56;
    const cy = root[1] + Math.sin(a) * len * 0.56;
    return { d: ellipse(cx, cy, len * 0.46, 13, dir * deg), fill: 'wing' };
  });
  out.unshift({
    d: ellipse(root[0] + dir * 34, root[1] - 18, 40, 30, dir * -24),
    fill: 'wing',
  });
  for (const deg of [-30, -10, 10, 30]) {
    const a = (deg * Math.PI) / 180;
    const from = 46;
    const to = deg < 20 ? 88 : 72;
    out.push({
      d: `M${root[0] + dir * Math.cos(a) * from} ${root[1] + Math.sin(a) * from}L${root[0] + dir * Math.cos(a) * to} ${root[1] + Math.sin(a) * to}`,
      kind: 'line',
      stroke: 'featherLine',
      width: 2.4,
    });
  }
  out.push({
    d: curve(root[0] + dir * 10, root[1] - 30, root[0] + dir * 58, root[1] - 44, dir * -6),
    kind: 'line',
    stroke: 'featherLine',
    width: 2.4,
  });
  return out;
};

const wing = (id: string, dir: 1 | -1): PartNode => ({
  id,
  role: dir === 1 ? 'wingN' : 'wingF',
  behind: true,
  pivot: [CX + dir * 26, SHOULDER_Y],
  motion: { rotate: -dir * 9 },
  shapes: feathers(dir),
});

const foot = (id: string, x: number, far: boolean): PartNode => ({
  id,
  role: id,
  behind: true,
  pivot: [x, 250],
  shapes: [
    { d: capsule(x, 252, x + 1, 284, 8, 7.5), fill: far ? 'skinDark' : 'skin' },
    { d: ellipse(x + 3, 287, 10, 8, 10), fill: far ? 'skinDark' : 'skin' },
  ],
});

const ROBE: Pt[] = [
  [CX, 156],
  [CX + 26, 160],
  [CX + 36, 182],
  [CX + 40, 220],
  [CX + 46, 258],
  [CX + 48, 274],
  [CX + 26, 280],
  [CX, 281],
  [CX - 26, 280],
  [CX - 48, 274],
  [CX - 46, 258],
  [CX - 40, 220],
  [CX - 36, 182],
  [CX - 26, 160],
];

const FRINGE: Pt[] = [
  [CX - 60, 98],
  [CX - 58, 70],
  [CX - 36, 48],
  [CX, 40],
  [CX + 36, 48],
  [CX + 58, 70],
  [CX + 60, 98],
  [CX + 50, 88],
  [CX + 46, 74],
  [CX + 34, 76],
  [CX + 26, 64],
  [CX + 12, 70],
  [CX, 60],
  [CX - 12, 70],
  [CX - 26, 64],
  [CX - 34, 76],
  [CX - 46, 74],
  [CX - 50, 88],
];

const eye = (x: number): Shape[] => [
  { d: circle(x, EYE_Y, 7.6), kind: 'feature', fill: 'eye' },
  { d: circle(x + 2.7, EYE_Y - 2.9, 2.8), kind: 'feature', fill: 'shine' },
];

const ellipseHole = (cx: number, cy: number, rx: number, ry: number): string =>
  `M${cx - rx} ${cy}A${rx} ${ry} 0 1 1 ${cx + rx} ${cy}A${rx} ${ry} 0 1 1 ${cx - rx} ${cy}Z`;

const angel: AnimalDef = {
  id: 'angel',
  name: 'Angel',
  kind: 'character',
  aliases: ['guardian angel', 'gabriel', 'cherub', 'christmas angel'],
  group: 'bible',
  habitats: ['bible'],
  box: [260, 300],
  size: 210,
  locomotion: 'float',
  gait: { period: 2.2 },
  sound: 'angel',
  palette: {
    skin: '#e9bc93',
    skinDark: '#d9aa82',
    hair: '#5a3a26',
    hairShine: '#7a5238',
    robe: '#fdfaf3',
    robeDark: '#efe9dc',
    fold: '#e4dccb',
    sash: '#f2c14e',
    sashDark: '#d9a531',
    wing: '#ffffff',
    featherLine: '#d5dbea',
    halo: '#f6c843',
  },
  parts: [
    {
      id: 'body',
      role: 'body',
      pivot: [CX, 220],
      shapes: [
        { d: smooth(ROBE), fill: 'robe' },
        {
          d: `M${CX - 60} 214Q${CX} 226 ${CX + 60} 214L${CX + 60} 228Q${CX} 240 ${CX - 60} 228Z`,
          kind: 'detail',
          fill: 'sash',
        },
        {
          d: smooth([
            [CX + 8, 226],
            [CX + 20, 228],
            [CX + 18, 256],
            [CX + 10, 254],
          ]),
          kind: 'detail',
          fill: 'sashDark',
        },
        { d: curve(CX - 18, 240, CX - 24, 272, 3), kind: 'line', stroke: 'fold', width: 2.4 },
        { d: curve(CX + 24, 246, CX + 28, 272, -2), kind: 'line', stroke: 'fold', width: 2.4 },
      ],
      children: [
        wing('wingL', -1),
        wing('wingR', 1),
        foot('legF', CX - 15, true),
        foot('legN', CX + 14, false),
        {
          id: 'armF',
          role: 'arm',
          behind: true,
          pivot: [CX - 28, 178],
          phase: 0.5,
          shapes: [
            { d: circle(CX - 50, 226, 10), fill: 'skinDark' },
            { d: capsule(CX - 28, 178, CX - 44, 214, 11, 13), fill: 'robeDark' },
          ],
        },
        {
          id: 'head',
          role: 'head',
          pivot: [CX, 164],
          shapes: [
            { d: circle(CX, HEAD_Y, HEAD_R), fill: 'skin' },
            { d: circle(CX, HEAD_Y, HEAD_R - 1.2), kind: 'feature', fill: 'skin' },
            { d: ellipse(CX - 37, 125, 9.5, 5.5), kind: 'feature', fill: 'blush', opacity: 0.55 },
            { d: ellipse(CX + 37, 125, 9.5, 5.5), kind: 'feature', fill: 'blush', opacity: 0.55 },
            { d: curve(CX - 9, 128, CX + 9, 128, 5.5), kind: 'line', stroke: 'mouth', width: 2.8 },
          ],
          children: [
            {
              id: 'hairBack',
              behind: true,
              pivot: [CX, HEAD_Y],
              shapes: [
                { d: circle(CX, HEAD_Y - 4, 66), fill: 'hair' },
                { d: circle(CX - 58, HEAD_Y + 26, 14), fill: 'hair' },
                { d: circle(CX + 58, HEAD_Y + 26, 14), fill: 'hair' },
              ],
            },
            {
              id: 'eyes',
              role: 'lid',
              pivot: [CX, EYE_Y],
              shapes: [...eye(CX - 22), ...eye(CX + 22)],
            },
            {
              id: 'fringe',
              pivot: [CX, 60],
              shapes: [
                { d: smooth(FRINGE), fill: 'hair' },
                { d: ellipse(CX - 30, 52, 12, 5, -20), kind: 'detail', fill: 'hairShine' },
              ],
            },
            {
              id: 'halo',
              pivot: [CX, 24],
              motion: { y: -3, phase: 0.3 },
              shapes: [{ d: ellipse(CX, 24, 42, 12) + ellipseHole(CX, 25, 30, 6), fill: 'halo' }],
            },
          ],
        },
        {
          id: 'armN',
          role: 'arm',
          pivot: [CX + 28, 178],
          shapes: [
            { d: circle(CX + 86, 146, 10.5), fill: 'skin' },
            { d: capsule(CX + 28, 180, CX + 74, 156, 11, 13), fill: 'robe' },
          ],
        },
      ],
    },
  ],
};

export default angel;
