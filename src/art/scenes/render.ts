import { parseHex, toHex } from '../core/color';
import type { Mode, Palette, SceneDef } from './types';

const MOONLIGHT: [number, number, number] = [0.36, 0.43, 0.7];
const AMBIENT: [number, number, number] = [8, 12, 34];

export function nightColor(hex: string): string {
  const rgb = parseHex(hex);
  return toHex(
    [0, 1, 2].map((i) => rgb[i] * MOONLIGHT[i] + AMBIENT[i]) as [number, number, number],
  );
}

export function paletteFor(def: SceneDef, mode: Mode): Palette {
  if (mode === 'day') return def.day;
  const derived: Palette = {};
  for (const [key, value] of Object.entries(def.day)) derived[key] = nightColor(value);
  return { ...derived, ...def.night };
}

function wrap(def: SceneDef, content: string): string {
  const [w, h] = def.world;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}">${content}</svg>`;
}

export function renderScene(def: SceneDef, mode: Mode): { back: string; front: string } {
  const p = paletteFor(def, mode);
  return { back: wrap(def, def.back(p, mode)), front: wrap(def, def.front(p, mode)) };
}
