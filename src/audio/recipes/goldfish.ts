import { GLASS_PARTIALS, Synth } from '../synth';
import type { Recipe } from '../types';

const goldfish: Recipe = (voice) => {
  const s = new Synth(voice, 2.07).stereo();
  const pitch = s.vary(0.05);
  const pace = s.vary(0.04);
  [0, 0.18, 0.36].forEach((offset, index) => {
    const at = offset * pace;
    const lift = pitch * [1, 1.1, 1.05][index];
    s.bubble({ at, freq: 700 * lift, rise: 2.2, dur: 0.05, gain: 0.3 });
    s.click({ at, freq: 2500, q: 2, dur: 0.004, gain: 0.03 });
  });
  s.burst({
    at: 0.55 * pace,
    dur: 0.25,
    color: 'pink',
    type: 'lowpass',
    freq: [
      [0, 300],
      [0.12, 1100],
      [0.25, 400],
    ],
    q: 1.5,
    swell: 0.4,
    gain: 0.5,
    pan: [
      [0, -0.3],
      [0.25, 0.3],
    ],
  });
  for (let i = 0; i < 5; i++) {
    s.bubble({
      at: (0.85 + i * 0.06 + s.range(0, 0.03)) * pace,
      freq: s.range(600, 1300),
      rise: 1.7,
      dur: 0.04,
      gain: s.range(0.14, 0.22),
      pan: s.range(-0.4, 0.4),
    });
  }
  const tink = 1.25 * pace;
  s.bell({
    at: tink,
    freq: 2200 * pitch,
    dur: 0.3,
    gain: 0.08,
    partials: GLASS_PARTIALS,
    pan: 0.3,
  });
  s.click({ at: tink, freq: 3500, q: 2, dur: 0.003, gain: 0.05, pan: 0.3 });
  return s.done();
};

export default goldfish;
