import { Synth } from '../synth';
import type { Recipe } from '../types';

const seal: Recipe = (voice) => {
  const s = new Synth(voice, 0.81);
  const pitch = s.vary(0.05);
  const pace = s.vary(0.05);
  [0, 0.22, 0.44].forEach((offset, index) => {
    const dur = index === 2 ? 0.16 : 0.13;
    s.vocal({
      at: offset * pace,
      dur,
      pitch: [
        [0, 420],
        [0.03, 520],
        [dur, 360],
      ],
      transpose: pitch * [1, 1.06, 0.95][index],
      vowel: [
        [0, 'o'],
        [0.03, 'a'],
        [dur * 0.7, 'a'],
        [dur, 'o'],
      ],
      wave: 'reed',
      shift: 1.05,
      breath: 0.25,
      growl: { rate: 40, depth: 0.35, fry: 25 },
      drive: 2,
      env: [
        [0, 0],
        [0.012, 1],
        [dur * 0.6, 0.75],
        [dur, 0, 'exp'],
      ],
      tone: 4500,
      gain: 0.5,
    });
  });
  [0.76, 0.9].forEach((offset) => {
    const at = offset * pace;
    s.burst({
      at,
      dur: 0.06,
      color: 'pink',
      freq: 1800,
      q: 0.8,
      env: [
        [0, 0],
        [0.002, 1],
        [0.06, 0, 'exp'],
      ],
      gain: 0.9,
    });
    s.thump({ at, from: 260, to: 140, dur: 0.05, gain: 0.3 });
  });
  return s.done();
};

export default seal;
