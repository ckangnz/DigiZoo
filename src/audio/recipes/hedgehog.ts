import { Synth } from '../synth';
import type { Recipe } from '../types';

const hedgehog: Recipe = (voice) => {
  const s = new Synth(voice, 1.29).stereo();
  const pitch = s.vary(0.05);
  const pace = s.vary(0.05);
  for (let i = 0; i < 5; i++) {
    s.burst({
      at: i * 0.09 * pace,
      dur: 0.05,
      color: 'pink',
      freq: 2200 * pitch,
      q: 1.2,
      env: [
        [0, 0],
        [0.01, 1],
        [0.05, 0, 'exp'],
      ],
      gain: i % 2 === 0 ? 0.8 : 0.65,
      pan: -0.2,
    });
  }
  [0.55, 0.72, 0.9].forEach((offset, index) => {
    s.vocal({
      at: offset * pace,
      dur: 0.09,
      pitch: [
        [0, 260],
        [0.03, 300],
        [0.09, 240],
      ],
      transpose: pitch * [1, 1.06, 0.97][index],
      vowel: [
        [0, 'n'],
        [0.03, 'o'],
        [0.09, 'n'],
      ],
      wave: 'reed',
      breath: 0.3,
      growl: { rate: 40, depth: 0.5, fry: 20 },
      drive: 1.5,
      env: [
        [0, 0],
        [0.01, 1],
        [0.05, 0.7],
        [0.09, 0, 'exp'],
      ],
      tone: 3500,
      gain: 0.22,
    });
  });
  const leaves = 1.05 * pace;
  s.burst({
    at: leaves,
    dur: 0.35,
    color: 'white',
    freq: 3500,
    q: 0.7,
    env: [
      [0, 0],
      [0.03, 1],
      [0.09, 0.2],
      [0.16, 0.8],
      [0.24, 0.15],
      [0.35, 0, 'exp'],
    ],
    gain: 0.5,
    pan: [
      [0, 0],
      [0.35, 0.4],
    ],
  });
  const times = Array.from({ length: 12 }, () => leaves + s.range(0, 0.3));
  s.clicks({
    times,
    freq: times.map(() => s.range(3000, 6000)),
    gain: times.map(() => s.range(0.08, 0.18)),
    q: 1.5,
    dur: 0.004,
    pan: 0.2,
  });
  return s.done();
};

export default hedgehog;
