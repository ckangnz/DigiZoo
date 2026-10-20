import { Synth } from '../synth';
import type { Recipe } from '../types';

const liver: Recipe = (voice) => {
  const s = new Synth(voice, 1.16);
  const pitch = s.vary(0.05);
  s.squelch({ freq: 480 * pitch, dur: 0.14, gain: 0.28 });
  s.spring({
    at: 0.04,
    dur: 0.75,
    freq: [
      [0, 150 * pitch],
      [0.07, 215 * pitch],
      [0.75, 235 * pitch],
    ],
    wave: [1, 0.6, 0.35, 0.2, 0.1],
    depth: 350,
    rate: [
      [0, 11],
      [0.75, 7],
    ],
    gain: 0.5,
  });
  return s.done();
};

export default liver;
