import { Synth, blend, sequence } from '../synth';
import type { Recipe } from '../types';

const rhino: Recipe = (voice) => {
  const s = new Synth(voice, 0.38);
  const pitch = s.vary(0.05);
  const flutter = s.tremolo({ rate: 30, depth: 0.6, dur: 0.3 });
  s.burst({
    dur: 0.28,
    color: 'pink',
    type: 'lowpass',
    freq: [
      [0, 1600],
      [0.25, 500],
    ],
    q: 2,
    env: [
      [0, 0],
      [0.012, 1],
      [0.08, 0.7],
      [0.28, 0, 'exp'],
    ],
    gain: 2.6,
    dest: flutter,
  });
  const starts = [0, 0.36];
  s.vocal({
    at: 0.42,
    dur: 0.62,
    pitch: sequence(
      [
        [0, 92],
        [0.05, 108],
        [0.26, 78],
      ],
      starts,
      (i) => [1, 0.9][i],
    ),
    transpose: pitch,
    vowel: blend('a', 'o', 0.6),
    wave: 'buzz',
    shift: 0.7,
    sub: 0.4,
    drive: 2.5,
    growl: { rate: 25, depth: 0.5, fry: 40 },
    breath: 0.3,
    tone: 2400,
    env: sequence(
      [
        [0, 0],
        [0.02, 1],
        [0.12, 0.75],
        [0.26, 0, 'exp'],
      ],
      starts,
      (i) => [1, 0.75][i],
    ),
    gain: 0.55,
  });
  return s.done();
};

export default rhino;
