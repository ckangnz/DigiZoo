import { gaitPeriod, gaitStride, travelFactor } from '../art/core/motion';
import { getAnimal } from '../registry/animals';
import { getTheme } from '../registry/themes';
import { useStore } from '../store/store';
import { useCamera } from './camera';
import { halfWidth, metricsOf } from './geometry';

type RigUpdate = (phase: number) => void;

interface Walk {
  id: string;
  phase: number;
  last: number;
  originX: number;
  pausedUntil: number;
}

let rig: { id: string; update: RigUpdate } | null = null;
let current: Walk | null = null;
let frame = 0;

const EDGE_MARGIN = 30;
const SCREEN_MARGIN = 16;
const CYCLES_EACH_WAY = 2.5;
const TURN_PAUSE_MS = 320;

export function attachRig(id: string, update: RigUpdate): () => void {
  rig = { id, update };
  if (current?.id === id) update(current.phase);
  return () => {
    if (rig?.id === id) rig = null;
  };
}

export function patrolBounds(
  originX: number,
  reach: number,
  half: number,
  worldW: number,
  view: [number, number] | null,
): [number, number] {
  let lo = originX - reach;
  let hi = originX + reach;
  if (view) {
    lo = Math.max(lo, view[0] + half);
    hi = Math.min(hi, view[1] - half);
  }
  lo = Math.max(lo, half + EDGE_MARGIN);
  hi = Math.min(hi, worldW - half - EDGE_MARGIN);
  if (hi < lo) {
    const mid = (lo + hi) / 2;
    return [mid, mid];
  }
  return [lo, hi];
}

function visibleWorldRange(): [number, number] | null {
  const { t, vp } = useCamera.getState();
  if (vp.w <= 1) return null;
  const pad = SCREEN_MARGIN / t.s;
  return [-t.tx / t.s + pad, (vp.w - t.tx) / t.s - pad];
}

function tick(now: number) {
  frame = 0;
  const state = useStore.getState();
  if (!current || state.walkingId !== current.id) return;
  const walk = current;
  const st = state.stickers.find((s) => s.id === walk.id);
  const def = st && getAnimal(st.animalId);
  if (!st || !def) {
    state.stopWalk();
    return;
  }
  const dt = Math.min(0.05, Math.max(0, (now - walk.last) / 1000));
  walk.last = now;
  if (now < walk.pausedUntil) {
    frame = requestAnimationFrame(tick);
    return;
  }
  const period = gaitPeriod(def);
  walk.phase += dt / period;
  const m = metricsOf(def);
  const strideWorld = gaitStride(def) * m.k * st.scale;
  const speed = strideWorld / period;
  const dir = st.flipX ? -1 : 1;
  const half = halfWidth(st, def);
  const worldW = getTheme(state.themeId).scene.world[0];
  const [lo, hi] = patrolBounds(
    walk.originX,
    Math.max(strideWorld * CYCLES_EACH_WAY, half * 0.6),
    half,
    worldW,
    visibleWorldRange(),
  );
  const roomToWalk = hi - lo > 1;
  let x = roomToWalk ? st.x + dir * speed * travelFactor(def, walk.phase) * dt : st.x;
  x = Math.min(worldW - half - EDGE_MARGIN, Math.max(half + EDGE_MARGIN, x));
  let flipX = st.flipX;
  if (roomToWalk && speed > 0 && ((dir > 0 && x >= hi) || (dir < 0 && x <= lo))) {
    flipX = !flipX;
    walk.pausedUntil = now + TURN_PAUSE_MS;
  }
  state.patch(st.id, { x, flipX });
  if (rig?.id === st.id) rig.update(walk.phase);
  frame = requestAnimationFrame(tick);
}

function start(id: string) {
  stop();
  const st = useStore.getState().stickers.find((s) => s.id === id);
  if (!st) return;
  current = { id, phase: 0, last: performance.now(), originX: st.x, pausedUntil: 0 };
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
