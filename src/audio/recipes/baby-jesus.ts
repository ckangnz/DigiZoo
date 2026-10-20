import { MUSIC_BOX_PARTIALS, Synth, midiHz } from '../synth';
import type { Recipe } from '../types';

const LULLABY: readonly (readonly [at: number, note: number, long: boolean])[] = [
  [0, 76, false],
  [0.12, 76, false],
  [0.24, 79, true],
  [0.56, 76, false],
  [0.68, 76, false],
  [0.8, 79, true],
];

const babyJesus: Recipe = (voice) => {
  const s = new Synth(voice, 2.64).stereo();
  const pitch = s.vary(0.01);
  const crib = s.bus(s.master, s.reverb({ seconds: 0.35, wet: 0.35, bright: 0.45 }));
  s.pad({
    dur: 1.35,
    freqs: [60, 64, 67].map((n) => midiHz(n) * pitch),
    wave: 'soft',
    attack: 0.35,
    release: 0.5,
    gain: 0.05,
    dest: crib,
  });
  LULLABY.forEach(([at, note, long], index) => {
    s.mallet({
      at: at + (index > 0 ? s.jitter(0.005) : 0),
      freq: midiHz(note + 12) * pitch,
      dur: long ? 0.6 : 0.35,
      gain: long ? 0.17 : 0.14,
      partials: MUSIC_BOX_PARTIALS,
      hit: 0.08,
      pan: index % 2 === 0 ? -0.15 : 0.15,
      dest: crib,
    });
  });
  return s.done();
};

export default babyJesus;
