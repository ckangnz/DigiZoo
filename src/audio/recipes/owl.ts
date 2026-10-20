import { Synth } from '../synth';
import type { Recipe } from '../types';

const HOOTS: readonly (readonly [at: number, dur: number, pitch: number, level: number])[] = [
  [0, 0.24, 360, 1],
  [0.46, 0.12, 380, 0.75],
  [0.62, 0.12, 380, 0.75],
  [0.8, 0.55, 400, 0.95],
];

const owl: Recipe = (voice) => {
  const s = new Synth(voice, 0.0954).stereo();
  const pitch = s.vary(0.04);
  const woods = s.bus(s.master, s.reverb({ seconds: 0.45, wet: 0.3, bright: 0.35 }));
  HOOTS.forEach(([at, dur, base, level], index) => {
    const last = index === HOOTS.length - 1;
    s.vocal({
      at,
      dur,
      pitch: [
        [0, base * 0.92],
        [Math.min(0.06, dur * 0.4), base],
        [dur, last ? base * 0.9 : base * 0.97],
      ],
      transpose: pitch,
      vowel: 'u',
      wave: 'glottal',
      breath: 0.25,
      vibrato: last ? { rate: 5.5, depth: 30, delay: 0.15 } : undefined,
      jitter: 4,
      env: [
        [0, 0],
        [Math.min(0.05, dur * 0.4), 1],
        [dur * 0.65, 0.8],
        [dur, 0, 'exp'],
      ],
      tone: 2500,
      gain: 0.5 * level,
      dest: woods,
    });
  });
  return s.done();
};

export default owl;
