import { GLASS_PARTIALS, MUSIC_BOX_PARTIALS, Synth, midiHz } from '../synth';
import type { Recipe } from '../types';

const SPOTS = [88, 91, 96];

const ladybug: Recipe = (voice) => {
  const s = new Synth(voice, 3.33).stereo();
  const pitch = s.vary(0.02);
  const pace = s.vary(0.03);
  const wings = s.tremolo({
    rate: 32,
    depth: 0.85,
    dur: 0.42,
    dest: s.panner([
      [0, -0.4],
      [0.4, 0.3],
    ]),
  });
  s.burst({
    dur: 0.4,
    color: 'pink',
    type: 'lowpass',
    freq: 1400,
    q: 0.8,
    env: [
      [0, 0],
      [0.08, 1],
      [0.28, 0.8],
      [0.4, 0, 'exp'],
    ],
    gain: 0.4,
    dest: wings,
  });
  SPOTS.forEach((note, index) => {
    s.mallet({
      at: (0.5 + index * 0.14) * pace,
      freq: midiHz(note) * pitch,
      dur: 0.4,
      gain: 0.16,
      partials: MUSIC_BOX_PARTIALS,
      hit: 0.08,
      pan: -0.2 + index * 0.2,
    });
  });
  s.bell({
    at: 1.0 * pace,
    freq: midiHz(100) * pitch,
    dur: 0.3,
    gain: 0.05,
    partials: GLASS_PARTIALS,
    pan: 0.35,
  });
  return s.done();
};

export default ladybug;
