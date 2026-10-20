import { Synth } from '../synth';
import type { Recipe } from '../types';

const orangutan: Recipe = (voice) => {
  const s = new Synth(voice, 0.56);
  const pitch = s.vary(0.05);
  const dur = 0.75;
  s.vocal({
    dur,
    pitch: [
      [0, 120],
      [0.4, 190],
      [0.6, 200],
      [dur, 160],
    ],
    transpose: pitch,
    vowel: [
      [0, 'u'],
      [0.35, 'o'],
      [dur, 'u'],
    ],
    wave: 'buzz',
    shift: 0.85,
    sub: 0.3,
    growl: { rate: 16, depth: 0.35, fry: 15 },
    breath: 0.25,
    vibrato: { rate: 5, depth: 20, delay: 0.3 },
    env: [
      [0, 0],
      [0.2, 0.8],
      [0.5, 1],
      [dur, 0, 'exp'],
    ],
    tone: 2000,
    gain: 0.4,
  });
  [0.9, 1.1].forEach((at, index) => {
    const lift = pitch * (index === 0 ? 1 : 1.1);
    s.click({ at, freq: 2000, q: 2, dur: 0.01, gain: 0.25 });
    s.chirp({
      at: at + 0.005,
      dur: 0.1,
      freq: [
        [0, 1500 * lift],
        [0.05, 2500 * lift],
        [0.1, 2100 * lift],
      ],
      wave: [1, 0.2],
      gain: 0.3,
    });
  });
  return s.done();
};

export default orangutan;
