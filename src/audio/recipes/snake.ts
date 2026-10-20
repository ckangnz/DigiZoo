import { Synth } from '../synth';
import type { Recipe } from '../types';

const snake: Recipe = (voice) => {
  const s = new Synth(voice, 1.45);
  const dur = 1.5 * s.vary(0.05);
  const sway = s.tremolo({ rate: 6.5, depth: 0.15, dur: dur + 0.02 });
  const air = s.filter('lowpass', 10000, 0, { dest: sway });
  s.burst({
    dur,
    color: 'white',
    type: 'highpass',
    freq: 3800 * s.vary(0.04),
    q: 5,
    env: [
      [0, 0],
      [0.2, 0.8],
      [0.5, 1],
      [0.8 * dur, 0.9],
      [dur, 0, 'exp'],
    ],
    gain: 0.45,
    dest: air,
  });
  return s.done();
};

export default snake;
