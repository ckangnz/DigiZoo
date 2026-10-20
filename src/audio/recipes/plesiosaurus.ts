import { Synth } from '../synth';
import type { Recipe } from '../types';

const plesiosaurus: Recipe = (voice) => {
  const s = new Synth(voice, 1.8).stereo();
  const pitch = s.vary(0.05);
  const pace = s.vary(0.04);
  const sea = s.bus(s.master, s.reverb({ seconds: 0.45, wet: 0.35, bright: 0.3 }));
  [0, 0.4].forEach((offset, index) => {
    const at = offset * pace;
    s.burst({
      at,
      dur: 0.35,
      color: 'pink',
      type: 'lowpass',
      freq: [
        [0, 300],
        [0.15, 1100],
        [0.35, 350],
      ],
      q: 2.5,
      swell: 0.35,
      gain: 0.45,
      pan: index === 0 ? -0.4 : 0.4,
      dest: sea,
    });
    s.bubble({ at: at + 0.12, freq: s.range(500, 800), rise: 1.8, dur: 0.05, gain: 0.12 });
  });
  const dur = 0.9;
  s.vocal({
    at: 0.62 * pace,
    dur,
    pitch: [
      [0, 180],
      [0.3, 260],
      [0.6, 245],
      [dur, 205],
    ],
    transpose: pitch,
    vowel: [
      [0, 'u'],
      [0.3, 'o'],
      [0.65, 'o'],
      [dur, 'u'],
    ],
    wave: 'pulse',
    shift: 0.85,
    breath: 0.08,
    vibrato: { rate: 4, depth: 30, delay: 0.25 },
    env: [
      [0, 0],
      [0.2, 0.9],
      [0.45, 1],
      [0.7, 0.7],
      [dur, 0, 'exp'],
    ],
    tone: 2200,
    gain: 0.26,
    dest: sea,
  });
  return s.done();
};

export default plesiosaurus;
