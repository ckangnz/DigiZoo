import { Synth } from '../synth';
import type { Recipe } from '../types';

const parrot: Recipe = (voice) => {
  const s = new Synth(voice, 0.36);
  const pitch = s.vary(0.05);
  s.vocal({
    dur: 0.28,
    pitch: [
      [0, 700],
      [0.05, 980],
      [0.28, 650],
    ],
    transpose: pitch,
    vowel: [
      [0, 'e'],
      [0.05, 'a'],
      [0.28, 'a'],
    ],
    shift: 1.6,
    drive: 3,
    growl: { rate: 90, depth: 0.5, fry: 60 },
    breath: 0.4,
    tone: 7000,
    env: [
      [0, 0],
      [0.02, 1],
      [0.15, 0.85],
      [0.28, 0, 'exp'],
    ],
    gain: 0.5,
  });
  s.note({
    at: 0.45,
    dur: 0.22,
    freq: [
      [0, 1500 * pitch],
      [0.12, 2500 * pitch],
      [0.22, 2400 * pitch],
    ],
    attack: 0.02,
    vibrato: { rate: 7, depth: 25 },
    gain: 0.55,
  });
  s.note({
    at: 0.72,
    dur: 0.3,
    freq: [
      [0, 2300 * pitch],
      [0.3, 1400 * pitch],
    ],
    attack: 0.02,
    vibrato: { rate: 7, depth: 25 },
    gain: 0.48,
  });
  return s.done();
};

export default parrot;
