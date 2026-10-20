import { Synth, type Formant } from '../synth';
import type { Recipe } from '../types';

const MEEP: readonly Formant[] = [
  { freq: 420, bw: 120, amp: 0.6 },
  { freq: 2100, bw: 160, amp: 1 },
  { freq: 2900, bw: 200, amp: 0.6 },
  { freq: 3700, bw: 250, amp: 0.3 },
];

const roadrunner: Recipe = (voice) => {
  const s = new Synth(voice, 0.91).stereo();
  const pitch = s.vary(0.04);
  [0, 0.24].forEach((at, index) => {
    const dur = 0.16;
    s.vocal({
      at,
      dur,
      pitch: [
        [0, 850],
        [0.03, 980],
        [dur, 900],
      ],
      transpose: pitch * (index === 0 ? 1 : 1.04),
      vowel: [
        [0, 'n'],
        [0.03, MEEP],
        [dur * 0.8, MEEP],
        [dur, 'i'],
      ],
      wave: 'reed',
      width: 1.2,
      breath: 0.1,
      env: [
        [0, 0],
        [0.015, 1],
        [dur * 0.75, 0.85],
        [dur, 0, 'exp'],
      ],
      tone: 6000,
      gain: 0.5,
    });
  });
  const dash = 0.5;
  const steps = Array.from({ length: 8 }, (_, i) => dash + i * 0.045);
  s.clicks({ times: steps, freq: 2400, q: 3, dur: 0.006, gain: 0.3 });
  s.burst({
    at: dash,
    dur: 0.42,
    color: 'pink',
    freq: [
      [0, 600],
      [0.2, 2600],
      [0.42, 900],
    ],
    q: 1.3,
    swell: 0.35,
    gain: 0.9,
    pan: [
      [0, -0.7],
      [0.42, 0.8],
    ],
  });
  return s.done();
};

export default roadrunner;
