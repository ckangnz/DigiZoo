import { Synth } from '../synth';
import type { Recipe } from '../types';

const whale: Recipe = (voice) => {
  const s = new Synth(voice, 1.2);
  const pitch = s.vary(0.05);
  const sea = s.bus(s.master, s.reverb({ seconds: 0.75, wet: 0.35, bright: 0.3 }));
  s.vocal({
    dur: 0.8,
    pitch: [
      [0, 170],
      [0.4, 260],
      [0.8, 210],
    ],
    transpose: pitch,
    vowel: [
      [0, 'u'],
      [0.4, 'o'],
      [0.8, 'u'],
    ],
    shift: 0.9,
    wave: 'pulse',
    breath: 0.05,
    tone: 2000,
    vibrato: { rate: 3.5, depth: 25, delay: 0.2 },
    env: [
      [0, 0],
      [0.25, 0.9],
      [0.55, 1],
      [0.8, 0, 'exp'],
    ],
    gain: 0.45,
    dest: sea,
  });
  s.vocal({
    at: 0.72,
    dur: 0.62,
    pitch: [
      [0, 300],
      [0.3, 480],
      [0.62, 380],
    ],
    transpose: pitch,
    vowel: [
      [0, 'o'],
      [0.3, 'u'],
      [0.62, 'u'],
    ],
    shift: 0.9,
    wave: 'pulse',
    breath: 0.05,
    tone: 2000,
    vibrato: { rate: 3.5, depth: 25, delay: 0.15 },
    env: [
      [0, 0],
      [0.2, 0.9],
      [0.4, 1],
      [0.62, 0, 'exp'],
    ],
    gain: 0.4,
    dest: sea,
  });
  return s.done();
};

export default whale;
