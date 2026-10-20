import { Synth } from '../synth';
import type { Recipe } from '../types';

const cheetah: Recipe = (voice) => {
  const s = new Synth(voice, 1.2);
  const pitch = s.vary(0.05);
  [0, 0.26, 0.52, 0.86].forEach((offset, index) => {
    const lift = pitch * [1, 1.04, 0.97, 1.12][index];
    s.chirp({
      at: offset === 0 ? 0 : offset + s.jitter(0.02),
      dur: 0.16,
      freq: [
        [0, 1250 * lift],
        [0.05, 1950 * lift],
        [0.11, 1800 * lift],
        [0.16, 1350 * lift],
      ],
      wave: [1, 0.3, 0.12],
      gain: index === 3 ? 0.32 : 0.42,
    });
  });
  return s.done();
};

export default cheetah;
