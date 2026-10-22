import { Synth } from '../synth';
import type { Recipe } from '../types';

const kangaroo: Recipe = (voice) => {
  const s = new Synth(voice, 1.36).stereo();
  const pitch = s.vary(0.05);
  const pace = s.vary(0.04);
  [0, 0.34, 0.68, 1.02].forEach((offset, index) => {
    const at = offset * pace;
    const pan = -0.45 + index * 0.3;
    s.thump({ at, from: 170 * pitch, to: 70 * pitch, dur: 0.16, gain: 0.12, thud: 0.6, pan });
    s.burst({
      at,
      dur: 0.22,
      color: 'pink',
      freq: 550,
      q: 0.9,
      env: [
        [0, 0],
        [0.015, 1],
        [0.07, 0.55],
        [0.22, 0, 'exp'],
      ],
      gain: 1.2,
      pan,
    });
    s.spring({
      at: at + 0.005,
      dur: 0.2,
      freq: [
        [0, 190 * pitch],
        [0.2, 240 * pitch],
      ],
      depth: 300,
      rate: 14,
      wave: 'triangle',
      gain: 0.35,
      pan,
    });
  });
  [1.34, 1.46].forEach((offset, index) => {
    s.click({
      at: offset * pace,
      freq: 1500 * pitch * (index === 1 ? 1.08 : 1),
      q: 5,
      dur: 0.04,
      gain: 0.25,
      ring: 0.7,
      pan: 0.35,
    });
  });
  return s.done();
};

export default kangaroo;
