import { describe, expect, it } from 'vitest';
import { GRID_SIZES, buildDeck, pairsFor, pickAnimals } from './deck';

const ids = Array.from({ length: 20 }, (_, i) => `animal-${i}`);

describe('matching deck', () => {
  it.each(GRID_SIZES)('fills a %i×%i grid with pairs', (size) => {
    const deck = buildDeck(ids, size);
    expect(deck).toHaveLength(size * size);
    const counts = new Map<string, number>();
    for (const card of deck)
      if (card.animalId) counts.set(card.animalId, (counts.get(card.animalId) ?? 0) + 1);
    expect(counts.size).toBe(pairsFor(size));
    for (const n of counts.values()) expect(n).toBe(2);
    expect(new Set(deck.map((c) => c.key)).size).toBe(deck.length);
  });

  it('puts a free star in the middle of odd grids', () => {
    expect(buildDeck(ids, 3)[4].animalId).toBeNull();
    expect(buildDeck(ids, 5)[12].animalId).toBeNull();
    expect(buildDeck(ids, 4).every((c) => c.animalId)).toBe(true);
  });

  it('prefers the world’s stickers and tops up from the rest', () => {
    const picked = pickAnimals(['a', 'b', 'c'], ['a', 'x', 'y', 'z'], 5);
    expect(picked).toHaveLength(5);
    expect(new Set(picked).size).toBe(5);
    expect(picked.slice(0, 3).sort()).toEqual(['a', 'b', 'c']);
  });
});
