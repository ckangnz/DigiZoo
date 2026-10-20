import { create } from 'zustand';
import type { HabitatId, StyleId } from '../art/core/types';
import { getAnimal } from '../registry/animals';
import { DEFAULT_THEME, getTheme, hasTheme } from '../registry/themes';
import {
  MAX_SCALE,
  MIN_SCALE,
  loadPrefs,
  loadScene,
  loadView,
  savePrefs,
  saveScene,
  saveView,
} from './persist';
import type { Sticker, View } from './types';

const HISTORY_LIMIT = 50;
let history: Sticker[][] = [];

let idCounter = 0;
export function newId(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) return crypto.randomUUID();
  idCounter += 1;
  return `s${Date.now().toString(36)}${idCounter}${Math.random().toString(36).slice(2, 8)}`;
}

const known = (id: string) => !!getAnimal(id);

export function defaultStickers(theme: HabitatId): Sticker[] {
  return getTheme(theme)
    .scene.defaults.filter((p) => known(p.animal))
    .map((p) => ({
      id: newId(),
      animalId: p.animal,
      style: p.style ?? 'cartoon',
      x: p.x,
      y: p.y,
      scale: p.scale ?? 1,
      rotation: p.rotation ?? 0,
      flipX: p.flip ?? false,
    }));
}

function stickersFor(theme: HabitatId): Sticker[] {
  return loadScene(theme, known) ?? defaultStickers(theme);
}

export type BumpKind = 'wiggle' | 'pop';

export interface State {
  themeId: HabitatId;
  pickerOpen: boolean;
  firstRun: boolean;
  night: boolean;
  muted: boolean;
  sayNames: boolean;
  panelOpen: boolean;
  stickers: Sticker[];
  view: View | null;
  selectedId: string | null;
  walkingId: string | null;
  talkingId: string | null;
  canUndo: boolean;
  bump: { id: string; n: number; kind: BumpKind } | null;
}

export interface Actions {
  openTheme: (id: HabitatId) => void;
  setPickerOpen: (open: boolean) => void;
  setPanelOpen: (open: boolean) => void;
  toggleNight: () => void;
  setMuted: (muted: boolean) => void;
  setSayNames: (on: boolean) => void;
  setView: (view: View) => void;
  select: (id: string | null) => void;
  bumpSticker: (id: string, kind?: BumpKind) => void;
  checkpoint: () => void;
  add: (animalId: string, style: StyleId, x: number, y: number, scale?: number) => string;
  patch: (id: string, patch: Partial<Omit<Sticker, 'id' | 'animalId'>>) => void;
  duplicate: (id: string) => void;
  remove: (id: string) => void;
  flip: (id: string) => void;
  forward: (id: string) => void;
  backward: (id: string) => void;
  clearAll: () => void;
  resetDefaults: () => void;
  undo: () => void;
  startWalk: (id: string) => void;
  stopWalk: () => void;
  setTalking: (id: string | null) => void;
}

const prefs = loadPrefs(hasTheme);
const initialTheme: HabitatId = prefs.themeId ?? DEFAULT_THEME;
let hasChosenTheme = prefs.themeId !== null;

function pushHistory(stickers: Sticker[]): boolean {
  history.push(stickers);
  if (history.length > HISTORY_LIMIT) history.shift();
  return true;
}

