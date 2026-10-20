import { Synth, midiHz } from '../synth';
import type { Recipe } from '../types';

const FANFARE: readonly (readonly [at: number, note: number, dur: number])[] = [
  [0, 67, 0.08],
  [0.1, 67, 0.08],
  [0.2, 67, 0.08],
  [0.32, 72, 0.16],
  [0.5, 76, 0.16],
  [0.68, 79, 0.5],
];

const esther: Recipe = (voice) => {
  const s = new Synth(voice, 1.35).stereo();
  const pitch = s.vary(0.01);
  const palace = s.bus(s.master, s.reverb({ seconds: 0.45, wet: 0.3, bright: 0.5 }));
  FANFARE.forEach(([at, note, dur]) => {
    s.brass({
      at,
      dur,
      freq: midiHz(note) * pitch,
      attack: 0.02,
      release: Math.min(0.12, dur * 0.4),
      bright: 6,
      vibrato: dur > 0.3 ? { rate: 5.5, depth: 12, delay: 0.15 } : undefined,
      gain: 0.2,
      dest: palace,
    });
  });
  [96, 100, 103].forEach((note, index) => {
    s.bell({
      at: 0.78 + index * 0.06,
      freq: midiHz(note) * pitch,
      dur: 0.3,
      gain: 0.05,
      pan: -0.4 + index * 0.4,
      dest: palace,
    });
  });
  return s.done();
};

export default esther;
