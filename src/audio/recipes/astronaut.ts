import { Synth, type Point } from '../synth';
import type { Recipe } from '../types';

const SQUARE = [1, 0, 0.33, 0, 0.2] as const;
const TONES = [1047, 1319, 784, 1568, 1175, 1760, 988];

const blip = (dur: number): Point[] => [
  [0, 0],
  [0.004, 1],
  [dur - 0.015, 0.85],
  [dur, 0, 'exp'],
];

const astronaut: Recipe = (voice) => {
  const s = new Synth(voice, 1.53);
  const pitch = s.vary(0.03);
  const speaker = s.filter('lowpass', 3600, 0.7, { dest: s.master });
  const radio = s.filter('highpass', 350, 0.7, { dest: speaker });
  s.burst({
    dur: 0.18,
    color: 'white',
    freq: 1800,
    q: 0.6,
    env: [
      [0, 0],
      [0.01, 1],
      [0.12, 0.6],
      [0.18, 0, 'exp'],
    ],
    gain: 0.12,
    dest: radio,
  });
  const crackle = Array.from({ length: 10 }, () => s.range(0, 0.17));
  s.clicks({
    times: crackle,
    freq: crackle.map(() => s.range(1500, 3500)),
    gain: crackle.map(() => s.range(0.1, 0.25)),
    q: 2,
    dur: 0.004,
    dest: radio,
  });
  s.note({ at: 0.2, dur: 0.16, freq: 2525, env: blip(0.16), gain: 0.14, dest: radio });
  const start = Math.floor(s.random() * TONES.length);
  for (let i = 0; i < 6; i++) {
    const freq = TONES[(start + i * 3) % TONES.length] * pitch;
    const dur = i === 5 ? 0.12 : 0.07;
    s.note({
      at: 0.45 + i * 0.1 + s.jitter(0.008),
      dur,
      freq,
      wave: SQUARE,
      env: blip(dur),
      gain: 0.17,
      dest: radio,
    });
  }
  s.note({ at: 1.15, dur: 0.16, freq: 2475, env: blip(0.16), gain: 0.14, dest: radio });
  return s.done();
};

export default astronaut;
