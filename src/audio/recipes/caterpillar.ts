import { Synth } from '../synth';
import type { Recipe } from '../types';

const caterpillar: Recipe = (voice) => {
  const s = new Synth(voice, 2.59).stereo();
  const pitch = s.vary(0.05);
  const pace = s.vary(0.04);
  [0, 0.16, 0.32].forEach((offset, index) => {
    const at = offset * pace;
    const lift = pitch * [1, 1.1, 1.04][index];
    const times = Array.from({ length: 6 }, () => at + s.range(0, 0.05));
    s.clicks({
      times,
      freq: times.map(() => s.range(2000, 4000)),
      gain: times.map(() => s.range(0.1, 0.18)),
      q: 1.8,
      dur: 0.005,
      pan: -0.15,
    });
    s.burst({
      at,
      dur: 0.06,
      color: 'white',
      freq: 1800,
      q: 0.9,
      env: [
        [0, 0],
        [0.004, 1],
        [0.06, 0, 'exp'],
      ],
      gain: 0.45,
      pan: -0.15,
    });
    s.note({
      at,
      dur: 0.07,
      freq: [
        [0, 300 * lift],
        [0.03, 520 * lift],
        [0.07, 470 * lift],
      ],
      wave: 'soft',
      env: [
        [0, 0],
        [0.008, 1],
        [0.07, 0, 'exp'],
      ],
      gain: 0.28,
      pan: -0.15,
    });
  });
  [0.65, 0.95].forEach((offset, index) => {
    const at = offset * pace;
    const lift = pitch * (index === 0 ? 1 : 1.12);
    s.squelch({ at, freq: 500 * lift, dur: 0.16, gain: 0.25, pan: 0.15 });
    s.note({
      at: at + 0.02,
      dur: 0.18,
      freq: [
        [0, 280 * lift],
        [0.18, 420 * lift],
      ],
      wave: 'sine',
      env: [
        [0, 0],
        [0.03, 1],
        [0.18, 0, 'exp'],
      ],
      gain: 0.15,
      pan: 0.15,
    });
  });
  return s.done();
};

export default caterpillar;
