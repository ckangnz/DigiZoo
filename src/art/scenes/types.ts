import type { SfxName } from '../../audio/types';
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
  snow?: number;
  sparkles?: number;
  twinkles?: number;
  meteors?: number;
  bats?: number;
  cells?: number;
  smoke?: number;
  smokeAt?: [number, number];
  smokeScale?: number;
}

export type InteractKind =
  'spin' | 'shake' | 'bounce' | 'wiggle' | 'glow' | 'pulse' | 'sway' | 'rock';

export type InteractEffect =
  | 'leaves'
  | 'rain'
  | 'sparkle'
  | 'splash'
  | 'smoke'
  | 'stars'
  | 'petals'
  | 'bubbles'
  | 'coins'
  | 'notes'
  | 'fruit'
  | 'hearts';

export interface InteractMode {
  kind?: InteractKind;
  effect?: InteractEffect;
  sound?: SfxName;
}

export interface Interactive {
  id: string;
  box: [number, number, number, number];
  kind: InteractKind;
  origin?: [number, number];
  effect?: InteractEffect;
  effectAt?: [number, number];
  sound?: SfxName;
  front?: boolean;
  night?: InteractMode;
  render: (p: Palette, mode: Mode) => string;
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
  stickerScale?: number;
  groundTop?: number;
  interactives?: Interactive[];
}
