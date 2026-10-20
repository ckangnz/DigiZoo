import { Synth } from '../synth';
import type { Recipe } from '../types';

const mouse: Recipe = (voice) => {
  const s = new Synth(voice, 2.04);
  const pitch = s.vary(0.05);
  const pace = s.vary(0.05);
  [0, 0.16, 0.36].forEach((offset, index) => {
    const lift = pitch * [1, 1.08, 1.14][index];
    const dur = index === 2 ? 0.09 : 0.06;
    s.chirp({
      at: offset * pace,
      dur,
      freq: [
        [0, 2900 * lift],
        [dur * 0.35, 3700 * lift],
        [dur, 3100 * lift],
      ],
      wave: [1, 0.12],
      attack: 0.006,
      gain: 0.22,
    });
  });
  const times = Array.from({ length: 8 }, (_, i) => (0.55 + i * 0.035) * pace + s.range(0, 0.008));
  s.clicks({
    times,
    freq: times.map(() => s.range(2600, 4200)),
    gain: times.map((_, i) => 0.25 - i * 0.02),
    q: 3,
    dur: 0.004,
  });
  return s.done();
};

export default mouse;
