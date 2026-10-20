import { MUSIC_BOX_PARTIALS, Synth, midiHz } from '../synth';
import type { Recipe } from '../types';

const earth: Recipe = (voice) => {
  const s = new Synth(voice, 1.09);
  const pitch = s.vary(0.015);
  const space = s.bus(s.master, s.reverb({ seconds: 0.4, wet: 0.3, bright: 0.45 }));
  s.pad({
    dur: 1.3,
    freqs: [55, 62, 67, 71].map((n) => midiHz(n) * pitch),
    wave: 'sawtooth',
    spread: 7,
    lowpass: 1100,
    attack: 0.3,
    release: 0.55,
    gain: 0.175,
    dest: space,
  });
  [67, 71, 74, 79].forEach((note, index) => {
    s.mallet({
      at: 0.1 + index * 0.2,
      freq: midiHz(note) * pitch,
      dur: index === 3 ? 0.6 : 0.45,
      gain: 0.252,
      partials: MUSIC_BOX_PARTIALS,
      hit: 0.1,
      dest: space,
    });
  });
  [1.05, 1.2].forEach((at, index) => {
    const lift = pitch * (index === 0 ? 1 : 1.08);
    s.chirp({
      at,
      dur: 0.08,
      freq: [
        [0, 2800 * lift],
        [0.05, 3700 * lift],
        [0.08, 3300 * lift],
      ],
      wave: [1, 0.15],
      gain: 0.1,
      pan: 0.4,
      dest: space,
    });
  });
  return s.done();
};

export default earth;
