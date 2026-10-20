import { capsule, circle, curve, ellipse, smooth, type Pt } from '../core/paths';
import type { AnimalDef, PartNode } from '../core/types';

const CROWN: Pt[] = [
  [110, 44],
  [128, 30],
  [152, 24],
  [176, 36],
  [188, 66],
  [186, 108],
  [174, 148],
  [156, 172],
  [110, 180],
  [64, 172],
  [46, 148],
  [34, 108],
  [32, 66],
  [44, 36],
  [68, 24],
  [92, 30],
];

const star = (cx: number, cy: number, r: number): string =>
  `M${cx} ${cy - r}Q${cx} ${cy} ${cx + r} ${cy}Q${cx} ${cy} ${cx} ${cy + r}` +
  `Q${cx} ${cy} ${cx - r} ${cy}Q${cx} ${cy} ${cx} ${cy - r}Z`;

const root = (id: string, top: Pt, tip: Pt): PartNode => ({
  id,
  role: id,
  behind: true,
  pivot: top,
  shapes: [{ d: capsule(top[0], top[1], tip[0], tip[1], 23, 12), fill: 'root' }],
});

const sparkle = (id: string, cx: number, cy: number, r: number, phase: number): PartNode => ({
  id,
  role: 'sparkle',
  phase,
  pivot: [cx, cy],
  shapes: [{ d: star(cx, cy, r), fill: 'glint' }],
});

const tooth: AnimalDef = {
  id: 'tooth',
  name: 'Tooth',
  kind: 'object',
  aliases: ['teeth', 'molar', 'toothy', 'baby tooth'],
  group: 'body',
  habitats: ['body'],
  box: [220, 250],
  size: 120,
  locomotion: 'hop',
  gait: { swing: 12 },
  sound: 'tooth',
  palette: {
    tooth: '#f8faff',
    root: '#eef1fa',
    shade: '#e2e8f6',
    glint: '#fff4b0',
  },
  parts: [
    {
      id: 'body',
      role: 'body',
      pivot: [110, 170],
      shapes: [
        { d: smooth(CROWN), fill: 'tooth' },
        { d: ellipse(110, 186, 90, 30), kind: 'detail', fill: 'shade' },
        { d: ellipse(70, 140, 11, 7), kind: 'feature', fill: 'blush', opacity: 0.55 },
        { d: ellipse(150, 140, 11, 7), kind: 'feature', fill: 'blush', opacity: 0.55 },
        { d: circle(88, 116, 12.5), kind: 'feature', fill: 'eye' },
        { d: circle(132, 116, 12.5), kind: 'feature', fill: 'eye' },
        { d: circle(92.5, 111, 4.7), kind: 'feature', fill: 'shine' },
        { d: circle(136.5, 111, 4.7), kind: 'feature', fill: 'shine' },
        { d: curve(100, 138, 120, 138, 6.5), kind: 'line', stroke: 'mouth', width: 3.3 },
      ],
      children: [
        root('legBN', [80, 160], [68, 232]),
        root('legFN', [140, 160], [152, 232]),
        sparkle('sparkle1', 196, 30, 17, 0),
        sparkle('sparkle2', 24, 84, 9, 0.25),
      ],
    },
  ],
};

export default tooth;
