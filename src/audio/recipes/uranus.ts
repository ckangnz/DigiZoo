import { GLASS_PARTIALS, Synth, midiHz } from '../synth';
import type { Recipe } from '../types';

const uranus: Recipe = (voice) => {
  const s = new Synth(voice, 1.19);
  const pitch = s.vary(0.015);
  const space = s.bus(s.master, s.reverb({ seconds: 0.45, wet: 0.4, bright: 0.6 }));
  s.pad({
    dur: 1.45,
    freqs: [52, 59, 64].map((n) => midiHz(n) * pitch),
    wave: 'soft',
    spread: 10,
    attack: 0.35,
    release: 0.6,
    vibrato: { rate: 0.8, depth: 25 },
    gain: 0.225,
    dest: space,
  });
  const ice = s.tremolo({ rate: 6, depth: 0.3, dur: 1.5, dest: space });
  [
    [0.1, 71],
    [0.38, 76],
    [0.66, 75],
    [0.94, 71],
  ].forEach(([at, note], index) => {
    s.bell({
      at,
      freq: midiHz(note) * pitch,
      dur: 0.55,
      gain: 0.238,
      partials: GLASS_PARTIALS,
      pan: index % 2 === 0 ? -0.3 : 0.3,
      dest: ice,
    });
  });
  return s.done();
};

export default uranus;
