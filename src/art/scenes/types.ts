import type { HabitatId, StyleId } from '../core/types';

export type Mode = 'day' | 'night';

export type Palette = Record<string, string>;

export interface Ambient {
  clouds?: number;
  stars?: number;
  fireflies?: number;
  bubbles?: number;
  birds?: number;
  leaves?: number;
  sparkles?: number;
}

export interface Placement {
  animal: string;
  x: number;
  y: number;
  scale?: number;
  flip?: boolean;
  rotation?: number;
  style?: StyleId;
}

export interface SceneDef {
  id: HabitatId;
  world: [number, number];
  horizon: number;
  day: Palette;
  night?: Palette;
  back: (p: Palette, mode: Mode) => string;
  front: (p: Palette, mode: Mode) => string;
  ambient: Ambient;
  defaults: Placement[];
}
