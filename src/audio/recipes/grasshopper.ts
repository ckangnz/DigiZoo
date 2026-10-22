import { Synth } from '../synth';
import type { Recipe } from '../types';

const grasshopper: Recipe = (voice) => {
  const s = new Synth(voice, 7).stereo();
  const pitch = s.vary(0.04);
  const pace = s.vary(0.04);
  [0, 0.08, 0.3, 0.38, 0.6, 0.68].forEach((offset, index) => {
    const at = offset * pace;
    const scrape = s.tremolo({ rate: 150, depth: 0.7, at, dur: 0.09 });
    s.burst({
      at,
      dur: 0.075,
      color: 'white',
      freq: 5000 * pitch,
      q: 1,
      env: [
        [0, 0],
        [0.012, 1],
        [0.055, 0.75],
        [0.075, 0, 'exp'],
      ],
      gain: index % 2 === 0 ? 0.35 : 0.28,
      pan: 0.2,
      dest: scrape,
    });
  });
  s.burst({
    at: 0.88 * pace,
    dur: 0.14,
    color: 'pink',
    freq: [
      [0, 800],
      [0.14, 3000],
    ],
    q: 1.1,
    swell: 0.6,
    gain: 0.25,
    pan: [
      [0, 0.2],
      [0.14, -0.3],
    ],
  });
  const land = 1.06 * pace;
  s.click({ at: land, freq: 2800, q: 3, dur: 0.008, gain: 0.15, pan: -0.3 });
  s.thump({ at: land, from: 300, to: 160, dur: 0.04, gain: 0.1, pan: -0.3 });
  return s.done();
};

export default grasshopper;
