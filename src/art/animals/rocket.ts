import { circle, ellipse, rotatePath, smooth, translatePath, type Pt } from '../core/paths';
import type { AnimalDef, PartNode, Shape } from '../core/types';

const TILT = 45;
const TX = 128;
const TY = 96;

const place = (d: string): string => translatePath(rotatePath(d, TILT, 0, 0), TX, TY);
const pt = ([x, y]: Pt): Pt => {
  const a = (TILT * Math.PI) / 180;
  return [TX + x * Math.cos(a) - y * Math.sin(a), TY + x * Math.sin(a) + y * Math.cos(a)];
};
const placed = (shapes: Shape[]): Shape[] => shapes.map((s) => ({ ...s, d: place(s.d) }));

const BODY: Pt[] = [
  [0, -122],
  [24, -102],
  [38, -72],
  [45, -32],
  [45, 8],
  [41, 44],
  [32, 68],
  [0, 74],
  [-32, 68],
  [-41, 44],
  [-45, 8],
  [-45, -32],
  [-38, -72],
  [-24, -102],
];

const FIN: Pt[] = [
  [-34, 12],
  [-58, 38],
  [-74, 72],
  [-76, 98],
  [-60, 94],
  [-40, 74],
];

const mirror = (pts: Pt[]): Pt[] => pts.map(([x, y]) => [-x, y]);

const WINDOW: Pt = [0, -20];
const [WX, WY] = pt(WINDOW);

const fin = (id: string, pts: Pt[]): PartNode => ({
  id,
  behind: true,
  shapes: placed([{ d: smooth(pts), fill: 'red' }]),
});

const rocket: AnimalDef = {
  id: 'rocket',
  name: 'Rocket',
  kind: 'object',
  aliases: ['rocket ship', 'spaceship', 'space ship', 'spacecraft', 'blast off'],
  group: 'space',
  habitats: ['space'],
  box: [224, 224],
  size: 260,
  locomotion: 'float',
  gait: { stride: 70 },
  sound: 'rocket',
  palette: {
    hull: '#f7f4f0',
    red: '#ef4d48',
    rim: '#b9c1d0',
    glass: '#a4dcff',
    metal: '#8d95a8',
    flame: '#ff7b39',
    flameMid: '#ffb73b',
    flameCore: '#fff2a8',
    kitty: '#ffb052',
    kittyLight: '#ffe2b8',
    blush: '#ff8f9c',
  },
  parts: [
    {
      id: 'body',
      role: 'body',
      pivot: pt([0, 0]),
      shapes: placed([
        { d: smooth(BODY), fill: 'hull' },
        { d: 'M-60 -82Q0 -50 60 -82L60 -140L-60 -140Z', kind: 'detail', fill: 'red' },
        { d: 'M-60 46Q0 72 60 46L60 120L-60 120Z', kind: 'detail', fill: 'red' },
      ]),
      children: [
        fin('finL', FIN),
        fin('finR', mirror(FIN)),
        {
          id: 'nozzle',
          behind: true,
          shapes: placed([
            { d: 'M-20 60L20 60L28 90Q28 95 23 95L-23 95Q-28 95 -28 90Z', fill: 'metal' },
          ]),
          children: [
            {
              id: 'flame',
              role: 'flame',
              behind: true,
              phase: 0.06,
              pivot: pt([0, 92]),
              shapes: placed([
                {
                  d: smooth([
                    [-22, 86],
                    [-26, 108],
                    [-16, 136],
                    [0, 170],
                    [16, 136],
                    [26, 108],
                    [22, 86],
                  ]),
                  fill: 'flame',
                },
                {
                  d: smooth([
                    [-14, 88],
                    [-16, 108],
                    [-9, 128],
                    [0, 150],
                    [9, 128],
                    [16, 108],
                    [14, 88],
                  ]),
                  kind: 'detail',
                  fill: 'flameMid',
                },
                {
                  d: smooth([
                    [-7, 88],
                    [-8, 104],
                    [-4, 117],
                    [0, 128],
                    [4, 117],
                    [8, 104],
                    [7, 88],
                  ]),
                  kind: 'detail',
                  fill: 'flameCore',
                },
              ]),
            },
          ],
        },
        {
          id: 'window',
          shapes: [{ d: circle(WX, WY, 33), fill: 'rim' }],
          children: [
            {
              id: 'glass',
              shapes: [
                { d: circle(WX, WY, 25), fill: 'glass' },
                { d: ellipse(WX, WY + 30, 21, 11), kind: 'detail', fill: 'kitty' },
                {
                  d: smooth([
                    [WX - 15.5, WY + 2],
                    [WX - 14.5, WY - 13],
                    [WX - 3, WY - 4],
                  ]),
                  kind: 'detail',
                  fill: 'kitty',
                },
                {
                  d: smooth([
                    [WX + 15.5, WY + 2],
                    [WX + 14.5, WY - 13],
                    [WX + 3, WY - 4],
                  ]),
                  kind: 'detail',
                  fill: 'kitty',
                },
                { d: ellipse(WX - 11.5, WY - 3.5, 2.6, 4, 24), kind: 'detail', fill: 'pink' },
                { d: ellipse(WX + 11.5, WY - 3.5, 2.6, 4, -24), kind: 'detail', fill: 'pink' },
                { d: ellipse(WX, WY + 8, 16.5, 13.5), kind: 'detail', fill: 'kitty' },
                { d: ellipse(WX, WY + 13.5, 7.5, 5), kind: 'detail', fill: 'kittyLight' },
                {
                  d: ellipse(WX - 11, WY + 12, 3.4, 2.1),
                  kind: 'feature',
                  fill: 'blush',
                  opacity: 0.6,
                },
                {
                  d: ellipse(WX + 11, WY + 12, 3.4, 2.1),
                  kind: 'feature',
                  fill: 'blush',
                  opacity: 0.6,
                },
                { d: circle(WX - 6.5, WY + 6, 3.4), kind: 'feature', fill: 'eye' },
                { d: circle(WX + 6.5, WY + 6, 3.4), kind: 'feature', fill: 'eye' },
                { d: circle(WX - 5.3, WY + 4.7, 1.25), kind: 'feature', fill: 'shine' },
                { d: circle(WX + 7.7, WY + 4.7, 1.25), kind: 'feature', fill: 'shine' },
                { d: ellipse(WX, WY + 11.5, 2, 1.4), kind: 'feature', fill: 'nose' },
                {
                  d: `M${WX - 4} ${WY + 14}Q${WX - 2} ${WY + 16.5} ${WX} ${WY + 13}Q${WX + 2} ${WY + 16.5} ${WX + 4} ${WY + 14}`,
                  kind: 'line',
                  stroke: 'mouth',
                  width: 1.6,
                },
                {
                  d: `M${WX - 15} ${WY - 9}Q${WX - 10} ${WY - 18} ${WX - 1} ${WY - 19}`,
                  kind: 'line',
                  stroke: 'white',
                  width: 3.6,
                  opacity: 0.85,
                },
              ],
            },
          ],
        },
      ],
    },
  ],
};

export default rocket;
