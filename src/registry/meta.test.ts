import { describe, expect, it } from 'vitest';
import type { AnimalDef } from '../art/core/types';
import meta from './animal-meta.json';
import { toMeta } from './meta';

const art = import.meta.glob<AnimalDef>(['../art/animals/*.ts', '!../art/animals/*.test.ts'], {
  eager: true,
  import: 'default',
});

describe('animal metadata', () => {
  it('matches the sticker art (run `npm run meta` after changing a sticker)', () => {
    const fresh = Object.values(art)
      .map(toMeta)
      .sort((a, b) => a.id.localeCompare(b.id));
    const stored = [...meta].sort((a, b) => a.id.localeCompare(b.id));
    expect(stored).toEqual(fresh);
  });
});
