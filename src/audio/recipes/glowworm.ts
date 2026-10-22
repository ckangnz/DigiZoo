import { GLASS_PARTIALS, Synth, midiHz } from '../synth';
import type { Recipe } from '../types';

const STARS = [88, 91, 93, 96, 98, 100];

const glowworm: Recipe = (voice) => {
  const s = new Synth(voice, 3.31).stereo();
  const pitch = s.vary(0.02);
  const cave = s.bus(s.master, s.reverb({ seconds: 0.6, wet: 0.4, bright: 0.4 }));
  s.pad({
    dur: 1.3,
    freqs: [76, 83].map((note) => midiHz(note) * pitch),
    wave: 'sine',
    voices: 2,
    spread: 6,
    attack: 0.4,
    release: 0.5,
    shimmer: { rate: 3, depth: 0.4 },
    gain: 0.06,
    dest: cave,
  });
  for (let i = 0; i < 7; i++) {
    const note = STARS[Math.floor(s.random() * STARS.length)];
    s.bell({
      at: 0.1 + i * 0.16 + s.range(0, 0.06),
      freq: midiHz(note) * pitch,
      dur: 0.4,
      gain: s.range(0.05, 0.09),
      partials: GLASS_PARTIALS,
      pan: s.range(-0.6, 0.6),
      dest: cave,
    });
  }
  s.bubble({
    at: 0.04,
    freq: 1300 * pitch,
    rise: 1.8,
    dur: 0.04,
    gain: 0.22,
    pan: -0.3,
    dest: cave,
  });
  s.bubble({
    at: 1.05,
    freq: 1150 * pitch,
    rise: 1.9,
    dur: 0.04,
    gain: 0.18,
    pan: 0.3,
    dest: cave,
  });
  return s.done();
};

export default glowworm;
