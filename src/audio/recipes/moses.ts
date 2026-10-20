import { Synth, midiHz } from '../synth';
import type { Recipe } from '../types';

const moses: Recipe = (voice) => {
  const s = new Synth(voice, 0.86).stereo();
  const pitch = s.vary(0.01);
  const mountain = s.bus(s.master, s.reverb({ seconds: 0.5, wet: 0.35, bright: 0.35 }));
  const root = midiHz(50) * pitch;
  s.brass({
    dur: 1.3,
    freq: [
      [0, root * 0.97],
      [0.1, root],
    ],
    attack: 0.35,
    release: 0.45,
    bright: 4,
    vibrato: { rate: 4.5, depth: 10, delay: 0.4 },
    gain: 0.3,
    dest: mountain,
  });
  s.brass({
    at: 0.25,
    dur: 1.05,
    freq: midiHz(57) * pitch,
    attack: 0.3,
    release: 0.45,
    bright: 4,
    vibrato: { rate: 4.5, depth: 10, delay: 0.35 },
    gain: 0.22,
    dest: mountain,
  });
  s.brass({
    at: 0.5,
    dur: 0.8,
    freq: midiHz(62) * pitch,
    attack: 0.25,
    release: 0.4,
    bright: 3.5,
    gain: 0.14,
    dest: mountain,
  });
  return s.done();
};

export default moses;
