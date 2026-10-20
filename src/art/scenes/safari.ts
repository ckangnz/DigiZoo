import {
  ellipse,
  emptyBounds,
  extendBounds,
  samplePath,
  type Bounds,
  type Pt,
} from '../core/paths';
import {
  acacia,
  baobab,
  bush,
  grassTuft,
  hills,
  layered,
  moon,
  mountain,
  path,
  pond,
  rock,
  scatter,
  scatterItems,
  sky,
  starField,
  sun,
  tallGrass,
  termiteMound,
} from './props';
import type { Palette, SceneDef } from './types';

const W = 3600;
const H = 2000;

type Layer = [number, string][];
type Shape = [Bounds, Pt[]];

function sunWithSpinningRays(x: number, y: number, r: number, p: Palette): string {
  const svg = sun(x, y, r, p.sun, p.sunRay, p.face);
  const rays = svg.match(new RegExp(`(<path[^>]*fill="${p.sunRay}"/>)+`))?.[0] ?? '';
  return svg.replace(rays, `<g data-spin="" style="transform-origin: ${x}px ${y}px">${rays}</g>`);
}

function shapes(svg: string): Shape[] {
  return [...svg.matchAll(/ d="([^"]+)"/g)].flatMap((m) =>
    m[1].split(/(?=M)/).map((d): Shape => {
      const pts = samplePath(d);
      return [extendBounds(emptyBounds(), pts), pts];
    }),
  );
}

function inside([x, y]: Pt, poly: Pt[]): boolean {
  let hit = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const [ax, ay] = poly[i];
    const [bx, by] = poly[j];
    if (ay > y !== by > y && x < ax + ((bx - ax) * (y - ay)) / (by - ay)) hit = !hit;
  }
  return hit;
}

function overlap(a: Shape[], b: Shape[]): boolean {
  return a.some(([ab, ap]) =>
    b.some(
      ([bb, bp]) =>
        ab.minX < bb.maxX &&
        bb.minX < ab.maxX &&
        ab.minY < bb.maxY &&
        bb.minY < ab.maxY &&
        (ap.some((pt) => inside(pt, bp)) || bp.some((pt) => inside(pt, ap))),
    ),
  );
}

function grass(p: Palette): Layer {
  return [
    ...scatterItems(12, 34, 0, W, 1110, 1880, (x, y, r) =>
      tallGrass(x, y, 0.6 + r() * 0.6, p.tallGrass, p.tallGrassDark),
    ),
    ...scatterItems(21, 70, 0, W, 1100, 1950, (x, y, r) =>
      grassTuft(x, y, 0.8 + r() * 0.6, r() < 0.5 ? p.grassDark : p.tallGrassDark),
    ),
  ];
}

const PROPS: Record<string, (p: Palette) => Layer> = {
  baobab: (p) => [[1100, baobab(1180, 1100, 1, p.trunk, p.trunkDark, p.leaves)]],
  'acacia-middle': (p) => [[1100, acacia(2340, 1100, 1.15, p.trunk, p.leaves, p.leavesDark)]],
  rocks: (p) => [
    [1120, rock(3040, 1120, 1.7, p.rock, p.rockShade, p.rockLight)],
    [1096, rock(3170, 1096, 1.1, p.rock, p.rockShade, p.rockLight)],
    [1130, rock(2940, 1130, 0.8, p.rock, p.rockShade, p.rockLight)],
  ],
  'termite-mound': (p) => [[1140, termiteMound(2580, 1140, 0.85, p.mound, p.moundShade)]],
  'acacia-left': (p) => [[1190, acacia(520, 1190, 1.5, p.trunk, p.leaves, p.leavesDark)]],
  'acacia-right': (p) => [[1220, acacia(3330, 1220, 1.35, p.trunk, p.leaves, p.leavesDark)]],
  waterhole: (p) => [[1290, pond(1850, 1330, 340, 86, p.water, p.waterLight, p.waterRim)]],
};

let owners: string[] | undefined;

function ownersOf(p: Palette, items: Layer): string[] {
  const ids = Object.keys(PROPS);
  const covers = ids.flatMap((id, k) =>
    PROPS[id](p).map(([y, svg]): [number, number, Shape[]] => [k, y, shapes(svg)]),
  );
  return items.map(([y, svg]) => {
    const own = shapes(svg);
    let best = -1;
    for (const [k, cy, c] of covers) if (k > best && y > cy && overlap(own, c)) best = k;
    if (best >= 0) covers.push([best, y, own]);
    return ids[best] ?? '';
  });
}

function grassOf(p: Palette, id: string): Layer {
  const items = grass(p).sort((a, b) => a[0] - b[0]);
  const owner = (owners ??= ownersOf(p, items));
  return items.filter((_, i) => owner[i] === id);
}

const standing = (id: string) => (p: Palette) => layered([...PROPS[id](p), ...grassOf(p, id)]);

