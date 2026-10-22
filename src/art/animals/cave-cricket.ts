import { capsule, circle, ellipse, smooth, tube, type Pt } from '../core/paths';
import type { AnimalDef, PartNode, Shape } from '../core/types';

const GROUND = 200;

const thinLeg = (id: string, pts: Pt[], far: boolean, phase: number): PartNode => {
  const fill = far ? 'shellDark' : 'shell';
  const foot = pts[pts.length - 1];
  return {
    id,
    role: id,
    behind: true,
    phase,
    pivot: pts[0],
    shapes: [
      { d: tube(pts, (t) => 5.2 - 1.8 * t, 30), fill },
      { d: ellipse(foot[0] + 3, foot[1] - 1, 6.5, 3.6), fill },
    ],
  };
};

const hindLeg = (id: string, far: boolean): PartNode => {
  const fill = far ? 'shellDark' : 'shell';
  const [ox, oy] = far ? [16, -8] : [0, 0];
  const p = ([x, y]: Pt): Pt => [x + ox, y + oy];
  const hip = p([158, 128]);
  const knee = p([80, 70]);
  const foot: Pt = [knee[0] - (far ? 34 : 44), GROUND - 5];
  const spines = (far ? [] : [0.28, 0.52, 0.76]).map((t): Shape => {
    const x = knee[0] + (foot[0] - knee[0]) * t;
    const y = knee[1] + (foot[1] - knee[1]) * t;
    return { d: capsule(x - 2, y, x - 9, y - 3, 2.2, 1.1), fill };
  });
  const femur = tube(
    [hip, [(hip[0] + knee[0]) / 2, (hip[1] + knee[1]) / 2 + 3], knee],
    (t) => 5 + 10 * (1 - t) ** 0.8,
    30,
  );
  const chevrons = [0.3, 0.48, 0.66].map((t): Shape => {
    const x = hip[0] + (knee[0] - hip[0]) * t;
    const y = hip[1] + (knee[1] - hip[1]) * t;
    return {
      d: `M${x - 6} ${y - 8}L${x + 2} ${y + 1}L${x - 1} ${y + 11}`,
      kind: 'line',
      stroke: 'band',
      width: 2.2,
    };
  });
  return {
    id,
    role: id,
    behind: far,
    pivot: hip,
    motion: { rotate: 2, freq: 2, phase: far ? 0.5 : 0 },
    shapes: [
      ...spines,
      { d: capsule(knee[0], knee[1], foot[0], foot[1], 4.6, 3.2), fill },
      { d: ellipse(foot[0] - 5, foot[1] + 1, 8, 3.8), fill },
      { d: femur, fill },
      { d: circle(knee[0], knee[1], 6), fill },
      ...(far
        ? []
        : [
            {
              d: ellipse(hip[0] - 30, hip[1] - 30, 22, 4, 39),
              kind: 'detail' as const,
              fill: 'shellLight',
            },
            ...chevrons,
          ]),
    ],
  };
};

const antenna = (id: string, far: boolean): PartNode => {
  const base: Pt = far ? [250, 98] : [240, 96];
  const pts: Pt[] = far
    ? [base, [244, 56], [218, 26], [176, 12], [132, 14], [100, 26]]
    : [base, [228, 52], [196, 24], [150, 14], [110, 22], [82, 40]];
  return {
    id,
    role: id,
    behind: far,
    pivot: base,
    motion: { rotate: far ? 2.5 : 3, freq: 2, phase: far ? 0.15 : 0 },
    shapes: [
      {
        d: smooth(pts, false),
        kind: 'line',
        stroke: far ? 'antennaFar' : 'antenna',
        width: far ? 2.6 : 3.2,
      },
    ],
  };
};

const BODY: Pt[] = [
  [218, 100],
  [204, 74],
  [180, 60],
  [150, 62],
  [120, 74],
  [94, 90],
  [74, 106],
  [62, 120],
  [68, 132],
  [92, 140],
  [128, 144],
  [170, 142],
  [204, 134],
  [222, 118],
];

const caveCricket: AnimalDef = {
  id: 'cave-cricket',
  name: 'Cave Cricket',
  kind: 'animal',
  aliases: ['cricket', 'camel cricket', 'spider cricket', 'cave weta'],
  group: 'bug',
  habitats: ['cave', 'bugs'],
  box: [290, GROUND],
  size: 60,
  locomotion: 'crawl',
  gait: { swing: 10 },
  sound: 'cave-cricket',
  palette: {
    shell: '#dca36a',
    shellDark: '#c08752',
    shellLight: '#f0c48c',
    band: '#b77a45',
    belly: '#f2cf9d',
    antenna: '#9a6438',
    antennaFar: '#a87444',
    cheek: '#ff9a8c',
  },
  parts: [
    {
      id: 'body',
      role: 'body',
      pivot: [150, 140],
      shapes: [
        { d: smooth(BODY), fill: 'shell' },
        { d: capsule(68, 122, 44, 112, 4, 2.4), fill: 'shell' },
        { d: capsule(70, 128, 48, 132, 4, 2.4), fill: 'shell' },
        { d: ellipse(140, 150, 80, 14), kind: 'detail', fill: 'belly' },
        { d: ellipse(176, 68, 24, 5.5, -10), kind: 'detail', fill: 'shellLight' },
        { d: 'M180 61Q168 100 182 141', kind: 'line', stroke: 'band', width: 2.6 },
        { d: 'M142 66Q130 102 138 144', kind: 'line', stroke: 'band', width: 2.6 },
        { d: 'M112 80Q102 110 108 143', kind: 'line', stroke: 'band', width: 2.6 },
        { d: 'M88 95Q80 116 86 139', kind: 'line', stroke: 'band', width: 2.6 },
      ],
      children: [
        hindLeg('leg3F', true),
        thinLeg(
          'leg1F',
          [
            [222, 128],
            [242, 152],
            [254, GROUND - 4],
          ],
          true,
          0.5,
        ),
        thinLeg(
          'leg2F',
          [
            [196, 136],
            [194, 166],
            [184, GROUND - 4],
          ],
          true,
          0,
        ),
        thinLeg(
          'leg1N',
          [
            [214, 130],
            [230, 154],
            [236, GROUND - 4],
          ],
          false,
          0,
        ),
        thinLeg(
          'leg2N',
          [
            [184, 138],
            [178, 168],
            [164, GROUND - 4],
          ],
          false,
          0.5,
        ),
        antenna('antennaF', true),
        {
          id: 'head',
          role: 'head',
          pivot: [222, 112],
          shapes: [
            { d: circle(240, 120, 30), fill: 'shell' },
            { d: ellipse(234, 98, 13, 5, -14), kind: 'detail', fill: 'shellLight' },
            { d: ellipse(232, 134, 7.5, 4.8), kind: 'feature', fill: 'cheek', opacity: 0.6 },
            { d: ellipse(262, 132, 5.5, 4.2), kind: 'feature', fill: 'cheek', opacity: 0.6 },
            { d: circle(238, 117, 9), kind: 'feature', fill: 'eye' },
            { d: circle(241.4, 113.4, 3.4), kind: 'feature', fill: 'shine' },
            { d: circle(259, 116, 7.2), kind: 'feature', fill: 'eye' },
            { d: circle(261.6, 113.2, 2.7), kind: 'feature', fill: 'shine' },
            { d: 'M244 136Q250 141 257 135', kind: 'line', stroke: 'mouth', width: 2.6 },
          ],
          children: [antenna('antennaN', false)],
        },
        hindLeg('leg3N', false),
      ],
    },
  ],
};

export default caveCricket;
