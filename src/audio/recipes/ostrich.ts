import { Synth } from '../synth';
import type { Recipe } from '../types';

const ostrich: Recipe = (voice) => {
  const s = new Synth(voice, 0.261);
  const pitch = s.vary(0.05);
  const pace = s.vary(0.04);
  [
    [0, 0.22, 88, 0.85],
    [0.34, 0.22, 92, 0.9],
    [0.7, 0.65, 84, 1],
  ].forEach(([offset, dur, base, level]) => {
    s.vocal({
      at: offset * pace,
      dur,
      pitch: [
        [0, base * 0.9],
        [Math.min(0.08, dur * 0.4), base * 1.1],
        [dur, base * 0.85],
      ],
      transpose: pitch,
      vowel: [
        [0, 'u'],
        [dur * 0.4, 'o'],
        [dur, 'u'],
      ],
      wave: 'buzz',
      shift: 0.8,
      sub: 0.3,
      breath: 0.1,
      vibrato: { rate: 5, depth: 15, delay: 0.15 },
      env: [
        [0, 0],
        [0.04, 1],
        [dur * 0.65, 0.85],
        [dur, 0, 'exp'],
      ],
      tone: 1800,
      body: 0.2,
      gain: 0.6 * level,
    });
  });
  return s.done();
};

export default ostrich;
