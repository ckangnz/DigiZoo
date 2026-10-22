import { GLASS_PARTIALS, Synth, midiHz } from '../synth';
import type { Recipe } from '../types';

const ARPEGGIO = [84, 88, 91, 96, 100, 103];
const SPARKLES = [103, 105, 108];

const crystal: Recipe = (voice) => {
  const s = new Synth(voice, 2.64).stereo();
  const pitch = s.vary(0.015);
  const cave = s.bus(s.master, s.reverb({ seconds: 0.6, wet: 0.35, bright: 0.6 }));
  ARPEGGIO.forEach((note, index) => {
    s.bell({
      at: index * 0.07,
      freq: midiHz(note) * pitch,
      dur: 0.9,
      gain: 0.14 - index * 0.012,
      partials: GLASS_PARTIALS,
      pan: -0.5 + index * 0.2,
      dest: cave,
    });
  });
  s.pad({
    at: 0.3,
    dur: 1.2,
    freqs: [96, 103].map((note) => midiHz(note) * pitch),
    wave: 'sine',
    voices: 2,
    spread: 8,
    attack: 0.3,
    release: 0.6,
    shimmer: { rate: 7, depth: 0.5 },
    gain: 0.05,
    dest: cave,
  });
  for (let i = 0; i < 5; i++) {
    s.bell({
      at: 0.5 + i * 0.14 + s.range(0, 0.05),
      freq: midiHz(SPARKLES[Math.floor(s.random() * SPARKLES.length)]) * pitch,
      dur: 0.3,
      gain: s.range(0.04, 0.06),
      partials: GLASS_PARTIALS,
      pan: s.range(-0.6, 0.6),
      dest: cave,
    });
  }
  return s.done();
};

export default crystal;
