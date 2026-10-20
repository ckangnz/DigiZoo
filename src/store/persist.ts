import { STYLES, type HabitatId } from '../art/core/types';
import type { Prefs, Sticker, View } from './types';

const PREFIX = 'digizoo:v1:';
export const MIN_SCALE = 0.25;
export const MAX_SCALE = 5;

function read(key: string): unknown {
  try {
    const raw = localStorage.getItem(PREFIX + key);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function write(key: string, value: unknown): void {
  try {
    localStorage.setItem(PREFIX + key, JSON.stringify(value));
  } catch {
    return;
  }
}

const isNum = (v: unknown): v is number => typeof v === 'number' && Number.isFinite(v);

export function sanitizeStickers(raw: unknown, knownAnimal: (id: string) => boolean): Sticker[] {
  if (!raw || typeof raw !== 'object') return [];
  const list = (raw as { stickers?: unknown }).stickers;
  if (!Array.isArray(list)) return [];
  const seen = new Set<string>();
  const out: Sticker[] = [];
  for (const item of list) {
    if (!item || typeof item !== 'object') continue;
    const s = item as Record<string, unknown>;
    if (typeof s.id !== 'string' || seen.has(s.id)) continue;
    if (typeof s.animalId !== 'string' || !knownAnimal(s.animalId)) continue;
    if (!isNum(s.x) || !isNum(s.y)) continue;
    const style = STYLES.includes(s.style as Sticker['style'])
      ? (s.style as Sticker['style'])
      : 'cartoon';
    const scale = isNum(s.scale) ? Math.min(MAX_SCALE, Math.max(MIN_SCALE, s.scale)) : 1;
    seen.add(s.id);
    out.push({
      id: s.id,
      animalId: s.animalId,
      style,
      x: s.x,
      y: s.y,
      scale,
      rotation: isNum(s.rotation) ? s.rotation : 0,
      flipX: s.flipX === true,
    });
  }
  return out;
}

export function loadScene(
  theme: HabitatId,
  knownAnimal: (id: string) => boolean,
): Sticker[] | null {
  const raw = read(`scene:${theme}`);
  if (!raw) return null;
  return sanitizeStickers(raw, knownAnimal);
}

export function saveScene(theme: HabitatId, stickers: Sticker[]): void {
  write(`scene:${theme}`, {
    v: 1,
    stickers: stickers.map((s) => ({
      ...s,
      x: Math.round(s.x * 10) / 10,
      y: Math.round(s.y * 10) / 10,
      scale: Math.round(s.scale * 1000) / 1000,
      rotation: Math.round(s.rotation * 10) / 10,
    })),
  });
}

export function loadView(theme: HabitatId): View | null {
  const raw = read(`view:${theme}`) as Partial<View> | null;
  if (!raw || !isNum(raw.cx) || !isNum(raw.cy) || !isNum(raw.z)) return null;
  return { cx: raw.cx, cy: raw.cy, z: raw.z };
}

export function saveView(theme: HabitatId, view: View): void {
  write(`view:${theme}`, view);
}

export function loadPrefs(isTheme: (id: string) => boolean): Prefs {
  const raw = (read('prefs') ?? {}) as Partial<Prefs>;
  return {
    themeId: typeof raw.themeId === 'string' && isTheme(raw.themeId) ? raw.themeId : null,
    night: raw.night === true,
    muted: raw.muted === true,
    sayNames: raw.sayNames !== false,
  };
}

export function savePrefs(prefs: Prefs): void {
  write('prefs', prefs);
}
