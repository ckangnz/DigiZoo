import { Synth } from '../synth';
import type { Recipe } from '../types';

const elephant: Recipe = (voice) => {
  const s = new Synth(voice, 0.5);
  const pitch = s.vary(0.05);
  const dur = 1.25 * s.vary(0.04);
  s.burst({ dur: 0.16, color: 'pink', freq: 1800, q: 0.8, gain: 0.15 });
  s.vocal({
    at: 0.02,
    dur,
    pitch: [
      [0, 280],
      [0.1, 470],
      [0.22, 640],
      [0.7 * dur, 620],
      [0.88 * dur, 560],
      [dur, 420],
    ],
    transpose: pitch,
    vowel: [
      [0, 'o'],
      [0.15, 'a'],
      [0.8 * dur, 'a'],
      [dur, 'o'],
    ],
    shift: 1.35,
    drive: 3.5,
    growl: { rate: 62, depth: 0.42, fry: 35 },
    jitter: 15,
    breath: 0.3,
    vibrato: { rate: 5.5, depth: 25, delay: 0.3 },
    tone: [
      [0, 1200],
      [0.2, 5500],
      [0.8 * dur, 4500],
      [dur, 1500],
    ],
    env: [
      [0, 0],
      [0.06, 0.6],
      [0.2, 1],
      [0.75 * dur, 0.9],
      [dur, 0, 'exp'],
    ],
    gain: 0.5,
  });
  return s.done();
};

export default elephant;
