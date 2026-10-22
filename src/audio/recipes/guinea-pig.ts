import { Synth } from '../synth';
import type { Recipe } from '../types';

const WHEEKS: readonly (readonly [at: number, dur: number, lift: number])[] = [
  [0, 0.2, 1],
  [0.28, 0.2, 1.04],
  [0.56, 0.3, 1.1],
];

const guineaPig: Recipe = (voice) => {
  const s = new Synth(voice, 1.05);
  const pitch = s.vary(0.05);
  const pace = s.vary(0.04);
  WHEEKS.forEach(([offset, dur, lift]) => {
    s.vocal({
      at: offset * pace,
      dur,
      pitch: [
        [0, 900],
        [dur * 0.75, 1500],
        [dur, 1350],
      ],
      transpose: pitch * lift,
      vowel: [
        [0, 'u'],
        [0.04, 'i'],
        [dur, 'i'],
      ],
      shift: 1.5,
      breath: 0.15,
      env: [
        [0, 0],
        [0.02, 0.8],
        [dur * 0.7, 1],
        [dur, 0, 'exp'],
      ],
      tone: 6000,
      gain: 0.5,
    });
  });
  s.vocal({
    at: 1.0 * pace,
    dur: 0.35,
    pitch: [
      [0, 200],
      [0.35, 190],
    ],
    transpose: pitch,
    vowel: 'o',
    wave: 'reed',
    breath: 0.3,
    growl: { rate: 18, depth: 0.9 },
    env: [
      [0, 0],
      [0.04, 1],
      [0.25, 0.8],
      [0.35, 0, 'exp'],
    ],
    tone: 3000,
    gain: 0.4,
  });
  return s.done();
};

export default guineaPig;
