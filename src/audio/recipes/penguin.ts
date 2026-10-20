import { Synth } from '../synth';
import type { Recipe } from '../types';

const BRAYS: readonly (readonly [at: number, dur: number, from: number, peak: number])[] = [
  [0, 0.16, 380, 460],
  [0.22, 0.16, 420, 520],
  [0.44, 0.42, 470, 600],
];

const penguin: Recipe = (voice) => {
  const s = new Synth(voice, 0.62).stereo();
  const pitch = s.vary(0.05);
  const pace = s.vary(0.04);
  BRAYS.forEach(([offset, dur, from, peak], index) => {
    const last = index === BRAYS.length - 1;
    s.vocal({
      at: offset * pace,
      dur,
      pitch: [
        [0, from],
        [0.05, peak],
        [dur, last ? peak * 0.85 : peak * 0.92],
      ],
      transpose: pitch,
      vowel: [
        [0, 'o'],
        [0.04, 'a'],
        [dur * 0.75, 'a'],
        [dur, 'o'],
      ],
      wave: 'reed',
      shift: 1.1,
      breath: 0.2,
      growl: { rate: 32, depth: 0.4, fry: 30 },
      drive: 2,
      vibrato: last ? { rate: 6, depth: 30, delay: 0.15 } : undefined,
      env: [
        [0, 0],
        [0.015, 1],
        [dur * 0.7, 0.8],
        [dur, 0, 'exp'],
      ],
      tone: 4500,
      gain: 0.5,
    });
  });
  [0.98, 1.12, 1.26, 1.4].forEach((offset, index) => {
    const at = offset * pace;
    const left = index % 2 === 0;
    s.thump({ at, from: 300, to: 170, dur: 0.05, gain: 0.35, pan: left ? -0.3 : 0.3 });
    s.click({ at, freq: 1800, q: 3, dur: 0.01, gain: 0.2, pan: left ? -0.3 : 0.3 });
  });
  return s.done();
};

export default penguin;
