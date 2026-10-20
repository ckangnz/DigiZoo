import { Synth } from '../synth';
import type { Recipe } from '../types';

const cauldron: Recipe = (voice) => {
  const s = new Synth(voice, 1.39).stereo();
  const pitch = s.vary(0.05);
  const dur = 1.25;
  const simmer = s.tremolo({ rate: 7, depth: 0.5, dur: dur + 0.02 });
  s.burst({
    dur,
    color: 'brown',
    type: 'lowpass',
    freq: 800,
    q: 3,
    env: [
      [0, 0],
      [0.2, 1],
      [1.0, 0.8],
      [dur, 0, 'exp'],
    ],
    gain: 0.25,
    dest: simmer,
  });
  const count = 11;
  for (let i = 0; i < count; i++) {
    const at = (i / count) * 1.0 + s.range(0, 0.06);
    const big = s.random() < 0.35;
    s.bubble({
      at,
      freq: (big ? s.range(190, 280) : s.range(320, 620)) * pitch,
      rise: s.range(1.6, 2.4),
      dur: big ? 0.11 : 0.07,
      gain: big ? 0.5 : s.range(0.28, 0.4),
      pan: s.range(-0.4, 0.4),
    });
  }
  s.bubble({ at: 1.05, freq: 210 * pitch, rise: 2.8, dur: 0.14, gain: 0.45 });
  [2637, 3136, 3951].forEach((freq, index) => {
    s.bell({
      at: 1.12 + index * 0.05,
      freq: freq * pitch,
      dur: 0.25,
      gain: 0.06,
      pan: -0.3 + index * 0.3,
    });
  });
  return s.done();
};

export default cauldron;
