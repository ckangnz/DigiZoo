import { Synth, sequence } from '../synth';
import type { Recipe } from '../types';

const zebra: Recipe = (voice) => {
  const s = new Synth(voice, 0.69);
  const pitch = s.vary(0.05);
  s.click({ freq: 1800, q: 2, dur: 0.015, gain: 0.15 });
  s.vocal({
    at: 0.012,
    dur: 0.24,
    pitch: [
      [0, 560],
      [0.06, 720],
      [0.24, 600],
    ],
    transpose: pitch,
    vowel: [
      [0, 'u'],
      [0.05, 'a'],
      [0.24, 'a'],
    ],
    drive: 2.5,
    growl: { rate: 50, depth: 0.4, fry: 40 },
    breath: 0.35,
    shift: 1.05,
    env: [
      [0, 0],
      [0.02, 1],
      [0.12, 0.85],
      [0.24, 0, 'exp'],
    ],
    gain: 0.5,
  });
  const starts = [0, 0.17, 0.34, 0.51];
  const haAt = 0.34;
  starts.forEach((start) => {
    s.burst({ at: haAt + start - 0.03, dur: 0.05, color: 'pink', freq: 1300, q: 1, gain: 0.1 });
  });
  s.vocal({
    at: haAt,
    dur: 0.65,
    pitch: sequence(
      [
        [0, 640],
        [0.04, 690],
        [0.13, 560],
      ],
      starts,
      (i) => [1.05, 0.8, 0.95, 0.72][i],
    ),
    transpose: pitch,
    vowel: 'a',
    drive: 2,
    growl: { rate: 50, depth: 0.35, fry: 30 },
    breath: 0.5,
    shift: 1.05,
    env: sequence(
      [
        [0, 0],
        [0.02, 1],
        [0.07, 0.8],
        [0.13, 0, 'exp'],
      ],
      starts,
      (i) => [0.95, 0.75, 0.85, 0.65][i],
    ),
    gain: 0.5,
  });
  return s.done();
};

export default zebra;
