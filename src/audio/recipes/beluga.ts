import { Synth } from '../synth';
import type { Recipe } from '../types';

const beluga: Recipe = (voice) => {
  const s = new Synth(voice, 1.27).stereo();
  const pitch = s.vary(0.05);
  const sea = s.bus(s.master, s.reverb({ seconds: 0.45, wet: 0.35, bright: 0.35 }));
  const tone = [1, 0.18, 0.05];
  s.note({
    dur: 0.26,
    freq: [
      [0, 900 * pitch],
      [0.22, 1700 * pitch],
      [0.26, 1650 * pitch],
    ],
    wave: tone,
    env: [
      [0, 0],
      [0.03, 1],
      [0.2, 0.8],
      [0.26, 0, 'exp'],
    ],
    gain: 0.22,
    pan: -0.2,
    dest: sea,
  });
  s.note({
    at: 0.34,
    dur: 0.3,
    freq: [
      [0, 1500 * pitch],
      [0.3, 1350 * pitch],
    ],
    wave: tone,
    vibrato: { rate: 17, depth: 130 },
    env: [
      [0, 0],
      [0.03, 1],
      [0.22, 0.8],
      [0.3, 0, 'exp'],
    ],
    gain: 0.2,
    pan: 0.1,
    dest: sea,
  });
  [0.72, 0.84].forEach((at, index) => {
    const lift = pitch * (index === 0 ? 1 : 1.08);
    s.chirp({
      at,
      dur: 0.07,
      freq: [
        [0, 1800 * lift],
        [0.05, 2400 * lift],
        [0.07, 2250 * lift],
      ],
      wave: tone,
      gain: 0.2,
      pan: 0.25,
      dest: sea,
    });
  });
  s.note({
    at: 1.0,
    dur: 0.36,
    freq: [
      [0, 2000 * pitch],
      [0.1, 2150 * pitch],
      [0.36, 1100 * pitch],
    ],
    wave: tone,
    vibrato: { rate: 6, depth: 20 },
    env: [
      [0, 0],
      [0.03, 1],
      [0.26, 0.75],
      [0.36, 0, 'exp'],
    ],
    gain: 0.2,
    pan: -0.15,
    dest: sea,
  });
  for (let i = 0; i < 3; i++) {
    s.bubble({
      at: 1.3 + i * 0.07 + s.range(0, 0.03),
      freq: s.range(500, 1000),
      rise: 1.7,
      dur: 0.05,
      gain: s.range(0.08, 0.14),
      pan: s.range(-0.4, 0.4),
      dest: sea,
    });
  }
  return s.done();
};

export default beluga;
