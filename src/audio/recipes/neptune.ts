import { Synth, midiHz } from '../synth';
import type { Recipe } from '../types';

const neptune: Recipe = (voice) => {
  const s = new Synth(voice, 0.71);
  const pitch = s.vary(0.015);
  const space = s.bus(s.master, s.reverb({ seconds: 0.45, wet: 0.4, bright: 0.35 }));
  const dur = 1.45;
  s.pad({
    dur,
    freqs: [53, 60, 65].map((n) => midiHz(n) * pitch),
    wave: 'soft',
    spread: 8,
    attack: 0.35,
    release: 0.6,
    gain: 0.225,
    dest: space,
  });
  s.burst({
    dur,
    color: 'pink',
    freq: [
      [0, 500],
      [0.6, 1300],
      [dur, 600],
    ],
    q: 2.5,
    swell: 0.45,
    gain: 0.3,
    pan: [
      [0, 0.5],
      [dur, -0.5],
    ],
    dest: space,
  });
  [
    [0.1, 72],
    [0.45, 69],
    [0.8, 65],
  ].forEach(([at, note]) => {
    s.bell({ at, freq: midiHz(note) * pitch, dur: 0.65, gain: 0.252, dest: space });
  });
  return s.done();
};

export default neptune;
