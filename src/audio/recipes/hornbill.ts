import { Synth, blend } from '../synth';
import type { Recipe } from '../types';

const hornbill: Recipe = (voice) => {
  const s = new Synth(voice, 0.55).stereo();
  const pitch = s.vary(0.05);
  const pace = s.vary(0.05);
  const kok = blend('o', 'a', 0.3);
  [0, 0.17, 0.34].forEach((offset, index) => {
    const dur = 0.11;
    s.vocal({
      at: offset * pace,
      dur,
      pitch: [
        [0, 380],
        [0.02, 450],
        [dur, 340],
      ],
      transpose: pitch * [1, 1.05, 0.96][index],
      vowel: [
        [0, 'u'],
        [0.02, kok],
        [dur, 'o'],
      ],
      wave: 'reed',
      shift: 1.0,
      drive: 2,
      growl: { rate: 45, depth: 0.3, fry: 25 },
      breath: 0.2,
      env: [
        [0, 0],
        [0.01, 1],
        [0.06, 0.7],
        [dur, 0, 'exp'],
      ],
      tone: 4500,
      gain: 0.5,
    });
  });
  [0.62, 0.84, 1.06].forEach((offset, index) => {
    s.flap({
      at: offset * pace,
      freq: 1000,
      dur: 0.2,
      gain: 1.6 - index * 0.25,
      pan: -0.5 + index * 0.5,
    });
  });
  return s.done();
};

export default hornbill;
