import { Synth, midiHz } from '../synth';
import type { Recipe } from '../types';

const RING = [86, 90, 93, 98, 93, 90, 86, 90, 93, 98, 93, 90];

const saturn: Recipe = (voice) => {
  const s = new Synth(voice, 0.87);
  const pitch = s.vary(0.015);
  const space = s.bus(s.master, s.reverb({ seconds: 0.45, wet: 0.35, bright: 0.4 }));
  s.pad({
    dur: 1.45,
    freqs: [50, 57, 62].map((n) => midiHz(n) * pitch),
    wave: 'triangle',
    spread: 6,
    attack: 0.3,
    release: 0.6,
    gain: 0.2,
    dest: space,
  });
  [
    [0.1, 62],
    [0.45, 66],
    [0.8, 69],
  ].forEach(([at, note]) => {
    s.bell({ at, freq: midiHz(note) * pitch, dur: 0.7, gain: 0.252, dest: space });
  });
  RING.forEach((note, index) => {
    const angle = (index / 6) * Math.PI * 2;
    s.bell({
      at: 0.3 + index * 0.07,
      freq: midiHz(note) * pitch,
      dur: 0.22,
      gain: 0.06 + 0.028 * Math.cos(angle),
      pan: Math.sin(angle) * 0.8,
      dest: space,
    });
  });
  return s.done();
};

export default saturn;
