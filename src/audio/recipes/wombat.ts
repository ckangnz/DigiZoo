import { Synth } from '../synth';
import type { Recipe } from '../types';

const wombat: Recipe = (voice) => {
  const s = new Synth(voice, 0.372).stereo();
  const pitch = s.vary(0.05);
  const pace = s.vary(0.04);
  [0, 0.22].forEach((offset, index) => {
    s.burst({
      at: offset * pace,
      dur: 0.14,
      color: 'pink',
      freq: 1200,
      q: 0.8,
      env: [
        [0, 0],
        [0.015, 1],
        [0.05, 0.6],
        [0.14, 0, 'exp'],
      ],
      gain: index === 0 ? 0.6 : 0.5,
    });
  });
  [
    [0.5, 0.3, 1],
    [0.86, 0.22, 0.95],
  ].forEach(([offset, dur, lift]) => {
    s.vocal({
      at: offset * pace,
      dur,
      pitch: [
        [0, 130],
        [0.06, 155],
        [dur, 110],
      ],
      transpose: pitch * lift,
      vowel: [
        [0, 'n'],
        [0.05, 'o'],
        [dur, 'u'],
      ],
      wave: 'buzz',
      shift: 0.9,
      breath: 0.5,
      growl: { rate: 20, depth: 0.7, fry: 30 },
      drive: 2,
      env: [
        [0, 0],
        [0.02, 1],
        [dur * 0.6, 0.75],
        [dur, 0, 'exp'],
      ],
      tone: 2200,
      gain: 0.5,
    });
  });
  [1.22, 1.4].forEach((offset, index) => {
    const at = offset * pace;
    const pan = index === 0 ? -0.2 : 0.2;
    s.burst({
      at,
      dur: 0.08,
      color: 'white',
      freq: 3500,
      q: 0.7,
      env: [
        [0, 0],
        [0.006, 1],
        [0.08, 0, 'exp'],
      ],
      gain: 0.45,
      pan,
    });
    const times = Array.from({ length: 6 }, () => at + s.range(0, 0.05));
    s.clicks({
      times,
      freq: times.map(() => s.range(2000, 4500)),
      gain: times.map(() => s.range(0.2, 0.35)),
      q: 1.8,
      dur: 0.005,
      pan,
    });
    s.thump({ at: at + 0.02, from: 260, to: 140, dur: 0.05, gain: 0.2, pan });
  });
  return s.done();
};

export default wombat;
