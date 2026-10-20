import { Synth, WOOD_PARTIALS } from '../synth';
import type { Recipe } from '../types';

const pumpkin: Recipe = (voice) => {
  const s = new Synth(voice, 1.01);
  const pitch = s.vary(0.05);
  s.thump({ from: 320 * pitch, to: 170 * pitch, dur: 0.1, gain: 0.3, thud: 0.3 });
  s.mallet({
    freq: 330 * pitch,
    dur: 0.22,
    gain: 0.16,
    partials: WOOD_PARTIALS,
    hit: 0.5,
  });
  s.spring({
    at: 0.1,
    dur: 0.7,
    freq: [
      [0, 175 * pitch],
      [0.06, 250 * pitch],
      [0.7, 275 * pitch],
    ],
    wave: 'hollow',
    depth: 420,
    rate: [
      [0, 14],
      [0.7, 9],
    ],
    gain: 0.6,
  });
  s.bubble({ at: 0.8, freq: 420 * pitch, rise: 1.6, dur: 0.07, gain: 0.12 });
  return s.done();
};

export default pumpkin;
