import { Synth, WOOD_PARTIALS, midiHz } from '../synth';
import type { Recipe } from '../types';

const PLENTY = [79, 84, 88, 91, 96, 100];

const loavesAndFishes: Recipe = (voice) => {
  const s = new Synth(voice, 2.0).stereo();
  const pitch = s.vary(0.03);
  s.mallet({ freq: 300 * pitch, dur: 0.1, gain: 0.25, partials: WOOD_PARTIALS, hit: 0.5 });
  [
    [0.08, 84],
    [0.2, 91],
  ].forEach(([at, note]) => {
    s.mallet({ at, freq: midiHz(note) * pitch, dur: 0.3, gain: 0.2, hit: 0.3 });
  });
  PLENTY.forEach((note, index) => {
    s.bell({
      at: 0.36 + index * 0.05,
      freq: midiHz(note) * pitch,
      dur: 0.3,
      gain: 0.07,
      pan: s.range(-0.6, 0.6),
    });
  });
  return s.done();
};

export default loavesAndFishes;
