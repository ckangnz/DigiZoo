import { GLASS_PARTIALS, Synth, midiHz } from '../synth';
import type { Recipe } from '../types';

const COLORS = [84, 86, 88, 91, 93, 96, 98];

const coatOfManyColors: Recipe = (voice) => {
  const s = new Synth(voice, 4.0).stereo();
  const pitch = s.vary(0.02);
  const shine = s.bus(s.master, s.reverb({ seconds: 0.3, wet: 0.25, bright: 0.55 }));
  s.burst({
    dur: 0.35,
    color: 'pink',
    freq: [
      [0, 500],
      [0.18, 2400],
      [0.35, 900],
    ],
    q: 1.4,
    swell: 0.45,
    gain: 0.45,
    pan: [
      [0, -0.6],
      [0.35, 0.6],
    ],
  });
  COLORS.forEach((note, index) => {
    s.bell({
      at: 0.3 + index * 0.045,
      freq: midiHz(note) * pitch,
      dur: 0.3,
      gain: 0.1,
      partials: GLASS_PARTIALS,
      pan: 0.6 - (index / (COLORS.length - 1)) * 1.2,
      dest: shine,
    });
  });
  return s.done();
};

export default coatOfManyColors;
