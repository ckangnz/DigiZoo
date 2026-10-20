import { Synth, blend } from '../synth';
import type { Recipe } from '../types';

const sheep: Recipe = (voice) => {
  const s = new Synth(voice, 0.54);
  const pitch = s.vary(0.05);
  const dur = 1.05 * s.vary(0.05);
  const open = blend('a', 'e', 0.3);
  s.vocal({
    dur,
    pitch: [
      [0, 240],
      [0.12, 290],
      [0.75 * dur, 270],
      [dur, 220],
    ],
    transpose: pitch,
    vowel: [
      [0, 'u'],
      [0.05, open],
      [0.8 * dur, open],
      [dur, 'e'],
    ],
    wave: 'buzz',
    breath: 0.12,
    vibrato: { rate: 6.5, depth: 45, delay: 0.15 },
    growl: { rate: 6.5, depth: 0.4 },
    env: [
      [0, 0],
      [0.03, 0.9],
      [0.15, 1],
      [0.8 * dur, 0.85],
      [dur, 0, 'exp'],
    ],
    tone: 4500,
    gain: 0.5,
  });
  return s.done();
};

export default sheep;
