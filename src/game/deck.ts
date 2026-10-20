export type GridSize = 3 | 4 | 5;

export const GRID_SIZES: GridSize[] = [3, 4, 5];

export interface Card {
  key: string;
  animalId: string | null;
}

export function pairsFor(size: GridSize): number {
  return Math.floor((size * size) / 2);
}

function shuffle<T>(items: T[], rand: () => number): T[] {
  const out = [...items];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

export function pickAnimals(
  preferred: string[],
  extra: string[],
  count: number,
  rand: () => number = Math.random,
): string[] {
  const first = shuffle([...new Set(preferred)], rand).slice(0, count);
  if (first.length >= count) return first;
  const rest = shuffle(
    [...new Set(extra)].filter((id) => !first.includes(id)),
    rand,
  );
  return [...first, ...rest.slice(0, count - first.length)];
}

export function buildDeck(
  animals: string[],
  size: GridSize,
  rand: () => number = Math.random,
): Card[] {
  const pairs = animals.slice(0, pairsFor(size));
  const cards: Card[] = shuffle(
    pairs.flatMap((id) => [
      { key: `${id}-a`, animalId: id },
      { key: `${id}-b`, animalId: id },
    ]),
    rand,
  );
  if ((size * size) % 2 === 1)
    cards.splice(Math.floor((size * size) / 2), 0, { key: 'star', animalId: null });
  return cards;
}
