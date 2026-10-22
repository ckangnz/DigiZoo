import { Synth } from '../synth';
import type { Recipe } from '../types';

const HONKS: readonly (readonly [at: number, dur: number])[] = [
  [0, 0.11],
  [0.16, 0.11],
  [0.46, 0.3],
];

const taxi: Recipe = (voice) => {
  const s = new Synth(voice, 3.67);
  const pitch = s.vary(0.02);
  HONKS.forEach(([at, dur]) => {
    [440, 554].forEach((base, index) => {
      s.note({
        at,
        dur,
        freq: [
          [0, base * pitch * 0.97],
          [0.02, base * pitch],
        ],
        wave: 'reed',
        env: [
          [0, 0],
          [0.01, 1],
          [dur - 0.04, 0.9],
          [dur, 0, 'exp'],
        ],
        lowpass: 2600,
        gain: index === 0 ? 0.24 : 0.2,
      });
    });
  });
  return s.done();
};

export default taxi;
