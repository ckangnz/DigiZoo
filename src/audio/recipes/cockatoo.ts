import { Synth } from '../synth';
import type { Recipe } from '../types';

const SCREECHES: readonly (readonly [at: number, dur: number, lift: number])[] = [
  [0, 0.55, 1],
  [0.72, 0.38, 1.06],
];

const cockatoo: Recipe = (voice) => {
  const s = new Synth(voice, 0.121).stereo();
  const pitch = s.vary(0.05);
  const pace = s.vary(0.04);
  const gum = s.bus(s.master, s.reverb({ seconds: 0.35, wet: 0.18, bright: 0.4 }));
  const throat = s.filter('highpass', 500, 0.7, { dest: gum });
  SCREECHES.forEach(([offset, dur, lift]) => {
    s.vocal({
      at: offset * pace,
      dur,
      pitch: [
        [0, 850],
        [0.06, 1200],
        [dur * 0.65, 1120],
        [dur, 780],
      ],
      transpose: pitch * lift,
      vowel: [
        [0, 'e'],
        [0.06, 'a'],
        [dur * 0.7, 'a'],
        [dur, 'o'],
      ],
      wave: 'buzz',
      shift: 1.45,
      breath: 0.5,
      growl: { rate: 85, depth: 0.45, fry: 55 },
      drive: 2,
      env: [
        [0, 0],
        [0.03, 1],
        [dur * 0.6, 0.8],
        [dur, 0, 'exp'],
      ],
      tone: 4200,
      gain: 0.5,
      dest: throat,
    });
  });
  return s.done();
};

export default cockatoo;
