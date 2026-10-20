import { memo, useMemo, type CSSProperties } from 'react';
import { cloudSprite } from '../art/cache';
import { rng } from '../art/scenes/rng';
import type { SceneDef } from '../art/scenes/types';

type Item = { key: string; className: string; style: CSSProperties; src?: string };

function build(scene: SceneDef, night: boolean): Item[] {
  const [w, h] = scene.world;
  const horizon = scene.horizon;
  const a = scene.ambient;
  const r = rng(scene.id.length * 977 + (night ? 13 : 7));
  const between = (min: number, max: number) => min + (max - min) * r();
  const items: Item[] = [];
  const skyBottom = Math.max(240, horizon - 380);
  if (!night && a.clouds) {
    for (let i = 0; i < a.clouds; i++) {
      const duration = between(140, 240);
      items.push({
        key: `c${i}`,
        className: 'amb cloud',
        src: cloudSprite(),
        style: {
          top: between(40, skyBottom),
          width: 260 * between(1.1, 2),
          animationDuration: `${duration}s`,
          animationDelay: `${-between(0, duration)}s`,
          ['--travel' as string]: `${w + 900}px`,
          opacity: between(0.75, 0.95),
        },
      });
    }
  }
  if (!night && a.birds) {
    for (let i = 0; i < a.birds; i++) {
      const duration = between(45, 75);
      items.push({
        key: `b${i}`,
        className: 'amb bird',
        style: {
          top: between(120, skyBottom),
          animationDuration: `${duration}s`,
          animationDelay: `${-between(0, duration)}s`,
          ['--travel' as string]: `${w + 400}px`,
          ['--size' as string]: `${between(26, 44)}px`,
        },
      });
    }
  }
  if (night && a.stars) {
    for (let i = 0; i < a.stars; i++) {
      items.push({
        key: `s${i}`,
        className: 'amb star',
        style: {
          left: between(20, w - 20),
          top: between(20, Math.min(skyBottom + 200, horizon - 20)),
          ['--size' as string]: `${between(10, 26)}px`,
          animationDuration: `${between(1.8, 4.2)}s`,
          animationDelay: `${-between(0, 4)}s`,
        },
      });
    }
  }
  if (night && a.fireflies) {
    for (let i = 0; i < a.fireflies; i++) {
      items.push({
        key: `f${i}`,
        className: 'amb firefly',
        style: {
          left: between(60, w - 60),
          top: between(horizon + 60, h - 260),
          animationDuration: `${between(5, 9)}s, ${between(1.6, 3)}s`,
          animationDelay: `${-between(0, 8)}s, ${-between(0, 3)}s`,
        },
      });
    }
  }
  if (a.leaves) {
    for (let i = 0; i < a.leaves; i++) {
      const duration = between(14, 24);
      items.push({
        key: `l${i}`,
        className: 'amb leaf',
        style: {
          left: between(40, w - 40),
          top: between(120, 500),
          animationDuration: `${duration}s`,
          animationDelay: `${-between(0, duration)}s`,
          ['--fall' as string]: `${between(900, 1500)}px`,
          ['--hue' as string]: `${between(70, 130)}`,
        },
      });
    }
  }
  if (a.bubbles) {
    for (let i = 0; i < a.bubbles; i++) {
      const duration = between(9, 18);
      items.push({
        key: `u${i}`,
        className: 'amb bubble',
        style: {
          left: between(40, w - 40),
          top: h - between(80, 200),
          ['--size' as string]: `${between(14, 40)}px`,
          ['--rise' as string]: `${h - between(260, 500)}px`,
          animationDuration: `${duration}s`,
          animationDelay: `${-between(0, duration)}s`,
        },
      });
    }
  }
  if (a.sparkles) {
    for (let i = 0; i < a.sparkles; i++) {
      items.push({
        key: `k${i}`,
        className: 'amb star sparkle',
        style: {
          left: between(40, w - 40),
          top: between(horizon, h - 200),
          ['--size' as string]: `${between(12, 22)}px`,
          animationDuration: `${between(2, 4)}s`,
          animationDelay: `${-between(0, 4)}s`,
        },
      });
    }
  }
  return items;
}

export const Ambient = memo(function Ambient({
  scene,
  night,
}: {
  scene: SceneDef;
  night: boolean;
}) {
  const items = useMemo(() => build(scene, night), [scene, night]);
  return (
    <div className="layer ambient" aria-hidden="true">
      {items.map((it) =>
        it.src ? (
          <img
            key={it.key}
            className={it.className}
            style={it.style}
            src={it.src}
            alt=""
            draggable={false}
          />
        ) : (
          <div key={it.key} className={it.className} style={it.style} />
        ),
      )}
    </div>
  );
});
