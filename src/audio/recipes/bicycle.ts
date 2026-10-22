import { Synth, type Partials } from '../synth';
import type { Recipe } from '../types';

const DOME: Partials = [
  [1, 1, 1],
  [2.13, 0.4, 0.6],
  [3.46, 0.16, 0.4],
  [5.1, 0.06, 0.25],
];

const STRIKES: readonly (readonly [at: number, level: number])[] = [
  [0, 1],
  [0.035, 0.75],
  [0.07, 0.85],
  [0.105, 0.65],
];

const bicycle: Recipe = (voice) => {
  const s = new Synth(voice, 2.31).stereo();
  const pitch = s.vary(0.02);
  const pace = s.vary(0.04);
  [0, 0.45].forEach((ring) => {
    STRIKES.forEach(([offset, level]) => {
      const at = (ring + offset) * pace;
      [1850, 1868].forEach((base, index) => {
        s.bell({
          at,
          freq: base * pitch,
          dur: 0.9,
          gain: 0.12 * level,
          partials: DOME,
          pan: index === 0 ? -0.15 : 0.15,
        });
      });
      s.click({ at, freq: 4000, q: 2, dur: 0.004, gain: 0.08 * level });
    });
  });
  const times = Array.from({ length: 10 }, (_, i) => (1.3 + i * 0.03) * pace);
  s.clicks({
    times,
    freq: 3200,
    gain: times.map((_, i) => 0.14 - i * 0.008),
    q: 4,
    dur: 0.004,
  });
  return s.done();
};

export default bicycle;
