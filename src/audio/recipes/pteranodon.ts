import { Synth } from '../synth';
import type { Recipe } from '../types';

const pteranodon: Recipe = (voice) => {
  const s = new Synth(voice, 0.44).stereo();
  const pitch = s.vary(0.05);
  const pace = s.vary(0.04);
  [0, 0.22].forEach((offset, index) => {
    s.flap({
      at: offset * pace,
      freq: 700,
      dur: 0.2,
      gain: 2.2,
      pan: index === 0 ? -0.4 : 0.4,
    });
  });
  [
    [0.45, 0.42, 1, 0.5],
    [0.95, 0.28, 1.08, 0.42],
  ].forEach(([offset, dur, lift, level]) => {
    s.vocal({
      at: offset * pace,
      dur,
      pitch: [
        [0, 520],
        [0.06, 760],
        [dur * 0.6, 700],
        [dur, 480],
      ],
      transpose: pitch * lift,
      vowel: [
        [0, 'e'],
        [0.05, 'a'],
        [dur * 0.7, 'a'],
        [dur, 'o'],
      ],
      wave: 'reed',
      shift: 1.2,
      drive: 2,
      growl: { rate: 60, depth: 0.35, fry: 35 },
      breath: 0.25,
      env: [
        [0, 0],
        [0.03, 1],
        [dur * 0.6, 0.8],
        [dur, 0, 'exp'],
      ],
      tone: 5000,
      gain: level,
    });
  });
  return s.done();
};

export default pteranodon;
