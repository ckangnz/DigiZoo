import { Synth, midiHz } from '../synth';
import type { Recipe } from '../types';

const mars: Recipe = (voice) => {
  const s = new Synth(voice, 1.39);
  const pitch = s.vary(0.015);
  const space = s.bus(s.master, s.reverb({ seconds: 0.4, wet: 0.3, bright: 0.4 }));
  s.pad({
    dur: 1.3,
    freqs: [60, 67].map((n) => midiHz(n) * pitch),
    wave: 'triangle',
    spread: 6,
    attack: 0.2,
    release: 0.55,
    gain: 0.15,
    dest: space,
  });
  [
    [0.05, 72],
    [0.22, 67],
    [0.39, 72],
    [0.56, 76],
    [0.8, 79],
  ].forEach(([at, note], index) => {
    s.mallet({
      at,
      freq: midiHz(note) * pitch,
      dur: index === 4 ? 0.6 : 0.4,
      gain: 0.364,
      hit: 0.3,
      pan: index % 2 === 0 ? -0.2 : 0.2,
      dest: space,
    });
  });
  s.burst({
    at: 0.6,
    dur: 0.7,
    color: 'pink',
    freq: [
      [0, 900],
      [0.35, 1800],
      [0.7, 1100],
    ],
    q: 1.2,
    swell: 0.45,
    gain: 0.12,
    pan: [
      [0, -0.5],
      [0.7, 0.5],
    ],
    dest: space,
  });
  return s.done();
};

export default mars;
