import { Synth, pluck } from '../synth';
import type { Recipe } from '../types';

const LOW = 82.41;
const HIGH = 92.5;

const shark: Recipe = (voice) => {
  const s = new Synth(voice, 0.97);
  const pitch = s.vary(0.03);
  const pace = s.vary(0.04);
  const notes: readonly (readonly [number, number, number, number])[] = [
    [0, LOW, 0.17, 0.75],
    [0.2, HIGH, 0.3, 1],
    [0.72, LOW, 0.17, 0.8],
    [0.92, HIGH, 0.36, 1],
  ];
  notes.forEach(([at, freq, dur, level]) => {
    const start = at * pace;
    s.note({
      at: start,
      dur,
      freq: freq * pitch,
      wave: 'sawtooth',
      env: pluck(dur, 1, 0.008),
      lowpass: [
        [0, 2000],
        [0.15, 650],
      ],
      gain: 0.5 * level,
    });
    s.note({ at: start, dur, freq: freq * pitch, env: pluck(dur, 1, 0.008), gain: 0.3 * level });
  });
  s.burst({
    at: 1.28 * pace,
    dur: 0.6,
    color: 'pink',
    freq: [
      [0, 300],
      [0.3, 1200],
      [0.6, 500],
    ],
    q: 0.8,
    swell: 0.4,
    gain: 1.3,
    pan: [
      [0, -0.5],
      [0.6, 0.5],
    ],
  });
  return s.done();
};

export default shark;
