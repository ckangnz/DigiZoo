import { Synth, midiHz } from '../synth';
import type { Recipe } from '../types';

const MELODY: readonly (readonly [at: number, note: number, dur: number])[] = [
  [0, 67, 0.4],
  [0.42, 69, 0.13],
  [0.56, 67, 0.27],
  [0.84, 64, 0.62],
];

const mary: Recipe = (voice) => {
  const s = new Synth(voice, 1.2).stereo();
  const pitch = s.vary(0.01);
  const room = s.bus(s.master, s.reverb({ seconds: 0.45, wet: 0.35, bright: 0.4 }));
  s.pad({
    dur: 1.45,
    freqs: [48, 55, 64].map((n) => midiHz(n) * pitch),
    wave: 'soft',
    attack: 0.4,
    release: 0.5,
    gain: 0.05,
    dest: room,
  });
  MELODY.forEach(([at, note, dur]) => {
    s.note({
      at,
      dur,
      freq: midiHz(note) * pitch,
      wave: [1, 0.18, 0.05],
      vibrato: { rate: 5, depth: 14, delay: Math.min(0.15, dur * 0.5) },
      env: [
        [0, 0],
        [0.04, 1],
        [dur * 0.7, 0.85],
        [dur, 0, 'exp'],
      ],
      lowpass: 2400,
      gain: 0.3,
      dest: room,
    });
  });
  return s.done();
};

export default mary;
