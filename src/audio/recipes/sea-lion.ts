import { Synth, type Formant } from '../synth';
import type { Recipe } from '../types';

const ARK: readonly Formant[] = [
  { freq: 650, bw: 120, amp: 1 },
  { freq: 1100, bw: 130, amp: 0.8 },
  { freq: 2400, bw: 200, amp: 0.35 },
  { freq: 3300, bw: 250, amp: 0.15 },
];

const BARKS: readonly (readonly [at: number, lift: number, level: number])[] = [
  [0, 1, 1],
  [0.22, 1.05, 0.95],
  [0.44, 0.97, 0.9],
  [0.74, 1.08, 1],
  [0.95, 1, 0.85],
];

const seaLion: Recipe = (voice) => {
  const s = new Synth(voice, 0.63);
  const pitch = s.vary(0.05);
  const pace = s.vary(0.05);
  const rocks = s.bus(s.master, s.reverb({ seconds: 0.35, wet: 0.18, bright: 0.4 }));
  BARKS.forEach(([offset, lift, level]) => {
    const dur = 0.15;
    s.vocal({
      at: offset * pace,
      dur,
      pitch: [
        [0, 340],
        [0.03, 440],
        [dur, 320],
      ],
      transpose: pitch * lift,
      vowel: [
        [0, 'o'],
        [0.03, ARK],
        [0.11, ARK],
        [dur, 'o'],
      ],
      wave: 'reed',
      width: 1.2,
      breath: 0.3,
      growl: { rate: 45, depth: 0.45, fry: 30 },
      drive: 2.5,
      env: [
        [0, 0],
        [0.012, 1],
        [dur * 0.6, 0.75],
        [dur, 0, 'exp'],
      ],
      tone: 4000,
      gain: 0.5 * level,
      dest: rocks,
    });
  });
  return s.done();
};

export default seaLion;
