import { Synth } from '../synth';
import type { Recipe } from '../types';

const HOOTS: readonly (readonly [at: number, dur: number, base: number, level: number])[] = [
  [0.12, 0.3, 300, 1],
  [0.56, 0.3, 305, 0.95],
  [1.0, 0.42, 290, 0.8],
];

const snowyOwl: Recipe = (voice) => {
  const s = new Synth(voice, 0.127).stereo();
  const pitch = s.vary(0.04);
  const tundra = s.bus(s.master, s.reverb({ seconds: 0.5, wet: 0.3, bright: 0.3 }));
  s.burst({
    dur: 1.5,
    color: 'pink',
    freq: [
      [0, 500],
      [0.8, 800],
      [1.5, 450],
    ],
    q: 1.2,
    swell: 0.45,
    gain: 0.08,
    pan: [
      [0, -0.5],
      [1.5, 0.5],
    ],
  });
  HOOTS.forEach(([at, dur, base, level]) => {
    s.vocal({
      at,
      dur,
      pitch: [
        [0, base * 0.9],
        [0.06, base],
        [dur, base * 0.94],
      ],
      transpose: pitch,
      vowel: 'u',
      wave: 'glottal',
      breath: 0.35,
      growl: { rate: 14, depth: 0.12 },
      jitter: 4,
      env: [
        [0, 0],
        [0.05, 1],
        [dur * 0.6, 0.8],
        [dur, 0, 'exp'],
      ],
      tone: 1800,
      gain: 0.5 * level,
      dest: tundra,
    });
  });
  return s.done();
};

export default snowyOwl;
