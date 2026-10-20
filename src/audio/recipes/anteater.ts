import { Synth } from '../synth';
import type { Recipe } from '../types';

const anteater: Recipe = (voice) => {
  const s = new Synth(voice, 1.36);
  const pitch = s.vary(0.05);
  const pace = s.vary(0.05);
  [0, 0.12].forEach((offset) => {
    s.burst({
      at: offset * pace,
      dur: 0.07,
      color: 'pink',
      freq: 2400 * pitch,
      q: 1.5,
      env: [
        [0, 0],
        [0.03, 1],
        [0.07, 0, 'exp'],
      ],
      gain: 0.35,
    });
  });
  [0.32, 0.55, 0.78].forEach((offset, index) => {
    const at = offset * pace;
    const dur = 0.18;
    s.burst({
      at,
      dur,
      color: 'pink',
      type: 'lowpass',
      freq: [
        [0, 300 * pitch],
        [0.09, 1600 * pitch],
        [dur, 700 * pitch],
      ],
      q: 10,
      env: [
        [0, 0],
        [0.02, 1],
        [0.12, 0.7],
        [dur, 0, 'exp'],
      ],
      gain: 0.5 - index * 0.05,
    });
    s.bubble({ at: at + 0.12, freq: 380 * pitch, rise: 1.8, dur: 0.05, gain: 0.15 });
  });
  return s.done();
};

export default anteater;
