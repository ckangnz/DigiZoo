import { Synth, midiHz } from '../synth';
import type { Recipe } from '../types';

const venus: Recipe = (voice) => {
  const s = new Synth(voice, 0.96);
  const pitch = s.vary(0.015);
  const space = s.bus(s.master, s.reverb({ seconds: 0.4, wet: 0.35, bright: 0.55 }));
  s.pad({
    dur: 1.4,
    freqs: [57, 64, 69, 73].map((n) => midiHz(n) * pitch),
    wave: 'soft',
    spread: 9,
    attack: 0.3,
    release: 0.55,
    shimmer: { rate: 7, depth: 0.35 },
    gain: 0.21,
    dest: space,
  });
  [
    [0.1, 73],
    [0.33, 76],
    [0.56, 81],
  ].forEach(([at, note]) => {
    s.bell({ at, freq: midiHz(note) * pitch, dur: 0.6, gain: 0.238, dest: space });
  });
  for (let i = 0; i < 6; i++) {
    s.bell({
      at: 0.88 + i * 0.065,
      freq: midiHz(i % 2 === 0 ? 93 : 95) * pitch,
      dur: 0.25,
      gain: 0.06 - i * 0.006,
      pan: i % 2 === 0 ? -0.4 : 0.4,
      dest: space,
    });
  }
  return s.done();
};

export default venus;
