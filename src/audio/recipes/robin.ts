import { Synth } from '../synth';
import type { Recipe } from '../types';

const NOTES: readonly (readonly [
  at: number,
  dur: number,
  from: number,
  peak: number,
  to: number,
  trill: number,
])[] = [
  [0, 0.1, 2100, 2750, 2450, 0],
  [0.13, 0.09, 2500, 3000, 2250, 0],
  [0.4, 0.11, 1950, 2600, 2350, 0],
  [0.55, 0.09, 2400, 3050, 2600, 0],
  [0.84, 0.1, 2200, 2800, 2500, 0],
  [0.98, 0.22, 2300, 2700, 2050, 140],
];

const robin: Recipe = (voice) => {
  const s = new Synth(voice, 1.46).stereo();
  const pitch = s.vary(0.04);
  const pace = s.vary(0.04);
  const garden = s.bus(s.master, s.reverb({ seconds: 0.35, wet: 0.2, bright: 0.45 }));
  NOTES.forEach(([offset, dur, from, peak, to, trill], index) => {
    s.note({
      at: offset * pace,
      dur,
      freq: [
        [0, from * pitch],
        [dur * 0.35, peak * pitch],
        [dur, to * pitch],
      ],
      wave: [1, 0.12, 0.03],
      vibrato: trill ? { rate: 22, depth: trill, delay: 0.04 } : undefined,
      env: [
        [0, 0],
        [0.008, 1],
        [dur * 0.5, 0.6],
        [dur, 0, 'exp'],
      ],
      gain: 0.3,
      pan: index % 2 === 0 ? -0.15 : 0.15,
      dest: garden,
    });
  });
  return s.done();
};

export default robin;
