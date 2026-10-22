import { Synth } from '../synth';
import type { Recipe } from '../types';

const BARKS: readonly (readonly [at: number, dur: number, lift: number, level: number])[] = [
  [0, 0.16, 1, 1],
  [0.3, 0.16, 1.04, 0.95],
  [0.6, 0.16, 1.08, 0.95],
  [0.95, 0.2, 1.12, 0.9],
];

const fox: Recipe = (voice) => {
  const s = new Synth(voice, 0.699).stereo();
  const pitch = s.vary(0.05);
  const pace = s.vary(0.04);
  const woods = s.bus(s.master, s.reverb({ seconds: 0.4, wet: 0.22, bright: 0.4 }));
  BARKS.forEach(([offset, dur, lift, level]) => {
    s.vocal({
      at: offset * pace,
      dur,
      pitch: [
        [0, 600],
        [0.03, 860],
        [dur, 560],
      ],
      transpose: pitch * lift,
      vowel: [
        [0, 'u'],
        [0.04, 'a'],
        [dur * 0.75, 'o'],
        [dur, 'u'],
      ],
      shift: 1.25,
      breath: 0.45,
      growl: { rate: 50, depth: 0.3, fry: 35 },
      drive: 1.8,
      env: [
        [0, 0],
        [0.012, 1],
        [dur * 0.55, 0.7],
        [dur, 0, 'exp'],
      ],
      tone: 6000,
      gain: 0.5 * level,
      dest: woods,
    });
  });
  return s.done();
};

export default fox;
