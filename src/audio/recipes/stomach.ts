import { Synth } from '../synth';
import type { Recipe } from '../types';

const stomach: Recipe = (voice) => {
  const s = new Synth(voice, 1.0);
  const pitch = s.vary(0.05);
  const growl = 0.6;
  s.note({
    dur: growl,
    freq: [
      [0, 95 * pitch],
      [0.25, 150 * pitch],
      [growl, 110 * pitch],
    ],
    wave: [1, 0.5, 0.3, 0.15],
    vibrato: { rate: 14, depth: 120 },
    env: [
      [0, 0],
      [0.08, 1],
      [0.45, 0.8],
      [growl, 0, 'exp'],
    ],
    lowpass: 700,
    gain: 0.4,
  });
  s.burst({
    dur: growl,
    color: 'pink',
    type: 'lowpass',
    freq: [
      [0, 200],
      [0.2, 700],
      [0.4, 300],
      [growl, 500],
    ],
    q: 12,
    env: [
      [0, 0],
      [0.06, 1],
      [0.45, 0.7],
      [growl, 0, 'exp'],
    ],
    gain: 0.3,
  });
  [0.6, 0.69, 0.76, 0.87, 0.97].forEach((at, index) => {
    s.bubble({
      at: at + s.jitter(0.01),
      freq: s.range(170, 360) * pitch,
      rise: 2,
      dur: index === 4 ? 0.1 : 0.07,
      gain: s.range(0.25, 0.35),
    });
  });
  s.squelch({ at: 1.05, freq: 420 * pitch, dur: 0.14, gain: 0.35 });
  return s.done();
};

export default stomach;
