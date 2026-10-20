import { Synth, midiHz } from '../synth';
import type { Recipe } from '../types';

const jesus: Recipe = (voice) => {
  const s = new Synth(voice, 0.64).stereo();
  const pitch = s.vary(0.01);
  const glory = s.bus(s.master, s.reverb({ seconds: 0.45, wet: 0.35, bright: 0.45 }));
  s.choir({
    dur: 1.3,
    freqs: [60, 64, 67, 72].map((n) => midiHz(n) * pitch),
    vowel: [
      [0, 'o'],
      [0.5, 'a'],
      [1.3, 'a'],
    ],
    attack: 0.4,
    release: 0.5,
    gain: 0.4,
    dest: glory,
  });
  [79, 84, 88].forEach((note, index) => {
    s.bell({
      at: 0.35 + index * 0.2,
      freq: midiHz(note) * pitch,
      dur: 0.6,
      gain: 0.19,
      pan: -0.3 + index * 0.3,
      dest: glory,
    });
  });
  return s.done();
};

export default jesus;
