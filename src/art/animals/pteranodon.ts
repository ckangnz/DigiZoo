import { capsule, circle, curve, ellipse, mirrorPath, smooth, tube, type Pt } from '../core/paths';
import type { AnimalDef, PartNode, Shape } from '../core/types';

const MID = 210;

const WING: Pt[] = [
  [226, 112],
  [258, 90],
  [298, 74],
  [336, 80],
  [374, 98],
  [412, 124],
  [382, 128],
  [352, 132],
  [328, 146],
  [300, 150],
  [272, 164],
  [244, 176],
  [224, 160],
];

const ARM: Pt[] = [
  [230, 114],
  [262, 94],
  [298, 80],
  [338, 86],
  [376, 104],
  [404, 122],
];

const wingShapes = (): Shape[] => [
  { d: smooth(WING), fill: 'membrane' },
  { d: tube(ARM, (t) => 10 - 6 * t, 50), kind: 'detail', fill: 'skin' },
  { d: curve(300, 88, 298, 144, 6), kind: 'line', stroke: 'vein', width: 2.6 },
  { d: curve(342, 94, 352, 128, 4), kind: 'line', stroke: 'vein', width: 2.6 },
  { d: curve(264, 100, 264, 158, 6), kind: 'line', stroke: 'vein', width: 2.6 },
];

const wing = (id: string, left: boolean): PartNode => ({
  id,
  role: id,
  behind: true,
  pivot: left ? [MID * 2 - 230, 120] : [230, 120],
  motion: { rotate: left ? 20 : -20 },
  shapes: wingShapes().map((s) => (left ? { ...s, d: mirrorPath(s.d, MID) } : s)),
});

const pteranodon: AnimalDef = {
  id: 'pteranodon',
  name: 'Pteranodon',
  kind: 'animal',
  aliases: ['pterodactyl', 'pterosaur', 'flying dinosaur', 'ptero', 'dinosaur'],
  group: 'dinosaur',
  habitats: ['dinosaur'],
  box: [420, 232],
  size: 180,
  locomotion: 'fly',
  sound: 'pteranodon',
  palette: {
    skin: '#f08b5e',
    skinDark: '#d87149',
    membrane: '#ffc57c',
    vein: '#f0a35e',
    belly: '#ffe3c4',
    crest: '#e9584b',
    beak: '#ffc65a',
    feet: '#d9774c',
    cheek: '#ff8fa3',
  },
  parts: [
    {
      id: 'body',
      role: 'body',
      pivot: [MID, 150],
      shapes: [
        {
          d: smooth([
            [210, 104],
            [236, 112],
            [246, 140],
            [240, 172],
            [224, 192],
            [210, 196],
            [196, 192],
            [180, 172],
            [174, 140],
            [184, 112],
          ]),
          fill: 'skin',
        },
        { d: ellipse(210, 162, 20, 30), kind: 'detail', fill: 'belly' },
      ],
      children: [
        wing('wingF', true),
        wing('wingN', false),
        {
          id: 'feet',
          behind: true,
          pivot: [MID, 190],
          shapes: [
            { d: capsule(200, 186, 194, 200, 5.5, 5), fill: 'feet' },
            { d: capsule(220, 186, 226, 200, 5.5, 5), fill: 'feet' },
          ],
        },
        {
          id: 'head',
          role: 'head',
          pivot: [MID, 110],
          shapes: [
            {
              d: tube(
                [
                  [204, 76],
                  [178, 62],
                  [150, 52],
                  [124, 50],
                ],
                (t) => 14 - 7 * t,
                40,
              ),
              fill: 'crest',
            },
            {
              d: 'M240 84Q282 86 318 100Q328 106 318 110Q282 120 240 116Z',
              fill: 'beak',
            },
            {
              d: smooth([
                [184, 88],
                [194, 64],
                [218, 54],
                [242, 62],
                [252, 84],
                [246, 106],
                [224, 118],
                [200, 114],
              ]),
              fill: 'skin',
            },
            { d: ellipse(230, 102, 9, 5.5), kind: 'feature', fill: 'cheek', opacity: 0.7 },
            { d: circle(229, 80, 10), kind: 'feature', fill: 'eye' },
            { d: circle(232.8, 76.2, 3.8), kind: 'feature', fill: 'shine' },
            { d: curve(304, 107, 254, 104, -4), kind: 'line', stroke: 'mouth', width: 2.8 },
          ],
        },
      ],
    },
  ],
};

export default pteranodon;
