import { Synth, blend } from '../synth';
import type { Recipe } from '../types';

const CALLS: readonly (readonly [at: number, dur: number, from: number, peak: number])[] = [
  [0, 0.3, 360, 430],
  [0.42, 0.48, 380, 470],
];

const swan: Recipe = (voice) => {
  const s = new Synth(voice, 0.468).stereo();
  const pitch = s.vary(0.04);
  const pace = s.vary(0.04);
  const lake = s.bus(s.master, s.reverb({ seconds: 0.5, wet: 0.28, bright: 0.35 }));
  const open = blend('o', 'a', 0.5);
  CALLS.forEach(([offset, dur, from, peak], index) => {
    const last = index === CALLS.length - 1;
    s.vocal({
      at: offset * pace,
      dur,
      pitch: [
        [0, from],
        [0.06, peak],
        [dur * 0.7, peak * 0.98],
        [dur, peak * 0.86],
      ],
      transpose: pitch,
      vowel: [
        [0, 'u'],
        [0.05, 'o'],
        [dur * 0.35, open],
        [dur * 0.8, 'o'],
        [dur, 'u'],
      ],
      wave: 'reed',
      width: 1.3,
      breath: 0.15,
      growl: { rate: 40, depth: 0.15 },
      drive: 1.3,
      vibrato: last ? { rate: 5, depth: 14, delay: 0.18 } : undefined,
      env: [
        [0, 0],
        [0.03, 1],
        [dur * 0.7, 0.85],
        [dur, 0, 'exp'],
      ],
      tone: 3800,
      gain: 0.5,
      dest: lake,
    });
  });
  return s.done();
};

export default swan;
