import { GLASS_PARTIALS, Synth } from '../synth';
import type { Recipe } from '../types';

const BOUTS: readonly (readonly [at: number, from: number, to: number])[] = [
  [0, -0.5, 0.1],
  [0.5, 0.2, -0.2],
  [1.0, -0.1, 0.5],
];

const moth: Recipe = (voice) => {
  const s = new Synth(voice, 4.05).stereo();
  const pitch = s.vary(0.04);
  const pace = s.vary(0.04);
  BOUTS.forEach(([offset, from, to]) => {
    const at = offset * pace;
    const wings = s.tremolo({
      rate: 22,
      depth: 0.85,
      at,
      dur: 0.32,
      dest: s.panner(
        [
          [0, from],
          [0.3, to],
        ],
        { at },
      ),
    });
    s.burst({
      at,
      dur: 0.3,
      color: 'pink',
      type: 'lowpass',
      freq: 900,
      q: 0.8,
      env: [
        [0, 0],
        [0.05, 1],
        [0.22, 0.8],
        [0.3, 0, 'exp'],
      ],
      gain: 0.35,
      dest: wings,
    });
  });
  [0.36, 0.86].forEach((offset, index) => {
    const at = offset * pace;
    s.bell({
      at,
      freq: 2600 * pitch * (index === 0 ? 1 : 1.06),
      dur: 0.18,
      gain: 0.08,
      partials: GLASS_PARTIALS,
      pan: 0.15,
    });
    s.click({ at, freq: 4000, q: 2, dur: 0.003, gain: 0.05, pan: 0.15 });
  });
  return s.done();
};

export default moth;
