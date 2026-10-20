import { Synth } from '../synth';
import type { Recipe } from '../types';

const hummingbird: Recipe = (voice) => {
  const s = new Synth(voice, 1.62).stereo();
  const pitch = s.vary(0.05);
  const dur = 1.25;
  const dart: [number, number][] = [
    [0, -0.6],
    [0.45, 0.5],
    [0.8, -0.2],
    [dur, 0.6],
  ];
  const wings = s.tremolo({ rate: 46, depth: 0.85, dur: dur + 0.02, dest: s.panner(dart) });
  const env: [number, number][] = [
    [0, 0],
    [0.15, 1],
    [1.0, 0.85],
    [dur, 0],
  ];
  s.note({
    dur,
    freq: [
      [0, 175 * pitch],
      [0.45, 205 * pitch],
      [0.8, 185 * pitch],
      [dur, 200 * pitch],
    ],
    wave: [1, 0.6, 0.4, 0.28, 0.18, 0.1],
    env,
    lowpass: 2200,
    gain: 0.3,
    dest: wings,
  });
  s.burst({
    dur,
    color: 'pink',
    freq: 800 * pitch,
    q: 1.0,
    env,
    gain: 0.4,
    dest: wings,
  });
  [0.3, 0.42, 0.85].forEach((at, index) => {
    const lift = pitch * [1, 1.08, 0.96][index];
    s.chirp({
      at,
      dur: 0.05,
      freq: [
        [0, 5200 * lift],
        [0.02, 6000 * lift],
        [0.05, 4800 * lift],
      ],
      gain: 0.12,
      pan: [0.3, 0.4, -0.2][index],
    });
  });
  return s.done();
};

export default hummingbird;
