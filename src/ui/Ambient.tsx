import { memo, useMemo, type CSSProperties } from 'react';
import { cloudSprite } from '../art/cache';
import { rng } from '../art/scenes/rng';
import type { SceneDef } from '../art/scenes/types';

type Item = { key: string; className: string; style: CSSProperties; src?: string; sky?: boolean };

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
        sky: true,
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
  if (a.twinkles) {
    for (let i = 0; i < a.twinkles; i++) {
      items.push({
        key: `t${i}`,
        sky: true,
        className: 'amb star',
        style: {
          left: between(20, w - 20),
          top: between(20, h - 20),
          ['--size' as string]: `${between(10, 30)}px`,
          animationDuration: `${between(1.6, 4.4)}s`,
          animationDelay: `${-between(0, 4)}s`,
        },
      });
    }
  }
  if (a.meteors) {
    for (let i = 0; i < a.meteors; i++) {
      const duration = between(7, 13);
      items.push({
        key: `m${i}`,
        sky: true,
        className: 'amb meteor',
        style: {
          left: between(200, w - 600),
          top: between(40, Math.max(200, horizon - 300)),
          animationDuration: `${duration}s`,
          animationDelay: `${-between(0, duration)}s`,
          ['--size' as string]: `${between(160, 280)}px`,
        },
      });
    }
  }
  if (a.bats) {
    for (let i = 0; i < a.bats; i++) {
      const duration = between(26, 44);
      items.push({
        key: `bt${i}`,
        className: 'amb bat',
        style: {
          top: between(80, skyBottom + 120),
          animationDuration: `${duration}s, ${between(0.28, 0.4)}s`,
          animationDelay: `${-between(0, duration)}s, 0s`,
          ['--travel' as string]: `${w + 400}px`,
          ['--size' as string]: `${between(40, 70)}px`,
        },
      });
    }
  }
  if (a.cells) {
    for (let i = 0; i < a.cells; i++) {
      items.push({
        key: `ce${i}`,
        className: `amb cell${i % 3 === 0 ? ' white' : ''}`,
        style: {
          left: between(40, w - 40),
          top: between(40, h - 40),
          ['--size' as string]: `${between(28, 70)}px`,
          animationDuration: `${between(9, 16)}s`,
          animationDelay: `${-between(0, 12)}s`,
        },
      });
    }
  }
  if (a.smoke && a.smokeAt) {
    for (let i = 0; i < a.smoke; i++) {
      const duration = between(5, 8);
      items.push({
        key: `sm${i}`,
        className: 'amb smoke',
        style: {
          left: a.smokeAt[0] + between(-30, 30),
          top: a.smokeAt[1],
          ['--size' as string]: `${between(70, 130) * (a.smokeScale ?? 1)}px`,
          ['--rise' as string]: `${-420 * (a.smokeScale ?? 1)}px`,
          animationDuration: `${duration}s`,
          animationDelay: `${-((duration * i) / a.smoke)}s`,
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
  sky,
}: {
  scene: SceneDef;
  night: boolean;
  sky: boolean;
}) {
  const all = useMemo(() => build(scene, night), [scene, night]);
  const items = useMemo(() => all.filter((it) => !!it.sky === sky), [all, sky]);
  if (!items.length) return null;
  return (
    <div className="layer ambient" aria-hidden="true">
      {items.map((it) => (
        <div key={it.key} className={it.className} style={it.style}>
          {it.src && <img className="amb-img" src={it.src} alt="" draggable={false} />}
        </div>
      ))}
    </div>
  );
});
