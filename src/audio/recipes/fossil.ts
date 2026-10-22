import { BELL_PARTIALS, Synth, type Partials } from '../synth';
import type { Recipe } from '../types';

const STONE: Partials = [
  [1, 1, 1],
  [2.6, 0.4, 0.45],
  [4.1, 0.2, 0.3],
  [6.8, 0.08, 0.18],
];

const fossil: Recipe = (voice) => {
  const s = new Synth(voice, 1.71).stereo();
  const pitch = s.vary(0.04);
  const pace = s.vary(0.04);
  const clack = (at: number, lift: number, level: number) => {
    s.mallet({
      at,
      freq: 1350 * pitch * lift,
      dur: 0.09,
      gain: 0.25 * level,
      partials: STONE,
      hit: 0.6,
    });
    s.click({ at, freq: 2400, q: 4, dur: 0.015, gain: 0.15 * level });
    s.thump({ at, from: 300, to: 150, dur: 0.04, gain: 0.1 * level });
  };
  clack(0, 1, 1);
  clack(0.17 * pace, 1.06, 0.9);
  [0.42, 0.66].forEach((offset, index) => {
    s.burst({
      at: offset * pace,
      dur: 0.18,
      color: 'white',
      freq: 3500,
      q: 0.8,
      swell: 0.5,
      gain: 0.5,
      pan: index === 0 ? -0.2 : 0.2,
    });
  });
  s.mallet({
    at: 0.95 * pace,
    freq: 2600 * pitch,
    dur: 0.25,
    gain: 0.12,
    partials: BELL_PARTIALS,
    hit: 0.5,
    pan: 0.15,
  });
  clack(1.15 * pace, 0.93, 0.85);
  return s.done();
};

export default fossil;
