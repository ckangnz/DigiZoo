import { Synth, midiHz } from '../synth';
import type { Recipe } from '../types';

const PHRASE: readonly (readonly [at: number, note: number, dur: number])[] = [
  [0, 67, 0.22],
  [0.24, 72, 0.22],
  [0.48, 76, 0.24],
  [0.74, 79, 0.6],
];

const daniel: Recipe = (voice) => {
  const s = new Synth(voice, 1.23).stereo();
  const pitch = s.vary(0.01);
  const den = s.bus(s.master, s.reverb({ seconds: 0.45, wet: 0.3, bright: 0.4 }));
  s.pad({
    dur: 1.4,
    freqs: [48, 55, 60].map((n) => midiHz(n) * pitch),
    wave: 'soft',
    attack: 0.3,
    release: 0.5,
    gain: 0.08,
    dest: den,
  });
  PHRASE.forEach(([at, note, dur]) => {
    s.brass({
      at,
      dur,
      freq: midiHz(note) * pitch,
      attack: 0.05,
      release: Math.min(0.15, dur * 0.4),
      bright: 3.5,
      vibrato: dur > 0.4 ? { rate: 5, depth: 12, delay: 0.2 } : undefined,
      gain: 0.22,
      dest: den,
    });
  });
  return s.done();
};

export default daniel;
