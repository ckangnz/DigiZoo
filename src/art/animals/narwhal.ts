import { circle, curve, ellipse, poly, smooth, type Pt } from '../core/paths';
import type { AnimalDef, Shape } from '../core/types';

const TUSK_BASE: Pt = [292, 108];
const TUSK_TIP: Pt = [452, 58];
const TUSK_R0 = 11;
const TUSK_R1 = 3.2;

const tuskFrame = () => {
  const dx = TUSK_TIP[0] - TUSK_BASE[0];
  const dy = TUSK_TIP[1] - TUSK_BASE[1];
  const len = Math.hypot(dx, dy);
  const u: Pt = [dx / len, dy / len];
  const n: Pt = [-u[1], u[0]];
  return { len, u, n };
};

const tuskOutline = (): string => {
  const { len, u, n } = tuskFrame();
  const at = (t: number, side: number): Pt => {
    const r = TUSK_R0 + (TUSK_R1 - TUSK_R0) * t;
    return [
      TUSK_BASE[0] + u[0] * len * t + n[0] * r * side,
      TUSK_BASE[1] + u[1] * len * t + n[1] * r * side,
    ];
  };
  const steps = [0, 0.25, 0.5, 0.75, 1];
  const top = steps.map((t) => at(t, 1));
  const bottom = steps.map((t) => at(t, -1)).reverse();
  const tip: Pt = [TUSK_TIP[0] + u[0] * 2.5, TUSK_TIP[1] + u[1] * 2.5];
  const back: Pt = [TUSK_BASE[0] - u[0] * 6, TUSK_BASE[1] - u[1] * 6];
  return smooth([back, ...top.slice(0, 4), tip, ...bottom.slice(1)], true, 0.6);
};

const tuskGrooves = (): Shape[] => {
  const { len, u, n } = tuskFrame();
  const out: Shape[] = [];
  for (let t = 0.08; t < 0.96; t += 0.085) {
    const r = TUSK_R0 + (TUSK_R1 - TUSK_R0) * t + 3;
    const c: Pt = [TUSK_BASE[0] + u[0] * len * t, TUSK_BASE[1] + u[1] * len * t];
    const slant = 6 + 4 * (1 - t);
    const w = 1.3 + 1.2 * (1 - t);
    const a: Pt = [c[0] + n[0] * r - u[0] * slant, c[1] + n[1] * r - u[1] * slant];
    const b: Pt = [c[0] - n[0] * r + u[0] * slant, c[1] - n[1] * r + u[1] * slant];
    out.push({
      d: poly([
        [a[0] - u[0] * w, a[1] - u[1] * w],
        [a[0] + u[0] * w, a[1] + u[1] * w],
        [b[0] + u[0] * w, b[1] + u[1] * w],
        [b[0] - u[0] * w, b[1] - u[1] * w],
      ]),
      kind: 'detail',
      fill: 'tuskLine',
    });
  }
  return out;
};

const SPOTS: [number, number, number, number, number][] = [
  [116, 100, 7, 4.5, -20],
  [146, 86, 6.5, 4.2, -10],
  [178, 78, 7, 4.5, 0],
  [210, 76, 5.5, 3.8, 10],
  [240, 80, 6.5, 4.2, 14],
  [160, 104, 5.5, 3.6, 0],
  [194, 98, 6.5, 4.2, -6],
  [226, 100, 5, 3.4, 10],
  [130, 124, 4.5, 3.2, -20],
  [94, 118, 4.5, 3.2, -30],
  [178, 126, 4.2, 3, 0],
  [212, 124, 3.8, 2.8, 10],
  [146, 144, 3.4, 2.5, -10],
];

const narwhal: AnimalDef = {
  id: 'narwhal',
  name: 'Narwhal',
  kind: 'animal',
  aliases: ['unicorn whale', 'sea unicorn', 'narwhale', 'unicorn of the sea'],
  group: 'sea',
  habitats: ['polar'],
  box: [460, 220],
  size: 220,
  locomotion: 'swim',
  gait: { period: 1.3 },
  sound: 'narwhal',
  palette: {
    skin: '#90a5c0',
    skinDark: '#7a8fac',
    spot: '#647a99',
    belly: '#e4ebf4',
    tusk: '#fbf4e2',
    tuskLine: '#d2bf95',
  },
  parts: [
    {
      id: 'body',
      role: 'body',
      pivot: [200, 130],
      shapes: [
        {
          d: smooth([
            [308, 130],
            [302, 98],
            [280, 76],
            [240, 64],
            [188, 64],
            [138, 76],
            [98, 96],
            [70, 116],
            [58, 130],
            [72, 146],
            [110, 168],
            [160, 186],
            [214, 192],
            [266, 182],
            [298, 160],
          ]),
          fill: 'skin',
        },
        {
          d:
            smooth(
              [
                [322, 134],
                [300, 150],
                [264, 164],
                [214, 170],
                [162, 164],
                [116, 150],
                [76, 136],
              ],
              false,
            ) + 'L76 200L320 200Z',
          kind: 'detail',
          fill: 'belly',
        },
        ...SPOTS.map(([x, y, rx, ry, rot]): Shape => ({
          d: ellipse(x, y, rx, ry, rot),
          kind: 'detail',
          fill: 'spot',
        })),
        { d: curve(302, 144, 280, 150, -4), kind: 'line', stroke: 'mouth', width: 2.8 },
        { d: ellipse(268, 140, 11, 6.5), kind: 'feature', fill: 'blush', opacity: 0.55 },
        { d: circle(262, 114, 11), kind: 'feature', fill: 'eye' },
        { d: circle(266.2, 109.6, 4.2), kind: 'feature', fill: 'shine' },
      ],
      children: [
        {
          id: 'tusk',
          behind: true,
          shapes: [{ d: tuskOutline(), fill: 'tusk' }, ...tuskGrooves()],
        },
        {
          id: 'tail',
          role: 'tail',
          behind: true,
          pivot: [70, 130],
          shapes: [
            {
              d: smooth([
                [82, 122],
                [56, 118],
                [34, 104],
                [18, 82],
                [6, 78],
                [4, 92],
                [14, 112],
                [30, 128],
                [14, 146],
                [4, 168],
                [8, 180],
                [22, 174],
                [38, 152],
                [58, 140],
                [84, 140],
              ]),
              fill: 'skin',
            },
          ],
        },
        {
          id: 'flipperFar',
          role: 'finF',
          behind: true,
          pivot: [250, 176],
          shapes: [
            {
              d: smooth([
                [240, 172],
                [262, 176],
                [258, 192],
                [242, 205],
                [226, 209],
                [224, 199],
                [232, 186],
              ]),
              fill: 'skinDark',
            },
          ],
        },
        {
          id: 'flipper',
          role: 'finN',
          pivot: [222, 180],
          shapes: [
            {
              d: smooth([
                [208, 176],
                [234, 180],
                [228, 194],
                [212, 206],
                [192, 213],
                [182, 209],
                [188, 197],
                [198, 186],
              ]),
              fill: 'skin',
            },
          ],
        },
      ],
    },
  ],
};

export default narwhal;
