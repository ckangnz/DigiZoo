import { animalBounds, viewBoxOf } from '../art/core/render';
import type { AnimalDef } from '../art/core/types';
import type { Bounds } from '../art/core/paths';
import { getAnimal } from '../registry/animals';
import type { Sticker } from '../store/types';

export interface Metrics {
  k: number;
  w: number;
  h: number;
  bounds: Bounds;
  cx: number;
  cy: number;
}

const cache = new Map<string, Metrics>();

export function metricsOf(def: AnimalDef): Metrics {
  let m = cache.get(def.id);
  if (!m) {
    const [, , vw, vh] = viewBoxOf(def);
    const k = def.size / def.box[1];
    m = {
      k,
      w: vw * k,
      h: vh * k,
      bounds: animalBounds(def),
      cx: def.box[0] / 2,
      cy: def.box[1] / 2,
    };
    cache.set(def.id, m);
  }
  return m;
}

export function toLocalBox(st: Sticker, m: Metrics, wx: number, wy: number): [number, number] {
  const dx = wx - st.x;
  const dy = wy - st.y;
  const a = (-st.rotation * Math.PI) / 180;
  const cos = Math.cos(a);
  const sin = Math.sin(a);
  let lx = (dx * cos - dy * sin) / (m.k * st.scale);
  const ly = (dx * sin + dy * cos) / (m.k * st.scale);
  if (st.flipX) lx = -lx;
  return [m.cx + lx, m.cy + ly];
}

export function hitTest(stickers: Sticker[], wx: number, wy: number, slop: number): Sticker | null {
  for (let i = stickers.length - 1; i >= 0; i--) {
    const st = stickers[i];
    const def = getAnimal(st.animalId);
    if (!def) continue;
    const m = metricsOf(def);
    const [bx, by] = toLocalBox(st, m, wx, wy);
    const pad = slop / (m.k * st.scale);
    const b = m.bounds;
    if (bx >= b.minX - pad && bx <= b.maxX + pad && by >= b.minY - pad && by <= b.maxY + pad) {
      return st;
    }
  }
  return null;
}

export interface Frame {
  cx: number;
  cy: number;
  w: number;
  h: number;
  rotation: number;
}

export function frameOf(st: Sticker, def: AnimalDef): Frame {
  const m = metricsOf(def);
  const b = m.bounds;
  const unit = m.k * st.scale;
  let ox = ((b.minX + b.maxX) / 2 - m.cx) * unit;
  const oy = ((b.minY + b.maxY) / 2 - m.cy) * unit;
  if (st.flipX) ox = -ox;
  const a = (st.rotation * Math.PI) / 180;
  return {
    cx: st.x + ox * Math.cos(a) - oy * Math.sin(a),
    cy: st.y + ox * Math.sin(a) + oy * Math.cos(a),
    w: (b.maxX - b.minX) * unit,
    h: (b.maxY - b.minY) * unit,
    rotation: st.rotation,
  };
}

export function halfWidth(st: Sticker, def: AnimalDef): number {
  const m = metricsOf(def);
  return ((m.bounds.maxX - m.bounds.minX) / 2) * m.k * st.scale;
}
