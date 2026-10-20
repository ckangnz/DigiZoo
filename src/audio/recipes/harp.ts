import { HARP_PARTIALS, Synth, midiHz } from '../synth';
import type { Recipe } from '../types';

const SWEEP = [60, 62, 64, 65, 67, 69, 71, 72, 74, 76, 77, 79, 81, 83, 84];

const harp: Recipe = (voice) => {
  const s = new Synth(voice, 1.3).stereo();
  const pitch = s.vary(0.01);
  const hall = s.bus(s.master, s.reverb({ seconds: 0.4, wet: 0.3, bright: 0.45 }));
  SWEEP.forEach((note, index) => {
    s.mallet({
      at: index * 0.04,
      freq: midiHz(note) * pitch,
      dur: 0.7,
      gain: 0.13,
      partials: HARP_PARTIALS,
      hit: 0,
      pan: -0.6 + (index / (SWEEP.length - 1)) * 1.2,
      dest: hall,
    });
  });
  [72, 76, 79].forEach((note) => {
    s.mallet({
      at: 0.75,
      freq: midiHz(note) * pitch,
      dur: 0.7,
      gain: 0.12,
      partials: HARP_PARTIALS,
      hit: 0,
      dest: hall,
    });
  });
  return s.done();
};

export default harp;
