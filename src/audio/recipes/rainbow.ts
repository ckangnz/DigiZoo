import { GLASS_PARTIALS, Synth, midiHz } from '../synth';
import type { Recipe } from '../types';

const COLORS = [72, 74, 76, 79, 81, 84, 86];

const rainbow: Recipe = (voice) => {
  const s = new Synth(voice, 2.4).stereo();
  const pitch = s.vary(0.015);
  const sky = s.bus(s.master, s.reverb({ seconds: 0.4, wet: 0.3, bright: 0.55 }));
  COLORS.forEach((note, index) => {
    s.bell({
      at: index * 0.08,
      freq: midiHz(note) * pitch,
      dur: 0.5,
      gain: 0.13,
      partials: GLASS_PARTIALS,
      pan: -0.7 + (index / (COLORS.length - 1)) * 1.4,
      dest: sky,
    });
  });
  const twinkle = s.tremolo({ rate: 12, depth: 0.5, at: 0.55, dur: 0.45, dest: sky });
  [96, 100, 103].forEach((note, index) => {
    s.bell({
      at: 0.6 + index * 0.06,
      freq: midiHz(note) * pitch,
      dur: 0.3,
      gain: 0.05,
      pan: 0.6 - index * 0.3,
      dest: twinkle,
    });
  });
  return s.done();
};

export default rainbow;
