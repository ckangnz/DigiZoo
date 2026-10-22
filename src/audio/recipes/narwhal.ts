import { Synth } from '../synth';
import type { Recipe } from '../types';

const narwhal: Recipe = (voice) => {
  const s = new Synth(voice, 0.415).stereo();
  const pitch = s.vary(0.05);
  const sea = s.bus(s.master, s.reverb({ seconds: 0.5, wet: 0.35, bright: 0.3 }));
  const times: number[] = [];
  let at = 0;
  for (let i = 0; i < 16; i++) {
    times.push(at);
    at += Math.max(0.012, 0.06 - i * 0.0035);
  }
  s.clicks({
    times,
    freq: 2800,
    q: 1.5,
    dur: 0.003,
    gain: times.map((_, i) => 0.6 + i * 0.025),
    dest: sea,
  });
  const dur = 0.6;
  s.vocal({
    at: 0.62,
    dur,
    pitch: [
      [0, 55],
      [0.3, 115],
      [dur, 80],
    ],
    transpose: pitch,
    vowel: [
      [0, 'e'],
      [0.3, 'i'],
      [dur, 'e'],
    ],
    wave: 'buzz',
    shift: 1.6,
    breath: 0.1,
    jitter: 30,
    env: [
      [0, 0],
      [0.08, 1],
      [0.45, 0.8],
      [dur, 0, 'exp'],
    ],
    tone: 5000,
    gain: 0.5,
    dest: sea,
  });
  s.note({
    at: 1.24,
    dur: 0.34,
    freq: [
      [0, 1150 * pitch],
      [0.22, 1750 * pitch],
      [0.34, 1600 * pitch],
    ],
    wave: [1, 0.15],
    vibrato: { rate: 7, depth: 25 },
    env: [
      [0, 0],
      [0.04, 1],
      [0.24, 0.8],
      [0.34, 0, 'exp'],
    ],
    gain: 0.16,
    dest: sea,
  });
  for (let i = 0; i < 3; i++) {
    s.bubble({
      at: 1.05 + i * 0.07 + s.range(0, 0.03),
      freq: s.range(500, 1000),
      rise: 1.7,
      dur: 0.05,
      gain: s.range(0.08, 0.14),
      pan: s.range(-0.4, 0.4),
      dest: sea,
    });
  }
  return s.done();
};

export default narwhal;
