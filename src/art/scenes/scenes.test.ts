import { describe, expect, it } from 'vitest';
import { luminance, parseHex } from '../core/color';
import { getAnimal } from '../../registry/animals';
import { THEMES } from '../../registry/themes';
import { nightColor, paletteFor, renderScene } from './render';

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

  it.each(THEMES.map((t) => [t.id, t.scene] as const))(
    '%s interactives are valid',
    (_id, scene) => {
      const [w, h] = scene.world;
      const items = scene.interactives ?? [];
      expect(new Set(items.map((i) => i.id)).size).toBe(items.length);
      for (const it of items) {
        const [x, y, bw, bh] = it.box;
        expect(bw, it.id).toBeGreaterThan(0);
        expect(bh, it.id).toBeGreaterThan(0);
        expect(x + bw, it.id).toBeGreaterThan(0);
        expect(x, it.id).toBeLessThan(w);
        expect(y + bh, it.id).toBeGreaterThan(0);
        expect(y, it.id).toBeLessThan(h);
        for (const mode of ['day', 'night'] as const) {
          const markup = it.render(paletteFor(scene, mode), mode);
          expect(markup.length, it.id).toBeGreaterThan(20);
          expect(markup, it.id).not.toContain('NaN');
          expect(markup, it.id).not.toContain('undefined');
        }
      }
    },
  );

  it.each(
    THEMES.filter((t) => t.id !== 'space' && t.id !== 'body').map((t) => [t.id, t.scene] as const),
  )('%s has a tappable sun and moon', (_id, scene) => {
    expect(scene.interactives?.some((i) => i.id === 'sun')).toBe(true);
  });

  it('derives a darker, bluer night colour', () => {
    const day = '#f5d880';
    const night = nightColor(day);
    const [r, , b] = parseHex(night);
    expect(luminance(night)).toBeLessThan(luminance(day) * 0.4);
    expect(b).toBeGreaterThan(r);
  });
});
