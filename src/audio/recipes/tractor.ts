import { Synth } from '../synth';
import type { Recipe } from '../types';

const tractor: Recipe = (voice) => {
  const s = new Synth(voice, 1.46);
  const pitch = s.vary(0.04);
  const pace = s.vary(0.04);
  let at = 0;
  for (let i = 0; i < 11; i++) {
    const accent = i % 2 === 0 ? 1 : 0.78;
    s.thump({
      at,
      from: 200 * pitch,
      to: 75 * pitch,
      dur: 0.1,
      gain: 0.18 * accent,
      thud: 0.3,
    });
    s.burst({
      at,
      dur: 0.09,
      color: 'pink',
      freq: [
        [0, 1000 * pitch],
        [0.08, 450 * pitch],
      ],
      q: 1.4,
      env: [
        [0, 0],
        [0.004, 1],
        [0.035, 0.45],
        [0.09, 0, 'exp'],
      ],
      gain: 1.4 * accent,
    });
    at += (0.17 - i * 0.004) * pace;
  }
  return s.done();
};

export default tractor;
