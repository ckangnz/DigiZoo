import { ORGAN_WAVE, Synth, WOOD_PARTIALS, midiHz } from '../synth';
import type { Recipe } from '../types';

const tenCommandments: Recipe = (voice) => {
  const s = new Synth(voice, 0.984).stereo();
  const pitch = s.vary(0.02);
  const mountain = s.bus(s.master, s.reverb({ seconds: 0.45, wet: 0.3, bright: 0.35 }));
  [0, 0.22].forEach((at, index) => {
    s.stomp({ at, freq: 85 * pitch, dur: 0.3, gain: 0.35, dest: mountain });
    s.mallet({
      at,
      freq: (index === 0 ? 300 : 270) * pitch,
      dur: 0.12,
      gain: 0.32,
      partials: WOOD_PARTIALS,
      hit: 0.7,
      dest: mountain,
    });
  });
  const dur = 1.0;
  [50, 57, 62, 66].forEach((note, index) => {
    s.note({
      at: 0.38,
      dur,
      freq: midiHz(note) * pitch,
      wave: ORGAN_WAVE,
      env: [
        [0, 0],
        [0.2, 1],
        [0.7, 0.85],
        [dur, 0, 'exp'],
      ],
      lowpass: 2400,
      gain: index === 0 ? 0.15 : 0.12,
      dest: mountain,
    });
  });
  return s.done();
};

export default tenCommandments;
