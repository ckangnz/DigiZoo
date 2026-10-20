import { Synth, pluck } from '../synth';
import type { Recipe } from '../types';

const eye: Recipe = (voice) => {
  const s = new Synth(voice, 1.18).stereo();
  const pitch = s.vary(0.03);
  [
    [0, 950, 620],
    [0.085, 620, 1050],
  ].forEach(([at, from, to]) => {
    s.note({
      at,
      dur: 0.05,
      freq: [
        [0, from * pitch],
        [0.05, to * pitch],
      ],
      env: pluck(0.05, 1, 0.004),
      gain: 0.22,
    });
  });
  const glint = s.tremolo({ rate: 11, depth: 0.4, at: 0.2, dur: 0.72 });
  s.bell({ at: 0.2, freq: 1760 * pitch, dur: 0.7, gain: 0.25, dest: glint });
  s.bell({ at: 0.22, freq: 2637 * pitch, dur: 0.6, gain: 0.18, dest: glint });
  [3520, 4186, 4699].forEach((freq, index) => {
    s.bell({
      at: 0.26 + index * 0.06,
      freq: freq * pitch,
      dur: 0.25,
      gain: 0.05,
      pan: -0.4 + index * 0.4,
    });
  });
  return s.done();
};

export default eye;
