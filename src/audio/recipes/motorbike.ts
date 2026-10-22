import { Synth } from '../synth';
import type { Recipe } from '../types';

const motorbike: Recipe = (voice) => {
  const s = new Synth(voice, 0.555).stereo();
  const pitch = s.vary(0.04);
  const engine = {
    wave: 'buzz',
    shift: 0.85,
    sub: 0.3,
    drive: 3,
    growl: { rate: 32, depth: 0.35, fry: 20 },
    jitter: 15,
    breath: 0.5,
    tone: 3500,
    transpose: pitch,
  } as const;
  s.vocal({
    ...engine,
    dur: 0.28,
    pitch: [
      [0, 70],
      [0.1, 125],
      [0.28, 80],
    ],
    vowel: [
      [0, 'u'],
      [0.1, 'a'],
      [0.28, 'o'],
    ],
    env: [
      [0, 0],
      [0.03, 1],
      [0.15, 0.8],
      [0.28, 0, 'exp'],
    ],
    gain: 0.4,
    pan: -0.3,
  });
  const dur = 1.05;
  s.vocal({
    ...engine,
    at: 0.38,
    dur,
    pitch: [
      [0, 75],
      [0.35, 170],
      [0.65, 150],
      [dur, 70],
    ],
    vowel: [
      [0, 'u'],
      [0.15, 'o'],
      [0.4, 'a'],
      [0.8, 'o'],
      [dur, 'u'],
    ],
    env: [
      [0, 0],
      [0.05, 0.8],
      [0.35, 1],
      [0.7, 0.75],
      [dur, 0, 'exp'],
    ],
    gain: 0.5,
    pan: [
      [0, -0.3],
      [dur, 0.5],
    ],
  });
  [1.5, 1.62].forEach((at, index) => {
    s.thump({ at, from: 220, to: 90, dur: 0.06, gain: 0.3 - index * 0.08, pan: 0.5 });
    s.burst({
      at,
      dur: 0.05,
      color: 'pink',
      freq: 1200,
      q: 1,
      env: [
        [0, 0],
        [0.003, 1],
        [0.05, 0, 'exp'],
      ],
      gain: 0.4 - index * 0.1,
      pan: 0.5,
    });
  });
  return s.done();
};

export default motorbike;
