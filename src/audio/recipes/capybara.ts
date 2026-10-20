import { Synth, blend } from '../synth';
import type { Recipe } from '../types';

const capybara: Recipe = (voice) => {
  const s = new Synth(voice, 0.38);
  const pitch = s.vary(0.05);
  s.vocal({
    dur: 0.6,
    pitch: [
      [0, 85],
      [0.6, 80],
    ],
    transpose: pitch,
    vowel: blend('n', 'u', 0.5),
    wave: 'glottal',
    shift: 0.9,
    growl: { rate: 24, depth: 0.7 },
    breath: 0.3,
    tone: 2000,
    env: [
      [0, 0],
      [0.15, 1],
      [0.45, 0.9],
      [0.6, 0, 'exp'],
    ],
    gain: 0.4,
  });
  s.clicks({ times: [0.64, 0.71, 0.78], freq: 2600, q: 4, dur: 0.008, gain: 0.5, ring: 0.4 });
  [0.86, 1.12].forEach((at, index) => {
    const lift = pitch * (index === 0 ? 1 : 1.06);
    s.chirp({
      at,
      dur: 0.18,
      freq: [
        [0, 1150 * lift],
        [0.1, 1450 * lift],
        [0.18, 1350 * lift],
      ],
      attack: 0.03,
      gain: 0.4,
    });
    s.burst({ at, dur: 0.18, freq: 1400 * lift, q: 4, gain: 0.03 });
  });
  return s.done();
};

export default capybara;
