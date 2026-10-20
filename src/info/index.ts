import type { LangCode } from '../i18n/types';
import { ROSTER_BY_ID } from '../registry/roster';
import type { InfoPack, StickerInfo } from './types';

const packs = import.meta.glob<InfoPack>('./*/*.ts', { import: 'default' });
const cache = new Map<string, Promise<InfoPack | undefined>>();

function load(lang: string, world: string): Promise<InfoPack | undefined> {
  const key = `./${lang}/${world}.ts`;
  let pending = cache.get(key);
  if (!pending) {
    const loader = packs[key];
    pending = loader ? loader().catch(() => undefined) : Promise.resolve(undefined);
    cache.set(key, pending);
  }
  return pending;
}

const worldOf = (id: string) => ROSTER_BY_ID.get(id)?.habitats[0];

export async function loadInfo(id: string, lang: LangCode): Promise<StickerInfo | null> {
  const world = worldOf(id);
  if (!world) return null;
  const local = lang === 'en' ? undefined : (await load(lang, world))?.[id];
  return local ?? (await load('en', world))?.[id] ?? null;
}

export function prefetchInfo(lang: LangCode): void {
  const worlds = new Set([...ROSTER_BY_ID.values()].map((r) => r.habitats[0]));
  for (const world of worlds) {
    void load('en', world);
    if (lang !== 'en') void load(lang, world);
  }
}
