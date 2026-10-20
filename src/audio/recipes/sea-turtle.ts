import { Synth } from '../synth';
import type { Recipe } from '../types';

const seaTurtle: Recipe = (voice) => {
  const s = new Synth(voice, 4);
  const pitch = s.vary(0.05);
  const pace = s.vary(0.05);
  [0, 0.6 * pace].forEach((at, index) => {
    const stroke = 0.72 * pace;
    s.burst({
      at,
      dur: stroke,
      color: 'pink',
      freq: [
        [0, 300 * pitch],
        [0.45 * stroke, 900 * pitch],
        [stroke, 380 * pitch],
      ],
      q: 1.2,
      swell: 0.4,
      gain: index === 0 ? 0.55 : 0.45,
      pan: [
        [0, index === 0 ? -0.4 : 0.4],
        [stroke, index === 0 ? 0.3 : -0.3],
      ],
    });
  });
  for (let i = 0; i < 6; i++) {
    const at = (0.25 + (i + s.range(0, 0.8)) * 0.17) * pace;
    s.bubble({
      at,
      freq: s.range(400, 900),
      rise: 1.6,
      dur: 0.06,
      gain: s.range(0.08, 0.14),
      pan: s.range(-0.5, 0.5),
    });
  }
  return s.done();
};

export default seaTurtle;
