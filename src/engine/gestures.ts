import { playSfx } from '../audio/engine';
import { getAnimal } from '../registry/animals';
import { getTheme } from '../registry/themes';
import { useStore } from '../store/store';
import type { Sticker } from '../store/types';
import {
  setCamera,
  setMoving,
  startMomentum,
  stopCameraMotion,
  useCamera,
  zoomAtPoint,
} from './camera';
import { frameOf, hitTest } from './geometry';
import { MAX_ZOOM, coverScale, screenToWorld, worldToScreen } from './viewport';

type Mode =
  | 'idle'
  | 'pendingSticker'
  | 'dragSticker'
  | 'pendingMap'
  | 'pan'
  | 'pinchSticker'
  | 'pinchMap'
  | 'rotate'
  | 'scale';

interface Pointer {
  x: number;
  y: number;
  sx: number;
  sy: number;
}

const TAP_SLOP = 8;
const SNAP_DEG = 6;

const deg = (rad: number) => (rad * 180) / Math.PI;

export function snapRotation(angle: number): number {
  let a = (((angle % 360) + 540) % 360) - 180;
  for (const target of [-180, -90, 0, 90, 180]) {
    if (Math.abs(a - target) < SNAP_DEG) a = target;
  }
  return a === -180 ? 180 : a;
}

