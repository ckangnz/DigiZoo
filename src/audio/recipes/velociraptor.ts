import { Synth } from '../synth';
import type { Recipe } from '../types';

const velociraptor: Recipe = (voice) => {
  const s = new Synth(voice, 0.64);
  const pitch = s.vary(0.05);
  const pace = s.vary(0.05);
  [0, 0.07, 0.14, 0.21, 0.28].forEach((offset, index) => {
    const at = offset * pace;
    s.thump({ at, from: 240, to: 130, dur: 0.05, gain: 0.35 });
    s.click({ at, freq: index % 2 === 0 ? 2600 : 2200, q: 3, dur: 0.008, gain: 0.25 });
  });
  [0.42, 0.55, 0.68, 0.88].forEach((offset, index) => {
    const last = index === 3;
    const dur = last ? 0.16 : 0.08;
    s.vocal({
      at: offset * pace,
      dur,
      pitch: [
        [0, 760],
        [0.02, 900],
        [dur, last ? 640 : 700],
      ],
      transpose: pitch * [1, 1.05, 0.98, 1.1][index],
      vowel: [
        [0, 'e'],
        [0.02, 'a'],
        [dur, 'e'],
      ],
      shift: 1.3,
      drive: 1.5,
      growl: { rate: 55, depth: 0.3, fry: 25 },
      breath: 0.3,
      env: [
        [0, 0],
        [0.008, 1],
        [dur * 0.6, 0.6],
        [dur, 0, 'exp'],
      ],
      tone: 6000,
      gain: 0.5,
    });
  });
  return s.done();
};

export default velociraptor;
