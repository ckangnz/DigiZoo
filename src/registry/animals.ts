import type { AnimalDef, AnimalGroup, HabitatId } from '../art/core/types';

const modules = import.meta.glob<AnimalDef>(['../art/animals/*.ts', '!../art/animals/*.test.ts'], {
  eager: true,
  import: 'default',
});

export const ANIMALS: AnimalDef[] = Object.values(modules)
  .filter(Boolean)
  .sort((a, b) => a.name.localeCompare(b.name));

const BY_ID = new Map(ANIMALS.map((a) => [a.id, a]));

export function getAnimal(id: string): AnimalDef | undefined {
  return BY_ID.get(id);
}

const GROUP_WORDS: Record<AnimalGroup, string[]> = {
  mammal: ['mammal', 'mammals'],
  bird: ['bird', 'birds', 'birdie', 'fly', 'flying'],
  reptile: ['reptile', 'reptiles', 'scaly'],
  amphibian: ['amphibian', 'amphibians'],
  fish: ['fish', 'fishes', 'swim', 'swimming'],
  bug: ['bug', 'bugs', 'insect', 'insects', 'creepy'],
  sea: ['sea', 'ocean', 'water', 'swim'],
  dinosaur: ['dinosaur', 'dinosaurs', 'dino', 'dinos', 'prehistoric'],
  spooky: ['spooky', 'halloween', 'scary', 'monster', 'monsters'],
  space: ['space', 'planet', 'planets', 'star', 'stars', 'galaxy'],
  body: ['body', 'organ', 'organs', 'anatomy', 'inside'],
  bible: ['bible', 'church', 'christian', 'sunday school', 'story', 'stories'],
};

export function normalize(text: string): string {
  return text
    .normalize('NFKD')
    .replace(/(\p{Script=Latin})\p{M}+/gu, '$1')
    .normalize('NFC')
    .toLowerCase()
    .replace(/đ/g, 'd')
    .replace(/ё/g, 'е')
    .replace(/[أإآ]/g, 'ا')
    .replace(/ة/g, 'ه')
    .replace(/ى/g, 'ي')
    .replace(/[\u064B-\u0652\u0670]/g, '')
    .replace(/[^\p{L}\p{N}\p{M} ]/gu, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function singular(word: string): string {
  if (word.length > 3 && word.endsWith('es') && !word.endsWith('ses')) return word.slice(0, -2);
  if (word.length > 3 && word.endsWith('s')) return word.slice(0, -1);
  return word;
}

function score(def: AnimalDef, q: string, extra: string[]): number {
  let localBest = 0;
  for (const term of extra.map(normalize)) {
    if (!term) continue;
    if (term === q) localBest = Math.max(localBest, 11);
    else if (term.startsWith(q)) localBest = Math.max(localBest, 9);
    else if (q.length >= 2 && term.includes(q)) localBest = Math.max(localBest, 6);
  }
  if (localBest) return localBest;
  const name = normalize(def.name);
  const id = def.id.replace(/-/g, ' ');
  const aliases = (def.aliases ?? []).map(normalize);
  const aliasWords = aliases.flatMap((a) => a.split(' '));
  const qs = singular(q);
  let best = 0;
  for (const term of [q, qs]) {
    if (!term) continue;
    const short = term.length < 4;
    if (name === term || id === term) best = Math.max(best, 10);
    else if (name.startsWith(term) || id.startsWith(term)) best = Math.max(best, 8);
    else if (name.split(' ').some((w) => w.startsWith(term))) best = Math.max(best, 7);
    else if (aliases.some((a) => a === term) || aliasWords.includes(term)) best = Math.max(best, 6);
    else if (aliasWords.some((a) => a.startsWith(term))) best = Math.max(best, short ? 1 : 5);
    else if (name.includes(term)) best = Math.max(best, short ? 1 : 4);
    else if (aliases.some((a) => a.includes(term))) best = Math.max(best, short ? 1 : 3);
  }
  if (best === 0 && q.length >= 3) {
    if (GROUP_WORDS[def.group].some((w) => w.startsWith(q))) best = 2;
    else if (def.habitats.some((h) => h.startsWith(q))) best = 2;
  }
  return best;
}

export function searchAnimals(
  query: string,
  localTerms: (def: AnimalDef) => string[] = () => [],
): AnimalDef[] {
  const q = normalize(query);
  if (!q) return ANIMALS;
  return ANIMALS.map((def) => ({ def, s: score(def, q, localTerms(def)) }))
    .filter((r) => r.s > 0)
    .sort((a, b) => b.s - a.s || a.def.name.localeCompare(b.def.name))
    .map((r) => r.def);
}

export function animalsIn(habitat: HabitatId): AnimalDef[] {
  return ANIMALS.filter((a) => a.habitats.includes(habitat));
}
