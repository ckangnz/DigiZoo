import { Synth, type Formant } from '../synth';
import type { Recipe } from '../types';

const QUACK_A: readonly Formant[] = [
  { freq: 900, bw: 150, amp: 1 },
  { freq: 1500, bw: 140, amp: 0.8 },
  { freq: 2600, bw: 200, amp: 0.5 },
  { freq: 3600, bw: 250, amp: 0.25 },
];

const QUACK_E: readonly Formant[] = [
  { freq: 700, bw: 150, amp: 1 },
  { freq: 1800, bw: 160, amp: 0.8 },
  { freq: 2700, bw: 200, amp: 0.5 },
  { freq: 3700, bw: 250, amp: 0.25 },
];

const duck: Recipe = (voice) => {
  const s = new Synth(voice, 0.47);
  const pitch = s.vary(0.05);
  [0, 0.36 + s.jitter(0.02)].forEach((at, index) => {
    s.click({ at, freq: 2000, q: 2, dur: 0.01, gain: 0.12 });
    s.vocal({
      at: at + 0.005,
      dur: 0.24,
      pitch: [
        [0, 300],
        [0.04, 345],
        [0.24, 250],
      ],
      transpose: pitch * (index === 0 ? 1 : 0.95),
      vowel: [
        [0, 'u'],
        [0.03, QUACK_A],
        [0.14, QUACK_E],
        [0.24, 'n'],
      ],
      wave: 'reed',
      width: 1.2,
      breath: 0.15,
      growl: { rate: 60, depth: 0.35, fry: 30 },
      drive: 2,
      env: [
        [0, 0],
        [0.015, 1],
        [0.06, 0.85],
        [0.24, 0, 'exp'],
      ],
      tone: 5000,
      gain: 0.5,
    });
  });
  return s.done();
};

export default duck;
