import type { HabitatId } from '../art/core/types';
import type { SceneDef } from '../art/scenes/types';

const scenes = import.meta.glob<SceneDef>(
  [
    '../art/scenes/safari.ts',
    '../art/scenes/jungle.ts',
    '../art/scenes/rainforest.ts',
    '../art/scenes/desert.ts',
    '../art/scenes/farm.ts',
    '../art/scenes/ocean.ts',
  ],
  { eager: true, import: 'default' },
);

export interface ThemeMeta {
  id: HabitatId;
  name: string;
  accent: string;
  scene: SceneDef;
}

const META: Omit<ThemeMeta, 'scene'>[] = [
  { id: 'safari', name: 'Safari', accent: '#f2a93b' },
  { id: 'jungle', name: 'Jungle', accent: '#6fb83a' },
  { id: 'rainforest', name: 'Rainforest', accent: '#22a38a' },
  { id: 'desert', name: 'Desert', accent: '#ee8848' },
  { id: 'farm', name: 'Farm', accent: '#e6574e' },
  { id: 'ocean', name: 'Ocean', accent: '#2f9fdd' },
];

const sceneById = new Map(Object.values(scenes).map((s) => [s.id, s]));

export const THEMES: ThemeMeta[] = META.flatMap((m) => {
  const scene = sceneById.get(m.id);
  return scene ? [{ ...m, scene }] : [];
});

export const DEFAULT_THEME: HabitatId = 'safari';

export function getTheme(id: HabitatId): ThemeMeta {
  return THEMES.find((t) => t.id === id) ?? THEMES[0];
}

export function hasTheme(id: string): id is HabitatId {
  return THEMES.some((t) => t.id === id);
}
