import { ellipse } from '../core/paths';
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
import type { SceneDef } from './types';

const W = 3600;
const H = 2000;

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
    out +=
      mode === 'day'
        ? sun(2950, 320, 104, p.sun, p.sunRay, p.face)
        : starField(7, 70, 40, 40, W - 40, 760, '#fff6d6') +
          moon(2950, 320, 96, p.sun, p.sunRay, p.face);
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
    out += layered([
      [1290, pond(1850, 1330, 340, 86, p.water, p.waterLight, p.waterRim)],
      [1140, termiteMound(2580, 1140, 0.85, p.mound, p.moundShade)],
      [1100, baobab(1180, 1100, 1, p.trunk, p.trunkDark, p.leaves)],
      [1120, rock(3040, 1120, 1.7, p.rock, p.rockShade, p.rockLight)],
      [1096, rock(3170, 1096, 1.1, p.rock, p.rockShade, p.rockLight)],
      [1130, rock(2940, 1130, 0.8, p.rock, p.rockShade, p.rockLight)],
      [1100, acacia(2340, 1100, 1.15, p.trunk, p.leaves, p.leavesDark)],
      [1190, acacia(520, 1190, 1.5, p.trunk, p.leaves, p.leavesDark)],
      [1220, acacia(3330, 1220, 1.35, p.trunk, p.leaves, p.leavesDark)],
      ...scatterItems(12, 34, 0, W, 1110, 1880, (x, y, r) =>
        tallGrass(x, y, 0.6 + r() * 0.6, p.tallGrass, p.tallGrassDark),
      ),
      ...scatterItems(21, 70, 0, W, 1100, 1950, (x, y, r) =>
        grassTuft(x, y, 0.8 + r() * 0.6, r() < 0.5 ? p.grassDark : p.tallGrassDark),
      ),
    ]);
    return out;
  },
  front: (p) =>
    bush(160, 2010, 1.8, p.bush, p.bushDark, p.bushDot) +
    tallGrass(640, 2006, 1.9, p.tallGrass, p.tallGrassDark) +
    bush(1240, 2030, 1.4, p.bush, p.bushDark) +
    tallGrass(1820, 2008, 1.6, p.tallGrass, p.tallGrassDark) +
    bush(2460, 2020, 1.7, p.bush, p.bushDark, p.bushDot) +
    tallGrass(3000, 2006, 1.8, p.tallGrass, p.tallGrassDark) +
    bush(3480, 2010, 1.9, p.bush, p.bushDark),
};

export default safari;
