import { Synth, midiHz } from '../synth';
import type { Recipe } from '../types';

const MOTIF: readonly (readonly [at: number, note: number, dur: number])[] = [
  [0.12, 60, 0.75],
  [0.5, 67, 0.7],
  [0.88, 72, 0.65],
];

const jupiter: Recipe = (voice) => {
  const s = new Synth(voice, 0.96);
  const pitch = s.vary(0.015);
  const space = s.bus(s.master, s.reverb({ seconds: 0.45, wet: 0.35, bright: 0.35 }));
  const dur = 1.45;
  const swirl = s.filter('lowpass', 700, 2, { dest: space });
  s.lfo(swirl.frequency, { rate: 1.6, depth: 300, dur: dur + 0.02 });
  s.pad({
    dur,
    freqs: [48, 55, 60].map((n) => midiHz(n) * pitch),
    wave: 'sawtooth',
    spread: 7,
    attack: 0.35,
    release: 0.6,
    gain: 0.225,
    dest: swirl,
  });
  MOTIF.forEach(([at, note, length]) => {
    s.bell({ at, freq: midiHz(note) * pitch, dur: length, gain: 0.28, dest: space });
  });
  return s.done();
};

export default jupiter;
