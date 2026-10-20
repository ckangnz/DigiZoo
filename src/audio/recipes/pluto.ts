import { GLASS_PARTIALS, Synth, midiHz } from '../synth';
import type { Recipe } from '../types';

const CALL: readonly (readonly [at: number, note: number, gain: number])[] = [
  [0.08, 91, 0.22],
  [0.36, 88, 0.2],
  [0.5, 91, 0.21],
  [0.82, 96, 0.21],
  [1.0, 96, 0.085],
  [1.18, 96, 0.035],
];

const pluto: Recipe = (voice) => {
  const s = new Synth(voice, 1.72);
  const pitch = s.vary(0.015);
  const space = s.bus(s.master, s.reverb({ seconds: 0.35, wet: 0.45, bright: 0.55 }));
  s.pad({
    dur: 1.35,
    freqs: [67, 74].map((n) => midiHz(n) * pitch),
    wave: 'sine',
    spread: 6,
    attack: 0.3,
    release: 0.6,
    gain: 0.1,
    dest: space,
  });
  CALL.forEach(([at, note, gain], index) => {
    s.bell({
      at,
      freq: midiHz(note) * pitch,
      dur: index >= 4 ? 0.35 : 0.4,
      gain,
      partials: GLASS_PARTIALS,
      pan: index >= 4 ? (index === 4 ? 0.5 : -0.5) : 0,
      dest: space,
    });
  });
  return s.done();
};

export default pluto;
