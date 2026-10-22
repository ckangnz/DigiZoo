import { Synth } from '../synth';
import type { Recipe } from '../types';

const polarBear: Recipe = (voice) => {
  const s = new Synth(voice, 0.463).stereo();
  const pitch = s.vary(0.05);
  const pace = s.vary(0.04);
  [0, 0.28].forEach((offset, index) => {
    const at = offset * pace;
    const pan = index === 0 ? -0.25 : 0.25;
    const times = Array.from({ length: 14 }, () => at + s.range(0, 0.09));
    s.clicks({
      times,
      freq: times.map(() => s.range(1500, 4000)),
      gain: times.map(() => s.range(0.1, 0.22)),
      q: 1.5,
      dur: 0.006,
      pan,
    });
    s.burst({
      at,
      dur: 0.12,
      color: 'pink',
      type: 'lowpass',
      freq: 2500,
      q: 0.7,
      env: [
        [0, 0],
        [0.01, 1],
        [0.04, 0.5],
        [0.12, 0, 'exp'],
      ],
      gain: 0.35,
      pan,
    });
    s.thump({ at, from: 140, to: 70, dur: 0.1, gain: 0.25, pan });
  });
  const dur = 0.68;
  s.vocal({
    at: 0.6 * pace,
    dur,
    pitch: [
      [0, 85],
      [0.2, 112],
      [0.45, 100],
      [dur, 72],
    ],
    transpose: pitch,
    vowel: [
      [0, 'o'],
      [0.2, 'a'],
      [0.45, 'o'],
      [dur, 'u'],
    ],
    wave: 'buzz',
    shift: 0.8,
    sub: 0.3,
    drive: 2,
    growl: { rate: 22, depth: 0.6, fry: 35 },
    jitter: 20,
    breath: 0.6,
    env: [
      [0, 0],
      [0.06, 0.8],
      [0.2, 1],
      [0.5, 0.7],
      [dur, 0, 'exp'],
    ],
    tone: 2200,
    gain: 0.5,
  });
  [1.38, 1.56].forEach((offset, index) => {
    s.burst({
      at: offset * pace,
      dur: 0.13,
      color: 'pink',
      freq: 900,
      q: 0.9,
      env: [
        [0, 0],
        [0.012, 1],
        [0.05, 0.5],
        [0.13, 0, 'exp'],
      ],
      gain: index === 0 ? 0.9 : 0.7,
    });
  });
  return s.done();
};

export default polarBear;
