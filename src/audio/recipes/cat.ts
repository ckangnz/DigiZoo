import { Synth } from '../synth';
import type { Recipe } from '../types';

const cat: Recipe = (voice) => {
  const s = new Synth(voice, 1.0);
  const pitch = s.vary(0.05);
  const dur = 0.9 * s.vary(0.05);
  s.vocal({
    dur,
    pitch: [
      [0, 560],
      [0.33 * dur, 840],
      [0.55 * dur, 780],
      [dur, 480],
    ],
    transpose: pitch,
    vowel: [
      [0, 'n'],
      [0.1 * dur, 'i'],
      [0.28 * dur, 'e'],
      [0.48 * dur, 'a'],
      [0.72 * dur, 'o'],
      [dur, 'u'],
    ],
    shift: 1.25,
    breath: 0.07,
    vibrato: { rate: 6, depth: 18, delay: 0.25 },
    jitter: 12,
    env: [
      [0, 0],
      [0.08 * dur, 0.65],
      [0.35 * dur, 1],
      [0.72 * dur, 0.75],
      [dur, 0, 'exp'],
    ],
    tone: 7000,
    gain: 0.5,
  });
  return s.done();
};

export default cat;
