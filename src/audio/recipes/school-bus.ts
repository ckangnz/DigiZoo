import { Synth } from '../synth';
import type { Recipe } from '../types';

const schoolBus: Recipe = (voice) => {
  const s = new Synth(voice, 3.86);
  const pitch = s.vary(0.02);
  [
    [0, 0.2],
    [0.3, 0.36],
  ].forEach(([at, dur]) => {
    [330, 415].forEach((base, index) => {
      s.note({
        at,
        dur,
        freq: base * pitch,
        wave: 'reed',
        env: [
          [0, 0],
          [0.015, 1],
          [dur - 0.05, 0.9],
          [dur, 0, 'exp'],
        ],
        lowpass: 2000,
        gain: index === 0 ? 0.24 : 0.18,
      });
    });
  });
  s.burst({
    at: 0.9,
    dur: 0.45,
    color: 'white',
    freq: 3500,
    q: 0.8,
    env: [
      [0, 0],
      [0.02, 1],
      [0.15, 0.5],
      [0.45, 0, 'exp'],
    ],
    gain: 0.25,
  });
  return s.done();
};

export default schoolBus;
