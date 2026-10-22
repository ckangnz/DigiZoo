import { Synth, type Point } from '../synth';
import type { Recipe } from '../types';

const dragonfly: Recipe = (voice) => {
  const s = new Synth(voice, 3.96).stereo();
  const pitch = s.vary(0.05);
  const dur = 1.35;
  const env: Point[] = [
    [0, 0],
    [0.08, 1],
    [0.45, 0.9],
    [0.55, 0.5],
    [0.7, 0.5],
    [0.8, 1],
    [1.2, 0.8],
    [dur, 0, 'exp'],
  ];
  const flight = s.panner([
    [0, -0.7],
    [0.45, 0.4],
    [0.7, 0.3],
    [dur, -0.5],
  ]);
  const wings = s.tremolo({ rate: 30, depth: 0.85, dur: dur + 0.02, dest: flight });
  s.burst({
    dur,
    color: 'pink',
    freq: [
      [0, 1300 * pitch],
      [0.45, 1700 * pitch],
      [0.7, 1200 * pitch],
      [dur, 1600 * pitch],
    ],
    q: 0.7,
    env,
    gain: 0.45,
    dest: wings,
  });
  s.note({
    dur,
    freq: [
      [0, 115 * pitch],
      [0.45, 128 * pitch],
      [0.7, 110 * pitch],
      [dur, 125 * pitch],
    ],
    wave: 'buzz',
    env,
    lowpass: 1500,
    gain: 0.08,
    dest: wings,
  });
  return s.done();
};

export default dragonfly;
