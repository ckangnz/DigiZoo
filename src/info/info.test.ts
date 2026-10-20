import { describe, expect, it } from 'vitest';
import { LANGUAGES } from '../i18n/languages';
import { ROSTER } from '../registry/roster';
import type { InfoPack } from './types';

const packs = import.meta.glob<InfoPack>('./*/*.ts', { eager: true, import: 'default' });
const pack = (lang: string, world: string) => packs[`./${lang}/${world}.ts`];
const worlds = [...new Set(ROSTER.map((r) => r.habitats[0]))];
const idsOf = (world: string) => ROSTER.filter((r) => r.habitats[0] === world).map((r) => r.id);

describe('english sticker info', () => {
  it.each(ROSTER.map((r) => [r.id, r.habitats[0]] as const))(
    '%s is described in %s',
    (id, world) => {
      const info = pack('en', world)?.[id];
      expect(info, `src/info/en/${world}.ts → ${id}`).toBeDefined();
      expect(info!.about.trim().length).toBeGreaterThan(20);
      expect(info!.facts).toHaveLength(3);
      for (const fact of info!.facts) expect(fact.trim().length).toBeGreaterThan(10);
    },
  );

  it.each(worlds)('%s lists only its own stickers', (world) => {
    expect(Object.keys(pack('en', world) ?? {}).sort()).toEqual(idsOf(world).sort());
  });
});

describe('translated sticker info', () => {
  const langs = LANGUAGES.map((l) => l.code).filter((c) => c !== 'en');
  it.each(langs.flatMap((lang) => worlds.map((world) => [lang, world] as const)))(
    '%s %s matches english',
    (lang, world) => {
      const local = pack(lang, world);
      expect(local, `src/info/${lang}/${world}.ts`).toBeDefined();
      expect(Object.keys(local!).sort()).toEqual(idsOf(world).sort());
      for (const [id, info] of Object.entries(local!)) {
        expect(info.about.trim(), `${lang} ${id}`).toBeTruthy();
        expect(info.facts, `${lang} ${id}`).toHaveLength(3);
      }
    },
  );
});
