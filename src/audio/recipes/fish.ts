import { Synth } from '../synth';
import type { Recipe } from '../types';

const fish: Recipe = (voice) => {
  const s = new Synth(voice, 1.23);
  const pitch = s.vary(0.05);
  [0, 0.3 + s.jitter(0.02)].forEach((at, index) => {
    const lift = pitch * (index === 0 ? 1 : 1.12);
    s.thump({ at, from: 150 * lift, to: 90 * lift, dur: 0.05, gain: 0.15 });
    s.bubble({ at, freq: 240 * lift, rise: 2.4, dur: 0.13, gain: 0.5 });
    s.bubble({ at: at + 0.04, freq: 480 * lift, rise: 1.6, dur: 0.06, gain: 0.18 });
    s.vocal({
      at: at + 0.01,
      dur: 0.11,
      pitch: [
        [0, 230],
        [0.11, 190],
      ],
      transpose: lift,
      vowel: 'u',
      wave: 'glottal',
      env: [
        [0, 0],
        [0.015, 1],
        [0.11, 0, 'exp'],
      ],
      gain: 0.12,
    });
  });
  for (let i = 0; i < 5; i++) {
    const at = 0.5 + (i + s.range(0, 0.8)) * 0.07;
    s.bubble({ at, freq: s.range(700, 1400), rise: 1.7, dur: 0.04, gain: s.range(0.08, 0.16) });
  }
  return s.done();
};

export default fish;
