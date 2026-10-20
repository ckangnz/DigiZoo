import { Synth, midiHz } from '../synth';
import type { Recipe } from '../types';

const sun: Recipe = (voice) => {
  const s = new Synth(voice, 0.59);
  const pitch = s.vary(0.015);
  const glow = s.bus(s.master, s.reverb({ seconds: 0.45, wet: 0.3, bright: 0.5 }));
  const dur = 1.5;
  s.pad({
    dur,
    freqs: [48, 55, 60, 64, 67].map((n) => midiHz(n) * pitch),
    wave: 'sawtooth',
    spread: 8,
    lowpass: [
      [0, 400],
      [0.55, 2200],
      [dur, 700],
    ],
    attack: 0.4,
    release: 0.7,
    shimmer: { rate: 4.5, depth: 0.18 },
    gain: 0.5,
    dest: glow,
  });
  s.pad({
    at: 0.2,
    dur: 1.2,
    freqs: [84, 88, 91].map((n) => midiHz(n) * pitch),
    wave: 'sine',
    voices: 1,
    attack: 0.35,
    release: 0.6,
    shimmer: { rate: 9, depth: 0.7 },
    gain: 0.12,
    dest: glow,
  });
  [96, 100, 103, 108].forEach((note, index) => {
    s.bell({
      at: 0.3 + index * 0.25 + s.jitter(0.03),
      freq: midiHz(note) * pitch,
      dur: 0.3,
      gain: 0.05,
      pan: s.range(-0.6, 0.6),
      dest: glow,
    });
  });
  return s.done();
};

export default sun;
