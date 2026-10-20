import { describe, expect, it } from 'vitest';
import { ROSTER } from '../registry/roster';
import { DIETS, likes } from './diets';
import { FOOD_IDS } from './foods';

describe('diets', () => {
  it('lets every animal eat something', () => {
    for (const r of ROSTER.filter((x) => x.kind === 'animal')) {
      expect(DIETS[r.id]?.length, r.id).toBeGreaterThan(0);
    }
  });

  it('only uses known foods and known stickers', () => {
    const ids = new Set(ROSTER.map((r) => r.id));
    for (const [id, foods] of Object.entries(DIETS)) {
      expect(ids.has(id), id).toBe(true);
      for (const f of foods) expect(FOOD_IDS).toContain(f);
    }
  });

  it('makes meat-eaters and plant-eaters react differently', () => {
    expect(likes('lion', 'meat')).toBe(true);
    expect(likes('lion', 'carrot')).toBe(false);
    expect(likes('cow', 'hay')).toBe(true);
    expect(likes('cow', 'meat')).toBe(false);
    expect(likes('earth', 'meat')).toBe(false);
  });
});
