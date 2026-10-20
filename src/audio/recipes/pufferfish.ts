import { Synth } from '../synth';
import type { Recipe } from '../types';

const pufferfish: Recipe = (voice) => {
  const s = new Synth(voice, 1.22);
  const pitch = s.vary(0.05);
  const puff = 0.5;
  s.note({
    dur: puff,
    freq: [
      [0, 140 * pitch],
      [puff, 560 * pitch],
    ],
    wave: [1, 0.35, 0.12],
    vibrato: { rate: 9, depth: 40 },
    env: [
      [0, 0],
      [0.06, 0.5],
      [puff - 0.03, 1],
      [puff, 0, 'exp'],
    ],
    lowpass: 2400,
    gain: 0.32,
  });
  s.burst({
    dur: puff,
    color: 'pink',
    freq: [
      [0, 400],
      [puff, 1600],
    ],
    q: 1.2,
    env: [
      [0, 0],
      [0.1, 0.5],
      [puff - 0.03, 1],
      [puff, 0, 'exp'],
    ],
    gain: 0.18,
  });
  s.spring({
    at: puff + 0.02,
    dur: 0.42,
    freq: [
      [0, 300 * pitch],
      [0.05, 420 * pitch],
      [0.42, 440 * pitch],
    ],
    wave: 'sine',
    depth: 360,
    gain: 0.36,
  });
  for (let i = 0; i < 4; i++) {
    s.bubble({
      at: puff + 0.12 + i * 0.07 + s.range(0, 0.03),
      freq: s.range(600, 1300),
      rise: 1.7,
      dur: 0.05,
      gain: s.range(0.1, 0.16),
    });
  }
  return s.done();
};

export default pufferfish;
