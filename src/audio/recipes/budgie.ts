import { Synth } from '../synth';
import type { Recipe } from '../types';

const CHIRPS: readonly (readonly [
  at: number,
  dur: number,
  from: number,
  peak: number,
  to: number,
  trill: number,
])[] = [
  [0, 0.06, 2000, 2800, 2300, 0],
  [0.12, 0.05, 2500, 3200, 2600, 0],
  [0.24, 0.1, 2200, 2600, 2400, 150],
  [0.48, 0.05, 2800, 3300, 2500, 0],
  [0.6, 0.06, 1900, 2600, 2200, 0],
  [0.78, 0.09, 2400, 2900, 2700, 120],
  [0.98, 0.05, 2600, 3100, 2400, 0],
  [1.1, 0.12, 2300, 2800, 2000, 160],
];

const budgie: Recipe = (voice) => {
  const s = new Synth(voice, 2.57).stereo();
  const pitch = s.vary(0.05);
  const pace = s.vary(0.04);
  CHIRPS.forEach(([offset, dur, from, peak, to, trill], index) => {
    s.note({
      at: offset * pace,
      dur,
      freq: [
        [0, from * pitch],
        [dur * 0.4, peak * pitch],
        [dur, to * pitch],
      ],
      wave: [1, 0.2, 0.06],
      vibrato: trill ? { rate: 26, depth: trill } : undefined,
      env: [
        [0, 0],
        [0.006, 1],
        [dur * 0.4, 0.55],
        [dur, 0, 'exp'],
      ],
      gain: 0.2,
      pan: index % 2 === 0 ? -0.15 : 0.15,
    });
  });
  [0.38, 0.88].forEach((offset, index) => {
    s.vocal({
      at: offset * pace,
      dur: 0.06,
      pitch: [
        [0, 1150],
        [0.02, 1350],
        [0.06, 1100],
      ],
      transpose: pitch * (index === 0 ? 1 : 1.06),
      vowel: [
        [0, 'e'],
        [0.06, 'i'],
      ],
      shift: 1.7,
      breath: 0.5,
      growl: { rate: 70, depth: 0.4, fry: 40 },
      env: [
        [0, 0],
        [0.008, 1],
        [0.06, 0, 'exp'],
      ],
      tone: 7000,
      gain: 0.3,
      pan: 0.1,
    });
  });
  return s.done();
};

export default budgie;
