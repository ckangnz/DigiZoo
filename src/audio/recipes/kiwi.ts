import { Synth } from '../synth';
import type { Recipe } from '../types';

const kiwi: Recipe = (voice) => {
  const s = new Synth(voice, 1.13).stereo();
  const pitch = s.vary(0.04);
  const pace = s.vary(0.04);
  const night = s.bus(s.master, s.reverb({ seconds: 0.4, wet: 0.25, bright: 0.35 }));
  [0, 0.36, 0.72].forEach((offset, index) => {
    const at = offset * pace;
    const lift = pitch * (1 + index * 0.025);
    const level = 0.8 + index * 0.1;
    s.note({
      at,
      dur: 0.07,
      freq: [
        [0, 1300 * lift],
        [0.07, 1700 * lift],
      ],
      wave: [1, 0.15, 0.05],
      env: [
        [0, 0],
        [0.01, 1],
        [0.07, 0, 'exp'],
      ],
      gain: 0.22 * level,
      dest: night,
    });
    s.note({
      at: at + 0.09,
      dur: 0.17,
      freq: [
        [0, 1600 * lift],
        [0.13, 2400 * lift],
        [0.17, 2300 * lift],
      ],
      wave: [1, 0.15, 0.05],
      env: [
        [0, 0],
        [0.02, 0.7],
        [0.13, 1],
        [0.17, 0, 'exp'],
      ],
      gain: 0.25 * level,
      dest: night,
    });
  });
  return s.done();
};

export default kiwi;
