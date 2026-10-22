import { Synth } from '../synth';
import type { Recipe } from '../types';

const SYLLABLES: readonly (readonly [
  at: number,
  dur: number,
  from: number,
  peak: number,
  to: number,
])[] = [
  [0, 0.2, 470, 640, 600],
  [0.24, 0.18, 580, 700, 560],
  [0.46, 0.18, 600, 720, 580],
  [0.7, 0.66, 540, 800, 560],
];

const husky: Recipe = (voice) => {
  const s = new Synth(voice, 0.092).stereo();
  const pitch = s.vary(0.05);
  const pace = s.vary(0.04);
  const snow = s.bus(s.master, s.reverb({ seconds: 0.4, wet: 0.22, bright: 0.4 }));
  SYLLABLES.forEach(([offset, dur, from, peak, to], index) => {
    const last = index === SYLLABLES.length - 1;
    s.vocal({
      at: offset * pace,
      dur,
      pitch: [
        [0, from],
        [dur * (last ? 0.35 : 0.4), peak],
        [dur, to],
      ],
      transpose: pitch,
      vowel:
        index === 0
          ? [
              [0, 'a'],
              [dur * 0.6, 'o'],
              [dur, 'u'],
            ]
          : [
              [0, 'u'],
              [dur * 0.3, 'o'],
              [dur * 0.75, 'o'],
              [dur, 'u'],
            ],
      wave: 'glottal',
      shift: 1.15,
      breath: 0.25,
      growl: { rate: 30, depth: 0.15, fry: 15 },
      vibrato: last ? { rate: 5.5, depth: 30, delay: 0.25 } : undefined,
      env: [
        [0, 0],
        [0.03, 0.85],
        [dur * 0.4, 1],
        [dur * 0.75, 0.75],
        [dur, 0, 'exp'],
      ],
      tone: 5000,
      gain: 0.5,
      dest: snow,
    });
  });
  return s.done();
};

export default husky;
