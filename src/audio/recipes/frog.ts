import { Synth, sequence, vowelSequence } from '../synth';
import type { Recipe } from '../types';

const frog: Recipe = (voice) => {
  const s = new Synth(voice, 0.65);
  const pitch = s.vary(0.05);
  const starts = [0, 0.5 + s.jitter(0.02)];
  const level = (i: number) => [1, 0.8][i];
  const tone = (i: number) => [1, 0.95][i];
  s.vocal({
    dur: starts[1] + 0.16,
    pitch: sequence(
      [
        [0, 95],
        [0.16, 105],
      ],
      starts,
      tone,
    ),
    transpose: pitch,
    vowel: vowelSequence(
      [
        [0, 'u'],
        [0.04, 'i'],
        [0.16, 'i'],
      ],
      starts,
    ),
    width: 1,
    drive: 1.5,
    growl: { rate: 28, depth: 0.5 },
    breath: 0.1,
    env: sequence(
      [
        [0, 0],
        [0.015, 1],
        [0.12, 0.85],
        [0.16, 0, 'exp'],
      ],
      starts,
      level,
    ),
    gain: 0.5,
  });
  const bits = starts.map((t) => t + 0.21);
  s.vocal({
    at: bits[0],
    dur: bits[1] - bits[0] + 0.1,
    pitch: sequence(
      [
        [0, 120],
        [0.1, 115],
      ],
      bits.map((t) => t - bits[0]),
      tone,
    ),
    transpose: pitch,
    vowel: vowelSequence(
      [
        [0, 'i'],
        [0.1, 'e'],
      ],
      bits.map((t) => t - bits[0]),
    ),
    width: 1,
    growl: { rate: 40, depth: 0.4 },
    breath: 0.1,
    env: sequence(
      [
        [0, 0],
        [0.01, 1],
        [0.06, 0.8],
        [0.1, 0, 'exp'],
      ],
      bits.map((t) => t - bits[0]),
      level,
    ),
    gain: 0.8,
  });
  s.clicks({ times: starts.map((t) => t + 0.33), freq: 3500, q: 2, dur: 0.008, gain: 0.1 });
  return s.done();
};

export default frog;
