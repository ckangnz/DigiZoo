import { Synth } from '../synth';
import type { Recipe } from '../types';

const eagle: Recipe = (voice) => {
  const s = new Synth(voice, 0.509).stereo();
  const pitch = s.vary(0.04);
  const sky = s.bus(s.master, s.reverb({ seconds: 0.5, wet: 0.22, bright: 0.4 }));
  const beak = s.filter('highpass', 900, 0.7, { dest: sky });
  s.vocal({
    dur: 0.16,
    pitch: [
      [0, 1500],
      [0.04, 1850],
      [0.16, 1600],
    ],
    transpose: pitch,
    vowel: [
      [0, 'i'],
      [0.16, 'e'],
    ],
    shift: 1.25,
    breath: 0.35,
    growl: { rate: 70, depth: 0.35, fry: 50 },
    drive: 1.5,
    env: [
      [0, 0],
      [0.015, 1],
      [0.1, 0.7],
      [0.16, 0, 'exp'],
    ],
    tone: 4500,
    gain: 0.35,
    dest: beak,
  });
  const dur = 0.95;
  s.vocal({
    at: 0.24,
    dur,
    pitch: [
      [0, 1550],
      [0.07, 1950],
      [0.3, 1850],
      [0.7, 1400],
      [dur, 1050],
    ],
    transpose: pitch,
    vowel: [
      [0, 'i'],
      [0.2, 'e'],
      [0.6, 'a'],
      [dur, 'a'],
    ],
    shift: 1.25,
    breath: 0.4,
    growl: { rate: 75, depth: 0.4, fry: 60 },
    drive: 1.8,
    jitter: 20,
    env: [
      [0, 0],
      [0.04, 1],
      [0.45, 0.85],
      [0.8, 0.55],
      [dur, 0, 'exp'],
    ],
    tone: [
      [0, 4800],
      [dur, 3200],
    ],
    gain: 0.5,
    dest: beak,
  });
  return s.done();
};

export default eagle;
