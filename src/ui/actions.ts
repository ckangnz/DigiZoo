import { cancelSpeech, playAnimal, playSfx, speak } from '../audio/engine';
import type { StyleId } from '../art/core/types';
import { useCamera } from '../engine/camera';
import { frameOf } from '../engine/geometry';
import { screenToWorld } from '../engine/viewport';
import { getAnimal } from '../registry/animals';
import { useStore } from '../store/store';
import { spawnEffect } from './fxStore';

let talkTimer: ReturnType<typeof setTimeout> | undefined;

const store = () => useStore.getState();

function stickerFrame(id: string) {
  const st = store().stickers.find((s) => s.id === id);
  const def = st && getAnimal(st.animalId);
  return st && def ? { st, def, frame: frameOf(st, def) } : null;
}

export function playSticker(id: string): void {
  const found = stickerFrame(id);
  if (!found) return;
  const { def, frame } = found;
  const duration = playAnimal(def.sound || def.id);
  store().setTalking(id);
  clearTimeout(talkTimer);
  talkTimer = setTimeout(
    () => {
      if (store().talkingId === id) store().setTalking(null);
    },
    Math.max(500, duration * 1000),
  );
  spawnEffect('notes', frame.cx + frame.w * 0.15, frame.cy - frame.h * 0.5, Math.min(260, frame.h));
  if (store().sayNames) speak(def.name, duration * 1000 + 120);
  else cancelSpeech();
}

export function toggleWalk(id: string): void {
  playSfx('click');
  store().startWalk(id);
}

export function viewCenter(): [number, number] {
  const { t, vp } = useCamera.getState();
  return screenToWorld(t, vp.w / 2, vp.h / 2);
}

export function addAnimal(animalId: string, style: StyleId, at?: [number, number]): string | null {
  const def = getAnimal(animalId);
  if (!def) return null;
  const [cx, cy] = at ?? viewCenter();
  const jitter = at ? 0 : 60;
  const x = cx + (Math.random() - 0.5) * jitter;
  const y = cy + (Math.random() - 0.5) * jitter;
  const id = store().add(animalId, style, x, y);
  store().bumpSticker(id, 'pop');
  playSfx('pop');
  spawnEffect('sparkle', x, y, def.size * 1.1);
  return id;
}

export function removeSticker(id: string): void {
  const found = stickerFrame(id);
  if (found)
    spawnEffect('poof', found.frame.cx, found.frame.cy, Math.max(found.frame.w, found.frame.h));
  playSfx('poof');
  store().remove(id);
}

export function duplicateSticker(id: string): void {
  store().duplicate(id);
  const copyId = store().selectedId;
  if (copyId) {
    store().bumpSticker(copyId, 'pop');
    const found = stickerFrame(copyId);
    if (found) spawnEffect('sparkle', found.frame.cx, found.frame.cy, found.frame.h);
  }
  playSfx('sparkle');
}

export function flipSticker(id: string): void {
  store().flip(id);
  playSfx('whoosh');
}

export function bringForward(id: string): void {
  store().forward(id);
  playSfx('stepUp');
}

export function sendBackward(id: string): void {
  store().backward(id);
  playSfx('stepDown');
}

export function nudgeSticker(id: string, dx: number, dy: number): void {
  const st = store().stickers.find((s) => s.id === id);
  if (!st) return;
  store().checkpoint();
  store().patch(id, { x: st.x + dx, y: st.y + dy });
}
