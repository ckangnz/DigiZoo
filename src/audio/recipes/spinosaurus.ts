import { Synth } from '../synth';
import type { Recipe } from '../types';

const spinosaurus: Recipe = (voice) => {
  const s = new Synth(voice, 0.4).stereo();
  const pitch = s.vary(0.05);
  const dur = 0.85;
  s.vocal({
    dur,
    pitch: [
      [0, 95],
      [0.2, 140],
      [0.5, 130],
      [dur, 85],
    ],
    transpose: pitch,
    vowel: [
      [0, 'u'],
      [0.18, 'a'],
      [0.55, 'o'],
      [dur, 'u'],
    ],
    wave: 'buzz',
    shift: 0.7,
    sub: 0.35,
    drive: 2.5,
    growl: { rate: 18, depth: 0.5, fry: 35 },
    jitter: 20,
    breath: 0.3,
    tone: 2200,
    env: [
      [0, 0],
      [0.1, 0.8],
      [0.25, 1],
      [0.6, 0.8],
      [dur, 0, 'exp'],
    ],
    gain: 0.5,
  });
  const splashAt = 1.0;
  s.bubble({ at: splashAt, freq: 150 * pitch, rise: 3, dur: 0.1, gain: 1.0 });
  s.burst({
    at: splashAt + 0.02,
    dur: 0.48,
    color: 'white',
    freq: [
      [0, 2600],
      [0.45, 700],
    ],
    q: 0.9,
    env: [
      [0, 0],
      [0.015, 1],
      [0.1, 0.55],
      [0.48, 0, 'exp'],
    ],
    gain: 3.2,
  });
  for (let i = 0; i < 6; i++) {
    s.bubble({
      at: splashAt + 0.12 + i * 0.07 + s.range(0, 0.04),
      freq: s.range(800, 1900),
      rise: 1.6,
      dur: 0.035,
      gain: s.range(0.35, 0.55),
      pan: s.range(-0.5, 0.5),
    });
  }
  return s.done();
};

export default spinosaurus;
