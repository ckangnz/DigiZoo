import { Synth, WOOD_PARTIALS, midiHz } from '../synth';
import type { Recipe } from '../types';

const joseph: Recipe = (voice) => {
  const s = new Synth(voice, 1.06).stereo();
  const pitch = s.vary(0.03);
  const pace = s.vary(0.03);
  const shop = s.bus(s.master, s.reverb({ seconds: 0.3, wet: 0.2, bright: 0.4 }));
  [0, 0.2, 0.4].forEach((offset, index) => {
    const at = offset * pace;
    const lift = pitch * (index === 2 ? 1.06 : 1);
    s.mallet({
      at,
      freq: 420 * lift,
      dur: 0.12,
      gain: index === 2 ? 0.4 : 0.32,
      partials: WOOD_PARTIALS,
      hit: 0.6,
      dest: shop,
    });
    s.thump({ at, from: 260 * lift, to: 140 * lift, dur: 0.05, gain: 0.2, dest: shop });
  });
  [
    [0.66, 79],
    [0.66, 86],
    [0.8, 91],
  ].forEach(([at, note]) => {
    s.bell({ at: at * pace, freq: midiHz(note) * pitch, dur: 0.65, gain: 0.17, dest: shop });
  });
  return s.done();
};

export default joseph;
