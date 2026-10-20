import { Synth } from '../synth';
import type { Recipe } from '../types';

const riverDolphin: Recipe = (voice) => {
  const s = new Synth(voice, 1.36).stereo();
  const pitch = s.vary(0.05);
  const water = s.bus(s.master, s.reverb({ seconds: 0.4, wet: 0.3, bright: 0.35 }));
  const times = Array.from({ length: 9 }, (_, i) => i * 0.05);
  s.clicks({
    times,
    freq: 3500,
    q: 1.5,
    dur: 0.003,
    gain: times.map((_, i) => 0.25 + i * 0.015),
    dest: water,
  });
  [
    [0.5, 0.32, 1200, 1800, 1500],
    [0.86, 0.36, 1350, 2000, 1600],
  ].forEach(([at, dur, from, peak, to]) => {
    s.note({
      at,
      dur,
      freq: [
        [0, from * pitch],
        [dur * 0.6, peak * pitch],
        [dur, to * pitch],
      ],
      wave: [1, 0.15],
      vibrato: { rate: 7, depth: 25 },
      attack: 0.03,
      gain: 0.16,
      dest: water,
    });
  });
  for (let i = 0; i < 4; i++) {
    s.bubble({
      at: 1.0 + i * 0.06 + s.range(0, 0.03),
      freq: s.range(500, 1000),
      rise: 1.7,
      dur: 0.05,
      gain: s.range(0.1, 0.16),
      pan: s.range(-0.4, 0.4),
    });
  }
  return s.done();
};

export default riverDolphin;
