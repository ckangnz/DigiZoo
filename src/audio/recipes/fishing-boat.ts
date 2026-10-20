import { Synth, WOOD_PARTIALS } from '../synth';
import type { Recipe } from '../types';

const fishingBoat: Recipe = (voice) => {
  const s = new Synth(voice, 1.8).stereo();
  const pitch = s.vary(0.04);
  s.burst({
    dur: 0.9,
    color: 'pink',
    type: 'lowpass',
    freq: [
      [0, 300],
      [0.4, 1000],
      [0.9, 350],
    ],
    q: 1.2,
    swell: 0.4,
    gain: 0.45,
    pan: [
      [0, -0.4],
      [0.9, 0.4],
    ],
  });
  s.mallet({
    at: 0.2,
    freq: 220 * pitch,
    dur: 0.15,
    gain: 0.25,
    partials: WOOD_PARTIALS,
    hit: 0.4,
  });
  const splashAt = 0.6;
  s.bubble({ at: splashAt, freq: 300 * pitch, rise: 3, dur: 0.07, gain: 0.25 });
  s.burst({
    at: splashAt + 0.015,
    dur: 0.35,
    color: 'white',
    freq: [
      [0, 2800 * pitch],
      [0.32, 900 * pitch],
    ],
    q: 0.9,
    env: [
      [0, 0],
      [0.012, 1],
      [0.08, 0.5],
      [0.35, 0, 'exp'],
    ],
    gain: 1.0,
  });
  for (let i = 0; i < 4; i++) {
    s.bubble({
      at: splashAt + 0.1 + i * 0.06 + s.range(0, 0.03),
      freq: s.range(900, 2000),
      rise: 1.6,
      dur: 0.03,
      gain: s.range(0.1, 0.16),
      pan: s.range(-0.5, 0.5),
    });
  }
  return s.done();
};

export default fishingBoat;
