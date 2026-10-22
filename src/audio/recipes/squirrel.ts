import { Synth, sequence, vowelSequence } from '../synth';
import type { Recipe } from '../types';

const squirrel: Recipe = (voice) => {
  const s = new Synth(voice, 0.823).stereo();
  const pitch = s.vary(0.05);
  const pace = s.vary(0.04);
  const branch = s.filter('highpass', 600, 0.7, { dest: s.master });
  const starts = Array.from({ length: 7 }, (_, i) => i * 0.075 * pace);
  s.vocal({
    dur: starts[starts.length - 1] + 0.06,
    pitch: sequence(
      [
        [0, 1300],
        [0.02, 1650],
        [0.05, 1250],
      ],
      starts,
      (i) => [1, 1.04, 0.98, 1.06, 1.02, 1.08, 1.04][i],
    ),
    transpose: pitch,
    vowel: vowelSequence(
      [
        [0, 'e'],
        [0.02, 'a'],
        [0.05, 'e'],
      ],
      starts,
    ),
    shift: 1.5,
    breath: 0.5,
    env: sequence(
      [
        [0, 0],
        [0.006, 1],
        [0.03, 0.5],
        [0.055, 0, 'exp'],
      ],
      starts,
    ),
    tone: 7000,
    gain: 0.5,
    pan: -0.15,
    dest: branch,
  });
  s.vocal({
    at: 0.65 * pace,
    dur: 0.25,
    pitch: [
      [0, 1100],
      [0.06, 1500],
      [0.25, 1000],
    ],
    transpose: pitch,
    vowel: [
      [0, 'u'],
      [0.05, 'a'],
      [0.25, 'a'],
    ],
    shift: 1.5,
    breath: 0.45,
    growl: { rate: 50, depth: 0.2, fry: 30 },
    env: [
      [0, 0],
      [0.015, 1],
      [0.15, 0.7],
      [0.25, 0, 'exp'],
    ],
    tone: 7000,
    gain: 0.45,
    pan: -0.15,
    dest: branch,
  });
  const times = Array.from({ length: 14 }, (_, i) => (1.05 + i * 0.022 + s.range(0, 0.006)) * pace);
  s.clicks({
    times,
    freq: times.map(() => s.range(3000, 4500)),
    gain: times.map(() => s.range(0.35, 0.5)),
    q: 3,
    dur: 0.005,
    pan: 0.2,
  });
  return s.done();
};

export default squirrel;
