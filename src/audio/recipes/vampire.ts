import { ORGAN_WAVE, Synth, midiHz, type Point } from '../synth';
import type { Recipe } from '../types';

const FLOURISH: readonly (readonly [at: number, note: number, dur: number])[] = [
  [0, 69, 0.08],
  [0.08, 67, 0.08],
  [0.16, 69, 0.3],
  [0.52, 67, 0.06],
  [0.58, 65, 0.06],
  [0.64, 64, 0.06],
  [0.7, 62, 0.08],
  [0.79, 61, 0.14],
  [0.94, 62, 0.34],
];

const key = (dur: number): Point[] => [
  [0, 0],
  [0.008, 1],
  [Math.max(0.01, dur - 0.03), 0.9],
  [dur, 0, 'exp'],
];

const vampire: Recipe = (voice) => {
  const s = new Synth(voice, 1.42).stereo();
  const pitch = s.vary(0.02);
  const hall = s.bus(s.master, s.reverb({ seconds: 0.35, wet: 0.3, bright: 0.4 }));
  FLOURISH.forEach(([at, note, dur]) => {
    [1, 0.5].forEach((octave) => {
      s.note({
        at,
        dur,
        freq: midiHz(note) * pitch * octave,
        wave: ORGAN_WAVE,
        env: key(dur),
        lowpass: 3000,
        gain: octave === 1 ? 0.16 : 0.12,
        dest: hall,
      });
    });
  });
  [1.28, 1.46].forEach((at, index) => {
    s.vocal({
      at,
      dur: 0.16,
      pitch: [
        [0, 300],
        [0.04, 340],
        [0.16, 260],
      ],
      transpose: pitch * (index === 0 ? 1 : 1.12),
      vowel: [
        [0, 'u'],
        [0.03, 'e'],
        [0.12, 'e'],
        [0.16, 'a'],
      ],
      wave: 'reed',
      shift: 1.1,
      breath: 0.2,
      growl: { rate: 30, depth: 0.3 },
      env: [
        [0, 0],
        [0.015, 1],
        [0.1, 0.8],
        [0.16, 0, 'exp'],
      ],
      tone: 4500,
      gain: 0.32,
      dest: hall,
    });
  });
  return s.done();
};

export default vampire;
