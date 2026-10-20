import { Synth, WOOD_PARTIALS } from '../synth';
import type { Recipe } from '../types';

const seaOtter: Recipe = (voice) => {
  const s = new Synth(voice, 1.13);
  const pitch = s.vary(0.05);
  const pace = s.vary(0.05);
  [0, 0.15, 0.3, 0.45].forEach((offset, index) => {
    const at = offset * pace;
    const crack = index === 3;
    s.click({ at, freq: 1700 * pitch, q: 8, dur: 0.03, gain: crack ? 0.55 : 0.4, ring: 0.45 });
    s.mallet({
      at,
      freq: 520 * pitch,
      dur: 0.1,
      gain: crack ? 0.3 : 0.22,
      partials: WOOD_PARTIALS,
      hit: 0.4,
    });
  });
  s.clicks({
    times: [0.47, 0.49, 0.52].map((t) => t * pace),
    freq: [2600, 3200, 2200],
    gain: 0.3,
    q: 2,
    dur: 0.006,
  });
  s.chirp({
    at: 0.68 * pace,
    dur: 0.22,
    freq: [
      [0, 2100 * pitch],
      [0.08, 2900 * pitch],
      [0.22, 2400 * pitch],
    ],
    wave: [1, 0.2],
    vibrato: { rate: 14, depth: 50 },
    gain: 0.28,
  });
  for (let i = 0; i < 3; i++) {
    s.bubble({
      at: (0.98 + i * 0.06) * pace,
      freq: s.range(500, 900),
      rise: 1.8,
      dur: 0.05,
      gain: s.range(0.12, 0.18),
    });
  }
  return s.done();
};

export default seaOtter;
