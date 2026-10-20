import { Synth, blend } from '../synth';
import type { Recipe } from '../types';

const alpaca: Recipe = (voice) => {
  const s = new Synth(voice, 0.14);
  const pitch = s.vary(0.05);
  const hum = blend('n', 'u', 0.5);
  [
    [0, 0.5, 290, 360, 330],
    [0.6, 0.6, 320, 340, 420],
  ].forEach(([at, dur, from, mid, to], index) => {
    s.vocal({
      at,
      dur,
      pitch: [
        [0, from],
        [dur * 0.4, mid],
        [dur, to],
      ],
      transpose: pitch,
      vowel: hum,
      wave: 'glottal',
      breath: 0.5,
      vibrato: { rate: 5, depth: 18, delay: 0.15 },
      env: [
        [0, 0],
        [0.1, 1],
        [dur * 0.7, 0.85],
        [dur, 0, 'exp'],
      ],
      tone: 2500,
      gain: index === 0 ? 0.45 : 0.4,
    });
  });
  return s.done();
};

export default alpaca;
