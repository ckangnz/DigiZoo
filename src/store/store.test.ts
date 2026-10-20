import { beforeEach, describe, expect, it } from 'vitest';
import { loadPrefs, loadScene, saveScene, sanitizeStickers } from './persist';
import { defaultStickers, flushSaves, useStore } from './store';

const known = (id: string) => ['lion', 'chicken', 'fish', 'snake'].includes(id);

function reset() {
  const s = useStore.getState();
  s.openTheme('safari');
  s.clearAll();
}

describe('persistence', () => {
  beforeEach(() => localStorage.clear());

  it('drops invalid stickers and clamps scale', () => {
    const out = sanitizeStickers(
      {
        stickers: [
          { id: 'a', animalId: 'lion', style: 'comic', x: 10, y: 20, scale: 99, rotation: 5 },
          { id: 'a', animalId: 'lion', x: 1, y: 1 },
          { id: 'b', animalId: 'unicorn', x: 1, y: 1 },
          { id: 'c', animalId: 'fish', x: 'nope', y: 1 },
          { id: 'd', animalId: 'snake', style: 'weird', x: 5, y: 6, flipX: true },
        ],
      },
      known,
    );
    expect(out.map((s) => s.id)).toEqual(['a', 'd']);
    expect(out[0].scale).toBe(5);
    expect(out[0].style).toBe('comic');
    expect(out[1].style).toBe('cartoon');
    expect(out[1].flipX).toBe(true);
  });

  it('round-trips a scene through localStorage', () => {
    saveScene('farm', [
      {
        id: 'x',
        animalId: 'chicken',
        style: 'painted',
        x: 1.234,
        y: 5,
        scale: 1.5,
        rotation: 12.34,
        flipX: false,
      },
    ]);
    const back = loadScene('farm', known);
    expect(back).toEqual([
      {
        id: 'x',
        animalId: 'chicken',
        style: 'painted',
        x: 1.2,
        y: 5,
        scale: 1.5,
        rotation: 12.3,
        flipX: false,
      },
    ]);
    expect(loadScene('ocean', known)).toBeNull();
  });

  it('survives corrupt storage', () => {
    localStorage.setItem('digizoo:v1:scene:farm', '{nope');
    localStorage.setItem('digizoo:v1:prefs', '"x"');
    expect(loadScene('farm', known)).toBeNull();
    expect(loadPrefs(() => true)).toEqual({
      themeId: null,
      night: false,
      muted: false,
      sayNames: true,
    });
  });
});

describe('store actions', () => {
  beforeEach(() => {
    localStorage.clear();
    reset();
  });

  it('adds, duplicates, flips, reorders and removes stickers', () => {
    const s = () => useStore.getState();
    const a = s().add('lion', 'cartoon', 100, 100);
    const b = s().add('fish', 'comic', 200, 200);
    expect(s().selectedId).toBe(b);
    s().duplicate(a);
    const ids = s().stickers.map((x) => x.id);
    expect(ids[0]).toBe(a);
    expect(ids[2]).toBe(b);
    const copy = ids[1];
    expect(s().stickers[1].x).toBeGreaterThan(100);
    s().flip(copy);
    expect(s().stickers.find((x) => x.id === copy)?.flipX).toBe(true);
    s().forward(a);
    expect(s().stickers[1].id).toBe(a);
    s().backward(b);
    expect(s().stickers.map((x) => x.id)).toEqual([copy, b, a]);
    s().remove(copy);
    expect(s().stickers.map((x) => x.id)).toEqual([b, a]);
  });

  it('undoes step by step', () => {
    const s = () => useStore.getState();
    const a = s().add('lion', 'cartoon', 100, 100);
    s().flip(a);
    s().remove(a);
    expect(s().stickers).toHaveLength(0);
    s().undo();
    expect(s().stickers[0].flipX).toBe(true);
    s().undo();
    expect(s().stickers[0].flipX).toBe(false);
    s().undo();
    expect(s().stickers).toHaveLength(0);
  });

  it('only ever has one walker', () => {
    const s = () => useStore.getState();
    const a = s().add('lion', 'cartoon', 100, 100);
    const b = s().add('chicken', 'cartoon', 300, 100);
    s().startWalk(a);
    expect(s().walkingId).toBe(a);
    s().startWalk(b);
    expect(s().walkingId).toBe(b);
    s().startWalk(b);
    expect(s().walkingId).toBeNull();
    s().startWalk(a);
    s().remove(a);
    expect(s().walkingId).toBeNull();
  });

  it('clears and restores starter animals', () => {
    const s = () => useStore.getState();
    s().add('lion', 'cartoon', 1, 1);
    s().clearAll();
    expect(s().stickers).toHaveLength(0);
    s().resetDefaults();
    expect(s().stickers.length).toBe(defaultStickers('safari').length);
  });

  it('persists the scene for the current theme', () => {
    const s = () => useStore.getState();
    s().add('lion', 'painted', 42, 24);
    flushSaves();
    const saved = loadScene('safari', known);
    expect(saved?.some((x) => x.animalId === 'lion' && x.x === 42 && x.style === 'painted')).toBe(
      true,
    );
  });
});
