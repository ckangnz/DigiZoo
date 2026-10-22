import { Synth, sequence, vowelSequence } from '../synth';
import type { Recipe } from '../types';

const arcticFox: Recipe = (voice) => {
  const s = new Synth(voice, 0.861).stereo();
  const pitch = s.vary(0.05);
  const pace = s.vary(0.04);
  const starts = [0, 0.17, 0.34].map((t) => t * pace);
  s.vocal({
    dur: starts[2] + 0.11,
    pitch: sequence(
      [
        [0, 780],
        [0.02, 1080],
        [0.11, 740],
      ],
      starts,
      (i) => [1, 1.06, 1.12][i],
    ),
    transpose: pitch,
    vowel: vowelSequence(
      [
        [0, 'i'],
        [0.025, 'a'],
        [0.11, 'e'],
      ],
      starts,
    ),
    shift: 1.45,
    breath: 0.35,
    growl: { rate: 45, depth: 0.2, fry: 20 },
    env: sequence(
      [
        [0, 0],
        [0.01, 1],
        [0.05, 0.65],
        [0.11, 0, 'exp'],
      ],
      starts,
      (i) => [1, 0.95, 0.9][i],
    ),
    tone: 7000,
    gain: 0.5,
  });
  const leap = 0.72 * pace;
  s.burst({
    at: leap,
    dur: 0.18,
    color: 'pink',
    freq: [
      [0, 800],
      [0.18, 2400],
    ],
    q: 1.1,
    swell: 0.7,
    gain: 0.3,
    pan: [
      [0, -0.3],
      [0.18, 0.2],
    ],
  });
  const land = leap + 0.2;
  s.burst({
    at: land,
    dur: 0.3,
    color: 'pink',
    type: 'lowpass',
    freq: [
      [0, 2200],
      [0.3, 600],
    ],
    q: 0.7,
    env: [
      [0, 0],
      [0.01, 1],
      [0.06, 0.5],
      [0.3, 0, 'exp'],
    ],
    gain: 0.5,
    pan: 0.2,
  });
  const times = Array.from({ length: 16 }, () => land + s.range(0, 0.12));
  s.clicks({
    times,
    freq: times.map(() => s.range(1800, 4200)),
    gain: times.map(() => s.range(0.08, 0.2)),
    q: 1.5,
    dur: 0.005,
    pan: 0.2,
  });
  s.thump({ at: land, from: 160, to: 80, dur: 0.1, gain: 0.2, pan: 0.2 });
  return s.done();
};

export default arcticFox;
