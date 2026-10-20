import { Synth, scaleContour } from '../synth';
import type { Recipe } from '../types';

const intestines: Recipe = (voice) => {
  const s = new Synth(voice, 0.98);
  const pitch = s.vary(0.05);
  const dur = 1.15;
  s.squelch({ freq: 450 * pitch, dur: 0.12, gain: 0.45 });
  s.spring({
    at: 0.03,
    dur,
    freq: scaleContour(
      [
        [0, 160],
        [0.2, 260],
        [0.45, 200],
        [0.7, 300],
        [0.95, 230],
        [dur, 280],
      ],
      pitch,
    ),
    wave: [1, 0.35, 0.1],
    depth: 300,
    settle: 0.25,
    rate: [
      [0, 13],
      [dur, 8],
    ],
    env: [
      [0, 0],
      [0.01, 1],
      [0.6, 0.7],
      [dur, 0, 'exp'],
    ],
    gain: 0.45,
  });
  [0.45, 0.95].forEach((at, index) => {
    s.squelch({ at, freq: (520 + index * 80) * pitch, dur: 0.1, gain: 0.25 });
  });
  return s.done();
};

export default intestines;
