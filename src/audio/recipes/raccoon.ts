import { BELL_PARTIALS, Synth } from '../synth';
import type { Recipe } from '../types';

const raccoon: Recipe = (voice) => {
  const s = new Synth(voice, 0.859).stereo();
  const pitch = s.vary(0.05);
  const pace = s.vary(0.04);
  [0, 0.42].forEach((offset, index) => {
    const dur = 0.32;
    s.vocal({
      at: offset * pace,
      dur,
      pitch: [
        [0, 700],
        [0.1, 860],
        [dur, 650],
      ],
      transpose: pitch * (index === 0 ? 1 : 1.06),
      vowel: [
        [0, 'e'],
        [0.1, 'i'],
        [dur, 'e'],
      ],
      shift: 1.4,
      breath: 0.3,
      growl: { rate: 32, depth: 0.85 },
      env: [
        [0, 0],
        [0.03, 1],
        [dur * 0.7, 0.8],
        [dur, 0, 'exp'],
      ],
      tone: 6000,
      gain: 0.5,
    });
  });
  s.vocal({
    at: 0.86 * pace,
    dur: 0.3,
    pitch: [
      [0, 240],
      [0.3, 220],
    ],
    transpose: pitch,
    vowel: [
      [0, 'o'],
      [0.3, 'u'],
    ],
    wave: 'reed',
    breath: 0.3,
    growl: { rate: 25, depth: 0.85, fry: 20 },
    env: [
      [0, 0],
      [0.03, 1],
      [0.2, 0.8],
      [0.3, 0, 'exp'],
    ],
    tone: 3000,
    gain: 0.45,
  });
  [
    [1.25, 1250, 0.12],
    [1.33, 1180, 0.08],
  ].forEach(([offset, freq, gain]) => {
    const at = offset * pace;
    s.bell({ at, freq: freq * pitch, dur: 0.35, gain, partials: BELL_PARTIALS, pan: 0.35 });
    s.click({ at, freq: 3000, q: 3, dur: 0.005, gain: gain * 1.2, pan: 0.35 });
  });
  return s.done();
};

export default raccoon;
