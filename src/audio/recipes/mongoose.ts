import { Synth } from '../synth';
import type { Recipe } from '../types';

const mongoose: Recipe = (voice) => {
  const s = new Synth(voice, 1.96);
  const pitch = s.vary(0.05);
  const pace = s.vary(0.05);
  const chatter = Array.from({ length: 8 }, (_, i) => i * 0.065 * pace);
  chatter.forEach((at, index) => {
    const lift = pitch * (1 + Math.sin(index * 1.7) * 0.06);
    s.chirp({
      at,
      dur: 0.03,
      freq: [
        [0, 1900 * lift],
        [0.03, 1500 * lift],
      ],
      wave: [1, 0.3, 0.1],
      attack: 0.003,
      gain: 0.22 - (index % 2) * 0.05,
    });
  });
  s.clicks({ times: chatter, freq: 3200, gain: 0.15, q: 2, dur: 0.004 });
  s.chirp({
    at: 0.68 * pace,
    dur: 0.16,
    freq: [
      [0, 1700 * pitch],
      [0.06, 2400 * pitch],
      [0.16, 2000 * pitch],
    ],
    wave: [1, 0.2],
    vibrato: { rate: 18, depth: 60 },
    gain: 0.17,
  });
  return s.done();
};

export default mongoose;
