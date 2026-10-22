import { Synth } from '../synth';
import type { Recipe } from '../types';

const GROANS: readonly (readonly [
  at: number,
  dur: number,
  from: number,
  peak: number,
  to: number,
])[] = [
  [0, 0.42, 140, 190, 150],
  [0.52, 0.62, 160, 225, 130],
];

const puffin: Recipe = (voice) => {
  const s = new Synth(voice, 0.496);
  const pitch = s.vary(0.05);
  const pace = s.vary(0.04);
  GROANS.forEach(([offset, dur, from, peak, to]) => {
    s.vocal({
      at: offset * pace,
      dur,
      pitch: [
        [0, from],
        [dur * 0.35, peak],
        [dur, to],
      ],
      transpose: pitch,
      vowel: [
        [0, 'a'],
        [dur * 0.35, 'a'],
        [dur * 0.7, 'o'],
        [dur, 'u'],
      ],
      wave: 'buzz',
      shift: 1.1,
      breath: 0.3,
      growl: { rate: 22, depth: 0.85, fry: 25 },
      drive: 1.6,
      env: [
        [0, 0],
        [0.05, 0.8],
        [dur * 0.35, 1],
        [dur * 0.75, 0.7],
        [dur, 0, 'exp'],
      ],
      tone: 3000,
      gain: 0.5,
    });
  });
  return s.done();
};

export default puffin;
