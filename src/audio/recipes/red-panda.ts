import { Synth, sequence, vowelSequence } from '../synth';
import type { Recipe } from '../types';

const redPanda: Recipe = (voice) => {
  const s = new Synth(voice, 0.96);
  const pitch = s.vary(0.05);
  const pace = s.vary(0.05);
  const starts = [0, 0.11, 0.22, 0.38].map((t) => t * pace);
  s.vocal({
    dur: starts[3] + 0.12,
    pitch: sequence(
      [
        [0, 1250],
        [0.025, 1550],
        [0.08, 1300],
      ],
      starts,
      (i) => [1, 1.06, 1.12, 1.02][i],
    ),
    transpose: pitch,
    vowel: vowelSequence(
      [
        [0, 'i'],
        [0.04, 'e'],
        [0.08, 'i'],
      ],
      starts,
    ),
    shift: 1.6,
    breath: 0.3,
    env: sequence(
      [
        [0, 0],
        [0.008, 1],
        [0.05, 0.6],
        [0.08, 0, 'exp'],
      ],
      starts,
      (i) => (i === 3 ? 0.85 : 1),
    ),
    tone: 7000,
    gain: 0.5,
  });
  s.burst({
    at: 0.62 * pace,
    dur: 0.2,
    color: 'pink',
    type: 'lowpass',
    freq: [
      [0, 1500],
      [0.2, 500],
    ],
    q: 1.5,
    env: [
      [0, 0],
      [0.015, 1],
      [0.2, 0, 'exp'],
    ],
    gain: 0.5,
  });
  return s.done();
};

export default redPanda;
