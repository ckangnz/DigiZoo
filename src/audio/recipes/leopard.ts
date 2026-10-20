import { Synth, blend, sequence } from '../synth';
import type { Recipe } from '../types';

const leopard: Recipe = (voice) => {
  const s = new Synth(voice, 0.53);
  const pitch = s.vary(0.05);
  const pace = s.vary(0.04);
  const starts = [0, 0.22, 0.4, 0.56, 0.7, 0.83, 0.95, 1.07].map((t) => t * pace);
  const lifts = [1, 0.9, 1.04, 0.92, 1.06, 0.93, 1.02, 0.9];
  const levels = [1, 0.6, 0.95, 0.55, 0.9, 0.5, 0.8, 0.45];
  s.vocal({
    dur: starts[starts.length - 1] + 0.14,
    pitch: sequence(
      [
        [0, 105],
        [0.04, 125],
        [0.14, 92],
      ],
      starts,
      (i) => lifts[i],
    ),
    transpose: pitch,
    vowel: blend('a', 'o', 0.35),
    wave: 'buzz',
    shift: 0.8,
    drive: 3,
    growl: { rate: 34, depth: 0.6, fry: 55 },
    breath: 0.7,
    tone: 3000,
    env: sequence(
      [
        [0, 0],
        [0.015, 1],
        [0.07, 0.65],
        [0.14, 0, 'exp'],
      ],
      starts,
      (i) => levels[i],
    ),
    gain: 0.55,
  });
  return s.done();
};

export default leopard;
