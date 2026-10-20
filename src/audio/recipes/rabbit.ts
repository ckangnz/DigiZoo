import { Synth } from '../synth';
import type { Recipe } from '../types';

const rabbit: Recipe = (voice) => {
  const s = new Synth(voice, 1.51);
  const pitch = s.vary(0.05);
  const pace = s.vary(0.05);
  [0, 0.07, 0.14].forEach((offset) => {
    s.burst({
      at: offset * pace,
      dur: 0.045,
      color: 'pink',
      freq: 3000 * pitch,
      q: 1.6,
      env: [
        [0, 0],
        [0.02, 1],
        [0.045, 0, 'exp'],
      ],
      gain: 0.45,
    });
  });
  [0.32, 0.5, 0.68].forEach((offset, index) => {
    const at = offset * pace;
    const times = Array.from({ length: 7 }, () => at + s.range(0, 0.05));
    s.clicks({
      times,
      freq: times.map(() => s.range(2000, 4500)),
      gain: times.map(() => s.range(0.15, 0.28)),
      q: 1.8,
      dur: 0.006,
    });
    s.burst({
      at,
      dur: 0.07,
      color: 'pink',
      freq: 2200 * pitch,
      q: 1.2,
      env: [
        [0, 0],
        [0.004, 1],
        [0.03, 0.6],
        [0.08, 0, 'exp'],
      ],
      gain: 0.8 - index * 0.08,
    });
    s.thump({ at: at + 0.02, from: 320 * pitch, to: 170 * pitch, dur: 0.06, gain: 0.3 });
  });
  s.thump({
    at: 0.95 * pace,
    from: 260 * pitch,
    to: 110 * pitch,
    dur: 0.12,
    gain: 0.45,
    thud: 0.8,
  });
  return s.done();
};

export default rabbit;
