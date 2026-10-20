import { Synth, midiHz } from '../synth';
import type { Recipe } from '../types';

const noah: Recipe = (voice) => {
  const s = new Synth(voice, 2.1).stereo();
  const pitch = s.vary(0.02);
  const sky = s.bus(s.master, s.reverb({ seconds: 0.35, wet: 0.25, bright: 0.5 }));
  for (let i = 0; i < 7; i++) {
    s.bubble({
      at: i * 0.06 + s.range(0, 0.03),
      freq: s.range(1600, 3200),
      rise: s.range(1.2, 1.5),
      dur: 0.025,
      gain: s.range(0.1, 0.18),
      pan: s.range(-0.6, 0.6),
      dest: sky,
    });
  }
  [72, 76, 79, 84].forEach((note, index) => {
    s.mallet({
      at: 0.48 + index * 0.12,
      freq: midiHz(note) * pitch,
      dur: index === 3 ? 0.6 : 0.35,
      gain: 0.28,
      hit: 0.25,
      pan: -0.3 + index * 0.2,
      dest: sky,
    });
  });
  return s.done();
};

export default noah;
