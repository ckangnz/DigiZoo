import { Synth, WOOD_PARTIALS } from '../synth';
import type { Recipe } from '../types';

const stork: Recipe = (voice) => {
  const s = new Synth(voice, 1.56);
  const pitch = s.vary(0.04);
  const pace = s.vary(0.04);
  const count = 18;
  const times: number[] = [];
  const levels: number[] = [];
  let at = 0;
  for (let i = 0; i < count; i++) {
    const progress = i / (count - 1);
    const level = 0.55 + 0.45 * Math.sin(Math.PI * Math.min(1, progress * 1.25));
    times.push(at);
    levels.push(level);
    s.bell({
      at,
      freq: (i % 2 === 0 ? 520 : 610) * pitch,
      dur: 0.055,
      gain: 0.3 * level,
      partials: WOOD_PARTIALS,
    });
    at += (0.095 - 0.04 * Math.sin(Math.PI * progress)) * pace;
  }
  s.clicks({
    times,
    freq: times.map((_, i) => (i % 2 === 0 ? 1900 : 2300)),
    gain: levels.map((level) => 0.28 * level),
    q: 1.6,
    dur: 0.01,
  });
  return s.done();
};

export default stork;
