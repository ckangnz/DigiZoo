import { Synth } from '../synth';
import type { Recipe } from '../types';

const octopus: Recipe = (voice) => {
  const s = new Synth(voice, 1.4);
  const pitch = s.vary(0.05);
  [0, 0.08, 0.16, 0.26, 0.34].forEach((at, index) => {
    s.bubble({
      at: at === 0 ? 0 : at + s.jitter(0.01),
      freq: [300, 380, 260, 420, 340][index] * pitch,
      rise: 2,
      dur: 0.07,
      gain: 0.35,
    });
  });
  [0.5, 0.82].forEach((at, index) => {
    const size = index === 0 ? 1 : 0.7;
    s.burst({
      at,
      dur: 0.25,
      color: 'pink',
      type: 'lowpass',
      freq: [
        [0, 400],
        [0.08, 1600],
        [0.25, 300],
      ],
      q: 12,
      env: [
        [0, 0],
        [0.02, 1],
        [0.12, 0.6],
        [0.25, 0, 'exp'],
      ],
      gain: 0.5 * size,
    });
    s.bubble({ at, freq: 150 * pitch, rise: 2.5, dur: 0.15, gain: 0.35 * size });
  });
  return s.done();
};

export default octopus;
