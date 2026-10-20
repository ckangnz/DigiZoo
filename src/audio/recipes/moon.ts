import { MUSIC_BOX_PARTIALS, Synth, midiHz } from '../synth';
import type { Recipe } from '../types';

const MELODY = [77, 77, 84, 84, 86, 86, 84];

const moon: Recipe = (voice) => {
  const s = new Synth(voice, 2.67);
  const pitch = s.vary(0.015);
  const night = s.bus(s.master, s.reverb({ seconds: 0.35, wet: 0.35, bright: 0.45 }));
  const step = 0.18;
  s.pad({
    dur: 1.6,
    freqs: [53, 60, 65].map((n) => midiHz(n) * pitch),
    wave: 'soft',
    attack: 0.4,
    release: 0.6,
    gain: 0.06,
    dest: night,
  });
  MELODY.forEach((note, index) => {
    const last = index === MELODY.length - 1;
    s.mallet({
      at: index * step + (index > 0 ? s.jitter(0.006) : 0),
      freq: midiHz(note) * pitch,
      dur: last ? 0.55 : 0.4,
      gain: last ? 0.2 : 0.17,
      partials: MUSIC_BOX_PARTIALS,
      hit: 0.1,
      pan: (index % 2 === 0 ? -0.2 : 0.2) * (last ? 0 : 1),
      dest: night,
    });
  });
  s.bell({ at: 1.25, freq: midiHz(96) * pitch, dur: 0.3, gain: 0.04, pan: 0.5, dest: night });
  return s.done();
};

export default moon;
