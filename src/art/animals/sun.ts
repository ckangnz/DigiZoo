import { capsule, circle, curve, ellipse } from '../core/paths';
import type { AnimalDef, Shape } from '../core/types';

const CX = 160;
const CY = 160;
const R = 104;
const RAYS = 12;

const ray = (i: number): Shape => {
  const long = i % 2 === 0;
  const a = (i / RAYS) * Math.PI * 2 - Math.PI / 2;
  const r0 = R - 14;
  const r1 = long ? 146 : 130;
  return {
    d: capsule(
      CX + r0 * Math.cos(a),
      CY + r0 * Math.sin(a),
      CX + r1 * Math.cos(a),
      CY + r1 * Math.sin(a),
      long ? 21 : 18,
      long ? 10.5 : 9,
    ),
    fill: long ? 'ray' : 'rayLight',
  };
};

const sun: AnimalDef = {
  id: 'sun',
  name: 'Sun',
  kind: 'object',
  aliases: ['sunshine', 'sunny', 'star', 'sol', 'mr sun'],
  group: 'space',
  habitats: ['space'],
  box: [320, 320],
  size: 360,
  locomotion: 'float',
  gait: { period: 4 },
  sound: 'sun',
  palette: {
    sun: '#ffd23c',
    glow: '#ffe57e',
    ray: '#ffa834',
    rayLight: '#ffc23a',
    blush: '#ff8a5c',
  },
  parts: [
    {
      id: 'sun',
      role: 'body',
      pivot: [CX, CY],
      shapes: [
        { d: circle(CX, CY, R), fill: 'sun' },
        { d: circle(CX - 8, CY - 10, R * 0.8), kind: 'detail', fill: 'glow' },
        { d: ellipse(CX - 66, CY + 40, 19, 11), kind: 'feature', fill: 'blush', opacity: 0.55 },
        { d: ellipse(CX + 66, CY + 40, 19, 11), kind: 'feature', fill: 'blush', opacity: 0.55 },
        {
          d: curve(CX - 18, CY + 32, CX + 18, CY + 32, 11),
          kind: 'line',
          stroke: 'mouth',
          width: 3.8,
        },
      ],
      children: [
        {
          id: 'rays',
          role: 'spinner',
          behind: true,
          pivot: [CX, CY],
          shapes: Array.from({ length: RAYS }, (_, i) => ray(i)),
        },
        {
          id: 'eyes',
          role: 'lid',
          pivot: [CX, CY + 8],
          shapes: [
            { d: circle(CX - 40, CY + 8, 18), kind: 'feature', fill: 'eye' },
            { d: circle(CX + 40, CY + 8, 18), kind: 'feature', fill: 'eye' },
            { d: circle(CX - 33.2, CY + 1.2, 6.8), kind: 'feature', fill: 'shine' },
            { d: circle(CX + 46.8, CY + 1.2, 6.8), kind: 'feature', fill: 'shine' },
          ],
        },
      ],
    },
  ],
};

export default sun;
