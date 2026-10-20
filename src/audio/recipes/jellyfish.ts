import { Synth } from '../synth';
import type { Recipe } from '../types';

const jellyfish: Recipe = (voice) => {
  const s = new Synth(voice, 0.4);
  const pitch = s.vary(0.05);
  const water = s.bus(s.master, s.reverb({ seconds: 0.6, wet: 0.5, bright: 0.4 }));
  s.note({
    dur: 0.62,
    freq: [
      [0, 260 * pitch],
      [0.25, 420 * pitch],
      [0.62, 380 * pitch],
    ],
    wave: 'soft',
    vibrato: { rate: 5, depth: 90 },
    env: [
      [0, 0],
      [0.12, 1],
      [0.4, 0.7],
      [0.62, 0, 'exp'],
    ],
    gain: 0.45,
    dest: water,
  });
  s.note({
    at: 0.5,
    dur: 0.5,
    freq: [
      [0, 330 * pitch],
      [0.25, 520 * pitch],
      [0.5, 470 * pitch],
    ],
    wave: 'soft',
    vibrato: { rate: 5, depth: 90 },
    env: [
      [0, 0],
      [0.1, 1],
      [0.3, 0.7],
      [0.5, 0, 'exp'],
    ],
    gain: 0.3,
    dest: water,
  });
  Array.from({ length: 6 }, () => s.range(0.2, 1.0)).forEach((at) => {
    s.bell({ at, freq: s.range(2000, 4200), dur: 0.35, gain: s.range(0.05, 0.08), dest: water });
  });
  return s.done();
};

export default jellyfish;
