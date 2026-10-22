import { Synth, WOOD_PARTIALS } from '../synth';
import type { Recipe } from '../types';

const snail: Recipe = (voice) => {
  const s = new Synth(voice, 1.13).stereo();
  const pitch = s.vary(0.04);
  const dur = 0.9;
  s.burst({
    dur,
    color: 'pink',
    type: 'lowpass',
    freq: [
      [0, 400],
      [0.45, 900],
      [dur, 500],
    ],
    q: 6,
    env: [
      [0, 0],
      [0.2, 1],
      [0.7, 0.8],
      [dur, 0, 'exp'],
    ],
    gain: 0.2,
    pan: [
      [0, -0.3],
      [dur, 0.2],
    ],
  });
  s.note({
    dur,
    freq: [
      [0, 300 * pitch],
      [0.4, 380 * pitch],
      [dur, 320 * pitch],
    ],
    wave: 'soft',
    vibrato: { rate: 3, depth: 30 },
    env: [
      [0, 0],
      [0.2, 1],
      [0.6, 0.8],
      [dur, 0, 'exp'],
    ],
    gain: 0.2,
  });
  [1.08, 1.22].forEach((at, index) => {
    s.mallet({
      at,
      freq: 900 * pitch * (index === 0 ? 1 : 1.06),
      dur: 0.08,
      gain: 0.5,
      partials: WOOD_PARTIALS,
      hit: 0.6,
      pan: 0.25,
    });
  });
  return s.done();
};

export default snail;
