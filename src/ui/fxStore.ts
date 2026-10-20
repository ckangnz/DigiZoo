import { create } from 'zustand';
import type { FoodId } from '../food/foods';

export type EffectKind =
  | 'poof'
  | 'sparkle'
  | 'notes'
  | 'pop'
  | 'leaves'
  | 'rain'
  | 'splash'
  | 'smoke'
  | 'stars'
  | 'petals'
  | 'bubbles'
  | 'coins'
  | 'fruit'
  | 'hearts'
  | 'feed';

export interface Effect {
  id: number;
  kind: EffectKind;
  x: number;
  y: number;
  size: number;
  food?: FoodId;
  happy?: boolean;
}

interface EffectsState {
  effects: Effect[];
}

export const useEffects = create<EffectsState>(() => ({ effects: [] }));

let counter = 0;

const LIFETIME: Record<EffectKind, number> = {
  poof: 700,
  sparkle: 800,
  notes: 1400,
  pop: 600,
  leaves: 1900,
  rain: 2000,
  splash: 1000,
  smoke: 2400,
  stars: 1300,
  petals: 1700,
  bubbles: 1900,
  coins: 1500,
  fruit: 1600,
  hearts: 1600,
  feed: 2400,
};

export function spawnEffect(
  kind: EffectKind,
  x: number,
  y: number,
  size = 160,
  extra: Pick<Effect, 'food' | 'happy'> = {},
): void {
  counter += 1;
  const effect: Effect = { id: counter, kind, x, y, size, ...extra };
  useEffects.setState({ effects: [...useEffects.getState().effects, effect].slice(-16) });
  setTimeout(() => {
    useEffects.setState({
      effects: useEffects.getState().effects.filter((e) => e.id !== effect.id),
    });
  }, LIFETIME[kind]);
}
