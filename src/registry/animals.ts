import { create } from 'zustand';
import type { AnimalDef, AnimalGroup, HabitatId } from '../art/core/types';
import meta from './animal-meta.json';
import type { AnimalMeta } from './meta';

const artLoaders = import.meta.glob<AnimalDef>(
  ['../art/animals/*.ts', '!../art/animals/*.test.ts'],
  { import: 'default' },
);

export const ANIMALS: AnimalMeta[] = (meta as unknown as AnimalMeta[])
  .slice()
  .sort((a, b) => a.name.localeCompare(b.name));

const BY_ID = new Map(ANIMALS.map((a) => [a.id, a]));

export function getAnimal(id: string): AnimalMeta | undefined {
  return BY_ID.get(id);
}

const art = new Map<string, AnimalDef>();
const artJobs = new Map<string, Promise<void>>();

export const useArt = create<{ version: number }>(() => ({ version: 0 }));

export function getArt(id: string): AnimalDef | undefined {
  return art.get(id);
}

export function loadArt(ids: Iterable<string>): Promise<void> {
  const jobs: Promise<void>[] = [];
  for (const id of ids) {
    if (art.has(id)) continue;
    let job = artJobs.get(id);
    if (!job) {
      const loader = artLoaders[`../art/animals/${id}.ts`];
      if (!loader) continue;
      job = loader().then((def) => {
        art.set(id, def);
        useArt.setState((s) => ({ version: s.version + 1 }));
      });
      job.catch(() => artJobs.delete(id));
      artJobs.set(id, job);
    }
    jobs.push(job);
  }
  return Promise.all(jobs).then(() => undefined);
}

export function hasArt(ids: Iterable<string>): boolean {
  for (const id of ids) if (BY_ID.has(id) && !art.has(id)) return false;
  return true;
}

export function useArtOf(id: string | undefined): AnimalDef | undefined {
  useArt((s) => s.version);
  if (!id) return undefined;
  const def = art.get(id);
  if (!def) void loadArt([id]);
  return def;
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
  vehicle: ['vehicle', 'vehicles', 'car', 'cars', 'truck', 'trucks', 'transport', 'things that go'],
  nature: ['nature', 'rock', 'rocks', 'stone', 'stones', 'gem', 'gems'],
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

function score(def: AnimalMeta, q: string, extra: string[]): number {
  let localBest = 0;
  extra.map(normalize).forEach((term, i) => {
    if (!term) return;
    const ownName = i === 0 ? 1 : 0;
    if (term === q) localBest = Math.max(localBest, 11 + ownName);
    else if (term.startsWith(q)) localBest = Math.max(localBest, 9 + ownName);
    else if (q.length >= 2 && term.includes(q)) localBest = Math.max(localBest, 6);
  });
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
  localTerms: (def: AnimalMeta) => string[] = () => [],
): AnimalMeta[] {
  const q = normalize(query);
  if (!q) return ANIMALS;
  return ANIMALS.map((def) => ({ def, s: score(def, q, localTerms(def)) }))
    .filter((r) => r.s > 0)
    .sort((a, b) => b.s - a.s || a.def.name.localeCompare(b.def.name))
    .map((r) => r.def);
}

export function animalsIn(habitat: HabitatId): AnimalMeta[] {
  return ANIMALS.filter((a) => a.habitats.includes(habitat));
}
