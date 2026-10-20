import { Synth, midiHz } from '../synth';
import type { Recipe } from '../types';

const chameleon: Recipe = (voice) => {
  const s = new Synth(voice, 1.65).stereo();
  const pitch = s.vary(0.05);
  s.note({
    dur: 0.09,
    freq: [
      [0, 300 * pitch],
      [0.09, 2600 * pitch],
    ],
    wave: [1, 0.2],
    env: [
      [0, 0],
      [0.01, 1],
      [0.07, 0.8],
      [0.09, 0, 'exp'],
    ],
    gain: 0.3,
  });
  s.burst({
    dur: 0.09,
    color: 'white',
    freq: [
      [0, 1500],
      [0.09, 6000],
    ],
    q: 1.5,
    env: [
      [0, 0],
      [0.01, 1],
      [0.09, 0, 'exp'],
    ],
    gain: 0.12,
  });
  s.note({
    at: 0.2,
    dur: 0.12,
    freq: [
      [0, 1500 * pitch],
      [0.12, 220 * pitch],
    ],
    wave: [1, 0.2],
    env: [
      [0, 0],
      [0.01, 1],
      [0.12, 0, 'exp'],
    ],
    gain: 0.3,
  });
  s.click({ at: 0.32, freq: 900, q: 3, dur: 0.02, gain: 0.3, ring: 0.4 });
  s.bubble({ at: 0.45, freq: 170 * pitch, rise: 2.2, dur: 0.12, gain: 0.4 });
  [72, 76, 79, 84, 88].forEach((note, index) => {
    s.bell({
      at: 0.68 + index * 0.06,
      freq: midiHz(note) * pitch,
      dur: 0.3,
      gain: 0.1,
      pan: -0.5 + index * 0.25,
    });
  });
  return s.done();
};

export default chameleon;
