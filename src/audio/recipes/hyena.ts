import { Synth, sequence, vowelSequence } from '../synth';
import type { Recipe } from '../types';

const hyena: Recipe = (voice) => {
  const s = new Synth(voice, 0.75);
  const pitch = s.vary(0.05);
  const pace = s.vary(0.04);
  const starts = [0, 0.12, 0.24, 0.36, 0.48, 0.6, 0.74].map((t) => t * pace);
  const lifts = [0.85, 0.95, 1.05, 1.15, 1.22, 1.15, 1.0];
  s.vocal({
    dur: starts[starts.length - 1] + 0.16,
    pitch: sequence(
      [
        [0, 520],
        [0.03, 640],
        [0.09, 560],
      ],
      starts,
      (i) => lifts[i],
    ),
    transpose: pitch,
    vowel: vowelSequence(
      [
        [0, 'i'],
        [0.03, 'a'],
        [0.09, 'e'],
      ],
      starts,
    ),
    shift: 1.2,
    breath: 0.45,
    growl: { rate: 40, depth: 0.25 },
    env: sequence(
      [
        [0, 0],
        [0.012, 1],
        [0.06, 0.6],
        [0.1, 0, 'exp'],
      ],
      starts,
      (i) => (i === starts.length - 1 ? 0.9 : 1),
    ),
    tone: 6000,
    gain: 0.5,
  });
  return s.done();
};

export default hyena;
