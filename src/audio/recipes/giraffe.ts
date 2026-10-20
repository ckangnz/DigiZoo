import { Synth, blend } from '../synth';
import type { Recipe } from '../types';

const giraffe: Recipe = (voice) => {
  const s = new Synth(voice, 0.28);
  const pitch = s.vary(0.05);
  s.vocal({
    dur: 0.75,
    pitch: [
      [0, 140],
      [0.35, 152],
      [0.75, 132],
    ],
    transpose: pitch,
    vowel: blend('n', 'u', 0.4),
    wave: 'glottal',
    breath: 0.04,
    vibrato: { rate: 4, depth: 10 },
    env: [
      [0, 0],
      [0.15, 1],
      [0.55, 0.9],
      [0.75, 0, 'exp'],
    ],
    tone: 2500,
    gain: 0.2,
  });
  [0.92, 1.18, 1.44].forEach((offset, index) => {
    const at = offset + s.jitter(0.02);
    const times = Array.from({ length: 10 }, () => at + s.range(0, 0.1));
    s.clicks({
      times,
      freq: times.map(() => s.range(1500, 5000)),
      gain: times.map(() => s.range(1.2, 2.6)),
      q: 1.5,
      dur: 0.004,
    });
    s.burst({
      at,
      dur: 0.11,
      color: 'white',
      freq: 3500,
      q: 0.8,
      env: [
        [0, 0],
        [0.01, 1],
        [0.11, 0, 'exp'],
      ],
      gain: 1.4,
    });
    s.burst({
      at,
      dur: 0.08,
      color: 'pink',
      freq: 600,
      q: 1.5,
      env: [
        [0, 0],
        [0.006, 1],
        [0.08, 0, 'exp'],
      ],
      gain: 2.4 - index * 0.3,
    });
    s.thump({ at, from: 160, to: 90, dur: 0.08, gain: 0.8 });
  });
  return s.done();
};

export default giraffe;
