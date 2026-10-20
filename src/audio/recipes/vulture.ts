import { Synth } from '../synth';
import type { Recipe } from '../types';

const vulture: Recipe = (voice) => {
  const s = new Synth(voice, 0.51).stereo();
  const pitch = s.vary(0.05);
  const pace = s.vary(0.05);
  [0, 0.3].forEach((offset, index) => {
    s.flap({
      at: offset * pace,
      freq: 550,
      dur: 0.26,
      gain: 2.0,
      pan: index === 0 ? -0.3 : 0.3,
    });
  });
  const dur = 0.4;
  s.vocal({
    at: 0.68 * pace,
    dur,
    pitch: [
      [0, 190],
      [0.08, 230],
      [dur, 160],
    ],
    transpose: pitch,
    vowel: [
      [0, 'o'],
      [0.08, 'a'],
      [dur * 0.7, 'a'],
      [dur, 'o'],
    ],
    wave: 'buzz',
    shift: 0.95,
    drive: 2,
    growl: { rate: 35, depth: 0.5, fry: 40 },
    breath: 0.45,
    env: [
      [0, 0],
      [0.03, 1],
      [dur * 0.6, 0.75],
      [dur, 0, 'exp'],
    ],
    tone: 3000,
    gain: 0.45,
  });
  return s.done();
};

export default vulture;
