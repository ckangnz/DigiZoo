import { describe, expect, it } from 'vitest';
import { ANIMALS } from '../registry/animals';
import { hasRecipe } from './engine';
import { SFX } from './sfx';
import type { SfxName } from './types';

const SFX_NAMES: SfxName[] = [
  'pop',
  'poof',
  'boing',
  'whoosh',
  'click',
  'sparkle',
  'tick',
  'chime',
  'swoosh',
  'stepUp',
  'stepDown',
  'yum',
  'yuck',
  'munch',
  'rustle',
  'splash',
  'rumble',
  'rain',
  'twinkle',
  'creak',
  'honk',
  'coins',
  'bubble',
  'boo',
  'shine',
  'whirr',
  'giggle',
  'thump',
  'cardFlip',
  'match',
  'noMatch',
  'win',
];

describe('sounds', () => {
  it.each(ANIMALS.map((a) => [a.id, a.sound] as const))('%s has a sound recipe', (_id, sound) => {
    expect(hasRecipe(sound)).toBe(true);
  });

  it('has every UI sound effect', () => {
    for (const name of SFX_NAMES) expect(typeof SFX[name]).toBe('function');
  });
});
