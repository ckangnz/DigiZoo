import { Synth } from '../synth';
import type { Recipe } from '../types';

const tapir: Recipe = (voice) => {
  const s = new Synth(voice, 1.16);
  const pitch = s.vary(0.05);
  const dur = 0.55;
  s.note({
    dur,
    freq: [
      [0, 1700 * pitch],
      [0.12, 2350 * pitch],
      [0.4, 2250 * pitch],
      [dur, 1800 * pitch],
    ],
    wave: [1, 0.2, 0.06],
    vibrato: { rate: 8, depth: 50, delay: 0.1 },
    env: [
      [0, 0],
      [0.05, 1],
      [0.4, 0.8],
      [dur, 0, 'exp'],
    ],
    gain: 0.18,
  });
  s.burst({
    dur,
    color: 'white',
    freq: 2200 * pitch,
    q: 3,
    env: [
      [0, 0],
      [0.05, 1],
      [dur, 0, 'exp'],
    ],
    gain: 0.05,
  });
  const snortAt = dur + 0.15;
  const flutter = s.tremolo({ rate: 24, depth: 0.6, at: snortAt, dur: 0.24 });
  s.burst({
    at: snortAt,
    dur: 0.22,
    color: 'pink',
    type: 'lowpass',
    freq: [
      [0, 1800],
      [0.22, 600],
    ],
    q: 2,
    env: [
      [0, 0],
      [0.012, 1],
      [0.08, 0.6],
      [0.22, 0, 'exp'],
    ],
    gain: 0.9,
    dest: flutter,
  });
  return s.done();
};

export default tapir;
