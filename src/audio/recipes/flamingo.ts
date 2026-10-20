import { Synth, type Formant } from '../synth';
import type { Recipe } from '../types';

const HONK: readonly Formant[] = [
  { freq: 800, bw: 140, amp: 1 },
  { freq: 1400, bw: 150, amp: 0.85 },
  { freq: 2500, bw: 200, amp: 0.45 },
  { freq: 3500, bw: 250, amp: 0.2 },
];

const flamingo: Recipe = (voice) => {
  const s = new Synth(voice, 0.6);
  const pitch = s.vary(0.05);
  const pace = s.vary(0.05);
  [0, 0.2, 0.4, 0.66].forEach((offset, index) => {
    const dur = index === 3 ? 0.24 : 0.14;
    s.vocal({
      at: offset * pace,
      dur,
      pitch: [
        [0, 470],
        [0.03, 560],
        [dur, 430],
      ],
      transpose: pitch * [1, 1.06, 0.97, 1.1][index],
      vowel: [
        [0, 'u'],
        [0.025, HONK],
        [dur * 0.7, HONK],
        [dur, 'o'],
      ],
      wave: 'reed',
      width: 1.2,
      breath: 0.15,
      growl: { rate: 50, depth: 0.3, fry: 25 },
      drive: 1.8,
      env: [
        [0, 0],
        [0.015, 1],
        [dur * 0.6, 0.8],
        [dur, 0, 'exp'],
      ],
      tone: 5000,
      gain: 0.5,
    });
  });
  return s.done();
};

export default flamingo;
