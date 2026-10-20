import { GLASS_PARTIALS, Synth, midiHz } from '../synth';
import type { Recipe } from '../types';

const babyMoses: Recipe = (voice) => {
  const s = new Synth(voice, 1.55).stereo();
  const pitch = s.vary(0.02);
  const river = s.bus(s.master, s.reverb({ seconds: 0.4, wet: 0.3, bright: 0.35 }));
  [0, 0.42].forEach((at, index) => {
    s.burst({
      at,
      dur: 0.45,
      color: 'pink',
      type: 'lowpass',
      freq: [
        [0, 400],
        [0.2, 900],
        [0.45, 450],
      ],
      q: 1.5,
      swell: 0.4,
      gain: 0.4,
      pan: index === 0 ? -0.3 : 0.3,
      dest: river,
    });
    s.bubble({
      at: at + 0.18,
      freq: s.range(450, 700),
      rise: 1.6,
      dur: 0.06,
      gain: 0.12,
      dest: river,
    });
  });
  [
    [0.8, 79],
    [0.95, 86],
  ].forEach(([at, note]) => {
    s.bell({
      at,
      freq: midiHz(note) * pitch,
      dur: 0.6,
      gain: 0.2,
      partials: GLASS_PARTIALS,
      dest: river,
    });
  });
  return s.done();
};

export default babyMoses;
