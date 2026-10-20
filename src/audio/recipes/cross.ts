import { Synth, midiHz, type Partials } from '../synth';
import type { Recipe } from '../types';

const WARM_BELL: Partials = [
  [1, 1, 1],
  [2, 0.35, 0.6],
  [3, 0.16, 0.4],
  [4.16, 0.08, 0.25],
];

const cross: Recipe = (voice) => {
  const s = new Synth(voice, 1.95).stereo();
  const pitch = s.vary(0.01);
  const church = s.bus(s.master, s.reverb({ seconds: 0.5, wet: 0.35, bright: 0.35 }));
  s.pad({
    dur: 1.3,
    freqs: [48, 55].map((n) => midiHz(n) * pitch),
    wave: 'soft',
    attack: 0.3,
    release: 0.6,
    gain: 0.08,
    dest: church,
  });
  [60, 64, 67, 72].forEach((note, index) => {
    s.bell({
      at: index * 0.03,
      freq: midiHz(note) * pitch,
      dur: 1.3,
      gain: index === 3 ? 0.1 : 0.15,
      partials: WARM_BELL,
      pan: -0.3 + index * 0.2,
      dest: church,
    });
  });
  return s.done();
};

export default cross;
