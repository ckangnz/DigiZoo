import { circle, ellipse, leaf, smooth, translatePath, tube, type Pt } from '../core/paths';
import type { AnimalDef, PartNode, Shape } from '../core/types';

const SHOULDER: Pt = [158, 128];

const wing = (id: string, angle: number, far: boolean, phase: number): PartNode => {
  const k = (name: string) => (far ? `${name}Far` : name);
  const a = (angle * Math.PI) / 180;
  const along = (d: number): Pt => [SHOULDER[0] + Math.cos(a) * d, SHOULDER[1] + Math.sin(a) * d];
  const [mx, my] = along(52);
  const shapes: Shape[] = [
    { d: leaf(SHOULDER[0], SHOULDER[1], 112, 22, angle), fill: k('wing') },
    { d: ellipse(mx, my, 34, 9, angle), kind: 'detail', fill: k('wingLight') },
  ];
  return {
    id,
    role: id,
    behind: far,
    pivot: SHOULDER,
    phase,
    motion: { rotate: 34, freq: 2, phase },
    shapes,
  };
};

const TAIL_BASE: Pt = [132, 178];

const feather = (angle: number, length: number, width: number): Shape[] => {
  const a = (angle * Math.PI) / 180;
  const tip: Pt = [
    TAIL_BASE[0] + Math.cos(a) * length * 0.86,
    TAIL_BASE[1] + Math.sin(a) * length * 0.86,
  ];
  return [
    { d: leaf(TAIL_BASE[0], TAIL_BASE[1], length, width, angle), fill: 'tail' },
    { d: circle(tip[0], tip[1], width * 0.55), kind: 'detail', fill: 'tailTip' },
  ];
};

const offset = (parts: PartNode[], dx: number, dy: number): PartNode[] =>
  parts.map((p): PartNode => ({
    ...p,
    pivot: p.pivot && [p.pivot[0] + dx, p.pivot[1] + dy],
    shapes: p.shapes?.map((sh) => ({ ...sh, d: translatePath(sh.d, dx, dy) })),
    children: p.children && offset(p.children, dx, dy),
  }));

const hummingbird: AnimalDef = {
  id: 'hummingbird',
  name: 'Hummingbird',
  kind: 'animal',
  aliases: ['humming bird', 'ruby-throated hummingbird', 'tiny bird', 'bird'],
  group: 'bird',
  habitats: ['rainforest'],
  box: [266, 250],
  size: 70,
  locomotion: 'fly',
  gait: { period: 0.5, stride: 64 },
  sound: 'hummingbird',
  palette: {
    green: '#3cc489',
    greenDark: '#2a9e70',
    greenLight: '#8ae8b9',
    belly: '#f3f7f0',
    throat: '#ef3e5c',
    throatLight: '#ff7f95',
    tail: '#2d7f62',
    tailTip: '#f3f7f0',
    beak: '#3b3340',
    cheek: '#ff9cc0',
    wing: '#9fd6cc',
    wingLight: '#d6f3ee',
    wingFar: '#7fbcb2',
    wingLightFar: '#b2ded6',
  },
  parts: offset(
    [
      {
        id: 'body',
        role: 'body',
        pivot: [176, 130],
        shapes: [
          {
            d: smooth([
              [196, 48],
              [226, 52],
              [244, 74],
              [244, 100],
              [232, 126],
              [214, 150],
              [188, 172],
              [158, 186],
              [134, 188],
              [124, 174],
              [130, 150],
              [146, 122],
              [160, 92],
              [170, 64],
            ]),
            fill: 'green',
          },
          {
            d: smooth([
              [244, 104],
              [236, 128],
              [216, 148],
              [196, 152],
              [204, 128],
              [222, 108],
            ]),
            kind: 'detail',
            fill: 'throat',
          },
          { d: ellipse(226, 120, 6.5, 3.8, -40), kind: 'detail', fill: 'throatLight' },
          { d: ellipse(184, 166, 36, 22, -42), kind: 'detail', fill: 'belly' },
          { d: ellipse(198, 60, 20, 9, -8), kind: 'detail', fill: 'greenLight' },
          { d: ellipse(142, 148, 12, 34, 34), kind: 'detail', fill: 'greenDark' },
          { d: circle(196, 92, 4.2), kind: 'feature', fill: 'white' },
          { d: ellipse(226, 98, 7.5, 4.8, -10), kind: 'feature', fill: 'cheek', opacity: 0.9 },
          { d: circle(214, 80, 9.4), kind: 'feature', fill: 'eye' },
          { d: circle(217.6, 76.4, 3.6), kind: 'feature', fill: 'shine' },
        ],
        children: [
          {
            id: 'beak',
            behind: true,
            pivot: [236, 86],
            shapes: [
              {
                d: tube(
                  [
                    [232, 87],
                    [264, 81],
                    [296, 76],
                  ],
                  (t) => 4.4 - 2.6 * t,
                ),
                fill: 'beak',
              },
            ],
          },
          wing('wingF', -100, true, 0.04),
          {
            id: 'tail',
            role: 'tail',
            behind: true,
            pivot: TAIL_BASE,
            shapes: [...feather(152, 52, 13), ...feather(104, 50, 13), ...feather(128, 58, 14)],
          },
          wing('wingN', -132, false, 0),
        ],
      },
    ],
    -32,
    0,
  ),
};

export default hummingbird;
