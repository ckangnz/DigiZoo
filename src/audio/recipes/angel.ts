import { HARP_PARTIALS, Synth, midiHz } from '../synth';
import type { Recipe } from '../types';

const GLISSANDO = [72, 74, 76, 77, 79, 81, 83, 84, 86, 88, 89, 91, 93, 95, 96];

const angel: Recipe = (voice) => {
  const s = new Synth(voice, 0.87).stereo();
  const pitch = s.vary(0.01);
  const heaven = s.bus(s.master, s.reverb({ seconds: 0.5, wet: 0.4, bright: 0.55 }));
  s.choir({
    dur: 1.2,
    freqs: [72, 76, 79].map((n) => midiHz(n) * pitch),
    vowel: 'u',
    attack: 0.35,
    release: 0.45,
    shimmer: { rate: 6, depth: 0.25 },
    gain: 0.24,
    dest: heaven,
  });
  GLISSANDO.forEach((note, index) => {
    s.mallet({
      at: 0.1 + index * 0.035,
      freq: midiHz(note) * pitch,
      dur: 0.5,
      gain: 0.15,
      partials: HARP_PARTIALS,
      hit: 0,
      pan: -0.6 + (index / (GLISSANDO.length - 1)) * 1.2,
      dest: heaven,
    });
  });
  return s.done();
};

export default angel;
