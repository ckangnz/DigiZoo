import { Synth, WOOD_PARTIALS } from '../synth';
import type { Recipe } from '../types';

const armadillo: Recipe = (voice) => {
  const s = new Synth(voice, 1.4);
  const pitch = s.vary(0.05);
  const pace = s.vary(0.05);
  [0, 0.16, 0.32].forEach((offset, index) => {
    const at = offset * pace;
    s.burst({ at, dur: 0.06, color: 'pink', freq: 1800, q: 1.2, gain: 0.2 });
    s.vocal({
      at: at + 0.01,
      dur: 0.08,
      pitch: [
        [0, 260],
        [0.08, 220],
      ],
      transpose: pitch * (1 + index * 0.04),
      vowel: 'n',
      wave: 'glottal',
      breath: 0.6,
      env: [
        [0, 0],
        [0.01, 1],
        [0.08, 0, 'exp'],
      ],
      gain: 0.06,
    });
  });
  const curlAt = 0.52 * pace;
  s.note({
    at: curlAt,
    dur: 0.14,
    freq: [
      [0, 260 * pitch],
      [0.14, 900 * pitch],
    ],
    wave: [1, 0.25],
    env: [
      [0, 0],
      [0.02, 1],
      [0.14, 0, 'exp'],
    ],
    gain: 0.25,
  });
  const rollAt = curlAt + 0.16;
  const roll = 0.55;
  const bumps = s.tremolo({ rate: 9, depth: 0.6, at: rollAt, dur: roll + 0.02 });
  s.burst({
    at: rollAt,
    dur: roll,
    color: 'pink',
    type: 'lowpass',
    freq: 1000,
    q: 1.5,
    env: [
      [0, 0],
      [0.08, 1],
      [roll, 0, 'exp'],
    ],
    gain: 0.6,
    dest: bumps,
  });
  const taps = Array.from({ length: 6 }, (_, i) => rollAt + i * (1 / 9) + s.range(0, 0.01));
  s.clicks({ times: taps, freq: 1500, q: 5, dur: 0.015, gain: 0.45, ring: 0.4 });
  s.mallet({
    at: rollAt + roll,
    freq: 300 * pitch,
    dur: 0.25,
    gain: 0.3,
    partials: WOOD_PARTIALS,
    hit: 0.5,
  });
  return s.done();
};

export default armadillo;
