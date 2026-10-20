import { Synth, XYLOPHONE_PARTIALS, midiHz } from '../synth';
import type { Recipe } from '../types';

const bone: Recipe = (voice) => {
  const s = new Synth(voice, 1.7);
  const pitch = s.vary(0.03);
  [
    [0, 79],
    [0.18, 86],
  ].forEach(([at, note], index) => {
    s.mallet({
      at: at + (index > 0 ? s.jitter(0.01) : 0),
      freq: midiHz(note) * pitch,
      dur: 0.45,
      gain: 0.3,
      partials: XYLOPHONE_PARTIALS,
      hit: 0.6,
    });
  });
  return s.done();
};

export default bone;
