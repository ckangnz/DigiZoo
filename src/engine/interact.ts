import { playSfx } from '../audio/engine';
import type { Interactive, InteractEffect } from '../art/scenes/types';
import { getTheme } from '../registry/themes';
import { useStore } from '../store/store';
import { spawnEffect, type EffectKind } from '../ui/fxStore';
import { useCamera } from './camera';
import { screenToWorld } from './viewport';

const TOP_EFFECTS: InteractEffect[] = ['leaves', 'fruit', 'petals'];

function restart(el: Element, classes: string[]) {
  el.classList.remove('act', ...classes);
  void (el as HTMLElement).getBoundingClientRect();
  el.classList.add('act', ...classes);
  const done = (e: Event) => {
    if (e.target !== el) return;
    el.classList.remove('act', ...classes);
    el.removeEventListener('animationend', done);
  };
  el.addEventListener('animationend', done);
  setTimeout(() => el.classList.remove('act', ...classes), 2600);
}

function effectPoint(it: Interactive, effect: InteractEffect): [number, number] {
  if (it.effectAt) return it.effectAt;
  const [x, y, w, h] = it.box;
  return TOP_EFFECTS.includes(effect) ? [x + w / 2, y + h * 0.2] : [x + w / 2, y + h / 2];
}

export function triggerInteractive(el: Element, it: Interactive, night: boolean): void {
  const kind = (night && it.night?.kind) || it.kind;
  const effect = (night && it.night?.effect) || it.effect;
  const sound = (night && it.night?.sound) || it.sound;
  restart(el, [`act-${kind}`]);
  if (effect) {
    const [ex, ey] = effectPoint(it, effect);
    const [, , w, h] = it.box;
    spawnEffect(effect as EffectKind, ex, ey, Math.min(520, Math.max(160, Math.max(w, h) * 0.7)));
  }
  playSfx(sound ?? 'boing');
}

function screenPointToWorld(clientX: number, clientY: number): [number, number] {
  const map = document.querySelector('.map');
  const r = map?.getBoundingClientRect();
  return screenToWorld(useCamera.getState().t, clientX - (r?.left ?? 0), clientY - (r?.top ?? 0));
}

function triggerCloud(el: HTMLElement) {
  restart(el, ['cloud-tap']);
  const r = el.getBoundingClientRect();
  const [x, y] = screenPointToWorld(r.left + r.width / 2, r.top + r.height * 0.75);
  const [x2] = screenPointToWorld(r.right, r.top);
  spawnEffect('rain', x, y, Math.max(120, (x2 - x) * 2));
  playSfx('rain');
}

export function tapBackground(clientX: number, clientY: number): boolean {
  if (typeof document === 'undefined' || !document.elementsFromPoint) return false;
  const s = useStore.getState();
  const scene = getTheme(s.themeId).scene;
  for (const el of document.elementsFromPoint(clientX, clientY)) {
    if (el.closest('[data-ui]')) return false;
    const host = el.closest('[data-interactive]');
    if (host) {
      const it = scene.interactives?.find((i) => i.id === host.getAttribute('data-interactive'));
      if (it) {
        triggerInteractive(host, it, s.night);
        return true;
      }
    }
    if (el instanceof HTMLElement && el.classList.contains('cloud')) {
      triggerCloud(el);
      return true;
    }
  }
  return false;
}
