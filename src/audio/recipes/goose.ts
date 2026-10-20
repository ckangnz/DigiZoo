import { Synth, type Formant } from '../synth';
import type { Recipe } from '../types';

const HONK: readonly Formant[] = [
  { freq: 700, bw: 130, amp: 1 },
  { freq: 1250, bw: 140, amp: 0.85 },
  { freq: 2400, bw: 200, amp: 0.45 },
  { freq: 3300, bw: 250, amp: 0.2 },
];

const goose: Recipe = (voice) => {
  const s = new Synth(voice, 0.52);
  const pitch = s.vary(0.05);
  [0, 0.38 + s.jitter(0.02)].forEach((at, index) => {
    const dur = 0.24;
    s.vocal({
      at,
      dur,
      pitch: [
        [0, 380],
        [0.04, 450],
        [dur, 360],
      ],
      transpose: pitch * (index === 0 ? 1 : 1.07),
      vowel: [
        [0, 'u'],
        [0.03, HONK],
        [dur * 0.75, HONK],
        [dur, 'o'],
      ],
      wave: 'reed',
      width: 1.2,
      breath: 0.15,
      growl: { rate: 45, depth: 0.35, fry: 30 },
      drive: 2,
      env: [
        [0, 0],
        [0.015, 1],
        [dur * 0.65, 0.85],
        [dur, 0, 'exp'],
      ],
      tone: 4500,
      gain: 0.5,
    });
  });
  return s.done();
};

export default goose;
