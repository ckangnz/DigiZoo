import { Synth } from '../synth';
import type { Recipe } from '../types';

const jonah: Recipe = (voice) => {
  const s = new Synth(voice, 2.35).stereo();
  const pitch = s.vary(0.04);
  const sea = s.bus(s.master, s.reverb({ seconds: 0.45, wet: 0.35, bright: 0.3 }));
  for (let i = 0; i < 6; i++) {
    s.bubble({
      at: i * 0.06 + s.range(0, 0.03),
      freq: s.range(300, 700),
      rise: s.range(1.6, 2.2),
      dur: s.range(0.05, 0.09),
      gain: s.range(0.15, 0.25),
      pan: s.range(-0.5, 0.5),
      dest: sea,
    });
  }
  const dur = 0.8;
  s.vocal({
    at: 0.4,
    dur,
    pitch: [
      [0, 150],
      [0.35, 230],
      [dur, 175],
    ],
    transpose: pitch,
    vowel: [
      [0, 'u'],
      [0.35, 'o'],
      [dur, 'u'],
    ],
    wave: 'pulse',
    shift: 0.9,
    breath: 0.05,
    tone: 2000,
    vibrato: { rate: 3.5, depth: 25, delay: 0.2 },
    env: [
      [0, 0],
      [0.25, 0.9],
      [0.5, 1],
      [dur, 0, 'exp'],
    ],
    gain: 0.2,
    dest: sea,
  });
  for (let i = 0; i < 3; i++) {
    s.bubble({
      at: 1.12 + i * 0.07,
      freq: s.range(500, 900),
      rise: 1.7,
      dur: 0.05,
      gain: 0.12,
      pan: s.range(-0.4, 0.4),
      dest: sea,
    });
  }
  return s.done();
};

export default jonah;
