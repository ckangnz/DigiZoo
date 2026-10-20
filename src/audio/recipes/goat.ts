import { Synth, type Formant } from '../synth';
import type { Recipe } from '../types';

const NASAL_AE: readonly Formant[] = [
  { freq: 280, bw: 80, amp: 0.5 },
  { freq: 700, bw: 130, amp: 1 },
  { freq: 1700, bw: 150, amp: 0.63 },
  { freq: 2600, bw: 200, amp: 0.35 },
];

const goat: Recipe = (voice) => {
  const s = new Synth(voice, 0.95);
  const pitch = s.vary(0.05);
  const dur = 0.95 * s.vary(0.05);
  s.vocal({
    dur,
    pitch: [
      [0, 360],
      [0.1, 430],
      [0.7 * dur, 400],
      [dur, 330],
    ],
    transpose: pitch,
    vowel: [
      [0, 'n'],
      [0.08, NASAL_AE],
      [0.75 * dur, NASAL_AE],
      [dur, 'e'],
    ],
    wave: 'reed',
    shift: 1.1,
    breath: 0.08,
    vibrato: { rate: 8.5, depth: 70, delay: 0.1 },
    growl: { rate: 8.5, depth: 0.45 },
    env: [
      [0, 0],
      [0.05, 0.8],
      [0.15, 1],
      [0.75 * dur, 0.8],
      [dur, 0, 'exp'],
    ],
    tone: 5000,
    gain: 0.5,
  });
  return s.done();
};

export default goat;
