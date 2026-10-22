import {
  capsule,
  circle,
  curve,
  ellipse,
  leaf,
  rotatePath,
  smooth,
  translatePath,
  tube,
  type Pt,
} from '../core/paths';
import type { AnimalDef, PartNode, Shape } from '../core/types';

const SHOULDER: Pt = [168, 128];

const place = (d: string, tilt: number): string =>
  rotatePath(translatePath(d, SHOULDER[0], SHOULDER[1]), tilt, SHOULDER[0], SHOULDER[1]);

const FINGERS: [number, number, number, number][] = [
  [-26, -40, -48, -70],
  [-20, -56, -38, -96],
  [-12, -68, -24, -114],
  [-2, -76, -8, -124],
];

const COVERTS =
  'M-56 30L-56 -34A10 10 0 0 1 -38 -42A10 10 0 0 1 -20 -48A10 10 0 0 1 -2 -50A10 10 0 0 1 16 -48A10 10 0 0 1 34 -42L34 30Z';

const wing = (id: string, role: string, tilt: number, far: boolean): PartNode => {
  const k = (name: string) => (far ? `${name}Far` : name);
  const raw: Shape[] = [
    {
      d: smooth([
        [16, 8],
        [24, -18],
        [24, -50],
        [16, -84],
        [4, -106],
        [-10, -110],
        [-26, -92],
        [-38, -64],
        [-42, -36],
        [-34, -10],
        [-16, 8],
      ]),
      fill: k('wing'),
    },
    ...FINGERS.map(([x1, y1, x2, y2]) => ({
      d: capsule(x1, y1, x2, y2, 10, 7.5),
      fill: k('wing'),
    })),
    { d: COVERTS, kind: 'detail', fill: k('wingLight') },
    { d: curve(-36, -74, -24, -60, 3), kind: 'line', stroke: k('wingLine'), width: 2.2 },
    { d: curve(-24, -92, -14, -72, 3), kind: 'line', stroke: k('wingLine'), width: 2.2 },
    { d: curve(-10, -104, -4, -80, 3), kind: 'line', stroke: k('wingLine'), width: 2.2 },
  ];
  return {
    id,
    role,
    pivot: SHOULDER,
    behind: far,
    shapes: raw.map((s) => ({ ...s, d: place(s.d, tilt) })),
  };
};

const offset = (parts: PartNode[], dx: number, dy: number): PartNode[] =>
  parts.map((p): PartNode => ({
    ...p,
    pivot: p.pivot && [p.pivot[0] + dx, p.pivot[1] + dy],
    shapes: p.shapes?.map((s) => ({ ...s, d: translatePath(s.d, dx, dy) })),
    children: p.children && offset(p.children, dx, dy),
  }));

const STEM: Pt[] = [
  [252, 112],
  [266, 116],
  [280, 124],
  [292, 136],
];

const dove: AnimalDef = {
  id: 'dove',
  name: 'Dove',
  kind: 'animal',
  aliases: ['bird', 'peace', 'olive branch', 'white dove'],
  group: 'bird',
  habitats: ['bible', 'birds'],
  box: [298, 218],
  size: 70,
  locomotion: 'fly',
  gait: { swing: 26 },
  sound: 'dove',
  palette: {
    body: '#fdfbf7',
    belly: '#f1eef2',
    wing: '#f6f6fb',
    wingFar: '#dcdfec',
    wingLight: '#ffffff',
    wingLightFar: '#e6e8f2',
    wingLine: '#b8bdd3',
    wingLineFar: '#aab0c8',
    tail: '#ebedf5',
    beak: '#f7a274',
    feet: '#f29a9a',
    stem: '#8a7a4c',
    leaf: '#8cba5c',
    leafDark: '#6e9c46',
    olive: '#7d9b3c',
    oliveShine: '#c4dc7c',
  },
  parts: offset(
    [
      {
        id: 'body',
        role: 'body',
        pivot: [170, 150],
        shapes: [
          {
            d: smooth([
              [220, 70],
              [242, 74],
              [256, 92],
              [255, 112],
              [248, 132],
              [244, 156],
              [228, 180],
              [198, 196],
              [160, 196],
              [124, 184],
              [96, 168],
              [98, 152],
              [126, 142],
              [160, 132],
              [186, 112],
              [200, 86],
            ]),
            fill: 'body',
          },
          { d: ellipse(200, 186, 46, 22, -12), kind: 'detail', fill: 'belly' },
          { d: ellipse(234, 116, 8, 5), kind: 'feature', fill: 'blush', opacity: 0.55 },
          { d: circle(230, 96, 8.2), kind: 'feature', fill: 'eye' },
          { d: circle(233.1, 92.6, 3.1), kind: 'feature', fill: 'shine' },
        ],
        children: [
          wing('wingF', 'wingF', 4, true),
          {
            id: 'tail',
            role: 'tail',
            behind: true,
            pivot: [96, 160],
            shapes: [
              { d: capsule(108, 160, 40, 138, 9, 13), fill: 'tail' },
              { d: capsule(108, 164, 36, 160, 9, 13), fill: 'tail' },
              { d: capsule(108, 168, 42, 182, 9, 13), fill: 'tail' },
              { d: curve(56, 146, 92, 156, 2), kind: 'line', stroke: 'wingLine', width: 2.2 },
              { d: curve(54, 168, 92, 166, -2), kind: 'line', stroke: 'wingLine', width: 2.2 },
            ],
          },
          {
            id: 'feet',
            behind: true,
            pivot: [176, 192],
            shapes: [
              { d: capsule(168, 190, 156, 204, 4.5, 3.6), fill: 'feet' },
              { d: capsule(182, 190, 172, 206, 4.5, 3.6), fill: 'feet' },
            ],
          },
          {
            id: 'branch',
            pivot: [256, 108],
            motion: { rotate: 4, phase: 0.2 },
            shapes: [
              { d: tube(STEM, 2.6, 40), fill: 'stem' },
              { d: leaf(260, 114, 28, 6.5, 74), fill: 'leafDark' },
              { d: leaf(268, 117, 30, 7, -24), fill: 'leaf' },
              { d: leaf(278, 123, 28, 6.5, 104), fill: 'leafDark' },
              { d: leaf(286, 129, 30, 7, 4), fill: 'leaf' },
              { d: leaf(292, 136, 26, 6.5, 66), fill: 'leaf' },
              { d: ellipse(271, 141, 5.5, 7, -18), kind: 'feature', fill: 'olive', stroke: 'auto' },
              { d: circle(269.6, 138.4, 1.8), kind: 'feature', fill: 'oliveShine' },
            ],
          },
          {
            id: 'beak',
            pivot: [252, 104],
            shapes: [{ d: 'M250 96Q264 98 270 106Q262 113 250 113Z', fill: 'beak' }],
          },
          wing('wingN', 'wingN', -34, false),
        ],
      },
    ],
    -22,
    6,
  ),
};

export default dove;
