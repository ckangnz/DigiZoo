import { Synth, blend } from '../synth';
import type { Recipe } from '../types';

const lamb: Recipe = (voice) => {
  const s = new Synth(voice, 0.84);
  const pitch = s.vary(0.05);
  const dur = 0.72 * s.vary(0.04);
  const open = blend('a', 'e', 0.4);
  s.vocal({
    dur,
    pitch: [
      [0, 420],
      [0.1, 520],
      [0.7 * dur, 490],
      [dur, 430],
    ],
    transpose: pitch,
    vowel: [
      [0, 'n'],
      [0.06, open],
      [0.8 * dur, open],
      [dur, 'e'],
    ],
    wave: 'reed',
    shift: 1.2,
    breath: 0.12,
    vibrato: { rate: 7.5, depth: 60, delay: 0.1 },
    growl: { rate: 7.5, depth: 0.35 },
    env: [
      [0, 0],
      [0.04, 0.9],
      [0.12, 1],
      [0.8 * dur, 0.8],
      [dur, 0, 'exp'],
    ],
    tone: 5000,
    gain: 0.5,
  });
  return s.done();
};

export default lamb;
