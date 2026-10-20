import { Synth } from '../synth';
import type { Recipe } from '../types';

const lizard: Recipe = (voice) => {
  const s = new Synth(voice, 1.6);
  const pitch = s.vary(0.05);
  const pace = s.vary(0.05);
  const times = [0, 0.09, 0.18, 0.28, 0.39, 0.51, 0.64].map((t) => t * pace);
  times.forEach((at, index) => {
    const lift = pitch * (1 - index * 0.02);
    s.chirp({
      at,
      dur: 0.028,
      freq: [
        [0, 3300 * lift],
        [0.025, 2500 * lift],
      ],
      wave: [1, 0.3],
      attack: 0.002,
      gain: 0.3 - index * 0.02,
    });
  });
  s.clicks({
    times,
    freq: times.map((_, index) => 4200 - index * 80),
    gain: times.map((_, index) => 0.35 - index * 0.025),
    q: 3,
    dur: 0.005,
  });
  return s.done();
};

export default lizard;
