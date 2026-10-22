import { Synth, WOOD_PARTIALS } from '../synth';
import type { Recipe } from '../types';

const beaver: Recipe = (voice) => {
  const s = new Synth(voice, 1.54).stereo();
  const pitch = s.vary(0.05);
  const pace = s.vary(0.04);
  [0, 0.2, 0.4].forEach((offset) => {
    const at = offset * pace;
    const times = Array.from({ length: 8 }, (_, i) => at + i * 0.015 + s.range(0, 0.004));
    s.clicks({
      times,
      freq: times.map(() => s.range(1500, 3000)),
      gain: times.map(() => s.range(0.15, 0.22)),
      q: 3,
      dur: 0.01,
      ring: 0.3,
      pan: -0.25,
    });
    s.mallet({
      at,
      freq: 700 * pitch,
      dur: 0.06,
      gain: 0.12,
      partials: WOOD_PARTIALS,
      hit: 0.3,
      pan: -0.25,
    });
  });
  const slap = 0.85 * pace;
  s.click({ at: slap, freq: 1500, q: 0.6, dur: 0.03, gain: 0.25, pan: 0.2 });
  s.thump({ at: slap, from: 200, to: 80, dur: 0.12, gain: 0.4, thud: 0.6, pan: 0.2 });
  s.burst({
    at: slap + 0.01,
    dur: 0.4,
    color: 'white',
    freq: [
      [0, 3000 * pitch],
      [0.36, 900 * pitch],
    ],
    q: 0.9,
    env: [
      [0, 0],
      [0.01, 1],
      [0.08, 0.5],
      [0.4, 0, 'exp'],
    ],
    gain: 1.2,
    pan: 0.2,
  });
  for (let i = 0; i < 5; i++) {
    s.bubble({
      at: slap + 0.12 + i * 0.06 + s.range(0, 0.03),
      freq: s.range(800, 1900),
      rise: s.range(1.4, 1.9),
      dur: 0.035,
      gain: s.range(0.1, 0.16),
      pan: s.range(-0.2, 0.6),
    });
  }
  return s.done();
};

export default beaver;
