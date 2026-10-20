import { describe, expect, it } from 'vitest';
import { snapRotation } from './gestures';
import {
  MAX_ZOOM,
  clampTransform,
  coverScale,
  screenToWorld,
  toTransform,
  toView,
  worldToScreen,
  zoomAt,
  type World,
} from './viewport';

const world: World = [3600, 2000];
const vp = { w: 1180, h: 820 };

describe('viewport', () => {
  it('never zooms out past cover or in past the max', () => {
    const cover = coverScale(world, vp);
    expect(clampTransform({ tx: 0, ty: 0, s: 0.01 }, world, vp).s).toBe(cover);
    expect(clampTransform({ tx: 0, ty: 0, s: 99 }, world, vp).s).toBe(cover * MAX_ZOOM);
  });

  it('keeps the map covering the viewport while panning', () => {
    const cover = coverScale(world, vp);
    const t = clampTransform({ tx: 500, ty: 500, s: cover * 2 }, world, vp);
    expect(t.tx).toBe(0);
    expect(t.ty).toBe(0);
    const far = clampTransform({ tx: -1e6, ty: -1e6, s: cover * 2 }, world, vp);
    expect(far.tx).toBeCloseTo(vp.w - world[0] * cover * 2);
    expect(far.ty).toBeCloseTo(vp.h - world[1] * cover * 2);
  });

  it('zooms around the pointer', () => {
    const start = toTransform({ cx: 1800, cy: 1000, z: 1.5 }, world, vp);
    const before = screenToWorld(start, 400, 300);
    const next = zoomAt(start, 1.3, 400, 300, world, vp);
    const after = screenToWorld(next, 400, 300);
    expect(after[0]).toBeCloseTo(before[0], 4);
    expect(after[1]).toBeCloseTo(before[1], 4);
  });

  it('converts between views and transforms', () => {
    const view = { cx: 1500, cy: 900, z: 2 };
    const back = toView(toTransform(view, world, vp), world, vp);
    expect(back.cx).toBeCloseTo(view.cx);
    expect(back.cy).toBeCloseTo(view.cy);
    expect(back.z).toBeCloseTo(view.z);
    const t = toTransform(view, world, vp);
    const [sx, sy] = worldToScreen(t, 1500, 900);
    expect(sx).toBeCloseTo(vp.w / 2);
    expect(sy).toBeCloseTo(vp.h / 2);
  });
});

describe('snapRotation', () => {
  it('snaps near right angles and normalises', () => {
    expect(snapRotation(4)).toBe(0);
    expect(snapRotation(-5)).toBe(0);
    expect(snapRotation(88)).toBe(90);
    expect(snapRotation(185)).toBe(180);
    expect(snapRotation(370)).toBe(10);
    expect(snapRotation(30)).toBe(30);
  });
});
