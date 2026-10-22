import { Synth } from '../synth';
import type { Recipe } from '../types';

const echidna: Recipe = (voice) => {
  const s = new Synth(voice, 2.4).stereo();
  const pitch = s.vary(0.05);
  const pace = s.vary(0.05);
  [0, 0.11, 0.22, 0.46, 0.57].forEach((offset, index) => {
    s.burst({
      at: offset * pace,
      dur: 0.06,
      color: 'pink',
      freq: 2600 * pitch,
      q: 1.4,
      env: [
        [0, 0],
        [0.012, 1],
        [0.06, 0, 'exp'],
      ],
      gain: index % 3 === 2 ? 1.5 : 1.2,
      pan: -0.2,
    });
  });
  [0.82, 0.96].forEach((offset, index) => {
    s.vocal({
      at: offset * pace,
      dur: 0.08,
      pitch: [
        [0, 190],
        [0.08, 170],
      ],
      transpose: pitch * (index === 0 ? 1 : 0.95),
      vowel: 'n',
      wave: 'glottal',
      breath: 0.4,
      env: [
        [0, 0],
        [0.012, 1],
        [0.08, 0, 'exp'],
      ],
      tone: 2500,
      gain: 0.05,
    });
  });
  const slurp = 1.16 * pace;
  s.squelch({ at: slurp, freq: 800 * pitch, dur: 0.2, gain: 0.6, pan: 0.2 });
  s.note({
    at: slurp + 0.02,
    dur: 0.15,
    freq: [
      [0, 400 * pitch],
      [0.15, 900 * pitch],
    ],
    wave: 'soft',
    env: [
      [0, 0],
      [0.02, 1],
      [0.15, 0, 'exp'],
    ],
    gain: 0.25,
    pan: 0.2,
  });
  return s.done();
};

export default echidna;
