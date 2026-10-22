import { BELL_PARTIALS, Synth } from '../synth';
import type { Recipe } from '../types';

const garbageTruck: Recipe = (voice) => {
  const s = new Synth(voice, 0.951).stereo();
  const pitch = s.vary(0.03);
  const dur = 1.9;
  const idle = s.tremolo({ rate: 13, depth: 0.5, dur: dur + 0.02 });
  s.burst({
    dur,
    color: 'brown',
    type: 'lowpass',
    freq: 420,
    q: 1,
    env: [
      [0, 0],
      [0.2, 1],
      [dur - 0.3, 0.9],
      [dur, 0, 'exp'],
    ],
    gain: 0.5,
    dest: idle,
  });
  s.burst({
    dur,
    color: 'pink',
    freq: 650,
    q: 1.2,
    env: [
      [0, 0],
      [0.2, 1],
      [dur - 0.3, 0.9],
      [dur, 0, 'exp'],
    ],
    gain: 0.12,
    dest: idle,
  });
  [0.15, 0.62, 1.09].forEach((at) => {
    s.note({
      at,
      dur: 0.28,
      freq: 1040 * pitch,
      wave: [1, 0.15, 0.05],
      env: [
        [0, 0],
        [0.012, 1],
        [0.25, 0.95],
        [0.28, 0, 'exp'],
      ],
      gain: 0.16,
    });
  });
  const clank = 1.5;
  s.bell({ at: clank, freq: 330 * pitch, dur: 0.32, gain: 0.2, partials: BELL_PARTIALS });
  s.click({ at: clank, freq: 1800, q: 2, dur: 0.02, gain: 0.25 });
  s.thump({ at: clank, from: 180, to: 80, dur: 0.15, gain: 0.3, thud: 0.5 });
  return s.done();
};

export default garbageTruck;
