import { circle, ellipse, spline, tube, type Pt } from '../core/paths';
import type { AnimalDef, Shape } from '../core/types';

const NECK: Pt[] = [
  [318, 174],
  [333, 150],
  [340, 126],
];

function centerline(phase: number): Pt[] {
  const pts: Pt[] = [];
  for (let x = 26; x <= 300; x += 22.8) {
    const t = (x - 26) / 274;
    const envelope = Math.sin(Math.PI * Math.min(1, t * 1.15)) * 24;
    const y =
      183 - envelope * (0.5 + 0.5 * Math.sin((2 * Math.PI * x) / 150 + 2 * Math.PI * phase));
    pts.push([x, y]);
  }
  return [...pts, ...NECK];
}

const radius = (t: number) =>
  t < 0.62 ? 3.5 + 17.5 * Math.sin((t / 0.62) * (Math.PI / 2)) : 21 - 5 * ((t - 0.62) / 0.38);

function body(phase: number): Shape[] {
  const line = centerline(phase);
  const dense = spline(line, 60);
  const belly: Pt[] = dense.map(([x, y], i) => {
    const t = i / (dense.length - 1);
    return [x, y + radius(t) * 0.62];
  });
  const spots: Shape[] = [];
  for (let k = 6; k < 52; k += 7) {
    const [x, y] = dense[k];
    const r = radius(k / 60) * 0.42;
    spots.push({ d: circle(x, y - radius(k / 60) * 0.25, r), kind: 'detail', fill: 'spot' });
  }
  return [
    { d: tube(line, radius, 90), fill: 'body' },
    { d: tube(belly, (t) => radius(t) * 0.42, 90), kind: 'detail', fill: 'belly' },
    ...spots,
  ];
}

const snake: AnimalDef = {
  id: 'snake',
  name: 'Snake',
  aliases: ['python', 'serpent', 'cobra', 'anaconda'],
  group: 'reptile',
  habitats: ['jungle', 'rainforest', 'desert'],
  box: [420, 210],
  size: 95,
  locomotion: 'slither',
  sound: 'snake',
  palette: {
    body: '#74cf5c',
    spot: '#3f9e45',
    belly: '#dff27c',
    tongue: '#ff5a7a',
  },
  parts: [
    {
      id: 'body',
      frames: body,
      children: [
        {
          id: 'head',
          role: 'head',
          pivot: [342, 124],
          shapes: [
            { d: ellipse(356, 104, 41, 31, -8), fill: 'body' },
            { d: ellipse(378, 118, 7, 4.5), kind: 'feature', fill: 'blush', opacity: 0.55 },
            { d: circle(361, 93, 8.5), kind: 'feature', fill: 'eye' },
            { d: circle(364, 89.6, 3.2), kind: 'feature', fill: 'shine' },
            { d: circle(386, 99, 2), kind: 'feature', fill: 'spot' },
            { d: 'M370 117Q380 123 389 115', kind: 'line', stroke: 'mouth', width: 3 },
          ],
          children: [
            {
              id: 'tongue',
              role: 'tongue',
              behind: true,
              pivot: [388, 112],
              shapes: [
                {
                  d: 'M386 110L404 112L411 106M404 112L411 118',
                  kind: 'line',
                  stroke: 'tongue',
                  width: 3.2,
                },
              ],
            },
          ],
        },
      ],
    },
  ],
};

export default snake;
