import { Synth, type Point } from '../synth';
import type { Recipe } from '../types';

const airplane: Recipe = (voice) => {
  const s = new Synth(voice, 2.09).stereo();
  const pitch = s.vary(0.04);
  const dur = 1.8;
  const pass: Point[] = [
    [0, -0.8],
    [dur, 0.8],
  ];
  s.burst({
    dur,
    color: 'pink',
    freq: [
      [0, 700 * pitch],
      [0.9, 1800 * pitch],
      [dur, 600 * pitch],
    ],
    q: 0.8,
    swell: 0.5,
    gain: 0.45,
    pan: pass,
  });
  s.burst({
    dur,
    color: 'brown',
    type: 'lowpass',
    freq: 320,
    q: 0.8,
    swell: 0.55,
    gain: 0.4,
    pan: pass,
  });
  s.note({
    dur,
    freq: [
      [0, 2300 * pitch],
      [0.9, 2150 * pitch],
      [dur, 1750 * pitch],
    ],
    wave: 'sine',
    env: [
      [0, 0],
      [0.85, 1],
      [dur, 0, 'exp'],
    ],
    gain: 0.035,
    pan: pass,
  });
  return s.done();
};

export default airplane;
