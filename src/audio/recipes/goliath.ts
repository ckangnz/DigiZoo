import { Synth, WOOD_PARTIALS, midiHz } from '../synth';
import type { Recipe } from '../types';

const goliath: Recipe = (voice) => {
  const s = new Synth(voice, 0.621);
  const pitch = s.vary(0.04);
  const pace = s.vary(0.04);
  [0, 0.55].forEach((offset) => {
    const at = offset * pace;
    s.stomp({ at, freq: 62 * pitch, dur: 0.5, gain: 0.3 });
    s.thump({ at, from: 300 * pitch, to: 140 * pitch, dur: 0.16, gain: 0.4, thud: 0.8 });
    s.mallet({
      at,
      freq: 220 * pitch,
      dur: 0.3,
      gain: 0.5,
      partials: WOOD_PARTIALS,
      hit: 0.2,
    });
  });
  [
    [1.12, 48, 0.16],
    [1.3, 55, 0.3],
  ].forEach(([at, note, dur]) => {
    s.brass({
      at: at * pace,
      dur,
      freq: midiHz(note) * pitch,
      attack: 0.03,
      release: 0.1,
      bright: 5,
      gain: 0.6,
    });
  });
  return s.done();
};

export default goliath;
