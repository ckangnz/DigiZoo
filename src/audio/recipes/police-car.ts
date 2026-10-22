import { Synth, scaleContour, type Point } from '../synth';
import type { Recipe } from '../types';

const WAIL: readonly Point[] = [
  [0, 600],
  [0.42, 1120],
  [0.85, 640],
  [1.27, 1120],
  [1.7, 680],
];

const policeCar: Recipe = (voice) => {
  const s = new Synth(voice, 0.648).stereo();
  const pitch = s.vary(0.02);
  const dur = 1.7;
  const street = s.bus(s.master, s.reverb({ seconds: 0.35, wet: 0.18, bright: 0.4 }));
  const env: Point[] = [
    [0, 0],
    [0.12, 1],
    [dur - 0.3, 0.9],
    [dur, 0, 'exp'],
  ];
  s.note({
    dur,
    freq: scaleContour(WAIL, pitch),
    wave: [1, 0.3, 0.12, 0.05],
    env,
    vibrato: { rate: 6, depth: 8 },
    lowpass: 2600,
    gain: 0.3,
    dest: street,
  });
  s.note({
    dur,
    freq: scaleContour(WAIL, pitch * 0.5),
    wave: 'triangle',
    env,
    gain: 0.1,
    dest: street,
  });
  return s.done();
};

export default policeCar;
