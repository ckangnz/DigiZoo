import type { View } from '../store/types';

export interface Size {
  w: number;
  h: number;
}

export interface Transform {
  tx: number;
  ty: number;
  s: number;
}

export type World = [number, number];

export const MAX_ZOOM = 4;

export function coverScale(world: World, vp: Size): number {
  return Math.max(vp.w / world[0], vp.h / world[1]);
}

export function clampTransform(t: Transform, world: World, vp: Size): Transform {
  const cover = coverScale(world, vp);
  const s = Math.min(cover * MAX_ZOOM, Math.max(cover, t.s));
  const ww = world[0] * s;
  const wh = world[1] * s;
  const tx = ww <= vp.w ? (vp.w - ww) / 2 : Math.min(0, Math.max(vp.w - ww, t.tx));
  const ty = wh <= vp.h ? (vp.h - wh) / 2 : Math.min(0, Math.max(vp.h - wh, t.ty));
  return { tx, ty, s };
}

export function toTransform(view: View, world: World, vp: Size): Transform {
  const s = coverScale(world, vp) * view.z;
  return clampTransform({ tx: vp.w / 2 - view.cx * s, ty: vp.h / 2 - view.cy * s, s }, world, vp);
}

export function toView(t: Transform, world: World, vp: Size): View {
  return {
    cx: (vp.w / 2 - t.tx) / t.s,
    cy: (vp.h / 2 - t.ty) / t.s,
    z: t.s / coverScale(world, vp),
  };
}

export function zoomAt(
  t: Transform,
  factor: number,
  px: number,
  py: number,
  world: World,
  vp: Size,
): Transform {
  const cover = coverScale(world, vp);
  const s = Math.min(cover * MAX_ZOOM, Math.max(cover, t.s * factor));
  const wx = (px - t.tx) / t.s;
  const wy = (py - t.ty) / t.s;
  return clampTransform({ tx: px - wx * s, ty: py - wy * s, s }, world, vp);
}

export function defaultView(world: World): View {
  return { cx: world[0] / 2, cy: world[1] / 2, z: 1 };
}

export function screenToWorld(t: Transform, x: number, y: number): [number, number] {
  return [(x - t.tx) / t.s, (y - t.ty) / t.s];
}

export function worldToScreen(t: Transform, x: number, y: number): [number, number] {
  return [x * t.s + t.tx, y * t.s + t.ty];
}
