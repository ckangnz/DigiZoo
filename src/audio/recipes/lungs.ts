import { Synth } from '../synth';
import type { Recipe } from '../types';

const lungs: Recipe = (voice) => {
  const s = new Synth(voice, 2.3);
  const pitch = s.vary(0.05);
  const pace = s.vary(0.05);
  const inhale = 0.7 * pace;
  const exhale = 0.85 * pace;
  s.burst({
    dur: inhale,
    color: 'pink',
    freq: [
      [0, 500 * pitch],
      [inhale, 1500 * pitch],
    ],
    q: 0.9,
    swell: 0.7,
    gain: 0.5,
  });
  s.burst({
    at: inhale + 0.05,
    dur: exhale,
    color: 'pink',
    freq: [
      [0, 1300 * pitch],
      [exhale, 450 * pitch],
    ],
    q: 0.9,
    swell: 0.3,
    gain: 0.55,
  });
  return s.done();
};

export default lungs;
