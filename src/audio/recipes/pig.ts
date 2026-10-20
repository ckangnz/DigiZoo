import { Synth } from '../synth';
import type { Recipe } from '../types';

const pig: Recipe = (voice) => {
  const s = new Synth(voice, 0.62);
  const pitch = s.vary(0.05);
  [0, 0.38 + s.jitter(0.02)].forEach((at, index) => {
    s.vocal({
      at,
      dur: 0.25,
      pitch: [
        [0, 190],
        [0.06, 260],
        [0.25, 170],
      ],
      transpose: pitch * (index === 0 ? 1 : 1.08),
      vowel: [
        [0, 'o'],
        [0.08, 'a'],
        [0.15, 'i'],
        [0.22, 'n'],
      ],
      wave: 'reed',
      shift: 0.95,
      breath: 0.2,
      growl: { rate: 38, depth: 0.5, fry: 25 },
      drive: 2,
      env: [
        [0, 0],
        [0.02, 1],
        [0.15, 0.8],
        [0.22, 0.4],
        [0.25, 0, 'exp'],
      ],
      gain: 0.5,
    });
    s.click({ at: at + 0.22, freq: 1800, q: 2, dur: 0.012, gain: 0.12 });
  });
  return s.done();
};

export default pig;
