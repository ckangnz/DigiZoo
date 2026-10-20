import { Synth } from '../synth';
import type { Recipe } from '../types';

const tortoise: Recipe = (voice) => {
  const s = new Synth(voice, 0.33);
  const pitch = s.vary(0.05);
  [0, 0.42].forEach((at) => {
    s.thump({ at, from: 180, to: 70, dur: 0.2, gain: 1.4, thud: 0.8 });
    s.burst({
      at,
      dur: 0.12,
      color: 'pink',
      freq: 900,
      q: 0.8,
      env: [
        [0, 0],
        [0.01, 1],
        [0.12, 0, 'exp'],
      ],
      gain: 1.2,
    });
  });
  [0.8, 1.0, 1.2].forEach((offset, index) => {
    const at = offset + s.jitter(0.02);
    const times = Array.from({ length: 8 }, () => at + s.range(0, 0.08));
    s.clicks({
      times,
      freq: times.map(() => s.range(1800, 4500)),
      gain: times.map(() => s.range(1.0, 2.2)),
      q: 1.8,
      dur: 0.005,
    });
    s.burst({
      at,
      dur: 0.09,
      color: 'white',
      freq: 3000,
      q: 0.9,
      env: [
        [0, 0],
        [0.01, 1],
        [0.09, 0, 'exp'],
      ],
      gain: 1.2,
    });
    s.burst({
      at,
      dur: 0.07,
      color: 'pink',
      freq: 650,
      q: 1.5,
      env: [
        [0, 0],
        [0.006, 1],
        [0.07, 0, 'exp'],
      ],
      gain: 2.0 - index * 0.25,
    });
  });
  s.vocal({
    at: 1.42,
    dur: 0.55,
    pitch: [
      [0, 150],
      [0.15, 178],
      [0.55, 140],
    ],
    transpose: pitch,
    vowel: 'n',
    wave: 'glottal',
    shift: 0.95,
    breath: 0.08,
    env: [
      [0, 0],
      [0.08, 1],
      [0.4, 0.8],
      [0.55, 0, 'exp'],
    ],
    gain: 0.3,
  });
  return s.done();
};

export default tortoise;
