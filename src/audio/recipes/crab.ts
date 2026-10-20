import { Synth } from '../synth';
import type { Recipe } from '../types';

const crab: Recipe = (voice) => {
  const s = new Synth(voice, 1.2);
  const pitch = s.vary(0.05);
  const pace = s.vary(0.05);
  const pinch = [0, 0.11, 0.42, 0.53].map((t) => t * pace);
  s.clicks({
    times: pinch,
    freq: [3200, 2400, 3300, 2450].map((f) => f * pitch),
    gain: [0.4, 0.4, 0.38, 0.4],
    q: 8,
    dur: 0.03,
    ring: 0.35,
  });
  s.clicks({
    times: pinch,
    freq: [1400, 1000, 1450, 1000].map((f) => f * pitch),
    gain: [0.25, 0.3, 0.25, 0.3],
    q: 10,
    dur: 0.05,
    ring: 0.7,
  });
  const taps = Array.from({ length: 8 }, () => s.range(0.75, 1.0) * pace);
  s.clicks({
    times: taps,
    freq: taps.map(() => s.range(3000, 4000)),
    gain: 0.35,
    q: 3,
    dur: 0.005,
  });
  return s.done();
};

export default crab;
