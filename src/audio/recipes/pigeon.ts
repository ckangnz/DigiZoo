import { Synth } from '../synth';
import type { Recipe } from '../types';

const COOS: readonly (readonly [
  at: number,
  dur: number,
  from: number,
  peak: number,
  to: number,
  roll: number,
  level: number,
])[] = [
  [0, 0.2, 290, 350, 340, 0.3, 0.75],
  [0.25, 0.56, 340, 400, 320, 0.55, 1],
  [0.88, 0.32, 330, 340, 290, 0.35, 0.7],
];

const pigeon: Recipe = (voice) => {
  const s = new Synth(voice, 0.136).stereo();
  const pitch = s.vary(0.04);
  const pace = s.vary(0.04);
  const square = s.bus(s.master, s.reverb({ seconds: 0.3, wet: 0.2, bright: 0.35 }));
  COOS.forEach(([offset, dur, from, peak, to, roll, level]) => {
    s.vocal({
      at: offset * pace,
      dur,
      pitch: [
        [0, from],
        [dur * 0.4, peak],
        [dur, to],
      ],
      transpose: pitch,
      vowel: [
        [0, 'u'],
        [dur * 0.4, 'o'],
        [dur, 'u'],
      ],
      wave: 'glottal',
      breath: 0.3,
      growl: { rate: 28, depth: roll },
      jitter: 6,
      env: [
        [0, 0],
        [Math.min(0.06, dur * 0.3), 1],
        [dur * 0.7, 0.8],
        [dur, 0, 'exp'],
      ],
      tone: 1700,
      gain: 0.5 * level,
      dest: square,
    });
  });
  return s.done();
};

export default pigeon;
