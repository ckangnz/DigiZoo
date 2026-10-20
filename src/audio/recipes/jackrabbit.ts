import { Synth } from '../synth';
import type { Recipe } from '../types';

const jackrabbit: Recipe = (voice) => {
  const s = new Synth(voice, 1.38);
  const pitch = s.vary(0.05);
  const pace = s.vary(0.05);
  [0, 0.1, 0.2].forEach((offset) => {
    s.thump({
      at: offset * pace,
      from: 260 * pitch,
      to: 110 * pitch,
      dur: 0.09,
      gain: 0.4,
      thud: 0.9,
    });
  });
  [0.4, 0.66].forEach((offset, index) => {
    const lift = pitch * (index === 0 ? 1 : 1.12);
    s.spring({
      at: offset * pace,
      dur: 0.24,
      freq: [
        [0, 260 * lift],
        [0.06, 560 * lift],
        [0.24, 600 * lift],
      ],
      depth: 280,
      rate: 18,
      gain: 0.45,
    });
  });
  [0.98, 1.06].forEach((offset) => {
    s.burst({
      at: offset * pace,
      dur: 0.05,
      color: 'pink',
      freq: 2600,
      q: 1.5,
      env: [
        [0, 0],
        [0.02, 1],
        [0.05, 0, 'exp'],
      ],
      gain: 0.25,
    });
  });
  return s.done();
};

export default jackrabbit;
