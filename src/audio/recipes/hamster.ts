import { Synth } from '../synth';
import type { Recipe } from '../types';

const hamster: Recipe = (voice) => {
  const s = new Synth(voice, 1.5).stereo();
  const pitch = s.vary(0.05);
  const pace = s.vary(0.04);
  const nibbles = Array.from({ length: 12 }, (_, i) => (i * 0.025 + s.range(0, 0.006)) * pace);
  s.clicks({
    times: nibbles,
    freq: nibbles.map(() => s.range(2500, 4000)),
    gain: nibbles.map(() => s.range(0.3, 0.5)),
    q: 2,
    dur: 0.004,
    pan: -0.2,
  });
  [0.4, 0.55].forEach((offset, index) => {
    const lift = pitch * (index === 0 ? 1 : 1.08);
    s.chirp({
      at: offset * pace,
      dur: 0.06,
      freq: [
        [0, 2400 * lift],
        [0.02, 3000 * lift],
        [0.06, 2600 * lift],
      ],
      wave: [1, 0.12],
      gain: 0.3,
      pan: -0.1,
    });
  });
  const wheel = 0.8 * pace;
  for (let i = 0; i < 4; i++) {
    s.vocal({
      at: wheel + i * 0.17 * pace,
      dur: 0.12,
      pitch: [
        [0, 640],
        [0.06, 760],
        [0.12, 680],
      ],
      transpose: pitch * (i % 2 === 0 ? 1 : 1.05),
      vowel: [
        [0, 'e'],
        [0.06, 'i'],
        [0.12, 'e'],
      ],
      wave: 'buzz',
      shift: 1.6,
      breath: 0.15,
      growl: { rate: 60, depth: 0.3 },
      env: [
        [0, 0],
        [0.02, 1],
        [0.08, 0.7],
        [0.12, 0, 'exp'],
      ],
      tone: 5000,
      gain: 0.12,
      pan: 0.25,
    });
  }
  const ticks = Array.from({ length: 16 }, (_, i) => wheel + i * 0.042 * pace);
  s.clicks({
    times: ticks,
    freq: 1800,
    gain: 0.08,
    q: 4,
    dur: 0.005,
    pan: 0.25,
  });
  return s.done();
};

export default hamster;
