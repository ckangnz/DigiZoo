import { describe, expect, it } from 'vitest';
import { ANIMALS, animalsIn, searchAnimals } from './animals';

const ids = (query: string) => searchAnimals(query).map((a) => a.id);

describe('searchAnimals', () => {
  it('returns everything for an empty query', () => {
    expect(searchAnimals('  ')).toHaveLength(ANIMALS.length);
  });

  it('matches names, plurals and aliases', () => {
    expect(ids('lion')[0]).toBe('lion');
    expect(ids('Lions')[0]).toBe('lion');
    expect(ids('nemo')).toContain('fish');
    expect(ids('serpent')).toContain('snake');
  });

  it('matches groups', () => {
    const birds = ids('birds');
    expect(birds).toContain('chicken');
    expect(birds).not.toContain('lion');
  });

  it('finds nothing for nonsense', () => {
    expect(ids('zzzqqq')).toEqual([]);
  });
});

describe('animalsIn', () => {
  it('filters by habitat', () => {
    expect(animalsIn('farm').every((a) => a.habitats.includes('farm'))).toBe(true);
    expect(animalsIn('safari').map((a) => a.id)).toContain('lion');
  });
});

describe('search ranking', () => {
  it('prefers whole-word alias matches over prefixes for short queries', () => {
    const results = ids('cat');
    expect(results[0]).toBe('cat');
    const cow = results.indexOf('cow');
    const lion = results.indexOf('lion');
    if (cow >= 0 && lion >= 0) expect(lion).toBeLessThan(cow);
  });
});

describe('localized search', () => {
  it('matches names in other scripts', () => {
    const korean = searchAnimals('사자', (def) => (def.id === 'lion' ? ['사자'] : []));
    expect(korean[0]?.id).toBe('lion');
    const partial = searchAnimals('사', (def) => (def.id === 'lion' ? ['사자'] : []));
    expect(partial.map((d) => d.id)).toContain('lion');
    const japanese = searchAnimals('ライオン', (def) => (def.id === 'lion' ? ['ライオン'] : []));
    expect(japanese[0]?.id).toBe('lion');
  });

  it("ranks a sticker's own name above another sticker's alias", () => {
    const terms = (def: { id: string }) =>
      def.id === 'cat' ? ['고양이'] : def.id === 'black-cat' ? ['검은 고양이', '고양이'] : [];
    expect(searchAnimals('고양이', terms)[0]?.id).toBe('cat');
    expect(searchAnimals('고양', terms)[0]?.id).toBe('cat');
  });
});

describe('normalize', () => {
  it('folds Latin accents but keeps other scripts intact', async () => {
    const { normalize } = await import('./animals');
    expect(normalize('Éléphant')).toBe('elephant');
    expect(normalize('Đà điểu')).toBe('da dieu');
    expect(normalize('が')).toBe('が');
    expect(normalize('หมูเด้ง')).toBe('หมูเด้ง');
    expect(normalize('사자!')).toBe('사자');
  });
});

describe('normalize folds common typing variants', () => {
  it('handles Cyrillic and Arabic letter variants', async () => {
    const { normalize } = await import('./animals');
    expect(normalize('Ёжик')).toBe('ежик');
    expect(normalize('أسد')).toBe('اسد');
    expect(normalize('زرافة')).toBe('زرافه');
    expect(normalize('مُوسَى')).toBe('موسي');
  });

  it('lets an exact nickname beat a partial name match', () => {
    const results = searchAnimals('mono', (def) =>
      def.id === 'monkey' ? ['Mono'] : def.id === 'gibbon' ? ['Gibón', 'monogibbon'] : [],
    );
    expect(results[0]?.id).toBe('monkey');
  });
});
