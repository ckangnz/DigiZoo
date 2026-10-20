import { Synth, sequence, vowelSequence } from '../synth';
import type { Recipe } from '../types';

const witch: Recipe = (voice) => {
  const s = new Synth(voice, 1.07).stereo();
  const pitch = s.vary(0.04);
  const pace = s.vary(0.04);
  const starts = [0, 0.1, 0.2, 0.3, 0.4].map((t) => t * pace);
  starts.forEach((at) => {
    s.burst({ at, dur: 0.03, color: 'pink', freq: 2800, q: 1, gain: 0.05 });
  });
  s.vocal({
    at: 0.012,
    dur: starts[4] + 0.08,
    pitch: sequence(
      [
        [0, 760],
        [0.025, 880],
        [0.08, 700],
      ],
      starts,
      (i) => [1, 1.04, 0.98, 0.95, 0.92][i],
    ),
    transpose: pitch,
    vowel: vowelSequence(
      [
        [0, 'i'],
        [0.035, 'e'],
        [0.08, 'e'],
      ],
      starts,
    ),
    shift: 1.35,
    breath: 0.3,
    growl: { rate: 45, depth: 0.25 },
    env: sequence(
      [
        [0, 0],
        [0.012, 1],
        [0.05, 0.6],
        [0.08, 0, 'exp'],
      ],
      starts,
      (i) => [1, 0.9, 0.85, 0.8, 0.75][i],
    ),
    tone: 6500,
    gain: 0.5,
  });
  const longAt = starts[4] + 0.16;
  s.vocal({
    at: longAt,
    dur: 0.45,
    pitch: [
      [0, 820],
      [0.08, 1050],
      [0.3, 980],
      [0.45, 860],
    ],
    transpose: pitch,
    vowel: [
      [0, 'i'],
      [0.3, 'i'],
      [0.45, 'e'],
    ],
    shift: 1.35,
    breath: 0.3,
    growl: { rate: 45, depth: 0.2 },
    vibrato: { rate: 9, depth: 70, delay: 0.06 },
    env: [
      [0, 0],
      [0.02, 1],
      [0.3, 0.75],
      [0.45, 0, 'exp'],
    ],
    tone: 6500,
    gain: 0.45,
  });
  [2093, 2637, 3136, 4186].forEach((freq, index) => {
    s.bell({
      at: longAt + 0.36 + index * 0.05,
      freq: freq * pitch,
      dur: 0.25,
      gain: 0.07,
      pan: -0.4 + index * 0.27,
    });
  });
  return s.done();
};

export default witch;
