import { circle, ellipse } from '../core/paths';
import type { AnimalDef } from '../core/types';

const fish: AnimalDef = {
  id: 'fish',
  name: 'Clownfish',
  aliases: ['fish', 'nemo', 'clown fish'],
  group: 'fish',
  habitats: ['ocean'],
  box: [300, 200],
  size: 90,
  locomotion: 'swim',
  sound: 'fish',
  palette: {
    body: '#ff8a2a',
    band: '#ffffff',
    edge: '#3a2433',
  },
  parts: [
    {
      id: 'body',
      role: 'body',
      pivot: [150, 100],
      shapes: [
        { d: ellipse(152, 100, 96, 64), fill: 'body' },
        { d: ellipse(198, 100, 16, 72), kind: 'detail', fill: 'edge' },
        { d: ellipse(198, 100, 11, 72), kind: 'detail', fill: 'band' },
        { d: ellipse(140, 100, 15, 72), kind: 'detail', fill: 'edge' },
        { d: ellipse(140, 100, 10, 72), kind: 'detail', fill: 'band' },
        { d: ellipse(88, 100, 11, 64), kind: 'detail', fill: 'edge' },
        { d: ellipse(88, 100, 7, 64), kind: 'detail', fill: 'band' },
        { d: ellipse(222, 113, 9, 5), kind: 'feature', fill: 'blush', opacity: 0.55 },
        { d: circle(222, 88, 11), kind: 'feature', fill: 'eye' },
        { d: circle(225.8, 83.6, 4), kind: 'feature', fill: 'shine' },
        { d: 'M234 112Q241 117 247 109', kind: 'line', stroke: 'mouth', width: 3 },
      ],
      children: [
        {
          id: 'tail',
          role: 'tail',
          behind: true,
          pivot: [66, 100],
          shapes: [
            {
              d: 'M70 100C48 72 26 50 13 60C2 71 18 94 27 100C18 106 2 129 13 140C26 150 48 128 70 100Z',
              fill: 'body',
            },
            { d: ellipse(14, 100, 13, 46), kind: 'detail', fill: 'edge' },
          ],
        },
        {
          id: 'finTop',
          role: 'finTop',
          behind: true,
          pivot: [150, 46],
          shapes: [
            { d: 'M92 58C100 6 176 -2 212 52Z', fill: 'body' },
            { d: ellipse(154, 8, 64, 13), kind: 'detail', fill: 'edge' },
          ],
        },
        {
          id: 'finBottom',
          role: 'finF',
          behind: true,
          pivot: [142, 156],
          shapes: [
            { d: 'M106 146C114 196 166 200 182 152Z', fill: 'body' },
            { d: ellipse(146, 194, 38, 10), kind: 'detail', fill: 'edge' },
          ],
        },
        {
          id: 'finSide',
          role: 'finN',
          pivot: [176, 120],
          shapes: [
            { d: ellipse(162, 128, 23, 13, 24), fill: 'body' },
            { d: ellipse(144, 120, 9, 14, 24), kind: 'detail', fill: 'edge' },
          ],
        },
      ],
    },
  ],
};

export default fish;
