import { Synth, sequence } from '../synth';
import type { Recipe } from '../types';

const monkey: Recipe = (voice) => {
  const s = new Synth(voice, 0.92);
  const pitch = s.vary(0.05);
  const pace = s.vary(0.04);
  const oohStarts = [0, 0.2 * pace];
  s.vocal({
    dur: 0.2 * pace + 0.15,
    pitch: sequence(
      [
        [0, 380],
        [0.05, 470],
        [0.15, 430],
      ],
      oohStarts,
      (i) => [1, 1.05][i],
    ),
    transpose: pitch,
    vowel: 'u',
    shift: 1.15,
    breath: 0.25,
    env: sequence(
      [
        [0, 0],
        [0.03, 1],
        [0.1, 0.8],
        [0.15, 0, 'exp'],
      ],
      oohStarts,
    ),
    gain: 0.45,
  });
  const aahAt = 0.44 * pace;
  const aahStarts = [0, 0.23 * pace];
  s.vocal({
    at: aahAt,
    dur: 0.23 * pace + 0.19,
    pitch: sequence(
      [
        [0, 620],
        [0.05, 780],
        [0.18, 700],
      ],
      aahStarts,
      (i) => [1, 1.06][i],
    ),
    transpose: pitch,
    vowel: 'a',
    shift: 1.15,
    breath: 0.25,
    drive: 1.5,
    env: sequence(
      [
        [0, 0],
        [0.025, 1],
        [0.12, 0.85],
        [0.19, 0, 'exp'],
      ],
      aahStarts,
    ),
    gain: 0.5,
  });
  s.vocal({
    at: aahAt + 0.5 * pace,
    dur: 0.2,
    pitch: [
      [0, 900],
      [0.08, 1250],
      [0.2, 1100],
    ],
    transpose: pitch,
    vowel: 'i',
    shift: 1.2,
    breath: 0.2,
    env: [
      [0, 0],
      [0.02, 1],
      [0.2, 0, 'exp'],
    ],
    gain: 0.3,
  });
  return s.done();
};

export default monkey;
