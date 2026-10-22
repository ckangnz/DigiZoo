import { Synth } from '../synth';
import type { Recipe } from '../types';

const prayingMantis: Recipe = (voice) => {
  const s = new Synth(voice, 3.12).stereo();
  const pitch = s.vary(0.05);
  const pace = s.vary(0.04);
  [0, 0.3].forEach((offset, index) => {
    s.vocal({
      at: offset * pace,
      dur: 0.16,
      pitch: [
        [0, 70],
        [0.16, 95],
      ],
      transpose: pitch * (index === 0 ? 1 : 1.1),
      vowel: 'i',
      wave: 'pulse',
      shift: 2,
      breath: 0.1,
      jitter: 30,
      env: [
        [0, 0],
        [0.03, 1],
        [0.12, 0.8],
        [0.16, 0, 'exp'],
      ],
      tone: 6000,
      gain: 0.18,
      pan: -0.2,
    });
  });
  const flare = 0.6 * pace;
  const rustle = s.tremolo({ rate: 25, depth: 0.6, at: flare, dur: 0.37 });
  s.burst({
    at: flare,
    dur: 0.35,
    color: 'pink',
    freq: 3000,
    q: 0.7,
    env: [
      [0, 0],
      [0.03, 1],
      [0.15, 0.6],
      [0.35, 0, 'exp'],
    ],
    gain: 0.6,
    dest: rustle,
  });
  const strike = 1.05 * pace;
  s.burst({
    at: strike,
    dur: 0.08,
    color: 'white',
    freq: [
      [0, 1500],
      [0.08, 4000],
    ],
    q: 1,
    swell: 0.6,
    gain: 0.3,
    pan: [
      [0, -0.2],
      [0.08, 0.3],
    ],
  });
  s.click({ at: strike + 0.08, freq: 2200, q: 4, dur: 0.02, gain: 0.2, ring: 0.4, pan: 0.3 });
  return s.done();
};

export default prayingMantis;
