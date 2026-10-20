import { Synth } from '../synth';
import type { Recipe } from '../types';

const chicken: Recipe = (voice) => {
  const s = new Synth(voice, 0.75);
  const pitch = s.vary(0.05);
  [0, 0.19, 0.36].forEach((offset, index) => {
    s.vocal({
      at: Math.max(0, offset + s.jitter(0.012)),
      dur: 0.09,
      pitch: [
        [0, 380],
        [0.03, 430],
        [0.09, 330],
      ],
      transpose: pitch * (1 + index * 0.03),
      vowel: [
        [0, 'u'],
        [0.03, 'o'],
        [0.09, 'u'],
      ],
      shift: 1.2,
      breath: 0.2,
      drive: 1.5,
      env: [
        [0, 0],
        [0.01, 1],
        [0.05, 0.7],
        [0.09, 0, 'exp'],
      ],
      gain: 0.75,
    });
  });
  s.vocal({
    at: 0.55,
    dur: 0.38,
    pitch: [
      [0, 520],
      [0.06, 820],
      [0.25, 760],
      [0.38, 520],
    ],
    transpose: pitch,
    vowel: [
      [0, 'u'],
      [0.05, 'a'],
      [0.25, 'a'],
      [0.38, 'o'],
    ],
    shift: 1.25,
    breath: 0.2,
    growl: { rate: 55, depth: 0.4, fry: 40 },
    drive: 2,
    env: [
      [0, 0],
      [0.03, 1],
      [0.22, 0.85],
      [0.38, 0, 'exp'],
    ],
    gain: 0.5,
  });
  return s.done();
};

export default chicken;
