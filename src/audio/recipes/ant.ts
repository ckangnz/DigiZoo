import { Synth, XYLOPHONE_PARTIALS, midiHz } from '../synth';
import type { Recipe } from '../types';

const MARCH: readonly (readonly [at: number, note: number, dur: number])[] = [
  [0, 79, 0.2],
  [0.18, 79, 0.2],
  [0.36, 84, 0.2],
  [0.54, 88, 0.45],
];

const ant: Recipe = (voice) => {
  const s = new Synth(voice, 4.92).stereo();
  const pitch = s.vary(0.02);
  const pace = s.vary(0.03);
  const times = Array.from({ length: 14 }, (_, i) => i * 0.09 * pace);
  s.clicks({
    times,
    freq: times.map((_, i) => (i % 2 === 0 ? 3200 : 3800)),
    gain: times.map((_, i) => 0.14 - (i % 2) * 0.03),
    q: 3,
    dur: 0.004,
    pan: [
      [0, -0.4],
      [1.2, 0.4],
    ],
  });
  MARCH.forEach(([offset, note, dur], index) => {
    s.mallet({
      at: offset * pace,
      freq: midiHz(note) * pitch,
      dur,
      gain: 0.15,
      partials: XYLOPHONE_PARTIALS,
      hit: 0.2,
      pan: -0.2 + index * 0.13,
    });
  });
  return s.done();
};

export default ant;
