import { Synth } from '../synth';
import type { Recipe } from '../types';

const dog: Recipe = (voice) => {
  const s = new Synth(voice, 0.9);
  const pitch = s.vary(0.05);
  [0, 0.4 + s.jitter(0.02)].forEach((at, index) => {
    s.vocal({
      at,
      dur: 0.22,
      pitch: [
        [0, 430],
        [0.05, 600],
        [0.22, 330],
      ],
      transpose: pitch * (index === 0 ? 1 : 1.06),
      vowel: [
        [0, 'u'],
        [0.05, 'a'],
        [0.14, 'o'],
        [0.22, 'u'],
      ],
      shift: 1.05,
      breath: 0.25,
      growl: { rate: 45, depth: 0.25, fry: 25 },
      drive: 1.5,
      env: [
        [0, 0],
        [0.02, 1],
        [0.08, 0.9],
        [0.22, 0, 'exp'],
      ],
      gain: 0.5,
    });
  });
  return s.done();
};

export default dog;