export const useStore = create<State & Actions>()((set, get) => ({
  themeId: initialTheme,
  pickerOpen: prefs.themeId === null,
  firstRun: prefs.themeId === null,
  night: prefs.night,
  muted: prefs.muted,
  sayNames: prefs.sayNames,
  panelOpen: false,
  stickers: stickersFor(initialTheme),
  view: loadView(initialTheme),
  selectedId: null,
  walkingId: null,
  talkingId: null,
  canUndo: false,
  bump: null,

  openTheme: (id) => {
    const s = get();
    flushSaves();
    if (id !== s.themeId) {
      history = [];
      set({
        themeId: id,
        stickers: stickersFor(id),
        view: loadView(id),
        selectedId: null,
        walkingId: null,
        talkingId: null,
        canUndo: false,
        pickerOpen: false,
        firstRun: false,
      });
    } else {
      set({ pickerOpen: false, firstRun: false });
    }
  },
  setPickerOpen: (open) => set({ pickerOpen: open, selectedId: open ? null : get().selectedId }),
  setPanelOpen: (open) => set({ panelOpen: open }),
  toggleNight: () => set({ night: !get().night }),
  setMuted: (muted) => set({ muted }),
  setSayNames: (on) => set({ sayNames: on }),
  setView: (view) => set({ view }),
  select: (id) => set({ selectedId: id }),
  bumpSticker: (id, kind = 'wiggle') => set({ bump: { id, n: (get().bump?.n ?? 0) + 1, kind } }),

  checkpoint: () => set({ canUndo: pushHistory(get().stickers) }),

  add: (animalId, style, x, y, scale = 1) => {
    const id = newId();
    const sticker: Sticker = { id, animalId, style, x, y, scale, rotation: 0, flipX: false };
    pushHistory(get().stickers);
    set({ stickers: [...get().stickers, sticker], selectedId: id, canUndo: true });
    return id;
  },

  patch: (id, patch) => {
    const next = { ...patch };
    if (next.scale !== undefined) next.scale = Math.min(MAX_SCALE, Math.max(MIN_SCALE, next.scale));
    set({ stickers: get().stickers.map((s) => (s.id === id ? { ...s, ...next } : s)) });
  },

  duplicate: (id) => {
    const src = get().stickers.find((s) => s.id === id);
    if (!src) return;
    const offset = 70;
    const copy: Sticker = { ...src, id: newId(), x: src.x + offset, y: src.y + offset * 0.4 };
    pushHistory(get().stickers);
    const list = get().stickers;
    const index = list.findIndex((s) => s.id === id);
    const next = [...list.slice(0, index + 1), copy, ...list.slice(index + 1)];
    set({ stickers: next, selectedId: copy.id, canUndo: true });
  },

  remove: (id) => {
    pushHistory(get().stickers);
    const s = get();
    set({
      stickers: s.stickers.filter((st) => st.id !== id),
      selectedId: s.selectedId === id ? null : s.selectedId,
      walkingId: s.walkingId === id ? null : s.walkingId,
      canUndo: true,
    });
  },

  flip: (id) => {
    pushHistory(get().stickers);
    set({
      stickers: get().stickers.map((s) => (s.id === id ? { ...s, flipX: !s.flipX } : s)),
      canUndo: true,
    });
  },

  forward: (id) => {
    const list = get().stickers;
    const i = list.findIndex((s) => s.id === id);
    if (i < 0 || i === list.length - 1) return;
    pushHistory(list);
    const next = list.slice();
    [next[i], next[i + 1]] = [next[i + 1], next[i]];
    set({ stickers: next, canUndo: true });
  },

  backward: (id) => {
    const list = get().stickers;
    const i = list.findIndex((s) => s.id === id);
    if (i <= 0) return;
    pushHistory(list);
    const next = list.slice();
    [next[i], next[i - 1]] = [next[i - 1], next[i]];
    set({ stickers: next, canUndo: true });
  },

  clearAll: () => {
    pushHistory(get().stickers);
    set({ stickers: [], selectedId: null, walkingId: null, talkingId: null, canUndo: true });
  },

  resetDefaults: () => {
    pushHistory(get().stickers);
    set({
      stickers: defaultStickers(get().themeId),
      selectedId: null,
      walkingId: null,
      talkingId: null,
      canUndo: true,
    });
  },

  undo: () => {
    const prev = history.pop();
    if (!prev) return;
    const selected = get().selectedId;
    set({
      stickers: prev,
      walkingId: null,
      selectedId: prev.some((s) => s.id === selected) ? selected : null,
      canUndo: history.length > 0,
    });
  },

  startWalk: (id) => {
    if (get().walkingId === id) {
      set({ walkingId: null });
      return;
    }
    pushHistory(get().stickers);
    set({ walkingId: id, canUndo: true });
  },
  stopWalk: () => set({ walkingId: null }),
  setTalking: (id) => set({ talkingId: id }),
}));

let sceneTimer: ReturnType<typeof setTimeout> | undefined;
let viewTimer: ReturnType<typeof setTimeout> | undefined;

function saveSceneNow() {
  clearTimeout(sceneTimer);
  sceneTimer = undefined;
  const s = useStore.getState();
  saveScene(s.themeId, s.stickers);
}

function saveViewNow() {
  clearTimeout(viewTimer);
  viewTimer = undefined;
  const s = useStore.getState();
  if (s.view) saveView(s.themeId, s.view);
}

export function flushSaves(): void {
  if (sceneTimer !== undefined) saveSceneNow();
  if (viewTimer !== undefined) saveViewNow();
}

useStore.subscribe((s, prev) => {
  if (s.themeId !== prev.themeId) return;
  if (s.stickers !== prev.stickers) {
    clearTimeout(sceneTimer);
    sceneTimer = setTimeout(saveSceneNow, s.walkingId ? 2000 : 350);
  }
  if (s.view !== prev.view) {
    clearTimeout(viewTimer);
    viewTimer = setTimeout(saveViewNow, 600);
  }
});

useStore.subscribe((s, prev) => {
  if (
    s.themeId !== prev.themeId ||
    s.night !== prev.night ||
    s.muted !== prev.muted ||
    s.sayNames !== prev.sayNames ||
    s.pickerOpen !== prev.pickerOpen
  ) {
    if (!s.pickerOpen) hasChosenTheme = true;
    savePrefs({
      themeId: hasChosenTheme ? s.themeId : null,
      night: s.night,
      muted: s.muted,
      sayNames: s.sayNames,
    });
  }
});

if (typeof window !== 'undefined') {
  window.addEventListener('pagehide', flushSaves);
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) flushSaves();
  });
}

export function selectedSticker(s: State): Sticker | undefined {
  return s.selectedId ? s.stickers.find((st) => st.id === s.selectedId) : undefined;
}
