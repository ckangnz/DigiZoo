import { Synth } from '../synth';
import type { Recipe } from '../types';

const earthworm: Recipe = (voice) => {
  const s = new Synth(voice, 2.57).stereo();
  const pitch = s.vary(0.05);
  const pace = s.vary(0.04);
  s.burst({
    dur: 0.5,
    color: 'pink',
    freq: 700,
    q: 0.8,
    swell: 0.5,
    gain: 0.3,
    pan: -0.2,
  });
  const times = Array.from({ length: 8 }, () => s.range(0.05, 0.45));
  s.clicks({
    times,
    freq: times.map(() => s.range(1500, 3000)),
    gain: times.map(() => s.range(0.08, 0.16)),
    q: 2,
    dur: 0.005,
    pan: -0.2,
  });
  [0.35, 0.66].forEach((offset, index) => {
    const lift = pitch * (index === 0 ? 1 : 1.12);
    s.note({
      at: offset * pace,
      dur: 0.26,
      freq: [
        [0, 420 * lift],
        [0.26, 500 * lift],
      ],
      wave: 'sine',
      vibrato: { rate: 8, depth: 250 },
      env: [
        [0, 0],
        [0.03, 1],
        [0.12, 0.6],
        [0.26, 0, 'exp'],
      ],
      gain: 0.22,
      pan: index === 0 ? -0.1 : 0.1,
    });
  });
  s.bubble({ at: 1.05 * pace, freq: 400 * pitch, rise: 2.6, dur: 0.08, gain: 0.3, pan: 0.2 });
  return s.done();
};

export default earthworm;
