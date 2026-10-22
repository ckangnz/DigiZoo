import { Synth } from '../synth';
import type { Recipe } from '../types';

const olm: Recipe = (voice) => {
  const s = new Synth(voice, 0.749).stereo();
  const pitch = s.vary(0.04);
  const pace = s.vary(0.04);
  const cave = s.bus(s.master, s.reverb({ seconds: 0.6, wet: 0.4, bright: 0.3 }));
  [0, 0.08, 0.15].forEach((at) => {
    s.bubble({
      at: at * pace,
      freq: s.range(500, 800),
      rise: 1.7,
      dur: 0.05,
      gain: s.range(0.12, 0.18),
      pan: s.range(-0.4, 0.4),
      dest: cave,
    });
  });
  [0.35, 0.72].forEach((offset, index) => {
    const lift = pitch * (index === 0 ? 1 : 1.12);
    s.note({
      at: offset * pace,
      dur: 0.28,
      freq: [
        [0, 330 * lift],
        [0.12, 470 * lift],
        [0.28, 420 * lift],
      ],
      wave: 'soft',
      vibrato: { rate: 5, depth: 25 },
      env: [
        [0, 0],
        [0.04, 1],
        [0.2, 0.7],
        [0.28, 0, 'exp'],
      ],
      gain: 0.35,
      dest: cave,
    });
  });
  s.bubble({
    at: 1.12 * pace,
    freq: 1400 * pitch,
    rise: 1.8,
    dur: 0.035,
    gain: 0.2,
    pan: 0.3,
    dest: cave,
  });
  return s.done();
};

export default olm;
