import { gaitPeriod, gaitStride, travelFactor } from '../art/core/motion';
import { getAnimal } from '../registry/animals';
import { getTheme } from '../registry/themes';
import { useStore } from '../store/store';
import { halfWidth, metricsOf } from './geometry';

type RigUpdate = (phase: number) => void;

let rig: { id: string; update: RigUpdate } | null = null;
let current: { id: string; phase: number; last: number } | null = null;
let frame = 0;

const EDGE_MARGIN = 30;

export function attachRig(id: string, update: RigUpdate): () => void {
  rig = { id, update };
  if (current?.id === id) update(current.phase);
  return () => {
    if (rig?.id === id) rig = null;
  };
}

function tick(now: number) {
  frame = 0;
  const state = useStore.getState();
  if (!current || state.walkingId !== current.id) return;
  const st = state.stickers.find((s) => s.id === current!.id);
  const def = st && getAnimal(st.animalId);
  if (!st || !def) {
    state.stopWalk();
    return;
  }
  const dt = Math.min(0.05, Math.max(0, (now - current.last) / 1000));
  current.last = now;
  const period = gaitPeriod(def);
  current.phase += dt / period;
  const m = metricsOf(def);
  const speed = (gaitStride(def) * m.k * st.scale) / period;
  const dir = st.flipX ? -1 : 1;
  let x = st.x + dir * speed * travelFactor(def, current.phase) * dt;
  let flipX = st.flipX;
  const worldW = getTheme(state.themeId).scene.world[0];
  const half = halfWidth(st, def);
  if (dir > 0 && x > worldW - half - EDGE_MARGIN) {
    x = worldW - half - EDGE_MARGIN;
    flipX = true;
  } else if (dir < 0 && x < half + EDGE_MARGIN) {
    x = half + EDGE_MARGIN;
    flipX = false;
  }
  state.patch(st.id, { x, flipX });
  if (rig?.id === st.id) rig.update(current.phase);
  frame = requestAnimationFrame(tick);
}

function start(id: string) {
  stop();
  current = { id, phase: 0, last: performance.now() };
  frame = requestAnimationFrame(tick);
}

function stop() {
  if (frame) cancelAnimationFrame(frame);
  frame = 0;
  current = null;
}

export function isWalkLoopRunning(): boolean {
  return frame !== 0;
}

useStore.subscribe((s, prev) => {
  if (s.walkingId === prev.walkingId) return;
  if (s.walkingId) start(s.walkingId);
  else stop();
});

if (typeof document !== 'undefined') {
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      if (frame) cancelAnimationFrame(frame);
      frame = 0;
    } else if (current && !frame) {
      current.last = performance.now();
      frame = requestAnimationFrame(tick);
    }
  });
}
