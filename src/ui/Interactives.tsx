import { memo, useMemo } from 'react';
import { paletteFor } from '../art/scenes/render';
import type { Interactive, SceneDef } from '../art/scenes/types';

export function scopeIds(markup: string, prefix: string): string {
  return markup
    .replace(/\bid="([^"]+)"/g, `id="${prefix}$1"`)
    .replace(/url\(#([^)]+)\)/g, `url(#${prefix}$1)`)
    .replace(/href="#([^"]+)"/g, `href="#${prefix}$1"`);
}

export function defaultOrigin(it: Interactive): [number, number] {
  const [x, y, w, h] = it.box;
  if (it.origin) return it.origin;
  return it.kind === 'shake' ||
    it.kind === 'sway' ||
    it.kind === 'bounce' ||
    it.kind === 'wiggle' ||
    it.kind === 'rock'
    ? [x + w / 2, y + h]
    : [x + w / 2, y + h / 2];
}

const Item = memo(function Item({ it, markup }: { it: Interactive; markup: string }) {
  const [x, y, w, h] = it.box;
  const [ox, oy] = defaultOrigin(it);
  return (
    <svg
      className="interactive"
      data-interactive={it.id}
      viewBox={`${x} ${y} ${w} ${h}`}
      width={w}
      height={h}
      style={{ left: x, top: y, transformOrigin: `${ox - x}px ${oy - y}px` }}
      dangerouslySetInnerHTML={{ __html: markup }}
    />
  );
});

export const InteractiveLayer = memo(function InteractiveLayer({
  scene,
  night,
  front,
}: {
  scene: SceneDef;
  night: boolean;
  front: boolean;
}) {
  const items = useMemo(() => {
    const mode = night ? 'night' : 'day';
    const p = paletteFor(scene, mode);
    return (scene.interactives ?? [])
      .filter((it) => !!it.front === front)
      .map((it) => ({ it, markup: scopeIds(it.render(p, mode), `ix-${it.id}-`) }));
  }, [scene, night, front]);
  if (!items.length) return null;
  return (
    <div className={`layer interactives${front ? ' front' : ''}`}>
      {items.map(({ it, markup }) => (
        <Item key={`${it.id}-${night ? 'n' : 'd'}`} it={it} markup={markup} />
      ))}
    </div>
  );
});
