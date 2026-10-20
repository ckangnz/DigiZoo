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
