import { Synth } from '../synth';
import type { Recipe } from '../types';

const warthog: Recipe = (voice) => {
  const s = new Synth(voice, 0.6);
  const pitch = s.vary(0.05);
  const pace = s.vary(0.05);
  [0, 0.28, 0.52].forEach((offset, index) => {
    const at = offset * pace;
    const dur = index === 2 ? 0.26 : 0.18;
    s.vocal({
      at,
      dur,
      pitch: [
        [0, 115],
        [0.05, 145],
        [dur, 92],
      ],
      transpose: pitch * [1, 1.08, 0.94][index],
      vowel: [
        [0, 'o'],
        [0.05, 'a'],
        [dur * 0.7, 'o'],
        [dur, 'n'],
      ],
      wave: 'reed',
      shift: 0.8,
      sub: 0.3,
      breath: 0.3,
      growl: { rate: 30, depth: 0.55, fry: 30 },
      drive: 2.5,
      env: [
        [0, 0],
        [0.02, 1],
        [dur * 0.6, 0.75],
        [dur, 0, 'exp'],
      ],
      tone: 2600,
      gain: 0.5,
    });
  });
  const flutter = s.tremolo({ rate: 30, depth: 0.7, at: 0.9 * pace, dur: 0.24 });
  s.burst({
    at: 0.9 * pace,
    dur: 0.22,
    color: 'pink',
    type: 'lowpass',
    freq: [
      [0, 1600],
      [0.22, 500],
    ],
    q: 2,
    env: [
      [0, 0],
      [0.012, 1],
      [0.08, 0.6],
      [0.22, 0, 'exp'],
    ],
    gain: 1.6,
    dest: flutter,
  });
  return s.done();
};

export default warthog;
