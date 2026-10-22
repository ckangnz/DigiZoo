import { Synth, WOOD_PARTIALS } from '../synth';
import type { Recipe } from '../types';

const ROLLS: readonly (readonly [at: number, count: number, gap: number])[] = [
  [0, 13, 0.052],
  [0.95, 9, 0.05],
];

const woodpecker: Recipe = (voice) => {
  const s = new Synth(voice, 1.61);
  const pitch = s.vary(0.04);
  const pace = s.vary(0.03);
  const times: number[] = [];
  const levels: number[] = [];
  ROLLS.forEach(([start, count, gap]) => {
    for (let i = 0; i < count; i++) {
      const at = (start + i * gap) * pace;
      const level = (i < 2 ? 0.75 + i * 0.12 : 1) * (1 - (i / count) * 0.35);
      times.push(at);
      levels.push(level);
      s.bell({
        at,
        freq: 820 * pitch * (1 + (s.random() - 0.5) * 0.04),
        dur: 0.06,
        gain: 0.32 * level,
        partials: WOOD_PARTIALS,
      });
    }
  });
  s.clicks({
    times,
    freq: times.map(() => s.range(2200, 2800)),
    gain: levels.map((level) => 0.3 * level),
    q: 2,
    dur: 0.008,
  });
  return s.done();
};

export default woodpecker;
