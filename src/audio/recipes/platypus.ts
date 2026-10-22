import { Synth } from '../synth';
import type { Recipe } from '../types';

const platypus: Recipe = (voice) => {
  const s = new Synth(voice, 1.23).stereo();
  const pitch = s.vary(0.05);
  const pace = s.vary(0.04);
  s.bubble({ freq: 300 * pitch, rise: 2.8, dur: 0.07, gain: 0.3 });
  s.burst({
    at: 0.012,
    dur: 0.3,
    color: 'white',
    freq: [
      [0, 2500 * pitch],
      [0.28, 800 * pitch],
    ],
    q: 0.9,
    env: [
      [0, 0],
      [0.01, 1],
      [0.07, 0.45],
      [0.3, 0, 'exp'],
    ],
    gain: 0.8,
  });
  for (let i = 0; i < 5; i++) {
    s.bubble({
      at: (0.12 + i * 0.07 + s.range(0, 0.03)) * pace,
      freq: s.range(500, 1200),
      rise: 1.7,
      dur: 0.04,
      gain: s.range(0.1, 0.16),
      pan: s.range(-0.4, 0.4),
    });
  }
  [
    [0.62, 0.5, 1],
    [1.22, 0.28, 1.06],
  ].forEach(([offset, dur, lift]) => {
    s.vocal({
      at: offset * pace,
      dur,
      pitch: [
        [0, 210],
        [0.08, 240],
        [dur, 200],
      ],
      transpose: pitch * lift,
      vowel: [
        [0, 'u'],
        [dur * 0.4, 'o'],
        [dur, 'u'],
      ],
      wave: 'reed',
      shift: 1.2,
      breath: 0.4,
      growl: { rate: 28, depth: 0.8, fry: 20 },
      env: [
        [0, 0],
        [0.05, 1],
        [dur * 0.7, 0.8],
        [dur, 0, 'exp'],
      ],
      tone: 3500,
      gain: 0.5,
    });
  });
  return s.done();
};

export default platypus;
