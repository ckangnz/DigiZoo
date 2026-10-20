import { Synth } from '../synth';
import type { Recipe } from '../types';

const bat: Recipe = (voice) => {
  const s = new Synth(voice, 1.45).stereo();
  const pitch = s.vary(0.05);
  const dur = 1.0;
  const flutter = s.tremolo({
    rate: 17,
    depth: 0.9,
    dur: dur + 0.02,
    dest: s.panner([
      [0, -0.6],
      [dur, 0.6],
    ]),
  });
  s.burst({
    dur,
    color: 'pink',
    type: 'lowpass',
    freq: 800,
    q: 1,
    env: [
      [0, 0],
      [0.15, 1],
      [0.8, 0.8],
      [dur, 0, 'exp'],
    ],
    gain: 0.35,
    dest: flutter,
  });
  [0.12, 0.24, 0.5, 0.62].forEach((at, index) => {
    const lift = pitch * [1, 1.08, 0.96, 1.12][index];
    s.chirp({
      at,
      dur: 0.06,
      freq: [
        [0, 3300 * lift],
        [0.02, 4000 * lift],
        [0.06, 3400 * lift],
      ],
      wave: [1, 0.12],
      gain: 0.24,
      pan: -0.5 + at,
    });
  });
  return s.done();
};

export default bat;
