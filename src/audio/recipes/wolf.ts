import { Synth } from '../synth';
import type { Recipe } from '../types';

const wolf: Recipe = (voice) => {
  const s = new Synth(voice, 0.104).stereo();
  const pitch = s.vary(0.05);
  const night = s.bus(s.master, s.reverb({ seconds: 0.5, wet: 0.35, bright: 0.35 }));
  const dur = 1.5 * s.vary(0.02);
  s.vocal({
    dur,
    pitch: [
      [0, 380],
      [0.17 * dur, 560],
      [0.33 * dur, 590],
      [0.7 * dur, 560],
      [0.9 * dur, 500],
      [dur, 400],
    ],
    transpose: pitch,
    vowel: [
      [0, 'a'],
      [0.17 * dur, 'o'],
      [0.33 * dur, 'u'],
      [dur, 'u'],
    ],
    wave: 'glottal',
    breath: 0.15,
    vibrato: { rate: 5, depth: 18, delay: 0.5 },
    jitter: 6,
    env: [
      [0, 0],
      [0.1 * dur, 0.6],
      [0.27 * dur, 1],
      [0.73 * dur, 0.85],
      [dur, 0, 'exp'],
    ],
    tone: 3500,
    gain: 0.5,
    dest: night,
  });
  return s.done();
};

export default wolf;
