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
    '../art/scenes/dinosaur.ts',
    '../art/scenes/halloween.ts',
    '../art/scenes/space.ts',
    '../art/scenes/body.ts',
    '../art/scenes/bible.ts',
    '../art/scenes/birds.ts',
    '../art/scenes/vehicles.ts',
    '../art/scenes/polar.ts',
    '../art/scenes/aussie.ts',
    '../art/scenes/cave.ts',
    '../art/scenes/bugs.ts',
    '../art/scenes/forest.ts',
    '../art/scenes/pets.ts',
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
  { id: 'pets', name: 'Pets', accent: '#ff7f9e' },
  { id: 'farm', name: 'Farm', accent: '#e6574e' },
  { id: 'forest', name: 'Forest', accent: '#3f8f4f' },
  { id: 'bugs', name: 'Bugs', accent: '#9cc31f' },
  { id: 'birds', name: 'Birds', accent: '#4fb3e8' },
  { id: 'safari', name: 'Safari', accent: '#f2a93b' },
  { id: 'jungle', name: 'Jungle', accent: '#6fb83a' },
  { id: 'rainforest', name: 'Rainforest', accent: '#22a38a' },
  { id: 'desert', name: 'Desert', accent: '#ee8848' },
  { id: 'aussie', name: 'Australia & NZ', accent: '#c8612d' },
  { id: 'polar', name: 'Arctic & Antarctic', accent: '#5b9bd5' },
  { id: 'ocean', name: 'Ocean', accent: '#2f9fdd' },
  { id: 'cave', name: 'Cave', accent: '#7a6a8f' },
  { id: 'dinosaur', name: 'Dinosaurs', accent: '#6aa832' },
  { id: 'vehicles', name: 'Transportation', accent: '#f2b705' },
  { id: 'space', name: 'Space', accent: '#6b63e0' },
  { id: 'body', name: 'My Body', accent: '#ec6a8c' },
  { id: 'halloween', name: 'Halloween', accent: '#f08a24' },
  { id: 'bible', name: 'Bible', accent: '#9a62c9' },
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
