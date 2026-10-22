import { memo } from 'react';
import type { HabitatId, Locomotion } from '../art/core/types';
import { frameOf } from '../engine/geometry';
import { getAnimal } from '../registry/animals';
import { getTheme } from '../registry/themes';
import { useStore } from '../store/store';

const GROUNDED = new Set<Locomotion>([
  'walk4',
  'walk2',
  'waddle',
  'hop',
  'crawl',
  'slither',
  'roll',
  'drive',
  'wobble',
]);

const NO_GROUND = new Set<HabitatId>(['space', 'body', 'ocean']);

export const ShadowLayer = memo(function ShadowLayer() {
  const themeId = useStore((s) => s.themeId);
  const stickers = useStore((s) => s.stickers);
  if (NO_GROUND.has(themeId)) return null;
  const scene = getTheme(themeId).scene;
  const groundTop = scene.groundTop ?? scene.horizon;
  return (
    <div className="layer shadows" aria-hidden="true">
      {stickers.map((st) => {
        const def = getAnimal(st.animalId);
        if (!def || !GROUNDED.has(def.locomotion)) return null;
        const f = frameOf(st, def);
        const a = (f.rotation * Math.PI) / 180;
        const cos = Math.abs(Math.cos(a));
        const sin = Math.abs(Math.sin(a));
        const width = (cos * f.w + sin * f.h) * 0.68;
        const height = Math.max(8, Math.min(width * 0.2, f.h * 0.26));
        const bottom = f.cy + (sin * f.w + cos * f.h) / 2;
        if (bottom < groundTop) return null;
        return (
          <div
            key={st.id}
            className="sticker-shadow"
            style={{ left: f.cx - width / 2, top: bottom - height * 0.45, width, height }}
          />
        );
      })}
    </div>
  );
});
