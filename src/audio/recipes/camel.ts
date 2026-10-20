import { Synth } from '../synth';
import type { Recipe } from '../types';

const camel: Recipe = (voice) => {
  const s = new Synth(voice, 0.43);
  const pitch = s.vary(0.05);
  const dur = 1.3 * s.vary(0.04);
  s.vocal({
    dur,
    pitch: [
      [0, 95],
      [0.23 * dur, 120],
      [0.62 * dur, 110],
      [dur, 80],
    ],
    transpose: pitch,
    vowel: [
      [0, 'o'],
      [0.23 * dur, 'a'],
      [0.62 * dur, 'o'],
      [dur, 'u'],
    ],
    wave: 'buzz',
    shift: 0.75,
    sub: 0.35,
    drive: 3,
    growl: { rate: 13, depth: 0.6, fry: 60 },
    jitter: 40,
    breath: 0.3,
    tone: 2500,
    env: [
      [0, 0],
      [0.12 * dur, 0.8],
      [0.3 * dur, 1],
      [0.77 * dur, 0.8],
      [dur, 0, 'exp'],
    ],
    gain: 0.5,
  });
  for (let i = 0; i < 10; i++) {
    const at = (0.2 + (i + s.range(0, 0.8)) * 0.065) * dur;
    s.bubble({ at, freq: s.range(150, 320), rise: 1.8, dur: 0.07, gain: s.range(0.3, 0.45) });
  }
  return s.done();
};

export default camel;
