import { Synth } from '../synth';
import type { Recipe } from '../types';

const sloth: Recipe = (voice) => {
  const s = new Synth(voice, 0.2);
  const pitch = s.vary(0.05);
  const dur = 1.1 * s.vary(0.05);
  s.vocal({
    dur,
    pitch: [
      [0, 320],
      [0.23 * dur, 400],
      [0.64 * dur, 300],
      [dur, 210],
    ],
    transpose: pitch,
    vowel: [
      [0, 'a'],
      [0.36 * dur, 'a'],
      [0.68 * dur, 'o'],
      [dur, 'u'],
    ],
    shift: 1.05,
    wave: 'glottal',
    breath: 1.6,
    vibrato: { rate: 4.5, depth: 20, delay: 0.3 },
    tone: 3500,
    env: [
      [0, 0],
      [0.27 * dur, 0.8],
      [0.45 * dur, 1],
      [0.77 * dur, 0.6],
      [dur, 0, 'exp'],
    ],
    gain: 0.5,
  });
  s.chirp({
    at: dur + 0.18,
    dur: 0.16,
    freq: [
      [0, 1700 * pitch],
      [0.08, 2200 * pitch],
      [0.16, 1900 * pitch],
    ],
    wave: [1, 0.2],
    vibrato: { rate: 9, depth: 40 },
    gain: 1.1,
  });
  return s.done();
};

export default sloth;
