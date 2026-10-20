import { GLASS_PARTIALS, Synth, midiHz } from '../synth';
import type { Recipe } from '../types';

const ARMS = [84, 88, 91, 96, 100];

const starfish: Recipe = (voice) => {
  const s = new Synth(voice, 2.7).stereo();
  const pitch = s.vary(0.02);
  const water = s.bus(s.master, s.reverb({ seconds: 0.5, wet: 0.45, bright: 0.4 }));
  const ripple = s.tremolo({ rate: 6, depth: 0.35, dur: 1.2, dest: water });
  ARMS.forEach((note, index) => {
    const angle = (index / ARMS.length) * Math.PI * 2;
    s.bell({
      at: index * 0.1,
      freq: midiHz(note) * pitch,
      dur: 0.6,
      gain: 0.16,
      partials: GLASS_PARTIALS,
      pan: Math.sin(angle) * 0.6,
      dest: ripple,
    });
  });
  s.bell({ at: 0.62, freq: midiHz(96) * pitch, dur: 0.5, gain: 0.08, dest: ripple });
  for (let i = 0; i < 6; i++) {
    s.bubble({
      at: 0.3 + i * 0.12 + s.range(0, 0.05),
      freq: s.range(500, 1100),
      rise: 1.7,
      dur: 0.05,
      gain: s.range(0.08, 0.14),
      pan: s.range(-0.5, 0.5),
      dest: water,
    });
  }
  return s.done();
};

export default starfish;
