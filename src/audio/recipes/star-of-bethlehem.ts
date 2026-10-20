import { GLASS_PARTIALS, Synth, midiHz } from '../synth';
import type { Recipe } from '../types';

const TWINKLES: readonly (readonly [at: number, note: number])[] = [
  [0.05, 88],
  [0.2, 95],
  [0.35, 92],
  [0.52, 100],
  [0.7, 95],
  [0.88, 100],
];

const starOfBethlehem: Recipe = (voice) => {
  const s = new Synth(voice, 3.31).stereo();
  const pitch = s.vary(0.015);
  const night = s.bus(s.master, s.reverb({ seconds: 0.45, wet: 0.4, bright: 0.6 }));
  const glow = s.tremolo({ rate: 7, depth: 0.4, dur: 1.4, dest: night });
  s.pad({
    dur: 1.35,
    freqs: [88, 95].map((n) => midiHz(n) * pitch),
    wave: 'sine',
    spread: 6,
    attack: 0.35,
    release: 0.5,
    gain: 0.06,
    dest: glow,
  });
  TWINKLES.forEach(([at, note], index) => {
    s.bell({
      at,
      freq: midiHz(note) * pitch,
      dur: 0.4,
      gain: 0.11 - index * 0.008,
      partials: GLASS_PARTIALS,
      pan: index % 2 === 0 ? -0.35 : 0.35,
      dest: glow,
    });
  });
  return s.done();
};

export default starOfBethlehem;
