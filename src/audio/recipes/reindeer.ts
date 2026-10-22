import { Synth, blend } from '../synth';
import type { Recipe } from '../types';

const GRUNTS: readonly (readonly [at: number, dur: number, lift: number])[] = [
  [0, 0.2, 1],
  [0.3, 0.2, 1.06],
  [0.6, 0.32, 0.97],
];

const reindeer: Recipe = (voice) => {
  const s = new Synth(voice, 0.501).stereo();
  const pitch = s.vary(0.05);
  const pace = s.vary(0.04);
  const open = blend('o', 'a', 0.5);
  GRUNTS.forEach(([offset, dur, lift]) => {
    s.vocal({
      at: offset * pace,
      dur,
      pitch: [
        [0, 115],
        [0.05, 140],
        [dur, 100],
      ],
      transpose: pitch * lift,
      vowel: [
        [0, 'o'],
        [0.05, open],
        [dur * 0.7, 'o'],
        [dur, 'u'],
      ],
      wave: 'buzz',
      shift: 0.9,
      breath: 0.5,
      growl: { rate: 24, depth: 0.7, fry: 40 },
      drive: 2,
      env: [
        [0, 0],
        [0.02, 1],
        [dur * 0.6, 0.75],
        [dur, 0, 'exp'],
      ],
      tone: 2500,
      gain: 0.5,
    });
  });
  const times = Array.from({ length: 6 }, (_, i) => (1.08 + i * 0.1 + s.range(0, 0.01)) * pace);
  s.clicks({
    times,
    freq: times.map((_, i) => (i % 2 === 0 ? 2300 : 2700)),
    gain: times.map((_, i) => 0.5 - i * 0.03),
    q: 6,
    dur: 0.012,
    ring: 0.4,
    pan: [
      [0, -0.3],
      [0.6, 0.3],
    ],
  });
  times.forEach((at, index) => {
    s.thump({
      at,
      from: 220,
      to: 120,
      dur: 0.05,
      gain: 0.12,
      pan: index % 2 === 0 ? -0.2 : 0.2,
    });
  });
  return s.done();
};

export default reindeer;
