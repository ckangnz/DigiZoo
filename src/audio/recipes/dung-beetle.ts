import { Synth, WOOD_PARTIALS } from '../synth';
import type { Recipe } from '../types';

const dungBeetle: Recipe = (voice) => {
  const s = new Synth(voice, 1.26);
  const pitch = s.vary(0.05);
  [0, 0.24].forEach((at, index) => {
    s.vocal({
      at,
      dur: 0.11,
      pitch: [
        [0, 520],
        [0.03, 600],
        [0.11, 480],
      ],
      transpose: pitch * (index === 0 ? 1 : 1.1),
      vowel: [
        [0, 'u'],
        [0.04, 'a'],
        [0.11, 'o'],
      ],
      shift: 1.3,
      breath: 0.4,
      env: [
        [0, 0],
        [0.01, 1],
        [0.06, 0.6],
        [0.11, 0, 'exp'],
      ],
      gain: 0.35,
    });
  });
  const rollAt = 0.42;
  const roll = 0.8;
  const bumps = s.tremolo({ rate: 7, depth: 0.7, at: rollAt, dur: roll + 0.02 });
  s.burst({
    at: rollAt,
    dur: roll,
    color: 'pink',
    type: 'lowpass',
    freq: [
      [0, 650],
      [0.4, 1100],
      [roll, 600],
    ],
    q: 2,
    env: [
      [0, 0],
      [0.1, 1],
      [0.6, 0.8],
      [roll, 0, 'exp'],
    ],
    gain: 0.9,
    dest: bumps,
  });
  for (let i = 0; i < 6; i++) {
    s.thump({
      at: rollAt + 0.05 + i * (1 / 7),
      from: 300 * pitch,
      to: 170 * pitch,
      dur: 0.06,
      gain: 0.22,
    });
  }
  s.mallet({
    at: rollAt + roll + 0.02,
    freq: 340 * pitch,
    dur: 0.2,
    gain: 0.3,
    partials: WOOD_PARTIALS,
    hit: 0.5,
  });
  return s.done();
};

export default dungBeetle;
