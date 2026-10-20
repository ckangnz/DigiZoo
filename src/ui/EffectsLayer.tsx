import { memo } from 'react';
import { useEffects, type Effect } from './fxStore';

const PUFFS = [0, 60, 120, 180, 240, 300];
const SPARKS = [20, 80, 140, 200, 260, 320];
const NOTES = ['♪', '♫', '♪'];

function EffectView({ effect }: { effect: Effect }) {
  const { kind, x, y, size } = effect;
  const style = { left: x, top: y, ['--size' as string]: `${size}px` };
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
