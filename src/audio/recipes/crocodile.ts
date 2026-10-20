import { Synth } from '../synth';
import type { Recipe } from '../types';

const crocodile: Recipe = (voice) => {
  const s = new Synth(voice, 0.3);
  const pitch = s.vary(0.05);
  const dur = 1.0 * s.vary(0.04);
  s.vocal({
    dur,
    pitch: [
      [0, 62],
      [0.3 * dur, 72],
      [0.8 * dur, 68],
      [dur, 55],
    ],
    transpose: pitch,
    vowel: [
      [0, 'u'],
      [0.3 * dur, 'o'],
      [0.8 * dur, 'o'],
      [dur, 'u'],
    ],
    wave: 'buzz',
    shift: 0.6,
    drive: 3,
    growl: { rate: 11, depth: 0.6, fry: 40 },
    jitter: 30,
    breath: 0.2,
    tone: 1800,
    env: [
      [0, 0],
      [0.2 * dur, 0.8],
      [0.5 * dur, 1],
      [0.85 * dur, 0.7],
      [dur, 0, 'exp'],
    ],
    gain: 0.55,
  });
  s.burst({
    dur,
    color: 'brown',
    type: 'lowpass',
    freq: 300,
    q: 0,
    env: [
      [0, 0],
      [0.4 * dur, 1],
      [dur, 0, 'exp'],
    ],
    gain: 0.4,
  });
  const snapAt = dur + 0.15;
  s.click({ at: snapAt, freq: 2400, q: 1.2, dur: 0.02, gain: 1.6 });
  s.click({ at: snapAt, freq: 900, q: 2.5, dur: 0.05, gain: 1.0, ring: 0.3 });
  s.thump({ at: snapAt, from: 200, to: 60, dur: 0.16, gain: 1.2, thud: 0.5 });
  s.click({ at: snapAt + 0.21, freq: 2600, q: 1.2, dur: 0.018, gain: 1.0 });
  s.thump({ at: snapAt + 0.21, from: 180, to: 60, dur: 0.12, gain: 0.6 });
  return s.done();
};

export default crocodile;