export function attachGestures(el: HTMLElement): () => void {
  const pointers = new Map<number, Pointer>();
  let mode: Mode = 'idle';
  let targetId: string | null = null;
  let base = {
    px: 0,
    py: 0,
    wx: 0,
    wy: 0,
    x: 0,
    y: 0,
    scale: 1,
    rotation: 0,
    dist: 1,
    angle: 0,
    midX: 0,
    midY: 0,
    cx: 0,
    cy: 0,
    t: useCamera.getState().t,
  };
  let velocity = { x: 0, y: 0 };
  let lastMove = { x: 0, y: 0, time: 0 };
  let wheelTimer: ReturnType<typeof setTimeout> | undefined;

  const store = () => useStore.getState();
  const cam = () => useCamera.getState();
  const target = (): Sticker | undefined =>
    targetId ? store().stickers.find((s) => s.id === targetId) : undefined;

  const local = (e: PointerEvent | WheelEvent): [number, number] => {
    const r = el.getBoundingClientRect();
    return [e.clientX - r.left, e.clientY - r.top];
  };

  const two = (): [Pointer, Pointer] => {
    const [a, b] = [...pointers.values()];
    return [a, b];
  };

  const stopWalkIfTarget = () => {
    if (targetId && store().walkingId === targetId) store().stopWalk();
  };

  const clampToWorld = (x: number, y: number): [number, number] => {
    const [w, h] = getTheme(store().themeId).scene.world;
    return [Math.min(w, Math.max(0, x)), Math.min(h, Math.max(0, y))];
  };

  const baselineDrag = (p: Pointer) => {
    const st = target();
    if (!st) return;
    const [wx, wy] = screenToWorld(cam().t, p.x, p.y);
    base = { ...base, wx, wy, x: st.x, y: st.y };
  };

  const baselinePan = (p: Pointer) => {
    base = { ...base, px: p.x, py: p.y, t: cam().t };
    velocity = { x: 0, y: 0 };
    lastMove = { x: p.x, y: p.y, time: performance.now() };
  };

  const baselinePinch = () => {
    const [a, b] = two();
    const st = target();
    base = {
      ...base,
      dist: Math.max(1, Math.hypot(b.x - a.x, b.y - a.y)),
      angle: Math.atan2(b.y - a.y, b.x - a.x),
      midX: (a.x + b.x) / 2,
      midY: (a.y + b.y) / 2,
      t: cam().t,
      scale: st?.scale ?? 1,
      rotation: st?.rotation ?? 0,
      x: st?.x ?? 0,
      y: st?.y ?? 0,
    };
  };

  const baselineHandle = (p: Pointer) => {
    const st = target();
    const def = st && getAnimal(st.animalId);
    if (!st || !def) return;
    const frame = frameOf(st, def);
    const [cx, cy] = worldToScreen(cam().t, frame.cx, frame.cy);
    base = {
      ...base,
      cx,
      cy,
      angle: Math.atan2(p.y - cy, p.x - cx),
      dist: Math.max(1, Math.hypot(p.x - cx, p.y - cy)),
      scale: st.scale,
      rotation: st.rotation,
    };
  };

  const onDown = (e: PointerEvent) => {
    if (e.pointerType === 'mouse' && e.button !== 0) return;
    const el2 = e.target as Element;
    if (el2.closest('[data-ui]')) return;
    const handle = el2.closest('[data-handle]')?.getAttribute('data-handle');
    try {
      el.setPointerCapture(e.pointerId);
    } catch {
      return;
    }
    const [x, y] = local(e);
    pointers.set(e.pointerId, { x, y, sx: x, sy: y });
    stopCameraMotion();
    const s = store();
    if (handle && pointers.size === 1 && s.selectedId) {
      targetId = s.selectedId;
      mode = handle === 'rotate' ? 'rotate' : 'scale';
      s.checkpoint();
      stopWalkIfTarget();
      baselineHandle(pointers.get(e.pointerId)!);
      e.preventDefault();
      return;
    }
    if (pointers.size === 1) {
      const t = cam().t;
      const [wx, wy] = screenToWorld(t, x, y);
      const slop = (e.pointerType === 'touch' ? 14 : 6) / t.s;
      const hit = hitTest(s.stickers, wx, wy, slop);
      if (hit) {
        mode = 'pendingSticker';
        targetId = hit.id;
        if (s.selectedId !== hit.id) {
          s.select(hit.id);
          playSfx('boing');
        }
        s.bumpSticker(hit.id);
        baselineDrag(pointers.get(e.pointerId)!);
      } else {
        mode = 'pendingMap';
        targetId = null;
        baselinePan(pointers.get(e.pointerId)!);
      }
    } else if (pointers.size === 2) {
      if ((mode === 'pendingSticker' || mode === 'dragSticker') && targetId) {
        if (mode === 'pendingSticker') {
          s.checkpoint();
          stopWalkIfTarget();
        }
        mode = 'pinchSticker';
        baselinePinch();
      } else if (mode === 'pendingMap' || mode === 'pan') {
        mode = 'pinchMap';
        setMoving(true);
        baselinePinch();
      }
    }
  };

  const onMove = (e: PointerEvent) => {
    const p = pointers.get(e.pointerId);
    if (!p) return;
    [p.x, p.y] = local(e);
    const s = store();
    switch (mode) {
      case 'pendingSticker':
        if (Math.hypot(p.x - p.sx, p.y - p.sy) < TAP_SLOP) break;
        mode = 'dragSticker';
        s.checkpoint();
        stopWalkIfTarget();
        drag(p);
        break;
      case 'dragSticker':
        drag(p);
        break;
      case 'pendingMap':
        if (Math.hypot(p.x - p.sx, p.y - p.sy) < TAP_SLOP) break;
        mode = 'pan';
        setMoving(true);
        pan(p);
        break;
      case 'pan':
        pan(p);
        break;
      case 'pinchSticker': {
        if (pointers.size < 2 || !targetId) break;
        const [a, b] = two();
        const dist = Math.max(1, Math.hypot(b.x - a.x, b.y - a.y));
        const angle = Math.atan2(b.y - a.y, b.x - a.x);
        const midX = (a.x + b.x) / 2;
        const midY = (a.y + b.y) / 2;
        const t = cam().t;
        const [x, y] = clampToWorld(
          base.x + (midX - base.midX) / t.s,
          base.y + (midY - base.midY) / t.s,
        );
        s.patch(targetId, {
          scale: base.scale * (dist / base.dist),
          rotation: snapRotation(base.rotation + deg(angle - base.angle)),
          x,
          y,
        });
        break;
      }
      case 'pinchMap': {
        if (pointers.size < 2) break;
        const [a, b] = two();
        const dist = Math.max(1, Math.hypot(b.x - a.x, b.y - a.y));
        const midX = (a.x + b.x) / 2;
        const midY = (a.y + b.y) / 2;
        const { world, vp } = cam();
        const cover = coverScale(world, vp);
        const scale = Math.min(cover * MAX_ZOOM, Math.max(cover, base.t.s * (dist / base.dist)));
        const wx = (base.midX - base.t.tx) / base.t.s;
        const wy = (base.midY - base.t.ty) / base.t.s;
        setCamera({ tx: midX - wx * scale, ty: midY - wy * scale, s: scale });
        break;
      }
      case 'rotate': {
        if (!targetId) break;
        const angle = Math.atan2(p.y - base.cy, p.x - base.cx);
        s.patch(targetId, { rotation: snapRotation(base.rotation + deg(angle - base.angle)) });
        break;
      }
      case 'scale': {
        if (!targetId) break;
        const dist = Math.hypot(p.x - base.cx, p.y - base.cy);
        s.patch(targetId, { scale: base.scale * (dist / base.dist) });
        break;
      }
      default:
        break;
    }
  };

  const drag = (p: Pointer) => {
    if (!targetId) return;
    const [wx, wy] = screenToWorld(cam().t, p.x, p.y);
    const [x, y] = clampToWorld(base.x + wx - base.wx, base.y + wy - base.wy);
    store().patch(targetId, { x, y });
  };

  const pan = (p: Pointer) => {
    const now = performance.now();
    const dt = Math.max(1, now - lastMove.time);
    velocity = {
      x: velocity.x * 0.6 + ((p.x - lastMove.x) / dt) * 0.4,
      y: velocity.y * 0.6 + ((p.y - lastMove.y) / dt) * 0.4,
    };
    lastMove = { x: p.x, y: p.y, time: now };
    setCamera({ tx: base.t.tx + (p.x - base.px), ty: base.t.ty + (p.y - base.py), s: base.t.s });
  };

  const onUp = (e: PointerEvent) => {
    if (!pointers.has(e.pointerId)) return;
    pointers.delete(e.pointerId);
    const remaining = [...pointers.values()][0];
    switch (mode) {
      case 'pendingMap':
        store().select(null);
        mode = 'idle';
        break;
      case 'pan': {
        const idle = performance.now() - lastMove.time > 90;
        startMomentum(idle ? 0 : velocity.x, idle ? 0 : velocity.y);
        mode = 'idle';
        break;
      }
      case 'pinchMap':
        if (remaining) {
          mode = 'pan';
          baselinePan(remaining);
        } else {
          setMoving(false);
          mode = 'idle';
        }
        break;
      case 'pinchSticker':
        if (remaining) {
          mode = 'dragSticker';
          baselineDrag(remaining);
        } else mode = 'idle';
        break;
      default:
        mode = pointers.size ? mode : 'idle';
        break;
    }
    if (!pointers.size) {
      mode = 'idle';
      targetId = null;
    }
  };

  const onWheel = (e: WheelEvent) => {
    if ((e.target as Element).closest('[data-ui]')) return;
    e.preventDefault();
    const [x, y] = local(e);
    const k = e.ctrlKey ? 0.01 : e.deltaMode === 1 ? 0.05 : 0.0016;
    stopCameraMotion();
    setMoving(true);
    zoomAtPoint(Math.exp(-e.deltaY * k), x, y);
    clearTimeout(wheelTimer);
    wheelTimer = setTimeout(() => setMoving(false), 160);
  };

  const prevent = (e: Event) => e.preventDefault();

  el.addEventListener('pointerdown', onDown);
  el.addEventListener('pointermove', onMove);
  el.addEventListener('pointerup', onUp);
  el.addEventListener('pointercancel', onUp);
  el.addEventListener('lostpointercapture', onUp);
  el.addEventListener('wheel', onWheel, { passive: false });
  el.addEventListener('contextmenu', prevent);
  el.addEventListener('gesturestart', prevent);
  el.addEventListener('gesturechange', prevent);
  return () => {
    el.removeEventListener('pointerdown', onDown);
    el.removeEventListener('pointermove', onMove);
    el.removeEventListener('pointerup', onUp);
    el.removeEventListener('pointercancel', onUp);
    el.removeEventListener('lostpointercapture', onUp);
    el.removeEventListener('wheel', onWheel);
    el.removeEventListener('contextmenu', prevent);
    el.removeEventListener('gesturestart', prevent);
    el.removeEventListener('gesturechange', prevent);
    clearTimeout(wheelTimer);
  };
}
