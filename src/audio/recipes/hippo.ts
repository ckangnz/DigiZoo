import { Synth, blend, sequence } from '../synth';
import type { Recipe } from '../types';

const hippo: Recipe = (voice) => {
  const s = new Synth(voice, 0.5);
  const pitch = s.vary(0.05);
  s.burst({
    dur: 0.38,
    color: 'white',
    freq: [
      [0, 900],
      [0.38, 1600],
    ],
    q: 7,
    env: [
      [0, 0],
      [0.3, 1],
      [0.38, 0, 'exp'],
    ],
    gain: 5,
  });
  s.note({
    dur: 0.38,
    freq: [
      [0, 900 * pitch],
      [0.38, 1600 * pitch],
    ],
    env: [
      [0, 0],
      [0.3, 1],
      [0.38, 0, 'exp'],
    ],
    gain: 0.1,
  });
  const honkAt = 0.42;
  const starts = [0, 0.27, 0.5];
  s.vocal({
    at: honkAt,
    dur: 0.72,
    pitch: sequence(
      [
        [0, 100],
        [0.05, 125],
        [0.2, 92],
      ],
      starts,
      (i) => [1, 0.95, 0.9][i],
    ),
    transpose: pitch,
    vowel: blend('a', 'o', 0.5),
    wave: 'buzz',
    shift: 0.72,
    drive: 3,
    sub: 0.3,
    growl: { rate: 22, depth: 0.4, fry: 30 },
    breath: 0.2,
    tone: 2600,
    env: sequence(
      [
        [0, 0],
        [0.02, 1],
        [0.1, 0.8],
        [0.2, 0, 'exp'],
      ],
      starts,
      (i) => [1, 0.9, 0.8][i],
    ),
    gain: 0.55,
  });
  [0.215, 0.43].forEach((offset) => {
    s.burst({ at: honkAt + offset, dur: 0.06, color: 'white', freq: 1400, q: 6, gain: 2.5 });
  });
  return s.done();
};

export default hippo;
