import { Synth } from '../synth';
import type { Recipe } from '../types';

const jerboa: Recipe = (voice) => {
  const s = new Synth(voice, 1.65);
  const pitch = s.vary(0.05);
  const pace = s.vary(0.05);
  [0, 0.24, 0.48].forEach((offset, index) => {
    const at = offset * pace;
    const lift = pitch * (1 + index * 0.08);
    s.thump({ at, from: 260 * lift, to: 160 * lift, dur: 0.05, gain: 0.25 });
    s.spring({
      at: at + 0.01,
      dur: 0.2,
      freq: [
        [0, 330 * lift],
        [0.05, 700 * lift],
        [0.2, 760 * lift],
      ],
      depth: 260,
      rate: 22,
      gain: 0.32,
    });
  });
  [0.78, 0.9].forEach((offset, index) => {
    const lift = pitch * (index === 0 ? 1 : 1.1);
    s.chirp({
      at: offset * pace,
      dur: 0.07,
      freq: [
        [0, 3000 * lift],
        [0.025, 3900 * lift],
        [0.07, 3200 * lift],
      ],
      wave: [1, 0.15],
      gain: 0.2,
    });
  });
  return s.done();
};

export default jerboa;
