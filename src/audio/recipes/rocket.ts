import { Synth } from '../synth';
import type { Recipe } from '../types';

const BEEP = [1, 0, 0.2] as const;

const rocket: Recipe = (voice) => {
  const s = new Synth(voice, 1.07).stereo();
  const pitch = s.vary(0.02);
  [0, 0.24, 0.48].forEach((at) => {
    s.note({
      at,
      dur: 0.09,
      freq: 880 * pitch,
      wave: BEEP,
      env: [
        [0, 0],
        [0.005, 1],
        [0.07, 0.8],
        [0.09, 0, 'exp'],
      ],
      gain: 0.22,
    });
  });
  s.note({
    at: 0.72,
    dur: 0.16,
    freq: 1760 * pitch,
    wave: BEEP,
    env: [
      [0, 0],
      [0.005, 1],
      [0.12, 0.8],
      [0.16, 0, 'exp'],
    ],
    gain: 0.2,
  });
  const lift = 0.8;
  s.burst({
    at: lift,
    dur: 1.05,
    color: 'brown',
    type: 'lowpass',
    freq: [
      [0, 200],
      [0.5, 600],
      [1.05, 300],
    ],
    q: 1,
    env: [
      [0, 0],
      [0.15, 1],
      [0.6, 0.8],
      [1.05, 0, 'exp'],
    ],
    gain: 0.8,
  });
  s.burst({
    at: lift + 0.1,
    dur: 0.95,
    color: 'pink',
    freq: [
      [0, 400],
      [0.7, 3000],
      [0.95, 2000],
    ],
    q: 1.2,
    swell: 0.55,
    gain: 0.5,
    pan: [
      [0, 0],
      [0.95, 0.4],
    ],
  });
  s.note({
    at: lift + 0.15,
    dur: 0.85,
    freq: [
      [0, 180 * pitch],
      [0.85, 900 * pitch],
    ],
    wave: 'triangle',
    env: [
      [0, 0],
      [0.2, 1],
      [0.6, 0.7],
      [0.85, 0, 'exp'],
    ],
    gain: 0.15,
  });
  return s.done();
};

export default rocket;
