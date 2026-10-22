import { Synth } from '../synth';
import type { Recipe } from '../types';

const badger: Recipe = (voice) => {
  const s = new Synth(voice, 1.28).stereo();
  const pitch = s.vary(0.05);
  const pace = s.vary(0.04);
  s.vocal({
    dur: 0.45,
    pitch: [
      [0, 220],
      [0.15, 250],
      [0.45, 200],
    ],
    transpose: pitch,
    vowel: [
      [0, 'o'],
      [0.3, 'o'],
      [0.45, 'u'],
    ],
    wave: 'reed',
    breath: 0.3,
    growl: { rate: 26, depth: 0.9, fry: 20 },
    env: [
      [0, 0],
      [0.05, 1],
      [0.32, 0.8],
      [0.45, 0, 'exp'],
    ],
    tone: 3000,
    gain: 0.5,
  });
  [0.6, 0.7, 0.8].forEach((offset, index) => {
    s.burst({
      at: offset * pace,
      dur: 0.05,
      color: 'pink',
      freq: 2000 * pitch,
      q: 1.2,
      env: [
        [0, 0],
        [0.01, 1],
        [0.05, 0, 'exp'],
      ],
      gain: index === 1 ? 0.5 : 0.4,
      pan: -0.15,
    });
  });
  [0.98, 1.1, 1.22, 1.34].forEach((offset, index) => {
    const at = offset * pace;
    const pan = index % 2 === 0 ? 0.1 : 0.3;
    s.burst({
      at,
      dur: 0.08,
      color: 'pink',
      freq: [
        [0, 1500],
        [0.08, 800],
      ],
      q: 0.9,
      env: [
        [0, 0],
        [0.006, 1],
        [0.08, 0, 'exp'],
      ],
      gain: 0.45,
      pan,
    });
    const times = Array.from({ length: 4 }, () => at + s.range(0.01, 0.07));
    s.clicks({
      times,
      freq: times.map(() => s.range(1500, 3500)),
      gain: times.map(() => s.range(0.12, 0.22)),
      q: 3,
      dur: 0.006,
      ring: 0.2,
      pan,
    });
    s.thump({ at, from: 240, to: 120, dur: 0.05, gain: 0.12, pan });
  });
  return s.done();
};

export default badger;
