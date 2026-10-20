import { describe, expect, it } from 'vitest';
import { hasRecipe, hasSample } from '../audio/engine';
import { ANIMALS, getAnimal } from './animals';
import { ROSTER } from './roster';

describe('roster', () => {
  it('has unique ids', () => {
    expect(new Set(ROSTER.map((r) => r.id)).size).toBe(ROSTER.length);
  });

  it.each(ROSTER.map((r) => [r.id, r] as const))('%s is drawn as rostered', (id, entry) => {
    const def = getAnimal(id);
    expect(def, `${id} has no art yet`).toBeDefined();
    expect(def!.name).toBe(entry.name);
    expect([...def!.habitats].sort()).toEqual([...entry.habitats].sort());
    expect(def!.kind ?? 'animal').toBe(entry.kind);
  });

  it.each(ROSTER.map((r) => [r.id] as const))('%s can make a sound', (id) => {
    const sound = getAnimal(id)?.sound ?? id;
    expect(hasSample(sound) || hasRecipe(sound)).toBe(true);
  });

  it('has no stickers outside the roster', () => {
    const ids = new Set(ROSTER.map((r) => r.id));
    expect(ANIMALS.filter((a) => !ids.has(a.id)).map((a) => a.id)).toEqual([]);
  });
});
