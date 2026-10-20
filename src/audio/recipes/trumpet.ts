import { Synth } from '../synth';
import type { Recipe } from '../types';

const trumpet: Recipe = (voice) => {
  const s = new Synth(voice, 1.13).stereo();
  const pitch = s.vary(0.03);
  const desert = s.bus(s.master, s.reverb({ seconds: 0.45, wet: 0.3, bright: 0.4 }));
  const horn = s.filter('peaking', 1100, 1.5, { dest: desert, gain: 6 });
  const raw = s.tremolo({ rate: 24, depth: 0.12, dur: 1.2, dest: horn });
  s.brass({
    dur: 0.18,
    freq: [
      [0, 300 * pitch],
      [0.05, 340 * pitch],
    ],
    attack: 0.03,
    release: 0.06,
    bright: 5,
    gain: 0.25,
    dest: raw,
  });
  s.brass({
    at: 0.26,
    dur: 0.9,
    freq: [
      [0, 300 * pitch],
      [0.08, 345 * pitch],
      [0.55, 350 * pitch],
      [0.7, 465 * pitch],
      [0.9, 460 * pitch],
    ],
    attack: 0.06,
    release: 0.18,
    bright: 5,
    vibrato: { rate: 5, depth: 10, delay: 0.3 },
    gain: 0.25,
    dest: raw,
  });
  return s.done();
};

export default trumpet;
