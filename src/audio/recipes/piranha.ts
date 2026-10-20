import { Synth, WOOD_PARTIALS } from '../synth';
import type { Recipe } from '../types';

const piranha: Recipe = (voice) => {
  const s = new Synth(voice, 1.03);
  const pitch = s.vary(0.05);
  const pace = s.vary(0.05);
  [0, 0.17, 0.34, 0.56].forEach((offset, index) => {
    const at = offset * pace;
    const last = index === 3;
    const lift = pitch * [1, 1.06, 0.97, 1.12][index];
    s.click({ at, freq: 2800 * lift, q: 5, dur: 0.012, gain: last ? 0.32 : 0.25, ring: 0.35 });
    s.mallet({
      at,
      freq: 620 * lift,
      dur: 0.09,
      gain: last ? 0.45 : 0.34,
      partials: WOOD_PARTIALS,
      hit: 0.3,
    });
    s.thump({
      at: at + 0.005,
      from: 300 * lift,
      to: 150 * lift,
      dur: 0.07,
      gain: last ? 0.3 : 0.22,
    });
  });
  for (let i = 0; i < 5; i++) {
    s.bubble({
      at: (0.72 + i * 0.055 + s.range(0, 0.03)) * pace,
      freq: s.range(500, 1100) * pitch,
      rise: 1.8,
      dur: 0.05,
      gain: s.range(0.12, 0.2),
    });
  }
  return s.done();
};

export default piranha;
