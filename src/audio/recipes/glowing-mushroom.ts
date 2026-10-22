import { GLASS_PARTIALS, Synth, midiHz } from '../synth';
import type { Recipe } from '../types';

const glowingMushroom: Recipe = (voice) => {
  const s = new Synth(voice, 0.863).stereo();
  const pitch = s.vary(0.02);
  const glow = s.bus(s.master, s.reverb({ seconds: 0.5, wet: 0.35, bright: 0.4 }));
  s.pad({
    dur: 1.5,
    freqs: [60, 67, 72, 76].map((note) => midiHz(note) * pitch),
    wave: 'soft',
    voices: 2,
    spread: 8,
    attack: 0.5,
    release: 0.6,
    shimmer: { rate: 4, depth: 0.35 },
    lowpass: 2200,
    gain: 0.25,
    dest: glow,
  });
  s.burst({
    at: 0.15,
    dur: 0.3,
    color: 'pink',
    freq: [
      [0, 1800],
      [0.3, 400],
    ],
    q: 0.8,
    env: [
      [0, 0],
      [0.012, 1],
      [0.08, 0.5],
      [0.3, 0, 'exp'],
    ],
    gain: 0.3,
    dest: glow,
  });
  for (let i = 0; i < 6; i++) {
    s.bubble({
      at: 0.3 + i * 0.14 + s.range(0, 0.05),
      freq: s.range(600, 1300) * pitch,
      rise: 1.5,
      dur: 0.06,
      gain: s.range(0.08, 0.12),
      pan: s.range(-0.5, 0.5),
      dest: glow,
    });
  }
  [91, 96].forEach((note, index) => {
    s.bell({
      at: 0.7 + index * 0.25,
      freq: midiHz(note) * pitch,
      dur: 0.45,
      gain: 0.06,
      partials: GLASS_PARTIALS,
      pan: index === 0 ? -0.3 : 0.3,
      dest: glow,
    });
  });
  return s.done();
};

export default glowingMushroom;
