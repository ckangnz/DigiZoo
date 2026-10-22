import { Synth, WOOD_PARTIALS } from '../synth';
import type { Recipe } from '../types';

const pelican: Recipe = (voice) => {
  const s = new Synth(voice, 0.424);
  const pitch = s.vary(0.05);
  const pace = s.vary(0.04);
  [0, 0.13].forEach((offset, index) => {
    const at = offset * pace;
    s.mallet({
      at,
      freq: 360 * pitch * (index === 0 ? 1 : 1.08),
      dur: 0.12,
      gain: 0.35,
      partials: WOOD_PARTIALS,
      hit: 0.7,
    });
    s.click({ at, freq: 1800, q: 3, dur: 0.012, gain: 0.25 });
  });
  const dur = 0.34;
  s.vocal({
    at: 0.36 * pace,
    dur,
    pitch: [
      [0, 140],
      [0.06, 175],
      [dur, 120],
    ],
    transpose: pitch,
    vowel: [
      [0, 'o'],
      [0.07, 'a'],
      [dur * 0.7, 'o'],
      [dur, 'u'],
    ],
    wave: 'buzz',
    shift: 0.95,
    breath: 0.4,
    growl: { rate: 26, depth: 0.6, fry: 30 },
    drive: 2,
    env: [
      [0, 0],
      [0.03, 1],
      [dur * 0.6, 0.8],
      [dur, 0, 'exp'],
    ],
    tone: 2800,
    gain: 0.5,
  });
  const gulp = 0.88 * pace;
  s.click({ at: gulp, freq: 1200, q: 2, dur: 0.01, gain: 0.15 });
  s.vocal({
    at: gulp,
    dur: 0.16,
    pitch: [
      [0, 320],
      [0.16, 170],
    ],
    transpose: pitch,
    vowel: [
      [0, 'o'],
      [0.16, 'u'],
    ],
    wave: 'glottal',
    env: [
      [0, 0],
      [0.012, 1],
      [0.16, 0, 'exp'],
    ],
    tone: 2000,
    gain: 0.45,
  });
  s.bubble({ at: gulp + 0.01, freq: 420 * pitch, rise: 0.55, dur: 0.12, gain: 0.25 });
  s.thump({ at: gulp + 0.02, from: 210 * pitch, to: 95 * pitch, dur: 0.12, gain: 0.25 });
  return s.done();
};

export default pelican;
