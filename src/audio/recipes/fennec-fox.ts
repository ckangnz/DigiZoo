import { Synth, sequence, vowelSequence } from '../synth';
import type { Recipe } from '../types';

const fennecFox: Recipe = (voice) => {
  const s = new Synth(voice, 0.94);
  const pitch = s.vary(0.05);
  const pace = s.vary(0.04);
  const starts = [0, 0.13, 0.26, 0.45, 0.58, 0.71, 0.86, 0.92, 0.98].map((t) => t * pace);
  const lifts = [1, 1.05, 0.97, 1.08, 1.02, 1.12, 1.2, 1.15, 1.22];
  s.vocal({
    dur: starts[starts.length - 1] + 0.08,
    pitch: sequence(
      [
        [0, 950],
        [0.02, 1250],
        [0.08, 900],
      ],
      starts,
      (i) => lifts[i],
    ),
    transpose: pitch,
    vowel: vowelSequence(
      [
        [0, 'i'],
        [0.03, 'a'],
        [0.08, 'e'],
      ],
      starts,
    ),
    shift: 1.5,
    breath: 0.3,
    env: sequence(
      [
        [0, 0],
        [0.008, 1],
        [0.04, 0.7],
        [0.08, 0, 'exp'],
      ],
      starts,
      (i) => (i >= 6 ? 0.6 : 1),
    ),
    gain: 0.45,
  });
  return s.done();
};

export default fennecFox;
