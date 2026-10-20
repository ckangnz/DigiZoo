import { capsule, circle, curve, ellipse } from '../core/paths';
import type { AnimalDef, PartNode } from '../core/types';

const LIGHTS: [number, number, string, number][] = [
  [40, 131, 'lightA', 0],
  [92, 139, 'lightB', 0.125],
  [150, 142, 'lightC', 0],
  [208, 139, 'lightB', 0.125],
  [260, 131, 'lightA', 0],
];

const light = ([x, y, fill, phase]: [number, number, string, number], i: number): PartNode => ({
  id: `light${i + 1}`,
  role: 'sparkle',
  phase,
  pivot: [x, y],
  shapes: [
    { d: circle(x, y, 7.5), fill },
    { d: circle(x - 2.2, y - 2.4, 2.4), kind: 'feature', fill: 'white', opacity: 0.85 },
  ],
});

const ufo: AnimalDef = {
  id: 'ufo',
  name: 'UFO',
  kind: 'object',
  aliases: ['flying saucer', 'alien', 'spaceship', 'space ship', 'martian', 'space alien'],
  group: 'space',
  habitats: ['space'],
  box: [300, 190],
  size: 180,
  locomotion: 'float',
  gait: { period: 2, stride: 60 },
  sound: 'ufo',
  palette: {
    silver: '#c4cad9',
    silverLight: '#e6e9f2',
    band: '#9ea7bc',
    under: '#a9b1c4',
    glass: '#c2f0ff',
    alien: '#86d95b',
    alienLight: '#b9ef90',
    lightA: '#ffd84a',
    lightB: '#ff8fc6',
    lightC: '#7fe8ff',
    blush: '#ff6fb0',
  },
  parts: [
    {
      id: 'saucer',
      role: 'body',
      pivot: [150, 128],
      shapes: [
        { d: ellipse(150, 128, 140, 34), fill: 'silver' },
        { d: ellipse(150, 108, 112, 16), kind: 'detail', fill: 'silverLight' },
        { d: 'M0 128Q150 152 300 128L300 140Q150 166 0 140Z', kind: 'detail', fill: 'band' },
      ],
      children: [
        {
          id: 'under',
          behind: true,
          shapes: [
            { d: ellipse(150, 158, 82, 24), fill: 'under' },
            { d: ellipse(150, 178, 22, 8), fill: 'lightC' },
          ],
        },
        {
          id: 'dome',
          behind: true,
          pivot: [150, 100],
          shapes: [
            { d: ellipse(150, 94, 62, 74), fill: 'glass' },
            { d: capsule(140, 54, 128, 36, 2.6, 2.2), kind: 'detail', fill: 'alien' },
            { d: capsule(160, 54, 172, 36, 2.6, 2.2), kind: 'detail', fill: 'alien' },
            { d: circle(127, 34, 5.5), kind: 'detail', fill: 'alienLight' },
            { d: circle(173, 34, 5.5), kind: 'detail', fill: 'alienLight' },
            { d: ellipse(150, 112, 31, 24), kind: 'detail', fill: 'alien' },
            { d: ellipse(150, 75, 30, 26), kind: 'detail', fill: 'alien' },
            { d: ellipse(150, 87, 12, 6.5), kind: 'detail', fill: 'alienLight' },
            { d: ellipse(132, 84, 5.5, 3.4), kind: 'feature', fill: 'blush', opacity: 0.75 },
            { d: ellipse(168, 84, 5.5, 3.4), kind: 'feature', fill: 'blush', opacity: 0.75 },
            { d: curve(144, 85, 156, 85, 4.5), kind: 'line', stroke: 'mouth', width: 2.6 },
            {
              d: 'M104 88Q104 50 132 32',
              kind: 'line',
              stroke: 'white',
              width: 5,
              opacity: 0.8,
            },
          ],
          children: [
            {
              id: 'eyes',
              role: 'lid',
              pivot: [150, 73],
              shapes: [
                { d: ellipse(139, 73, 7, 8.4), kind: 'feature', fill: 'eye' },
                { d: ellipse(161, 73, 7, 8.4), kind: 'feature', fill: 'eye' },
                { d: circle(141.4, 69.6, 2.7), kind: 'feature', fill: 'shine' },
                { d: circle(163.4, 69.6, 2.7), kind: 'feature', fill: 'shine' },
              ],
            },
          ],
        },
        ...LIGHTS.map(light),
      ],
    },
  ],
};

export default ufo;
