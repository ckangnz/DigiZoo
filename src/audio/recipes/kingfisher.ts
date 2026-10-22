import { Synth } from '../synth';
import type { Recipe } from '../types';

const kingfisher: Recipe = (voice) => {
  const s = new Synth(voice, 2.17).stereo();
  const pitch = s.vary(0.04);
  const pace = s.vary(0.04);
  const call = (at: number, lift: number) =>
    s.chirp({
      at,
      dur: 0.09,
      freq: [
        [0, 2500 * lift],
        [0.03, 3100 * lift],
        [0.09, 2700 * lift],
      ],
      wave: [1, 0.1],
      gain: 0.22,
      pan: 0.2,
    });
  call(0, pitch);
  call(0.14 * pace, pitch * 1.04);
  s.burst({
    at: 0.34 * pace,
    dur: 0.16,
    color: 'pink',
    freq: [
      [0, 900],
      [0.16, 2600],
    ],
    q: 1.2,
    swell: 0.7,
    gain: 0.25,
    pan: [
      [0, 0.3],
      [0.16, -0.1],
    ],
  });
  const dive = 0.52 * pace;
  s.bubble({ at: dive, freq: 340 * pitch, rise: 3, dur: 0.07, gain: 0.3 });
  s.burst({
    at: dive + 0.012,
    dur: 0.3,
    color: 'white',
    freq: [
      [0, 2800 * pitch],
      [0.28, 900 * pitch],
    ],
    q: 0.9,
    env: [
      [0, 0],
      [0.01, 1],
      [0.07, 0.45],
      [0.3, 0, 'exp'],
    ],
    gain: 0.8,
  });
  for (let i = 0; i < 4; i++) {
    s.bubble({
      at: dive + 0.1 + i * 0.07 + s.range(0, 0.03),
      freq: s.range(800, 1800),
      rise: 1.6,
      dur: 0.035,
      gain: s.range(0.1, 0.16),
      pan: s.range(-0.4, 0.4),
    });
  }
  call(1.0 * pace, pitch * 1.02);
  return s.done();
};

export default kingfisher;
