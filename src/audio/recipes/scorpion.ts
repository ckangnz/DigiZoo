import { Synth } from '../synth';
import type { Recipe } from '../types';

const scorpion: Recipe = (voice) => {
  const s = new Synth(voice, 1.05);
  const pace = s.vary(0.05);
  const groups = [0, 0.13, 0.26, 0.5, 0.63, 0.76].map((t) => t * pace);
  const times = groups.flatMap((start) =>
    [0, 0.018, 0.036, 0.054].map((offset) => start + offset + s.range(0, 0.006)),
  );
  s.clicks({
    times,
    freq: times.map(() => s.range(3500, 6500)),
    gain: times.map(() => s.range(0.3, 0.6)),
    q: 2,
    dur: 0.003,
  });
  [0.36, 0.9].forEach((t) => {
    const at = t * pace;
    s.click({ at, freq: 2200, q: 6, dur: 0.015, gain: 0.6, ring: 0.3 });
    s.click({ at, freq: 4500, q: 3, dur: 0.006, gain: 0.4 });
  });
  return s.done();
};

export default scorpion;
