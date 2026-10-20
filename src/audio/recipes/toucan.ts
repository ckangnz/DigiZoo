import { Synth, blend, sequence } from '../synth';
import type { Recipe } from '../types';

const toucan: Recipe = (voice) => {
  const s = new Synth(voice, 0.3);
  const pitch = s.vary(0.05);
  const pace = s.vary(0.04);
  const starts = [0, 0.3, 0.6].map((t) => t * pace);
  s.vocal({
    dur: starts[2] + 0.2,
    pitch: sequence(
      [
        [0, 56],
        [0.1, 66],
        [0.2, 52],
      ],
      starts,
    ),
    transpose: pitch,
    vowel: blend('a', 'e', 0.5),
    shift: 1.5,
    width: 1.5,
    drive: 1.5,
    growl: { rate: 24, depth: 0.3 },
    breath: 0.35,
    tone: 5000,
    env: sequence(
      [
        [0, 0],
        [0.02, 1],
        [0.15, 0.8],
        [0.2, 0, 'exp'],
      ],
      starts,
    ),
    gain: 0.5,
  });
  s.clicks({ times: starts.map((t) => t + 0.19), freq: 2200, q: 3, dur: 0.012, gain: 0.15 });
  return s.done();
};

export default toucan;
