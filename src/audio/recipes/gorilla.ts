import { Synth } from '../synth';
import type { Recipe } from '../types';

const gorilla: Recipe = (voice) => {
  const s = new Synth(voice, 1.19).stereo();
  const pitch = s.vary(0.05);
  const pace = s.vary(0.04);
  [0, 0.26].forEach((offset, index) => {
    const dur = 0.2;
    s.vocal({
      at: offset * pace,
      dur,
      pitch: [
        [0, 140],
        [0.06, 175],
        [dur, 150],
      ],
      transpose: pitch * (index === 0 ? 1 : 1.1),
      vowel: 'u',
      wave: 'glottal',
      shift: 0.85,
      breath: 0.3,
      env: [
        [0, 0],
        [0.03, 1],
        [0.12, 0.8],
        [dur, 0, 'exp'],
      ],
      tone: 1800,
      gain: 0.1,
    });
  });
  const beatAt = 0.55 * pace;
  for (let i = 0; i < 8; i++) {
    const at = beatAt + i * 0.075 * pace;
    const left = i % 2 === 0;
    s.thump({
      at,
      from: 380 * pitch,
      to: 210 * pitch,
      dur: 0.07,
      gain: 0.45,
      pan: left ? -0.2 : 0.2,
    });
    s.burst({
      at,
      dur: 0.05,
      color: 'pink',
      type: 'lowpass',
      freq: 1400,
      q: 3,
      env: [
        [0, 0],
        [0.003, 1],
        [0.05, 0, 'exp'],
      ],
      gain: 0.6,
      pan: left ? -0.2 : 0.2,
    });
  }
  return s.done();
};

export default gorilla;
