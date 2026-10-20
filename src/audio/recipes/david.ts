import { HARP_PARTIALS, Synth, midiHz } from '../synth';
import type { Recipe } from '../types';

const PLUCKS = [74, 69, 74, 78, 81];
const CHORD = [74, 78, 81, 86];

const david: Recipe = (voice) => {
  const s = new Synth(voice, 1.9).stereo();
  const pitch = s.vary(0.015);
  const field = s.bus(s.master, s.reverb({ seconds: 0.35, wet: 0.3, bright: 0.45 }));
  PLUCKS.forEach((note, index) => {
    s.mallet({
      at: index * 0.14,
      freq: midiHz(note) * pitch,
      dur: 0.55,
      gain: 0.22,
      partials: HARP_PARTIALS,
      hit: 0.06,
      pan: -0.3 + index * 0.15,
      dest: field,
    });
  });
  CHORD.forEach((note, index) => {
    s.mallet({
      at: 0.8 + index * 0.03,
      freq: midiHz(note) * pitch,
      dur: 0.65,
      gain: 0.14,
      partials: HARP_PARTIALS,
      hit: 0.05,
      pan: -0.2 + index * 0.13,
      dest: field,
    });
  });
  return s.done();
};

export default david;
