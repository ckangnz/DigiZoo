import { Synth, midiHz, type Partials } from '../synth';
import type { Recipe } from '../types';

const JINGLE: Partials = [
  [1, 1, 1],
  [1.62, 0.6, 0.7],
  [2.34, 0.35, 0.5],
  [3.1, 0.2, 0.35],
];

const wiseMan: Recipe = (voice) => {
  const s = new Synth(voice, 3.2).stereo();
  const pitch = s.vary(0.02);
  const hall = s.bus(s.master, s.reverb({ seconds: 0.35, wet: 0.25, bright: 0.5 }));
  [0, 0.22].forEach((shake) => {
    for (let i = 0; i < 7; i++) {
      s.bell({
        at: shake + s.range(0, 0.1),
        freq: s.range(2800, 4200),
        dur: 0.12,
        gain: s.range(0.04, 0.07),
        partials: JINGLE,
        pan: s.range(-0.5, 0.5),
        dest: hall,
      });
    }
  });
  [74, 78, 81, 86].forEach((note, index) => {
    s.bell({
      at: 0.45 + index * 0.15,
      freq: midiHz(note) * pitch,
      dur: 0.55,
      gain: 0.13,
      pan: -0.3 + index * 0.2,
      dest: hall,
    });
  });
  return s.done();
};

export default wiseMan;
