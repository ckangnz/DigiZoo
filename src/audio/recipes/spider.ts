import { Synth } from '../synth';
import type { Recipe } from '../types';

const spider: Recipe = (voice) => {
  const s = new Synth(voice, 1.6).stereo();
  const pitch = s.vary(0.05);
  const pace = s.vary(0.05);
  const drop = 0.45;
  s.note({
    dur: drop,
    freq: [
      [0, 1500 * pitch],
      [drop, 450 * pitch],
    ],
    wave: [1, 0.15],
    vibrato: { rate: 6, depth: 35 },
    env: [
      [0, 0],
      [0.03, 1],
      [drop - 0.05, 0.85],
      [drop, 0, 'exp'],
    ],
    gain: 0.17,
  });
  s.spring({
    at: drop,
    dur: 0.32,
    freq: [
      [0, 380 * pitch],
      [0.04, 470 * pitch],
      [0.32, 480 * pitch],
    ],
    wave: 'sine',
    depth: 320,
    rate: 16,
    gain: 0.3,
  });
  const taps = Array.from({ length: 8 }, (_, i) => i * 0.04 * pace);
  s.clicks({
    at: 0.85 * pace,
    times: taps,
    freq: taps.map((_, i) => (i % 2 === 0 ? 3400 : 2900)),
    gain: 0.3,
    q: 4,
    dur: 0.006,
    ring: 0.3,
    pan: [
      [0, -0.4],
      [0.3, 0.4],
    ],
  });
  return s.done();
};

export default spider;
