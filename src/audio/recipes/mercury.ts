import { Synth, midiHz } from '../synth';
import type { Recipe } from '../types';

const RUN = [76, 78, 80, 83, 85, 88];

const mercury: Recipe = (voice) => {
  const s = new Synth(voice, 1.05);
  const pitch = s.vary(0.015);
  const space = s.bus(s.master, s.reverb({ seconds: 0.4, wet: 0.3, bright: 0.5 }));
  s.pad({
    dur: 1.2,
    freqs: [64, 71].map((n) => midiHz(n) * pitch),
    wave: 'soft',
    spread: 8,
    attack: 0.15,
    release: 0.5,
    gain: 0.16,
    dest: space,
  });
  RUN.forEach((note, index) => {
    s.bell({
      at: 0.05 + index * 0.065,
      freq: midiHz(note) * pitch,
      dur: 0.35,
      gain: 0.182,
      pan: -0.7 + index * 0.28,
      dest: space,
    });
  });
  s.burst({
    at: 0.02,
    dur: 0.45,
    color: 'white',
    freq: [
      [0, 1500],
      [0.4, 5000],
    ],
    q: 1.5,
    swell: 0.6,
    gain: 0.06,
    pan: [
      [0, -0.7],
      [0.45, 0.7],
    ],
    dest: space,
  });
  [88, 95].forEach((note) => {
    s.bell({ at: 0.62, freq: midiHz(note) * pitch, dur: 0.75, gain: 0.168, dest: space });
  });
  return s.done();
};

export default mercury;
