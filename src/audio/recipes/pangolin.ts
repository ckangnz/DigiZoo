import { Synth } from '../synth';
import type { Recipe } from '../types';

const pangolin: Recipe = (voice) => {
  const s = new Synth(voice, 1.1);
  const pitch = s.vary(0.05);
  const pace = s.vary(0.05);
  [0, 0.14].forEach((offset) => {
    s.burst({
      at: offset * pace,
      dur: 0.08,
      color: 'pink',
      freq: 2200 * pitch,
      q: 1.5,
      env: [
        [0, 0],
        [0.01, 1],
        [0.08, 0, 'exp'],
      ],
      gain: 0.3,
    });
  });
  const rattleAt = 0.32 * pace;
  for (let wave = 0; wave < 3; wave++) {
    const at = rattleAt + wave * 0.16;
    const times = Array.from({ length: 12 }, () => at + s.range(0, 0.1));
    s.clicks({
      times,
      freq: times.map(() => s.range(1800, 3800) * pitch),
      gain: times.map(() => s.range(0.35, 0.65) * (1 - wave * 0.15)),
      q: 7,
      dur: 0.018,
      ring: 0.45,
    });
  }
  const huffAt = rattleAt + 0.55;
  s.burst({
    at: huffAt,
    dur: 0.32,
    color: 'pink',
    type: 'lowpass',
    freq: [
      [0, 1800],
      [0.32, 500],
    ],
    q: 2,
    env: [
      [0, 0],
      [0.02, 1],
      [0.12, 0.6],
      [0.32, 0, 'exp'],
    ],
    gain: 0.45,
  });
  s.vocal({
    at: huffAt + 0.01,
    dur: 0.2,
    pitch: [
      [0, 330],
      [0.2, 260],
    ],
    transpose: pitch,
    vowel: 'u',
    wave: 'glottal',
    breath: 0.8,
    env: [
      [0, 0],
      [0.02, 1],
      [0.2, 0, 'exp'],
    ],
    gain: 0.05,
  });
  return s.done();
};

export default pangolin;
