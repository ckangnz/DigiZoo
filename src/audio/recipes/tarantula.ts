import { Synth, pluck } from '../synth';
import type { Recipe } from '../types';

const STEPS = [0, 3, 1, 4, 2, 5];

const tarantula: Recipe = (voice) => {
  const s = new Synth(voice, 2.2).stereo();
  const pitch = s.vary(0.05);
  const pace = s.vary(0.05);
  for (let i = 0; i < 12; i++) {
    const at = (i * 0.058 + (i >= 6 ? 0.14 : 0)) * pace;
    const freq = (233 + STEPS[i % 6] * 26) * pitch * (i >= 6 ? 1.06 : 1);
    s.note({
      at,
      dur: 0.11,
      freq,
      wave: [1, 0.5, 0.25, 0.12, 0.06],
      env: pluck(0.11, 1, 0.003),
      lowpass: 2600,
      gain: 0.3,
      pan: i % 2 === 0 ? -0.35 : 0.35,
    });
    s.click({ at, freq: 2400, q: 2, dur: 0.004, gain: 0.08, pan: i % 2 === 0 ? -0.35 : 0.35 });
  }
  s.burst({
    at: 0.98 * pace,
    dur: 0.28,
    color: 'pink',
    freq: 3200,
    q: 1.2,
    env: [
      [0, 0],
      [0.05, 1],
      [0.28, 0, 'exp'],
    ],
    gain: 0.2,
  });
  return s.done();
};

export default tarantula;
