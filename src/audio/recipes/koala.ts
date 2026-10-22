import { Synth } from '../synth';
import type { Recipe } from '../types';

const koala: Recipe = (voice) => {
  const s = new Synth(voice, 0.518);
  const pitch = s.vary(0.05);
  const pace = s.vary(0.04);
  [0, 0.64].forEach((offset, index) => {
    const at = offset * pace;
    const snore = s.tremolo({ rate: 34, depth: 0.85, at, dur: 0.3 });
    s.burst({
      at,
      dur: 0.28,
      color: 'pink',
      freq: [
        [0, 450],
        [0.28, 700],
      ],
      q: 1.2,
      env: [
        [0, 0],
        [0.08, 1],
        [0.22, 0.8],
        [0.28, 0, 'exp'],
      ],
      gain: 1.3,
      dest: snore,
    });
    const dur = index === 0 ? 0.28 : 0.42;
    s.vocal({
      at: at + 0.3,
      dur,
      pitch: [
        [0, 60],
        [0.06, 72],
        [dur, 50],
      ],
      transpose: pitch,
      vowel: [
        [0, 'o'],
        [0.06, 'a'],
        [dur, 'o'],
      ],
      wave: 'buzz',
      shift: 0.9,
      sub: 0.3,
      drive: 2,
      growl: { rate: 30, depth: 0.6, fry: 30 },
      breath: 0.4,
      env: [
        [0, 0],
        [0.02, 1],
        [dur * 0.6, 0.8],
        [dur, 0, 'exp'],
      ],
      tone: 2500,
      gain: 0.5,
    });
  });
  return s.done();
};

export default koala;
