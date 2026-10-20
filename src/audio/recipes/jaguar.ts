import { Synth, blend, sequence } from '../synth';
import type { Recipe } from '../types';

const jaguar: Recipe = (voice) => {
  const s = new Synth(voice, 0.42);
  const pitch = s.vary(0.05);
  const pace = s.vary(0.04);
  const starts = [0, 0.19, 0.44, 0.63, 0.88, 1.07].map((t) => t * pace);
  s.vocal({
    dur: starts[starts.length - 1] + 0.16,
    pitch: sequence(
      [
        [0, 92],
        [0.04, 108],
        [0.16, 80],
      ],
      starts,
      (i) => [1, 1.12, 0.97, 1.1, 0.95, 1.08][i],
    ),
    transpose: pitch,
    vowel: blend('a', 'o', 0.5),
    wave: 'buzz',
    shift: 0.78,
    drive: 3,
    growl: { rate: 30, depth: 0.6, fry: 60 },
    breath: 0.6,
    tone: 2800,
    env: sequence(
      [
        [0, 0],
        [0.015, 1],
        [0.08, 0.7],
        [0.16, 0, 'exp'],
      ],
      starts,
      (i) => [1, 0.55, 0.95, 0.5, 0.9, 0.45][i],
    ),
    gain: 0.55,
  });
  return s.done();
};

export default jaguar;
