import { circle, curve, ellipse } from '../core/paths';
import type { AnimalDef } from '../core/types';

const C = 100;

const redBloodCell: AnimalDef = {
  id: 'red-blood-cell',
  name: 'Red Blood Cell',
  kind: 'object',
  aliases: ['blood cell', 'blood', 'rbc', 'red cell', 'cell'],
  group: 'body',
  habitats: ['body'],
  box: [200, 200],
  size: 100,
  locomotion: 'roll',
  sound: 'red-blood-cell',
  palette: {
    cell: '#e8424e',
    dimple: '#d63646',
    shadow: '#bd2c3b',
    glow: '#f66d78',
    rim: '#ff8c96',
    blush: '#ffb6c2',
  },
  parts: [
    {
      id: 'cell',
      pivot: [C, C],
      shapes: [
        { d: circle(C, C, 92), fill: 'cell' },
        { d: circle(C, C, 58), kind: 'detail', fill: 'shadow' },
        { d: circle(C + 4, C + 5, 54), kind: 'detail', fill: 'glow' },
        { d: circle(C + 1, C + 1, 50), kind: 'detail', fill: 'dimple' },
        { d: ellipse(C - 38, C - 52, 24, 10, -38), kind: 'detail', fill: 'rim' },
        { d: circle(C + 58, C - 46, 6), kind: 'detail', fill: 'rim' },
        { d: ellipse(C - 36, C + 16, 10, 6.5), kind: 'feature', fill: 'blush', opacity: 0.6 },
        { d: ellipse(C + 36, C + 16, 10, 6.5), kind: 'feature', fill: 'blush', opacity: 0.6 },
        { d: circle(C - 20, C - 2, 11.5), kind: 'feature', fill: 'eye' },
        { d: circle(C + 20, C - 2, 11.5), kind: 'feature', fill: 'eye' },
        { d: circle(C - 15.8, C - 6.6, 4.4), kind: 'feature', fill: 'shine' },
        { d: circle(C + 24.2, C - 6.6, 4.4), kind: 'feature', fill: 'shine' },
        { d: curve(C - 9, C + 18, C + 9, C + 18, 6), kind: 'line', stroke: 'mouth', width: 3.2 },
      ],
    },
  ],
};

export default redBloodCell;
