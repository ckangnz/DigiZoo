import { circle, curve, ellipse, rotatePath, translatePath } from '../core/paths';
import type { AnimalDef, Shape } from '../core/types';

const CX = 167;
const CY = 108;
const TILT = -14;

const place = (d: string) => translatePath(rotatePath(d, TILT), CX, CY);
const at = (shapes: Shape[]) => shapes.map((s) => ({ ...s, d: place(s.d) }));

const SHAFT =
  'M-104 -33C-60 -27 -30 -26 0 -26C30 -26 60 -27 104 -33L104 33C60 27 30 26 0 26C-30 26 -60 27 -104 33Z';

const KNOBS: [number, number][] = [
  [-114, -30],
  [-114, 30],
  [114, -30],
  [114, 30],
];

const bone: AnimalDef = {
  id: 'bone',
  name: 'Bone',
  kind: 'object',
  aliases: ['bones', 'skeleton bone', 'femur', 'doggy bone'],
  group: 'body',
  habitats: ['body'],
  box: [334, 216],
  size: 160,
  locomotion: 'wobble',
  sound: 'bone',
  palette: {
    bone: '#fbf0d8',
    shade: '#efdcb6',
    light: '#fffbf2',
  },
  parts: [
    {
      id: 'bone',
      pivot: [CX, CY],
      shapes: at([
        { d: SHAFT, fill: 'bone' },
        ...KNOBS.map(([x, y]): Shape => ({ d: circle(x, y, 35), fill: 'bone' })),
        { d: ellipse(0, 40, 160, 20), kind: 'detail', fill: 'shade' },
        { d: circle(-122, 52, 22), kind: 'detail', fill: 'shade' },
        { d: circle(122, 52, 22), kind: 'detail', fill: 'shade' },
        { d: ellipse(-120, -44, 14, 8, -30), kind: 'detail', fill: 'light' },
        { d: ellipse(108, -48, 12, 7, -20), kind: 'detail', fill: 'light' },
        { d: ellipse(-46, 12, 12, 7.5), kind: 'feature', fill: 'blush', opacity: 0.55 },
        { d: ellipse(46, 12, 12, 7.5), kind: 'feature', fill: 'blush', opacity: 0.55 },
        { d: circle(-25, -6, 12.5), kind: 'feature', fill: 'eye' },
        { d: circle(25, -6, 12.5), kind: 'feature', fill: 'eye' },
        { d: circle(-20.5, -11, 4.7), kind: 'feature', fill: 'shine' },
        { d: circle(29.5, -11, 4.7), kind: 'feature', fill: 'shine' },
        { d: curve(-10, 13, 10, 13, 6.5), kind: 'line', stroke: 'mouth', width: 3.3 },
      ]),
    },
  ],
};

export default bone;
