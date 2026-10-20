import { Synth, pluck } from '../synth';
import type { Recipe } from '../types';

const brain: Recipe = (voice) => {
  const s = new Synth(voice, 1.14).stereo();
  const pitch = s.vary(0.03);
  [0, 0.16, 0.32].forEach((at, index) => {
    s.note({
      at,
      dur: 0.1,
      freq: [
        [0, (520 + index * 90) * pitch],
        [0.1, (650 + index * 120) * pitch],
      ],
      wave: [1, 0.1],
      env: pluck(0.1, 1, 0.01),
      gain: 0.22,
      pan: -0.3 + index * 0.3,
    });
  });
  const idea = s.bus(s.master, s.reverb({ seconds: 0.35, wet: 0.25, bright: 0.6 }));
  s.bell({ at: 0.55, freq: 1568 * pitch, dur: 0.8, gain: 0.3, dest: idea });
  s.bell({ at: 0.55, freq: 2093 * pitch, dur: 0.65, gain: 0.16, dest: idea });
  [3136, 3951, 4699, 5274].forEach((freq, index) => {
    s.bell({
      at: 0.62 + index * 0.06,
      freq: freq * pitch,
      dur: 0.22,
      gain: 0.05,
      pan: index % 2 === 0 ? -0.5 : 0.5,
      dest: idea,
    });
  });
  return s.done();
};

export default brain;
