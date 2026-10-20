import { create } from 'zustand';

export type EffectKind = 'poof' | 'sparkle' | 'notes' | 'pop';

export interface Effect {
  id: number;
  kind: EffectKind;
  x: number;
  y: number;
  size: number;
}

interface EffectsState {
  effects: Effect[];
}

export const useEffects = create<EffectsState>(() => ({ effects: [] }));

let counter = 0;

const LIFETIME: Record<EffectKind, number> = { poof: 700, sparkle: 800, notes: 1400, pop: 600 };

export function spawnEffect(kind: EffectKind, x: number, y: number, size = 160): void {
  counter += 1;
  const effect: Effect = { id: counter, kind, x, y, size };
  useEffects.setState({ effects: [...useEffects.getState().effects, effect].slice(-12) });
  setTimeout(() => {
    useEffects.setState({
      effects: useEffects.getState().effects.filter((e) => e.id !== effect.id),
    });
  }, LIFETIME[kind]);
}
