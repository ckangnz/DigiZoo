import { Synth } from '../synth';
import type { Recipe } from '../types';

const skunk: Recipe = (voice) => {
  const s = new Synth(voice, 2.34).stereo();
  const pitch = s.vary(0.05);
  const pace = s.vary(0.04);
  [0, 0.2].forEach((offset, index) => {
    const at = offset * pace;
    const pan = index === 0 ? -0.2 : 0.2;
    s.thump({ at, from: 200 * pitch, to: 90 * pitch, dur: 0.1, gain: 0.18, thud: 0.5, pan });
    s.click({ at, freq: 1500, q: 2, dur: 0.01, gain: 0.15, pan });
    s.burst({
      at,
      dur: 0.06,
      color: 'pink',
      type: 'lowpass',
      freq: 900,
      q: 0.8,
      env: [
        [0, 0],
        [0.004, 1],
        [0.06, 0, 'exp'],
      ],
      gain: 0.4,
      pan,
    });
  });
  s.burst({
    at: 0.45 * pace,
    dur: 0.2,
    color: 'pink',
    freq: 3000,
    q: 0.8,
    env: [
      [0, 0],
      [0.03, 1],
      [0.2, 0, 'exp'],
    ],
    gain: 0.3,
  });
  s.burst({
    at: 0.78 * pace,
    dur: 0.5,
    color: 'white',
    freq: [
      [0, 4000],
      [0.5, 1500],
    ],
    q: 0.8,
    env: [
      [0, 0],
      [0.02, 1],
      [0.15, 0.6],
      [0.5, 0, 'exp'],
    ],
    gain: 0.8,
    pan: [
      [0, -0.3],
      [0.5, 0.3],
    ],
  });
  return s.done();
};

export default skunk;
