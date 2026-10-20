import { Synth } from '../synth';
import type { Recipe } from '../types';

const blackCat: Recipe = (voice) => {
  const s = new Synth(voice, 1.04);
  const pitch = s.vary(0.05);
  s.vocal({
    dur: 0.24,
    pitch: [
      [0, 380],
      [0.12, 470],
      [0.24, 450],
    ],
    transpose: pitch,
    vowel: [
      [0, 'n'],
      [0.12, 'u'],
      [0.24, 'u'],
    ],
    wave: 'glottal',
    growl: { rate: 26, depth: 0.8 },
    breath: 0.2,
    env: [
      [0, 0],
      [0.04, 1],
      [0.18, 0.8],
      [0.24, 0, 'exp'],
    ],
    tone: 4000,
    gain: 0.12,
  });
  const dur = 0.62;
  s.vocal({
    at: 0.3,
    dur,
    pitch: [
      [0, 520],
      [0.2 * dur, 760],
      [0.5 * dur, 720],
      [dur, 470],
    ],
    transpose: pitch,
    vowel: [
      [0, 'n'],
      [0.1 * dur, 'i'],
      [0.3 * dur, 'e'],
      [0.5 * dur, 'a'],
      [0.75 * dur, 'o'],
      [dur, 'u'],
    ],
    shift: 1.15,
    breath: 0.08,
    vibrato: { rate: 6, depth: 20, delay: 0.2 },
    jitter: 10,
    env: [
      [0, 0],
      [0.08 * dur, 0.7],
      [0.35 * dur, 1],
      [0.75 * dur, 0.75],
      [dur, 0, 'exp'],
    ],
    tone: 6500,
    gain: 0.5,
  });
  return s.done();
};

export default blackCat;
