import { Synth } from '../synth';
import type { Recipe } from '../types';

const tuatara: Recipe = (voice) => {
  const s = new Synth(voice, 0.548).stereo();
  const pitch = s.vary(0.05);
  const pace = s.vary(0.05);
  [0, 0.3].forEach((offset, index) => {
    const dur = 0.16;
    s.vocal({
      at: offset * pace,
      dur,
      pitch: [
        [0, 170],
        [0.04, 190],
        [dur, 150],
      ],
      transpose: pitch * (index === 0 ? 1 : 0.94),
      vowel: [
        [0, 'o'],
        [0.04, 'a'],
        [dur, 'o'],
      ],
      wave: 'buzz',
      breath: 0.4,
      growl: { rate: 42, depth: 0.7, fry: 30 },
      drive: 1.5,
      env: [
        [0, 0],
        [0.015, 1],
        [dur * 0.6, 0.7],
        [dur, 0, 'exp'],
      ],
      tone: 3000,
      gain: 0.5,
    });
  });
  s.chirp({
    at: 0.62 * pace,
    dur: 0.08,
    freq: [
      [0, 1300 * pitch],
      [0.03, 1700 * pitch],
      [0.08, 1500 * pitch],
    ],
    wave: [1, 0.15],
    gain: 0.22,
  });
  const times = Array.from({ length: 8 }, (_, i) => (0.86 + i * 0.035 + s.range(0, 0.01)) * pace);
  s.clicks({
    times,
    freq: times.map(() => s.range(2500, 3500)),
    gain: times.map(() => s.range(0.25, 0.4)),
    q: 3,
    dur: 0.006,
    ring: 0.25,
    pan: [
      [0, -0.3],
      [0.3, 0.3],
    ],
  });
  return s.done();
};

export default tuatara;
