import { Synth, sequence, vowelSequence } from '../synth';
import type { Recipe } from '../types';

const CHUCKLES = [0, 0.12, 0.24, 0.36];
const LAUGHS = [1, 1.08, 1.16, 1.24, 1.3, 1.3, 1.22, 1.1, 0.95, 0.85];

const kookaburra: Recipe = (voice) => {
  const s = new Synth(voice, 0.723).stereo();
  const pitch = s.vary(0.05);
  const pace = s.vary(0.04);
  const bush = s.bus(s.master, s.reverb({ seconds: 0.3, wet: 0.2, bright: 0.4 }));
  const throat = s.filter('highpass', 300, 0.7, { dest: bush });
  const chuckles = CHUCKLES.map((t) => t * pace);
  s.vocal({
    dur: chuckles[chuckles.length - 1] + 0.1,
    pitch: sequence(
      [
        [0, 480],
        [0.03, 560],
        [0.09, 470],
      ],
      chuckles,
      (i) => 1 + i * 0.04,
    ),
    transpose: pitch,
    vowel: vowelSequence(
      [
        [0, 'u'],
        [0.03, 'o'],
        [0.09, 'u'],
      ],
      chuckles,
    ),
    shift: 1.3,
    breath: 0.35,
    growl: { rate: 45, depth: 0.3, fry: 30 },
    env: sequence(
      [
        [0, 0],
        [0.012, 1],
        [0.05, 0.6],
        [0.09, 0, 'exp'],
      ],
      chuckles,
      (i) => 0.55 + i * 0.1,
    ),
    tone: 6000,
    gain: 0.5,
    dest: throat,
  });
  const laughs = LAUGHS.map((_, i) => (0.5 + i * 0.11) * pace);
  const offset = laughs[0];
  const starts = laughs.map((t) => t - offset);
  s.vocal({
    at: offset,
    dur: starts[starts.length - 1] + 0.1,
    pitch: sequence(
      [
        [0, 700],
        [0.025, 900],
        [0.08, 720],
      ],
      starts,
      (i) => LAUGHS[i],
    ),
    transpose: pitch,
    vowel: vowelSequence(
      [
        [0, 'e'],
        [0.025, 'a'],
        [0.08, 'o'],
      ],
      starts,
    ),
    shift: 1.3,
    breath: 0.4,
    growl: { rate: 45, depth: 0.3, fry: 30 },
    env: sequence(
      [
        [0, 0],
        [0.01, 1],
        [0.05, 0.65],
        [0.09, 0, 'exp'],
      ],
      starts,
      (i) => [0.75, 0.85, 0.95, 1, 1, 1, 0.95, 0.85, 0.7, 0.55][i],
    ),
    tone: 6000,
    gain: 0.5,
    dest: throat,
  });
  return s.done();
};

export default kookaburra;
