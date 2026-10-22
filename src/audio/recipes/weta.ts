import { Synth } from '../synth';
import type { Recipe } from '../types';

const weta: Recipe = (voice) => {
  const s = new Synth(voice, 4.68).stereo();
  const pitch = s.vary(0.05);
  const pace = s.vary(0.05);
  [0, 0.2, 0.4, 0.6].forEach((offset, index) => {
    const at = offset * pace;
    const pan = index % 2 === 0 ? -0.2 : 0.2;
    const times = Array.from({ length: 10 }, (_, i) => at + i * 0.01 + s.range(0, 0.003));
    s.clicks({
      times,
      freq: times.map(() => s.range(3000, 5000) * pitch),
      gain: times.map((_, i) => 0.1 * (1 - i * 0.05)),
      q: 2,
      dur: 0.005,
      pan,
    });
    const teeth = s.tremolo({ rate: 90, depth: 0.9, at, dur: 0.16 });
    s.burst({
      at,
      dur: 0.14,
      color: 'white',
      freq: 4200 * pitch,
      q: 1.2,
      env: [
        [0, 0],
        [0.015, 1],
        [0.1, 0.7],
        [0.14, 0, 'exp'],
      ],
      gain: 0.45,
      pan,
      dest: teeth,
    });
  });
  s.burst({
    at: 0.9 * pace,
    dur: 0.3,
    color: 'pink',
    freq: 3000,
    q: 0.8,
    env: [
      [0, 0],
      [0.03, 1],
      [0.3, 0, 'exp'],
    ],
    gain: 0.3,
  });
  const kick = 1.28 * pace;
  s.click({ at: kick, freq: 1500, q: 3, dur: 0.02, gain: 0.12, ring: 0.5, pan: 0.3 });
  s.thump({ at: kick, from: 300, to: 150, dur: 0.05, gain: 0.15, pan: 0.3 });
  return s.done();
};

export default weta;
