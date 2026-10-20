import { Synth } from '../synth';
import type { Recipe } from '../types';

const SYLLABLES: readonly (readonly [
  at: number,
  dur: number,
  from: number,
  peak: number,
  to: number,
])[] = [
  [0, 0.12, 480, 560, 520],
  [0.15, 0.09, 560, 620, 600],
  [0.27, 0.13, 620, 700, 660],
  [0.43, 0.1, 640, 680, 620],
  [0.56, 0.62, 700, 780, 520],
];

const rooster: Recipe = (voice) => {
  const s = new Synth(voice, 0.32).stereo();
  const pitch = s.vary(0.04);
  const pace = s.vary(0.04);
  const yard = s.bus(s.master, s.reverb({ seconds: 0.4, wet: 0.2, bright: 0.45 }));
  SYLLABLES.forEach(([offset, dur, from, peak, to], index) => {
    const last = index === SYLLABLES.length - 1;
    s.vocal({
      at: offset * pace,
      dur,
      pitch: [
        [0, from],
        [Math.min(0.05, dur * 0.4), peak],
        [last ? dur * 0.5 : dur * 0.7, peak * 0.98],
        [dur, to],
      ],
      transpose: pitch,
      vowel: last
        ? [
            [0, 'u'],
            [0.05, 'o'],
            [dur * 0.5, 'o'],
            [dur, 'u'],
          ]
        : [
            [0, index % 2 === 0 ? 'o' : 'a'],
            [dur, 'u'],
          ],
      wave: 'reed',
      shift: 1.25,
      breath: 0.15,
      growl: { rate: 45, depth: 0.25, fry: 20 },
      drive: 1.8,
      vibrato: last ? { rate: 7, depth: 40, delay: 0.2 } : undefined,
      env: [
        [0, 0],
        [0.015, 1],
        [dur * 0.7, last ? 0.8 : 0.85],
        [dur, 0, 'exp'],
      ],
      tone: 5500,
      gain: last ? 0.5 : 0.45,
      dest: yard,
    });
  });
  return s.done();
};

export default rooster;
