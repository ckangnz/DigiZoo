import { memo, useMemo, type CSSProperties } from 'react';
import { rng } from '../art/scenes/rng';
import { foodSvg } from '../food/art';
import { useEffects, type Effect, type EffectKind } from './fxStore';

const PUFFS = [0, 60, 120, 180, 240, 300];
const SPARKS = [20, 80, 140, 200, 260, 320];
const NOTES = ['♪', '♫', '♪'];

type Particle = { key: number; style: CSSProperties };

const PARTICLE_COUNT: Partial<Record<EffectKind, number>> = {
  leaves: 10,
  petals: 10,
  fruit: 4,
  rain: 18,
  splash: 9,
  smoke: 7,
  stars: 9,
  bubbles: 9,
  coins: 7,
  hearts: 7,
};

const LEAF_HUES = [92, 104, 118, 80, 130];
const PETAL_HUES = [330, 340, 300, 350, 20];

function particles(effect: Effect): Particle[] {
  const r = rng(effect.id * 7919);
  const between = (a: number, b: number) => a + (b - a) * r();
  const n = PARTICLE_COUNT[effect.kind] ?? 0;
  const out: Particle[] = [];
  for (let i = 0; i < n; i++) {
    const style: Record<string, string | number> = {
      '--dx': `${between(-0.6, 0.6).toFixed(3)}`,
      '--dy': `${between(0.6, 1.2).toFixed(3)}`,
      '--rot': `${Math.round(between(-260, 260))}deg`,
      '--delay': `${Math.round(between(0, effect.kind === 'rain' ? 900 : 260))}ms`,
      '--s': `${between(0.7, 1.25).toFixed(2)}`,
      '--a': `${Math.round((i / n) * 360 + between(-12, 12))}deg`,
    };
    if (effect.kind === 'leaves') style['--hue'] = LEAF_HUES[i % LEAF_HUES.length];
    if (effect.kind === 'petals') style['--hue'] = PETAL_HUES[i % PETAL_HUES.length];
    out.push({ key: i, style: style as CSSProperties });
  }
  return out;
}

const HAPPY_FACE =
  '<svg viewBox="0 0 64 64"><circle cx="32" cy="32" r="28" fill="#ffd54a"/><circle cx="22" cy="27" r="4.5" fill="#3d2a1e"/><circle cx="42" cy="27" r="4.5" fill="#3d2a1e"/><circle cx="23.5" cy="25.5" r="1.6" fill="#fff"/><circle cx="43.5" cy="25.5" r="1.6" fill="#fff"/><ellipse cx="15" cy="37" rx="5" ry="3" fill="#ff8a9a" opacity=".7"/><ellipse cx="49" cy="37" rx="5" ry="3" fill="#ff8a9a" opacity=".7"/><path d="M19 38 Q32 52 45 38" fill="none" stroke="#3d2a1e" stroke-width="4" stroke-linecap="round"/></svg>';

const SAD_FACE =
  '<svg viewBox="0 0 64 64"><circle cx="32" cy="32" r="28" fill="#9fd3ff"/><circle cx="22" cy="28" r="4.5" fill="#2a3550"/><circle cx="42" cy="28" r="4.5" fill="#2a3550"/><path d="M14 20 L26 17 M50 20 L38 17" stroke="#2a3550" stroke-width="3" stroke-linecap="round"/><path d="M21 47 Q32 37 43 47" fill="none" stroke="#2a3550" stroke-width="4" stroke-linecap="round"/><path d="M45 33 Q49 41 45 44 Q41 41 45 33Z" fill="#3fa0ff"/></svg>';

function FeedView({ effect }: { effect: Effect }) {
  const food = useMemo(() => (effect.food ? foodSvg(effect.food, 64) : ''), [effect.food]);
  return (
    <div
      className={`fx fx-feed ${effect.happy ? 'happy' : 'sad'}`}
      style={{ left: effect.x, top: effect.y, ['--size' as string]: `${effect.size}px` }}
    >
      <span className="feed-food" dangerouslySetInnerHTML={{ __html: food }} />
      <span
        className="feed-face"
        dangerouslySetInnerHTML={{ __html: effect.happy ? HAPPY_FACE : SAD_FACE }}
      />
      {effect.happy ? (
        [0, 1, 2, 3, 4].map((i) => (
          <span key={i} className="feed-heart" style={{ ['--i' as string]: i }}>
            ♥
          </span>
        ))
      ) : (
        <span className="feed-cloud">
          {[0, 1, 2, 3].map((i) => (
            <i key={i} style={{ ['--i' as string]: i }} />
          ))}
        </span>
      )}
    </div>
  );
}

function EffectView({ effect }: { effect: Effect }) {
  const { kind, x, y, size } = effect;
  const style = { left: x, top: y, ['--size' as string]: `${size}px` };
  const parts = useMemo(() => particles(effect), [effect]);
  if (kind === 'feed') return <FeedView effect={effect} />;
  if (kind === 'poof') {
    return (
      <div className="fx fx-poof" style={style}>
        {PUFFS.map((a) => (
          <span key={a} style={{ ['--a' as string]: `${a}deg` }} />
        ))}
      </div>
    );
  }
  if (kind === 'sparkle' || kind === 'pop') {
    return (
      <div className="fx fx-sparkle" style={style}>
        {SPARKS.map((a) => (
          <span key={a} style={{ ['--a' as string]: `${a}deg` }} />
        ))}
      </div>
    );
  }
  if (kind === 'notes') {
    return (
      <div className="fx fx-notes" style={style}>
        {NOTES.map((n, i) => (
          <span key={i} style={{ ['--i' as string]: i }}>
            {n}
          </span>
        ))}
      </div>
    );
  }
  return (
    <div className={`fx fx-${kind}`} style={style}>
      {kind === 'splash' && <b className="ring" />}
      {parts.map((p) => (
        <span key={p.key} style={p.style}>
          {kind === 'hearts' ? '♥' : null}
        </span>
      ))}
    </div>
  );
}

export const EffectsLayer = memo(function EffectsLayer() {
  const effects = useEffects((s) => s.effects);
  return (
    <div className="layer effects" aria-hidden="true">
      {effects.map((e) => (
        <EffectView key={e.id} effect={e} />
      ))}
    </div>
  );
});
