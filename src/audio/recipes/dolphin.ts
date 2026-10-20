import { Synth } from '../synth';
import type { Recipe } from '../types';

const dolphin: Recipe = (voice) => {
  const s = new Synth(voice, 2);
  const pitch = s.vary(0.05);
  const times: number[] = [];
  let at = 0;
  for (let i = 0; i < 14; i++) {
    times.push(at);
    at += 0.04 - i * 0.002;
  }
  s.clicks({
    times,
    freq: 6000,
    q: 1,
    dur: 0.002,
    gain: times.map((_, i) => 0.27 + i * 0.01),
  });
  s.note({
    at: 0.4,
    dur: 0.55,
    freq: [
      [0, 2600 * pitch],
      [0.14, 4200 * pitch],
      [0.28, 3400 * pitch],
      [0.42, 4600 * pitch],
      [0.55, 2900 * pitch],
    ],
    wave: [1, 0.15],
    attack: 0.03,
    vibrato: { rate: 9, depth: 30 },
    gain: 0.12,
  });
  for (let i = 0; i < 6; i++) {
    const lift = pitch * (1 + Math.sin((i / 5) * Math.PI) * 0.12);
    s.chirp({
      at: 1.02 + i * 0.075,
      dur: 0.05,
      freq: [
        [0, 3100 * lift],
        [0.04, 3800 * lift],
      ],
      wave: [1, 0.2],
      gain: 0.13,
    });
  }
  return s.done();
};

export default dolphin;
