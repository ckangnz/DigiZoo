import { describe, expect, it } from 'vitest';
import { luminance, parseHex } from '../core/color';
import { getAnimal } from '../../registry/animals';
import { THEMES } from '../../registry/themes';
import { nightColor, renderScene } from './render';

describe('scenes', () => {
  it('registers at least the safari theme', () => {
    expect(THEMES.map((t) => t.id)).toContain('safari');
  });

  it.each(THEMES.map((t) => [t.id, t.scene] as const))('%s renders day and night', (_id, scene) => {
    for (const mode of ['day', 'night'] as const) {
      const { back, front } = renderScene(scene, mode);
      expect(back.startsWith('<svg')).toBe(true);
      expect(front.startsWith('<svg')).toBe(true);
      expect(back).not.toContain('NaN');
      expect(back).not.toContain('undefined');
      expect(front).not.toContain('undefined');
    }
  });

  it.each(THEMES.map((t) => [t.id, t.scene] as const))(
    '%s starter animals exist and sit inside the world',
    (_id, scene) => {
      const [w, h] = scene.world;
      expect(scene.defaults.length).toBeGreaterThan(0);
      for (const p of scene.defaults) {
        expect(getAnimal(p.animal), p.animal).toBeDefined();
        expect(p.x).toBeGreaterThan(0);
        expect(p.x).toBeLessThan(w);
        expect(p.y).toBeGreaterThan(0);
        expect(p.y).toBeLessThan(h);
      }
    },
  );

  it('derives a darker, bluer night colour', () => {
    const day = '#f5d880';
    const night = nightColor(day);
    const [r, , b] = parseHex(night);
    expect(luminance(night)).toBeLessThan(luminance(day) * 0.4);
    expect(b).toBeGreaterThan(r);
  });
});
