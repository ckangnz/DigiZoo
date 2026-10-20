import { Synth } from '../synth';
import type { Recipe } from '../types';

const kidneys: Recipe = (voice) => {
  const s = new Synth(voice, 1.57);
  const pitch = s.vary(0.05);
  [0, 0.32 + s.jitter(0.015)].forEach((at, index) => {
    const lift = pitch * (index === 0 ? 1 : 1.12);
    s.squelch({ at, freq: 520 * lift, dur: 0.1, gain: 0.4 });
    s.spring({
      at: at + 0.03,
      dur: 0.45,
      freq: [
        [0, 220 * lift],
        [0.05, 300 * lift],
        [0.45, 320 * lift],
      ],
      depth: 380,
      gain: 0.4,
    });
  });
  return s.done();
};

export default kidneys;
