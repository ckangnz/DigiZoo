import { Synth } from '../synth';
import type { Recipe } from '../types';

const meerkat: Recipe = (voice) => {
  const s = new Synth(voice, 1.4);
  const pitch = s.vary(0.05);
  const groups = [0, 0.36, 0.72];
  groups.forEach((groupAt, group) => {
    [0, 0.1, 0.2].forEach((offset, index) => {
      const base = (index === 1 ? 2650 : 2300) * pitch * (1 + group * 0.03);
      s.chirp({
        at: groupAt + offset + (groupAt + offset > 0 ? s.jitter(0.008) : 0),
        dur: 0.055,
        freq: [
          [0, base],
          [0.055, base * 0.82],
        ],
        wave: [1, 0.2],
        gain: 0.36 - index * 0.04,
      });
    });
  });
  return s.done();
};

export default meerkat;
