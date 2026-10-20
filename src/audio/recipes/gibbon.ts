import { Synth } from '../synth';
import type { Recipe } from '../types';

const HOOTS: readonly (readonly [at: number, dur: number, from: number, to: number])[] = [
  [0, 0.22, 420, 620],
  [0.3, 0.2, 500, 740],
  [0.56, 0.18, 600, 880],
  [0.79, 0.17, 700, 1020],
  [1.0, 0.5, 820, 1150],
];

const gibbon: Recipe = (voice) => {
  const s = new Synth(voice, 0.118);
  const pitch = s.vary(0.05);
  const pace = s.vary(0.04);
  HOOTS.forEach(([offset, dur, from, to], index) => {
    const last = index === HOOTS.length - 1;
    s.vocal({
      at: offset * pace,
      dur,
      pitch: last
        ? [
            [0, from],
            [0.12, to],
            [0.35, to * 0.98],
            [dur, to * 0.8],
          ]
        : [
            [0, from],
            [dur * 0.8, to],
            [dur, to * 0.95],
          ],
      transpose: pitch,
      vowel: [
        [0, 'u'],
        [dur * 0.6, 'o'],
        [dur, 'u'],
      ],
      wave: 'glottal',
      shift: 1.2,
      breath: 0.2,
      vibrato: last ? { rate: 7, depth: 40, delay: 0.15 } : undefined,
      env: [
        [0, 0],
        [0.03, 0.8],
        [dur * 0.7, 1],
        [dur, 0, 'exp'],
      ],
      tone: 5000,
      gain: 0.5,
    });
  });
  return s.done();
};

export default gibbon;
