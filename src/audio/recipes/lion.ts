import { Synth } from '../synth';
import type { Recipe } from '../types';

const lion: Recipe = (voice) => {
  const s = new Synth(voice, 0.42);
  const pitch = s.vary(0.05);
  const dur = 1.35 * s.vary(0.04);
  const bus = s.bus(s.master, s.reverb({ seconds: 0.45, wet: 0.16, bright: 0.35 }));
  s.vocal({
    dur,
    pitch: [
      [0, 120],
      [0.12 * dur, 185],
      [0.35 * dur, 175],
      [0.75 * dur, 125],
      [dur, 85],
    ],
    transpose: pitch,
    vowel: [
      [0, 'o'],
      [0.1 * dur, 'a'],
      [0.6 * dur, 'a'],
      [0.85 * dur, 'o'],
      [dur, 'u'],
    ],
    wave: 'buzz',
    shift: 0.8,
    sub: 0.25,
    drive: 2.5,
    growl: { rate: 28, depth: 0.5, fry: 45 },
    jitter: 25,
    breath: 0.5,
    tone: [
      [0, 2000],
      [0.2 * dur, 4000],
      [dur, 1500],
    ],
    env: [
      [0, 0],
      [0.06 * dur, 0.7],
      [0.18 * dur, 1],
      [0.55 * dur, 0.85],
      [0.85 * dur, 0.35],
      [dur, 0, 'exp'],
    ],
    gain: 0.5,
    dest: bus,
  });
  return s.done();
};

export default lion;
