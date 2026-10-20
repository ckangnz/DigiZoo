import { describe, expect, it } from 'vitest';
import { renderAnimal } from '../core/render';
import { STYLES } from '../core/types';
import { validateAnimal } from '../core/validate';
import { ANIMALS } from '../../registry/animals';

describe('animal registry', () => {
  it('has unique ids', () => {
    const ids = ANIMALS.map((a) => a.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it.each(ANIMALS.map((a) => [a.id, a] as const))('%s passes validation', (_id, def) => {
    expect(validateAnimal(def)).toEqual([]);
  });

  it.each(ANIMALS.map((a) => [a.id, a] as const))('%s renders every style and pose', (_id, def) => {
    for (const style of STYLES) {
      const svg = renderAnimal(def, { style });
      expect(svg.startsWith('<svg')).toBe(true);
      expect(svg).not.toContain('NaN');
      const live = renderAnimal(def, { style, live: true, idPrefix: 'w1', phase: 0.42 });
      expect(live).not.toContain('NaN');
    }
  });
});
