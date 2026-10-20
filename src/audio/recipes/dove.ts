import { Synth } from '../synth';
import type { Recipe } from '../types';

const COOS: readonly (readonly [
  at: number,
  dur: number,
  from: number,
  peak: number,
  to: number,
  level: number,
])[] = [
  [0, 0.32, 330, 420, 400, 0.8],
  [0.4, 0.5, 410, 430, 380, 1],
  [0.98, 0.2, 360, 370, 340, 0.75],
  [1.22, 0.22, 350, 360, 320, 0.7],
];

const dove: Recipe = (voice) => {
  const s = new Synth(voice, 0.128).stereo();
  const pitch = s.vary(0.04);
  const garden = s.bus(s.master, s.reverb({ seconds: 0.35, wet: 0.25, bright: 0.35 }));
  COOS.forEach(([at, dur, from, peak, to, level]) => {
    s.vocal({
      at,
      dur,
      pitch: [
        [0, from],
        [dur * 0.35, peak],
        [dur, to],
      ],
      transpose: pitch,
      vowel: 'u',
      wave: 'glottal',
      breath: 0.3,
      growl: { rate: 14, depth: 0.25 },
      jitter: 4,
      env: [
        [0, 0],
        [Math.min(0.06, dur * 0.3), 1],
        [dur * 0.7, 0.8],
        [dur, 0, 'exp'],
      ],
      tone: 2000,
      gain: 0.5 * level,
      dest: garden,
    });
  });
  return s.done();
};

export default dove;