const safari: SceneDef = {
  id: 'safari',
  world: [W, H],
  horizon: 960,
  ambient: { clouds: 5, stars: 46, fireflies: 14, birds: 3 },
  defaults: [
    { animal: 'giraffe', x: 2620, y: 1080 },
    { animal: 'elephant', x: 980, y: 1170 },
    { animal: 'hippo', x: 1840, y: 1250, flip: true },
    { animal: 'meerkat', x: 2900, y: 1200 },
    { animal: 'zebra', x: 2250, y: 1470, flip: true },
    { animal: 'rhino', x: 3170, y: 1450, flip: true },
    { animal: 'lion', x: 1420, y: 1450 },
    { animal: 'cheetah', x: 560, y: 1610 },
    { animal: 'ostrich', x: 430, y: 1260 },
    { animal: 'flamingo', x: 1600, y: 1215 },
    { animal: 'warthog', x: 1960, y: 1700, flip: true },
  ],
  day: {
    skyTop: '#7cc8f2',
    skyBottom: '#d6f2ff',
    sun: '#ffd34d',
    sunRay: '#ffc531',
    face: '#8a4b1f',
    mountain: '#b9c5ea',
    mountainShade: '#a2b1dd',
    mountainFar: '#cdd6f2',
    snow: '#f7f9ff',
    hillFar: '#e8d48c',
    treeFar: '#c9b46e',
    ground2: '#efcd72',
    ground: '#f5d880',
    grass: '#b9d566',
    grassDark: '#9bc150',
    water: '#5cc0e8',
    waterLight: '#b2e9fc',
    waterRim: '#d8bf69',
    trunk: '#8b5a3c',
    trunkDark: '#6b4128',
    leaves: '#8cc152',
    leavesDark: '#6aa13e',
    rock: '#cba98a',
    rockShade: '#ad8b6d',
    rockLight: '#ecd5bb',
    mound: '#cb915c',
    moundShade: '#a96f40',
    tallGrass: '#e8c45c',
    tallGrassDark: '#d0aa45',
    bush: '#80c04b',
    bushDark: '#619f39',
    bushDot: '#ffd166',
  },
  night: {
    skyTop: '#0b1438',
    skyBottom: '#3a3f7c',
    sun: '#fff1c0',
    sunRay: '#ffe9a8',
    face: '#7a5a34',
    water: '#29498c',
    waterLight: '#8fb2ee',
    bushDot: '#ffe9a8',
  },
  back: (p, mode) => {
    let out = sky(W, H, p.skyTop, p.skyBottom);
    if (mode === 'night') out += starField(7, 70, 40, 40, W - 40, 760, '#fff6d6');
    out += mountain(1650, 930, 860, 330, p.mountainFar, p.mountain);
    out += mountain(900, 930, 1300, 520, p.mountain, p.mountainShade, p.snow);
    out += mountain(160, 930, 760, 270, p.mountainFar, p.mountain);
    out += hills(3, 920, 70, W, H, p.hillFar, 7);
    out += scatter(41, 7, 200, W - 200, 880, 900, (x, y, r) =>
      acacia(x, y, 0.32 + r() * 0.12, p.treeFar, p.treeFar, p.treeFar),
    );
    out += hills(5, 1010, 70, W, H, p.ground2, 6);
    out += hills(9, 1080, 46, W, H, p.ground, 5);
    out += scatter(77, 16, 0, W, 1120, 1900, (x, y, r) =>
      path(ellipse(x, y, 140 + r() * 160, 34 + r() * 26), p.grass, ' opacity=".75"'),
    );
    out += layered(grassOf(p, ''));
    return out;
  },
  front: (p) =>
    bush(160, 2010, 1.8, p.bush, p.bushDark, p.bushDot) +
    tallGrass(640, 2006, 1.9, p.tallGrass, p.tallGrassDark) +
    bush(1240, 2030, 1.4, p.bush, p.bushDark) +
    tallGrass(1820, 2008, 1.6, p.tallGrass, p.tallGrassDark) +
    tallGrass(3000, 2006, 1.8, p.tallGrass, p.tallGrassDark) +
    bush(3480, 2010, 1.9, p.bush, p.bushDark),
  interactives: [
    {
      id: 'sun',
      box: [2680, 50, 540, 540],
      kind: 'spin',
      effect: 'sparkle',
      sound: 'shine',
      night: { kind: 'rock', effect: 'stars', sound: 'twinkle' },
      render: (p, mode) =>
        mode === 'day'
          ? sunWithSpinningRays(2950, 320, 104, p)
          : moon(2950, 320, 96, p.sun, p.sunRay, p.face),
    },
    {
      id: 'baobab',
      box: [1003, 621, 357, 520],
      origin: [1180, 1104],
      kind: 'shake',
      effect: 'leaves',
      sound: 'rustle',
      render: standing('baobab'),
    },
    {
      id: 'acacia-middle',
      box: [2092, 736, 495, 447],
      origin: [2340, 1106],
      kind: 'shake',
      effect: 'leaves',
      sound: 'rustle',
      render: standing('acacia-middle'),
    },
    {
      id: 'rocks',
      box: [2856, 981, 472, 205],
      kind: 'wiggle',
      sound: 'thump',
      render: standing('rocks'),
    },
    {
      id: 'termite-mound',
      box: [2494, 907, 174, 269],
      kind: 'wiggle',
      sound: 'thump',
      render: standing('termite-mound'),
    },
    {
      id: 'acacia-left',
      box: [203, 721, 634, 522],
      origin: [520, 1199],
      kind: 'shake',
      effect: 'leaves',
      sound: 'rustle',
      render: standing('acacia-left'),
    },
    {
      id: 'acacia-right',
      box: [3043, 796, 574, 474],
      origin: [3330, 1229],
      kind: 'shake',
      effect: 'leaves',
      sound: 'rustle',
      render: standing('acacia-right'),
    },
    {
      id: 'waterhole',
      box: [1469, 1219, 780, 239],
      kind: 'pulse',
      effect: 'splash',
      sound: 'splash',
      render: standing('waterhole'),
    },
    {
      id: 'bush',
      box: [2236, 1849, 448, 197],
      kind: 'bounce',
      effect: 'petals',
      sound: 'rustle',
      front: true,
      render: (p) => bush(2460, 2020, 1.7, p.bush, p.bushDark, p.bushDot),
    },
  ],
};

export default safari;
