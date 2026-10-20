import { Synth } from '../synth';
import type { Recipe } from '../types';

const turkey: Recipe = (voice) => {
  const s = new Synth(voice, 0.54);
  const pitch = s.vary(0.05);
  const pace = s.vary(0.04);
  [0, 0.62].forEach((offset, index) => {
    const dur = 0.5;
    const warble = s.tremolo({ rate: 16, depth: 0.75, at: offset * pace, dur: dur + 0.02 });
    s.vocal({
      at: offset * pace,
      dur,
      pitch: [
        [0, 760],
        [0.05, 820],
        [dur, 520],
      ],
      transpose: pitch * (index === 0 ? 1 : 0.96),
      vowel: [
        [0, 'o'],
        [0.15, 'u'],
        [0.3, 'o'],
        [dur, 'u'],
      ],
      wave: 'reed',
      shift: 1.2,
      breath: 0.2,
      vibrato: { rate: 16, depth: 160 },
      drive: 1.5,
      env: [
        [0, 0],
        [0.02, 1],
        [dur * 0.7, 0.8],
        [dur, 0, 'exp'],
      ],
      tone: 5000,
      gain: 0.5,
      dest: warble,
    });
  });
  return s.done();
};

export default turkey;
