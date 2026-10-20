import { Synth, XYLOPHONE_PARTIALS, midiHz } from '../synth';
import type { Recipe } from '../types';

const RUN = [72, 76, 79, 84, 88, 84, 79, 76];

const skeleton: Recipe = (voice) => {
  const s = new Synth(voice, 2.3).stereo();
  const pitch = s.vary(0.02);
  const pace = s.vary(0.04);
  RUN.forEach((note, index) => {
    s.mallet({
      at: index * 0.055 * pace,
      freq: midiHz(note) * pitch,
      dur: 0.3,
      gain: 0.2,
      partials: XYLOPHONE_PARTIALS,
      hit: 0.4,
      pan: -0.5 + (index / (RUN.length - 1)) * 0.5,
    });
  });
  const rattleAt = 0.5 * pace;
  const times = Array.from({ length: 14 }, (_, i) => rattleAt + i * 0.022 + s.range(0, 0.01));
  s.clicks({
    times,
    freq: times.map(() => s.range(1200, 2600)),
    gain: times.map((_, i) => s.range(0.25, 0.4) * (1 - i / 20)),
    q: 6,
    dur: 0.012,
    ring: 0.4,
    pan: 0.3,
  });
  [
    [0.9, 79],
    [1.02, 72],
  ].forEach(([at, note]) => {
    s.mallet({
      at: at * pace,
      freq: midiHz(note) * pitch,
      dur: 0.35,
      gain: 0.24,
      partials: XYLOPHONE_PARTIALS,
      hit: 0.5,
    });
  });
  return s.done();
};

export default skeleton;
