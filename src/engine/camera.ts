import { create } from 'zustand';
import type { View } from '../store/types';
import {
  clampTransform,
  defaultView,
  toTransform,
  toView,
  zoomAt,
  type Size,
  type Transform,
  type World,
} from './viewport';

interface CameraState {
  t: Transform;
  vp: Size;
  world: World;
  moving: boolean;
}

export const useCamera = create<CameraState>(() => ({
  t: { tx: 0, ty: 0, s: 1 },
  vp: { w: 1, h: 1 },
  world: [3600, 2000],
  moving: false,
}));

let animFrame = 0;
let momentumFrame = 0;
let viewListener: ((view: View) => void) | null = null;

export function onViewSettled(listener: (view: View) => void): void {
  viewListener = listener;
}

function settle() {
  const { t, world, vp } = useCamera.getState();
  viewListener?.(toView(t, world, vp));
}

export function setCamera(t: Transform): void {
  const { world, vp } = useCamera.getState();
  useCamera.setState({ t: clampTransform(t, world, vp) });
}

export function setMoving(moving: boolean): void {
  if (useCamera.getState().moving !== moving) useCamera.setState({ moving });
  if (!moving) settle();
}

export function initCamera(world: World, vp: Size, view: View | null): void {
  stopCameraMotion();
  const t = toTransform(view ?? defaultView(world), world, vp);
  useCamera.setState({ world, vp, t });
}

export function resizeCamera(vp: Size): void {
  const { t, world, vp: old } = useCamera.getState();
  const view = toView(t, world, old);
  useCamera.setState({ vp, t: toTransform(view, world, vp) });
}

export function stopCameraMotion(): void {
  cancelAnimationFrame(animFrame);
  cancelAnimationFrame(momentumFrame);
  animFrame = 0;
  momentumFrame = 0;
}

const ease = (k: number) => 1 - (1 - k) ** 3;

export function animateCamera(target: Transform, ms = 280): void {
  stopCameraMotion();
  const { world, vp, t: from } = useCamera.getState();
  const to = clampTransform(target, world, vp);
  const start = performance.now();
  setMoving(true);
  const step = (now: number) => {
    const k = Math.min(1, (now - start) / ms);
    const e = ease(k);
    useCamera.setState({
      t: {
        tx: from.tx + (to.tx - from.tx) * e,
        ty: from.ty + (to.ty - from.ty) * e,
        s: from.s + (to.s - from.s) * e,
      },
    });
    if (k < 1) animFrame = requestAnimationFrame(step);
    else {
      animFrame = 0;
      setMoving(false);
    }
  };
  animFrame = requestAnimationFrame(step);
}

export function zoomBy(factor: number): void {
  const { t, world, vp } = useCamera.getState();
  animateCamera(zoomAt(t, factor, vp.w / 2, vp.h / 2, world, vp));
}

export function resetCamera(): void {
  const { world, vp } = useCamera.getState();
  animateCamera(toTransform(defaultView(world), world, vp), 380);
}

export function centerOn(x: number, y: number): void {
  const { t, vp } = useCamera.getState();
  animateCamera({ tx: vp.w / 2 - x * t.s, ty: vp.h / 2 - y * t.s, s: t.s }, 320);
}

export function startMomentum(vx: number, vy: number): void {
  stopCameraMotion();
  let velX = vx;
  let velY = vy;
  let last = performance.now();
  if (Math.hypot(velX, velY) < 0.05) {
    setMoving(false);
    return;
  }
  const step = (now: number) => {
    const dt = Math.min(40, now - last);
    last = now;
    const { t } = useCamera.getState();
    setCamera({ tx: t.tx + velX * dt, ty: t.ty + velY * dt, s: t.s });
    const decay = Math.pow(0.94, dt / 16);
    velX *= decay;
    velY *= decay;
    if (Math.hypot(velX, velY) > 0.02) momentumFrame = requestAnimationFrame(step);
    else {
      momentumFrame = 0;
      setMoving(false);
    }
  };
  momentumFrame = requestAnimationFrame(step);
}

export function zoomAtPoint(factor: number, px: number, py: number): void {
  const { t, world, vp } = useCamera.getState();
  useCamera.setState({ t: zoomAt(t, factor, px, py, world, vp) });
}
