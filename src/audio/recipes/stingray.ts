import { Synth } from '../synth';
import type { Recipe } from '../types';

const stingray: Recipe = (voice) => {
  const s = new Synth(voice, 1.33).stereo();
  const pitch = s.vary(0.05);
  const pace = s.vary(0.05);
  const sea = s.bus(s.master, s.reverb({ seconds: 0.45, wet: 0.35, bright: 0.3 }));
  [0, 0.62].forEach((offset, index) => {
    const at = offset * pace;
    const stroke = 0.7 * pace;
    s.burst({
      at,
      dur: stroke,
      color: 'pink',
      type: 'lowpass',
      freq: [
        [0, 300 * pitch],
        [0.4 * stroke, 950 * pitch],
        [stroke, 320 * pitch],
      ],
      q: 3,
      swell: 0.4,
      gain: index === 0 ? 0.55 : 0.45,
      pan: [
        [0, index === 0 ? -0.5 : 0.5],
        [stroke, index === 0 ? 0.3 : -0.3],
      ],
      dest: sea,
    });
  });
  s.note({
    at: 0.15,
    dur: 1.0,
    freq: [
      [0, 220 * pitch],
      [0.4, 330 * pitch],
      [1.0, 247 * pitch],
    ],
    wave: 'soft',
    vibrato: { rate: 4.5, depth: 30, delay: 0.2 },
    env: [
      [0, 0],
      [0.3, 1],
      [0.7, 0.8],
      [1.0, 0, 'exp'],
    ],
    gain: 0.16,
    dest: sea,
  });
  for (let i = 0; i < 4; i++) {
    s.bubble({
      at: (0.4 + i * 0.22 + s.range(0, 0.06)) * pace,
      freq: s.range(450, 900),
      rise: 1.6,
      dur: 0.06,
      gain: s.range(0.1, 0.16),
      pan: s.range(-0.5, 0.5),
    });
  }
  return s.done();
};

export default stingray;
