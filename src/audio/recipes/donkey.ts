import { Synth } from '../synth';
import type { Recipe } from '../types';

const donkey: Recipe = (voice) => {
  const s = new Synth(voice, 0.29);
  const pitch = s.vary(0.05);
  const pace = s.vary(0.04);
  [0, 0.82].forEach((offset, index) => {
    const at = offset * pace;
    const level = index === 0 ? 1 : 0.9;
    s.vocal({
      at,
      dur: 0.3,
      pitch: [
        [0, 820],
        [0.08, 1000],
        [0.3, 920],
      ],
      transpose: pitch,
      vowel: [
        [0, 'i'],
        [0.3, 'e'],
      ],
      wave: 'reed',
      shift: 1.2,
      breath: 0.35,
      growl: { rate: 28, depth: 0.3 },
      env: [
        [0, 0],
        [0.04, 1],
        [0.22, 0.8],
        [0.3, 0, 'exp'],
      ],
      tone: 6000,
      gain: 0.4 * level,
    });
    s.vocal({
      at: at + 0.33,
      dur: 0.4,
      pitch: [
        [0, 340],
        [0.06, 380],
        [0.4, 250],
      ],
      transpose: pitch,
      vowel: [
        [0, 'a'],
        [0.25, 'a'],
        [0.4, 'o'],
      ],
      wave: 'buzz',
      shift: 1.0,
      drive: 2.5,
      growl: { rate: 30, depth: 0.5, fry: 35 },
      breath: 0.3,
      env: [
        [0, 0],
        [0.03, 1],
        [0.28, 0.75],
        [0.4, 0, 'exp'],
      ],
      tone: 4000,
      gain: 0.5 * level,
    });
  });
  return s.done();
};

export default donkey;
