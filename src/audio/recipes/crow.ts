import { Synth } from '../synth';
import type { Recipe } from '../types';

const crow: Recipe = (voice) => {
  const s = new Synth(voice, 0.231);
  const pitch = s.vary(0.05);
  const pace = s.vary(0.04);
  [0, 0.42, 0.84].forEach((offset, index) => {
    const dur = index === 2 ? 0.34 : 0.28;
    s.vocal({
      at: offset * pace,
      dur,
      pitch: [
        [0, 500],
        [0.04, 600],
        [dur * 0.65, 560],
        [dur, 420],
      ],
      transpose: pitch * [1, 1.03, 0.95][index],
      vowel: [
        [0, 'e'],
        [0.04, 'a'],
        [dur * 0.75, 'a'],
        [dur, 'o'],
      ],
      wave: 'buzz',
      shift: 1.15,
      breath: 0.45,
      growl: { rate: 62, depth: 0.45, fry: 45 },
      drive: 2.8,
      env: [
        [0, 0],
        [0.02, 1],
        [dur * 0.6, 0.8],
        [dur, 0, 'exp'],
      ],
      tone: 4500,
      gain: 0.5 * [1, 0.95, 0.88][index],
    });
  });
  return s.done();
};

export default crow;
