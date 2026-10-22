import { Synth } from '../synth';
import type { Recipe } from '../types';

const axolotl: Recipe = (voice) => {
  const s = new Synth(voice, 0.951).stereo();
  const pitch = s.vary(0.04);
  const pace = s.vary(0.04);
  const pond = s.bus(s.master, s.reverb({ seconds: 0.45, wet: 0.35, bright: 0.35 }));
  [0, 0.06, 0.12].forEach((offset) => {
    s.bubble({
      at: offset * pace,
      freq: s.range(600, 900),
      rise: 1.6,
      dur: 0.05,
      gain: s.range(0.12, 0.18),
      pan: s.range(-0.4, 0.4),
      dest: pond,
    });
  });
  s.note({
    at: 0.3 * pace,
    dur: 0.22,
    freq: [
      [0, 320 * pitch],
      [0.2, 520 * pitch],
    ],
    wave: 'soft',
    vibrato: { rate: 6, depth: 20 },
    env: [
      [0, 0],
      [0.03, 1],
      [0.15, 0.75],
      [0.22, 0, 'exp'],
    ],
    gain: 0.35,
    dest: pond,
  });
  s.note({
    at: 0.58 * pace,
    dur: 0.25,
    freq: [
      [0, 420 * pitch],
      [0.12, 700 * pitch],
      [0.25, 640 * pitch],
    ],
    wave: 'soft',
    vibrato: { rate: 6, depth: 20 },
    env: [
      [0, 0],
      [0.03, 1],
      [0.17, 0.75],
      [0.25, 0, 'exp'],
    ],
    gain: 0.32,
    dest: pond,
  });
  for (let i = 0; i < 4; i++) {
    s.bubble({
      at: (0.92 + i * 0.07 + s.range(0, 0.03)) * pace,
      freq: s.range(900, 1600),
      rise: 1.6,
      dur: 0.035,
      gain: s.range(0.08, 0.12),
      pan: s.range(-0.5, 0.5),
      dest: pond,
    });
  }
  return s.done();
};

export default axolotl;
